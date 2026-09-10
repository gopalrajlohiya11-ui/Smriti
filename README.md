<div align="center">

# 🌸 Smriti (স্মৃতি / स्मृति)
### *AI-Powered Cognitive Care & Memory Companion Ecosystem for Elderly Dementia Patients*
#### **Smart India Hackathon (SIH26003) • Ministry of Development of North Eastern Region (MDoNER)**

[![Live Web App](https://img.shields.io/badge/Live%20App-smriti--puce.vercel.app-B5502E.svg?style=for-the-badge&logo=vercel)](https://smriti-puce.vercel.app)
[![ML Engine](https://img.shields.io/badge/Live%20ML%20Engine-dementia--ai--engine.onrender.com-FF6B6B.svg?style=for-the-badge&logo=render)](https://dementia-ai-engine.onrender.com)
[![WhatsApp Bot](https://img.shields.io/badge/WhatsApp%20Bot-wa.me%2F15556680031-25D366.svg?style=for-the-badge&logo=whatsapp)](https://wa.me/15556680031?text=Hi%20Smriti)

<br/>

[![React 19](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-v4.3-38bdf8.svg)](https://tailwindcss.com/)
[![PWA Offline-First](https://img.shields.io/badge/PWA-Workbox%20%2B%20IndexedDB-purple.svg)](https://web.dev/progressive-web-apps/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas%20Cloud-47A248.svg)](https://www.mongodb.com/)
[![Google Gemini AI](https://img.shields.io/badge/Google%20Gemini-Multimodal%20AI-8E75B2.svg)](https://deepmind.google/technologies/gemini/)
[![DPDP Act 2023](https://img.shields.io/badge/DPDP%20Act%202023-Audited%20%26%20Compliant-success.svg)](https://smriti-puce.vercel.app/privacy-policy)
[![WebAuthn FIDO2](https://img.shields.io/badge/WebAuthn-FIDO2%20Biometrics-orange.svg)](https://webauthn.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<p align="center">
  <b>Smriti</b> is an evidence-based, culturally grounded cognitive care platform engineered specifically to address the acute dementia crisis in India’s <b>North-Eastern Region (NER)</b> and rural communities. Bridging elderly patients, family caregivers, and clinicians, Smriti unites an <b>offline-first PWA</b>, <b>5 culturally attuned cognitive games</b>, <b>multilingual Web Speech synthesis</b> (Assamese, Hindi, English), <b>Google Gemini AI dialogue</b>, a <b>Meta WhatsApp Cloud API companion bot</b>, and a <b>live Machine Learning telemetry engine</b> on Render.
</p>

</div>

---



1. Project Information

* **Project Title:** Smriti – Cognitive Care Companion
* **PS ID:** 26003
* **PS Title:** AI-Based Cognitive Gaming and Memory Assistance Platform for Elderly Dementia Patients in North Eastern Region (NER)
* **Category:** Software
* **Theme:** MedTech / Healthcare

2. Problem Statement

Elderly patients in the rural North-Eastern Region (NER) suffering from cognitive decline and dementia lack access to dedicated neurological care, creating a "Neurology Desert." Furthermore, these patients face severe barriers including a lack of digital literacy, poor internet connectivity, and the absence of full-time, tech-savvy family caregivers. Existing Western medical apps do not support local tribal dialects, rely on culturally alien concepts, and fail to operate reliably in low-network mountainous zones.

## 3. Proposed Solution

Smriti is an offline-first, culturally attuned Progressive Web App (PWA) that delivers gamified cognitive therapy directly to elderly patients. To overcome digital literacy and caregiver absence, the app features an "ASHA Kiosk Mode" allowing community health workers to administer tests on their weekly rounds. It utilizes a hybrid multilingual UI powered by direct Bhashini Base64 audio streaming to support deep tribal dialects without relying on OS voice packs. An AI adaptive engine tracks reaction times and dynamically adjusts game difficulty, syncing clinical telemetry to a remote caregiver dashboard once network connectivity is restored.

## 4. Key Features
**Culturally Attuned Cognitive Games:** Exercises utilizing local NER assets (e.g., Market Day Basket, Routine Sequencer, Family Recall).
* **100% Offline-First PWA:** Full functionality in zero-connectivity zones using IndexedDB and Workbox.
* **Hybrid Multilingual UI:** Native UI translation for Assamese/Bengali, and direct Base64 Bhashini audio streaming for dialects like Manipuri, Khasi, and Mizo.
* **ASHA Kiosk Mode:** Zero-caretaker dependency interface designed for community health workers.
* **Dual-Layer AI Adaptive Care:** In-game real-time difficulty adjustment and cross-session ML predictive scaling.
* **Meta WhatsApp Cloud API Bot:** Automated reminders and bidirectional conversational logging.
* **Fail-Safe Resilience:** Automatic 6-second fallback to native OS voice synthesis if external ML APIs time out.

## 📑 Table of Contents

1. [📸 Visual Walkthrough & Interface Gallery](#-visual-walkthrough--interface-gallery)
   - [Senior Patient Experience & Regional Themes](#-senior-patient-experience--regional-themes)
   - [Culturally Attuned Cognitive Games Suite (5 Clinical CST Domains)](#-culturally-attuned-cognitive-games-suite-5-clinical-cst-domains)
   - [Clinical Caregiver & Neurologist Command Hub](#-clinical-caregiver--neurologist-command-hub)
   - [Security, Privacy & DPDP Compliance](#-security-privacy--dpdp-compliance)

2. [🌸 The Smriti Solution: Complete Architecture & Core Pillars](#-the-smriti-solution-complete-architecture--core-pillars)
   - [1. Senior-Centric Patient Portal & Horizon Routines](#1-senior-centric-patient-portal--horizon-routines)
   - [2. Culturally Attuned Cognitive Games Suite](#2-culturally-attuned-cognitive-games-suite)
   - [3. Multimodal Voice Guidance & Google Gemini AI Assistant](#3-multimodal-voice-guidance--google-gemini-ai-assistant)
   - [4. Meta WhatsApp Bot & Automated Routine Engine](#4-meta-whatsapp-bot--automated-routine-engine)
   - [5. Clinical Caregiver Hub & Real-Time Red Flag Alerts](#5-clinical-caregiver-hub--real-time-red-flag-alerts)
   - [6. Live Machine Learning Microservice (`dementia-ai-engine.onrender.com`)](#6-live-machine-learning-microservice)
   - [7. 100% Offline-First PWA Architecture (Workbox + IndexedDB)](#7-100-offline-first-pwa-architecture)
   - [8. Hardware-Level WebAuthn FIDO2 Biometrics & DPDP Act 2023 Compliance](#8-hardware-level-webauthn-fido2-biometrics--dpdp-act-2023-compliance)
3. [🏛️ High-Level System Architecture](#️-high-level-system-architecture)
4. [💻 Complete Technology Stack](#-complete-technology-stack)
5. [🚀 Quick Start & Local Setup](#-quick-start--local-setup)
6. [☁️ Cloud Deployment Guide (Vercel & Render)](#️-cloud-deployment-guide-vercel--render)
7. [🔗 Complete REST API Reference](#-complete-rest-api-reference)
8. [📱 Meta WhatsApp Cloud API Setup](#-meta-whatsapp-cloud-api-setup)
9. [🔮 Future Scope & Long-Term Product Roadmap](#-future-scope--long-term-product-roadmap)
10. [🛡️ Privacy, Ethics & DPDP 2023 Compliance](#️-privacy-ethics--dpdp-2023-compliance)
11. [👥 Team & Acknowledgements](#-team--acknowledgements)

---

## 📸 Visual Walkthrough & Interface Gallery

### 👴 Senior Patient Experience & Regional Themes
Designed for elderly accessibility with warm, soothing tones (`#FAF7F2`), high-contrast typography, large touch targets (min 56px), and personalized North-Eastern Indian state heritage.

| **Tactile PIN & Biometric Login** | **Horizon Dashboard & State Horizon** |
|:---:|:---:|
| <img src="docs/screenshots/01_patient_login.png" alt="Patient Login" width="100%"/> | <img src="docs/screenshots/02_patient_dashboard.png" alt="Patient Dashboard" width="100%"/> |
| *Tactile 4-digit PIN with audio feedback and WebAuthn FIDO2 biometrics* | *Time-aware greeting, regional state horizon banner, and spotlight routine* |

| **Chronological Routine Schedule** | **Family Reminiscence Memory Vault** |
|:---:|:---:|
| <img src="docs/screenshots/03_patient_reminders.png" alt="Patient Reminders" width="100%"/> | <img src="docs/screenshots/10_patient_family_vault.png" alt="Memory Bank" width="100%"/> |
| *Morning-to-night care schedule with audio read-aloud and 1-tap checks* | *Photo reminiscence gallery for facial recall and kinship memory preservation* |

---

### 🎮 Culturally Attuned Cognitive Games Suite (Active CST + 6 Roadmap Therapies)
Evidence-based digital Cognitive Stimulation Therapy (CST) targeting specific neuroanatomical pathways using authentic North-Eastern Indian cultural assets.

| **Cognitive Games Suite Hub** | **Market Day Basket (বজাৰৰ পাচি)** |
|:---:|:---:|
| <img src="docs/screenshots/04_patient_games_suite.png" alt="Games Suite Hub" width="100%"/> | <img src="docs/screenshots/05_game_market_day_basket.png" alt="Market Day Basket" width="100%"/> |
| *Central game launcher with streak tracking, category tabs, and roadmap placeholders* | *Working memory recall of regional produce (Kaji Nemu, Bhut Jolokia, Bamboo Shoot)* |

| **Daily Routine Sequencer (दैनिक दिनचर्या)** | **Faces & Family Recall (चेहरे और यादें)** |
|:---:|:---:|
| <img src="docs/screenshots/06_game_daily_routine_sequencer.png" alt="Routine Sequencer" width="100%"/> | <img src="docs/screenshots/07_game_faces_family_recall.png" alt="Faces Recall" width="100%"/> |
| *Executive function training sequencing familiar morning-to-night routines* | *Fusiform gyrus stimulation matching real family photos and kin relationships* |

| **Sound & Rhythm Match (ध्वनि और लय)** | **Odd One Out (अलग पहचानें)** |
|:---:|:---:|
| <img src="docs/screenshots/08_game_sound_rhythm_match.png" alt="Sound Match" width="100%"/> | <img src="docs/screenshots/09_game_odd_one_out.png" alt="Odd One Out" width="100%"/> |
| *Auditory attention recognizing indigenous instruments (Dhol, Pepa, Shankha)* | *Semantic categorization identifying botanical and culinary anomalies* |

> **🚀 6 New Roadmap Clinical Games**: Village Path Navigator (Spatial Logic), Spice & Herb Sorter (Produce Categorization), Proverb Completer (Semantic Memory), Tea Estate Planner (Executive Sequencing), Mekhela Pattern Match (Visual Discrimination), and Festival Calendar (Temporal Orientation).

---

### 🩺 Clinical Caregiver & Neurologist Command Hub
Professional, data-dense healthcare SaaS interface tailored for clinical rigor, adherence monitoring, and AI cognitive telemetry.

| **Clinical Caregiver Authentication** | **Command Center & Patient Roster** |
|:---:|:---:|
| <img src="docs/screenshots/12_caregiver_login.png" alt="Caregiver Login" width="100%"/> | <img src="docs/screenshots/13_caregiver_dashboard.png" alt="Caregiver Dashboard" width="100%"/> |
| *Secure email/password, Google OAuth, and WebAuthn clinician biometric login* | *Real-time patient roster with clinical status tags and adherence metrics* |

| **Patient Clinical Dossier & Telemetry** | **Dedicated Granular Game Telemetry** |
|:---:|:---:|
| <img src="docs/screenshots/14_caregiver_patient_detail.png" alt="Patient Clinical Dossier" width="100%"/> | <img src="docs/screenshots/15_caregiver_cognitive_games.png" alt="Game Telemetry" width="100%"/> |
| *AI Cognitive Health scoring, 7-day adherence charts, and top-3 routine overview* | *Round-by-round precision, reaction time distributions, and level history* |

| **Clinical Red Flag Alerts & Action Center** | **Caregiver Settings & DPDP Governance** |
|:---:|:---:|
| <img src="docs/screenshots/16_caregiver_notifications.png" alt="Caregiver Notifications" width="100%"/> | <img src="docs/screenshots/17_caregiver_profile.png" alt="Caregiver Profile" width="100%"/> |
| *Real-time alerts for missed critical medications with 1-tap telephone dialer* | *Profile management, notification preferences, and 30-day data erasure controls* |

---

### 🛡️ Security, Privacy & DPDP Compliance

| **Patient Emergency Vitals & Profile** | **DPDP Act 2023 Audited Privacy Policy** |
|:---:|:---:|
| <img src="docs/screenshots/11_patient_profile.png" alt="Patient Profile" width="100%"/> | <img src="docs/screenshots/18_privacy_policy.png" alt="Privacy Policy" width="100%"/> |
| *Emergency doctor/caregiver dialers, blood group, and regional language toggles* | *Comprehensive legal compliance with DPDP Act 2023, consent trails, and rights* |

---


## 🌸 The Smriti Solution: Complete Architecture & Core Pillars

Smriti is engineered as a resilient **3-Tier Delivery Ecosystem**:
- **Tier 1 (Core)**: WhatsApp AI Companion Bot + Offline-First Web PWA.
- **Tier 2 (Fallback)**: IVR automated voice calls and SMS alerts for 2G feature phones.
- **Tier 3 (Field Care)**: ASHA worker tablet mode with local synchronization.

```
                                  THE SMRITI ECOSYSTEM
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                    USER INTERFACES                                     │
├───────────────────────────────────┬────────────────────────────────────────────────────┤
│ 👴 SENIOR PATIENT INTERFACE       │ 🩺 CAREGIVER & CLINICIAN DASHBOARD                 │
│ • Large 56px Touch Targets        │ • Real-time MongoDB Roster & Patient CRUD          │
│ • 4-Digit Tactile PIN / Biometrics│ • 7-Day Adherence Charts (Meds, Water, Games)      │
│ • Web Speech Read-Aloud Guidance  │ • Live Red Flag Overdue Medication Alerts          │
│ • 5 Culturally Grounded Games     │ • Longitudinal Cognitive Telemetry Hub             │
│ • Family Reminiscence Memory Bank │ • Exportable Medical Summaries for Clinicians      │
├───────────────────────────────────┴────────────────────────────────────────────────────┤
│                                MESSAGING & VOICE AI                                    │
├───────────────────────────────────┬────────────────────────────────────────────────────┤
│ 📱 META WHATSAPP CLOUD API BOT    │ 🤖 GOOGLE GEMINI MULTIMODAL AI ASSISTANT           │
│ • Automated Node-Cron Reminders   │ • Conversational Memory Grounded in Patient Data   │
│ • Two-way Conversational Logging  │ • Speech-to-Text Voice Mic & Spoken Responses      │
│ • Zero New App Learning Curve     │ • Hindi, Assamese, and English Speech Synthesis    │
├───────────────────────────────────┴────────────────────────────────────────────────────┤
│                             DATA & MACHINE LEARNING LAYER                              │
├───────────────────────────────────┬────────────────────────────────────────────────────┤
│ ⚡ OFFLINE PWA & STORAGE          │ 🧠 LIVE MACHINE LEARNING MICROSERVICE (RENDER)     │
│ • Workbox Pre-caching Service Wkr │ • Live URL: dementia-ai-engine.onrender.com        │
│ • IndexedDB Offline Action Queue  │ • POST /get_next_difficulty (Adaptive Difficulty)  │
│ • Automatic Background Sync       │ • POST /calculate_health_score (Clinical Status)   │
│ • WebAuthn Hardware Keys (FIDO2)  │ • Rule-based heuristic fallback safeguards         │
└───────────────────────────────────┴────────────────────────────────────────────────────┘
```



## 🏛️ High-Level System Architecture

```
                               ┌────────────────────────────────┐
                               │       Senior Patient /         │
                               │      Family Caregiver          │
                               └───────┬────────────────┬───────┘
                                       │                │
                        Web Portal (React 19 + PWA + IDB) WhatsApp (Meta Cloud API)
                                       │                │
                                       ▼                ▼
                        ┌────────────────────────────────────────────────┐
                        │           Express.js REST & Webhook API        │
                        │           - JWT & WebAuthn FIDO2 Auth          │
                        │           - Dynamic Routine & Alert Engine     │
                        │           - Cognitive Telemetry Logging        │
                        │           - ML Service Fallback Wrapper        │
                        │           - Automated Node-Cron Scheduler      │
                        └───────┬───────────────┬────────────────┬───────┘
                                │               │                │
                                ▼               ▼                ▼
                        ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
                        │ MongoDB Atlas │ │  Google Gemini│ │ ML Engine(AI)│
                        │  - Patients   │ │ - Generative  │ │ - Difficulty  │
                        │  - Reminders  │ │   Companion   │ │ - Health Score│
                        │  - GameLogs   │ │ - Voice Audio │ │ (Render Cloud)│
                        │  - Caregivers │ └───────────────┘ └───────────────┘
                        └───────────────┘
```

---

## 💻 Complete Technology Stack

| Layer | Technologies & Libraries | Key Implementation Highlights |
|---|---|---|
| **Frontend Core** | React 19.2, Vite 8.2, React Router v7 | Fast SPA rendering, component modularity, strict error boundaries. |
| **Styling & UI** | Tailwind CSS v4, Lucide React, Canvas Confetti | Elderly-accessible high contrast, min 56px touch targets, warm theme. |
| **Offline PWA** | `vite-plugin-pwa`, Workbox, IndexedDB (`idb`) | Service worker caching, offline queue, automatic background flush. |
| **Voice & Speech** | Web Speech Synthesis API (`speechUtils.js`) | Multilingual spoken audio in Assamese, Hindi, and English. |
| **Generative AI** | Google Gemini Generative AI SDK (`@google/genai`) | Context-aware, patient-grounded conversational memory assistant. |
| **Machine Learning** | Python, Scikit-Learn, FastAPI (Render Cloud) | Real-time adaptive difficulty & longitudinal cognitive health scoring. |
| **Backend API** | Node.js, Express.js, Mongoose ODM, Node-Cron | Scoped JWTs, rate limiting, cron alerts, webhook listeners. |
| **Database** | MongoDB Atlas Cloud | Patient records, reminders, game sessions, caregiver collections. |
| **Messaging** | Meta WhatsApp Business Cloud API (`wa.me`) | Two-way automated reminder alerts and patient check-in sync. |
| **Security & Auth** | WebAuthn FIDO2 Biometrics, bcrypt, DPDP 2023 | Hardware sensor authentication, encrypted health telemetry. |
| **Hosting & Cloud** | **Vercel** (Frontend) • **Render** (Backend & ML) | Auto-deploying CI/CD, SSL termination, global edge caching. |

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js**: `v18.x` or higher
- **MongoDB**: MongoDB Atlas connection string or local MongoDB instance on `mongodb://localhost:27017`
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/gopalrajlohiya11-ui/Smriti.git
cd Smriti
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/` based on `.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/Smriti?retryWrites=true&w=majority
JWT_SECRET=your_jwt_super_secret_key_here
GEMINI_API_KEY=your_google_gemini_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id

# Meta WhatsApp Cloud API (Optional)
WHATSAPP_TOKEN=your_meta_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_verify_token
MY_WHATSAPP_NUMBER=919435012345
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### 4. Seed Database & Start Development Servers
```bash
# In backend directory:
node seed.js

# Terminal 1: Run Backend
npm start

# Terminal 2: Run Frontend
cd ../frontend
npm run dev
```
- Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ☁️ Cloud Deployment Guide (Vercel & Render)

### Deploying Frontend to Vercel
1. Import the repository in [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend` (or use the root `vercel.json`).
3. Set **Build Command** to `npm run build` and **Output Directory** to `dist`.
4. Configure Environment Variables:
   - `VITE_API_URL`: `https://<your-backend-app>.onrender.com/api`
   - `VITE_GOOGLE_CLIENT_ID`: `<your-google-client-id>`

### Deploying Backend to Render
1. Create a **Web Service** on [Render](https://render.com) from this repository.
2. Set **Root Directory** to `backend`.
3. Set **Build Command** to `npm install` and **Start Command** to `npm start`.
4. Configure Environment Variables:
   - `MONGO_URI`: `<your-mongodb-atlas-uri>`
   - `JWT_SECRET`: `<secure-random-key>`
   - `GEMINI_API_KEY`: `<your-gemini-key>`
   - `NODE_ENV`: `production`

---

## 🔗 Complete REST API Reference

### 🩺 Caregiver Endpoints (`/api/caregivers`)
| Method | Route | Description |
|---|---|---|
| `POST` | `/api/caregivers/signup` | Register new clinician or caregiver account |
| `POST` | `/api/caregivers/login` | Caregiver email & password authentication |
| `POST` | `/api/caregivers/google-login` | Google OAuth token verification & session creation |
| `POST` | `/api/caregivers/biometric-login` | WebAuthn biometric FIDO2 caregiver login |
| `POST` | `/api/caregivers/set-password` | Set backup password for Google OAuth users |
| `PATCH` | `/api/caregivers/me` | Update notification and clinical preferences |

### 👴 Patient Management (`/api/patients`)
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/patients?batch=true` | Fetch caregiver's patient roster with batch reminders |
| `GET` | `/api/patients/public/default` | Fetch default portal patient snapshot |
| `GET` | `/api/patients/public/:id` | Fetch specific public patient profile |
| `GET` | `/api/patients/me` | Fetch active logged-in patient profile |
| `POST` | `/api/patients` | Register new senior patient in MongoDB |
| `POST` | `/api/patients/login` | Patient name, age, and 4-digit PIN login |
| `POST` | `/api/patients/biometric-login` | WebAuthn hardware biometric patient login |
| `GET` | `/api/patients/:id/reminders` | Fetch full daily routine schedule |
| `GET` | `/api/patients/:id/photos` | Fetch Memory Bank album photos |
| `POST` | `/api/patients/:id/photos` | Upload new memory photo with DPDP consent |
| `DELETE` | `/api/patients/:id/photos/:photoId` | Delete photo with 30-day erasure audit trail |
| `PATCH` | `/api/patients/:id` | Update patient vitals, language, and clinical notes |
| `DELETE` | `/api/patients/:id` | Remove patient record |

### ⏰ Reminders & Overdue Alerts (`/api/reminders`)
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/reminders/alerts` | Fetch real-time active Red Flag alerts from MongoDB |
| `GET` | `/api/reminders/:patientId` | Fetch 10-routine daily timeline |
| `PATCH` | `/api/reminders/:id` | Toggle reminder completion / acknowledgment |
| `PATCH` | `/api/reminders/:id/dismiss` | Dismiss active clinical alert |

### 🎮 Cognitive Telemetry & ML Engine (`/api/game-sessions`)
| Method | Route | Description |
|---|---|---|
| `POST` | `/api/game-sessions` | Record game session scores and telemetry |
| `GET` | `/api/game-sessions/:patientId` | Fetch complete game session history |
| `GET` | `/api/game-sessions/:patientId/last-difficulty?gameType=...` | Retrieve last ML recommended starting difficulty |
| `GET` | `/api/game-sessions/ml-health-score/:patientId` | Get ML cognitive health score (0-100) and clinical status |
| `POST` | `/api/game-sessions/adaptive-difficulty` | Direct ML evaluation predicting optimal difficulty |

### 💬 Conversational AI & Webhooks (`/api/patients/:id/chat` & `/api/whatsapp`)
| Method | Route | Description |
|---|---|---|
| `POST` | `/api/patients/:id/chat` | Google Gemini AI multimodal dialogue (text + voice) |
| `GET` | `/api/whatsapp` | Meta WhatsApp webhook challenge verification |
| `POST` | `/api/whatsapp` | Inbound WhatsApp message receiver & sync |

---

## 📱 Meta WhatsApp Cloud API Setup

1. **Start Local Tunnel**:
   ```bash
   ngrok http 5000
   ```
2. **Configure Meta Developer Dashboard**:
   - Webhook Callback URL: `https://<your-ngrok-subdomain>.ngrok-free.app/api/whatsapp`
   - Verify Token: Matches `WHATSAPP_VERIFY_TOKEN` in your `backend/.env`.
   - Webhook Fields: Subscribe to `messages`.
3. **Live Testing**:
   - Send `Hi Smriti` to the verified bot phone number `+1 555 668 0031`.

---

## 🔮 Future Scope & Long-Term Product Roadmap

```
                                PRODUCT ROADMAP & VISION
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: GOVERNMENT TELE-MANAS & CLINICAL GRID INTEGRATION (Q1-Q2 2026)               │
│ • Direct two-way routing into the National Tele-MANAS (14416) helpline network.        │
│ • Automatic referral dispatch to district civil hospitals and GMCH neurology OPDs.    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2: ASHA & FRONTLINE HEALTHCARE WORKER TABLET SUITE (Q3 2026)                    │
│ • Simplified offline screening toolkit for ASHA / Anganwadi workers in remote hills.  │
│ • Vernacular voice prompts in Bodo, Khasi, Garo, Mizo, Meitei, and Nagamese.           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 3: ACOUSTIC SPEECH BIOMARKER & PROSODY ANALYSIS (Q4 2026)                       │
│ • Integration of openSMILE acoustic feature extraction (pitch jitter, shimmer, pause) │
│   directly into the Gemini voice engine to detect subtle micro-cognitive decline.     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 4: WEARABLE PPG & VASCULAR RISK TELEMETRY (2027)                                 │
│ • Bluetooth integration with low-cost smart bands for continuous heart rate, BP, and  │
│   sleep architecture monitoring to aggressively manage Vascular Dementia risks.       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 5: MULTI-CENTRIC ICMR & ARDSI CLINICAL VALIDATION TRIALS (2027)                  │
│ • Randomized controlled trials across 500+ NER patients measuring 12-month CST       │
│   cognitive preservation metrics against standardized CDR and HMSE benchmarks.        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Privacy, Ethics & DPDP 2023 Compliance

- **Digital Personal Data Protection Act 2023**: Mandatory explicit consent checkboxes for memory photo uploads; immediate cryptographic anonymization of research telemetry.
- **Right to Erasure**: Caregivers can delete patient profiles and photo logs at any time, initiating automated 30-day database purging.
- **Zero Raw Biometric Storage**: WebAuthn FIDO2 public-key cryptography guarantees that biometric fingerprint/face data never leaves the senior's local device.
- **Data Minimization**: Voice audio streams are processed in memory for speech-to-text inference and discarded immediately.
- **Grievance Officer**: Reachable directly at `gopalrajlohiya2@gmail.com`.

---

## 👥 Team & Acknowledgements

**Team Design Divas** — Smart India Hackathon (SIH26003):
- **Problem Statement**: *AI-Based Cognitive Gaming and Memory Assistance Platform for Elderly Dementia Patients in North Eastern Region (NER)*
- **Nodal Ministry**: *Ministry of Development of North Eastern Region (MDoNER)*

Special thanks to the clinical research teams behind **LASI-DAD**, **ARDSI**, **NIMHANS**, **SCARF India**, and the **Ministry of DoNER** for their published epidemiological data and clinical guidance on dementia care in India.

---

<div align="center">
  <b>🌸 Smriti (স্মৃতি / स्मृति) — Preserving Memories, Empowering Caregivers, Culturally Grounded.</b>
</div>
