const express = require('express');
const router = express.Router();
const { getAIReply, saveChatMessage } = require('../services/aiService');
const { sendWhatsAppMessage } = require('../services/whatsappService');
const Patient = require('../models/patient');
const Reminder = require('../models/Reminder');
require('dotenv').config();

// 5+ Distinct variations for warm acknowledgment confirmations per category
function getWarmAcknowledgmentReply(type, name) {
  const patientName = name || 'Ramesh';

  const medicineConfirmations = [
    `That's wonderful, ${patientName}! Taking your medicine on time really helps your health. Proud of you! 💚`,
    `Great job, ${patientName}! Taking your tablets on time keeps you strong and healthy. Proud of you! 🌸`,
    `So glad to hear that, ${patientName}! You're doing wonderful taking care of your health today 💚`,
    `Thank you for letting me know, ${patientName}! Your medicine is all set for today. Have a peaceful day ☀️`,
    `Wonderful news, ${patientName}! Staying regular with your medicine makes a big difference. Keep it up! 🌿`
  ];

  const hydrationConfirmations = [
    `So good to hear, ${patientName}! Staying well hydrated keeps your mind fresh and bright 💧✨`,
    `Wonderful, ${patientName}! Drinking fresh water or warm tea does wonders for your energy. Have a refreshed day! 🍵`,
    `Great job, ${patientName}! A refreshing sip keeps you feeling light and energized 💧🌸`,
    `Thank you, ${patientName}! Staying hydrated is wonderful for your health today 🍵💚`,
    `So happy to hear, ${patientName}! Keep sipping water and tea through the day to stay fresh 💧✨`
  ];

  const activityConfirmations = [
    `Wonderful, ${patientName}! A little movement does wonders for your body and spirit. Proud of you! 🌿`,
    `Great job, ${patientName}! Gentle daily activity keeps you active and cheerful. Keep it up! 🌸`,
    `So proud of you, ${patientName}! Enjoying a gentle walk or stretches brings so much peace to the mind 🚶‍♂️💚`,
    `That is fantastic, ${patientName}! Daily movement keeps your body relaxed and healthy. Well done! 🌿`,
    `Wonderful effort, ${patientName}! Fresh air and gentle movement make for a joyful day 🌸✨`
  ];

  const appointmentConfirmations = [
    `Thank you for letting me know, ${patientName}! Hope your check-in went smoothly and comfortably 🩺💚`,
    `Wonderful, ${patientName}! Thank you for completing your appointment. Wishing you continuous good health! 🌸`,
    `Glad to hear that, ${patientName}! Your health check-in is complete. Take rest and have a peaceful day 🩺✨`,
    `Thank you, ${patientName}! Checking in with your doctor is so important. Proud of your commitment! 💚`,
    `So glad that is taken care of, ${patientName}! Wishing you health and happiness today 🌸`
  ];

  const generalConfirmations = [
    `That's wonderful, ${patientName}! You are doing so well with your daily routine today. Proud of you! 💚`,
    `Thank you for letting me know, ${patientName}! You are doing fantastic today. Wishing you a peaceful day! 🌸`,
    `So glad to hear, ${patientName}! I have recorded that for you. Keep smiling and taking care! 🌼`,
    `Wonderful job, ${patientName}! Taking care of your routine step by step is inspiring 🌿💚`,
    `Thank you dear ${patientName}! Everything is noted. Wishing you a calm and joyful afternoon ☀️🌸`
  ];

  switch (type) {
    case 'medicine':
      return medicineConfirmations[Math.floor(Math.random() * medicineConfirmations.length)];
    case 'hydration':
      return hydrationConfirmations[Math.floor(Math.random() * hydrationConfirmations.length)];
    case 'activity':
      return activityConfirmations[Math.floor(Math.random() * activityConfirmations.length)];
    case 'appointment':
      return appointmentConfirmations[Math.floor(Math.random() * appointmentConfirmations.length)];
    default:
      return generalConfirmations[Math.floor(Math.random() * generalConfirmations.length)];
  }
}

