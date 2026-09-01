require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const ChatMessage = require('../models/ChatMessage');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generates context-aware conversational reply using multi-turn memory from MongoDB.
 */
async function getAIReply(userMessage, patientId = null, patientName = '', phoneNumber = '') {
  try {
    let contents = [];

    // If patientId is provided, fetch recent conversation history (last 8 messages)
    if (patientId) {
      const history = await ChatMessage.find({ patientId })
        .sort({ createdAt: -1 })
        .limit(8);

      // Reverse so it is chronological (oldest to newest)
      const chronological = history.reverse();

      // Format into @google/genai multi-turn format
      for (const msg of chronological) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      }
    }

    // Append the current incoming user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: contents,
      config: {
        systemInstruction: `You are Smriti, a warm, caring, patient, and empathetic cognitive and memory assistance companion for elderly dementia patients in India${patientName ? ` (you are talking to ${patientName})` : ''}. Always stay in character as Smriti. Keep replies short (1-2 sentences), very simple, respectful, and reassuring. Remember what the patient told you previously in this conversation.`
      }
    });

    const replyText = response.text || `Hello ${patientName || ''}! Smriti here. I'm right here with you. How can I help you today? 🌸`;

    // Persist this turn to conversation history if patientId & phoneNumber exist
    if (patientId && phoneNumber) {
      await ChatMessage.create([
        {
          patientId,
          phoneNumber,
          role: 'user',
          text: userMessage
        },
        {
          patientId,
          phoneNumber,
          role: 'model',
          text: replyText
        }
      ]);
    }

    return replyText;
  } catch (err) {
    console.error('❌ AI reply error:', err.message);
    return `Hello${patientName ? ` ${patientName}` : ''}! Smriti here. I'm right here with you. How can I help you today? 🌸`;
  }
}

/**
 * Saves a system / confirmation message sent to the patient into conversation history.
 */
async function saveChatMessage(patientId, phoneNumber, role, text) {
  try {
    if (patientId && phoneNumber && text) {
      await ChatMessage.create({
        patientId,
        phoneNumber,
        role: role === 'user' ? 'user' : 'model',
        text
      });
    }
  } catch (err) {
    console.error('⚠️ Error saving chat message:', err.message);
  }
}

module.exports = { getAIReply, saveChatMessage };