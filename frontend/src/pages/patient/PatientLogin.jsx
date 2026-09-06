import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  UserRound, 
  HeartHandshake, 
  Delete, 
  RotateCcw, 
  ArrowRight, 
  KeyRound, 
  Mail, 
  Lock, 
  Fingerprint, 
  Volume2, 
  VolumeX, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import FoxtailOrchidIcon from '../../components/FoxtailOrchidIcon';
import { GoogleLogin } from '@react-oauth/google';
import { speakLocalized, stopSpeech } from '../../utils/speechUtils';

export default function PatientLogin({ defaultRole }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginPatient, loginPatientBiometric, loginCaregiver, loginCaregiverWithGoogle, signupCaregiver, patients, currentLanguage } = useApp();

  // Role toggle: 'patient' | 'admin'
  const [activeRole, setActiveRole] = useState(() => {
    if (defaultRole) return defaultRole;
    return location.pathname.includes('caregiver') || location.search.includes('role=admin') 
      ? 'admin' 
      : 'patient';
  });

  // Patient Form States
  const [patientName, setPatientName] = useState('Ramesh Sharma');
  const [patientAge, setPatientAge] = useState('74');
  const [pin, setPin] = useState('');
  const [rememberPatient, setRememberPatient] = useState(true);

  // Admin Form States (Login & Signup)
  const [isCaregiverSignup, setIsCaregiverSignup] = useState(false);
  const [adminEmail, setAdminEmail] = useState('dr.ananya@smriti.in');
  const [adminPassword, setAdminPassword] = useState('caregiver123');
  const [rememberAdmin, setRememberAdmin] = useState(true);
  const [signupName, setSignupName] = useState('');
  const [signupRole, setSignupRole] = useState('clinician');
  const [signupContact, setSignupContact] = useState('');

  // UI Feedback States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [biometricScanning, setBiometricScanning] = useState(false);

  // Check WebAuthn support
  useEffect(() => {
    if (window.PublicKeyCredential) {
      setIsBiometricAvailable(true);
    }
  }, []);

  // Voice Guidance implementation using Web Speech API
  const handleVoiceGuidance = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }

    const isHindi = (currentLanguage?.code || '').startsWith('hi');
    const isAssamese = (currentLanguage?.code || '').startsWith('as');

    let guidanceText = '';
    if (isHindi) {
      if (activeRole === 'patient') {
        guidanceText = 'स्मृति में आपका स्वागत है। कृपया नीचे दिए गए बड़े बटनों का उपयोग करके अपना नाम, उम्र और 4-अंकों का पिन दर्ज करें। आप बायोमेट्रिक या गूगल से भी साइन इन कर सकते हैं।';
      } else {
        guidanceText = 'स्मृति एडमिन में आपका स्वागत है। कृपया क्लिनिकल डैशबोर्ड तक पहुंचने के लिए अपना ईमेल और पासवर्ड दर्ज करें।';
      }
    } else if (isAssamese) {
      guidanceText = 'স্মৃতিত আপোনাক স্বাগতম। অনুগ্ৰহ কৰি তলৰ ডাঙৰ বুটামবোৰ ব্যৱহাৰ কৰি আপোনাৰ নাম আৰু ৪-অংকৰ পিন প্ৰৱেশ কৰক।';
    } else {
      if (activeRole === 'patient') {
        guidanceText = 'Welcome to Smriti. Please enter your name, age, and 4-digit PIN using the large buttons below. You can also sign in with Google or fingerprint unlock.';
      } else {
        guidanceText = 'Welcome to Smriti Admin. Please enter your caregiver email and password, or sign in with Google or fingerprint unlock to access clinical dashboards.';
      }
    }

    speakLocalized({
      text: guidanceText,
      langCode: currentLanguage?.code || 'en',
      rate: 0.9,
      pitch: 1.0,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
      onNotice: (notice) => {
        setErrorMsg(notice);
        setTimeout(() => setErrorMsg(''), 4000);
      }
    });
  };

  const speakText = (text) => {
    speakLocalized({
      text,
      langCode: currentLanguage?.code || 'en',
      rate: 0.9,
      pitch: 1.0
    });
  };

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [activeRole]);

  // Keypad Handlers
  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setErrorMsg('');
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  // Patient Submit
  const handlePatientSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!patientName.trim()) {
      setErrorMsg('Please enter your name');
      return;
    }
    if (pin.length < 4) {
      setErrorMsg('Please enter a 4-digit PIN on the keypad');
      return;
    }

    try {
      await loginPatient(patientName, patientAge, pin, rememberPatient);
      navigate('/patient');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    }
  };

  // Admin Submit (Login)
  const handleAdminSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    const email = adminEmail.trim();
    if (!email) {
      setErrorMsg('Please enter your email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    if (!adminPassword) {
      setErrorMsg('Please enter your password');
      return;
    }
    try {
      await loginCaregiver(email, adminPassword);
      navigate('/caregiver');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password');
    }
  };

  // Admin / Caregiver Signup
  const handleCaregiverSignup = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    if (!signupName.trim() || signupName.trim().length < 2) {
      setErrorMsg('Please enter your full name (at least 2 characters)');
      return;
    }
    const email = adminEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    if (!adminPassword || adminPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    try {
      await signupCaregiver({
        name: signupName.trim(),
        email: email,
        password: adminPassword,
        role: signupRole,
        contact: signupContact.trim()
      });
      navigate('/caregiver');
    } catch (err) {
      setErrorMsg(err.message || 'Signup failed. Please try again.');
    }
  };

  // Real Google Sign-In Handlers
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setErrorMsg('');
    try {
      if (!credentialResponse?.credential) {
        throw new Error('No Google credential returned');
      }
      await loginCaregiverWithGoogle(credentialResponse.credential);
      navigate('/caregiver');
    } catch (err) {
      setErrorMsg(err.message || 'Google authentication failed. Please try again.');
    }
  };

  const handleGoogleLoginError = () => {
    setErrorMsg('Google Sign-In was cancelled or failed. Please check your network or try again.');
  };

  // WebAuthn Native Biometric Login (Feature 2)
  const handleBiometricAuth = async () => {
    setErrorMsg('');
    setBiometricStatus('verifying');

    try {
      if (window.PublicKeyCredential && navigator.credentials) {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        let credential = null;
        try {
          credential = await navigator.credentials.get({
            publicKey: {
              challenge,
              timeout: 60000,
              userVerification: 'preferred'
            }
          });
        } catch (getErr) {
          // If no existing credential found on browser yet, prompt sensor
          const dummyUserId = new Uint8Array(16);
          window.crypto.getRandomValues(dummyUserId);
          credential = await navigator.credentials.create({
            publicKey: {
              challenge,
              rp: { name: 'Smriti Memory Companion', id: window.location.hostname },
              user: {
                id: dummyUserId,
                name: patientName,
                displayName: patientName
              },
              pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
              authenticatorSelection: { userVerification: 'preferred' },
              timeout: 60000
            }
          });
        }

        setBiometricStatus('success');
        const credId = credential?.id || 'webauthn-sensor-touch';
        await loginPatientBiometric(credId, null, patientName);
        speakText(`Welcome back, ${patientName}! Your fingerprint was recognized.`);
        setTimeout(() => {
          navigate('/patient');
        }, 600);
      }
    } catch (err) {
      console.warn('Biometric auth error:', err.message);
      setBiometricStatus('');
      setErrorMsg('Biometrics canceled. You can sign in using your PIN or password below.');
    }
  };

  const handleQuickSelectPatient = (p) => {
    setPatientName(p.name);
    setPatientAge((p.age || 74).toString());
    setPin('1234');
    loginPatient(p.name, p.age, '1234', true);
    navigate('/patient');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAF7F2] py-8 sm:py-14 px-4 sm:px-6 flex flex-col items-center justify-center">
      
      <div className="max-w-xl w-full space-y-6">

        {/* 1. TOP ROLE SELECTION BUTTONS (SEGMENTED TABS) */}
        <div className="w-full bg-stone-200/80 p-1.5 rounded-3xl flex items-center justify-between shadow-inner border border-stone-300/80 backdrop-blur-xs">
          
          <button
            type="button"
            onClick={() => {
              setActiveRole('patient');
              setErrorMsg('');
              setBiometricStatus('');
            }}
            className={`flex-1 py-3 sm:py-3.5 px-4 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer ${
              activeRole === 'patient'
                ? 'bg-amber-800 text-white shadow-md scale-[1.02]'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-300/60 font-bold'
            }`}
          >
            <UserRound className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Patient Portal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole('admin');
              setErrorMsg('');
              setBiometricStatus('');
            }}
            className={`flex-1 py-3 sm:py-3.5 px-4 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer ${
              activeRole === 'admin'
                ? 'bg-teal-900 text-white shadow-md scale-[1.02]'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-300/60 font-bold'
            }`}
          >
            <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Caregiver / Admin</span>
          </button>

        </div>

        {/* 2. SMRITI APP BRANDING & VOICE GUIDANCE HEADER */}
        <div className="text-center space-y-2">
          
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleVoiceGuidance}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                isSpeaking 
                  ? 'bg-[#B5502E] text-white border-[#B5502E] animate-pulse shadow-xs' 
                  : 'bg-white hover:bg-[#FDF6F0] text-[#2B2B2B] hover:text-[#B5502E] border-[#E5E0D8] shadow-2xs'
              }`}
              title="Listen to instructions aloud"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Speaking (Tap to Stop)</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#B5502E]" />
                  <span>Voice Guidance 🔊</span>
                </>
              )}
            </button>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#2B2B2B] tracking-tight flex items-center justify-center gap-2.5">
            <span>Smriti</span>
            <span className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#B5502E] text-white text-base sm:text-lg shadow-2xs">
              <FoxtailOrchidIcon className="w-5 h-5 text-white" />
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#6B6B6B] font-medium">
            {activeRole === 'patient' 
              ? 'Your warm, caring memory companion' 
              : 'Clinical Caregiver & Family Supervision Portal'}
          </p>

        </div>

        {/* 3. CENTRAL CARD CONTAINER WITH ROLE-SPECIFIC FORM */}
        <div className="bg-white rounded-3xl sm:rounded-[36px] border border-[#E5E0D8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-10 space-y-6">

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-4 bg-[#FDF2F2] border border-[#F5B7B1] text-[#C0392B] rounded-2xl text-sm font-bold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-[#C0392B]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB A: PATIENT LOGIN FORM                                */}
          {/* ======================================================== */}
          {activeRole === 'patient' && (
            <div className="space-y-6">
              
              <form onSubmit={handlePatientSubmit} className="space-y-5">
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-base sm:text-lg font-extrabold text-[#2B2B2B] mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Ramesh Sharma"
                      className="w-full text-lg sm:text-xl font-bold px-5 py-4 bg-[#FAF7F2] border-2 border-[#E5E0D8] rounded-2xl text-[#2B2B2B] focus:outline-none focus:border-[#B5502E] focus:bg-white transition-all shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-base sm:text-lg font-extrabold text-[#2B2B2B] mb-1.5">
                      Your Age
                    </label>
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      placeholder="e.g. 74"
                      className="w-full text-lg sm:text-xl font-bold px-5 py-4 bg-[#FAF7F2] border-2 border-[#E5E0D8] rounded-2xl text-[#2B2B2B] focus:outline-none focus:border-[#B5502E] focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* 4-Digit PIN Display */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-base sm:text-lg font-extrabold text-[#2B2B2B] flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-[#B5502E]" />
                      <span>Enter 4-Digit PIN</span>
                    </label>
                    <span className="text-xs sm:text-sm font-semibold text-[#6B6B6B]">
                      (Demo PIN: 1234)
                    </span>
                  </div>

                  {/* PIN Bubbles */}
                  <div className="flex justify-center gap-3.5 sm:gap-4 py-2">
                    {[0, 1, 2, 3].map((idx) => {
                      const digit = pin[idx];
                      return (
                        <div
                          key={idx}
                          className={`w-14 h-16 sm:w-16 sm:h-18 rounded-2xl border-2 flex items-center justify-center text-3xl sm:text-4xl font-black transition-all duration-150 ${
                            digit
                              ? 'border-[#B5502E] bg-[#FDF6F0] text-[#B5502E] shadow-xs scale-105'
                              : 'border-[#E5E0D8] bg-stone-100/70 text-stone-400'
                          }`}
                        >
                          {digit ? '•' : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Large Touch Keypad with Satisfying Tap Feedback */}
                <div className="grid grid-cols-3 gap-3 sm:gap-3.5 max-w-xs sm:max-w-sm mx-auto pt-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleKeyPress(num.toString())}
                      className="h-16 sm:h-18 rounded-2xl bg-stone-100 hover:bg-stone-200 active:bg-[#FDF6F0] text-[#2B2B2B] text-2xl sm:text-3xl font-black border border-[#E5E0D8] active:scale-95 transition-transform duration-100 shadow-2xs flex items-center justify-center cursor-pointer select-none"
                    >
                      {num}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={handleClear}
                    className="h-16 sm:h-18 rounded-2xl bg-stone-200/80 hover:bg-stone-300 text-[#2B2B2B] text-sm sm:text-base font-extrabold border border-[#E5E0D8] active:scale-95 transition-transform duration-100 flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Clear all digits"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Clear</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleKeyPress('0')}
                    className="h-16 sm:h-18 rounded-2xl bg-stone-100 hover:bg-stone-200 active:bg-[#FDF6F0] text-[#2B2B2B] text-2xl sm:text-3xl font-black border border-[#E5E0D8] active:scale-95 transition-transform duration-100 shadow-2xs flex items-center justify-center cursor-pointer select-none"
                  >
                    0
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    className="h-16 sm:h-18 rounded-2xl bg-[#FDF2F2] hover:bg-rose-100 active:bg-rose-200 text-[#C0392B] text-sm sm:text-base font-extrabold border border-[#F5B7B1] active:scale-95 transition-transform duration-100 flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Delete last digit"
                  >
                    <Delete className="w-5 h-5" />
                    <span>Del</span>
                  </button>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-center gap-3 pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm sm:text-base font-semibold text-[#6B6B6B]">
                    <input
                      type="checkbox"
                      checked={rememberPatient}
                      onChange={(e) => setRememberPatient(e.target.checked)}
                      className="w-5 h-5 text-[#B5502E] rounded border-[#E5E0D8] focus:ring-[#B5502E]"
                    />
                    <span>Remember me on this device</span>
                  </label>
                </div>

                {/* Big Submit Button (Min 56px) */}
                <button
                  type="submit"
                  className="w-full min-h-[56px] py-4 px-6 rounded-2xl bg-[#B5502E] hover:bg-[#9E4224] active:scale-95 text-white text-lg sm:text-xl font-black shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <span>Enter My Space</span>
                  <ArrowRight className="w-6 h-6" />
                </button>

              </form>

              {/* ALTERNATIVE LOGIN METHODS (Biometric) */}
              <div className="space-y-3 pt-2">
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-stone-200 w-full" />
                  <span className="bg-white px-3 text-xs font-bold text-stone-400 uppercase tracking-wider">
                    Or Sign In Faster
                  </span>
                </div>

                {/* Biometric Button */}
                {isBiometricAvailable && (
                  <button
                    type="button"
                    onClick={handleBiometricAuth}
                    className="w-full py-4 px-5 bg-amber-50/70 hover:bg-amber-100/90 text-amber-950 border-2 border-amber-200/90 font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xs cursor-pointer active:scale-95"
                  >
                    <Fingerprint className="w-6 h-6 text-amber-800" />
                    <span>Use Fingerprint / Face Unlock</span>
                  </button>
                )}
              </div>

              {/* Quick Select Profile Shortcuts */}
              <div className="pt-3 border-t border-stone-200">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider text-center mb-3">
                  Or tap your profile to log in:
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {patients.slice(0, 3).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleQuickSelectPatient(p)}
                      className="p-3 rounded-2xl bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 text-center transition-all cursor-pointer group shadow-2xs"
                    >
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-11 h-11 rounded-full mx-auto object-cover mb-1.5 border border-stone-300 group-hover:scale-105 transition-transform"
                      />
                      <p className="text-xs font-bold text-stone-900 truncate">{p.name.split(' ')[0]}</p>
                      <p className="text-[11px] text-stone-500 font-medium">{p.age} yrs</p>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB B: ADMIN / CAREGIVER LOGIN & SIGNUP FORM             */}
          {/* ======================================================== */}
          {activeRole === 'admin' && (
            <div className="space-y-5">
              
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                  <span>Caregiver & Clinician Portal</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-500">
                  {isCaregiverSignup ? 'Register a new clinician or caregiver profile' : 'Access patient vitals, adherence rates & WhatsApp routines'}
                </p>
              </div>

              {/* Sign In vs Sign Up Tab Switcher */}
              <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsCaregiverSignup(false);
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                    !isCaregiverSignup
                      ? 'bg-white text-teal-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCaregiverSignup(true);
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                    isCaregiverSignup
                      ? 'bg-white text-teal-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Create Account (Sign Up)
                </button>
              </div>

              <form onSubmit={isCaregiverSignup ? handleCaregiverSignup : handleAdminSubmit} className="space-y-4">
                
                {/* Full Name for Signup */}
                {isCaregiverSignup && (
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-stone-800 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <UserRound className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="Dr. Rajesh Baruah / Priya Sharma"
                        required
                        className="w-full pl-11 pr-4 py-3.5 bg-stone-50/80 border border-stone-300 rounded-2xl text-stone-900 text-sm sm:text-base font-semibold focus:outline-none focus:border-teal-700 focus:bg-white focus:ring-4 focus:ring-teal-700/10 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-stone-800 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="caregiver@smriti.in"
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-stone-50/80 border border-stone-300 rounded-2xl text-stone-900 text-sm sm:text-base font-semibold focus:outline-none focus:border-teal-700 focus:bg-white focus:ring-4 focus:ring-teal-700/10 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Role & Contact for Signup */}
                {isCaregiverSignup && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-stone-800 mb-1.5">
                        Role
                      </label>
                      <select
                        value={signupRole}
                        onChange={(e) => setSignupRole(e.target.value)}
                        className="w-full px-3.5 py-3.5 bg-stone-50/80 border border-stone-300 rounded-2xl text-stone-900 text-sm font-semibold focus:outline-none focus:border-teal-700 focus:bg-white"
                      >
                        <option value="clinician">Clinician / Doctor</option>
                        <option value="caregiver">Family Caregiver / Nurse</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-stone-800 mb-1.5">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        value={signupContact}
                        onChange={(e) => setSignupContact(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-3.5 bg-stone-50/80 border border-stone-300 rounded-2xl text-stone-900 text-sm font-semibold focus:outline-none focus:border-teal-700 focus:bg-white shadow-inner"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs sm:text-sm font-bold text-stone-800">
                      Password <span className="text-red-500">*</span>
                    </label>
                    {!isCaregiverSignup && (
                      <span className="text-xs text-stone-500 font-semibold">
                        (Demo mode: any password)
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder={isCaregiverSignup ? 'Min. 6 characters' : '••••••••'}
                      required
                      minLength={isCaregiverSignup ? 6 : 1}
                      className="w-full pl-11 pr-4 py-3.5 bg-stone-50/80 border border-stone-300 rounded-2xl text-stone-900 text-sm sm:text-base font-semibold focus:outline-none focus:border-teal-700 focus:bg-white focus:ring-4 focus:ring-teal-700/10 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {!isCaregiverSignup && (
                  <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-stone-700 font-semibold">
                      <input
                        type="checkbox"
                        checked={rememberAdmin}
                        onChange={(e) => setRememberAdmin(e.target.checked)}
                        className="w-4 h-4 text-teal-800 rounded border-stone-300 focus:ring-teal-800"
                      />
                      <span>Remember this session</span>
                    </label>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl bg-teal-900 hover:bg-teal-950 active:scale-95 text-white text-base sm:text-lg font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <span>{isCaregiverSignup ? 'Create Account & Open Dashboard' : 'Sign In to Dashboard'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

              </form>

              {/* ALTERNATIVE ADMIN LOGIN METHODS */}
              <div className="space-y-3 pt-2">
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-stone-200 w-full" />
                  <span className="bg-white px-3 text-xs font-bold text-stone-400 uppercase tracking-wider whitespace-nowrap">
                    {isCaregiverSignup ? 'Or Sign Up With' : 'Or Sign In With'}
                  </span>
                </div>

                {/* Google Sign In / Sign Up Button (Full Width matching Dashboard submit button) */}
                <div className="w-full flex justify-center py-1 [&>div]:!w-full [&>div>iframe]:!w-full [&_iframe]:!w-full [&_iframe]:!min-w-full [&_iframe]:!max-w-none">
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginError}
                    theme="outline"
                    size="large"
                    shape="rectangular"
                    text={isCaregiverSignup ? 'signup_with' : 'signin_with'}
                    width="100%"
                  />
                </div>

                {/* Biometric Button */}
                {isBiometricAvailable && (
                  <button
                    type="button"
                    onClick={handleBiometricAuth}
                    className="w-full py-3.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded-2xl transition-all flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer active:scale-95"
                  >
                    <Fingerprint className="w-5 h-5 text-teal-800" />
                    <span>Use Fingerprint / Face Unlock</span>
                  </button>
                )}
              </div>

              {/* Quick Demo Logins for Admin */}
              <div className="pt-3 border-t border-stone-200">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider text-center mb-2.5">
                  ⚡ 1-Tap Demo Logins:
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminEmail('dr.ananya@smriti.in');
                      loginCaregiver('dr.ananya@smriti.in', 'demo1234');
                      navigate('/caregiver');
                    }}
                    className="px-3 py-2.5 text-xs font-bold bg-stone-50 hover:bg-teal-50 text-stone-800 hover:text-teal-900 border border-stone-200 rounded-xl text-center transition-colors cursor-pointer shadow-2xs"
                  >
                    Dr. Ananya (Doctor)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminEmail('nurse.david@smriti.in');
                      loginCaregiver('nurse.david@smriti.in', 'demo1234');
                      navigate('/caregiver');
                    }}
                    className="px-3 py-2.5 text-xs font-bold bg-stone-50 hover:bg-teal-50 text-stone-800 hover:text-teal-900 border border-stone-200 rounded-xl text-center transition-colors cursor-pointer shadow-2xs"
                  >
                    David (Caregiver)
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
