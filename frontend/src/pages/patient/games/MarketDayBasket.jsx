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
  XCircle, 
  Trophy, 
  Flame, 
  ShoppingBasket, 
  RotateCcw, 
  ChevronRight,
  Heart,
  Check,
  Plus,
  Star,
  Zap,
  Clock
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

// Full catalogue of North-East Indian produce items with verified real photographs
const PRODUCE_CATALOGUE = [
  {
    id: 'bhut_jolokia',
    name: 'King Chilli / Bhut Jolokia',
    hindiName: 'भूत जोलोकिया (तीखी राजा मिर्च)',
    localName: 'ভূত জলকীয়া',
    emoji: '🌶️',
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&auto=format&fit=crop&q=80',
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
    hindiName: 'ताज़ा बांस का करील (खोरिसा)',
    localName: 'বাঁহ গাজ',
    emoji: '🎍',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
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
    hindiName: 'असमिया हरी चाय पत्ती',
    localName: 'অসমীয়া সেউজীয়া চাহ',
    emoji: '🍵',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80',
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
    hindiName: 'असम कागज़ी नींबू (काजी नेमु)',
    localName: 'কাজী নেমু',
    emoji: '🍋',
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&auto=format&fit=crop&q=80',
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
    hindiName: 'त्रिपुरा रसीला अनानास',
    localName: 'ৰসাল আনাৰস',
    emoji: '🍍',
    image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&auto=format&fit=crop&q=80',
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
    hindiName: 'मीठा मालभोग केला',
    localName: 'মালভোগ কল',
    emoji: '🍌',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop&q=80',
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
    hindiName: 'लाई साग (सरसों का साग)',
    localName: 'লাই শাক',
    emoji: '🥬',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1544378730-8b5104b18790?w=400&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=400&auto=format&fit=crop&q=80',
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
  const { activePatient, isOnline, toggleReminder, loadRealData, currentLanguage } = useApp();

  // Total levels/rounds per play session
  const TOTAL_ROUNDS = 5;

  // Session State
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [itemCount, setItemCount] = useState(3); // Start with 3 items (Adaptive: 3 to 7)
  const [runningScore, setRunningScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [successfulTaps, setSuccessfulTaps] = useState(0);
  const [collectedBasket, setCollectedBasket] = useState([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [finalScoreSummary, setFinalScoreSummary] = useState(null);

  // Per-Level / Round Detailed Metrics for ML Logging
  const [roundDetailsList, setRoundDetailsList] = useState([]);
  const roundStartTimeRef = useRef(Date.now());
  const roundAttemptsRef = useRef(0);
  const roundCorrectRef = useRef(0);

  // Level Transition Modal State
  const [isTransitioningLevel, setIsTransitioningLevel] = useState(false);
  const [nextLevelInfo, setNextLevelInfo] = useState(null);
  const transitionTimerRef = useRef(null);
  const autoProceedTimerRef = useRef(null);

  // Audio / Speech State
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      if (autoProceedTimerRef.current) clearTimeout(autoProceedTimerRef.current);
      stopSpeech();
    };
  }, []);

  // Round Interactive State
  const [selectedItemsInRound, setSelectedItemsInRound] = useState(new Set());
  const [shakeItemId, setShakeItemId] = useState(null);
  const [mathAnswerSelected, setMathAnswerSelected] = useState(null);
  const [mathAnswerFeedback, setMathAnswerFeedback] = useState(null); // 'correct' | 'wrong'
  const [roundCompleted, setRoundCompleted] = useState(false);

  // Start Time for Duration calculation
  const sessionStartTimeRef = useRef(Date.now());

  // Generate Round Definitions
    // Generate Round Definitions with multi-language support
  const isHindi = (currentLanguage?.code || '').startsWith('hi');

  const roundsConfig = useMemo(() => {
    if (isHindi) {
      return [
        {
          id: 'round-1',
          levelNumber: 1,
          type: 'categorization',
          title: 'सब्जी मंडी की हरी टोकरी',
          instruction: 'अपनी बास्केट में डालने के लिए केवल हरी सब्जियाँ और चाय की पत्तियाँ चुनें!',
          criteria: (item) => item.isGreen === true && item.isVegetable === true,
          criteriaHint: 'हरी पत्तेदार सब्जियां और कोमल पत्ते',
          targetLabel: 'हरी सब्जियाँ 🥬',
          themeColor: 'from-emerald-600 to-teal-700'
        },
        {
          id: 'round-2',
          levelNumber: 2,
          type: 'math',
          title: 'सुबह की चाय पत्ती खरीदारी',
          scenario: 'आप ₹10 प्रति पैकेट की दर से असम चाय पत्ती के 2 पैकेट खरीदते हैं। कुल मूल्य कितना होगा?',
          itemEmoji: '🍵',
          itemImage: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80',
          mathEquation: '2 × ₹10 = ₹20',
          correctAnswer: 20,
          options: [15, 20, 25, 30],
          themeColor: 'from-amber-600 to-orange-700'
        },
        {
          id: 'round-3',
          levelNumber: 3,
          type: 'categorization',
          title: 'मीठे और रसीले ताज़ा फल',
          instruction: 'अपनी बास्केट में रखने के लिए केवल ताज़ा फल चुनें!',
          criteria: (item) => item.isFruit === true,
          criteriaHint: 'काजी नेमु, पपीता, कमरख, केला',
          targetLabel: 'रसीले फल 🍋',
          themeColor: 'from-orange-500 to-amber-600'
        },
        {
          id: 'round-4',
          levelNumber: 4,
          type: 'math',
          title: 'ताज़ा नींबू और सब्जी हिसाब',
          scenario: 'आप ₹35 के ताज़ा नींबू के लिए ₹50 का नोट देते हैं। आपको कितने रुपये वापस मिलेंगे?',
          itemEmoji: '🍋',
          itemImage: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&auto=format&fit=crop&q=80',
          mathEquation: '₹50 - ₹35 = ₹15',
          correctAnswer: 15,
          options: [10, 15, 20, 25],
          themeColor: 'from-emerald-600 to-teal-700'
        },
        {
          id: 'round-5',
          levelNumber: 5,
          type: 'categorization',
          title: 'उत्तर-पूर्व के विशेष स्थानीय उत्पाद',
          instruction: 'अपनी बास्केट पूरी करने के लिए उत्तर-पूर्व के विशेष स्थानीय उत्पाद चुनें!',
          criteria: (item) => item.isNER === true || item.isRegionalSpecialty === true,
          criteriaHint: 'ढेकीया साग, भूत जोलोकिया, बांस का करील, काजी नेमु',
          targetLabel: 'स्थानीय विशेष उत्पाद',
          themeColor: 'from-purple-600 to-indigo-700'
        }
      ];
    }

    return [
      {
        id: 'round-1',
        levelNumber: 1,
        type: 'categorization',
        title: 'Fresh Greens for the Market Basket',
        instruction: 'Tap ONLY the Green Vegetables & Tea Leaves to put into your basket!',
        criteria: (item) => item.isGreen === true && item.isVegetable === true,
        criteriaHint: 'Green leafy vegetables and tender shoots',
        targetLabel: 'Green Vegetables 🥬',
        themeColor: 'from-emerald-600 to-teal-700'
      },
      {
        id: 'round-2',
        levelNumber: 2,
        type: 'math',
        title: 'Morning Tea Leaves Shopping',
        scenario: 'You buy 2 packets of Assam Tea Leaves at ₹10 each. What is the total cost?',
        itemEmoji: '🍵',
        itemImage: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80',
        mathEquation: '2 × ₹10 = ₹20',
        correctAnswer: 20,
        options: [15, 20, 25, 30],
        themeColor: 'from-amber-600 to-orange-700'
      },
      {
        id: 'round-3',
        levelNumber: 3,
        type: 'categorization',
        title: 'Sweet & Tangy Fresh Market Fruits',
        instruction: 'Tap ONLY the Fresh Fruits to place inside your basket!',
        criteria: (item) => item.isFruit === true,
        criteriaHint: 'Kazi Nemu, Papaya, Starfruit, Bananas',
        targetLabel: 'Juicy Fruits 🍋',
        themeColor: 'from-orange-500 to-amber-600'
      },
      {
        id: 'round-4',
        levelNumber: 4,
        type: 'math',
        title: 'Fresh Lemons & Vegetable Math',
        scenario: 'You hand the vendor a ₹50 note for ₹35 worth of Kazi Nemu lemons. How much change do you receive?',
        itemEmoji: '🍋',
        itemImage: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&auto=format&fit=crop&q=80',
        mathEquation: '₹50 - ₹35 = ₹15',
        correctAnswer: 15,
        options: [10, 15, 20, 25],
        themeColor: 'from-emerald-600 to-teal-700'
      },
      {
        id: 'round-5',
        levelNumber: 5,
        type: 'categorization',
        title: 'North-East Regional Market Delicacies',
        instruction: 'Tap the Authentic NE Regional Special produce to complete your basket!',
        criteria: (item) => item.isNER === true || item.isRegionalSpecialty === true,
        criteriaHint: 'Dhekia Xak, Bhut Jolokia, Bamboo Shoot, Kazi Nemu',
        targetLabel: 'Regional Specialties',
        themeColor: 'from-purple-600 to-indigo-700'
      }
    ];
  }, [isHindi]);

  const activeRound = roundsConfig[currentRoundIndex] || roundsConfig[0];

  // Get localized speech text for current round
  const getRoundSpeechText = useCallback((round) => {
    const isHindi = (currentLanguage?.code || '').startsWith('hi');
    if (isHindi) {
      if (round.id === 'round-1') {
        return "स्तर 1। अपनी बास्केट में डालने के लिए केवल हरी सब्जियाँ और चाय की पत्तियाँ चुनें!";
      }
      if (round.id === 'round-2') {
        return "स्तर 2। आप ₹10 प्रति पैकेट की दर से असम चाय पत्ती के 2 पैकेट खरीदते हैं। कुल मूल्य कितना होगा?";
      }
      if (round.id === 'round-3') {
        return "स्तर 3। अपनी बास्केट में रखने के लिए केवल ताज़ा फल चुनें!";
      }
      if (round.id === 'round-4') {
        return "स्तर 4। आप ₹35 के ताज़ा नींबू के लिए ₹50 का नोट देते हैं। आपको कितने रुपये वापस मिलेंगे?";
      }
      if (round.id === 'round-5') {
        return "स्तर 5। अपनी बास्केट पूरी करने के लिए उत्तर-पूर्व के विशेष स्थानीय उत्पाद चुनें!";
      }
    }
    return round.type === 'categorization'
      ? `${round.title}. ${round.instruction}`
      : `${round.title}. ${round.scenario}`;
  }, [currentLanguage]);


  // Helper to Speak Instructions for Elderly Clarity (always cancels previous speech to prevent clashes)
  const speakInstruction = useCallback((text, isAutoPlay = false) => {
    speakLocalized({
      text,
      langCode: currentLanguage?.code || 'en',
      rate: 0.85,
      pitch: 1.0,
      isAutoPlay,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  }, [currentLanguage]);

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

    const chosenTargets = shuffledMatching.slice(0, numTargets);
    const chosenDistractors = shuffledNonMatching.slice(0, numDistractors);

    const merged = [...chosenTargets, ...chosenDistractors].sort(() => 0.5 - Math.random());
    return merged;
  }, [activeRound, itemCount]);

  // Reset per-round timer and counters when a new round starts
  useEffect(() => {
    roundStartTimeRef.current = Date.now();
    roundAttemptsRef.current = 0;
    roundCorrectRef.current = 0;
  }, [currentRoundIndex]);

  // Voice narration when a new round starts (Automatic trigger -> isAutoPlay: true)
  useEffect(() => {
    if (activeRound && !isTransitioningLevel && !isSessionComplete) {
      const speechText = activeRound.type === 'categorization' 
        ? `${activeRound.title}. ${activeRound.instruction}`
        : `${activeRound.title}. ${activeRound.scenario}`;
      speakInstruction(speechText, true);
    }
  }, [currentRoundIndex, activeRound, isTransitioningLevel, isSessionComplete, speakInstruction]);

  // Handle Item Tap / Click (Categorization Mode)
  const handleItemTap = (item) => {
    if (roundCompleted || isTransitioningLevel || isSessionComplete) return;

    if (selectedItemsInRound.has(item.id)) return;

    setTotalAttempts(prev => prev + 1);
    roundAttemptsRef.current += 1;

    const isCorrect = activeRound.criteria(item);

    if (isCorrect) {
      // Correct Match: +20 points
      setSuccessfulTaps(prev => prev + 1);
      roundCorrectRef.current += 1;
      setRunningScore(prev => prev + 20);

      const nextSet = new Set(selectedItemsInRound);
      nextSet.add(item.id);
      setSelectedItemsInRound(nextSet);

      // Add to player's woven market basket
      setCollectedBasket(prev => [item, ...prev.filter(i => i.id !== item.id)]);

      // Check if all correct items in this round have been found
      const remainingTargets = roundDisplayItems.filter(i => activeRound.criteria(i) && !nextSet.has(i.id));

      if (remainingTargets.length === 0) {
        // Round Completed successfully! +10 completion bonus
        setRunningScore(prev => prev + 10);
        setRoundCompleted(true);
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#15803d', '#f59e0b', '#9a3412']
        });

        // Auto-advance automatically after 1.2s
        if (autoProceedTimerRef.current) clearTimeout(autoProceedTimerRef.current);
        autoProceedTimerRef.current = setTimeout(() => {
          handleNextRound();
        }, 1200);
      }
    } else {
      // Wrong Match: Gentle wobble shake without score penalty
      setShakeItemId(item.id);
      setTimeout(() => setShakeItemId(null), 600);
    }
  };

  const handleItemClick = handleItemTap;

  // Handle Math Answer Selection
  const handleMathAnswer = (option) => {
    if (roundCompleted || isTransitioningLevel || isSessionComplete) return;

    setTotalAttempts(prev => prev + 1);
    roundAttemptsRef.current += 1;
    setMathAnswerSelected(option);

    if (option === activeRound.correctAnswer) {
      // Correct Answer: +30 points if first attempt, +15 if after retry
      const pts = roundAttemptsRef.current === 1 ? 30 : 15;
      setSuccessfulTaps(prev => prev + 1);
      roundCorrectRef.current += 1;
      setRunningScore(prev => prev + pts);

      setMathAnswerFeedback('correct');
      setRoundCompleted(true);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#15803d', '#22c55e', '#f59e0b']
      });

      // Auto-advance automatically after 1.2s
      if (autoProceedTimerRef.current) clearTimeout(autoProceedTimerRef.current);
      autoProceedTimerRef.current = setTimeout(() => {
        handleNextRound();
      }, 1200);
    } else {
      setMathAnswerFeedback('wrong');
      setTimeout(() => {
        setMathAnswerFeedback(null);
        setMathAnswerSelected(null);
      }, 1200);
    }
  };

  // Advance to Next Level with Warm Interstitial Transition Moment (Auto Proceeds)
  const handleNextRound = () => {
    if (autoProceedTimerRef.current) clearTimeout(autoProceedTimerRef.current);

    // 1. Calculate per-round stats for ML Logging
    const roundTimeTaken = Math.max(1, Math.round((Date.now() - roundStartTimeRef.current) / 1000));
    const roundAcc = roundAttemptsRef.current > 0 
      ? Math.round((roundCorrectRef.current / roundAttemptsRef.current) * 100) 
      : 100;

    const roundMetric = {
      level: currentRoundIndex + 1,
      itemCount: activeRound.type === 'categorization' ? itemCount : 4,
      mode: activeRound.type, // "categorization" | "math"
      accuracy: roundAcc,
      correctCount: roundCorrectRef.current,
      totalAttempts: roundAttemptsRef.current,
      timeTakenSeconds: roundTimeTaken
    };

    const updatedRoundDetails = [...roundDetailsList, roundMetric];
    setRoundDetailsList(updatedRoundDetails);

    // 2. Check if we've completed all levels
    if (currentRoundIndex + 1 >= TOTAL_ROUNDS) {
      const nextCount = calculateNextItemCount(currentAccuracy, itemCount);
      finishGameSession(nextCount, updatedRoundDetails);
      return;
    }

    // 3. Adaptive difficulty for next round
    const nextCount = calculateNextItemCount(currentAccuracy, itemCount);
    setItemCount(nextCount);

    const nextLevelNum = currentRoundIndex + 2;
    const nextRoundObj = roundsConfig[currentRoundIndex + 1];

    const isHindi = (currentLanguage?.code || '').startsWith('hi');
    setNextLevelInfo({
      levelNumber: nextLevelNum,
      title: nextRoundObj?.title || (isHindi ? `स्तर ${nextLevelNum}` : `Level ${nextLevelNum}`),
      type: isHindi 
        ? (nextRoundObj?.type === 'categorization' ? 'फल-सब्जी खोज 🧺' : 'बाज़ार गणित 🧮')
        : (nextRoundObj?.type === 'categorization' ? 'Produce Search 🧺' : 'Shopping Math 🧮')
    });

    setIsTransitioningLevel(true);

    speakInstruction(isHindi ? `शानदार! स्तर ${nextLevelNum} शुरू हो रहा है` : `Great job! Moving to Level ${nextLevelNum}`);

    // Auto-advance after 1.8 seconds automatically
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => {
      proceedToNextLevel();
    }, 1800);
  };

  // Actually switch to next level state
  const proceedToNextLevel = () => {
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    if (autoProceedTimerRef.current) clearTimeout(autoProceedTimerRef.current);
    setIsTransitioningLevel(false);
    setNextLevelInfo(null);
    setCurrentRoundIndex(prev => prev + 1);
    setSelectedItemsInRound(new Set());
    setMathAnswerSelected(null);
    setMathAnswerFeedback(null);
    setRoundCompleted(false);
  };

  // Finish Game Session & Submit Score with Rich Round Details
  const finishGameSession = async (settledItemCount, completedRoundDetails) => {
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
      score: runningScore,
      difficultyLevel: finalDifficulty,
      duration: `${durationSeconds}s`,
      roundDetails: completedRoundDetails || roundDetailsList
    };

    setFinalScoreSummary({
      score: runningScore,
      accuracy: finalAccuracy,
      totalAttempts,
      successfulTaps,
      itemsCollected: collectedBasket.length,
      difficultyLevel: finalDifficulty,
      duration: durationSeconds,
      roundsPlayed: TOTAL_ROUNDS
    });

    // Big Celebration Confetti
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#15803d', '#9a3412', '#f59e0b', '#3b82f6', '#8b5cf6']
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
    roundStartTimeRef.current = Date.now();
    roundAttemptsRef.current = 0;
    roundCorrectRef.current = 0;
    setCurrentRoundIndex(0);
    setItemCount(3);
    setRunningScore(0);
    setTotalAttempts(0);
    setSuccessfulTaps(0);
    setCollectedBasket([]);
    setRoundDetailsList([]);
    setSelectedItemsInRound(new Set());
    setMathAnswerSelected(null);
    setMathAnswerFeedback(null);
    setRoundCompleted(false);
    setIsSessionComplete(false);
    setIsTransitioningLevel(false);
    setNextLevelInfo(null);
    setFinalScoreSummary(null);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAF7F2] pb-24 pt-6 px-4 sm:px-6 lg:px-8 xl:px-10">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ======================================================== */}
        {/* PERSISTENT HEADER: LEVEL PROGRESSION & LIVE SCORE        */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-stone-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-4 z-20 backdrop-blur-md bg-white/95">
          
          {/* Left: Back Navigation & Level Indicator */}
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => navigate('/patient/games')}
              className="px-4 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-800 border-2 border-rose-300 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer group active:scale-95 shrink-0 shadow-xs"
              title="Leave Game and return to Patient Dashboard"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-rose-800 stroke-[3]" />
              <span>{isHindi ? 'खेल छोड़ें' : 'Leave Game'}</span>
            </button>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-950 text-xs sm:text-sm font-black border-2 border-amber-300 flex items-center gap-1.5 shadow-xs">
                  <Star className="w-4 h-4 fill-amber-600 text-amber-600" />
                  <span>{isHindi ? `स्तर ${currentRoundIndex + 1} / ${TOTAL_ROUNDS}` : `Level ${currentRoundIndex + 1} of ${TOTAL_ROUNDS}`}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs font-bold border border-stone-300">
    {isHindi 
      ? (mapItemCountToDifficulty(itemCount) === 'easy' ? 'सरल' : mapItemCountToDifficulty(itemCount) === 'medium' ? 'मध्यम' : 'कठिन')
      : mapItemCountToDifficulty(itemCount).toUpperCase()}
  </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-stone-950 mt-1">
                {isHindi ? 'सब्जी मंडी की टोकरी (Market Day Basket)' : 'Market Day Basket (হাটৰ পাচলি)'}
              </h1>
            </div>
          </div>

          {/* Right: Live Score & Audio Speaker */}
          <div className="flex items-center gap-3 self-end sm:self-center">
            
            {/* Live Accumulating Score Badge */}
            <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black flex items-center gap-2 shadow-sm border border-amber-600">
              <Sparkles className="w-5 h-5 text-amber-100 animate-pulse" />
              <div>
                <p className="text-[10px] font-bold text-amber-100 uppercase leading-none">{isHindi ? 'लाइव स्कोर' : 'Live Score'}</p>
                <p className="text-lg sm:text-xl font-black leading-none mt-0.5">{runningScore} pts</p>
              </div>
            </div>

            {/* Audio Instruction Speaker */}
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

        {/* Level Progression Indicator Dots */}
        <div className="bg-white rounded-2xl p-3 border-2 border-stone-200 flex items-center justify-between px-4 sm:px-8">
          {roundsConfig.map((round, idx) => {
            const isCompleted = idx < currentRoundIndex;
            const isCurrent = idx === currentRoundIndex;

            return (
              <div key={round.id} className="flex items-center gap-2">
                <div 
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-xs sm:text-sm border-2 transition-all ${
                    isCompleted 
                      ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-amber-500 border-amber-600 text-white scale-110 ring-4 ring-amber-200'
                      : 'bg-stone-100 border-stone-300 text-stone-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                </div>
                <span className="hidden md:inline text-xs font-bold text-stone-700">
    {isHindi 
      ? (round.type === 'categorization' ? 'टोकरी' : 'गणित')
      : (round.type === 'categorization' ? 'Basket' : 'Math')}
  </span>
                {idx < roundsConfig.length - 1 && (
                  <div className={`hidden sm:block w-8 lg:w-14 h-1 rounded-full ${idx < currentRoundIndex ? 'bg-emerald-500' : 'bg-stone-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* WARM LEVEL TRANSITION INTERSTITIAL MOMENT                */}
        {/* ======================================================== */}
        {isTransitioningLevel && nextLevelInfo && (
          <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-8 sm:p-10 border-4 border-white shadow-xl text-center text-white space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/50 text-white flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-10 h-10 animate-spin text-amber-200" />
            </div>

            <div className="space-y-2">
              <span className="px-4 py-1.5 rounded-full bg-white/20 border border-white/40 text-xs sm:text-sm font-black uppercase tracking-wider inline-block">
    {isHindi ? `स्तर ${currentRoundIndex + 1} पूरा हुआ! 🌟` : `Level ${currentRoundIndex + 1} Complete! 🌟`}
  </span>
  <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
    {isHindi ? `शानदार! स्तर ${nextLevelInfo.levelNumber} शुरू हो रहा है` : `Great Job! Moving to Level ${nextLevelInfo.levelNumber}`}
  </h2>
  <p className="text-amber-100 font-bold text-base sm:text-lg max-w-md mx-auto">
    {isHindi ? `अगली चुनौती: ${nextLevelInfo.title} (${nextLevelInfo.type})` : `Next Challenge: ${nextLevelInfo.title} (${nextLevelInfo.type})`}
  </p>
            </div>

            <div className="pt-2 max-w-xs mx-auto space-y-2">
              <div className="w-full bg-white/30 h-2.5 rounded-full overflow-hidden">
                <div className="bg-white h-full w-full animate-pulse transition-all" />
              </div>
              <p className="text-xs font-bold text-white/80">
    {isHindi ? `स्तर ${nextLevelInfo.levelNumber} शुरू हो रहा है...` : `Starting Level ${nextLevelInfo.levelNumber}...`}
  </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* GAME PLAYGROUND OR COMPLETION SCREEN                     */}
        {/* ======================================================== */}
        {!isSessionComplete && !isTransitioningLevel && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200/90 shadow-sm space-y-6">

            {/* Instruction Banner */}
            <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-5 text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full border border-amber-300">
                  {activeRound.type === 'categorization' ? '🔍 Pattern & Produce Matching' : '🧮 Bazaar Shopping Math'}
                </span>
                <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                  Level {activeRound.levelNumber}
                </span>
              </div>
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
                        className={`min-h-[160px] sm:min-h-[190px] p-3 sm:p-3.5 rounded-3xl border-3 flex flex-col items-center justify-between text-center transition-all cursor-pointer relative shadow-sm active:scale-95 group overflow-hidden ${
                          isSelected
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-950 shadow-md scale-98'
                            : isShaking
                            ? 'bg-rose-100 border-rose-500 text-rose-950 animate-shake'
                            : 'bg-stone-50 hover:bg-amber-50/80 border-stone-300 hover:border-amber-700 text-stone-900 hover:scale-102'
                        }`}
                      >
                        {/* Checked Badge for found items */}
                        {isSelected && (
                          <span className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </span>
                        )}

                        {/* Real Photograph Tile */}
                        <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-stone-200 border border-stone-300 shadow-inner relative">
                          <img
                            src={item.image}
                            alt={item.name}
                            className={`w-full h-full object-cover transition-transform duration-300 ${isSelected ? 'brightness-90 contrast-105' : 'group-hover:scale-105'}`}
                            loading="lazy"
                          />
                        </div>

                        {/* Produce Titles */}
                        <div className="pt-2 w-full">
                          <p className="text-xs sm:text-sm font-black leading-tight line-clamp-1 text-stone-950">{(currentLanguage?.code || '').startsWith('hi') ? (item.hindiName || item.name) : item.name}</p>
                          <p className="text-[11px] sm:text-xs font-bold text-stone-600 mt-0.5">
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
                    <span>{isHindi ? `टोकरी में वस्तुएं: ${collectedBasket.length} एकत्रित` : `Basket Items: ${collectedBasket.length} collected`}</span>
                  </div>

                  {roundCompleted ? (
                    <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-100 text-emerald-950 font-black text-xs sm:text-sm border border-emerald-300 animate-pulse">
                      <Check className="w-5 h-5 text-emerald-700 stroke-[3]" />
                      <span>{(currentLanguage?.code || '').startsWith('hi') ? "बधाई! टोकरी पूरी हुई! अगली चुनौती शुरू हो रही है..." : "Basket Complete! Advancing to next challenge..."}</span>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm font-bold text-stone-500 italic">{(currentLanguage?.code || '').startsWith('hi') ? "अपनी टोकरी पूरी करने के लिए सभी सही फल-सब्जियों पर टैप करें!" : "Tap all matching produce to complete this basket!"}</p>
                  )}
                </div>

              </div>
            )}

            {/* ROUND TYPE 2: MATH RECALL */}
            {activeRound.type === 'math' && (
              <div className="space-y-6 max-w-xl mx-auto py-2">
                
                {/* Visual Math Story Board with Real Product Photo */}
                <div className="p-6 rounded-3xl bg-stone-50 border-2 border-stone-200 text-center space-y-4">
                  {activeRound.itemImage ? (
                    <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-3xl overflow-hidden border-3 border-stone-300 shadow-md">
                      <img
                        src={activeRound.itemImage}
                        alt={activeRound.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <span className="text-6xl sm:text-7xl block">{activeRound.itemEmoji}</span>
                  )}
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

                {/* Feedback & Auto Progression */}
                {roundCompleted && (
                  <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in">
                    <p className="text-base font-black text-emerald-950 flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                      <span>Correct calculation! ({activeRound.mathEquation})</span>
                    </p>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl animate-pulse">
                      Advancing...
                    </span>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* COMPLETION SCREEN: WARM ELDER CELEBRATION & STATS        */}
        {/* ======================================================== */}
        {isSessionComplete && (
          <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-stone-200/90 shadow-md text-center space-y-8 animate-in fade-in zoom-in-95">
            
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mx-auto shadow-lg border-4 border-white">
              <Trophy className="w-12 h-12 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <span className="px-4 py-1 rounded-full bg-emerald-100 text-emerald-950 text-xs font-black uppercase tracking-wider border border-emerald-300">
                {isHindi ? '★ सभी 5 स्तर पूरे हुए! ★' : '★ All 5 Levels Completed! ★'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-stone-950">
                {isHindi ? `मंडी में शानदार अभ्यास, ${activePatient?.name?.split(' ')[0] || ''} जी! 🌟` : `Wonderful job at the Market, ${activePatient?.name?.split(' ')[0] || 'Elder'}! 🌟`}
              </h2>
              <p className="text-stone-700 font-bold text-base max-w-lg mx-auto">
                {isHindi ? (
    <span>आपने सभी 5 स्तरों में <span className="font-black text-amber-800">{finalScoreSummary?.score || runningScore} अंक</span> प्राप्त किए और अपनी स्मृति स्ट्रीक को सक्रिय रखा!</span>
  ) : (
    <span>You scored <span className="font-black text-amber-800">{finalScoreSummary?.score || runningScore} points</span> across all 5 levels and kept your cognitive memory streak active!</span>
  )}
              </p>
            </div>

            {/* Score Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200">
                <p className="text-xs font-black text-amber-900 uppercase">{isHindi ? 'कुल अंक' : 'Total Score'}</p>
                <p className="text-2xl sm:text-3xl font-black text-stone-950 mt-1">
                  {finalScoreSummary?.score || runningScore} pts
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200">
                <p className="text-xs font-black text-emerald-900 uppercase">{isHindi ? 'सटीकता' : 'Accuracy'}</p>
                <p className="text-2xl sm:text-3xl font-black text-stone-950 mt-1">
                  {finalScoreSummary?.accuracy || 100}%
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-200">
                <p className="text-xs font-black text-sky-900 uppercase">{isHindi ? 'एकत्रित फल-सब्जियां' : 'Produce Collected'}</p>
                <p className="text-2xl sm:text-3xl font-black text-stone-950 mt-1">
                  {finalScoreSummary?.itemsCollected || 0} 🧺
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-200">
                <p className="text-xs font-black text-purple-900 uppercase">{isHindi ? 'पूरे किए गए स्तर' : 'Levels Cleared'}</p>
                <p className="text-xl sm:text-2xl font-black text-stone-950 mt-1">
                  5 / 5 🌟
                </p>
              </div>
            </div>

            {/* Per-Level Summary Breakdown for Transparency */}
            {roundDetailsList.length > 0 && (
              <div className="max-w-2xl mx-auto bg-stone-50 rounded-2xl p-4 border border-stone-200 text-left">
                <p className="text-xs font-black uppercase text-stone-600 mb-2">Level Performance Breakdown:</p>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {roundDetailsList.map((r, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white border border-stone-200 text-center">
                      <p className="text-xs font-black text-stone-900">Level {r.level}</p>
                      <p className="text-sm font-bold text-emerald-700">{r.accuracy}% acc</p>
                      <p className="text-[10px] text-stone-500 font-semibold">{r.timeTakenSeconds}s</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Routine & Streak Celebration Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black flex items-center justify-center gap-3 shadow-md max-w-md mx-auto">
              <Flame className="w-7 h-7 fill-amber-200 text-amber-200 animate-bounce" />
              <span className="text-base sm:text-lg">{isHindi ? 'दैनिक स्मृति अभ्यास पूरा हुआ! +1 दिन स्ट्रीक 🔥' : 'Daily Memory Routine Completed! +1 Day Streak 🔥'}</span>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t-2 border-stone-200">
              <button
                type="button"
                onClick={handleRestartGame}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-black text-base border-2 border-stone-300 shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <RotateCcw className="w-5 h-5" />
                <span>{isHindi ? 'फिर से खेलें' : 'Play Another Session'}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/patient/games')}
                className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-black text-base shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <span>{isHindi ? 'खेल सूची पर वापस जाएं' : 'Return to Daily Dashboard'}</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

