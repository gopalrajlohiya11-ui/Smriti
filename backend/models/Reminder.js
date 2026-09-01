const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  type: { 
    type: String, 
    enum: ['medicine', 'hydration', 'activity', 'appointment', 'meal', 'game', 'rest'], 
    required: true 
  },
  title: { type: String },
  detail: { type: String },
  scheduledTime: { type: Date, required: true },
  acknowledged: { type: Boolean, default: false },
  // Caregiver dismissal tracking (persists across page reloads without marking patient done)
  dismissed: { type: Boolean, default: false },
  dismissedAt: { type: Date }
});

module.exports = mongoose.model('Reminder', reminderSchema);