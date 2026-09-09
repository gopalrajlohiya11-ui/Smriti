/**
 * Centralized Web Speech API & Translation Utility for Smriti
 * Supports real English (en-IN/en-US), Hindi (hi-IN), and live translated regional speech (Assamese/NER dialects),
 * powered by Teammate's live AI engine on Render with graceful offline & client fallback.
 * 
 * Features:
 * 1. Live translation & regional phrasing via Teammate AI Engine (POST /speak_regional_reminder)
 * 2. Asynchronous browser voice loading & retry logic
 * 3. Graceful fallback notice for Assamese when local browser lacks an installed Assamese TTS voice pack
 */

import { translateSpeechApi } from '../services/api';

export const ASSAMESE_VOICE_NOTICE = "অসমীয়া কণ্ঠস্বৰ শীঘ্ৰেই উপলব্ধ হ'ব (Assamese voice coming soon)";

let cachedVoices = [];
let voicesLoadedPromise = null;

// Pre-populate voices and listen to browser voiceschanged event on app load
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  try {
    cachedVoices = window.speechSynthesis.getVoices() || [];

    const handleVoicesChanged = () => {
      cachedVoices = window.speechSynthesis.getVoices() || [];
      console.log('🎤 [SpeechSynthesis] voiceschanged event fired. Total voices available:', cachedVoices.length);
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    if ('onvoiceschanged' in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    }
  } catch (e) {
    console.warn('SpeechSynthesis initialization warning:', e);
  }
}

/**
 * Asynchronously guarantees that the browser's voice list is loaded.
 * If getVoices() is empty, waits for the 'voiceschanged' event or retries after a short delay.
 * 
 * @returns {Promise<SpeechSynthesisVoice[]>}
 */
export const ensureVoicesLoaded = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve([]);
  }

  const immediateVoices = window.speechSynthesis.getVoices() || [];
  if (immediateVoices.length > 0) {
    cachedVoices = immediateVoices;
    return Promise.resolve(immediateVoices);
  }

  if (cachedVoices.length > 0) {
    return Promise.resolve(cachedVoices);
  }

  if (voicesLoadedPromise) {
    return voicesLoadedPromise;
  }

  voicesLoadedPromise = new Promise((resolve) => {
    let settled = false;

    const onVoicesChanged = () => {
      if (!settled) {
        settled = true;
        cachedVoices = window.speechSynthesis.getVoices() || [];
        voicesLoadedPromise = null;
        resolve(cachedVoices);
      }
    };

    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged, { once: true });

    // Fallback: Retry after 150ms if voiceschanged event does not fire immediately
    setTimeout(() => {
      if (!settled) {
        settled = true;
        cachedVoices = window.speechSynthesis.getVoices() || [];
        voicesLoadedPromise = null;
        resolve(cachedVoices);
      }
    }, 150);
  });

  return voicesLoadedPromise;
};

