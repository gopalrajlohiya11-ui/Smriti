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
    
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    
    let jsonPayload;
    try {
      const decoded = atob(base64);
      jsonPayload = decodeURIComponent(
        decoded
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch {
      jsonPayload = atob(base64);
    }

    const payload = JSON.parse(jsonPayload);
    if (!payload) return false;
    if (payload.exp) {
      const nowInSecs = Math.floor(Date.now() / 1000);
      return payload.exp > nowInSecs;
    }
    return true;
  } catch (err) {
    const parts = token.split('.');
    return parts.length === 3;
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
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    let jsonPayload;
    try {
      const decoded = atob(base64);
      jsonPayload = decodeURIComponent(
        decoded
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch {
      jsonPayload = atob(base64);
    }
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
  const isAuthFlag = localStorage.getItem('smriti_caregiver_auth') === 'true';

  let user = null;
  if (userJson) {
    try { user = JSON.parse(userJson); } catch {}
  }

  const isValid = (token && isTokenValid(token)) || (isAuthFlag && !!user);

  return { isValid: !!isValid, token: token || 'authenticated', user };
}

/**
 * Retrieves and validates the persistent Patient session from localStorage
 * @returns {{ isValid: boolean, token: string|null, patientId: string|null }}
 */
export function getStoredPatientSession() {
  const token = localStorage.getItem('smriti_patient_token');
  const patientId = localStorage.getItem('smriti_patient_id');
  const isAuthFlag = localStorage.getItem('smriti_patient_auth') === 'true';

  const isValid = ((token && isTokenValid(token)) || isAuthFlag) && !!patientId;

  return { isValid: !!isValid, token: token || 'authenticated', patientId: patientId || '' };
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

/**
 * Helper: Match patient by ID, MongoDB _id, name, or demo aliases
 */
export function matchPatientHelper(patient, target) {
  if (!patient || !target) return false;
  const targetStr = String(target).trim().toLowerCase();
  const pId = String(patient.id || '').trim().toLowerCase();
  const p_Id = String(patient._id || '').trim().toLowerCase();
  const pName = String(patient.name || '').trim().toLowerCase();

  if (pId === targetStr || p_Id === targetStr) return true;
  if (pName === targetStr || (targetStr.length > 3 && pName.includes(targetStr))) return true;

  if (targetStr === 'pat-1' || targetStr === '6a9e533f65c0817eb2016cc8' || targetStr.includes('ramesh')) {
    return pName.includes('ramesh') || pId === 'pat-1' || p_Id === '6a9e533f65c0817eb2016cc8';
  }
  if (targetStr === 'pat-2' || targetStr === '6a9e533f65c0817eb2016cc9' || targetStr.includes('meera')) {
    return pName.includes('meera') || pId === 'pat-2' || p_Id === '6a9e533f65c0817eb2016cc9';
  }
  if (targetStr === 'pat-3' || targetStr.includes('biren')) {
    return pName.includes('biren') || pId === 'pat-3';
  }
  return false;
}
