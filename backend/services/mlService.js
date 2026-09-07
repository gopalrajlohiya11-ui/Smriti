const axios = require('axios');

const getBaseUrl = () => process.env.ML_SERVICE_URL || 'https://dementia-ai-engine.onrender.com';
const getTimeout = () => parseInt(process.env.ML_SERVICE_TIMEOUT_MS, 10) || 6000;

/**
 * Safely converts string or ObjectId to positive integer for ML service
 */
function toNumericPatientId(id) {
  if (typeof id === 'number' && Number.isFinite(id)) return Math.max(1, Math.round(id));
  if (!id) return 1;
  const str = String(id).trim();
  const digits = str.replace(/\D/g, '');
  if (digits.length >= 1) {
    const num = parseInt(digits.slice(-6), 10);
    if (!isNaN(num) && num > 0) return num;
  }
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 100000) + 1;
}

/**
 * Rule-based fallback for adaptive difficulty
 */
function fallbackCalculateDifficulty({ reactionTime = 3.0, mistakes = 0, currentLevel = 1 }) {
  let nextLevel = currentLevel;
  let reasoning = 'Maintaining current difficulty level based on standard baseline metrics.';

  if (mistakes === 0 && reactionTime < 3.5) {
    nextLevel = Math.min(5, currentLevel + 1);
    reasoning = 'Rule-based evaluation: Excellent accuracy and fast response time detected. Increasing difficulty tier.';
  } else if (mistakes >= 3 || reactionTime > 7.0) {
    nextLevel = Math.max(1, currentLevel - 1);
    reasoning = 'Rule-based evaluation: High mistake count or extended latency detected. Reducing cognitive load.';
  } else {
    reasoning = 'Rule-based evaluation: Steady performance maintained. Keeping current level.';
  }

  return { difficulty: nextLevel, reasoning, source: 'rule_fallback' };
}

/**
 * Rule-based fallback for cognitive health scoring
 */
function fallbackCalculateHealthScore({ gamesPlayedThisWeek = 3, avgReactionTime = 3.5, totalMistakes = 2 }) {
  let score = 80;
  score += Math.min(15, (gamesPlayedThisWeek || 0) * 3);
  score -= Math.min(30, (totalMistakes || 0) * 2.5);
  score -= Math.min(15, Math.max(0, (avgReactionTime || 3.5) - 3.0) * 3);

  const clampedScore = Math.max(40, Math.min(100, Math.round(score)));
  let status = 'Stable';

  if (clampedScore >= 85) {
    status = 'Stable';
  } else if (clampedScore >= 70) {
    status = 'Mild Decline - Monitor';
  } else {
    status = 'Significant Decline - Alert Doctor';
  }

  return { score: clampedScore, status, source: 'rule_fallback' };
}

/**
 * 1. Adaptive Difficulty via Teammate ML Service
 * POST /get_next_difficulty
 * @param {Object} params
 * @param {number} params.reactionTime - Reaction time in seconds
 * @param {number} params.mistakes - Total mistakes made in round/session
 * @param {number} params.currentLevel - Current difficulty level (1-5)
 * @returns {Promise<{ difficulty: number, reasoning: string, source: string }>}
 */
