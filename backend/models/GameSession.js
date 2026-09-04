const mongoose = require('mongoose');

const roundDetailSchema = new mongoose.Schema({
  level: { type: Number, required: true },
  itemCount: { type: Number, required: true },
  mode: { type: String, required: true }, // "categorization" | "math"
  accuracy: { type: Number, required: true },
  correctCount: { type: Number, required: true },
  totalAttempts: { type: Number, required: true },
  timeTakenSeconds: { type: Number, required: true }
}, { _id: false });

const gameSessionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  gameType: { type: String, required: true },
  title: { type: String },
  category: { type: String, default: 'Pattern & Math Recall' },
  score: { type: Number, required: true },
  difficultyLevel: { type: String, default: 'medium' },
  duration: { type: String },
  roundDetails: [roundDetailSchema],
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GameSession', gameSessionSchema);