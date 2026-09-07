import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import NotificationPreferences from '../../components/NotificationPreferences';
import { speakLocalized, stopSpeech } from '../../utils/speechUtils';
import { calculatePatientStreak } from '../../utils/streakUtils';
import PatientNavShell from '../../components/patient/PatientNavShell';
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
  VolumeX,
  LogOut,
  Sparkles,
  Calendar,
  Pill,
  Clock,
  Download,
  Smartphone
} from 'lucide-react';

export default function PatientProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { 
    activePatient, 
    logoutPatient, 
    currentLanguage, 
    updatePatient, 
    loadGameSessions,
    voiceAutoPlay,
    toggleVoiceAutoPlay
  } = useApp();
  const [patientSessions, setPatientSessions] = useState([]);
  const isHindi = (currentLanguage?.code || '').startsWith('hi');

  useEffect(() => {
    let isMounted = true;
    if (activePatient?.id || activePatient?._id) {
      loadGameSessions(activePatient.id || activePatient._id).then(sessions => {
        if (isMounted && Array.isArray(sessions)) {
          setPatientSessions(sessions);
        }
      });
    }
    return () => { isMounted = false; };
  }, [activePatient, loadGameSessions]);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioMessage, setAudioMessage] = useState('');

  // Voice narration helper
  const speakText = (text) => {
    setAudioMessage(text);
    speakLocalized({
      text,
      langCode: currentLanguage?.code || 'en',
      rate: 0.85,
      pitch: 1.0,
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
      onNotice: (notice) => setAudioMessage(notice)
    });
  };

  const handleReadProfileAudio = () => {
    const isHindi = (currentLanguage?.code || '').startsWith('hi');
    const isAssamese = (currentLanguage?.code || '').startsWith('as');

    let speech = '';
    if (isHindi) {
      speech = `नमस्ते ${activePatient?.name || 'जी'}। आप प्राथमिक देखभालकर्ता ${activePatient?.primaryCaregiver || 'डॉ. अनन्या शर्मा'} के तहत पंजीकृत हैं। आपका आपातकालीन संपर्क ${activePatient?.emergencyContact || 'सेट'} है। आपने लगातार ${streakDays} दिनों का स्मृति क्रम पूरा किया है।`;
    } else if (isAssamese) {
      speech = `নমস্কাৰ ${activePatient?.name || 'ডাঙৰীয়া'}। আপুনি প্ৰধান তত্ত্বাৱধায়ক ${activePatient?.primaryCaregiver || 'ডাঃ অনন্যা শৰ্মা'}-ৰ তত্ত্বাৱধানত আছে।`;
    } else {
      speech = `Hello ${activePatient?.name || 'Elder'}. You are registered under primary caregiver ${activePatient?.primaryCaregiver || 'Dr. Ananya Sharma'}. Your emergency contact is ${activePatient?.emergencyContact || 'configured'}. You have completed your memory streak of ${streakDays} ${streakDays === 1 ? 'day' : 'days'}.`;
    }
    speakText(speech);
  };

  const completedCount = activePatient?.todayReminders?.filter(r => r.status === 'completed' || r.acknowledged === true).length || 0;
  const totalCount = activePatient?.todayReminders?.length || 10;
  const isDemo = activePatient?.isDemoSeed === true || 
    ['pat-1', 'pat-2', 'pat-3'].includes(activePatient?.id) || 
    ['Ramesh Sharma', 'Meera Baruah', 'Biren Das'].includes(activePatient?.name);

  const streakDays = isDemo 
    ? (activePatient?.streakDays || 14) 
    : calculatePatientStreak(activePatient, patientSessions, activePatient?.todayReminders || []);

  return (
    <PatientNavShell pageTitle="My Profile & Care Details">
      <div className="space-y-6">
        
        {/* TOP NAVIGATION */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/patient')}
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white hover:bg-stone-50 border border-[#E5E0D8] text-[#2B2B2B] font-bold text-sm sm:text-base shadow-2xs transition-all cursor-pointer min-h-[48px]"
          >
            <ArrowLeft className="w-5 h-5 text-[#B5502E]" />
            <span>← {t('profilePage.backToDashboard')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              logoutPatient();
              navigate('/');
            }}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-stone-50 text-[#6B6B6B] hover:text-[#C0392B] font-bold text-xs sm:text-sm border border-[#E5E0D8] transition-colors cursor-pointer min-h-[48px]"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('profilePage.switchUser')}</span>
          </button>
        </div>

        {/* PROFILE HEADER */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-[#E5E0D8] shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
            
            {/* Avatar & Patient Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5">
              <div className="relative shrink-0">
                <img
                  src={activePatient?.avatar || 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80'}
                  alt={activePatient?.name || 'Patient'}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#E5E0D8] shadow-xs"
                />
                <span className="absolute -bottom-1 -right-1 bg-[#B5502E] text-white p-1.5 rounded-full shadow-xs border-2 border-white">
                  <User className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FDF6F0] text-[#B5502E] border border-[#B5502E]/20 inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('profilePage.earlySupport', 'Early Memory Support')}</span>
                </span>

                <h1 className="text-2xl sm:text-3xl font-black text-[#2B2B2B]">
                  {activePatient?.name || 'Ramesh Sharma'}
                </h1>

                <p className="text-xs sm:text-sm text-[#6B6B6B] font-semibold flex items-center justify-center sm:justify-start gap-2">
                  <span>Age {activePatient?.age || 74}</span>
                  <span>•</span>
                  <span>{activePatient?.location || 'Guwahati, Assam'}</span>
                </p>
              </div>
            </div>

            {/* Read Aloud Button (Min 56px) */}
            <div className="w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={handleReadProfileAudio}
                className={`w-full sm:w-auto min-h-[56px] px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 text-sm sm:text-base font-bold shadow-xs transition-all cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-[#2C5AA0] text-white ring-4 ring-[#2C5AA0]/30 animate-pulse'
                    : 'bg-[#2C5AA0] hover:bg-[#224780] text-white'
                }`}
              >
                <Volume2 className="w-5 h-5 shrink-0" />
                <span>{isPlayingAudio ? t('profilePage.speaking') : t('profilePage.listenProfile', 'Listen 🔊')}</span>
              </button>
            </div>

          </div>
        </div>

        {/* ESSENTIAL STAT CARDS (ICON + LABEL + VALUE - NO NOISY SUBTEXT) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* 1. Primary Caregiver */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E0D8] shadow-2xs flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF4FA] border border-[#2C5AA0]/20 flex items-center justify-center text-[#2C5AA0] shrink-0">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">
                {t('profilePage.caregiverDoctor', 'Caregiver')}
              </p>
              <p className="text-base sm:text-lg font-black text-[#2B2B2B]">
                {activePatient?.primaryCaregiver || 'Dr. Ananya Sharma'}
              </p>
            </div>
          </div>

          {/* 2. Emergency Contact */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E0D8] shadow-2xs flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FDF6F0] border border-[#B5502E]/20 flex items-center justify-center text-[#B5502E] shrink-0">
              <Phone className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">
                {t('profilePage.emergencyPhone', 'Emergency Contact')}
              </p>
              <p className="text-base sm:text-lg font-black text-[#2B2B2B]">
                {activePatient?.emergencyContact || '+91 98765 43210'}
              </p>
            </div>
          </div>

          {/* 3. Preferred Language */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E0D8] shadow-2xs flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF4FA] border border-[#2C5AA0]/20 flex items-center justify-center text-[#2C5AA0] shrink-0">
              <Languages className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">
                {t('profilePage.languageCard', 'Language')}
              </p>
              <p className="text-base sm:text-lg font-black text-[#2B2B2B]">
                {currentLanguage?.name || 'English'}
              </p>
            </div>
          </div>

          {/* 4. Memory Routine Streak */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E0D8] shadow-2xs flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FDF6F0] border border-[#B5502E]/20 flex items-center justify-center text-[#B5502E] shrink-0">
              <Flame className="w-7 h-7 fill-[#B5502E]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">
                {t('profilePage.streakCard', 'Memory Streak')}
              </p>
              <p className="text-base sm:text-lg font-black text-[#2B2B2B]">
                {(currentLanguage?.code || '').startsWith('hi') ? `${streakDays} दिन लगातार` : `${streakDays} ${streakDays === 1 ? 'Day' : 'Days'} in a row`}
              </p>
            </div>
          </div>

          {/* 5. Today's Adherence */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E0D8] shadow-2xs flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EDF7F2] border border-[#A3D9C1] flex items-center justify-center text-[#1F6B4A] shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">
                {t('profilePage.adherenceCard', "Today's Routines")}
              </p>
              <p className="text-base sm:text-lg font-black text-[#1F6B4A]">
                {completedCount} of {totalCount} Done
              </p>
            </div>
          </div>

          {/* 6. Biometric Security */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E0D8] shadow-2xs flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF4FA] border border-[#2C5AA0]/20 flex items-center justify-center text-[#2C5AA0] shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">
                {t('profilePage.securityCard', 'Security')}
              </p>
              <p className="text-base sm:text-lg font-black text-[#2B2B2B]">
                4-Digit PIN & Fingerprint
              </p>
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* VOICE AUTO-PLAY ACCESSIBILITY TOGGLE                     */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-[#E5E0D8] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-start sm:items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                voiceAutoPlay 
                  ? 'bg-[#EDF7F2] border-[#A3D9C1] text-[#1F6B4A]' 
                  : 'bg-stone-100 border-stone-200 text-[#6B6B6B]'
              }`}>
                {voiceAutoPlay ? <Volume2 className="w-7 h-7" /> : <VolumeX className="w-7 h-7" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-black text-[#2B2B2B]">
                    {isHindi ? "आवाज का स्वतः प्ले" : "Auto-Play Voice Greetings"}
                  </h3>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                    voiceAutoPlay
                      ? 'bg-[#EDF7F2] text-[#1F6B4A] border-[#A3D9C1]'
                      : 'bg-stone-100 text-[#6B6B6B] border-stone-200'
                  }`}>
                    {voiceAutoPlay ? (isHindi ? "सक्रिय" : "ON") : (isHindi ? "बंद" : "OFF")}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#6B6B6B] font-medium">
                  {isHindi 
                    ? "पेज खोलने पर स्मृति स्वतः आवाज में बोलेगी। '🔊 सुनें' बटन हमेशा काम करेंगे।" 
                    : "Smriti will speak greetings automatically on page open. Manual 🔊 Listen buttons always work."}
                </p>
              </div>
            </div>

            {/* Accessible Toggle Button */}
            <div className="flex items-center gap-3 self-end sm:self-center">
              <button
                type="button"
                role="switch"
                aria-checked={voiceAutoPlay}
                onClick={toggleVoiceAutoPlay}
                className={`relative inline-flex h-10 w-20 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-xs ${
                  voiceAutoPlay ? 'bg-[#1F6B4A]' : 'bg-stone-300'
                }`}
                aria-label="Toggle auto-play voice greetings"
              >
                <span
                  className={`pointer-events-none inline-flex h-9 w-9 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out items-center justify-center text-[10px] font-black ${
                    voiceAutoPlay ? 'translate-x-10 text-[#1F6B4A]' : 'translate-x-0 text-[#6B6B6B]'
                  }`}
                >
                  {voiceAutoPlay ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* PWA INSTALL CARD: ADD TO HOME SCREEN                     */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E0D8] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] border border-[#9a3412]/30 text-[#9a3412] flex items-center justify-center shrink-0">
                <Smartphone className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-[#2B2B2B]">
                  {isHindi ? "फोन पर ऐप इंस्टॉल करें" : "Install App on Your Device"}
                </h3>
                <p className="text-xs sm:text-sm text-[#6B6B6B] font-medium">
                  {isHindi 
                    ? "तेज़ 1-टैप उपयोग और बिना इंटरनेट के ऑफ़लाइन कार्य करने के लिए स्मृति को होम स्क्रीन पर जोड़ें।" 
                    : "Add Smriti to your home screen for fast 1-tap access and offline tools."}
                </p>
              </div>
            </div>

            <div className="self-end sm:self-center">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('smriti_trigger_pwa_install'));
                }}
                className="min-h-[50px] px-6 py-3 rounded-2xl bg-gradient-to-r from-[#9a3412] to-[#c2410c] hover:from-[#7c2d12] hover:to-[#9a3412] text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>{isHindi ? "📲 ऐप इंस्टॉल करें" : "📲 Install App"}</span>
              </button>
            </div>

          </div>
        </div>

        {/* NOTIFICATION PREFERENCES */}
        <NotificationPreferences />

      </div>
    </PatientNavShell>
  );
}