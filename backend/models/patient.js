const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, default: 70 },
  gender: { type: String, default: 'Senior' },
  phoneNumber: { type: String, required: true },
  pin: { type: String }, // Hashed with bcrypt (e.g. for "1234")
  tier: { type: Number, enum: [1, 2, 3], default: 1 },
  language: { type: String, default: 'Assamese' },
  location: { type: String, default: 'Guwahati, Assam' },
  cognitiveStage: { type: String, default: 'Early Memory Support' },
  primaryCaregiver: { type: String, default: 'Dr. Ananya Sharma' },
  emergencyContact: { type: String },
  notes: { type: String },
  medicalNotes: { type: String },
  avatar: { type: String },
  caregiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Caregiver' },
  notificationPreference: { type: String, enum: ['whatsapp', 'sms', 'ivr'], default: 'whatsapp' },
  lastGameLinkSentDate: { type: Date },
  // Flag distinguishing seeded demo accounts from newly registered live patients
  isDemoSeed: { type: Boolean, default: false },
  // Biometric WebAuthn support
  webAuthnCredentialId: { type: String },
  webAuthnPublicKey: { type: String },
  hasBiometric: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', patientSchema);