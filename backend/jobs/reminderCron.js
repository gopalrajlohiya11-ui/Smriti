const cron = require('node-cron');
const { sendWhatsAppMessage } = require('../services/whatsappService');
const Patient = require('../models/patient');
const Reminder = require('../models/Reminder');
const { getPatientGameUrl } = require('../utils/token');
const { saveChatMessage } = require('../services/aiService');
require('dotenv').config();

// 5+ Template variations for combined reminder messages
function getCombinedReminderMessage(name, reminderItems) {
  const listText = reminderItems.map(item => `• ${item}`).join('\n');

  const templates = [
    `Good morning, ${name}! ☀️ Smriti here with a gentle check-in for your day:\n\n${listText}\n\nWhenever you've taken care of these, just reply DONE to let me know! 🌸`,
    `Rise and shine, ${name}! 🌸 Here is what's on your health routine today:\n\n${listText}\n\nJust reply whenever you've completed them. Wishing you a peaceful day! 💚`,
    `Hello dear ${name}! Hope you had a restful sleep ☀️ Here are your gentle daily reminders:\n\n${listText}\n\nPlease reply DONE once you're done. Taking good care of you! 🌿`,
    `Hi ${name}, a warm hello from Smriti! 🌼 Just a caring note for today's routine:\n\n${listText}\n\nLet me know with a quick reply once taken. You're doing wonderful! 🌸`,
    `Good day, ${name}! ☀️ Hope you are feeling refreshed. Here are your scheduled reminders for today:\n\n${listText}\n\nReply DONE anytime once you've finished. Have a lovely morning! 💚`
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

// 5+ Template variations for separate game link invitations
function getSeparateGameMessage(name, gameUrl) {
  const gameTemplates = [
    `When you have a quiet moment, I've got a fun little memory game ready for you today! 🧩\n\nTap here to play: ${gameUrl}`,
    `Whenever you feel relaxed today, try today's cheerful brain puzzle! 🧠✨\n\nTap here to play: ${gameUrl}`,
    `I've set up a gentle North Eastern memory puzzle for you today, ${name}! 🌸\n\nTap here to play: ${gameUrl}`,
    `Take a relaxing pause and enjoy today's quick brain game 🌿\n\nTap here to play: ${gameUrl}`,
    `Here is today's fun memory challenge to keep your mind sharp and joyful, ${name}! 🌼\n\nTap here to play: ${gameUrl}`
  ];

  return gameTemplates[Math.floor(Math.random() * gameTemplates.length)];
}

function getReminderLabel(type) {
  switch (type) {
    case 'medicine': return '💊 Morning medicine';
    case 'hydration': return '💧 Fresh water / warm herbal tea';
    case 'activity': return '🚶 Gentle walk / light stretches';
    case 'appointment': return '🩺 Scheduled doctor check-in';
    default: return '🌸 Daily health check';
  }
}

async function sendDailyPatientReminders() {
  console.log('⏰ Starting dynamic reminder dispatch at', new Date().toLocaleString());
  const results = {
    timestamp: new Date().toISOString(),
    patientsChecked: 0,
    combinedRemindersSentCount: 0,
    gameLinksSentCount: 0,
    details: []
  };

  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const patients = await Patient.find();
    results.patientsChecked = patients.length;
    console.log(`📋 Found ${patients.length} patient(s) to check for reminders`);

    for (const patient of patients) {
      if (!patient.phoneNumber) continue;

      const pendingReminders = await Reminder.find({
        patientId: patient._id,
        acknowledged: false,
        scheduledTime: { $gte: startOfToday, $lte: endOfToday }
      });

      const firstName = patient.name.split(' ')[0] || patient.name;
      const patientSummary = {
        patientId: patient._id,
        patientName: patient.name,
        phoneNumber: patient.phoneNumber,
        combinedReminder: {},
        gameLink: {}
      };

      // 1. Process Combined Reminder Message
      if (pendingReminders.length > 0) {
        const reminderLabels = pendingReminders.map(r => getReminderLabel(r.type));
        const combinedMessage = getCombinedReminderMessage(firstName, reminderLabels);

        console.log(`📨 Sending 1 combined reminder message (${pendingReminders.length} items) to ${patient.name} (${patient.phoneNumber})`);
        await sendWhatsAppMessage(patient.phoneNumber, combinedMessage);
        
        results.combinedRemindersSentCount++;
        patientSummary.combinedReminder = {
          status: 'SENT_JUST_NOW',
          action: 'Sent 1 combined WhatsApp message',
          pendingCount: pendingReminders.length,
          pendingItems: reminderLabels,
          messagePreview: combinedMessage.split('\n')[0]
        };
        await saveChatMessage(patient._id, patient.phoneNumber, 'model', combinedMessage);
      } else {
        console.log(`ℹ️ No pending reminders for ${patient.name} (${patient.phoneNumber})`);
        patientSummary.combinedReminder = {
          status: 'SKIPPED_NO_PENDING_REMINDERS',
          action: 'Skipped',
          pendingCount: 0,
          reason: 'All scheduled reminders for today are already acknowledged or completed'
        };
      }

      // 2. Process Separate Game Link Message (Only once per calendar day)
      const lastGameDate = patient.lastGameLinkSentDate ? new Date(patient.lastGameLinkSentDate) : null;
      const alreadySentGameToday = lastGameDate && (
        lastGameDate.getFullYear() === startOfToday.getFullYear() &&
        lastGameDate.getMonth() === startOfToday.getMonth() &&
        lastGameDate.getDate() === startOfToday.getDate()
      );

      if (!alreadySentGameToday) {
        const gameUrl = getPatientGameUrl(patient._id.toString());
        const gameMessage = getSeparateGameMessage(firstName, gameUrl);

        console.log(`🧩 Sending separate daily game link message to ${patient.name} (${patient.phoneNumber})`);
        await sendWhatsAppMessage(patient.phoneNumber, gameMessage);

        results.gameLinksSentCount++;
        patient.lastGameLinkSentDate = new Date();
        await patient.save();

        patientSummary.gameLink = {
          status: 'SENT_JUST_NOW',
          action: 'Sent 1 separate game invitation WhatsApp message',
          gameUrl: gameUrl,
          sentAt: patient.lastGameLinkSentDate.toISOString(),
          messagePreview: gameMessage.split('\n')[0]
        };
        await saveChatMessage(patient._id, patient.phoneNumber, 'model', gameMessage);
      } else {
        console.log(`ℹ️ Game link already sent today to ${patient.name}`);
        patientSummary.gameLink = {
          status: 'SKIPPED_ALREADY_SENT_TODAY',
          action: 'Skipped',
          reason: `Game link was already dispatched earlier today (at ${lastGameDate.toLocaleTimeString()}). To re-test, reset flags via POST /api/test/reset-daily-flags/${patient.phoneNumber}`,
          lastSentAt: lastGameDate.toISOString()
        };
      }

      results.details.push(patientSummary);
    }

    return results;
  } catch (err) {
    console.error('❌ Error sending daily reminders:', err.message);
    results.error = err.message;
    return results;
  }
}

// Scheduled Cron: Runs every day at 9:00 AM (server time)
cron.schedule('0 9 * * *', () => {
  sendDailyPatientReminders();
});

console.log('📅 Reminder cron job initialized (runs daily at 9:00 AM)');

module.exports = {
  sendDailyPatientReminders,
  getCombinedReminderMessage,
  getSeparateGameMessage
};