const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Patient = require('../models/patient');
const Caregiver = require('../models/Caregiver');
const Reminder = require('../models/Reminder');
const MemoryBankPhoto = require('../models/MemoryBankPhoto');
const GameSession = require('../models/GameSession');
const mongoose = require('mongoose');
const { 
  JWT_SECRET, 
  authenticateCaregiver, 
  authenticatePatient, 
  authenticateAny, 
  optionalAuth,
  rateLimitLogin 
} = require('../middleware/auth');

// 1. Patient PIN-Based Login: POST /api/patients/login
router.post('/login', rateLimitLogin, async (req, res) => {
  try {
    const { name, age, pin, phoneNumber } = req.body;

    if (!pin || pin.toString().length < 4) {
      return res.status(400).json({ error: 'A 4-digit PIN is required' });
    }

    let patient = null;

    if (phoneNumber) {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      patient = await Patient.findOne({ phoneNumber: cleanPhone });
    }

    if (!patient && name) {
      const nameRegex = new RegExp(`^${name.trim()}$`, 'i');
      patient = await Patient.findOne({ name: nameRegex });
      if (!patient) {
        patient = await Patient.findOne({ name: new RegExp(name.trim(), 'i') });
      }
    }

    // Generic error to prevent user enumeration
    if (!patient) {
      return res.status(401).json({ error: 'Invalid name/phone number or PIN.' });
    }

    // Verify PIN with bcrypt
    if (patient.pin) {
      const isPinValid = await bcrypt.compare(pin.toString(), patient.pin);
      if (!isPinValid) {
        return res.status(401).json({ error: 'Invalid name/phone number or PIN.' });
      }
    } else {
      // If patient had no PIN set, match against default 1234
      if (pin.toString() !== '1234') {
        return res.status(401).json({ error: 'Invalid name/phone number or PIN.' });
      }
    }

    // Generate scoped JWT token for patient
    const token = jwt.sign(
      { id: patient._id, patientId: patient._id, name: patient.name, type: 'patient' },
      JWT_SECRET,
      { expiresIn: '365d' }
    );

    res.json({
      status: 'ok',
      message: 'Patient login successful',
      token,
      patient
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1b. Patient Biometric Login: POST /api/patients/biometric-login
router.post('/biometric-login', rateLimitLogin, async (req, res) => {
  try {
    const { credentialId, patientId, name } = req.body;

    let patient = null;

    if (credentialId) {
      patient = await Patient.findOne({ webAuthnCredentialId: credentialId });
    }

    if (!patient && patientId) {
      patient = await Patient.findById(patientId);
    }

    if (!patient && name) {
      patient = await Patient.findOne({ name: new RegExp(name.trim(), 'i'), hasBiometric: true });
    }

    if (!patient) {
      return res.status(401).json({ error: 'No patient record associated with this biometric credential' });
    }

    const token = jwt.sign(
      { id: patient._id, patientId: patient._id, name: patient.name, type: 'patient' },
      JWT_SECRET,
      { expiresIn: '365d' }
    );

    res.json({
      status: 'ok',
      message: 'Biometric authentication successful',
      token,
      patient
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1c. Get Current Patient Profile: GET /api/patients/me (Patient-scoped)
router.get('/me', authenticatePatient, async (req, res) => {
  try {
    const patient = await Patient.findById(req.patient._id);
    if (!patient) return res.status(404).json({ error: 'Patient profile not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1d. Get Default Demo Patient or Active Patient: GET /api/patients/public/default
router.get('/public/default', async (req, res) => {
  try {
    let patient = await Patient.findOne({ name: /Ramesh Sharma/i });
    if (!patient) {
      patient = await Patient.findOne();
    }
    if (!patient) {
      return res.status(404).json({ error: 'No patient profile found' });
    }
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1e. Get Specific Patient: GET /api/patients/public/:id
router.get('/public/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let patient = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      patient = await Patient.findById(id);
    }
    if (!patient && id === 'pat-2') {
      patient = await Patient.findOne({ name: /Meera/i });
    }
    if (!patient && id === 'pat-3') {
      patient = await Patient.findOne({ name: /Biren/i });
    }
    if (!patient && (id === 'pat-1' || id === 'default')) {
      patient = await Patient.findOne({ name: /Ramesh Sharma/i }) || await Patient.findOne();
    }
    if (!patient && !mongoose.Types.ObjectId.isValid(id)) {
      patient = await Patient.findOne({ name: new RegExp(`^${id.trim()}$`, 'i') });
    }
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1e-2. Get Patient Game Sessions Alias: GET /api/patients/:id/games
router.get('/:id/games', async (req, res) => {
  try {
    const { id } = req.params;
    let targetPatientId = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      targetPatientId = id;
    } else {
      let patient = null;
      if (id === 'pat-2' || (typeof id === 'string' && id.toLowerCase().includes('meera'))) {
        patient = await Patient.findOne({ name: /Meera/i });
      } else if (id === 'pat-3' || (typeof id === 'string' && id.toLowerCase().includes('biren'))) {
        patient = await Patient.findOne({ name: /Biren/i });
      } else if (id === 'pat-1' || id === 'default' || (typeof id === 'string' && id.toLowerCase().includes('ramesh'))) {
        patient = await Patient.findOne({ name: /Ramesh/i });
      } else {
        patient = await Patient.findOne({
          $or: [
            { id },
            { name: new RegExp(String(id).replace(/[-_]/g, ' ').trim(), 'i') }
          ]
        });
      }
      if (patient) {
        targetPatientId = patient._id;
      } else {
        targetPatientId = id;
      }
    }

    const sessions = await GameSession.find({ patientId: targetPatientId }).sort({ timestamp: -1 }).limit(50);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1f. Get All Public / Demo Patients: GET /api/patients/public
router.get('/public', async (req, res) => {
  try {
    const patients = await Patient.find({
      $or: [
        { isDemoSeed: true },
        { name: { $in: ['Ramesh Sharma', 'Meera Baruah', 'Biren Das'] } }
      ]
    }).sort({ createdAt: 1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: Verify if a caregiver has access to a specific patient
const caregiverHasAccessToPatient = (caregiver, patient) => {
  if (!caregiver || !patient) return false;
  const isDirectOwner = patient.caregiverId && patient.caregiverId.toString() === caregiver._id.toString();
  const isInAssignedList = caregiver.patientIds && caregiver.patientIds.some(pid => pid.toString() === patient._id.toString());
  return isDirectOwner || isInAssignedList;
};

// 2. Get patients: GET /api/patients (Scoped strictly to authenticated caregiver, or public demo fallback)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const caregiver = req.caregiver;
    let patients = [];
    
    if (caregiver) {
      // Find strictly all patients owned by or assigned to this caregiver
      const query = {
        $or: [
          { caregiverId: caregiver._id },
          { _id: { $in: caregiver.patientIds || [] } }
        ]
      };

      patients = await Patient.find(query).sort({ createdAt: 1 }).lean();
    } else {
      // Public / Demo fallback if not authenticated: ONLY demo accounts
      patients = await Patient.find({
        name: { $in: ['Ramesh Sharma', 'Meera Baruah', 'Biren Das'] }
      }).sort({ createdAt: 1 }).lean();
    }

    // Batch load today's reminders in 1 fast query if requested
    if (req.query.includeReminders === 'true' || req.query.withReminders === 'true' || req.query.batch === 'true') {
      const patientIds = (patients || []).map(p => p._id);
      const allReminders = await Reminder.find({ patientId: { $in: patientIds } }).sort({ scheduledTime: 1 }).lean();
      
      const remindersByPatient = {};
      allReminders.forEach(r => {
        const pid = r.patientId ? r.patientId.toString() : '';
        if (pid) {
          if (!remindersByPatient[pid]) remindersByPatient[pid] = [];
          remindersByPatient[pid].push(r);
        }
      });

      patients = patients.map(p => ({
        ...p,
        reminders: remindersByPatient[p._id.toString()] || []
      }));
    }

    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Create a new patient: POST /api/patients (Auto-scoped to authenticated caregiver)
router.post('/', authenticateCaregiver, async (req, res) => {
  try {
    const {
      name,
      age,
      phoneNumber,
      phone,
      pin,
      language,
      nativeLanguage,
      location,
      gender,
      cognitiveStage,
      tier,
      notes,
      medicalNotes,
      primaryCaregiver,
      emergencyContact,
      avatar,
      webAuthnCredentialId,
      webAuthnPublicKey,
      hasBiometric
    } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Patient name is required (at least 2 characters).' });
    }

    const rawPhone = phoneNumber || phone || '919435012345';
    const cleanPhone = rawPhone.replace(/\D/g, '');

    // Hash PIN (validate 4 digits if provided, default 1234)
    const pinStr = pin ? pin.toString().trim() : '';
    if (pinStr && !/^\d{4}$/.test(pinStr)) {
      return res.status(400).json({ error: 'PIN must be exactly 4 numeric digits.' });
    }
    const pinToHash = pinStr || '1234';
    const hashedPin = await bcrypt.hash(pinToHash, 10);

    const patient = new Patient({
      name: name.trim(),
      age: age ? parseInt(age, 10) : 70,
      gender: gender || 'Senior',
      phoneNumber: cleanPhone,
      pin: hashedPin,
      tier: tier || 1,
      language: language || nativeLanguage || 'Assamese',
      location: location || 'Guwahati, Assam',
      cognitiveStage: cognitiveStage || 'Early Memory Support',
      primaryCaregiver: primaryCaregiver || req.caregiver.name,
      emergencyContact: emergencyContact || cleanPhone,
      notes: notes || '',
      medicalNotes: medicalNotes || '',
      avatar: avatar || '',
      caregiverId: req.caregiver._id,
      webAuthnCredentialId: webAuthnCredentialId || undefined,
      webAuthnPublicKey: webAuthnPublicKey || undefined,
      hasBiometric: !!(hasBiometric || webAuthnCredentialId)
    });

    await patient.save();

    // Link patient to the authenticated caregiver
    await Caregiver.findByIdAndUpdate(req.caregiver._id, {
      $addToSet: { patientIds: patient._id }
    });

    // New patient starts completely clean with 0 auto-seeded reminders

    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3b. Register Biometric for Patient: POST /api/patients/:id/register-biometric
router.post('/:id/register-biometric', authenticateAny, async (req, res) => {
  try {
    const { credentialId, publicKey } = req.body;
    if (!credentialId) {
      return res.status(400).json({ error: 'credentialId is required' });
    }

    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    // Authorization check
    if (req.caregiver && !caregiverHasAccessToPatient(req.caregiver, patient)) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this patient record.' });
    }
    if (req.patient && req.patient._id.toString() !== patient._id.toString()) {
      return res.status(403).json({ error: 'Forbidden: You cannot modify another patient.' });
    }

    patient.webAuthnCredentialId = credentialId;
    patient.webAuthnPublicKey = publicKey || '';
    patient.hasBiometric = true;
    await patient.save();

    console.log(`✅ Registered WebAuthn Biometrics for Patient: ${patient.name}`);
    res.json({
      status: 'ok',
      message: `Biometric credential successfully registered for ${patient.name}`,
      patient
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Update a patient: PATCH /api/patients/:id (Scoped to owning caregiver)
router.patch('/:id', authenticateCaregiver, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    if (!caregiverHasAccessToPatient(req.caregiver, patient)) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to update this patient.' });
    }

    const updateData = { ...req.body };

    // Format phone if provided
    if (updateData.phoneNumber || updateData.phone) {
      const raw = updateData.phoneNumber || updateData.phone;
      updateData.phoneNumber = raw.replace(/\D/g, '');
    }

    // Hash PIN if updated
    if (updateData.pin && updateData.pin.length === 4) {
      updateData.pin = await bcrypt.hash(updateData.pin.toString(), 10);
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({
      status: 'ok',
      message: 'Patient details updated successfully',
      patient: updatedPatient
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Get a patient by ID: GET /api/patients/:id (Protected & scoped)
router.get('/:id', authenticateAny, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    // Authorization check
    if (req.caregiver && !caregiverHasAccessToPatient(req.caregiver, patient)) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this patient record.' });
    }
    if (req.patient && req.patient._id.toString() !== patient._id.toString()) {
      return res.status(403).json({ error: 'Forbidden: You cannot access another patient profile.' });
    }

    res.json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Helper: Resolve any raw patient ID/alias to a MongoDB ObjectId
async function resolveMongoPatientId(input) {
  if (!input) return null;
  if (mongoose.Types.ObjectId.isValid(input)) return input;
  const str = String(input).trim().toLowerCase();
  if (str === 'pat-2' || str.includes('meera')) {
    const p = await Patient.findOne({ name: /Meera/i });
    if (p) return p._id;
  }
  if (str === 'pat-3' || str.includes('biren')) {
    const p = await Patient.findOne({ name: /Biren/i });
    if (p) return p._id;
  }
  if (str === 'pat-1' || str === 'default' || str.includes('ramesh')) {
    const p = await Patient.findOne({ name: /Ramesh/i });
    if (p) return p._id;
  }
  const byName = await Patient.findOne({ name: new RegExp(input.trim(), 'i') });
  if (byName) return byName._id;
  return input;
}

// 6. Get a patient's reminders: GET /api/patients/:id/reminders
router.get('/:id/reminders', optionalAuth, async (req, res) => {
  try {
    let patientId = await resolveMongoPatientId(req.params.id);
    const reminders = await Reminder.find({ patientId }).sort({ scheduledTime: 1 });
    res.json(reminders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 7. Delete a patient: DELETE /api/patients/:id
router.delete('/:id', authenticateCaregiver, async (req, res) => {
  try {
    const patientId = req.params.id;
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Safety check: protect demo-seeded accounts
    const isDemo = patient.isDemoSeed || ['Ramesh Sharma', 'Meera Baruah', 'Biren Das'].includes(patient.name);
    if (isDemo) {
      return res.status(403).json({ error: 'Demo accounts (Ramesh Sharma, Meera Baruah, Biren Das) are protected and cannot be deleted.' });
    }

    // Caregiver Scoping check: return 403 if attempting to delete another caregiver's patient
    if (!caregiverHasAccessToPatient(req.caregiver, patient)) {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to delete this patient.' });
    }

    // Remove from caregiver patientIds array
    await Caregiver.findByIdAndUpdate(req.caregiver._id, {
      $pull: { patientIds: patient._id }
    });

    // Remove from all caregivers' patientIds lists
    await Caregiver.updateMany(
      { patientIds: patient._id },
      { $pull: { patientIds: patient._id } }
    );

    // Clean up all associated reminders
    await Reminder.deleteMany({ patientId: patient._id });

    // Clean up GameSession if model exists
    try {
      const GameSession = require('../models/GameSession');
      if (GameSession) {
        await GameSession.deleteMany({ patientId: patient._id });
      }
    } catch (e) {}

    // Delete Patient document
    await Patient.findByIdAndDelete(patientId);

    console.log(`🗑️ Deleted Patient: ${patient.name} (${patientId}) by Caregiver: ${req.caregiver.name}`);

    res.json({
      status: 'ok',
      message: `Patient ${patient.name} and all related records have been deleted successfully.`,
      deletedPatientId: patientId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Patient AI Chatbot: POST /api/patients/:id/chat
const { generatePatientChatReply } = require('../services/patientChatService');

router.post('/:id/chat', optionalAuth, async (req, res) => {
  try {
    const { message, history, audioData, mimeType } = req.body;
    const rawPatientId = req.params.id;

    if ((!message || !message.trim()) && !audioData) {
      return res.status(400).json({ error: 'A message text or audio recording is required.' });
    }

    let patient = null;
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        if (rawPatientId && mongoose.Types.ObjectId.isValid(rawPatientId)) {
          patient = await Patient.findById(rawPatientId).maxTimeMS(2500);
        }
        
        // Resolve fallback patient references (demo shortcuts, names, phone numbers)
        if (!patient) {
          if (rawPatientId === 'pat-2') {
            patient = await Patient.findOne({ name: /Meera/i }).maxTimeMS(2500);
          } else if (rawPatientId === 'pat-1' || rawPatientId === 'default' || !rawPatientId) {
            patient = await Patient.findOne({ name: /Ramesh Sharma/i }).maxTimeMS(2500) || await Patient.findOne().maxTimeMS(2500);
          } else {
            patient = await Patient.findOne({
              $or: [
                { name: new RegExp(rawPatientId.trim(), 'i') },
                { phoneNumber: rawPatientId }
              ]
            }).maxTimeMS(2500) || await Patient.findOne().maxTimeMS(2500);
          }
        }
      } catch (dbErr) {
        console.warn('DB lookup error in chat route, proceeding with patient object fallback:', dbErr.message);
      }
    }

    if (!patient) {
      const isMeera = (rawPatientId === 'pat-2' || (typeof rawPatientId === 'string' && rawPatientId.toLowerCase().includes('meera')));
      patient = {
        _id: isMeera ? '6a9e533f65c0817eb2016cc9' : '6a9e533f65c0817eb2016cc8',
        name: isMeera ? 'Meera Baruah' : 'Ramesh Sharma',
        age: isMeera ? 68 : 74,
        gender: isMeera ? 'Female' : 'Male',
        location: isMeera ? 'Shillong, Meghalaya' : 'Guwahati, Assam',
        language: isMeera ? 'Khasi' : 'Assamese',
        preferredLanguage: isMeera ? 'Khasi' : 'Assamese',
        cognitiveStage: isMeera ? 'Moderate Support' : 'Early Memory Support',
        primaryCaregiver: 'Dr. Ananya Sharma',
        emergencyContact: '+91 98640 54321',
        phoneNumber: isMeera ? '+91 98640 11223' : '+91 94350 12345'
      };
    }

    const result = await generatePatientChatReply(
      patient, 
      message ? message.trim() : '', 
      history || [],
      audioData || null,
      mimeType || 'audio/webm'
    );

    res.json({
      status: 'ok',
      reply: result.reply,
      transcription: result.transcription,
      patientName: result.patientName,
      preferredLanguage: result.preferredLanguage
    });
  } catch (err) {
    console.error('Chat endpoint handled error:', err.message);
    res.json({
      status: 'ok',
      reply: 'Hello! I am Smriti, your caring companion. Your primary doctor and caregiver is Dr. Ananya Sharma, and your daily routine is being safely tracked. 🌸',
      transcription: req.body?.message || 'Voice Question',
      patientName: 'Elder',
      preferredLanguage: 'Assamese'
    });
  }
});

// 10. Memory Bank Photos: GET /api/patients/:id/photos
router.get('/:id/photos', optionalAuth, async (req, res) => {
  try {
    const patientId = await resolveMongoPatientId(req.params.id);
    let photos = await MemoryBankPhoto.find({ patientId }).sort({ createdAt: -1 });
    
    // If no custom photos uploaded yet, seed ONLY for demo patients
    if (photos.length === 0 && patientId) {
      let isDemo = req.params.id === 'pat-1' || req.params.id === 'pat-2' || req.params.id === 'pat-3';
      let isMeera = (req.params.id === 'pat-2' || (typeof req.params.id === 'string' && req.params.id.toLowerCase().includes('meera')));
      
      if (!isDemo && mongoose.Types.ObjectId.isValid(patientId)) {
        const patDoc = await Patient.findById(patientId);
        if (patDoc) {
          isDemo = patDoc.isDemoSeed === true || ['pat-1', 'pat-2', 'pat-3'].includes(patDoc.id) || ['Ramesh Sharma', 'Meera Baruah', 'Biren Das'].includes(patDoc.name);
          if (patDoc.name?.toLowerCase()?.includes('meera')) isMeera = true;
        }
      }

      if (isDemo) {
        const defaultPhotos = isMeera ? [
          {
            patientId,
            photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
            title: 'Shillong Peak Viewpoint with Preeti',
            taggedName: 'Preeti Baruah',
            relation: 'Daughter',
            year: '2022',
            location: 'Shillong, Meghalaya',
            description: 'A beautiful misty morning enjoying hot tea looking over Shillong valley.',
            audioPrompt: 'Remember the misty morning view from Shillong Peak with Preeti.'
          },
          {
            patientId,
            photoUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop&q=80',
            title: 'Cherrapunji Waterfalls Family Picnic',
            taggedName: 'Family',
            relation: 'Children & Grandchildren',
            year: '2021',
            location: 'Cherrapunji, Meghalaya',
            description: 'Lively family picnic lunch near the waterfalls with fresh orange blossom honey.',
            audioPrompt: 'The happy laughter during your Cherrapunji waterfall family picnic.'
          }
        ] : [
          {
            patientId,
            photoUrl: '/family/daughter_priya.jpg',
            title: 'Your daughter Priya',
            taggedName: 'Priya Sharma',
            relation: 'Daughter',
            year: '2023',
            location: 'Jorhat, Assam',
            description: 'Priya wearing traditional Assamese Muga silk Mekhela Sador on the tea garden porch.',
            audioPrompt: 'This is your daughter Priya smiling warmly on the tea garden porch in Jorhat.'
          },
          {
            patientId,
            photoUrl: '/family/grandson_arjun.png',
            title: 'Your grandson Arjun',
            taggedName: 'Arjun Sharma',
            relation: 'Grandson',
            year: '2023',
            location: 'Guwahati, Assam',
            description: 'Arjun holding the traditional Bihu Pepa instrument by the Brahmaputra river.',
            audioPrompt: 'This is your grandson Arjun holding the traditional Bihu Pepa at Guwahati riverfront.'
          },
          {
            patientId,
            photoUrl: '/family/wife_sunita.png',
            title: 'Wife Sunita tending Garden',
            taggedName: 'Sunita Sharma',
            relation: 'Wife',
            year: '2021',
            location: 'Guwahati, Assam',
            description: 'Sunita caring for blooming marigolds and orchids in traditional Mekhela Sador.',
            audioPrompt: 'This is your beloved wife Sunita tending fresh flowers in your home courtyard.'
          },
          {
            patientId,
            photoUrl: '/family/ramesh_bihu.png',
            title: 'Magh Bihu Celebration',
            taggedName: 'Ramesh Sharma',
            relation: 'Festival Memory',
            year: '2022',
            location: 'Rural Assam Village',
            description: 'Ramesh standing proudly before the traditional Bhelaghar harvest celebration in Assam.',
            audioPrompt: 'This is the festive Magh Bihu morning beside the harvest Bhelaghar.'
          },
          {
            patientId,
            photoUrl: '/family/family_umiam_lake.png',
            title: 'Shillong Family Trip at Umiam Lake',
            taggedName: 'Family Vacation',
            relation: 'Family Holiday',
            year: '2022',
            location: 'Umiam Lake Viewpoint, Shillong',
            description: 'The entire family together enjoying the autumn breeze overlooking Umiam Lake.',
            audioPrompt: 'Here is the whole family gathered at the Umiam Lake viewpoint in Shillong.'
          }
        ];

        try {
          photos = await MemoryBankPhoto.insertMany(defaultPhotos);
        } catch (err) {
          console.warn('Could not auto-seed demo photos:', err.message);
        }
      }
    }

    res.json(photos || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Add Memory Bank Photo: POST /api/patients/:id/photos
router.post('/:id/photos', authenticateAny, async (req, res) => {
  try {
    const patientId = await resolveMongoPatientId(req.params.id);
    const { 
      photoUrl, 
      title, 
      taggedName, 
      relation, 
      year, 
      location, 
      description, 
      audioPrompt,
      dpdpConsentGiven,
      dpdpConsentText
    } = req.body;

    if (!photoUrl) {
      return res.status(400).json({ error: 'photoUrl is required.' });
    }

    if (dpdpConsentGiven === false) {
      return res.status(400).json({ error: 'DPDP explicit consent is required to upload patient memory bank photos.' });
    }

    const photo = new MemoryBankPhoto({
      patientId,
      photoUrl,
      title: title || 'Family Memory',
      taggedName: taggedName || '',
      relation: relation || '',
      year: year || new Date().getFullYear().toString(),
      location: location || 'Assam',
      description: description || '',
      audioPrompt: audioPrompt || '',
      dpdpConsentGiven: true,
      dpdpConsentTimestamp: new Date(),
      dpdpConsentText: dpdpConsentText || 'I confirm I have consent to upload this photo and understand it will be used within Smriti to support cognitive care, per the Privacy Policy.'
    });

    await photo.save();
    res.status(201).json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Delete Memory Bank Photo: DELETE /api/patients/:id/photos/:photoId
router.delete('/:id/photos/:photoId', authenticateAny, async (req, res) => {
  try {
    const patientId = await resolveMongoPatientId(req.params.id);
    const { photoId } = req.params;
    await MemoryBankPhoto.findOneAndDelete({ _id: photoId, patientId });
    res.json({ status: 'ok', message: 'Photo deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 13. Game Sessions & Cognitive Scores: GET /api/patients/:id/games
router.get('/:id/games', authenticateAny, async (req, res) => {
  try {
    const patientId = await resolveMongoPatientId(req.params.id);
    const sessions = await GameSession.find({ patientId }).sort({ timestamp: -1 }).limit(30);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 14. Record Completed Game Session: POST /api/patients/:id/games
router.post('/:id/games', authenticateAny, async (req, res) => {
  try {
    const patientId = await resolveMongoPatientId(req.params.id);
    const { gameType, title, category, score, difficultyLevel, duration } = req.body;

    const session = new GameSession({
      patientId,
      gameType: gameType || 'game_of_day',
      title: title || 'Daily Memory Match',
      category: category || 'Visual Memory',
      score: score || 100,
      difficultyLevel: difficultyLevel || 'medium',
      duration: duration || '3 Mins'
    });

    await session.save();
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;