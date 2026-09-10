import { defaultGameSessionsByPatient } from '../data/mockData';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/+$/, '')}/api`;
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Helper for fast-aborting network requests with timeout
export async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error(`Network timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

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
    const response = await fetchWithTimeout(`${API_BASE_URL}/caregivers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }, 8000);
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

// 2b. Caregiver Forgot Password Reset Request
export async function requestCaregiverPasswordResetApi(email) {
  try {
    const response = await fetch(`${API_BASE_URL}/caregivers/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to send password reset instructions');
    return data;
  } catch (err) {
    console.error('Caregiver forgot password API error:', err.message);
    throw err;
  }
}

// 2c. Register Biometric for Caregiver
export async function registerCaregiverBiometricApi(credentialId) {
  try {
    const response = await fetch(`${API_BASE_URL}/caregivers/register-biometric`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ credentialId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to register biometric credentials');
    return data;
  } catch (err) {
    console.error('Caregiver biometric registration API error:', err.message);
    throw err;
  }
}

// 2d. Caregiver Biometric Login
export async function loginCaregiverBiometricApi(credentialId, email) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/caregivers/biometric-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credentialId, email })
    }, 2500);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Biometric authentication failed');
    return data;
  } catch (err) {
    console.error('Caregiver biometric login API error:', err.message);
    throw err;
  }
}

// 3. Patient Login (Name/Age/PIN keypad)
export async function loginPatientApi(name, age, pin, phoneNumber) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/patients/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, age, pin, phoneNumber })
    }, 8000);
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/patients/biometric-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credentialId, patientId, name })
    }, 2500);
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/patients/${patientId}/register-biometric`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ credentialId, publicKey })
    }, 2500);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to register biometric');
    return data;
  } catch (err) {
    console.error('Register biometric API error:', err.message);
    throw err;
  }
}

// 4. Fetch Real Patients from MongoDB (Caregiver-Scoped with Batch Reminders)
export async function fetchRealPatients(includeReminders = true) {
  try {
    const url = `${API_BASE_URL}/patients${includeReminders ? '?batch=true&includeReminders=true' : ''}`;
    const response = await fetchWithTimeout(url, {
      headers: getAuthHeaders()
    }, 2500);
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/patients/me`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, 2000);
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

// 6c. Fetch Default or Public Patient Profile
export async function fetchDefaultPatientApi() {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/public/default`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn('⚠️ Could not fetch default public patient:', err.message);
    return null;
  }
}

// 6d. Fetch Specific Public Patient Profile
export async function fetchPublicPatientApi(patientId = 'default') {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/public/${patientId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn(`⚠️ Could not fetch public patient ${patientId}:`, err.message);
    return null;
  }
}

// 7. Fetch Real Reminders for Patient
export async function fetchPatientReminders(patientId) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/patients/${patientId}/reminders`, {
      headers: getAuthHeaders()
    }, 2000);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn(`⚠️ Could not fetch real reminders for patient ${patientId}:`, err.message);
    return null;
  }
}

// 8. Toggle Reminder Completion in MongoDB
export async function toggleReminderStatus(reminderId, nextAcknowledged, patientId, reminderData = {}) {
  try {
    const payload = {
      acknowledged: nextAcknowledged,
      patientId: patientId || undefined,
      type: reminderData.type,
      title: reminderData.title,
      scheduledTime: reminderData.scheduledTime
    };

    const response = await fetchWithTimeout(`${API_BASE_URL}/reminders/${reminderId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    }, 2500);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn(`⚠️ Could not update reminder ${reminderId} in backend:`, err.message);
    throw err;
  }
}

// 8a-1. Create Single Reminder
export async function createReminderApi(patientId, reminderData) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/reminders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ patientId, ...reminderData })
    }, 3000);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn(`⚠️ Could not create reminder in backend:`, err.message);
    throw err;
  }
}

// 8a-2. Create Batch Reminders / Apply Template
export async function createBatchRemindersApi(patientId, reminders, replaceExisting = true) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/reminders/batch`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ patientId, reminders, replaceExisting })
    }, 5000);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn(`⚠️ Could not batch create reminders in backend:`, err.message);
    throw err;
  }
}

