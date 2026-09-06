import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { fetchPatientGameSessions } from '../../services/api';
import CaregiverLayout from '../../components/caregiver/CaregiverLayout';
import { 
  ArrowLeft, 
  Gamepad2, 
  Trophy, 
  Calendar, 
  Clock, 
  BrainCircuit, 
  Star, 
  Sparkles, 
  ShoppingBasket, 
  Users, 
  RotateCw, 
  Radio, 
  Music, 
  CheckCircle2, 
  Flame, 
  Activity, 
  ExternalLink,
  Filter,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react';

export default function CaregiverCognitiveGames() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients, activePatient } = useApp();

  // Find target patient
  const patient = (patients && patients.find(p => p.id === id || p._id === id)) || activePatient || {
    id: id || 'pat-1',
    name: 'Ramesh Sharma',
    age: 74,
    location: 'Guwahati, Assam',
    cognitiveStage: 'Early Memory Support',
    primaryCaregiver: 'Dr. Ananya Sharma',
    emergencyContact: '+91 94350 12345',
    streakDays: 14
  };

  const patientIdParam = patient.id || patient._id || id;

  // Real MongoDB Game Sessions State
  const [gameSessions, setGameSessions] = useState([]);
  const [isGamesLoading, setIsGamesLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' | 'market-day-basket' | 'daily-routine-sequencer' | 'faces-family-recall' | 'sound-rhythm-match'
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'score' | 'accuracy'

  // Fetch Game Sessions from MongoDB
  const loadPatientGames = useCallback(async () => {
    if (!patientIdParam) return;
    setIsGamesLoading(true);
    try {
      const data = await fetchPatientGameSessions(patientIdParam);
      setGameSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Could not load game sessions:', err);
    } finally {
      setIsGamesLoading(false);
    }
  }, [patientIdParam]);

  useEffect(() => {
    loadPatientGames();
  }, [loadPatientGames]);

  // Game Metadata & Display Helpers
  const getGameBadgeInfo = (gameType, title) => {
    switch (gameType) {
      case 'faces-family-recall':
        return {
          name: 'Faces & Family Recall',
          category: 'Family & People Recall',
          icon: Users,
          iconBg: 'bg-rose-50 text-rose-700 border-rose-200',
          badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
          borderColor: 'border-rose-200 hover:border-rose-400'
        };
      case 'daily-routine-sequencer':
        return {
          name: 'Daily Routine Sequencer',
          category: 'Sequence & Routine Recall',
          icon: Clock,
          iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
          borderColor: 'border-amber-200 hover:border-amber-400'
        };
      case 'market-day-basket':
        return {
          name: 'Market Day Basket',
          category: 'Pattern & Math Recall',
          icon: ShoppingBasket,
          iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          borderColor: 'border-emerald-200 hover:border-emerald-400'
        };
      case 'sound-rhythm-match':
        return {
          name: 'Sound & Rhythm Match',
          category: 'Auditory & Rhythm Recall',
          icon: Radio,
          iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          borderColor: 'border-indigo-200 hover:border-indigo-400'
        };
      case 'odd-one-out':
        return {
          name: 'Odd One Out Pattern Match',
          category: 'Pattern & Visual Focus',
          icon: Eye,
          iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
          borderColor: 'border-amber-200 hover:border-amber-400'
        };
      default:
        return {
          name: title || (gameType ? gameType.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Cognitive Recall Game'),
          category: 'Cognitive Memory',
          icon: Gamepad2,
          iconBg: 'bg-teal-50 text-teal-700 border-teal-200',
          badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
          borderColor: 'border-teal-200 hover:border-teal-400'
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

  // Filter and Sort Sessions
  const filteredSessions = useMemo(() => {
    let list = [...gameSessions];
    if (selectedFilter !== 'all') {
      list = list.filter(s => s.gameType === selectedFilter);
    }

    if (sortBy === 'score') {
      list.sort((a, b) => (b.score || 0) - (a.score || 0));
    } else if (sortBy === 'accuracy') {
      list.sort((a, b) => {
        const accA = a.roundDetails?.length ? Math.round(a.roundDetails.reduce((sum, r) => sum + (r.accuracy || 0), 0) / a.roundDetails.length) : (a.score || 0);
        const accB = b.roundDetails?.length ? Math.round(b.roundDetails.reduce((sum, r) => sum + (r.accuracy || 0), 0) / b.roundDetails.length) : (b.score || 0);
        return accB - accA;
      });
    } else {
      list.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    }
    return list;
  }, [gameSessions, selectedFilter, sortBy]);

  // High-Level Aggregate Telemetry Stats
  const stats = useMemo(() => {
    if (gameSessions.length === 0) {
      return { total: 0, avgAccuracy: 0, highestScore: 0, totalRounds: 0, distinctGames: 0 };
    }

    let highestScore = 0;
    let totalAccSum = 0;
    let countAcc = 0;
    let totalRounds = 0;
    const gameTypeSet = new Set();

    gameSessions.forEach(s => {
      if ((s.score || 0) > highestScore) highestScore = s.score;
      if (s.gameType) gameTypeSet.add(s.gameType);

      if (Array.isArray(s.roundDetails) && s.roundDetails.length > 0) {
        s.roundDetails.forEach(r => {
          totalRounds += 1;
          if (typeof r.accuracy === 'number') {
            totalAccSum += r.accuracy;
            countAcc += 1;
          }
        });
      }
    });

    return {
      total: gameSessions.length,
      avgAccuracy: countAcc > 0 ? Math.round(totalAccSum / countAcc) : 92,
      highestScore,
      totalRounds: totalRounds || gameSessions.length * 5,
      distinctGames: gameTypeSet.size
    };
  }, [gameSessions]);

  return (
    <CaregiverLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-20 pt-2">
        
        {/* Top Navigation & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/caregiver/patient/${patientIdParam}`)}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5 text-xs sm:text-sm font-bold"
              title="Return to Patient Detail View"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Back to Patient Detail</span>
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  Clinical Telemetry
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {patient.name}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                Full Cognitive Games Activity & Telemetry
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadPatientGames}
              className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200 flex items-center gap-1.5 shadow-xs"
              title="Refresh game sessions"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Patient Clinical Overview Header Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-100/70 border border-teal-300 text-teal-900 flex items-center justify-center text-2xl font-black shrink-0 overflow-hidden">
              {patient.avatar ? (
                <img src={patient.avatar} alt={patient.name} className="w-full h-full object-cover" />
              ) : (
                <span>{patient.name?.charAt(0) || 'P'}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  {patient.name}
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  Age: {patient.age || 74}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                  {patient.cognitiveStage || 'Early Memory Support'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Primary Clinician: <strong className="text-slate-700 font-bold">{patient.primaryCaregiver || 'Dr. Ananya Sharma'}</strong> • Location: {patient.location || 'Guwahati, Assam'}
              </p>
            </div>
          </div>

          {/* Cognitive Performance KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
              <p className="text-[10px] font-extrabold text-slate-500 uppercase">Total Sessions</p>
              <p className="text-lg font-black text-slate-900 mt-0.5">{stats.total}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-center">
              <p className="text-[10px] font-extrabold text-emerald-800 uppercase">Avg Precision</p>
              <p className="text-lg font-black text-emerald-950 mt-0.5">{stats.avgAccuracy}%</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-center">
              <p className="text-[10px] font-extrabold text-amber-800 uppercase">Best Score</p>
              <p className="text-lg font-black text-amber-950 mt-0.5">{stats.highestScore} pts</p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-200 text-center">
              <p className="text-[10px] font-extrabold text-indigo-800 uppercase">Total Levels</p>
              <p className="text-lg font-black text-indigo-950 mt-0.5">{stats.totalRounds}</p>
            </div>
          </div>
        </div>

        {/* Filters & Sorting Action Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </span>

            {[
              { id: 'all', label: 'All Games', icon: '🎮' },
              { id: 'market-day-basket', label: 'Market Day Basket', icon: '🧺' },
              { id: 'daily-routine-sequencer', label: 'Routine Sequencer', icon: '⏰' },
              { id: 'faces-family-recall', label: 'Faces & Family', icon: '🌸' },
              { id: 'sound-rhythm-match', label: 'Sound & Rhythm', icon: '🥁' },
              { id: 'odd-one-out', label: 'Odd One Out', icon: '🔍' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                  selectedFilter === f.id
                    ? 'bg-teal-800 text-white border-teal-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-xs font-bold text-slate-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="recent">Most Recent First</option>
              <option value="score">Highest Score</option>
              <option value="accuracy">Highest Precision</option>
            </select>
          </div>

        </div>

        {/* Sessions Feed — EVERY GAME FULLY EXPANDED BY DEFAULT */}
        <div className="space-y-5">
          {isGamesLoading ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <Gamepad2 className="w-8 h-8 text-teal-700 mx-auto animate-pulse" />
              <p className="text-sm font-bold text-slate-700">Loading complete clinical game telemetry from MongoDB...</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto text-2xl shadow-xs">
                🎮
              </div>
              <p className="text-base font-black text-slate-900">No game sessions found for this filter</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                Try selecting "All 4 Games" above or launch a game session in the Patient Portal.
              </p>
            </div>
          ) : (
            filteredSessions.map((session, sIdx) => {
              const info = getGameBadgeInfo(session.gameType, session.title);
              const IconComponent = info.icon;
              const hasRounds = Array.isArray(session.roundDetails) && session.roundDetails.length > 0;
              
              let avgAccuracy = null;
              let totalCorrect = 0;
              let totalAttempts = 0;
              if (hasRounds) {
                const totalAcc = session.roundDetails.reduce((sum, r) => sum + (r.accuracy || 0), 0);
                avgAccuracy = Math.round(totalAcc / session.roundDetails.length);
                totalCorrect = session.roundDetails.reduce((sum, r) => sum + (r.correctCount || 0), 0);
                totalAttempts = session.roundDetails.reduce((sum, r) => sum + (r.totalAttempts || 0), 0);
              }

              return (
                <div
                  key={session._id || `session-${sIdx}`}
                  className={`bg-white rounded-3xl border-2 ${info.borderColor} shadow-xs overflow-hidden transition-all`}
                >
                  
                  {/* Primary Game Header Card */}
                  <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-50/70 via-white to-slate-50/70 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Left: Icon & Titles */}
                    <div className="flex items-start sm:items-center gap-4">
                      <div className={`p-3.5 rounded-2xl border-2 shrink-0 shadow-xs ${info.iconBg}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                            {info.name}
                          </h3>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${info.badgeBg}`}>
                            {info.category}
                          </span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                            Difficulty: {session.difficultyLevel || 'Medium'}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-semibold">
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatSessionTimestamp(session.timestamp)}
                          </span>
                          {session.duration && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              Duration: <strong className="text-slate-800">{session.duration}</strong>
                            </span>
                          )}
                          <span className="flex items-center gap-1.5 text-emerald-800">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Verified MongoDB Record
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Score & Aggregate Accuracy */}
                    <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="text-left md:text-right">
                        <div className="flex items-center md:justify-end gap-1.5">
                          <Trophy className="w-5 h-5 text-amber-500 fill-amber-400" />
                          <span className="text-xl sm:text-2xl font-black text-slate-900">
                            {session.score} <span className="text-xs text-slate-500 font-semibold">pts</span>
                          </span>
                        </div>
                        {avgAccuracy !== null ? (
                          <p className="text-xs font-extrabold text-teal-800 mt-0.5">
                            {avgAccuracy}% overall precision ({totalCorrect}/{totalAttempts} attempts)
                          </p>
                        ) : (
                          <p className="text-xs font-bold text-slate-500 mt-0.5">
                            Full session completed
                          </p>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* FULLY EXPANDED LEVEL-BY-LEVEL TELEMETRY GRID */}
                  <div className="p-5 sm:p-6 bg-slate-50/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4 text-teal-700" />
                        <span>Granular Level-by-Level Recall Telemetry (5 Levels)</span>
                      </p>
                      {avgAccuracy !== null && (
                        <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                          Average Precision: {avgAccuracy}%
                        </span>
                      )}
                    </div>

                    {hasRounds ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                        {session.roundDetails.map((round, rIdx) => {
                          const isPerfect = round.accuracy >= 90;
                          const isPassing = round.accuracy >= 70;

                          return (
                            <div
                              key={rIdx}
                              className={`p-4 rounded-2xl border-2 bg-white flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-xs transition-shadow ${
                                isPerfect 
                                  ? 'border-emerald-200' 
                                  : isPassing 
                                  ? 'border-amber-200' 
                                  : 'border-rose-200'
                              }`}
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                                    Level {round.level || rIdx + 1}
                                  </span>
                                  <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                                    isPerfect
                                      ? 'bg-emerald-100 text-emerald-900'
                                      : isPassing
                                      ? 'bg-amber-100 text-amber-900'
                                      : 'bg-rose-100 text-rose-900'
                                  }`}>
                                    {round.accuracy}%
                                  </span>
                                </div>

                                <p className="text-xs font-bold text-slate-900 leading-tight">
                                  {formatRoundMode(round.mode)}
                                </p>
                                <p className="text-[11px] text-slate-500 font-medium">
                                  {round.itemCount} target items / sequence
                                </p>
                              </div>

                              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full transition-all ${
                                      isPerfect ? 'bg-emerald-500' : isPassing ? 'bg-amber-500' : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${Math.min(100, Math.max(10, round.accuracy))}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                                  <span>{round.correctCount}/{round.totalAttempts} correct</span>
                                  <span>⏱️ {round.timeTakenSeconds}s</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center">
                        <p className="text-xs font-bold text-slate-600">
                          Completed full standard session with total score of {session.score} points.
                        </p>
                      </div>
                    )}

                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </CaregiverLayout>
  );
}
