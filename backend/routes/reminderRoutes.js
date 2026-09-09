const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Reminder = require('../models/Reminder');
const Patient = require('../models/patient');
const { authenticateCaregiver, authenticateAny, optionalAuth } = require('../middleware/auth');

const parseTimeToDate = (timeInput) => {
  if (!timeInput) return new Date();
  if (timeInput instanceof Date) return timeInput;
  if (typeof timeInput === 'string' && (timeInput.includes('T') || (timeInput.includes('-') && timeInput.length > 10))) {
    const d = new Date(timeInput);
    if (!isNaN(d.getTime())) return d;
  }
  
  const now = new Date();
  const match = typeof timeInput === 'string' ? timeInput.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i) : null;
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3] ? match[3].toUpperCase() : null;

    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    now.setHours(hours, minutes, 0, 0);
    return now;
  }
  return new Date();
};

// 1. Create a new reminder or batch of reminders (Caregiver scoped)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { patientId, reminders, replaceExisting } = req.body;
    const targetPatientId = patientId || req.body[0]?.patientId;
    
    if (targetPatientId) {
      const pId = await resolvePatientId(targetPatientId);
      if (!pId) return res.status(404).json({ error: 'Patient not found' });

      // Batch creation if array provided in `reminders` or body is array
      const itemsToCreate = Array.isArray(reminders) ? reminders : (Array.isArray(req.body) ? req.body : null);
      
      if (itemsToCreate) {
        if (replaceExisting) {
          await Reminder.deleteMany({ patientId: pId });
        }

        const docs = itemsToCreate.map(item => ({
          patientId: pId,
          type: item.type || 'activity',
          title: item.title || 'Daily Routine',
          detail: item.detail || '',
          scheduledTime: item.scheduledTime ? parseTimeToDate(item.scheduledTime) : parseTimeToDate(item.time),
          acknowledged: !!item.acknowledged,
          dismissed: false
        }));

        const createdReminders = await Reminder.insertMany(docs);
        return res.status(201).json({
          status: 'ok',
          count: createdReminders.length,
          reminders: createdReminders
        });
      }

      // Single reminder creation
      const reminderDoc = {
        patientId: pId,
        type: req.body.type || 'activity',
        title: req.body.title || 'Daily Routine',
        detail: req.body.detail || '',
        scheduledTime: req.body.scheduledTime ? parseTimeToDate(req.body.scheduledTime) : parseTimeToDate(req.body.time),
        acknowledged: !!req.body.acknowledged,
        dismissed: false
      };

      const reminder = new Reminder(reminderDoc);
      await reminder.save();
      return res.status(201).json(reminder);
    }

    const reminder = new Reminder(req.body);
    await reminder.save();
    res.status(201).json(reminder);
  } catch (err) {
    console.error('Create reminder error:', err);
    res.status(400).json({ error: err.message });
  }
});

// 1b. Batch reminders endpoint
router.post('/batch', optionalAuth, async (req, res) => {
  try {
    const { patientId, reminders, replaceExisting } = req.body;
    const pId = await resolvePatientId(patientId);
    if (!pId) return res.status(404).json({ error: 'Patient not found' });

    if (!Array.isArray(reminders) || reminders.length === 0) {
      return res.status(400).json({ error: 'reminders must be a non-empty array' });
    }

    if (replaceExisting) {
      await Reminder.deleteMany({ patientId: pId });
    }

    const docs = reminders.map(item => ({
      patientId: pId,
      type: item.type || 'activity',
      title: item.title || 'Daily Routine',
      detail: item.detail || '',
      scheduledTime: item.scheduledTime ? parseTimeToDate(item.scheduledTime) : parseTimeToDate(item.time),
      acknowledged: !!item.acknowledged,
      dismissed: false
    }));

    const createdReminders = await Reminder.insertMany(docs);
    res.status(201).json({
      status: 'ok',
      count: createdReminders.length,
      reminders: createdReminders
    });
  } catch (err) {
    console.error('Batch reminders error:', err);
    res.status(400).json({ error: err.message });
  }
});