// 8a-3. Edit/Update Reminder Full Details
export async function updateReminderApi(reminderId, reminderData) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/reminders/${reminderId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(reminderData)
    }, 3000);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn(`⚠️ Could not update reminder ${reminderId} in backend:`, err.message);
    throw err;
  }
}

// 8a-4. Delete Single Reminder
export async function deleteReminderApi(reminderId, patientId) {
  try {
    const query = patientId ? `?patientId=${patientId}` : '';
    const response = await fetchWithTimeout(`${API_BASE_URL}/reminders/${reminderId}${query}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }, 3000);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn(`⚠️ Could not delete reminder ${reminderId} in backend:`, err.message);
    throw err;
  }
}

// 8a-5. Clear All Reminders for Patient
export async function clearPatientRemindersApi(patientId) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/reminders/patient/${patientId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }, 3000);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn(`⚠️ Could not clear reminders for patient ${patientId}:`, err.message);
    throw err;
  }
}

// 8b. Fetch Memory Bank Photos from MongoDB
export async function fetchPatientPhotos(patientId) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/patients/${patientId}/photos`, {
      headers: getAuthHeaders()
    }, 2000);
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/patients/${patientId}/photos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(photoData)
    }, 3000);
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/patients/${patientId}/photos/${photoId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }, 2500);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error('Failed to delete photo:', err.message);
    throw err;
  }
}

// 8e. Fetch Game Sessions from MongoDB (GET /api/game-sessions/:patientId)
export async function fetchPatientGameSessions(patientId) {
  if (!patientId) return [];
  const cleanId = String(patientId?._id || patientId?.id || patientId);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`${API_BASE_URL}/game-sessions/${cleanId}`, {
      headers: getAuthHeaders(),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data;
      }
    }

    // Fallback to /api/patients/:id/games
    const fallbackRes = await fetchWithTimeout(`${API_BASE_URL}/patients/${cleanId}/games`, {
      headers: getAuthHeaders()
    }, 2000);
    if (fallbackRes.ok) {
      const fallbackData = await fallbackRes.json();
      if (Array.isArray(fallbackData)) {
        return fallbackData;
      }
    }

    // Offline / demo fallback ONLY for demo IDs
    const isDemoId = cleanId === 'pat-1' || cleanId === 'pat-2' || cleanId === '6a9e533f65c0817eb2016cc8' || cleanId === '6a9e533f65c0817eb2016cc9' || cleanId.toLowerCase().includes('ramesh') || cleanId.toLowerCase().includes('meera');
    if (isDemoId) {
      const key = cleanId.toLowerCase().includes('meera') || cleanId === 'pat-2' || cleanId === '6a9e533f65c0817eb2016cc9' ? 'pat-2' : 'pat-1';
      return defaultGameSessionsByPatient[key] || defaultGameSessionsByPatient['pat-1'] || [];
    }
    return [];
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`⚠️ Offline fallback for patient ${cleanId}:`, err.message);
    const isDemoId = cleanId === 'pat-1' || cleanId === 'pat-2' || cleanId === '6a9e533f65c0817eb2016cc8' || cleanId === '6a9e533f65c0817eb2016cc9' || cleanId.toLowerCase().includes('ramesh') || cleanId.toLowerCase().includes('meera');
    if (isDemoId) {
      const key = cleanId.toLowerCase().includes('meera') || cleanId === 'pat-2' || cleanId === '6a9e533f65c0817eb2016cc9' ? 'pat-2' : 'pat-1';
      return defaultGameSessionsByPatient[key] || defaultGameSessionsByPatient['pat-1'] || [];
    }
    return [];
  }
}

