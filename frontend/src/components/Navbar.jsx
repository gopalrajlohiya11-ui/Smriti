import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { 
  Globe, 
  HeartHandshake, 
  UserCheck, 
  LogOut, 
  ChevronDown,
  LayoutDashboard,
  Bell,
  BrainCircuit,
  User
} from 'lucide-react';
import FoxtailOrchidIcon from './FoxtailOrchidIcon';

export default function Navbar() {
  const { t } = useTranslation();
  const { 
    currentLanguage, 
    setCurrentLanguage, 
    regionalLanguages,
    logoutCaregiver,
    isPatientLoggedIn,
    logoutPatient,
    activePatient
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [comingSoonToast, setComingSoonToast] = useState('');

  const isCaregiverRoute = location.pathname.startsWith('/caregiver');
  const isPatientRoute = location.pathname.startsWith('/patient') || location.pathname === '/';
  const isPrivacyRoute = location.pathname === '/privacy-policy';

  // Prevent duplicate headers - PatientNavShell, CaregiverShell and PrivacyPolicy manage their own dedicated headers
  if (isCaregiverRoute || isPatientRoute || isPrivacyRoute) {
    return null;
  }

  const handleLanguageSelect = (lang) => {
    setCurrentLanguage(lang);
    setLangDropdownOpen(false);
    if (lang.status === 'coming_soon') {
      setComingSoonToast(`${lang.name} ${t('navbar.comingSoonNotice', 'is coming soon in future updates.')}`);
      setTimeout(() => setComingSoonToast(''), 3500);
    }
  };

  const patientNavItems = [
    { label: t('navbar.dashboard', 'Dashboard'), path: '/patient', icon: LayoutDashboard, exact: true },
    { label: t('navbar.reminders', 'Reminders'), path: '/patient/reminders', icon: Bell },
    { label: t('navbar.games', 'Brain Games'), path: '/patient/games', icon: BrainCircuit },
    { label: t('navbar.profile', 'Profile'), path: '/patient/profile', icon: User }
  ];

  const isNavActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E5E0D8] shadow-2xs">
      {comingSoonToast && (
        <div className="bg-[#B5502E] text-white text-xs font-bold text-center py-2 px-4 animate-in fade-in">
          {comingSoonToast}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Brand Logo & Name */}
          <Link to={isPatientRoute ? "/patient" : isCaregiverRoute ? "/caregiver" : "/"} className="flex items-center gap-3 group focus:outline-none shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-[#B5502E] hover:bg-[#9E4224] flex items-center justify-center text-white shadow-xs transition-colors">
              <span className="text-2xl select-none" role="img" aria-label="Smriti Logo">🌸</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#2B2B2B]">
                  Smriti
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-white text-[#6B6B6B] border border-[#E5E0D8] rounded-full">
                  {t('navbar.cognitiveCare', 'Cognitive Care')}
                </span>
              </div>
              <p className="text-xs text-[#6B6B6B] font-medium hidden lg:block">
                {t('navbar.brandTagline', 'North-East India Dementia & Memory Companion')}
              </p>
            </div>
          </Link>

          {/* Center: Patient Navigation Tabs (Desktop / Tablet) */}
          {isPatientRoute && isPatientLoggedIn && (
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
              {patientNavItems.map((item) => {
                const active = isNavActive(item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`min-h-[46px] px-3.5 lg:px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      active
                        ? 'bg-[#FDF6F0] text-[#B5502E] border border-[#B5502E]/25 shadow-2xs'
                        : 'text-[#2B2B2B] hover:text-[#B5502E] hover:bg-white border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-[#B5502E]' : 'text-[#6B6B6B]'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Navigation Controls */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 sm:px-3.5 rounded-xl bg-white border border-[#E5E0D8] text-[#2B2B2B] hover:bg-stone-50 text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer"
                aria-expanded={langDropdownOpen}
                aria-label="Select Language"
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

            {/* Caregiver Portal Controls */}
            {isCaregiverRoute ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 border border-[#E5E0D8] text-[#2B2B2B] text-xs font-bold">
                  <HeartHandshake className="w-3.5 h-3.5 text-[#B5502E]" />
                  <span>{t('navbar.caregiverMode', 'Caregiver')}</span>
                </div>
                <button
                  onClick={() => {
                    logoutCaregiver();
                    navigate('/');
                  }}
                  title="Sign out & Return to Patient Screen"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-stone-100 text-[#2B2B2B] text-xs sm:text-sm font-semibold border border-[#E5E0D8] transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : isPatientRoute && isPatientLoggedIn ? (
              /* Patient Logged In Status */
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#EDF7F2] border border-[#A3D9C1] text-[#1F6B4A] text-xs sm:text-sm font-bold shadow-2xs">
                  <UserCheck className="w-4 h-4 text-[#1F6B4A]" />
                  <span className="truncate max-w-[100px] sm:max-w-[120px]">{activePatient?.name?.split(' ')[0] || 'Elder'}</span>
                </div>
                <button
                  onClick={() => {
                    logoutPatient();
                    navigate('/');
                  }}
                  title="Log Out"
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-white hover:bg-stone-100 text-[#2B2B2B] text-xs sm:text-sm font-semibold border border-[#E5E0D8] transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              </div>
            ) : (
              /* Unobtrusive Caregiver Portal Shortcut on Login/Landing */
              <Link
                to="/caregiver/login"
                className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-xl text-[#6B6B6B] hover:text-[#2B2B2B] text-xs font-semibold hover:bg-stone-100 border border-transparent hover:border-[#E5E0D8] transition-all"
              >
                <span>Caregiver Access →</span>
              </Link>
            )}

          </div>

        </div>
      </div>

      {/* Mobile Patient Navigation Tab Bar (Min 48px touch targets for elderly accessibility) */}
      {isPatientRoute && isPatientLoggedIn && (
        <div className="md:hidden border-t border-[#E5E0D8] bg-white px-2 py-1.5 flex items-center justify-around gap-1 shadow-xs">
          {patientNavItems.map((item) => {
            const active = isNavActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-1 min-h-[48px] py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-all ${
                  active
                    ? 'bg-[#FDF6F0] text-[#B5502E] border border-[#B5502E]/25 shadow-2xs'
                    : 'text-[#6B6B6B] hover:text-[#2B2B2B] hover:bg-stone-50 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#B5502E]' : 'text-[#6B6B6B]'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
