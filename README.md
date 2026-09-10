# Smriti (স্মৃতি / स्मृति) — AI-Powered Cognitive Care Platform

This repository contains the full source code for **Smriti**, our submission for **Smart India Hackathon 2026 (SIH26003)**.

## 1. Project Information

- **Project Title:** Smriti — AI-Based Cognitive Gaming and Memory Assistance Platform for Elderly Dementia Patients
- **PS ID:** SIH26003
- **PS Title:** AI-Based Cognitive Gaming and Memory Assistance Platform for Elderly Dementia Patients in North Eastern Region (NER)
- **Category:** Software
- **Theme:** MedTech / BioTech / HealthTech
- **Nodal Ministry:** Ministry of Development of North Eastern Region (MDoNER)
- **Team Name:** Design Divas

---

## 2. Problem Statement

Over **8.8 million Indians** live with dementia (2026), with **280,000–350,000 cases** concentrated in India's 8 North-Eastern states. The NER faces a uniquely severe crisis:

- **85%+ of neurologists** operate exclusively out of Guwahati, leaving rural hill-state patients with near-zero specialist access.
- **Mountainous terrain and monsoon floods** sever physical access to healthcare. 2G/3G internet causes cloud-dependent apps to crash mid-session.
- **220+ indigenous dialects** (Assamese, Bodo, Khasi, Mizo) make standard Western cognitive tests medically invalid for NER demographics.
- **Cultural stigma** causes over 90% of families to dismiss early memory loss as normal aging (*"বুঢ়া বয়সৰ পাহৰণি"*), resulting in diagnosis only at advanced Stage 3 or 4.
- **No existing app** offers offline-first operation, multilingual Assamese voice guidance, and culturally grounded cognitive exercises for NER elderly patients.

---

## 3. Proposed Solution

**Smriti** is an evidence-based, culturally grounded cognitive care platform that bridges elderly dementia patients, family caregivers, and clinicians through three tiers:

- **Tier 1 (Core):** Offline-first PWA + Meta WhatsApp AI companion bot — accessible on any smartphone, even 2G.
- **Tier 2 (Fallback):** IVR automated voice calls and SMS alerts for feature phones without internet.
- **Tier 3 (Field Care):** ASHA worker tablet mode with local sync for door-to-door community screening.

The platform delivers:
1. **5 culturally attuned cognitive games** targeting distinct neuroanatomical pathways using authentic NER assets (Kaji Nemu, Bhut Jolokia, Assamese Dhol, Pepa horn, Mekhela patterns).
2. **Multilingual voice guidance** in Assamese (`as-IN`), Hindi (`hi-IN`), and English — with Google Gemini AI conversational companion.
3. **Meta WhatsApp Cloud API bot** for automated medication reminders and bidirectional patient check-ins, requiring zero new app learning curve.
4. **Live Machine Learning microservice** (Python + FastAPI on Render) for real-time adaptive game difficulty and longitudinal cognitive health scoring (0–100).
5. **Clinical Caregiver Dashboard** with 7-day adherence charts, red-flag overdue medication alerts, and exportable cognitive telemetry.
6. **100% offline-first PWA** (Workbox + IndexedDB) — full functionality during complete internet outages.
7. **WebAuthn FIDO2 biometrics** — hardware fingerprint/face login without passwords, compliant with DPDP Act 2023.

---

## 4. Key Features

- Tactile 4-digit PIN login + WebAuthn FIDO2 hardware biometric authentication (fingerprint / face)
- Horizon Routines — chronological daily schedule with audio read-aloud and 1-tap completion
- 5 active cognitive games: Market Day Basket, Daily Routine Sequencer, Faces & Family Recall, Sound & Rhythm Match, Odd One Out
- Google Gemini AI multimodal conversational assistant (text + voice, patient-context-aware)
- Meta WhatsApp bot — automated bilingual reminders and bidirectional sync
- Live ML engine — adaptive difficulty + cognitive health score + clinical status label
- Family Memory Bank — photo reminiscence vault with DPDP consent trails
- Clinical Caregiver Hub — real-time patient roster, red-flag alerts, deep telemetry dashboards
- 100% offline-first PWA — service worker caching + IndexedDB queue + auto background sync
- DPDP Act 2023 compliant — consent checkboxes, 30-day right to erasure, zero raw biometric storage
- 6 roadmap cognitive games (Village Path Navigator, Spice & Herb Sorter, Proverb Completer, Tea Estate Planner, Mekhela Pattern Match, Festival Calendar)

