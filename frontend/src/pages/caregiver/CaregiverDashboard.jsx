import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import CaregiverLayout from '../../components/caregiver/CaregiverLayout';
import { 
  Users, 
  AlertTriangle, 
  Activity, 
  Flame, 
  ChevronRight, 
  Fingerprint, 
  KeyRound, 
  ShieldCheck, 
  UserPlus, 
  X, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Calendar, 
  ArrowUpRight, 
  Check 
} from 'lucide-react';

export default function CaregiverDashboard() {
  const navigate = useNavigate();
  const { 
    caregiverUser, 
    patients, 
    addPatient, 
    registerPatientBiometric, 
    setCaregiverPassword, 
    redFlags 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');

  // Settings / Set Password Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [backupPassword, setBackupPassword] = useState('');
  const [settingsStatus, setSettingsStatus] = useState('');
  const [settingsMsg, setSettingsMsg] = useState('');

  // Biometric Registration State
  const [biometricRegStatus, setBiometricRegStatus] = useState('');

  // Add Patient Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    age: '',
    phone: '',
    gender: 'Male',
    location: 'Guwahati, Assam',
    nativeLanguage: 'Assamese',
    cognitiveStage: 'Early Memory Support',
    emergencyContact: '',
    notes: '',
    webAuthnCredentialId: ''
  });

  // Calculate Summary KPIs
  const totalPatientsCount = patients.length;
  const activeAlertsCount = redFlags.length;

  const avgAdherencePct = useMemo(() => {
    if (patients.length === 0) return 0;
    let totalRoutines = 0;
    let completedRoutines = 0;
    patients.forEach(p => {
      const total = p.todayReminders?.length || 10;
      const done = p.todayReminders?.filter(r => r.status === 'completed' || r.acknowledged === true).length || 0;
      totalRoutines += total;
      completedRoutines += done;
    });
    return totalRoutines > 0 ? Math.round((completedRoutines / totalRoutines) * 100) : 0;
  }, [patients]);

  const bestStreakInfo = useMemo(() => {
    if (patients.length === 0) return { streak: 0, patientName: 'None' };
    let max = 0;
    let name = patients[0]?.name || '';
    patients.forEach(p => {
      const st = p.streakDays || 0;
      if (st >= max) {
        max = st;
        name = p.name;
      }
    });
    return { streak: max, patientName: name };
  }, [patients]);

  // Filtered patients list based on search term
  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) return patients;
    const term = searchTerm.toLowerCase().trim();
    return patients.filter(p => 
      p.name?.toLowerCase().includes(term) ||
      p.location?.toLowerCase().includes(term) ||
      p.nativeLanguage?.toLowerCase().includes(term) ||
      p.cognitiveStage?.toLowerCase().includes(term)
    );
  }, [patients, searchTerm]);

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
      setSettingsMsg('✓ Backup password updated! You can log in using either Google or your email and password.');
      setTimeout(() => {
        setShowSettingsModal(false);
        setSettingsStatus('');
        setSettingsMsg('');
        setBackupPassword('');
      }, 1600);
    } catch (err) {
      setSettingsStatus('error');
      setSettingsMsg(err.message || 'Failed to set password');
    }
  };

  const handleRegisterBiometricForPatient = async (patientId, patientName) => {
    if (!window.PublicKeyCredential || !navigator.credentials?.create) {
      alert('WebAuthn biometric authentication is not supported by this device or browser.');
      return;
    }

    try {
      setBiometricRegStatus('registering');
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'Smriti Memory Companion', id: window.location.hostname },
          user: {
            id: userId,
            name: patientName || 'Patient User',
            displayName: patientName || 'Patient User'
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
        setNewPatientForm(prev => ({ ...prev, webAuthnCredentialId: credential.id }));
        setBiometricRegStatus('success');
      }
    } catch (err) {
      console.warn('Biometric setup cancelled or error:', err.message);
      setBiometricRegStatus('error');
    }
  };

  const handleAddPatientSubmit = async (e) => {
    e.preventDefault();
    if (!newPatientForm.name || !newPatientForm.age) return;

    const created = await addPatient({
      ...newPatientForm,
      age: parseInt(newPatientForm.age, 10),
      avatar: newPatientForm.gender === 'Female' 
        ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80'
    });

    setShowAddModal(false);
    setNewPatientForm({
      name: '',
      age: '',
      phone: '',
      gender: 'Male',
      location: 'Guwahati, Assam',
      nativeLanguage: 'Assamese',
      cognitiveStage: 'Early Memory Support',
      emergencyContact: '',
      notes: '',
      webAuthnCredentialId: ''
    });

    if (created?._id || created?.id) {
      navigate(`/caregiver/patient/${created._id || created.id}`);
    }
  };

  return (
    <CaregiverLayout
      onOpenAddPatient={() => setShowAddModal(true)}
      onOpenSettings={() => setShowSettingsModal(true)}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    >
      <div className="space-y-8">
        
        {/* Page Title & Context */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Patient Roster Overview
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-1">
              Real-time cognitive tracking, adherence metrics, and routine monitoring for your assigned cases.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 font-medium">
              Clinician: <strong className="text-slate-800 font-bold">{caregiverUser?.name || 'Dr. Ananya Sharma'}</strong>
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 1. CLINICAL KPI STATS ROW (4 COMPACT KPI CARDS)          */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Card 1: Total Patients */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                Assigned Patients
              </p>
              <p className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {totalPatientsCount}
              </p>
              <p className="text-[11px] sm:text-xs text-teal-800 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Active clinical monitoring</span>
              </p>
            </div>
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 border border-teal-100">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
            </div>
          </div>

          {/* Card 2: Active Alerts */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                Attention Required
              </p>
              <p className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
                {activeAlertsCount}
              </p>
              <p className={`text-[11px] sm:text-xs font-semibold ${
                activeAlertsCount > 0 ? 'text-rose-800' : 'text-emerald-800'
              }`}>
                {activeAlertsCount > 0 ? 'Overdue routines logged' : 'All routines on track'}
              </p>
            </div>
            <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border ${
              activeAlertsCount > 0 
                ? 'bg-rose-50 text-rose-800 border-rose-200' 
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {activeAlertsCount > 0 ? <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" /> : <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />}
            </div>
          </div>

          {/* Card 3: Avg Today's Adherence */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                Average Adherence
              </p>
              <p className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {avgAdherencePct}%
              </p>
              <p className="text-[11px] sm:text-xs text-teal-800 font-semibold flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                <span>Today's routine rate</span>
              </p>
            </div>
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-cyan-50 text-cyan-800 flex items-center justify-center shrink-0 border border-cyan-100">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
            </div>
          </div>

          {/* Card 4: Longest Active Streak */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                Top Memory Streak
              </p>
              <p className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {bestStreakInfo.streak}d
              </p>
              <p className="text-[11px] sm:text-xs text-amber-900 font-semibold truncate max-w-[140px]">
                {bestStreakInfo.patientName.split(' ')[0]} (Consistent)
              </p>
            </div>
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-100">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* 2. PATIENT CARDS SECTION                                 */}
        {/* ======================================================== */}
        <div className="space-y-4">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Patient Profiles Directory
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 text-xs font-bold">
                {filteredPatients.length}
              </span>
            </div>
          </div>

          {/* PATIENT GRID */}
          {filteredPatients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredPatients.map((patient) => {
                const completedCount = patient.todayReminders?.filter(r => r.status === 'completed' || r.acknowledged === true).length || 0;
                const totalCount = patient.todayReminders?.length || 10;
                const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                return (
                  <div
                    key={patient.id}
                    onClick={() => navigate(`/caregiver/patient/${patient.id}`)}
                    className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-teal-600/50 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 sm:gap-5 group relative overflow-hidden"
                  >
                    {/* Top Accent Line on Hover */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="space-y-3 sm:space-y-4">
                      
                      {/* Patient Avatar & Title */}
                      <div className="flex items-start gap-3.5 sm:gap-4">
                        <div className="relative shrink-0">
                          <img
                            src={patient.avatar}
                            alt={patient.name}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover border border-slate-200 shadow-xs group-hover:scale-105 transition-transform duration-200"
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 border-2 border-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-teal-900 transition-colors truncate">
                              {patient.name}
                            </h3>
                            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80 shrink-0">
                              <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-800" />
                              <span>{patient.streakDays || 0}d</span>
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
                            {patient.age} yrs • {patient.location.split(',')[0]}
                          </p>
                        </div>
                      </div>

                      {/* Clinical Badges Row */}
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5">
                        <span className="text-[11px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 bg-teal-50 text-teal-800 rounded-md border border-teal-200/80">
                          {patient.cognitiveStage || 'Tier 1'}
                        </span>
                        <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                          {patient.nativeLanguage || 'Assamese'}
                        </span>
                        {patient.hasBiometric && (
                          <span className="text-[11px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200 flex items-center gap-1">
                            <Fingerprint className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                            <span>Biometric</span>
                          </span>
                        )}
                      </div>

                    </div>

                    {/* Progress Bar & Footer */}
                    <div className="pt-3 sm:pt-4 border-t border-slate-100 space-y-2.5 sm:space-y-3">
                      
                      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                        <span className="text-slate-500">Today's Routines</span>
                        <span className="text-slate-800 font-bold">
                          {completedCount}/{totalCount} Done <span className="text-teal-800">({progressPct}%)</span>
                        </span>
                      </div>

                      {/* Sleek Dual-Tone Gradient Progress Bar */}
                      <div className="w-full bg-slate-100 h-2 sm:h-2.5 rounded-full overflow-hidden border border-slate-200/60">
                        <div 
                          className="bg-gradient-to-r from-teal-500 to-emerald-600 h-full rounded-full transition-all duration-500 shadow-xs" 
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] sm:text-xs text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span>10 daily slots</span>
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-teal-800 group-hover:text-teal-900 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>View Records</span>
                          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </span>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-800 mx-auto flex items-center justify-center border border-teal-100">
                <Users className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-bold text-slate-900">
                  No Patients Found
                </h3>
                <p className="text-xs text-slate-500">
                  {searchTerm ? `No records matching "${searchTerm}".` : 'You do not have any registered patients under your caregiver profile.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add First Patient</span>
              </button>
            </div>
          )}

        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL: ACCOUNT SETTINGS / SET BACKUP PASSWORD            */}
      {/* ======================================================== */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-100">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {caregiverUser?.hasPassword ? 'Update Password' : 'Set Backup Password'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enable email + password sign in
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBackupPassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  New Password (min 4 characters)
                </label>
                <input
                  type="password"
                  required
                  value={backupPassword}
                  onChange={(e) => setBackupPassword(e.target.value)}
                  placeholder="Enter new backup password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-700 text-slate-900 font-medium"
                />
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

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={settingsStatus === 'saving'}
                  className="px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white font-bold transition-colors shadow-xs cursor-pointer"
                >
                  {settingsStatus === 'saving' ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD NEW PATIENT                                   */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 sm:p-10 relative my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-5 border-b border-slate-200">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Enroll New Patient
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Register a patient under your clinical care roster & daily routine tracking
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPatientSubmit} className="space-y-5 pt-6 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Patient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={newPatientForm.name}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:border-teal-700 focus:bg-white text-slate-900 text-sm sm:text-base font-medium transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 74"
                    value={newPatientForm.age}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, age: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:border-teal-700 focus:bg-white text-slate-900 text-sm sm:text-base font-medium transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">Phone Number (WhatsApp)</label>
                  <input
                    type="text"
                    placeholder="91XXXXXXXXXX"
                    value={newPatientForm.phone}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:border-teal-700 focus:bg-white text-slate-900 text-sm sm:text-base font-medium transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">Gender</label>
                  <select
                    value={newPatientForm.gender}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, gender: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:border-teal-700 focus:bg-white text-slate-900 text-sm sm:text-base font-medium transition-all"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">Location / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Guwahati, Assam"
                    value={newPatientForm.location}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, location: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:border-teal-700 focus:bg-white text-slate-900 text-sm sm:text-base font-medium transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">Cognitive Care Tier</label>
                  <select
                    value={newPatientForm.cognitiveStage}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, cognitiveStage: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:border-teal-700 focus:bg-white text-slate-900 text-sm sm:text-base font-medium transition-all"
                  >
                    <option value="Early Memory Support">Early Memory Support (Tier 1)</option>
                    <option value="Moderate Support">Moderate Support (Tier 2)</option>
                    <option value="Advanced Care">Advanced Care (Tier 3)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Preferred Regional Language</label>
                <select
                  value={newPatientForm.nativeLanguage}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, nativeLanguage: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:border-teal-700 focus:bg-white text-slate-900 text-sm sm:text-base font-medium transition-all"
                >
                  <option value="Assamese">অসমীয়া (Assamese)</option>
                  <option value="Hindi">हिन्दी (Hindi)</option>
                  <option value="Khasi">Khasi (Meghalaya)</option>
                  <option value="Mizo">Mizo (Mizoram)</option>
                  <option value="Bengali">বাংলা (Bengali)</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors cursor-pointer text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-2xl bg-teal-800 text-white font-bold shadow-md hover:bg-teal-900 active:scale-95 transition-all cursor-pointer text-sm sm:text-base flex items-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Enroll Patient</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </CaregiverLayout>
  );
}
