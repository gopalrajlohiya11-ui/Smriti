const mongoose = require('mongoose');

const memoryBankPhotoSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  photoUrl: { type: String, required: true },
  taggedName: { type: String, required: true },
  relationship: { type: String }
});

module.exports = mongoose.model('MemoryBankPhoto', memoryBankPhotoSchema);