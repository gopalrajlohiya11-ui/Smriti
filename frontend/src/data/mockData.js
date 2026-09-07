// Mock Data for NeuroSync / Smriti Platform (North East India Focus)

export const standard10Reminders = [
  { id: "rem-1", type: "meal", title: "Morning Breakfast & Tea", hindiTitle: "सुबह का नाश्ता और असम चाय", detail: "Healthy breakfast with warm Assam tea", hindiDetail: "गर्म असम चाय के साथ पौष्टिक नाश्ता", time: "8:00 AM", status: "completed", icon: "meal" },
  { id: "rem-2", type: "medicine", title: "Morning Prescription", hindiTitle: "सुबह की निर्धारित दवा", detail: "Donepezil 5mg & blood pressure tablets", hindiDetail: "डोनेपेज़िल 5mg और बीपी की दवा पानी के साथ", time: "8:45 AM", status: "pending", icon: "Pill" },
  { id: "rem-3", type: "hydration", title: "Mid-Morning Hydration", hindiTitle: "सुबह पानी पीने का समय", detail: "Drink 1 full glass of fresh water", hindiDetail: "ताज़ा पानी का 1 पूरा गिलास पिएं", time: "10:30 AM", status: "pending", icon: "Droplets" },
  { id: "rem-4", type: "game", title: "Memory Game of the Day", hindiTitle: "आज का दिमागी खेल", detail: "10-minute memory match puzzle", hindiDetail: "10 मिनट का सरल और आनंदमयी स्मृति खेल", time: "11:30 AM", status: "pending", icon: "BrainCircuit" },
  { id: "rem-5", type: "meal", title: "Nutritious Lunch", hindiTitle: "पौष्टिक दोपहर का भोजन", detail: "Rice, dal & mixed vegetables", hindiDetail: "चावल, दाल और ताज़ा हरी सब्जियाँ", time: "1:00 PM", status: "pending", icon: "meal" },
  { id: "rem-6", type: "hydration", title: "Afternoon Hydration", hindiTitle: "दोपहर पानी पीने का समय", detail: "Glass of water or herbal tea", hindiDetail: "एक गिलास ताज़ा पानी या हर्बल चाय", time: "2:30 PM", status: "pending", icon: "Droplets" },
  { id: "rem-7", type: "activity", title: "Evening Garden Walk", hindiTitle: "शाम की खुली हवा में सैर", detail: "15 mins light stretching or walking", hindiDetail: "15 मिनट हल्की वॉक या बाग में टहलना", time: "4:30 PM", status: "pending", icon: "Footprints" },
  { id: "rem-8", type: "appointment", title: "Evening Caregiver Check-in", hindiTitle: "शाम का परिवार और डॉक्टर संवाद", detail: "Daily routine review with caregiver", hindiDetail: "दैनिक स्वास्थ्य और दिनचर्या की समीक्षा", time: "6:30 PM", status: "pending", icon: "Calendar" },
  { id: "rem-9", type: "meal", title: "Light Dinner", hindiTitle: "हल्का रात का भोजन", detail: "Easily digestible dinner", hindiDetail: "सुपाच्य और हल्का रात का भोजन", time: "7:45 PM", status: "pending", icon: "meal" },
  { id: "rem-10", type: "medicine", title: "Night Medicine & Wind Down", hindiTitle: "रात की दवा और शांतिपूर्ण विश्राम", detail: "Bedtime prescription & calm rest", hindiDetail: "सोने से पहले की दवा और शांत नींद", time: "8:30 PM", status: "pending", icon: "Pill" }
];

