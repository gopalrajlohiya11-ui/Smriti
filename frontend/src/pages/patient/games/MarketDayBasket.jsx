import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  XCircle, 
  Trophy, 
  Flame, 
  ShoppingBasket, 
  RotateCcw, 
  ChevronRight,
  Heart,
  Check,
  Plus
} from 'lucide-react';

/**
 * Separable, exported adaptive difficulty calculation function.
 * Increases item count if accuracy is high (>80%), decreases if low (<50%).
 * 
 * @param {number} accuracy - Current session accuracy percentage (0 to 100)
 * @param {number} currentCount - Current count of items displayed in categorization (min 3, max 7)
 * @returns {number} Next round item count (3 to 7)
 */
export function calculateNextItemCount(accuracy, currentCount = 3) {
  if (accuracy >= 80) {
    return Math.min(7, currentCount + 1);
  } else if (accuracy < 50) {
    return Math.max(3, currentCount - 1);
  }
  return currentCount;
}

/**
 * Helper to map item count to standardized difficulty level strings.
 */
export function mapItemCountToDifficulty(itemCount) {
  if (itemCount <= 3) return 'easy';
  if (itemCount <= 5) return 'medium';
  return 'hard';
}

// Full catalogue of North-East Indian produce items with friendly emojis
const PRODUCE_CATALOGUE = [
  {
    id: 'bhut_jolokia',
    name: 'King Chilli / Bhut Jolokia',
    localName: 'ভূত জলকীয়া',
    emoji: '🌶️',
    color: 'from-rose-500 to-red-600',
    type: 'spice',
    isGreen: false,
    isFruit: false,
    isVegetable: true,
    isNER: true,
    unitPrice: 5
  },
  {
    id: 'bamboo_shoot',
    name: 'Tender Bamboo Shoot (Khorisa)',
    localName: 'বাঁহ গাজ',
    emoji: '🎍',
    color: 'from-emerald-600 to-green-700',
    type: 'green_veg',
    isGreen: true,
    isFruit: false,
    isVegetable: true,
    isNER: true,
    unitPrice: 15
  },
  {
    id: 'assam_tea',
    name: 'Fresh Assam Tea Leaves',
    localName: 'অসমীয়া সেউজীয়া চাহ',
    emoji: '🍵',
    color: 'from-emerald-500 to-teal-700',
    type: 'green_veg',
    isGreen: true,
    isFruit: false,
    isVegetable: true,
    isNER: true,
    unitPrice: 10
  },
  {
    id: 'kaji_nemu',
    name: 'Assam Lemon (Kaji Nemu)',
    localName: 'কাজী নেমু',
    emoji: '🍋',
    color: 'from-lime-400 to-amber-500',
    type: 'sour_fruit',
    isGreen: true,
    isFruit: true,
    isVegetable: false,
    isNER: true,
    unitPrice: 5
  },
  {
    id: 'pineapple',
    name: 'Tripura Queen Pineapple',
    localName: 'ৰসাল আনাৰস',
    emoji: '🍍',
    color: 'from-amber-400 to-orange-500',
    type: 'sweet_fruit',
    isGreen: false,
    isFruit: true,
    isVegetable: false,
    isNER: true,
    unitPrice: 20
  },
  {
    id: 'banana',
    name: 'Malbhog Sweet Banana',
    localName: 'মালভোগ কল',
    emoji: '🍌',
    color: 'from-yellow-400 to-amber-500',
    type: 'sweet_fruit',
    isGreen: false,
    isFruit: true,
    isVegetable: false,
    isNER: true,
    unitPrice: 5
  },
  {
    id: 'lai_xaak',
    name: 'Lai Xaak (Mustard Greens)',
    localName: 'লাই শাক',
    emoji: '🥬',
    color: 'from-green-500 to-emerald-700',
    type: 'green_veg',
    isGreen: true,
    isFruit: false,
    isVegetable: true,
    isNER: true,
    unitPrice: 10
  },
  {
    id: 'tomato',
    name: 'Ripe Country Tomato',
    localName: 'ৰঙা বিলাহী',
    emoji: '🍅',
    color: 'from-red-500 to-rose-600',
    type: 'vegetable',
    isGreen: false,
    isFruit: false,
    isVegetable: true,
    isNER: false,
    unitPrice: 10
  },
  {
    id: 'coconut',
    name: 'Fresh Coconut (Narikol)',
    localName: 'সুস্বাদু নাৰিকল',
    emoji: '🥥',
    color: 'from-stone-600 to-stone-800',
    type: 'fruit',
    isGreen: false,
    isFruit: true,
    isVegetable: false,
    isNER: true,
    unitPrice: 25
  },
  {
    id: 'yam',
    name: 'Kath Aloo (Sweet Yam)',
    localName: 'কাঠ আলু',
    emoji: '🍠',
    color: 'from-purple-600 to-amber-800',
    type: 'root',
    isGreen: false,
    isFruit: false,
    isVegetable: true,
    isNER: true,
    unitPrice: 15
  }
];

