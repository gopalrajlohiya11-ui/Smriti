// Mock Data for NeuroSync / Smriti Platform (North East India Focus)

export const standard10Reminders = [
  { id: "rem-1", type: "meal", title: "Morning Breakfast & Tea", detail: "Healthy breakfast with warm Assam tea", time: "8:00 AM", status: "completed", icon: "meal" },
  { id: "rem-2", type: "medicine", title: "Morning Prescription", detail: "Donepezil 5mg & blood pressure tablets", time: "8:45 AM", status: "pending", icon: "Pill" },
  { id: "rem-3", type: "hydration", title: "Mid-Morning Hydration", detail: "Drink 1 full glass of fresh water", time: "10:30 AM", status: "pending", icon: "Droplets" },
  { id: "rem-4", type: "game", title: "Memory Game of the Day", detail: "10-minute memory match puzzle", time: "11:30 AM", status: "pending", icon: "BrainCircuit" },
  { id: "rem-5", type: "meal", title: "Nutritious Lunch", detail: "Warm meal with vegetables & lentils", time: "1:00 PM", status: "pending", icon: "meal" },
  { id: "rem-6", type: "hydration", title: "Afternoon Hydration", detail: "Glass of water or herbal tea", time: "2:30 PM", status: "pending", icon: "Droplets" },
  { id: "rem-7", type: "activity", title: "Evening Garden Walk", detail: "15 mins light stretching or walking", time: "4:30 PM", status: "pending", icon: "Footprints" },
  { id: "rem-8", type: "appointment", title: "Evening Caregiver Check-in", detail: "Daily routine review with caregiver", time: "6:30 PM", status: "pending", icon: "Calendar" },
  { id: "rem-9", type: "meal", title: "Light Dinner", detail: "Easily digestible dinner", time: "7:45 PM", status: "pending", icon: "meal" },
  { id: "rem-10", type: "medicine", title: "Night Medicine & Wind Down", detail: "Bedtime prescription & calm rest", time: "8:30 PM", status: "pending", icon: "Pill" }
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
    primaryCaregiver: "David Sangma",
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
  },
  {
    id: "pat-3",
    name: "Biren Das",
    age: 81,
    gender: "Male",
    phone: "+91 97060 11223",
    location: "Jorhat, Assam",
    nativeLanguage: "Assamese",
    avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80",
    lastActive: "45 minutes ago",
    streakDays: 14,
    cognitiveStage: "Early Memory Support",
    primaryCaregiver: "Dr. Ananya Sharma",
    emergencyContact: "+91 98590 33445",
    notes: "Consistently completes daily memory match game with tea garden motifs.",
    todayReminders: standard10Reminders,
    reminderHistory: [
      { date: "Aug 28", medicine: true, hydration: true, activity: true, appointment: true },
      { date: "Aug 27", medicine: true, hydration: true, activity: true, appointment: true },
      { date: "Aug 26", medicine: true, hydration: true, activity: true, appointment: true },
      { date: "Aug 25", medicine: true, hydration: true, activity: true, appointment: true },
      { date: "Aug 24", medicine: true, hydration: true, activity: true, appointment: true },
      { date: "Aug 23", medicine: true, hydration: true, activity: true, appointment: true },
      { date: "Aug 22", medicine: true, hydration: true, activity: true, appointment: true },
    ],
    weeklyPerformance: [
      { day: "Sat", memoryScore: 84, routineScore: 88, overallScore: 86 },
      { day: "Sun", memoryScore: 86, routineScore: 90, overallScore: 88 },
      { day: "Mon", memoryScore: 88, routineScore: 91, overallScore: 89 },
      { day: "Tue", memoryScore: 89, routineScore: 92, overallScore: 90 },
      { day: "Wed", memoryScore: 90, routineScore: 94, overallScore: 92 },
      { day: "Thu", memoryScore: 92, routineScore: 95, overallScore: 93 },
      { day: "Fri (Today)", memoryScore: 94, routineScore: 96, overallScore: 95 }
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
    category: "Pattern & Math Recall",
    duration: "3 Mins",
    difficulty: "Adaptive (3-7 items)",
    badge: "Play Now 🧺",
    path: "/patient/games/market-day-basket",
    icon: "ShoppingBasket",
    description: "Pick North-East fresh produce and solve simple bazaar shopping math!",
    benefits: "Stimulates executive pattern recognition, memory, and arithmetic recall."
  },
  {
    id: "game-1",
    title: "Majuli Island Mask Match",
    category: "Visual Memory",
    duration: "3 Mins",
    difficulty: "Gentle",
    icon: "Shapes",
    description: "Remember and match traditional handmade wooden masks of Assam.",
    benefits: "Strengthens visual recall and cultural familiarity."
  },
  {
    id: "game-2",
    title: "Bihu Dhol Rhythm Tap",
    category: "Auditory Timing",
    duration: "4 Mins",
    difficulty: "Easy",
    icon: "Music",
    description: "Tap along to the cheerful beats of the traditional Assam drum.",
    benefits: "Enhances motor coordination and auditory processing."
  },
  {
    id: "game-3",
    title: "Kaziranga Wildlife Spot",
    category: "Attention & Focus",
    duration: "3 Mins",
    difficulty: "Gentle",
    icon: "Sparkles",
    description: "Spot rhinos, hornbills, and deer among lush grasslands.",
    benefits: "Improves selective visual attention."
  }
];

export const regionalLanguages = [
  { code: 'en', name: 'English', greeting: 'Good Morning', dir: 'ltr', status: 'active' },
  { code: 'as', name: 'অসমীয়া (Assamese)', greeting: 'সুপ্ৰভাত (Xubho Probhat)', dir: 'ltr', status: 'active' },
  { code: 'kha', name: 'Khasi (Meghalaya)', greeting: 'Kumno (Good Day)', dir: 'ltr', status: 'coming_soon' },
  { code: 'mizo', name: 'Mizo (Mizoram)', greeting: 'Chibai (Welcome)', dir: 'ltr', status: 'coming_soon' },
  { code: 'bn', name: 'বাংলা (Bengali)', greeting: 'সুপ্রভাত (Suprobhat)', dir: 'ltr', status: 'coming_soon' }
];