export const initialPatients = [
  {
    id: "pat-1",
    name: "Ramesh Sharma",
    age: 74,
    gender: "Male",
    phone: "+91 94350 12345",
    location: "Guwahati, Assam",
    nativeLanguage: "Assamese",
    avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80",
    lastActive: "15 minutes ago",
    streakDays: 14,
    cognitiveStage: "Early Memory Support",
    primaryCaregiver: "Dr. Ananya Sharma",
    emergencyContact: "+91 98640 54321",
    notes: "Enjoys morning walks and Bihu folk music. Needs gentle visual prompts for BP medicine.",
    todayReminders: standard10Reminders,
    reminderHistory: [
      { date: "Aug 28", medicine: true, hydration: true, activity: true, appointment: true },
      { date: "Aug 27", medicine: true, hydration: true, activity: true, appointment: true },
      { date: "Aug 26", medicine: true, hydration: true, activity: false, appointment: true },
      { date: "Aug 25", medicine: true, hydration: true, activity: true, appointment: true },
      { date: "Aug 24", medicine: true, hydration: true, activity: true, appointment: true },
      { date: "Aug 23", medicine: false, hydration: true, activity: true, appointment: true },
      { date: "Aug 22", medicine: true, hydration: true, activity: false, appointment: true },
    ],
    weeklyPerformance: [
      { day: "Sat", memoryScore: 68, routineScore: 75, overallScore: 71 },
      { day: "Sun", memoryScore: 72, routineScore: 80, overallScore: 76 },
      { day: "Mon", memoryScore: 75, routineScore: 82, overallScore: 78 },
      { day: "Tue", memoryScore: 79, routineScore: 85, overallScore: 82 },
      { day: "Wed", memoryScore: 82, routineScore: 88, overallScore: 85 },
      { day: "Thu", memoryScore: 80, routineScore: 90, overallScore: 85 },
      { day: "Fri (Today)", memoryScore: 86, routineScore: 92, overallScore: 89 }
    ]
  },
  {
    id: "pat-2",
    name: "Meera Baruah",
    age: 68,
    gender: "Female",
    phone: "+91 98640 11223",
    location: "Shillong, Meghalaya",
    nativeLanguage: "Khasi",
    avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80",
    lastActive: "2 hours ago",
    streakDays: 14,
    cognitiveStage: "Moderate Support",
    primaryCaregiver: "Dr. Ananya Sharma",
    emergencyContact: "+91 94361 98765",
    notes: "Responsive to photo recognition of family visits in Cherrapunji. Score dip observed in Pattern Finder this week.",
    todayReminders: standard10Reminders,
    reminderHistory: [
      { date: "Aug 28", medicine: true, hydration: true, activity: true, appointment: true },
      { date: "Aug 27", medicine: true, hydration: true, activity: true, appointment: true },
      { date: "Aug 26", medicine: true, hydration: false, activity: false, appointment: true },
      { date: "Aug 25", medicine: false, hydration: true, activity: true, appointment: true },
      { date: "Aug 24", medicine: true, hydration: true, activity: true, appointment: true },
      { date: "Aug 23", medicine: true, hydration: true, activity: true, appointment: true },
      { date: "Aug 22", medicine: true, hydration: true, activity: true, appointment: true },
    ],
    weeklyPerformance: [
      { day: "Sat", memoryScore: 82, routineScore: 85, overallScore: 83 },
      { day: "Sun", memoryScore: 80, routineScore: 82, overallScore: 81 },
      { day: "Mon", memoryScore: 74, routineScore: 78, overallScore: 76 },
      { day: "Tue", memoryScore: 68, routineScore: 72, overallScore: 70 },
      { day: "Wed", memoryScore: 62, routineScore: 70, overallScore: 66 },
      { day: "Thu", memoryScore: 58, routineScore: 68, overallScore: 63 },
      { day: "Fri (Today)", memoryScore: 55, routineScore: 65, overallScore: 60 }
    ]
  }
];

export const initialRedFlags = [
  {
    id: "flag-1",
    patientId: "pat-1",
    patientName: "Ramesh Sharma",
    patientAvatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80",
    patientLocation: "Guwahati",
    severity: "high",
    title: "Missed Morning Medicine Reminder",
    description: "Ramesh has not acknowledged his 8:45 AM BP & Memory medicine. Scheduled reminder was earlier today.",
    time: "Overdue today",
    actionRequired: "Call Patient",
    actionPhone: "+91 94350 12345"
  }
];

