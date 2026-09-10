import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import PatientNavShell from '../../components/patient/PatientNavShell';
import { speakLocalized, stopSpeech } from '../../utils/speechUtils';
import {
  ArrowLeft,
  Utensils,
  Moon, 
  Volume2, 
  Pill, 
  Droplets, 
  Footprints, 
  Calendar, 
  BrainCircuit, 
  Clock, 
  CheckCircle2, 
  Check, 
  AlertTriangle,
  Flame,
  MessageSquare
} from 'lucide-react';

export default function PatientReminders() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activePatient, toggleReminder, currentLanguage } = useApp();

  const [nowTime, setNowTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNowTime(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Helper to parse reminder scheduled time into today's Date object (anchored to current day)
  const parseReminderTime = (rem, baseDate = nowTime) => {
    const today = new Date(baseDate);
    let hours = 9;
    let minutes = 0;

    if (rem.scheduledTime) {
      const d = new Date(rem.scheduledTime);
      if (!isNaN(d.getTime())) {
        hours = d.getHours();
        minutes = d.getMinutes();
        const res = new Date(today);
        res.setHours(hours, minutes, 0, 0);
        return res;
      }
    }
    if (rem.time) {
      const parts = rem.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (parts) {
        hours = parseInt(parts[1], 10);
        minutes = parseInt(parts[2], 10);
        const ampm = parts[3]?.toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        const res = new Date(today);
        res.setHours(hours, minutes, 0, 0);
        return res;
      }
    }
    const res = new Date(today);
    res.setHours(hours, minutes, 0, 0);
    return res;
  };

  const speakText = (text, isAutoPlay = false) => {
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

  const handleReminderDone = (remId, title) => {
    const currentRem = (activePatient?.todayReminders || []).find(r => (r.id === remId || r._id === remId));
    const wasCompleted = currentRem ? (currentRem.status === 'completed' || currentRem.acknowledged === true) : false;

    toggleReminder(activePatient.id, remId);

    // ONLY celebrate when transitioning from INCOMPLETE -> COMPLETED
    if (!wasCompleted) {
      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.7 },
        colors: ['#1F6B4A', '#B5502E', '#2C5AA0']
      });

      const isHindi = (currentLanguage?.code || '').startsWith('hi');
      const msg = isHindi 
        ? `शानदार! आपने ${title} सफलतापूर्वक पूरा कर लिया!`
        : `Wonderful job completing your ${title}!`;
      speakText(msg, true);
    } else {
      // Un-marking: immediately cancel any existing audio and play NO celebration
      stopSpeech();
    }
  };

  const ESCALATION_THRESHOLD_MINUTES = 180;

  const chronologicalReminders = useMemo(() => {
    const reminders = activePatient?.todayReminders || [];
    
    return reminders.map(rem => {
      const isCompleted = rem.status === 'completed' || rem.acknowledged === true;
      const scheduledDate = parseReminderTime(rem, nowTime);
      const diffMinutes = (nowTime.getTime() - scheduledDate.getTime()) / (1000 * 60);

      // Rule 3: A reminder is actionable ONLY if current time >= scheduled time (diffMinutes >= 0)
      const isActionable = diffMinutes >= 0;

      let timeState = 'upcoming';
      if (isCompleted) {
        timeState = 'completed';
      } else if (diffMinutes < 0) {
        timeState = 'upcoming';
      } else if (diffMinutes >= 0 && diffMinutes <= 60) {
        timeState = 'due_now';
      } else if (diffMinutes > 60 && diffMinutes < ESCALATION_THRESHOLD_MINUTES) {
        timeState = 'overdue';
      } else {
        timeState = 'escalated_overdue';
      }

      return {
        ...rem,
        isCompleted,
        isActionable,
        scheduledDate,
        diffMinutes,
        timeState,
        formattedTime: rem.time || scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }).sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
  }, [activePatient?.todayReminders, nowTime]);

  const completedCount = chronologicalReminders.filter(r => r.isCompleted).length;
  const totalCount = chronologicalReminders.length || 10;

  const handleReadSchedule = () => {
    const pending = chronologicalReminders.filter(r => !r.isCompleted);
    const isHindi = (currentLanguage?.code || '').startsWith('hi');
    const name = activePatient.name.split(' ')[0];

    if (pending.length === 0) {
      const msg = isHindi
        ? `शानदार ${name} जी! आज के सभी ${totalCount} दैनिक कार्य पूरे हो चुके हैं!`
        : `Wonderful, ${name}! All ${totalCount} daily routines are complete for today!`;
      speakText(msg);
    } else {
      const nextOne = pending[0];
      const msg = isHindi
        ? `नमस्ते ${name} जी। आपने ${totalCount} में से ${completedCount} कार्य पूरे कर लिए हैं। आपका अगला कार्य ${nextOne.title} है, जो ${nextOne.formattedTime} पर निर्धारित है।`
        : `Hello ${name}. You have ${completedCount} of ${totalCount} routines completed. Your next routine is ${nextOne.title} at ${nextOne.formattedTime}.`;
      speakText(msg);
    }
  };

  const getReminderIcon = (type, className = "w-7 h-7") => {
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

  return (
    <PatientNavShell pageTitle="Daily Reminders & Medicine">
      <div className="space-y-6">
        
        {/* Navigation & Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E0D8] shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <button
                type="button"
                onClick={() => navigate('/patient')}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#6B6B6B] hover:text-[#2B2B2B] transition-colors cursor-pointer mb-2 bg-[#FAF7F2] hover:bg-stone-100 px-3.5 py-2 rounded-xl border border-[#E5E0D8]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('remindersPage.backToDashboard')}</span>
              </button>

              <h1 className="text-2xl sm:text-3xl font-black text-[#2B2B2B] flex items-center gap-3">
                <span>{t('remindersPage.title')}</span>
                <span className="text-xs sm:text-sm font-black px-3 py-1 bg-[#EDF7F2] text-[#1F6B4A] rounded-full border border-[#A3D9C1]">
                  {completedCount} of {totalCount} {t('dashboard.done')}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-[#6B6B6B] font-medium mt-1">
                {nowTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>

            <button
              type="button"
              onClick={handleReadSchedule}
              className={`min-h-[56px] px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm sm:text-base font-bold shadow-xs transition-all cursor-pointer shrink-0 ${
                isPlayingAudio
                  ? 'bg-[#2C5AA0] text-white ring-4 ring-[#2C5AA0]/30 animate-pulse'
                  : 'bg-[#2C5AA0] hover:bg-[#224780] text-white'
              }`}
            >
              <Volume2 className="w-5 h-5" />
              <span>{isPlayingAudio ? t('remindersPage.speaking') : t('remindersPage.listenAll')}</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden border border-[#E5E0D8]">
            <div 
              className="bg-[#1F6B4A] h-full rounded-full transition-all duration-500"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* VERTICAL TIMELINE LIST */}
        <div className="space-y-3.5">
          {chronologicalReminders.map((rem) => {
            const isDueNow = rem.timeState === 'due_now';
            const isOverdue = rem.timeState === 'overdue';
            const isEscalated = rem.timeState === 'escalated_overdue';
            const isDone = rem.isCompleted;
            const isActionable = rem.isActionable !== false;
            const isHindi = (currentLanguage?.code || '').startsWith('hi');

            return (
              <div
                key={rem.id}
                className={`rounded-2xl p-5 sm:p-6 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDone
                    ? 'bg-[#EDF7F2] border-[#A3D9C1] text-[#2B2B2B]'
                    : isEscalated
                    ? 'bg-[#FDF2F2] border-2 border-[#C0392B]/40 text-[#2B2B2B] shadow-2xs'
                    : isOverdue
                    ? 'bg-[#FDF2F2] border-[#F5B7B1] text-[#2B2B2B] shadow-2xs'
                    : isDueNow
                    ? 'bg-[#EFF4FA] border-2 border-[#2C5AA0] shadow-sm'
                    : 'bg-white border-[#E5E0D8] text-[#2B2B2B] shadow-2xs'
                }`}
              >
                {/* Left: Time + Big Icon + Concise Title */}
                <div className="flex items-start sm:items-center gap-4">
                  
                  {/* Time Badge */}
                  <div className={`w-14 sm:w-16 text-center shrink-0 font-black text-xs sm:text-sm ${
                    isEscalated || isOverdue ? 'text-[#C0392B]' : isDueNow ? 'text-[#2C5AA0]' : isDone ? 'text-[#1F6B4A]' : 'text-[#6B6B6B]'
                  }`}>
                    {rem.formattedTime}
                  </div>

                  {/* Big Icon Container (48px) */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                    isDone
                      ? 'bg-white border-[#A3D9C1] text-[#1F6B4A]'
                      : isEscalated || isOverdue
                      ? 'bg-white border-[#F5B7B1] text-[#C0392B]'
                      : isDueNow
                      ? 'bg-white border-[#2C5AA0] text-[#2C5AA0]'
                      : 'bg-[#FAF7F2] border-[#E5E0D8] text-[#2C5AA0]'
                  }`}>
                    {getReminderIcon(rem.type, "w-6 h-6")}
                  </div>

                  {/* Title & Single Status Tag */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isDone && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-[#1F6B4A] text-xs font-bold border border-[#A3D9C1]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{t('dashboard.completed')}</span>
                        </span>
                      )}
                      {isDueNow && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#2C5AA0] text-white text-xs font-bold">
                          <Clock className="w-3 h-3" />
                          <span>{t('dashboard.dueNow')}</span>
                        </span>
                      )}
                      {isEscalated && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C0392B] text-white text-xs font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{isHindi ? "अलर्ट में भेजा गया (3+ घंटे)" : "Escalated to Alerts (3+ hrs)"}</span>
                        </span>
                      )}
                      {isOverdue && !isEscalated && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C0392B] text-white text-xs font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{t('dashboard.overdue')}</span>
                        </span>
                      )}
                      {!isDone && !isDueNow && !isOverdue && !isEscalated && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-[#6B6B6B] text-xs font-medium border border-[#E5E0D8]">
                          <Clock className="w-3 h-3" />
                          <span>{t('dashboard.upcoming')}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-[#2B2B2B]">
                      {isHindi ? (rem.hindiTitle || rem.title) : rem.title}
                    </h3>
                  </div>
                </div>

                {/* Right: Min 56px Action Button (Disabled if before scheduled time) */}
                <div className="sm:text-right shrink-0">
                  {isDone ? (
                    <button
                      type="button"
                      onClick={() => handleReminderDone(rem.id, rem.title)}
                      className="w-full sm:w-auto min-h-[56px] px-6 py-3.5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 bg-white text-[#1F6B4A] border-2 border-[#1F6B4A] hover:bg-[#EDF7F2] transition-all cursor-pointer shadow-2xs"
                    >
                      <Check className="w-5 h-5 stroke-[3]" />
                      <span>{t('dashboard.completed')}</span>
                    </button>
                  ) : !isActionable ? (
                    <button
                      type="button"
                      disabled={true}
                      title={isHindi ? `${rem.formattedTime} पर सक्रिय होगा` : `Will become available at ${rem.formattedTime}`}
                      className="w-full sm:w-auto min-h-[56px] px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed shadow-none select-none"
                    >
                      <Clock className="w-4 h-4 text-stone-400" />
                      <span>
                        {isHindi 
                          ? `${rem.formattedTime} पर उपलब्ध` 
                          : `Available at ${rem.formattedTime}`}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleReminderDone(rem.id, rem.title)}
                      className={`w-full sm:w-auto min-h-[56px] px-6 py-3.5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer ${
                        isEscalated || isOverdue
                          ? 'bg-[#C0392B] hover:bg-[#A93226] text-white'
                          : isDueNow
                          ? 'bg-[#2C5AA0] hover:bg-[#224780] text-white'
                          : 'bg-[#1F6B4A] hover:bg-[#18553B] text-white'
                      }`}
                    >
                      <Check className="w-5 h-5 stroke-[3]" />
                      <span>{t('dashboard.markDone')}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation */}
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => navigate('/patient')}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-stone-100 text-[#2B2B2B] font-bold text-sm border border-[#E5E0D8] cursor-pointer shadow-2xs transition-colors min-h-[56px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('remindersPage.backToDashboard')}</span>
          </button>
        </div>

      </div>
    </PatientNavShell>
  );
}