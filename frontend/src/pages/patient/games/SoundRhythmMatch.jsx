import { speakLocalized } from '../../../utils/speechUtils';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../../context/AppContext';
import { submitGameSessionApi } from '../../../services/api';
import { queueOfflineAction } from '../../../utils/offlineDb';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle2, 
  Trophy, 
  Flame, 
  RotateCcw, 
  ChevronRight, 
  Music, 
  Radio, 
  Play, 
  Star, 
  Clock, 
  Heart,
  ShieldCheck,
  RotateCw
} from 'lucide-react';

const DRUM_SYLLABLES_DISPLAY = ['Dhum', 'Dhit', 'Ta', 'Ting'];
const DRUM_SYLLABLES_TTS = ['Dhoom', 'Dhit', 'Ta', 'Ting']; // "Dhoom" ensures every TTS engine clearly pronounces Dhum

/**
 * Web Audio API Programmatic Synthesizer
 * Zero external audio dependencies, works 100% offline, zero licensing concerns.
 * Features studio-grade DynamicsCompressor limiter bus, layered dual-oscillator
 * percussive synthesis, and speech syllable vocal cues ("Dhum", "Dhit", "Ta", "Ting")
 * for clear, loud, punchy playback on all device speakers.
 */
class RhythmAudioSynth {
  constructor() {
    this.ctx = null;
    this.compressor = null;
    this.masterGain = null;
    this.volume = 1.60; // Max default volume boost (160%)
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        
        // Studio Dynamics Compressor / Limiter to prevent clipping at high volumes
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-4, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(10, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(3, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.002, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);

        // Master Gain Bus
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

        this.compressor.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setVolume(newVol) {
    this.volume = Math.max(0, Math.min(2.0, newVol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  playDrumTone(drumIndex, isMuted = false, speakVoice = true) {
    if (isMuted) return;
    this.init();

    // 1. Spoken Vocal Syllable ("Dhoom!", "Dhit!", "Ta!", "Ting!") with instant cancel to prevent clashes
    if (speakVoice && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // Critical: instantly cancel previous speech to prevent overlapping on fast clicks
        const syllable = DRUM_SYLLABLES_TTS[drumIndex % DRUM_SYLLABLES_TTS.length];
        const u = new SpeechSynthesisUtterance(syllable);
        u.rate = 1.20;
        u.pitch = drumIndex === 0 ? 0.85 : drumIndex === 1 ? 1.0 : drumIndex === 2 ? 1.15 : 1.35;
        u.volume = 1.0;
        window.speechSynthesis.speak(u);
      } catch (e) {}
    }

    if (!this.ctx || !this.compressor) return;

    try {
      const startTime = this.ctx.currentTime + 0.005; // 5ms lead time avoids dropped frames
      
      // 4 Distinct Rich Percussive Profiles (Tuned for maximum speaker audibility & punch)
      const profiles = [
        // 0: Deep Dhum (Bass Dhol) - Booming low punch with rich audible triangle harmonics
        { bodyStart: 260, bodyEnd: 110, snapFreq: 520, duration: 0.38, bodyGain: 1.60, snapGain: 1.20, wave: 'triangle' },
        // 1: Warm Dhit (Mid Dhol) - Resonant mid-body punch
        { bodyStart: 420, bodyEnd: 210, snapFreq: 840, duration: 0.30, bodyGain: 1.45, snapGain: 1.10, wave: 'triangle' },
        // 2: Crisp Ta (High Rim) - Clear metallic rimshot
        { bodyStart: 680, bodyEnd: 360, snapFreq: 1360, duration: 0.26, bodyGain: 1.35, snapGain: 1.00, wave: 'triangle' },
        // 3: Bright Ting (Bihu Bell) - Shimmering harmonic chime
        { bodyStart: 1040, bodyEnd: 720, snapFreq: 2080, duration: 0.32, bodyGain: 1.30, snapGain: 0.95, wave: 'sine' }
      ];

      const p = profiles[drumIndex % profiles.length];

      // Primary Body Oscillator (Fundamental)
      const bodyOsc = this.ctx.createOscillator();
      const bodyGain = this.ctx.createGain();
      bodyOsc.type = p.wave;
      bodyOsc.frequency.setValueAtTime(p.bodyStart, startTime);
      bodyOsc.frequency.exponentialRampToValueAtTime(Math.max(30, p.bodyEnd), startTime + p.duration);

      bodyGain.gain.setValueAtTime(0.0001, startTime);
      bodyGain.gain.linearRampToValueAtTime(p.bodyGain, startTime + 0.012); // Smooth 12ms transient punch
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, startTime + p.duration);

      bodyOsc.connect(bodyGain);
      bodyGain.connect(this.compressor);
      bodyGain.connect(this.masterGain);

      bodyOsc.start(startTime);
      bodyOsc.stop(startTime + p.duration);

      // Secondary Snap / Overtone Oscillator (ensures crisp audibility on laptop & mobile speakers)
      const snapOsc = this.ctx.createOscillator();
      const snapGain = this.ctx.createGain();
      snapOsc.type = 'triangle';
      snapOsc.frequency.setValueAtTime(p.snapFreq, startTime);
      snapOsc.frequency.exponentialRampToValueAtTime(Math.max(40, p.snapFreq * 0.45), startTime + (p.duration * 0.7));

      snapGain.gain.setValueAtTime(0.0001, startTime);
      snapGain.gain.linearRampToValueAtTime(p.snapGain, startTime + 0.008);
      snapGain.gain.exponentialRampToValueAtTime(0.0001, startTime + (p.duration * 0.6));

      snapOsc.connect(snapGain);
      snapGain.connect(this.compressor);
      snapGain.connect(this.masterGain);

      snapOsc.start(startTime);
      snapOsc.stop(startTime + (p.duration * 0.7));
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  playSuccessChime(isMuted = false) {
    if (isMuted) return;
    this.init();
    if (!this.ctx || !this.compressor) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 joyful arpeggio
      notes.forEach((freq, idx) => {
        const startTime = this.ctx.currentTime + 0.005 + (idx * 0.09);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.85, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.38);

        osc.connect(gain);
        gain.connect(this.compressor);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + 0.38);
      });
    } catch (e) {}
  }

  playGentleCorrection(isMuted = false) {
    if (isMuted) return;
    this.init();
    if (!this.ctx || !this.compressor) return;

    try {
      const startTime = this.ctx.currentTime + 0.005;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(349.23, startTime); // F4
      osc.frequency.exponentialRampToValueAtTime(261.63, startTime + 0.32); // C4

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.75, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.32);

      osc.connect(gain);
      gain.connect(this.compressor);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.32);
    } catch (e) {}
  }
}

