import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import CaregiverLayout from '../../components/caregiver/CaregiverLayout';
import { 
  AlertTriangle, 
  Phone, 
  CheckCircle2, 
  ArrowLeft, 
  Clock, 
  ExternalLink, 
  Sparkles,
  ShieldAlert,
  ChevronRight,
  User
} from 'lucide-react';

export default function CaregiverNotifications() {
  const navigate = useNavigate();
  const { 
    redFlags, 
    dismissRedFlag, 
    patients, 
    caregiverUser,
    setActivePatientId
  } = useApp();

  const handleViewPatient = (patientId) => {
    if (patientId) {
      setActivePatientId(patientId);
      navigate(`/caregiver/patient/${patientId}`);
    } else {
      navigate('/caregiver');
    }
  };

  return (
    <CaregiverLayout>
      <div className="space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <button
              onClick={() => navigate('/caregiver')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer mb-2 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>← Back to Patients Roster</span>
            </button>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Attention Required</span>
              {redFlags.length > 0 ? (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                  {redFlags.length} active alerts
                </span>
              ) : (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  All Clear
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Missed routines and unacknowledged reminders across your assigned patients.
            </p>
          </div>
        </div>

        {/* ALERTS LIST CONTAINER */}
        <div className="space-y-4">
          {redFlags.length > 0 ? (
            redFlags.map((flag) => {
              const targetPatient = patients.find(p => p.id === flag.patientId) || patients[0];
              const phone = targetPatient?.phone || targetPatient?.emergencyContact || flag.actionPhone || '';

              return (
                <div 
                  key={flag.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-rose-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden"
                >
                  {/* Red Alert Left Accent Bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-600" />

                  {/* Left: Patient Avatar + Alert Details */}
                  <div className="flex items-start gap-4">
                    <img 
                      src={targetPatient?.avatar || flag.patientAvatar || 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80'} 
                      alt={targetPatient?.name || 'Patient'} 
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs" 
                    />

                    <div className="space-y-1.5 flex-1 min-w-0">
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">
                          {targetPatient?.name || flag.patientName}
                        </span>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {targetPatient?.location || 'Assam'}
                        </span>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-rose-600" />
                          <span>{flag.time}</span>
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base leading-snug">
                        {flag.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        {flag.description}
                      </p>

                    </div>
                  </div>

                  {/* Right: Quick Clinical Actions */}
                  <div className="flex items-center gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 justify-end">
                    
                    {/* Call Patient */}
                    {phone && (
                      <a
                        href={`tel:${phone}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer border border-slate-300"
                        title={`Call ${targetPatient?.name}`}
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-600" />
                        <span>Call Patient</span>
                      </a>
                    )}

                    {/* View Profile Button */}
                    <button
                      type="button"
                      onClick={() => handleViewPatient(targetPatient?.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer border border-slate-300"
                    >
                      <User className="w-3.5 h-3.5 text-slate-600" />
                      <span>View File</span>
                    </button>

                    {/* Dismiss Button */}
                    <button
                      type="button"
                      onClick={() => dismissRedFlag(flag.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      title="Mark this alert as acknowledged"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Dismiss</span>
                    </button>

                  </div>

                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 mx-auto flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-7 h-7 stroke-[2]" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">
                  All Caught Up!
                </h3>
                <p className="text-xs text-slate-500">
                  No urgent alerts or missed reminders right now. All scheduled routines for your assigned patients are progressing smoothly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/caregiver')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <span>Return to Patient Roster</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </CaregiverLayout>
  );
}
