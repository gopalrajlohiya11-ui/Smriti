import React, { useState } from 'react';
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
  ArrowLeft, 
  CheckCircle2, 
  Users, 
  ChevronRight, 
  Flame, 
  Fingerprint, 
  Calendar,
  ExternalLink
} from 'lucide-react';

export default function CaregiverProfile() {
  const navigate = useNavigate();
  const { caregiverUser, setCaregiverPassword, logoutCaregiver, patients } = useApp();

  const [backupPassword, setBackupPassword] = useState('');
  const [settingsStatus, setSettingsStatus] = useState(''); // 'saving' | 'saved' | 'error' | ''
  const [settingsMsg, setSettingsMsg] = useState('');

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

      </div>
    </CaregiverLayout>
  );
}
