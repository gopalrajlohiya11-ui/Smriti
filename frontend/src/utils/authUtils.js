/**
 * Authentication and Persistent Session Utilities for Smriti Platform
 */

/**
 * Validates a JWT token by checking structural validity and expiration time.
 * @param {string} token
 * @returns {boolean}
 */
export function isTokenValid(token) {
  if (!token || typeof token !== 'string') return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload) return false;
    if (payload.exp) {
      const nowInSecs = Math.floor(Date.now() / 1000);
      return payload.exp > nowInSecs;
    }
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Safely decodes a JWT payload without verifying signature
 * @param {string} token
 * @returns {object|null}
 */
export function decodeToken(token) {
  if (!isTokenValid(token)) return null;
  try {
    const parts = token.split('.');
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Retrieves and validates the persistent Caregiver session from localStorage
 * @returns {{ isValid: boolean, token: string|null, user: object|null }}
 */
export function getStoredCaregiverSession() {
  const token = localStorage.getItem('smriti_caregiver_token');
  const userJson = localStorage.getItem('smriti_caregiver_user');
  if (!token || !isTokenValid(token)) {
    return { isValid: false, token: null, user: null };
  }
  let user = null;
  if (userJson) {
    try { user = JSON.parse(userJson); } catch {}
  }
  return { isValid: true, token, user };
}

/**
 * Retrieves and validates the persistent Patient session from localStorage
 * @returns {{ isValid: boolean, token: string|null, patientId: string|null }}
 */
export function getStoredPatientSession() {
  const token = localStorage.getItem('smriti_patient_token');
  const patientId = localStorage.getItem('smriti_patient_id');
  if (!token || !isTokenValid(token) || !patientId) {
    return { isValid: false, token: null, patientId: null };
  }
  return { isValid: true, token, patientId };
}

/**
 * Clears Caregiver session credentials from localStorage
 */
export function clearCaregiverSession() {
  localStorage.removeItem('smriti_caregiver_auth');
  localStorage.removeItem('smriti_caregiver_token');
  localStorage.removeItem('smriti_caregiver_user');
}

/**
 * Clears Patient session credentials from localStorage
 */
export function clearPatientSession() {
  localStorage.removeItem('smriti_patient_auth');
  localStorage.removeItem('smriti_patient_token');
  localStorage.removeItem('smriti_patient_id');
}
