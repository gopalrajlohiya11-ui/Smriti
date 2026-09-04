import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { familyPhotos, cognitiveGames } from '../../data/mockData';
import confetti from 'canvas-confetti';
import { 
  Volume2, 
  Flame, 
  Check, 
  Pill, 
  Droplets, 
  Footprints, 
  Calendar, 
  BrainCircuit, 
  ListOrdered, 
  Shapes, 
  Music, 
  X, 
  ChevronRight, 
  Play, 
  Clock, 
  Sparkles, 
  Trophy, 
  CheckCircle2, 
  Star,
  Compass,
  User,
  Phone,
  MapPin,
  Languages,
  LogOut,
  ArrowLeft,
  HeartHandshake,
  Bell,
  BellRing,
  BellOff
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import NotificationPreferences from '../../components/NotificationPreferences';
import { 
  isNotificationSupported, 
  getNotificationPermission, 
  requestNotificationPermission, 
  sendBrowserNotification 
} from '../../utils/browserNotifications';

// Daily Game of the Day rotation by day of week
const dailyGamesList = [
  {
    dayName: "Sunday",
    title: "Shillong Pine Blossom Match",
    subtitle: "Floral & Color Recall",
    description: "Match pairs of mountain orchids, pinecones, and rhododendrons from Meghalaya.",
    category: "Visual Memory",
    duration: "3 Mins",
    demoPairs: ['🌺', '🌲', '🌸', '🍃', '🌺', '🌲', '🌸', '🍃']
  },
  {
    dayName: "Monday",
    title: "Kaziranga Wildlife Spot",
    subtitle: "Visual Focus & Attention",
    description: "Spot and remember the gentle rhinos, wild water buffaloes, and hornbills of Assam.",
    category: "Visual Focus",
    duration: "3 Mins",
    demoPairs: ['🦏', '🦅', '🦌', '🌿', '🦏', '🦅', '🦌', '🌿']
  },
  {
    dayName: "Tuesday",
    title: "Tezpur Tea Leaf Pattern Sort",
    subtitle: "Category & Shape Association",
    description: "Group the golden tea leaves, woven bamboo baskets, and morning tea cups.",
    category: "Executive Function",
    duration: "4 Mins",
    demoPairs: ['🍵', '🧺', '🍃', '☀️', '🍵', '🧺', '🍃', '☀️']
  },
  {
    dayName: "Wednesday",
    title: "Assamese Bihu Dhol Rhythm",
    subtitle: "Auditory & Musical Timing",
    description: "Tap along to the cheerful beats of the traditional Bihu drum and bamboo flutes.",
    category: "Auditory Recall",
    duration: "3 Mins",
    demoPairs: ['🥁', '🪈', '💃', '✨', '🥁', '🪈', '💃', '✨']
  },
  {
    dayName: "Thursday",
    title: "Brahmaputra Ferry Crossing",
    subtitle: "Step Sequencing & Direction",
    description: "Guide the sunset ferry safely across the islands of the majestic Brahmaputra River.",
    category: "Spatial Logic",
    duration: "4 Mins",
    demoPairs: ['⛵', '🌊', '🌅', '🏝️', '⛵', '🌊', '🌅', '🏝️']
  },
  {
    dayName: "Friday",
    title: "Majuli Mask Color Recall",
    subtitle: "Heritage Visual Recognition",
    description: "Remember the vibrant colors and painted features of sacred Majuli river island masks.",
    category: "Heritage Recall",
    duration: "3 Mins",
    demoPairs: ['🎭', '🎨', '🌟', '🦚', '🎭', '🎨', '🌟', '🦚']
  },
  {
    dayName: "Saturday",
    title: "Guwahati Heritage Memory Trail",
    subtitle: "Familiar Places & Stories",
    description: "Relive joyful memories of historic ghats, silk markets, and river vistas.",
    category: "Episodic Recall",
    duration: "4 Mins",
    demoPairs: ['🏛️', '🛶', '🌸', '🔔', '🏛️', '🛶', '🌸', '🔔']
  }
];

export default function PatientDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { 
    activePatient, 
    toggleReminder, 
    currentLanguage, 
    logoutPatient,
    loadPatientPhotos,
    recordGameSession,
    isOnline,
    pendingSyncCount,
    syncToast
  } = useApp();

  // Real-time ticking device clock (updates every 15s)
  const [nowTime, setNowTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNowTime(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  // Time-aware greeting ("Good Morning", "Good Afternoon", "Good Evening")
  const greetingWord = useMemo(() => {
    const hour = nowTime.getHours();
    if (hour < 12) return t('dashboard.goodMorning');
    if (hour < 17) return t('dashboard.goodAfternoon');
    return t('dashboard.goodEvening');
  }, [nowTime, t]);

  // Real MongoDB Memory Bank Photos
  const [vaultPhotos, setVaultPhotos] = useState(familyPhotos);

  useEffect(() => {
    let isMounted = true;
    if (activePatient?.id) {
      loadPatientPhotos(activePatient.id).then(dbPhotos => {
        if (isMounted && dbPhotos && Array.isArray(dbPhotos) && dbPhotos.length > 0) {
          setVaultPhotos(dbPhotos);
        }
      });
    }
    return () => { isMounted = false; };
  }, [activePatient?.id, loadPatientPhotos]);

  // Voice greeting audio state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioMessage, setAudioMessage] = useState('');

  // Selected Photo Modal
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Selected Regular Game Modal
  const [selectedGame, setSelectedGame] = useState(null);

  // Game of the Day Modal State
  const [isGameOfDayOpen, setIsGameOfDayOpen] = useState(false);

  // Streak & Game of the Day Completion State
  const todayKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }, []);

  const [isGameOfDayCompleted, setIsGameOfDayCompleted] = useState(() => {
    return localStorage.getItem(`smriti_god_done_${activePatient.id}_${todayKey}`) === 'true';
  });

  const [currentStreak, setCurrentStreak] = useState(activePatient.streakDays || 14);

  // Today's featured game based on day of week
  const todayFeaturedGame = useMemo(() => {
    const dayIdx = nowTime.getDay();
    return dailyGamesList[dayIdx] || dailyGamesList[0];
  }, [nowTime]);

  // Mini-game in modal state
  const [godFlippedIndices, setGodFlippedIndices] = useState([]);
  const [godMatchedIndices, setGodMatchedIndices] = useState([]);

  // Voice narration helper
  const speakText = (text) => {
    setAudioMessage(text);
    setIsPlayingAudio(true);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 3000);
    }
  };

  const handleGreetingAudio = () => {
    const greetingText = t('dashboard.audioGreeting', {
      name: activePatient.name.split(' ')[0],
      streak: currentStreak
    });
    speakText(greetingText);
  };

  const handleReminderDone = (remId, title) => {
    toggleReminder(activePatient.id, remId);
    
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#15803d', '#9a3412', '#78716c']
    });

    speakText(t('dashboard.completedRoutineAudio', { title }));
  };

  // Helper to parse reminder scheduled time into today's Date object
  const parseReminderTime = (rem) => {
    if (rem.scheduledTime) {
      const d = new Date(rem.scheduledTime);
      if (!isNaN(d.getTime())) return d;
    }
    if (rem.time) {
      const match = rem.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let [_, hours, minutes, period] = match;
        hours = parseInt(hours, 10);
        minutes = parseInt(minutes, 10);
        if (period.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
        const d = new Date(nowTime);
        d.setHours(hours, minutes, 0, 0);
        return d;
      }
    }
    return new Date(nowTime);
  };

  // Helper to render consistent icons across reminder types
  const getReminderIcon = (type) => {
    switch (type) {
      case 'medicine': return <Pill className="w-7 h-7" />;
      case 'hydration': return <Droplets className="w-7 h-7" />;
      case 'meal': return <span className="text-2xl">🍲</span>;
      case 'game': return <BrainCircuit className="w-7 h-7" />;
      case 'activity': return <Footprints className="w-7 h-7" />;
      case 'appointment': return <Calendar className="w-7 h-7" />;
      case 'rest': return <span className="text-2xl">🌙</span>;
      default: return <Clock className="w-7 h-7" />;
    }
  };

  // Process and sort all today's reminders chronologically
  const chronologicalReminders = useMemo(() => {
    const reminders = activePatient.todayReminders || [];
    
    return reminders.map(rem => {
      const isCompleted = rem.status === 'completed' || rem.acknowledged === true;
      const scheduledDate = parseReminderTime(rem);
      const diffMinutes = (nowTime.getTime() - scheduledDate.getTime()) / (1000 * 60);

      let timeState = 'upcoming'; // 'due_now' | 'overdue' | 'upcoming' | 'completed'

      if (isCompleted) {
        timeState = 'completed';
      } else if (diffMinutes >= -45 && diffMinutes <= 60) {
        timeState = 'due_now';
      } else if (diffMinutes > 60) {
        timeState = 'overdue';
      } else {
        timeState = 'upcoming';
      }

      return {
        ...rem,
        isCompleted,
        scheduledDate,
        timeState,
        formattedTime: rem.time || scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }).sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
  }, [activePatient.todayReminders, nowTime]);

  // ========================================================
  // IN-APP BROWSER NOTIFICATIONS FOR SCHEDULED REMINDERS
  // ========================================================
  const [notifPermission, setNotifPermission] = useState(() => getNotificationPermission());
  const [showPermissionBanner, setShowPermissionBanner] = useState(() => {
    return getNotificationPermission() === 'default' && sessionStorage.getItem('smriti_dismiss_notif_banner') !== 'true';
  });
  const [testNotifToast, setTestNotifToast] = useState('');

  // Track fired notification IDs in this session to prevent duplicate notifications
  const notifiedReminderIdsRef = useRef(new Set());

  // Request browser permission
  const handleEnableNotifications = async () => {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      setShowPermissionBanner(false);
      sendBrowserNotification({
        title: '🌸 Smriti Gentle Reminders Active',
        body: 'You will now receive timely alerts for medicines, hydration, and daily activities.',
        icon: activePatient.avatar
      });
    } else {
      setShowPermissionBanner(false);
    }
  };

  const handleDismissPermissionBanner = () => {
    setShowPermissionBanner(false);
    sessionStorage.setItem('smriti_dismiss_notif_banner', 'true');
  };

  // Test Notification Helper (Triggers an immediate test & a 5-second countdown alert)
  const handleTestNotification = async () => {
    let currentPerm = notifPermission;
    if (currentPerm === 'default') {
      currentPerm = await requestNotificationPermission();
      setNotifPermission(currentPerm);
    }

    if (currentPerm !== 'granted') {
      setTestNotifToast('⚠️ Notification permission was not granted. Please allow notifications in your browser settings.');
      setTimeout(() => setTestNotifToast(''), 4500);
      return;
    }

    setTestNotifToast('⏰ Test scheduled: Alert firing in 5 seconds! Keep this tab open...');

    setTimeout(() => {
      const testTag = `smriti-test-${Date.now()}`;
      notifiedReminderIdsRef.current.add(testTag);

      sendBrowserNotification({
        title: '🌸 Smriti — Time for your medicine',
        body: 'Morning Routine: Amlodipine 5mg & Lukewarm Herbal Tea',
        icon: activePatient.avatar,
        tag: testTag
      });

      setTestNotifToast('✓ Notification fired! Click the browser notification to bring Smriti to the front.');
      setTimeout(() => setTestNotifToast(''), 4000);
    }, 5000);
  };

  // Scheduled Reminders Periodic Checker (Runs on each clock tick while dashboard is open)
  useEffect(() => {
    if (notifPermission !== 'granted') return;

    const nowMs = nowTime.getTime();

    chronologicalReminders.forEach((rem) => {
      // Only alert for uncompleted, unacknowledged routines
      if (rem.isCompleted || rem.acknowledged || rem.status === 'completed') return;

      const scheduledMs = rem.scheduledDate.getTime();
      const diffMinutes = (nowMs - scheduledMs) / (1000 * 60);

      // Trigger if current time has reached or passed scheduledTime (within today's active window of 0 to 120 mins)
      if (nowMs >= scheduledMs && diffMinutes <= 120) {
        const uniqueId = rem.id || rem._id || `${rem.type}-${rem.title}-${rem.time}`;

        if (!notifiedReminderIdsRef.current.has(uniqueId)) {
          notifiedReminderIdsRef.current.add(uniqueId);

          const typeName = rem.type ? rem.type.charAt(0).toUpperCase() + rem.type.slice(1) : 'Routine';
          const title = `🌸 Smriti — Time for your ${typeName}`;
          const body = `${rem.title ? rem.title + ': ' : ''}${rem.detail || 'Scheduled daily routine'} (${rem.formattedTime || rem.time || ''})`;

          sendBrowserNotification({
            title,
            body,
            icon: activePatient.avatar,
            tag: `smriti-rem-${uniqueId}`
          });
        }
      }
    });
  }, [nowTime, chronologicalReminders, notifPermission, activePatient.avatar]);

  // Select the 3 focused reminders: Exactly ONE Previous, ONE Current, ONE Next
  const threeFocusedReminders = useMemo(() => {
    const all = chronologicalReminders;
    if (all.length === 0) return [];
    if (all.length <= 3) {
      const labels = ['Previous', 'Current', 'Next'];
      return all.map((rem, idx) => ({
        ...rem,
        slotLabel: labels[idx] || 'Upcoming'
      }));
    }

    const nowMs = nowTime.getTime();

    // Find the index of the most recent reminder whose scheduledTime has already passed
    let lastPassedIdx = -1;
    for (let i = 0; i < all.length; i++) {
      if (all[i].scheduledDate.getTime() <= nowMs) {
        lastPassedIdx = i;
      } else {
        break;
      }
    }

    let prevIdx, currIdx, nextIdx;

    if (lastPassedIdx === -1) {
      // Early morning before first reminder: [0, 1, 2]
      prevIdx = 0;
      currIdx = 1;
      nextIdx = 2;
    } else if (lastPassedIdx >= all.length - 2) {
      // Near or at end of day: [N-3, N-2, N-1]
      prevIdx = all.length - 3;
      currIdx = all.length - 2;
      nextIdx = all.length - 1;
    } else {
      // Middle of day: [lastPassedIdx, lastPassedIdx + 1, lastPassedIdx + 2]
      prevIdx = lastPassedIdx;
      currIdx = lastPassedIdx + 1;
      nextIdx = lastPassedIdx + 2;
    }

    return [
      { ...all[prevIdx], slotLabel: 'Previous' },
      { ...all[currIdx], slotLabel: 'Current' },
      { ...all[nextIdx], slotLabel: 'Next' }
    ];
  }, [chronologicalReminders, nowTime]);

  const completedCount = chronologicalReminders.filter(r => r.isCompleted).length;
  const totalCount = chronologicalReminders.length || 10;

  const handleGodCardClick = (index) => {
    if (godMatchedIndices.includes(index) || godFlippedIndices.includes(index)) return;

    if (godFlippedIndices.length === 1) {
      const firstIndex = godFlippedIndices[0];
      const newFlipped = [firstIndex, index];
      setGodFlippedIndices(newFlipped);

      const item1 = todayFeaturedGame.demoPairs[firstIndex];
      const item2 = todayFeaturedGame.demoPairs[index];

      if (item1 === item2) {
        const newMatched = [...godMatchedIndices, firstIndex, index];
        setGodMatchedIndices(newMatched);
        setGodFlippedIndices([]);

        if (newMatched.length === todayFeaturedGame.demoPairs.length) {
          completeGameOfDay();
        }
      } else {
        setTimeout(() => setGodFlippedIndices([]), 900);
      }
    } else {
      setGodFlippedIndices([index]);
    }
  };

  const completeGameOfDay = () => {
    if (!isGameOfDayCompleted) {
      setIsGameOfDayCompleted(true);
      const nextStreak = currentStreak + 1;
      setCurrentStreak(nextStreak);
      localStorage.setItem(`smriti_god_done_${activePatient.id}_${todayKey}`, 'true');

      // Record to MongoDB
      if (activePatient?.id) {
        recordGameSession(activePatient.id, {
          gameType: 'game_of_day',
          title: todayFeaturedGame.title,
          category: todayFeaturedGame.category,
          score: 100,
          duration: todayFeaturedGame.duration
        });
      }
    }

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#15803d', '#9a3412', '#78716c']
    });

    speakText(`Congratulations ${activePatient.name.split(' ')[0]}! You completed today's Game of the Day and maintained your memory streak!`);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAF7F2] pb-24 pt-6 px-4 sm:px-6 lg:px-8 xl:px-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ======================================================== */}
        {/* 0. SYSTEM ALERTS & NOTICES                               */}
        {/* ======================================================== */}
        
        {/* 0a. BROWSER NOTIFICATION PERMISSION BANNER */}
        {showPermissionBanner && notifPermission === 'default' && (
          <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-500/60 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-amber-800 text-white flex items-center justify-center shrink-0 shadow-sm">
                <BellRing className="w-7 h-7 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-stone-950">
                  {t('dashboard.enableNotifTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 font-medium leading-relaxed">
                  {t('dashboard.enableNotifDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={handleDismissPermissionBanner}
                className="px-4 py-3 rounded-xl bg-white hover:bg-stone-100 text-stone-800 text-xs sm:text-sm font-bold border-2 border-stone-300 cursor-pointer transition-colors"
              >
                {t('dashboard.notNow')}
              </button>
              <button
                type="button"
                onClick={handleEnableNotifications}
                className="px-5 py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs sm:text-sm font-black shadow-md cursor-pointer transition-all flex items-center gap-2 active:scale-95"
              >
                <Bell className="w-4 h-4" />
                <span>{t('dashboard.allowReminders')}</span>
              </button>
            </div>
          </div>
        )}

        {/* 0b. TEST NOTIFICATION COUNTDOWN FEEDBACK TOAST */}
        {testNotifToast && (
          <div className="p-4 rounded-2xl bg-stone-950 text-white text-xs sm:text-sm font-bold flex items-center justify-between gap-3 shadow-lg border border-stone-800 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-spin" />
              <span>{testNotifToast}</span>
            </div>
            <button
              onClick={() => setTestNotifToast('')}
              className="text-stone-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 0c. GENTLE OFFLINE STATUS BANNER */}
        {!isOnline && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-400 text-stone-900 text-xs sm:text-sm font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-xl shrink-0">
                📶
              </div>
              <div>
                <p className="font-black text-stone-950 text-sm sm:text-base">
                  {t('dashboard.offlineNotice', "You're offline — showing your last saved information")}
                </p>
                <p className="text-xs sm:text-sm text-stone-700 font-semibold mt-0.5">
                  {pendingSyncCount > 0 
                    ? t('dashboard.offlineSyncPending', '{{count}} action saved locally — will sync automatically when connection returns.', { count: pendingSyncCount })
                    : t('dashboard.offlineSafe', 'All your reminders, photos, and games are safely available on your device.')
                  }
                </p>
              </div>
            </div>
            {pendingSyncCount > 0 && (
              <span className="px-3.5 py-1.5 bg-amber-200 text-amber-950 rounded-xl text-xs font-black shrink-0 border border-amber-400 self-start sm:self-center flex items-center gap-1.5 shadow-2xs">
                <Clock className="w-4 h-4 text-amber-900" />
                <span>{pendingSyncCount} {t('dashboard.pendingSync', 'Pending Sync')}</span>
              </span>
            )}
          </div>
        )}

        {/* 0d. SYNC TOAST / ONLINE RECONNECT TOAST */}
        {syncToast && (
          <div className="p-4 rounded-2xl bg-emerald-900 text-white text-xs sm:text-sm font-bold flex items-center justify-between gap-3 shadow-lg border border-emerald-700 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
              <span>{syncToast}</span>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 1. TOP HERO GREETING CARD (FULL WIDTH)                   */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200/90 shadow-sm relative">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Patient Greeting & Large Avatar */}
            <div className="flex items-center gap-4 sm:gap-6">
              <button
                type="button"
                onClick={() => navigate('/patient/profile')}
                className="relative group cursor-pointer focus:outline-none shrink-0"
                title={t('dashboard.myProfile')}
              >
                <img
                  src={activePatient.avatar}
                  alt={activePatient.name}
                  className="w-20 h-20 sm:w-26 sm:h-26 rounded-2xl sm:rounded-3xl object-cover border-3 border-stone-300 group-hover:border-amber-800 transition-all shadow-md group-hover:scale-105"
                />
                <span className="absolute -bottom-1.5 -right-1.5 bg-amber-800 text-white p-2 rounded-full shadow-md border-2 border-white">
                  <User className="w-4 h-4 stroke-[2.5]" />
                </span>
              </button>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-black border border-stone-300">
                    <HeartHandshake className="w-3.5 h-3.5 text-amber-800" />
                    <span>{t('profilePage.earlySupport', 'Early Memory Support')}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-bold border border-amber-300">
                    <MapPin className="w-3 h-3 text-amber-800" />
                    <span>{activePatient.location || 'Assam'}</span>
                  </span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-950 leading-tight">
                  {greetingWord}, <br className="hidden sm:inline" />
                  <span className="text-amber-800">{activePatient.name}!</span>
                </h1>

                <p className="text-xs sm:text-sm text-stone-600 font-semibold flex items-center gap-2">
                  <span>📅 {nowTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                  <span>•</span>
                  <span>⏰ {nowTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </p>
              </div>
            </div>

            {/* Header Right Actions: High-Contrast, Distinct Semantic Buttons */}
            <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap sm:flex-nowrap">
              
              {/* WhatsApp Quick Chat (Official Green) */}
              <a
                href="https://wa.me/15556680031?text=Hi%20Smriti"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-5 py-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm sm:text-base font-black shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
                title={t('dashboard.whatsAppTitle')}
              >
                <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>{t('dashboard.whatsApp')}</span>
              </a>

              {/* Profile Card Button */}
              <button
                type="button"
                onClick={() => navigate('/patient/profile')}
                className="flex-1 sm:flex-none px-5 py-4 rounded-2xl bg-stone-100 hover:bg-stone-200 border-2 border-stone-300 text-stone-900 text-sm sm:text-base font-black shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                title="View patient profile & caregiver details"
              >
                <User className="w-5 h-5 text-stone-700" />
                <span>{t('dashboard.profile')}</span>
              </button>

              {/* Royal Indigo Audio Speaker Button */}
              <button
                type="button"
                onClick={handleGreetingAudio}
                className={`flex-1 sm:flex-none px-6 py-4 rounded-2xl flex items-center justify-center gap-2.5 text-sm sm:text-base font-black shadow-md transition-all cursor-pointer active:scale-95 ${
                  isPlayingAudio
                    ? 'bg-indigo-900 text-white ring-4 ring-indigo-300 animate-pulse'
                    : 'bg-indigo-700 hover:bg-indigo-800 text-white'
                }`}
              >
                <Volume2 className="w-5 h-5 shrink-0" />
                <span>{isPlayingAudio ? t('dashboard.speaking') : t('dashboard.listen')}</span>
              </button>

            </div>

          </div>

          {isPlayingAudio && audioMessage && (
            <div className="mt-4 p-4 bg-indigo-50 rounded-2xl text-xs sm:text-sm text-indigo-950 font-bold text-center border-2 border-indigo-200 animate-in fade-in">
              🔊 "{audioMessage}"
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 2. PROMINENT STREAK & ADHERENCE BANNER (FULL WIDTH)      */}
        {/* ======================================================== */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 sm:p-7 text-white shadow-md border-2 border-amber-500/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 shadow-sm">
              <Flame className="w-9 h-9 text-amber-200 fill-amber-200 animate-bounce" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                {currentStreak} {t('dashboard.daysInRow')} 🔥
              </h2>
              <p className="text-xs sm:text-sm text-amber-100 font-bold mt-0.5">
                {t('dashboard.streakSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 self-start md:self-center bg-black/20 px-5 py-3.5 rounded-2xl border border-white/15">
            <div className="text-right">
              <p className="text-xs text-amber-200 font-black uppercase tracking-wider">{t('dashboard.todaysRoutine')}</p>
              <p className="text-xl sm:text-2xl font-black">{t('dashboard.doneTally', { completed: completedCount, total: totalCount })}</p>
            </div>
            {/* Visual Mini Progress Circle or Bar */}
            <div className="w-16 bg-white/25 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-amber-300 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.round((completedCount / (totalCount || 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. MAIN DASHBOARD 2-COLUMN GRID (1400px VIEWPORT READY)  */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ====================================================== */}
          {/* LEFT COLUMN: TODAY'S ROUTINES & MEMORY BANK (8 COLS)   */}
          {/* ====================================================== */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-8">
            
            {/* SECTION 3A: TIME-DYNAMIC TODAY'S REMINDERS */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-stone-200/90 shadow-sm space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-950 flex items-center gap-2.5">
                    <span>{t('dashboard.todaysReminders')}</span>
                    <span className="text-xs font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                      {nowTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 font-semibold mt-1">
                    {t('dashboard.remindersSubtitle')}
                  </p>
                </div>

                {/* Notification Status & Test Control */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  {notifPermission === 'granted' ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 text-xs font-black border border-emerald-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                        <span>{t('dashboard.liveAlertsActive')}</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleTestNotification}
                        className="px-3 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-300 transition-all cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                        title="Test browser notification countdown (fires in 5 seconds)"
                      >
                        <Bell className="w-3.5 h-3.5 text-stone-700" />
                        <span>{t('dashboard.testAlert')}</span>
                      </button>
                    </div>
                  ) : notifPermission === 'denied' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-bold border border-stone-300" title="Notifications blocked in browser settings">
                      <BellOff className="w-3.5 h-3.5 text-stone-500" />
                      <span>{t('dashboard.alertsBlocked')}</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleEnableNotifications}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-black shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>{t('dashboard.enableAlerts')}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 3 Focused Reminder Cards */}
              <div className="space-y-4">
                {threeFocusedReminders.map((rem) => {
                  const isCurrent = rem.slotLabel === 'Current';
                  const isPrevious = rem.slotLabel === 'Previous';
                  const isNext = rem.slotLabel === 'Next';
                  const isDone = rem.isCompleted;
                  const isDueNow = rem.timeState === 'due_now';

                  return (
                    <div
                      key={rem.id}
                      className={`rounded-2xl sm:rounded-3xl transition-all p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 ${
                        isDone
                          ? 'bg-emerald-50/70 border-2 border-emerald-300 shadow-xs'
                          : isCurrent
                          ? 'bg-amber-50 border-2 border-amber-600 shadow-md ring-4 ring-amber-500/10'
                          : isPrevious
                          ? 'bg-rose-50/80 border-2 border-rose-300 shadow-xs'
                          : 'bg-stone-50 border-2 border-stone-200 shadow-2xs'
                      }`}
                    >
                      
                      {/* Left: Type Icon + Details */}
                      <div className="flex items-start sm:items-center gap-4">
                        
                        {/* State-specific Icon Bubble */}
                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 font-bold shadow-xs ${
                          isDone
                            ? 'bg-emerald-700 text-white'
                            : isCurrent
                            ? 'bg-amber-800 text-white'
                            : isPrevious
                            ? 'bg-rose-700 text-white'
                            : 'bg-stone-200 text-stone-800 border border-stone-300'
                        }`}>
                          {getReminderIcon(rem.type)}
                        </div>

                        <div className="space-y-1">
                          
                          {/* Slot Label & Status Badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {isPrevious && (
                              <span className="px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-800 text-xs font-black uppercase tracking-wider border border-stone-300">
                                {t('dashboard.previous')}
                              </span>
                            )}

                            {isCurrent && (
                              <span className="px-3 py-0.5 rounded-full bg-amber-800 text-white text-xs font-black shadow-xs tracking-wider uppercase">
                                ★ {t('dashboard.current')}
                              </span>
                            )}

                            {isNext && (
                              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-900 text-xs font-black border border-sky-300 uppercase tracking-wider">
                                {t('dashboard.next')}
                              </span>
                            )}

                            {isDone && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-950 text-xs font-black border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                <span>{t('dashboard.completed')} ✓ ({rem.formattedTime})</span>
                              </span>
                            )}

                            {!isDone && isCurrent && (
                              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-200 text-amber-950 text-xs font-black border border-amber-400 shadow-2xs">
                                <Sparkles className="w-3.5 h-3.5 text-amber-900" />
                                <span>{isDueNow ? t('dashboard.dueNow') : t('dashboard.upcoming')} ({rem.formattedTime})</span>
                              </span>
                            )}

                            {!isDone && isPrevious && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-950 text-xs font-black border border-rose-400">
                                <Clock className="w-3.5 h-3.5 text-rose-800" />
                                <span>{t('dashboard.overdue')} ({rem.formattedTime})</span>
                              </span>
                            )}

                            {!isDone && isNext && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 text-xs font-bold border border-stone-300">
                                <Clock className="w-3.5 h-3.5 text-stone-600" />
                                <span>{t('dashboard.upcoming')} ({rem.formattedTime})</span>
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl sm:text-2xl font-black text-stone-950 leading-tight">
                            {rem.title}
                          </h3>

                          <p className="text-xs sm:text-sm text-stone-700 font-semibold leading-relaxed">
                            {rem.detail}
                          </p>
                        </div>

                      </div>

                      {/* Right: Giant Elderly-Friendly 1-Tap Action Button */}
                      <div className="shrink-0 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => handleReminderDone(rem.id, rem.title)}
                          className={`w-full sm:w-52 py-4 px-6 rounded-2xl text-base sm:text-lg font-black flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-95 cursor-pointer ${
                            isDone
                              ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                              : isCurrent
                              ? 'bg-amber-800 hover:bg-amber-900 text-white shadow-md ring-2 ring-amber-700/30'
                              : isPrevious
                              ? 'bg-rose-800 hover:bg-rose-900 text-white shadow-xs'
                              : 'bg-stone-900 hover:bg-stone-950 text-white'
                          }`}
                        >
                          <Check className="w-6 h-6 stroke-[3]" />
                          <span>{isDone ? `${t('dashboard.done')} ✓` : `${t('dashboard.markDone')} ✓`}</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* View All Reminders Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/patient/reminders')}
                  className="w-full py-4 px-6 bg-stone-50 hover:bg-amber-50 border-2 border-stone-300 hover:border-amber-800 rounded-2xl sm:rounded-3xl text-sm sm:text-base font-black text-stone-900 hover:text-amber-950 shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
                >
                  <ListOrdered className="w-5 h-5 text-stone-700 group-hover:text-amber-800 transition-colors" />
                  <span>{t('dashboard.viewAllReminders')} ({chronologicalReminders.length}) →</span>
                </button>
              </div>

            </div>

            {/* SECTION 3B: FAMILY PHOTO MEMORIES */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-stone-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-950 flex items-center gap-2">
                    <span>{t('dashboard.familyMemories')}</span>
                    <span>🌸</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 font-semibold mt-0.5">
                    {t('dashboard.familyMemoriesDesc')}
                  </p>
                </div>
                <span className="text-xs text-stone-600 font-bold hidden sm:inline">{t('dashboard.scrollHorizontal')}</span>
              </div>

              <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-3 pt-1 no-scrollbar">
                {vaultPhotos.map((photo, pIdx) => (
                  <div
                    key={photo._id || photo.id || pIdx}
                    onClick={() => {
                      setSelectedPhoto(photo);
                      speakText(`${photo.title}. ${photo.audioNote || photo.audioPrompt || photo.description || ''}`);
                    }}
                    className="min-w-[260px] sm:min-w-[280px] bg-stone-50 rounded-2xl p-4 border-2 border-stone-200 hover:border-amber-800/60 shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0 group flex flex-col justify-between"
                  >
                    <div className="relative overflow-hidden rounded-xl aspect-[4/3] bg-stone-200 border border-stone-300">
                      <img
                        src={photo.photoUrl || photo.imageUrl || photo.image}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute top-2.5 right-2.5 bg-stone-950/85 backdrop-blur-xs text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs">
                        {photo.year || '2024'}
                      </div>
                      {(photo.relation || photo.taggedName) && (
                        <div className="absolute bottom-2.5 left-2.5 bg-amber-900/90 backdrop-blur-xs text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs">
                          {photo.relation || photo.taggedName}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 space-y-1">
                      <h3 className="text-base sm:text-lg font-black text-stone-950 group-hover:text-amber-900 transition-colors">
                        {photo.title}
                      </h3>
                      <p className="text-xs text-stone-600 font-bold">
                        {photo.location}
                      </p>
                      <p className="text-xs text-stone-700 font-medium line-clamp-2 leading-relaxed mt-1">
                        {photo.description}
                      </p>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-stone-200 flex items-center justify-between text-xs text-amber-900 font-black">
                      <span className="flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-amber-800" />
                        <span>Hear memory 🔊</span>
                      </span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-amber-800 stroke-[3]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ====================================================== */}
          {/* RIGHT COLUMN: GAMES, STREAK & CARE HOTLINE (5 COLS)    */}
          {/* ====================================================== */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-8">
            
            {/* SECTION 4A: FEATURED GAME OF THE DAY (DAILY STREAK CHALLENGE) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-950 flex items-center gap-2">
                    <span>{t('dashboard.dailyStreakChallenge')}</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 font-bold mt-0.5">
                    {t('dashboard.streakSubtitle')}
                  </p>
                </div>

                {isGameOfDayCompleted && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 text-xs font-black border border-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>{t('dashboard.completedChallenge')}</span>
                  </span>
                )}
              </div>

              {/* Large Hero Card for Game of the Day */}
              <div className={`rounded-3xl p-6 sm:p-7 text-white relative overflow-hidden border-2 transition-all shadow-md bg-stone-950 ${
                isGameOfDayCompleted ? 'border-emerald-500' : 'border-stone-800'
              }`}>
                
                <div className="relative z-10 space-y-4">
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-700 text-white text-xs font-black uppercase tracking-wider shadow-2xs">
                      <Flame className="w-3.5 h-3.5 fill-white" />
                      <span>{todayFeaturedGame.dayName} Challenge</span>
                    </span>

                    <span className="px-2.5 py-1 rounded-full bg-white/15 text-stone-100 text-xs font-bold border border-white/20">
                      {todayFeaturedGame.category}
                    </span>

                    <span className="px-2.5 py-1 rounded-full bg-white/15 text-stone-100 text-xs font-bold border border-white/20">
                      ⏱️ {todayFeaturedGame.duration}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                      {todayFeaturedGame.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-200 font-bold mt-1">
                      {todayFeaturedGame.subtitle}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-medium">
                    {todayFeaturedGame.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs font-bold text-stone-400 pt-1 border-t border-stone-800">
                    <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>{t('dashboard.rewardsStreak')}</span>
                    </span>
                    <span>•</span>
                    <span>{t('dashboard.gentleRelaxing')}</span>
                  </div>

                  {/* Big Action Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsGameOfDayOpen(true);
                        setGodFlippedIndices([]);
                        setGodMatchedIndices([]);
                      }}
                      className={`w-full py-4 sm:py-5 px-6 rounded-2xl font-black text-lg sm:text-xl shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-95 ${
                        isGameOfDayCompleted
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black'
                      }`}
                    >
                      {isGameOfDayCompleted ? (
                        <>
                          <CheckCircle2 className="w-7 h-7 text-white" />
                          <span>{t('dashboard.completedChallenge')}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-7 h-7 fill-stone-950 text-stone-950" />
                          <span>{t('dashboard.playChallenge')}</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>

              </div>
            </div>

            {/* SECTION 4B: EXPLORE MORE PRACTICE GAMES */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-stone-200/90 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-stone-950">
                  {t('dashboard.exploreMoreGames')}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 font-semibold mt-0.5">
                  {t('dashboard.exploreGamesDesc')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {cognitiveGames.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => {
                      setSelectedGame(game);
                    }}
                    className="bg-stone-50 rounded-2xl p-4 border-2 border-stone-200 hover:border-amber-800/60 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-stone-800 bg-white px-2 py-0.5 rounded-md border border-stone-300">
                          {game.badge || game.category}
                        </span>
                        <span className="text-[11px] font-bold text-stone-600">
                          {game.difficulty}
                        </span>
                      </div>

                      <h4 className="text-base font-black text-stone-950 group-hover:text-amber-900 transition-colors">
                        {game.title}
                      </h4>
                      <p className="text-xs text-stone-600 font-medium mt-1 line-clamp-2">
                        {game.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-200 flex items-center justify-between text-xs text-stone-900 font-black">
                      <span>{t('dashboard.practiceAnytime')}</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-amber-800 stroke-[3]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4C: QUICK ELDER CARE & EMERGENCY REFERENCE */}
            <div className="bg-white rounded-3xl p-6 border-2 border-stone-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 shrink-0">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-stone-950">Caregiver & Assistance</h3>
                  <p className="text-xs text-stone-600 font-semibold">{activePatient.primaryCaregiver || 'Dr. Ananya Sharma'}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs sm:text-sm font-semibold text-stone-700 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 font-bold">Emergency Phone:</span>
                  <span className="font-black text-stone-900">{activePatient.emergencyContact || activePatient.phone || '+91 94350 12345'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 font-bold">Active Channel:</span>
                  <span className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">WhatsApp Active</span>
                </div>
              </div>

              <a
                href="https://wa.me/15556680031?text=Hi%20Smriti"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <span>Chat with Smriti Assistant on WhatsApp</span>
              </a>
            </div>

          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL: GAME OF THE DAY INTERACTIVE PLAYGROUND            */}
      {/* ======================================================== */}
      {isGameOfDayOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-stone-200 shadow-2xl relative animate-in fade-in zoom-in-95">
            
            <button
              onClick={() => setIsGameOfDayOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-black uppercase tracking-wider border border-stone-200">
                <Flame className="w-3.5 h-3.5 fill-stone-800" />
                <span>Today's Streak Challenge</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-stone-900">
                {todayFeaturedGame.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500">
                Tap matching pairs below to complete your daily memory goal!
              </p>
            </div>

            {/* Interactive Memory Card Grid */}
            <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto py-2">
              {todayFeaturedGame.demoPairs.map((symbol, idx) => {
                const isFlipped = godFlippedIndices.includes(idx);
                const isMatched = godMatchedIndices.includes(idx);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleGodCardClick(idx)}
                    className={`h-16 sm:h-18 rounded-2xl text-2xl sm:text-3xl font-black flex items-center justify-center transition-all cursor-pointer border shadow-2xs active:scale-95 ${
                      isMatched
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-950 scale-95'
                        : isFlipped
                        ? 'bg-amber-100 border-amber-800 text-amber-950 scale-105'
                        : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-transparent'
                    }`}
                  >
                    {isFlipped || isMatched ? symbol : '🌸'}
                  </button>
                );
              })}
            </div>

            {/* Completion Feedback */}
            {isGameOfDayCompleted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl text-center space-y-2">
                <p className="text-base font-black flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  <span>Challenge Completed! Streak: {currentStreak} Days 🔥</span>
                </p>
                <button
                  type="button"
                  onClick={() => setIsGameOfDayOpen(false)}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-all cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center text-xs font-bold text-stone-500 pt-2 border-t border-stone-200">
                <span>Matched: {godMatchedIndices.length / 2} / {todayFeaturedGame.demoPairs.length / 2} Pairs</span>
                <button
                  type="button"
                  onClick={completeGameOfDay}
                  className="text-amber-800 hover:underline font-extrabold cursor-pointer"
                >
                  ⚡ Auto-Complete (Demo)
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL: PHOTO VAULT DETAILS */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-stone-200 shadow-2xl relative animate-in fade-in">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={selectedPhoto.imageUrl || selectedPhoto.image}
              alt={selectedPhoto.title}
              className="w-full aspect-[4/3] object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80';
              }}
            />

            <div className="p-6 sm:p-8 space-y-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded-md border border-stone-200">
                    {selectedPhoto.year} • {selectedPhoto.location}
                  </span>
                  {selectedPhoto.relation && (
                    <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-200">
                      {selectedPhoto.relation}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
                  {selectedPhoto.title}
                </h3>
                <p className="text-stone-700 text-sm sm:text-base mt-2 leading-relaxed">
                  {selectedPhoto.description || selectedPhoto.audioNote || selectedPhoto.audioPrompt}
                </p>
              </div>

              <button
                type="button"
                onClick={() => speakText(`${selectedPhoto.title}. ${selectedPhoto.audioNote || selectedPhoto.audioPrompt || selectedPhoto.description}`)}
                className="w-full py-4 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-black text-base flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer"
              >
                <Volume2 className="w-5 h-5" />
                <span>Listen to Family Memory 🔊</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGULAR PRACTICE GAME */}
      {selectedGame && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-stone-200 shadow-2xl relative animate-in fade-in">
            <button
              onClick={() => setSelectedGame(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-md border border-stone-200">
                {selectedGame.badge} • Practice
              </span>
              <h3 className="text-2xl font-black text-stone-900">
                {selectedGame.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500">
                {selectedGame.description}
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl text-center space-y-3 border border-stone-200">
              <p className="text-xs sm:text-sm text-stone-700 font-semibold">
                Enjoy relaxing practice sessions anytime to stimulate focus and calm.
              </p>
              <button
                type="button"
                onClick={() => {
                  confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
                  setSelectedGame(null);
                }}
                className="w-full py-3 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl transition-all cursor-pointer"
              >
                Start Practice Session
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
