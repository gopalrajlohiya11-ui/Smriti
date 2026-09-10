import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../../context/AppContext';
import { submitGameSessionApi, fetchLastGameDifficulty } from '../../../services/api';
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
  Heart,
  Users,
  Smile,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

/**
 * Separable, exported adaptive difficulty calculation function.
 * Increases option count if accuracy is high (>= 80%), decreases if low (< 50%).
 * 
 * @param {number} accuracy - Current session / round accuracy percentage (0 to 100)
 * @param {number} currentOptionCount - Current count of choices displayed (min 3, max 6)
 * @returns {number} Next round option count (3 to 6)
 */
export function calculateNextOptionCount(accuracy, currentOptionCount = 4) {
  if (accuracy >= 80) {
    return Math.min(6, currentOptionCount + 1);
  } else if (accuracy < 50) {
    return Math.max(3, currentOptionCount - 1);
  }
  return currentOptionCount;
}

/**
 * Helper to map option count to standardized difficulty level strings.
 */
export function mapOptionCountToDifficulty(count) {
  if (count <= 3) return 'easy';
  if (count <= 4) return 'medium';
  return 'hard';
}

// 8 Verified Authentic Family & Loved-One Portraits
const HINDI_PERSON_AFFIRMATIONS = {
  'fam-arjun': 'हाँ! ये आपके पोते अर्जुन हैं — वे आपके लिए ताज़ा गुड़ की मिठाइयाँ लाते हैं!',
  'fam-ananya': 'शानदार! ये आपकी बेटी डॉ. अनन्या हैं, जो आपके स्वास्थ्य का ध्यान रखती हैं।',
  'fam-riya': 'बिल्कुल सही! ये आपकी प्यारी पोती रिया हैं, जो आपकी कहानियाँ सुनना पसंद करती हैं।',
  'fam-rahul': 'सही जवाब! ये आपके सुपुत्र राहुल हैं, जो काम के बाद आपको फोन करते हैं।',
  'fam-sunita': 'बहुत सुंदर! ये आपकी जीवनसंगिनी सुनीता जी हैं।',
  'fam-biren': 'बधाई! ये आपके बचपन के मित्र बिरेन दास हैं।'
};

export const FAMILY_MEMBERS = [
  {
    id: 'fam-arjun',
    name: 'Arjun Sharma',
    hindiName: 'अर्जुन शर्मा',
    relation: 'Your Grandson',
    hindiRelation: 'आपका पोता (Grandson)',
    relationShort: 'Grandson',
    image: '/family/grandson_arjun.png',
    location: 'Guwahati Brahmaputra Riverfront',
    year: '2023',
    memoryNote: 'Arjun holding the traditional Bihu Pepa instrument by the river.',
    affirmation: 'Yes! That is your grandson Arjun — he always brings you fresh jaggery sweets! 💛',
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 'fam-ananya',
    name: 'Priya Sharma',
    hindiName: 'प्रिया शर्मा',
    relation: 'Your Daughter',
    hindiRelation: 'आपकी बेटी (Daughter)',
    relationShort: 'Daughter',
    image: '/family/daughter_priya.jpg',
    location: 'Jorhat Tea Estate',
    year: '2023',
    memoryNote: 'Priya wearing traditional Assamese Muga silk Mekhela Sador.',
    affirmation: 'Wonderful! That is your daughter Priya smiling on the tea garden porch.',
    color: 'from-rose-500 to-pink-600'
  },
  {
    id: 'fam-sunita',
    name: 'Sunita Sharma',
    hindiName: 'सुनीता शर्मा',
    relation: 'Your Spouse (Wife)',
    hindiRelation: 'आपकी पत्नी (Spouse)',
    relationShort: 'Spouse',
    image: '/family/wife_sunita.png',
    location: 'Courtyard Garden',
    year: '2021',
    memoryNote: 'Sunita caring for blooming marigolds and orchids in traditional Mekhela Sador.',
    affirmation: 'Heartwarming! That is your loving companion Sunita, tending fresh courtyard flowers. 💛',
    color: 'from-amber-400 to-yellow-600'
  },
  {
    id: 'fam-rahul',
    name: 'Magh Bihu Celebration',
    hindiName: 'माघ बिहू उत्सव',
    relation: 'Harvest Festival',
    hindiRelation: 'फसल का त्योहार (Festival)',
    relationShort: 'Festival',
    image: '/family/ramesh_bihu.png',
    location: 'Assam Village',
    year: '2022',
    memoryNote: 'Ramesh standing proudly before the traditional Bhelaghar harvest celebration.',
    affirmation: 'Correct! That is the joyous Magh Bihu harvest celebration with family. 🌿',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'fam-shillong',
    name: 'Shillong Family Trip',
    hindiName: 'शिलांग पारिवारिक यात्रा',
    relation: 'Family Vacation',
    hindiRelation: 'पारिवारिक छुट्टी (Holiday)',
    relationShort: 'Vacation',
    image: '/family/family_umiam_lake.png',
    location: 'Umiam Lake, Shillong',
    year: '2022',
    memoryNote: 'The whole family together enjoying the autumn breeze overlooking Umiam Lake.',
    affirmation: 'Splendid! That is the wonderful family gathering at Umiam Lake in Shillong.',
    color: 'from-teal-500 to-emerald-600'
  }
];

