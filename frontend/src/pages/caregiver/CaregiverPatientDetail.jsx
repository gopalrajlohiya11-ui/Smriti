import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import CaregiverLayout from '../../components/caregiver/CaregiverLayout';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Phone, 
  Calendar, 
  Clock, 
  BrainCircuit, 
  Pill, 
  Droplets, 
  Footprints, 
  X, 
  UserCheck, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Camera, 
  FileText, 
  HeartHandshake, 
  Save, 
  Check, 
  Fingerprint, 
  Trash2,
  ExternalLink,
  Activity,
  ShieldCheck
} from 'lucide-react';

export default function CaregiverPatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    patients, 
    updatePatient, 
    deletePatient, 
    registerPatientBiometric, 
    toggleReminder, 
    loginPatient,
    caregiverUser
  } = useApp();

  const selectedPatient = patients.find(p => p.id === id || p._id === id);

  // Collapsible 7-Day History Table state
  const [showHistoryTable, setShowHistoryTable] = useState(false);

  // Biometric Registration State
  const [biometricRegStatus, setBiometricRegStatus] = useState('');

  // Delete Patient Modal & Feedback States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteFeedbackToast, setDeleteFeedbackToast] = useState('');
  const [deleteErrorMsg, setDeleteErrorMsg] = useState('');

  // Manage / Edit Patient Details Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    age: '',
    phone: '',
    gender: 'Male',
    location: '',
    nativeLanguage: 'Assamese',
    cognitiveStage: '',
    primaryCaregiver: '',
    emergencyContact: '',
    notes: '',
    medicalNotes: '',
    avatar: ''
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);

  // Open Edit Details Modal
  const handleOpenEditModal = (patient) => {
    if (!patient) return;
    setEditForm({
      name: patient.name || '',
      age: patient.age ? patient.age.toString() : '70',
      phone: patient.phone || '',
      gender: patient.gender || 'Male',
      location: patient.location || 'Guwahati, Assam',
      nativeLanguage: patient.nativeLanguage || 'Assamese',
      cognitiveStage: patient.cognitiveStage || 'Early Memory Support',
      primaryCaregiver: patient.primaryCaregiver || caregiverUser?.name || 'Dr. Ananya Sharma',
      emergencyContact: patient.emergencyContact || patient.phone || '',
      notes: patient.notes || 'Consistently completes daily memory routines.',
      medicalNotes: patient.medicalNotes || 'Diagnosed with early-stage cognitive decline. Prescribed Donepezil 5mg & Amlodipine 5mg. No known drug allergies.',
      avatar: patient.avatar || ''
    });
    setAvatarPreview(patient.avatar || '');
    setIsSavedSuccessfully(false);
    setBiometricRegStatus('');
    setShowEditModal(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setEditForm(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePatientDetails = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    await updatePatient(selectedPatient.id, {
      ...editForm,
      age: parseInt(editForm.age, 10),
      avatar: avatarPreview || editForm.avatar
    });

    setIsSavedSuccessfully(true);
    setTimeout(() => {
      setIsSavedSuccessfully(false);
      setShowEditModal(false);
    }, 700);
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
        await registerPatientBiometric(patientId, credential.id, 'public-key-credential');
        setBiometricRegStatus('success');
      }
    } catch (err) {
      console.warn('Biometric setup cancelled or error:', err.message);
      setBiometricRegStatus('error');
    }
  };

  const switchToPatientView = (patient) => {
    loginPatient(patient.name, patient.age, '1234', true);
    navigate('/patient');
  };

  const handleConfirmDelete = async () => {
    if (!selectedPatient) return;
    if (selectedPatient.isDemoSeed) {
      setDeleteErrorMsg('Demo accounts cannot be deleted to protect presentation data.');
      return;
    }
    if (deleteConfirmName.trim().toLowerCase() !== selectedPatient.name.trim().toLowerCase()) {
      setDeleteErrorMsg(`Please type "${selectedPatient.name}" exactly to confirm.`);
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteErrorMsg('');
      await deletePatient(selectedPatient.id);
      setShowDeleteModal(false);
      setDeleteConfirmName('');
      setIsDeleting(false);
      navigate('/caregiver');
    } catch (err) {
      setIsDeleting(false);
      setDeleteErrorMsg(err.message || 'Failed to delete patient');
    }
  };

  if (!selectedPatient) {
    return (
      <CaregiverLayout>
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-4 shadow-xs">
          <p className="text-base font-bold text-slate-900">Patient Record Not Found</p>
          <p className="text-xs text-slate-500">The requested record does not exist or you do not have clinical access permissions.</p>
          <button
            onClick={() => navigate('/caregiver')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-800 text-white text-xs font-bold hover:bg-teal-900 cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Patients Roster</span>
          </button>
        </div>
      </CaregiverLayout>
    );
  }

  const completedTodayCount = selectedPatient.todayReminders?.filter(r => r.status === 'completed' || r.acknowledged === true).length || 0;
  const totalTodayCount = selectedPatient.todayReminders?.length || 10;
  const progressPct = totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0;

  return (
    <CaregiverLayout>
      <div className="space-y-6">
        
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

        {/* Global Toast */}
        {deleteFeedbackToast && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-between font-bold text-xs shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{deleteFeedbackToast}</span>
            </div>
            <button onClick={() => setDeleteFeedbackToast('')} className="text-slate-500 hover:text-slate-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* 1. PATIENT HEADER CLINICAL CARD                          */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            
            {/* Avatar & Patient Info */}
            <div className="flex items-center gap-4 sm:gap-5">
              <img
                src={selectedPatient.avatar}
                alt={selectedPatient.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs"
              />
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {selectedPatient.name}
                  </h1>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 bg-teal-50 text-teal-800 rounded-md border border-teal-200">
                    {selectedPatient.cognitiveStage || 'Tier 1'}
                  </span>
                  {selectedPatient.hasBiometric && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200 flex items-center gap-1">
                      <Fingerprint className="w-3 h-3 text-emerald-600" />
                      <span>Biometric Ready</span>
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {selectedPatient.age} yrs • {selectedPatient.location} • {selectedPatient.nativeLanguage}
                </p>
                <p className="text-xs text-slate-400">
                  Primary Clinician: <strong className="text-slate-700 font-semibold">{selectedPatient.primaryCaregiver || 'Dr. Ananya Sharma'}</strong>
                </p>
              </div>
            </div>

            {/* Top Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleOpenEditModal(selectedPatient)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Edit clinical parameters, biometrics & notes"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </button>

              <button
                onClick={() => switchToPatientView(selectedPatient)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer border border-slate-300"
                title="Open the elderly-friendly touch/voice companion view"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                <span>Preview Patient Portal</span>
              </button>

              {selectedPatient.isDemoSeed ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed border border-slate-200"
                  title="Demo patient accounts are protected"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Protected Demo</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmName('');
                    setDeleteErrorMsg('');
                    setShowDeleteModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-colors cursor-pointer border border-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete Patient</span>
                </button>
              )}
            </div>

          </div>

          {/* Quick Adherence Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today's Routine Adherence</p>
              <p className="text-xl font-bold text-slate-900">{completedTodayCount} of {totalTodayCount} Completed ({progressPct}%)</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Engagement Streak</p>
              <p className="text-xl font-bold text-amber-900 flex items-center gap-1">
                <Flame className="w-4 h-4 text-amber-800" />
                <span>{selectedPatient.streakDays || 14} Consecutive Days</span>
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Emergency Contact Phone</p>
              <p className="text-sm font-bold text-slate-900">{selectedPatient.emergencyContact || selectedPatient.phone || 'None registered'}</p>
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* 2. 7-DAY COGNITIVE PERFORMANCE CHART                     */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-teal-800" />
              <span>7-Day Cognitive Performance & Routine Stability</span>
            </h3>
            {selectedPatient.weeklyPerformance && selectedPatient.weeklyPerformance.length > 0 && (
              <span className="text-xs text-slate-500 font-semibold">
                Clinical Score Scale (0-100)
              </span>
            )}
          </div>

          {selectedPatient.weeklyPerformance && selectedPatient.weeklyPerformance.length > 0 ? (
            <div className="w-full h-64 bg-slate-50 rounded-xl p-4 border border-slate-200/80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selectedPatient.weeklyPerformance}>
                  <defs>
                    <linearGradient id="colorMemoryClinical" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorRoutineClinical" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis domain={[40, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderRadius: '12px', 
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                  <Area 
                    type="monotone" 
                    dataKey="memoryScore" 
                    name="Memory Score" 
                    stroke="#0d9488" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#colorMemoryClinical)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="routineScore" 
                    name="Routine Adherence Score" 
                    stroke="#64748b" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorRoutineClinical)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="w-full h-44 bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col items-center justify-center text-center space-y-2">
              <div className="p-3 bg-slate-200 text-slate-600 rounded-xl">
                <BrainCircuit className="w-5 h-5 text-slate-600" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                No Activity Recorded Yet
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm">
                Cognitive scores and stability curves will automatically chart here as this patient uses the Smriti platform.
              </p>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 3. TODAY'S 10 SCHEDULED ROUTINES                         */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-800" />
              <span>Today's Scheduled Routine Slots ({totalTodayCount})</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Click to toggle acknowledgment status
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedPatient.todayReminders?.map((rem) => {
              const isDone = rem.status === 'completed' || rem.acknowledged === true;
              return (
                <div
                  key={rem.id}
                  className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                    isDone 
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                      : 'bg-slate-50 border-slate-200/80 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                      isDone ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {rem.type === 'medicine' && <Pill className="w-4 h-4" />}
                      {rem.type === 'hydration' && <Droplets className="w-4 h-4" />}
                      {rem.type === 'meal' && <span>🍲</span>}
                      {rem.type === 'game' && <BrainCircuit className="w-4 h-4" />}
                      {rem.type === 'activity' && <Footprints className="w-4 h-4" />}
                      {rem.type === 'appointment' && <Calendar className="w-4 h-4" />}
                      {rem.type === 'rest' && <span>🌙</span>}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">{rem.title}</p>
                      <p className="text-[11px] text-slate-500">{rem.time} • {rem.detail}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleReminder(selectedPatient.id, rem.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border ${
                      isDone 
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs' 
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 shadow-2xs'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Done</span>
                      </>
                    ) : (
                      <span>Mark Done</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. 7-DAY ADHERENCE HISTORY (COLLAPSIBLE)                 */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
          <button
            type="button"
            onClick={() => setShowHistoryTable(!showHistoryTable)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-800" />
              <span>7-Day Historical Routine Adherence Record</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <span>{showHistoryTable ? 'Collapse Table' : 'Expand History Table'}</span>
              {showHistoryTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showHistoryTable && (
            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white animate-in fade-in pt-2">
              {selectedPatient.reminderHistory && selectedPatient.reminderHistory.length > 0 ? (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Prescriptions</th>
                      <th className="py-2.5 px-3">Hydration</th>
                      <th className="py-2.5 px-3">Activities</th>
                      <th className="py-2.5 px-3">Check-ins</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {selectedPatient.reminderHistory.map((day, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{day.date}</td>
                        <td className="py-2.5 px-3">
                          {day.medicine ? (
                            <span className="text-emerald-800 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Done
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Missed
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {day.hydration ? (
                            <span className="text-emerald-800 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Done
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Missed
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {day.activity ? (
                            <span className="text-emerald-800 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Done
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Missed
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {day.appointment ? (
                            <span className="text-emerald-800 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Done
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Missed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  No historical adherence data recorded yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 5. CLINICAL & MEDICAL NOTES CARD                         */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-800" />
            <span>Clinical & Caregiver Medical Notes</span>
          </h3>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
            {selectedPatient.medicalNotes || 'No specific clinical notes entered yet. Click "Edit Details" to add medical instructions or emergency protocols.'}
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL: EDIT PATIENT DETAILS & BIOMETRICS                 */}
      {/* ======================================================== */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 relative my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Edit Clinical Record
                </h3>
                <p className="text-xs text-slate-500">
                  Update profile parameters, biometrics & medical instructions
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePatientDetails} className="space-y-4 pt-4 text-xs">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={avatarPreview || editForm.avatar || 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80'}
                    alt="Preview"
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-300"
                  />
                  <label className="absolute -bottom-1 -right-1 p-1.5 bg-teal-800 text-white rounded-full cursor-pointer hover:bg-teal-900 shadow-xs">
                    <Camera className="w-3.5 h-3.5" />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-800">Patient Portrait</p>
                  <p className="text-slate-500 text-[11px]">Upload an elderly-friendly portrait for recognition.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    min="40"
                    max="120"
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone (WhatsApp)</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Language</label>
                  <select
                    value={editForm.nativeLanguage}
                    onChange={(e) => setEditForm({ ...editForm, nativeLanguage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-700"
                  >
                    <option value="Assamese">অসমীয়া (Assamese)</option>
                    <option value="Khasi">Khasi (Meghalaya)</option>
                    <option value="Mizo">Mizo (Mizoram)</option>
                    <option value="Bengali">বাংলা (Bengali)</option>
                    <option value="English">English</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical & Medical Notes</label>
                <textarea
                  rows="3"
                  value={editForm.medicalNotes}
                  onChange={(e) => setEditForm({ ...editForm, medicalNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Fingerprint className="w-4 h-4 text-teal-800" />
                    <span>Biometric Face / Fingerprint Sensor</span>
                  </span>
                  {selectedPatient.hasBiometric && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                      ✓ Active
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRegisterBiometricForPatient(selectedPatient.id, selectedPatient.name)}
                  className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-slate-300 cursor-pointer shadow-2xs"
                >
                  <Fingerprint className="w-4 h-4 text-slate-700" />
                  <span>
                    {biometricRegStatus === 'success' 
                      ? '✓ Biometric Registered Successfully' 
                      : selectedPatient.hasBiometric 
                      ? 'Re-register Fingerprint / Face ID' 
                      : 'Set up Biometric Sensor for this Patient'}
                  </span>
                </button>
              </div>

              {isSavedSuccessfully && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold text-center">
                  ✓ Clinical record updated successfully!
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-800 text-white font-bold hover:bg-teal-900 cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DELETE PATIENT CONFIRMATION                      */}
      {/* ======================================================== */}
      {showDeleteModal && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-rose-200 shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-200">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Delete Clinical Record
                  </h3>
                  <p className="text-xs text-slate-500">
                    Permanent action — requires confirmation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900 space-y-1.5">
              <p className="font-bold">
                Are you sure you want to permanently remove {selectedPatient.name}?
              </p>
              <p className="text-rose-800 text-[11px] leading-relaxed">
                This will permanently delete their clinical records, scheduled routines, and history from Smriti.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700">
                To confirm, please type <span className="text-rose-900 font-bold select-all">"{selectedPatient.name}"</span> below:
              </label>
              <input
                type="text"
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder={`Type "${selectedPatient.name}"`}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-rose-700 text-slate-900 font-semibold"
              />
            </div>

            {deleteErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold">
                {deleteErrorMsg}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting || deleteConfirmName.trim().toLowerCase() !== selectedPatient.name.trim().toLowerCase()}
                className="px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Deleting...' : 'Yes, Delete Record'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </CaregiverLayout>
  );
}
