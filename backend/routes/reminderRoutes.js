const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Reminder = require('../models/Reminder');
const Patient = require('../models/patient');
const { authenticateCaregiver, authenticateAny, optionalAuth } = require('../middleware/auth');

// 1. Create a new reminder (Caregiver scoped)
router.post('/', authenticateCaregiver, async (req, res) => {
  try {
    const { patientId } = req.body;
    if (patientId) {
      const patient = await Patient.findById(patientId);
      if (patient && patient.caregiverId && patient.caregiverId.toString() !== req.caregiver._id.toString() && !req.caregiver.patientIds?.includes(patient._id)) {
        return res.status(403).json({ error: 'Forbidden: You cannot create reminders for another caregiver patient.' });
      }
    }

    const reminder = new Reminder(req.body);
    await reminder.save();
    res.status(201).json(reminder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 2. Fetch all active overdue alerts directly from MongoDB (Caregiver scoped)
router.get('/alerts', authenticateCaregiver, async (req, res) => {
  try {
    const now = new Date();
    
    // Find patient IDs accessible to this caregiver
    const caregiver = req.caregiver;
    const accessiblePatients = await Patient.find({
      $or: [
        { caregiverId: caregiver._id },
        { _id: { $in: caregiver.patientIds || [] } }
      ]
    }).select('_id');

    const patientIds = accessiblePatients.map(p => p._id);

    const overdueReminders = await Reminder.find({
      patientId: { $in: patientIds },
      acknowledged: false,
      dismissed: false,
      scheduledTime: { $lte: now }
    })
    .populate('patientId', 'name avatar location phoneNumber emergencyContact cognitiveStage')
    .sort({ scheduledTime: -1 });

    const alerts = overdueReminders.map(rem => {
      const p = rem.patientId || {};
      const timeStr = rem.scheduledTime ? new Date(rem.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Earlier today';
      
      return {
        id: `flag-${p._id || 'pat'}-${rem._id}`,
        reminderId: rem._id.toString(),
        patientId: p._id ? p._id.toString() : '',
        patientName: p.name || 'Patient',
        patientAvatar: p.avatar || 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80',
        patientLocation: p.location || 'Assam',
        severity: rem.type === 'medicine' ? 'critical' : 'high',
        title: `Missed ${rem.title || 'Scheduled Routine'}`,
        description: `${p.name || 'Patient'} has not yet acknowledged their ${rem.type} reminder scheduled for ${timeStr} via WhatsApp.`,
        time: `Overdue (${timeStr})`,
        actionRequired: 'Call Patient',
        actionPhone: p.phoneNumber ? `+${p.phoneNumber}` : p.emergencyContact || ''
      };
    });

    res.json({
      status: 'ok',
      count: alerts.length,
      alerts
    });
  } catch (err) {
    console.error('Fetch alerts error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Caregiver Dismissal: PATCH /api/reminders/:id/dismiss (Caregiver scoped)
router.patch('/:id/dismiss', authenticateCaregiver, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    reminder.dismissed = true;
    reminder.dismissedAt = new Date();
    await reminder.save();

    console.log(`👁️ Caregiver dismissed overdue alert for reminder ${reminder._id} (${reminder.type})`);

    res.json({
      status: 'ok',
      message: 'Reminder alert dismissed successfully',
      reminder
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Helper to resolve input patient ID or mock code (e.g. 'pat-2') to real MongoDB patient ID
const resolvePatientId = async (inputPatientId) => {
  if (!inputPatientId) {
    const demo = await Patient.findOne({ name: /Ramesh Sharma/i }) || await Patient.findOne();
    return demo ? demo._id : null;
  }
  if (mongoose.Types.ObjectId.isValid(inputPatientId)) {
    return inputPatientId;
  }
  if (inputPatientId === 'pat-2') {
    const p = await Patient.findOne({ name: /Meera/i });
    if (p) return p._id;
  }
  if (inputPatientId === 'pat-3') {
    const p = await Patient.findOne({ name: /Biren/i });
    if (p) return p._id;
  }
  if (inputPatientId === 'pat-1' || inputPatientId === 'default') {
    const p = await Patient.findOne({ name: /Ramesh/i });
    if (p) return p._id;
  }
  const byName = await Patient.findOne({ name: new RegExp(inputPatientId.trim(), 'i') });
  if (byName) return byName._id;

  const demo = await Patient.findOne({ name: /Ramesh Sharma/i }) || await Patient.findOne();
  return demo ? demo._id : null;
};

// 4. Get all reminders for a patient (Supports auth or public patient lookup)
router.get('/:patientId', optionalAuth, async (req, res) => {
  try {
    const patientId = await resolvePatientId(req.params.patientId);
    if (!patientId) return res.status(404).json({ error: 'Patient not found' });
    const reminders = await Reminder.find({ patientId }).sort({ scheduledTime: 1 });
    res.json(reminders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Toggle or update reminder status in MongoDB
router.patch('/:id', optionalAuth, async (req, res) => {
  try {
    let reminder = null;
    const { id } = req.params;

    if (mongoose.Types.ObjectId.isValid(id)) {
      reminder = await Reminder.findById(id);
    }

    // Fallback: If not found by ObjectId or if given a mock ID (e.g. "rem-10"), find by patient + title / sequence / type
    if (!reminder) {
      const pId = await resolvePatientId(req.body.patientId);

      if (pId) {
        // 1. Match by full title or primary title prefix (e.g. "Night Routine" vs "Night Medicine")
        if (req.body.title) {
          const cleanTitle = req.body.title.trim();
          const firstWord = cleanTitle.split(' ')[0];
          reminder = await Reminder.findOne({
            patientId: pId,
            $or: [
              { title: new RegExp(`^${cleanTitle}$`, 'i') },
              { title: new RegExp(cleanTitle, 'i') },
              { title: new RegExp(`^${firstWord}`, 'i') }
            ]
          });
        }

        // 2. Check by sequence index if ID is like "rem-1", "rem-10"
        if (!reminder && typeof id === 'string' && id.startsWith('rem-')) {
          const idx = parseInt(id.replace('rem-', ''), 10) - 1;
          const allRems = await Reminder.find({ patientId: pId }).sort({ scheduledTime: 1 });
          if (allRems && allRems[idx]) {
            reminder = allRems[idx];
          }
        }

        // 3. Match by type (prefer unacknowledged first)
        if (!reminder && req.body.type) {
          reminder = await Reminder.findOne({ patientId: pId, type: req.body.type, acknowledged: false });
          if (!reminder) {
            reminder = await Reminder.findOne({ patientId: pId, type: req.body.type });
          }
        }
      }
    }

    if (!reminder) {
      const pId = await resolvePatientId(req.body.patientId);
      if (pId) {
        reminder = new Reminder({
          patientId: pId,
          title: req.body.title || 'Daily Routine',
          type: req.body.type || 'activity',
          detail: req.body.detail || '',
          scheduledTime: req.body.scheduledTime || new Date(),
          acknowledged: req.body.acknowledged !== undefined ? req.body.acknowledged : true
        });
        await reminder.save();
        console.log(`✅ Created and saved reminder ${reminder._id} (${reminder.title}) acknowledged: ${reminder.acknowledged} to MongoDB`);
        return res.json(reminder);
      }
      return res.status(404).json({ error: 'Reminder not found' });
    }

    if (req.body.acknowledged !== undefined) {
      reminder.acknowledged = req.body.acknowledged;
    } else if (req.body.dismissed !== undefined) {
      reminder.dismissed = req.body.dismissed;
      if (reminder.dismissed) reminder.dismissedAt = new Date();
    } else {
      reminder.acknowledged = !reminder.acknowledged;
    }

    await reminder.save();
    console.log(`✅ Saved reminder ${reminder._id} (${reminder.title}) acknowledged: ${reminder.acknowledged} to MongoDB`);
    res.json(reminder);
  } catch (err) {
    console.error('Update reminder error:', err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;