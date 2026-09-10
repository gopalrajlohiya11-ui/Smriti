import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { fetchPatientGameSessions, fetchPatientMLHealthScore } from '../../services/api';
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
  ShieldCheck,
  Image,
  Plus,
  Gamepad2,
  Trophy,
  Star,
  Sparkles,
  ShoppingBasket,
  Users,
  Timer,
  Zap,
  RotateCw,
  Radio,
  Music,
  Sun,
  Sunset,
  Moon,
  Coffee,
  Utensils,
  CheckCheck,
  AlertCircle
} from 'lucide-react';

import { matchPatientHelper } from '../../utils/authUtils';
import { initialPatients } from '../../data/mockData';

// Standard 9-10 Morning-to-Night Routine Placeholders Template
const DEFAULT_10_ROUTINE_TEMPLATE = [
  {
    time: '07:00 AM',
    period: 'Morning',
    title: 'Morning Wake-up & Hydration',
    type: 'hydration',
    detail: 'Warm lemon water or Assam herbal tea to start the day',
    categoryLabel: 'Hydration'
  },
  {
    time: '08:00 AM',
    period: 'Morning',
    title: 'Morning Medicine & BP Check',
    type: 'medicine',
    detail: 'Donepezil 5mg & blood pressure medicine with water',
    categoryLabel: 'Medication'
  },
  {
    time: '08:45 AM',
    period: 'Morning',
    title: 'Nutritious Breakfast & Fresh Fruit',
    type: 'meal',
    detail: 'Warm porridge / Idli & papaya slices',
    categoryLabel: 'Meal'
  },
  {
    time: '10:30 AM',
    period: 'Morning',
    title: 'Cognitive Memory & Brain Games',
    type: 'game',
    detail: 'Play Daily Routine Sequencer & Market Day Basket',
    categoryLabel: 'Cognitive'
  },
  {
    time: '01:00 PM',
    period: 'Afternoon',
    title: 'Wholesome Lunch & Hydration',
    type: 'meal',
    detail: 'Balanced dal, rice/roti, fresh greens & water',
    categoryLabel: 'Meal'
  },
  {
    time: '02:00 PM',
    period: 'Afternoon',
    title: 'Afternoon Rest & Wind-down',
    type: 'rest',
    detail: '30-45 minutes quiet resting / calming music',
    categoryLabel: 'Rest'
  },
  {
    time: '04:30 PM',
    period: 'Evening',
    title: 'Gentle Evening Walk',
    type: 'activity',
    detail: '15-20 min light garden stroll with caregiver',
    categoryLabel: 'Activity'
  },
  {
    time: '05:30 PM',
    period: 'Evening',
    title: 'Evening Tea & Family Social Call',
    type: 'activity',
    detail: 'Warm Assam tea and check-in call with family',
    categoryLabel: 'Social'
  },
  {
    time: '07:30 PM',
    period: 'Night',
    title: 'Light Dinner & Warm Soup',
    type: 'meal',
    detail: 'Easy-to-digest light evening meal',
    categoryLabel: 'Meal'
  },
  {
    time: '09:00 PM',
    period: 'Night',
    title: 'Bedtime Medicine & Restorative Sleep',
    type: 'medicine',
    detail: 'Night medication & relaxing sleep preparation',
    categoryLabel: 'Medication'
  }
];