export default function MarketDayBasket() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activePatient, isOnline, toggleReminder, loadRealData } = useApp();

  // Total rounds per play session
  const TOTAL_ROUNDS = 5;

  // Session State
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [itemCount, setItemCount] = useState(3); // Start with 3 items (Adaptive: 3 to 7)
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [successfulTaps, setSuccessfulTaps] = useState(0);
  const [collectedBasket, setCollectedBasket] = useState([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [finalScoreSummary, setFinalScoreSummary] = useState(null);

  // Audio / Speech State
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Round Interactive State
  const [selectedItemsInRound, setSelectedItemsInRound] = useState(new Set());
  const [shakeItemId, setShakeItemId] = useState(null);
  const [mathAnswerSelected, setMathAnswerSelected] = useState(null);
  const [mathAnswerFeedback, setMathAnswerFeedback] = useState(null); // 'correct' | 'wrong'
  const [roundCompleted, setRoundCompleted] = useState(false);

  // Start Time for Duration calculation
  const sessionStartTimeRef = React.useRef(Date.now());

  // Generate Round Definitions
  const roundsConfig = useMemo(() => {
    return [
      {
        id: 'round-1',
        type: 'categorization',
        title: 'Fresh Greens for the Market Basket',
        instruction: 'Tap ONLY the Green Vegetables & Tea Leaves to put into your basket!',
        criteria: (item) => item.isGreen === true && item.isVegetable === true,
        criteriaHint: 'Green leafy vegetables and tender shoots',
        targetLabel: 'Green Vegetables 🥬'
      },
      {
        id: 'round-2',
        type: 'math',
        title: 'Morning Tea Leaves Shopping',
        scenario: 'You buy 2 packets of Assam Tea Leaves at ₹10 each. What is the total cost?',
        itemEmoji: '🍵',
        mathEquation: '2 × ₹10 = ₹20',
        correctAnswer: 20,
        options: [15, 20, 25, 30]
      },
      {
        id: 'round-3',
        type: 'categorization',
        title: 'Sweet & Refreshing Fruits',
        instruction: 'Tap ALL the Delicious Fruits (Pineapple, Banana, Lemon, Coconut)!',
        criteria: (item) => item.isFruit === true,
        criteriaHint: 'Juicy lemons, sweet pineapples, bananas & coconuts',
        targetLabel: 'Fresh Fruits 🍍'
      },
      {
        id: 'round-4',
        type: 'math',
        title: 'Bazaar Change Return',
        scenario: 'You bought spicy King Chilli for ₹35 and gave a ₹50 note. How much change should you get back?',
        itemEmoji: '🌶️',
        mathEquation: '₹50 − ₹35 = ₹15',
        correctAnswer: 15,
        options: [10, 15, 20, 25]
      },
      {
        id: 'round-5',
        type: 'categorization',
        title: 'Assam Signature Produce',
        instruction: 'Tap ALL authentic North-East regional specialties for your family dinner!',
        criteria: (item) => item.isNER === true,
        criteriaHint: 'Specialties native to Assam, Nagaland & Tripura',
        targetLabel: 'NER Specialties 🌸'
      }
    ];
  }, []);

  const activeRound = roundsConfig[currentRoundIndex] || roundsConfig[0];

  // Helper to Speak Instructions for Elderly Clarity
  const speakInstruction = useCallback((text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Compute Current Session Accuracy
  const currentAccuracy = useMemo(() => {
    if (totalAttempts === 0) return 100;
    return Math.round((successfulTaps / totalAttempts) * 100);
  }, [totalAttempts, successfulTaps]);

  // Generate Current Round Display Items (for Categorization mode)
  const roundDisplayItems = useMemo(() => {
    if (activeRound.type !== 'categorization') return [];

    // Filter matching target items vs non-target distractors
    const matching = PRODUCE_CATALOGUE.filter(activeRound.criteria);
    const nonMatching = PRODUCE_CATALOGUE.filter(item => !activeRound.criteria(item));

    // Shuffle and pick a balanced set of `itemCount` items (at least 1-2 targets)
    const shuffledMatching = [...matching].sort(() => 0.5 - Math.random());
    const shuffledNonMatching = [...nonMatching].sort(() => 0.5 - Math.random());

    const numTargets = Math.min(shuffledMatching.length, Math.max(1, Math.floor(itemCount / 2) + 1));
    const numDistractors = Math.max(1, itemCount - numTargets);

    const selectedTargets = shuffledMatching.slice(0, numTargets);
    const selectedDistractors = shuffledNonMatching.slice(0, numDistractors);

    const combined = [...selectedTargets, ...selectedDistractors].sort(() => 0.5 - Math.random());
    return combined;
  }, [activeRound, itemCount]);

  // Voice narration when a new round starts
  useEffect(() => {
    if (activeRound) {
      const speechText = activeRound.type === 'categorization' 
        ? `${activeRound.title}. ${activeRound.instruction}`
        : `${activeRound.title}. ${activeRound.scenario}`;
      speakInstruction(speechText);
    }
  }, [currentRoundIndex, activeRound, speakInstruction]);

  // Handle Categorization Item Tap
  const handleItemTap = (item) => {
    if (roundCompleted) return;

    setTotalAttempts(prev => prev + 1);
    const isCorrect = activeRound.criteria(item);

    if (isCorrect) {
      // Correct Match
      setSuccessfulTaps(prev => prev + 1);
      const nextSet = new Set(selectedItemsInRound);
      nextSet.add(item.id);
      setSelectedItemsInRound(nextSet);

      // Add to player's woven market basket
      setCollectedBasket(prev => [item, ...prev.filter(i => i.id !== item.id)]);

      // Check if all correct items in this round have been found
      const remainingTargets = roundDisplayItems.filter(i => activeRound.criteria(i) && !nextSet.has(i.id));

      if (remainingTargets.length === 0) {
        // Round Completed successfully!
        setRoundCompleted(true);
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#15803d', '#f59e0b', '#9a3412']
        });
      }
    } else {
      // Wrong Match: Gentle wobble shake without penalty
      setShakeItemId(item.id);
      setTimeout(() => setShakeItemId(null), 600);
    }
  };

  // Handle Math Answer Selection
  const handleMathAnswer = (option) => {
    if (roundCompleted) return;

    setTotalAttempts(prev => prev + 1);
    setMathAnswerSelected(option);

    if (option === activeRound.correctAnswer) {
      setSuccessfulTaps(prev => prev + 1);
      setMathAnswerFeedback('correct');
      setRoundCompleted(true);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#15803d', '#22c55e', '#f59e0b']
      });
    } else {
      setMathAnswerFeedback('wrong');
      setTimeout(() => {
        setMathAnswerFeedback(null);
        setMathAnswerSelected(null);
      }, 1200);
    }
  };

  // Advance to Next Round with Adaptive Difficulty Adjustment
  const handleNextRound = () => {
    // 1. Calculate next round item count adaptively based on current accuracy
    const nextCount = calculateNextItemCount(currentAccuracy, itemCount);
    setItemCount(nextCount);

    // 2. Check if we've reached the end of the session
    if (currentRoundIndex + 1 >= TOTAL_ROUNDS) {
      finishGameSession(nextCount);
    } else {
      // Move to next round
      setCurrentRoundIndex(prev => prev + 1);
      setSelectedItemsInRound(new Set());
      setMathAnswerSelected(null);
      setMathAnswerFeedback(null);
      setRoundCompleted(false);
    }
  };

  // Finish Game Session & Submit Score
  const finishGameSession = async (settledItemCount) => {
    setIsSessionComplete(true);
    setIsSubmittingScore(true);

    const durationSeconds = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);
    const finalAccuracy = totalAttempts > 0 ? Math.round((successfulTaps / totalAttempts) * 100) : 100;
    const finalDifficulty = mapItemCountToDifficulty(settledItemCount);

    const sessionPayload = {
      patientId: activePatient?.id || activePatient?._id,
      gameType: 'market-day-basket',
      title: 'Market Day Basket',
      category: 'Pattern & Math Recall',
      score: finalAccuracy,
      difficultyLevel: finalDifficulty,
      duration: `${durationSeconds}s`
    };

    setFinalScoreSummary({
      accuracy: finalAccuracy,
      totalAttempts,
      successfulTaps,
      itemsCollected: collectedBasket.length,
      difficultyLevel: finalDifficulty,
      duration: durationSeconds
    });

    // Big Celebration Confetti
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#15803d', '#9a3412', '#f59e0b', '#3b82f6']
    });

    try {
      if (navigator.onLine) {
        await submitGameSessionApi(sessionPayload);
      } else {
        await queueOfflineAction({
          action: 'submitGameSession',
          ...sessionPayload
        });
      }

      // Automatically complete any game routine in UI state if scheduled today
      if (activePatient?.todayReminders) {
        const gameRem = activePatient.todayReminders.find(r => r.type === 'game');
        if (gameRem && (gameRem.status !== 'completed' && !gameRem.acknowledged)) {
          toggleReminder(activePatient.id, gameRem.id);
        }
      }

      // Refresh data
      if (typeof loadRealData === 'function') {
        loadRealData();
      }
    } catch (err) {
      console.warn('Game session saved locally (offline mode active):', err.message);
    } finally {
      setIsSubmittingScore(false);
    }
  };

  // Restart Game Session
  const handleRestartGame = () => {
    sessionStartTimeRef.current = Date.now();
    setCurrentRoundIndex(0);
    setItemCount(3);
    setTotalAttempts(0);
    setSuccessfulTaps(0);
    setCollectedBasket([]);
    setSelectedItemsInRound(new Set());
    setMathAnswerSelected(null);
    setMathAnswerFeedback(null);
    setRoundCompleted(false);
    setIsSessionComplete(false);
    setFinalScoreSummary(null);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAF7F2] pb-24 pt-6 px-4 sm:px-6 lg:px-8 xl:px-10">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ======================================================== */}
        {/* TOP BAR: BACK NAVIGATION & GAME TITLE                    */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-stone-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => navigate('/patient')}
              className="px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-900 border-2 border-stone-300 font-black text-sm flex items-center gap-2 transition-all cursor-pointer group active:scale-95 shrink-0"
              title="Return to Patient Dashboard"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1 text-amber-800" />
              <span className="hidden xs:inline">Back</span>
            </button>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-0.5 rounded-full bg-amber-100 text-amber-950 text-xs font-black border border-amber-300 uppercase tracking-wider">
                  🧺 Daily Memory Game
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs font-bold border border-stone-300">
                  Level: {itemCount} Items ({mapItemCountToDifficulty(itemCount)})
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-950 mt-1">
                Market Day Basket (হাটৰ পাচলি)
              </h1>
            </div>
          </div>

          {/* Right: Round Progress & Audio Speaker Button */}
          <div className="flex items-center gap-3 self-end sm:self-center">
            <span className="px-4 py-2 bg-stone-900 text-white rounded-2xl text-xs sm:text-sm font-black shadow-xs">
              Round {Math.min(TOTAL_ROUNDS, currentRoundIndex + 1)} / {TOTAL_ROUNDS}
            </span>

            <button
              type="button"
              onClick={() => {
                const speechText = activeRound.type === 'categorization' 
                  ? `${activeRound.title}. ${activeRound.instruction}`
                  : `${activeRound.title}. ${activeRound.scenario}`;
                speakInstruction(speechText);
              }}
              className={`p-3 rounded-2xl border-2 flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                isSpeaking
                  ? 'bg-indigo-800 border-indigo-900 text-white ring-4 ring-indigo-300 animate-pulse'
                  : 'bg-indigo-700 hover:bg-indigo-800 border-indigo-800 text-white shadow-xs'
              }`}
              title="Listen to round instructions"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* GAME PLAYGROUND OR COMPLETION SCREEN                     */}
        {/* ======================================================== */}
        {!isSessionComplete ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200/90 shadow-sm space-y-6">

            {/* Instruction Banner */}
            <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-5 text-center space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full border border-amber-300">
                {activeRound.type === 'categorization' ? '🔍 Pattern & Produce Matching' : '🧮 Bazaar Shopping Math'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-950 leading-tight">
                {activeRound.title}
              </h2>
              <p className="text-sm sm:text-base font-bold text-stone-800 max-w-xl mx-auto leading-relaxed">
                {activeRound.type === 'categorization' ? activeRound.instruction : activeRound.scenario}
              </p>
            </div>

            {/* ROUND TYPE 1: CATEGORIZATION GRID */}
            {activeRound.type === 'categorization' && (
              <div className="space-y-6">
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 max-w-2xl mx-auto">
                  {roundDisplayItems.map((item) => {
                    const isSelected = selectedItemsInRound.has(item.id);
                    const isShaking = shakeItemId === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleItemTap(item)}
                        disabled={isSelected}
                        className={`min-h-[110px] sm:min-h-[130px] p-4 rounded-3xl border-3 flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer relative shadow-sm active:scale-95 ${
                          isSelected
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-950 shadow-md scale-98'
                            : isShaking
                            ? 'bg-rose-100 border-rose-500 text-rose-950 animate-shake'
                            : 'bg-stone-50 hover:bg-amber-50/80 border-stone-300 hover:border-amber-700 text-stone-900 hover:scale-102'
                        }`}
                      >
                        {/* Checked Badge for found items */}
                        {isSelected && (
                          <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </span>
                        )}

                        <span className="text-4xl sm:text-5xl select-none">{item.emoji}</span>
                        <div>
                          <p className="text-xs sm:text-sm font-black leading-tight line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-[11px] font-bold text-stone-500">
                            {item.localName}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Basket Progress & Next Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t-2 border-stone-100">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-stone-700 bg-stone-100 px-4 py-2.5 rounded-2xl border border-stone-300">
                    <ShoppingBasket className="w-5 h-5 text-amber-800" />
                    <span>Basket Items: {collectedBasket.length} collected</span>
                  </div>

                  {roundCompleted ? (
                    <button
                      type="button"
                      onClick={handleNextRound}
                      className="px-8 py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-base sm:text-lg font-black shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-95 animate-in fade-in"
                    >
                      <span>Next Round</span>
                      <ChevronRight className="w-6 h-6 stroke-[3]" />
                    </button>
                  ) : (
                    <p className="text-xs sm:text-sm font-bold text-stone-500 italic">
                      Tap all matching produce to complete this basket!
                    </p>
                  )}
                </div>

              </div>
            )}

            {/* ROUND TYPE 2: MATH RECALL */}
            {activeRound.type === 'math' && (
              <div className="space-y-6 max-w-xl mx-auto py-2">
                
                {/* Visual Math Story Board */}
                <div className="p-6 rounded-3xl bg-stone-50 border-2 border-stone-200 text-center space-y-3">
                  <span className="text-6xl sm:text-7xl block">{activeRound.itemEmoji}</span>
                  <p className="text-base sm:text-lg font-black text-stone-900">
                    {activeRound.scenario}
                  </p>
                </div>

                {/* 4 Large Tappable Answer Choices (min 60px height for elderly tap accuracy) */}
                <div className="grid grid-cols-2 gap-4">
                  {activeRound.options.map((option) => {
                    const isSelected = mathAnswerSelected === option;
                    const isCorrect = option === activeRound.correctAnswer;

                    let buttonStyle = 'bg-stone-50 hover:bg-amber-50 border-stone-300 hover:border-amber-700 text-stone-950';

                    if (isSelected && mathAnswerFeedback === 'correct') {
                      buttonStyle = 'bg-emerald-600 border-emerald-700 text-white shadow-md scale-102';
                    } else if (isSelected && mathAnswerFeedback === 'wrong') {
                      buttonStyle = 'bg-rose-600 border-rose-700 text-white animate-shake';
                    }

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleMathAnswer(option)}
                        disabled={roundCompleted}
                        className={`min-h-[70px] sm:min-h-[85px] rounded-3xl border-3 font-black text-2xl sm:text-3xl flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 ${buttonStyle}`}
                      >
                        ₹{option}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback & Next Round Trigger */}
                {roundCompleted && (
                  <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
                    <p className="text-base font-black text-emerald-950 flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                      <span>Correct calculation! ({activeRound.mathEquation})</span>
                    </p>

                    <button
                      type="button"
                      onClick={handleNextRound}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-base font-black shadow-xs transition-all cursor-pointer active:scale-95"
                    >
                      Next Round →
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>
        ) : (
          /* ======================================================== */
          /* COMPLETION SCREEN: WARM ELDER CELEBRATION & STATS        */
          /* ======================================================== */
          <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-stone-200/90 shadow-md text-center space-y-8 animate-in fade-in zoom-in-95">
            
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mx-auto shadow-lg border-4 border-white">
              <Trophy className="w-12 h-12 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <span className="px-4 py-1 rounded-full bg-emerald-100 text-emerald-950 text-xs font-black uppercase tracking-wider border border-emerald-300">
                ★ Challenge Completed! ★
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-stone-950">
                Wonderful job at the Market, {activePatient?.name?.split(' ')[0] || 'Elder'}! 🌟
              </h2>
              <p className="text-stone-700 font-bold text-base max-w-lg mx-auto">
                You successfully solved your market shopping pattern routines and kept your cognitive memory streak active!
              </p>
            </div>

            {/* Score Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200">
                <p className="text-xs font-black text-amber-900 uppercase">Accuracy</p>
                <p className="text-2xl sm:text-3xl font-black text-stone-950 mt-1">
                  {finalScoreSummary?.accuracy || 100}%
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200">
                <p className="text-xs font-black text-emerald-900 uppercase">Correct Taps</p>
                <p className="text-2xl sm:text-3xl font-black text-stone-950 mt-1">
                  {finalScoreSummary?.successfulTaps || 0}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-200">
                <p className="text-xs font-black text-sky-900 uppercase">Produce in Basket</p>
                <p className="text-2xl sm:text-3xl font-black text-stone-950 mt-1">
                  {finalScoreSummary?.itemsCollected || 0} 🧺
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-200">
                <p className="text-xs font-black text-purple-900 uppercase">Difficulty Reached</p>
                <p className="text-xl sm:text-2xl font-black text-stone-950 mt-1 capitalize">
                  {finalScoreSummary?.difficultyLevel || 'Medium'}
                </p>
              </div>
            </div>

            {/* Routine & Streak Celebration Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black flex items-center justify-center gap-3 shadow-md max-w-md mx-auto">
              <Flame className="w-7 h-7 fill-amber-200 text-amber-200 animate-bounce" />
              <span className="text-base sm:text-lg">Daily Memory Routine Completed! +1 Day Streak 🔥</span>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t-2 border-stone-200">
              <button
                type="button"
                onClick={handleRestartGame}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-black text-base border-2 border-stone-300 shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Play Another Session</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/patient')}
                className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-black text-base shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <span>Return to Daily Dashboard 🌸</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
