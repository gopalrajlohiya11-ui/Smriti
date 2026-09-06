import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../../context/AppContext';
import { submitGameSessionApi } from '../../../services/api';
import { queueOfflineAction } from '../../../utils/offlineDb';
import { speakLocalized, stopSpeech } from '../../../utils/speechUtils';
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
  Check, 
  Star, 
  Clock, 
  Sun, 
  Moon, 
  Sunset, 
  Coffee, 
  Pill, 
  Utensils, 
  Footprints, 
  BookOpen, 
  BedDouble, 
  Heart,
  ListOrdered
} from 'lucide-react';

/**
 * Separable, exported adaptive difficulty calculation function.
 * Increases sequence length if accuracy is high (>= 80%), decreases if low (< 50%).
 * 
 * @param {number} accuracy - Current session / round accuracy percentage (0 to 100)
 * @param {number} currentLength - Current count of items displayed in sequence (min 3, max 6)
 * @returns {number} Next round sequence length (3 to 6)
 */
export function calculateNextSequenceLength(accuracy, currentLength = 4) {
  if (accuracy >= 80) {
    return Math.min(6, currentLength + 1);
  } else if (accuracy < 50) {
    return Math.max(3, currentLength - 1);
  }
  return currentLength;
}

/**
 * Helper to map sequence length to standardized difficulty level strings.
 */
export function mapSequenceLengthToDifficulty(length) {
  if (length <= 3) return 'easy';
  if (length <= 4) return 'medium';
  return 'hard';
}

// 8 Verified Authentic Photographs of North-East Daily Routine Activities
export const ROUTINE_ACTIVITIES = [
  {
    id: 'act-wake-tea',
    orderRank: 1,
    title: 'Morning Assam Tea & Wake Up',
    hindiTitle: 'सुबह की असम चाय और उठना',
    localTitle: 'ৰাতিপুৱাৰ চাহ আৰু শোৱাৰ পৰা উঠা',
    timeHint: '7:00 AM',
    emoji: '🌅',
    category: 'morning',
    themeColor: 'from-amber-400 to-orange-500',
    description: 'Fresh morning tea and calm greeting'
  },
  {
    id: 'act-bp-med',
    orderRank: 2,
    title: 'Morning Medicine & Water',
    hindiTitle: 'सुबह की निर्धारित दवा और पानी',
    localTitle: 'ৰাতিপুৱাৰ ঔষধ আৰু পানী',
    timeHint: '8:45 AM',
    emoji: '💊',
    category: 'morning',
    themeColor: 'from-blue-500 to-indigo-600',
    description: 'BP tablets with full glass of water'
  },
  {
    id: 'act-breakfast',
    orderRank: 3,
    title: 'Healthy Nutritious Breakfast',
    hindiTitle: 'पौष्टिक सुबह का नाश्ता',
    localTitle: 'পুষ্টিকৰ ৰাতিপুৱাৰ আহাৰ',
    timeHint: '9:30 AM',
    emoji: '🥣',
    category: 'morning',
    themeColor: 'from-emerald-500 to-teal-600',
    description: 'Warm meal with lentils and vegetables'
  },
  {
    id: 'act-memory-game',
    orderRank: 4,
    title: 'Daily Memory Game Practice',
    hindiTitle: 'दैनिक दिमागी खेल और अभ्यास',
    localTitle: 'দৈনিক স্মৃতি খেল অনুশীলন',
    timeHint: '11:30 AM',
    emoji: '🧠',
    category: 'afternoon',
    themeColor: 'from-purple-500 to-indigo-600',
    description: '10-minute focus and pattern puzzle'
  },
  {
    id: 'act-lunch',
    orderRank: 5,
    title: 'Warm Lunch & Hydration',
    hindiTitle: 'दोपहर का भोजन और पानी',
    localTitle: 'দুপৰীয়াৰ আহাৰ আৰু পানী',
    timeHint: '1:30 PM',
    emoji: '🍲',
    category: 'afternoon',
    themeColor: 'from-orange-500 to-amber-600',
    description: 'Wholesome rice, dal and greens'
  },
  {
    id: 'act-garden-walk',
    orderRank: 6,
    title: 'Evening Garden Walk',
    hindiTitle: 'शाम की खुली हवा में सैर',
    localTitle: 'গধূলিৰ বাগিচাৰ খোজকঢ়া',
    timeHint: '4:30 PM',
    emoji: '🚶‍♂️',
    category: 'evening',
    themeColor: 'from-lime-500 to-emerald-600',
    description: '15-minute gentle stroll'
  },
  {
    id: 'act-caregiver-chat',
    orderRank: 7,
    title: 'Evening Family & Doctor Check-in',
    hindiTitle: 'शाम का परिवार और डॉक्टर संवाद',
    localTitle: 'পৰিয়াল আৰু চিকিৎসকৰ সৈতে কথা-বতৰা',
    timeHint: '6:30 PM',
    emoji: '👨‍👩‍👧',
    category: 'evening',
    themeColor: 'from-rose-400 to-pink-600',
    description: 'Daily check-in and friendly conversation'
  },
  {
    id: 'act-bedtime-rest',
    orderRank: 8,
    title: 'Night Medicine & Peaceful Sleep',
    hindiTitle: 'रात की दवा और शांतिपूर्ण विश्राम',
    localTitle: 'ৰাতিৰ ঔষধ আৰু শান্তিপূৰ্ণ টোপনি',
    timeHint: '9:00 PM',
    emoji: '🌙',
    category: 'night',
    themeColor: 'from-indigo-600 to-slate-800',
    description: 'Night dose and restorative sleep'
  }
];