async function getMLDifficulty({ reactionTime = 3.0, mistakes = 0, currentLevel = 1 }) {
  const safeReactionTime = Number.isFinite(Number(reactionTime)) ? Number(reactionTime) : 3.0;
  const safeMistakes = Number.isFinite(Number(mistakes)) ? Math.max(0, Math.round(Number(mistakes))) : 0;
  const safeLevel = Number.isFinite(Number(currentLevel)) ? Math.max(1, Math.min(5, Math.round(Number(currentLevel)))) : 1;

  const payload = {
    reaction_time: safeReactionTime,
    mistakes: safeMistakes,
    current_level: safeLevel
  };

  try {
    const startTime = Date.now();
    const response = await axios.post(`${getBaseUrl()}/get_next_difficulty`, payload, {
      timeout: getTimeout(),
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.data && typeof response.data.new_difficulty_level !== 'undefined') {
      const difficulty = Number(response.data.new_difficulty_level) || safeLevel;
      const reasoning = response.data.ai_reasoning || 'Live ML Model difficulty recommendation applied.';
      console.log(`🧠 [ML Service] get_next_difficulty (${Date.now() - startTime}ms): level ${safeLevel} -> ${difficulty} (${reasoning})`);
      return {
        difficulty,
        reasoning,
        source: 'ml_model'
      };
    }

    console.warn('⚠️ [ML Service] Unexpected response schema from /get_next_difficulty, applying fallback:', response.data);
    return fallbackCalculateDifficulty({ reactionTime: safeReactionTime, mistakes: safeMistakes, currentLevel: safeLevel });
  } catch (err) {
    console.warn(`⚠️ [ML Service] /get_next_difficulty unavailable (${err.message}). Using safe rule-based fallback.`);
    return fallbackCalculateDifficulty({ reactionTime: safeReactionTime, mistakes: safeMistakes, currentLevel: safeLevel });
  }
}

/**
 * 2. Cognitive Health Scoring via Teammate ML Service
 * POST /calculate_health_score
 * @param {Object} params
 * @param {string|number} params.patientId - MongoDB ObjectId or numeric ID
 * @param {number} params.gamesPlayedThisWeek - Total games completed in last 7 days
 * @param {number} params.avgReactionTime - Average reaction time across rounds in seconds
 * @param {number} params.totalMistakes - Total incorrect actions made this week
 * @returns {Promise<{ score: number, status: string, source: string }>}
 */
async function getMLHealthScore({ patientId, gamesPlayedThisWeek = 0, avgReactionTime = 3.5, totalMistakes = 0 }) {
  const numericId = toNumericPatientId(patientId);
  const safeGames = Number.isFinite(Number(gamesPlayedThisWeek)) ? Math.max(0, Math.round(Number(gamesPlayedThisWeek))) : 0;
  const safeReaction = Number.isFinite(Number(avgReactionTime)) ? Number(avgReactionTime) : 3.5;
  const safeMistakes = Number.isFinite(Number(totalMistakes)) ? Math.max(0, Math.round(Number(totalMistakes))) : 0;

  const payload = {
    patient_id: numericId,
    games_played_this_week: safeGames,
    average_reaction_time: safeReaction,
    total_mistakes_this_week: safeMistakes
  };

  try {
    const startTime = Date.now();
    const response = await axios.post(`${getBaseUrl()}/calculate_health_score`, payload, {
      timeout: getTimeout(),
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.data && typeof response.data.cognitive_health_score !== 'undefined') {
      const score = Number(response.data.cognitive_health_score);
      const status = response.data.clinical_status || (score >= 85 ? 'Stable' : score >= 70 ? 'Mild Decline - Monitor' : 'Significant Decline - Alert Doctor');
      console.log(`🧠 [ML Service] calculate_health_score (${Date.now() - startTime}ms): patient ${numericId} -> Score ${score}, Status: "${status}"`);
      return {
        score,
        status,
        source: 'ml_model'
      };
    }

    console.warn('⚠️ [ML Service] Unexpected response schema from /calculate_health_score, applying fallback:', response.data);
    return fallbackCalculateHealthScore({ gamesPlayedThisWeek: safeGames, avgReactionTime: safeReaction, totalMistakes: safeMistakes });
  } catch (err) {
    console.warn(`⚠️ [ML Service] /calculate_health_score unavailable (${err.message}). Using safe rule-based fallback.`);
    return fallbackCalculateHealthScore({ gamesPlayedThisWeek: safeGames, avgReactionTime: safeReaction, totalMistakes: safeMistakes });
  }
}

module.exports = {
  getMLDifficulty,
  getMLHealthScore,
  fallbackCalculateDifficulty,
  fallbackCalculateHealthScore,
  toNumericPatientId,
  getBaseUrl
};

