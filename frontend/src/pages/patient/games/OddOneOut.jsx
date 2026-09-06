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
  Eye, 
  Star, 
  Clock, 
  Heart,
  HelpCircle,
  Shapes,
  Check
} from 'lucide-react';

/**
 * Adaptive difficulty calculation for Odd One Out.
 * Increases card count (from 3 up to 6) if accuracy >= 80%, decreases if < 50%.
 */
export function calculateNextOddCardCount(accuracy, currentCount = 3) {
  if (accuracy >= 80) {
    return Math.min(6, currentCount + 1);
  } else if (accuracy < 50) {
    return Math.max(3, currentCount - 1);
  }
  return currentCount;
}

export function mapCardCountToDifficulty(count) {
  if (count <= 3) return 'easy';
  if (count <= 4) return 'medium';
  return 'hard';
}

// Cultural themes for the 5 levels
const THEMES = [
  {
    id: 'tea-flowers',
    title: 'Morning Garden & Tea',
    hindiTitle: 'सुबह का बगीचा और चाय',
    prompt: 'Look at the items below. Which one is different from the others?',
    hindiPrompt: 'नीचे दी गई वस्तुओं को देखें। इनमें से कौन सी वस्तु बाकी सबसे अलग है?',
    majority: { 
      name: 'Assam Red Tea', 
      hindiName: 'असमिया लाल चाय',
      emoji: '🍵', 
      hint: 'Cup of hot Assam Tea',
      hindiHint: 'गर्म असमिया चाय का प्याला'
    },
    odd: { 
      name: 'Golden Marigold', 
      hindiName: 'गेंदे का फूल',
      emoji: '🌺', 
      hint: 'Marigold Flower',
      hindiHint: 'सुंदर गेंदे का फूल'
    },
    color: 'from-amber-600 to-orange-700'
  },
  {
    id: 'bazaar-fruits',
    title: 'Bazaar Fruit Basket',
    hindiTitle: 'बाज़ार की फल टोकरी',
    prompt: 'Find the odd fruit that does not match the rest!',
    hindiPrompt: 'उस अनोखे फल को पहचानें जो बाकी से अलग है!',
    majority: { 
      name: 'Juicy Pineapple', 
      hindiName: 'रसीला अनानास',
      emoji: '🍍', 
      hint: 'Pineapple',
      hindiHint: 'ताज़ा अनानास'
    },
    odd: { 
      name: 'Ripe Banana', 
      hindiName: 'पका हुआ केला',
      emoji: '🍌', 
      hint: 'Golden Banana',
      hindiHint: 'सुनहरा मीठा केला'
    },
    color: 'from-emerald-600 to-teal-700'
  },
  {
    id: 'wildlife-kaziranga',
    title: 'Kaziranga Wildlife',
    hindiTitle: 'काजीरंगा के वन्यजीव',
    prompt: 'One animal is different! Can you tap the odd one out?',
    hindiPrompt: 'एक जानवर अलग है! उस अलग जीव पर टैप करें।',
    majority: { 
      name: 'One-Horned Rhino', 
      hindiName: 'एक सींग वाला गैंडा',
      emoji: '🦏', 
      hint: 'Kaziranga Rhino',
      hindiHint: 'काजीरंगा का गैंडा'
    },
    odd: { 
      name: 'Mountain Hornbill', 
      hindiName: 'पहाड़ी हॉर्नबिल पक्षी',
      emoji: '🦅', 
      hint: 'Hornbill Bird',
      hindiHint: 'हॉर्नबिल पक्षी'
    },
    color: 'from-teal-600 to-cyan-700'
  },
  {
    id: 'bihu-instruments',
    title: 'Bihu Celebration',
    hindiTitle: 'बिहू उत्सव और संगीत',
    prompt: 'Look closely at the music items. Tap the one that stands out!',
    hindiPrompt: 'संगीत वाद्ययंत्रों को ध्यान से देखें। जो अलग है उस पर टैप करें!',
    majority: { 
      name: 'Bihu Dhol Drum', 
      hindiName: 'बिहू ढोल',
      emoji: '🥁', 
      hint: 'Traditional Dhol Drum',
      hindiHint: 'पारंपरिक ढोल'
    },
    odd: { 
      name: 'Bamboo Flute', 
      hindiName: 'बांस की बांसुरी (पेपा)',
      emoji: '🪈', 
      hint: 'Pepa / Bamboo Flute',
      hindiHint: 'बांसुरी'
    },
    color: 'from-indigo-600 to-purple-700'
  },
  {
    id: 'harvest-kitchen',
    title: 'Assam Harvest Kitchen',
    hindiTitle: 'असमिया फसल रसोई',
    prompt: 'Find the single unique item on the harvest plate!',
    hindiPrompt: 'थाली में सबसे अलग और अनोखी वस्तु खोजें!',
    majority: { 
      name: 'Golden Rice Grain', 
      hindiName: 'सुनहरी धान की बाली',
      emoji: '🌾', 
      hint: 'Harvest Rice',
      hindiHint: 'धान की फसल'
    },
    odd: { 
      name: 'Kaji Nemu Lemon', 
      hindiName: 'काजी नेमु नींबू',
      emoji: '🍋', 
      hint: 'Assam Kaji Nemu',
      hindiHint: 'असम कागज़ी नींबू'
    },
    color: 'from-rose-600 to-amber-700'
  }
];