const TOTAL_LEVELS = 5;

// Fisher-Yates array shuffle helper
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function DailyRoutineSequencer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activePatient, currentLanguage, isOnline } = useApp();

  // Multi-Level Progression State
  const [currentLevel, setCurrentLevel] = useState(1);
  const [runningScore, setRunningScore] = useState(0);
  const [showLevelTransition, setShowLevelTransition] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');

  // Current Level Mechanics
  const [sequenceLength, setSequenceLength] = useState(4);
  const [targetSequence, setTargetSequence] = useState([]); // Correct chronological order for this round
  const [availableCards, setAvailableCards] = useState([]); // Shuffled pool of cards waiting to be placed
  const [placedSequence, setPlacedSequence] = useState([]); // Correctly placed cards in order
  const [nextExpectedIndex, setNextExpectedIndex] = useState(0); // Index in targetSequence expected next

  // Animation & Feedback States
  const [shakingCardId, setShakingCardId] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState(null); // { type: 'success' | 'wrong', text: '' }
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Per-Round ML Data Logging
  const [roundDetails, setRoundDetails] = useState([]);
  const [roundAttempts, setRoundAttempts] = useState(0);
  const [roundMistakes, setRoundMistakes] = useState(0);
  const roundStartTimeRef = useRef(Date.now());
  const gameStartTimeRef = useRef(Date.now());

  // Game Finished Summary Screen State
  const [isGameOver, setIsGameOver] = useState(false);
  const [finalStats, setFinalStats] = useState(null);
  const [isSavingScore, setIsSavingScore] = useState(false);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Speech Helper
    const getRoutineSpeechText = useCallback((level) => {
    const isHindi = (currentLanguage?.code || '').startsWith('hi');
    if (isHindi) {
      return `स्तर ${level}। सुबह से रात तक जिस क्रम में आप दैनिक कार्य करते हैं, उसी क्रम में गतिविधियों को स्पर्श करें।`;
    }
    return `Level ${level}. Tap the activities in the order you do them during the day, from morning to night.`;
  }, [currentLanguage]);

  const speakText = useCallback((text, isAutoPlay = false) => {
    if (!text) return;
    speakLocalized({
      text,
      langCode: currentLanguage?.code || 'en',
      rate: 0.85,
      pitch: 1.0,
      isAutoPlay,
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false)
    });
  }, [currentLanguage]);

  // Generate round cards based on sequence length
  const generateRound = useCallback((levelNum, length) => {
    // Pick `length` distinct items from the 8 routine activities, ensuring good variety
    const shuffledPool = shuffleArray(ROUTINE_ACTIVITIES);
    const chosen = shuffledPool.slice(0, length);

    // Sort by orderRank to establish ground-truth chronological order
    const sortedChronological = [...chosen].sort((a, b) => a.orderRank - b.orderRank);

    // Shuffle for presentation
    const presentedShuffled = shuffleArray(sortedChronological);

    setTargetSequence(sortedChronological);
    setAvailableCards(presentedShuffled);
    setPlacedSequence([]);
    setNextExpectedIndex(0);
    setRoundAttempts(0);
    setRoundMistakes(0);
    roundStartTimeRef.current = Date.now();

    // Voice instruction for round start (Automatic speech trigger -> isAutoPlay: true)
    const introMsg = `Level ${levelNum}. Tap the activities in the order you do them during the day, from morning to night.`;
    speakText(introMsg, true);
  }, [speakText]);

  // Start game on mount
  useEffect(() => {
    gameStartTimeRef.current = Date.now();
    generateRound(1, 4);
  }, [generateRound]);

  // Handle Card Tap
  const handleCardClick = (card) => {
    if (showLevelTransition || isGameOver) return;

    setRoundAttempts(prev => prev + 1);

    const expectedNext = targetSequence[nextExpectedIndex];

    if (card.id === expectedNext.id) {
      // Correct!
      const newPlaced = [...placedSequence, card];
      const newAvailable = availableCards.filter(c => c.id !== card.id);
      const nextIdx = nextExpectedIndex + 1;

      setPlacedSequence(newPlaced);
      setAvailableCards(newAvailable);
      setNextExpectedIndex(nextIdx);

      // Points calculation: +20 pts per correct step
      const stepPoints = 20;
      setRunningScore(prev => prev + stepPoints);

      // Confetti burst on step
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#15803d', '#d97706', '#0284c7']
      });

      // Positive gentle utterance
      const cheerPhrases = [
        `Great job! ${card.title} is Step ${nextIdx}!`,
        `Perfect! Step ${nextIdx} complete!`,
        `Wonderful! ${card.title} comes next.`,
        `Spot on! You got it right.`
      ];
      const cheer = cheerPhrases[Math.floor(Math.random() * cheerPhrases.length)];
      setFeedbackToast({ type: 'success', text: `✓ Correct! Step ${nextIdx}: ${card.title}` });
      speakText(cheer);

      setTimeout(() => {
        setFeedbackToast(null);
      }, 1800);

      // Check if current round is complete
      if (nextIdx === targetSequence.length) {
        handleRoundCompletion(newPlaced);
      }
    } else {
      // Incorrect order tapped
      setRoundMistakes(prev => prev + 1);
      setShakingCardId(card.id);

      setFeedbackToast({
        type: 'wrong',
        text: `Not quite! Think about what you do earlier in the day.`
      });

      speakText(`Not quite. Think about which activity happens earlier in the day.`);

      setTimeout(() => {
        setShakingCardId(null);
      }, 700);

      setTimeout(() => {
        setFeedbackToast(null);
      }, 2500);
    }
  };

  // Round Completion Logic
  const handleRoundCompletion = (completedSequence) => {
    const timeTaken = Math.max(1, Math.round((Date.now() - roundStartTimeRef.current) / 1000));
    const totalAtt = roundAttempts + 1;
    const correctCount = completedSequence.length;
    const roundAccuracy = Math.round((correctCount / Math.max(correctCount, totalAtt)) * 100);

    // Bonus points for completing round with high accuracy
    const bonus = roundAccuracy >= 90 ? 50 : roundAccuracy >= 75 ? 30 : 15;
    setRunningScore(prev => prev + bonus);

    // Record round metrics
    const currentRoundMetric = {
      level: currentLevel,
      itemCount: targetSequence.length,
      mode: 'routine_ordering',
      accuracy: roundAccuracy,
      correctCount: correctCount,
      totalAttempts: totalAtt,
      timeTakenSeconds: timeTaken
    };

    const updatedRoundDetails = [...roundDetails, currentRoundMetric];
    setRoundDetails(updatedRoundDetails);

    // Big confetti burst
    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#15803d', '#d97706', '#b45309']
    });

    if (currentLevel < TOTAL_LEVELS) {
      // Move to next level with warm transition
      const nextLvl = currentLevel + 1;
      const nextLength = calculateNextSequenceLength(roundAccuracy, sequenceLength);
      setSequenceLength(nextLength);

      const isHindi = (currentLanguage?.code || '').startsWith('hi');
      const transitionMsg = isHindi 
        ? `स्तर ${currentLevel} पूरा हुआ! 🌟 स्तर ${nextLvl} शुरू हो रहा है...`
        : `Level ${currentLevel} Complete! 🌟 Moving to Level ${nextLvl}...`;
      setTransitionMessage(transitionMsg);
      setShowLevelTransition(true);
      speakText(`Wonderful job! Level ${currentLevel} complete. Moving to Level ${nextLvl}!`);

      setTimeout(() => {
        setShowLevelTransition(false);
        setCurrentLevel(nextLvl);
        generateRound(nextLvl, nextLength);
      }, 2200);
    } else {
      // Final level complete! End Game
      finishGame(updatedRoundDetails);
    }
  };

  // Finish Game & Record Score
  const finishGame = async (finalRounds) => {
    setIsGameOver(true);
    const totalDurationSeconds = Math.max(1, Math.round((Date.now() - gameStartTimeRef.current) / 1000));
    const durationMinutes = Math.ceil(totalDurationSeconds / 60);

    const avgAccuracy = Math.round(
      finalRounds.reduce((acc, r) => acc + r.accuracy, 0) / Math.max(1, finalRounds.length)
    );

    // Normalized final score out of 100
    const finalScaledScore = Math.min(100, Math.max(50, Math.round(avgAccuracy * 0.7 + (runningScore / 500) * 30)));

    const summaryStats = {
      score: finalScaledScore,
      accuracy: avgAccuracy,
      duration: `${durationMinutes} Min${durationMinutes > 1 ? 's' : ''}`,
      durationSeconds: totalDurationSeconds,
      difficultyLevel: mapSequenceLengthToDifficulty(sequenceLength),
      roundsCompleted: finalRounds.length
    };
    setFinalStats(summaryStats);

    speakText(`Congratulations ${activePatient?.name?.split(' ')[0] || ''}! You completed all 5 levels of Daily Routine Sequencer with a score of ${finalScaledScore}!`);

    // Submit Game Session to MongoDB
    setIsSavingScore(true);
    const payload = {
      patientId: activePatient?.id || activePatient?._id,
      gameType: 'daily-routine-sequencer',
      title: 'Daily Routine Sequencer',
      category: 'Chronological Sequence Recall',
      score: finalScaledScore,
      difficultyLevel: mapSequenceLengthToDifficulty(sequenceLength),
      duration: `${durationMinutes} Mins`,
      roundDetails: finalRounds
    };

    try {
      if (isOnline) {
        await submitGameSessionApi(payload);
        console.log('✅ Daily Routine Sequencer score submitted to MongoDB');
      } else {
        await queueOfflineAction({
          action: 'submitGameSession',
          patientId: activePatient?.id || activePatient?._id,
          gameData: payload
        });
        console.log('📦 Daily Routine Sequencer score queued for offline sync');
      }
    } catch (err) {
      console.warn('Failed to submit game session online, queuing offline:', err.message);
      await queueOfflineAction({
        action: 'submitGameSession',
        patientId: activePatient?.id || activePatient?._id,
        gameData: payload
      });
    } finally {
      setIsSavingScore(false);
    }
  };

  const handleRestart = () => {
    setCurrentLevel(1);
    setRunningScore(0);
    setRoundDetails([]);
    setIsGameOver(false);
    setFinalStats(null);
    setShowLevelTransition(false);
    setSequenceLength(4);
    gameStartTimeRef.current = Date.now();
    generateRound(1, 4);
  };

  const getPeriodIcon = (period) => {
    switch (period) {
      case 'morning': return <Sun className="w-4 h-4 text-amber-500" />;
      case 'midday': return <Sun className="w-4 h-4 text-orange-500" />;
      case 'afternoon': return <Sunset className="w-4 h-4 text-amber-600" />;
      case 'evening': return <Sunset className="w-4 h-4 text-rose-500" />;
      case 'night': return <Moon className="w-4 h-4 text-indigo-400" />;
      default: return <Clock className="w-4 h-4 text-stone-500" />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAF7F2] pb-24 pt-6 px-4 sm:px-6 lg:px-8 xl:px-10">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* 1. TOP HEADER & CONTROLS */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-stone-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate('/patient/games')}
              className="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-800 border-2 border-rose-300 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
              title="Leave game and return to dashboard"
            >
              <ArrowLeft className="w-5 h-5 stroke-[3] text-rose-800" />
              <span>{(currentLanguage?.code || '').startsWith('hi') ? "खेल छोड़ें" : "Leave Game"}</span>
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-black uppercase tracking-wider border border-amber-300">
                  ⏰ Daily Living Memory
                </span>
                <span className="text-xs font-bold text-stone-500">
                  Adaptive Sequence Recall
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-950 mt-0.5">
                {(currentLanguage?.code || '').startsWith('hi') ? 'दैनिक दिनचर्या क्रम (Daily Routine Sequencer)' : 'Daily Routine Sequencer'}
              </h1>
            </div>
          </div>

          {/* Persistent Level & Live Score Header */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap self-start md:self-center">
            {/* Level Counter */}
            <div className="px-4 py-2 rounded-2xl bg-stone-900 text-white flex items-center gap-2 shadow-sm border border-stone-800">
              <ListOrdered className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-[10px] uppercase font-bold text-stone-400">{(currentLanguage?.code || '').startsWith('hi') ? "स्तर" : "Level"}</p>
                <p className="text-sm sm:text-base font-black text-amber-300 leading-none">
                  {currentLevel} <span className="text-stone-400 text-xs">of {TOTAL_LEVELS}</span>
                </p>
              </div>
            </div>

            {/* Live Score Counter */}
            <div className="px-4 py-2 rounded-2xl bg-amber-800 text-white flex items-center gap-2 shadow-sm border border-amber-900">
              <Trophy className="w-5 h-5 text-amber-300" />
              <div>
                <p className="text-[10px] uppercase font-bold text-amber-200">{(currentLanguage?.code || '').startsWith('hi') ? "अंक" : "Live Score"}</p>
                <p className="text-sm sm:text-base font-black text-white leading-none">
                  {runningScore} <span className="text-amber-300 text-xs">pts</span>
                </p>
              </div>
            </div>

            {/* Voice Instruction Button */}
            <button
              type="button"
              onClick={() => speakText(getRoutineSpeechText(currentLevel))}
              className={`p-3 rounded-2xl border-2 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-2 text-xs sm:text-sm font-bold ${
                isPlayingAudio 
                  ? 'bg-amber-100 border-amber-500 text-amber-950 animate-pulse' 
                  : 'bg-white hover:bg-stone-50 border-stone-300 text-stone-800'
              }`}
              title="Listen to Instructions"
            >
              <Volume2 className="w-5 h-5 text-amber-800 shrink-0" />
              <span className="hidden sm:inline">{(currentLanguage?.code || '').startsWith('hi') ? "निर्देश सुनें" : "Listen"}</span>
            </button>
          </div>
        </div>

        {/* 2. GAME PLAY AREA */}
        {!isGameOver ? (
          <div className="space-y-6">

            {/* Instruction Banner */}
            <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-400/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-800 text-white flex items-center justify-center shrink-0 shadow-sm text-2xl">
                  🌅
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-stone-950">{(currentLanguage?.code || '').startsWith('hi') ? "आपकी दिनचर्या में इसके बाद क्या आता है?" : "What comes next in your daily routine?"}</h3>
                  <p className="text-xs sm:text-sm text-stone-700 font-semibold mt-0.5">{(currentLanguage?.code || '').startsWith('hi') ? "सुबह उठने से लेकर रात सोने तक के क्रम में नीचे दिए गए कार्ड्स पर टैप करें।" : "Tap the cards below in chronological order from morning wake-up to nighttime rest."}</p>
                </div>
              </div>

              {/* Progress Dots */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                {Array.from({ length: TOTAL_LEVELS }).map((_, i) => (
                  <span 
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all ${
                      i + 1 === currentLevel 
                        ? 'bg-amber-800 scale-125 ring-2 ring-amber-400/50' 
                        : i + 1 < currentLevel 
                        ? 'bg-emerald-600' 
                        : 'bg-stone-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Feedback Toast */}
            {feedbackToast && (
              <div className={`p-4 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2.5 shadow-md border animate-in fade-in slide-in-from-top-2 ${
                feedbackToast.type === 'success'
                  ? 'bg-emerald-800 text-white border-emerald-700'
                  : 'bg-amber-100 text-amber-950 border-amber-400'
              }`}>
                {feedbackToast.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                ) : (
                  <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                )}
                <span>{feedbackToast.text}</span>
              </div>
            )}

            {/* 2A. BUILT TIMELINE ROW (TOP) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-stone-600">{(currentLanguage?.code || '').startsWith('hi') ? "आपकी दिनचर्या की समय-रेखा" : "Your Day's Sequence Timeline"}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 text-xs font-black border border-emerald-300">
                    {placedSequence.length} of {targetSequence.length} Steps Arranged
                  </span>
                </div>
                <span className="text-xs font-bold text-stone-500 hidden sm:inline">
                  {targetSequence.length - placedSequence.length} remaining
                </span>
              </div>

              {/* Sequence Step Slots Grid */}
              <div className={`grid gap-3 sm:gap-4 ${
                targetSequence.length <= 3 
                  ? 'grid-cols-1 sm:grid-cols-3' 
                  : targetSequence.length === 4 
                  ? 'grid-cols-2 sm:grid-cols-4' 
                  : targetSequence.length === 5 
                  ? 'grid-cols-2 sm:grid-cols-5' 
                  : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
              }`}>
                {targetSequence.map((targetItem, idx) => {
                  const placedItem = placedSequence[idx];
                  const isCurrentTarget = idx === nextExpectedIndex;

                  if (placedItem) {
                    return (
                      <div
                        key={placedItem.id}
                        className="rounded-2xl p-3 sm:p-4 bg-emerald-50 border-2 border-emerald-400 shadow-xs flex flex-col justify-between space-y-2 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[11px] font-black shadow-2xs">
                            Step {idx + 1} ✓
                          </span>
                          <CheckCircle2 className="w-5 h-5 text-emerald-700 stroke-[2.5]" />
                        </div>

                        <div className="aspect-[4/3] rounded-xl overflow-hidden bg-stone-200 border border-emerald-200">
                          <img
                            src={placedItem.image}
                            alt={placedItem.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div>
                          <p className="text-xs sm:text-sm font-black text-emerald-950 leading-tight">{(currentLanguage?.code || '').startsWith('hi') ? (placedItem.hindiTitle || placedItem.title) : placedItem.title}</p>
                          <p className="text-[11px] font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
                            {getPeriodIcon(placedItem.period)}
                            <span>{placedItem.timeLabel}</span>
                          </p>
                        </div>
                      </div>
                    );
                  }

                  // Empty Slot
                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl p-3 sm:p-4 border-2 border-dashed flex flex-col items-center justify-center text-center space-y-2 min-h-[160px] sm:min-h-[190px] transition-all ${
                        isCurrentTarget
                          ? 'bg-amber-50/70 border-amber-500 shadow-xs ring-2 ring-amber-400/30'
                          : 'bg-stone-50 border-stone-300 text-stone-400'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                        isCurrentTarget
                          ? 'bg-amber-800 text-white animate-pulse'
                          : 'bg-stone-200 text-stone-600'
                      }`}>
                        {idx + 1}
                      </div>

                      <div className="space-y-1">
                        <p className={`text-xs font-black ${isCurrentTarget ? 'text-amber-950' : 'text-stone-500'}`}>
                          {(currentLanguage?.code || '').startsWith('hi') ? (isCurrentTarget ? 'यहाँ अगला कदम चुनें' : `चरण ${idx + 1}`) : (isCurrentTarget ? 'Tap Next Step Here' : `Step ${idx + 1}`)}
                        </p>
                        <p className="text-[11px] font-medium text-stone-400">
                          {(currentLanguage?.code || '').startsWith('hi') ? (isCurrentTarget ? 'नीचे से चुनें' : 'प्रतीक्षारत...') : (isCurrentTarget ? 'Pick from below' : 'Waiting...')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2B. SHUFFLED ACTIVITY CARDS POOL (BOTTOM) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="text-lg sm:text-xl font-black text-stone-950 flex items-center gap-2">
                  <span>{(currentLanguage?.code || '').startsWith('hi') ? "उपलब्ध दिनचर्या कार्ड्स" : "Available Routine Cards"}</span>
                  <span>👇</span>
                </h3>
                <span className="text-xs font-bold text-stone-600">
                  {availableCards.length} cards to place
                </span>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {availableCards.map((card) => {
                  const isShaking = shakingCardId === card.id;

                  return (
                    <div
                      key={card.id}
                      onClick={() => handleCardClick(card)}
                      className={`rounded-3xl p-4 sm:p-5 bg-stone-50 hover:bg-amber-50/60 border-2 border-stone-300 hover:border-amber-800 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-98 relative overflow-hidden ${
                        isShaking ? 'animate-bounce border-rose-500 bg-rose-50 ring-2 ring-rose-400/40' : ''
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Period & Emoji Badge */}
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 rounded-full bg-white text-stone-800 text-xs font-black border border-stone-300 shadow-2xs flex items-center gap-1.5">
                            {getPeriodIcon(card.period)}
                            <span className="capitalize">{card.period}</span>
                          </span>
                          <span className="text-2xl">{card.emoji}</span>
                        </div>

                        {/* Large Real Photograph */}
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-stone-200 border-2 border-stone-200 relative group-hover:scale-102 transition-transform duration-300">
                          <img
                            src={card.image}
                            alt={card.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80';
                            }}
                          />
                        </div>

                        {/* Title & Local Name */}
                        <div>
                          <h4 className="text-base sm:text-lg font-black text-stone-950 group-hover:text-amber-900 transition-colors leading-tight">{(currentLanguage?.code || '').startsWith('hi') ? (card.hindiTitle || card.title) : card.title}</h4>
                          {card.localTitle && (
                            <p className="text-xs font-bold text-amber-900/80 mt-0.5">
                              {card.localTitle}
                            </p>
                          )}
                          <p className="text-xs text-stone-600 font-medium mt-1 leading-relaxed">
                            {card.description}
                          </p>
                        </div>
                      </div>

                      {/* Tap Action Bar */}
                      <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between text-xs sm:text-sm font-black text-amber-900">
                        <span className="flex items-center gap-1">
                          <span>{card.timeLabel}</span>
                        </span>
                        <span className="px-3 py-1 rounded-xl bg-amber-800 text-white font-black text-xs shadow-xs group-hover:bg-amber-900 flex items-center gap-1">
                          <span>Select</span>
                          <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          /* 3. GAME FINISHED SUMMARY SCREEN */
          <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-stone-200/90 shadow-lg text-center space-y-8 animate-in fade-in zoom-in-95 duration-300 max-w-3xl mx-auto">
            
            {/* Trophy & Stars */}
            <div className="space-y-3">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center mx-auto shadow-md text-5xl">
                🏆
              </div>
              <div className="flex justify-center gap-2">
                {[1, 2, 3].map((star) => (
                  <Star key={star} className="w-8 h-8 fill-amber-400 text-amber-500 drop-shadow-sm" />
                ))}
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-stone-950">
                Daily Routine Mastery Complete!
              </h2>
              <p className="text-base sm:text-lg text-stone-600 font-bold max-w-lg mx-auto">
                Wonderful job, {activePatient?.name?.split(' ')[0] || 'Elder'}! You arranged your daily living routines in natural chronological sequence!
              </p>
            </div>

            {/* Stats Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-200">
                <p className="text-xs font-bold text-amber-800 uppercase">Final Score</p>
                <p className="text-2xl sm:text-3xl font-black text-amber-950 mt-0.5">
                  {finalStats?.score || runningScore} <span className="text-sm font-bold text-amber-800">pts</span>
                </p>
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-200">
                <p className="text-xs font-bold text-emerald-800 uppercase">Accuracy</p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-950 mt-0.5">
                  {finalStats?.accuracy || 100}%
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-200">
                <p className="text-xs font-bold text-blue-800 uppercase">Levels</p>
                <p className="text-2xl sm:text-3xl font-black text-blue-950 mt-0.5">
                  5 / 5
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-2xl border-2 border-purple-200">
                <p className="text-xs font-bold text-purple-800 uppercase">Time</p>
                <p className="text-2xl sm:text-3xl font-black text-purple-950 mt-0.5">
                  {finalStats?.duration || '2 Mins'}
                </p>
              </div>
            </div>

            {/* Streak Bonus Card */}
            <div className="bg-gradient-to-r from-orange-500/15 via-amber-500/15 to-orange-500/15 p-4 rounded-2xl border-2 border-orange-300 flex items-center justify-center gap-3">
              <Flame className="w-7 h-7 text-orange-600 fill-orange-500" />
              <div className="text-left">
                <p className="text-sm font-black text-orange-950">
                  +1 Memory Routine Streak Maintained!
                </p>
                <p className="text-xs font-semibold text-orange-800">
                  Recorded to your cognitive care profile.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleRestart}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-black text-base shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5 stroke-[2.5]" />
                <span>{(currentLanguage?.code || '').startsWith('hi') ? "फिर से खेलें" : "Play Again"}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/patient/games')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-black text-base border-2 border-stone-300 cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                <span>Back to Dashboard</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* LEVEL TRANSITION OVERLAY MODAL */}
      {showLevelTransition && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full text-center space-y-4 border-3 border-amber-500 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto text-4xl shadow-inner animate-bounce">
              🌟
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-stone-950">
              {transitionMessage}
            </h3>
            <p className="text-sm font-bold text-stone-600">
    {(currentLanguage?.code || '').startsWith('hi') ? 'शानदार क्रमबद्धता! अगला स्तर शुरू हो रहा है...' : 'Great memory sequencing! Next round starting...'}
  </p>
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-800 h-full w-full animate-pulse" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