// STEP A: Webhook verification (Meta calls this once when setting up the webhook)
router.get('/incoming', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('✅ Webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// STEP B: Receiving incoming messages, updating reminder status, and multi-turn conversational reply
router.post('/incoming', async (req, res) => {
  console.log('🔍 RAW PAYLOAD:', JSON.stringify(req.body, null, 2));
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (message) {
      // Extract from number (digits only)
      const fromNumber = message.from ? String(message.from).replace(/\D/g, '') : '';
      
      // Extract incoming message text across various WhatsApp message types
      const incomingText = (
        message.text?.body ||
        message.interactive?.button_reply?.title ||
        message.button?.text ||
        message.caption ||
        ''
      ).trim();

      console.log(`📩 Incoming message from ${fromNumber}: "${incomingText}"`);

      // 1. Locate patient in MongoDB by phone number
      let patient = null;
      if (fromNumber) {
        patient = await Patient.findOne({
          $or: [
            { phoneNumber: fromNumber },
            { phoneNumber: `+${fromNumber}` },
            { phoneNumber: { $regex: fromNumber.slice(-10) + '$' } }
          ]
        });
      }

      const firstName = patient?.name?.split(' ')[0] || '';

      // 2. Check for acknowledgment / completion keywords
      const isCompletionReply = /\b(done|yes|completed|taken|finished|did it|ho gaya|korisu|got it|took|completed it|already done)\b/i.test(incomingText);

      let replyText = '';

      if (isCompletionReply && patient) {
        // Query specific reminder type if mentioned, or earliest pending
        let query = { patientId: patient._id, acknowledged: false };
        if (/medicine|med|pill|tablet|rx/i.test(incomingText)) {
          query.type = 'medicine';
        } else if (/water|hydrat|tea|liquid|drink/i.test(incomingText)) {
          query.type = 'hydration';
        } else if (/walk|exercise|activity|stroll|yoga/i.test(incomingText)) {
          query.type = 'activity';
        } else if (/appointment|doctor|checkup|clinic/i.test(incomingText)) {
          query.type = 'appointment';
        }

        let reminderToAcknowledge = await Reminder.findOne(query).sort({ scheduledTime: 1 });
        if (!reminderToAcknowledge && query.type) {
          // fallback to any earliest pending reminder
          reminderToAcknowledge = await Reminder.findOne({ patientId: patient._id, acknowledged: false }).sort({ scheduledTime: 1 });
        }

        if (reminderToAcknowledge) {
          reminderToAcknowledge.acknowledged = true;
          await reminderToAcknowledge.save();
          console.log(`✅ Marked reminder (${reminderToAcknowledge.type}) as acknowledged for ${patient.name}`);
          
          replyText = getWarmAcknowledgmentReply(reminderToAcknowledge.type, firstName);
        } else {
          replyText = getWarmAcknowledgmentReply('general', firstName);
        }

        // Save turns into ChatMessage history
        await saveChatMessage(patient._id, fromNumber, 'user', incomingText);
        await saveChatMessage(patient._id, fromNumber, 'model', replyText);
      } else {
        // General conversational message: Generate context-aware reply using Gemini multi-turn memory
        replyText = await getAIReply(
          incomingText || 'Hello',
          patient ? patient._id : null,
          firstName,
          fromNumber
        );
      }

      // Safe fallback guarantee: ensure replyText is never empty
      if (!replyText || !replyText.trim()) {
        replyText = `Hello ${firstName || 'there'}! Smriti here. I received your message. Wishing you a peaceful and joyful day! 🌸`;
      }

      // Send the reply back to the patient via WhatsApp
      if (fromNumber) {
        console.log(`📤 Sending WhatsApp reply to ${fromNumber}: "${replyText}"`);
        await sendWhatsAppMessage(fromNumber, replyText);
      }
    }

    res.sendStatus(200); // Meta expects a fast 200 response
  } catch (err) {
    console.error('❌ Webhook processing error:', err.message);
    res.sendStatus(200);
  }
});

module.exports = router;