const axios = require('axios');
const http = require('http');
const https = require('https');

// Keep-alive agents to eliminate TCP/TLS connection handshake latency on repeated calls
const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 50 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 50 });
const axiosClient = axios.create({
  httpAgent,
  httpsAgent
});

// Fast in-memory caches to deliver 0ms instant playback for repeated phrases
const translationCache = new Map();
const synthesisCache = new Map();
const MAX_CACHE_SIZE = 500;

function setCache(cacheMap, key, value) {
  if (cacheMap.size >= MAX_CACHE_SIZE) {
    const firstKey = cacheMap.keys().next().value;
    cacheMap.delete(firstKey);
  }
  cacheMap.set(key, value);
}

const getBaseUrl = () => process.env.ML_SERVICE_URL || 'https://dementia-ai-engine.onrender.com';
const getTimeout = () => parseInt(process.env.TRANSLATION_TIMEOUT_MS, 10) || 3500;

// North-Eastern & Indic regional language codes that route to regional translation
const REGIONAL_LANGUAGES = [
  'as', 'as-in', 'as_in',
  'hi', 'hi-in', 'hi_in',
  'bn', 'bn-in',
  'bho', 'mni', 'or', 'nag', 'kok',
  'gu', 'ta', 'te', 'kn', 'ml', 'mr'
];

/**
 * Normalizes language code string (e.g. 'as-IN' -> 'as', 'Assamese' -> 'as')
 */
function normalizeLanguageCode(lang) {
  if (!lang || typeof lang !== 'string') return 'en';
  const clean = lang.trim().toLowerCase();
  if (clean.includes('assam') || clean === 'as' || clean.startsWith('as-') || clean.startsWith('as_')) {
    return 'as';
  }
  if (clean.includes('hindi') || clean === 'hi' || clean.startsWith('hi-') || clean.startsWith('hi_')) {
    return 'hi';
  }
  if (clean.includes('bengali') || clean === 'bn' || clean.startsWith('bn-')) {
    return 'bn';
  }
  return clean.split('-')[0].split('_')[0] || 'en';
}

/**
 * Translates and prepares spoken speech reminders via Teammate's live AI engine on Render.
 * 
 * @param {Object} params
 * @param {string} params.textToSpeak - Raw text or prompt to translate/speak
 * @param {string} [params.targetLanguage='en'] - Target language ('as', 'hi', 'en', etc.)
 * @returns {Promise<{ translated_text: string, original_text: string, target_language: string, source: string, engine?: string }>}
 */
