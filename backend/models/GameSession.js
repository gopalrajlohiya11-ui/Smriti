const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  gameType: { type: String, required: true },
  score: { type: Number, required: true },
  difficultyLevel: { type: String, default: 'medium' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GameSession', gameSessionSchema);