// Global synth instance
const synth = new RhythmAudioSynth();

/**
 * Adaptive sequence length calculation:
 * Scales from 3 beats up to 5-6 beats on high accuracy (>=80%), scales down if < 50%.
 */
export function calculateNextSequenceLength(accuracy, currentLength = 3) {
  if (accuracy >= 80) {
    return Math.min(6, currentLength + 1);
  } else if (accuracy < 50) {
    return Math.max(3, currentLength - 1);
  }
  return currentLength;
}

export function mapSequenceLengthToDifficulty(length) {
  if (length <= 3) return 'easy';
  if (length <= 4) return 'medium';
  return 'hard';
}

// 4 Traditional Bihu Rhythm Drum Pads
export const DRUM_PADS = [
  {
    id: 0,
    name: 'Dhum (Bass)',
    assameseName: 'ধুম',
    note: 'Low Bass',
    colorName: 'Amber',
    bgGradient: 'from-amber-500 to-amber-600',
    borderStyle: 'border-amber-700',
    activeGlow: 'ring-8 ring-amber-300 shadow-[0_0_40px_rgba(245,158,11,0.7)] scale-105',
    indicatorColor: 'bg-amber-500 text-white',
    icon: '🥁'
  },
  {
    id: 1,
    name: 'Dhit (Mid)',
    assameseName: 'ধিত',
    note: 'Warm Tap',
    colorName: 'Rose',
    bgGradient: 'from-rose-500 to-rose-600',
    borderStyle: 'border-rose-700',
    activeGlow: 'ring-8 ring-rose-300 shadow-[0_0_40px_rgba(244,63,94,0.7)] scale-105',
    indicatorColor: 'bg-rose-500 text-white',
    icon: '🪘'
  },
  {
    id: 2,
    name: 'Ta (Rim)',
    assameseName: 'তা',
    note: 'High Ring',
    colorName: 'Emerald',
    bgGradient: 'from-emerald-500 to-emerald-600',
    borderStyle: 'border-emerald-700',
    activeGlow: 'ring-8 ring-emerald-300 shadow-[0_0_40px_rgba(16,185,129,0.7)] scale-105',
    indicatorColor: 'bg-emerald-500 text-white',
    icon: '🔔'
  },
  {
    id: 3,
    name: 'Ting (Bell)',
    assameseName: 'টিং',
    note: 'Bihu Bell',
    colorName: 'Indigo',
    bgGradient: 'from-indigo-500 to-indigo-600',
    borderStyle: 'border-indigo-700',
    activeGlow: 'ring-8 ring-indigo-300 shadow-[0_0_40px_rgba(99,102,241,0.7)] scale-105',
    indicatorColor: 'bg-indigo-500 text-white',
    icon: '✨'
  }
];

