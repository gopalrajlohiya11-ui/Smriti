import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  Users, 
  CheckCircle2, 
  ArrowLeft, 
  Eye, 
  Trash2, 
  HeartHandshake,
  Activity,
  FileCheck2,
  Mail,
  Scale
} from 'lucide-react';
import FoxtailOrchidIcon from '../components/FoxtailOrchidIcon';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 font-sans selection:bg-amber-200 selection:text-amber-900">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors flex items-center justify-center cursor-pointer"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-800 flex items-center justify-center text-white shadow-sm">
                <FoxtailOrchidIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-tight text-stone-900">Smriti</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
                    DPDP 2023
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 font-medium">Privacy Policy & Patient Data Governance</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/patient"
              className="px-3.5 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all shadow-2xs"
            >
              Patient Portal
            </Link>
            <Link
              to="/caregiver"
              className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all"
            >
              Clinician Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-b from-teal-950 via-teal-900 to-slate-900 text-white py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/80 border border-teal-600/50 text-teal-200 text-xs font-bold">
            <Scale className="w-3.5 h-3.5" />
            <span>Compliant with India's Digital Personal Data Protection (DPDP) Act, 2023</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Privacy Policy & Health Data Protection
          </h1>

          <p className="text-stone-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            At Smriti (Cognitive Care & Dementia Support Initiative), we treat sensitive cognitive health data, family memory portraits, and routine adherence records with the highest clinical and legal safeguards.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-stone-300 pt-2 border-t border-teal-800/60 font-medium">
            <span><strong>Effective Date:</strong> September 1, 2026</span>
            <span>•</span>
            <span><strong>Jurisdiction:</strong> Republic of India (DPDP Act, 2023)</span>
            <span>•</span>
            <span><strong>Data Controller:</strong> Smriti Clinical Cognitive Care Group</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-100">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Encrypted at Rest & Transit</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              All records stored securely on MongoDB Atlas with AES-256 database encryption and TLS 1.3 encrypted data transit.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Strict Role-Based Isolation</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Records are strictly restricted to the patient themselves and their verified, assigned clinician or primary family caregiver.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Explicit DPDP Consent</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Photo uploads, biometric logins, and caregiver associations require affirmative, revocable consent before processing.
            </p>
          </div>
        </div>

        {/* Section 1: What Data We Collect */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h2 className="text-lg sm:text-xl font-black text-stone-900">
              Information and Data We Collect
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            To provide individualized cognitive routine support, medicine reminders, and memory stimulation, Smriti collects only the minimum necessary data points:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                <span>Patient Profile & Demographics</span>
              </h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Full name, age, primary language (e.g., Assamese, Hindi, Bengali, Khasi, English), phone number, residential state/region, and emergency contact details.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                <span>Prescriptions & Daily Routines</span>
              </h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Scheduled medicine doses, hydration checkpoints, meals, gentle physical walks, caregiver reviews, and completion/acknowledgment timestamps.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                <span>Family Memory Bank & Tagged Photos</span>
              </h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Family portraits, relationship tags, historical year, and location tags uploaded with explicit DPDP consent for cognitive recall exercises.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                <span>Cognitive Game Scores & Adherence History</span>
              </h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Session performance in Market Day Basket, Faces & Family Recall, Sound Rhythm Match, Daily Routine Sequencer, and longitudinal streak analytics.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5 md:col-span-2">
              <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                <span>WhatsApp & Voice/Text Chatbot Transcripts</span>
              </h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Conversational memory check-ins, voice note transcripts, and automated reminder confirmations conducted via our WhatsApp Business API integration or in-app conversational assistant.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Why We Collect Data */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h2 className="text-lg sm:text-xl font-black text-stone-900">
              Purpose and Clinical Basis of Data Processing
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-stone-700 leading-relaxed">
            <p>
              We process personal and health-related data solely for the following healthcare and clinical purposes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-stone-700 text-xs sm:text-sm">
              <li>
                <strong>Timely Care Reminders:</strong> Prompting elderly patients at their scheduled medication, hydration, and meal times in their native language.
              </li>
              <li>
                <strong>Cognitive Stimulation:</strong> Rendering personalized recall games utilizing genuine family relationships and cultural anchors.
              </li>
              <li>
                <strong>Caregiver Safeguards & Alert Escalation:</strong> Detecting unacknowledged critical routines (3+ hours overdue) and notifying the verified primary caregiver to prevent medication lapses.
              </li>
              <li>
                <strong>Clinical Evaluation:</strong> Giving treating physicians longitudinal adherence trends, cognitive stability reports, and engagement indicators.
              </li>
              <li>
                <strong>Zero Commercial Monetization:</strong> We never sell, lease, trade, or monetize patient records, health notes, or biometric identifiers to third-party data brokers or advertisers.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3: India DPDP Act 2023 Compliance */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-200/90 shadow-2xs space-y-5 bg-gradient-to-br from-white via-teal-50/20 to-emerald-50/30">
          <div className="flex items-center gap-3 pb-3 border-b border-teal-100">
            <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900">
                Compliance with Digital Personal Data Protection (DPDP) Act, 2023
              </h2>
              <p className="text-xs text-teal-800 font-semibold">Your Statutory Rights under Indian Law</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-teal-100 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-xs sm:text-sm">
                <FileCheck2 className="w-4 h-4 text-teal-700" />
                <span>1. Explicit Informed Consent</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Prior to uploading any photograph or enrolling biometric credentials, Smriti requires an explicit, affirmative checkbox confirmation. A tamper-evident consent timestamp is permanently logged in MongoDB Atlas alongside the asset.
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-teal-100 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-xs sm:text-sm">
                <Eye className="w-4 h-4 text-teal-700" />
                <span>2. Right to Access & Correction</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Patients and their authorized caregivers have continuous, real-time access to inspect, update, or correct all clinical notes, emergency contacts, reminders, and profile details via the portal.
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-teal-100 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-xs sm:text-sm">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>3. Right to Erasure & Deletion</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                You may request immediate deletion of any Memory Bank photo or entire patient profile. Upon request, all associated database records, reminders, and photos are permanently purged from MongoDB Atlas.
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-teal-100 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-xs sm:text-sm">
                <HeartHandshake className="w-4 h-4 text-teal-700" />
                <span>4. Grievance Redressal</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                We maintain an accessible Data Protection Officer (DPO) and Grievance Officer in India to respond to privacy queries, consent revocations, or data audit inquiries within 7 business days.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Data Storage & Security */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h2 className="text-lg sm:text-xl font-black text-stone-900">
              Data Security, Storage & Encryption Safeguards
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-stone-700 leading-relaxed">
            <p>
              We implement industry-leading technical and organizational security controls:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1">
                <strong className="text-stone-900 block font-bold">🔒 Database Encryption at Rest</strong>
                <span>All documents in MongoDB Atlas are encrypted at the storage level using AES-256 with managed cryptographic keys.</span>
              </div>
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1">
                <strong className="text-stone-900 block font-bold">🛡️ Secure In-Transit Transmission</strong>
                <span>All web and API traffic is enforced with modern TLS 1.3 / SSL encryption with strict transport security.</span>
              </div>
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1">
                <strong className="text-stone-900 block font-bold">🔑 Scoped JWT Authentication</strong>
                <span>Role-scoped tokens protect API endpoints so patient records cannot be cross-accessed by unauthorized callers.</span>
              </div>
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1">
                <strong className="text-stone-900 block font-bold">📱 Hardware Biometric Passkeys (FIDO2)</strong>
                <span>Biometric authentication uses client-side WebAuthn credentials; raw fingerprint or facial data never leaves your device.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Data Retention & Contact */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-sm">
              5
            </div>
            <h2 className="text-lg sm:text-xl font-black text-stone-900">
              Data Retention, Grievance Officer & Contact
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            Data is retained only as long as an active patient care relationship exists. If a caregiver or patient requests account closure or deletion, records are purged within 30 days.
          </p>

          <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-3">
            <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wider">
              Data Protection & Grievance Contact
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-700">
              <div>
                <p className="font-bold text-stone-900">Smriti Cognitive Health Initiative</p>
                <p className="text-stone-600">Attn: Data Protection Officer (DPO)</p>
                <p className="text-stone-600">Guwahati, Assam, India</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-teal-900 font-semibold">
                  <Mail className="w-4 h-4 text-teal-700" />
                  <a href="mailto:privacy@smriti.in" className="underline hover:text-teal-950">privacy@smriti.in</a>
                </div>
                <div className="flex items-center gap-2 text-teal-900 font-semibold">
                  <Mail className="w-4 h-4 text-teal-700" />
                  <a href="mailto:dementiacare@smriti.in" className="underline hover:text-teal-950">dementiacare@smriti.in</a>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">Response Time: Within 7 business days</p>
              </div>
            </div>
          </div>
        </section>

        {/* Back navigation CTA */}
        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm shadow-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Previous Screen</span>
          </button>
        </div>

      </div>

      {/* Page Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 px-4 text-center text-xs text-stone-500 space-y-1">
        <p>© 2026 Smriti Clinical Cognitive Care Platform. All Rights Reserved.</p>
        <p className="text-[11px] text-stone-400">
          Compliant with Digital Personal Data Protection Act (DPDP), 2023 | Republic of India
        </p>
      </footer>

    </div>
  );
}