---

## 5. Technology Stack

- **Frontend:** React 19.2, Vite 8.2, React Router v7, Tailwind CSS v4, Lucide React, i18next, Recharts
- **Offline PWA:** `vite-plugin-pwa`, Workbox Service Worker, IndexedDB (`idb`)
- **Voice & Speech:** Web Speech Synthesis API — Assamese, Hindi, English
- **Generative AI:** Google Gemini AI SDK (`@google/genai`) — multimodal text + voice
- **Machine Learning:** Python, Scikit-Learn, FastAPI — hosted on Render Cloud
- **Backend API:** Node.js, Express.js, Mongoose ODM, Node-Cron, bcrypt, JWT
- **Database:** MongoDB Atlas Cloud
- **APIs:** Meta WhatsApp Business Cloud API, Google OAuth 2.0, Bhashini API (regional language TTS)
- **Security & Auth:** WebAuthn FIDO2, bcrypt PIN hashing, DPDP Act 2023 compliance
- **Deployment:** Vercel (Frontend) · Render (Backend & ML Engine) · MongoDB Atlas (Database)

---

## 6. Architecture

```text
                         ┌────────────────────────────────────┐
                         │    Senior Patient / Family Caregiver│
                         └──────────┬──────────────┬──────────┘
                                    │              │
               React 19 PWA (Offline-First + IDB)  WhatsApp (Meta Cloud API)
                                    │              │
                                    ▼              ▼
                         ┌──────────────────────────────────────────┐
                         │         Express.js REST & Webhook API     │
                         │  - JWT & WebAuthn FIDO2 Auth              │
                         │  - Dynamic Routine & Alert Engine         │
                         │  - Cognitive Telemetry Logging            │
                         │  - ML Service Proxy & Fallback Wrapper    │
                         │  - Node-Cron Reminder Scheduler           │
                         └────────┬───────────────┬──────────────┬──┘
                                  │               │              │
                                  ▼               ▼              ▼
                         ┌────────────────┐ ┌──────────────┐ ┌──────────────────┐
                         │  MongoDB Atlas │ │ Google Gemini│ │  ML Engine (AI)  │
                         │ - Patients     │ │ - Generative │ │ - Adaptive Diff. │
                         │ - Reminders    │ │   Companion  │ │ - Health Score   │
                         │ - GameSessions │ │ - Voice Audio│ │ (Render Cloud)   │
                         │ - Caregivers   │ └──────────────┘ └──────────────────┘
                         └────────────────┘
```

---

## 7. Repository Structure

```text
Smriti/
├── README.md
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── patient/          # Patient portal + 5 cognitive games
│   │   │   └── caregiver/        # Caregiver dashboard + telemetry
│   │   ├── services/             # API service layer (api.js)
│   │   ├── context/              # Auth & patient context providers
│   │   └── utils/                # speechUtils, gameHelpers
│   ├── index.html
│   └── vite.config.js
├── backend/
│   ├── server.js                 # Express entry point + keep-alive pinger
│   ├── routes/                   # patientRoutes, caregiverRoutes, gameRoutes
│   ├── models/                   # Mongoose schemas (Patient, Caregiver, GameSession)
│   ├── services/                 # mlService.js, translationService.js
│   ├── jobs/                     # reminderCron.js (Node-Cron scheduler)
│   └── middleware/               # JWT auth, rate limiting
└── docs/
    └── screenshots/              # UI gallery screenshots
```

---

## 8. Final Presentation

The project presentation (PPT) is available on Google Drive (access: Anyone with the link — Viewer).

