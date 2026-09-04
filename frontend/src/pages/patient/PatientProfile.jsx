import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import NotificationPreferences from '../../components/NotificationPreferences';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  Languages, 
  Flame, 
  HeartHandshake, 
  CheckCircle2, 
  ShieldCheck, 
  Volume2, 
  LogOut,
  Sparkles,
  Calendar,
  Pill,
  Clock
} from 'lucide-react';

export default function PatientProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activePatient, logoutPatient, currentLanguage, updatePatient } = useApp();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioMessage, setAudioMessage] = useState('');

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

  const handleReadProfileAudio = () => {
    const speech = `Hello ${activePatient?.name || 'Elder'}. You are registered under primary caregiver ${activePatient?.primaryCaregiver || 'Dr. Ananya Sharma'}. Your emergency contact is ${activePatient?.emergencyContact || 'configured'}. You have completed your memory streak of ${activePatient?.streakDays || 14} days.`;
    speakText(speech);
  };

  const completedCount = activePatient?.todayReminders?.filter(r => r.status === 'completed' || r.acknowledged === true).length || 0;
  const totalCount = activePatient?.todayReminders?.length || 10;
  const streakDays = activePatient?.streakDays || 14;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAF7F2] pb-24 pt-6 px-4 sm:px-6 lg:px-8 xl:px-10">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
        
        {/* ======================================================== */}
        {/* 1. TOP NAVIGATION / BACK BAR                             */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/patient')}
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 hover:text-stone-950 font-bold text-sm sm:text-base shadow-2xs transition-all cursor-pointer group active:scale-98"
          >
            <ArrowLeft className="w-5 h-5 text-amber-800 transition-transform group-hover:-translate-x-1" />
            <span>← {t('profilePage.backToDashboard')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              logoutPatient();
              navigate('/');
            }}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 font-bold text-xs sm:text-sm border border-stone-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('profilePage.switchUser')}</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* 2. FULL-WIDTH ELDER-FRIENDLY PROFILE HEADER              */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-2xs relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-8">
            
            {/* Avatar & Patient Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-7">
              <div className="relative">
                <img
                  src={activePatient?.avatar || 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80'}
                  alt={activePatient?.name || 'Patient'}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-amber-800/20 shadow-md shrink-0"
                />
                <span className="absolute -bottom-2 -right-2 bg-amber-800 text-white p-2 rounded-2xl shadow-xs border-2 border-white">
                  <User className="w-4 h-4" />
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                    <span>{t('profilePage.earlySupport')}</span>
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                    {t('profilePage.tierMember')}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight leading-tight">
                  {activePatient?.name || 'Ramesh Sharma'}
                </h1>

                <p className="text-sm sm:text-base text-stone-600 font-medium flex items-center gap-2 flex-wrap">
                  <span>{activePatient?.age || 74} {t('profilePage.senior')}</span>
                  <span>•</span>
                  <span>{t('profilePage.senior')}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-stone-700 font-semibold">
                    <MapPin className="w-4 h-4 text-stone-500" />
                    <span>{activePatient?.location || 'Guwahati, Assam'}</span>
                  </span>
                </p>
              </div>
            </div>

            {/* Read Aloud Button */}
            <div className="shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleReadProfileAudio}
                className={`w-full sm:w-auto px-6 py-4 rounded-2xl border flex items-center justify-center gap-2.5 text-base font-bold shadow-xs transition-all cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-amber-800 border-amber-900 text-white animate-pulse'
                    : 'bg-amber-800 hover:bg-amber-900 border-amber-900 text-white active:scale-98'
                }`}
              >
                <Volume2 className="w-6 h-6 shrink-0" />
                <span>{isPlayingAudio ? t('profilePage.speaking') : t('profilePage.listenProfile')}</span>
              </button>
            </div>

          </div>

          {isPlayingAudio && audioMessage && (
            <div className="mt-4 p-3.5 bg-stone-100 rounded-2xl text-xs sm:text-sm text-stone-800 font-semibold text-center border border-stone-200">
              🔊 "{audioMessage}"
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 3. INFORMATION CARDS GRID (GENEROUS SPACING & ICONS)     */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Card 1: Primary Caregiver */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs flex items-start gap-4 transition-all hover:border-amber-800/40">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
                {t('profilePage.caregiverDoctor')}
              </p>
              <h3 className="text-lg sm:text-xl font-black text-stone-900 truncate">
                {activePatient?.primaryCaregiver || 'Dr. Ananya Sharma'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 font-medium">
                {t('profilePage.caregiverDesc')}
              </p>
            </div>
          </div>

          {/* Card 2: Emergency Contact */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs flex items-start gap-4 transition-all hover:border-amber-800/40">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shrink-0">
              <Phone className="w-7 h-7" />
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
                {t('profilePage.emergencyPhone')}
              </p>
              <h3 className="text-lg sm:text-xl font-black text-stone-900 truncate font-mono">
                {activePatient?.emergencyContact || activePatient?.phone || '+91 94350 12345'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 font-medium">
                {t('profilePage.emergencyDesc')}
              </p>
            </div>
          </div>

          {/* Card 3: Preferred Language */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs flex items-start gap-4 transition-all hover:border-amber-800/40">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-800 flex items-center justify-center shrink-0">
              <Languages className="w-7 h-7" />
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
                {t('profilePage.languageCard')}
              </p>
              <h3 className="text-lg sm:text-xl font-black text-stone-900 truncate">
                {activePatient?.nativeLanguage || activePatient?.language || currentLanguage.name}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 font-medium">
                {t('profilePage.languageDesc')}
              </p>
            </div>
          </div>

          {/* Card 4: Daily Memory Streak */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs flex items-start gap-4 transition-all hover:border-amber-800/40">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 text-orange-800 flex items-center justify-center shrink-0">
              <Flame className="w-7 h-7 fill-orange-600 text-orange-600" />
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
                {t('profilePage.streakCard')}
              </p>
              <h3 className="text-lg sm:text-xl font-black text-orange-700 truncate">
                {t('profilePage.streakDays', { streak: streakDays })}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 font-medium">
                {t('profilePage.streakDesc')}
              </p>
            </div>
          </div>

          {/* Card 5: Routine Adherence Today */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs flex items-start gap-4 transition-all hover:border-amber-800/40">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
                {t('profilePage.adherenceCard')}
              </p>
              <h3 className="text-lg sm:text-xl font-black text-emerald-800 truncate">
                {completedCount} / {totalCount} {t('dashboard.done')}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 font-medium">
                {t('profilePage.adherenceDesc')}
              </p>
            </div>
          </div>

          {/* Card 6: Authentication & Security */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs flex items-start gap-4 transition-all hover:border-amber-800/40">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
                {t('profilePage.securityCard')}
              </p>
              <h3 className="text-lg sm:text-xl font-black text-stone-900 truncate">
                {t('profilePage.securityStatus')}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 font-medium">
                {t('profilePage.securityDesc')}
              </p>
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* 4. NOTIFICATION PREFERENCES (FULL-WIDTH SECTION)         */}
        {/* ======================================================== */}
        <NotificationPreferences 
          currentPreference={activePatient?.notificationPreference || 'whatsapp'}
          isPatient={true}
          onSave={async (channel) => {
            if (activePatient?.id) {
              await updatePatient(activePatient.id, { notificationPreference: channel });
            }
          }}
        />

        {/* ======================================================== */}
        {/* 5. BOTTOM BACK TO DASHBOARD ACTION                       */}
        {/* ======================================================== */}
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={() => navigate('/patient')}
            className="w-full sm:w-auto sm:min-w-[320px] py-4 px-8 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-extrabold text-base sm:text-lg transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('profilePage.returnDashboard')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
