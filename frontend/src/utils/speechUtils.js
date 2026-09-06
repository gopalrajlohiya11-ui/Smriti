/**
 * Centralized Web Speech API Utility for Smriti
 * Supports real English (en-IN/en-US) and Hindi (hi-IN) voice synthesis,
 * with graceful Voice Coming Soon notices for Assamese (as) and regional dialects.
 * 
 * Features asynchronous voice loading & retry to handle browsers where
 * speechSynthesis.getVoices() is empty on first call.
 */

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
 * Finds the best matching voice for a given language code.
 * 
 * @param {string} langCode - e.g. 'hi', 'hi-IN', 'en', 'en-IN'
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

  if (code.startsWith('hi')) {
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

export const stopSpeech = () => {
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
 * Main speech synthesis trigger with async voice loading, retry, and detailed diagnostic logs.
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

  // Assamese voice is not reliably supported in browser Web Speech API
  if (code === 'as' || code.startsWith('as-')) {
    stopSpeech();
    if (onNotice) {
      onNotice(ASSAMESE_VOICE_NOTICE);
    }
    if (onStart) onStart();
    setTimeout(() => {
      if (onEnd) onEnd();
    }, 2500);
    return;
  }

  if (!('speechSynthesis' in window)) {
    if (onError) onError(new Error('Web Speech API not supported in this browser.'));
    return;
  }

  stopSpeech();

  const clean = getCleanSpeechText(text);
  if (!clean) {
    if (onEnd) onEnd();
    return;
  }

  // Ensure voices are loaded asynchronously before voice selection
  const loadedVoices = await ensureVoicesLoaded();

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = rate;
  utterance.pitch = pitch;

  if (code.startsWith('hi')) {
    utterance.lang = 'hi-IN';
    const hiVoice = getAvailableVoice('hi', loadedVoices);
    
    // Detailed diagnostic logging as requested
    const allVoices = (window.speechSynthesis.getVoices() || loadedVoices || []);
    console.log('🎤 [SpeechSynthesis] ALL available voice langs:', allVoices.map(v => `${v.name} (${v.lang})`));
    console.log('🎤 [SpeechSynthesis] Hindi voice found:', !!hiVoice, hiVoice ? `${hiVoice.name} [${hiVoice.lang}]` : 'NONE (will use browser default synthesizer for hi-IN)');

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
    if (onStart) onStart();
  };

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (err) => {
    console.warn('SpeechSynthesis error event:', err);
    if (onError) onError(err);
    if (onEnd) onEnd();
  };

  try {
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('SpeechSynthesis speak failed:', e);
    if (onError) onError(e);
    if (onEnd) onEnd();
  }
};
