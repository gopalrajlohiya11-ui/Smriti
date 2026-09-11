/**
 * injectGoodGames.js
 * ------------------
 * Standalone script — injects 30 highly positive game sessions for "Ramesh Sharma"
 * to boost his ML Cognitive Health Score in the demo.
 *
 * SAFE: Does NOT touch any existing records. Does NOT modify any app files.
 * Run: node injectGoodGames.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

// ─── Inline schemas (mirrors app models — do not import from app to stay isolated) ───

const roundDetailSchema = new mongoose.Schema({
  level:           { type: Number, default: 1 },
  itemCount:       { type: Number, default: 4 },
  mode:            { type: String, default: 'standard' },
  accuracy:        { type: Number, default: 100 },
  correctCount:    { type: Number, default: 4 },
  totalAttempts:   { type: Number, default: 4 },
  timeTakenSeconds:{ type: Number, default: 3 }
}, { _id: false });

const gameSessionSchema = new mongoose.Schema({
  patientId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  gameType:            { type: String, required: true },
  title:               { type: String },
  category:            { type: String, default: 'Memory & Recall' },
  score:               { type: Number, required: true },
  difficultyLevel:     { type: String, default: 'hard' },
  duration:            { type: String },
  roundDetails:        [roundDetailSchema],
  averageReactionTime: { type: Number },
  totalMistakes:       { type: Number },
  aiDifficulty:        { type: Number },
  aiReasoning:         { type: String },
  aiSource:            { type: String, default: 'ml_model' },
  timestamp:           { type: Date, default: Date.now }
});

const PatientSchema = new mongoose.Schema({
  name:        String,
  isDemoSeed:  Boolean
});

const Patient     = mongoose.model('Patient',     PatientSchema);
const GameSession = mongoose.model('GameSession', gameSessionSchema);

// ─── Game types to rotate through (all 5 games) ──────────────────────────────

const GAMES = [
  { gameType: 'market-day-basket',       title: 'Market Day Basket',       category: 'Memory & Recall' },
  { gameType: 'daily-routine-sequencer', title: 'Daily Routine Sequencer', category: 'Executive Function' },
  { gameType: 'faces-family-recall',     title: 'Faces & Family Recall',   category: 'Facial Recognition' },
  { gameType: 'sound-rhythm-match',      title: 'Sound & Rhythm Match',    category: 'Auditory Attention' },
  { gameType: 'odd-one-out',             title: 'Odd One Out',             category: 'Semantic Categorization' }
];

// ─── Helper: random float between min and max ────────────────────────────────
const rand = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

// ─── Build one perfect game session record ───────────────────────────────────
function buildSession(patientId, daysAgo, index) {
  const game = GAMES[index % GAMES.length];

  // Spread timestamps naturally over last 30 days (one per day)
  const ts = new Date();
  ts.setDate(ts.getDate() - daysAgo);
  ts.setHours(Math.floor(rand(8, 20)), Math.floor(rand(0, 59)), 0, 0);

  const reactionTime = rand(2.0, 4.0); // 2–4 seconds — very fast
  const rounds = Array.from({ length: 5 }, () => ({
    level:            5,           // max difficulty
    itemCount:        6,
    mode:             'challenge',
    accuracy:         100,
    correctCount:     6,
    totalAttempts:    6,
    timeTakenSeconds: rand(2.0, 4.0)
  }));

  return {
    patientId,
    gameType:            game.gameType,
    title:               game.title,
    category:            game.category,
    score:               100,
    difficultyLevel:     'hard',
    duration:            `${Math.floor(rand(4, 8))}m ${Math.floor(rand(10, 59))}s`,
    roundDetails:        rounds,
    averageReactionTime: reactionTime,
    totalMistakes:       0,
    aiDifficulty:        5,
    aiReasoning:         'Exceptional performance. Maintaining maximum difficulty.',
    aiSource:            'ml_model',
    timestamp:           ts
  };
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌ MONGO_URI not found in .env — aborting.');
    process.exit(1);
  }

  console.log('🔌 Connecting to MongoDB Atlas...');
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 20000,
    connectTimeoutMS: 20000
  });
  console.log('✅ Connected.\n');

  // 1. Find Ramesh Sharma
  const ramesh = await Patient.findOne({ name: 'Ramesh Sharma' });
  if (!ramesh) {
    console.error('❌ Patient "Ramesh Sharma" not found in DB. Check the name exactly.');
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`✅ Found patient: ${ramesh.name} (ID: ${ramesh._id})\n`);

  // 2. Build 30 sessions — one per day going back 30 days
  const sessions = Array.from({ length: 30 }, (_, i) =>
    buildSession(ramesh._id, 30 - i, i)
  );

  // 3. Insert all 30 — does NOT touch existing records
  const result = await GameSession.insertMany(sessions);
  console.log(`🎉 Successfully injected ${result.length} game sessions for Ramesh Sharma.`);
  console.log('   → mistakes:    0 for all sessions');
  console.log('   → accuracy:    100% for all sessions');
  console.log('   → reaction:    2.0 – 4.0 seconds');
  console.log('   → difficulty:  hard (level 5)');
  console.log('   → spread over: last 30 days\n');
  console.log('🧠 Refresh the Caregiver Dashboard to see the updated ML Cognitive Health Score.');

  // 4. Clean disconnect
  await mongoose.disconnect();
  console.log('🔌 Disconnected. Script complete.');
}

main().catch(async (err) => {
  console.error('❌ Script failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
