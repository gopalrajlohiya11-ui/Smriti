import React, { useState, useEffect, useMemo } from 'react';
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
  HeartHandshake
} from 'lucide-react';

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
  const navigate = useNavigate();
  const { activePatient, toggleReminder, currentLanguage, logoutPatient } = useApp();

  // Real-time ticking device clock (updates every 15s)
  const [nowTime, setNowTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNowTime(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  // Voice greeting audio state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioMessage, setAudioMessage] = useState('');

  // Selected Photo Modal
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Selected Regular Game Modal
  const [selectedGame, setSelectedGame] = useState(null);

  // Game of the Day Modal State
  const [isGameOfDayOpen, setIsGameOfDayOpen] = useState(false);

  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
    const greetingText = `${currentLanguage.greeting}, ${activePatient.name.split(' ')[0]}! You have a wonderful ${currentStreak} day streak. Let us complete your daily reminders and enjoy today's game.`;
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

    speakText(`Wonderful job completing your ${title}!`);
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
    <div className="min-h-[calc(100vh-80px)] bg-[#FAF7F2] pb-24 pt-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-7">
        
        {/* 1. CLEAN GREETING BANNER WITH PROFILE BUTTON */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs relative">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            
            {/* Patient Greeting & Avatar */}
            <div className="flex items-center gap-4 sm:gap-5">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="relative group cursor-pointer focus:outline-none"
                title="Tap to view your profile"
              >
                <img
                  src={activePatient.avatar}
                  alt={activePatient.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-stone-300 group-hover:border-amber-800 transition-all shadow-xs group-hover:scale-105"
                />
                <span className="absolute -bottom-1 -right-1 bg-amber-800 text-white p-1.5 rounded-full shadow-xs border-2 border-white">
                  <User className="w-3.5 h-3.5" />
                </span>
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer border border-stone-200"
                  >
                    <User className="w-3 h-3 text-stone-600" />
                    <span>My Profile</span>
                  </button>
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
                  Good Morning, <br className="hidden sm:inline" />
                  <span className="text-amber-800">{activePatient.name}!</span>
                </h1>

                <p className="text-xs sm:text-sm text-stone-500">
                  {activePatient.location} • {nowTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Header Right Actions: Audio Guide & Large Profile Shortcut */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              
              {/* Profile Card Button */}
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="flex-1 sm:flex-none px-4 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 text-sm font-bold shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                title="View patient profile & caregiver details"
              >
                <User className="w-5 h-5 text-stone-600" />
                <span>Profile</span>
              </button>

              {/* Large Audio Speaker Button */}
              <button
                type="button"
                onClick={handleGreetingAudio}
                className={`flex-1 sm:flex-none px-5 py-3.5 rounded-2xl border flex items-center justify-center gap-2 text-base font-bold shadow-xs transition-all cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-amber-800 border-amber-900 text-white animate-pulse'
                    : 'bg-amber-800 hover:bg-amber-900 border-amber-900 text-white'
                }`}
              >
                <Volume2 className="w-6 h-6 shrink-0" />
                <span>{isPlayingAudio ? 'Speaking...' : 'Listen'}</span>
              </button>

            </div>

          </div>

          {isPlayingAudio && audioMessage && (
            <div className="mt-3 p-3 bg-stone-100 rounded-xl text-xs sm:text-sm text-stone-800 font-medium text-center border border-stone-200">
              🔊 "{audioMessage}"
            </div>
          )}
        </div>

        {/* 2. PROMINENT STREAK COUNTER (PRIMARY BRAND) */}
        <div className="bg-amber-800 rounded-3xl p-5 sm:p-6 text-white shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <Flame className="w-8 h-8 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">
                {currentStreak} Days in a Row!
              </h2>
              <p className="text-xs sm:text-sm text-stone-200 mt-0.5">
                Play today's featured game to keep your routine active.
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-xs text-stone-300 font-medium">Today's Routine</p>
            <p className="text-xl font-bold">{completedCount} of {totalCount} Done</p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. TIME-DYNAMIC TODAY'S REMINDERS (FOCUSED 3-CARD VIEW) */}
        {/* ======================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
                <span>Today's Reminders</span>
                <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                  {nowTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                Showing your <strong>Previous</strong>, <strong>Current</strong>, and <strong>Next</strong> scheduled routines
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {threeFocusedReminders.map((rem) => {
              const isCurrent = rem.slotLabel === 'Current';
              const isPrevious = rem.slotLabel === 'Previous';
              const isNext = rem.slotLabel === 'Next';
              const isDone = rem.isCompleted;
              const isDueNow = rem.timeState === 'due_now';

              return (
                <div
                  key={rem.id}
                  className={`rounded-3xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isCurrent
                      ? 'p-6 bg-amber-50/80 border-2 border-amber-800 shadow-md ring-2 ring-amber-800/10 scale-[1.01]'
                      : isPrevious
                      ? 'p-5 bg-white border border-stone-200 shadow-2xs text-stone-700'
                      : 'p-5 bg-stone-50/70 border border-stone-200 shadow-2xs text-stone-600'
                  }`}
                >
                  
                  {/* Left: Slot Badge + Icon & Details */}
                  <div className="flex items-start sm:items-center gap-4">
                    
                    {/* State-specific Icon Bubble */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 font-bold shadow-2xs ${
                      isDone
                        ? 'bg-emerald-700 text-white'
                        : isCurrent
                        ? 'bg-amber-800 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 border border-stone-300'
                    }`}>
                      {getReminderIcon(rem.type)}
                    </div>

                    <div className="space-y-1">
                      
                      {/* Slot Label & Status Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {isPrevious && (
                          <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[11px] font-bold border border-stone-200 uppercase tracking-wider">
                            PREVIOUS
                          </span>
                        )}

                        {isCurrent && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-800 text-white text-[11px] font-black shadow-2xs tracking-wider uppercase animate-pulse">
                            CURRENT
                          </span>
                        )}

                        {isNext && (
                          <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-500 text-[11px] font-bold border border-stone-200 uppercase tracking-wider">
                            NEXT
                          </span>
                        )}

                        {isDone && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 text-xs font-black border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>Completed ✓ ({rem.formattedTime})</span>
                          </span>
                        )}

                        {!isDone && isCurrent && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 text-xs font-black border border-amber-300 shadow-2xs">
                            <Sparkles className="w-3 h-3 text-amber-800" />
                            <span>{isDueNow ? 'DUE RIGHT NOW' : 'Approaching Next'} ({rem.formattedTime})</span>
                          </span>
                        )}

                        {!isDone && isPrevious && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200">
                            <Clock className="w-3 h-3 text-rose-700" />
                            <span>Scheduled {rem.formattedTime}</span>
                          </span>
                        )}

                        {!isDone && isNext && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 text-xs font-medium border border-stone-200">
                            <Clock className="w-3 h-3 text-stone-400" />
                            <span>Scheduled at {rem.formattedTime}</span>
                          </span>
                        )}
                      </div>

                      <h3 className={`text-lg sm:text-xl font-black ${isCurrent ? 'text-stone-950' : 'text-stone-800'}`}>
                        {rem.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-stone-600">
                        {rem.detail}
                      </p>
                    </div>

                  </div>

                  {/* Right: Giant 1-Tap Action Button */}
                  <div className="shrink-0 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleReminderDone(rem.id, rem.title)}
                      className={`w-full sm:w-56 py-3.5 sm:py-4 px-5 rounded-2xl text-base sm:text-lg font-black flex items-center justify-center gap-2.5 transition-all shadow-xs active:scale-95 cursor-pointer ${
                        isDone
                          ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                          : isCurrent
                          ? 'bg-amber-800 hover:bg-amber-900 text-white shadow-md ring-2 ring-amber-700/20'
                          : 'bg-stone-800 hover:bg-stone-900 text-white'
                      }`}
                    >
                      <Check className="w-6 h-6 stroke-[3]" />
                      <span>{isDone ? 'Completed ✓' : isCurrent ? 'Done ✓ Tap Now' : 'Mark Done ✓'}</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {/* View All Reminders Action Button */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => navigate('/patient/reminders')}
              className="w-full py-4 px-6 bg-white hover:bg-stone-50 border-2 border-stone-300 hover:border-amber-800 rounded-3xl text-sm sm:text-base font-bold text-stone-800 hover:text-amber-900 shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
            >
              <ListOrdered className="w-5 h-5 text-stone-600 group-hover:text-amber-800 transition-colors" />
              <span>View All {chronologicalReminders.length} Reminders for Today →</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. FEATURED GAME OF THE DAY                             */}
        {/* ======================================================== */}
        <div className="space-y-3 pt-2">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
                <span>Featured Game of the Day</span>
                <span className="text-xs font-bold uppercase tracking-wider bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full border border-stone-200">
                  {todayFeaturedGame.dayName} Special
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                Complete today's challenge to maintain your daily streak
              </p>
            </div>

            {isGameOfDayCompleted && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 text-xs font-black border border-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Streak Maintained!</span>
              </span>
            )}
          </div>

          {/* Large Hero Card for Game of the Day (Calm stone & amber styling) */}
          <div className={`rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border transition-all shadow-md bg-stone-900 ${
            isGameOfDayCompleted ? 'border-emerald-500' : 'border-stone-800'
          }`}>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="space-y-3 max-w-xl">
                
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-800 text-white text-xs font-black uppercase tracking-wider shadow-2xs">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>Daily Streak Challenge</span>
                  </span>

                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-stone-200 text-xs font-bold border border-white/10">
                    {todayFeaturedGame.category}
                  </span>

                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-stone-200 text-xs font-bold border border-white/10">
                    ⏱️ {todayFeaturedGame.duration}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                  {todayFeaturedGame.title}
                </h3>

                <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
                  {todayFeaturedGame.description}
                </p>

                <div className="flex items-center gap-4 text-xs font-bold text-stone-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-stone-300" />
                    <span>Rewards +1 Day to Streak</span>
                  </span>
                  <span>•</span>
                  <span>Gentle & Relaxing</span>
                </div>

              </div>

              {/* Action Button on Featured Card */}
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsGameOfDayOpen(true);
                    setGodFlippedIndices([]);
                    setGodMatchedIndices([]);
                  }}
                  className={`w-full md:w-auto px-8 py-5 rounded-2xl font-black text-lg sm:text-xl shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-95 ${
                    isGameOfDayCompleted
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      : 'bg-amber-800 hover:bg-amber-900 text-white'
                  }`}
                >
                  {isGameOfDayCompleted ? (
                    <>
                      <CheckCircle2 className="w-7 h-7 text-white" />
                      <span>Completed Today! 🎉</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-7 h-7 fill-white" />
                      <span>Play Today's Challenge</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* ======================================================== */}
        {/* 5. REGULAR PRACTICE GAMES                                */}
        {/* ======================================================== */}
        <div className="space-y-3 pt-2">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-stone-900">
              Explore More Brain Games (Optional Practice) 🧠
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Play any of these relaxing activities anytime for fun and focus
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {cognitiveGames.map((game) => (
              <div
                key={game.id}
                onClick={() => {
                  setSelectedGame(game);
                }}
                className="bg-white rounded-2xl p-5 border border-stone-200 hover:border-stone-400 shadow-2xs transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                      {game.badge}
                    </span>
                    <span className="text-xs font-semibold text-stone-500">
                      {game.difficulty}
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
                    {game.title}
                  </h4>
                  <p className="text-xs text-stone-600 mt-1">
                    {game.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-700 font-bold">
                  <span>Practice Anytime</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-stone-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 6. FAMILY PHOTO VAULT                                    */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
                <span>Family Memories & Photos</span>
                <span>🌸</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                Tap any portrait or family landmark to listen to cherished memories
              </p>
            </div>
            <span className="text-xs text-stone-400 font-medium hidden sm:inline">Scroll horizontally →</span>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-3 pt-1 no-scrollbar">
            {familyPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => {
                  setSelectedPhoto(photo);
                  speakText(`${photo.title}. ${photo.audioNote || photo.audioPrompt || photo.description}`);
                }}
                className="min-w-[260px] sm:min-w-[290px] bg-stone-50 rounded-2xl p-4 border border-stone-200 hover:border-amber-800/40 shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0 group flex flex-col justify-between"
              >
                <div className="relative overflow-hidden rounded-xl aspect-[4/3] bg-stone-200 border border-stone-300/60">
                  <img
                    src={photo.imageUrl || photo.image}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute top-2.5 right-2.5 bg-stone-900/80 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                    {photo.year}
                  </div>
                  {photo.relation && (
                    <div className="absolute bottom-2.5 left-2.5 bg-amber-900/85 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                      {photo.relation}
                    </div>
                  )}
                </div>

                <div className="mt-3 space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-stone-900 group-hover:text-amber-900 transition-colors">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    {photo.location}
                  </p>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mt-1">
                    {photo.description}
                  </p>
                </div>

                <div className="mt-3.5 pt-3 border-t border-stone-200/80 flex items-center justify-between text-xs text-amber-900 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-amber-800" />
                    <span>Hear memory 🔊</span>
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-amber-800" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL: PATIENT PROFILE (READ-ONLY VIEW)                  */}
      {/* ======================================================== */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 border border-stone-200 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            
            {/* Modal Header with Back Button */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-bold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to My Space</span>
              </button>

              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview Card */}
            <div className="text-center space-y-3">
              <div className="relative inline-block">
                <img
                  src={activePatient.avatar}
                  alt={activePatient.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-2 border-stone-300 mx-auto shadow-md"
                />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-bold uppercase tracking-wider mb-1 border border-stone-200">
                  {activePatient.cognitiveStage || 'Gentle Memory Support'}
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-stone-900">
                  {activePatient.name}
                </h2>
                <p className="text-base font-bold text-stone-500">
                  {activePatient.age} Years Old • {activePatient.gender || 'Senior'}
                </p>
              </div>
            </div>

            {/* Detailed Patient Info Grid (Read-Only) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200">
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-200 flex items-center justify-center text-stone-700 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">Location</p>
                  <p className="text-sm font-black text-stone-900">{activePatient.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-200 flex items-center justify-center text-stone-700 shrink-0">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">Language</p>
                  <p className="text-sm font-black text-stone-900">{activePatient.nativeLanguage || 'English & Assamese'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-200 flex items-center justify-center text-stone-700 shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">Current Streak</p>
                  <p className="text-sm font-black text-stone-900">{currentStreak} Days in a row 🔥</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-200 flex items-center justify-center text-stone-700 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">Your Phone</p>
                  <p className="text-sm font-black text-stone-900">{activePatient.phone}</p>
                </div>
              </div>

            </div>

            {/* Emergency / Primary Caregiver Card */}
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-300 space-y-3">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm uppercase tracking-wider">
                <HeartHandshake className="w-5 h-5 text-amber-800" />
                <span>Your Primary Caregiver & Doctor</span>
              </div>

              <div className="space-y-1">
                <p className="text-lg font-extrabold text-stone-900">
                  {activePatient.primaryCaregiver || 'Dr. Ananya Sharma'}
                </p>
                <p className="text-xs sm:text-sm text-stone-500">
                  Available for support, routine changes, and check-ins.
                </p>
              </div>

              {/* 1-Tap Call Button */}
              <a
                href={`tel:${activePatient.emergencyContact || activePatient.phone || '+919435012345'}`}
                className="w-full py-4 px-5 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-xs transition-all text-center cursor-pointer"
              >
                <Phone className="w-6 h-6 fill-white" />
                <span>Call Caregiver ({activePatient.emergencyContact || activePatient.phone || '+91 94350 12345'})</span>
              </a>
            </div>

            {/* Read-Only Informative Banner */}
            <div className="p-3 bg-stone-100 rounded-xl text-xs text-stone-500 text-center font-medium">
              ℹ️ Profile details are managed by your caregiver. To update medical notes or routine schedules, please reach out to your doctor.
            </div>

            {/* Switch User / Log Out Action */}
            <div className="pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => {
                  logoutPatient();
                  navigate('/');
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold border border-stone-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                <span>Switch User / Log Out</span>
              </button>
            </div>

          </div>
        </div>
      )}

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
