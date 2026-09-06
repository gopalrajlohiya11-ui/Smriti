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
  Volume2
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
        <header className="sticky top-0 z-20 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E5E0D8] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3 shadow-2xs">
          
          {/* Left: Mobile Brand OR Screen Title & Back Button */}
          <div className="flex items-center gap-3">
            {showBack ? (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-white hover:bg-stone-100 text-[#2B2B2B] border border-[#E5E0D8] font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span>Back</span>
              </button>
            ) : (
              <div className="md:hidden flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#B5502E] flex items-center justify-center text-white shadow-xs">
                  <FoxtailOrchidIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black text-[#2B2B2B]">Smriti</span>
              </div>
            )}

            {pageTitle && (
              <h1 className="hidden sm:block text-lg font-black text-[#2B2B2B]">
                {pageTitle}
              </h1>
            )}
          </div>

          {/* Right: Accessibility Text Size Toggle + Language Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* NHS.uk-Style Text Size Adjuster (A- / A+) */}
            <button
              type="button"
              onClick={toggleFontSize}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-white hover:bg-[#FDF6F0] text-[#2B2B2B] hover:text-[#B5502E] border border-[#E5E0D8] hover:border-[#B5502E]/40 text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
              title="Adjust text size for easier reading"
              aria-label="Toggle Text Size"
            >
              <Type className="w-4 h-4 text-[#B5502E]" />
              <span className="font-mono font-black">
                {fontSizeLevel === 'normal' ? 'A (Normal)' : fontSizeLevel === 'large' ? 'A+ (Large)' : 'A++ (Max)'}
              </span>
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-white border border-[#E5E0D8] text-[#2B2B2B] hover:bg-stone-50 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                aria-expanded={langDropdownOpen}
              >
                <Globe className="w-4 h-4 text-[#6B6B6B]" />
                <span className="hidden sm:inline">{currentLanguage.name.split(' ')[0]}</span>
                <span className="sm:hidden">{currentLanguage.code.toUpperCase()}</span>
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
        <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-10 py-6 pb-28 md:pb-12 max-w-5xl w-full mx-auto">
          {children}
        </main>

      </div>

      {/* ======================================================== */}
      {/* 4. MOBILE PERSISTENT BOTTOM TAB BAR (THUMB-REACHABLE)    */}
      {/* ======================================================== */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E0D8] px-2 py-1.5 flex items-center justify-around shadow-lg"
        aria-label="Mobile Navigation"
      >
        {navItems.map((item) => {
          const active = isNavActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 min-h-[52px] py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] font-black transition-all cursor-pointer ${
                active
                  ? 'bg-[#FDF6F0] text-[#B5502E] border border-[#B5502E]/25 shadow-2xs'
                  : 'text-[#6B6B6B] hover:text-[#2B2B2B] active:bg-stone-100'
              }`}
            >
              <Icon className={`w-5 h-5 stroke-[2.2] ${active ? 'text-[#B5502E]' : 'text-[#6B6B6B]'}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
