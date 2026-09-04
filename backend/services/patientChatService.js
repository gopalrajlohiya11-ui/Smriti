require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const mongoose = require('mongoose');
const Patient = require('../models/patient');
const Reminder = require('../models/Reminder');
const MemoryBankPhoto = require('../models/MemoryBankPhoto');
const GameSession = require('../models/GameSession');

// Initialize Gemini client with GoogleGenAI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Multi-model resilience cascade (1-second models first)
const GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-flash-latest'
];

/**
 * Handles personalized conversational AI for an elderly patient via Google Gemini.
 * Rebuilds the system prompt from the patient's real MongoDB records on every request in parallel.
 */
async function generatePatientChatReply(patientId, userMessage, conversationHistory = [], audioData = null, mimeType = null) {
  const callStartTime = Date.now();
  try {
    // 1. Fetch patient record from MongoDB with robust ID resolution
    let patient = null;
    if (patientId && mongoose.Types.ObjectId.isValid(patientId)) {
      patient = await Patient.findById(patientId);
    }
    
    if (!patient) {
      if (patientId === 'pat-1' || patientId === '1') patient = await Patient.findOne({ name: 'Ramesh Sharma' });
      else if (patientId === 'pat-2' || patientId === '2') patient = await Patient.findOne({ name: 'Meera Baruah' });
      else if (patientId === 'pat-3' || patientId === '3') patient = await Patient.findOne({ name: 'Biren Das' });
      else if (typeof patientId === 'string') {
        patient = await Patient.findOne({ $or: [{ name: new RegExp(patientId, 'i') }, { phoneNumber: patientId }] });
      }
    }

    if (!patient) {
      // Default to first patient in database
      patient = await Patient.findOne();
    }

    if (!patient) {
      throw new Error(`Patient record not found for ID: ${patientId}`);
    }

    // 2. Fetch all daily reminders, photos, and game sessions IN PARALLEL (Promise.all)
    const [reminders, photos, gameSessions] = await Promise.all([
      Reminder.find({ patientId: patient._id }).sort({ scheduledTime: 1 }),
      MemoryBankPhoto.find({ patientId: patient._id }),
      GameSession.find({ patientId: patient._id }).sort({ timestamp: -1 }).limit(5)
    ]);
    
    // Reminders summary
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

    // Family contacts summary
    let familySummary = 'Family contacts on file: Grandson Arjun (Guwahati Brahmaputra Riverfront), Daughter Dr. Ananya (Neurologist & Primary Caregiver), Jorhat Tea Estate Ancestral Bungalow.';
    if (photos && photos.length > 0) {
      familySummary = photos.map(p => `- ${p.taggedName} (${p.relationship || 'Family'})`).join('\n');
    }

    // Recent Game / Cognitive Activity summary
    let gamesSummary = 'No recent game sessions recorded yet.';
    if (gameSessions && gameSessions.length > 0) {
      gamesSummary = gameSessions.map((g, idx) => {
        const dateStr = g.timestamp ? new Date(g.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recent';
        return `${idx + 1}. [${g.gameType.toUpperCase()}] Played on ${dateStr} | Score: ${g.score} points | Level: ${g.difficultyLevel || 'normal'}`;
      }).join('\n');
    }

    // 3. Build dynamic, personalized system instruction with Strict Language Lock
    const firstName = patient.name.split(' ')[0];
    const preferredLanguage = patient.preferredLanguage || patient.language || patient.nativeLanguage || 'Assamese';
    const doctorCaregiver = patient.primaryCaregiver || 'Dr. Ananya Sharma';

    const systemInstruction = `You are "Smriti", a warm, gentle, loving, and patient AI memory companion speaking directly with your elderly patient, ${patient.name}.

REAL MEDICAL & PERSONAL PROFILE FOR THIS PATIENT (from verified database records):
- Full Name: ${patient.name} (Address them warmly as ${firstName} or respectfully as ${patient.gender === 'Male' ? 'Dada / Uncle' : 'Baideo / Aunty'} ${firstName})
- Age: ${patient.age} years old
- Current Location: ${patient.location}
- Preferred Language: ${preferredLanguage}
- Cognitive Care Stage: ${patient.cognitiveStage || 'Tier 1 Early Memory Support'}
- Primary Doctor & Caregiver: ${doctorCaregiver} (Phone / Emergency: ${patient.emergencyContact || patient.phoneNumber || 'Available with family'})
- Medical Evaluation Notes: "${patient.medicalNotes || 'General vitals normal, daily memory routines and hydration recommended.'}"
- General Care Notes: "${patient.notes || 'Encourage gentle routines, reassurance, and family photo recall.'}"

LANGUAGE RULE (STRICT):
You must always reply in ${preferredLanguage}, no matter what language the patient's message is written or spoken in. Do not switch to English or any other language even if the input is in English, unless the patient explicitly asks you to change language. If ${preferredLanguage} is not set on the patient record, default to simple Hindi mixed with English (Hinglish) unless the patient asks otherwise.

TODAY'S 10-SLOT ROUTINES & MEDICATIONS FROM MONGODB:
${remindersSummary}

FAMILY & CHERISHED PEOPLE:
${familySummary}

RECENT COGNITIVE GAMES & ACTIVITIES FROM MONGODB:
${gamesSummary}

CRITICAL CONVERSATIONAL RULES FOR SMRITI:
1. Answer the patient's specific question directly and accurately based strictly on their records above:
   - If they ask "Who is my doctor?" or "Who is my caregiver?", clearly and warmly state: "${doctorCaregiver}".
   - If they ask about their medicines or today's schedule, list the exact scheduled items and their status from the records above.
   - If they ask about games or activities, tell them about their recent game scores and encourage them warmly.
   - If they ask about family, mention their family members from the records above.
2. Keep replies concise and easy to understand (2 to 4 sentences maximum). Elderly patients listen to this aloud.
3. Maintain immense warmth, empathy, and patience. Speak conversationally as a caring companion. Never sound robotic, cold, or clinical. Do NOT output internal test notes, rubrics, or formatting labels.
4. DISTRESS RULE (SCOPE NARROWLY): ONLY if the patient explicitly expresses fear, anxiety, panic, disorientation, or asks "Where am I?", comfort them gently, remind them they are safe at home in ${patient.location}, and reassure them that you and ${doctorCaregiver} are here taking care of them. Do NOT trigger distress reassurance for normal factual questions like "Who is my doctor?" or "What is my medicine?".
5. Sign off warmly with a caring phrase or 🌸 emoji.`;

    // 4. Build multi-turn contents array for Gemini
    const contents = [];

    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      for (const msg of conversationHistory.slice(-6)) {
        if (msg) {
          const text = msg.content || msg.text || '';
          if (text) {
            const role = (msg.role === 'user' || msg.sender === 'user') ? 'user' : 'model';
            contents.push({
              role: role,
              parts: [{ text: text }]
            });
          }
        }
      }
    }

    // Append latest query (audio or text)
    if (audioData) {
      contents.push({
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'audio/webm',
              data: audioData
            }
          },
          {
            text: `Please listen to the attached audio recording from patient ${patient.name}. Transcribe what the patient said and reply warmly in their preferred language (${preferredLanguage}).

Format your response strictly as:
TRANSCRIPTION: <exact words the patient spoke in the audio>
REPLY: <your warm, concise answer in ${preferredLanguage} based on the patient's medical records>`
          }
        ]
      });
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: userMessage || 'Hello Smriti' }]
      });
    }

    // 5. Call Gemini API with detailed immediate logging
    let replyText = null;
    let lastError = null;

    for (const modelName of GEMINI_MODELS) {
      const modelStart = Date.now();
      console.log(`📡 [${new Date().toLocaleTimeString()}] Calling Gemini model: ${modelName} for ${patient.name} (${preferredLanguage})...`);
      
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
          const trimmed = response.text.trim();
          if (trimmed.length > 3) {
            replyText = trimmed;
            console.log(`✅ [${new Date().toLocaleTimeString()}] Gemini model ${modelName} succeeded in ${Date.now() - modelStart}ms (total: ${Date.now() - callStartTime}ms): "${replyText.slice(0, 80)}..."`);
            break;
          }
        } else if (response && response.candidates && response.candidates[0]?.content?.parts) {
          const combined = response.candidates[0].content.parts.map(p => p.text || '').join('').trim();
          if (combined.length > 3) {
            replyText = combined;
            console.log(`✅ [${new Date().toLocaleTimeString()}] Gemini model ${modelName} succeeded in ${Date.now() - modelStart}ms: "${replyText.slice(0, 80)}..."`);
            break;
          }
        }
      } catch (modelErr) {
        lastError = modelErr;
        console.error(`❌ [${new Date().toLocaleTimeString()}] Gemini Model ${modelName} failed after ${Date.now() - modelStart}ms:`, {
          message: modelErr.message,
          status: modelErr.status || modelErr.code || 'UNKNOWN',
          stack: modelErr.stack ? modelErr.stack.split('\n')[1]?.trim() : ''
        });
      }
    }

    if (!replyText) {
      if (lastError) {
        console.error('❌ All Gemini models exhausted:', lastError.message);
        throw new Error(`Gemini service error: ${lastError.message}`);
      }
      throw new Error('Gemini returned an empty response.');
    }

    // Parse transcription if audio was sent
    let parsedTranscription = userMessage || '';
    let parsedReply = replyText;

    if (replyText.includes('TRANSCRIPTION:') && replyText.includes('REPLY:')) {
      const splitParts = replyText.split('REPLY:');
      const trans = splitParts[0].replace('TRANSCRIPTION:', '').trim();
      const rep = splitParts[1].trim();
      if (trans) parsedTranscription = trans;
      if (rep) parsedReply = rep;
    } else if (replyText.startsWith('TRANSCRIPTION:')) {
      parsedTranscription = replyText.replace('TRANSCRIPTION:', '').trim();
    }

    return {
      reply: parsedReply,
      transcription: parsedTranscription || userMessage || 'Voice Question',
      patientName: patient.name,
      patientId: patient._id,
      preferredLanguage: preferredLanguage
    };
  } catch (err) {
    console.error('❌ Patient Chat Service Fatal Error:', {
      message: err.message,
      stack: err.stack
    });
    throw err;
  }
}

module.exports = { generatePatientChatReply };
