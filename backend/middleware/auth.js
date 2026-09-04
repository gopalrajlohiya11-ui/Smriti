const jwt = require('jsonwebtoken');
const Caregiver = require('../models/Caregiver');
const Patient = require('../models/patient');

const JWT_SECRET = process.env.JWT_SECRET || 'smriti-hackathon-secret-key-2026';

/**
 * Middleware: Requires a valid Caregiver JWT session
 */
const authenticateCaregiver = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Please log in as a caregiver.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication token missing.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({ error: 'Invalid or expired session token. Please log in again.' });
    }

    if (decoded.type && decoded.type !== 'caregiver') {
      return res.status(403).json({ error: 'Access denied: Caregiver role required.' });
    }

    const caregiver = await Caregiver.findById(decoded.id);
    if (!caregiver) {
      return res.status(401).json({ error: 'Caregiver account not found or deactivated.' });
    }

    req.caregiver = caregiver;
    req.user = { id: caregiver._id, type: 'caregiver', email: caregiver.email, role: caregiver.role };
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Internal error during authentication: ' + err.message });
  }
};

/**
 * Middleware: Requires a valid Patient JWT session
 */
const authenticatePatient = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Please log in with your PIN.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication token missing.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({ error: 'Invalid or expired patient token. Please log in again.' });
    }

    const patientId = decoded.patientId || decoded.id;
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(401).json({ error: 'Patient account not found.' });
    }

    req.patient = patient;
    req.user = { id: patient._id, type: 'patient', name: patient.name };
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Internal error during authentication: ' + err.message });
  }
};

/**
 * Middleware: Accepts either a valid Caregiver OR Patient session
 */
const authenticateAny = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication token missing.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({ error: 'Invalid or expired session token.' });
    }

    if (decoded.type === 'patient' || decoded.patientId) {
      const patientId = decoded.patientId || decoded.id;
      const patient = await Patient.findById(patientId);
      if (patient) {
        req.patient = patient;
        req.user = { id: patient._id, type: 'patient' };
        return next();
      }
    }

    // Otherwise check for Caregiver
    const caregiverId = decoded.id;
    const caregiver = await Caregiver.findById(caregiverId);
    if (caregiver) {
      req.caregiver = caregiver;
      req.user = { id: caregiver._id, type: 'caregiver' };
      return next();
    }

    return res.status(401).json({ error: 'No matching user found for this token.' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal error during authentication: ' + err.message });
  }
};

/**
 * In-memory sliding rate limiter for login & signup endpoints
 * Max 10 attempts per 15 minutes per IP
 */
const loginAttemptMap = new Map();

const rateLimitLogin = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10;

  const clientData = loginAttemptMap.get(ip) || { count: 0, firstAttempt: now };

  if (now - clientData.firstAttempt > windowMs) {
    // Reset window
    loginAttemptMap.set(ip, { count: 1, firstAttempt: now });
    return next();
  }

  if (clientData.count >= maxAttempts) {
    const retryAfterMins = Math.ceil((windowMs - (now - clientData.firstAttempt)) / 60000);
    return res.status(429).json({
      error: `Too many login attempts. Please try again in ${retryAfterMins} minute(s).`
    });
  }

  clientData.count += 1;
  loginAttemptMap.set(ip, clientData);
  next();
};

module.exports = {
  JWT_SECRET,
  authenticateCaregiver,
  authenticatePatient,
  authenticateAny,
  rateLimitLogin
};
