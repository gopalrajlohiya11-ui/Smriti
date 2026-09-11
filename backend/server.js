const systemPort = process.env.PORT; // Preserve Render port if set in environment
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Root health & welcome route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Smriti Backend API',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'connecting'
  });
});


// Configure Mongoose connection event listeners for comprehensive log visibility on Render
mongoose.connection.on('connected', () => {
  console.log(`✅ [MongoDB Atlas] Connection established! Database: "${mongoose.connection.name}" | Host: ${mongoose.connection.host}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ [MongoDB Atlas] Connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn(`⚠️ [MongoDB Atlas] Disconnected from MongoDB Atlas. Auto-reconnection in progress...`);
});

mongoose.connection.on('reconnected', () => {
  console.log(`🔄 [MongoDB Atlas] Reconnected successfully to MongoDB Atlas!`);
});

// Lightweight health check — returns plain "ok" to satisfy cron-job.org keep-alive
app.get('/health', (req, res) => res.status(200).send('ok'));
app.get('/api/health', (req, res) => res.status(200).send('ok'));

// Import routes
const caregiverRoutes = require('./routes/caregiverRoutes');
const patientRoutes = require('./routes/patientRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const gameRoutes = require('./routes/gameRoutes');
const translationRoutes = require('./routes/translationRoutes');
app.use('/api/caregivers', caregiverRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/game-sessions', gameRoutes);
app.use('/api/translation', translationRoutes);
app.use('/api/speech', translationRoutes);

const whatsappWebhook = require('./routes/whatsappWebhook');
app.use('/api/whatsapp', whatsappWebhook);

// Temporary test route to manually trigger reminder cron logic
const { sendDailyPatientReminders } = require('./jobs/reminderCron');
const Patient = require('./models/patient');
const Reminder = require('./models/Reminder');

app.get('/api/test/trigger-reminders', async (req, res) => {
  try {
    const summary = await sendDailyPatientReminders();
    res.json({
      status: 'ok',
      message: 'Manual reminder dispatch executed',
      summary
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Temporary test route to reset daily tracking flags for a patient
const resetDailyFlagsHandler = async (req, res) => {
  try {
    const { patientId } = req.params;

    let patient = null;
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      patient = await Patient.findById(patientId);
    }
    if (!patient) {
      patient = await Patient.findOne({
        $or: [
          { phoneNumber: patientId },
          { phoneNumber: patientId.replace(/\D/g, '') }
        ]
      });
    }

    if (!patient) {
      return res.status(404).json({ error: `Patient not found for identifier: ${patientId}` });
    }

    // Reset daily game link dispatch tracker
    patient.lastGameLinkSentDate = null;
    await patient.save();

    // Reset today's reminders to unacknowledged for easy re-testing
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    let remindersResetCount = 0;
    if (req.query.resetReminders !== 'false' && req.body?.resetReminders !== false) {
      const result = await Reminder.updateMany(
        {
          patientId: patient._id,
          scheduledTime: { $gte: startOfToday, $lte: endOfToday }
        },
        { $set: { acknowledged: false } }
      );
      remindersResetCount = result.modifiedCount || 0;
    }

    res.json({
      status: 'ok',
      message: `Daily dispatch tracking reset successfully for ${patient.name}`,
      patientId: patient._id,
      patientName: patient.name,
      lastGameLinkSentDate: null,
      todayRemindersResetToUnacknowledged: remindersResetCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

app.post('/api/test/reset-daily-flags/:patientId', resetDailyFlagsHandler);
app.get('/api/test/reset-daily-flags/:patientId', resetDailyFlagsHandler);

// 404 handler for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Global Express Error Handler (Guarantees JSON response instead of HTML crash stack traces)
app.use((err, req, res, next) => {
  console.error('💥 Unhandled Application Error:', err);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    status: statusCode
  });
});

const PORT = systemPort || process.env.PORT || 5000;

async function startServer() {
  const mongoUri = process.env.MONGO_URI;
  
  if (!mongoUri) {
    console.error('❌ [FATAL ERROR] MONGO_URI environment variable is missing or undefined! Please set MONGO_URI in your Render environment settings.');
  } else {
    // Sanitize and mask password for safe log output on Render
    const maskedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log(`🔌 [Boot] Connecting to MongoDB Atlas (${maskedUri})...`);

    try {
      const startTime = Date.now();
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 30000, // 30 seconds wait before server selection timeout (handles cold starts)
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        retryWrites: true,
        w: 'majority'
      });
      const elapsed = Date.now() - startTime;
      console.log(`✅ [Boot] MongoDB Atlas connection established in ${elapsed}ms. Ready State: ${mongoose.connection.readyState}`);
    } catch (err) {
      console.error('❌ [Boot] Initial MongoDB Atlas connection failed:', err.message);
      console.error('💡 [Diagnosis]: If running on Render, ensure:');
      console.error('   1. MONGO_URI is configured correctly in Render Dashboard -> Environment.');
      console.error('   2. MongoDB Atlas Network Access has 0.0.0.0/0 enabled (Allow access from anywhere).');
      console.error('   3. Database user credentials and database name are valid.');
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Smriti Backend Server is listening on port ${PORT} (host: 0.0.0.0)`);
    console.log(`📡 Health check URL: http://localhost:${PORT}/health or /api/health`);

    // ─────────────────────────────────────────────────────────────────────────
    // KEEP-ALIVE SELF-PING
    // Prevents ALL Render free-tier services from sleeping (spin-down at 15 min).
    // Pings: 1) this backend  2) the ML engine (dementia-ai-engine.onrender.com)
    // Auto-disabled on localhost — no env variable changes needed for local dev.
    // ─────────────────────────────────────────────────────────────────────────
    const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes in milliseconds

    // Helper: fire a single GET ping with timeout, log result
    const pingUrl = async (label, url) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 s hard timeout
        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers: { 'User-Agent': 'SmritiKeepAlive/1.0' }
        });
        clearTimeout(timeoutId);
        const ts = new Date().toISOString();
        console.log(`💓 [Keep-Alive][${label}] Ping ${response.ok ? 'OK' : 'WARN'} (HTTP ${response.status}) at ${ts}`);
      } catch (err) {
        const reason = err.name === 'AbortError' ? 'timed out after 10 s' : err.message;
        console.warn(`⚠️  [Keep-Alive][${label}] Ping failed: ${reason}`);
      }
    };

    // Render injects RENDER_EXTERNAL_URL automatically on their platform.
    // Fallback: you can set BACKEND_URL manually in Render Environment Variables.
    const selfUrl = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL || null;
    const isLocalDev = !selfUrl || selfUrl.includes('localhost') || selfUrl.includes('127.0.0.1');

    // ML engine public URL — hardcoded since it never changes, no env var needed
    const ML_ENGINE_PING_URL = (process.env.ML_SERVICE_URL || 'https://dementia-ai-engine.onrender.com') + '/docs';

    if (isLocalDev) {
      console.log('🔕 [Keep-Alive] Self-ping disabled (localhost / no RENDER_EXTERNAL_URL set).');
      console.log(`🧠 [Keep-Alive] ML engine ping still ACTIVE → ${ML_ENGINE_PING_URL} every 14 min`);
      // Still ping the ML engine even from local — it's a remote service that can sleep
      setInterval(() => pingUrl('ML-Engine', ML_ENGINE_PING_URL), PING_INTERVAL_MS);
    } else {
      const backendPingUrl = `${selfUrl.replace(/\/$/, '')}/api/health`;
      console.log(`💓 [Keep-Alive] Backend self-ping ACTIVE → ${backendPingUrl} every 14 min`);
      console.log(`🧠 [Keep-Alive] ML engine ping ACTIVE → ${ML_ENGINE_PING_URL} every 14 min`);

      setInterval(() => {
        pingUrl('Backend', backendPingUrl);
        pingUrl('ML-Engine', ML_ENGINE_PING_URL);
      }, PING_INTERVAL_MS);
    }
    // ─────────────────────────────────────────────────────────────────────────
  });
}

startServer();