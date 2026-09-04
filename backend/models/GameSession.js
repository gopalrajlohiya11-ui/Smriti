const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  gameType: { type: String, required: true },
  title: { type: String },
  category: { type: String, default: 'Visual Memory' },
  score: { type: Number, required: true },
  difficultyLevel: { type: String, default: 'medium' },
  duration: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GameSession', gameSessionSchema);