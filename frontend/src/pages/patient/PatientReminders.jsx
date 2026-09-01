import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Volume2, 
  Pill, 
  Droplets, 
  Footprints, 
  Calendar, 
  BrainCircuit, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Check, 
  Flame,
  ListOrdered
} from 'lucide-react';

export default function PatientReminders() {
  const navigate = useNavigate();
  const { activePatient, toggleReminder, currentLanguage } = useApp();

  const [nowTime, setNowTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNowTime(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

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

  const speakText = (text) => {
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

  const handleReminderDone = (remId, title) => {
    toggleReminder(activePatient.id, remId);
    
    confetti({
      particleCount: 50,
      spread: 65,
      origin: { y: 0.7 },
      colors: ['#15803d', '#9a3412', '#78716c']
    });

    speakText(`Wonderful job completing your ${title}!`);
  };

  const chronologicalReminders = useMemo(() => {
    const reminders = activePatient.todayReminders || [];
    
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
  }, [activePatient.todayReminders, nowTime]);

  const completedCount = chronologicalReminders.filter(r => r.isCompleted).length;
  const totalCount = chronologicalReminders.length;

  const handleReadSchedule = () => {
    const pending = chronologicalReminders.filter(r => !r.isCompleted);
    if (pending.length === 0) {
      speakText(`Wonderful, ${activePatient.name.split(' ')[0]}! All ${totalCount} daily routines are complete for today!`);
    } else {
      const nextOne = pending[0];
      speakText(`Hello ${activePatient.name.split(' ')[0]}. You have ${completedCount} of ${totalCount} routines completed. Your next routine is ${nextOne.title} at ${nextOne.formattedTime}.`);
    }
  };

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

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAF7F2] pb-24 pt-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <button
                onClick={() => navigate('/patient')}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer mb-2 group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>← Back to Dashboard</span>
              </button>

              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 flex items-center gap-2.5">
                <span>All Today's Reminders</span>
                <span className="text-sm font-bold px-3 py-0.5 bg-amber-100 text-amber-950 rounded-full border border-amber-200">
                  {completedCount} of {totalCount} Done
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Full chronological daily schedule for <strong className="text-stone-800">{activePatient.name}</strong> • {nowTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>

            <button
              type="button"
              onClick={handleReadSchedule}
              className={`px-5 py-3.5 rounded-2xl border flex items-center justify-center gap-2 text-sm sm:text-base font-bold shadow-xs transition-all cursor-pointer ${
                isPlayingAudio
                  ? 'bg-amber-800 border-amber-900 text-white animate-pulse'
                  : 'bg-amber-800 hover:bg-amber-900 border-amber-900 text-white'
              }`}
            >
              <Volume2 className="w-5 h-5" />
              <span>{isPlayingAudio ? 'Reading...' : 'Listen to Schedule'}</span>
            </button>
          </div>

          {/* Progress bar */}
          <div className="pt-2">
            <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden border border-stone-200">
              <div 
                className="bg-emerald-700 h-full rounded-full transition-all duration-500"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* FULL CHRONOLOGICAL LIST OF REMINDERS */}
        <div className="space-y-3.5">
          {chronologicalReminders.map((rem, index) => {
            const isDueNow = rem.timeState === 'due_now';
            const isOverdue = rem.timeState === 'overdue';
            const isUpcoming = rem.timeState === 'upcoming';
            const isDone = rem.isCompleted;

            return (
              <div
                key={rem.id}
                className={`rounded-3xl p-5 sm:p-6 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDone
                    ? 'bg-emerald-50/70 border-emerald-300 text-stone-800'
                    : isOverdue
                    ? 'bg-rose-50/60 border-rose-300 text-rose-950 shadow-2xs'
                    : isDueNow
                    ? 'bg-amber-50/70 border-2 border-amber-800 shadow-md ring-2 ring-amber-800/10'
                    : 'bg-white border-stone-200 text-stone-800 shadow-2xs'
                }`}
              >
                {/* Left: Sequence Number + Icon + Details */}
                <div className="flex items-start sm:items-center gap-4">
                  
                  {/* Step Sequence Badge */}
                  <div className="w-7 h-7 rounded-full bg-stone-100 border border-stone-300 text-stone-700 text-xs font-black flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 font-bold shadow-2xs ${
                    isDone
                      ? 'bg-emerald-700 text-white'
                      : isOverdue
                      ? 'bg-rose-700 text-white'
                      : isDueNow
                      ? 'bg-amber-800 text-white'
                      : 'bg-stone-100 text-stone-700 border border-stone-300'
                  }`}>
                    {getReminderIcon(rem.type)}
                  </div>

                  <div className="space-y-1">
                    {/* Time State Badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {isDone && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 text-xs font-black border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          <span>Completed ✓ ({rem.formattedTime})</span>
                        </span>
                      )}

                      {isDueNow && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-800 text-white text-xs font-black tracking-wide shadow-2xs animate-pulse">
                          <Sparkles className="w-3 h-3" />
                          <span>DUE RIGHT NOW ({rem.formattedTime})</span>
                        </span>
                      )}

                      {isOverdue && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-700 text-white text-xs font-black tracking-wide">
                          <Clock className="w-3 h-3" />
                          <span>Overdue • Scheduled {rem.formattedTime}</span>
                        </span>
                      )}

                      {isUpcoming && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-xs font-bold border border-stone-200">
                          <Clock className="w-3 h-3 text-stone-500" />
                          <span>Scheduled at {rem.formattedTime}</span>
                        </span>
                      )}
                    </div>

                    <h3 className={`text-lg sm:text-xl font-black ${isDueNow ? 'text-stone-950' : 'text-stone-900'}`}>
                      {rem.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-stone-600">
                      {rem.detail}
                    </p>
                  </div>
                </div>

                {/* Right: Large Action Button */}
                <div className="sm:text-right shrink-0">
                  <button
                    type="button"
                    onClick={() => handleReminderDone(rem.id, rem.title)}
                    className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer ${
                      isDone
                        ? 'bg-emerald-700 text-white hover:bg-emerald-800 border border-emerald-700'
                        : isDueNow
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md ring-2 ring-emerald-600/30 animate-pulse'
                        : 'bg-white hover:bg-emerald-50 text-emerald-900 border-2 border-emerald-700'
                    }`}
                  >
                    <Check className="w-5 h-5 stroke-[3]" />
                    <span>{isDone ? 'Completed ✓' : 'Mark as Done'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation */}
        <div className="text-center pt-4">
          <button
            onClick={() => navigate('/patient')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm border border-stone-300 cursor-pointer shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Main Dashboard</span>
          </button>
        </div>

      </div>
    </div>
  );
}
