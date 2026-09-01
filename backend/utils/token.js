const jwt = require('jsonwebtoken');
require('dotenv').config();

function generateGameToken(patientId) {
  return jwt.sign({ patientId }, process.env.JWT_SECRET, { expiresIn: '30m' });
}

function verifyGameToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null; // invalid or expired token
  }
}

function getPatientGameUrl(patientId) {
  const token = generateGameToken(patientId);
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${baseUrl}/patient?token=${token}`;
}

module.exports = { generateGameToken, verifyGameToken, getPatientGameUrl };