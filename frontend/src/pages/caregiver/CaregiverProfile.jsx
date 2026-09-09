import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import CaregiverLayout from '../../components/caregiver/CaregiverLayout';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  LogOut, 
  Users,
  ChevronRight,
  ArrowLeft,
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trash2,
  AlertTriangle,
  Loader2,
  X
} from 'lucide-react';
import { updateCaregiverProfileApi } from '../../services/api';

export default function CaregiverProfile() {
  const navigate = useNavigate();
  const { caregiverUser, setCaregiverPassword, registerCaregiverBiometric, logoutCaregiver, deleteCaregiverAccount, patients } = useApp();

  const [backupPassword, setBackupPassword] = useState('');
  const [settingsStatus, setSettingsStatus] = useState(''); // 'saving' | 'saved' | 'error' | ''
  const [settingsMsg, setSettingsMsg] = useState('');

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteStatus, setDeleteStatus] = useState('idle'); // 'idle' | 'deleting' | 'error'
  const [deleteErrorMsg, setDeleteErrorMsg] = useState('');

  // Biometric enrollment state
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnrolled, setIsBiometricEnrolled] = useState(() => {
    const caregiverId = caregiverUser?.id || caregiverUser?._id || caregiverUser?.email || 'default';
    const prompted = localStorage.getItem(`smriti_caregiver_bio_prompted_${caregiverId}`);
    return caregiverUser?.hasBiometric === true || prompted === 'enrolled' || !!localStorage.getItem('smriti_caregiver_bio_credId');
  });
  const [bioStatus, setBioStatus] = useState(''); // '' | 'enrolling' | 'success' | 'error'
  const [bioMsg, setBioMsg] = useState('');

  // Check WebAuthn platform authenticator support on component mount
  useEffect(() => {
    const checkBiometrics = async () => {
      if (window.PublicKeyCredential && typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setIsBiometricAvailable(!!available);
        } catch {
          setIsBiometricAvailable(false);
        }
      } else {
        setIsBiometricAvailable(false);
      }
    };
    checkBiometrics();
  }, []);

  const handleEnrollBiometric = async () => {
    try {
      setBioStatus('enrolling');
      setBioMsg('Please scan your fingerprint sensor or verify with Face ID / Windows Hello on your device...');

      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn / Biometric authentication is not supported in this browser environment.');
      }

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const userIdStr = caregiverUser?._id || caregiverUser?.id || 'care-1';
      const userId = new TextEncoder().encode(userIdStr.padEnd(16, '0').slice(0, 32));

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'Smriti Clinical Companion', id: window.location.hostname },
          user: {
            id: userId,
            name: caregiverUser?.email || 'dr.ananya@smriti.in',
            displayName: caregiverUser?.name || 'Dr. Ananya Sharma'
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },
            { alg: -257, type: 'public-key' }
          ],
          authenticatorSelection: {
            userVerification: 'preferred',
            residentKey: 'preferred'
          },
          timeout: 60000
        }
      });

      if (credential && credential.id) {
        if (registerCaregiverBiometric) {
          await registerCaregiverBiometric(credential.id);
        }
        const caregiverId = caregiverUser?.id || caregiverUser?._id || caregiverUser?.email || 'default';
        localStorage.setItem(`smriti_caregiver_bio_prompted_${caregiverId}`, 'enrolled');
        localStorage.setItem('smriti_caregiver_bio_email', caregiverUser?.email || '');
        localStorage.setItem('smriti_caregiver_bio_credId', credential.id);
        setIsBiometricEnrolled(true);
        setBioStatus('success');
        setBioMsg('✓ Biometric credential (Fingerprint / Face ID) successfully saved! You can now log into the clinician portal in 1 touch.');
        setTimeout(() => {
          setBioStatus('');
        }, 5000);
      }
    } catch (err) {
      console.warn('Caregiver biometric setup error:', err.message);
      setBioStatus('error');
      setBioMsg(err.message || 'Biometric authentication was cancelled or could not be completed on this device.');
      setTimeout(() => {
        setBioStatus('');
      }, 5000);
    }
  };

  const handleSaveBackupPassword = async (e) => {
    e.preventDefault();
    if (!backupPassword || backupPassword.length < 4) {
      setSettingsMsg('Password must be at least 4 characters');
      setSettingsStatus('error');
      return;
    }

    try {
      setSettingsStatus('saving');
      await setCaregiverPassword(backupPassword);
      setSettingsStatus('saved');
      setSettingsMsg('✓ Backup password successfully updated! You can now log in with either Google or your email and password.');
      setBackupPassword('');
      setTimeout(() => {
        setSettingsStatus('');
        setSettingsMsg('');
      }, 4000);
    } catch (err) {
      setSettingsStatus('error');
      setSettingsMsg(err.message || 'Failed to update password');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      setDeleteErrorMsg('Please type DELETE in capital letters to confirm.');
      return;
    }

    try {
      setDeleteStatus('deleting');
      setDeleteErrorMsg('');
      await deleteCaregiverAccount();
      navigate('/caregiver/login', { replace: true });
    } catch (err) {
      setDeleteStatus('error');
      setDeleteErrorMsg(err.message || 'Failed to delete account. Please try again.');
    }
  };

  return (
    <CaregiverLayout>
      <div className="space-y-8 max-w-4xl">
        
        {/* Navigation Breadcrumb */}
        <div>
          <button
            onClick={() => navigate('/caregiver')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>← Back to Patients Roster</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* 1. CAREGIVER PROFILE HEADER                              */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-700 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center shrink-0 shadow-md shadow-teal-950/20">
              {caregiverUser?.name ? caregiverUser.name.charAt(0) : 'D'}
            </div>
            
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {caregiverUser?.name || 'Dr. Ananya Sharma'}
                </h1>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 capitalize">
                  {caregiverUser?.role || 'Clinician'}
                </span>
                {caregiverUser?.googleAuth && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    Google Linked
                  </span>
                )}
              </div>
              
              <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{caregiverUser?.email || 'dr.ananya@smriti.in'}</span>
              </p>
              
              <p className="text-xs text-slate-400">
                Smriti Clinical ID: <strong className="text-slate-600 font-mono">CLN-{caregiverUser?._id ? caregiverUser._id.slice(-6).toUpperCase() : '849201'}</strong>
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => {
                logoutCaregiver();
                navigate('/');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Portal</span>
            </button>
          </div>

        </div>

        {/* ======================================================== */}
        {/* 2. AUTHENTICATION & SECURITY SETTINGS                    */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
          
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Authentication & Backup Password
              </h2>
              <p className="text-xs text-slate-500">
                Manage your account credentials and hybrid login methods
              </p>
            </div>
          </div>

          {/* Auth Method Overview */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>Primary Sign-In Method:</span>
              <span className="text-teal-800 font-black">
                {caregiverUser?.googleAuth ? 'Google Single Sign-On (OAuth)' : 'Email & Password'}
              </span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              {caregiverUser?.googleAuth
                ? 'Your account is linked to your Google identity. Setting a backup password enables you to sign in using either Google or your email address with a traditional password.'
                : 'Your account uses standard email and password authentication. You can update your password at any time below.'}
            </p>
          </div>

          {/* Set / Update Password Form */}
          <form onSubmit={handleSaveBackupPassword} className="space-y-4 text-xs max-w-lg">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                {caregiverUser?.hasPassword ? 'Update Account Password' : 'Set New Backup Password'}
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  required
                  value={backupPassword}
                  onChange={(e) => setBackupPassword(e.target.value)}
                  placeholder="Enter new password (min 4 characters)"
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-700 text-slate-900 font-medium text-xs sm:text-sm"
                />
                <button
                  type="submit"
                  disabled={settingsStatus === 'saving' || !backupPassword}
                  className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white font-bold transition-all shadow-xs cursor-pointer shrink-0"
                >
                  {settingsStatus === 'saving' ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </div>

            {settingsMsg && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${
                settingsStatus === 'saved' 
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' 
                  : 'bg-rose-50 text-rose-900 border border-rose-300'
              }`}>
                {settingsMsg}
              </div>
            )}
          </form>

        </div>

        {/* ======================================================== */}
        {/* 2b. BIOMETRIC CREDENTIALS & FAST LOGIN                   */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-100">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Caregiver Biometric Authentication
                </h2>
                <p className="text-xs text-slate-500">
                  Configure hardware fingerprint sensor, Touch ID, Face ID, or Windows Hello for 1-touch sign-in
                </p>
              </div>
            </div>

            <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
              isBiometricEnrolled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}>
              {isBiometricEnrolled ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Enrolled & Active</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Not Configured</span>
                </>
              )}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-sm">
                  {isBiometricEnrolled ? 'Biometric Passkey Configured' : 'Enable 1-Touch Fingerprint / Face ID'}
                </p>
                <p className="text-slate-500 text-xs leading-relaxed max-w-xl">
                  {isBiometricEnrolled
                    ? 'Your biometric passkey is linked. You can click "Fingerprint / Face Unlock" on the login screen to sign in instantly without typing passwords.'
                    : 'Register your device’s fingerprint scanner, Touch ID, or Face ID to access the clinician portal with a single touch.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleEnrollBiometric}
                disabled={bioStatus === 'enrolling'}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer shrink-0 ${
                  bioStatus === 'enrolling'
                    ? 'bg-teal-700 text-white opacity-80 cursor-wait'
                    : isBiometricEnrolled
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                    : 'bg-teal-800 hover:bg-teal-900 text-white ring-2 ring-teal-700/20'
                }`}
              >
                {bioStatus === 'enrolling' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Sensor...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4" />
                    <span>{isBiometricEnrolled ? 'Re-enroll / Update Sensor' : 'Set Up Biometric'}</span>
                  </>
                )}
              </button>
            </div>

            {bioMsg && (
              <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                bioStatus === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                  : bioStatus === 'enrolling'
                  ? 'bg-cyan-50 text-cyan-900 border border-cyan-300 animate-pulse'
                  : 'bg-rose-50 text-rose-900 border border-rose-300'
              }`}>
                {bioStatus === 'enrolling' && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
                {bioStatus === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                {bioStatus === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                <span>{bioMsg}</span>
              </div>
            )}
          </div>

        </div>

        {/* ======================================================== */}
        {/* 3. ASSIGNED PATIENTS ROSTER SUMMARY                      */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-5">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-100">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Assigned Patient Cases ({patients.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Patients currently registered under your clinical supervision
                </p>
              </div>
            </div>

            <Link
              to="/caregiver"
              className="text-xs font-bold text-teal-800 hover:text-teal-950 inline-flex items-center gap-1"
            >
              <span>View Full Directory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Patients Read-Only Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {patients.map((patient) => {
              const completedCount = patient.todayReminders?.filter(r => r.status === 'completed' || r.acknowledged === true).length || 0;
              const totalCount = patient.todayReminders?.length || 10;

              return (
                <div
                  key={patient.id}
                  onClick={() => navigate(`/caregiver/patient/${patient.id}`)}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-teal-600/40 hover:shadow-sm transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={patient.avatar}
                      alt={patient.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-900 truncate">
                        {patient.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {patient.age}y • {patient.location.split(',')[0]}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] bg-teal-50 text-teal-800 px-2 py-0.2 rounded font-bold border border-teal-200">
                          {patient.cognitiveStage || 'Tier 1'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {completedCount}/{totalCount} Done
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-slate-400 group-hover:text-teal-800 text-xs font-bold shrink-0">
                    →
                  </span>
                </div>
              );
            })}
          </div>

        </div>

        {/* ======================================================== */}
        {/* 4. DATA GOVERNANCE & DPDP ACT (2023) COMPLIANCE          */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-teal-50 text-teal-800 border border-teal-100 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Clinical Data Governance & Privacy Policy
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
                    DPDP 2023 Compliant
                  </span>
                </div>
                <p className="text-xs text-slate-500 max-w-xl">
                  Smriti adheres to India's Digital Personal Data Protection Act (2023). All patient records, memory vault photos, and adherence metrics are encrypted at rest with strict role-based access.
                </p>
              </div>
            </div>

            <Link
              to="/privacy-policy"
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
            >
              <span>📜 View Complete Privacy Policy</span>
            </Link>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 5. DANGER ZONE: DELETE CARETAKER ACCOUNT & PROFILE        */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-rose-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 shrink-0">
                <Trash2 className="w-6 h-6 text-rose-700" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-rose-950">
                    Delete Caretaker Account
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                    Irreversible
                  </span>
                </div>
                <p className="text-xs text-slate-500 max-w-xl">
                  Permanently delete your caretaker profile and all associated patient accounts, daily routines, game history, and photo vaults. Once deleted, this clinical data cannot be recovered.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(true);
                setDeleteConfirmText('');
                setDeleteErrorMsg('');
                setDeleteStatus('idle');
              }}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete My Account</span>
            </button>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL: DELETE ACCOUNT CONFIRMATION DIALOG                */}
      {/* ======================================================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-rose-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 relative">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200 shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  Delete Caretaker Account?
                </h3>
                <p className="text-xs text-slate-500">
                  This action is permanent and cannot be undone
                </p>
              </div>
            </div>

            <div className="bg-rose-50/70 border border-rose-200/90 rounded-2xl p-4 text-xs text-rose-900 space-y-2 leading-relaxed">
              <p className="font-semibold">
                By deleting your account ({caregiverUser?.email || 'this account'}), the following will be permanently erased:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-800">
                <li>Your caregiver profile, login credentials & biometric keys</li>
                <li>All {patients.length} patient profile(s) assigned to you</li>
                <li>All scheduled reminders, medication logs & alerts</li>
                <li>All cognitive memory bank photos & game session history</li>
              </ul>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-800">
                Type <span className="font-black text-rose-700">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => {
                  setDeleteConfirmText(e.target.value);
                  if (deleteErrorMsg) setDeleteErrorMsg('');
                }}
                placeholder="Type DELETE"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:border-rose-600 focus:bg-white text-slate-900 font-bold tracking-widest text-center text-sm shadow-inner"
              />
            </div>

            {deleteErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{deleteErrorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteStatus === 'deleting'}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE' || deleteStatus === 'deleting'}
                className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {deleteStatus === 'deleting' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting Account...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </CaregiverLayout>
  );
}
