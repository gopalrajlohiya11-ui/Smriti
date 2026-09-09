const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const GameSession = require('../models/GameSession');
const Patient = require('../models/patient');
const Reminder = require('../models/Reminder');
const jwt = require('jsonwebtoken');
const { getMLDifficulty, getMLHealthScore } = require('../services/mlService');

const JWT_SECRET = process.env.JWT_SECRET || 'smriti-hackathon-secret-key-2026';

// Helper to extract patient ID from body or authorization token
function resolvePatientId(req) {
  if (req.body.patientId && mongoose.Types.ObjectId.isValid(req.body.patientId)) {
    return req.body.patientId;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.patientId && mongoose.Types.ObjectId.isValid(decoded.patientId)) {
        return decoded.patientId;
      }
      if (decoded.id && mongoose.Types.ObjectId.isValid(decoded.id)) {
        return decoded.id;
      }
    } catch (e) {}
  }
  return null;
}

// Helper: Calculate 7-day aggregates for a patient and fetch ML health score
async function calculatePatientMLHealth(patientId) {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSessions = await GameSession.find({
      patientId,
      timestamp: { $gte: sevenDaysAgo }
    }).sort({ timestamp: -1 });

    if (recentSessions.length === 0) {
      const patDoc = await Patient.findById(patientId);
      const isDemo = patDoc?.isDemoSeed === true || 
        ['pat-1', 'pat-2', 'pat-3'].includes(patDoc?.id) || 
        ['Ramesh Sharma', 'Meera Baruah', 'Biren Das'].includes(patDoc?.name);
      
      if (!isDemo) {
        return {
          score: 0,
          status: 'Pending Assessment',
          source: 'baseline',
          weeklyAggregates: {
            gamesPlayedThisWeek: 0,
            avgReactionTime: 0,
            totalMistakesThisWeek: 0
          }
        };
      }
    }

    let gamesPlayedThisWeek = recentSessions.length;
    let totalReactionTime = 0;
    let reactionCount = 0;
    let totalMistakesThisWeek = 0;

    for (const s of recentSessions) {
      if (typeof s.totalMistakes === 'number') {
        totalMistakesThisWeek += s.totalMistakes;
      }
      if (typeof s.averageReactionTime === 'number' && s.averageReactionTime > 0) {
        totalReactionTime += s.averageReactionTime;
        reactionCount++;
      } else if (Array.isArray(s.roundDetails) && s.roundDetails.length > 0) {
        for (const r of s.roundDetails) {
          if (r.timeTakenSeconds) {
            totalReactionTime += r.timeTakenSeconds;
            reactionCount++;
          }
          if (r.totalAttempts && r.correctCount) {
            totalMistakesThisWeek += Math.max(0, r.totalAttempts - r.correctCount);
          }
        }
      }
    }

    const avgReactionTime = reactionCount > 0 ? Number((totalReactionTime / reactionCount).toFixed(2)) : 3.0;

    const mlHealthResult = await getMLHealthScore({
      patientId,
      gamesPlayedThisWeek,
      avgReactionTime,
      totalMistakes: totalMistakesThisWeek
    });

    return {
      ...mlHealthResult,
      weeklyAggregates: {
        gamesPlayedThisWeek,
        avgReactionTime,
        totalMistakesThisWeek
      }
    };
  } catch (err) {
    console.warn('Error computing weekly ML health score:', err.message);
    return {
      score: 0,
      status: 'Pending Assessment',
      source: 'fallback',
      weeklyAggregates: { gamesPlayedThisWeek: 0, avgReactionTime: 0, totalMistakesThisWeek: 0 }
    };
  }
}

