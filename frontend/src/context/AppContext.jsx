import { calculatePatientStreak } from '../utils/streakUtils';
import { getVoiceAutoPlaySetting, setVoiceAutoPlaySetting } from '../utils/speechUtils';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { initialPatients, initialRedFlags, regionalLanguages, standard10Reminders, meeraStandardReminders } from '../data/mockData';
import { 
  getStoredCaregiverSession, 
  getStoredPatientSession, 
  clearCaregiverSession, 
  clearPatientSession,
  matchPatientHelper
} from '../utils/authUtils';
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
  registerCaregiverBiometricApi,
  loginCaregiverBiometricApi,
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
  recordGameSessionApi,
  deleteCaregiverAccountApi
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

  // Caregiver Authentication (Validated Persistent Session)
  const [isCaregiverLoggedIn, setIsCaregiverLoggedIn] = useState(() => {
    return getStoredCaregiverSession().isValid;
  });
  const [caregiverUser, setCaregiverUser] = useState(() => {
    const session = getStoredCaregiverSession();
    return (session.isValid && session.user) ? session.user : { name: "Dr. Ananya Sharma", role: "clinician", email: "dr.ananya@smriti.in" };
  });

  // Patient Authentication (Validated Persistent Session)
  const [activePatientId, setActivePatientId] = useState(() => {
    const session = getStoredPatientSession();
    return session.isValid ? session.patientId : '';
  });
  const [isPatientLoggedIn, setIsPatientLoggedIn] = useState(() => {
    return getStoredPatientSession().isValid;
  });

  // Voice Auto-Play setting (Defaults to true - ON)
  const [voiceAutoPlay, setVoiceAutoPlayState] = useState(() => {
    return getVoiceAutoPlaySetting(activePatientId);
  });

  useEffect(() => {
    setVoiceAutoPlayState(getVoiceAutoPlaySetting(activePatientId));
  }, [activePatientId]);

  const setVoiceAutoPlay = useCallback((enabled) => {
    setVoiceAutoPlayState(enabled);
    setVoiceAutoPlaySetting(enabled, activePatientId);
  }, [activePatientId]);

  const toggleVoiceAutoPlay = useCallback(() => {
    setVoiceAutoPlayState(prev => {
      const next = !prev;
      setVoiceAutoPlaySetting(next, activePatientId);
      return next;
    });
  }, [activePatientId]);

  // Patients Data Store
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem('smriti_patients');
    return saved ? JSON.parse(saved) : initialPatients;
  });

  // Red Flags Alert Store (Scoped to logged-in user)
  const [redFlags, setRedFlags] = useState(() => {
    const isCaregiverAuth = !!localStorage.getItem('smriti_caregiver_token');
    const isPatientAuth = !!localStorage.getItem('smriti_patient_token');
    const saved = localStorage.getItem('smriti_red_flags');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return (!isCaregiverAuth && !isPatientAuth) ? initialRedFlags : [];
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

  const isFetchingDataRef = useRef(false);

  // Fetch real data from backend API (Caregiver + Patient rosters synchronized with MongoDB Atlas)
  const loadRealData = useCallback(async () => {
    if (isFetchingDataRef.current) return;
    isFetchingDataRef.current = true;

    // If device is offline, load from cached IndexedDB snapshot
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const targetId = activePatientId || localStorage.getItem('smriti_patient_id') || 'pat-1';
      const cached = await getCachedPatientData(targetId);
      if (cached) {
        setPatients(prev => prev.length > 0 ? prev : [cached]);
        setActivePatientId(cached.id);
      }
      isFetchingDataRef.current = false;
      return;
    }

    try {
      // 1. Fetch real patients with batch reminders AND active alerts concurrently in 1 parallel request
      const [backendPatientsRes, realDbAlerts] = await Promise.all([
        fetchRealPatients(true),
        fetchActiveAlertsApi()
      ]);

      let backendPatients = backendPatientsRes;
      const isCaregiverAuth = !!localStorage.getItem('smriti_caregiver_token');
      const isPatientAuth = !!localStorage.getItem('smriti_patient_token');

      if (!backendPatients || !Array.isArray(backendPatients)) {
        backendPatients = isCaregiverAuth ? [] : initialPatients;
      } else if (backendPatients.length === 0 && !isCaregiverAuth && !isPatientAuth) {
        // Purely unauthenticated landing fallback when DB has no records
        backendPatients = initialPatients;
      }

      // 2. Format reminders for each backend patient without N+1 network requests
      const enrichedPatients = backendPatients.map((bp, idx) => {
        const isDemo = bp.isDemoSeed === true || ['Ramesh Sharma', 'Meera Baruah', 'Biren Das'].includes(bp.name) || bp.id === 'pat-1' || bp._id === 'pat-1';
        const fallbackPatient = initialPatients.find(ip => ip.name === bp.name) || (isDemo ? initialPatients[idx % initialPatients.length] : null);
        const realReminders = bp.reminders;

        let formattedReminders = [];
        if (realReminders && realReminders.length > 0) {
          formattedReminders = realReminders.map((r, rIdx) => {
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

            const isMeera = matchPatientHelper(bp, 'pat-2');
            const targetStdList = isMeera ? meeraStandardReminders : standard10Reminders;
            const std = (targetStdList && targetStdList.find(s => 
              s.id === r._id || 
              (s.type === r.type && (s.title === r.title || r.title?.includes(s.title?.split(' ')[0]))) ||
              targetStdList[rIdx]?.type === r.type
            )) || targetStdList?.[rIdx];

            return {
              id: r._id,
              type: r.type,
              title: title,
              hindiTitle: r.hindiTitle || std?.hindiTitle || title,
              detail: detail,
              hindiDetail: r.hindiDetail || std?.hindiDetail || detail,
              icon: r.icon || std?.icon || (r.type === 'medicine' ? 'Pill' : r.type === 'hydration' ? 'Droplets' : r.type === 'game' ? 'BrainCircuit' : r.type === 'activity' ? 'Footprints' : r.type === 'appointment' ? 'Calendar' : 'meal'),
              time: timeStr,
              status: r.acknowledged ? 'completed' : 'pending',
              acknowledged: !!r.acknowledged,
              dismissed: !!r.dismissed,
              scheduledTime: r.scheduledTime
            };
          });
        } else if (isDemo && fallbackPatient?.todayReminders) {
          formattedReminders = fallbackPatient.todayReminders;
        } else {
          formattedReminders = [];
        }

        return {
          id: bp._id || bp.id,
          name: bp.name,
          age: bp.age || (isDemo && fallbackPatient ? fallbackPatient.age : 70),
          gender: bp.gender || (isDemo && fallbackPatient ? fallbackPatient.gender : 'Senior'),
          phone: bp.phoneNumber ? (bp.phoneNumber.startsWith('+') ? bp.phoneNumber : `+${bp.phoneNumber}`) : (isDemo && fallbackPatient ? fallbackPatient.phone : ''),
          rawPhone: bp.phoneNumber,
          location: bp.location || (isDemo && fallbackPatient ? fallbackPatient.location : 'Guwahati, Assam'),
          nativeLanguage: bp.language || (isDemo && fallbackPatient ? fallbackPatient.nativeLanguage : 'Assamese'),
          avatar: bp.avatar || (isDemo && fallbackPatient ? fallbackPatient.avatar : 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80'),
          lastActive: isDemo ? 'Active on WhatsApp' : 'New Patient Registered',
          streakDays: isDemo ? (fallbackPatient?.streakDays || 14) : calculatePatientStreak(bp, [], formattedReminders),
          cognitiveStage: bp.cognitiveStage || (isDemo && fallbackPatient ? fallbackPatient.cognitiveStage : 'Early Memory Support'),
          primaryCaregiver: bp.primaryCaregiver || (isDemo && fallbackPatient ? fallbackPatient.primaryCaregiver : 'Assigned Caregiver'),
          emergencyContact: bp.emergencyContact || (bp.phoneNumber ? `+${bp.phoneNumber}` : (isDemo && fallbackPatient ? fallbackPatient.emergencyContact : '')),
          notes: bp.notes || '',
          medicalNotes: bp.medicalNotes || (isDemo && fallbackPatient ? fallbackPatient.medicalNotes : 'No medical evaluation recorded yet.'),
          todayReminders: formattedReminders,
          reminderHistory: isDemo && fallbackPatient ? fallbackPatient.reminderHistory : [],
          weeklyPerformance: isDemo && fallbackPatient ? fallbackPatient.weeklyPerformance : [],
          notificationPreference: bp.notificationPreference || 'whatsapp',
          isDemoSeed: isDemo
        };
      });

      setPatients(enrichedPatients);
      try {
        localStorage.setItem('smriti_patients', JSON.stringify(enrichedPatients));
      } catch (e) {}

      // 3. Resolve Active Patient
      const storedPatientId = localStorage.getItem('smriti_patient_id');
      const currentTargetId = activePatientId || storedPatientId;

      if (currentTargetId) {
        const found = enrichedPatients.find(p => matchPatientHelper(p, currentTargetId));
        if (found) {
          setActivePatientId(found.id);
          localStorage.setItem('smriti_patient_id', found.id);
        } else if (enrichedPatients.length > 0) {
          setActivePatientId(enrichedPatients[0].id);
          localStorage.setItem('smriti_patient_id', enrichedPatients[0].id);
        } else {
          setActivePatientId(null);
          localStorage.removeItem('smriti_patient_id');
        }
      } else if (enrichedPatients.length > 0) {
        setActivePatientId(enrichedPatients[0].id);
        localStorage.setItem('smriti_patient_id', enrichedPatients[0].id);
      } else {
        setActivePatientId(null);
        localStorage.removeItem('smriti_patient_id');
      }

      // 4. Update direct database-synchronized active alerts
      if (realDbAlerts && Array.isArray(realDbAlerts)) {
        setRedFlags(realDbAlerts);
      } else if (isCaregiverAuth && enrichedPatients.length === 0) {
        setRedFlags([]);
      }
    } catch (err) {
      console.warn('Failed to fetch patient data online, attempting cached fallback:', err.message);
      const targetId = activePatientId || localStorage.getItem('smriti_patient_id') || 'pat-1';
      const cached = await getCachedPatientData(targetId);
      if (cached) {
        setPatients(prev => prev.length > 0 ? prev : [cached]);
        setActivePatientId(cached.id);
      }
    } finally {
      isFetchingDataRef.current = false;
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

  // Current active patient object (Robust multi-identifier resolution)
  const activePatient = useMemo(() => {
    const isCaregiverAuth = !!localStorage.getItem('smriti_caregiver_token');
    const isPatientAuth = !!localStorage.getItem('smriti_patient_token');

    const target = activePatientId || localStorage.getItem('smriti_patient_id');
    if (target) {
      const found = (patients && patients.length > 0 ? patients.find(p => matchPatientHelper(p, target)) : null) || 
                    (!isCaregiverAuth && !isPatientAuth ? initialPatients.find(p => matchPatientHelper(p, target)) : null);
      if (found) return found;
    }
    if (patients && patients.length > 0) return patients[0];
    if (!isCaregiverAuth && !isPatientAuth) return initialPatients[0];
    return null;
  }, [patients, activePatientId]);

  // 1. Caregiver Real Login (Fast & Non-blocking)
  const loginCaregiver = async (email, password) => {
    try {
      const data = await loginCaregiverApi(email, password);
      setIsCaregiverLoggedIn(true);
      setCaregiverUser(data.caregiver);
      localStorage.setItem('smriti_caregiver_token', data.token);
      localStorage.setItem('smriti_caregiver_user', JSON.stringify(data.caregiver));
      localStorage.setItem('smriti_caregiver_auth', 'true');
      loadRealData().catch(e => console.warn('Background sync:', e.message));
      return { success: true, caregiver: data.caregiver };
    } catch (err) {
      console.warn('Caregiver API login error, checking demo credentials fallback:', err.message);
      if (email === 'dr.ananya@smriti.in' && (password === 'caregiver123' || password === 'demo1234' || password === '1234')) {
        const dummyCaregiver = { 
          id: "6a9e533f65c0817eb2016cc7", 
          _id: "6a9e533f65c0817eb2016cc7",
          name: "Dr. Ananya Sharma", 
          role: "clinician", 
          email: "dr.ananya@smriti.in",
          patientIds: ["6a9e533f65c0817eb2016cc8", "6a9e533f65c0817eb2016cc9"]
        };
        const dummyJwt = `mock.jwt.${btoa(JSON.stringify({ id: "6a9e533f65c0817eb2016cc7", email: "dr.ananya@smriti.in", exp: Math.floor(Date.now() / 1000) + 86400 * 365 }))}`;
        setIsCaregiverLoggedIn(true);
        setCaregiverUser(dummyCaregiver);
        localStorage.setItem('smriti_caregiver_token', dummyJwt);
        localStorage.setItem('smriti_caregiver_user', JSON.stringify(dummyCaregiver));
        localStorage.setItem('smriti_caregiver_auth', 'true');
        loadRealData().catch(e => console.warn('Background sync:', e.message));
        return { success: true, caregiver: dummyCaregiver };
      }
      throw err;
    }
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
      loadRealData().catch(e => console.warn('Background sync:', e.message));
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

  // 2. Caregiver Real Signup (Fast & Non-blocking)
  const signupCaregiver = async (caregiverData) => {
    try {
      const data = await signupCaregiverApi(caregiverData);
      setIsCaregiverLoggedIn(true);
      setCaregiverUser(data.caregiver);
      localStorage.setItem('smriti_caregiver_token', data.token);
      localStorage.setItem('smriti_caregiver_user', JSON.stringify(data.caregiver));
      localStorage.setItem('smriti_caregiver_auth', 'true');
      // Clean start for new caregiver roster
      localStorage.removeItem('smriti_patients');
      localStorage.removeItem('smriti_patient_id');
      localStorage.removeItem('smriti_red_flags');
      setPatients([]);
      setRedFlags([]);
      setActivePatientId(null);
      loadRealData().catch(e => console.warn('Background sync:', e.message));
      return { success: true, caregiver: data.caregiver };
    } catch (err) {
      throw err;
    }
  };

  // 2b. Register Biometric for Caregiver
  const registerCaregiverBiometric = async (credentialId) => {
    try {
      const data = await registerCaregiverBiometricApi(credentialId);
      setCaregiverUser(prev => ({ ...prev, hasBiometric: true }));
      localStorage.setItem('smriti_caregiver_user', JSON.stringify({ ...caregiverUser, hasBiometric: true }));
      return data;
    } catch (err) {
      console.error('Register caregiver biometric error:', err.message);
      throw err;
    }
  };

  // 2c. Caregiver Biometric Login
  const loginCaregiverBiometric = async (credentialId, email) => {
    try {
      const data = await loginCaregiverBiometricApi(credentialId, email);
      setIsCaregiverLoggedIn(true);
      setCaregiverUser(data.caregiver);
      localStorage.setItem('smriti_caregiver_token', data.token);
      localStorage.setItem('smriti_caregiver_user', JSON.stringify(data.caregiver));
      localStorage.setItem('smriti_caregiver_auth', 'true');
      loadRealData().catch(e => console.warn('Background sync:', e.message));
      return { success: true, caregiver: data.caregiver };
    } catch (err) {
      console.error('Caregiver biometric login error:', err.message);
      throw err;
    }
  };

  const logoutCaregiver = () => {
    setIsCaregiverLoggedIn(false);
    setCaregiverUser(null);
    clearCaregiverSession();
    localStorage.removeItem('smriti_patients');
    localStorage.removeItem('smriti_red_flags');
    setPatients([]);
    setRedFlags([]);
  };

  const deleteCaregiverAccount = async () => {
    try {
      await deleteCaregiverAccountApi();
    } catch (err) {
      console.warn('Backend caregiver deletion error:', err.message);
    }
    logoutCaregiver();
    localStorage.removeItem('smriti_caregiver_bio_email');
    localStorage.removeItem('smriti_caregiver_bio_credId');
  };

  // 3. Patient Real Login (PIN keypad + Name) (Fast & Non-blocking)
  const loginPatient = async (name, age, pin) => {
    try {
      const data = await loginPatientApi(name, age, pin);
      const matchedPatient = data.patient;
      const targetId = matchedPatient._id || matchedPatient.id;
      setActivePatientId(targetId);
      setIsPatientLoggedIn(true);
      localStorage.setItem('smriti_patient_token', data.token);
      localStorage.setItem('smriti_patient_auth', 'true');
      localStorage.setItem('smriti_patient_id', targetId);

      setPatients(prev => {
        const idx = prev.findIndex(p => matchPatientHelper(p, targetId) || matchPatientHelper(p, matchedPatient.name));
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...matchedPatient, id: targetId };
          return updated;
        }
        return [matchedPatient, ...prev];
      });

      loadRealData().catch(e => console.warn('Background sync:', e.message));
      return { success: true, patient: matchedPatient };
    } catch (err) {
      console.warn('Patient login API error:', err.message);
      // If error is from invalid credentials or 401, rethrow immediately
      if (err.response?.status === 401 || err.response?.status === 400 || (err.message && (err.message.includes('Invalid') || err.message.includes('PIN') || err.message.includes('required')))) {
        throw err;
      }
      // Offline demo fallback only if explicit matching demo name found
      const normalizedName = (name || '').toLowerCase().trim();
      const localMatched = (patients && patients.length > 0 ? patients.find(p => matchPatientHelper(p, normalizedName)) : null) ||
        initialPatients.find(p => matchPatientHelper(p, normalizedName));

      if (!localMatched) {
        throw err;
      }

      const targetId = localMatched.id || localMatched._id || 'pat-1';
      const dummyJwt = `mock.jwt.${btoa(JSON.stringify({ id: targetId, name: localMatched.name, exp: Math.floor(Date.now() / 1000) + 86400 * 365 }))}`;
      setActivePatientId(targetId);
      setIsPatientLoggedIn(true);
      localStorage.setItem('smriti_patient_token', dummyJwt);
      localStorage.setItem('smriti_patient_auth', 'true');
      localStorage.setItem('smriti_patient_id', targetId);

      loadRealData().catch(e => console.warn('Background sync:', e.message));
      return { success: true, patient: localMatched };
    }
  };

  // 3a. Instant Direct Patient Session Setter (0ms UI Transition)
  const setDirectPatientSession = useCallback((patient) => {
    const targetId = patient?.id || patient?._id || '6a9e533f65c0817eb2016cc8';
    const dummyJwt = `mock.jwt.${btoa(JSON.stringify({ id: targetId, name: patient?.name || 'Ramesh Sharma', exp: Math.floor(Date.now() / 1000) + 86400 * 365 }))}`;
    setActivePatientId(targetId);
    setIsPatientLoggedIn(true);
    localStorage.setItem('smriti_patient_token', dummyJwt);
    localStorage.setItem('smriti_patient_auth', 'true');
    localStorage.setItem('smriti_patient_id', targetId);

    if (patient) {
      setPatients(prev => {
        const idx = prev.findIndex(p => matchPatientHelper(p, targetId) || matchPatientHelper(p, patient.name));
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...patient, id: targetId };
          return updated;
        }
        return [patient, ...prev];
      });
    }

    loadRealData().catch(e => console.warn('Background sync:', e.message));
  }, [loadRealData]);

  // 3a-2. Instant Direct Caregiver Session Setter (0ms UI Transition)
  const setDirectCaregiverSession = useCallback((caregiver = null) => {
    const targetCaregiver = caregiver || { 
      id: "6a9e533f65c0817eb2016cc7", 
      _id: "6a9e533f65c0817eb2016cc7",
      name: "Dr. Ananya Sharma", 
      role: "clinician", 
      email: "dr.ananya@smriti.in",
      patientIds: ["6a9e533f65c0817eb2016cc8", "6a9e533f65c0817eb2016cc9"]
    };
    const dummyJwt = `mock.jwt.${btoa(JSON.stringify({ id: targetCaregiver.id, email: targetCaregiver.email, exp: Math.floor(Date.now() / 1000) + 86400 * 365 }))}`;
    setIsCaregiverLoggedIn(true);
    setCaregiverUser(targetCaregiver);
    localStorage.setItem('smriti_caregiver_token', dummyJwt);
    localStorage.setItem('smriti_caregiver_user', JSON.stringify(targetCaregiver));
    localStorage.setItem('smriti_caregiver_auth', 'true');

    loadRealData().catch(e => console.warn('Background sync:', e.message));
  }, [loadRealData]);

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
    clearPatientSession();
  };

  // 4. Create Real Patient in MongoDB
  const addPatient = async (newPatientData) => {
    try {
      const created = await createPatientApi({
        ...newPatientData,
        caregiverId: caregiverUser?.id || caregiverUser?._id
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
        primaryCaregiver: caregiverUser?.name || "Assigned Caregiver",
        emergencyContact: newPatientData.emergencyContact || newPatientData.phone,
        notes: newPatientData.notes || "",
        medicalNotes: newPatientData.medicalNotes || "",
        todayReminders: [],
        reminderHistory: [],
        weeklyPerformance: [],
        isDemoSeed: false
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
    const targetPId = patientId || activePatientId || (patients[0]?.id || patients[0]?._id);
    const foundPatient = patients.find(p => 
      p.id === targetPId || 
      p._id === targetPId || 
      p.id === activePatientId || 
      p._id === activePatientId ||
      (targetPId === 'pat-1' && p.name?.includes('Ramesh')) ||
      (targetPId === 'pat-2' && p.name?.includes('Meera')) ||
      (targetPId === 'pat-3' && p.name?.includes('Biren'))
    ) || patients[0];

    const foundReminder = foundPatient?.todayReminders?.find((r, rIdx) => 
      r.id === reminderId || 
      r._id === reminderId || 
      (typeof reminderId === 'string' && reminderId.startsWith('rem-') && parseInt(reminderId.replace('rem-', ''), 10) - 1 === rIdx) ||
      (typeof reminderId === 'string' && r.title && reminderId.toLowerCase() === r.title.toLowerCase())
    );

    const currentStatus = foundReminder ? (foundReminder.status === 'completed' || foundReminder.acknowledged === true) : false;
    const targetAcknowledged = !currentStatus;
    const resolvedPatientId = foundPatient?.id || foundPatient?._id || patientId;
    const resolvedReminderId = foundReminder?.id || foundReminder?._id || reminderId;

    // Synchronously update local React state and localStorage
    setPatients(prev => {
      const updated = prev.map((p, pIdx) => {
        const isTargetPatient = 
          !targetPId ||
          p.id === targetPId || 
          p._id === targetPId || 
          p.id === resolvedPatientId ||
          p._id === resolvedPatientId ||
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
              r.id === resolvedReminderId ||
              r._id === resolvedReminderId ||
              (typeof reminderId === 'string' && reminderId.startsWith('rem-') && parseInt(reminderId.replace('rem-', ''), 10) - 1 === rIdx) ||
              (typeof reminderId === 'string' && r.title && reminderId.toLowerCase() === r.title.toLowerCase());

            if (isMatch) {
              return { 
                ...r, 
                status: targetAcknowledged ? 'completed' : 'pending', 
                acknowledged: targetAcknowledged 
              };
            }
            return r;
          });
          const updatedPatient = { ...p, todayReminders: updatedReminders };
          cachePatientData(updatedPatient.id || resolvedPatientId, updatedPatient).catch(() => {});
          return updatedPatient;
        }
        return p;
      });
      try {
        localStorage.setItem('smriti_patients', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Optimistically remove alert from redFlags state if completed
    if (targetAcknowledged) {
      setRedFlags(prev => prev.filter(f => 
        f.reminderId !== reminderId && 
        f.reminderId !== resolvedReminderId &&
        f.id !== `flag-${resolvedPatientId}-${resolvedReminderId}` &&
        !f.id?.includes(reminderId) &&
        !f.id?.includes(resolvedReminderId)
      ));
    }

    const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (!online) {
      await queueOfflineAction({
        action: 'toggleReminder',
        patientId: resolvedPatientId,
        reminderId: resolvedReminderId,
        targetAcknowledged,
        reminderData: foundReminder ? { type: foundReminder.type, title: foundReminder.title, scheduledTime: foundReminder.scheduledTime } : undefined
      });
      await refreshPendingSyncCount();
      return;
    }

    try {
      await toggleReminderStatus(
        resolvedReminderId,
        targetAcknowledged,
        resolvedPatientId,
        foundReminder ? { type: foundReminder.type, title: foundReminder.title, scheduledTime: foundReminder.scheduledTime } : {}
      );

      // Re-fetch backend alerts to ensure full database consistency
      const realDbAlerts = await fetchActiveAlertsApi();
      if (realDbAlerts && Array.isArray(realDbAlerts)) {
        setRedFlags(realDbAlerts);
      }
    } catch (err) {
      console.warn('Network request failed during toggleReminder, queuing offline action:', err.message);
      await queueOfflineAction({
        action: 'toggleReminder',
        patientId: resolvedPatientId,
        reminderId: resolvedReminderId,
        targetAcknowledged,
        reminderData: foundReminder ? { type: foundReminder.type, title: foundReminder.title, scheduledTime: foundReminder.scheduledTime } : undefined
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
    try {
      const todayYMD = new Date().toISOString().slice(0, 10);
      localStorage.setItem(`smriti_game_played_date_${patientId}`, todayYMD);
    } catch (e) {}
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
        loginCaregiverBiometric,
        registerCaregiverBiometric,
        loginCaregiverWithGoogle,
        setCaregiverPassword,
        signupCaregiver,
        logoutCaregiver,
        deleteCaregiverAccount,
        setDirectCaregiverSession,
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
        setDirectPatientSession,
        toggleReminder,
        // Voice Auto-Play setting
        voiceAutoPlay,
        setVoiceAutoPlay,
        toggleVoiceAutoPlay,
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
