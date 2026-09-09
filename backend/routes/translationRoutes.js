const express = require('express');
const router = express.Router();
const { getTranslatedSpeech, getSynthesizedSpeech } = require('../services/translationService');

/**
 * POST /api/translation/translate or POST /api/speech/translate
 * Translates reminder / speech text into regional languages (e.g. 'as')
 */
router.post('/translate', async (req, res) => {
  try {
    const textToSpeak = req.body.textToSpeak || req.body.text_to_speak || '';
    const targetLanguage = req.body.targetLanguage || req.body.target_language || 'en';

    const result = await getTranslatedSpeech({ textToSpeak, targetLanguage });
    res.json(result);
  } catch (err) {
    console.error('Translation route error:', err.message);
    const fallbackText = req.body.textToSpeak || req.body.text_to_speak || '';
    res.status(200).json({
      translated_text: fallbackText,
      original_text: fallbackText,
      target_language: req.body.targetLanguage || req.body.target_language || 'en',
      source: 'fallback_error',
      error: err.message
    });
  }
});

// Alias endpoint for /speak
router.post('/speak', async (req, res) => {
  const textToSpeak = req.body.textToSpeak || req.body.text_to_speak || '';
  const targetLanguage = req.body.targetLanguage || req.body.target_language || 'en';
  const result = await getTranslatedSpeech({ textToSpeak, targetLanguage });
  res.json(result);
});

/**
 * POST /api/speech/synthesize or POST /api/translation/synthesize
 * Synthesizes text into base64 audio via Bhashini / ML TTS microservice
 */
router.post('/synthesize', async (req, res) => {
  try {
    const textToSpeak = req.body.textToSpeak || req.body.text_to_speak || '';
    const targetLanguage = req.body.targetLanguage || req.body.target_language || 'en';

    const result = await getSynthesizedSpeech({ textToSpeak, targetLanguage });
    res.json(result);
  } catch (err) {
    console.error('Speech synthesis route error:', err.message);
    const fallbackText = req.body.textToSpeak || req.body.text_to_speak || '';
    res.status(200).json({
      audio_base64: null,
      spoken_text: fallbackText,
      translated_text: fallbackText,
      original_text: fallbackText,
      target_language: req.body.targetLanguage || req.body.target_language || 'en',
      source: 'fallback_error',
      error: err.message
    });
  }
});

module.exports = router;