const TOTAL_LEVELS = 5;

// Array shuffle helper
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function FacesFamilyRecall() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activePatient, currentLanguage, isOnline, loadPatientPhotos } = useApp();

  const isDemo = activePatient?.isDemoSeed === true || 
    ['pat-1', 'pat-2', 'pat-3'].includes(activePatient?.id) || 
    ['pat-1', 'pat-2', 'pat-3'].includes(activePatient?._id) || 
    ['Ramesh Sharma', 'Meera Baruah', 'Biren Das'].includes(activePatient?.name);

  // Dynamic Patient Photos State with Local Storage Fast-Path
  const [patientPhotos, setPatientPhotos] = useState(() => {
    try {
      const pid = activePatient?.id || activePatient?._id || 'pat-1';
      const cached = localStorage.getItem(`smriti_patient_photos_${pid}`);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  });
  const [isPhotosLoading, setIsPhotosLoading] = useState(false);
  const [useDemoMode, setUseDemoMode] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const pid = activePatient?.id || activePatient?._id;
    if (pid) {
      loadPatientPhotos(pid).then(photos => {
        if (isMounted && Array.isArray(photos) && photos.length >= 2) {
          setPatientPhotos(photos);
          try {
            localStorage.setItem(`smriti_patient_photos_${pid}`, JSON.stringify(photos));
          } catch (e) {}
        }
      }).catch(() => {
        // Fallback already in place
      });
    }
    return () => { isMounted = false; };
  }, [activePatient, loadPatientPhotos]);

  // Active Family Pool: Use real uploaded patient photos if available, else always default to verified authentic family portraits
  const activeFamilyPool = useMemo(() => {
    if (patientPhotos && patientPhotos.length >= 2) {
      return patientPhotos.map((p, idx) => ({
        id: p._id || p.id || `custom-fam-${idx}`,
        name: p.taggedName || p.title || 'Family Member',
        hindiName: p.taggedName || p.title || 'परिवार के सदस्य',
        relation: p.relation ? `Your ${p.relation}` : 'Your Family Member',
        hindiRelation: p.relation ? `आपका/आपकी ${p.relation}` : 'आपके परिवार के सदस्य',
        relationShort: p.relation || 'Family',
        image: p.photoUrl || p.imageUrl || p.image || p.url || '/family/grandson_arjun.png',
        location: p.location || 'Home',
        year: p.year || '2024',
        memoryNote: p.description || p.audioPrompt || 'Cherished family moment.',
        affirmation: `Yes! That is ${p.taggedName || p.title || 'your loved one'} (${p.relation || 'Family'}). 💛`,
        color: 'from-amber-500 to-orange-500'
      }));
    }
    return FAMILY_MEMBERS;
  }, [patientPhotos]);

  // Multi-Level Progression State
  const [currentLevel, setCurrentLevel] = useState(1);
  const [runningScore, setRunningScore] = useState(0);
  const [showLevelTransition, setShowLevelTransition] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');

  // Current Level Mechanics
  const [optionCount, setOptionCount] = useState(4);
  const [currentPerson, setCurrentPerson] = useState(null);
  const [questionMode, setQuestionMode] = useState('name'); // 'name' | 'relation'
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answeredState, setAnsweredState] = useState(null); // 'correct' | 'incorrect' | null
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Per-Round ML Data Logging
  const [roundDetails, setRoundDetails] = useState([]);
  const [roundAttempts, setRoundAttempts] = useState(0);
  const [roundMistakes, setRoundMistakes] = useState(0);
  const roundStartTimeRef = useRef(Date.now());
  const gameStartTimeRef = useRef(Date.now());
  const usedPersonIdsRef = useRef(new Set());

  // Game Finished Summary Screen State
  const [isGameOver, setIsGameOver] = useState(false);
  const [finalStats, setFinalStats] = useState(null);
  const [isSavingScore, setIsSavingScore] = useState(false);
  const [aiStartingBanner, setAiStartingBanner] = useState(null);

  // Unmount cleanup
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Speech Helper (always cancels prior speech to prevent audio clashes)
  const speakText = useCallback((text, isAutoPlay = false) => {
    if (!text) return;
    speakLocalized({
      text,
      langCode: currentLanguage?.code || 'en',
      rate: 1.0,
      pitch: 1.0,
      isAutoPlay,
      patientId: activePatient?.id || activePatient?._id,
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false)
    });
  }, [currentLanguage, activePatient]);

  // Generate a round question
  const generateRound = useCallback((levelNum, numOptions) => {
    if (!activeFamilyPool || activeFamilyPool.length === 0) return;

    // Pick an unused person, or reset pool if exhausted
    let availablePool = activeFamilyPool.filter(p => !usedPersonIdsRef.current.has(p.id));
    if (availablePool.length === 0) {
      usedPersonIdsRef.current.clear();
      availablePool = activeFamilyPool;
    }
    const targetPerson = availablePool[Math.floor(Math.random() * availablePool.length)];
    usedPersonIdsRef.current.add(targetPerson.id);

    // Alternate modes: odd levels ask for Name, even levels ask for Relationship
    const mode = levelNum % 2 === 1 ? 'name' : 'relation';

    // Distractors pool
    const otherMembers = activeFamilyPool.filter(p => p.id !== targetPerson.id);
    const shuffledOthers = shuffleArray(otherMembers);
    const maxDistractors = Math.min(otherMembers.length, Math.max(1, numOptions - 1));
    const chosenDistractors = shuffledOthers.slice(0, maxDistractors);

    let roundOptions = [];
    if (mode === 'name') {
      const correctChoice = { id: targetPerson.id, label: targetPerson.name, isCorrect: true, person: targetPerson };
      const distractorChoices = chosenDistractors.map(d => ({
        id: d.id,
        label: d.name,
        isCorrect: false,
        person: d
      }));
      roundOptions = shuffleArray([correctChoice, ...distractorChoices]);
    } else {
      const correctChoice = { id: targetPerson.id, label: targetPerson.relation, isCorrect: true, person: targetPerson };
      const distractorChoices = chosenDistractors.map(d => ({
        id: d.id,
        label: d.relation,
        isCorrect: false,
        person: d
      }));
      roundOptions = shuffleArray([correctChoice, ...distractorChoices]);
    }

    setCurrentPerson(targetPerson);
    setQuestionMode(mode);
    setOptions(roundOptions);
    setSelectedOption(null);
    setAnsweredState(null);
    setFeedbackMessage('');
    setRoundAttempts(0);
    setRoundMistakes(0);
    roundStartTimeRef.current = Date.now();

    // Voice prompt for question (Automatic speech trigger -> isAutoPlay: true)
    const isHindi = (currentLanguage?.code || '').startsWith('hi');
    const promptText = isHindi
      ? (mode === 'name' ? `स्तर ${levelNum}। तस्वीर में यह कौन हैं?` : `स्तर ${levelNum}। इनका आपसे क्या रिश्ता है?`)
      : (mode === 'name' ? `Level ${levelNum}. Who is this in the photo?` : `Level ${levelNum}. What is their relationship to you?`);
    speakText(promptText, true);
  }, [speakText, currentLanguage, activeFamilyPool]);

  const hasInitializedRef = useRef(false);

  // Start game on mount with ML adaptive calibration (runs ONCE per game session)
  useEffect(() => {
    let isMounted = true;
    if (activeFamilyPool.length < 2) return;
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    // Immediately generate round 1 so the game opens in 0ms without blank/loading state:
    usedPersonIdsRef.current.clear();
    generateRound(1, 4);

    async function initAdaptiveStartingDifficulty() {
      try {
        const pid = activePatient?.id || activePatient?._id;
        const diffInfo = await fetchLastGameDifficulty(pid, 'faces-family-recall');
        if (!isMounted) return;

        let initialOpt = 4;
        if (diffInfo && typeof diffInfo.aiDifficulty === 'number') {
          // Map ML difficulty (1-5) to Faces & Family Recall option count (3 to 6)
          initialOpt = Math.max(3, Math.min(6, diffInfo.aiDifficulty + 2));
          setOptionCount(initialOpt);
          console.log(`🤖 [FacesFamilyRecall AI Start] Calibrated starting option count: ${initialOpt} (ML recommended level: ${diffInfo.aiDifficulty}) for patient ${pid}`);

          if (diffInfo.hasHistory) {
            const isHindiLang = (currentLanguage?.code || '').startsWith('hi');
            const diffName = diffInfo.aiDifficulty <= 1 ? (isHindiLang ? 'सरल' : 'Gentle') : diffInfo.aiDifficulty === 2 ? (isHindiLang ? 'मध्यम' : 'Standard') : (isHindiLang ? 'उन्नत' : 'Advanced');
            const msg = isHindiLang
              ? `🤖 एआई अनुकूली स्तर: आपके हालिया प्रदर्शन के आधार पर स्तर ${diffInfo.aiDifficulty} (${diffName}) पर शुरू किया गया! 🌟`
              : `🤖 AI Adaptive Calibration: Starting at Level ${diffInfo.aiDifficulty} (${diffName}) based on your recent progress! 🌟`;
            setAiStartingBanner(msg);
            setTimeout(() => { if (isMounted) setAiStartingBanner(null); }, 6000);
          }
        }
      } catch (e) {
        // Fallback already generated
      }
    }

    gameStartTimeRef.current = Date.now();
    initAdaptiveStartingDifficulty();
    return () => { isMounted = false; };
  }, [activeFamilyPool.length, activePatient?.id, activePatient?._id, generateRound]);

  // Handle Option Tap
  const handleOptionClick = (option) => {
    if (answeredState !== null || showLevelTransition || isGameOver) return;

    setSelectedOption(option);
    const isCorrect = option.isCorrect;
    const totalAtt = roundAttempts + 1;
    setRoundAttempts(totalAtt);

    const timeTaken = Math.max(1, Math.round((Date.now() - roundStartTimeRef.current) / 1000));

    if (isCorrect) {
      setAnsweredState('correct');
      const stepPoints = 20;
      setRunningScore(prev => prev + stepPoints);

      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#15803d', '#f59e0b', '#ec4899']
      });

      const isHindi = (currentLanguage?.code || '').startsWith('hi');
      const affirmation = (isHindi && currentPerson?.id && HINDI_PERSON_AFFIRMATIONS[currentPerson.id]) 
        ? HINDI_PERSON_AFFIRMATIONS[currentPerson.id] 
        : (currentPerson?.affirmation || 'Correct! Well done! 💛');
      setFeedbackMessage(affirmation);
      speakText(affirmation, true);

      // Record round metrics
      const roundAccuracy = Math.round((1 / totalAtt) * 100);
      const currentRoundMetric = {
        level: currentLevel,
        itemCount: options.length,
        mode: `family_${questionMode}`,
        accuracy: roundAccuracy,
        correctCount: 1,
        totalAttempts: totalAtt,
        timeTakenSeconds: timeTaken
      };

      const updatedRoundDetails = [...roundDetails, currentRoundMetric];
      setRoundDetails(updatedRoundDetails);

      // Auto-advance after 2.5 seconds
      setTimeout(() => {
        handleRoundCompletion(updatedRoundDetails, roundAccuracy);
      }, 2400);
    } else {
      // Gentle warm correction
      setAnsweredState('incorrect');
      setRoundMistakes(prev => prev + 1);

      const gentleCorrection = questionMode === 'name'
        ? `This is actually ${currentPerson?.name || 'your family member'} (${currentPerson?.relation || 'Family'}) 💛`
        : `This is actually ${currentPerson?.relation || 'your family member'} — ${currentPerson?.name || ''} 💛`;

      setFeedbackMessage(gentleCorrection);
      speakText(gentleCorrection, true);

      // Record round metrics with lower accuracy
      const roundAccuracy = Math.round((1 / Math.max(2, totalAtt + 1)) * 100);
      const currentRoundMetric = {
        level: currentLevel,
        itemCount: options.length,
        mode: `family_${questionMode}`,
        accuracy: roundAccuracy,
        correctCount: 1,
        totalAttempts: totalAtt + 1,
        timeTakenSeconds: timeTaken + 2
      };

      const updatedRoundDetails = [...roundDetails, currentRoundMetric];
      setRoundDetails(updatedRoundDetails);

      // Auto-advance after 3.2 seconds so patient can take in the correct memory
      setTimeout(() => {
        handleRoundCompletion(updatedRoundDetails, roundAccuracy);
      }, 3200);
    }
  };

  // Round Completion & Transition
  const handleRoundCompletion = (updatedRounds, lastRoundAccuracy) => {
    if (currentLevel < TOTAL_LEVELS) {
      const nextLvl = currentLevel + 1;
      const nextOptions = calculateNextOptionCount(lastRoundAccuracy, optionCount);
      console.log(`[FacesFamilyRecall Adaptive Difficulty] Round ${currentLevel} finished with Accuracy: ${lastRoundAccuracy}%. Option Count: ${optionCount} -> Next Round Option Count: ${nextOptions}`);
      setOptionCount(nextOptions);

      const isHindi = (currentLanguage?.code || '').startsWith('hi');
      const transitionMsg = isHindi 
        ? `स्तर ${currentLevel} पूरा हुआ! 🌟 स्तर ${nextLvl} शुरू हो रहा है...`
        : `Level ${currentLevel} Complete! 🌟 Moving to Level ${nextLvl}...`;
      setTransitionMessage(transitionMsg);
      setShowLevelTransition(true);

      setTimeout(() => {
        setShowLevelTransition(false);
        setCurrentLevel(nextLvl);
        generateRound(nextLvl, nextOptions);
      }, 2000);
    } else {
      finishGame(updatedRounds);
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

    const finalScaledScore = Math.min(100, Math.max(60, Math.round(avgAccuracy * 0.8 + (runningScore / 100) * 20)));

    const summaryStats = {
      score: finalScaledScore,
      accuracy: avgAccuracy,
      duration: `${durationMinutes} Min${durationMinutes > 1 ? 's' : ''}`,
      durationSeconds: totalDurationSeconds,
      difficultyLevel: mapOptionCountToDifficulty(optionCount),
      roundsCompleted: finalRounds.length
    };
    setFinalStats(summaryStats);

    speakText(`Congratulations ${activePatient?.name?.split(' ')[0] || ''}! You completed all 5 levels of Faces and Family Recall with a score of ${finalScaledScore}!`, true);

    // Submit Game Session to MongoDB
    setIsSavingScore(true);
    const payload = {
      patientId: activePatient?.id || activePatient?._id,
      gameType: 'faces-family-recall',
      title: 'Faces & Family Recall',
      category: 'Family & Social Memory',
      score: finalScaledScore,
      difficultyLevel: mapOptionCountToDifficulty(optionCount),
      duration: `${durationMinutes} Mins`,
      roundDetails: finalRounds
    };

    try {
      if (isOnline) {
        await submitGameSessionApi(payload);
        console.log('✅ Faces & Family Recall score submitted to MongoDB');
      } else {
        await queueOfflineAction({
          action: 'submitGameSession',
          patientId: activePatient?.id || activePatient?._id,
          gameData: payload
        });
        console.log('📦 Faces & Family Recall score queued for offline sync');
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
    stopSpeech();
    setCurrentLevel(1);
    setRunningScore(0);
    setRoundDetails([]);
    setIsGameOver(false);
    setFinalStats(null);
    setShowLevelTransition(false);
    setOptionCount(4);
    usedPersonIdsRef.current.clear();
    gameStartTimeRef.current = Date.now();
    generateRound(1, 4);
  };

  if (!currentPerson && !isGameOver) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#FAF7F2] pb-24 pt-6 px-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 border-2 border-stone-200/90 text-center space-y-3 shadow-md max-w-sm w-full">
          <Users className="w-10 h-10 text-rose-600 mx-auto animate-pulse" />
          <p className="text-sm font-black text-stone-800">
            {(currentLanguage?.code || '').startsWith('hi') ? 'स्मृति दौर तैयार किया जा रहा है...' : 'Preparing Memory Round...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAF7F2] pb-24 pt-6 px-4 sm:px-6 lg:px-8 xl:px-10">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* AI Adaptive Difficulty Banner */}
        {aiStartingBanner && (
          <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 text-white px-4 py-3 rounded-2xl shadow-md border-2 border-teal-400 flex items-center justify-between gap-3 animate-bounce">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
              <p className="text-xs sm:text-sm font-black">{aiStartingBanner}</p>
            </div>
            <button 
              type="button" 
              onClick={() => setAiStartingBanner(null)} 
              className="text-white/80 hover:text-white text-xs font-bold px-2 py-1 bg-white/20 rounded-lg shrink-0 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

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
                <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-950 text-xs font-black uppercase tracking-wider border border-rose-300">
                  Family & People Recall
                </span>
                <span className="text-xs font-bold text-stone-500">
                  Facial & Relationship Recall
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-950 mt-0.5">
                {(currentLanguage?.code || '').startsWith('hi') ? 'पारिवारिक चेहरे और यादें (Faces & Family)' : 'Faces & Family Recall'}
              </h1>
            </div>
          </div>

          {/* Persistent Level & Live Score Header */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap self-start md:self-center">
            {/* Level Counter */}
            <div className="px-4 py-2 rounded-2xl bg-stone-900 text-white flex items-center gap-2 shadow-sm border border-stone-800">
              <Users className="w-5 h-5 text-amber-400" />
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
              onClick={() => {
                if (isPlayingAudio) {
                  stopSpeech();
                  setIsPlayingAudio(false);
                  return;
                }
                const isHindi = (currentLanguage?.code || '').startsWith('hi');
                if (isHindi) {
                  speakText(questionMode === 'name' ? `स्तर ${currentLevel}। तस्वीर में दिखाए गए इस व्यक्ति को पहचानें।` : `स्तर ${currentLevel}। इनका आपसे क्या रिश्ता है?`);
                } else {
                  speakText(questionMode === 'name' ? `Level ${currentLevel}. Who is this in the photograph?` : `Level ${currentLevel}. What is their relationship to you?`);
                }
              }}
              className={`p-3 rounded-2xl border-2 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-2 text-xs sm:text-sm font-bold ${
                isPlayingAudio 
                  ? 'bg-amber-100 border-amber-500 text-amber-950 animate-pulse' 
                  : 'bg-white hover:bg-stone-50 border-stone-300 text-stone-800'
              }`}
              title={isPlayingAudio ? "Tap to Stop Voice" : "Listen to Question"}
            >
              {isPlayingAudio ? <VolumeX className="w-5 h-5 text-amber-800 shrink-0" /> : <Volume2 className="w-5 h-5 text-amber-800 shrink-0" />}
              <span className="hidden sm:inline">{isPlayingAudio ? ((currentLanguage?.code || '').startsWith('hi') ? "आवाज़ रोकें" : "Stop") : ((currentLanguage?.code || '').startsWith('hi') ? "निर्देश सुनें" : "Listen")}</span>
            </button>
          </div>
        </div>

        {/* 2. GAME PLAY AREA */}
        {!isGameOver ? (
          <div className="space-y-6">

            {/* Question Banner */}
            <div className="bg-gradient-to-r from-rose-500/15 via-amber-500/10 to-rose-500/15 border-2 border-rose-300 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-800 text-white flex items-center justify-center shrink-0 shadow-sm text-2xl">
                  {questionMode === 'name' ? '👤' : '💛'}
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-stone-950">
                    {(currentLanguage?.code || '').startsWith('hi') 
                      ? (questionMode === 'name' ? 'तस्वीर में यह कौन हैं?' : 'इनका आपसे क्या रिश्ता है?')
                      : (questionMode === 'name' ? 'Who is this in the photograph?' : 'What is their relationship to you?')}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-700 font-semibold mt-0.5">
                    {questionMode === 'name'
                      ? 'Tap the matching name from the options below.'
                      : 'Tap the matching family relation from the options below.'}
                  </p>
                </div>
              </div>

              {/* Progress Dots */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                {Array.from({ length: TOTAL_LEVELS }).map((_, i) => (
                  <span 
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all ${
                      i + 1 === currentLevel 
                        ? 'bg-rose-800 scale-125 ring-2 ring-rose-400/50' 
                        : i + 1 < currentLevel 
                        ? 'bg-emerald-600' 
                        : 'bg-stone-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 2A. LARGE MAIN PORTRAIT DISPLAY */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-sm flex flex-col md:flex-row items-center gap-6 md:gap-8">
              
              {/* Photo Frame */}
              <div className="w-full md:w-1/2 aspect-[4/3] rounded-3xl overflow-hidden bg-stone-200 border-3 border-amber-800/40 shadow-md relative group">
                <img
                  src={currentPerson?.image || '/family/grandson_arjun.png'}
                  alt={currentPerson?.name || 'Family member'}
                  style={{
                    objectPosition: (currentPerson?.image?.includes('priya') || (currentPerson?.name || '').includes('Priya')) ? 'center 15%' :
                                    (currentPerson?.image?.includes('arjun') || (currentPerson?.name || '').includes('Arjun')) ? 'center top' :
                                    (currentPerson?.image?.includes('bihu') || (currentPerson?.name || '').includes('Bihu')) ? 'center 20%' : 'center center'
                  }}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                
                {/* Year & Location Pill */}
                <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-xs text-white text-xs font-black px-3 py-1 rounded-full shadow-xs">
                  {currentPerson?.year || '2023'} • {currentPerson?.location || 'Home'}
                </div>
              </div>

              {/* Memory Context / Clue Box */}
              <div className="w-full md:w-1/2 space-y-4 text-left">
                <div className="bg-amber-50/80 border-2 border-amber-200 rounded-2xl p-4 sm:p-5 space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full border border-amber-300">
                    Memory Hint
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-stone-800 leading-relaxed italic">
                    "{currentPerson?.memoryNote || 'A cherished family memory.'}"
                  </p>
                </div>

                {/* Voice Read Clue */}
                <button
                  type="button"
                  onClick={() => speakText(`Memory hint: ${currentPerson?.memoryNote || 'A cherished family memory.'}`)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-300 transition-colors cursor-pointer active:scale-95"
                >
                  <Volume2 className="w-4 h-4 text-amber-800" />
                  <span>Hear Memory Clue</span>
                </button>
              </div>

            </div>

            {/* Feedback Message Toast */}
            {feedbackMessage && (
              <div className={`p-4 sm:p-5 rounded-3xl text-sm sm:text-base font-black flex items-center justify-center gap-3 shadow-md border animate-in fade-in zoom-in-95 duration-300 ${
                answeredState === 'correct'
                  ? 'bg-emerald-800 text-white border-emerald-700'
                  : 'bg-amber-100 text-amber-950 border-amber-400'
              }`}>
                {answeredState === 'correct' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-300 shrink-0" />
                ) : (
                  <Heart className="w-6 h-6 text-rose-600 fill-rose-500 shrink-0" />
                )}
                <span>{feedbackMessage}</span>
              </div>
            )}

            {/* 2B. TAPPABLE MULTIPLE CHOICE OPTIONS */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-stone-200 shadow-sm space-y-4">
              <h3 className="text-base sm:text-lg font-black text-stone-950 border-b border-stone-200 pb-3">
                {questionMode === 'name' ? 'Choose the Correct Name:' : 'Choose the Correct Relation:'}
              </h3>

              {/* Options Grid (Large Tappable Cards) */}
              <div className={`grid gap-4 ${
                options.length <= 3 
                  ? 'grid-cols-1 sm:grid-cols-3' 
                  : options.length === 4 
                  ? 'grid-cols-1 sm:grid-cols-2' 
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}>
                {options.map((option, idx) => {
                  const isSelected = selectedOption?.id === option.id;
                  const isRevealed = answeredState !== null;
                  const isCorrect = option.isCorrect;

                  let cardStyle = 'bg-stone-50 hover:bg-rose-50/70 border-stone-300 hover:border-rose-700 text-stone-900';

                  if (isRevealed) {
                    if (isCorrect) {
                      cardStyle = 'bg-emerald-100 border-emerald-600 text-emerald-950 ring-4 ring-emerald-500/30';
                    } else if (isSelected && !isCorrect) {
                      cardStyle = 'bg-amber-100 border-amber-500 text-amber-950 opacity-80';
                    } else {
                      cardStyle = 'bg-stone-50 border-stone-200 text-stone-400 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isRevealed}
                      onClick={() => handleOptionClick(option)}
                      className={`min-h-[85px] sm:min-h-[95px] p-5 sm:p-6 rounded-2xl border-3 font-black text-lg sm:text-xl flex items-center justify-between gap-4 transition-all cursor-pointer shadow-xs active:scale-98 ${cardStyle}`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <span className="w-8 h-8 rounded-full bg-stone-200/80 text-stone-700 text-xs font-black flex items-center justify-center shrink-0 border border-stone-300">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option.label}</span>
                      </div>

                      {isRevealed && isCorrect && (
                        <CheckCircle2 className="w-7 h-7 text-emerald-700 stroke-[3] shrink-0 animate-bounce" />
                      )}
                    </button>
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
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center mx-auto shadow-md text-5xl">
                💛
              </div>
              <div className="flex justify-center gap-2">
                {[1, 2, 3].map((star) => (
                  <Star key={star} className="w-8 h-8 fill-amber-400 text-amber-500 drop-shadow-sm" />
                ))}
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-stone-950">
                Family & Loved-Ones Recall Complete!
              </h2>
              <p className="text-base sm:text-lg text-stone-600 font-bold max-w-lg mx-auto">
                Cherished moments, {activePatient?.name?.split(' ')[0] || 'Elder'}! You practiced remembering the faces and relationships of your loved ones.
              </p>
            </div>

            {/* Stats Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-rose-50 p-4 rounded-2xl border-2 border-rose-200">
                <p className="text-xs font-bold text-rose-800 uppercase">Final Score</p>
                <p className="text-2xl sm:text-3xl font-black text-rose-950 mt-0.5">
                  {finalStats?.score || runningScore} <span className="text-sm font-bold text-rose-800">pts</span>
                </p>
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-200">
                <p className="text-xs font-bold text-emerald-800 uppercase">Accuracy</p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-950 mt-0.5">
                  {finalStats?.accuracy || 100}%
                </p>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-200">
                <p className="text-xs font-bold text-amber-800 uppercase">Levels</p>
                <p className="text-2xl sm:text-3xl font-black text-amber-950 mt-0.5">
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
            <div className="bg-gradient-to-r from-rose-500/15 via-amber-500/15 to-rose-500/15 p-4 rounded-2xl border-2 border-rose-300 flex items-center justify-center gap-3">
              <Flame className="w-7 h-7 text-rose-600 fill-rose-500" />
              <div className="text-left">
                <p className="text-sm font-black text-rose-950">
                  +1 Memory Routine Streak Maintained!
                </p>
                <p className="text-xs font-semibold text-rose-800">
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
          <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full text-center space-y-4 border-3 border-rose-400 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-2xl bg-rose-100 text-rose-900 flex items-center justify-center mx-auto text-4xl shadow-inner">
              <Users className="w-10 h-10 text-rose-800" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-stone-950">
              {transitionMessage}
            </h3>
            <p className="text-sm font-bold text-stone-600">
    {(currentLanguage?.code || '').startsWith('hi') ? 'शानदार पहचान! अगला दौर शुरू हो रहा है...' : 'Great people recall! Next round starting...'}
  </p>
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
              <div className="bg-rose-700 h-full w-full animate-pulse" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