// 8f. Record Game Session in MongoDB
export async function recordGameSessionApi(patientId, gameData) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/patients/${patientId}/games`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(gameData)
    }, 2500);
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/reminders/${reminderId}/dismiss`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    }, 2000);
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/reminders/alerts`, {
      headers: getAuthHeaders()
    }, 2000);
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

// 10. Submit Completed Game Session (POST /api/game-sessions)
export async function submitGameSessionApi(sessionData) {
  try {
    const token = localStorage.getItem('smriti_patient_token') || localStorage.getItem('smriti_caregiver_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/game-sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(sessionData)
    });

    if (!response.ok) {
      // Fallback endpoint: /api/patients/:id/games
      if (sessionData.patientId) {
        const fallbackRes = await fetch(`${API_BASE_URL}/patients/${sessionData.patientId}/games`, {
          method: 'POST',
          headers,
          body: JSON.stringify(sessionData)
        });
        if (fallbackRes.ok) return await fallbackRes.json();
      }
      throw new Error(`HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.warn('Game session API error (may be offline):', err.message);
    throw err;
  }
}

// 11. Fetch Real ML Cognitive Health Score & Clinical Status (GET /api/game-sessions/ml-health-score/:patientId)
export async function fetchPatientMLHealthScore(patientId) {
  const cleanId = patientId?._id || patientId?.id || patientId;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s safety timeout

  try {
    const token = localStorage.getItem('smriti_caregiver_token') || localStorage.getItem('smriti_patient_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/game-sessions/ml-health-score/${cleanId}`, {
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('ML health score API warning (fallback active):', err.message);
    const isDemoId = cleanId === 'pat-1' || cleanId === 'pat-2' || cleanId === '6a9e533f65c0817eb2016cc8' || cleanId === '6a9e533f65c0817eb2016cc9' || (typeof cleanId === 'string' && (cleanId.toLowerCase().includes('ramesh') || cleanId.toLowerCase().includes('meera')));
    if (isDemoId) {
      return {
        cognitiveHealthScore: 88,
        clinicalStatus: 'Stable',
        source: 'fallback',
        weeklyAggregates: { gamesPlayedThisWeek: 4, avgReactionTime: 2.8, totalMistakesThisWeek: 2 }
      };
    }
    return {
      cognitiveHealthScore: 0,
      clinicalStatus: 'Pending Assessment',
      source: 'baseline',
      weeklyAggregates: { gamesPlayedThisWeek: 0, avgReactionTime: 0, totalMistakesThisWeek: 0 }
    };
  }
}

// 12. Direct Adaptive Difficulty Evaluation (POST /api/game-sessions/adaptive-difficulty)
export async function fetchAdaptiveDifficultyApi(telemetry) {
  try {
    const response = await fetch(`${API_BASE_URL}/game-sessions/adaptive-difficulty`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(telemetry)
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn('Adaptive difficulty API warning:', err.message);
    return { difficulty: 2, reasoning: 'Standard baseline tier active.', source: 'fallback' };
  }
}

// 13. Fetch Last Recommended ML Difficulty for Patient (GET /api/game-sessions/:patientId/last-difficulty?gameType=...)
export async function fetchLastGameDifficulty(patientId, gameType = '') {
  const cleanId = String(patientId?._id || patientId?.id || patientId || 'default');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const token = localStorage.getItem('smriti_caregiver_token') || localStorage.getItem('smriti_patient_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = `${API_BASE_URL}/game-sessions/${cleanId}/last-difficulty${gameType ? `?gameType=${gameType}` : ''}`;
    const response = await fetch(url, {
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      return await response.json();
    }
    throw new Error(`HTTP error ${response.status}`);
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`Could not fetch last difficulty for ${gameType} (${cleanId}):`, err.message);
    return {
      status: 'fallback',
      aiDifficulty: 2,
      aiReasoning: 'Standard starting baseline.',
      aiSource: 'fallback',
      hasHistory: false
    };
  }
}

// Fast in-memory caches for speech & translation to achieve 0ms instant playback
const frontendTranslationCache = new Map();
const frontendSynthesisCache = new Map();

// 14. Translate Speech / Reminders into Regional Dialect (POST /api/translation/translate)
export async function translateSpeechApi({ textToSpeak, targetLanguage = 'en' }) {
  if (!textToSpeak) return { translated_text: '', original_text: '', source: 'empty' };

  const cleanLang = (targetLanguage || 'en').split('-')[0].split('_')[0].toLowerCase();
  const cacheKey = `${cleanLang}:${textToSpeak.trim()}`;
  if (frontendTranslationCache.has(cacheKey)) {
    return frontendTranslationCache.get(cacheKey);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(`${API_BASE_URL}/translation/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ textToSpeak, targetLanguage: cleanLang }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      frontendTranslationCache.set(cacheKey, data);
      return data;
    }
    throw new Error(`HTTP error ${response.status}`);
  } catch (err) {
    clearTimeout(timeoutId);

    // Direct fallback to ML microservice on Render with fast 3.5s timeout
    try {
      const directController = new AbortController();
      const directTimeoutId = setTimeout(() => directController.abort(), 3500);

      const directRes = await fetch('https://dementia-ai-engine.onrender.com/speak_regional_reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text_to_speak: textToSpeak,
          target_language: cleanLang
        }),
        signal: directController.signal
      });
      clearTimeout(directTimeoutId);

      if (directRes.ok) {
        const data = await directRes.json();
        const resObj = {
          translated_text: data.translated_text || data.spoken_text || textToSpeak,
          original_text: textToSpeak,
          target_language: targetLanguage,
          source: 'direct_live_api'
        };
        frontendTranslationCache.set(cacheKey, resObj);
        return resObj;
      }
    } catch (directErr) {
      // Graceful fallback
    }

    // Ultimate safe fallback: Return original untranslated text
    return {
      translated_text: textToSpeak,
      original_text: textToSpeak,
      target_language: targetLanguage,
      source: 'fallback_original'
    };
  }
}

// 14b. Synthesize Speech with Bhashini Base64 Audio (POST /api/speech/synthesize)
export async function synthesizeSpeechApi({ textToSpeak, targetLanguage = 'en' }) {
  if (!textToSpeak) return { audio_base64: null, spoken_text: '', translated_text: '', source: 'empty' };

  const cleanLang = (targetLanguage || 'en').split('-')[0].split('_')[0].toLowerCase();
  const cacheKey = `${cleanLang}:${textToSpeak.trim()}`;
  if (frontendSynthesisCache.has(cacheKey)) {
    return frontendSynthesisCache.get(cacheKey);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(`${API_BASE_URL}/speech/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ textToSpeak, targetLanguage: cleanLang }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.audio_base64) {
        frontendSynthesisCache.set(cacheKey, data);
      }
      return data;
    }
    throw new Error(`HTTP error ${response.status}`);
  } catch (err) {
    clearTimeout(timeoutId);

    // Direct fallback to ML microservice on Render
    try {
      const directController = new AbortController();
      const directTimeoutId = setTimeout(() => directController.abort(), 3500);

      const directRes = await fetch('https://dementia-ai-engine.onrender.com/synthesize_speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text_to_speak: textToSpeak,
          target_language: cleanLang
        }),
        signal: directController.signal
      });
      clearTimeout(directTimeoutId);

      if (directRes.ok) {
        const data = await directRes.json();
        const resObj = {
          audio_base64: data.audio_base64 || null,
          spoken_text: data.spoken_text || data.translated_text || textToSpeak,
          translated_text: data.spoken_text || data.translated_text || textToSpeak,
          original_text: textToSpeak,
          target_language: targetLanguage,
          engine: data.engine || 'direct_bhashini_fallback',
          source: 'direct_microservice'
        };
        if (resObj.audio_base64) {
          frontendSynthesisCache.set(cacheKey, resObj);
        }
        return resObj;
      }
    } catch (directErr) {
      // Fallback
    }

    return {
      audio_base64: null,
      spoken_text: textToSpeak,
      translated_text: textToSpeak,
      original_text: textToSpeak,
      target_language: targetLanguage,
      source: 'fallback_error',
      error: err.message
    };
  }
}

// 18. Delete Caregiver Account & Cascade All Associated Patient Records: DELETE /api/caregivers/me
export async function deleteCaregiverAccountApi() {
  const token = localStorage.getItem('smriti_caregiver_token');
  const response = await fetch(`${API_BASE_URL}/caregivers/me`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete caregiver account');
  }

  return await response.json();
}


