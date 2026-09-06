import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { cognitiveGames } from '../../data/mockData';
import { speakLocalized, stopSpeech } from '../../utils/speechUtils';
import { calculatePatientStreak } from '../../utils/streakUtils';
import confetti from 'canvas-confetti';
import PatientNavShell from '../../components/patient/PatientNavShell';
import GameIcon from '../../components/common/GameIcon';
import { 
  Flame, 
  Volume2, 
  Play, 
  Clock, 
  CheckCircle2, 
  BrainCircuit, 
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const dailyGamesList = [
  {
    dayName: "Sunday",
    hindiDayName: "रविवार",
    title: "Shillong Pine Blossom Match",
    hindiTitle: "शिलांग पाइन और फूलों का मिलान",
    subtitle: "Floral & Color Recall",
    hindiSubtitle: "फूल और रंग स्मृति",
    description: "Match pairs of mountain orchids, pinecones, and rhododendrons from Meghalaya.",
    hindiDescription: "मेघालय के पहाड़ी ऑर्किड, पाइनकोन और रोडोडेंड्रोन फूलों के जोड़े मिलाएँ।",
    category: "Visual Memory",
    hindiCategory: "दृश्य स्मृति",
    duration: "3 Mins",
    hindiDuration: "3 मिनट",
    demoPairs: ['🌺', '🌲', '🌸', '🍃', '🌺', '🌲', '🌸', '🍃']
  },
  {
    dayName: "Monday",
    hindiDayName: "सोमवार",
    title: "Kaziranga Wildlife Spot",
    hindiTitle: "काजीरंगा वन्यजीव पहचान",
    subtitle: "Visual Focus & Attention",
    hindiSubtitle: "दृश्य एकाग्रता और ध्यान",
    description: "Spot and remember the gentle rhinos, wild water buffaloes, and hornbills of Assam.",
    hindiDescription: "असम के प्रसिद्ध गैंडे, जंगली भैंस और हॉर्नबिल पक्षियों को पहचानें और याद रखें।",
    category: "Visual Focus",
    hindiCategory: "दृश्य एकाग्रता",
    duration: "3 Mins",
    hindiDuration: "3 मिनट",
    demoPairs: ['🦏', '🦅', '🦌', '🌿', '🦏', '🦅', '🦌', '🌿']
  },
  {
    dayName: "Tuesday",
    hindiDayName: "मंगलवार",
    title: "Tezpur Tea Leaf Pattern Sort",
    hindiTitle: "तेजपुर चाय पत्ती पैटर्न मिलान",
    subtitle: "Category & Shape Association",
    hindiSubtitle: "श्रेणी और आकार मिलान",
    description: "Group the golden tea leaves, woven bamboo baskets, and morning tea cups.",
    hindiDescription: "सुनहरी चाय की पत्तियों, बांस की टोकरियों और सुबह की चाय के प्यालों को क्रमबद्ध करें।",
    category: "Executive Function",
    hindiCategory: "संज्ञानात्मक अभ्यास",
    duration: "4 Mins",
    hindiDuration: "4 मिनट",
    demoPairs: ['🍵', '🧺', '🍃', '☀️', '🍵', '🧺', '🍃', '☀️']
  },
  {
    dayName: "Wednesday",
    hindiDayName: "बुधवार",
    title: "Assamese Bihu Dhol Rhythm",
    hindiTitle: "असमिया बिहू ढोल ताल",
    subtitle: "Auditory & Musical Timing",
    hindiSubtitle: "ध्वनि और संगीत ताल",
    description: "Tap along to the cheerful beats of the traditional Bihu drum and bamboo flutes.",
    hindiDescription: "पारंपरिक बिहू ढोल और बांसुरी की आनंदमयी ताल के साथ टैप करें।",
    category: "Auditory Recall",
    hindiCategory: "ध्वनि स्मृति",
    duration: "3 Mins",
    hindiDuration: "3 मिनट",
    demoPairs: ['🥁', '🪈', '💃', '✨', '🥁', '🪈', '💃', '✨']
  },
  {
    dayName: "Thursday",
    hindiDayName: "गुरुवार",
    title: "Brahmaputra Ferry Crossing",
    hindiTitle: "ब्रह्मपुत्र नौका यात्रा क्रम",
    subtitle: "Step Sequencing & Direction",
    hindiSubtitle: "चरणबद्ध दिशा और क्रम",
    description: "Guide the sunset ferry safely across the islands of the majestic Brahmaputra River.",
    hindiDescription: "महान ब्रह्मपुत्र नदी के द्वीपों के पार सूर्यास्त नौका को सुरक्षित मार्ग दिखाएँ।",
    category: "Spatial Logic",
    hindiCategory: "स्थानिक तर्क",
    duration: "4 Mins",
    hindiDuration: "4 मिनट",
    demoPairs: ['⛵', '🌊', '🌅', '🏝️', '⛵', '🌊', '🌅', '🏝️']
  },
  {
    dayName: "Friday",
    hindiDayName: "शुक्रवार",
    title: "Majuli Mask Color Recall",
    hindiTitle: "माजुली मुखौटा रंग पहचान",
    subtitle: "Heritage Visual Recognition",
    hindiSubtitle: "पारंपरिक सांस्कृतिक पहचान",
    description: "Remember the vibrant colors and painted features of sacred Majuli river island masks.",
    hindiDescription: "पवित्र माजुली नदी द्वीप के जीवंत रंगों और चित्रित मुखौटों को याद रखें।",
    category: "Heritage Recall",
    hindiCategory: "सांस्कृतिक स्मृति",
    duration: "3 Mins",
    hindiDuration: "3 मिनट",
    demoPairs: ['🎭', '🎨', '🌟', '🦚', '🎭', '🎨', '🌟', '🦚']
  },
  {
    dayName: "Saturday",
    hindiDayName: "शनिवार",
    title: "Guwahati Heritage Memory Trail",
    hindiTitle: "गुवाहाटी धरोहर स्मृति यात्रा",
    subtitle: "Familiar Places & Stories",
    hindiSubtitle: "परिचित स्थान और यादें",
    description: "Relive joyful memories of historic ghats, silk markets, and river vistas.",
    hindiDescription: "ऐतिहासिक घाटों, रेशम बाज़ारों और नदी के मनमोहक दृश्यों की प्यारी यादें ताज़ा करें।",
    category: "Episodic Recall",
    hindiCategory: "स्थान स्मृति",
    duration: "4 Mins",
    hindiDuration: "4 मिनट",
    demoPairs: ['🏛️', '🛶', '🌸', '🔔', '🏛️', '🛶', '🌸', '🔔']
  }
];

export default function PatientAllGames() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage, activePatient, recordGameSession } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const isHindi = useMemo(() => {
    return (currentLanguage?.code || '').startsWith('hi');
  }, [currentLanguage]);

  const todayKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }, []);

  const [isGameOfDayCompleted, setIsGameOfDayCompleted] = useState(() => {
    return localStorage.getItem(`smriti_god_done_${activePatient?.id}_${todayKey}`) === 'true';
  });

  const isDemo = activePatient?.isDemoSeed === true || 
    ['pat-1', 'pat-2', 'pat-3'].includes(activePatient?.id) || 
    ['Ramesh Sharma', 'Meera Baruah', 'Biren Das'].includes(activePatient?.name);

  const calculatedBaseStreak = isDemo 
    ? (activePatient?.streakDays || 14) 
    : calculatePatientStreak(activePatient, [], activePatient?.todayReminders || []);

  const [currentStreak, setCurrentStreak] = useState(calculatedBaseStreak);
  const [isGameOfDayOpen, setIsGameOfDayOpen] = useState(false);
  const [godFlippedIndices, setGodFlippedIndices] = useState([]);
  const [godMatchedIndices, setGodMatchedIndices] = useState([]);

  const todayFeaturedGame = useMemo(() => {
    const dayIdx = new Date().getDay();
    return dailyGamesList[dayIdx] || dailyGamesList[0];
  }, []);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const categories = useMemo(() => [
    { id: 'all', label: isHindi ? 'सभी खेल' : 'All Games' },
    { id: 'Pattern', label: isHindi ? 'पैटर्न और गणित' : 'Pattern & Math' },
    { id: 'Sequence', label: isHindi ? 'दिनचर्या और क्रम' : 'Routines & Sequence' },
    { id: 'Family', label: isHindi ? 'चेहरे और परिवार' : 'Faces & Family' },
    { id: 'Auditory', label: isHindi ? 'ध्वनि और ताल' : 'Sound & Rhythm' }
  ], [isHindi]);

  const filteredGames = useMemo(() => {
    if (selectedCategory === 'all') return cognitiveGames;
    return cognitiveGames.filter(g => 
      (g.category || '').toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (g.hindiCategory || '').toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (g.title || '').toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (g.hindiTitle || '').toLowerCase().includes(selectedCategory.toLowerCase())
    );
  }, [selectedCategory]);

  const speakText = (text) => {
    speakLocalized({
      text,
      langCode: isHindi ? 'hi-IN' : (currentLanguage?.code || 'en'),
      rate: 0.95
    });
  };

  const handleGodCardClick = (index) => {
    if (godFlippedIndices.includes(index) || godMatchedIndices.includes(index)) return;

    const newFlipped = [...godFlippedIndices, index];
    setGodFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [firstIdx, secondIdx] = newFlipped;
      const firstSymbol = todayFeaturedGame.demoPairs[firstIdx];
      const secondSymbol = todayFeaturedGame.demoPairs[secondIdx];

      if (firstSymbol === secondSymbol) {
        const newMatched = [...godMatchedIndices, firstIdx, secondIdx];
        setGodMatchedIndices(newMatched);
        setGodFlippedIndices([]);

        if (newMatched.length === todayFeaturedGame.demoPairs.length) {
          completeGameOfDay();
        }
      } else {
        setTimeout(() => {
          setGodFlippedIndices([]);
        }, 800);
      }
    }
  };

  const completeGameOfDay = () => {
    setIsGameOfDayCompleted(true);
    localStorage.setItem(`smriti_god_done_${activePatient?.id}_${todayKey}`, 'true');

    const newStreak = currentStreak + 1;
    setCurrentStreak(newStreak);

    if (recordGameSession && activePatient?.id) {
      recordGameSession(activePatient.id, {
        gameId: 'game-of-the-day',
        gameTitle: isHindi ? todayFeaturedGame.hindiTitle : todayFeaturedGame.title,
        score: 100,
        completedAt: new Date().toISOString()
      });
    }

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#1F6B4A', '#B5502E', '#2C5AA0']
    });

    const celebrationMsg = isHindi
      ? `बधाई हो! आपने आज का खेल पूरा कर लिया और अपनी स्मृति स्ट्रीक को ${newStreak} दिन तक बढ़ा दिया!`
      : `Congratulations! You completed today's Game of the Day and increased your memory streak to ${newStreak} days!`;
    speakText(celebrationMsg);
  };

  return (
    <PatientNavShell pageTitle={isHindi ? "दिमागी खेल अभ्यास" : "Brain Games Library"}>
      <div className="space-y-8">
        
        {/* ======================================================== */}
        {/* 1. TOP HERO: FEATURED GAME OF THE DAY                    */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#B5502E]/30 shadow-2xs space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF6F0] text-[#B5502E] text-xs font-black uppercase tracking-wider border border-[#B5502E]/20">
              <Flame className="w-3.5 h-3.5 fill-[#B5502E]" />
              <span>
                {isHindi 
                  ? `${todayFeaturedGame.hindiDayName} की विशेष स्मृति चुनौती` 
                  : `${todayFeaturedGame.dayName}'s Featured Memory Challenge`}
              </span>
            </span>

            {isGameOfDayCompleted ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF7F2] text-[#1F6B4A] text-xs font-black border border-[#A3D9C1]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isHindi ? "आज पूरा हुआ (+1 स्ट्रीक!)" : "Completed Today (+1 Streak!)"}</span>
              </span>
            ) : (
              <span className="text-xs font-bold text-[#6B6B6B]">
                {isHindi ? `${currentStreak} दिन की स्मृति स्ट्रीक` : `${currentStreak} Day Memory Streak`}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#FDF6F0] border border-[#B5502E]/20 flex items-center justify-center shrink-0 shadow-2xs">
                <BrainCircuit className="w-8 h-8 text-[#B5502E]" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl sm:text-3xl font-black text-[#2B2B2B]">
                  {isHindi ? todayFeaturedGame.hindiTitle : todayFeaturedGame.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#6B6B6B] font-medium">
                  {isHindi ? todayFeaturedGame.hindiDescription : todayFeaturedGame.description}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setIsGameOfDayOpen(true)}
                className={`w-full sm:w-auto min-h-[56px] px-8 py-4 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer active:scale-98 shrink-0 ${
                  isGameOfDayCompleted
                    ? 'bg-[#EDF7F2] hover:bg-[#d8efe2] text-[#1F6B4A] border-2 border-[#1F6B4A]'
                    : 'bg-[#B5502E] hover:bg-[#9E4224] text-white shadow-sm'
                }`}
              >
                <Play className="w-5 h-5 fill-current" />
                <span>
                  {isGameOfDayCompleted 
                    ? (isHindi ? 'फिर से खेलें (अभ्यास)' : 'Play Again (Practice)') 
                    : (isHindi ? 'आज की चुनौती खेलें' : "Play Today's Challenge")}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. EXPLORE ALL GAMES GRID (WITH CATEGORY FILTER TABS)    */}
        {/* ======================================================== */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E0D8] pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#2B2B2B]">
                {isHindi ? `सभी दिमागी खेल अभ्यास (${filteredGames.length})` : `All Brain Exercises (${filteredGames.length})`}
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6B6B] font-medium">
                {isHindi 
                  ? 'स्मृति, क्रम और ताल के अभ्यास के लिए नीचे दिए गए किसी भी खेल को चुनें' 
                  : 'Choose any game below to practice memory, sequencing, and rhythm anytime'}
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => speakText(isHindi ? "स्मृति और एकाग्रता के अभ्यास के लिए नीचे दिए गए किसी भी खेल को चुनें।" : "Choose any brain game below to exercise your memory and focus.")}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#EFF4FA] hover:bg-[#2C5AA0] text-[#2C5AA0] hover:text-white border border-[#2C5AA0]/30 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center shrink-0"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isHindi ? "निर्देश सुनें" : "Listen"}</span>
            </button>
          </div>

          {/* Category Filter Pills (Min 48px touch targets) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[48px] px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 border ${
                  selectedCategory === cat.id
                    ? 'bg-[#2C5AA0] text-white border-[#2C5AA0] shadow-xs'
                    : 'bg-white hover:bg-stone-50 text-[#2B2B2B] border-[#E5E0D8]'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E5E0D8] hover:border-[#2C5AA0] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-5 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] border border-[#E5E0D8] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                      <GameIcon icon={game.icon} className="w-8 h-8 text-[#2C5AA0]" />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FAF7F2] text-[#6B6B6B] border border-[#E5E0D8]">
                      {isHindi ? (game.hindiCategory || game.category) : game.category}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl font-black text-[#2B2B2B] group-hover:text-[#2C5AA0] transition-colors">
                      {isHindi ? (game.hindiTitle || game.title) : game.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6B6B6B] font-medium line-clamp-2">
                      {isHindi ? (game.hindiDescription || game.description) : game.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const target = game.path || game.route;
                    if (target) navigate(target);
                  }}
                  className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-[#2C5AA0] hover:bg-[#224780] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>{isHindi ? "खेल शुरू करें" : "Play Game"}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL: GAME OF THE DAY                                   */}
      {/* ======================================================== */}
      {isGameOfDayOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-[#E5E0D8] shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsGameOfDayOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-[#2B2B2B] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF6F0] text-[#B5502E] text-xs font-black uppercase tracking-wider border border-[#B5502E]/20">
                <Flame className="w-3.5 h-3.5 fill-[#B5502E]" />
                <span>{isHindi ? "दैनिक स्मृति मिलान" : "Daily Memory Match"}</span>
              </span>
              <h3 className="text-2xl font-black text-[#2B2B2B]">
                {isHindi ? todayFeaturedGame.hindiTitle : todayFeaturedGame.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#6B6B6B]">
                {isHindi ? "समान प्रतीकों के जोड़े मिलाएँ और अपनी स्मृति सक्रिय करें!" : "Match pairs of familiar symbols to complete today's challenge!"}
              </p>
            </div>

            {/* 4x2 Memory Card Grid */}
            <div className="grid grid-cols-4 gap-3 py-2">
              {todayFeaturedGame.demoPairs.map((symbol, idx) => {
                const isFlipped = godFlippedIndices.includes(idx);
                const isMatched = godMatchedIndices.includes(idx);
                const isRevealed = isFlipped || isMatched;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleGodCardClick(idx)}
                    disabled={isMatched || isFlipped}
                    className={`h-20 sm:h-24 rounded-2xl text-3xl sm:text-4xl flex items-center justify-center transition-all cursor-pointer font-black select-none border-2 ${
                      isMatched
                        ? 'bg-[#EDF7F2] border-[#1F6B4A] text-[#1F6B4A] shadow-inner scale-95'
                        : isFlipped
                        ? 'bg-[#FDF6F0] border-[#B5502E] text-[#B5502E] shadow-md scale-105'
                        : 'bg-stone-50 hover:bg-amber-50/50 border-stone-200 text-stone-400 hover:border-amber-400'
                    }`}
                  >
                    {isRevealed ? symbol : '❓'}
                  </button>
                );
              })}
            </div>

            {isGameOfDayCompleted && (
              <div className="p-4 rounded-2xl bg-[#EDF7F2] border border-[#A3D9C1] text-center space-y-1">
                <p className="text-sm font-black text-[#1F6B4A] flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>{isHindi ? "बधाई! चुनौती पूरी हुई!" : "Challenge Completed!"}</span>
                </p>
                <p className="text-xs text-[#1F6B4A]/80 font-medium">
                  {isHindi ? `आपकी स्मृति स्ट्रीक अब ${currentStreak} दिन हो गई है!` : `Your memory streak is now ${currentStreak} days!`}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsGameOfDayOpen(false)}
                className="flex-1 min-h-[48px] py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-[#2B2B2B] font-bold text-sm transition-colors cursor-pointer"
              >
                {isHindi ? "बंद करें" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PatientNavShell>
  );
}