export const familyPhotos = [
  {
    id: "fam-1",
    title: "Your grandson Arjun",
    relation: "Grandson",
    location: "Guwahati Brahmaputra Riverfront",
    year: "2023",
    description: "Arjun was smiling after his Bihu dance performance by the river.",
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80",
    audioPrompt: "This is your grandson Arjun at the Guwahati riverfront after his Bihu dance performance.",
    audioNote: "This is your grandson Arjun at the Guwahati riverfront after his Bihu dance performance."
  },
  {
    id: "fam-2",
    title: "Daughter Ananya's Graduation",
    relation: "Daughter",
    location: "Gauhati Medical College",
    year: "2018",
    description: "Dr. Ananya receiving her gold medal in neurology. You were so proud that day.",
    photoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop&q=80",
    audioPrompt: "This is your daughter Ananya on her graduation day from Gauhati Medical College.",
    audioNote: "This is your daughter Ananya on her graduation day from Gauhati Medical College."
  },
  {
    id: "fam-3",
    title: "Ancestral Home in Jorhat",
    relation: "Family Home",
    location: "Jorhat Tea Estate",
    year: "1985",
    description: "The verandah where you used to enjoy morning Assam tea and read the newspaper.",
    photoUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80",
    audioPrompt: "This is the ancestral tea garden bungalow in Jorhat where you lived for 30 years.",
    audioNote: "This is the ancestral tea garden bungalow in Jorhat where you lived for 30 years."
  },
  {
    id: "fam-4",
    title: "Shillong Family Trip",
    relation: "Family Holiday",
    location: "Elephant Falls, Shillong",
    year: "2019",
    description: "The whole family together at Elephant Falls during the autumn holidays.",
    photoUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop&q=80",
    imageUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop&q=80",
    audioPrompt: "Here is your family enjoying the refreshing mist at Elephant Falls in Shillong.",
    audioNote: "Here is your family enjoying the refreshing mist at Elephant Falls in Shillong."
  }
];

