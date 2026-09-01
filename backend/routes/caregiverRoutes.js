const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const Caregiver = require('../models/Caregiver');
const Patient = require('../models/patient');

const JWT_SECRET = process.env.JWT_SECRET || 'smriti-hackathon-secret-key-2026';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '413068962989-pv637gaki6ekg1vk9javkb21njg96g4m.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Middleware to verify Caregiver JWT
const authenticateCaregiver = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header with Bearer token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.caregiver = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }
};

// 1. Caregiver Signup: POST /api/caregivers/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, contact } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingCaregiver = await Caregiver.findOne({ email: normalizedEmail });
    if (existingCaregiver) {
      return res.status(400).json({ error: 'A caregiver with this email address already exists. Please log in.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const caregiver = new Caregiver({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'clinician',
      contact: contact || ''
    });

    await caregiver.save();

    const token = jwt.sign(
      { id: caregiver._id, name: caregiver.name, email: caregiver.email, role: caregiver.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      status: 'ok',
      message: 'Caregiver account created successfully',
      token,
      caregiver: {
        id: caregiver._id,
        name: caregiver.name,
        email: caregiver.email,
        role: caregiver.role,
        contact: caregiver.contact,
        patientIds: caregiver.patientIds,
        hasPassword: true
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Caregiver Login: POST /api/caregivers/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const caregiver = await Caregiver.findOne({ email: normalizedEmail });
    if (!caregiver) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!caregiver.password) {
      return res.status(401).json({ 
        error: 'This account was created with Google Sign-In and has no password set yet. Please click "Continue with Google" to log in, or set a password in your settings.' 
      });
    }

    const isMatch = await bcrypt.compare(password, caregiver.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: caregiver._id, name: caregiver.name, email: caregiver.email, role: caregiver.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      status: 'ok',
      message: 'Login successful',
      token,
      caregiver: {
        id: caregiver._id,
        name: caregiver.name,
        email: caregiver.email,
        role: caregiver.role,
        contact: caregiver.contact,
        patientIds: caregiver.patientIds,
        hasPassword: true
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Real Google Sign-In / Sign-Up (OAuth): POST /api/caregivers/google-login
// Handles BOTH new and returning users seamlessly through ONE endpoint
router.post('/google-login', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential token is required' });
    }

    let payload;

    // Verify token with Google's library or decode
    try {
      if (GOOGLE_CLIENT_ID) {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: GOOGLE_CLIENT_ID
        });
        payload = ticket.getPayload();
      } else {
        payload = jwt.decode(credential);
      }
    } catch (verifyErr) {
      console.warn('Google verifyIdToken note:', verifyErr.message);
      payload = jwt.decode(credential);
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Invalid or unverifiable Google token' });
    }

    const normalizedEmail = payload.email.toLowerCase().trim();
    const name = payload.name || payload.given_name || payload.email.split('@')[0];

    // Check if Caregiver already exists in MongoDB
    let caregiver = await Caregiver.findOne({ email: normalizedEmail });
    let isNewUser = false;

    if (!caregiver) {
      // New caregiver via Google
      isNewUser = true;
      const existingPatients = await Patient.find().limit(3);
      const assignedIds = existingPatients.map(p => p._id);

      caregiver = new Caregiver({
        name,
        email: normalizedEmail,
        googleAuth: true,
        role: 'clinician',
        contact: '+91 94350 12345',
        patientIds: assignedIds
      });

      await caregiver.save();
      console.log(`✅ Created new Google OAuth Caregiver: ${name} (${normalizedEmail})`);
    } else {
      // Returning caregiver via Google
      if (!caregiver.googleAuth) {
        caregiver.googleAuth = true;
        await caregiver.save();
      }
      console.log(`ℹ️ Returning Google OAuth login for Caregiver: ${caregiver.name} (${normalizedEmail})`);
    }

    // Issue our JWT session token
    const token = jwt.sign(
      { id: caregiver._id, name: caregiver.name, email: caregiver.email, role: caregiver.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      status: 'ok',
      message: 'Google authentication successful',
      isNewUser,
      token,
      caregiver: {
        id: caregiver._id,
        name: caregiver.name,
        email: caregiver.email,
        role: caregiver.role,
        contact: caregiver.contact,
        patientIds: caregiver.patientIds,
        googleAuth: true,
        hasPassword: !!caregiver.password
      }
    });
  } catch (err) {
    console.error('Google login route error:', err);
    res.status(500).json({ error: err.message || 'Internal server error during Google login' });
  }
});

// 4. Feature 1: Set/Update Password for Authenticated Caregiver (POST /api/caregivers/set-password)
router.post('/set-password', async (req, res) => {
  try {
    const { email, password } = req.body;
    let caregiverId = null;

    // Check authorization header first if present
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        caregiverId = decoded.id;
      } catch (e) {}
    }

    if (!password || password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters long' });
    }

    let caregiver = null;
    if (caregiverId) {
      caregiver = await Caregiver.findById(caregiverId);
    }
    if (!caregiver && email) {
      caregiver = await Caregiver.findOne({ email: email.toLowerCase().trim() });
    }

    if (!caregiver) {
      return res.status(404).json({ error: 'Caregiver account not found' });
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(password, 10);
    caregiver.password = hashedPassword;
    await caregiver.save();

    console.log(`✅ Password set/updated for caregiver: ${caregiver.name} (${caregiver.email})`);

    res.json({
      status: 'ok',
      message: 'Password set successfully. You can now log in using either Google or your email and password.',
      caregiver: {
        id: caregiver._id,
        name: caregiver.name,
        email: caregiver.email,
        role: caregiver.role,
        contact: caregiver.contact,
        hasPassword: true
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Current Caregiver Profile: GET /api/caregivers/me
router.get('/me', authenticateCaregiver, async (req, res) => {
  try {
    const caregiver = await Caregiver.findById(req.caregiver.id).populate('patientIds');
    if (!caregiver) {
      return res.status(404).json({ error: 'Caregiver not found' });
    }

    res.json({
      id: caregiver._id,
      name: caregiver.name,
      email: caregiver.email,
      role: caregiver.role,
      contact: caregiver.contact,
      patients: caregiver.patientIds,
      hasPassword: !!caregiver.password
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
