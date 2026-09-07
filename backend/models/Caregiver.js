const mongoose = require('mongoose');

const caregiverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String }, // Optional for Google OAuth users
  googleId: { type: String, sparse: true },
  googleAuth: { type: Boolean, default: false },
  role: { type: String, enum: ['clinician', 'family', 'caregiver'], default: 'clinician' },
  contact: { type: String },
  notificationPreference: { type: String, enum: ['whatsapp', 'sms', 'ivr'], default: 'whatsapp' },
  patientIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }],
  webAuthnCredentialId: { type: String },
  hasBiometric: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Caregiver', caregiverSchema);