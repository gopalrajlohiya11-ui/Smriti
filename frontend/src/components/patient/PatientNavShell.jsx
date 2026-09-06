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
  SlidersHorizontal,
  X,
  Check
} from 'lucide-react';
import FoxtailOrchidIcon from '../FoxtailOrchidIcon';

export default function PatientNavShell({ children, showBack = false, pageTitle = '' }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    currentLanguage, 
    setCurrentLanguage, 
    regionalLanguages, 
    activePatient, 
    logoutPatient 
  } = useApp();

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const [comingSoonToast, setComingSoonToast] = useState('');

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
      {/* 1. DESKTOP / TABLET PERSISTENT LEFT SIDEBAR              */}
      {/* ======================================================== */}
      <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 bg-white border-r border-[#E5E0D8] sticky top-0 h-screen p-5 shrink-0 z-30 shadow-2xs">
        
        {/* Brand & Logo */}
        <div className="space-y-6">
          <Link to="/patient" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-12 h-12 rounded-2xl bg-[#B5502E] hover:bg-[#9E4224] flex items-center justify-center text-white shadow-xs transition-colors">
              <FoxtailOrchidIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-[#2B2B2B]">
                  Smriti
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#FDF6F0] text-[#B5502E] border border-[#B5502E]/20 rounded-full">
                  Care
                </span>
              </div>
              <p className="text-[11px] text-[#6B6B6B] font-medium leading-tight">
                Memory Companion
              </p>
            </div>
          </Link>

          {/* Nav Links: 5 Persistent Destinations with 52px Touch Targets */}
          <nav className="space-y-2 pt-2" aria-label="Main Navigation">
            {navItems.map((item) => {
              const active = isNavActive(item);
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`w-full min-h-[52px] px-4 py-3 rounded-2xl font-black text-sm lg:text-base flex items-center gap-3.5 transition-all cursor-pointer ${
                    active
                      ? 'bg-[#FDF6F0] text-[#B5502E] border-2 border-[#B5502E]/30 shadow-xs'
                      : 'text-[#2B2B2B] hover:text-[#B5502E] hover:bg-stone-50 border-2 border-transparent'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    active ? 'bg-[#B5502E] text-white' : 'bg-stone-100 text-[#6B6B6B]'
                  }`}>
                    <Icon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Patient Badge + Switch User */}
        <div className="pt-4 border-t border-[#E5E0D8] space-y-3">
          <div className="flex items-center gap-3 p-3 bg-[#FAF7F2] rounded-2xl border border-[#E5E0D8]">
            <img 
              src={activePatient?.avatar || "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80"}
              alt={activePatient?.name || "Patient"}
              className="w-10 h-10 rounded-xl object-cover border border-[#E5E0D8]"
            />
            <div className="truncate flex-1">
              <p className="text-xs font-bold text-[#2B2B2B] truncate">{activePatient?.name || 'Ramesh Sharma'}</p>
              <p className="text-[11px] text-[#1F6B4A] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Active</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              logoutPatient();
              navigate('/');
            }}
            className="w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold text-[#6B6B6B] hover:text-[#C0392B] hover:bg-rose-50 flex items-center justify-center gap-2 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Switch Patient / Exit</span>
          </button>
        </div>

      </aside>

      {/* ======================================================== */}
      {/* 2. TOP ACCESSIBILITY & HEADER BAR (DESKTOP & MOBILE)     */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {comingSoonToast && (
          <div className="bg-[#B5502E] text-white text-xs font-bold text-center py-2 px-4 animate-in fade-in">
            ℹ️ {comingSoonToast}
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
                  <FoxtailOrchidIcon className="w-4 h-4 text-white" />
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
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
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
                <span className="text-[11px] font-bold">{currentLanguage.code.toUpperCase()}</span>
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
                {fontSizeLevel === 'normal' ? 'A (Normal)' : fontSizeLevel === 'large' ? 'A+ (Large)' : 'A++ (Max)'}
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
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#E5E0D8] shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setLangDropdownOpen(false)}
                >
                  <div className="px-4 py-2 text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider border-b border-stone-100">
                    {t('navbar.regionalLanguages', 'Select Language')}
                  </div>
                  {regionalLanguages.map((lang) => {
                    const isComingSoon = lang.status === 'coming_soon';
                    const isCurrent = currentLanguage.code === lang.code;

                    return (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageSelect(lang)}
                        className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-[#FDF6F0] text-[#B5502E] font-bold'
                            : 'text-[#2B2B2B] hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{lang.name}</span>
                          {isComingSoon && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-[#6B6B6B] border border-[#E5E0D8]">
                              Soon
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-[#6B6B6B] font-normal italic">
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

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 min-h-[52px] py-1 px-1 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                active
                  ? 'bg-[#FDF6F0] text-[#B5502E] font-black shadow-2xs border border-[#B5502E]/25'
                  : 'text-[#6B6B6B] hover:text-[#2B2B2B] active:bg-stone-50 font-bold'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-[#B5502E] stroke-[2.6]' : 'text-[#6B6B6B] stroke-[2]'}`} />
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
                <span>{isHindi ? "क्षेत्रीय भाषा चुनें (Select Language)" : "Regional Language"}</span>
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {regionalLanguages.map((lang) => {
                  const isComingSoon = lang.status === 'coming_soon';
                  const isCurrent = currentLanguage.code === lang.code;

                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageSelect(lang)}
                      className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl text-sm flex items-center justify-between transition-colors cursor-pointer border ${
                        isCurrent
                          ? 'bg-[#FDF6F0] text-[#B5502E] border-[#B5502E]/30 font-black'
                          : 'bg-stone-50 text-[#2B2B2B] border-stone-200 hover:bg-stone-100 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{lang.name}</span>
                        {isComingSoon && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-200 text-[#6B6B6B]">
                            Soon
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#6B6B6B] italic">{lang.greeting.split(' ')[0]}</span>
                        {isCurrent && <Check className="w-4 h-4 text-[#B5502E] stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Switch User / Logout */}
            <div className="pt-2 border-t border-stone-100">
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
                <span>{isHindi ? "रोगी बदलें / लॉग आउट" : "Switch Patient / Log Out"}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