async function getTranslatedSpeech({ textToSpeak, targetLanguage = 'en' }) {
  if (!textToSpeak || typeof textToSpeak !== 'string') {
    return {
      translated_text: textToSpeak || '',
      original_text: textToSpeak || '',
      target_language: targetLanguage || 'en',
      source: 'fallback_empty'
    };
  }

  const rawText = textToSpeak.trim();
  const normalizedLang = normalizeLanguageCode(targetLanguage);
  const baseUrl = getBaseUrl();
  const timeoutMs = getTimeout();

  // If already English, no need for translation unless requested
  if (normalizedLang === 'en') {
    return {
      translated_text: rawText,
      original_text: rawText,
      target_language: 'en',
      source: 'passthrough_english'
    };
  }

  // Check in-memory translation cache (0ms instant response)
  const cacheKey = `${normalizedLang}:${rawText}`;
  if (translationCache.has(cacheKey)) {
    console.log(`⚡ [Translation Service] Cache hit for [${normalizedLang}]: "${rawText.slice(0, 30)}..."`);
    return {
      ...translationCache.get(cacheKey),
      source: 'memory_cache'
    };
  }

  const isRegional = REGIONAL_LANGUAGES.includes(normalizedLang) || normalizedLang === 'as';

  try {
    const startTime = Date.now();
    let response;

    if (isRegional) {
      // 1. Regional Reminder Endpoint (POST /speak_regional_reminder)
      const payload = {
        text_to_speak: rawText,
        target_language: normalizedLang
      };
      
      console.log(`🌐 [Translation Service] POST /speak_regional_reminder (lang="${normalizedLang}", timeout=${timeoutMs}ms)...`);
      response = await axiosClient.post(`${baseUrl}/speak_regional_reminder`, payload, {
        timeout: timeoutMs,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // 2. General Reminder Endpoint (POST /speak_reminder)
      const payload = {
        text_to_speak: rawText,
        target_language: normalizedLang
      };

      console.log(`🌐 [Translation Service] POST /speak_reminder (lang="${normalizedLang}", timeout=${timeoutMs}ms)...`);
      response = await axiosClient.post(`${baseUrl}/speak_reminder`, payload, {
        timeout: timeoutMs,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (response && response.data) {
      // Teammate's API returns { spoken_text, target_language, translation_engine } or { translated_text }
      const translatedText = 
        response.data.translated_text ||
        response.data.spoken_text ||
        response.data.text ||
        rawText;

      const engine = response.data.translation_engine || 'teammate_ai_engine';
      const elapsed = Date.now() - startTime;
      console.log(`✅ [Translation Service] Response received in ${elapsed}ms [${normalizedLang}]: "${translatedText.slice(0, 80)}..." (engine: ${engine})`);

      const result = {
        translated_text: translatedText,
        original_text: rawText,
        target_language: normalizedLang,
        source: 'live_api',
        engine: engine
      };
      setCache(translationCache, cacheKey, result);
      return result;
    }

    console.warn('⚠️ [Translation Service] Received empty data from translation API, returning original text.');
    return {
      translated_text: rawText,
      original_text: rawText,
      target_language: normalizedLang,
      source: 'fallback_original'
    };
  } catch (err) {
    console.warn(`⚠️ [Translation Service] Live translation API error (${err.message}). Gracefully falling back to original untranslated text.`);
    return {
      translated_text: rawText,
      original_text: rawText,
      target_language: normalizedLang,
      source: 'fallback_original',
      error: err.message
    };
  }
}

/**
 * Synthesizes text into base64 audio via Bhashini / ML TTS microservice on Render.
 * Calls POST /synthesize_speech with 3.5-second timeout and robust fallbacks.
 * 
 * @param {Object} params
 * @param {string} params.textToSpeak - Raw text to synthesize and translate
 * @param {string} [params.targetLanguage='en'] - Target language ('as', 'hi', 'en', 'brx', 'mni', etc.)
 * @returns {Promise<{ audio_base64: string|null, spoken_text: string, translated_text: string, original_text: string, target_language: string, engine?: string, source: string, error?: string }>}
 */
async function getSynthesizedSpeech({ textToSpeak, targetLanguage = 'en' }) {
  if (!textToSpeak || typeof textToSpeak !== 'string') {
    return {
      audio_base64: null,
      spoken_text: textToSpeak || '',
      translated_text: textToSpeak || '',
      original_text: textToSpeak || '',
      target_language: targetLanguage || 'en',
      source: 'fallback_empty'
    };
  }

  const rawText = textToSpeak.trim();
  const normalizedLang = normalizeLanguageCode(targetLanguage);
  const baseUrl = getBaseUrl();
  const timeoutMs = getTimeout();

  // Check in-memory synthesis cache (0ms instant playback)
  const synthCacheKey = `${normalizedLang}:${rawText}`;
  if (synthesisCache.has(synthCacheKey)) {
    console.log(`⚡ [Bhashini Synthesis] Cache hit for [${normalizedLang}]: "${rawText.slice(0, 30)}..."`);
    return {
      ...synthesisCache.get(synthCacheKey),
      source: 'memory_cache'
    };
  }

  try {
    const startTime = Date.now();
    const payload = {
      text_to_speak: rawText,
      target_language: normalizedLang
    };

    console.log(`🎙️ [Bhashini Synthesis Service] POST /synthesize_speech (lang="${normalizedLang}", timeout=${timeoutMs}ms)...`);
    const response = await axiosClient.post(`${baseUrl}/synthesize_speech`, payload, {
      timeout: timeoutMs,
      headers: { 'Content-Type': 'application/json' }
    });

    if (response && response.data && response.data.audio_base64) {
      const elapsed = Date.now() - startTime;
      const spokenText = response.data.spoken_text || response.data.translated_text || rawText;
      console.log(`✅ [Bhashini Synthesis Service] Audio generated in ${elapsed}ms [${normalizedLang}] (size: ${response.data.audio_base64.length} chars)`);

      const result = {
        audio_base64: response.data.audio_base64,
        spoken_text: spokenText,
        translated_text: spokenText,
        original_text: response.data.original_text || rawText,
        target_language: normalizedLang,
        engine: response.data.engine || 'bhashini_tts_engine',
        source: 'live_bhashini_api'
      };
      setCache(synthesisCache, synthCacheKey, result);
      return result;
    }

    console.warn('⚠️ [Bhashini Synthesis Service] No audio_base64 returned from microservice.');
    return {
      audio_base64: null,
      spoken_text: rawText,
      translated_text: rawText,
      original_text: rawText,
      target_language: normalizedLang,
      source: 'fallback_no_audio'
    };
  } catch (err) {
    console.warn(`⚠️ [Bhashini Synthesis Service] Error (${err.message}). Gracefully returning null audio for Web Speech fallback.`);
    return {
      audio_base64: null,
      spoken_text: rawText,
      translated_text: rawText,
      original_text: rawText,
      target_language: normalizedLang,
      source: 'fallback_error',
      error: err.message
    };
  }
}

module.exports = {
  getTranslatedSpeech,
  getSynthesizedSpeech,
  normalizeLanguageCode,
  REGIONAL_LANGUAGES,
  getBaseUrl
};
