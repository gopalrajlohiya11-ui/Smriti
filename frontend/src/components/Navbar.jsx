import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Globe, 
  HeartHandshake, 
  UserCheck, 
  LogOut, 
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
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

  const isCaregiverRoute = location.pathname.startsWith('/caregiver');
  const isPatientRoute = location.pathname.startsWith('/patient');

  // Hide top consumer navbar on authenticated caregiver dashboard pages so the clinical sidebar takes full height
  if (isCaregiverRoute && location.pathname !== '/caregiver/login') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-11 h-11 rounded-2xl bg-amber-800 flex items-center justify-center text-white shadow-xs group-hover:bg-amber-900 transition-colors">
              <span className="text-xl">🌸</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900">
                  Smriti
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-300 rounded-full">
                  Cognitive Care
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium hidden md:block">
                Your caring memory & wellness companion
              </p>
            </div>
          </Link>

          {/* Right Navigation Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300 text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer"
                aria-expanded={langDropdownOpen}
                aria-label="Select Language"
              >
                <Globe className="w-4 h-4 text-stone-600" />
                <span>{currentLanguage.name.split(' ')[0]}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {langDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-stone-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setLangDropdownOpen(false)}
                >
                  <div className="px-4 py-2 text-xs font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100">
                    Regional Languages (NER)
                  </div>
                  {regionalLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setCurrentLanguage(lang);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${
                        currentLanguage.code === lang.code
                          ? 'bg-amber-50 text-amber-900 font-bold'
                          : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span>{lang.name}</span>
                      <span className="text-xs text-stone-500 font-normal italic">
                        {lang.greeting.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Caregiver Portal Controls */}
            {isCaregiverRoute ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 text-xs font-bold">
                  <HeartHandshake className="w-3.5 h-3.5 text-amber-800" />
                  <span>Caregiver Mode</span>
                </div>
                <button
                  onClick={() => {
                    logoutCaregiver();
                    navigate('/');
                  }}
                  title="Sign out & Return to Patient Screen"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-semibold border border-stone-200 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : isPatientRoute && isPatientLoggedIn ? (
              /* Patient Logged In Status */
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs sm:text-sm font-bold shadow-2xs">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  <span className="truncate max-w-[120px]">{activePatient?.name?.split(' ')[0] || 'Elder'}</span>
                </div>
                <button
                  onClick={() => {
                    logoutPatient();
                    navigate('/');
                  }}
                  title="Switch User"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-semibold border border-stone-200 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit</span>
                </button>
              </div>
            ) : (
              /* Unobtrusive Caregiver Portal Shortcut on Login/Landing */
              <Link
                to="/caregiver/login"
                className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-xl text-stone-500 hover:text-stone-900 text-xs font-semibold hover:bg-stone-100 border border-transparent hover:border-stone-200 transition-all"
              >
                <span>Caregiver Access →</span>
              </Link>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
