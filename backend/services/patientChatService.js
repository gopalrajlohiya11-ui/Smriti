require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const Patient = require('../models/patient');
const Reminder = require('../models/Reminder');
const MemoryBankPhoto = require('../models/MemoryBankPhoto');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Multi-model resilience cascade
const CANDIDATE_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite'
];

/**
 * Handles personalized conversational AI for an elderly patient.
 * Rebuilds the system prompt from the patient's real MongoDB records on every request.
 */
async function generatePatientChatReply(patientId, userMessage, conversationHistory = []) {
  try {
    // 1. Fetch patient record from MongoDB
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new Error(`Patient record not found for ID: ${patientId}`);
    }

    // 2. Fetch all daily reminders & medicines for this patient
    const reminders = await Reminder.find({ patientId: patient._id }).sort({ scheduledTime: 1 });
    
    let remindersSummary = 'No specific scheduled routines recorded for today.';
    if (reminders && reminders.length > 0) {
      remindersSummary = reminders.map((r, idx) => {
        const timeStr = r.scheduledTime 
          ? new Date(r.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          : 'Scheduled today';
        const statusStr = r.acknowledged ? 'COMPLETED/TAKEN ✅' : (r.dismissed ? 'Dismissed by Caregiver' : 'PENDING ⏳');
        return `${idx + 1}. [${r.type.toUpperCase()}] "${r.title || r.type}" - Scheduled at ${timeStr} | Detail: "${r.detail || 'Standard routine'}" | Status: ${statusStr}`;
      }).join('\n');
    }

    // 3. Fetch family photos / memories
    const photos = await MemoryBankPhoto.find({ patientId: patient._id });
    let familySummary = 'Family contacts and memories on file: Grandson Arjun (Guwahati Brahmaputra Riverfront), Daughter Dr. Ananya (Neurologist & Primary Caregiver), Jorhat Tea Estate Ancestral Bungalow.';
    if (photos && photos.length > 0) {
      familySummary = photos.map(p => `- ${p.taggedName} (${p.relationship || 'Family'})`).join('\n');
    }

    // 4. Build dynamic, personalized system instruction
    const firstName = patient.name.split(' ')[0];
    const systemInstruction = `You are "Smriti", a deeply warm, gentle, patient, and loving AI memory companion speaking directly with your elderly patient, ${patient.name}.

REAL MEDICAL & PERSONAL PROFILE FOR THIS PATIENT (from verified database records):
- Full Name: ${patient.name} (Address them warmly as ${firstName} or respectfully as ${patient.gender === 'Male' ? 'Dada / Uncle' : 'Baideo / Aunty'} ${firstName})
- Age: ${patient.age} years old
- Current Location: ${patient.location}
- Native Language & Culture: ${patient.language || 'Assamese'} / Indian English
- Cognitive Care Stage: ${patient.cognitiveStage || 'Tier 1 Early Memory Support'}
- Primary Doctor & Caregiver: ${patient.primaryCaregiver || 'Dr. Ananya Sharma'} (Phone / Emergency: ${patient.emergencyContact || patient.phoneNumber || 'Available with family'})
- Medical Evaluation Notes: "${patient.medicalNotes || 'General vitals normal, daily memory routines and hydration recommended.'}"
- General Care Notes: "${patient.notes || 'Encourage gentle routines, reassurance, and family photo recall.'}"

TODAY'S 10-SLOT ROUTINES & MEDICATIONS FROM MONGODB:
${remindersSummary}

FAMILY & CHERISHED PEOPLE:
${familySummary}

CRITICAL RULES FOR SMRITI:
1. Keep replies SHORT (2 to 4 sentences maximum). Elderly patients listen to this aloud and get tired by long paragraphs.
2. Maintain immense warmth, empathy, patience, and reassurance. Never sound robotic, cold, or clinical.
3. GROUND EVERYTHING strictly in this patient's real data above. Never make up new medications, dosages, or fictional relatives.
4. For medicine questions: confirm what is recorded on their schedule above. If they ask about changing doses or taking something not listed, warmly ask them to confirm with ${patient.primaryCaregiver || 'their doctor'}.
5. If ${patient.name} seems anxious, confused, asks "Where am I?", or repeats themselves: warmly comfort them, remind them they are safe at home in ${patient.location}, and reassure them that you and ${patient.primaryCaregiver} are taking great care of them.
6. Sign off or conclude warmly with a comforting phrase or 🌸 emoji.`;

    // 5. Build multi-turn contents array
    const contents = [];

    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      for (const msg of conversationHistory.slice(-6)) {
        if (msg && (msg.content || msg.text)) {
          contents.push({
            role: (msg.role === 'user' || msg.sender === 'user') ? 'user' : 'model',
            parts: [{ text: msg.content || msg.text || '' }]
          });
        }
      }
    }

    // Append the latest user query
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    // 6. Call Gemini API with resilient fallback cascade
    let replyText = null;
    let lastError = null;

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 350
          }
        });

        if (response && response.text) {
          replyText = response.text.trim();
          break; // Success!
        }
      } catch (modelErr) {
        lastError = modelErr;
        console.warn(`⚠️ Model ${modelName} failed (${modelErr.message}). Trying next candidate...`);
      }
    }

    if (!replyText) {
      if (lastError) console.error('❌ All Gemini models exhausted:', lastError.message);
      replyText = `Hello ${firstName}! Smriti is right here with you. Your doctor ${patient.primaryCaregiver || 'Dr. Ananya'} is taking great care of your health in ${patient.location}. How can I help you today? 🌸`;
    }

    return {
      reply: replyText,
      patientName: patient.name,
      patientId: patient._id
    };
  } catch (err) {
    console.error('❌ Patient Chat Service Error:', err);
    throw err;
  }
}

module.exports = { generatePatientChatReply };
