require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Patient = require('./models/patient');
const Caregiver = require('./models/Caregiver');
const Reminder = require('./models/Reminder');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Seed Caregivers with hashed passwords
    const hashedPass = await bcrypt.hash('demo1234', 10);

    let caregiverAnanya = await Caregiver.findOne({ email: 'dr.ananya@smriti.in' });
    if (!caregiverAnanya) {
      caregiverAnanya = new Caregiver({
        name: 'Dr. Ananya Sharma',
        email: 'dr.ananya@smriti.in',
        password: hashedPass,
        role: 'clinician',
        contact: '+91 94350 12345',
        patientIds: []
      });
      await caregiverAnanya.save();
      console.log('✅ Seeded Caregiver: Dr. Ananya Sharma (dr.ananya@smriti.in / demo1234)');
    } else {
      caregiverAnanya.password = hashedPass;
      await caregiverAnanya.save();
    }

    let caregiverDavid = await Caregiver.findOne({ email: 'nurse.david@smriti.in' });
    if (!caregiverDavid) {
      caregiverDavid = new Caregiver({
        name: 'David Sangma',
        email: 'nurse.david@smriti.in',
        password: hashedPass,
        role: 'caregiver',
        contact: '+91 98640 54321',
        patientIds: []
      });
      await caregiverDavid.save();
      console.log('✅ Seeded Caregiver: David Sangma (nurse.david@smriti.in / demo1234)');
    } else {
      caregiverDavid.password = hashedPass;
      await caregiverDavid.save();
    }

    // 2. Clean up stale accumulated reminders from previous test runs
    await Reminder.deleteMany({});
    console.log('🧹 Cleaned up stale accumulated test reminders from database');

    // 3. Seed Real Demo Patients with Hashed PINs
    const defaultHashedPin = await bcrypt.hash('1234', 10);
    const myPhone = (process.env.MY_WHATSAPP_NUMBER || '917404623328').replace(/\D/g, '');

    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();

    const patientsData = [
      {
        name: 'Ramesh Sharma',
        age: 74,
        phoneNumber: myPhone,
        pin: defaultHashedPin,
        tier: 1,
        language: 'Assamese',
        location: 'Guwahati, Assam',
        cognitiveStage: 'Early Memory Support',
        primaryCaregiver: 'Dr. Ananya Sharma',
        emergencyContact: '+91 94350 12345',
        notes: 'Enjoys morning tea garden walks and Assamese Bihu melodies.',
        medicalNotes: 'Prescribed Donepezil 5mg (morning) & Amlodipine 5mg. Blood pressure stable.',
        avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80',
        caregiverId: caregiverAnanya._id,
        isDemoSeed: true,
        reminders: [
          { type: 'meal', title: 'Morning Breakfast & Tea', detail: 'Warm Assam tea & roti', scheduledTime: new Date(y, m, d, 8, 0, 0), acknowledged: true },
          { type: 'medicine', title: 'Morning Prescription (Donepezil 5mg)', detail: 'Memory vitamin & BP tablet with water', scheduledTime: new Date(now.getTime() - 2.5 * 3600 * 1000), acknowledged: false, dismissed: false }, // Overdue Alert 1
          { type: 'hydration', title: 'Mid-Morning Hydration', detail: 'Drink 1 full glass of fresh water', scheduledTime: new Date(now.getTime() - 45 * 60 * 1000), acknowledged: false, dismissed: false }, // Overdue Alert 2
          { type: 'game', title: 'Memory Game of the Day', detail: '10-min memory card match on Smriti', scheduledTime: new Date(y, m, d, 11, 30, 0), acknowledged: false },
          { type: 'meal', title: 'Nutritious Lunch', detail: 'Rice, dal & mixed vegetables', scheduledTime: new Date(y, m, d, 13, 0, 0), acknowledged: false },
          { type: 'hydration', title: 'Afternoon Herbal Tea', detail: 'Warm herbal tea or coconut water', scheduledTime: new Date(y, m, d, 14, 30, 0), acknowledged: false },
          { type: 'activity', title: 'Evening Garden Walk', detail: '15 mins gentle movement', scheduledTime: new Date(y, m, d, 16, 30, 0), acknowledged: false },
          { type: 'appointment', title: 'Evening Caregiver Check-in', detail: 'Daily video/phone call with caregiver', scheduledTime: new Date(y, m, d, 18, 30, 0), acknowledged: false },
          { type: 'meal', title: 'Light Dinner', detail: 'Warm khichdi or soup', scheduledTime: new Date(y, m, d, 19, 45, 0), acknowledged: false },
          { type: 'medicine', title: 'Night Medicine & Rest', detail: 'Night vitamins & calm sleep routine', scheduledTime: new Date(y, m, d, 20, 30, 0), acknowledged: false }
        ]
      },
      {
        name: 'Meera Baruah',
        age: 68,
        phoneNumber: '919864011223',
        pin: defaultHashedPin,
        tier: 2,
        language: 'Khasi',
        location: 'Shillong, Meghalaya',
        cognitiveStage: 'Moderate Support',
        primaryCaregiver: 'David Sangma',
        emergencyContact: '+91 98640 54321',
        notes: 'Enjoys traditional Shillong folk tunes and photo memories.',
        medicalNotes: 'Prescribed Memantine 10mg. Needs gentle hydration reminders.',
        avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
        caregiverId: caregiverDavid._id,
        isDemoSeed: true,
        reminders: [
          { type: 'meal', title: 'Morning Breakfast & Tea', detail: 'Warm porridge & Meghalaya tea', scheduledTime: new Date(y, m, d, 8, 0, 0), acknowledged: true },
          { type: 'medicine', title: 'Morning Prescription (Memantine 10mg)', detail: 'Take with half glass of water', scheduledTime: new Date(now.getTime() - 2 * 3600 * 1000), acknowledged: false, dismissed: false }, // Overdue Alert 1
          { type: 'hydration', title: 'Mid-Morning Hydration', detail: 'Drink 1 glass of water', scheduledTime: new Date(now.getTime() - 30 * 60 * 1000), acknowledged: false, dismissed: false }, // Overdue Alert 2
          { type: 'game', title: 'Memory Game of the Day', detail: 'Photo recall activity on Smriti', scheduledTime: new Date(y, m, d, 11, 30, 0), acknowledged: false },
          { type: 'meal', title: 'Nutritious Lunch', detail: 'Fresh stew & steamed rice', scheduledTime: new Date(y, m, d, 13, 0, 0), acknowledged: false },
          { type: 'hydration', title: 'Afternoon Hydration', detail: 'Glass of warm water', scheduledTime: new Date(y, m, d, 14, 30, 0), acknowledged: false },
          { type: 'activity', title: 'Afternoon Stretch & Music', detail: 'Listen to folk tunes & gentle arm movement', scheduledTime: new Date(y, m, d, 16, 30, 0), acknowledged: false },
          { type: 'appointment', title: 'Caregiver Daily Check-in', detail: 'Routine review with Nurse David', scheduledTime: new Date(y, m, d, 18, 30, 0), acknowledged: false },
          { type: 'meal', title: 'Light Dinner', detail: 'Easily digestible dinner', scheduledTime: new Date(y, m, d, 19, 45, 0), acknowledged: false },
          { type: 'medicine', title: 'Night Routine & Rest', detail: 'Relaxation & bedtime preparation', scheduledTime: new Date(y, m, d, 20, 30, 0), acknowledged: false }
        ]
      },
      {
        name: 'Biren Das',
        age: 81,
        phoneNumber: '919706011223',
        pin: defaultHashedPin,
        tier: 1,
        language: 'Assamese',
        location: 'Jorhat, Assam',
        cognitiveStage: 'Early Memory Support',
        primaryCaregiver: 'Dr. Ananya Sharma',
        emergencyContact: '+91 94350 12345',
        notes: 'Active with daily Game of the Day memory match.',
        medicalNotes: 'Metformin + Telmisartan for sugar and BP. Regular cognitive score: 92/100.',
        avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80',
        caregiverId: caregiverAnanya._id,
        isDemoSeed: true,
        reminders: [
          { type: 'meal', title: 'Morning Breakfast & Tea', detail: 'Warm tea & toast', scheduledTime: new Date(y, m, d, 8, 0, 0), acknowledged: true },
          { type: 'medicine', title: 'Morning Metformin & BP Tablets', detail: 'Prescription taken with water', scheduledTime: new Date(y, m, d, 8, 45, 0), acknowledged: true }, // Completed!
          { type: 'hydration', title: 'Mid-Morning Hydration', detail: 'Drink 1 glass of fresh water', scheduledTime: new Date(now.getTime() - 1 * 3600 * 1000), acknowledged: false, dismissed: false }, // Overdue Alert 3 for Ananya
          { type: 'game', title: 'Memory Game of the Day', detail: 'Daily cognitive puzzle on Smriti', scheduledTime: new Date(y, m, d, 11, 30, 0), acknowledged: false },
          { type: 'meal', title: 'Nutritious Lunch', detail: 'Rice, vegetables & fish curry', scheduledTime: new Date(y, m, d, 13, 0, 0), acknowledged: false },
          { type: 'hydration', title: 'Afternoon Hydration', detail: 'Fresh water or coconut water', scheduledTime: new Date(y, m, d, 14, 30, 0), acknowledged: false },
          { type: 'activity', title: 'Evening Courtyard Walk', detail: '15 mins walking with walking stick', scheduledTime: new Date(y, m, d, 16, 30, 0), acknowledged: false },
          { type: 'appointment', title: 'Evening Check-in Call', detail: 'Dr. Ananya Sharma check-in call', scheduledTime: new Date(y, m, d, 18, 30, 0), acknowledged: false },
          { type: 'meal', title: 'Light Dinner', detail: 'Light dinner & warm milk', scheduledTime: new Date(y, m, d, 19, 45, 0), acknowledged: false },
          { type: 'medicine', title: 'Night Metformin & Rest', detail: 'Bedtime medicine & restful sleep', scheduledTime: new Date(y, m, d, 20, 30, 0), acknowledged: false }
        ]
      }
    ];

    const ananyaPatientIds = [];
    const davidPatientIds = [];

    for (const pData of patientsData) {
      let patient = await Patient.findOne({ phoneNumber: pData.phoneNumber });
      if (!patient) {
        patient = new Patient({
          name: pData.name,
          age: pData.age,
          phoneNumber: pData.phoneNumber,
          pin: pData.pin,
          tier: pData.tier,
          language: pData.language,
          location: pData.location,
          cognitiveStage: pData.cognitiveStage,
          primaryCaregiver: pData.primaryCaregiver,
          emergencyContact: pData.emergencyContact,
          notes: pData.notes,
          medicalNotes: pData.medicalNotes,
          avatar: pData.avatar,
          caregiverId: pData.caregiverId,
          isDemoSeed: true
        });
        await patient.save();
        console.log(`✅ Created Patient: ${patient.name}`);
      } else {
        patient.pin = pData.pin;
        patient.age = pData.age;
        patient.location = pData.location;
        patient.primaryCaregiver = pData.primaryCaregiver;
        patient.emergencyContact = pData.emergencyContact;
        patient.medicalNotes = pData.medicalNotes;
        patient.notes = pData.notes;
        patient.avatar = pData.avatar;
        patient.caregiverId = pData.caregiverId;
        patient.isDemoSeed = true;
        await patient.save();
        console.log(`ℹ️ Updated Patient: ${patient.name}`);
      }

      if (pData.caregiverId.toString() === caregiverAnanya._id.toString()) {
        ananyaPatientIds.push(patient._id);
      } else if (pData.caregiverId.toString() === caregiverDavid._id.toString()) {
        davidPatientIds.push(patient._id);
      }

      // Seed 10 daily reminders
      const patientReminders = pData.reminders.map(r => ({
        ...r,
        patientId: patient._id
      }));

      await Reminder.insertMany(patientReminders);
      console.log(`✅ Seeded 10 daily reminders for ${patient.name}`);
    }

    // Assign distinct patients to each caregiver
    caregiverAnanya.patientIds = ananyaPatientIds;
    await caregiverAnanya.save();
    console.log(`✅ Assigned ${ananyaPatientIds.length} patients to Dr. Ananya Sharma`);

    caregiverDavid.patientIds = davidPatientIds;
    await caregiverDavid.save();
    console.log(`✅ Assigned ${davidPatientIds.length} patients to David Sangma`);

    // Ensure all other patients in MongoDB also have 10 standard reminders
    const allPatients = await Patient.find({});
    for (const p of allPatients) {
      const count = await Reminder.countDocuments({ patientId: p._id });
      if (count === 0) {
        await Reminder.insertMany([
          { patientId: p._id, type: 'meal', title: 'Morning Breakfast & Tea', detail: 'Healthy breakfast with warm tea', scheduledTime: new Date(y, m, d, 8, 0, 0), acknowledged: false },
          { patientId: p._id, type: 'medicine', title: 'Morning Prescription', detail: 'Donepezil 5mg & blood pressure tablets', scheduledTime: new Date(y, m, d, 8, 45, 0), acknowledged: false },
          { patientId: p._id, type: 'hydration', title: 'Mid-Morning Hydration', detail: 'Drink 1 full glass of water', scheduledTime: new Date(y, m, d, 10, 30, 0), acknowledged: false },
          { patientId: p._id, type: 'game', title: 'Memory Game of the Day', detail: '10-minute memory match activity', scheduledTime: new Date(y, m, d, 11, 30, 0), acknowledged: false },
          { patientId: p._id, type: 'meal', title: 'Nutritious Lunch', detail: 'Warm meal with vegetables & lentils', scheduledTime: new Date(y, m, d, 13, 0, 0), acknowledged: false },
          { patientId: p._id, type: 'hydration', title: 'Afternoon Hydration', detail: 'Glass of water or herbal tea', scheduledTime: new Date(y, m, d, 14, 30, 0), acknowledged: false },
          { patientId: p._id, type: 'activity', title: 'Evening Garden Walk', detail: '15 mins light stretching or walking', scheduledTime: new Date(y, m, d, 16, 30, 0), acknowledged: false },
          { patientId: p._id, type: 'appointment', title: 'Evening Caregiver Check-in', detail: 'Daily routine review with caregiver', scheduledTime: new Date(y, m, d, 18, 30, 0), acknowledged: false },
          { patientId: p._id, type: 'meal', title: 'Light Dinner', detail: 'Easily digestible dinner', scheduledTime: new Date(y, m, d, 19, 45, 0), acknowledged: false },
          { patientId: p._id, type: 'medicine', title: 'Night Medicine & Wind Down', detail: 'Bedtime prescription & rest', scheduledTime: new Date(y, m, d, 20, 30, 0), acknowledged: false }
        ]);
        console.log(`✅ Seeded 10 daily reminders for existing patient: ${p.name}`);
      }
    }

    // 4. Seed all 4 cognitive games for all patients
    const GameSession = require('./models/GameSession');
    for (const p of allPatients) {
      const existingGameTypes = await GameSession.distinct('gameType', { patientId: p._id });
      const nowMs = Date.now();

      const gameConfigs = [
        {
          gameType: 'market-day-basket',
          title: 'Market Day Basket',
          category: 'Pattern & Math Recall',
          score: 95,
          difficultyLevel: 'medium',
          duration: '2 Mins',
          offset: 15 * 60 * 1000,
          roundDetails: [
            { level: 1, itemCount: 3, mode: 'categorization', accuracy: 100, correctCount: 3, totalAttempts: 3, timeTakenSeconds: 8 },
            { level: 2, itemCount: 4, mode: 'math', accuracy: 100, correctCount: 1, totalAttempts: 1, timeTakenSeconds: 5 },
            { level: 3, itemCount: 4, mode: 'categorization', accuracy: 100, correctCount: 4, totalAttempts: 4, timeTakenSeconds: 11 },
            { level: 4, itemCount: 4, mode: 'math', accuracy: 100, correctCount: 1, totalAttempts: 1, timeTakenSeconds: 6 },
            { level: 5, itemCount: 5, mode: 'categorization', accuracy: 83, correctCount: 5, totalAttempts: 6, timeTakenSeconds: 14 }
          ]
        },
        {
          gameType: 'sound-rhythm-match',
          title: 'Sound & Rhythm Match',
          category: 'Auditory & Rhythm Recall',
          score: 90,
          difficultyLevel: 'medium',
          duration: '2 Mins',
          offset: 2 * 3600 * 1000,
          roundDetails: [
            { level: 1, itemCount: 3, mode: 'rhythm_pattern', accuracy: 100, correctCount: 3, totalAttempts: 3, timeTakenSeconds: 7 },
            { level: 2, itemCount: 3, mode: 'rhythm_pattern', accuracy: 100, correctCount: 3, totalAttempts: 3, timeTakenSeconds: 8 },
            { level: 3, itemCount: 4, mode: 'rhythm_pattern', accuracy: 100, correctCount: 4, totalAttempts: 4, timeTakenSeconds: 12 },
            { level: 4, itemCount: 4, mode: 'rhythm_pattern', accuracy: 80, correctCount: 4, totalAttempts: 5, timeTakenSeconds: 13 },
            { level: 5, itemCount: 5, mode: 'rhythm_pattern', accuracy: 100, correctCount: 5, totalAttempts: 5, timeTakenSeconds: 15 }
          ]
        },
        {
          gameType: 'faces-family-recall',
          title: 'Faces & Family Recall',
          category: 'Family & People Recall',
          score: 98,
          difficultyLevel: 'medium',
          duration: '2 Mins',
          offset: 5 * 3600 * 1000,
          roundDetails: [
            { level: 1, itemCount: 4, mode: 'family_name', accuracy: 100, correctCount: 1, totalAttempts: 1, timeTakenSeconds: 5 },
            { level: 2, itemCount: 4, mode: 'family_relation', accuracy: 100, correctCount: 1, totalAttempts: 1, timeTakenSeconds: 5 },
            { level: 3, itemCount: 4, mode: 'family_name', accuracy: 100, correctCount: 1, totalAttempts: 1, timeTakenSeconds: 6 },
            { level: 4, itemCount: 4, mode: 'family_relation', accuracy: 100, correctCount: 1, totalAttempts: 1, timeTakenSeconds: 5 },
            { level: 5, itemCount: 4, mode: 'family_name', accuracy: 100, correctCount: 1, totalAttempts: 1, timeTakenSeconds: 4 }
          ]
        },
        {
          gameType: 'daily-routine-sequencer',
          title: 'Daily Routine Sequencer',
          category: 'Sequence & Routine Recall',
          score: 92,
          difficultyLevel: 'medium',
          duration: '3 Mins',
          offset: 24 * 3600 * 1000,
          roundDetails: [
            { level: 1, itemCount: 4, mode: 'routine_ordering', accuracy: 100, correctCount: 4, totalAttempts: 4, timeTakenSeconds: 14 },
            { level: 2, itemCount: 4, mode: 'routine_ordering', accuracy: 100, correctCount: 4, totalAttempts: 4, timeTakenSeconds: 16 },
            { level: 3, itemCount: 4, mode: 'routine_ordering', accuracy: 80, correctCount: 4, totalAttempts: 5, timeTakenSeconds: 22 },
            { level: 4, itemCount: 5, mode: 'routine_ordering', accuracy: 100, correctCount: 5, totalAttempts: 5, timeTakenSeconds: 15 },
            { level: 5, itemCount: 5, mode: 'routine_ordering', accuracy: 83, correctCount: 5, totalAttempts: 6, timeTakenSeconds: 19 }
          ]
        }
      ];

      for (const g of gameConfigs) {
        if (!existingGameTypes.includes(g.gameType)) {
          await GameSession.create({
            patientId: p._id,
            gameType: g.gameType,
            title: g.title,
            category: g.category,
            score: g.score,
            difficultyLevel: g.difficultyLevel,
            duration: g.duration,
            timestamp: new Date(nowMs - g.offset),
            roundDetails: g.roundDetails
          });
          console.log(`🎮 Seeded game session [${g.title}] for ${p.name}`);
        }
      }
    }

    console.log('🎉 Seed & Clean completed successfully with all 4 cognitive games and 10 daily reminders per patient!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seed();
