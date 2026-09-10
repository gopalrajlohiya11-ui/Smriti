import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { 
  Home, 
  Bell, 
  BrainCircuit, 
  Heart, 
  User, 
  Globe, 
  LogOut, 
  ChevronDown, 
  Type, 
  ArrowLeft,
  UserCheck,
  CheckCircle2,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  X,
  Check,
  Download,
  Smartphone,
  Trees,
  Sparkles,
  MapPin
} from 'lucide-react';
import FoxtailOrchidIcon from '../FoxtailOrchidIcon';
import { getStoredPatientSession } from '../../utils/authUtils';
import MemoryOfHomeModal from './MemoryOfHomeModal';
import { NORTHEAST_STATES, getRegionById } from '../../data/regionalData';
import { initialPatients } from '../../data/mockData';

export default function PatientNavShell({ children, showBack = false, pageTitle = '' }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    currentLanguage, 
    setCurrentLanguage, 
    regionalLanguages, 
    activePatient, 
    logoutPatient,
    voiceAutoPlay,
    toggleVoiceAutoPlay,
    isCaregiverLoggedIn,
    setActivePatientId,
    setDirectPatientSession
  } = useApp();

  const isCaregiverAuth = Boolean(isCaregiverLoggedIn || localStorage.getItem('smriti_caregiver_token'));

  useEffect(() => {
    const session = getStoredPatientSession();
    if (!session.isValid && !isCaregiverAuth && !activePatient) {
      navigate('/patient/login', { replace: true });
    }
  }, [navigate, activePatient, isCaregiverAuth]);

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const [comingSoonToast, setComingSoonToast] = useState('');
  const [memoryModalOpen, setMemoryModalOpen] = useState(false);

  // Regional State Personalization (Assam, Meghalaya, etc.)
  const [selectedStateId, setSelectedStateId] = useState(() => {
    return localStorage.getItem('smriti_patient_state') || 'assam';
  });

  const currentRegion = getRegionById(selectedStateId);

  useEffect(() => {
    if (activePatient?.location || activePatient?.nativeLanguage) {
      const loc = (activePatient.location || '').toLowerCase();
      const lang = (activePatient.nativeLanguage || '').toLowerCase();
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
      setSelectedStateId(targetState);
      localStorage.setItem('smriti_patient_state', targetState);
    }
  }, [activePatient]);

  useEffect(() => {
    const handleStateChange = () => {
      const stored = localStorage.getItem('smriti_patient_state');
      if (stored && stored !== selectedStateId) {
        setSelectedStateId(stored);
      }
    };
    const handleOpenMemoryModal = () => setMemoryModalOpen(true);

    window.addEventListener('smriti_state_changed', handleStateChange);
    window.addEventListener('smriti_open_memory_modal', handleOpenMemoryModal);
    return () => {
      window.removeEventListener('smriti_state_changed', handleStateChange);
      window.removeEventListener('smriti_open_memory_modal', handleOpenMemoryModal);
    };
  }, [selectedStateId]);

  const handleSelectState = (stateId) => {
    setSelectedStateId(stateId);
    localStorage.setItem('smriti_patient_state', stateId);
    window.dispatchEvent(new Event('smriti_state_changed'));
  };

  // A+ / A- Text Size Accessibility (NHS-Style)
  const [fontSizeLevel, setFontSizeLevel] = useState(() => {
    return localStorage.getItem('smriti_text_size') || 'normal'; // 'normal' | 'large' | 'xl'
  });

  useEffect(() => {
    localStorage.setItem('smriti_text_size', fontSizeLevel);
    const root = document.documentElement;
    if (fontSizeLevel === 'xl') {
      root.style.fontSize = '18.5px';
    } else if (fontSizeLevel === 'large') {
      root.style.fontSize = '17.2px';
    } else {
      root.style.fontSize = '16px';
    }
  }, [fontSizeLevel]);

  const toggleFontSize = () => {
    setFontSizeLevel(prev => {
      if (prev === 'normal') return 'large';
      if (prev === 'large') return 'xl';
      return 'normal';
    });
  };

  const handleLanguageSelect = (lang) => {
    setCurrentLanguage(lang);
    setLangDropdownOpen(false);
    if (lang.status === 'coming_soon') {
      setComingSoonToast(`${lang.name} ${t('navbar.comingSoonNotice', 'is coming soon in future updates.')}`);
      setTimeout(() => setComingSoonToast(''), 3500);
    }
  };

  // Overdue reminders count for real-time notification badge
  const overdueCount = React.useMemo(() => {
    if (!activePatient?.todayReminders) return 0;
    const now = new Date();
    return activePatient.todayReminders.filter(rem => {
      const isDone = rem.status === 'completed' || rem.acknowledged === true;
      if (isDone) return false;
      
      let hours = 9;
      let minutes = 0;
      if (rem.scheduledTime) {
        const d = new Date(rem.scheduledTime);
        if (!isNaN(d.getTime())) {
          hours = d.getHours();
          minutes = d.getMinutes();
        }
      } else if (rem.time) {
        const match = rem.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (match) {
          hours = parseInt(match[1], 10);
          minutes = parseInt(match[2], 10);
          const period = match[3]?.toUpperCase();
          if (period === 'PM' && hours < 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
        }
      }
      const sched = new Date(now);
      sched.setHours(hours, minutes, 0, 0);
      const diffMins = (now.getTime() - sched.getTime()) / (1000 * 60);
      return diffMins > 60;
    }).length;
  }, [activePatient?.todayReminders]);

  // 5 Core Persistent Destinations
  const navItems = [
    { label: t('nav.home', 'Home'), path: '/patient', icon: Home, exact: true },
    { label: t('nav.reminders', 'Reminders'), path: '/patient/reminders', icon: Bell },
    { label: t('nav.games', 'Games'), path: '/patient/games', icon: BrainCircuit },
    { label: t('nav.family', 'Family'), path: '/patient/family', icon: Heart },
    { label: t('nav.profile', 'Profile'), path: '/patient/profile', icon: User }
  ];

  const isNavActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const isHindi = (currentLanguage?.code || '').startsWith('hi');

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col md:flex-row text-[#2B2B2B]">
      
      {/* ======================================================== */}
      {/* 1. DESKTOP / TABLET PERSISTENT DEEP FOREST GREEN SIDEBAR */}
      {/* ======================================================== */}
      <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 bg-gradient-to-b from-[#0E382B] via-[#0A2D22] to-[#061C15] text-white sticky top-0 h-screen p-5 shrink-0 z-30 shadow-xl relative border-r-4 border-[#B85026]/40">
        
        {/* Subtle Regional Weaving Textile Border Accent (Gamosa / Dakmanda Motif Line) */}
        <div 
          className="absolute top-0 right-0 bottom-0 w-1.5 opacity-80" 
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, #B85026 0px, #B85026 8px, #FFFFFF 8px, #FFFFFF 12px, #1F6B4A 12px, #1F6B4A 20px, #D4AF37 20px, #D4AF37 24px)'
          }} 
        />

        {/* Brand & Logo */}
        <div className="space-y-5">
          <Link to="/patient" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#B85026] to-[#8C3A18] flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105 border border-amber-300/30">
              <span className="text-2xl select-none" role="img" aria-label="Smriti Logo">🌸</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white">
                  Smriti
                </span>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full">
                  NER Care
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/70 font-medium leading-tight flex items-center gap-1 mt-0.5">
                <span>{currentRegion.emblemEmoji}</span>
                <span>{currentRegion.name} Edition</span>
              </p>
            </div>
          </Link>

          {/* Regional Personalization Card / Memory of Home Launcher */}
          <button
            type="button"
            onClick={() => setMemoryModalOpen(true)}
            className="w-full p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-left transition-all cursor-pointer group shadow-sm flex items-center justify-between gap-2"
            title="Open Memory of Home — Ambient Sounds & Stories"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30 group-hover:scale-105 transition-transform">
                <Trees className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-white truncate group-hover:text-emerald-300 transition-colors">
                  Memory of Home
                </p>
                <p className="text-[10px] text-emerald-200/80 truncate font-medium">
                  {currentRegion.name} • Sounds & Tales
                </p>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0 group-hover:rotate-12 transition-transform" />
          </button>

          {/* Nav Links: 5 Persistent Destinations with 52px Touch Targets */}
          <nav className="space-y-1.5 pt-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const active = isNavActive(item);
              const Icon = item.icon;
              const isReminders = item.path === '/patient/reminders';

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`w-full min-h-[52px] px-4 py-3 rounded-2xl font-black text-sm lg:text-base flex items-center gap-3.5 transition-all cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-[#B85026] to-[#A03E18] text-white shadow-md border-l-4 border-amber-300'
                      : 'text-emerald-100/90 hover:text-white hover:bg-white/10 border-l-4 border-transparent'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center relative transition-colors ${
                    active ? 'bg-white/20 text-white' : 'bg-white/5 text-emerald-200/80'
                  }`}>
                    <Icon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {isReminders && overdueCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#E53E3E] text-white text-xs font-black shrink-0 animate-in fade-in shadow-xs">
                      {overdueCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Patient Badge + Switch User */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-2.5 p-2.5 bg-black/25 rounded-2xl border border-white/10">
            <img 
              src={activePatient?.avatar || "/avatars/ramesh_sharma.png"}
              alt={activePatient?.name || "Patient"}
              className="w-10 h-10 rounded-xl object-cover border border-emerald-400/30 shrink-0"
            />
            <div className="truncate flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{activePatient?.name || 'Ramesh Sharma'}</p>
              <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span className="truncate">{currentRegion.prominentCity.split(',')[0]}</span>
              </p>
            </div>
            {/* Quick Toggle between Ramesh & Meera */}
            <button
              type="button"
              onClick={() => {
                const isCurrentlyMeera = (activePatient?.name || '').toLowerCase().includes('meera') || activePatient?.id === 'pat-2' || localStorage.getItem('smriti_patient_id') === 'pat-2';
                const targetPatient = isCurrentlyMeera ? initialPatients[0] : initialPatients[1];
                if (setDirectPatientSession) {
                  setDirectPatientSession(targetPatient);
                }
              }}
              title="Switch profile (Ramesh / Meera)"
              className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-emerald-500/30 text-emerald-300 hover:text-white transition-all cursor-pointer shrink-0 text-xs font-black flex items-center gap-1.5 border border-white/20 active:scale-95 shadow-2xs"
            >
              <span className="text-sm">⇄</span>
              <span className="hidden xl:inline text-[10px]">Switch</span>
            </button>
          </div>

          {isCaregiverAuth ? (
            <button
              type="button"
              onClick={() => navigate('/caregiver')}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold text-emerald-200 bg-emerald-900/40 hover:bg-emerald-900/60 flex items-center justify-center gap-2 transition-colors cursor-pointer border border-emerald-500/30"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-300" />
              <span>Exit Preview</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                logoutPatient();
                navigate('/');
              }}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold text-emerald-200/70 hover:text-white hover:bg-rose-900/40 flex items-center justify-center gap-2 transition-colors cursor-pointer border border-transparent hover:border-rose-400/30"
            >
              <LogOut className="w-4 h-4" />
              <span>{isHindi ? "लॉग आउट" : "Log Out"}</span>
            </button>
          )}
        </div>

      </aside>

      {/* ======================================================== */}
      {/* 2. TOP ACCESSIBILITY & HEADER BAR (DESKTOP & MOBILE)     */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {comingSoonToast && (
          <div className="bg-[#B5502E] text-white text-xs font-bold text-center py-2 px-4 animate-in fade-in">
            {comingSoonToast}
          </div>
        )}

        {/* Clinician / Caregiver Preview Banner */}
        {(isCaregiverLoggedIn || !!localStorage.getItem('smriti_caregiver_token')) && (
          <div className="bg-slate-900 text-white px-3.5 sm:px-6 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 text-xs shadow-xs z-30 sticky top-0">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold border border-teal-400/30 text-[10px] uppercase tracking-wider shrink-0">
                Caregiver Preview Mode
              </span>
              <span className="text-slate-300 truncate text-[11px] sm:text-xs">
                Simulating view for <strong className="text-white">{activePatient?.name || 'Patient'}</strong>
              </span>
              {/* Quick switch between patients directly from banner */}
              <button
                type="button"
                onClick={() => {
                  const isMeera = (activePatient?.name || '').toLowerCase().includes('meera');
                  const targetPatient = isMeera ? initialPatients[0] : initialPatients[1];
                  if (setDirectPatientSession) {
                    setDirectPatientSession(targetPatient);
                  }
                }}
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-teal-300 hover:text-white transition-colors cursor-pointer text-[10px] font-bold border border-white/20"
                title="Switch preview between Ramesh Sharma and Meera Baruah"
              >
                ⇄ Switch to {(activePatient?.name || '').toLowerCase().includes('meera') ? 'Ramesh' : 'Meera'}
              </button>
            </div>
            <button
              type="button"
              onClick={() => navigate('/caregiver')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0 self-end sm:self-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Caregiver Portal</span>
            </button>
          </div>
        )}

        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E5E0D8] px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-3 shadow-2xs">
          
          {/* Left: Mobile Brand OR Back Button + Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {showBack ? (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-white hover:bg-stone-100 text-[#2B2B2B] border border-[#E5E0D8] font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs shrink-0"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span>Back</span>
              </button>
            ) : (
              <Link to="/patient" className="md:hidden flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-xl bg-[#B5502E] flex items-center justify-center text-white shadow-xs">
                  <span className="text-base select-none" role="img" aria-label="Smriti Logo">🌸</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-black text-[#2B2B2B] leading-none">Smriti</span>
                  <span className="text-[10px] text-[#B5502E] font-bold leading-none mt-0.5">
                    {(activePatient?.name || 'Ramesh').split(' ')[0]}
                  </span>
                </div>
              </Link>
            )}

            {pageTitle && (
              <h1 className="text-sm sm:text-lg font-black text-[#2B2B2B] truncate">
                {pageTitle}
              </h1>
            )}
          </div>

          {/* Right Controls: Desktop Inline controls vs Mobile Compact Settings Sheet Trigger */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

            {/* DESKTOP & TABLET: Regional Home & Ambient Trigger Pill */}
            <button
              type="button"
              onClick={() => setMemoryModalOpen(true)}
              className="hidden sm:inline-flex min-h-[44px] px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-800 to-[#0E382B] text-white hover:from-emerald-700 hover:to-[#144939] text-xs font-black items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95 border border-emerald-600/40"
              title="Memory of Home — Ambient Nature Sounds & Reminiscence Stories"
            >
              <Trees className="w-4 h-4 text-emerald-300" />
              <span>{currentRegion.emblemEmoji} {currentRegion.name}</span>
              <span className="text-[10px] bg-white/20 text-emerald-100 px-1.5 py-0.5 rounded font-mono">Sounds</span>
            </button>
            
            {/* MOBILE ONLY: Single Settings Button (Opens Slide-up Sheet) */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setMobileSettingsOpen(true)}
                className="min-h-[44px] min-w-[44px] px-2.5 py-2 rounded-xl bg-white active:bg-stone-100 text-[#2B2B2B] border border-[#E5E0D8] flex items-center justify-center gap-1.5 font-black text-xs shadow-2xs"
                title="Settings & Language"
                aria-label="Settings"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#B5502E]" />
                <span className="text-[11px] font-bold">{currentRegion.emblemEmoji}</span>
              </button>
            </div>

            {/* DESKTOP ONLY: Inline A+ / A- Text Size Adjuster */}
            <button
              type="button"
              onClick={toggleFontSize}
              className="hidden md:flex min-h-[44px] px-3 py-2 rounded-xl bg-white hover:bg-[#FDF6F0] text-[#2B2B2B] hover:text-[#B5502E] border border-[#E5E0D8] hover:border-[#B5502E]/40 text-xs sm:text-sm font-black items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
              title="Adjust text size for easier reading"
              aria-label="Toggle Text Size"
            >
              <Type className="w-4 h-4 text-[#B5502E]" />
              <span className="font-mono font-black">
                {fontSizeLevel === 'normal' ? 'A' : fontSizeLevel === 'large' ? 'A+' : 'A++'}
              </span>
            </button>

            {/* DESKTOP ONLY: Inline Language Selector */}
            <div className="hidden md:block relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-white border border-[#E5E0D8] text-[#2B2B2B] hover:bg-stone-50 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                aria-expanded={langDropdownOpen}
              >
                <Globe className="w-4 h-4 text-[#6B6B6B]" />
                <span>{currentLanguage.name.split(' ')[0]}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#6B6B6B] transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {langDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-[#E5E0D8] shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[460px] overflow-y-auto"
                  onMouseLeave={() => setLangDropdownOpen(false)}
                >
                  {/* Deployed Active Languages */}
                  <div className="px-4 py-2 text-[10px] font-black text-emerald-800 bg-emerald-50/70 uppercase tracking-wider flex items-center justify-between border-y border-emerald-100 first:border-t-0">
                    <span>🟢 Deployed (Bhashini AI Voice & NMT)</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-200/80 text-emerald-900 font-bold">Active</span>
                  </div>
                  {regionalLanguages.filter(l => l.status === 'active').map((lang) => {
                    const isCurrent = currentLanguage.code === lang.code;

                    return (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageSelect(lang)}
                        className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer border-b border-stone-50 ${
                          isCurrent
                            ? 'bg-[#FDF6F0] text-[#B5502E] font-black'
                            : 'text-[#2B2B2B] hover:bg-stone-50 font-medium'
                        }`}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span>{lang.name}</span>
                            {isCurrent && <Check className="w-3.5 h-3.5 text-[#B5502E] stroke-[3]" />}
                          </div>
                          {lang.region && (
                            <span className="text-[10px] text-[#8C8C8C] font-normal">{lang.region}</span>
                          )}
                        </div>
                        <span className="text-xs text-[#6B6B6B] font-normal italic">
                          {lang.greeting.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}

                  {/* Coming Soon Languages */}
                  <div className="px-4 py-2 mt-2 text-[10px] font-black text-amber-800 bg-amber-50/70 uppercase tracking-wider flex items-center justify-between border-y border-amber-100">
                    <span>⏳ In Pipeline (Regional Rollout)</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 font-bold">Soon</span>
                  </div>
                  {regionalLanguages.filter(l => l.status === 'coming_soon').map((lang) => {
                    const isCurrent = currentLanguage.code === lang.code;

                    return (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageSelect(lang)}
                        className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer border-b border-stone-50/60 ${
                          isCurrent
                            ? 'bg-[#FDF6F0] text-[#B5502E] font-bold'
                            : 'text-[#4A4A4A] hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span>{lang.name}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-stone-100 text-[#6B6B6B] border border-[#E5E0D8]">
                              Soon
                            </span>
                          </div>
                          {lang.region && (
                            <span className="text-[9.5px] text-[#8C8C8C]">{lang.region}</span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#6B6B6B] italic">
                          {lang.greeting.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </header>

        {/* ======================================================== */}
        {/* 3. MAIN SINGLE-COLUMN SCREEN CONTENT                     */}
        {/* ======================================================== */}
        <main className="flex-1 px-3 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-6 pb-28 md:pb-12 max-w-5xl w-full mx-auto">
          {children}
        </main>

      </div>

      {/* ======================================================== */}
      {/* 4. MOBILE PERSISTENT BOTTOM TAB BAR (MIN-HEIGHT 64px)    */}
      {/* ======================================================== */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E0D8] px-1 py-1.5 min-h-[64px] flex items-stretch justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        aria-label="Mobile Navigation"
      >
        {navItems.map((item) => {
          const active = isNavActive(item);
          const Icon = item.icon;
          const isReminders = item.path === '/patient/reminders';

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 min-h-[52px] py-1 px-1 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative ${
                active
                  ? 'bg-[#FDF6F0] text-[#B5502E] font-black shadow-2xs border border-[#B5502E]/25'
                  : 'text-[#6B6B6B] hover:text-[#2B2B2B] active:bg-stone-50 font-bold'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${active ? 'text-[#B5502E] stroke-[2.6]' : 'text-[#6B6B6B] stroke-[2]'}`} />
                {isReminders && overdueCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#C0392B] text-white text-[10px] font-black flex items-center justify-center animate-in fade-in">
                    {overdueCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] leading-tight tracking-tight truncate max-w-full text-center">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ======================================================== */}
      {/* 5. MOBILE SETTINGS SLIDE-UP SHEET MODAL                  */}
      {/* ======================================================== */}
      {mobileSettingsOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setMobileSettingsOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#B5502E]" />
                <h3 className="text-lg font-black text-[#2B2B2B]">
                  {isHindi ? "सेटिंग्स और भाषा" : "Preferences & Language"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileSettingsOpen(false)}
                className="w-9 h-9 rounded-xl bg-stone-100 text-[#6B6B6B] hover:text-[#2B2B2B] flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Text Size Control */}
            <div className="space-y-2">
              <label className="text-xs font-black text-[#6B6B6B] uppercase tracking-wider flex items-center gap-1.5">
                <Type className="w-4 h-4 text-[#B5502E]" />
                <span>{isHindi ? "अक्षर का आकार (Text Size)" : "Reading Text Size"}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { level: 'normal', label: 'Normal (A)', preview: 'text-sm' },
                  { level: 'large', label: 'Large (A+)', preview: 'text-base' },
                  { level: 'xl', label: 'Max (A++)', preview: 'text-lg' }
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setFontSizeLevel(item.level)}
                    className={`min-h-[48px] p-2 rounded-xl font-bold flex flex-col items-center justify-center gap-0.5 border transition-all cursor-pointer ${
                      fontSizeLevel === item.level
                        ? 'bg-[#FDF6F0] text-[#B5502E] border-2 border-[#B5502E] shadow-2xs font-black'
                        : 'bg-stone-50 text-[#2B2B2B] border-stone-200'
                    }`}
                  >
                    <span className={item.preview}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-[#6B6B6B] uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#2C5AA0]" />
                <span>{isHindi ? "क्षेत्रीय भाषा चुनें (Select Language)" : "Regional Language (Bhashini AI)"}</span>
              </label>
              
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {/* Deployed */}
                <div className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md flex items-center justify-between">
                  <span>🟢 Deployed (Bhashini AI Voice & NMT)</span>
                  <span className="text-[9px] font-bold">Active</span>
                </div>
                {regionalLanguages.filter(l => l.status === 'active').map((lang) => {
                  const isCurrent = currentLanguage.code === lang.code;

                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageSelect(lang)}
                      className={`w-full min-h-[46px] px-3.5 py-2 rounded-xl text-sm flex items-center justify-between transition-colors cursor-pointer border ${
                        isCurrent
                          ? 'bg-[#FDF6F0] text-[#B5502E] border-[#B5502E]/30 font-black'
                          : 'bg-stone-50 text-[#2B2B2B] border-stone-200 hover:bg-stone-100 font-medium'
                      }`}
                    >
                      <div className="flex flex-col text-left">
                        <span>{lang.name}</span>
                        {lang.region && <span className="text-[10px] text-[#8C8C8C] font-normal">{lang.region}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#6B6B6B] italic">{lang.greeting.split(' ')[0]}</span>
                        {isCurrent && <Check className="w-4 h-4 text-[#B5502E] stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}

                {/* Coming Soon */}
                <div className="text-[10px] font-black text-amber-800 bg-amber-50 px-2 py-1 rounded-md flex items-center justify-between mt-2">
                  <span>⏳ In Pipeline (Regional Rollout)</span>
                  <span className="text-[9px] font-bold">Soon</span>
                </div>
                {regionalLanguages.filter(l => l.status === 'coming_soon').map((lang) => {
                  const isCurrent = currentLanguage.code === lang.code;

                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageSelect(lang)}
                      className={`w-full min-h-[40px] px-3 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer border ${
                        isCurrent
                          ? 'bg-[#FDF6F0] text-[#B5502E] border-[#B5502E]/30 font-bold'
                          : 'bg-white text-[#4A4A4A] border-stone-200/80 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-1.5">
                          <span>{lang.name}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-stone-100 text-[#6B6B6B] border border-stone-200">
                            Soon
                          </span>
                        </div>
                        {lang.region && <span className="text-[9.5px] text-[#8C8C8C]">{lang.region}</span>}
                      </div>
                      <span className="text-[11px] text-[#6B6B6B] italic">{lang.greeting.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Voice Auto-Play Toggle */}
            <div className="pt-1 border-t border-stone-100">
              <div className="flex items-center justify-between gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    voiceAutoPlay ? 'bg-[#EDF7F2] text-[#1F6B4A]' : 'bg-stone-200 text-[#6B6B6B]'
                  }`}>
                    {voiceAutoPlay ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#2B2B2B]">
                      {isHindi ? "आवाज का स्वतः प्ले" : "Auto-Play Voice Greetings"}
                    </p>
                    <p className="text-[10px] text-[#6B6B6B] font-medium">
                      {isHindi ? "पेज खोलने पर आवाज" : "Speak automatically on page open"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={voiceAutoPlay}
                  onClick={toggleVoiceAutoPlay}
                  className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-2xs ${
                    voiceAutoPlay ? 'bg-[#1F6B4A]' : 'bg-stone-300'
                  }`}
                  aria-label="Toggle voice auto-play"
                >
                  <span
                    className={`pointer-events-none inline-flex h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out items-center justify-center text-[9px] font-black ${
                      voiceAutoPlay ? 'translate-x-6 text-[#1F6B4A]' : 'translate-x-0 text-[#6B6B6B]'
                    }`}
                  >
                    {voiceAutoPlay ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            </div>

            {/* Northeast State Personalization */}
            <div className="space-y-2 pt-1 border-t border-stone-100">
              <label className="text-xs font-black text-[#0E382B] uppercase tracking-wider flex items-center gap-1.5">
                <Trees className="w-4 h-4 text-[#0E382B]" />
                <span>{isHindi ? "पूर्वोत्तर राज्य (Northeast State)" : "Patient Hometown / Region (NER)"}</span>
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                {NORTHEAST_STATES.map((st) => {
                  const isSelected = selectedStateId.toLowerCase() === st.id.toLowerCase();
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleSelectState(st.id)}
                      className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-[#EDF7F2] text-[#0E382B] border-[#1F6B4A] font-black'
                          : 'bg-stone-50 text-[#2B2B2B] border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <span className="truncate">{st.emblemEmoji} {st.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#0E382B] stroke-[3] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Quick Launch Memory of Home in Mobile Sheet */}
              <button
                type="button"
                onClick={() => {
                  setMobileSettingsOpen(false);
                  setMemoryModalOpen(true);
                }}
                className="w-full mt-2 min-h-[46px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0E382B] to-[#164E3D] text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Trees className="w-4 h-4 text-emerald-300" />
                <span>Open Memory of Home (Sounds & Stories)</span>
              </button>
            </div>

            {/* Install App Button */}
            <div className="pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  setMobileSettingsOpen(false);
                  window.dispatchEvent(new CustomEvent('smriti_trigger_pwa_install'));
                }}
                className="w-full min-h-[50px] px-4 py-2.5 rounded-2xl bg-[#FFF7ED] text-[#9a3412] border border-[#9a3412]/30 font-black text-sm flex items-center justify-center gap-2 active:bg-amber-100 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isHindi ? "ऐप फोन पर इंस्टॉल करें" : "Install App on Phone"}</span>
              </button>
            </div>

            {/* Switch User / Logout / Exit Preview */}
            <div className="pt-2 border-t border-stone-100">
              {isCaregiverAuth ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileSettingsOpen(false);
                    navigate('/caregiver');
                  }}
                  className="w-full min-h-[50px] px-4 py-2.5 rounded-2xl bg-teal-50 text-teal-800 border border-teal-200 font-bold text-sm flex items-center justify-center gap-2 active:bg-teal-100 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-teal-700" />
                  <span>Return to Caregiver Portal</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileSettingsOpen(false);
                    logoutPatient();
                    navigate('/');
                  }}
                  className="w-full min-h-[50px] px-4 py-2.5 rounded-2xl bg-rose-50 text-[#C0392B] border border-rose-200 font-bold text-sm flex items-center justify-center gap-2 active:bg-rose-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isHindi ? "लॉग आउट" : "Log Out"}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Memory of Home Ambient & Hometown Stories Modal */}
      <MemoryOfHomeModal
        isOpen={memoryModalOpen}
        onClose={() => setMemoryModalOpen(false)}
        selectedStateId={selectedStateId}
        onSelectState={handleSelectState}
        patientName={activePatient?.name || 'Elder'}
      />

    </div>
  );
}
