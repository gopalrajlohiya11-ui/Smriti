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

- **Frontend:** React 19.2, Vite 8.2, React Router v7, Tailwind CSS v4, Lucide React
- **Offline PWA:** `vite-plugin-pwa`, Workbox Service Worker, IndexedDB (`idb`)
- **Voice & Speech:** Web Speech Synthesis API — Assamese, Hindi, English
- **Generative AI:** Google Gemini AI SDK (`@google/genai`) — multimodal text + voice
- **Machine Learning:** Python, Scikit-Learn, FastAPI — hosted on Render Cloud
- **Backend API:** Node.js, Express.js, Mongoose ODM, Node-Cron, bcrypt, JWT
- **Database:** MongoDB Atlas Cloud
- **Messaging:** Meta WhatsApp Business Cloud API
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

## 8. Live Deployments & Resources

| Resource | URL |
|---|---|
| **Live Web App** | [smriti-puce.vercel.app](https://smriti-puce.vercel.app) |
| **Backend API** | [smriti-backend-nwrl.onrender.com](https://smriti-backend-nwrl.onrender.com/api/health) |
| **Live ML Engine** | [dementia-ai-engine.onrender.com](https://dementia-ai-engine.onrender.com/docs) |
| **WhatsApp Bot** | [wa.me/15556680031](https://wa.me/15556680031?text=Hi%20Smriti) |
| **Demo Video** | [youtu.be/TTV7cAvSF-s](https://youtu.be/TTV7cAvSF-s) |
| **ML Engine Source Code** | [github.com/adityaraichauhan/Dementia-AI-engine](https://github.com/adityaraichauhan/Dementia-AI-engine) |
| **Project Presentation (PPT)** | [View on Google Drive](https://docs.google.com/file/d/1ZMWVouCgjB8nl_J1NueILKSQ3ZTZmB5A/view) |

---

## 9. Local Setup

### Prerequisites
- Node.js `v18.x` or higher
- MongoDB Atlas URI (or local MongoDB on `mongodb://localhost:27017`)
- Git

### Step 1 — Clone the repository
```bash
git clone https://github.com/gopalrajlohiya11-ui/Smriti.git
cd Smriti
```

### Step 2 — Backend setup
```bash
cd backend
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

# Meta WhatsApp Cloud API (optional)
WHATSAPP_TOKEN=your_meta_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_verify_token
```

### Step 3 — Frontend setup
```bash
cd ../frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### Step 4 — Seed and run
```bash
# In backend/
node seed.js       # Seed demo patients and caregivers
npm start          # Start backend on port 5000

# In frontend/ (new terminal)
npm run dev        # Start frontend on port 5173
```

Open [http://localhost:5173](http://localhost:5173).

---

## 10. Team

**Team Design Divas** — Smart India Hackathon 2026

| Member | Role |
|---|---|
| Gopal Raj Lohiya | Full Stack Developer & Team Lead |
| Smriti Sharma | UI/UX Designer |
| Yash Panchal | ML Engineer |

Special thanks to the clinical research teams at **LASI-DAD**, **ARDSI**, **NIMHANS**, **SCARF India**, and the **Ministry of DoNER** for their published epidemiological data and clinical guidance on dementia care in the North-Eastern Region.

---

*🌸 Smriti (স্মৃতি / स्मृति) — Preserving Memories, Empowering Caregivers, Culturally Grounded.*
