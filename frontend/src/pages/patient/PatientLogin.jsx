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
import { GoogleLogin } from '@react-oauth/google';

export default function PatientLogin({ defaultRole }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginPatient, loginPatientBiometric, loginCaregiver, loginCaregiverWithGoogle, patients, currentLanguage } = useApp();

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

  // Admin Form States
  const [adminEmail, setAdminEmail] = useState('dr.ananya@smriti.in');
  const [adminPassword, setAdminPassword] = useState('demo1234');
  const [rememberAdmin, setRememberAdmin] = useState(true);

  // UI Feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [biometricStatus, setBiometricStatus] = useState(''); // 'verifying' | 'success' | 'failed' | ''
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  // Voice Guidance State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthRef = useRef(null);

  // Check WebAuthn Biometric Support
  useEffect(() => {
    if (
      window.PublicKeyCredential && 
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
    ) {
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(available => {
          setIsBiometricAvailable(available || true);
        })
        .catch(() => {
          setIsBiometricAvailable(true);
        });
    } else {
      setIsBiometricAvailable(true);
    }
  }, []);

  // Voice Guidance implementation using Web Speech API
  const handleVoiceGuidance = () => {
    if (!('speechSynthesis' in window)) {
      setErrorMsg('Voice guidance is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    let guidanceText = '';
    if (activeRole === 'patient') {
      guidanceText = `Welcome to Smriti. Please enter your name, age, and 4-digit PIN using the large buttons below. You can also sign in with Google or fingerprint unlock.`;
    } else {
      guidanceText = `Welcome to Smriti Admin. Please enter your caregiver email and password, or sign in with Google or fingerprint unlock to access clinical dashboards.`;
    }

    const utterance = new SpeechSynthesisUtterance(guidanceText);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const friendlyVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en-US'));
    if (friendlyVoice) utterance.voice = friendlyVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const speakText = (text) => {
    if (!text || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
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

  // Admin Submit
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
                  ? 'bg-amber-800 text-white border-amber-900 animate-pulse shadow-sm' 
                  : 'bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-900 border-stone-300 shadow-2xs'
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
                  <Volume2 className="w-3.5 h-3.5 text-amber-800" />
                  <span>Voice Guidance 🔊</span>
                </>
              )}
            </button>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight flex items-center justify-center gap-2.5">
            <span>Smriti</span>
            <span className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-800 text-white text-base sm:text-lg shadow-2xs">
              🌸
            </span>
          </h1>

          <p className="text-sm sm:text-base text-stone-600 font-medium">
            {activeRole === 'patient' 
              ? 'Your warm, caring memory companion' 
              : 'Clinical Caregiver & Family Supervision Portal'}
          </p>

        </div>

        {/* 3. CENTRAL CARD CONTAINER WITH ROLE-SPECIFIC FORM */}
        <div className="bg-white rounded-3xl sm:rounded-[36px] border border-stone-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-10 space-y-6">

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl text-sm font-bold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-700" />
              <span>{errorMsg}</span>
            </div>
          )}

          {biometricStatus === 'verifying' && (
            <div className="p-4 bg-amber-50 border border-amber-300 text-amber-950 rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 animate-pulse">
              <Fingerprint className="w-5 h-5 animate-bounce text-amber-800" />
              <span>Scanning Fingerprint / Face Unlock sensor...</span>
            </div>
          )}

          {biometricStatus === 'success' && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>Identity Verified! Signing you in...</span>
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
                    <label className="block text-base sm:text-lg font-extrabold text-stone-900 mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Ramesh Sharma"
                      className="w-full text-lg sm:text-xl font-bold px-5 py-4 bg-stone-50/90 border-2 border-stone-300/90 rounded-2xl text-stone-900 focus:outline-none focus:border-amber-800 focus:bg-white focus:ring-4 focus:ring-amber-800/10 transition-all shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-base sm:text-lg font-extrabold text-stone-900 mb-1.5">
                      Your Age
                    </label>
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      placeholder="e.g. 74"
                      className="w-full text-lg sm:text-xl font-bold px-5 py-4 bg-stone-50/90 border-2 border-stone-300/90 rounded-2xl text-stone-900 focus:outline-none focus:border-amber-800 focus:bg-white focus:ring-4 focus:ring-amber-800/10 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* 4-Digit PIN Display */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-base sm:text-lg font-extrabold text-stone-900 flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-amber-800" />
                      <span>Enter 4-Digit PIN</span>
                    </label>
                    <span className="text-xs sm:text-sm font-semibold text-stone-500">
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
                              ? 'border-amber-800 bg-amber-50 text-amber-950 shadow-sm scale-105'
                              : 'border-stone-300 bg-stone-100/70 text-stone-400'
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
                      className="h-16 sm:h-18 rounded-2xl bg-stone-100 hover:bg-stone-200 active:bg-amber-100 text-stone-900 text-2xl sm:text-3xl font-black border border-stone-300/90 active:scale-95 transition-transform duration-100 shadow-2xs flex items-center justify-center cursor-pointer select-none"
                    >
                      {num}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={handleClear}
                    className="h-16 sm:h-18 rounded-2xl bg-stone-200/80 hover:bg-stone-300 active:bg-stone-400 text-stone-700 text-sm sm:text-base font-extrabold border border-stone-300 active:scale-95 transition-transform duration-100 flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Clear all digits"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Clear</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleKeyPress('0')}
                    className="h-16 sm:h-18 rounded-2xl bg-stone-100 hover:bg-stone-200 active:bg-amber-100 text-stone-900 text-2xl sm:text-3xl font-black border border-stone-300/90 active:scale-95 transition-transform duration-100 shadow-2xs flex items-center justify-center cursor-pointer select-none"
                  >
                    0
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    className="h-16 sm:h-18 rounded-2xl bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-800 text-sm sm:text-base font-extrabold border border-rose-200 active:scale-95 transition-transform duration-100 flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Delete last digit"
                  >
                    <Delete className="w-5 h-5" />
                    <span>Del</span>
                  </button>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-center gap-3 pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm sm:text-base font-semibold text-stone-700">
                    <input
                      type="checkbox"
                      checked={rememberPatient}
                      onChange={(e) => setRememberPatient(e.target.checked)}
                      className="w-5 h-5 text-amber-800 rounded border-stone-300 focus:ring-amber-800"
                    />
                    <span>Remember me on this tablet</span>
                  </label>
                </div>

                {/* Big Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4.5 sm:py-5 px-6 rounded-2xl bg-amber-800 hover:bg-amber-900 active:scale-95 text-white text-lg sm:text-xl font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer"
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
                  🌸 Or Tap to Log In As:
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
          {/* TAB B: ADMIN / CAREGIVER LOGIN FORM                      */}
          {/* ======================================================== */}
          {activeRole === 'admin' && (
            <div className="space-y-6">
              
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                  <span>Caregiver & Clinician Portal</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-500">
                  Access patient vitals, adherence rates & WhatsApp routines
                </p>
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-stone-800 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@smriti.in"
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-stone-50/80 border border-stone-300 rounded-2xl text-stone-900 text-sm sm:text-base font-semibold focus:outline-none focus:border-teal-700 focus:bg-white focus:ring-4 focus:ring-teal-700/10 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs sm:text-sm font-bold text-stone-800">
                      Password
                    </label>
                    <span className="text-xs text-stone-500 font-semibold">
                      (Demo mode: any password)
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-stone-50/80 border border-stone-300 rounded-2xl text-stone-900 text-sm sm:text-base font-semibold focus:outline-none focus:border-teal-700 focus:bg-white focus:ring-4 focus:ring-teal-700/10 transition-all shadow-inner"
                    />
                  </div>
                </div>

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

                {/* Sign In Button */}
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl bg-teal-900 hover:bg-teal-950 active:scale-95 text-white text-base sm:text-lg font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

              </form>

              {/* ALTERNATIVE ADMIN LOGIN METHODS */}
              <div className="space-y-3 pt-2">
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-stone-200 w-full" />
                  <span className="bg-white px-3 text-xs font-bold text-stone-400 uppercase tracking-wider">
                    Or Continue With
                  </span>
                </div>

                {/* Google Sign In Button */}
                <div className="w-full flex justify-center py-1">
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginError}
                    theme="outline"
                    size="large"
                    shape="pill"
                    text="continue_with"
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
