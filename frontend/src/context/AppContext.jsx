import { calculatePatientStreak } from '../utils/streakUtils';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initialPatients, initialRedFlags, regionalLanguages } from '../data/mockData';
import { 
  fetchRealPatients, 
  fetchCurrentPatientApi,
  fetchDefaultPatientApi,
  fetchPublicPatientApi,
  fetchPatientReminders, 
  toggleReminderStatus,
  dismissReminderApi,
  fetchActiveAlertsApi,
  loginCaregiverApi,
  loginCaregiverGoogleApi,
  setCaregiverPasswordApi,
  signupCaregiverApi,
  loginPatientApi,
  loginPatientBiometricApi,
  registerPatientBiometricApi,
  createPatientApi,
  updatePatientApi,
  deletePatientApi,
  fetchPatientPhotos,
  addPatientPhotoApi,
  deletePatientPhotoApi,
  fetchPatientGameSessions,
  recordGameSessionApi
} from '../services/api';
import i18n from '../i18n';
import { 
  cachePatientData, 
  getCachedPatientData, 
  queueOfflineAction, 
  getQueuedOfflineActions, 
  removeQueuedOfflineAction 
} from '../utils/offlineDb';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Network Connectivity State
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [syncToast, setSyncToast] = useState('');

  // Global Language with LocalStorage Persistence & i18n sync
  const [currentLanguage, setCurrentLanguageState] = useState(() => {
    const savedLangCode = localStorage.getItem('smriti_language') || localStorage.getItem('smriti_selected_lang');
    if (savedLangCode) {
      const found = regionalLanguages.find(l => l.code === savedLangCode || l.name === savedLangCode);
      if (found) {
        if (i18n && typeof i18n.changeLanguage === 'function') {
          i18n.changeLanguage(['as', 'hi'].includes(found.code) ? found.code : 'en');
        }
        return found;
      }
    }
    return regionalLanguages[0];
  });

  const setCurrentLanguage = useCallback((lang) => {
    if (!lang) return;
    setCurrentLanguageState(lang);
    if (lang.code) {
      localStorage.setItem('smriti_language', lang.code);
      localStorage.setItem('smriti_selected_lang', lang.code);
      if (i18n && typeof i18n.changeLanguage === 'function') {
        i18n.changeLanguage(['as', 'hi'].includes(lang.code) ? lang.code : 'en');
      }
    }
  }, []);

  // Caregiver Authentication
  const [isCaregiverLoggedIn, setIsCaregiverLoggedIn] = useState(() => {
    return localStorage.getItem('smriti_caregiver_auth') === 'true';
  });
  const [caregiverUser, setCaregiverUser] = useState(() => {
    const saved = localStorage.getItem('smriti_caregiver_user');
    return saved ? JSON.parse(saved) : { name: "Dr. Ananya Sharma", role: "clinician", email: "dr.ananya@smriti.in" };
  });

  // Patient Authentication
  const [activePatientId, setActivePatientId] = useState(() => {
    return localStorage.getItem('smriti_patient_id') || '';
  });
  const [isPatientLoggedIn, setIsPatientLoggedIn] = useState(() => {
    return localStorage.getItem('smriti_patient_auth') === 'true';
  });

  // Patients Data Store
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem('smriti_patients');
    return saved ? JSON.parse(saved) : initialPatients;
  });

  // Red Flags Alert Store
  const [redFlags, setRedFlags] = useState(() => {
    const saved = localStorage.getItem('smriti_red_flags');
    return saved ? JSON.parse(saved) : initialRedFlags;
  });

  // Update pending sync actions count
  const refreshPendingSyncCount = useCallback(async () => {
    try {
      const actions = await getQueuedOfflineActions();
      setPendingSyncCount(actions.length);
    } catch (e) {}
  }, []);

  // Sync queued offline actions when network returns
  const syncOfflineQueue = useCallback(async () => {
    try {
      const queuedActions = await getQueuedOfflineActions();
      if (!queuedActions || queuedActions.length === 0) return;

      console.log(`🌸 [Smriti Offline Sync] Processing ${queuedActions.length} queued action(s)...`);
      let successfulCount = 0;

      for (const item of queuedActions) {
        try {
          if (item.action === 'toggleReminder' && item.reminderId) {
            await toggleReminderStatus(item.reminderId, item.targetAcknowledged, item.patientId, item.reminderData);
            await removeQueuedOfflineAction(item.id);
            successfulCount++;
          }
        } catch (err) {
          console.warn('Failed to sync action:', item, err);
        }
      }

      await refreshPendingSyncCount();
      if (successfulCount > 0) {
        setSyncToast(`✓ Reconnected! Synced ${successfulCount} offline action(s) with your caregiver.`);
        setTimeout(() => setSyncToast(''), 4500);
      }
    } catch (e) {
      console.warn('Offline sync error:', e);
    }
  }, [refreshPendingSyncCount]);

  // Online / Offline Network Event Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineQueue();
      loadRealData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    refreshPendingSyncCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncOfflineQueue, refreshPendingSyncCount]);

  // Fetch real data from backend API (Scoped appropriately for Caregiver vs Patient with Offline Cache fallback)
  const loadRealData = useCallback(async () => {
    const hasCaregiverToken = !!localStorage.getItem('smriti_caregiver_token');
    const hasPatientToken = !!localStorage.getItem('smriti_patient_token');

    // If device is offline, load from cached IndexedDB snapshot
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const targetId = activePatientId || localStorage.getItem('smriti_patient_id') || 'pat-1';
      const cached = await getCachedPatientData(targetId);
      if (cached) {
        setPatients([cached]);
        setActivePatientId(cached.id);
      }
      return;
    }

    // 1. If in Patient Portal Mode (either with patient token or default patient portal view)
    if (!hasCaregiverToken) {
      try {
        let patientRecord = null;
        if (hasPatientToken) {
          patientRecord = await fetchCurrentPatientApi();
        }
        if (!patientRecord || !patientRecord._id) {
          const currentTargetId = activePatientId || localStorage.getItem('smriti_patient_id') || 'pat-1';
          patientRecord = await fetchPublicPatientApi(currentTargetId);
          if (!patientRecord || !patientRecord._id) {
            patientRecord = await fetchDefaultPatientApi();
          }
        }

        if (patientRecord && patientRecord._id) {
          const realReminders = await fetchPatientReminders(patientRecord._id);
          let formattedReminders = [];
          if (realReminders && realReminders.length > 0) {
            formattedReminders = realReminders.map(r => {
              const timeStr = r.scheduledTime 
                ? new Date(r.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '9:00 AM';

              let title = r.title || 'Daily Routine';
              let detail = r.detail || `Scheduled ${r.type}`;
              if (!r.title) {
                if (r.type === 'medicine') title = 'Prescribed Medicine';
                else if (r.type === 'hydration') title = 'Stay Hydrated (Water/Tea)';
                else if (r.type === 'meal') title = 'Nourishing Meal & Tea';
                else if (r.type === 'game') title = 'Memory Game of the Day';
                else if (r.type === 'activity') title = 'Gentle Movement / Walk';
                else if (r.type === 'appointment') title = 'Caregiver Check-in';
                else if (r.type === 'rest') title = 'Calm Rest & Wind Down';
              }

              return {
                id: r._id,
                type: r.type,
                title: title,
                detail: detail,
                time: timeStr,
                status: r.acknowledged ? 'completed' : 'pending',
                acknowledged: !!r.acknowledged,
                dismissed: !!r.dismissed,
                scheduledTime: r.scheduledTime
              };
            });
          }

          const isDemo = patientRecord.isDemoSeed === true || ['Ramesh Sharma', 'Meera Baruah', 'Biren Das'].includes(patientRecord.name);

          const enrichedPatient = {
            id: patientRecord._id,
            name: patientRecord.name,
            age: patientRecord.age || 70,
            gender: patientRecord.gender || 'Senior',
            phone: patientRecord.phoneNumber ? `+${patientRecord.phoneNumber}` : '+91 94350 12345',
            rawPhone: patientRecord.phoneNumber,
            location: patientRecord.location || 'Assam',
            nativeLanguage: patientRecord.language || 'Assamese',
            avatar: patientRecord.avatar || 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80',
            lastActive: 'Active on WhatsApp',
            streakDays: isDemo ? 14 : calculatePatientStreak(patientRecord, [], formattedReminders),
            cognitiveStage: patientRecord.cognitiveStage || 'Early Memory Support',
            primaryCaregiver: patientRecord.primaryCaregiver || 'Dr. Ananya Sharma',
            emergencyContact: patientRecord.emergencyContact || (patientRecord.phoneNumber ? `+${patientRecord.phoneNumber}` : '+91 94350 12345'),
            notes: patientRecord.notes || '',
            medicalNotes: patientRecord.medicalNotes || '',
            todayReminders: formattedReminders,
            reminderHistory: isDemo ? initialPatients[0].reminderHistory : [],
            weeklyPerformance: isDemo ? initialPatients[0].weeklyPerformance : [],
            notificationPreference: patientRecord.notificationPreference || 'whatsapp',
            isDemoSeed: isDemo
          };

          setPatients([enrichedPatient]);
          setActivePatientId(enrichedPatient.id);
          localStorage.setItem('smriti_patient_id', enrichedPatient.id);
          await cachePatientData(enrichedPatient.id, enrichedPatient);
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch patient data online, attempting cached fallback:', err.message);
        const targetId = activePatientId || localStorage.getItem('smriti_patient_id') || 'pat-1';
        const cached = await getCachedPatientData(targetId);
        if (cached) {
          setPatients([cached]);
          setActivePatientId(cached.id);
        }
        return;
      }
    }

    // 2. If Caregiver is logged in (Caregiver Portal Mode)
    if (!hasCaregiverToken) {
      return; // Not logged in as caregiver, don't call /api/patients
    }

    const backendPatients = await fetchRealPatients();
    if (!backendPatients || !Array.isArray(backendPatients)) return;

    if (backendPatients.length === 0) {
      setPatients([]);
      setRedFlags([]);
      setActivePatientId('');
      return;
    }

    // Load real reminders for each backend patient
    const enrichedPatients = await Promise.all(
      backendPatients.map(async (bp, idx) => {
        const realReminders = await fetchPatientReminders(bp._id);
        const fallbackPatient = initialPatients[idx % initialPatients.length] || initialPatients[0];

        let formattedReminders = [];
        if (realReminders && realReminders.length > 0) {
          formattedReminders = realReminders.map(r => {
            const timeStr = r.scheduledTime 
              ? new Date(r.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '9:00 AM';

            let title = r.title || 'Daily Routine';
            let detail = r.detail || `Scheduled ${r.type}`;
            if (!r.title) {
              if (r.type === 'medicine') title = 'Prescribed Medicine';
              else if (r.type === 'hydration') title = 'Stay Hydrated (Water/Tea)';
              else if (r.type === 'meal') title = 'Nourishing Meal & Tea';
              else if (r.type === 'game') title = 'Memory Game of the Day';
              else if (r.type === 'activity') title = 'Gentle Movement / Walk';
              else if (r.type === 'appointment') title = 'Caregiver Check-in';
              else if (r.type === 'rest') title = 'Calm Rest & Wind Down';
            }

            return {
              id: r._id,
              type: r.type,
              title: title,
              detail: detail,
              time: timeStr,
              status: r.acknowledged ? 'completed' : 'pending',
              acknowledged: r.acknowledged,
              dismissed: !!r.dismissed,
              scheduledTime: r.scheduledTime
            };
          });
        } else {
          formattedReminders = fallbackPatient.todayReminders;
        }

        const isDemo = bp.isDemoSeed === true || ['Ramesh Sharma', 'Meera Baruah', 'Biren Das'].includes(bp.name);

        return {
          id: bp._id,
          name: bp.name,
          age: bp.age || fallbackPatient.age,
          gender: bp.gender || fallbackPatient.gender,
          phone: bp.phoneNumber ? `+${bp.phoneNumber}` : fallbackPatient.phone,
          rawPhone: bp.phoneNumber,
          location: bp.location || fallbackPatient.location,
          nativeLanguage: bp.language || fallbackPatient.nativeLanguage,
          avatar: bp.avatar || fallbackPatient.avatar,
          lastActive: isDemo ? 'Active on WhatsApp' : 'New Patient Registered',
          streakDays: isDemo ? (fallbackPatient.streakDays || 14) : calculatePatientStreak(bp, [], formattedReminders),
          cognitiveStage: bp.cognitiveStage || `Tier ${bp.tier || 1} Cognitive Care`,
          primaryCaregiver: bp.primaryCaregiver || fallbackPatient.primaryCaregiver,
          emergencyContact: bp.emergencyContact || (bp.phoneNumber ? `+${bp.phoneNumber}` : fallbackPatient.emergencyContact),
          notes: bp.notes || `Registered WhatsApp patient. Connected to phone +${bp.phoneNumber}.`,
          medicalNotes: bp.medicalNotes || (isDemo ? fallbackPatient.medicalNotes : 'No medical evaluation recorded yet.'),
          todayReminders: formattedReminders,
          reminderHistory: isDemo ? fallbackPatient.reminderHistory : [],
          weeklyPerformance: isDemo ? fallbackPatient.weeklyPerformance : [],
          notificationPreference: bp.notificationPreference || 'whatsapp',
          isDemoSeed: isDemo
        };
      })
    );

    setPatients(enrichedPatients);

    // If active patient ID is not in the loaded patient list, set to the first one
    if (!enrichedPatients.some(p => p.id === activePatientId)) {
      setActivePatientId(enrichedPatients[0]?.id || '');
    }

    // Fetch direct database-synchronized active alerts
    const realDbAlerts = await fetchActiveAlertsApi();
    if (realDbAlerts && Array.isArray(realDbAlerts)) {
      setRedFlags(realDbAlerts);
    }
  }, [activePatientId]);

  // Initial load on mount
  useEffect(() => {
    loadRealData();
    const interval = setInterval(loadRealData, 10000); // 10s live sync
    return () => clearInterval(interval);
  }, [loadRealData]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('smriti_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('smriti_red_flags', JSON.stringify(redFlags));
  }, [redFlags]);

  useEffect(() => {
    localStorage.setItem('smriti_caregiver_auth', isCaregiverLoggedIn);
    if (caregiverUser) {
      localStorage.setItem('smriti_caregiver_user', JSON.stringify(caregiverUser));
    }
  }, [isCaregiverLoggedIn, caregiverUser]);

  useEffect(() => {
    localStorage.setItem('smriti_patient_auth', isPatientLoggedIn);
    if (activePatientId) {
      localStorage.setItem('smriti_patient_id', activePatientId);
    }
  }, [isPatientLoggedIn, activePatientId]);

  // Current active patient object
  const activePatient = patients.find(p => p.id === activePatientId) || patients[0] || initialPatients[0];

  // 1. Caregiver Real Login
  const loginCaregiver = async (email, password) => {
    const data = await loginCaregiverApi(email, password);
    setIsCaregiverLoggedIn(true);
    setCaregiverUser(data.caregiver);
    localStorage.setItem('smriti_caregiver_token', data.token);
    localStorage.setItem('smriti_caregiver_user', JSON.stringify(data.caregiver));
    localStorage.setItem('smriti_caregiver_auth', 'true');
    await loadRealData();
    return { success: true, caregiver: data.caregiver };
  };

  // 1b. Caregiver Google Login (OAuth)
  const loginCaregiverWithGoogle = async (credential) => {
    try {
      const data = await loginCaregiverGoogleApi(credential);
      setIsCaregiverLoggedIn(true);
      setCaregiverUser(data.caregiver);
      localStorage.setItem('smriti_caregiver_token', data.token);
      localStorage.setItem('smriti_caregiver_user', JSON.stringify(data.caregiver));
      localStorage.setItem('smriti_caregiver_auth', 'true');
      await loadRealData();
      return { success: true, caregiver: data.caregiver };
    } catch (err) {
      console.error('Google OAuth login error:', err.message);
      throw err;
    }
  };

  // 1c. Set Backup Password for Caregiver (Feature 1)
  const setCaregiverPassword = async (password) => {
    try {
      const data = await setCaregiverPasswordApi(password, caregiverUser?.email);
      setCaregiverUser(prev => ({ ...prev, hasPassword: true }));
      localStorage.setItem('smriti_caregiver_user', JSON.stringify({ ...caregiverUser, hasPassword: true }));
      return data;
    } catch (err) {
      console.error('Set password error:', err.message);
      throw err;
    }
  };

  // 2. Caregiver Real Signup
  const signupCaregiver = async (caregiverData) => {
    try {
      const data = await signupCaregiverApi(caregiverData);
      setIsCaregiverLoggedIn(true);
      setCaregiverUser(data.caregiver);
      localStorage.setItem('smriti_caregiver_token', data.token);
      localStorage.setItem('smriti_caregiver_user', JSON.stringify(data.caregiver));
      localStorage.setItem('smriti_caregiver_auth', 'true');
      await loadRealData();
      return { success: true, caregiver: data.caregiver };
    } catch (err) {
      throw err;
    }
  };

  const logoutCaregiver = () => {
    setIsCaregiverLoggedIn(false);
    setCaregiverUser(null);
    localStorage.removeItem('smriti_caregiver_auth');
    localStorage.removeItem('smriti_caregiver_token');
    localStorage.removeItem('smriti_caregiver_user');
    localStorage.removeItem('smriti_patients');
    localStorage.removeItem('smriti_red_flags');
    localStorage.removeItem('smriti_patient_id');
    setPatients([]);
    setRedFlags([]);
    setActivePatientId('');
  };

  // 3. Patient Real Login (PIN keypad + Name)
  const loginPatient = async (name, age, pin, remember = true) => {
    try {
      const data = await loginPatientApi(name, age, pin);
      const matchedPatient = data.patient;
      setActivePatientId(matchedPatient._id);
      setIsPatientLoggedIn(true);
      localStorage.setItem('smriti_patient_token', data.token);
      if (remember) {
        localStorage.setItem('smriti_patient_auth', 'true');
        localStorage.setItem('smriti_patient_id', matchedPatient._id);
      }
      await loadRealData();
      return { success: true, patient: matchedPatient };
    } catch (err) {
      console.error('Patient login failed:', err.message);
      throw err;
    }
  };

  // 3b. Patient Biometric Login (Feature 2)
  const loginPatientBiometric = async (credentialId, patientId, name) => {
    try {
      const data = await loginPatientBiometricApi(credentialId, patientId, name);
      const matchedPatient = data.patient;
      setActivePatientId(matchedPatient._id);
      setIsPatientLoggedIn(true);
      localStorage.setItem('smriti_patient_token', data.token);
      localStorage.setItem('smriti_patient_auth', 'true');
      localStorage.setItem('smriti_patient_id', matchedPatient._id);
      await loadRealData();
      return { success: true, patient: matchedPatient };
    } catch (err) {
      console.error('Biometric patient login error:', err.message);
      throw err;
    }
  };

  // 3c. Register Biometric for Patient (Feature 2)
  const registerPatientBiometric = async (patientId, credentialId, publicKey) => {
    try {
      const data = await registerPatientBiometricApi(patientId, credentialId, publicKey);
      await loadRealData();
      return data;
    } catch (err) {
      console.error('Register patient biometric error:', err.message);
      throw err;
    }
  };

  const logoutPatient = () => {
    setIsPatientLoggedIn(false);
    setActivePatientId('');
    localStorage.removeItem('smriti_patient_auth');
    localStorage.removeItem('smriti_patient_token');
    localStorage.removeItem('smriti_patient_id');
  };

  // 4. Create Real Patient in MongoDB
  const addPatient = async (newPatientData) => {
    try {
      const created = await createPatientApi({
        ...newPatientData,
        caregiverId: caregiverUser?.id
      });
      await loadRealData();
      return created;
    } catch (err) {
      console.warn('Failed to create in backend, adding to local store:', err.message);
      const newPatient = {
        id: `pat-${Date.now()}`,
        name: newPatientData.name || "New Patient",
        age: parseInt(newPatientData.age, 10) || 70,
        gender: newPatientData.gender || "Senior",
        phone: newPatientData.phone || "+91 90000 00000",
        location: newPatientData.location || "Guwahati, Assam",
        nativeLanguage: newPatientData.nativeLanguage || "Assamese",
        avatar: newPatientData.avatar || `https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80`,
        lastActive: "Just now",
        streakDays: 0,
        cognitiveStage: newPatientData.cognitiveStage || "Early Memory Support",
        primaryCaregiver: caregiverUser.name,
        emergencyContact: newPatientData.emergencyContact || newPatientData.phone,
        notes: newPatientData.notes || "Newly registered patient profile.",
        medicalNotes: newPatientData.medicalNotes || "General checkup normal.",
        todayReminders: [
          { id: `rem-${Date.now()}-1`, type: "medicine", title: "Morning Medicine", detail: "Daily prescribed medicine", time: "9:00 AM", status: "pending", icon: "Pill" },
          { id: `rem-${Date.now()}-2`, type: "hydration", title: "Fresh Herbal Drink", detail: "1 glass lukewarm water", time: "11:30 AM", status: "pending", icon: "Droplets" },
          { id: `rem-${Date.now()}-3`, type: "activity", title: "Gentle Movement", detail: "10 mins light stretch", time: "4:00 PM", status: "pending", icon: "Footprints" },
          { id: `rem-${Date.now()}-4`, type: "appointment", title: "Evening Check-in", detail: "Caregiver call", time: "6:30 PM", status: "pending", icon: "Calendar" }
        ],
        reminderHistory: [
          { date: "Aug 28", medicine: true, hydration: true, activity: true, appointment: true }
        ],
        weeklyPerformance: [
          { day: "Sat", memoryScore: 70, routineScore: 75, overallScore: 72 },
          { day: "Sun", memoryScore: 72, routineScore: 76, overallScore: 74 },
          { day: "Mon", memoryScore: 75, routineScore: 80, overallScore: 77 },
          { day: "Tue", memoryScore: 78, routineScore: 82, overallScore: 80 },
          { day: "Wed", memoryScore: 80, routineScore: 85, overallScore: 82 },
          { day: "Thu", memoryScore: 82, routineScore: 85, overallScore: 83 },
          { day: "Fri (Today)", memoryScore: 85, routineScore: 88, overallScore: 86 }
        ]
      };

      setPatients(prev => [newPatient, ...prev]);
      return newPatient;
    }
  };

  // 5. Update Real Patient in MongoDB
  const updatePatient = async (patientId, updatedFields) => {
    try {
      // If valid 24-hex MongoDB ID, update on backend
      if (typeof patientId === 'string' && patientId.length === 24) {
        await updatePatientApi(patientId, updatedFields);
      }
    } catch (err) {
      console.warn(`Backend update error for ${patientId}:`, err.message);
    }

    setPatients(prev => {
      const updated = prev.map(p => {
        if (p.id === patientId) {
          return {
            ...p,
            ...updatedFields,
            age: updatedFields.age ? parseInt(updatedFields.age, 10) : p.age
          };
        }
        return p;
      });
      localStorage.setItem('smriti_patients', JSON.stringify(updated));
      return updated;
    });
  };

  // 6. Delete Real Patient in MongoDB
  const deletePatient = async (patientId) => {
    try {
      if (typeof patientId === 'string' && patientId.length === 24) {
        await deletePatientApi(patientId);
      }
      setPatients(prev => {
        const remaining = prev.filter(p => p.id !== patientId && p._id !== patientId);
        localStorage.setItem('smriti_patients', JSON.stringify(remaining));
        return remaining;
      });
      if (activePatientId === patientId) {
        const remaining = patients.filter(p => p.id !== patientId && p._id !== patientId);
        setActivePatientId(remaining[0]?.id || '');
      }
      await loadRealData();
      return { success: true };
    } catch (err) {
      console.error('Delete patient error:', err.message);
      throw err;
    }
  };

  const dismissRedFlag = async (flagId) => {
    const targetFlag = redFlags.find(f => f.id === flagId || f.reminderId === flagId);
    
    // Instant optimistic removal from UI state and local storage
    setRedFlags(prev => {
      const updated = prev.filter(f => f.id !== flagId && f.reminderId !== flagId);
      localStorage.setItem('smriti_red_flags', JSON.stringify(updated));
      return updated;
    });

    if (targetFlag) {
      const reminderId = targetFlag.reminderId || (targetFlag.id && targetFlag.id.startsWith('flag-') ? targetFlag.id.split('-').slice(2).join('-') : targetFlag.id);
      if (reminderId) {
        await dismissReminderApi(reminderId);
      }

      // Mark dismissed locally in patient reminder state so it won't re-trigger
      setPatients(prev => prev.map(p => {
        if (p.id === targetFlag.patientId || p._id === targetFlag.patientId) {
          return {
            ...p,
            todayReminders: p.todayReminders.map(r => (r.id === reminderId || r._id === reminderId || r.id === targetFlag.id) ? { ...r, dismissed: true } : r)
          };
        }
        return p;
      }));

      // Reload fresh database state in background
      setTimeout(() => {
        loadRealData();
      }, 500);
    }
  };

  // 6. Toggle Reminder Completion in real backend + offline caching & sync queue
  const toggleReminder = async (patientId, reminderId) => {
    let targetAcknowledged = true;
    let targetPatient = null;
    let targetReminder = null;

    setPatients(prev => {
      const targetPId = patientId || activePatientId;
      const updated = prev.map((p, pIdx) => {
        const isTargetPatient = 
          !targetPId ||
          p.id === targetPId || 
          p._id === targetPId || 
          p.id === activePatientId || 
          p._id === activePatientId ||
          (targetPId === 'pat-2' && (p.name?.includes('Meera') || pIdx === 1)) ||
          (targetPId === 'pat-3' && (p.name?.includes('Biren') || pIdx === 2)) ||
          (targetPId === 'pat-1' && (p.name?.includes('Ramesh') || pIdx === 0)) ||
          prev.length === 1;

        if (isTargetPatient) {
          const updatedReminders = (p.todayReminders || []).map((r, rIdx) => {
            const isMatch = 
              r.id === reminderId || 
              r._id === reminderId || 
              (typeof reminderId === 'string' && reminderId.startsWith('rem-') && parseInt(reminderId.replace('rem-', ''), 10) - 1 === rIdx) ||
              (typeof reminderId === 'string' && r.title && reminderId.toLowerCase() === r.title.toLowerCase());

            if (isMatch) {
              const nextStatus = (r.status === 'completed' || r.acknowledged === true) ? 'pending' : 'completed';
              targetAcknowledged = nextStatus === 'completed';
              targetReminder = { 
                ...r, 
                status: nextStatus, 
                acknowledged: targetAcknowledged 
              };
              return targetReminder;
            }
            return r;
          });
          targetPatient = { ...p, todayReminders: updatedReminders };
          return targetPatient;
        }
        return p;
      });
      try {
        localStorage.setItem('smriti_patients', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (targetPatient) {
      await cachePatientData(targetPatient.id || patientId, targetPatient);
    }

    const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (!online) {
      await queueOfflineAction({
        action: 'toggleReminder',
        patientId: targetPatient?.id || patientId,
        reminderId,
        targetAcknowledged,
        reminderData: targetReminder ? { type: targetReminder.type, title: targetReminder.title, scheduledTime: targetReminder.scheduledTime } : undefined
      });
      await refreshPendingSyncCount();
      return;
    }

    try {
      await toggleReminderStatus(
        reminderId,
        targetAcknowledged,
        targetPatient?.id || patientId,
        targetReminder ? { type: targetReminder.type, title: targetReminder.title, scheduledTime: targetReminder.scheduledTime } : {}
      );
    } catch (err) {
      console.warn('Network request failed during toggleReminder, queuing offline action:', err.message);
      await queueOfflineAction({
        action: 'toggleReminder',
        patientId: targetPatient?.id || patientId,
        reminderId,
        targetAcknowledged,
        reminderData: targetReminder ? { type: targetReminder.type, title: targetReminder.title, scheduledTime: targetReminder.scheduledTime } : undefined
      });
      await refreshPendingSyncCount();
    }
  };

  // 7. Memory Bank Photos (Real MongoDB Vault)
  const loadPatientPhotos = useCallback(async (patientId) => {
    if (!patientId) return [];
    return await fetchPatientPhotos(patientId);
  }, []);

  const addPatientPhoto = async (patientId, photoData) => {
    const created = await addPatientPhotoApi(patientId, photoData);
    return created;
  };

  const deletePatientPhoto = async (patientId, photoId) => {
    return await deletePatientPhotoApi(patientId, photoId);
  };

  // 8. Game Sessions & Cognitive Scores (Real MongoDB)
  const loadGameSessions = useCallback(async (patientId) => {
    if (!patientId) return [];
    return await fetchPatientGameSessions(patientId);
  }, []);

  const recordGameSession = async (patientId, gameData) => {
    return await recordGameSessionApi(patientId, gameData);
  };

  return (
    <AppContext.Provider
      value={{
        currentLanguage,
        setCurrentLanguage,
        regionalLanguages,
        // Network & Offline Sync state
        isOnline,
        pendingSyncCount,
        syncToast,
        syncOfflineQueue,
        // Caregiver state & handlers
        isCaregiverLoggedIn,
        caregiverUser,
        loginCaregiver,
        loginCaregiverWithGoogle,
        setCaregiverPassword,
        signupCaregiver,
        logoutCaregiver,
        patients,
        addPatient,
        updatePatient,
        deletePatient,
        redFlags,
        dismissRedFlag,
        loadRealData,
        // Patient state & handlers
        activePatientId,
        setActivePatientId,
        activePatient,
        isPatientLoggedIn,
        loginPatient,
        loginPatientBiometric,
        registerPatientBiometric,
        logoutPatient,
        toggleReminder,
        // Real MongoDB Memory Bank Photos & Game Sessions
        loadPatientPhotos,
        addPatientPhoto,
        deletePatientPhoto,
        loadGameSessions,
        recordGameSession
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