class OddAudioSynth {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playSuccessChime(isMuted) {
    if (isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.4, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } catch (e) {}
  }

  playGentleTone(isMuted) {
    if (isMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }
}

export default function OddOneOut() {
  const navigate = useNavigate();
  const { currentLanguage, activePatient, isOnline } = useApp();
  const synth = useMemo(() => new OddAudioSynth(), []);

  const isHindi = useMemo(() => {
    return (currentLanguage?.code || '').startsWith('hi');
  }, [currentLanguage]);

  const [currentLevel, setCurrentLevel] = useState(1);
  const [runningScore, setRunningScore] = useState(0);
  const [cardCount, setCardCount] = useState(3);
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [feedbackState, setFeedbackState] = useState(null); // 'correct' | 'wrong'
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [roundStats, setRoundStats] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const TOTAL_LEVELS = 5;
  const currentTheme = THEMES[(currentLevel - 1) % THEMES.length];
  const roundStartTimeRef = useRef(Date.now());
  const gameStartTimeRef = useRef(Date.now());

  const speakText = useCallback((text, isAutoPlay = false) => {
    if (isAudioMuted) return;
    speakLocalized({
      text,
      langCode: isHindi ? 'hi-IN' : (currentLanguage?.code || 'en'),
      rate: 0.90,
      isAutoPlay
    });
  }, [isAudioMuted, isHindi, currentLanguage]);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Generate round
  const generateRound = useCallback((levelNum, count) => {
    const theme = THEMES[(levelNum - 1) % THEMES.length];
    const totalCards = Math.max(3, Math.min(6, count));
    const oddIndex = Math.floor(Math.random() * totalCards);

    const generated = [];
    for (let i = 0; i < totalCards; i++) {
      if (i === oddIndex) {
        generated.push({
          id: `card-odd-${levelNum}-${i}`,
          name: isHindi ? theme.odd.hindiName : theme.odd.name,
          emoji: theme.odd.emoji,
          hint: isHindi ? theme.odd.hindiHint : theme.odd.hint,
          isOdd: true
        });
      } else {
        generated.push({
          id: `card-maj-${levelNum}-${i}`,
          name: isHindi ? theme.majority.hindiName : theme.majority.name,
          emoji: theme.majority.emoji,
          hint: isHindi ? theme.majority.hindiHint : theme.majority.hint,
          isOdd: false
        });
      }
    }

    setCards(generated);
    setSelectedCardId(null);
    setFeedbackState(null);
    setFeedbackMsg('');
    roundStartTimeRef.current = Date.now();

    const voicePrompt = isHindi 
      ? `स्तर ${levelNum}। ${theme.hindiPrompt}` 
      : `Level ${levelNum}. ${theme.prompt}`;
    speakText(voicePrompt, true);
  }, [isHindi, speakText]);

  // Start game on mount
  useEffect(() => {
    gameStartTimeRef.current = Date.now();
    generateRound(1, 3);
  }, [generateRound]);

  const handleCardClick = (card) => {
    if (feedbackState || isGameOver) return;

    setSelectedCardId(card.id);
    const timeTaken = Math.max(1, Math.round((Date.now() - roundStartTimeRef.current) / 1000));

    if (card.isOdd) {
      // Correct!
      setFeedbackState('correct');
      synth.playSuccessChime(isAudioMuted);
      setRunningScore(prev => prev + 20);

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#3b82f6']
      });

      const succMsg = isHindi
        ? `शानदार! ${card.name} बाकी सभी से अलग है! 🌟`
        : `Brilliant! ${card.name} is indeed the odd one out! 🌟`;
      setFeedbackMsg(succMsg);
      speakText(succMsg);

      const metric = {
        level: currentLevel,
        cardCount: cards.length,
        accuracy: 100,
        timeTakenSeconds: timeTaken
      };
      const updated = [...roundStats, metric];
      setRoundStats(updated);

      setTimeout(() => {
        if (currentLevel < TOTAL_LEVELS) {
          const nextLvl = currentLevel + 1;
          const nextCount = calculateNextOddCardCount(100, cardCount);
          setCardCount(nextCount);
          setCurrentLevel(nextLvl);
          generateRound(nextLvl, nextCount);
        } else {
          finishGame(updated);
        }
      }, 2200);
    } else {
      // Wrong
      setFeedbackState('wrong');
      synth.playGentleTone(isAudioMuted);

      const wrongMsg = isHindi
        ? `यह तो समान वस्तु है। दूसरी वस्तु को ध्यान से देखें! 💛`
        : `This one matches the others. Look closely for the unique one! 💛`;
      setFeedbackMsg(wrongMsg);
      speakText(wrongMsg);

      const metric = {
        level: currentLevel,
        cardCount: cards.length,
        accuracy: 50,
        timeTakenSeconds: timeTaken + 2
      };
      const updated = [...roundStats, metric];
      setRoundStats(updated);

      setTimeout(() => {
        if (currentLevel < TOTAL_LEVELS) {
          const nextLvl = currentLevel + 1;
          const nextCount = calculateNextOddCardCount(50, cardCount);
          setCardCount(nextCount);
          setCurrentLevel(nextLvl);
          generateRound(nextLvl, nextCount);
        } else {
          finishGame(updated);
        }
      }, 2600);
    }
  };

  const finishGame = async (finalRounds) => {
    setIsGameOver(true);
    const totalDurationSeconds = Math.max(5, Math.round((Date.now() - gameStartTimeRef.current) / 1000));
    const durationMinutes = Math.ceil(totalDurationSeconds / 60);

    const avgAccuracy = Math.round(
      finalRounds.reduce((acc, r) => acc + r.accuracy, 0) / Math.max(1, finalRounds.length)
    );

    const finalScaledScore = Math.min(100, Math.max(60, Math.round(avgAccuracy * 0.8 + (runningScore / 100) * 20)));

    const congrats = isHindi
      ? `बधाई हो! आपने 5 स्तर पूरे किए और ${finalScaledScore} अंक प्राप्त किए!`
      : `Congratulations! You completed all 5 levels with a score of ${finalScaledScore}!`;
    speakText(congrats);

    setIsSaving(true);
    const payload = {
      patientId: activePatient?.id || activePatient?._id || 'pat-1',
      gameType: 'odd-one-out',
      title: 'Odd One Out Pattern Match',
      category: 'Visual Discrimination',
      score: finalScaledScore,
      difficultyLevel: mapCardCountToDifficulty(cardCount),
      duration: `${durationMinutes} Mins`,
      roundDetails: finalRounds
    };

    try {
      if (isOnline) {
        await submitGameSessionApi(payload);
      } else {
        await queueOfflineAction('game_session', payload);
      }
    } catch (err) {
      console.warn('Queued offline session:', err);
      await queueOfflineAction('game_session', payload).catch(() => {});
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestart = () => {
    setCurrentLevel(1);
    setRunningScore(0);
    setRoundStats([]);
    setIsGameOver(false);
    setCardCount(3);
    gameStartTimeRef.current = Date.now();
    generateRound(1, 3);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAF7F2] pb-24 pt-6 px-4 sm:px-6 lg:px-8 xl:px-10">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* 1. TOP HEADER & CONTROLS */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate('/patient/games')}
              className="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-800 border-2 border-rose-300 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
              title="Leave Game"
            >
              <ArrowLeft className="w-5 h-5 stroke-[3] text-rose-800" />
              <span>{isHindi ? "खेल छोड़ें" : "Leave Game"}</span>
            </button>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-950 text-xs font-black uppercase tracking-wider border border-teal-300">
                  👁️ {isHindi ? "दृश्य एकाग्रता" : "Visual Focus"}
                </span>
                <span className="text-xs font-bold text-stone-500">
                  {isHindi ? "अनुकूली पैटर्न भेद" : "Adaptive Pattern Discrimination"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-950 mt-0.5">
                {isHindi ? "अलग वस्तु पहचानें (Odd One Out)" : "Odd One Out Pattern Match"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap self-start md:self-center">
            {/* Level Counter */}
            <div className="px-4 py-2 rounded-2xl bg-stone-900 text-white flex items-center gap-2 shadow-sm border border-stone-800">
              <Eye className="w-5 h-5 text-teal-400" />
              <div>
                <p className="text-[10px] uppercase font-bold text-stone-400">{isHindi ? "स्तर" : "Level"}</p>
                <p className="text-sm sm:text-base font-black text-teal-300 leading-none">
                  {currentLevel} <span className="text-stone-400 text-xs">/ {TOTAL_LEVELS}</span>
                </p>
              </div>
            </div>

            {/* Live Score Counter */}
            <div className="px-4 py-2 rounded-2xl bg-amber-800 text-white flex items-center gap-2 shadow-sm border border-amber-900">
              <Trophy className="w-5 h-5 text-amber-300" />
              <div>
                <p className="text-[10px] uppercase font-bold text-amber-200">{isHindi ? "अंक" : "Score"}</p>
                <p className="text-sm sm:text-base font-black text-white leading-none">
                  {runningScore} <span className="text-amber-300 text-xs">pts</span>
                </p>
              </div>
            </div>

            {/* Voice Instruction Button */}
            <button
              type="button"
              onClick={() => {
                const voicePrompt = isHindi 
                  ? `स्तर ${currentLevel}। ${currentTheme.hindiPrompt}` 
                  : `Level ${currentLevel}. ${currentTheme.prompt}`;
                speakText(voicePrompt);
              }}
              className="p-3 rounded-2xl bg-white hover:bg-stone-50 border-2 border-stone-300 text-stone-800 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-2 text-xs sm:text-sm font-bold"
              title="Listen to Instructions"
            >
              <Volume2 className="w-5 h-5 text-[#2C5AA0] shrink-0" />
              <span className="hidden sm:inline">{isHindi ? "निर्देश सुनें" : "Listen"}</span>
            </button>
          </div>
        </div>

        {/* 2. GAME PLAY AREA */}
        {!isGameOver ? (
          <div className="space-y-6">

            {/* Theme & Prompt Banner */}
            <div className="bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-teal-500/15 border-2 border-teal-400/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-800 text-white flex items-center justify-center shrink-0 shadow-sm text-2xl">
                  {currentTheme.odd.emoji}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-stone-950">
                    {isHindi ? currentTheme.hindiTitle : currentTheme.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-700 font-semibold mt-0.5">
                    {isHindi ? currentTheme.hindiPrompt : currentTheme.prompt}
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
                        ? 'bg-teal-800 scale-125 ring-2 ring-teal-400/50' 
                        : i + 1 < currentLevel 
                        ? 'bg-emerald-600' 
                        : 'bg-stone-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Feedback Message */}
            {feedbackMsg && (
              <div className={`p-4 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2.5 shadow-md border animate-in fade-in slide-in-from-top-2 ${
                feedbackState === 'correct'
                  ? 'bg-emerald-800 text-white border-emerald-700'
                  : 'bg-rose-100 text-rose-950 border-rose-300'
              }`}>
                {feedbackState === 'correct' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                ) : (
                  <Sparkles className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{feedbackMsg}</span>
              </div>
            )}

            {/* Cards Grid */}
            <div className={`grid gap-4 sm:gap-6 py-4 ${
              cards.length <= 3 
                ? 'grid-cols-1 sm:grid-cols-3' 
                : cards.length === 4 
                ? 'grid-cols-2 sm:grid-cols-4' 
                : cards.length === 5 
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' 
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
            }`}>
              {cards.map((card) => {
                const isSelected = selectedCardId === card.id;

                let cardStyle = 'bg-white hover:bg-amber-50/50 border-stone-200 hover:border-teal-600 shadow-sm hover:scale-102';
                if (isSelected && feedbackState === 'correct') {
                  cardStyle = 'bg-emerald-100 border-emerald-600 text-emerald-950 ring-4 ring-emerald-400/30 shadow-md scale-105';
                } else if (isSelected && feedbackState === 'wrong') {
                  cardStyle = 'bg-rose-100 border-rose-600 text-rose-950 animate-shake';
                }

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleCardClick(card)}
                    className={`rounded-3xl p-6 sm:p-8 border-3 flex flex-col items-center justify-center text-center space-y-4 transition-all cursor-pointer min-h-[200px] ${cardStyle}`}
                  >
                    <span className="text-6xl sm:text-7xl block select-none">
                      {card.emoji}
                    </span>
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                        {card.name}
                      </h4>
                      <p className="text-xs text-stone-500 font-medium mt-1">
                        {card.hint}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        ) : (
          /* Victory / Game Over Summary Screen */
          <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-stone-200 shadow-lg text-center space-y-6 max-w-xl mx-auto animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto text-4xl shadow-inner">
              🏆
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-stone-950">
                {isHindi ? "शानदार अभ्यास! खेल संपन्न!" : "Great Job! Challenge Complete!"}
              </h2>
              <p className="text-stone-600 text-sm font-medium">
                {isHindi 
                  ? "आपने दृश्य एकाग्रता और भेद के सभी 5 स्तर सफलतापूर्वक पूरे कर लिए हैं।" 
                  : "You successfully completed all 5 levels of visual pattern discrimination."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="p-3 bg-white rounded-xl border border-stone-200">
                <p className="text-xs text-stone-500 font-bold uppercase">{isHindi ? "कुल अंक" : "Total Score"}</p>
                <p className="text-2xl font-black text-amber-800">{runningScore} pts</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-stone-200">
                <p className="text-xs text-stone-500 font-bold uppercase">{isHindi ? "स्तर पूरे हुए" : "Levels Completed"}</p>
                <p className="text-2xl font-black text-emerald-700">{TOTAL_LEVELS} / {TOTAL_LEVELS}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRestart}
                className="w-full sm:flex-1 min-h-[52px] py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isHindi ? "फिर से खेलें" : "Play Again"}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/patient/games')}
                className="w-full sm:flex-1 min-h-[52px] py-3 rounded-2xl bg-[#2C5AA0] hover:bg-[#224780] text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isHindi ? "खेल सूची पर वापस जाएं" : "Back to Games"}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
