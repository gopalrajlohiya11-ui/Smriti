require('dotenv').config();
const axios = require('axios');

const WHATSAPP_API_URL = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

async function sendWhatsAppMessage(toNumber, messageBody) {
  try {
    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: 'whatsapp',
        to: toNumber,
        type: 'text',
        text: { body: messageBody }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Message sent:', response.data);
    return response.data;
  } catch (err) {
    console.error('❌ Failed to send WhatsApp message:', err.response?.data?.error?.message || err.message);
    return null;
  }
}

module.exports = { sendWhatsAppMessage };