export default function SoundRhythmMatch() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { activePatient, activePatientId, isOnline } = useApp();

  // Audio volume state: 'boosted' (high gain 1.40) | 'loud' (1.0) | 'normal' (0.75) | 'muted' (0)
  const [volumeLevel, setVolumeLevel] = useState('boosted');
  const isAudioMuted = volumeLevel === 'muted';

  const handleToggleVolume = () => {
    synth.init();
    if (volumeLevel === 'boosted') {
      setVolumeLevel('loud');
      synth.setVolume(1.0);
    } else if (volumeLevel === 'loud') {
      setVolumeLevel('normal');
      synth.setVolume(0.75);
    } else if (volumeLevel === 'normal') {
      setVolumeLevel('muted');
      synth.setVolume(0);
    } else {
      setVolumeLevel('boosted');
      synth.setVolume(1.40);
      synth.playDrumTone(0, false, true); // Play Dhum test callout
    }
  };

  // Game Progress State
  const [currentLevel, setCurrentLevel] = useState(1);
  const TOTAL_LEVELS = 5;
  const [score, setScore] = useState(0);
  const [streakCount, setStreakCount] = useState(0);

  // Session & Timing telemetry
  const [sessionStartTime] = useState(Date.now());
  const roundStartTimeRef = useRef(Date.now());
  const autoProceedTimerRef = useRef(null);
  const [roundDetails, setRoundDetails] = useState([]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (autoProceedTimerRef.current) clearTimeout(autoProceedTimerRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Game Phases: 'intro' | 'playing_demo' | 'player_turn' | 'round_success' | 'round_retry' | 'game_over'
  const [gamePhase, setGamePhase] = useState('intro');

  // Sequence Configuration
  const [sequenceLength, setSequenceLength] = useState(3);
  const [sequence, setSequence] = useState([]);
  const [demoStepIndex, setDemoStepIndex] = useState(-1);
  const [playerInputSequence, setPlayerInputSequence] = useState([]);

  // Active drum highlighting for computer playback and player tap
  const [activeDrumId, setActiveDrumId] = useState(null);
  const [hintDrumId, setHintDrumId] = useState(null);

  // Round metrics
  const [roundAttempts, setRoundAttempts] = useState(0);
  const [roundErrors, setRoundErrors] = useState(0);

  // Spoken feedback helper using speech synthesis (always cancels prior speech to prevent audio clashes)
  const speakText = useCallback((text) => {
    if (isAudioMuted) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  }, [isAudioMuted]);

  // Generate random drum sequence of given length
  const generateSequence = useCallback((len) => {
    const seq = [];
    let last = -1;
    for (let i = 0; i < len; i++) {
      let next;
      do {
        next = Math.floor(Math.random() * DRUM_PADS.length);
      } while (next === last && len > 3); // Avoid 3 consecutive repeats if possible
      seq.push(next);
      last = next;
    }
    return seq;
  }, []);

  // Start / replay the demonstration sequence
  const playDemonstration = useCallback((seqToPlay) => {
    const targetSeq = seqToPlay || sequence;
    if (!targetSeq || targetSeq.length === 0) return;

    setGamePhase('playing_demo');
    setPlayerInputSequence([]);
    setHintDrumId(null);

    let step = 0;
    setDemoStepIndex(0);

    const stepInterval = 750; // Elderly-friendly relaxed timing (750ms)
    const flashDuration = 450;

    const intervalId = setInterval(() => {
      if (step < targetSeq.length) {
        const drumId = targetSeq[step];
        setDemoStepIndex(step);
        setActiveDrumId(drumId);
        synth.playDrumTone(drumId, isAudioMuted);

        setTimeout(() => {
          setActiveDrumId(null);
        }, flashDuration);

        step++;
      } else {
        clearInterval(intervalId);
        setTimeout(() => {
          setDemoStepIndex(-1);
          setGamePhase('player_turn');
          speakText('Your turn! Tap the rhythm in the same order.');
        }, 500);
      }
    }, stepInterval);

    return () => clearInterval(intervalId);
  }, [sequence, isAudioMuted, speakText]);

  // Start a new round
  const startRound = useCallback((levelNum, len) => {
    const targetLength = len || sequenceLength;
    const newSeq = generateSequence(targetLength);
    setSequence(newSeq);
    setPlayerInputSequence([]);
    setRoundAttempts(0);
    setRoundErrors(0);
    roundStartTimeRef.current = Date.now();

    setTimeout(() => {
      playDemonstration(newSeq);
    }, 400);
  }, [sequenceLength, generateSequence, playDemonstration]);

  // Start game on intro complete
  const handleStartGame = () => {
    synth.init();
    setGamePhase('playing_demo');
    setCurrentLevel(1);
    setScore(0);
    setStreakCount(0);
    setRoundDetails([]);
    setSequenceLength(3);
    startRound(1, 3);
  };

  // Handle patient tapping a drum pad
  const handleDrumTap = (drumId) => {
    if (gamePhase !== 'player_turn') return;

    // Visual & audio response immediately
    setActiveDrumId(drumId);
    synth.playDrumTone(drumId, isAudioMuted);
    setTimeout(() => setActiveDrumId(null), 300);

    const currentStep = playerInputSequence.length;
    const expectedDrumId = sequence[currentStep];

    const updatedInputs = [...playerInputSequence, drumId];
    setPlayerInputSequence(updatedInputs);
    setRoundAttempts(prev => prev + 1);

    if (drumId === expectedDrumId) {
      // Correct tap for this step
      if (updatedInputs.length === sequence.length) {
        // Complete sequence solved!
        handleRoundSuccess();
      }
    } else {
      // Incorrect tap
      handleRoundMistake(expectedDrumId);
    }
  };

  // Handle successful sequence completion
  const handleRoundSuccess = () => {
    setGamePhase('round_success');
    const timeTaken = Math.max(1, Math.round((Date.now() - roundStartTimeRef.current) / 1000));
    
    // Confetti celebration
    confetti({
      particleCount: 50,
      spread: 65,
      origin: { y: 0.65 },
      colors: ['#f59e0b', '#e11d48', '#10b981', '#6366f1']
    });

    synth.playSuccessChime(isAudioMuted);

    // Scoring math
    const roundAccuracy = roundErrors === 0 ? 100 : Math.max(50, Math.round((sequence.length / (sequence.length + roundErrors)) * 100));
    const roundScore = Math.round(100 + (sequence.length * 15) + (roundAccuracy >= 90 ? 25 : 0));
    
    setScore(prev => prev + roundScore);
    setStreakCount(prev => prev + 1);

    // Log round telemetry
    const currentRoundRecord = {
      level: currentLevel,
      itemCount: sequence.length,
      mode: 'rhythm_pattern',
      accuracy: roundAccuracy,
      correctCount: sequence.length,
      totalAttempts: sequence.length + roundErrors,
      timeTakenSeconds: timeTaken
    };

    setRoundDetails(prev => [...prev, currentRoundRecord]);
    const isHindiSuccess = (currentLanguage?.code || '').startsWith('hi');
    speakText(isHindiSuccess ? 'शानदार! आपने ताल बिल्कुल सही याद रखी!' : 'Wonderful! You remembered the rhythm perfectly!');

    // AUTOMATIC ADVANCE: No manual button click required!
    if (autoProceedTimerRef.current) clearTimeout(autoProceedTimerRef.current);
    autoProceedTimerRef.current = setTimeout(() => {
      if (currentLevel >= TOTAL_LEVELS) {
        handleCompleteGame();
      } else {
        const nextLvl = currentLevel + 1;
        setCurrentLevel(nextLvl);

        // Adaptive difficulty calculation
        const nextLen = calculateNextSequenceLength(roundAccuracy, sequenceLength);
        setSequenceLength(nextLen);

        setGamePhase('playing_demo');
        startRound(nextLvl, nextLen);
      }
    }, 1800);
  };

  // Handle mistake
  const handleRoundMistake = (expectedDrumId) => {
    setRoundErrors(prev => prev + 1);
    setHintDrumId(expectedDrumId);
    synth.playGentleCorrection(isAudioMuted);

    // Show gentle tender correction
    setTimeout(() => {
      setHintDrumId(null);
      setPlayerInputSequence([]);
      const isHindiMistake = (currentLanguage?.code || '').startsWith('hi');
      speakText(isHindiMistake ? 'आइए एक बार फिर साथ में ताल सुनते हैं!' : 'Let us listen to the rhythm once more together!');
      setTimeout(() => {
        playDemonstration(sequence);
      }, 700);
    }, 1200);
  };

  // Advance to next level or finish game (manual fallback if needed)
  const handleNextLevel = () => {
    if (autoProceedTimerRef.current) clearTimeout(autoProceedTimerRef.current);
    if (currentLevel >= TOTAL_LEVELS) {
      handleCompleteGame();
    } else {
      const nextLvl = currentLevel + 1;
      setCurrentLevel(nextLvl);

      const lastRound = roundDetails[roundDetails.length - 1];
      const lastAcc = lastRound ? lastRound.accuracy : 100;
      const nextLen = calculateNextSequenceLength(lastAcc, sequenceLength);
      setSequenceLength(nextLen);

      setGamePhase('playing_demo');
      startRound(nextLvl, nextLen);
    }
  };

  // End of game submission
  const handleCompleteGame = async () => {
    setGamePhase('game_over');
    const totalDurationSeconds = Math.max(10, Math.round((Date.now() - sessionStartTime) / 1000));
    
    // Grand celebration
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#ec4899', '#3b82f6', '#8b5cf6']
    });

    synth.playSuccessChime(isAudioMuted);

    const sessionPayload = {
      patientId: activePatientId || activePatient?.id || activePatient?._id || 'pat-1',
      gameType: 'sound-rhythm-match',
      title: 'Sound & Rhythm Match',
      category: 'Auditory & Rhythm Recall',
      score: score + 50, // Final completion bonus
      difficultyLevel: mapSequenceLengthToDifficulty(sequenceLength),
      duration: `${totalDurationSeconds}s`,
      roundDetails
    };

    try {
      if (isOnline) {
        await submitGameSessionApi(sessionPayload);
      } else {
        await queueOfflineAction('game_session', sessionPayload);
      }
    } catch (err) {
      console.warn('Game session queued offline:', err.message);
      await queueOfflineAction('game_session', sessionPayload).catch(() => {});
    }
  };

  // Replay demonstration on manual user click
  const handleReplayDemo = () => {
    if (gamePhase === 'player_turn' || gamePhase === 'playing_demo') {
      playDemonstration(sequence);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 pb-16 pt-4 px-4 sm:px-6 flex flex-col items-center">
      
      {/* Top Header Bar with Always Visible Leave Game Button */}
      <header className="w-full max-w-4xl flex items-center justify-between py-3 mb-4 border-b border-stone-200">
        <button
          type="button"
          onClick={() => navigate('/patient/games')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 text-rose-800 font-black text-xs sm:text-sm shadow-xs cursor-pointer transition-all active:scale-95"
          title="Exit game and return to patient dashboard"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>{(currentLanguage?.code || '').startsWith('hi') ? "खेल छोड़ें" : "Leave Game"}</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => {
              const isHindi = (currentLanguage?.code || '').startsWith('hi');
              const msg = isHindi
                ? 'ढोल की ताल को ध्यान से सुनें, क्रम याद रखें, और उसी क्रम में ढोल बजाएं!'
                : 'Listen to the rhythm beats, remember the pattern, and tap the drums in the same sequence!';
              speakLocalized({
                text: msg,
                langCode: currentLanguage?.code || 'en'
              });
            }}
            className="px-3.5 py-1.5 rounded-2xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
            title="Listen to Instructions"
          >
            <Volume2 className="w-4 h-4 text-[#2C5AA0]" />
            <span className="hidden sm:inline">{(currentLanguage?.code || '').startsWith('hi') ? "निर्देश सुनें" : "Listen"}</span>
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-100/80 border border-amber-300 text-amber-900 text-xs sm:text-sm font-black shadow-2xs">
            <Flame className="w-4 h-4 text-amber-800 fill-amber-500" />
            <span>{(currentLanguage?.code || '').startsWith('hi') ? `स्ट्रीक: ${streakCount} दिन` : `Streak: ${streakCount}`}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-100/80 border border-emerald-300 text-emerald-950 text-xs sm:text-sm font-black shadow-2xs">
            <Trophy className="w-4 h-4 text-emerald-800 fill-emerald-500" />
            <span>{(currentLanguage?.code || '').startsWith('hi') ? `अंक: ${score}` : `Score: ${score}`}</span>
          </div>

          <button
            type="button"
            onClick={handleToggleVolume}
            className={`px-3 py-1.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-black shadow-2xs ${
              volumeLevel === 'boosted'
                ? 'bg-amber-400 border-amber-600 text-amber-950 ring-2 ring-amber-300'
                : volumeLevel === 'loud'
                  ? 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200'
                  : volumeLevel === 'normal'
                    ? 'bg-stone-100 border-stone-300 text-stone-800 hover:bg-stone-200'
                    : 'bg-rose-100 border-rose-300 text-rose-800'
            }`}
            title="Toggle between Boosted Loud Sound (140%), Loud (100%), Balanced (75%), or Mute"
          >
            {volumeLevel === 'muted' ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-600" />
                <span className="hidden sm:inline">Muted</span>
              </>
            ) : volumeLevel === 'boosted' ? (
              <>
                <Volume2 className="w-4 h-4 text-amber-950 stroke-[3]" />
                <span className="hidden sm:inline">Sound: Max Boost 🔊⚡</span>
              </>
            ) : volumeLevel === 'loud' ? (
              <>
                <Volume2 className="w-4 h-4 text-amber-800 stroke-[2.5]" />
                <span className="hidden sm:inline">Sound: Loud 🔊</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-stone-700" />
                <span className="hidden sm:inline">Sound: Balanced 🔉</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Game Card */}
      <main className="w-full max-w-3xl flex-1 flex flex-col items-center">
        
        {/* ======================================================== */}
        {/* PHASE 1: INTRO & WARM WELCOME SCREEN                     */}
        {/* ======================================================== */}
        {gamePhase === 'intro' && (
          <div className="w-full bg-white rounded-3xl p-6 sm:p-10 border-2 border-stone-200/90 shadow-sm text-center space-y-6 animate-in fade-in">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-4xl shadow-inner">
              🥁
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Auditory & Rhythm Recall
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight">
                Sound & Rhythm Match
              </h1>
              <p className="text-sm sm:text-base text-stone-600 max-w-md mx-auto font-semibold leading-relaxed">
                Listen to the joyful beats of the Bihu drums, watch them glow, and tap the drums back in the exact same rhythm!
              </p>
            </div>

            {/* Drum Test Pad Previews */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Tap each drum below to try its sound:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {DRUM_PADS.map(drum => (
                  <button
                    key={drum.id}
                    type="button"
                    onClick={() => {
                      synth.playDrumTone(drum.id, isAudioMuted);
                      setActiveDrumId(drum.id);
                      setTimeout(() => setActiveDrumId(null), 300);
                    }}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-1 text-white bg-gradient-to-b ${drum.bgGradient} ${drum.borderStyle} ${
                      activeDrumId === drum.id ? drum.activeGlow : 'hover:opacity-95 active:scale-95'
                    }`}
                  >
                    <span className="text-2xl">{drum.icon}</span>
                    <span className="text-xs font-black">{drum.name}</span>
                    <span className="text-[10px] font-bold opacity-90">{drum.assameseName}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartGame}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-black text-base sm:text-lg transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 mx-auto"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Start Rhythm Game</span>
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* PHASE 2: PLAYING DEMO & PLAYER TURN                      */}
        {/* ======================================================== */}
        {(gamePhase === 'playing_demo' || gamePhase === 'player_turn') && (
          <div className="w-full space-y-5 animate-in fade-in">
            
            {/* Level & Status Card */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1.5 rounded-xl bg-amber-700 text-white font-black text-sm shadow-2xs">
                  Level {currentLevel} of {TOTAL_LEVELS}
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-stone-900">
                    {gamePhase === 'playing_demo' ? '🎵 Listen & Watch...' : '👉 Your Turn to Play!'}
                  </h3>
                  <p className="text-xs text-stone-500 font-semibold">
                    {gamePhase === 'playing_demo' 
                      ? `Playing ${sequence.length} beats in sequence` 
                      : `Tap ${sequence.length} beats in order (${playerInputSequence.length}/${sequence.length} tapped)`}
                  </p>
                </div>
              </div>

              {/* Replay Demonstration button */}
              <button
                type="button"
                onClick={handleReplayDemo}
                disabled={gamePhase === 'playing_demo'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all cursor-pointer border border-stone-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Hear rhythm sequence once more"
              >
                <RotateCw className="w-3.5 h-3.5 text-stone-600" />
                <span>Listen Again</span>
              </button>
            </div>

            {/* Sequence Progress Visual Dots */}
            <div className="flex items-center justify-center gap-2.5 py-2">
              {sequence.map((drumId, idx) => {
                const isPlayedInDemo = gamePhase === 'playing_demo' && demoStepIndex >= idx;
                const isTappedByPlayer = gamePhase === 'player_turn' && playerInputSequence.length > idx;
                const isActiveDemoStep = gamePhase === 'playing_demo' && demoStepIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all flex items-center justify-center font-black text-[10px] ${
                      isActiveDemoStep
                        ? 'scale-125 ring-4 ring-amber-400 bg-amber-500 text-white border-amber-700'
                        : isTappedByPlayer || isPlayedInDemo
                          ? 'bg-emerald-600 text-white border-emerald-800 scale-105'
                          : 'bg-stone-200 border-stone-300 text-stone-500'
                    }`}
                  >
                    {idx + 1}
                  </div>
                );
              })}
            </div>

            {/* Large 4-Drum Grid */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6 bg-white rounded-3xl border-2 border-stone-200/90 shadow-sm">
              {DRUM_PADS.map(drum => {
                const isLit = activeDrumId === drum.id;
                const isHint = hintDrumId === drum.id;

                return (
                  <button
                    key={drum.id}
                    type="button"
                    onClick={() => handleDrumTap(drum.id)}
                    disabled={gamePhase !== 'player_turn'}
                    className={`relative aspect-square sm:aspect-[4/3] rounded-3xl p-5 sm:p-6 border-4 transition-all flex flex-col items-center justify-between text-white shadow-md cursor-pointer select-none bg-gradient-to-b ${drum.bgGradient} ${drum.borderStyle} ${
                      isLit 
                        ? `${drum.activeGlow} scale-105 z-10` 
                        : isHint
                          ? 'ring-8 ring-amber-400 animate-pulse scale-105'
                          : gamePhase === 'player_turn'
                            ? 'hover:scale-102 hover:shadow-lg active:scale-95'
                            : 'opacity-90 cursor-default'
                    }`}
                    style={{ minHeight: '130px' }}
                  >
                    {/* Top Note Indicator */}
                    <div className="w-full flex items-center justify-between">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-black/25 backdrop-blur-xs text-white uppercase tracking-wider">
                        {drum.note}
                      </span>
                      <span className="text-sm font-black opacity-85">
                        {drum.assameseName}
                      </span>
                    </div>

                    {/* Center Drum Icon & Ripple */}
                    <div className="my-auto flex flex-col items-center">
                      <span className={`text-4xl sm:text-5xl transition-transform ${isLit ? 'scale-125' : ''}`}>
                        {drum.icon}
                      </span>
                      <span className="text-base sm:text-lg font-black tracking-tight mt-1">
                        {drum.name}
                      </span>
                    </div>

                    {/* Bottom Tap Hint */}
                    <div className="w-full text-center">
                      <span className="text-[11px] font-bold opacity-80">
                        {gamePhase === 'player_turn' ? 'Tap Drum 🥁' : 'Listening...'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Helpful Guidance Footer */}
            <div className="text-center p-3 bg-stone-100/80 rounded-2xl border border-stone-200">
              <p className="text-xs sm:text-sm text-stone-600 font-bold">
                {gamePhase === 'playing_demo' 
                  ? 'Watch the drums light up and listen to their sounds.'
                  : 'Tap the drums in the same order you just saw. Take your time.'}
              </p>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* PHASE 3: ROUND SUCCESS MODAL / TRANSITION                */}
        {/* ======================================================== */}
        {gamePhase === 'round_success' && (
          <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-300 shadow-md text-center space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-3xl shadow-inner text-emerald-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-700" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                Level {currentLevel} Completed
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-950">
                Splendid Rhythm Recall
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-semibold max-w-md mx-auto">
                You matched all {sequence.length} beats in sequence.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <div className="text-center">
                <p className="text-[11px] font-bold text-emerald-800 uppercase">Beats Matched</p>
                <p className="text-xl font-black text-emerald-950">{sequence.length} Beats</p>
              </div>
              <div className="text-center">
                <p className="text-[11px] font-bold text-emerald-800 uppercase">Current Score</p>
                <p className="text-xl font-black text-emerald-950">{score} pts</p>
              </div>
            </div>

            {/* Automatic Progression Indicator */}
            <div className="pt-2 space-y-2 max-w-xs mx-auto">
              <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full w-full animate-pulse transition-all" />
              </div>
              <p className="text-xs font-bold text-stone-500">
                {currentLevel >= TOTAL_LEVELS ? 'Preparing Final Summary...' : `Moving to Level ${currentLevel + 1}...`}
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PHASE 4: GAME OVER SUMMARY SCREEN                        */}
        {/* ======================================================== */}
        {gamePhase === 'game_over' && (
          <div className="w-full bg-white rounded-3xl p-6 sm:p-10 border-2 border-amber-300 shadow-md text-center space-y-6 animate-in zoom-in-95">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-4xl shadow-inner text-amber-800">
              🏆
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                All 5 Levels Cleared
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-950">
                Outstanding Rhythm & Memory
              </h2>
              <p className="text-sm text-stone-600 font-semibold max-w-md mx-auto">
                Your auditory attention and musical pattern recall are sharp and steady.
              </p>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div>
                <p className="text-[11px] font-bold text-stone-500 uppercase">Final Score</p>
                <p className="text-xl sm:text-2xl font-black text-amber-900">{score} pts</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-stone-500 uppercase">Max Sequence</p>
                <p className="text-xl sm:text-2xl font-black text-emerald-800">{sequenceLength} Beats</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-stone-500 uppercase">Streak</p>
                <p className="text-xl sm:text-2xl font-black text-rose-800">{streakCount} 🔥</p>
              </div>
            </div>

            {/* Round Telemetry Table */}
            {roundDetails.length > 0 && (
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-left">
                <p className="text-xs font-black text-stone-700 uppercase tracking-wider">
                  Level-by-Level Breakdown:
                </p>
                <div className="space-y-1.5">
                  {roundDetails.map((rd, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white rounded-xl border border-stone-200 flex items-center justify-between text-xs font-bold"
                    >
                      <span className="text-stone-900">Level {rd.level} ({rd.itemCount} beats)</span>
                      <span className="text-stone-500">⏱️ {rd.timeTakenSeconds}s</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900">
                        {rd.accuracy}% Precision
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleStartGame}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{(currentLanguage?.code || '').startsWith('hi') ? "फिर से खेलें" : "Play Again"}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/patient/games')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-stone-800 hover:bg-stone-900 text-white font-black text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Return to Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
