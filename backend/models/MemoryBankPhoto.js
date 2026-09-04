const mongoose = require('mongoose');

const memoryBankPhotoSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  photoUrl: { type: String, required: true },
  title: { type: String, default: 'Family Memory' },
  taggedName: { type: String },
  relation: { type: String },
  year: { type: String, default: '2024' },
  location: { type: String, default: 'Assam' },
  description: { type: String },
  audioPrompt: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MemoryBankPhoto', memoryBankPhotoSchema);