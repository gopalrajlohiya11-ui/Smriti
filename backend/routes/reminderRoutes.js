const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const Patient = require('../models/patient');
const { authenticateCaregiver, authenticateAny } = require('../middleware/auth');

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

// 4. Get all reminders for a patient (Authenticated)
router.get('/:patientId', authenticateAny, async (req, res) => {
  try {
    const reminders = await Reminder.find({ patientId: req.params.patientId }).sort({ scheduledTime: 1 });
    res.json(reminders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Toggle or update reminder status
router.patch('/:id', authenticateAny, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });

    if (req.body.acknowledged !== undefined) {
      reminder.acknowledged = req.body.acknowledged;
    } else if (req.body.dismissed !== undefined) {
      reminder.dismissed = req.body.dismissed;
      if (reminder.dismissed) reminder.dismissedAt = new Date();
    } else {
      reminder.acknowledged = !reminder.acknowledged;
    }

    await reminder.save();
    res.json(reminder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;