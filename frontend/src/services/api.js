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
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/reminders`);
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acknowledged: nextAcknowledged })
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn(`⚠️ Could not update reminder ${reminderId} in backend:`, err.message);
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

// 9. Send Patient AI Chat Message (Gemini Backend)
export async function sendPatientChatMessage(patientId, message, history = []) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Chatbot request failed');
    }
    return data;
  } catch (err) {
    console.error('Patient Chat API error:', err.message);
    throw err;
  }
}