[View Presentation on Google Drive](https://docs.google.com/file/d/1ZMWVouCgjB8nl_J1NueILKSQ3ZTZmB5A/view)

---

## 9. Demo Video

A full product walkthrough demo video is available on YouTube.

[Watch Demo Video on YouTube](https://youtu.be/TTV7cAvSF-s)

---

## 10. Screenshots / Prototype Photos

### 👴 Patient Portal — Login & Dashboard

| **Tactile PIN & Biometric Login** | **Horizon Dashboard** |
|:---:|:---:|
| ![Patient Login](docs/screenshots/01_patient_login.png) | ![Patient Dashboard](docs/screenshots/02_patient_dashboard.png) |
| *Tactile 4-digit PIN with audio feedback and WebAuthn FIDO2 biometrics* | *Time-aware greeting, regional state horizon banner, and spotlight routine* |

| **Chronological Routine Schedule** | **Family Reminiscence Memory Vault** |
|:---:|:---:|
| ![Patient Reminders](docs/screenshots/03_patient_reminders.png) | ![Memory Bank](docs/screenshots/10_patient_family_vault.png) |
| *Morning-to-night care schedule with audio read-aloud and 1-tap checks* | *Photo reminiscence gallery for facial recall and kinship memory preservation* |

| **Patient Profile & Emergency Info** | **DPDP Act 2023 Privacy Policy** |
|:---:|:---:|
| ![Patient Profile](docs/screenshots/11_patient_profile.png) | ![Privacy Policy](docs/screenshots/18_privacy_policy.png) |
| *Emergency doctor/caregiver dialers, blood group, and regional language toggles* | *Comprehensive legal compliance with DPDP Act 2023, consent trails, and rights* |

---

### 🎮 Cognitive Games Suite

| **Games Suite Hub** | **Market Day Basket (বজাৰৰ পাচি)** |
|:---:|:---:|
| ![Games Suite](docs/screenshots/04_patient_games_suite.png) | ![Market Day Basket](docs/screenshots/05_game_market_day_basket.png) |
| *Central game launcher with streak tracking and category tabs* | *Working memory recall of regional produce (Kaji Nemu, Bhut Jolokia, Bamboo Shoot)* |

| **Daily Routine Sequencer (दैनिक दिनचर्या)** | **Faces & Family Recall (चेहरे और यादें)** |
|:---:|:---:|
| ![Routine Sequencer](docs/screenshots/06_game_daily_routine_sequencer.png) | ![Faces Recall](docs/screenshots/07_game_faces_family_recall.png) |
| *Executive function training sequencing familiar morning-to-night routines* | *Fusiform gyrus stimulation matching real family photos and kin relationships* |

| **Sound & Rhythm Match (ध्वनि और लय)** | **Odd One Out (अलग पहचानें)** |
|:---:|:---:|
| ![Sound Match](docs/screenshots/08_game_sound_rhythm_match.png) | ![Odd One Out](docs/screenshots/09_game_odd_one_out.png) |
| *Auditory attention recognizing indigenous instruments (Dhol, Pepa, Shankha)* | *Semantic categorization identifying botanical and culinary anomalies* |

---

### 🩺 Caregiver & Clinician Dashboard

| **Caregiver Login** | **Command Center & Patient Roster** |
|:---:|:---:|
| ![Caregiver Login](docs/screenshots/12_caregiver_login.png) | ![Caregiver Dashboard](docs/screenshots/13_caregiver_dashboard.png) |
| *Secure email/password, Google OAuth, and WebAuthn clinician biometric login* | *Real-time patient roster with clinical status tags and adherence metrics* |

| **Patient Clinical Dossier & Telemetry** | **Cognitive Games Telemetry** |
|:---:|:---:|
| ![Patient Detail](docs/screenshots/14_caregiver_patient_detail.png) | ![Game Telemetry](docs/screenshots/15_caregiver_cognitive_games.png) |
| *AI Cognitive Health scoring, 7-day adherence charts, and top-3 routine overview* | *Round-by-round precision, reaction time distributions, and level history* |

| **Red Flag Alerts & Action Center** | **Caregiver Settings & Profile** |
|:---:|:---:|
| ![Caregiver Notifications](docs/screenshots/16_caregiver_notifications.png) | ![Caregiver Profile](docs/screenshots/17_caregiver_profile.png) |
| *Real-time alerts for missed critical medications with 1-tap telephone dialer* | *Profile management, notification preferences, and 30-day data erasure controls* |

---

## 11. Installation

```bash
git clone https://github.com/gopalrajlohiya11-ui/Smriti.git
cd Smriti

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/Smriti
JWT_SECRET=your_jwt_super_secret_key_here
GEMINI_API_KEY=your_google_gemini_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
WHATSAPP_TOKEN=your_meta_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_verify_token
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

---

## 12. Run

```bash
# Terminal 1 — Backend (from /backend)
node seed.js    # Seed demo data (first time only)
npm start       # Starts backend on http://localhost:5000

# Terminal 2 — Frontend (from /frontend)
npm run dev     # Starts frontend on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

Live deployments:

| Service | URL |
|---|---|
| **Live Web App** | [smriti-puce.vercel.app](https://smriti-puce.vercel.app) |
| **Backend API** | [smriti-backend-nwrl.onrender.com](https://smriti-backend-nwrl.onrender.com/api/health) |
| **Live ML Engine** | [dementia-ai-engine.onrender.com](https://dementia-ai-engine.onrender.com/docs) |
| **ML Engine Source** | [github.com/adityaraichauhan/Dementia-AI-engine](https://github.com/adityaraichauhan/Dementia-AI-engine) |
| **WhatsApp Bot** | [wa.me/15556680031](https://wa.me/15556680031?text=Hi%20Smriti) |

---

## 13. Future Scope

- **Government Tele-MANAS Integration:** Direct two-way routing into the National Tele-MANAS (14416) helpline network for automatic specialist referrals from remote NER districts.
- **ASHA & Frontline Worker Tablet Suite:** Simplified offline screening toolkit for ASHA / Anganwadi workers with vernacular voice prompts in Bodo, Khasi, Garo, Mizo, Meitei, and Nagamese.
- **Acoustic Speech Biomarker Analysis:** Integration of openSMILE acoustic feature extraction (pitch jitter, shimmer, hesitation pauses) into the Gemini voice engine to detect micro-cognitive decline from speech patterns.
- **Wearable PPG & Vascular Risk Telemetry:** Bluetooth integration with low-cost smart bands for continuous heart rate, blood pressure, and sleep architecture monitoring to manage Vascular Dementia risks proactively.
- **6 Additional Cognitive Games:** Village Path Navigator, Spice & Herb Sorter, Proverb Completer, Tea Estate Planner, Mekhela Pattern Match, and Festival Calendar — all targeting additional neuroanatomical pathways.
- **Multi-Centric ICMR Clinical Validation:** Randomized controlled trials across 500+ NER patients measuring 12-month CST cognitive preservation metrics against CDR and HMSE benchmarks.

---

## Team

**Team Design Divas** — Smart India Hackathon 2026 | PS ID: SIH26003 | Branch: ITNS, NSUT

| # | Name | Role | Email |
|---|---|---|---|
| 1 | **Gopal Raj Lohiya** *(Team Leader)* | Full Stack Developer | gopal.lohiya.ug25@nsut.ac.in |
| 2 | **Aditya Rai Chauhan** | ML Engineer | aditya.chauhan.ug25@nsut.ac.in |
| 3 | **Mahir Kumar** | Backend Developer | mahir.kumar.ug25@nsut.ac.in |
| 4 | **Hitarth Garg** | Frontend Developer | hitarth.garg.ug25@nsut.ac.in |
| 5 | **Mehak** | UI/UX Designer | mehak-ug25@nsut.ac.in |
| 6 | **Diya Gautam** | Research & Content | diya.gautam.ug25@nsut.ac.in |

Special thanks to the clinical research teams at **LASI-DAD**, **ARDSI**, **NIMHANS**, **SCARF India**, and the **Ministry of DoNER** for their published epidemiological data and clinical guidance on dementia care in the North-Eastern Region.

---

*🌸 Smriti (স্মৃতি / स्मृति) — Preserving Memories, Empowering Caregivers, Culturally Grounded.*
