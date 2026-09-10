const mongoose = require('mongoose');

const roundDetailSchema = new mongoose.Schema({
  level: { type: Number, default: 1 },
  itemCount: { type: Number, default: 4 },
  mode: { type: String, default: 'standard' },
  accuracy: { type: Number, default: 100 },
  correctCount: { type: Number, default: 1 },
  totalAttempts: { type: Number, default: 1 },
  timeTakenSeconds: { type: Number, default: 5 }
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
  averageReactionTime: { type: Number },
  totalMistakes: { type: Number },
  aiDifficulty: { type: Number },
  aiReasoning: { type: String },
  aiSource: { type: String, default: 'ml_model' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GameSession', gameSessionSchema);