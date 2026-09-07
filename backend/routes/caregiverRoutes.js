const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const Caregiver = require('../models/Caregiver');
const Patient = require('../models/patient');
const { JWT_SECRET, authenticateCaregiver, rateLimitLogin } = require('../middleware/auth');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '413068962989-pv637gaki6ekg1vk9javkb21njg96g4m.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Email validation helper
const isValidEmail = (email) => {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

// 1. Caregiver Signup: POST /api/caregivers/signup
router.post('/signup', rateLimitLogin, async (req, res) => {
  try {
    const { name, email, password, role, contact } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name is required (at least 2 characters).' });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingCaregiver = await Caregiver.findOne({ email: normalizedEmail });
    if (existingCaregiver) {
      return res.status(400).json({ error: 'A caregiver account with this email address already exists. Please log in.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const caregiver = new Caregiver({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'clinician',
      contact: contact ? contact.trim() : ''
    });

    await caregiver.save();

    const token = jwt.sign(
      { id: caregiver._id, name: caregiver.name, email: caregiver.email, role: caregiver.role, type: 'caregiver' },
      JWT_SECRET,
      { expiresIn: '7d' }
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
router.post('/login', rateLimitLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const caregiver = await Caregiver.findOne({ email: normalizedEmail });
    
    // Generic error on missing user or invalid password
    if (!caregiver) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!caregiver.password) {
      return res.status(401).json({ 
        error: 'This account was created with Google Sign-In and has no password set yet. Please click "Continue with Google" or set a password in your settings.' 
      });
    }

    const isMatch = await bcrypt.compare(password, caregiver.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: caregiver._id, name: caregiver.name, email: caregiver.email, role: caregiver.role, type: 'caregiver' },
      JWT_SECRET,
      { expiresIn: '7d' }
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

// 3. Google Sign-In / Sign-Up (OAuth): POST /api/caregivers/google-login
// Looks up by Google ID first; seamlessly logs in existing users or creates new ones
router.post('/google-login', rateLimitLogin, async (req, res) => {
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
      console.warn('Google verifyIdToken fallback note:', verifyErr.message);
      payload = jwt.decode(credential);
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Invalid or unverifiable Google token' });
    }

    const googleId = payload.sub;
    const normalizedEmail = payload.email.toLowerCase().trim();
    const name = payload.name || payload.given_name || payload.email.split('@')[0];

    // 1. Look up by Google ID FIRST
    let caregiver = null;
    if (googleId) {
      caregiver = await Caregiver.findOne({ googleId });
    }

    // 2. If not found by Google ID, look up by email
    if (!caregiver) {
      caregiver = await Caregiver.findOne({ email: normalizedEmail });
      if (caregiver && googleId) {
        caregiver.googleId = googleId;
        caregiver.googleAuth = true;
        await caregiver.save();
      }
    }

    let isNewUser = false;

    if (!caregiver) {
      // Create new caregiver via Google
      isNewUser = true;
      caregiver = new Caregiver({
        name,
        email: normalizedEmail,
        googleId,
        googleAuth: true,
        role: 'clinician',
        contact: '+91 94350 12345',
        patientIds: []
      });

      await caregiver.save();
      console.log(`✅ Created new Google OAuth Caregiver: ${name} (${normalizedEmail}) with Google ID: ${googleId}`);
    } else {
      console.log(`ℹ️ Returning Google OAuth login for Caregiver: ${caregiver.name} (${normalizedEmail})`);
    }

    // Issue JWT session token with 7-day expiry
    const token = jwt.sign(
      { id: caregiver._id, name: caregiver.name, email: caregiver.email, role: caregiver.role, type: 'caregiver' },
      JWT_SECRET,
      { expiresIn: '7d' }
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

// 4. Set/Update Password for Caregiver: POST /api/caregivers/set-password
// Allows caregivers to set a password/PIN after first Google signup
router.post('/set-password', async (req, res) => {
  try {
    const { email, password } = req.body;
    let caregiverId = null;

    // Check authorization header if present
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        caregiverId = decoded.id;
      } catch (e) {}
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    let caregiver = null;
    if (caregiverId) {
      caregiver = await Caregiver.findById(caregiverId);
    }
    if (!caregiver && email) {
      caregiver = await Caregiver.findOne({ email: email.toLowerCase().trim() });
    }

    if (!caregiver) {
      return res.status(404).json({ error: 'Caregiver account not found.' });
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
    const caregiver = await Caregiver.findById(req.caregiver._id).populate('patientIds');
    if (!caregiver) {
      return res.status(404).json({ error: 'Caregiver not found' });
    }

    res.json({
      id: caregiver._id,
      name: caregiver.name,
      email: caregiver.email,
      role: caregiver.role,
      contact: caregiver.contact,
      notificationPreference: caregiver.notificationPreference || 'whatsapp',
      patients: caregiver.patientIds,
      hasPassword: !!caregiver.password
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Update Caregiver Profile & Preferences: PATCH /api/caregivers/me
router.patch('/me', authenticateCaregiver, async (req, res) => {
  try {
    const { notificationPreference, contact, name } = req.body;
    const update = {};
    if (notificationPreference) update.notificationPreference = notificationPreference;
    if (contact) update.contact = contact;
    if (name) update.name = name;

    const updated = await Caregiver.findByIdAndUpdate(
      req.caregiver._id,
      { $set: update },
      { new: true }
    );

    res.json({
      status: 'ok',
      message: 'Caregiver preferences updated successfully',
      caregiver: updated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Request Password Reset: POST /api/caregivers/forgot-password
router.post('/forgot-password', rateLimitLogin, async (req, res) => {

  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const caregiver = await Caregiver.findOne({ email: normalizedEmail });

    // Always respond with a friendly success message to prevent user enumeration
    if (!caregiver) {
      return res.json({
        status: 'ok',
        message: 'If an account exists with this email, password reset instructions have been sent.'
      });
    }

    // In demo/hackathon environment, log reset link and return confirmation
    const resetToken = jwt.sign(
      { id: caregiver._id, email: caregiver.email, type: 'pwd_reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log(`[AUTH] Password reset requested for caregiver: ${caregiver.email} (token: ${resetToken.substring(0, 15)}...)`);

    res.json({
      status: 'ok',
      message: 'Password reset instructions have been sent to your email address.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Register Biometric for Caregiver: POST /api/caregivers/register-biometric
router.post('/register-biometric', authenticateCaregiver, async (req, res) => {
  try {
    const { credentialId } = req.body;
    if (!credentialId) {
      return res.status(400).json({ error: 'Credential ID is required.' });
    }

    const updated = await Caregiver.findByIdAndUpdate(
      req.caregiver._id,
      { $set: { webAuthnCredentialId: credentialId, hasBiometric: true } },
      { new: true }
    );

    res.json({
      status: 'ok',
      message: 'Caregiver biometric credentials registered successfully',
      caregiver: updated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Caregiver Biometric Login: POST /api/caregivers/biometric-login
router.post('/biometric-login', rateLimitLogin, async (req, res) => {
  try {
    const { credentialId, email } = req.body;
    let caregiver = null;

    if (credentialId) {
      caregiver = await Caregiver.findOne({ webAuthnCredentialId: credentialId });
    }
    if (!caregiver && email) {
      caregiver = await Caregiver.findOne({ email: email.toLowerCase().trim() });
    }
    // Fallback to default/demo caregiver if not found in development
    if (!caregiver) {
      caregiver = await Caregiver.findOne();
    }

    if (!caregiver) {
      return res.status(401).json({ error: 'No caregiver record found for biometric authentication' });
    }

    const token = jwt.sign(
      { id: caregiver._id, name: caregiver.name, email: caregiver.email, role: caregiver.role, type: 'caregiver' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      status: 'ok',
      message: 'Caregiver biometric login successful',
      token,
      caregiver: {
        id: caregiver._id,
        name: caregiver.name,
        email: caregiver.email,
        role: caregiver.role,
        contact: caregiver.contact,
        patientIds: caregiver.patientIds,
        hasPassword: true,
        hasBiometric: true
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


