require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


// Test route to confirm the server is alive
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Privacy Policy route for Meta App / Hackathon project
app.get('/privacy-policy', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Privacy Policy - Cognitive Assistance App</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; }
        h1 { color: #1a73e8; }
        h2 { color: #202124; margin-top: 24px; }
        .disclaimer { background: #f1f3f4; padding: 12px 16px; border-radius: 8px; font-style: italic; }
      </style>
    </head>
    <body>
      <h1>Privacy Policy</h1>
      <p class="disclaimer">This is a prototype privacy policy for a Hackathon Cognitive Assistance project.</p>
      
      <h2>1. Information We Collect</h2>
      <p>In order to provide cognitive assistance services, we collect:</p>
      <ul>
        <li><strong>WhatsApp Messages:</strong> Inbound and outbound messages sent to and from our automated WhatsApp assistant.</li>
        <li><strong>Health Reminder Data:</strong> Schedules, dosage reminders, and patient routine notifications.</li>
        <li><strong>Game Scores & Cognitive Metrics:</strong> Scores and activity logs from cognitive puzzle games.</li>
      </ul>

      <h2>2. How We Use Information</h2>
      <p>The collected information is used solely for the purpose of operating, maintaining, and delivering cognitive assistance features to patients and caregivers. We do not sell, rent, or share personal data with third parties.</p>

      <h2>3. Data Retention & Security</h2>
      <p>Data is stored securely in our database and accessed only as necessary to provide service functionality.</p>

      <h2>4. Contact Us</h2>
      <p>If you have any questions regarding this privacy policy or your data, please contact us at: <a href="mailto:support@example.com">support@example.com</a></p>
    </body>
    </html>
  `);
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Import routes
const caregiverRoutes = require('./routes/caregiverRoutes');
const patientRoutes = require('./routes/patientRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
app.use('/api/caregivers', caregiverRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/reminders', reminderRoutes);

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});