const ROUTINE_TYPE_CONFIG = {
  medicine: { label: 'Prescription Medicine', icon: Pill, color: 'bg-rose-50 text-rose-700 border-rose-200' },
  hydration: { label: 'Hydration / Tea', icon: Droplets, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  meal: { label: 'Meal / Nutrition', icon: Utensils, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  game: { label: 'Cognitive Game', icon: BrainCircuit, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  activity: { label: 'Physical Activity / Walk', icon: Footprints, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rest: { label: 'Rest & Wind-down', icon: Moon, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  appointment: { label: 'Clinical Appointment', icon: Calendar, color: 'bg-teal-50 text-teal-700 border-teal-200' },
  social: { label: 'Family & Social', icon: Users, color: 'bg-pink-50 text-pink-700 border-pink-200' },
  other: { label: 'General Routine', icon: Clock, color: 'bg-slate-50 text-slate-700 border-slate-200' }
};

const getRoutinePeriodFromTime = (timeStr) => {
  if (!timeStr) return 'Morning';
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return 'Morning';
  let hours = parseInt(match[1], 10);
  const meridiem = match[3] ? match[3].toUpperCase() : 'AM';
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  if (hours >= 5 && hours < 12) return 'Morning';
  if (hours >= 12 && hours < 17) return 'Afternoon';
  if (hours >= 17 && hours < 20) return 'Evening';
  return 'Night';
};

export default function CaregiverPatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    patients, 
    updatePatient, 
    deletePatient, 
    registerPatientBiometric, 
    toggleReminder, 
    addReminder,
    updateReminder,
    deleteReminder,
    applyStandardReminders,
    clearAllPatientReminders,
    caregiverUser,
    loadPatientPhotos,
    addPatientPhoto,
    deletePatientPhoto,
    setActivePatientId
  } = useApp();

  const selectedPatient = (patients && patients.length > 0 ? patients.find(p => matchPatientHelper(p, id)) : null) || 
    initialPatients.find(p => matchPatientHelper(p, id)) || 
    patients[0] || 
    initialPatients[0];

  const switchToPatientView = (patient) => {
    if (patient) {
      setActivePatientId(patient._id || patient.id);
    }
    navigate('/patient');
  };

  // Photos Vault State
  const [patientPhotosList, setPatientPhotosList] = useState([]);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [newPhotoForm, setNewPhotoForm] = useState({
    title: '',
    photoUrl: '',
    taggedName: '',
    relation: '',
    year: '2024',
    location: 'Assam',
    description: '',
    audioPrompt: '',
    dpdpConsentGiven: false
  });
  const [photoSaveStatus, setPhotoSaveStatus] = useState('');

  // ML Cognitive Health & Adaptive Difficulty State
  const [mlEvaluation, setMlEvaluation] = useState(null);
  const [isMlLoading, setIsMlLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (selectedPatient?.id || selectedPatient?._id) {
      const pId = selectedPatient.id || selectedPatient._id;
      setIsPhotoLoading(true);
      loadPatientPhotos(pId).then(photos => {
        if (isMounted) {
          setPatientPhotosList(photos || []);
          setIsPhotoLoading(false);
        }
      });

      setIsMlLoading(true);
      fetchPatientMLHealthScore(pId).then(data => {
        if (isMounted && data) {
          setMlEvaluation(data);
          setIsMlLoading(false);
        }
      }).catch(() => {
        if (isMounted) setIsMlLoading(false);
      });
    }
    return () => { isMounted = false; };
  }, [selectedPatient?.id, selectedPatient?._id, loadPatientPhotos]);

  const handleAddPhotoSubmit = async (e) => {
    e.preventDefault();
    if (!newPhotoForm.photoUrl || !newPhotoForm.title || !newPhotoForm.dpdpConsentGiven) return;
    const pId = selectedPatient.id || selectedPatient._id;
    try {
      setPhotoSaveStatus('saving');
      const created = await addPatientPhoto(pId, {
        ...newPhotoForm,
        dpdpConsentGiven: true,
        dpdpConsentTimestamp: new Date().toISOString(),
        dpdpConsentText: `I confirm I have consent to upload this photo and understand it will be used within Smriti to support ${selectedPatient.name}'s cognitive care, per the Privacy Policy.`
      });
      setPatientPhotosList(prev => [created, ...prev]);
      setPhotoSaveStatus('saved');
      setShowAddPhotoModal(false);
      setNewPhotoForm({
        title: '',
        photoUrl: '',
        taggedName: '',
        relation: '',
        year: '2024',
        location: 'Assam',
        description: '',
        audioPrompt: '',
        dpdpConsentGiven: false
      });
      setTimeout(() => setPhotoSaveStatus(''), 2500);
    } catch (err) {
      setPhotoSaveStatus('error');
    }
  };

  const handleDeletePhoto = async (photoId) => {
    const pId = selectedPatient.id || selectedPatient._id;
    try {
      await deletePatientPhoto(pId, photoId);
      setPatientPhotosList(prev => prev.filter(p => p._id !== photoId && p.id !== photoId));
    } catch (err) {
      console.error('Delete photo error:', err);
    }
  };

  // Routine & Daily Schedule Management State
  const [showAddRoutineModal, setShowAddRoutineModal] = useState(false);
  const [showEditRoutineModal, setShowEditRoutineModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [routineFilter, setRoutineFilter] = useState('all');
  const [routineActionLoading, setRoutineActionLoading] = useState(false);
  const [routineToast, setRoutineToast] = useState('');
  
  const [routineForm, setRoutineForm] = useState({
    time: '08:00 AM',
    title: '',
    type: 'medicine',
    detail: ''
  });

  const [templateFormList, setTemplateFormList] = useState(DEFAULT_10_ROUTINE_TEMPLATE.map(i => ({ ...i })));

  const handleOpenAddRoutine = () => {
    setRoutineForm({
      time: '08:00 AM',
      title: '',
      type: 'medicine',
      detail: ''
    });
    setShowAddRoutineModal(true);
  };

  const handleOpenEditRoutine = (rem) => {
    setEditingRoutine(rem);
    setRoutineForm({
      time: rem.time || '08:00 AM',
      title: rem.title || '',
      type: rem.type || 'activity',
      detail: rem.detail || ''
    });
    setShowEditRoutineModal(true);
  };

  const handleOpenTemplateModal = () => {
    setTemplateFormList(DEFAULT_10_ROUTINE_TEMPLATE.map(i => ({ ...i })));
    setShowTemplateModal(true);
  };

  const handleTemplateItemChange = (idx, field, value) => {
    setTemplateFormList(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleAddTemplateItem = () => {
    setTemplateFormList(prev => [
      ...prev,
      {
        time: '03:00 PM',
        period: 'Afternoon',
        title: 'Custom Routine Slot',
        type: 'activity',
        detail: 'Routine details...',
        categoryLabel: 'Activity'
      }
    ]);
  };

  const handleDeleteTemplateItem = (idx) => {
    setTemplateFormList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleApplyTemplateSubmit = async (replaceExisting = true) => {
    const pId = selectedPatient.id || selectedPatient._id;
    try {
      setRoutineActionLoading(true);
      await applyStandardReminders(pId, templateFormList, replaceExisting);
      setShowTemplateModal(false);
      setRoutineToast(`Applied ${templateFormList.length} routines to ${selectedPatient.name}'s daily schedule!`);
      setTimeout(() => setRoutineToast(''), 4000);
    } catch (err) {
      setRoutineToast('Failed to apply routine template. Please retry.');
    } finally {
      setRoutineActionLoading(false);
    }
  };

  const handleAddRoutineSubmit = async (e) => {
    e.preventDefault();
    if (!routineForm.title.trim()) return;
    const pId = selectedPatient.id || selectedPatient._id;
    try {
      setRoutineActionLoading(true);
      await addReminder(pId, routineForm);
      setShowAddRoutineModal(false);
      setRoutineToast(`Added "${routineForm.title}" to schedule!`);
      setTimeout(() => setRoutineToast(''), 3000);
    } catch (err) {
      setRoutineToast('Failed to add routine.');
    } finally {
      setRoutineActionLoading(false);
    }
  };

  const handleEditRoutineSubmit = async (e) => {
    e.preventDefault();
    if (!editingRoutine || !routineForm.title.trim()) return;
    const pId = selectedPatient.id || selectedPatient._id;
    const remId = editingRoutine._id || editingRoutine.id;
    try {
      setRoutineActionLoading(true);
      await updateReminder(pId, remId, routineForm);
      setShowEditRoutineModal(false);
      setEditingRoutine(null);
      setRoutineToast(`Updated "${routineForm.title}" successfully!`);
      setTimeout(() => setRoutineToast(''), 3000);
    } catch (err) {
      setRoutineToast('Failed to update routine.');
    } finally {
      setRoutineActionLoading(false);
    }
  };

  const handleDeleteRoutineClick = async (remId, title) => {
    const pId = selectedPatient.id || selectedPatient._id;
    try {
      await deleteReminder(pId, remId);
      setRoutineToast(`Deleted routine "${title || 'item'}".`);
      setTimeout(() => setRoutineToast(''), 3000);
    } catch (err) {
      setRoutineToast('Failed to delete routine.');
    }
  };

  const handleClearAllRoutinesClick = async () => {
    if (!window.confirm(`Are you sure you want to clear all scheduled routines for ${selectedPatient.name}?`)) return;
    const pId = selectedPatient.id || selectedPatient._id;
    try {
      setRoutineActionLoading(true);
      await clearAllPatientReminders(pId);
      setRoutineToast(`Cleared all routines for ${selectedPatient.name}.`);
      setTimeout(() => setRoutineToast(''), 3000);
    } catch (err) {
      setRoutineToast('Failed to clear routines.');
    } finally {
      setRoutineActionLoading(false);
    }
  };

  // Collapsible 7-Day History Table state
  const [showHistoryTable, setShowHistoryTable] = useState(false);

  // Real MongoDB Game Sessions State
  const [gameSessions, setGameSessions] = useState([]);
  const [isGamesLoading, setIsGamesLoading] = useState(false);
  const [gamesLoadError, setGamesLoadError] = useState(null);
  const [expandedSessionIds, setExpandedSessionIds] = useState(new Set());

  // Front-Screen 3-Item Limit with Expand All Controls
  const [isGamesExpanded, setIsGamesExpanded] = useState(false);
  const [isRoutinesExpanded, setIsRoutinesExpanded] = useState(false);

  const patientIdParam = selectedPatient?._id || selectedPatient?.id || id;

  const loadPatientGames = useCallback(async () => {
    if (!patientIdParam) return;
    setIsGamesLoading(true);
    setGamesLoadError(null);
    try {
      const data = await fetchPatientGameSessions(patientIdParam);
      if (Array.isArray(data)) {
        setGameSessions(data);
        setGamesLoadError(null);
      } else {
        setGameSessions([]);
      }
    } catch (err) {
      console.warn('Could not load game sessions:', err);
      setGamesLoadError('Unable to load game sessions from database. Please check connection and retry.');
    } finally {
      setIsGamesLoading(false);
    }
  }, [patientIdParam]);

  useEffect(() => {
    loadPatientGames();
  }, [loadPatientGames]);

  // Expand / Collapse Helper Handlers
  const toggleSessionExpand = (sessionId) => {
    setExpandedSessionIds(prev => {
      const next = new Set(prev);
      if (next.has(sessionId)) {
        next.delete(sessionId);
      } else {
        next.add(sessionId);
      }
      return next;
    });
  };

  const toggleExpandAll = () => {
    if (expandedSessionIds.size === gameSessions.length) {
      setExpandedSessionIds(new Set());
    } else {
      setExpandedSessionIds(new Set(gameSessions.map((s, idx) => s._id || s.id || `session-${idx}`)));
    }
  };

  // Game Metadata & Display Helpers
  const getGameBadgeInfo = (gameType, title) => {
    switch (gameType) {
      case 'faces-family-recall':
        return {
          name: 'Faces & Family Recall',
          category: 'Family & People Recall',
          icon: Users,
          iconBg: 'bg-rose-50 text-rose-700 border-rose-200',
          badgeBg: 'bg-rose-50 text-rose-800 border-rose-200'
        };
      case 'daily-routine-sequencer':
        return {
          name: 'Daily Routine Sequencer',
          category: 'Sequence & Routine Recall',
          icon: Clock,
          iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200'
        };
      case 'market-day-basket':
        return {
          name: 'Market Day Basket',
          category: 'Pattern & Math Recall',
          icon: ShoppingBasket,
          iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200'
        };
      case 'sound-rhythm-match':
        return {
          name: 'Sound & Rhythm Match',
          category: 'Auditory & Rhythm Recall',
          icon: Radio,
          iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200'
        };
      case 'odd-one-out':
        return {
          name: 'Odd One Out Pattern Match',
          category: 'Pattern & Visual Focus',
          icon: Gamepad2,
          iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200'
        };
      default:
        return {
          name: title || (gameType ? gameType.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Cognitive Recall Game'),
          category: 'Cognitive Memory',
          icon: Gamepad2,
          iconBg: 'bg-teal-50 text-teal-700 border-teal-200',
          badgeBg: 'bg-teal-50 text-teal-800 border-teal-200'
        };
    }
  };

  const formatRoundMode = (mode) => {
    switch (mode) {
      case 'family_name': return 'Name Recognition';
      case 'family_relation': return 'Relationship Recall';
      case 'routine_ordering': return 'Chronological Sequence';
      case 'categorization': return 'Produce Sorting';
      case 'math': return 'Bazaar Math';
      case 'rhythm_pattern': return 'Bihu Rhythm Pattern';
      default: return mode ? mode.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Recall Task';
    }
  };

  const formatSessionTimestamp = (ts) => {
    if (!ts) return 'Recent';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return 'Recent';
    
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (isToday) {
      return `Today at ${timeStr}`;
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${timeStr}`;
    }
    
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} • ${timeStr}`;
  };

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
      const targetId = selectedPatient._id || selectedPatient.id || id;
      await deletePatient(targetId);
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

  const isDemo = selectedPatient?.isDemoSeed === true || 
    ['pat-1', 'pat-2', 'pat-3'].includes(selectedPatient?.id) || 
    ['pat-1', 'pat-2', 'pat-3'].includes(selectedPatient?._id) || 
    ['Ramesh Sharma', 'Meera Baruah', 'Biren Das'].includes(selectedPatient?.name);

  const completedTodayCount = selectedPatient.todayReminders?.filter(r => r.status === 'completed' || r.acknowledged === true).length || 0;
  const totalTodayCount = selectedPatient.todayReminders?.length || (isDemo ? 10 : 0);
  const progressPct = totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0;

  // Calculate 7-day blended cognitive and routine performance from real MongoDB GameSessions
  const blended7DayPerformance = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    
    // Generate 7 days array ending with today
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      d.setHours(0, 0, 0, 0);
      last7Days.push(d);
    }

    return last7Days.map((dayDate, index) => {
      const isToday = index === 6;
      const dayLabel = isToday 
        ? `${dayNames[dayDate.getDay()]} (Today)` 
        : dayNames[dayDate.getDay()];

      // Base fallback values ONLY for demo patients
      const fallbackEntry = isDemo
        ? (selectedPatient?.weeklyPerformance?.[index] || {
            memoryScore: 84 + index,
            routineScore: 88 + index,
            overallScore: 86 + index
          })
        : {
            memoryScore: 0,
            routineScore: 0,
            overallScore: 0
          };

      // Match game sessions on this calendar day
      const daySessions = (gameSessions || []).filter(session => {
        if (!session.timestamp) return false;
        const sDate = new Date(session.timestamp);
        return (
          sDate.getFullYear() === dayDate.getFullYear() &&
          sDate.getMonth() === dayDate.getMonth() &&
          sDate.getDate() === dayDate.getDate()
        );
      });

      let memoryScore = fallbackEntry.memoryScore;
      let isRealSession = false;

      if (daySessions.length > 0) {
        isRealSession = true;
        const totalAccuracyOrScore = daySessions.reduce((sum, s) => {
          if (Array.isArray(s.roundDetails) && s.roundDetails.length > 0) {
            const avgAcc = s.roundDetails.reduce((aSum, r) => aSum + (r.accuracy || 0), 0) / s.roundDetails.length;
            return sum + avgAcc;
          }
          const normalized = s.score > 100 ? (s.score / 500) * 100 : s.score;
          return sum + normalized;
        }, 0);
        memoryScore = Math.round(totalAccuracyOrScore / daySessions.length);
        memoryScore = Math.min(100, Math.max(0, memoryScore));
      }

      let routineScore = fallbackEntry.routineScore;
      if (isToday && totalTodayCount > 0) {
        routineScore = Math.round((completedTodayCount / totalTodayCount) * 100);
      }

      let overallScore = 0;
      if (isRealSession && routineScore > 0) {
        overallScore = Math.round((memoryScore + routineScore) / 2);
      } else if (isRealSession) {
        overallScore = memoryScore;
      } else if (routineScore > 0) {
        overallScore = routineScore;
      } else if (isDemo) {
        overallScore = fallbackEntry.overallScore;
      }

      return {
        day: dayLabel,
        memoryScore,
        routineScore,
        overallScore,
        isRealSession,
        sessionCount: daySessions.length
      };
    });
  }, [gameSessions, selectedPatient, completedTodayCount, totalTodayCount, isDemo]);

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
        <div className="bg-white rounded-2xl p-4 sm:p-8 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4 sm:space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-slate-100">
            
            {/* Avatar & Patient Info */}
            <div className="flex items-center gap-3.5 sm:gap-5">
              <img
                src={selectedPatient.avatar}
                alt={selectedPatient.name}
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs"
              />
              <div className="space-y-1 sm:space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate">
                    {selectedPatient.name}
                  </h1>
                  <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 bg-teal-50 text-teal-800 rounded-md border border-teal-200">
                    {selectedPatient.cognitiveStage || 'Tier 1'}
                  </span>
                  {selectedPatient.hasBiometric && (
                    <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200 flex items-center gap-1">
                      <Fingerprint className="w-3 h-3 text-emerald-600" />
                      <span>Biometric Ready</span>
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {selectedPatient.age} yrs • {selectedPatient.location} • {selectedPatient.nativeLanguage}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                  Primary Clinician: <strong className="text-slate-700 font-semibold">{selectedPatient.primaryCaregiver || 'Dr. Ananya Sharma'}</strong>
                </p>
              </div>
            </div>

            {/* Top Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={() => handleOpenEditModal(selectedPatient)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-[11px] sm:text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Edit clinical parameters, biometrics & notes"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </button>

              <button
                onClick={() => switchToPatientView(selectedPatient)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] sm:text-xs font-bold transition-all cursor-pointer border border-slate-300"
                title="Open the elderly-friendly touch/voice companion view"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                <span>Preview Patient Portal</span>
              </button>

              {isDemo ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 text-slate-400 text-[11px] sm:text-xs font-semibold cursor-not-allowed border border-slate-200"
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] sm:text-xs font-bold transition-colors cursor-pointer border border-rose-200"
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
              <p className="text-xl font-bold text-slate-900">
                {totalTodayCount === 0 
                  ? '0 of 0 Completed (No routines scheduled)' 
                  : `${completedTodayCount} of ${totalTodayCount} Completed (${progressPct}%)`
                }
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Engagement Streak</p>
              <p className="text-xl font-bold text-amber-900 flex items-center gap-1">
                <Flame className="w-4 h-4 text-amber-800" />
                <span>{selectedPatient.streakDays ?? (isDemo ? 14 : 0)} Consecutive Days</span>
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Emergency Contact Phone</p>
              <p className="text-sm font-bold text-slate-900">{selectedPatient.emergencyContact || selectedPatient.phone || 'None registered'}</p>
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* 2. AI COGNITIVE HEALTH & CLINICAL STATUS PANEL           */}
        {/* ======================================================== */}
        <div className="bg-gradient-to-br from-[#0B251E] via-[#0E382B] to-[#071A15] text-white rounded-2xl p-6 sm:p-8 border border-emerald-600/30 shadow-md space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                    AI Cognitive Health & Clinical Status
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                    Adaptive AI
                  </span>
                </div>
                <p className="text-xs text-emerald-200/70">
                  Continuous multi-domain telemetry and automated cognitive risk assessment.
                </p>
              </div>
            </div>

            {/* Live Model Source Badge */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${
                mlEvaluation?.source === 'ml_model'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-teal-500/20 text-teal-300 border-teal-500/40'
              }`}>
                <span className={`w-2 h-2 rounded-full ${mlEvaluation?.source === 'ml_model' ? 'bg-emerald-400 animate-ping' : 'bg-teal-400'}`} />
                <span>{mlEvaluation?.source === 'ml_model' ? 'dementia-ai-engine (Live Telemetry)' : 'Continuous AI Monitoring'}</span>
              </span>
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
            
            {/* 1. Clinical Status */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
              <p className="text-[11px] font-bold text-emerald-200/70 uppercase tracking-wider">Clinical Status (AI Evaluated)</p>
              <div className="pt-0.5">
                {(() => {
                  const status = mlEvaluation?.clinicalStatus || (isDemo ? (selectedPatient?.clinicalStatus || 'Stable') : (gameSessions.length > 0 ? 'Evaluating' : 'Pending Assessment'));
                  const isStable = status.toLowerCase().includes('stable');
                  const isMild = status.toLowerCase().includes('mild') || status.toLowerCase().includes('monitor');
                  const isPending = status.toLowerCase().includes('pending');
                  return (
                    <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-black text-sm border ${
                      isPending
                        ? 'bg-slate-500/25 text-slate-300 border-slate-500/40'
                        : isStable
                        ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40'
                        : isMild
                        ? 'bg-amber-500/25 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/25 text-rose-300 border-rose-500/40 animate-pulse'
                    }`}>
                      <Activity className="w-4 h-4" />
                      <span>{status}</span>
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* 2. Cognitive Health Score */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[11px] font-bold text-emerald-200/70 uppercase tracking-wider">Cognitive Health Score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">
                  {mlEvaluation?.cognitiveHealthScore ?? (isDemo ? (selectedPatient?.cognitiveHealthScore || 88) : (gameSessions.length > 0 ? 70 : 0))}
                </span>
                <span className="text-xs text-emerald-200/60 font-bold">/ 100</span>
                <span className="text-xs text-emerald-300 font-bold ml-auto flex items-center gap-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isDemo || gameSessions.length > 0 ? 'AI Score' : 'Baseline'}</span>
                </span>
              </div>
            </div>

            {/* 3. Recommended Next Difficulty */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[11px] font-bold text-emerald-200/70 uppercase tracking-wider">Recommended Difficulty Tier</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-300">
                  Level {mlEvaluation?.recommendedDifficulty || (isDemo ? (selectedPatient?.recommendedDifficulty || 2) : 1)}
                </span>
                <span className="text-xs text-emerald-200/70 font-semibold">({isDemo || gameSessions.length > 0 ? 'Adaptive AI' : 'Initial Tier'})</span>
              </div>
            </div>

          </div>

          {/* AI Reasoning Callout */}
          <div className="p-4 rounded-xl bg-black/25 border border-white/10 flex items-start gap-3 text-xs text-slate-200 relative z-10">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-white text-xs sm:text-sm">Clinical AI Observation & Recommendations:</p>
              <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                {mlEvaluation?.aiReasoning || (isDemo 
                  ? (selectedPatient?.aiReasoning || "Recent engagement remains consistent. Slight variation was observed in sequence recall, while routine adherence has improved over the last 7 days.")
                  : (gameSessions.length > 0 
                      ? "Initial session data recorded. AI telemetry analyzing accuracy and response timing." 
                      : "No cognitive sessions recorded yet. Have the patient complete memory games in the patient portal to generate live AI clinical evaluation."
                    )
                )}
              </p>
              {mlEvaluation?.weeklyAggregates && mlEvaluation.weeklyAggregates.gamesPlayedThisWeek > 0 && (
                <span className="block text-[11px] text-emerald-300/80 font-mono mt-1">
                  Weekly Telemetry: {mlEvaluation.weeklyAggregates.gamesPlayedThisWeek} game(s) played • Avg reaction time: {mlEvaluation.weeklyAggregates.avgReactionTime}s • Mistakes: {mlEvaluation.weeklyAggregates.totalMistakesThisWeek}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. 7-DAY COGNITIVE PERFORMANCE CHART (REAL DATA BLENDED) */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-teal-800" />
              <span>7-Day Cognitive Performance & Routine Stability</span>
            </h3>
            <div className="flex items-center gap-2">
              {gameSessions && gameSessions.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Real Game Sessions Synced ({gameSessions.length})</span>
                </span>
              ) : isDemo ? (
                <span className="text-xs text-slate-500 font-semibold">
                  Clinical Score Scale (0-100)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 shadow-2xs">
                  <span>Awaiting Telemetry (0 Sessions)</span>
                </span>
              )}
            </div>
          </div>

          {!isDemo && (!gameSessions || gameSessions.length === 0) && (
            <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs text-amber-900 flex items-center gap-2.5">
              <span className="text-base shrink-0">📊</span>
              <span>No cognitive game sessions recorded this week. Have the patient play daily challenges in the Patient Portal to generate live performance history.</span>
            </div>
          )}

          <div className="w-full h-64 bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={blended7DayPerformance}>
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
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
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
        </div>

        {/* ======================================================== */}
        {/* 2b. COGNITIVE GAMES ACTIVITY (REAL MONGO SESSIONS)       */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Cognitive Games Activity</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                      {gameSessions.length} {gameSessions.length === 1 ? 'Session' : 'Sessions'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Gameplay telemetry and round-by-round recall history.
                  </p>
                </div>
              </div>
            </div>

            {gameSessions.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadPatientGames}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-bold transition-all cursor-pointer border border-slate-200"
                  title="Refresh game sessions from database"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/caregiver/patient/${patientIdParam}/games`)}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                  title="Open dedicated page where every game is fully expanded"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Expand All on Full Page</span>
                </button>
              </div>
            )}
          </div>

          {/* Sessions List or Loading or Error or Empty State */}
          {isGamesLoading ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <Gamepad2 className="w-6 h-6 text-teal-700 mx-auto animate-pulse" />
              <p className="text-xs font-bold text-slate-600">Loading patient game sessions from database...</p>
            </div>
          ) : gamesLoadError ? (
            <div className="p-6 text-center bg-rose-50/80 rounded-2xl border border-rose-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto text-lg">
                ⚠️
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-rose-900">Failed to load game telemetry</p>
                <p className="text-xs text-rose-700 max-w-md mx-auto">{gamesLoadError}</p>
              </div>
              <button
                type="button"
                onClick={loadPatientGames}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : gameSessions.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto text-xl shadow-xs">
                🎮
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  No games played yet
                </p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Encourage <strong className="text-slate-700">{selectedPatient.name.split(' ')[0]}</strong> to try today's featured recall games in the Patient Portal to begin recording cognitive health metrics!
                </p>
              </div>
              <button
                type="button"
                onClick={() => switchToPatientView(selectedPatient)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Launch Patient Portal Games</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {(isGamesExpanded ? gameSessions : gameSessions.slice(0, 3)).map((session, sIdx) => {
                const sId = session._id || session.id || `session-${sIdx}`;
                const isExpanded = expandedSessionIds.has(sId);
                const info = getGameBadgeInfo(session.gameType, session.title);
                const IconComponent = info.icon;
                const hasRounds = Array.isArray(session.roundDetails) && session.roundDetails.length > 0;
                
                // Calculate performance telemetry
                let accuracySummary = '';
                let avgAccuracy = null;
                if (hasRounds) {
                  const totalAcc = session.roundDetails.reduce((sum, r) => sum + (r.accuracy || 0), 0);
                  avgAccuracy = Math.round(totalAcc / session.roundDetails.length);
                  const totalCorr = session.roundDetails.reduce((sum, r) => sum + (r.correctCount || 0), 0);
                  const totalAtt = session.roundDetails.reduce((sum, r) => sum + (r.totalAttempts || 0), 0);
                  accuracySummary = `${avgAccuracy}% accuracy across ${session.roundDetails.length} levels (${totalCorr}/${totalAtt} attempts)`;
                } else {
                  accuracySummary = `Completed with score of ${session.score} points`;
                }

                return (
                  <div
                    key={sId}
                    className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs hover:border-teal-300 transition-all"
                  >
                    {/* Main Row */}
                    <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      {/* Left: Icon & Game Info */}
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className={`p-3 rounded-2xl border shrink-0 ${info.iconBg}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                              {info.name}
                            </h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${info.badgeBg}`}>
                              {info.category}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                              {session.difficultyLevel ? `Difficulty: ${session.difficultyLevel}` : 'Standard'}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            <span className="font-semibold text-slate-700 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {formatSessionTimestamp(session.timestamp)}
                            </span>
                            {session.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                Duration: <strong className="text-slate-700 font-semibold">{session.duration}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Metrics & Expand Round-by-Round Accordion */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Score</p>
                            <p className="text-sm font-extrabold text-slate-900">{session.score || 0}</p>
                          </div>
                          {avgAccuracy !== null && (
                            <div className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-center">
                              <p className="text-[10px] text-teal-700 font-bold uppercase tracking-wider">Accuracy</p>
                              <p className="text-sm font-extrabold text-teal-900">{avgAccuracy}%</p>
                            </div>
                          )}
                        </div>

                        {hasRounds && (
                          <button
                            type="button"
                            onClick={() => toggleSessionExpand(sId)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer border border-slate-300 shadow-2xs flex items-center gap-1"
                          >
                            <span>{isExpanded ? 'Hide Levels' : 'View Levels'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-600" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-600" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Summary Row */}
                    <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-semibold">{accuracySummary}</span>
                      </div>
                      {session.roundsCompleted && (
                        <span className="text-[11px] font-medium text-slate-500">
                          {session.roundsCompleted} round(s) logged
                        </span>
                      )}
                    </div>

                    {/* Expanded Level Telemetry */}
                    {isExpanded && (
                      <div className="p-4 bg-slate-50/70 border-t border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Level-by-Level Playthrough Breakdown
                          </p>
                          {hasRounds && (
                            <span className="text-[11px] text-slate-500">
                              {session.roundDetails.length} levels analyzed
                            </span>
                          )}
                        </div>

                        {hasRounds ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                            {session.roundDetails.map((round, rIdx) => {
                              const acc = round.accuracy !== undefined 
                                ? round.accuracy 
                                : (round.totalAttempts ? Math.round((round.correctCount / round.totalAttempts) * 100) : 100);
                              const isHighAcc = acc >= 80;
                              const isMediumAcc = acc >= 50 && acc < 80;

                              return (
                                <div
                                  key={rIdx}
                                  className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-900">
                                      Round {round.roundNumber || rIdx + 1}
                                    </span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                                      isHighAcc 
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                        : isMediumAcc 
                                          ? 'bg-amber-50 text-amber-800 border-amber-200' 
                                          : 'bg-rose-50 text-rose-800 border-rose-200'
                                    }`}>
                                      {acc}%
                                    </span>
                                  </div>

                                  <div className="space-y-1 text-[11px] text-slate-600">
                                    <p className="font-semibold text-slate-800 truncate" title={formatRoundMode(round.mode)}>
                                      {formatRoundMode(round.mode)}
                                    </p>
                                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                                      <span>{round.itemCount ? `${round.itemCount} items` : 'Standard'}</span>
                                      <span>{round.timeTakenSeconds ? `${round.timeTakenSeconds}s` : 'N/A'}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${
                                          isHighAcc ? 'bg-emerald-600' : isMediumAcc ? 'bg-amber-500' : 'bg-rose-500'
                                        }`}
                                        style={{ width: `${acc}%` }}
                                      />
                                    </div>
                                    <p className="text-[10px] text-slate-500 text-right">
                                      {round.correctCount !== undefined && round.totalAttempts !== undefined 
                                        ? `${round.correctCount}/${round.totalAttempts} correct`
                                        : 'Passed'}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                            <span>Playthrough recorded with score of <strong>{session.score} points</strong>.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Expand All / Collapse Toggle for Game History */}
              {gameSessions.length > 3 && (
                <div className="pt-2 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setIsGamesExpanded(!isGamesExpanded)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer border border-slate-300 shadow-2xs flex items-center gap-2"
                  >
                    {isGamesExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4 text-slate-600" />
                        <span>Show Less (Top 3 Sessions)</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 text-slate-600" />
                        <span>Expand Game History (+{gameSessions.length - 3} More Sessions)</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 3. TODAY'S ROUTINE PLANNER & SCHEDULED SLOTS             */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-5">
          
          {/* Section Header with Action Buttons */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Daily Schedule & Routine Planner</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                      {totalTodayCount} {totalTodayCount === 1 ? 'Slot' : 'Slots'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Chronological morning-to-night care schedule synced with Patient Portal and Daily Routine games.
                  </p>
                </div>
              </div>
            </div>

            {/* Caregiver Actions: Apply Template, Add Custom, Clear */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleOpenTemplateModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Open 10-routine placeholder template manager"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                <span>10-Routine Template</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddRoutine}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer border border-slate-300"
                title="Add a custom routine slot"
              >
                <Plus className="w-3.5 h-3.5 text-slate-700" />
                <span>Add Routine</span>
              </button>

              {totalTodayCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllRoutinesClick}
                  disabled={routineActionLoading}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors border border-slate-200 cursor-pointer"
                  title="Clear all routines"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Routine Feedback Toast */}
          {routineToast && (
            <div className="p-3.5 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl flex items-center justify-between text-xs font-bold shadow-2xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                <span>{routineToast}</span>
              </div>
              <button onClick={() => setRoutineToast('')} className="text-slate-400 hover:text-slate-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Time-of-Day Filter Tabs */}
          {totalTodayCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80 w-fit">
              {[
                { id: 'all', label: 'All Slots', icon: null },
                { id: 'morning', label: 'Morning', icon: Sun },
                { id: 'afternoon', label: 'Afternoon', icon: Sun },
                { id: 'evening', label: 'Evening', icon: Sunset },
                { id: 'night', label: 'Night', icon: Moon }
              ].map(tab => {
                const count = tab.id === 'all' 
                  ? (selectedPatient.todayReminders?.length || 0)
                  : (selectedPatient.todayReminders?.filter(r => getRoutinePeriodFromTime(r.time).toLowerCase() === tab.id).length || 0);

                const isActive = routineFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setRoutineFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive 
                        ? 'bg-white text-teal-900 shadow-xs border border-slate-200/80' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-teal-100 text-teal-900' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Routine Slots List / Empty State */}
          {(!selectedPatient.todayReminders || selectedPatient.todayReminders.length === 0) ? (
            <div className="p-8 sm:p-10 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center mx-auto text-2xl shadow-xs">
                ⏰
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="text-base font-extrabold text-slate-900">
                  No Daily Routines Configured
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Apply our recommended <strong>10 Morning-to-Night Placeholders Template</strong> (covering wake-up, medicines, meals, cognitive exercises, walks, and sleep), or add custom slots individually.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleOpenTemplateModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-teal-300" />
                  <span>Apply 10-Routine Template</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddRoutine}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 shadow-2xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-slate-700" />
                  <span>Add Single Slot</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {(() => {
                  const filteredRoutines = (selectedPatient.todayReminders || []).filter(rem => {
                    if (routineFilter === 'all') return true;
                    return getRoutinePeriodFromTime(rem.time).toLowerCase() === routineFilter;
                  });
                  const displayedRoutines = isRoutinesExpanded ? filteredRoutines : filteredRoutines.slice(0, 3);

                  return displayedRoutines.map((rem, remIdx) => {
                    const isDone = rem.status === 'completed' || rem.acknowledged === true;
                    const typeCfg = ROUTINE_TYPE_CONFIG[rem.type] || ROUTINE_TYPE_CONFIG.other;
                    const IconComp = typeCfg.icon || Clock;
                    const period = getRoutinePeriodFromTime(rem.time);
                    const remId = rem._id || rem.id || `rem-idx-${remIdx}`;

                    return (
                      <div
                        key={remId}
                        className={`p-4 sm:p-4.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-2xs group hover:border-teal-300 ${
                          isDone 
                            ? 'bg-emerald-50/50 border-emerald-200/90' 
                            : 'bg-slate-50/70 border-slate-200/90'
                        }`}
                      >
                        {/* Top row: Icon, Time, Period, and Edit/Delete */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${typeCfg.color}`}>
                              <IconComp className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-slate-900">
                                  {rem.time || '09:00 AM'}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-white border border-slate-200 text-slate-600">
                                  {period}
                                </span>
                              </div>
                              <h4 className="font-extrabold text-sm text-slate-900 mt-0.5 line-clamp-1">
                                {rem.title}
                              </h4>
                            </div>
                          </div>

                          {/* Edit & Delete Quick Icons */}
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleOpenEditRoutine(rem)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-teal-800 hover:bg-teal-50 transition-colors cursor-pointer"
                              title="Edit this routine"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRoutineClick(remId, rem.title)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete this routine"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Detail / Description note */}
                        {rem.detail && (
                          <p className="text-xs text-slate-600 bg-white/80 p-2.5 rounded-xl border border-slate-200/70 line-clamp-2">
                            {rem.detail}
                          </p>
                        )}

                        {/* Bottom row: Type tag & Acknowledgment button */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${typeCfg.color}`}>
                            {typeCfg.label}
                          </span>

                          <button
                            type="button"
                            onClick={() => toggleReminder(selectedPatient.id, remId)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                              isDone 
                                ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs' 
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 shadow-2xs'
                            }`}
                          >
                            {isDone ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                                <span>Acknowledged</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>Mark Done</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Expand All / Collapse Toggle for Daily Routines */}
              {(() => {
                const filteredRoutines = (selectedPatient.todayReminders || []).filter(rem => {
                  if (routineFilter === 'all') return true;
                  return getRoutinePeriodFromTime(rem.time).toLowerCase() === routineFilter;
                });
                if (filteredRoutines.length <= 3) return null;

                return (
                  <div className="pt-2 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setIsRoutinesExpanded(!isRoutinesExpanded)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer border border-slate-300 shadow-2xs flex items-center gap-2"
                    >
                      {isRoutinesExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4 text-slate-600" />
                          <span>Show Less (Top 3 Routines)</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 text-slate-600" />
                          <span>Expand All (+{filteredRoutines.length - 3} More Reminders)</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
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
        {/* 5. FAMILY MEMORY BANK & PHOTOS (REAL MONGODB VAULT)      */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                <Image className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Family Memory Bank & Tagged Photos ({patientPhotosList.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Cherished family portraits and landmarks used in cognitive recall
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddPhotoModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Memory Photo</span>
            </button>
          </div>

          {isPhotoLoading ? (
            <div className="p-6 text-center text-xs text-slate-400">Loading memory bank photos from MongoDB...</div>
          ) : patientPhotosList.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200/80">
              No custom memory photos uploaded yet. Click "Add Memory Photo" to upload family pictures for this patient.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {patientPhotosList.map((photo) => (
                <div 
                  key={photo._id || photo.id} 
                  className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex flex-col justify-between gap-2.5 group hover:border-slate-300 transition-all relative"
                >
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-200 border border-slate-300/60">
                    <img
                      src={photo.photoUrl || photo.imageUrl || photo.image}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {photo.year || '2024'}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{photo.title}</h4>
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo._id || photo.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-teal-800 font-bold">{photo.relation || photo.taggedName || 'Family Member'}</p>
                    <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{photo.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 7. CLINICAL & MEDICAL NOTES CARD                         */}
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
                    src={avatarPreview || editForm.avatar || '/avatars/ramesh_sharma.png'}
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
                      Active
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
                      ? 'Biometric Registered Successfully' 
                      : selectedPatient.hasBiometric 
                      ? 'Re-register Fingerprint / Face ID' 
                      : 'Set up Biometric Sensor for this Patient'}
                  </span>
                </button>
              </div>

              {isSavedSuccessfully && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold text-center">
                  Clinical record updated successfully.
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

      {/* ======================================================== */}
      {/* MODAL: ADD MEMORY BANK PHOTO                            */}
      {/* ======================================================== */}
      {showAddPhotoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 relative my-8 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Image className="w-5 h-5 text-teal-800" />
                <h3 className="text-base font-bold text-slate-900">Add Memory Bank Photo</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPhotoModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPhotoSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Garden Walk with Sister"
                  value={newPhotoForm.title}
                  onChange={(e) => setNewPhotoForm({ ...newPhotoForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-700 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL / Portrait Link *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={newPhotoForm.photoUrl}
                  onChange={(e) => setNewPhotoForm({ ...newPhotoForm, photoUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-700 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tagged Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Ananya"
                    value={newPhotoForm.taggedName}
                    onChange={(e) => setNewPhotoForm({ ...newPhotoForm, taggedName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-700 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    placeholder="e.g. Daughter"
                    value={newPhotoForm.relation}
                    onChange={(e) => setNewPhotoForm({ ...newPhotoForm, relation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-700 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Year</label>
                  <input
                    type="text"
                    placeholder="2023"
                    value={newPhotoForm.year}
                    onChange={(e) => setNewPhotoForm({ ...newPhotoForm, year: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-700 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="Assam"
                    value={newPhotoForm.location}
                    onChange={(e) => setNewPhotoForm({ ...newPhotoForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-700 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Memory Description & Notes</label>
                <textarea
                  rows="2"
                  placeholder="Cherished family moment..."
                  value={newPhotoForm.description}
                  onChange={(e) => setNewPhotoForm({ ...newPhotoForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-700 text-slate-900"
                />
              </div>

              {/* DPDP Act 2023 Explicit Consent Checkbox */}
              <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/90 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="dpdpPhotoConsent"
                  required
                  checked={newPhotoForm.dpdpConsentGiven || false}
                  onChange={(e) => setNewPhotoForm({ ...newPhotoForm, dpdpConsentGiven: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded text-teal-800 focus:ring-teal-700 cursor-pointer accent-teal-800 shrink-0"
                />
                <label htmlFor="dpdpPhotoConsent" className="text-[11px] text-slate-700 leading-relaxed cursor-pointer select-none">
                  I confirm I have consent to upload this photo and understand it will be used within Smriti to support <strong>{selectedPatient?.name || 'this patient'}</strong>'s cognitive care, per our{' '}
                  <Link 
                    to="/privacy-policy" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-teal-800 font-bold underline hover:text-teal-950 inline-flex items-center gap-0.5"
                  >
                    Privacy Policy
                  </Link>.
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddPhotoModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={photoSaveStatus === 'saving' || !newPhotoForm.photoUrl || !newPhotoForm.title || !newPhotoForm.dpdpConsentGiven}
                  className="px-5 py-2 rounded-xl bg-teal-800 text-white font-bold hover:bg-teal-900 cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {photoSaveStatus === 'saving' ? 'Saving to Database...' : 'Save to Memory Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD CUSTOM ROUTINE SLOT                           */}
      {/* ======================================================== */}
      {showAddRoutineModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 relative my-8 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-200">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Add Scheduled Routine Slot
                  </h3>
                  <p className="text-xs text-slate-500">
                    For {selectedPatient.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddRoutineModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRoutineSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scheduled Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 08:30 AM"
                    value={routineForm.time}
                    onChange={(e) => setRoutineForm({ ...routineForm, time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-700 text-slate-900 font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Format: HH:MM AM/PM</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category / Type *</label>
                  <select
                    value={routineForm.type}
                    onChange={(e) => setRoutineForm({ ...routineForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-700 text-slate-900 font-semibold cursor-pointer"
                  >
                    <option value="medicine">Prescription Medicine</option>
                    <option value="hydration">Hydration / Tea</option>
                    <option value="meal">Meal / Nutrition</option>
                    <option value="game">Cognitive Game</option>
                    <option value="activity">Physical Activity / Walk</option>
                    <option value="rest">Rest & Wind-down</option>
                    <option value="appointment">Clinical Appointment</option>
                    <option value="social">Family & Social</option>
                    <option value="other">General Routine</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Routine Title / Task *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Donepezil 5mg Prescriptions"
                  value={routineForm.title}
                  onChange={(e) => setRoutineForm({ ...routineForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-700 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Instructions & Notes</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Take with 1 glass of warm water after light meal"
                  value={routineForm.detail}
                  onChange={(e) => setRoutineForm({ ...routineForm, detail: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-700 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddRoutineModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={routineActionLoading || !routineForm.title.trim()}
                  className="px-5 py-2 rounded-xl bg-teal-800 text-white font-bold hover:bg-teal-900 cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{routineActionLoading ? 'Saving...' : 'Add Routine Slot'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT ROUTINE SLOT                                 */}
      {/* ======================================================== */}
      {showEditRoutineModal && editingRoutine && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 relative my-8 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-200">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Edit Scheduled Routine
                  </h3>
                  <p className="text-xs text-slate-500">
                    Modify time, task title, category, or clinical notes
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditRoutineModal(false);
                  setEditingRoutine(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditRoutineSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scheduled Time *</label>
                  <input
                    type="text"
                    required
                    value={routineForm.time}
                    onChange={(e) => setRoutineForm({ ...routineForm, time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-700 text-slate-900 font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Format: HH:MM AM/PM</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category / Type *</label>
                  <select
                    value={routineForm.type}
                    onChange={(e) => setRoutineForm({ ...routineForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-700 text-slate-900 font-semibold cursor-pointer"
                  >
                    <option value="medicine">Prescription Medicine</option>
                    <option value="hydration">Hydration / Tea</option>
                    <option value="meal">Meal / Nutrition</option>
                    <option value="game">Cognitive Game</option>
                    <option value="activity">Physical Activity / Walk</option>
                    <option value="rest">Rest & Wind-down</option>
                    <option value="appointment">Clinical Appointment</option>
                    <option value="social">Family & Social</option>
                    <option value="other">General Routine</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Routine Title / Task *</label>
                <input
                  type="text"
                  required
                  value={routineForm.title}
                  onChange={(e) => setRoutineForm({ ...routineForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-700 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Instructions & Notes</label>
                <textarea
                  rows="2"
                  value={routineForm.detail}
                  onChange={(e) => setRoutineForm({ ...routineForm, detail: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-700 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditRoutineModal(false);
                    setEditingRoutine(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={routineActionLoading || !routineForm.title.trim()}
                  className="px-5 py-2 rounded-xl bg-teal-800 text-white font-bold hover:bg-teal-900 cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{routineActionLoading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: 10-ROUTINE PLACEHOLDER TEMPLATE BUILDER           */}
      {/* ======================================================== */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-5 sm:p-7 relative my-8 animate-in fade-in zoom-in-95 space-y-4 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200">
                  <Sparkles className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>10-Slot Routine Template</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                      Morning to Night
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chronologically structured daily routine. You can edit any value before applying.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Editable List of 10 Slots */}
            <div className="overflow-y-auto space-y-3 pr-1 py-1 flex-1">
              {templateFormList.map((item, idx) => {
                const typeCfg = ROUTINE_TYPE_CONFIG[item.type] || ROUTINE_TYPE_CONFIG.other;
                const IconComp = typeCfg.icon || Clock;

                return (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2.5 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-teal-800 text-white font-black text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Slot {idx + 1} • {getRoutinePeriodFromTime(item.time)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteTemplateItem(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        title="Remove this slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs">
                      {/* Time Input */}
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Time</label>
                        <input
                          type="text"
                          value={item.time}
                          onChange={(e) => handleTemplateItemChange(idx, 'time', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-teal-700"
                        />
                      </div>

                      {/* Type Selector */}
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Category</label>
                        <select
                          value={item.type}
                          onChange={(e) => handleTemplateItemChange(idx, 'type', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:border-teal-700 cursor-pointer text-xs"
                        >
                          <option value="hydration">Hydration</option>
                          <option value="medicine">Medicine</option>
                          <option value="meal">Meal</option>
                          <option value="game">Brain Game</option>
                          <option value="activity">Walk / Activity</option>
                          <option value="rest">Rest</option>
                          <option value="appointment">Appointment</option>
                          <option value="social">Social</option>
                        </select>
                      </div>

                      {/* Title Input */}
                      <div className="sm:col-span-5">
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Task Title</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleTemplateItemChange(idx, 'title', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:border-teal-700"
                        />
                      </div>
                    </div>

                    {/* Detail / Description input */}
                    <div>
                      <input
                        type="text"
                        placeholder="Instructions / details / dosage notes..."
                        value={item.detail}
                        onChange={(e) => handleTemplateItemChange(idx, 'detail', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 text-xs focus:outline-none focus:border-teal-700"
                      />
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={handleAddTemplateItem}
                className="w-full py-2 border-2 border-dashed border-slate-300 hover:border-teal-700 rounded-xl text-xs font-bold text-slate-600 hover:text-teal-900 flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-slate-50/50"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Slot to Template</span>
              </button>
            </div>

            {/* Modal Footer with Actions */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setTemplateFormList(DEFAULT_10_ROUTINE_TEMPLATE.map(i => ({ ...i })))}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Reset to Standard 10
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={routineActionLoading || templateFormList.length === 0}
                  onClick={() => handleApplyTemplateSubmit(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer border border-slate-300"
                  title="Keep existing routines and append these"
                >
                  Append ({templateFormList.length})
                </button>
                <button
                  type="button"
                  disabled={routineActionLoading || templateFormList.length === 0}
                  onClick={() => handleApplyTemplateSubmit(true)}
                  className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                  title="Replace today's schedule with this customized template"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>{routineActionLoading ? 'Applying...' : `Apply & Replace (${templateFormList.length})`}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </CaregiverLayout>
  );
}
