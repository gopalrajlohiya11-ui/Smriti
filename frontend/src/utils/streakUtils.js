/**
 * Centralized Patient Memory & Routine Streak Calculation Utility
 * 
 * Computes consecutive days where a patient completed at least one qualifying activity:
 * - Played at least one cognitive game (GameSession recorded in MongoDB or locally)
 * - Completed scheduled reminders/routines for that day
 * - Completed the daily Game of the Day challenge
 * 
 * Rules:
 * 1. Demo-seed patients (isDemoSeed: true or default seed profiles) preserve their designed-in streak (e.g., 14 days)
 * 2. Real / newly registered patients start at 0 and genuinely increment based on consecutive days of activity
 * 3. Streak remains active if activity was performed today OR yesterday (grace period until today ends)
 */

export function formatDateKey(dateObj) {
  const d = new Date(dateObj);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates the exact streak count for a patient.
 * 
 * @param {Object} patient - The patient profile object
 * @param {Array} gameSessions - List of GameSession records from MongoDB / cache
 * @param {Array} reminders - Current reminders list (optional)
 * @returns {number} Active streak in days (0 for brand new real patients with no activity)
 */
export function calculatePatientStreak(patient, gameSessions = [], reminders = []) {
  if (!patient) return 0;

  const isDemo = patient.isDemoSeed === true || 
    ['pat-1', 'pat-2', 'pat-3'].includes(patient.id) || 
    ['pat-1', 'pat-2', 'pat-3'].includes(patient._id) ||
    ['Ramesh Sharma', 'Meera Baruah', 'Biren Das'].includes(patient.name);

  // 1. Demo Patients: Keep designed-in demo streak baseline (e.g. 14 days)
  if (isDemo) {
    const baseStreak = typeof patient.streakDays === 'number' ? patient.streakDays : 14;
    return Math.max(1, baseStreak);
  }

  // 2. Real / Live Patients: Build active dates set from all real activity sources
  const activeDates = new Set();
  const today = new Date();
  const todayKey = formatDateKey(today);

  // A. Game sessions from MongoDB / API
  if (Array.isArray(gameSessions)) {
    gameSessions.forEach(session => {
      const sessionDate = session.timestamp || session.completedAt || session.createdAt || session.date;
      if (sessionDate) {
        const key = formatDateKey(sessionDate);
        if (key) activeDates.add(key);
      }
    });
  }

  // B. Today's reminders completed in active session
  const todayRemindersList = reminders.length > 0 ? reminders : (patient.todayReminders || []);
  const hasCompletedReminderToday = Array.isArray(todayRemindersList) && todayRemindersList.some(r => r.status === 'completed' || r.acknowledged === true);
  if (hasCompletedReminderToday && todayKey) {
    activeDates.add(todayKey);
  }

  // C. Patient reminderHistory (if any past days were recorded)
  if (Array.isArray(patient.reminderHistory)) {
    patient.reminderHistory.forEach(historyItem => {
      if (historyItem.date) {
        const key = formatDateKey(historyItem.date);
        if (key) activeDates.add(key);
      }
    });
  }

  // D. Local storage Game of the Day completion flag for today
  const godKey = `smriti_god_done_${patient.id || patient._id}_${todayKey}`;
  if (typeof localStorage !== 'undefined' && localStorage.getItem(godKey) === 'true') {
    if (todayKey) activeDates.add(todayKey);
  }

  // E. Local storage game session completion flag for today
  const localGameDone = `smriti_game_done_${patient.id || patient._id}_${todayKey}`;
  if (typeof localStorage !== 'undefined' && localStorage.getItem(localGameDone) === 'true') {
    if (todayKey) activeDates.add(todayKey);
  }

  // If no qualifying activity recorded on any day, return 0
  if (activeDates.size === 0) {
    return 0;
  }

  // Calculate consecutive days backwards
  let currentStreak = 0;

  // Check if today has activity
  if (activeDates.has(todayKey)) {
    currentStreak = 1;
    // Step backwards to yesterday, day before, etc.
    let prevDaysBack = 1;
    while (true) {
      const prevDate = new Date(today);
      prevDate.setDate(today.getDate() - prevDaysBack);
      const prevKey = formatDateKey(prevDate);
      if (activeDates.has(prevKey)) {
        currentStreak += 1;
        prevDaysBack += 1;
      } else {
        break;
      }
    }
  } else {
    // If no activity yet today, check if yesterday had activity (streak still preserved today)
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = formatDateKey(yesterday);

    if (activeDates.has(yesterdayKey)) {
      currentStreak = 1;
      let prevDaysBack = 2;
      while (true) {
        const prevDate = new Date(today);
        prevDate.setDate(today.getDate() - prevDaysBack);
        const prevKey = formatDateKey(prevDate);
        if (activeDates.has(prevKey)) {
          currentStreak += 1;
          prevDaysBack += 1;
        } else {
          break;
        }
      }
    } else {
      // Missed yesterday and today -> streak is 0
      currentStreak = 0;
    }
  }

  return currentStreak;
}
