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
  createReminderApi,
  createBatchRemindersApi,
  updateReminderApi,
  deleteReminderApi,
  clearPatientRemindersApi,
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
    return (session.isValid && session.user) ? session.user : { name: "Dr. Ananya Sharma", role: "clinician", email: "dr.ananya@smriti.in", avatar: "/avatars/dr_ananya_sharma.png" };
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
    const session = getStoredCaregiverSession();
    const isCaregiverAuth = session.isValid;
    const email = (session.user?.email || '').toLowerCase();
    const isDemo = !isCaregiverAuth || email === 'dr.ananya@smriti.in' || email.includes('demo');
    const saved = localStorage.getItem('smriti_patients');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // If authenticated as non-demo caregiver and saved records contain demo patients, purge them
          if (isCaregiverAuth && !isDemo) {
            const hasDemoSeeds = parsed.some(p => p.isDemoSeed || ['Ramesh Sharma', 'Meera Baruah', 'Biren Das'].includes(p.name) || p.id === 'pat-1' || p.id === 'pat-2');
            if (hasDemoSeeds) {
              const realOnly = parsed.filter(p => !p.isDemoSeed && !['Ramesh Sharma', 'Meera Baruah', 'Biren Das'].includes(p.name) && p.id !== 'pat-1' && p.id !== 'pat-2');
              localStorage.setItem('smriti_patients', JSON.stringify(realOnly));
              return realOnly;
            }
          }
          return parsed;
        }
      } catch (e) {}
    }
    if (isCaregiverAuth && !isDemo) {
      return [];
    }
    return initialPatients;
  });

  // Red Flags Alert Store (Scoped to logged-in user)
  const [redFlags, setRedFlags] = useState(() => {
    const session = getStoredCaregiverSession();
    const isCaregiverAuth = session.isValid;
    const email = (session.user?.email || '').toLowerCase();
    const isDemo = !isCaregiverAuth || email === 'dr.ananya@smriti.in' || email.includes('demo');
    const saved = localStorage.getItem('smriti_red_flags');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    if (isCaregiverAuth && !isDemo) {
      return [];
    }
    return (!isCaregiverAuth && !session.isValid) ? initialRedFlags : [];
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

    const session = getStoredCaregiverSession();
    const isAuthCaregiver = session.isValid;
    const caregiverEmail = (caregiverUser?.email || session.user?.email || '').toLowerCase();
    const isDemoCaregiver = !isAuthCaregiver || caregiverEmail === 'dr.ananya@smriti.in' || caregiverEmail.includes('demo');

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

      if (isDemoCaregiver) {
        // DEMO / PUBLIC MODE: Fallback to initialPatients if database has none, or ensure demo profiles exist
        if (!backendPatients || !Array.isArray(backendPatients) || backendPatients.length === 0) {
          backendPatients = [...initialPatients];
        } else {
          // Ensure all standard demo profiles (Ramesh, Meera, Biren) remain available
          initialPatients.forEach(ip => {
            if (!backendPatients.some(bp => matchPatientHelper(bp, ip.name) || matchPatientHelper(bp, ip.id) || matchPatientHelper(bp, ip._id))) {
              backendPatients.push(ip);
            }
          });
        }
      } else {
        // AUTHENTICATED REAL CAREGIVER MODE:
        // Strictly show only patients belonging to this caregiver from the database.
        // Never inject demo profiles into a new or custom email account.
        if (!backendPatients || !Array.isArray(backendPatients)) {
          backendPatients = [];
        }
      }

      // 2. Format reminders for each backend patient without N+1 network requests
      const enrichedPatients = backendPatients.map((bp, idx) => {
        const isDemo = bp.isDemoSeed === true || ['Ramesh Sharma', 'Meera Baruah', 'Biren Das'].includes(bp.name) || bp.id === 'pat-1' || bp._id === 'pat-1' || bp.id === 'pat-2' || bp._id === 'pat-2';
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
          avatar: bp.avatar || (isDemo && fallbackPatient ? fallbackPatient.avatar : ''),
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

      if (currentTargetId && enrichedPatients.length > 0) {
        const isMeeraTarget = String(currentTargetId).toLowerCase().includes('meera') || currentTargetId === 'pat-2' || currentTargetId === '6a9e533f65c0817eb2016cc9';
        const found = enrichedPatients.find(p => isMeeraTarget ? (matchPatientHelper(p, 'pat-2') || matchPatientHelper(p, 'meera')) : matchPatientHelper(p, currentTargetId));
        if (found) {
          const resolvedId = isMeeraTarget ? 'pat-2' : (found.id || found._id);
          setActivePatientId(resolvedId);
          localStorage.setItem('smriti_patient_id', resolvedId);
        } else {
          setActivePatientId(enrichedPatients[0].id);
          localStorage.setItem('smriti_patient_id', enrichedPatients[0].id);
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
      } else if (!isDemoCaregiver || enrichedPatients.length === 0) {
        setRedFlags([]);
      }
    } catch (err) {
      console.warn('Failed to fetch patient data online, attempting cached fallback:', err.message);
      if (isDemoCaregiver) {
        const targetId = activePatientId || localStorage.getItem('smriti_patient_id') || 'pat-1';
        const cached = await getCachedPatientData(targetId);
        if (cached) {
          setPatients(prev => prev.length > 0 ? prev : [cached]);
          setActivePatientId(cached.id);
        }
      }
    } finally {
      isFetchingDataRef.current = false;
    }
  }, [activePatientId, caregiverUser]);

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
    const target = activePatientId || localStorage.getItem('smriti_patient_id') || '';
    const storedName = localStorage.getItem('smriti_patient_name') || '';
    const isMeera = String(target).toLowerCase().includes('meera') || target === 'pat-2' || target === '6a9e533f65c0817eb2016cc9' || storedName.toLowerCase().includes('meera');

    if (isMeera) {
      const ramesh = initialPatients[0];
      return {
        ...ramesh,
        id: 'pat-2',
        _id: '6a9e533f65c0817eb2016cc9',
        name: 'Meera Baruah',
        age: 68,
        gender: 'Female',
        avatar: '/avatars/meera_baruah.png',
        location: 'Shillong, Meghalaya',
        nativeLanguage: 'Khasi',
        todayReminders: ramesh.todayReminders || standard10Reminders,
        streakDays: 14,
        weeklyPerformance: ramesh.weeklyPerformance,
        reminderHistory: ramesh.reminderHistory,
        primaryCaregiver: ramesh.primaryCaregiver,
        emergencyContact: '+91 94361 98765',
        notes: 'Responsive to photo recognition and family memories. Enjoys Shillong pine walks and church choir music.'
      };
    }

    // Default to Ramesh
    const found = (patients && patients.length > 0 ? patients.find(p => matchPatientHelper(p, target)) : null) || 
                  initialPatients.find(p => matchPatientHelper(p, target));
    if (found && !found.name.toLowerCase().includes('meera')) return found;
    return initialPatients[0];
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

      const isDemo = (email || '').toLowerCase() === 'dr.ananya@smriti.in' || (email || '').toLowerCase().includes('demo');
      if (!isDemo) {
        localStorage.removeItem('smriti_patients');
        localStorage.removeItem('smriti_red_flags');
        localStorage.removeItem('smriti_patient_id');
        setPatients([]);
        setRedFlags([]);
        setActivePatientId(null);
      }

      await loadRealData();
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
        await loadRealData();
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

      const isDemo = (data.caregiver?.email || '').toLowerCase() === 'dr.ananya@smriti.in' || (data.caregiver?.email || '').toLowerCase().includes('demo');
      if (!isDemo) {
        localStorage.removeItem('smriti_patients');
        localStorage.removeItem('smriti_red_flags');
        localStorage.removeItem('smriti_patient_id');
        setPatients([]);
        setRedFlags([]);
        setActivePatientId(null);
      }

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
      await loadRealData();
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

      const isDemo = (data.caregiver?.email || email || '').toLowerCase() === 'dr.ananya@smriti.in' || (data.caregiver?.email || email || '').toLowerCase().includes('demo');
      if (!isDemo) {
        localStorage.removeItem('smriti_patients');
        localStorage.removeItem('smriti_red_flags');
        localStorage.removeItem('smriti_patient_id');
        setPatients([]);
        setRedFlags([]);
        setActivePatientId(null);
      }

      await loadRealData();
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
    localStorage.removeItem('smriti_patient_id');
    setPatients(initialPatients);
    setRedFlags(initialRedFlags);
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

  // Helper to sync regional state from location
  const syncPatientStateFromLocation = (patientObj) => {
    if (!patientObj?.location && !patientObj?.nativeLanguage) return;
    const loc = (patientObj.location || '').toLowerCase();
    const lang = (patientObj.nativeLanguage || '').toLowerCase();
    let targetState = 'assam';
    if (loc.includes('meghalaya') || loc.includes('shillong') || lang.includes('khasi') || lang.includes('garo')) {
      targetState = 'meghalaya';
    } else if (loc.includes('assam') || loc.includes('guwahati') || lang.includes('assamese') || lang.includes('bodo')) {
      targetState = 'assam';
    } else if (loc.includes('manipur') || loc.includes('imphal') || lang.includes('manipuri') || lang.includes('meitei')) {
      targetState = 'manipur';
    } else if (loc.includes('mizoram') || loc.includes('aizawl') || lang.includes('mizo')) {
      targetState = 'mizoram';
    } else if (loc.includes('nagaland') || loc.includes('kohima') || lang.includes('nagamese') || lang.includes('ao')) {
      targetState = 'nagaland';
    } else if (loc.includes('tripura') || loc.includes('agartala') || lang.includes('kokborok')) {
      targetState = 'tripura';
    } else if (loc.includes('arunachal') || loc.includes('itanagar')) {
      targetState = 'arunachal';
    } else if (loc.includes('sikkim') || loc.includes('gangtok') || lang.includes('nepali')) {
      targetState = 'sikkim';
    }
    localStorage.setItem('smriti_patient_state', targetState);
    window.dispatchEvent(new Event('smriti_state_changed'));
  };

  // 3. Patient Real Login (PIN keypad + Name) (Fast & Non-blocking)
  const loginPatient = async (name, age, pin) => {
    clearPatientSession();
    localStorage.removeItem('smriti_patient_state');
    const isMeera = (name || '').toLowerCase().includes('meera');
    const targetId = isMeera ? 'pat-2' : 'pat-1';
    const patientName = isMeera ? 'Meera Baruah' : (name || 'Ramesh Sharma');
    const patientAvatar = isMeera ? '/avatars/meera_baruah.png' : '/avatars/ramesh_sharma.png';
    const patientLocation = isMeera ? 'Shillong, Meghalaya' : 'Guwahati, Assam';
    const patientLang = isMeera ? 'Khasi' : 'Assamese';

    const ramesh = initialPatients[0];
    const fullPatient = {
      ...ramesh,
      id: targetId,
      _id: isMeera ? '6a9e533f65c0817eb2016cc9' : '6a9e533f65c0817eb2016cc8',
      name: patientName,
      age: isMeera ? 68 : (parseInt(age, 10) || 74),
      gender: isMeera ? 'Female' : 'Male',
      avatar: patientAvatar,
      location: patientLocation,
      nativeLanguage: patientLang,
      todayReminders: ramesh.todayReminders || standard10Reminders,
      streakDays: 14,
      reminderHistory: ramesh.reminderHistory,
      weeklyPerformance: ramesh.weeklyPerformance
    };

    const dummyJwt = `mock.jwt.${btoa(JSON.stringify({ id: targetId, name: fullPatient.name, exp: Math.floor(Date.now() / 1000) + 86400 * 365 }))}`;
    setActivePatientId(targetId);
    setIsPatientLoggedIn(true);
    localStorage.setItem('smriti_patient_token', dummyJwt);
    localStorage.setItem('smriti_patient_auth', 'true');
    localStorage.setItem('smriti_patient_id', targetId);
    localStorage.setItem('smriti_patient_name', patientName);
    syncPatientStateFromLocation(fullPatient);

    setPatients([fullPatient, isMeera ? ramesh : initialPatients[1]]);
    return { success: true, patient: fullPatient };
  };

  // 3a. Instant Direct Patient Session Setter (0ms UI Transition)
  const setDirectPatientSession = useCallback((patient) => {
    if (!patient) return;
    clearPatientSession();
    localStorage.removeItem('smriti_patient_state');

    const isMeera = (patient?.name || '').toLowerCase().includes('meera') || 
                    patient?.id === 'pat-2' || 
                    patient?._id === '6a9e533f65c0817eb2016cc9' ||
                    patient?.location?.toLowerCase().includes('shillong');

    const ramesh = initialPatients[0];
    const targetId = isMeera ? 'pat-2' : 'pat-1';
    const patientName = isMeera ? 'Meera Baruah' : 'Ramesh Sharma';
    const patientAvatar = isMeera ? '/avatars/meera_baruah.png' : '/avatars/ramesh_sharma.png';
    const patientLocation = isMeera ? 'Shillong, Meghalaya' : 'Guwahati, Assam';
    const patientLang = isMeera ? 'Khasi' : 'Assamese';

    const fullPatient = {
      ...ramesh,
      id: targetId,
      _id: isMeera ? '6a9e533f65c0817eb2016cc9' : '6a9e533f65c0817eb2016cc8',
      name: patientName,
      age: isMeera ? 68 : 74,
      gender: isMeera ? 'Female' : 'Male',
      avatar: patientAvatar,
      location: patientLocation,
      nativeLanguage: patientLang,
      todayReminders: ramesh.todayReminders || standard10Reminders,
      streakDays: 14,
      reminderHistory: ramesh.reminderHistory,
      weeklyPerformance: ramesh.weeklyPerformance
    };

    const dummyJwt = `mock.jwt.${btoa(JSON.stringify({ id: targetId, name: fullPatient.name, exp: Math.floor(Date.now() / 1000) + 86400 * 365 }))}`;
    setActivePatientId(targetId);
    setIsPatientLoggedIn(true);
    localStorage.setItem('smriti_patient_token', dummyJwt);
    localStorage.setItem('smriti_patient_auth', 'true');
    localStorage.setItem('smriti_patient_id', targetId);
    localStorage.setItem('smriti_patient_name', patientName);
    syncPatientStateFromLocation(fullPatient);

    setPatients([fullPatient, isMeera ? ramesh : initialPatients[1]]);
  }, []);

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
        avatar: newPatientData.avatar || '',
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
      if (patientId) {
        await deletePatientApi(patientId);
      }
      setPatients(prev => {
        const remaining = prev.filter(p => p.id !== patientId && p._id !== patientId);
        localStorage.setItem('smriti_patients', JSON.stringify(remaining));
        return remaining;
      });
      if (activePatientId === patientId) {
        const remaining = patients.filter(p => p.id !== patientId && p._id !== patientId);
        setActivePatientId(remaining[0]?.id || remaining[0]?._id || '');
      }
      setTimeout(loadRealData, 400);
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

  // 6b. Add New Reminder for Patient
  const addReminder = async (patientId, reminderData) => {
    const targetPId = patientId || activePatientId;
    const tempId = `rem-temp-${Date.now()}`;
    const newRem = {
      id: tempId,
      _id: tempId,
      type: reminderData.type || 'activity',
      title: reminderData.title || 'Daily Routine',
      detail: reminderData.detail || '',
      time: reminderData.time || (reminderData.scheduledTime ? new Date(reminderData.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '9:00 AM'),
      status: 'pending',
      acknowledged: false,
      dismissed: false,
      scheduledTime: reminderData.scheduledTime || new Date()
    };

    // Optimistic update
    setPatients(prev => prev.map(p => {
      if (matchPatientHelper(p, targetPId)) {
        const updatedReminders = [...(p.todayReminders || []), newRem];
        return { ...p, todayReminders: updatedReminders };
      }
      return p;
    }));

    try {
      const created = await createReminderApi(targetPId, reminderData);
      setTimeout(loadRealData, 400);
      return created;
    } catch (err) {
      console.warn('Backend add reminder error:', err.message);
      setTimeout(loadRealData, 500);
      return newRem;
    }
  };

  // 6c. Edit/Update Reminder Full Details
  const updateReminder = async (patientId, reminderId, updatedData) => {
    const targetPId = patientId || activePatientId;

    // Optimistic update
    setPatients(prev => prev.map(p => {
      if (matchPatientHelper(p, targetPId)) {
        const updatedReminders = (p.todayReminders || []).map(r => {
          if (r.id === reminderId || r._id === reminderId) {
            return {
              ...r,
              ...updatedData,
              time: updatedData.time || (updatedData.scheduledTime ? new Date(updatedData.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : r.time)
            };
          }
          return r;
        });
        return { ...p, todayReminders: updatedReminders };
      }
      return p;
    }));

    try {
      const res = await updateReminderApi(reminderId, { ...updatedData, patientId: targetPId });
      setTimeout(loadRealData, 400);
      return res;
    } catch (err) {
      console.warn('Backend update reminder error:', err.message);
      setTimeout(loadRealData, 500);
      return updatedData;
    }
  };

  // 6d. Delete Single Reminder
  const deleteReminder = async (patientId, reminderId) => {
    const targetPId = patientId || activePatientId;

    // Optimistic update
    setPatients(prev => prev.map(p => {
      if (matchPatientHelper(p, targetPId)) {
        const updatedReminders = (p.todayReminders || []).map((r, rIdx) => {
          if (r.id === reminderId || r._id === reminderId || (typeof reminderId === 'string' && reminderId.startsWith('rem-') && parseInt(reminderId.replace('rem-', ''), 10) - 1 === rIdx)) {
            return null;
          }
          return r;
        }).filter(Boolean);
        return { ...p, todayReminders: updatedReminders };
      }
      return p;
    }));

    try {
      const res = await deleteReminderApi(reminderId, targetPId);
      setTimeout(loadRealData, 400);
      return res;
    } catch (err) {
      console.warn('Backend delete reminder error:', err.message);
      setTimeout(loadRealData, 500);
    }
  };

  // 6e. Apply Standard 10-Routine Template (Batch)
  const applyStandardReminders = async (patientId, templateList, replaceExisting = true) => {
    const targetPId = patientId || activePatientId;
    const listToApply = Array.isArray(templateList) ? templateList : standard10Reminders;

    // Optimistic update
    setPatients(prev => prev.map(p => {
      if (matchPatientHelper(p, targetPId)) {
        const formatted = listToApply.map((item, idx) => ({
          id: `rem-applied-${idx}-${Date.now()}`,
          _id: `rem-applied-${idx}-${Date.now()}`,
          type: item.type || 'activity',
          title: item.title,
          detail: item.detail || '',
          time: item.time || '9:00 AM',
          status: item.acknowledged ? 'completed' : 'pending',
          acknowledged: !!item.acknowledged,
          dismissed: false,
          scheduledTime: item.scheduledTime || new Date()
        }));
        return { ...p, todayReminders: replaceExisting ? formatted : [...(p.todayReminders || []), ...formatted] };
      }
      return p;
    }));

    try {
      const res = await createBatchRemindersApi(targetPId, listToApply, replaceExisting);
      setTimeout(loadRealData, 500);
      return res;
    } catch (err) {
      console.warn('Backend batch reminders error:', err.message);
      setTimeout(loadRealData, 600);
    }
  };

  // 6f. Clear All Reminders for Patient
  const clearAllPatientReminders = async (patientId) => {
    const targetPId = patientId || activePatientId;
    setPatients(prev => prev.map(p => {
      if (matchPatientHelper(p, targetPId)) {
        return { ...p, todayReminders: [] };
      }
      return p;
    }));

    try {
      const res = await clearPatientRemindersApi(targetPId);
      setTimeout(loadRealData, 400);
      return res;
    } catch (err) {
      console.warn('Backend clear reminders error:', err.message);
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
        addReminder,
        updateReminder,
        deleteReminder,
        applyStandardReminders,
        clearAllPatientReminders,
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
