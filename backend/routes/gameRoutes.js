const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const GameSession = require('../models/GameSession');
const Patient = require('../models/patient');
const Reminder = require('../models/Reminder');
const jwt = require('jsonwebtoken');

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

// 1. POST /api/game-sessions (Save game session, update routine & streak)
router.post('/', async (req, res) => {
  try {
    const { gameType, score, difficultyLevel, title, category, duration, roundDetails } = req.body;
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
    }

    const session = new GameSession({
      patientId,
      gameType: gameType || 'market-day-basket',
      title: title || defaultTitle,
      category: category || defaultCategory,
      score: typeof score === 'number' ? score : parseInt(score, 10) || 100,
      difficultyLevel: difficultyLevel || 'medium',
      duration: duration || '3 Mins',
      roundDetails: Array.isArray(roundDetails) ? roundDetails : []
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

    // Increment or maintain patient streak
    const patient = await Patient.findById(patientId);
    let streakDays = 14;
    if (patient) {
      patient.streakDays = (patient.streakDays || 0) + 1;
      await patient.save();
      streakDays = patient.streakDays;
    }

    return res.status(201).json({
      status: 'ok',
      message: 'Game session recorded successfully',
      session,
      routineUpdated,
      streakDays
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

// 3. GET /api/game-sessions/:patientId (Fetch game sessions for specific patient)
router.get('/:patientId', async (req, res) => {
  try {
    const rawId = req.params.patientId;
    let filter = {};
    
    if (mongoose.Types.ObjectId.isValid(rawId)) {
      filter = { patientId: rawId };
    } else {
      // Look up patient by custom id or name
      const patient = await Patient.findOne({
        $or: [
          { id: rawId },
          { name: /Ramesh/i }
        ]
      });
      if (patient) {
        filter = { patientId: patient._id };
      } else {
        filter = { patientId: rawId };
      }
    }

    let targetPatientId = filter.patientId;
    let sessions = await GameSession.find(filter).sort({ timestamp: -1 }).limit(50);
    
    // If no sessions exist yet for this patient, seed a diverse set of all 4 cognitive games
    if (sessions.length === 0 && targetPatientId && mongoose.Types.ObjectId.isValid(targetPatientId)) {
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

    res.json(sessions);
  } catch (err) {
    console.error('Error fetching game sessions by patientId:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