// 1. POST /api/game-sessions (Save game session, ML adaptive difficulty, update routine & streak)
router.post('/', async (req, res) => {
  try {
    const { 
      gameType, 
      score, 
      difficultyLevel, 
      title, 
      category, 
      duration, 
      roundDetails,
      reactionTime: customReactionTime,
      mistakes: customMistakes,
      currentLevel: customLevel
    } = req.body;
    let patientId = resolvePatientId(req);

    // If still not resolved, try finding the first active patient in db as fallback
    if (!patientId) {
      const firstPat = await Patient.findOne();
      if (firstPat) patientId = firstPat._id;
    }

    if (!patientId) {
      return res.status(400).json({ error: 'Valid patientId is required to record a game session.' });
    }

    let defaultTitle = 'Market Day Basket';
    let defaultCategory = 'Pattern & Math Recall';
    if (gameType === 'daily-routine-sequencer') {
      defaultTitle = 'Daily Routine Sequencer';
      defaultCategory = 'Sequence & Routine Recall';
    } else if (gameType === 'faces-family-recall') {
      defaultTitle = 'Faces & Family Recall';
      defaultCategory = 'Family & People Recall';
    } else if (gameType === 'sound-rhythm-match') {
      defaultTitle = 'Sound & Rhythm Match';
      defaultCategory = 'Auditory & Rhythm Recall';
    } else if (gameType === 'odd-one-out') {
      defaultTitle = 'Odd One Out';
      defaultCategory = 'Visual & Category Discrimination';
    }

    // --- Compute Session Telemetry for Teammate ML Engine from Real Gameplay ---
    let computedReactionTime = customReactionTime;
    let computedMistakes = customMistakes;
    let computedCurrentLevel = customLevel;

    if (Array.isArray(roundDetails) && roundDetails.length > 0) {
      if (computedReactionTime === undefined) {
        const totalTime = roundDetails.reduce((sum, r) => sum + (Number(r.timeTakenSeconds) || 0), 0);
        computedReactionTime = Number((totalTime / roundDetails.length).toFixed(2));
      }
      if (computedMistakes === undefined) {
        computedMistakes = roundDetails.reduce((sum, r) => {
          if (typeof r.totalAttempts === 'number' && typeof r.correctCount === 'number') {
            return sum + Math.max(0, r.totalAttempts - r.correctCount);
          }
          if (typeof r.accuracy === 'number') {
            return sum + (r.accuracy < 60 ? 2 : r.accuracy < 90 ? 1 : 0);
          }
          return sum;
        }, 0);
      }
      if (computedCurrentLevel === undefined) {
        computedCurrentLevel = roundDetails[roundDetails.length - 1]?.level || 2;
      }
    }

    // Default telemetry fallbacks if session had no round details at all
    if (computedReactionTime === undefined || isNaN(computedReactionTime) || computedReactionTime <= 0) {
      computedReactionTime = 2.8;
    }
    if (computedMistakes === undefined || isNaN(computedMistakes)) {
      const numericScore = typeof score === 'number' ? score : parseInt(score, 10) || 100;
      computedMistakes = numericScore < 70 ? 3 : numericScore < 85 ? 1 : 0;
    }
    if (computedCurrentLevel === undefined || isNaN(computedCurrentLevel)) {
      computedCurrentLevel = difficultyLevel === 'hard' ? 3 : difficultyLevel === 'easy' ? 1 : 2;
    }

    console.log(`🎮 [Game Session] Derived ML Telemetry for ${gameType || 'game'}: reactionTime=${computedReactionTime}s, mistakes=${computedMistakes}, level=${computedCurrentLevel} (from ${roundDetails?.length || 0} rounds)`);

    // --- 1. Call Teammate ML Adaptive Difficulty Endpoint ---
    const mlDiffResult = await getMLDifficulty({
      reactionTime: computedReactionTime,
      mistakes: computedMistakes,
      currentLevel: computedCurrentLevel
    });

    const session = new GameSession({
      patientId,
      gameType: gameType || 'market-day-basket',
      title: title || defaultTitle,
      category: category || defaultCategory,
      score: typeof score === 'number' ? score : parseInt(score, 10) || 100,
      difficultyLevel: difficultyLevel || 'medium',
      duration: duration || '3 Mins',
      roundDetails: Array.isArray(roundDetails) ? roundDetails : [],
      averageReactionTime: computedReactionTime,
      totalMistakes: computedMistakes,
      aiDifficulty: mlDiffResult.difficulty,
      aiReasoning: mlDiffResult.reasoning,
      aiSource: mlDiffResult.source
    });

    await session.save();

    // Automatically complete any pending 'game' routine for today
    let routineUpdated = false;
    const pendingGameReminder = await Reminder.findOne({
      patientId,
      type: 'game',
      acknowledged: false
    });

    if (pendingGameReminder) {
      pendingGameReminder.acknowledged = true;
      await pendingGameReminder.save();
      routineUpdated = true;
    }

    // --- 2. Call Teammate ML Cognitive Health Score Endpoint ---
    const mlHealthResult = await calculatePatientMLHealth(patientId);

    // Update patient record with ML insights & increment streak
    const patient = await Patient.findById(patientId);
    let streakDays = 14;
    if (patient) {
      patient.streakDays = (patient.streakDays || 0) + 1;
      patient.cognitiveHealthScore = mlHealthResult.score;
      patient.clinicalStatus = mlHealthResult.status;
      patient.recommendedDifficulty = mlDiffResult.difficulty;
      patient.aiReasoning = mlDiffResult.reasoning;
      patient.lastMLEvaluationDate = new Date();
      await patient.save();
      streakDays = patient.streakDays;
    }

    return res.status(201).json({
      status: 'ok',
      message: 'Game session recorded successfully with ML engine insights',
      session,
      routineUpdated,
      streakDays,
      mlInsights: {
        adaptiveDifficulty: {
          level: mlDiffResult.difficulty,
          reasoning: mlDiffResult.reasoning,
          source: mlDiffResult.source
        },
        cognitiveHealth: {
          score: mlHealthResult.score,
          status: mlHealthResult.status,
          source: mlHealthResult.source,
          weeklyAggregates: mlHealthResult.weeklyAggregates
        }
      }
    });
  } catch (err) {
    console.error('Error saving game session:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 2. GET /api/game-sessions (Fetch past game sessions)
router.get('/', async (req, res) => {
  try {
    let patientId = resolvePatientId(req) || req.query.patientId;
    let filter = {};
    if (patientId) {
      if (mongoose.Types.ObjectId.isValid(patientId)) {
        filter = { patientId };
      } else {
        const patient = await Patient.findOne({
          $or: [
            { id: patientId },
            { name: new RegExp(patientId.replace(/[-_]/g, ' '), 'i') }
          ]
        });
        if (patient) {
          filter = { patientId: patient._id };
        } else {
          filter = { patientId };
        }
      }
    }
    const sessions = await GameSession.find(filter).sort({ timestamp: -1 }).limit(50);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET /api/game-sessions/ml-health-score/:patientId (Compute real-time ML Cognitive Health Score & Clinical Status)
router.get('/ml-health-score/:patientId', async (req, res) => {
  try {
    const rawId = req.params.patientId;
    let targetPatient = null;

    if (mongoose.Types.ObjectId.isValid(rawId)) {
      targetPatient = await Patient.findById(rawId);
    }
    if (!targetPatient && (rawId === 'pat-1' || rawId === 'default' || (typeof rawId === 'string' && rawId.toLowerCase().includes('ramesh')))) {
      targetPatient = await Patient.findOne({ name: /Ramesh/i });
    }
    if (!targetPatient && (rawId === 'pat-2' || (typeof rawId === 'string' && rawId.toLowerCase().includes('meera')))) {
      targetPatient = await Patient.findOne({ name: /Meera/i });
    }
    if (!targetPatient && (rawId === 'pat-3' || (typeof rawId === 'string' && rawId.toLowerCase().includes('biren')))) {
      targetPatient = await Patient.findOne({ name: /Biren/i });
    }
    if (!targetPatient) {
      targetPatient = await Patient.findOne({
        $or: [
          { id: rawId },
          { name: new RegExp(String(rawId).replace(/[-_]/g, ' ').trim(), 'i') }
        ]
      });
    }

    const patientId = targetPatient ? targetPatient._id : (mongoose.Types.ObjectId.isValid(rawId) ? rawId : null);
    
    if (!patientId) {
      return res.status(404).json({ error: 'Patient not found for ML cognitive evaluation' });
    }

    const mlResult = await calculatePatientMLHealth(patientId);

    // Persist to Patient record if found
    if (targetPatient) {
      targetPatient.cognitiveHealthScore = mlResult.score;
      targetPatient.clinicalStatus = mlResult.status;
      targetPatient.lastMLEvaluationDate = new Date();
      await targetPatient.save();
    }

    const isDemo = targetPatient?.isDemoSeed === true || 
      ['pat-1', 'pat-2', 'pat-3'].includes(targetPatient?.id) || 
      ['pat-1', 'pat-2', 'pat-3'].includes(targetPatient?._id?.toString()) || 
      ['Ramesh Sharma', 'Meera Baruah', 'Biren Das'].includes(targetPatient?.name);

    const defaultReasoning = isDemo
      ? 'Patient maintains regular cognitive engagement with fast reaction speeds. Adaptive difficulty calibrated for cognitive maintenance.'
      : (mlResult.weeklyAggregates?.gamesPlayedThisWeek > 0
          ? 'Initial session data recorded. AI telemetry analyzing accuracy and response timing.'
          : 'No cognitive sessions recorded yet. Have the patient complete memory games in the patient portal to generate live AI clinical evaluation.');

    res.json({
      status: 'ok',
      patientId: patientId.toString(),
      patientName: targetPatient?.name || 'Patient',
      cognitiveHealthScore: mlResult.score,
      clinicalStatus: mlResult.status,
      source: mlResult.source,
      weeklyAggregates: mlResult.weeklyAggregates,
      recommendedDifficulty: targetPatient?.recommendedDifficulty || (isDemo ? 2 : 1),
      aiReasoning: targetPatient?.aiReasoning || defaultReasoning
    });
  } catch (err) {
    console.error('Error in /ml-health-score endpoint:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. POST /api/game-sessions/adaptive-difficulty (Direct adaptive difficulty evaluation)
router.post('/adaptive-difficulty', async (req, res) => {
  try {
    const { reaction_time, reactionTime, mistakes, current_level, currentLevel } = req.body;
    const rTime = reaction_time !== undefined ? reaction_time : reactionTime;
    const cLevel = current_level !== undefined ? current_level : currentLevel;

    const result = await getMLDifficulty({
      reactionTime: rTime,
      mistakes,
      currentLevel: cLevel
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4b. GET /api/game-sessions/:patientId/last-difficulty (Fetch most recent ML difficulty for patient/game)
const handleLastDifficultyRequest = async (req, res) => {
  try {
    const rawId = req.params.patientId;
    let targetPatient = null;

    if (mongoose.Types.ObjectId.isValid(rawId)) {
      targetPatient = await Patient.findById(rawId);
    }
    if (!targetPatient && (rawId === 'pat-1' || rawId === 'default' || (typeof rawId === 'string' && rawId.toLowerCase().includes('ramesh')))) {
      targetPatient = await Patient.findOne({ name: /Ramesh/i });
    }
    if (!targetPatient && (rawId === 'pat-2' || (typeof rawId === 'string' && rawId.toLowerCase().includes('meera')))) {
      targetPatient = await Patient.findOne({ name: /Meera/i });
    }
    if (!targetPatient && (rawId === 'pat-3' || (typeof rawId === 'string' && rawId.toLowerCase().includes('biren')))) {
      targetPatient = await Patient.findOne({ name: /Biren/i });
    }
    if (!targetPatient) {
      targetPatient = await Patient.findOne({
        $or: [
          { id: rawId },
          { name: new RegExp(String(rawId).replace(/[-_]/g, ' ').trim(), 'i') }
        ]
      }) || await Patient.findOne();
    }

    const patientId = targetPatient ? targetPatient._id : (mongoose.Types.ObjectId.isValid(rawId) ? rawId : null);

    if (!patientId) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const gameType = req.query.gameType;
    let query = { patientId };
    if (gameType) {
      query.gameType = gameType;
    }

    let session = await GameSession.findOne(query).sort({ timestamp: -1 });

    // If no session found for this specific game, find the most recent overall session for this patient
    if (!session && gameType) {
      session = await GameSession.findOne({ patientId }).sort({ timestamp: -1 });
    }

    let aiDifficulty = 2;
    let aiReasoning = 'Standard baseline starting tier.';
    let aiSource = 'baseline_default';
    let hasHistory = false;

    if (session) {
      hasHistory = true;
      aiDifficulty = typeof session.aiDifficulty === 'number' ? session.aiDifficulty : (targetPatient?.recommendedDifficulty || 2);
      aiReasoning = session.aiReasoning || targetPatient?.aiReasoning || 'Calibrated from recent gameplay telemetry.';
      aiSource = session.aiSource || 'ml_model';
    } else if (targetPatient && typeof targetPatient.recommendedDifficulty === 'number') {
      aiDifficulty = targetPatient.recommendedDifficulty;
      aiReasoning = targetPatient.aiReasoning || 'Calibrated from patient profile.';
      aiSource = 'patient_profile';
      hasHistory = true;
    }

    return res.json({
      status: 'ok',
      patientId: patientId.toString(),
      patientName: targetPatient?.name || 'Patient',
      gameType: gameType || 'all',
      aiDifficulty,
      aiReasoning,
      aiSource,
      hasHistory,
      lastPlayed: session?.timestamp || null,
      lastScore: session?.score || null
    });
  } catch (err) {
    console.error('Error in /last-difficulty endpoint:', err);
    res.status(500).json({ error: err.message });
  }
};

router.get('/:patientId/last-difficulty', handleLastDifficultyRequest);
router.get('/last-difficulty/:patientId', handleLastDifficultyRequest);

// 5. GET /api/game-sessions/:patientId (Fetch game sessions for specific patient)
router.get('/:patientId', async (req, res) => {
  try {
    const rawId = req.params.patientId;
    if (rawId === 'ml-health-score' || rawId === 'adaptive-difficulty') {
      return res.status(404).json({ error: 'Not found' });
    }

    let filter = {};
    
    if (mongoose.Types.ObjectId.isValid(rawId)) {
      filter = { patientId: rawId };
    } else {
      // Look up patient by custom id, shortcut, or name
      let patient = null;
      if (rawId === 'pat-2' || (typeof rawId === 'string' && rawId.toLowerCase().includes('meera'))) {
        patient = await Patient.findOne({ name: /Meera/i });
      } else if (rawId === 'pat-3' || (typeof rawId === 'string' && rawId.toLowerCase().includes('biren'))) {
        patient = await Patient.findOne({ name: /Biren/i });
      } else if (rawId === 'pat-1' || rawId === 'default' || (typeof rawId === 'string' && rawId.toLowerCase().includes('ramesh'))) {
        patient = await Patient.findOne({ name: /Ramesh/i });
      } else {
        patient = await Patient.findOne({
          $or: [
            { id: rawId },
            { name: new RegExp(rawId.replace(/[-_]/g, ' ').trim(), 'i') }
          ]
        });
      }

      if (patient) {
        filter = { patientId: patient._id };
      } else {
        filter = { patientId: rawId };
      }
    }

    let targetPatientId = filter.patientId;
    let sessions = await GameSession.find(filter).sort({ timestamp: -1 }).limit(50);
    
    // If no sessions exist yet for this patient, seed ONLY for demo patients
    if (sessions.length === 0 && targetPatientId && mongoose.Types.ObjectId.isValid(targetPatientId)) {
      const patDoc = await Patient.findById(targetPatientId);
      const isDemo = patDoc?.isDemoSeed === true || 
        ['pat-1', 'pat-2', 'pat-3'].includes(patDoc?.id) || 
        ['Ramesh Sharma', 'Meera Baruah', 'Biren Das'].includes(patDoc?.name);
      
      if (isDemo) {
        const now = Date.now();
        const defaultSessions = [
          {
            patientId: targetPatientId,
            gameType: 'market-day-basket',
            title: 'Market Day Basket',
            category: 'Pattern & Math Recall',
            score: 95,
            difficultyLevel: 'medium',
            duration: '2 Mins',
            timestamp: new Date(now - 25 * 60 * 1000),
            roundDetails: [
              { level: 1, itemCount: 3, mode: 'categorization', accuracy: 100, correctCount: 3, totalAttempts: 3, timeTakenSeconds: 9 },
              { level: 2, itemCount: 4, mode: 'math', accuracy: 100, correctCount: 1, totalAttempts: 1, timeTakenSeconds: 5 },
              { level: 3, itemCount: 4, mode: 'categorization', accuracy: 100, correctCount: 4, totalAttempts: 4, timeTakenSeconds: 12 },
              { level: 4, itemCount: 4, mode: 'math', accuracy: 100, correctCount: 1, totalAttempts: 1, timeTakenSeconds: 6 },
              { level: 5, itemCount: 5, mode: 'categorization', accuracy: 83, correctCount: 5, totalAttempts: 6, timeTakenSeconds: 15 }
            ]
          },
          {
            patientId: targetPatientId,
            gameType: 'sound-rhythm-match',
            title: 'Sound & Rhythm Match',
            category: 'Auditory & Rhythm Recall',
            score: 90,
            difficultyLevel: 'medium',
            duration: '2 Mins',
            timestamp: new Date(now - 3 * 3600 * 1000),
            roundDetails: [
              { level: 1, itemCount: 3, mode: 'rhythm_pattern', accuracy: 100, correctCount: 3, totalAttempts: 3, timeTakenSeconds: 8 },
              { level: 2, itemCount: 3, mode: 'rhythm_pattern', accuracy: 100, correctCount: 3, totalAttempts: 3, timeTakenSeconds: 9 },
              { level: 3, itemCount: 4, mode: 'rhythm_pattern', accuracy: 100, correctCount: 4, totalAttempts: 4, timeTakenSeconds: 12 },
              { level: 4, itemCount: 4, mode: 'rhythm_pattern', accuracy: 80, correctCount: 4, totalAttempts: 5, timeTakenSeconds: 14 },
              { level: 5, itemCount: 5, mode: 'rhythm_pattern', accuracy: 100, correctCount: 5, totalAttempts: 5, timeTakenSeconds: 16 }
            ]
          },
          {
            patientId: targetPatientId,
            gameType: 'faces-family-recall',
            title: 'Faces & Family Recall',
            category: 'Family & People Recall',
            score: 98,
            difficultyLevel: 'medium',
            duration: '2 Mins',
            timestamp: new Date(now - 8 * 3600 * 1000),
            roundDetails: [
              { level: 1, itemCount: 4, mode: 'family_name', accuracy: 100, correctCount: 1, totalAttempts: 1, timeTakenSeconds: 6 },
              { level: 2, itemCount: 4, mode: 'family_relation', accuracy: 100, correctCount: 1, totalAttempts: 1, timeTakenSeconds: 5 },
              { level: 3, itemCount: 4, mode: 'family_name', accuracy: 100, correctCount: 1, totalAttempts: 1, timeTakenSeconds: 7 },
              { level: 4, itemCount: 4, mode: 'family_relation', accuracy: 100, correctCount: 1, totalAttempts: 1, timeTakenSeconds: 6 },
              { level: 5, itemCount: 4, mode: 'family_name', accuracy: 100, correctCount: 1, totalAttempts: 1, timeTakenSeconds: 5 }
            ]
          },
          {
            patientId: targetPatientId,
            gameType: 'daily-routine-sequencer',
            title: 'Daily Routine Sequencer',
            category: 'Sequence & Routine Recall',
            score: 92,
            difficultyLevel: 'medium',
            duration: '3 Mins',
            timestamp: new Date(now - 24 * 3600 * 1000),
            roundDetails: [
              { level: 1, itemCount: 4, mode: 'routine_ordering', accuracy: 100, correctCount: 4, totalAttempts: 4, timeTakenSeconds: 14 },
              { level: 2, itemCount: 4, mode: 'routine_ordering', accuracy: 100, correctCount: 4, totalAttempts: 4, timeTakenSeconds: 16 },
              { level: 3, itemCount: 4, mode: 'routine_ordering', accuracy: 80, correctCount: 4, totalAttempts: 5, timeTakenSeconds: 22 },
              { level: 4, itemCount: 5, mode: 'routine_ordering', accuracy: 100, correctCount: 5, totalAttempts: 5, timeTakenSeconds: 15 },
              { level: 5, itemCount: 5, mode: 'routine_ordering', accuracy: 83, correctCount: 5, totalAttempts: 6, timeTakenSeconds: 19 }
            ]
          }
        ];

        try {
          await GameSession.insertMany(defaultSessions);
          sessions = await GameSession.find(filter).sort({ timestamp: -1 }).limit(50);
        } catch (insertErr) {
          console.warn('Could not auto-seed default game sessions:', insertErr.message);
        }
      }
    }

    res.json(sessions);
  } catch (err) {
    console.error('Error fetching game sessions by patientId:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
