<div align="center">

# 🌸 Smriti (স্মৃতি / स्मृति)
### *Multilingual AI-Powered Cognitive Care & Memory Companion Ecosystem*

[![React 19](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-v4.3-38bdf8.svg)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline%20First%20%2B%20IndexedDB-purple.svg)](https://web.dev/progressive-web-apps/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI%20Assistant-8E75B2.svg)](https://deepmind.google/technologies/gemini/)
[![ML Engine](https://img.shields.io/badge/ML%20Engine-Live%20on%20Render-FF6B6B.svg)](https://dementia-ai-engine.onrender.com)
[![Meta WhatsApp](https://img.shields.io/badge/WhatsApp-Cloud%20API-25D366.svg)](https://developers.facebook.com/docs/whatsapp)
[![DPDP Act 2023](https://img.shields.io/badge/DPDP%20Act%202023-Compliant-success.svg)](/privacy-policy)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-black.svg)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7.svg)](https://render.com/)

<p align="center">
  <b>Smriti</b> is an intelligent, culturally attuned healthcare ecosystem designed for seniors living with Alzheimer's, dementia, and mild cognitive impairment (MCI). Tailored with North-East Indian and pan-Indian linguistic and cultural contexts, Smriti bridges the gap between elderly patients, family caregivers, and clinicians through multi-modal voice guidance, offline-first PWA caching, WhatsApp routine reminders, culturally grounded cognitive games, clinical telemetry, and DPDP 2023 data compliance.
</p>

</div>

---

## 📑 Table of Contents

- [🌟 Key Innovations & Features](#-key-innovations--features)
  - [1. Senior-Centric Patient Portal & Horizon Routines](#1-senior-centric-patient-portal--horizon-routines)
  - [2. Culturally Attuned Cognitive Games Suite](#2-culturally-attuned-cognitive-games-suite)
  - [3. Google Gemini Multilingual AI Assistant](#3-google-gemini-multilingual-ai-assistant)
  - [4. WhatsApp Bot & Automated Notification Engine](#4-whatsapp-bot--automated-notification-engine)
  - [5. Clinical Caregiver & Clinician Command Center](#5-clinical-caregiver--clinician-command-center)
  - [6. Family Memory Bank & DPDP 2023 Compliance](#6-family-memory-bank--dpdp-2023-compliance)
  - [7. Offline-First PWA & IndexedDB Queue](#7-offline-first-pwa--indexeddb-queue)
  - [8. WebAuthn FIDO2 Biometrics & 365-Day Sessions](#8-webauthn-fido2-biometrics--365-day-sessions)
- [🏛️ System Architecture](#️-system-architecture)
- [💻 Tech Stack](#-tech-stack)
- [🚀 Quick Start & Local Setup](#-quick-start--local-setup)
- [☁️ Cloud Deployment (Vercel & Render)](#️-cloud-deployment-vercel--render)
  - [Deploying Frontend to Vercel](#deploying-frontend-to-vercel)
  - [Deploying Backend to Render](#deploying-backend-to-render)
- [🔗 REST API Reference](#-rest-api-reference)
- [📱 Meta WhatsApp Cloud API Setup](#-meta-whatsapp-cloud-api-setup)
- [📂 Project Directory Structure](#-project-directory-structure)
- [🛡️ Privacy, Security & DPDP Compliance](#️-privacy-security--dpdp-compliance)

---

## 🌟 Key Innovations & Features

### 1. Senior-Centric Patient Portal & Horizon Routines
- **High-Contrast Single-Focus Layout**: Large touch targets (min 56px), warm soothing cream palette (`#FAF7F2`), and distraction-free typography for elderly users with visual or motor impairments.
- **Chronological Forward Progression**: Completing an active reminder dynamically spotlight-advances to the nearest upcoming routine, preventing accidental backwards jumps.
- **Game of the Day Challenge**: Rotates daily featured cognitive challenges using a day-of-year seed.
- **One-Tap Voice Guidance (`[🔊 Listen]`)**: Integrated Web Speech Synthesis across English, Hindi, and Assamese to read aloud schedules, names, and game instructions.
- **Confetti & Audible Celebration**: Positive reinforcement rewards on completing medication, hydration, and memory exercises.

### 2. Culturally Attuned Cognitive Games Suite
A suite of 5 clinically informed cognitive stimulation games featuring authentic cultural assets:

1. **Market Day Basket (বজাৰৰ পাচি / बाज़ार की टोकरी)**:
   - Produce identification, categorization, and mental math using 10 verified North-East Indian produce items (*King Chilli / Bhut Jolokia, Bamboo Shoot, Assam Tea Leaves, Kaji Nemu, Tripura Pineapple, Malbhog Banana, Lai Xaak, Country Tomato, Coconut, Kath Aloo*).
   - Dynamic 5-level adaptive difficulty scaling item counts based on accuracy.
2. **Daily Routine Sequencer (दैनिक दिनचर्या क्रम)**:
   - Executive function and logical sequencing of daily living activities (brewing morning tea, walking in garden, watering Tulsi plant, morning bath).
3. **Faces & Family Recall (चेहरे और परिवार की यादें)**:
   - Reminiscence therapy matching family portraits, names, and relationship bonds.
4. **Sound & Rhythm Match (ध्वनि और लय मिलान)**:
   - Auditory memory associating traditional cultural instruments (*Dhol, Pepa flute, Temple Bell, Shankha, Mridangam*).
5. **Odd One Out (अलग पहचानें)**:
   - Semantic anomaly discrimination finding the element that does not belong in a cultural set.

*All games stream real-time cognitive telemetry (`POST /api/game-sessions`) for clinical longitudinal analysis.*

### 3. Google Gemini Multilingual AI Assistant
- **Official Google Gemini Sparkle Floating Launcher**: Distinctive gradient AI floating button with radiant aura for instant recognition.
- **Voice Mic & Real-time Speech-to-Text**: Elderly patients can speak naturally to ask about medicines, daily schedules, family memories, or doctor appointments.
- **Text-to-Speech Aloud Responses**: Automatic spoken responses in Hindi, Assamese, and English.
- **Context-Aware Memory Grounding**: Gemini is primed with the active patient’s real-time medication schedule, caregiver contact, and daily routine.

### 4. WhatsApp Bot & Automated Notification Engine
- **Direct WhatsApp Link**: 1-tap green shortcut opening an instant conversation with the verified Smriti bot (`https://wa.me/15556680031?text=Hi%20Smriti`).
- **Automated Cron Scheduler**: Backend scheduler checks routine timelines and sends timely medication/hydration reminder alerts via Meta WhatsApp Cloud API.
- **Two-way Conversational Logging**: Patient check-ins on WhatsApp synchronize with the clinical dashboard.

### 5. Clinical Caregiver & Clinician Command Center
- **Multi-Patient Profile Resolution**: Seamless support for diverse patient datasets (e.g. Ramesh Sharma in Guwahati, Meera Baruah in Shillong, Biren Das in Jorhat).
- **Live Vitals & 7-Day Adherence Tracking**: Visual charts displaying medication, hydration, and cognitive activity compliance.
- **Real-Time Overdue Alerts (Red Flags)**: Clinicians receive instant notifications when critical medications are missed, complete with a 1-tap dialer and dismissal logging.
- **Cognitive ML Telemetry Hub (`/caregiver/patient/:id/games`)**: Deep score trends, accuracy percentages, and completion speeds.

### 6. Family Memory Bank & DPDP 2023 Compliance
- **Digital Personal Data Protection Act 2023 Compliance**: Real consent checkbox requiring explicit caregiver/patient authorization prior to photo uploads.
- **Reminiscence Photo Reel**: Photo cards with relationship tags, year badges, and personalized audio prompts for memory preservation.
- **Comprehensive Privacy Policy (`/privacy-policy`)**: Public legal policy detailing health data categories, AES-256 storage, 30-day retention policies, and Grievance Officer contact (`gopalrajlohiya2@gmail.com`).

### 7. Offline-First PWA & IndexedDB Queue
- **Workbox Service Worker**: Complete offline shell caching for standalone installation on Android, iOS, Windows, and macOS.
- **IndexedDB Local Storage**: Patient profiles, offline reminders, and photo albums remain accessible during rural network blackouts.
- **Resilient Background Sync**: Queues offline routine completions and game scores, automatically flushing to MongoDB when online.

### 8. WebAuthn FIDO2 Biometrics & 365-Day Sessions
- **Passwordless 1-Tap Biometric Authentication**: Touch ID, Face ID, and Windows Hello hardware-level authentication.
- **Accessible PIN Keypad**: 4-digit high-contrast tactile PIN pad with demo one-click shortcuts.
- **365-Day Resilient Sessions**: Zero unexpected session dropouts for seniors.

### 9. Real-Time Machine Learning Cognitive Engine (Render Microservice)
- **Live ML Engine**: Hosted on Render (`https://dementia-ai-engine.onrender.com`), seamlessly integrated into the Node.js backend with an automatic heuristic fallback.
- **Adaptive Difficulty (`POST /get_next_difficulty`)**: Continuously analyzes per-game reaction times and mistake counts to recommend optimal next-round difficulty levels in real time.
- **Cognitive Health Scoring (`POST /calculate_health_score`)**: Computes longitudinal cognitive health scores and clinical status classifications (*Stable*, *Mild Decline*, *Moderate Decline*) based on weekly gameplay telemetry.
- **Race-Condition-Proof Audio Engine (`speechUtils.js`)**: Atomic request ID tracking prevents overlapping audio feedback during rapid taps and ensures clean speech synthesis across languages.

---

## 🏛️ System Architecture

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
                        │           - Automated Node-Cron Engine         │
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

## 💻 Tech Stack

| Domain | Technologies |
|---|---|
| **Frontend Framework** | React 19, Vite 8, React Router v7 |
| **Styling & Design** | Tailwind CSS v4, Lucide React, Canvas Confetti |
| **Localization & Audio** | `i18next`, `react-i18next`, Web Speech API (hi-IN, as-IN, en-IN) with atomic cancel queue |
| **Offline & PWA** | `vite-plugin-pwa`, Workbox, IndexedDB (`idb`) |
| **Backend & API** | Node.js, Express.js, Mongoose ODM, Axios |
| **Machine Learning** | Live Dementia AI Microservice on Render (Scikit-Learn/FastAPI) |
| **Database** | MongoDB Atlas / Local MongoDB |
| **Generative AI** | Google Gemini Generative AI SDK (`@google/genai`) |
| **Messaging & Bot** | Meta WhatsApp Business Cloud API (`wa.me`) |
| **Authentication** | JWT, Google OAuth 2.0, WebAuthn FIDO2 Biometrics |
| **Cloud Hosting** | **Vercel** (Frontend SPA), **Render** (Backend API & ML Microservice) |

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js**: `v18.x` or higher
- **MongoDB**: MongoDB Atlas URI or local instance on `localhost:27017`
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

# Meta WhatsApp Cloud API (Optional for WhatsApp Bot)
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

Create a `.env` in `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### 4. Seed Demo Clinical Data
```bash
cd ../backend
node seed.js
```

### 5. Run Development Servers
```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
cd frontend && npm run dev
```
- Open `http://localhost:5173` in your browser.

---

## ☁️ Cloud Deployment (Vercel & Render)

### Deploying Frontend to Vercel
The repository includes a pre-configured `vercel.json` and `frontend/vercel.json` for single-page routing:

1. Import the repository in [Vercel](https://vercel.com).
2. **Root Directory**: Select `frontend` (or keep root with `vercel.json`).
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Environment Variables**:
   - `VITE_API_URL`: `https://<your-render-backend-url>.onrender.com/api`
   - `VITE_GOOGLE_CLIENT_ID`: `<your-google-client-id>`

### Deploying Backend to Render
The repository includes `render.yaml` defining the web service:

1. Create a new **Web Service** on [Render](https://render.com) connected to this repository.
2. **Root Directory**: `backend`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Environment Variables**:
   - `MONGO_URI`: `<your-mongodb-atlas-uri>`
   - `JWT_SECRET`: `<secure-random-string>`
   - `GEMINI_API_KEY`: `<your-gemini-key>`
   - `NODE_ENV`: `production`
   - `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN` (Optional)

---

## 🔗 REST API Reference

### 🩺 Caregiver Routes (`/api/caregivers`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/caregivers/signup` | Register clinician/caregiver account |
| `POST` | `/api/caregivers/login` | Caregiver email & password login |
| `POST` | `/api/caregivers/google-login` | Google OAuth token verification |
| `POST` | `/api/caregivers/set-password` | Set backup password for OAuth accounts |

### 👴 Patient Routes (`/api/patients`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/patients` | Get assigned patient list (Caregiver) |
| `GET` | `/api/patients/public/default` | Get default patient for portal |
| `GET` | `/api/patients/public/:id` | Get specific patient profile |
| `POST` | `/api/patients` | Register new senior patient |
| `POST` | `/api/patients/login` | Patient name & PIN authentication |
| `POST` | `/api/patients/biometric-login` | WebAuthn biometric FIDO2 login |
| `GET` | `/api/patients/:id/reminders` | Fetch daily routine schedule |
| `GET` | `/api/patients/:id/photos` | Fetch Memory Bank album |
| `POST` | `/api/patients/:id/photos` | Upload photo with DPDP consent |
| `PATCH` | `/api/patients/:id` | Update patient vitals & notes |
| `DELETE` | `/api/patients/:id` | Remove patient record |

### ⏰ Reminder & Alert Routes (`/api/reminders`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reminders/alerts` | Fetch real-time active Red Flag alerts |
| `GET` | `/api/reminders/:patientId` | Fetch 10-routine daily schedule |
| `PATCH` | `/api/reminders/:id` | Toggle reminder completion state |
| `PATCH` | `/api/reminders/:id/dismiss` | Dismiss clinical alert |

### 🎮 Cognitive Game Telemetry & ML Engine (`/api/game-sessions`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/game-sessions` | Record game scores & cognitive telemetry |
| `GET` | `/api/game-sessions/patient/:patientId` | Fetch cognitive trend history for patient |
| `POST` | `/api/game-sessions/adaptive-difficulty` | Predict next game level via ML microservice (reaction time & mistakes) |
| `GET` | `/api/game-sessions/patient/:patientId/health-score` | Calculate longitudinal health score & clinical status via ML |

### 💬 Conversational AI & Webhook (`/api/chatbot` & `/api/whatsapp`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chatbot/message` | Google Gemini AI assistant dialogue |
| `GET` | `/api/whatsapp` | Meta Webhook challenge verification |
| `POST` | `/api/whatsapp` | Inbound WhatsApp message receiver |

---

## 📱 Meta WhatsApp Cloud API Setup

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

## 🛡️ Privacy, Security & DPDP Compliance

- **Digital Personal Data Protection (DPDP) Act 2023**: Explicit consent required for photo uploads; right to data deletion within 30 days.
- **Biometric Protection**: FIDO2 WebAuthn keys use cryptographic public-key signatures; biometric raw data never leaves the user device.
- **Encryption**: HTTPS in transit, bcrypt password hashing, and encrypted MongoDB storage.
- **Grievance Officer**: Contactable at `gopalrajlohiya2@gmail.com`.

---

<div align="center">
  <b>🌸 Smriti — Preserving Memories, Empowering Caregivers, Culturally Grounded.</b>
</div>
