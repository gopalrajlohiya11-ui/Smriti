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
    const { gameType, score, difficultyLevel, title, category, duration } = req.body;
    let patientId = resolvePatientId(req);

    // If still not resolved, try finding the first active patient in db as fallback
    if (!patientId) {
      const firstPat = await Patient.findOne();
      if (firstPat) patientId = firstPat._id;
    }

    if (!patientId) {
      return res.status(400).json({ error: 'Valid patientId is required to record a game session.' });
    }

    const session = new GameSession({
      patientId,
      gameType: gameType || 'market-day-basket',
      title: title || 'Market Day Basket',
      category: category || 'Pattern & Math Recall',
      score: typeof score === 'number' ? score : parseInt(score, 10) || 100,
      difficultyLevel: difficultyLevel || 'medium',
      duration: duration || '3 Mins'
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
    const patientId = resolvePatientId(req) || req.query.patientId;
    const filter = patientId ? { patientId } : {};
    const sessions = await GameSession.find(filter).sort({ timestamp: -1 }).limit(30);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
