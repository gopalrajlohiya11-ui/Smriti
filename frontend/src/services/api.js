// Real Backend API Client for Smriti Application

const API_BASE_URL = 'http://localhost:5000/api';

// Helper for authorized headers
function getAuthHeaders() {
  const token = localStorage.getItem('smriti_caregiver_token') || localStorage.getItem('smriti_patient_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// 1. Caregiver Login (Email + Password)
export async function loginCaregiverApi(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/caregivers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Invalid email or password');
    return data;
  } catch (err) {
    console.error('Caregiver login API error:', err.message);
    throw err;
  }
}

// 1b. Caregiver Google Login (OAuth - New & Returning Users)
export async function loginCaregiverGoogleApi(credential) {
  try {
    const response = await fetch(`${API_BASE_URL}/caregivers/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to authenticate with Google');
    return data;
  } catch (err) {
    console.error('Caregiver Google OAuth API error:', err.message);
    throw err;
  }
}

// 1c. Set / Update Password for Caregiver (Feature 1)
export async function setCaregiverPasswordApi(password, email) {
  try {
    const response = await fetch(`${API_BASE_URL}/caregivers/set-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ password, email })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to set password');
    return data;
  } catch (err) {
    console.error('Set password API error:', err.message);
    throw err;
  }
}

// 1d. Update Caregiver Preferences (Notification Channels, etc.)
export async function updateCaregiverProfileApi(updateData) {
  try {
    const response = await fetch(`${API_BASE_URL}/caregivers/me`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update preferences');
    return data;
  } catch (err) {
    console.error('Update caregiver preferences API error:', err.message);
    throw err;
  }
}

// 2. Caregiver Signup
export async function signupCaregiverApi(caregiverData) {
  try {
    const response = await fetch(`${API_BASE_URL}/caregivers/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caregiverData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to signup caregiver');
    return data;
  } catch (err) {
    console.error('Caregiver signup API error:', err.message);
    throw err;
  }
}

// 3. Patient Login (Name/Age/PIN keypad)
export async function loginPatientApi(name, age, pin, phoneNumber) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, age, pin, phoneNumber })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Patient login failed');
    return data;
  } catch (err) {
    console.error('Patient login API error:', err.message);
    throw err;
  }
}

// 3b. Patient Biometric Login (Feature 2)
export async function loginPatientBiometricApi(credentialId, patientId, name) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/biometric-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credentialId, patientId, name })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Biometric authentication failed');
    return data;
  } catch (err) {
    console.error('Patient biometric login API error:', err.message);
    throw err;
  }
}

// 3c. Register Biometric for Patient (Feature 2)
export async function registerPatientBiometricApi(patientId, credentialId, publicKey) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/register-biometric`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ credentialId, publicKey })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to register biometric');
    return data;
  } catch (err) {
    console.error('Register biometric API error:', err.message);
    throw err;
  }
}

// 4. Fetch Real Patients from MongoDB (Caregiver-Scoped)
export async function fetchRealPatients() {
  try {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn('⚠️ Could not fetch real patients from backend:', err.message);
    return null;
  }
}

// 4b. Fetch Current Logged-In Patient (Patient-Scoped /me)
export async function fetchCurrentPatientApi() {
  try {
    const token = localStorage.getItem('smriti_patient_token');
    if (!token) return null;
    const response = await fetch(`${API_BASE_URL}/patients/me`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn('⚠️ Could not fetch current patient profile:', err.message);
    return null;
  }
}

// 5. Create Real Patient in MongoDB
export async function createPatientApi(patientData) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(patientData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create patient');
    return data;
  } catch (err) {
    console.error('Create patient API error:', err.message);
    throw err;
  }
}

// 6. Update Real Patient in MongoDB
export async function updatePatientApi(patientId, updateData) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update patient');
    return data;
  } catch (err) {
    console.error('Update patient API error:', err.message);
    throw err;
  }
}

// 6b. Delete Patient in MongoDB
export async function deletePatientApi(patientId) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete patient');
    return data;
  } catch (err) {
    console.error('Delete patient API error:', err.message);
    throw err;
  }
}

// 7. Fetch Real Reminders for Patient
export async function fetchPatientReminders(patientId) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/reminders`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn(`⚠️ Could not fetch real reminders for patient ${patientId}:`, err.message);
    return null;
  }
}

// 8. Toggle Reminder Completion in MongoDB
export async function toggleReminderStatus(reminderId, nextAcknowledged) {
  try {
    const response = await fetch(`${API_BASE_URL}/reminders/${reminderId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ acknowledged: nextAcknowledged })
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn(`⚠️ Could not update reminder ${reminderId} in backend:`, err.message);
    return null;
  }
}

// 8b. Fetch Memory Bank Photos from MongoDB
export async function fetchPatientPhotos(patientId) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/photos`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn(`⚠️ Could not fetch photos for patient ${patientId}:`, err.message);
    return null;
  }
}

// 8c. Add Memory Bank Photo to MongoDB
export async function addPatientPhotoApi(patientId, photoData) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/photos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(photoData)
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error('Failed to add photo:', err.message);
    throw err;
  }
}

// 8d. Delete Memory Bank Photo from MongoDB
export async function deletePatientPhotoApi(patientId, photoId) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/photos/${photoId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error('Failed to delete photo:', err.message);
    throw err;
  }
}

// 8e. Fetch Game Sessions from MongoDB
export async function fetchPatientGameSessions(patientId) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/games`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn(`⚠️ Could not fetch game sessions for patient ${patientId}:`, err.message);
    return null;
  }
}

// 8f. Record Game Session in MongoDB
export async function recordGameSessionApi(patientId, gameData) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/games`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(gameData)
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn('Failed to record game session:', err.message);
    return null;
  }
}

// 8b. Dismiss Overdue Alert by Caregiver (Issue 1)
export async function dismissReminderApi(reminderId) {
  try {
    const response = await fetch(`${API_BASE_URL}/reminders/${reminderId}/dismiss`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn(`⚠️ Could not dismiss reminder ${reminderId} in backend:`, err.message);
    return null;
  }
}

// 8c. Fetch Active Overdue Alerts Directly from MongoDB
export async function fetchActiveAlertsApi() {
  try {
    const response = await fetch(`${API_BASE_URL}/reminders/alerts`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();
    return data.alerts || [];
  } catch (err) {
    console.warn('⚠️ Could not fetch real alerts from backend:', err.message);
    return null;
  }
}

// 9. Send Patient AI Chat Message (Gemini Backend with Timeout & Safe JSON Parsing)
export async function sendPatientChatMessage(patientId, message, history = [], audioData = null, mimeType = null) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second safety timeout

  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, audioData, mimeType }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response from chat server:', text.slice(0, 150));
      throw new Error('Server returned an invalid response. Please try again.');
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.details || data.error || 'Chatbot request failed');
    }
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Smriti is taking longer than expected to respond. Please try asking again.');
    }
    console.error('Patient Chat API error:', err.message);
    throw err;
  }
}