// 2. Fetch all active overdue alerts directly from MongoDB (Caregiver, Patient, or Query scoped)
router.get('/alerts', optionalAuth, async (req, res) => {
  try {
    const now = new Date();
    const query = {
      acknowledged: false,
      dismissed: false,
      scheduledTime: { $lte: now }
    };

    if (req.caregiver) {
      // Scoped strictly to this caregiver's patients
      const accessiblePatients = await Patient.find({
        $or: [
          { caregiverId: req.caregiver._id },
          { _id: { $in: req.caregiver.patientIds || [] } }
        ]
      }).select('_id');
      const patientIds = accessiblePatients.map(p => p._id);

      // If this caregiver has 0 patients, they have 0 active alerts
      if (patientIds.length === 0) {
        return res.json({
          status: 'ok',
          count: 0,
          alerts: []
        });
      }
      query.patientId = { $in: patientIds };
    } else if (req.patient) {
      query.patientId = req.patient._id;
    } else if (req.query.patientId) {
      const pId = await resolvePatientId(req.query.patientId);
      if (pId) {
        query.patientId = pId;
      } else {
        return res.json({ status: 'ok', count: 0, alerts: [] });
      }
    } else {
      // Unauthenticated demo fallback: only show alerts for demo patients
      const demoPatients = await Patient.find({ name: { $in: ['Ramesh Sharma', 'Meera Baruah', 'Biren Das'] } }).select('_id');
      const demoIds = demoPatients.map(p => p._id);
      if (demoIds.length > 0) {
        query.patientId = { $in: demoIds };
      } else {
        return res.json({ status: 'ok', count: 0, alerts: [] });
      }
    }

    const overdueReminders = await Reminder.find(query)
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

// 6. Full Edit/Update Reminder: PUT /api/reminders/:id
router.put('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    let reminder = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      reminder = await Reminder.findById(id);
    }

    if (!reminder && req.body.patientId) {
      const pId = await resolvePatientId(req.body.patientId);
      if (pId && typeof id === 'string' && id.startsWith('rem-')) {
        const idx = parseInt(id.replace('rem-', ''), 10) - 1;
        const allRems = await Reminder.find({ patientId: pId }).sort({ scheduledTime: 1 });
        if (allRems && allRems[idx]) {
          reminder = allRems[idx];
        }
      }
    }

    if (!reminder) {
      // Create new if not found
      const pId = await resolvePatientId(req.body.patientId);
      if (pId) {
        reminder = new Reminder({
          patientId: pId,
          type: req.body.type || 'activity',
          title: req.body.title || 'Daily Routine',
          detail: req.body.detail || '',
          scheduledTime: req.body.scheduledTime ? parseTimeToDate(req.body.scheduledTime) : parseTimeToDate(req.body.time),
          acknowledged: !!req.body.acknowledged,
          dismissed: false
        });
        await reminder.save();
        return res.json(reminder);
      }
      return res.status(404).json({ error: 'Reminder not found' });
    }

    if (req.body.title !== undefined) reminder.title = req.body.title;
    if (req.body.type !== undefined) reminder.type = req.body.type;
    if (req.body.detail !== undefined) reminder.detail = req.body.detail;
    if (req.body.scheduledTime !== undefined || req.body.time !== undefined) {
      reminder.scheduledTime = parseTimeToDate(req.body.scheduledTime || req.body.time);
    }
    if (req.body.acknowledged !== undefined) reminder.acknowledged = req.body.acknowledged;
    if (req.body.dismissed !== undefined) reminder.dismissed = req.body.dismissed;

    await reminder.save();
    console.log(`✏️ Updated reminder ${reminder._id} (${reminder.title})`);
    res.json(reminder);
  } catch (err) {
    console.error('PUT reminder error:', err);
    res.status(400).json({ error: err.message });
  }
});

// 7. Delete Single Reminder: DELETE /api/reminders/:id
router.delete('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    let deleted = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Reminder.findByIdAndDelete(id);
    }

    if (!deleted && req.query.patientId) {
      const pId = await resolvePatientId(req.query.patientId);
      if (pId && typeof id === 'string' && id.startsWith('rem-')) {
        const idx = parseInt(id.replace('rem-', ''), 10) - 1;
        const allRems = await Reminder.find({ patientId: pId }).sort({ scheduledTime: 1 });
        if (allRems && allRems[idx]) {
          deleted = await Reminder.findByIdAndDelete(allRems[idx]._id);
        }
      }
    }

    if (!deleted) {
      return res.status(404).json({ error: 'Reminder not found or already deleted' });
    }

    console.log(`🗑️ Deleted reminder ${id}`);
    res.json({ status: 'ok', message: 'Reminder deleted successfully', deletedId: id });
  } catch (err) {
    console.error('Delete reminder error:', err);
    res.status(400).json({ error: err.message });
  }
});

// 8. Delete All Reminders for a Patient: DELETE /api/reminders/patient/:patientId
router.delete('/patient/:patientId', optionalAuth, async (req, res) => {
  try {
    const pId = await resolvePatientId(req.params.patientId);
    if (!pId) return res.status(404).json({ error: 'Patient not found' });

    const result = await Reminder.deleteMany({ patientId: pId });
    console.log(`🗑️ Cleared all reminders (${result.deletedCount}) for patient ${pId}`);
    res.json({ status: 'ok', deletedCount: result.deletedCount });
  } catch (err) {
    console.error('Clear patient reminders error:', err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;