export const getCleanSpeechText = (text) => {
  if (!text) return '';
  return text
    .replace(/[🌸❤️✅⏳💊🩺👦📅⚡🎉✨🔥🧠🍲🌙🍋🍵🥬🧺🦏🦅🦌🌿🎭🎨🌟🦚🏛️🛶🔔👁️]/gu, '')
    .replace(/₹/g, ' रुपये ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Translates reminder or speech text via Teammate AI Engine.
 * On failure or network timeout, gracefully returns original untranslated text.
 * 
 * @param {Object} params
 * @param {string} params.textToSpeak
 * @param {string} [params.targetLanguage='en']
 * @returns {Promise<{ translated_text: string, original_text: string, source: string }>}
 */
export const getTranslatedSpeech = async ({ textToSpeak, targetLanguage = 'en' }) => {
  if (!textToSpeak) {
    return { translated_text: '', original_text: '', source: 'empty' };
  }

  try {
    return await translateSpeechApi({ textToSpeak, targetLanguage });
  } catch (err) {
    console.warn('⚠️ [getTranslatedSpeech] Translation error, falling back to original:', err.message);
    return {
      translated_text: textToSpeak,
      original_text: textToSpeak,
      target_language: targetLanguage,
      source: 'fallback_original'
    };
  }
};

/**
 * Finds the best matching voice for a given language code.
 * 
 * @param {string} langCode - e.g. 'as', 'as-IN', 'hi', 'hi-IN', 'en', 'en-IN'
 * @param {SpeechSynthesisVoice[]} [customVoiceList] - Optional voice array
 * @returns {SpeechSynthesisVoice|null}
 */
export const getAvailableVoice = (langCode, customVoiceList = null) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  
  let voices = customVoiceList || window.speechSynthesis.getVoices() || [];
  if (!voices || voices.length === 0) {
    voices = cachedVoices;
  }

  const code = (langCode || 'en').toLowerCase();
  let selectedVoice = null;

  if (code === 'as' || code.startsWith('as')) {
    // 1. Exact or prefix match for Assamese
    selectedVoice = 
      voices.find(v => v.lang.toLowerCase() === 'as-in' || v.lang.toLowerCase() === 'as_in') ||
      voices.find(v => v.lang.toLowerCase().startsWith('as')) ||
      voices.find(v => v.name.toLowerCase().includes('assamese') || v.name.toLowerCase().includes('অসমীয়া')) ||
      null;
  } else if (code.startsWith('hi')) {
    // 1. Exact hi-IN match
    selectedVoice = voices.find(v => v.lang.toLowerCase() === 'hi-in' || v.lang.toLowerCase() === 'hi_in') ||
      // 2. Any hi- prefix
      voices.find(v => v.lang.toLowerCase().startsWith('hi')) ||
      // 3. Name contains Hindi / Devanagari identifiers
      voices.find(v => v.name.toLowerCase().includes('hindi') || v.name.includes('हिन्दी')) ||
      // 4. Microsoft / Google specific Indian voice personas
      voices.find(v => {
        const n = v.name.toLowerCase();
        return n.includes('kalpana') || n.includes('hemant') || n.includes('swara') || n.includes('madhur');
      }) ||
      null;
  } else if (code.startsWith('en')) {
    selectedVoice = 
      voices.find(v => v.lang.toLowerCase() === 'en-in' || v.lang.toLowerCase() === 'en_in') ||
      voices.find(v => v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('neerja') || v.name.toLowerCase().includes('prabhat')) ||
      voices.find(v => v.lang.toLowerCase() === 'en-gb') ||
      voices.find(v => v.lang.toLowerCase() === 'en-us') ||
      voices.find(v => v.lang.toLowerCase().startsWith('en')) ||
      null;
  } else {
    selectedVoice = voices.find(v => v.lang.toLowerCase().startsWith(code)) || null;
  }

  return selectedVoice;
};

let activeSpeechRequestId = 0;

export const stopSpeech = () => {
  activeSpeechRequestId++;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('Speech cancellation error:', e);
    }
  }
};

/**
 * Gets the persistent Voice Auto-Play setting for a patient (defaults to true).
 */
export const getVoiceAutoPlaySetting = (patientId = null) => {
  if (typeof window === 'undefined') return true;
  try {
    if (patientId) {
      const patVal = localStorage.getItem(`smriti_voice_autoplay_${patientId}`);
      if (patVal === 'false') return false;
      if (patVal === 'true') return true;
    }
    const globalVal = localStorage.getItem('smriti_voice_autoplay');
    if (globalVal === 'false') return false;
    return true; // default ON (enabled)
  } catch (e) {
    return true;
  }
};

/**
 * Sets the persistent Voice Auto-Play setting for a patient.
 */
export const setVoiceAutoPlaySetting = (enabled, patientId = null) => {
  if (typeof window === 'undefined') return;
  try {
    const val = enabled ? 'true' : 'false';
    localStorage.setItem('smriti_voice_autoplay', val);
    if (patientId) {
      localStorage.setItem(`smriti_voice_autoplay_${patientId}`, val);
    }
    window.dispatchEvent(new CustomEvent('smriti_autoplay_changed', { detail: { enabled, patientId } }));
  } catch (e) {
    console.warn('Failed to save voice autoplay setting:', e);
  }
};

/**
 * Main speech synthesis trigger with live translation integration, async voice loading,
 * request tracking, and zero overlap.
 */
