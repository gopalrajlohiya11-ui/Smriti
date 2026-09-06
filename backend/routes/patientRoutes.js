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
      { expiresIn: '30d' }
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
      { expiresIn: '30d' }
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
      patient = await Patient.findOne({ name: /Ramesh Sharma/i });
    }
    if (!patient) {
      patient = await Patient.findOne({ name: new RegExp(id.trim(), 'i') });
    }
    if (!patient) {
      patient = await Patient.findOne({ name: /Ramesh Sharma/i }) || await Patient.findOne();
    }
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: Verify if a caregiver has access to a specific patient
const caregiverHasAccessToPatient = (caregiver, patient) => {
  if (!caregiver || !patient) return false;
  if (caregiver.role === 'clinician' && !patient.caregiverId) return true; // Unassigned demo records accessible to clinicians
  const isDirectOwner = patient.caregiverId && patient.caregiverId.toString() === caregiver._id.toString();
  const isInAssignedList = caregiver.patientIds && caregiver.patientIds.some(pid => pid.toString() === patient._id.toString());
  return isDirectOwner || isInAssignedList;
};

// 2. Get patients: GET /api/patients (Scoped strictly to the authenticated caregiver)
router.get('/', authenticateCaregiver, async (req, res) => {
  try {
    const caregiver = req.caregiver;
    
    // Find all patients owned by or assigned to this caregiver
    const query = {
      $or: [
        { caregiverId: caregiver._id },
        { _id: { $in: caregiver.patientIds || [] } }
      ]
    };

    const patients = await Patient.find(query).sort({ createdAt: -1 });
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

    // Hash PIN (default 1234 if not provided)
    const pinToHash = (pin && pin.toString().length === 4) ? pin.toString() : '1234';
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
      notes: notes || 'Enjoys morning walks and daily memory routines.',
      medicalNotes: medicalNotes || 'Prescribed daily memory vitamins. BP stable.',
      avatar: avatar || 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80',
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

    // Auto-seed today's 10 standard daily reminders for this patient
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();

    await Reminder.insertMany([
      { patientId: patient._id, type: 'meal', title: 'Morning Breakfast & Tea', detail: 'Healthy breakfast with warm tea', scheduledTime: new Date(y, m, d, 8, 0, 0), acknowledged: false },
      { patientId: patient._id, type: 'medicine', title: 'Morning Prescription', detail: 'Donepezil 5mg & blood pressure tablets', scheduledTime: new Date(y, m, d, 8, 45, 0), acknowledged: false },
      { patientId: patient._id, type: 'hydration', title: 'Mid-Morning Hydration', detail: 'Drink 1 full glass of water', scheduledTime: new Date(y, m, d, 10, 30, 0), acknowledged: false },
      { patientId: patient._id, type: 'game', title: 'Memory Game of the Day', detail: '10-minute memory match activity', scheduledTime: new Date(y, m, d, 11, 30, 0), acknowledged: false },
      { patientId: patient._id, type: 'meal', title: 'Nutritious Lunch', detail: 'Warm meal with vegetables & lentils', scheduledTime: new Date(y, m, d, 13, 0, 0), acknowledged: false },
      { patientId: patient._id, type: 'hydration', title: 'Afternoon Hydration', detail: 'Glass of water or herbal tea', scheduledTime: new Date(y, m, d, 14, 30, 0), acknowledged: false },
      { patientId: patient._id, type: 'activity', title: 'Evening Garden Walk', detail: '15 mins light stretching or walking', scheduledTime: new Date(y, m, d, 16, 30, 0), acknowledged: false },
      { patientId: patient._id, type: 'appointment', title: 'Evening Caregiver Check-in', detail: 'Daily routine review with caregiver', scheduledTime: new Date(y, m, d, 18, 30, 0), acknowledged: false },
      { patientId: patient._id, type: 'meal', title: 'Light Dinner', detail: 'Easily digestible dinner', scheduledTime: new Date(y, m, d, 19, 45, 0), acknowledged: false },
      { patientId: patient._id, type: 'medicine', title: 'Night Medicine & Wind Down', detail: 'Bedtime prescription & rest', scheduledTime: new Date(y, m, d, 20, 30, 0), acknowledged: false }
    ]);

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

// 6. Get a patient's reminders: GET /api/patients/:id/reminders
router.get('/:id/reminders', optionalAuth, async (req, res) => {
  try {
    let patientId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      if (patientId === 'pat-2') {
        const p = await Patient.findOne({ name: /Meera/i });
        if (p) patientId = p._id;
      } else if (patientId === 'pat-3') {
        const p = await Patient.findOne({ name: /Biren/i });
        if (p) patientId = p._id;
      } else if (patientId === 'pat-1' || patientId === 'default') {
        const p = await Patient.findOne({ name: /Ramesh/i });
        if (p) patientId = p._id;
      } else {
        const byName = await Patient.findOne({ name: new RegExp(patientId.trim(), 'i') });
        if (byName) {
          patientId = byName._id;
        } else {
          const demoPat = await Patient.findOne({ name: /Ramesh Sharma/i }) || await Patient.findOne();
          if (demoPat) patientId = demoPat._id;
        }
      }
    }
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

router.post('/:id/chat', authenticateAny, async (req, res) => {
  try {
    const { message, history, audioData, mimeType } = req.body;
    const patientId = req.params.id;

    if ((!message || !message.trim()) && !audioData) {
      return res.status(400).json({ error: 'A message text or audio recording is required.' });
    }

    const patient = await Patient.findById(patientId);
    if (patient) {
      if (req.caregiver && !caregiverHasAccessToPatient(req.caregiver, patient)) {
        return res.status(403).json({ error: 'Forbidden: You do not have access to chat for this patient.' });
      }
      if (req.patient && req.patient._id.toString() !== patient._id.toString()) {
        return res.status(403).json({ error: 'Forbidden: You cannot chat on behalf of another patient.' });
      }
    }

    const result = await generatePatientChatReply(
      patientId, 
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
    res.status(500).json({ error: err.message });
  }
});

// 10. Memory Bank Photos: GET /api/patients/:id/photos
router.get('/:id/photos', optionalAuth, async (req, res) => {
  try {
    const patientId = req.params.id;
    let photos = await MemoryBankPhoto.find({ patientId }).sort({ createdAt: -1 });
    
    // If no custom photos uploaded yet, seed default elderly-friendly family photos
    if (photos.length === 0) {
      const defaultPhotos = [
        {
          patientId,
          photoUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop&q=80',
          title: 'Family Gathering at Kaziranga',
          taggedName: 'Dr. Ananya & Family',
          relation: 'Daughter & Grandchildren',
          year: '2023',
          location: 'Kaziranga, Assam',
          description: 'A cheerful sunny afternoon enjoying traditional tea and family stories with the grandchildren.',
          audioPrompt: 'This was taken during our memorable family holiday in Kaziranga National Park.'
        },
        {
          patientId,
          photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
          title: 'Morning Garden Walk with Meera',
          taggedName: 'Meera Baruah',
          relation: 'Sister',
          year: '2022',
          location: 'Shillong, Meghalaya',
          description: 'Walking past the fresh pine trees and morning orchids in Shillong.',
          audioPrompt: 'Remember the fresh morning pine breeze and quiet laughter with Meera in Shillong.'
        },
        {
          patientId,
          photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
          title: 'Biren & Old Friends Reunion',
          taggedName: 'Biren Das',
          relation: 'Lifelong Friend',
          year: '2021',
          location: 'Jorhat, Assam',
          description: 'Annual cultural festival meetup sharing Assam tea and playing chess.',
          audioPrompt: 'Your wonderful afternoon with Biren Das celebrating Bihu melodies in Jorhat.'
        }
      ];

      photos = await MemoryBankPhoto.insertMany(defaultPhotos);
    }

    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Add Memory Bank Photo: POST /api/patients/:id/photos
router.post('/:id/photos', authenticateAny, async (req, res) => {
  try {
    const patientId = req.params.id;
    const { photoUrl, title, taggedName, relation, year, location, description, audioPrompt } = req.body;

    if (!photoUrl) {
      return res.status(400).json({ error: 'photoUrl is required.' });
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
      audioPrompt: audioPrompt || ''
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
    const { id: patientId, photoId } = req.params;
    await MemoryBankPhoto.findOneAndDelete({ _id: photoId, patientId });
    res.json({ status: 'ok', message: 'Photo deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 13. Game Sessions & Cognitive Scores: GET /api/patients/:id/games
router.get('/:id/games', authenticateAny, async (req, res) => {
  try {
    const patientId = req.params.id;
    const sessions = await GameSession.find({ patientId }).sort({ timestamp: -1 }).limit(30);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 14. Record Completed Game Session: POST /api/patients/:id/games
router.post('/:id/games', authenticateAny, async (req, res) => {
  try {
    const patientId = req.params.id;
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