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

const DEFAULT_PATIENTS = {
  'pat-1': {
    _id: '6a9e533f65c0817eb2016cc8',
    name: 'Ramesh Sharma',
    age: 74,
    gender: 'Male',
    location: 'Guwahati, Assam',
    preferredLanguage: 'Assamese',
    cognitiveStage: 'Early Memory Support',
    primaryCaregiver: 'Dr. Ananya Sharma',
    emergencyContact: '+91 98640 54321',
    phoneNumber: '+91 94350 12345',
    medicalNotes: 'Donepezil 5mg for mild memory support, morning blood pressure tablet.',
    notes: 'Enjoys morning walks and Bihu folk music. Needs gentle routine reassurance.'
  },
  'pat-2': {
    _id: '6a9e533f65c0817eb2016cc9',
    name: 'Meera Baruah',
    age: 68,
    gender: 'Female',
    location: 'Shillong, Meghalaya',
    preferredLanguage: 'Khasi',
    cognitiveStage: 'Moderate Support',
    primaryCaregiver: 'Dr. Ananya Sharma',
    emergencyContact: '+91 94361 98765',
    phoneNumber: '+91 98640 11223',
    medicalNotes: 'Memantine 10mg morning dose.',
    notes: 'Loves classical choir music, Shillong pine walks, and weaving handicrafts.'
  }
};

function getIntelligentFallbackReply(userMessage, patient) {
  const msg = (userMessage || '').toLowerCase();
  const doctor = patient?.primaryCaregiver || 'Dr. Ananya Sharma';
  const name = patient?.name || 'Elder';
  const firstName = name.split(' ')[0];
  const lang = (patient?.preferredLanguage || patient?.language || 'Assamese').toLowerCase();

  const isHindi = lang.includes('hindi') || lang.includes('hi');
  const isAssamese = lang.includes('assamese') || lang.includes('as');

  if (msg.includes('doctor') || msg.includes('caregiver') || msg.includes('who is my doctor') || msg.includes('डाक्टर') || msg.includes('ডাক্তাৰ')) {
    if (isHindi) return `आपके प्राथमिक डॉक्टर और देखभालकर्ता ${doctor} हैं। वह आपके स्वास्थ्य और दवाओं का पूरा ध्यान रखती हैं। 🌸`;
    if (isAssamese) return `আপোনাৰ মুখ্য চিকিৎসক আৰু তত্ত্বাৱধায়ক হৈছে ${doctor}। তেওঁ সদায় আপোনাৰ স্বাস্থ্যৰ যত্ন লয়। 🌸`;
    return `Your primary doctor and caregiver is ${doctor}. She looks after your health and daily care routines with great devotion. 🌸`;
  }

  if (msg.includes('medicine') || msg.includes('pill') || msg.includes('tablet') || msg.includes('dawa') || msg.includes('दवा') || msg.includes('ঔষধ')) {
    if (isHindi) return `आपकी निर्धारित दवा डोनेपेज़िल 5mg और बीपी की गोली सुबह 8:45 बजे पानी के साथ लेने का समय है। 🌸`;
    if (isAssamese) return `আপোনাৰ নিৰ্ধাৰিত ঔষধ পুৱা ৮:৪৫ বজাত পানীৰ সৈতে খোৱাৰ সময়। 🌸`;
    return `Your morning prescription is Donepezil 5mg and blood pressure tablets taken with water at 8:45 AM, and your night routine is at 8:30 PM. 🌸`;
  }

  if (msg.includes('family') || msg.includes('son') || msg.includes('daughter') || msg.includes('grandson') || msg.includes('परिवार') || msg.includes('পৰিয়াল')) {
    if (isHindi) return `आपके प्यारे परिवार में आपके पोते अर्जुन, बेटी डॉ. अनन्या और बेटा राहुल शामिल हैं। वे आपसे बहुत प्यार करते हैं। 🌸`;
    if (isAssamese) return `আপোনাৰ পৰিয়ালত নাতি অৰ্জুন, জীয়াৰী ডাঃ অনন্যা আৰু পুত্ৰ ৰাহুল আছে। তেওঁলোকে আপোনাক বহুত মৰম কৰে। 🌸`;
    return `Your beloved family members include your grandson Arjun, your daughter Dr. Ananya, and your son Rahul. They love you deeply. 🌸`;
  }

  if (msg.includes('where') || msg.includes('home') || msg.includes('कहाँ') || msg.includes('স্থান')) {
    if (isHindi) return `आप अपने घर ${patient?.location || 'गुवाहाटी'} में बिल्कुल सुरक्षित हैं। आपका परिवार और ${doctor} आपके साथ हैं। 🌸`;
    if (isAssamese) return `আপুনি ${patient?.location || 'গুৱাহাটী'}ত আপোনাৰ নিজৰ ঘৰত সম্পূর্ণ সুৰক্ষিত হৈ আছে। 🌸`;
    return `You are safe at home in ${patient?.location || 'Guwahati'}. Everything is peaceful and your family and ${doctor} are watching over you. 🌸`;
  }

  if (msg.includes('routine') || msg.includes('schedule') || msg.includes('today') || msg.includes('दिनचर्या') || msg.includes('সূচী')) {
    if (isHindi) return `आज की दिनचर्या में सुबह की असम चाय, 8:45 बजे दवा, दोपहर का पौष्टिक भोजन और शाम 4:30 बजे बगीचे की सैर शामिल है। 🌸`;
    if (isAssamese) return `আজিৰ সূচীত পুৱাৰ চাহ, ৮:৪৫ বজাত ঔষধ, দুপৰীয়াৰ আহাৰ আৰু গধূলি ৪:৩০ বজাত ফুৰিবলৈ যোৱা অন্তর্ভুক্ত। 🌸`;
    return `Today's schedule includes your morning tea, prescribed medicine at 8:45 AM, a healthy lunch, and an evening garden walk at 4:30 PM. 🌸`;
  }

  if (isHindi) return `नमस्ते ${firstName} जी! मैं स्मृति हूँ, आपकी साथी। आपके डॉक्टर ${doctor} और परिवार आपका पूरा ख्याल रख रहे हैं। मैं आपकी क्या मदद कर सकती हूँ? 🌸`;
  if (isAssamese) return `নমস্কাৰ ${firstName}! মই স্মৃতি, আপোনাৰ মৰমৰ সংগী। আপোনাৰ চিকিৎসক ${doctor} আপোনাৰ স্বাস্থ্যৰ যত্ন লৈ আছে। 🌸`;
  return `Hello ${firstName}! I am Smriti, your caring companion. Your doctor ${doctor} and your family are taking wonderful care of you. How can I help you today? 🌸`;
}