export const speakLocalized = async ({
  text,
  langCode = 'en',
  rate = 0.88,
  pitch = 1.0,
  isAutoPlay = false,
  patientId = null,
  onStart,
  onEnd,
  onError,
  onNotice
}) => {
  if (typeof window === 'undefined') return;

  // Immediately cancel any previous speech
  stopSpeech();
  const thisRequestId = activeSpeechRequestId;

  // Suppress automatic speech if user disabled Voice Auto-Play
  if (isAutoPlay) {
    const isEnabled = getVoiceAutoPlaySetting(patientId);
    if (!isEnabled) {
      console.log('🔇 [SpeechSynthesis] Auto-play suppressed by user preference.');
      if (onEnd) onEnd();
      return;
    }
  }

  const code = (langCode || 'en').toLowerCase();
  let textToSynthesize = text;

  // 1. For Assamese / Regional languages: call Live Translation API first
  if (code === 'as' || code.startsWith('as-') || code.startsWith('as_')) {
    try {
      const transResult = await getTranslatedSpeech({ textToSpeak: text, targetLanguage: 'as' });
      if (transResult && transResult.translated_text) {
        textToSynthesize = transResult.translated_text;
      }
    } catch (transErr) {
      console.warn('Translation retrieval notice:', transErr.message);
    }

    // Check if another speech request was triggered while awaiting translation
    if (thisRequestId !== activeSpeechRequestId) return;

    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      if (onNotice) onNotice(ASSAMESE_VOICE_NOTICE);
      if (onError) onError(new Error('Web Speech API not supported in this browser.'));
      return;
    }

    // Ensure voices are loaded to check if this device has an Assamese voice installed
    const loadedVoices = await ensureVoicesLoaded();
    if (thisRequestId !== activeSpeechRequestId) return;

    const asVoice = getAvailableVoice('as', loadedVoices);

    // If device lacks an installed Assamese TTS voice pack, show fallback notice gracefully
    if (!asVoice) {
      console.info('ℹ️ [SpeechSynthesis] Translation ready, but no local Assamese voice pack is installed on this device. Displaying fallback notice.');
      if (onNotice) {
        onNotice(ASSAMESE_VOICE_NOTICE);
      }
      if (onStart) onStart();
      setTimeout(() => {
        if (thisRequestId === activeSpeechRequestId && onEnd) onEnd();
      }, 2500);
      return;
    }
  }

  if (!('speechSynthesis' in window)) {
    if (onError) onError(new Error('Web Speech API not supported in this browser.'));
    return;
  }

  const clean = getCleanSpeechText(textToSynthesize);
  if (!clean) {
    if (onEnd) onEnd();
    return;
  }

  // Ensure voices are loaded asynchronously before voice selection
  const loadedVoices = await ensureVoicesLoaded();

  // If a newer speech request started while voices were loading, abandon this one immediately!
  if (thisRequestId !== activeSpeechRequestId) {
    return;
  }

  // Final cancel right before queuing the new utterance
  try {
    window.speechSynthesis.cancel();
  } catch (e) {}

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = rate;
  utterance.pitch = pitch;

  if (code === 'as' || code.startsWith('as')) {
    utterance.lang = 'as-IN';
    const asVoice = getAvailableVoice('as', loadedVoices);
    if (asVoice) {
      utterance.voice = asVoice;
    }
  } else if (code.startsWith('hi')) {
    utterance.lang = 'hi-IN';
    const hiVoice = getAvailableVoice('hi', loadedVoices);
    if (hiVoice) {
      utterance.voice = hiVoice;
    }
  } else {
    utterance.lang = 'en-IN';
    const enVoice = getAvailableVoice('en', loadedVoices);
    if (enVoice) {
      utterance.voice = enVoice;
    }
  }

  utterance.onstart = () => {
    if (thisRequestId === activeSpeechRequestId && onStart) {
      onStart();
    }
  };

  utterance.onend = () => {
    if (thisRequestId === activeSpeechRequestId && onEnd) {
      onEnd();
    }
  };

  utterance.onerror = (err) => {
    if (thisRequestId === activeSpeechRequestId) {
      console.warn('SpeechSynthesis error event:', err);
      if (onError) onError(err);
      if (onEnd) onEnd();
    }
  };

  try {
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('SpeechSynthesis speak failed:', e);
    if (onError) onError(e);
    if (onEnd) onEnd();
  }
};
