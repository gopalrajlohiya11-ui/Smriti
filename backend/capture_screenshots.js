const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve(__dirname, '..', 'docs', 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const pagesToCapture = [
  {
    name: '01_patient_login.png',
    path: '/patient/login',
    title: 'Senior Patient Tactile PIN & Biometric Login'
  },
  {
    name: '02_patient_dashboard.png',
    path: '/patient',
    title: 'Senior Patient Horizon Dashboard & Northeast State Header'
  },
  {
    name: '03_patient_reminders.png',
    path: '/patient/reminders',
    title: 'Chronological Daily Routine & Medication Schedule'
  },
  {
    name: '04_patient_games_suite.png',
    path: '/patient/games',
    title: 'Culturally Attuned Cognitive Games Suite Hub'
  },
  {
    name: '05_game_market_day_basket.png',
    path: '/patient/games/market-day-basket',
    title: 'Market Day Basket (বজাৰৰ পাচি) Cognitive Game'
  },
  {
    name: '06_game_daily_routine_sequencer.png',
    path: '/patient/games/daily-routine-sequencer',
    title: 'Daily Routine Sequencer (दैनिक दिनचर्या) Game'
  },
  {
    name: '07_game_faces_family_recall.png',
    path: '/patient/games/faces-family-recall',
    title: 'Faces & Family Recall (चेहरे और यादें) Reminiscence Game'
  },
  {
    name: '08_game_sound_rhythm_match.png',
    path: '/patient/games/sound-rhythm-match',
    title: 'Sound & Rhythm Match (ध्वनि और लय) Auditory Game'
  },
  {
    name: '09_game_odd_one_out.png',
    path: '/patient/games/odd-one-out',
    title: 'Odd One Out (अलग पहचानें) Semantic Discrimination Game'
  },
  {
    name: '10_patient_family_vault.png',
    path: '/patient/family',
    title: 'Family Reminiscence Memory Bank & Photo Vault'
  },
  {
    name: '11_patient_profile.png',
    path: '/patient/profile',
    title: 'Senior Patient Clinical Profile & Emergency Vitals'
  },
  {
    name: '12_caregiver_login.png',
    path: '/caregiver/login',
    title: 'Caregiver & Clinician Authentication Portal'
  },
  {
    name: '13_caregiver_dashboard.png',
    path: '/caregiver',
    title: 'Caregiver Command Center & Patient Roster Overview'
  },
  {
    name: '14_caregiver_patient_detail.png',
    path: '/caregiver/patient/pat-1',
    title: 'Caregiver Patient Clinical Dossier & AI Cognitive Telemetry'
  },
  {
    name: '15_caregiver_cognitive_games.png',
    path: '/caregiver/patient/pat-1/games',
    title: 'Caregiver Granular Game Playthroughs & Level Telemetry'
  },
  {
    name: '16_caregiver_notifications.png',
    path: '/caregiver/notifications',
    title: 'Clinical Red Flag Alerts & Suggested Actions Center'
  },
  {
    name: '17_caregiver_profile.png',
    path: '/caregiver/profile',
    title: 'Caregiver Settings & DPDP Act Data Governance'
  },
  {
    name: '18_privacy_policy.png',
    path: '/privacy-policy',
    title: 'DPDP Act 2023 Audited Privacy & Consent Policy'
  }
];

async function captureAll() {
  console.log('🚀 Launching headless Chrome from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  // Pre-seed local storage with default demo context
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.setItem('smriti_active_patient_id', 'pat-1');
    localStorage.setItem('smriti_patient_state', 'assam');
    localStorage.setItem('smriti_caregiver_logged_in', 'true');
    localStorage.setItem('smriti_caregiver_user', JSON.stringify({
      id: 'cg-1',
      name: 'Dr. Ananya Baruah',
      email: 'ananya.baruah@gmch.gov.in',
      role: 'Family Physician & Neurologist',
      clinic: 'GMCH Cognitive Care Unit, Guwahati'
    }));
  });

  for (const item of pagesToCapture) {
    const url = `http://localhost:5173${item.path}`;
    const dest = path.join(OUTPUT_DIR, item.name);
    console.log(`📸 Capturing [${item.title}] -> ${item.path}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      // Short stabilization delay for animations and charts
      await new Promise(r => setTimeout(r, 1200));
      await page.screenshot({ path: dest, fullPage: false });
      console.log(`   ✓ Saved: ${item.name}`);
    } catch (err) {
      console.error(`   ❌ Failed ${item.path}:`, err.message);
    }
  }

  await browser.close();
  console.log(`\n🎉 All screenshots saved successfully to: ${OUTPUT_DIR}`);
}

captureAll().catch(err => {
  console.error('Fatal error during capture:', err);
  process.exit(1);
});
