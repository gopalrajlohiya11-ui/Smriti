<div align="center">

# 🌸 Smriti (স্মৃতি)
### *Multilingual AI-Powered Cognitive Care & Memory Companion Ecosystem*

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Offline%20First-purple.svg)](https://web.dev/progressive-web-apps/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248.svg)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-Generative%20AI-8E75B2.svg)](https://deepmind.google/technologies/gemini/)
[![Meta WhatsApp](https://img.shields.io/badge/WhatsApp-Cloud%20API-25D366.svg)](https://developers.facebook.com/docs/whatsapp)
[![WebAuthn](https://img.shields.io/badge/WebAuthn-Biometrics%20FIDO2-orange.svg)](https://webauthn.io/)

<p align="center">
  <b>Smriti</b> is an intelligent, compassionate healthcare platform designed for seniors living with Alzheimer's, dementia, and age-related memory impairment. It bridges the communication gap between elderly patients, family caregivers, and clinicians through multi-modal voice guidance, offline-first PWA caching, WhatsApp routine tracking, culturally resonant cognitive games, and clinical oversight.
</p>

</div>

---

## 📑 Table of Contents

- [🌟 Core Features](#-core-features)
  - [1. Elderly-Friendly Patient Portal & Live Routines](#1-elderly-friendly-patient-portal--live-routines)
  - [2. Culturally Resonant Cognitive Games Suite](#2-culturally-resonant-cognitive-games-suite)
  - [3. Multilingual Localization & Async Web Speech Engine](#3-multilingual-localization--async-web-speech-engine)
  - [4. Clinical Caregiver & Clinician Dashboard](#4-clinical-caregiver--clinician-dashboard)
  - [5. WhatsApp AI Companion & Floating Assistant](#5-whatsapp-ai-companion--floating-assistant)
  - [6. Offline-First PWA & IndexedDB Synchronization](#6-offline-first-pwa--indexeddb-synchronization)
  - [7. Dynamic Streak Engine, WebAuthn Biometrics & Persistent Sessions](#7-dynamic-streak-engine-webauthn-biometrics--persistent-sessions)
- [🏛️ System Architecture](#️-system-architecture)
- [💻 Tech Stack](#-tech-stack)
- [🚀 Quick Start & Installation](#-quick-start--installation)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
  - [4. Seed Database](#4-seed-database)
  - [5. Run the Application](#5-run-the-application)
- [🔗 API Endpoints](#-api-endpoints)
- [📱 WhatsApp Webhook Setup](#-whatsapp-webhook-setup)
- [📂 Project Directory Structure](#-project-directory-structure)
- [🛡️ Security & Privacy](#️-security--privacy)

---

## 🌟 Core Features

### 1. Elderly-Friendly Patient Portal & Live Routines
- **Single-Column Focus Layout**: Prioritizes brain health games and immediate routines with high-contrast, large-touch interfaces tailored for seniors with low vision or motor difficulties.
- **Game of the Day Challenge**: Automatically selects a daily featured cognitive game based on day-of-year seed so patients enjoy a consistent, engaging challenge throughout the day.
- **Live-Updating Routine Horizon**: Real-time clock synchronizing the single most relevant upcoming routine with smooth dismissal animations, confetti feedback, and voice confirmations.
- **MongoDB Persistence & Offline Sync**: Routine completions ("Mark Done") persist directly to MongoDB via REST APIs and automatically queue into IndexedDB when offline.
- **Memory Bank Photo Vault**: Family photo reel with relationship tags, year labels, and 1-tap voice audio prompts for reminiscence therapy.
- **Streamlined Banner Header**: Clean greeting card with time-based greeting, location, and a dedicated `[🔊 Listen]` speech read-aloud button without visual clutter.

### 2. Culturally Resonant Cognitive Games Suite
A comprehensive suite of 5 clinically informed cognitive stimulation games tailored with North-East Indian and pan-Indian cultural contexts:

1. **Market Day Basket (বজাৰৰ পাচি / बाज़ार की टोकरी)**:
   - Pattern recognition, categorization, and basic math recall game featuring 10 verified North-East Indian produce items (*King Chilli / Bhut Jolokia, Bamboo Shoot, Assam Tea Leaves, Kaji Nemu, Tripura Pineapple, Malbhog Banana, Lai Xaak, Country Tomato, Coconut, Kath Aloo*).
   - Adaptive difficulty engine adjusting item quantities based on real-time accuracy.
   - 5-level progression system, running live score header, and celebratory transition screens.
2. **Daily Routine Sequencer (दैनिक दिनचर्या क्रम)**:
   - Executive function and logical sequencing game arranging daily living activities (making morning tea, walking in the garden, watering Tulsi plant, morning bath).
3. **Faces & Family Recall (चेहरे और परिवार की यादें)**:
   - Reminiscence therapy and facial recognition matching family members and relationships.
4. **Sound & Rhythm Match (ध्वनि और लय मिलान)**:
   - Auditory perception and memory recall recognizing traditional cultural instruments (*Dhol, Pepa flute, Temple Bell, Shankha, Mridangam*).
5. **Odd One Out (अलग पहचानें)**:
   - Visual semantic reasoning identifying items that do not belong in a cultural or functional category.

All games feature per-round cognitive telemetry logging (`POST /api/game-sessions`) for longitudinal clinical analysis.

### 3. Multilingual Localization & Async Web Speech Engine
- **Full Hindi (`hi`), Assamese (`as`) & Regional Translation**: Complete i18n localization across all game instructions, voice prompts, dashboard cards, navigation, and reminders.
- **Asynchronous Voice Cache & Fallback**: Web Speech API (`speechUtils.js`) hooks into the `voiceschanged` event to avoid empty-voice race conditions and reliably selects native `hi-IN`, `as-IN`, and `en-IN` synthetic voices.
- **Tactile Audio Guidance**: Every screen and game provides one-touch `🔊 Listen` / `सुनें` buttons for elderly users with reading difficulties.

### 4. Clinical Caregiver & Clinician Dashboard
- **Deep Slate Clinical Theme**: Healthcare SaaS interface built with Inter typography, clean statistical cards, and actionable patient rosters.
- **KPI Summary Metrics**: Adherence rates, overdue attention alerts, registered patient totals, and adherence streaks.
- **Cognitive Games Telemetry Hub (`/caregiver/patient/:id/games`)**: Detailed game session logs, score trends, and cognitive performance tracking for clinicians.
- **Real-Time Overdue Alerts (`/caregiver/notifications`)**: Dedicated view displaying unacknowledged medication and hydration routines with 1-tap patient calling and persistent database dismissals.
- **Patient Detail Records (`/caregiver/patient/:id`)**: 7-day adherence charts, 10-slot routine manager, medical notes, emergency contact overrides, and direct patient portal preview.
- **Clinician Profile & Security (`/caregiver/profile`)**: Account credentials, Google OAuth status, backup password configuration, and assigned patient roster.

### 5. WhatsApp AI Companion & Floating Assistant
- **Direct WhatsApp Deep Link**: Dedicated one-tap green circular WhatsApp shortcut opening an instant conversation with the Smriti bot (`https://wa.me/15556680031?text=Hi%20Smriti`), displayed exclusively on Patient Portal screens.
- **Gemini AI Conversational Companion**: In-app floating AI chatbot equipped with voice input, audio speech response, and compassionate dementia-aware dialogue across Patient and Caregiver dashboards.
- **Automated Cron Reminders**: Backend cron engine checks routine schedules and dispatches template reminders to patients' WhatsApp numbers.

### 6. Offline-First PWA & IndexedDB Synchronization
- **Workbox Service Worker Precache**: Serves cached application shell and assets offline, installable as a standalone PWA on mobile and desktop.
- **IndexedDB Offline Cache**: Local database layer caching patient profile records, routines, photos, and game assets.
- **Resilient Action Queue**: Queues routine completions and game scores offline, automatically syncing with MongoDB when internet connection is restored.

### 7. Dynamic Streak Engine, WebAuthn Biometrics & Persistent Sessions
- **Persistent Login Sessions**: Always-on 365-day JWT sessions for both Patients and Caregivers. Automatically skips login screens on page refresh or browser restart, persisting until explicit sign-out.
- **Session Isolation**: Independent credentials in `localStorage` allowing seamless switching between clinician and patient accounts on shared devices without session collision.
- **Dynamic Streak Calculation (`streakUtils.js`)**: Real-time consecutive activity calculation based on actual game sessions and routine completions.
- **WebAuthn FIDO2 Biometric Login**: 1-tap biometric fingerprint or Face Unlock authentication on supported hardware with skippable post-signup enrollment.
- **Accessible PIN Keypad**: 4-digit numeric keypad with tactile tap feedback and pre-populated demo shortcuts.

---

## 🏛️ System Architecture

```
                               ┌────────────────────────────────┐
                               │       Senior Patient /         │
                               │      Family Caregiver          │
                               └───────┬────────────────┬───────┘
                                       │                │
                        Web Portal (React + PWA + IDB)  WhatsApp (Meta Cloud API)
                                       │                │
                                       ▼                ▼
                        ┌────────────────────────────────────────────────┐
                        │           Express.js REST & Webhook API        │
                        │           - Auth & Google OAuth                │
                        │           - WebAuthn FIDO2 Handler             │
                        │           - Routine & Alert State Engine       │
                        │           - Game Sessions & ML Telemetry       │
                        │           - Automated Cron Scheduler           │
                        └───────┬────────────────────────┬───────────────┘
                                │                        │
                                ▼                        ▼
                        ┌───────────────┐        ┌────────────────┐
                        │  MongoDB (DB) │        │  Google Gemini │
                        │  - Patients   │        │  - NLP Reply   │
                        │  - Reminders  │        │    Parsing &   │
                        │  - GameLogs   │        │    Assistance  │
                        │  - Caregivers │        └────────────────┘
                        └───────────────┘
```

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend UI** | React 18, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti |
| **Localization** | `i18next`, `react-i18next`, Custom Async Web Speech API |
| **Offline PWA** | `vite-plugin-pwa`, Workbox, IndexedDB (`offlineDb.js`) |
| **Typography** | Inter (Google Fonts) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **AI / NLP** | Google Gemini Generative AI API |
| **Messaging** | Meta WhatsApp Business Cloud API (`wa.me`) |
| **Authentication** | JWT, Google OAuth 2.0 (`@react-oauth/google`), WebAuthn (FIDO2 Biometrics) |
| **Voice & Speech** | Web Speech Synthesis & Recognition API (Multilingual hi-IN / en-IN) |

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: `v18.x` or higher
- **MongoDB**: Local MongoDB instance running on `localhost:27017` (or MongoDB Atlas URI)
- **Git**

---

### 1. Clone Repository
```bash
git clone https://github.com/gopalrajlohiya11-ui/Smriti.git
cd Smriti
```

---

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory based on `.env.example`:
```env
MONGO_URI=mongodb://localhost:27017/SIH
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Meta WhatsApp Cloud API (Optional for WhatsApp Bot)
WHATSAPP_TOKEN=your_meta_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_verify_token

# Google Gemini AI API
GEMINI_API_KEY=your_gemini_api_key

# Test Patient Phone Number (E.164 without +)
MY_WHATSAPP_NUMBER=919435012345
```

---

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

---

### 4. Seed Database
Seed the MongoDB database with demo patients, 10 daily routines, memory photos, cognitive game sessions, and clinical alerts:
```bash
cd ../backend
node seed.js
```

---

### 5. Run the Application

In terminal 1 (Backend):
```bash
cd backend
node server.js
# Backend runs on http://localhost:5000
```

In terminal 2 (Frontend Dev Server):
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

In terminal 3 (Frontend Production PWA Preview):
```bash
cd frontend
npm run build
npm run preview
# Production PWA with full Service Worker precache runs on http://localhost:4173
```

---

## 🔗 API Endpoints

### 🩺 Caregiver Routes (`/api/caregivers`)
- `POST /api/caregivers/signup` — Register new clinician account
- `POST /api/caregivers/login` — Email & password clinician login
- `POST /api/caregivers/google-login` — Google OAuth credential exchange
- `POST /api/caregivers/set-password` — Set backup password for Google users

### 👴 Patient Routes (`/api/patients`)
- `GET /api/patients` — List assigned patient profiles (Caregiver scoped)
- `GET /api/patients/public/default` — Fetch default patient profile for patient portal
- `GET /api/patients/public/:id` — Fetch specific patient profile
- `POST /api/patients` — Enroll new patient record
- `POST /api/patients/login` — Patient name & PIN authentication
- `POST /api/patients/biometric-login` — WebAuthn FIDO2 authentication
- `GET /api/patients/:id/reminders` — Fetch daily routines for a patient
- `GET /api/patients/:id/photos` — Fetch Memory Bank photo album
- `PATCH /api/patients/:id` — Update patient vitals & clinical notes
- `DELETE /api/patients/:id` — Remove patient record

### ⏰ Reminder & Alert Routes (`/api/reminders`)
- `GET /api/reminders/alerts` — Fetch live overdue alerts across assigned patients
- `GET /api/reminders/:patientId` — Fetch all routines for a patient
- `PATCH /api/reminders/:id` — Toggle routine completion state (persists to MongoDB)
- `PATCH /api/reminders/:id/dismiss` — Dismiss overdue alert (Caregiver side)

### 🎮 Game Sessions & ML Telemetry (`/api/game-sessions`)
- `POST /api/game-sessions` — Record game session score and per-level cognitive telemetry
- `GET /api/game-sessions/patient/:patientId` — Retrieve cognitive performance history

---

## 📱 WhatsApp Webhook Setup

1. Forward local port `5000` via ngrok:
   ```bash
   ngrok http 5000
   ```
2. Configure your Meta App Webhook Callback URL:
   ```
   https://<your-ngrok-subdomain>.ngrok-free.app/api/whatsapp
   ```
3. Set your **Verify Token** matching `WHATSAPP_VERIFY_TOKEN` in your `.env`.
4. Subscribe to the `messages` webhook field.

---

## 📂 Project Directory Structure

```
Smriti/
├── backend/
│   ├── jobs/
│   │   └── reminderCron.js         # Automated reminder scheduler
│   ├── middleware/
│   │   └── auth.js                 # JWT, WebAuthn & optionalAuth middleware
│   ├── models/
│   │   ├── Caregiver.js            # Clinician & caregiver schema
│   │   ├── GameSession.js          # Cognitive game sessions & round telemetry
│   │   ├── MemoryBankPhoto.js      # Reminiscence photo album schema
│   │   ├── patient.js              # Senior patient profile schema
│   │   └── Reminder.js             # Daily routine & alert schema
│   ├── routes/
│   │   ├── caregiverRoutes.js      # Auth & clinician management
│   │   ├── gameSessionRoutes.js    # Game sessions & cognitive ML logs
│   │   ├── patientRoutes.js        # Patient CRUD, photos & biometrics
│   │   ├── reminderRoutes.js       # Live database alerts & routines
│   │   └── whatsappWebhook.js      # WhatsApp inbound/outbound bot
│   ├── .env.example
│   ├── seed.js                     # Full MongoDB demo database seeder
│   └── server.js                   # Express server entry point
├── frontend/
│   ├── public/
│   │   └── favicon.svg             # PWA app icon
│   ├── src/
│   │   ├── components/
│   │   │   ├── caregiver/
│   │   │   │   └── CaregiverLayout.jsx      # Clinical sidebar layout
│   │   │   ├── common/
│   │   │   │   └── VoiceGuidanceButton.jsx  # Accessible text-to-speech button
│   │   │   ├── patient/
│   │   │   │   ├── PatientChatbot.jsx       # Floating Gemini AI conversational bot
│   │   │   │   └── PatientNavShell.jsx      # Navigation dock with WhatsApp shortcut
│   │   │   ├── ErrorBoundary.jsx            # Resilient React error boundary
│   │   │   ├── FoxtailOrchidIcon.jsx        # Cultural brand icon (Kopou Phool)
│   │   │   └── Navbar.jsx
│   │   ├── context/
│   │   │   └── AppContext.jsx          # Global state, offline queue & MongoDB sync
│   │   ├── data/
│   │   │   └── mockData.js             # Fallback data, game catalogue & regional languages
│   │   ├── locales/
│   │   │   └── hi.json                 # Comprehensive Hindi translation dictionary
│   │   ├── pages/
│   │   │   ├── caregiver/
│   │   │   │   ├── CaregiverCognitiveGames.jsx # Cognitive games telemetry report
│   │   │   │   ├── CaregiverDashboard.jsx      # Patient roster directory
│   │   │   │   ├── CaregiverNotifications.jsx  # Dedicated alerts page
│   │   │   │   ├── CaregiverPatientDetail.jsx  # 7-day adherence & routines
│   │   │   │   └── CaregiverProfile.jsx        # Clinician account & security
│   │   │   └── patient/
│   │   │       ├── games/
│   │   │       │   ├── DailyRoutineSequencer.jsx # ADL step sequencing
│   │   │       │   ├── FacesFamilyRecall.jsx     # Family facial reminiscence
│   │   │       │   ├── MarketDayBasket.jsx       # NER Produce & Math recall game
│   │   │       │   ├── OddOneOut.jsx             # Visual anomaly recognition
│   │   │       │   └── SoundRhythmMatch.jsx      # Traditional instrument sounds
│   │   │       ├── PatientAllGames.jsx         # Full 5-game library hub
│   │   │       ├── PatientDashboard.jsx        # Single-column game-first portal
│   │   │       ├── PatientFamily.jsx           # Reminiscence photo gallery
│   │   │       ├── PatientLogin.jsx            # Unified login & PIN keypad
│   │   │       ├── PatientProfile.jsx          # Patient vitals & streak tracking
│   │   │       └── PatientReminders.jsx        # Full routine schedule
│   │   ├── services/
│   │   │   └── api.js                  # REST client for backend endpoints
│   │   ├── utils/
│   │   │   ├── offlineDb.js            # IndexedDB offline store & action queue
│   │   │   ├── speechUtils.js          # Async Web Speech API localization
│   │   │   └── streakUtils.js          # Unified dynamic streak calculator
│   │   ├── App.jsx                     # Route definitions
│   │   ├── i18n.js                     # Multilingual localization config
│   │   ├── index.css                   # Inter font & design tokens
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js                  # PWA plugin configuration & SW caching
├── .gitignore
└── README.md
```

---

## 🛡️ Security & Privacy

- **Data Privacy**: Patient routines and health logs are stored securely in MongoDB and accessed through role-scoped tokens.
- **Biometric Security**: WebAuthn keys use standard public-key cryptography — biometric credentials never leave the user's secure hardware enclave.
- **Offline Integrity**: Queued offline actions are validated before being merged into MongoDB upon reconnection.
- **HIPAA / Senior Care Alignment**: High-contrast, transparent patient records with emergency contact calling.

---

<div align="center">
  <b>🌸 Smriti — Preserving Memories, Empowering Caregivers.</b>
</div>