export const cognitiveGames = [
  {
    id: "game-market-day",
    title: "Market Day Basket",
    hindiTitle: "दैनिक बाज़ार टोकरी",
    category: "Pattern & Math Recall",
    hindiCategory: "पैटर्न और गणित अभ्यास",
    duration: "3 Mins",
    hindiDuration: "3 मिनट",
    difficulty: "Adaptive (3-7 items)",
    hindiDifficulty: "अनुकूली (3-7 वस्तुएं)",
    badge: "Play Now",
    hindiBadge: "अभी खेलें",
    path: "/patient/games/market-day-basket",
    route: "/patient/games/market-day-basket",
    icon: "ShoppingBasket",
    description: "Pick North-East fresh produce and solve simple bazaar shopping math!",
    hindiDescription: "उत्तर-पूर्व की ताज़ा सब्जियां और फल चुनें और बाज़ार का सरल गणित हल करें!",
    benefits: "Stimulates executive pattern recognition, memory, and arithmetic recall.",
    hindiBenefits: "पैटर्न पहचान, स्मृति और दैनिक गणितीय गणना को सक्रिय करता है।"
  },
  {
    id: "game-routine-sequencer",
    title: "Daily Routine Sequencer",
    hindiTitle: "दैनिक दिनचर्या क्रम",
    category: "Sequence & Routine Recall",
    hindiCategory: "दिनचर्या और क्रम अभ्यास",
    duration: "3 Mins",
    hindiDuration: "3 मिनट",
    difficulty: "Adaptive (3-6 steps)",
    hindiDifficulty: "अनुकूली (3-6 कदम)",
    badge: "Play Now",
    hindiBadge: "अभी खेलें",
    path: "/patient/games/daily-routine-sequencer",
    route: "/patient/games/daily-routine-sequencer",
    icon: "Clock",
    description: "Arrange North-East daily living routines in chronological order from morning to night!",
    hindiDescription: "सुबह की चाय से लेकर रात की नींद तक अपनी दिनचर्या को सही समय क्रम में लगाएं!",
    benefits: "Strengthens temporal orientation, daily living routine memory, and chronological sequencing.",
    hindiBenefits: "समय की पहचान, दैनिक कार्यों की स्मृति और सही क्रमबद्धता को मजबूत करता है।"
  },
  {
    id: "game-faces-family",
    title: "Faces & Family Recall",
    hindiTitle: "चेहरे और पारिवारिक यादें",
    category: "Family & People Recall",
    hindiCategory: "पारिवारिक चेहरे और रिश्ते",
    duration: "3 Mins",
    hindiDuration: "3 मिनट",
    difficulty: "Adaptive (3-6 options)",
    hindiDifficulty: "अनुकूली (3-6 विकल्प)",
    badge: "Play Now",
    hindiBadge: "अभी खेलें",
    path: "/patient/games/faces-family-recall",
    route: "/patient/games/faces-family-recall",
    icon: "Users",
    description: "Recognize beloved family members, grandchildren, and friends through cherished photos!",
    hindiDescription: "प्यारी तस्वीरों के माध्यम से अपने बच्चों, पोते-पोतियों और परिवार को पहचानें!",
    benefits: "Stimulates facial recognition, emotional memory, and relationship orientation.",
    hindiBenefits: "चेहरे की पहचान, भावनात्मक स्मृति और पारिवारिक संबंधों को सुदृढ़ करता है।"
  },
  {
    id: "game-sound-rhythm",
    title: "Sound & Rhythm Match",
    hindiTitle: "ध्वनि और ढोल ताल मिलान",
    category: "Auditory & Rhythm Recall",
    hindiCategory: "ध्वनि और संगीत ताल",
    duration: "3 Mins",
    hindiDuration: "3 मिनट",
    difficulty: "Adaptive (3-6 beats)",
    hindiDifficulty: "अनुकूली (3-6 ताल)",
    badge: "Play Now",
    hindiBadge: "अभी खेलें",
    path: "/patient/games/sound-rhythm-match",
    route: "/patient/games/sound-rhythm-match",
    icon: "Music",
    description: "Listen to traditional Bihu dhol beats, watch the rhythm patterns, and tap along in sequence!",
    hindiDescription: "पारंपरिक बिहू ढोल की थाप सुनें, ताल का क्रम याद रखें और उसी क्रम में ढोल बजाएं!",
    benefits: "Strengthens auditory processing speed, working memory, and rhythmic coordination.",
    hindiBenefits: "ध्वनि प्रसंस्करण गति, कार्यशील स्मृति और लयबद्ध समन्वय को बढ़ाता है।"
  },
  {
    id: "game-odd-one-out",
    title: "Odd One Out Pattern Match",
    hindiTitle: "अलग वस्तु पहचानें (Odd One Out)",
    category: "Visual Discrimination",
    hindiCategory: "दृश्य एकाग्रता और भेद",
    duration: "3 Mins",
    hindiDuration: "3 मिनट",
    difficulty: "Adaptive (3-6 tiles)",
    hindiDifficulty: "अनुकूली (3-6 टाइलें)",
    badge: "Play Now",
    hindiBadge: "अभी खेलें",
    path: "/patient/games/odd-one-out",
    route: "/patient/games/odd-one-out",
    icon: "Eye",
    description: "Spot the single unique item that does not match the rest of the cultural collection!",
    hindiDescription: "बाकी सभी से अलग और अनोखी वस्तु को ध्यान से देखें और उस पर टैप करें!",
    benefits: "Sharpens visual focus, categorization skills, and fine attention to detail.",
    hindiBenefits: "दृश्य एकाग्रता, वर्गीकरण कौशल और बारीकियों पर ध्यान केंद्रित करने में मदद करता है।"
  }
];

export const regionalLanguages = [
  { code: 'en', name: 'English', greeting: 'Good Morning', dir: 'ltr', status: 'active' },
  { code: 'hi', name: 'हिन्दी (Hindi)', greeting: 'नमस्ते (Namaste)', dir: 'ltr', status: 'active' },
  { code: 'as', name: 'অসমীয়া (Assamese)', greeting: 'সুপ্ৰভাত (Xubho Probhat)', dir: 'ltr', status: 'active' },
  { code: 'kha', name: 'Khasi (Meghalaya)', greeting: 'Kumno (Good Day)', dir: 'ltr', status: 'coming_soon' },
  { code: 'mizo', name: 'Mizo (Mizoram)', greeting: 'Chibai (Welcome)', dir: 'ltr', status: 'coming_soon' },
  { code: 'bn', name: 'বাংলা (Bengali)', greeting: 'সুপ্রভাত (Suprobhat)', dir: 'ltr', status: 'coming_soon' }
];
