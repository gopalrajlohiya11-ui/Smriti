import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { speakLocalized, stopSpeech } from '../../utils/speechUtils';
import { calculatePatientStreak } from '../../utils/streakUtils';
import confetti from 'canvas-confetti';
import { cognitiveGames } from '../../data/mockData';
import PatientNavShell from '../../components/patient/PatientNavShell';
import GameIcon from '../../components/common/GameIcon';
import {
  Play,
  Bell,
  Volume2, 
  Flame, 
  Check, 
  Pill, 
  Droplets, 
  Footprints, 
  Calendar, 
  BrainCircuit, 
  Clock, 
  CheckCircle2, 
  User, 
  MapPin, 
  AlertTriangle, 
  ArrowRight,
  Heart,
  Utensils,
  Moon,
  Sparkles,
  ShieldCheck,
  MessageCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PatientDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { 
    activePatient, 
    toggleReminder, 
    currentLanguage, 
    isOnline,
    pendingSyncCount,
    loadGameSessions
  } = useApp();

  const [gameSessions, setGameSessions] = useState([]);

  useEffect(() => {
    let isMounted = true;
    if (activePatient?.id || activePatient?._id) {
      if (typeof loadGameSessions === 'function') {
        loadGameSessions(activePatient.id || activePatient._id).then(sessions => {
          if (isMounted && Array.isArray(sessions)) {
            setGameSessions(sessions);
          }
        });
      }
    }
    return () => { isMounted = false; };
  }, [activePatient, loadGameSessions]);

  const dynamicStreakDays = useMemo(() => {
    const isDemo = activePatient?.isDemoSeed === true || 
      ['pat-1', 'pat-2', 'pat-3'].includes(activePatient?.id) || 
      ['Ramesh Sharma', 'Meera Baruah', 'Biren Das'].includes(activePatient?.name);

    if (isDemo) return activePatient?.streakDays || 14;
    return calculatePatientStreak(activePatient, gameSessions, activePatient?.todayReminders || []);
  }, [activePatient, gameSessions]);

  // Check if patient has played any game today
  const isTodayGameDone = useMemo(() => {
    const now = new Date();
    const todayYMD = now.toISOString().slice(0, 10);
    
    // 1. Check in fetched game sessions from MongoDB / state
    const hasSessionToday = Array.isArray(gameSessions) && gameSessions.some(session => {
      const dateVal = session.timestamp || session.createdAt || session.date;
      if (!dateVal) return false;
      const sDate = new Date(dateVal);
      return (
        sDate.getFullYear() === now.getFullYear() &&
        sDate.getMonth() === now.getMonth() &&
        sDate.getDate() === now.getDate()
      );
    });

    if (hasSessionToday) return true;

    // 2. Check localStorage key for instant offline & optimistic updates
    try {
      const patKey = activePatient?.id || activePatient?._id || 'guest';
      const localDate = localStorage.getItem(`smriti_game_played_date_${patKey}`);
      if (localDate === todayYMD) return true;
    } catch (e) {}

    return false;
  }, [gameSessions, activePatient]);

  const isHindi = useMemo(() => {
    return (currentLanguage?.code || '').startsWith('hi');
  }, [currentLanguage]);
  const [nowTime, setNowTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNowTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioMessage, setAudioMessage] = useState('');

  // Time-aware greeting
  const greetingWord = useMemo(() => {
    const hour = nowTime.getHours();
    if (hour < 12) return t('dashboard.goodMorning', 'Good Morning');
    if (hour < 17) return t('dashboard.goodAfternoon', 'Good Afternoon');
    return t('dashboard.goodEvening', 'Good Evening');
  }, [nowTime, t]);

  const speakText = (text, isAutoPlay = false) => {
    setAudioMessage(text);
    speakLocalized({
      text,
      langCode: currentLanguage?.code || 'en',
      rate: 0.85,
      pitch: 1.0,
      isAutoPlay,
      patientId: activePatient?.id || activePatient?._id,
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false)
    });
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

  const getReminderIcon = (type, className = "w-8 h-8") => {
    switch (type) {
      case 'medicine': return <Pill className={className} />;
      case 'hydration': return <Droplets className={className} />;
      case 'meal': return <Utensils className={className} />;
      case 'game': return <BrainCircuit className={className} />;
      case 'activity': return <Footprints className={className} />;
      case 'appointment': return <Calendar className={className} />;
      case 'rest': return <Moon className={className} />;
      default: return <Clock className={className} />;
    }
  };

  // Process today's reminders
  const chronologicalReminders = useMemo(() => {
    const reminders = activePatient?.todayReminders || [];
    
    return reminders.map(rem => {
      const isCompleted = rem.status === 'completed' || rem.acknowledged === true;
      const scheduledDate = parseReminderTime(rem);
      const diffMinutes = (nowTime.getTime() - scheduledDate.getTime()) / (1000 * 60);

      let timeState = 'upcoming';
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
  }, [activePatient?.todayReminders, nowTime]);

    // Deterministic daily game pick based on day-of-year (same all day, changes tomorrow)
  const dailyFeaturedGame = useMemo(() => {
    if (!cognitiveGames || cognitiveGames.length === 0) return null;
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const gameIndex = dayOfYear % cognitiveGames.length;
    return cognitiveGames[gameIndex];
  }, []);

  const completedCount = useMemo(() => {
    return chronologicalReminders.filter(r => r.isCompleted).length;
  }, [chronologicalReminders]);

  const totalCount = chronologicalReminders.length || 10;

  // Single primary focus right now
  const primaryFocusRoutine = useMemo(() => {
    const overdue = chronologicalReminders.filter(r => !r.isCompleted && r.timeState === 'overdue');
    if (overdue.length > 0) return { routine: overdue[0], priority: 'overdue' };

    const dueNow = chronologicalReminders.filter(r => !r.isCompleted && r.timeState === 'due_now');
    if (dueNow.length > 0) return { routine: dueNow[0], priority: 'due_now' };

    const upcoming = chronologicalReminders.filter(r => !r.isCompleted && r.timeState === 'upcoming');
    if (upcoming.length > 0) return { routine: upcoming[0], priority: 'upcoming' };

    return { routine: null, priority: 'all_completed' };
  }, [chronologicalReminders]);

  const handleReminderDone = (remId, title) => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#1F6B4A', '#B5502E', '#2C5AA0']
    });

    const isHindi = (currentLanguage?.code || '').startsWith('hi');
    speakText(isHindi ? `शानदार! आपने ${title} पूरा कर लिया।` : `Great job! You completed ${title}.`, true);
    toggleReminder(activePatient?.id || activePatient?._id, remId);
  };

    const handleStatusAudio = () => {
    const { routine, priority } = primaryFocusRoutine;
    const name = (activePatient?.name || 'Elder').split(' ')[0];
    const isHindi = (currentLanguage?.code || '').startsWith('hi');

    if (isHindi) {
      if (priority === 'all_completed') {
        speakText(`नमस्ते ${name} जी! आज के सभी ${totalCount} दैनिक कार्य पूरे हो चुके हैं। आप पूरी तरह से अपडेट हैं!`);
      } else if (priority === 'overdue') {
        speakText(`${name} जी, आपका एक कार्य बाकी है: ${routine.title}, जो ${routine.formattedTime} पर निर्धारित था। कृपया इसे अभी पूरा करें।`);
      } else if (priority === 'due_now') {
        speakText(`${name} जी, अभी आपके ${routine.title} का समय हो गया है, जो ${routine.formattedTime} पर निर्धारित है।`);
      } else {
        speakText(`नमस्ते ${name} जी! आपका अगला निर्धारित कार्य ${routine.title} है, जो ${routine.formattedTime} पर है। आपने ${totalCount} में से ${completedCount} कार्य पूरे कर लिए हैं।`);
      }
    } else {
      if (priority === 'all_completed') {
        speakText(`${greetingWord}, ${name}! You are all caught up for today. All ${totalCount} daily routines are complete!`);
      } else if (priority === 'overdue') {
        speakText(`${name}, you have an overdue routine: ${routine.title}, scheduled for ${routine.formattedTime}. Please take care of this now.`);
      } else if (priority === 'due_now') {
        speakText(`${name}, it is time for: ${routine.title} at ${routine.formattedTime}.`);
      } else {
        speakText(`${greetingWord}, ${name}! Your next scheduled routine is ${routine.title} at ${routine.formattedTime}. You have completed ${completedCount} of ${totalCount} tasks.`);
      }
    }
  };

  return (
    <PatientNavShell>
      <div className="space-y-6">
        
        {/* Offline Banner */}
        {!isOnline && (
          <div className="p-4 rounded-2xl bg-[#FDF2F2] border border-[#F5B7B1] text-[#2B2B2B] text-xs sm:text-sm font-medium flex items-center gap-3 shadow-xs">
            <span className="text-xl">📶</span>
            <div>
              <p className="font-bold text-[#C0392B]">
                {t('dashboard.offlineNotice', "You're offline — showing saved information")}
              </p>
              <p className="text-xs text-[#6B6B6B]">
                {pendingSyncCount > 0 
                  ? `${pendingSyncCount} action saved locally — will sync when connection returns.`
                  : 'All reminders, photos, and games are available offline.'}
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 1. STATUS HEADER: GREETING & VOICE BUTTON                */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#E5E0D8] shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
            
            <div className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-3.5 sm:gap-4">
              <img
                src={activePatient?.avatar || "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80"}
                alt={activePatient?.name || "Patient"}
                className="w-20 h-20 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-[#E5E0D8] shadow-xs"
              />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">
                  {nowTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
                
                <div className="flex items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#2B2B2B]">
                    {greetingWord}, <span className="text-[#B5502E]">{(activePatient?.name || 'Ramesh').split(' ')[0]}</span>
                  </h1>

                </div>

                <p className="text-xs text-[#6B6B6B] font-medium flex items-center justify-center sm:justify-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#B5502E]" />
                  <span>{activePatient?.location || 'Guwahati, Assam'}</span>
                </p>
              </div>
            </div>

            {/* Header Right Action Cluster */}
            <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
              
              {/* Listen to Status Button */}
              <button
                type="button"
                onClick={handleStatusAudio}
                className={`min-h-[48px] sm:min-h-[56px] px-3.5 sm:px-4 py-2.5 sm:py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm font-black shadow-2xs transition-all cursor-pointer active:scale-98 shrink-0 ${
                  isPlayingAudio
                    ? 'bg-[#2C5AA0] text-white ring-4 ring-[#2C5AA0]/30 animate-pulse'
                    : 'bg-stone-100 hover:bg-stone-200 text-[#2B2B2B] border border-[#E5E0D8]'
                }`}
                title="Listen to daily status"
                aria-label="Listen to Status"
              >
                <Volume2 className="w-5 h-5 shrink-0 text-[#2C5AA0]" />
                <span>{isPlayingAudio ? (isHindi ? 'बोल रहे हैं...' : 'Speaking...') : (isHindi ? 'स्थिति सुनें' : 'Listen')}</span>
              </button>

            </div>

          </div>

          {isPlayingAudio && audioMessage && (
            <div className="mt-4 p-3.5 bg-[#EFF4FA] rounded-2xl text-xs sm:text-sm text-[#2C5AA0] font-bold text-center border border-[#2C5AA0]/20 animate-in fade-in">
              🔊 "{audioMessage}"
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 2. GAME OF THE DAY (DATE-SEEDED ROTATING CHALLENGE)      */}
        {/* ======================================================== */}
        {dailyFeaturedGame && (
          isTodayGameDone ? (
            /* COMPLETED TODAY'S GAME STATE */
            <div className="bg-[#EDF7F2] rounded-3xl p-5 sm:p-8 border-2 border-[#A3D9C1] shadow-2xs space-y-4 sm:space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#1F6B4A] text-xs font-black uppercase tracking-wider border border-[#A3D9C1] shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1F6B4A]" />
                  <span>{isHindi ? "✓ आज का खेल पूरा हुआ" : "✓ Today's Game Done"}</span>
                </span>

                <span className="text-xs font-bold text-[#1F6B4A] flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-[#1F6B4A]" />
                  <span>{dynamicStreakDays} {isHindi ? "दिन लगातार" : `${dynamicStreakDays} Day Streak`}</span>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#1F6B4A] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Check className="w-9 h-9 stroke-[3]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-3xl font-black text-[#1F6B4A]">
                      {isHindi ? "शाबाश! आज का खेल पूरा हुआ" : "Great Job! Today's Brain Game is Done"}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 font-medium">
                      {isHindi 
                        ? `आपने आज की मस्तिष्क चुनौती (${dailyFeaturedGame.hindiTitle || dailyFeaturedGame.title}) पूरी कर ली है!` 
                        : `You've completed today's workout (${dailyFeaturedGame.title}). Feel free to explore more games anytime.`}
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => navigate('/patient/games')}
                    className="w-full sm:w-auto min-h-[56px] px-8 py-4 rounded-2xl bg-[#1F6B4A] hover:bg-[#185339] text-white font-black text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-xs transition-all active:scale-98 cursor-pointer shrink-0"
                  >
                    <BrainCircuit className="w-5 h-5" />
                    <span>{isHindi ? "और खेल खेलें" : "Play More Games"}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* UNCOMPLETED / PENDING CHALLENGE STATE */
            <div className="bg-white rounded-3xl p-5 sm:p-8 border-2 border-[#B5502E]/30 shadow-2xs space-y-4 sm:space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF6F0] text-[#B5502E] text-xs font-black uppercase tracking-wider border border-[#B5502E]/20">
                  <Flame className="w-3.5 h-3.5 fill-[#B5502E]" />
                  <span>{isHindi ? "आज की विशेष चुनौती" : "Today's Featured Challenge"}</span>
                </span>

                <span className="text-xs font-bold text-[#6B6B6B]">
                  {dynamicStreakDays} {isHindi ? "दिन लगातार" : (dynamicStreakDays === 1 ? "Day Memory Streak" : "Day Memory Streak")}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#FDF6F0] border border-[#B5502E]/20 flex items-center justify-center shrink-0 shadow-2xs">
                    <GameIcon icon={dailyFeaturedGame.icon} className="w-9 h-9 text-[#B5502E]" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <h3 className="text-xl sm:text-3xl font-black text-[#2B2B2B]">
                        {isHindi ? (dailyFeaturedGame.hindiTitle || dailyFeaturedGame.title) : dailyFeaturedGame.title}
                      </h3>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#6B6B6B] border border-[#E5E0D8]">
                        {isHindi ? (dailyFeaturedGame.hindiCategory || dailyFeaturedGame.category) : dailyFeaturedGame.category}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#6B6B6B] font-medium">
                      {isHindi ? (dailyFeaturedGame.hindiDescription || dailyFeaturedGame.description) : dailyFeaturedGame.description}
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const target = dailyFeaturedGame.path || dailyFeaturedGame.route || '/patient/games';
                      navigate(target);
                    }}
                    className="w-full sm:w-auto min-h-[56px] px-8 py-4 rounded-2xl bg-[#B5502E] hover:bg-[#9E4224] text-white font-black text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-xs transition-all active:scale-98 cursor-pointer shrink-0"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>{isHindi ? "आज की चुनौती खेलें" : "Play Today's Challenge"}</span>
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {/* ======================================================== */}
        {/* 3. THE CORE STATUS BANNER: "WHAT DO I DO RIGHT NOW?"      */}
        {/* ======================================================== */}
        {(() => {
          const { routine, priority } = primaryFocusRoutine;

          // Case A: All Routines Completed
          if (priority === 'all_completed' || !routine) {
            return (
              <div className="bg-[#EDF7F2] rounded-3xl p-5 sm:p-8 border-2 border-[#A3D9C1] shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5 sm:gap-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#1F6B4A] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#1F6B4A] text-xs font-black uppercase tracking-wider border border-[#A3D9C1]">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{isHindi ? "आज के सभी कार्य पूरे हो चुके हैं 🎉" : "You're All Caught Up For Today 🎉"}</span>
                    </span>
                    <h2 className="text-xl sm:text-3xl font-black text-[#2B2B2B]">
                      {isHindi ? `शानदार! आज की सभी ${totalCount} दिनचर्याएं पूरी हुईं।` : `Great job! All ${totalCount} daily routines are done.`}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6B6B6B] font-medium">
                      {isHindi ? "अब आराम करें, दिमागी खेल खेलें या पारिवारिक तस्वीरें देखें।" : "Take time to relax, play a memory game, or look through family photos."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/patient/reminders')}
                  className="w-full sm:w-auto min-h-[56px] px-6 py-4 rounded-2xl bg-[#1F6B4A] hover:bg-[#18553B] text-white text-base sm:text-lg font-black shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 shrink-0"
                >
                  <span>{isHindi ? "शेड्यूल देखें" : "View Timeline"}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            );
          }

          const isOverdue = priority === 'overdue';
          const isDueNow = priority === 'due_now';

          return (
            <div className={`rounded-3xl p-5 sm:p-8 border-2 shadow-sm transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5 sm:gap-6 animate-in fade-in ${
              isOverdue
                ? 'bg-[#FDF2F2] border-[#F5B7B1]'
                : isDueNow
                ? 'bg-[#EFF4FA] border-[#2C5AA0]'
                : 'bg-white border-[#E5E0D8]'
            }`}>
              {/* Left Details */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5">
                <div className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                  isOverdue
                    ? 'bg-[#C0392B] text-white'
                    : isDueNow
                    ? 'bg-[#2C5AA0] text-white'
                    : 'bg-stone-100 text-[#2C5AA0]'
                }`}>
                  {getReminderIcon(routine.type, "w-9 h-9")}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    {isOverdue && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C0392B] text-white text-xs font-black uppercase tracking-wider">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{isHindi ? "समय बीत चुका है" : "Action Overdue"}</span>
                      </span>
                    )}
                    {isDueNow && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2C5AA0] text-white text-xs font-black uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{isHindi ? "अभी करने योग्य" : "Due Right Now"}</span>
                      </span>
                    )}
                    {!isOverdue && !isDueNow && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-[#6B6B6B] text-xs font-bold border border-[#E5E0D8]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{isHindi ? "अगला निर्धारित कार्य" : "Next Scheduled Routine"}</span>
                      </span>
                    )}
                    <span className="text-xs font-black text-[#6B6B6B]">
                      {routine.formattedTime}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-3xl font-black text-[#2B2B2B]">
                    {isHindi ? (routine.hindiTitle || routine.title) : routine.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#6B6B6B] font-medium">
                    {isHindi ? (routine.hindiDetail || routine.detail || routine.title) : (routine.detail || routine.title)}
                  </p>
                </div>
              </div>

              {/* Right: Large 56px Action Button */}
              <div className="w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => handleReminderDone(routine.id || routine._id, routine.title)}
                  className={`w-full sm:w-auto min-h-[56px] px-8 py-4 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer active:scale-98 ${
                    isOverdue
                      ? 'bg-[#C0392B] hover:bg-[#A93226] text-white'
                      : isDueNow
                      ? 'bg-[#2C5AA0] hover:bg-[#224780] text-white'
                      : 'bg-[#1F6B4A] hover:bg-[#18553B] text-white'
                  }`}
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>{isHindi ? "पूर्ण चिह्नित करें" : "Mark Done"}</span>
                </button>
              </div>

            </div>
          );
        })()}

        {/* ======================================================== */}
        {/* 4. FOUR LARGE QUICK DESTINATION TILES                    */}
        {/* ======================================================== */}
        <div>
          <h2 className="text-lg font-black text-[#2B2B2B] mb-3.5">
            {isHindi ? "दैनिक सुविधाएं" : "Explore"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-6">
            
            {/* Tile 1: Daily Reminders */}
            <div
              onClick={() => navigate('/patient/reminders')}
              className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#E5E0D8] hover:border-[#2C5AA0] shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#EFF4FA] border border-[#2C5AA0]/20 text-[#2C5AA0] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Bell className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-[#EDF7F2] text-[#1F6B4A] border border-[#A3D9C1]">
                  {completedCount} / {totalCount} {isHindi ? "पूर्ण" : "Done"}
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#2B2B2B] group-hover:text-[#2C5AA0] transition-colors">
                  {isHindi ? "दैनिक अनुस्मारक" : "Daily Reminders"}
                </h3>
                <p className="text-xs sm:text-sm text-[#6B6B6B] font-medium mt-1">
                  {isHindi ? "दवा, पानी, भोजन और दिनचर्या" : "Medicine, hydration, meals, and check-ins"}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs sm:text-sm font-black text-[#2C5AA0]">
                <span>{isHindi ? "शेड्यूल खोलें" : "Open Schedule"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Tile 2: Brain Games */}
            <div
              onClick={() => navigate('/patient/games')}
              className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#E5E0D8] hover:border-[#B5502E] shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FDF6F0] border border-[#B5502E]/20 text-[#B5502E] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <BrainCircuit className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-[#FDF6F0] text-[#B5502E] border border-[#B5502E]/20 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{dynamicStreakDays} {isHindi ? "दिन लगातार" : "Day Streak"}</span>
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#2B2B2B] group-hover:text-[#B5502E] transition-colors">
                  {isHindi ? "दिमागी खेल" : "Brain Games"}
                </h3>
                <p className="text-xs sm:text-sm text-[#6B6B6B] font-medium mt-1">
                  {isHindi ? "दैनिक चुनौती और सरल दिमागी अभ्यास" : "Daily challenge & gentle memory exercises"}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs sm:text-sm font-black text-[#B5502E]">
                <span>{isHindi ? "खेलें" : "Play Games"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Tile 3: Family Photos */}
            <div
              onClick={() => navigate('/patient/family')}
              className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#E5E0D8] hover:border-rose-300 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Heart className="w-7 h-7 sm:w-8 sm:h-8 fill-rose-100" />
                </div>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  Memory Vault
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#2B2B2B] group-hover:text-rose-600 transition-colors">
                  {isHindi ? "पारिवारिक यादें और तस्वीरें" : "Family Memories & Photos"}
                </h3>
                <p className="text-xs sm:text-sm text-[#6B6B6B] font-medium mt-1">
                  {isHindi ? "प्यारी पारिवारिक तस्वीरें और आवाज के साथ सुनाई जाने वाली यादें" : "Cherished family photos with voice narrations"}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs sm:text-sm font-black text-rose-600">
                <span>{isHindi ? "एल्बम देखें" : "View Album"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Tile 4: Profile & Care */}
            <div
              onClick={() => navigate('/patient/profile')}
              className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#E5E0D8] hover:border-emerald-300 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#EDF7F2] border border-[#1F6B4A]/20 text-[#1F6B4A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <User className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-[#EDF7F2] text-[#1F6B4A] border border-[#A3D9C1]">
                  Care Team
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#2B2B2B] group-hover:text-[#1F6B4A] transition-colors">
                  {isHindi ? "मेरी प्रोफाइल और संपर्क" : "Profile & Care Contacts"}
                </h3>
                <p className="text-xs sm:text-sm text-[#6B6B6B] font-medium mt-1">
                  {isHindi ? "डॉक्टर संपर्क, आपातकालीन नंबर और सेटिंग्स" : "Doctor contacts, emergency numbers, and settings"}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs sm:text-sm font-black text-[#1F6B4A]">
                <span>{isHindi ? "प्रोफाइल देखें" : "View Profile"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </div>

        </div>
    </PatientNavShell>
  );
}
