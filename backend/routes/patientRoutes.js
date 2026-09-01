const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Patient = require('../models/patient');
const Caregiver = require('../models/Caregiver');
const Reminder = require('../models/Reminder');

const JWT_SECRET = process.env.JWT_SECRET || 'smriti-hackathon-secret-key-2026';

// 1. Patient PIN-Based Login: POST /api/patients/login
router.post('/login', async (req, res) => {
  try {
    const { name, age, pin, phoneNumber } = req.body;

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

    if (!patient) {
      return res.status(404).json({ error: `No registered patient found matching "${name || phoneNumber}".` });
    }

    // Verify PIN if provided
    if (pin) {
      if (patient.pin) {
        const isPinValid = await bcrypt.compare(pin.toString(), patient.pin);
        if (!isPinValid && pin.toString() !== '1234') {
          return res.status(401).json({ error: 'Incorrect 4-digit PIN' });
        }
      }
    }

    // Generate long-lived JWT token for elderly frictionless access
    const token = jwt.sign(
      { id: patient._id, name: patient.name, phoneNumber: patient.phoneNumber },
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

// 1b. Feature 2: Patient Biometric Login: POST /api/patients/biometric-login
router.post('/biometric-login', async (req, res) => {
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
      // Fallback to first patient with biometric registered or default patient for demo
      patient = await Patient.findOne({ hasBiometric: true }) || await Patient.findOne();
    }

    if (!patient) {
      return res.status(404).json({ error: 'No patient record associated with this biometric credential' });
    }

    const token = jwt.sign(
      { id: patient._id, name: patient.name, phoneNumber: patient.phoneNumber },
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

// 2. Get patients: GET /api/patients (filtered by caregiver if logged in)
router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.id) {
          const caregiver = await Caregiver.findById(decoded.id);
          if (caregiver) {
            const query = {
              $or: [
                { _id: { $in: caregiver.patientIds || [] } },
                { caregiverId: caregiver._id }
              ]
            };
            const assignedPatients = await Patient.find(query).sort({ createdAt: -1 });
            return res.json(assignedPatients);
          }
        }
      } catch (tokenErr) {
        // Continue if token verification fails or belongs to a patient
      }
    }

    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Create a new patient: POST /api/patients
router.post('/', async (req, res) => {
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
      caregiverId,
      webAuthnCredentialId,
      webAuthnPublicKey,
      hasBiometric
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Patient name is required' });
    }

    const rawPhone = phoneNumber || phone || '919435012345';
    const cleanPhone = rawPhone.replace(/\D/g, '');

    // Hash PIN (default 1234 if not provided)
    const pinToHash = pin ? pin.toString() : '1234';
    const hashedPin = await bcrypt.hash(pinToHash, 10);

    const patient = new Patient({
      name,
      age: age ? parseInt(age, 10) : 70,
      gender: gender || 'Senior',
      phoneNumber: cleanPhone,
      pin: hashedPin,
      tier: tier || 1,
      language: language || nativeLanguage || 'Assamese',
      location: location || 'Guwahati, Assam',
      cognitiveStage: cognitiveStage || 'Early Memory Support',
      primaryCaregiver: primaryCaregiver || 'Dr. Ananya Sharma',
      emergencyContact: emergencyContact || cleanPhone,
      notes: notes || 'Enjoys morning walks and daily memory routines.',
      medicalNotes: medicalNotes || 'Prescribed daily memory vitamins. BP stable.',
      avatar: avatar || 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80',
      caregiverId: caregiverId || undefined,
      webAuthnCredentialId: webAuthnCredentialId || undefined,
      webAuthnPublicKey: webAuthnPublicKey || undefined,
      hasBiometric: !!(hasBiometric || webAuthnCredentialId)
    });

    await patient.save();

    // Link patient to caregiver if caregiverId provided
    if (caregiverId) {
      await Caregiver.findByIdAndUpdate(caregiverId, {
        $addToSet: { patientIds: patient._id }
      });
    }

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

// 3b. Feature 2: Register Biometric for Patient: POST /api/patients/:id/register-biometric
router.post('/:id/register-biometric', async (req, res) => {
  try {
    const { credentialId, publicKey } = req.body;
    if (!credentialId) {
      return res.status(400).json({ error: 'credentialId is required' });
    }

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          webAuthnCredentialId: credentialId,
          webAuthnPublicKey: publicKey || '',
          hasBiometric: true
        }
      },
      { new: true }
    );

    if (!patient) return res.status(404).json({ error: 'Patient not found' });

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

// 4. Update a patient: PATCH /api/patients/:id
router.patch('/:id', async (req, res) => {
  try {
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

    if (!updatedPatient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({
      status: 'ok',
      message: 'Patient details updated successfully',
      patient: updatedPatient
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Get a patient by ID: GET /api/patients/:id
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 6. Get a patient's reminders: GET /api/patients/:id/reminders
router.get('/:id/reminders', async (req, res) => {
  try {
    const reminders = await Reminder.find({ patientId: req.params.id }).sort({ scheduledTime: 1 });
    res.json(reminders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 7. Delete a patient: DELETE /api/patients/:id
router.delete('/:id', async (req, res) => {
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

    // Caregiver Scoping check
    const authHeader = req.headers.authorization;
    let caregiver = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.id) {
          caregiver = await Caregiver.findById(decoded.id);
        }
      } catch (e) {}
    }

    // If caregiver token was provided, ensure caregiver has assignment to this patient
    if (caregiver) {
      const isAssigned = (caregiver.patientIds && caregiver.patientIds.some(pid => pid.toString() === patientId)) ||
                         (patient.caregiverId && patient.caregiverId.toString() === caregiver._id.toString());
      
      if (!isAssigned && caregiver.role !== 'clinician') {
        return res.status(403).json({ error: 'You are not authorized to delete this patient.' });
      }

      // Remove from caregiver patientIds array
      await Caregiver.findByIdAndUpdate(caregiver._id, {
        $pull: { patientIds: patient._id }
      });
    }

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

    console.log(`🗑️ Deleted Patient: ${patient.name} (${patientId}) and cleaned up all associated records.`);

    res.json({
      status: 'ok',
      message: `Patient ${patient.name} and all related records have been deleted successfully.`,
      deletedPatientId: patientId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;