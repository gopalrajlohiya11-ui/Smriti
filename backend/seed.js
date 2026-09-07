const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Caregiver = require('./models/Caregiver');
const Patient = require('./models/Patient');
const Reminder = require('./models/Reminder');
const GameSession = require('./models/GameSession');
const ChatMessage = require('./models/ChatMessage');
const MemoryBankPhoto = require('./models/MemoryBankPhoto');

async function seedCleanDemoData() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/SIH';
    console.log('🔗 Connecting to MongoDB at:', mongoUri.replace(/\/\/.*@/, '//<credentials>@'));
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully.');

    // =========================================================================
    // STEP 1: DESTRUCTIVE WIPE OF ALL EXISTING DATA
    // =========================================================================
    console.log('\n🧹 Step 1: Performing full wipe of existing collections...');
    
    await Promise.all([
      Caregiver.deleteMany({}),
      Patient.deleteMany({}),
      Reminder.deleteMany({}),
      GameSession.deleteMany({}),
      ChatMessage.deleteMany({}),
      MemoryBankPhoto.deleteMany({})
    ]);

    const postWipeCounts = {
      caregivers: await Caregiver.countDocuments(),
      patients: await Patient.countDocuments(),
      reminders: await Reminder.countDocuments(),
      gameSessions: await GameSession.countDocuments(),
      chatMessages: await ChatMessage.countDocuments(),
      memoryPhotos: await MemoryBankPhoto.countDocuments()
    };

    console.log('📊 Wipe Verification (should all be 0):', postWipeCounts);
    const totalRemaining = Object.values(postWipeCounts).reduce((a, b) => a + b, 0);
    if (totalRemaining > 0) {
      throw new Error('❌ Wipe check failed! Documents still remain in collection.');
    }
    console.log('✅ All collections successfully verified empty.');

    // =========================================================================
    // STEP 2: CREATE EXACTLY ONE CAREGIVER (CLINICIAN / DOCTOR)
    // =========================================================================
    console.log('\n👩‍⚕️ Step 2: Creating single demo caregiver account (Dr. Ananya Sharma)...');

    const hashedPassword = await bcrypt.hash('caregiver123', 10);
    const hashedPin = await bcrypt.hash('1234', 10);

    const caregiverAnanya = await Caregiver.create({
      name: 'Dr. Ananya Sharma',
      email: 'dr.ananya@smriti.in',
      password: hashedPassword,
      contact: '+91 94350 12345',
      role: 'clinician',
      notificationPreference: 'whatsapp',
      patientIds: []
    });

    console.log(`✅ Created Caregiver: ${caregiverAnanya.name} (${caregiverAnanya.email})`);

    // =========================================================================
    // STEP 3: CREATE EXACTLY TWO PATIENTS ASSIGNED TO THIS CAREGIVER
    // =========================================================================
    console.log('\n👴👵 Step 3: Creating 2 NER demo patients assigned to Dr. Ananya Sharma...');

    // Patient 1: Ramesh Sharma (Guwahati, Assam - Assamese)
    const patientRamesh = await Patient.create({
      name: 'Ramesh Sharma',
      age: 74,
      gender: 'Male',
      phoneNumber: '+91 94350 12345',
      pin: hashedPin,
      tier: 1,
      language: 'Assamese',
      location: 'Guwahati, Assam',
      cognitiveStage: 'Early Memory Support',
      primaryCaregiver: 'Dr. Ananya Sharma',
      emergencyContact: '+91 98640 54321',
      notes: 'Enjoys morning walks by Brahmaputra and Assam tea. Responds warmly to family photos and Assamese folk music.',
      medicalNotes: 'Mild Alzheimer\'s Disease, Hypertension. Morning Donepezil 5mg.',
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80',
      caregiverId: caregiverAnanya._id,
      notificationPreference: 'whatsapp',
      isDemoSeed: true
    });

    // Patient 2: Meera Baruah (Shillong, Meghalaya - Khasi)
    const patientMeera = await Patient.create({
      name: 'Meera Baruah',
      age: 68,
      gender: 'Female',
      phoneNumber: '+91 98640 11223',
      pin: hashedPin,
      tier: 2,
      language: 'Khasi',
      location: 'Shillong, Meghalaya',
      cognitiveStage: 'Moderate Support',
      primaryCaregiver: 'Dr. Ananya Sharma',
      emergencyContact: '+91 94361 98765',
      notes: 'Loves classical choir music, Shillong pine walks, and weaving handicrafts. Speaks Khasi & English.',
      medicalNotes: 'Early-Stage Memory Impairment, Mild Osteoarthritis. Morning Memantine 10mg.',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
      caregiverId: caregiverAnanya._id,
      notificationPreference: 'whatsapp',
      isDemoSeed: true
    });

    // Link both patients to Dr. Ananya
    caregiverAnanya.patientIds = [patientRamesh._id, patientMeera._id];
    await caregiverAnanya.save();

    console.log(`✅ Seeded Patient 1: ${patientRamesh.name} (Assamese, 74 yrs, Guwahati) -> ID: ${patientRamesh._id}`);
    console.log(`✅ Seeded Patient 2: ${patientMeera.name} (Khasi, 68 yrs, Shillong) -> ID: ${patientMeera._id}`);
    console.log(`✅ Assigned both patients to Caregiver Dr. Ananya Sharma.`);

    // =========================================================================
    // STEP 4: POPULATE 7 DAYS OF REALISTIC GAME SESSIONS (FOR STREAK & ANALYTICS)
    // =========================================================================
    console.log('\n🎮 Step 4: Generating 7-day realistic cognitive game history for both patients...');

    const now = new Date();
    const getPastDate = (daysAgo, hours = 10, minutes = 30) => {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      d.setHours(hours, minutes, 0, 0);
      return d;
    };

    // 7 Days of sessions for Ramesh Sharma (Progressive improvement: 78 -> 96)
    const rameshGameHistory = [
      {
        daysAgo: 6,
        gameType: 'market-day-basket',
        title: 'Market Day Basket',
        category: 'Pattern & Math Recall',
        score: 78,
        difficultyLevel: 'easy',
        duration: '2m 15s',
        roundDetails: [
          { level: 1, itemCount: 3, mode: 'categorization', accuracy: 80, correctCount: 3, totalAttempts: 4, timeTakenSeconds: 30 },
          { level: 2, itemCount: 4, mode: 'categorization', accuracy: 75, correctCount: 3, totalAttempts: 4, timeTakenSeconds: 45 },
          { level: 3, itemCount: 4, mode: 'math', accuracy: 80, correctCount: 4, totalAttempts: 5, timeTakenSeconds: 60 }
        ]
      },
      {
        daysAgo: 5,
        gameType: 'faces-family-recall',
        title: 'Faces & Family Recall',
        category: 'Family & People Recall',
        score: 82,
        difficultyLevel: 'medium',
        duration: '2m 40s',
        roundDetails: [
          { level: 1, itemCount: 4, mode: 'family_name', accuracy: 100, correctCount: 4, totalAttempts: 4, timeTakenSeconds: 35 },
          { level: 2, itemCount: 4, mode: 'family_relation', accuracy: 75, correctCount: 3, totalAttempts: 4, timeTakenSeconds: 50 },
          { level: 3, itemCount: 4, mode: 'family_name', accuracy: 80, correctCount: 4, totalAttempts: 5, timeTakenSeconds: 75 }
        ]
      },
      {
        daysAgo: 4,
        gameType: 'daily-routine-sequencer',
        title: 'Daily Routine Sequencer',
        category: 'Sequence & Routine Recall',
        score: 85,
        difficultyLevel: 'medium',
        duration: '3m 10s',
        roundDetails: [
          { level: 1, itemCount: 4, mode: 'routine_ordering', accuracy: 100, correctCount: 4, totalAttempts: 4, timeTakenSeconds: 40 },
          { level: 2, itemCount: 4, mode: 'routine_ordering', accuracy: 80, correctCount: 4, totalAttempts: 5, timeTakenSeconds: 65 },
          { level: 3, itemCount: 5, mode: 'routine_ordering', accuracy: 80, correctCount: 4, totalAttempts: 5, timeTakenSeconds: 85 }
        ]
      },
      {
        daysAgo: 3,
        gameType: 'sound-rhythm-match',
        title: 'Sound & Rhythm Match',
        category: 'Auditory & Rhythm Recall',
        score: 88,
        difficultyLevel: 'medium',
        duration: '2m 30s',
        roundDetails: [
          { level: 1, itemCount: 3, mode: 'rhythm_pattern', accuracy: 100, correctCount: 3, totalAttempts: 3, timeTakenSeconds: 30 },
          { level: 2, itemCount: 4, mode: 'rhythm_pattern', accuracy: 85, correctCount: 4, totalAttempts: 5, timeTakenSeconds: 55 },
          { level: 3, itemCount: 4, mode: 'rhythm_pattern', accuracy: 80, correctCount: 4, totalAttempts: 5, timeTakenSeconds: 65 }
        ]
      },
      {
        daysAgo: 2,
        gameType: 'odd-one-out',
        title: 'Odd One Out Pattern Match',
        category: 'Pattern & Visual Focus',
        score: 90,
        difficultyLevel: 'medium',
        duration: '2m 50s',
        roundDetails: [
          { level: 1, itemCount: 4, mode: 'categorization', accuracy: 100, correctCount: 4, totalAttempts: 4, timeTakenSeconds: 30 },
          { level: 2, itemCount: 6, mode: 'categorization', accuracy: 90, correctCount: 5, totalAttempts: 6, timeTakenSeconds: 60 },
          { level: 3, itemCount: 6, mode: 'categorization', accuracy: 85, correctCount: 5, totalAttempts: 6, timeTakenSeconds: 80 }
        ]
      },
      {
        daysAgo: 1,
        gameType: 'market-day-basket',
        title: 'Market Day Basket',
        category: 'Pattern & Math Recall',
        score: 94,
        difficultyLevel: 'hard',
        duration: '3m 05s',
        roundDetails: [
          { level: 1, itemCount: 4, mode: 'categorization', accuracy: 100, correctCount: 4, totalAttempts: 4, timeTakenSeconds: 35 },
          { level: 2, itemCount: 5, mode: 'categorization', accuracy: 95, correctCount: 5, totalAttempts: 5, timeTakenSeconds: 60 },
          { level: 3, itemCount: 5, mode: 'math', accuracy: 90, correctCount: 5, totalAttempts: 6, timeTakenSeconds: 90 }
        ]
      },
      {
        daysAgo: 0, // Today's session!
        gameType: 'faces-family-recall',
        title: 'Faces & Family Recall',
        category: 'Family & People Recall',
        score: 96,
        difficultyLevel: 'hard',
        duration: '2m 20s',
        roundDetails: [
          { level: 1, itemCount: 4, mode: 'family_name', accuracy: 100, correctCount: 4, totalAttempts: 4, timeTakenSeconds: 25 },
          { level: 2, itemCount: 4, mode: 'family_relation', accuracy: 100, correctCount: 4, totalAttempts: 4, timeTakenSeconds: 45 },
          { level: 3, itemCount: 5, mode: 'family_name', accuracy: 92, correctCount: 5, totalAttempts: 6, timeTakenSeconds: 70 }
        ]
      }
    ];

    // 7 Days of sessions for Meera Baruah (Consistent early stage: 74 -> 79)
    const meeraGameHistory = [
      {
        daysAgo: 6,
        gameType: 'sound-rhythm-match',
        title: 'Sound & Rhythm Match',
        category: 'Auditory & Rhythm Recall',
        score: 74,
        difficultyLevel: 'easy',
        duration: '3m 15s',
        roundDetails: [
          { level: 1, itemCount: 3, mode: 'rhythm_pattern', accuracy: 75, correctCount: 3, totalAttempts: 4, timeTakenSeconds: 45 },
          { level: 2, itemCount: 3, mode: 'rhythm_pattern', accuracy: 75, correctCount: 3, totalAttempts: 4, timeTakenSeconds: 65 },
          { level: 3, itemCount: 4, mode: 'rhythm_pattern', accuracy: 72, correctCount: 3, totalAttempts: 4, timeTakenSeconds: 85 }
        ]
      },
      {
        daysAgo: 5,
        gameType: 'faces-family-recall',
        title: 'Faces & Family Recall',
        category: 'Family & People Recall',
        score: 77,
        difficultyLevel: 'easy',
        duration: '2m 55s',
        roundDetails: [
          { level: 1, itemCount: 3, mode: 'family_name', accuracy: 80, correctCount: 3, totalAttempts: 4, timeTakenSeconds: 40 },
          { level: 2, itemCount: 4, mode: 'family_relation', accuracy: 75, correctCount: 3, totalAttempts: 4, timeTakenSeconds: 60 },
          { level: 3, itemCount: 4, mode: 'family_name', accuracy: 76, correctCount: 3, totalAttempts: 4, timeTakenSeconds: 75 }
        ]
      },
      {
        daysAgo: 4,
        gameType: 'daily-routine-sequencer',
        title: 'Daily Routine Sequencer',
        category: 'Sequence & Routine Recall',
        score: 75,
        difficultyLevel: 'medium',
        duration: '3m 40s',
        roundDetails: [
          { level: 1, itemCount: 4, mode: 'routine_ordering', accuracy: 80, correctCount: 4, totalAttempts: 5, timeTakenSeconds: 50 },
          { level: 2, itemCount: 4, mode: 'routine_ordering', accuracy: 75, correctCount: 3, totalAttempts: 4, timeTakenSeconds: 80 },
          { level: 3, itemCount: 4, mode: 'routine_ordering', accuracy: 70, correctCount: 3, totalAttempts: 4, timeTakenSeconds: 90 }
        ]
      },
      {
        daysAgo: 3,
        gameType: 'sound-rhythm-match',
        title: 'Sound & Rhythm Match',
        category: 'Auditory & Rhythm Recall',
        score: 78,
        difficultyLevel: 'medium',
        duration: '3m 00s',
        roundDetails: [
          { level: 1, itemCount: 3, mode: 'rhythm_pattern', accuracy: 82, correctCount: 3, totalAttempts: 4, timeTakenSeconds: 40 },
          { level: 2, itemCount: 4, mode: 'rhythm_pattern', accuracy: 76, correctCount: 3, totalAttempts: 4, timeTakenSeconds: 70 },
          { level: 3, itemCount: 4, mode: 'rhythm_pattern', accuracy: 76, correctCount: 3, totalAttempts: 4, timeTakenSeconds: 80 }
        ]
      },
      {
        daysAgo: 2,
        gameType: 'odd-one-out',
        title: 'Odd One Out Pattern Match',
        category: 'Pattern & Visual Focus',
        score: 76,
        difficultyLevel: 'medium',
        duration: '3m 30s',
        roundDetails: [
          { level: 1, itemCount: 4, mode: 'categorization', accuracy: 80, correctCount: 4, totalAttempts: 5, timeTakenSeconds: 40 },
          { level: 2, itemCount: 6, mode: 'categorization', accuracy: 75, correctCount: 5, totalAttempts: 6, timeTakenSeconds: 70 },
          { level: 3, itemCount: 6, mode: 'categorization', accuracy: 73, correctCount: 4, totalAttempts: 5, timeTakenSeconds: 100 }
        ]
      },
      {
        daysAgo: 1,
        gameType: 'faces-family-recall',
        title: 'Faces & Family Recall',
        category: 'Family & People Recall',
        score: 80,
        difficultyLevel: 'medium',
        duration: '3m 10s',
        roundDetails: [
          { level: 1, itemCount: 3, mode: 'family_name', accuracy: 85, correctCount: 3, totalAttempts: 3, timeTakenSeconds: 40 },
          { level: 2, itemCount: 4, mode: 'family_relation', accuracy: 78, correctCount: 3, totalAttempts: 4, timeTakenSeconds: 65 },
          { level: 3, itemCount: 4, mode: 'family_relation', accuracy: 77, correctCount: 3, totalAttempts: 4, timeTakenSeconds: 85 }
        ]
      },
      {
        daysAgo: 0, // Today
        gameType: 'market-day-basket',
        title: 'Market Day Basket',
        category: 'Pattern & Math Recall',
        score: 79,
        difficultyLevel: 'medium',
        duration: '3m 25s',
        roundDetails: [
          { level: 1, itemCount: 4, mode: 'categorization', accuracy: 84, correctCount: 4, totalAttempts: 4, timeTakenSeconds: 45 },
          { level: 2, itemCount: 5, mode: 'categorization', accuracy: 78, correctCount: 4, totalAttempts: 5, timeTakenSeconds: 70 },
          { level: 3, itemCount: 4, mode: 'math', accuracy: 75, correctCount: 3, totalAttempts: 4, timeTakenSeconds: 90 }
        ]
      }
    ];

    for (const g of rameshGameHistory) {
      await GameSession.create({
        patientId: patientRamesh._id,
        gameType: g.gameType,
        title: g.title,
        category: g.category,
        score: g.score,
        difficultyLevel: g.difficultyLevel,
        duration: g.duration,
        roundDetails: g.roundDetails,
        timestamp: getPastDate(g.daysAgo, 11, 15)
      });
    }

    for (const g of meeraGameHistory) {
      await GameSession.create({
        patientId: patientMeera._id,
        gameType: g.gameType,
        title: g.title,
        category: g.category,
        score: g.score,
        difficultyLevel: g.difficultyLevel,
        duration: g.duration,
        roundDetails: g.roundDetails,
        timestamp: getPastDate(g.daysAgo, 15, 30)
      });
    }

    console.log(`✅ Seeded 7 game sessions for Ramesh Sharma (scores: 78 -> 96)`);
    console.log(`✅ Seeded 7 game sessions for Meera Baruah (scores: 74 -> 79)`);

    // =========================================================================
    // STEP 5: POPULATE TODAY'S 10 REMINDERS (REALISTIC MIX OF DONE & PENDING)
    // =========================================================================
    console.log('\n⏰ Step 5: Populating today\'s structured reminder timelines...');
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();

    // Ramesh's Reminders (Mostly on track, morning done)
    const rameshReminders = [
      { type: 'meal', title: 'Morning Breakfast & Assam Tea', detail: 'Warm tea & roti', scheduledTime: new Date(y, m, d, 8, 0, 0), acknowledged: true },
      { type: 'medicine', title: 'Morning Donepezil 5mg', detail: 'Memory vitamin & BP tablet with water', scheduledTime: new Date(y, m, d, 8, 45, 0), acknowledged: true },
      { type: 'hydration', title: 'Mid-Morning Water Glass', detail: 'Drink 1 full glass of fresh water', scheduledTime: new Date(y, m, d, 10, 30, 0), acknowledged: true },
      { type: 'game', title: 'Memory Game of the Day', detail: 'Daily cognitive workout on Smriti', scheduledTime: new Date(y, m, d, 11, 30, 0), acknowledged: true },
      { type: 'meal', title: 'Nutritious Lunch', detail: 'Rice, dal & fresh garden vegetables', scheduledTime: new Date(y, m, d, 13, 0, 0), acknowledged: false },
      { type: 'hydration', title: 'Afternoon Herbal Tea', detail: 'Warm herbal tea or coconut water', scheduledTime: new Date(y, m, d, 14, 30, 0), acknowledged: false },
      { type: 'activity', title: 'Evening Garden Walk', detail: '15 mins gentle walking with walking stick', scheduledTime: new Date(y, m, d, 16, 30, 0), acknowledged: false },
      { type: 'appointment', title: 'Evening Caregiver Check-in', detail: 'Daily video/phone call with Dr. Ananya', scheduledTime: new Date(y, m, d, 18, 30, 0), acknowledged: false },
      { type: 'meal', title: 'Light Dinner', detail: 'Warm khichdi or vegetable soup', scheduledTime: new Date(y, m, d, 19, 45, 0), acknowledged: false },
      { type: 'medicine', title: 'Night Routine & Rest', detail: 'Night vitamins & calm restful sleep', scheduledTime: new Date(y, m, d, 20, 30, 0), acknowledged: false }
    ];

    // Meera's Reminders (Has 1 overdue alert for realistic clinical supervision demo)
    const meeraReminders = [
      { type: 'meal', title: 'Morning Breakfast & Meghalaya Tea', detail: 'Warm porridge & Meghalaya tea', scheduledTime: new Date(y, m, d, 8, 0, 0), acknowledged: true },
      { type: 'medicine', title: 'Morning Memantine 10mg', detail: 'Take with half glass of water', scheduledTime: new Date(now.getTime() - 2 * 3600 * 1000), acknowledged: false, dismissed: false }, // Live Red Flag Alert!
      { type: 'hydration', title: 'Mid-Morning Hydration', detail: 'Drink 1 fresh glass of water', scheduledTime: new Date(y, m, d, 10, 30, 0), acknowledged: true },
      { type: 'game', title: 'Memory Game of the Day', detail: 'Photo recall activity on Smriti', scheduledTime: new Date(y, m, d, 11, 30, 0), acknowledged: true },
      { type: 'meal', title: 'Nutritious Lunch', detail: 'Fresh stew & steamed rice', scheduledTime: new Date(y, m, d, 13, 0, 0), acknowledged: false },
      { type: 'hydration', title: 'Afternoon Hydration', detail: 'Glass of warm water', scheduledTime: new Date(y, m, d, 14, 30, 0), acknowledged: false },
      { type: 'activity', title: 'Afternoon Stretch & Music', detail: 'Listen to folk tunes & gentle arm movement', scheduledTime: new Date(y, m, d, 16, 30, 0), acknowledged: false },
      { type: 'appointment', title: 'Caregiver Daily Check-in', detail: 'Routine review with Dr. Ananya', scheduledTime: new Date(y, m, d, 18, 30, 0), acknowledged: false },
      { type: 'meal', title: 'Light Dinner', detail: 'Easily digestible soup & vegetables', scheduledTime: new Date(y, m, d, 19, 45, 0), acknowledged: false },
      { type: 'medicine', title: 'Night Routine & Rest', detail: 'Relaxation & bedtime preparation', scheduledTime: new Date(y, m, d, 20, 30, 0), acknowledged: false }
    ];

    for (const rem of rameshReminders) {
      await Reminder.create({ patientId: patientRamesh._id, ...rem });
    }
    for (const rem of meeraReminders) {
      await Reminder.create({ patientId: patientMeera._id, ...rem });
    }

    console.log(`✅ Seeded 10 reminders for Ramesh Sharma (4 completed, 6 upcoming)`);
    console.log(`✅ Seeded 10 reminders for Meera Baruah (3 completed, 1 overdue alert, 6 upcoming)`);

    // =========================================================================
    // STEP 6: POPULATE VERIFIED FAMILY PHOTO VAULT ENTRIES
    // =========================================================================
    console.log('\n📸 Step 6: Populating verified family memory photo vaults...');

    const rameshPhotos = [
      {
        patientId: patientRamesh._id,
        title: 'Grandson Arjun at Brahmaputra Ghat',
        taggedName: 'Arjun Sharma',
        relation: 'Grandson (पोता)',
        year: '2023',
        location: 'Guwahati, Assam',
        photoUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop&q=80',
        description: 'Arjun smiling after performing the Bihu folk dance on the banks of Brahmaputra River.',
        audioPrompt: 'This is your grandson Arjun smiling after his Bihu dance performance by the river in Guwahati.'
      },
      {
        patientId: patientRamesh._id,
        title: 'Dr. Ananya GMC Graduation',
        taggedName: 'Dr. Ananya Sharma',
        relation: 'Daughter & Caregiver (बेटी)',
        year: '2018',
        location: 'Gauhati Medical College',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
        description: 'Your proud daughter Ananya receiving her gold medal in medicine.',
        audioPrompt: 'This is your daughter Dr. Ananya receiving her medical degree gold medal.'
      },
      {
        patientId: patientRamesh._id,
        title: 'Ancestral Tea Garden Home',
        taggedName: 'Jorhat Estate',
        relation: 'Family Home (पैतृक घर)',
        year: '2020',
        location: 'Jorhat, Assam',
        photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
        description: 'The green veranda where you enjoyed morning Assam tea for 40 years.',
        audioPrompt: 'This is your beloved home in Jorhat where the family spent decades together.'
      },
      {
        patientId: patientRamesh._id,
        title: 'Bihu Festival Celebration',
        taggedName: 'Family Feast',
        relation: 'Family Gathering (परिवार)',
        year: '2022',
        location: 'Guwahati, Assam',
        photoUrl: 'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=600&auto=format&fit=crop&q=80',
        description: 'Celebrating Rongali Bihu with pitha, laru, and family blessings.',
        audioPrompt: 'This is the happy Bihu feast celebration with the entire family together.'
      }
    ];

    const meeraPhotos = [
      {
        patientId: patientMeera._id,
        title: 'Morning Walk at Ward\'s Lake',
        taggedName: 'Ward\'s Lake',
        relation: 'Favorite Place (पसंदीदा जगह)',
        year: '2021',
        location: 'Shillong, Meghalaya',
        photoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
        description: 'Walking under the cherry blossoms and pine trees beside the wooden bridge in Shillong.',
        audioPrompt: 'This is Ward Lake in Shillong where you took peaceful morning walks.'
      },
      {
        patientId: patientMeera._id,
        title: 'Traditional Khasi Weaving Workshop',
        taggedName: 'Handloom Studio',
        relation: 'Lifelong Passion (शौक)',
        year: '2019',
        location: 'Shillong, Meghalaya',
        photoUrl: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=600&auto=format&fit=crop&q=80',
        description: 'Weaving traditional colourful silk tapestries with close community friends.',
        audioPrompt: 'This is your handloom studio where you created beautiful silk patterns.'
      },
      {
        patientId: patientMeera._id,
        title: 'Granddaughter Daplin',
        taggedName: 'Daplin Baruah',
        relation: 'Granddaughter (पोती)',
        year: '2023',
        location: 'Shillong, Meghalaya',
        photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
        description: 'Daplin singing in the Shillong youth choir performance.',
        audioPrompt: 'This is your granddaughter Daplin singing beautifully in church.'
      }
    ];

    await MemoryBankPhoto.insertMany([...rameshPhotos, ...meeraPhotos]);
    console.log(`✅ Seeded ${rameshPhotos.length} photo memories for Ramesh Sharma`);
    console.log(`✅ Seeded ${meeraPhotos.length} photo memories for Meera Baruah`);

    // =========================================================================
    // STEP 7: FINAL AUDIT VERIFICATION
    // =========================================================================
    console.log('\n======================================================');
    console.log('🏆 FINAL DATABASE AUDIT SUMMARY');
    console.log('======================================================');
    
    const finalCounts = {
      caregivers: await Caregiver.countDocuments(),
      patients: await Patient.countDocuments(),
      reminders: await Reminder.countDocuments(),
      gameSessions: await GameSession.countDocuments(),
      chatMessages: await ChatMessage.countDocuments(),
      memoryPhotos: await MemoryBankPhoto.countDocuments()
    };

    console.log(`👥 Caregivers: ${finalCounts.caregivers} (Expected: 1)`);
    console.log(`👴 Patients: ${finalCounts.patients} (Expected: 2)`);
    console.log(`⏰ Reminders: ${finalCounts.reminders} (Expected: 20 -> 10 per patient)`);
    console.log(`🎮 Game Sessions: ${finalCounts.gameSessions} (Expected: 14 -> 7 per patient)`);
    console.log(`📸 Memory Photos: ${finalCounts.memoryPhotos} (Expected: 7)`);
    console.log('======================================================\n');

    console.log('✨ Demo Credentials:');
    console.log('------------------------------------------------------');
    console.log('Caregiver/Doctor:');
    console.log('  Email:    dr.ananya@smriti.in');
    console.log('  Password: caregiver123');
    console.log('\nPatient 1:');
    console.log('  Name:     Ramesh Sharma');
    console.log('  Age:      74');
    console.log('  PIN:      1234');
    console.log('  Language: Assamese (as) / Guwahati, Assam');
    console.log('\nPatient 2:');
    console.log('  Name:     Meera Baruah');
    console.log('  Age:      68');
    console.log('  PIN:      1234');
    console.log('  Language: Khasi (kha) / Shillong, Meghalaya');
    console.log('------------------------------------------------------\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedCleanDemoData();