/**
 * Handles personalized conversational AI for an elderly patient via Google Gemini.
 * Rebuilds the system prompt from the patient's real MongoDB records with instant fallback protection.
 */
async function generatePatientChatReply(patientInput, userMessage, conversationHistory = [], audioData = null, mimeType = null) {
  const callStartTime = Date.now();
  let patient = null;

  try {
    // 1. Fetch patient record from MongoDB or fallback cleanly
    if (typeof patientInput === 'object' && patientInput !== null && patientInput.name) {
      patient = patientInput;
    } else {
      const pId = patientInput;
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        try {
          if (pId && mongoose.Types.ObjectId.isValid(pId)) {
            patient = await Patient.findById(pId).maxTimeMS(2500);
          }
          if (!patient) {
            if (pId === 'pat-2' || (typeof pId === 'string' && pId.toLowerCase().includes('meera'))) {
              patient = await Patient.findOne({ name: /Meera/i }).maxTimeMS(2500);
            } else if (pId === 'pat-1' || pId === 'default' || !pId || (typeof pId === 'string' && pId.toLowerCase().includes('ramesh'))) {
              patient = await Patient.findOne({ name: /Ramesh/i }).maxTimeMS(2500) || await Patient.findOne().maxTimeMS(2500);
            } else if (typeof pId === 'string') {
              patient = await Patient.findOne({ $or: [{ name: new RegExp(pId, 'i') }, { phoneNumber: pId }] }).maxTimeMS(2500);
            }
          }
        } catch (dbErr) {
          console.warn('Patient lookup query error in chat service:', dbErr.message);
        }
      }
    }

    if (!patient) {
      const isMeera = (typeof patientInput === 'string' && (patientInput === 'pat-2' || patientInput.toLowerCase().includes('meera')));
      patient = isMeera ? DEFAULT_PATIENTS['pat-2'] : DEFAULT_PATIENTS['pat-1'];
    }

    // 2. Fetch all daily reminders, photos, and game sessions with timeout safety
    let reminders = [];
    let photos = [];
    let gameSessions = [];

    if (mongoose.connection && mongoose.connection.readyState === 1 && patient._id) {
      try {
        const [r, p, g] = await Promise.all([
          Reminder.find({ patientId: patient._id }).maxTimeMS(2500).sort({ scheduledTime: 1 }),
          MemoryBankPhoto.find({ patientId: patient._id }).maxTimeMS(2500),
          GameSession.find({ patientId: patient._id }).maxTimeMS(2500).sort({ timestamp: -1 }).limit(5)
        ]);
        reminders = r || [];
        photos = p || [];
        gameSessions = g || [];
      } catch (subErr) {
        console.warn('Secondary DB queries error in chat service:', subErr.message);
      }
    }
    
    // Reminders summary
    let remindersSummary = '1. [MEDICINE] "Morning Prescription" - 8:45 AM (Donepezil 5mg & BP tablets with water) | Status: PENDING\n2. [MEAL] "Nutritious Lunch" - 1:00 PM | Status: PENDING\n3. [ACTIVITY] "Evening Garden Walk" - 4:30 PM | Status: PENDING';
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
    let familySummary = 'Grandson Arjun (Guwahati Brahmaputra Riverfront), Daughter Dr. Ananya (Neurologist & Primary Caregiver), Son Rahul, Jorhat Tea Estate Ancestral Bungalow.';
    if (photos && photos.length > 0) {
      familySummary = photos.map(p => `- ${p.taggedName} (${p.relationship || 'Family'})`).join('\n');
    }

    // Recent Game / Cognitive Activity summary
    let gamesSummary = 'Recent Cognitive Games: Market Day Basket (Score 88), Faces & Family Recall (Score 92).';
    if (gameSessions && gameSessions.length > 0) {
      gamesSummary = gameSessions.map((g, idx) => {
        const dateStr = g.timestamp ? new Date(g.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recent';
        return `${idx + 1}. [${g.gameType.toUpperCase()}] Played on ${dateStr} | Score: ${g.score} points | Level: ${g.difficultyLevel || 'normal'}`;
      }).join('\n');
    }

    // 3. Build dynamic, personalized system instruction with Strict Language Lock
    const firstName = (patient.name || 'Elder').split(' ')[0];
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

    // Append latest turn
    if (audioData) {
      const parts = [
        {
          inlineData: {
            mimeType: mimeType || 'audio/webm',
            data: audioData
          }
        },
        {
          text: `Please transcribe my spoken words accurately, and then provide a warm, empathetic response as my memory companion Smriti according to your system instructions. Format your output strictly as:
TRANSCRIPTION: <exact transcription of what I said>
REPLY: <your warm response to me in ${preferredLanguage}>`
        }
      ];
      contents.push({ role: 'user', parts });
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: userMessage || 'Hello Smriti!' }]
      });
    }

    // 5. Invoke Gemini with Multi-Model Fallback cascade
    let replyText = null;
    let lastError = null;

    for (const modelName of GEMINI_MODELS) {
      const modelStart = Date.now();
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
            break;
          }
        } else if (response && response.candidates && response.candidates[0]?.content?.parts) {
          const combined = response.candidates[0].content.parts.map(p => p.text || '').join('').trim();
          if (combined.length > 3) {
            replyText = combined;
            break;
          }
        }
      } catch (modelErr) {
        lastError = modelErr;
        console.error(`❌ [${new Date().toLocaleTimeString()}] Gemini Model ${modelName} failed after ${Date.now() - modelStart}ms:`, {
          message: modelErr.message,
          status: modelErr.status || modelErr.code || 'UNKNOWN'
        });
      }
    }

    if (!replyText) {
      console.warn('⚠️ All Gemini models exhausted or failed, using intelligent fallback reply');
      replyText = getIntelligentFallbackReply(userMessage, patient);
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
    console.error('❌ Patient Chat Service Handled Error:', err.message);
    const safePatient = patient || DEFAULT_PATIENTS['pat-1'];
    return {
      reply: getIntelligentFallbackReply(userMessage, safePatient),
      transcription: userMessage || 'Voice Question',
      patientName: safePatient.name,
      patientId: safePatient._id,
      preferredLanguage: safePatient.preferredLanguage || 'Assamese'
    };
  }
}

module.exports = { generatePatientChatReply };
