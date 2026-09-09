const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_HTML = path.resolve(__dirname, '..', '..', 'docs', 'Smriti_Code_Architecture.html');
const OUTPUT_PDF = path.resolve(__dirname, '..', '..', 'docs', 'Smriti_Complete_Code_Architecture.pdf');
const ROOT_PDF = path.resolve(__dirname, '..', '..', 'Smriti_Complete_Code_Architecture.pdf');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Smriti - Complete Code & System Architecture Dossier</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&family=Playfair+Display:wght@700;800;900&display=swap');

  @page {
    size: A4;
    margin: 12mm 12mm 12mm 12mm;
  }

  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #0F172A;
    background-color: #FFFFFF;
    font-size: 8.5pt;
    line-height: 1.45;
    margin: 0;
    padding: 0;
  }

  .header {
    background: linear-gradient(135deg, #0B251E 0%, #173E33 50%, #B5502E 100%);
    color: #FFFFFF;
    padding: 16px 20px;
    border-radius: 10px;
    margin-bottom: 14px;
    box-shadow: 0 4px 14px rgba(11, 37, 30, 0.15);
  }

  .header h1 {
    font-family: 'Playfair Display', serif;
    font-size: 16pt;
    font-weight: 900;
    margin: 0 0 4px 0;
    letter-spacing: -0.2px;
  }

  .header p {
    margin: 0;
    font-size: 8.5pt;
    opacity: 0.95;
    font-weight: 500;
  }

  .meta-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-top: 10px;
    background: rgba(255, 255, 255, 0.1);
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 7.5pt;
  }

  .meta-grid div {
    display: flex;
    flex-direction: column;
  }

  .meta-grid span.label {
    opacity: 0.75;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 6.5pt;
  }

  .meta-grid span.val {
    font-weight: 800;
  }

  h2 {
    font-size: 10.5pt;
    font-weight: 800;
    color: #0B251E;
    border-bottom: 2px solid #0D9488;
    padding-bottom: 4px;
    margin: 14px 0 8px 0;
    display: flex;
    align-items: center;
    gap: 6px;
    page-break-after: avoid;
  }

  h3 {
    font-size: 9pt;
    font-weight: 800;
    color: #1E293B;
    margin: 10px 0 4px 0;
    page-break-after: avoid;
  }

  p {
    margin: 0 0 6px 0;
    text-align: justify;
  }

  .code-block {
    background: #F8FAFC;
    border: 1px solid #CBD5E1;
    border-left: 3.5px solid #0D9488;
    padding: 8px 10px;
    border-radius: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 7.2pt;
    line-height: 1.35;
    margin: 6px 0 10px 0;
    white-space: pre-wrap;
    color: #0F172A;
    page-break-inside: avoid;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 8px;
    page-break-inside: avoid;
  }

  .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    margin-bottom: 8px;
    page-break-inside: avoid;
  }

  .card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    padding: 8px 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  }

  .card-highlight {
    background: #F0FDF4;
    border: 1px solid #86EFAC;
    border-left: 3.5px solid #16A34A;
  }

  .card-alert {
    background: #FFFBEB;
    border: 1px solid #FDE68A;
    border-left: 3.5px solid #D97706;
  }

  .card-teal {
    background: #F0FDFA;
    border: 1px solid #99F6E4;
    border-left: 3.5px solid #0D9488;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0 10px 0;
    font-size: 7.5pt;
    page-break-inside: avoid;
  }

  th {
    background: #0B251E;
    color: #FFFFFF;
    text-align: left;
    padding: 5px 8px;
    font-weight: 700;
    border: 1px solid #0B251E;
  }

  td {
    padding: 4.5px 8px;
    border: 1px solid #E2E8F0;
    vertical-align: top;
  }

  tr:nth-child(even) td {
    background-color: #F8FAFC;
  }

  .badge {
    display: inline-block;
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 6.5pt;
    font-weight: 800;
    text-transform: uppercase;
  }

  .badge-teal { background: #CCFBF1; color: #0F766E; }
  .badge-orange { background: #FFEDD5; color: #C2410C; }
  .badge-green { background: #DCFCE7; color: #15803D; }
  .badge-purple { background: #F3E8FF; color: #7E22CE; }

  .page-break {
    page-break-before: always;
  }

  .footer {
    margin-top: 14px;
    padding-top: 6px;
    border-top: 1px solid #E2E8F0;
    font-size: 7pt;
    color: #64748B;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
</head>
<body>

<!-- ======================================================== -->
<!-- PAGE 1: EXECUTIVE SYSTEM ARCHITECTURE & 3-TIER ECOSYSTEM -->
<!-- ======================================================== -->

<div class="header">
  <h1>🌸 Smriti Complete Codebase Architecture Dossier</h1>
  <p>End-to-End Technical System Design, Client/Server Component Hierarchy & Microservice Telemetry Pipeline</p>
  <div class="meta-grid">
    <div>
      <span class="label">Hackathon / Ministry</span>
      <span class="val">SIH26003 • Ministry of DoNER</span>
    </div>
    <div>
      <span class="label">Frontend Tech</span>
      <span class="val">React 19.2 + Vite 8.2 + PWA</span>
    </div>
    <div>
      <span class="label">Backend & Database</span>
      <span class="val">Node.js + Express + MongoDB Atlas</span>
    </div>
    <div>
      <span class="label">AI & Speech Engines</span>
      <span class="val">Gemini AI + Bhashini TTS + Render ML</span>
    </div>
  </div>
</div>

<h2>🏛️ 1. High-Level System Architecture & 3-Tier Delivery Model</h2>
<p>
  <b>Smriti</b> is architected as an offline-first, highly resilient 3-Tier cognitive healthcare ecosystem designed to operate reliably in low-bandwidth, rural North-Eastern India (NER). The system seamlessly unites senior patient interfaces, clinician command centers, automated background cron dispatchers, and live cloud machine learning microservices.
</p>

<div class="code-block">
                                  THE SMRITI CODEBASE ARCHITECTURE
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     1. FRONTEND CLIENT LAYER                                     │
│  React 19.2 SPA • TailwindCSS v4 • Vite 8.2 PWA • Workbox Service Worker • IndexedDB Sync Queue  │
├─────────────────────────────────────────────────┬────────────────────────────────────────────────┤
│ 👴 SENIOR PATIENT PORTAL (/patient/*)           │ 🩺 CLINICAL CAREGIVER HUB (/caregiver/*)       │
│ • Large 56px Touch Targets • Tactile 4-Digit PIN│ • Deep Forest Green SaaS Design (#0B251E)      │
│ • Northeast State Theming (Assam, Mizo, etc.)   │ • Real-time MongoDB Patient Roster Management  │
│ • Horizon 10-Routine Timeline Spotlight         │ • Longitudinal 7-Day Performance Telemetry     │
│ • 5 Culturally Attuned Cognitive Games Suite    │ • Live Red Flag Overdue Medication Alerts      │
│ • Family Reminiscence Photo Vault (DPDP-Audited)│ • 3-Item Truncated History + Expand All Toggles│
├─────────────────────────────────────────────────┴────────────────────────────────────────────────┤
│                                 2. MESSAGING & VOICE AI PIPELINE                                 │
├─────────────────────────────────────────────────┬────────────────────────────────────────────────┤
│ 🎙️ DIGITAL INDIA BHASHINI TTS SYNTHESIS         │ 🤖 GOOGLE GEMINI MULTIMODAL COMPANION          │
│ • Base64 WAV Streaming (/synthesize_speech)     │ • Grounded Patient Context (Vitals, Meds)      │
│ • Native Assamese, Bodo, Hindi Voice Generation │ • Voice Audio Input + Text-to-Speech Streaming │
│ • Graceful Fallback to Web Speech API           │ • Floating Patient Companion Widget            │
├─────────────────────────────────────────────────┼────────────────────────────────────────────────┤
│ 📱 META WHATSAPP BUSINESS CLOUD API ENGINE      │ ⏰ AUTOMATED NODE-CRON SCHEDULER ENGINE        │
│ • Two-way Conversational Adherence Bot          │ • Continuous Prescription Timeline Polling     │
│ • wa.me/15556680031 Automated Notification Bridge│ • Caregiver Alert Dispatch & Escalation Rules   │
├─────────────────────────────────────────────────┴────────────────────────────────────────────────┤
│                               3. BACKEND GATEWAY & PERSISTENCE LAYER                             │
│  Node.js + Express.js 5.x REST API • Scoped JWT & WebAuthn FIDO2 Auth • MongoDB Atlas Cloud ODM  │
├─────────────────────────────────────────────────┬────────────────────────────────────────────────┤
│ 🧠 LIVE PYTHON ML MICROSERVICE (RENDER CLOUD)   │ 🗄️ MONGODB ATLAS CLOUD COLLECTIONS             │
│ • Endpoint: dementia-ai-engine.onrender.com     │ • Patients, Reminders, GameSessions,           │
│ • POST /get_next_difficulty (Adaptive Algorithm)│   Caregivers, MemoryBankPhotos, ChatMessages   │
│ • POST /calculate_health_score (Clinical Score) │ • DPDP 2023 Consent Logs & 30-Day Erasure Queue│
└─────────────────────────────────────────────────┴────────────────────────────────────────────────┘
</div>

<div class="grid-3">
  <div class="card card-teal">
    <span class="badge badge-teal">Tier 1: Core Client</span>
    <h3>Offline-First PWA</h3>
    <p>100% playable cognitive games, local medication check-offs, and IndexedDB sync queues operating during full network loss.</p>
  </div>
  <div class="card card-alert">
    <span class="badge badge-orange">Tier 2: Messaging</span>
    <h3>WhatsApp Bot Gateway</h3>
    <p>Zero-app-learning curve routine alerts dispatched directly to rural caregiver and patient WhatsApp accounts.</p>
  </div>
  <div class="card card-highlight">
    <span class="badge badge-green">Tier 3: AI & Telemetry</span>
    <h3>Bhashini & Live ML</h3>
    <p>Real-time Base64 WAV speech synthesis for Assamese and dynamic CST difficulty scaling powered by Render FastAPI.</p>
  </div>
</div>

<!-- ======================================================== -->
<!-- PAGE 2: FRONTEND COMPONENT & STATE MACHINE ARCHITECTURE -->
<!-- ======================================================== -->
<div class="page-break"></div>

<h2>💻 2. Frontend Codebase Architecture (React 19 + Vite)</h2>
<p>
  The frontend source is organized under <code>frontend/src/</code> into strictly modularized components, pages, custom hooks, utilities, and services. It enforces clean separation of concerns between patient-facing accessibility and clinical data visualization.
</p>

<h3>Directory & Component File Map</h3>
<table>
  <thead>
    <tr>
      <th style="width:28%;">Module Directory</th>
      <th style="width:32%;">Key Source Files</th>
      <th style="width:40%;">Architectural Role & Implementation Detail</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong><code>src/pages/patient/</code></strong></td>
      <td>
        <code>PatientDashboard.jsx</code><br/>
        <code>PatientReminders.jsx</code><br/>
        <code>PatientFamily.jsx</code><br/>
        <code>PatientProfile.jsx</code><br/>
        <code>PatientAllGames.jsx</code>
      </td>
      <td>Senior patient interface. Implements large 56px touch targets, time-aware horizon greetings, North-Eastern state horizon theming (Assam, Meghalaya, etc.), and spotlight routine progression.</td>
    </tr>
    <tr>
      <td><strong><code>src/pages/patient/games/</code></strong></td>
      <td>
        <code>MarketDayBasket.jsx</code><br/>
        <code>DailyRoutineSequencer.jsx</code><br/>
        <code>FacesFamilyRecall.jsx</code><br/>
        <code>SoundRhythmMatch.jsx</code><br/>
        <code>OddOneOut.jsx</code>
      </td>
      <td>5 Culturally Attuned Cognitive Games Suite mapped to clinical CST domains: Episodic Memory, Executive Sequencing, Facial Recall, Auditory Discrimination, and Semantic Categorization.</td>
    </tr>
    <tr>
      <td><strong><code>src/pages/caregiver/</code></strong></td>
      <td>
        <code>CaregiverDashboard.jsx</code><br/>
        <code>CaregiverPatientDetail.jsx</code><br/>
        <code>CaregiverCognitiveGames.jsx</code><br/>
        <code>CaregiverNotifications.jsx</code><br/>
        <code>CaregiverProfile.jsx</code>
      </td>
      <td>Clinical SaaS portal with Deep Forest Green styling (<code>#0B251E</code>). Features patient roster CRUD, AI cognitive scoring, 3-item default history limits with "Expand All" toggles, and Red Flag alert resolution.</td>
    </tr>
    <tr>
      <td><strong><code>src/utils/</code></strong></td>
      <td>
        <code>speechUtils.js</code><br/>
        <code>streakUtils.js</code><br/>
        <code>webauthn.js</code>
      </td>
      <td>Speech synthesis engine with Bhashini Base64 HTML5 Audio player + Web Speech fallback, dynamic patient streak algorithms, and FIDO2 biometric authentication.</td>
    </tr>
    <tr>
      <td><strong><code>src/services/</code></strong></td>
      <td>
        <code>api.js</code><br/>
        <code>idbSync.js</code>
      </td>
      <td>Centralized Axios/Fetch API client with timeout controllers, direct fallback bridges, and IndexedDB sync queues for 100% offline data integrity.</td>
    </tr>
  </tbody>
</table>

<h3>Audio & Speech Synthesis Architecture (speechUtils.js)</h3>
<p>
  Smriti implements a hybrid dual-engine speech pipeline that eliminates reliance on missing operating system voice packs for regional Indian languages:
</p>

<div class="code-block">
                              SMRITI HYBRID SPEECH SYNTHESIS FLOW
┌────────────────────────┐
│ speakLocalized(params) │ ──► Clean Text (strips emojis, formats currency)
└───────────┬────────────┘
            │
            ▼
┌───────────────────────────────────────────────┐
│ 1. PRIMARY: Bhashini Base64 Audio Pipeline    │
│    POST /api/speech/synthesize                │
│    (Target: dementia-ai-engine.onrender.com)  │
└───────────────────────┬───────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         ▼                             ▼
   [Success: Base64 WAV]        [Failure / Offline / Timeout]
         │                             │
         ▼                             ▼
┌─────────────────────────┐   ┌─────────────────────────────────────────┐
│ HTML5 Audio Player      │   │ 2. RESILIENT FALLBACK: Web Speech API   │
│ const a = new Audio(src)│   │ • English (en-IN) / Hindi (hi-IN) Voices│
│ • Real Assamese Voice   │   │ • Assamese: Display "Coming Soon" Notice│
│ • stopSpeech() Tracking │   │ • Race-condition proof request tracking │
└─────────────────────────┘   └─────────────────────────────────────────┘
</div>

<!-- ======================================================== -->
<!-- PAGE 3: BACKEND API GATEWAY & DATA MODEL TOPOLOGY -->
<!-- ======================================================== -->
<div class="page-break"></div>

<h2>⚙️ 3. Backend Architecture & REST API Gateway (Node.js + Express)</h2>
<p>
  The backend server is structured under <code>backend/</code> as a high-throughput, microservice-connected REST gateway using Express.js 5.x and Mongoose 9.x ODM on MongoDB Atlas Cloud.
</p>

<h3>REST API Route Catalog</h3>
<table>
  <thead>
    <tr>
      <th style="width:12%;">Method</th>
      <th style="width:28%;">Endpoint Route</th>
      <th style="width:30%;">Controller / Service File</th>
      <th style="width:30%;">Payload & Clinical Functionality</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span class="badge badge-teal">POST</span></td>
      <td><code>/api/speech/synthesize</code></td>
      <td><code>translationRoutes.js</code></td>
      <td>Synthesizes text into Base64 WAV audio via Bhashini TTS engine for regional dialects.</td>
    </tr>
    <tr>
      <td><span class="badge badge-teal">POST</span></td>
      <td><code>/api/speech/translate</code></td>
      <td><code>translationRoutes.js</code></td>
      <td>Translates reminder and system prompts into Assamese (<code>as</code>), Bengali (<code>bn</code>), Hindi.</td>
    </tr>
    <tr>
      <td><span class="badge badge-green">GET</span></td>
      <td><code>/api/patients?batch=true</code></td>
      <td><code>patientRoutes.js</code></td>
      <td>Retrieves authenticated caregiver's patient roster with batch-calculated reminder compliance.</td>
    </tr>
    <tr>
      <td><span class="badge badge-teal">POST</span></td>
      <td><code>/api/patients/login</code></td>
      <td><code>patientRoutes.js</code></td>
      <td>Validates senior tactile 4-digit PIN against bcrypt hash or biometric FIDO2 credential.</td>
    </tr>
    <tr>
      <td><span class="badge badge-purple">PATCH</span></td>
      <td><code>/api/reminders/:id</code></td>
      <td><code>reminderRoutes.js</code></td>
      <td>Toggles routine completion, updates adherence timeline, and cancels active alert escalation.</td>
    </tr>
    <tr>
      <td><span class="badge badge-green">GET</span></td>
      <td><code>/api/reminders/alerts</code></td>
      <td><code>reminderRoutes.js</code></td>
      <td>Fetches real-time active Red Flag alerts (>3 hours unacknowledged critical prescriptions).</td>
    </tr>
    <tr>
      <td><span class="badge badge-teal">POST</span></td>
      <td><code>/api/game-sessions</code></td>
      <td><code>gameRoutes.js</code></td>
      <td>Ingests millisecond round telemetry, score, mistakes, and proxies adaptive difficulty to ML engine.</td>
    </tr>
    <tr>
      <td><span class="badge badge-green">GET</span></td>
      <td><code>/api/game-sessions/ml-health-score/:id</code></td>
      <td><code>gameRoutes.js</code></td>
      <td>Fetches longitudinal AI Cognitive Health Score (0–100) and clinical category from Render ML.</td>
    </tr>
    <tr>
      <td><span class="badge badge-orange">POST</span></td>
      <td><code>/api/whatsapp</code></td>
      <td><code>whatsappWebhook.js</code></td>
      <td>Meta WhatsApp Cloud API Webhook receiver; synchronizes patient chat responses with MongoDB.</td>
    </tr>
  </tbody>
</table>

<h3>Database Schema Models (backend/models/)</h3>
<div class="grid-2">
  <div class="card">
    <h3>👴 Patient Schema (patient.js)</h3>
    <p>Stores patient identity, 4-digit bcrypt PIN hash, WebAuthn credentials, emergency contacts, primary doctor vitals, preferred NER state/language, and 10 daily routine reminders sub-documents.</p>
  </div>
  <div class="card">
    <h3>🩺 Caregiver Schema (Caregiver.js)</h3>
    <p>Clinician profile, bcrypt password hash, Google OAuth sub-ID, notification preferences (WhatsApp, SMS, Email), clinic affiliation, and associated patient reference arrays.</p>
  </div>
  <div class="card">
    <h3>🎮 GameSession Schema (GameSession.js)</h3>
    <p>Records CST game type, timestamp, score, difficulty level, duration, and granular <code>roundDetails</code> (accuracy %, attempts, correct count, time taken in seconds).</p>
  </div>
  <div class="card">
    <h3>⏰ Reminder Schema (Reminder.js)</h3>
    <p>Individual routine slot, scheduled time, period (Morning/Night), type (medicine, hydration, meal, game), status, acknowledged timestamp, and alert escalation flag.</p>
  </div>
</div>

<!-- ======================================================== -->
<!-- PAGE 4: MACHINE LEARNING, SECURITY & SEQUENCE DIAGRAMS -->
<!-- ======================================================== -->
<div class="page-break"></div>

<h2>🧠 4. Live Machine Learning & Gemini Multimodal AI Integration</h2>
<p>
  Smriti bridges live AI services across two specialized cloud layers: Google Gemini AI SDK for conversational companionship, and an independent Python FastAPI microservice on Render Cloud for deterministic cognitive metrics.
</p>

<div class="grid-2">
  <div class="card card-teal">
    <span class="badge badge-teal">Microservice: Render Cloud</span>
    <h3>Python FastAPI Cognitive ML Engine</h3>
    <p><b>Host:</b> <code>https://dementia-ai-engine.onrender.com</code></p>
    <ul style="margin:4px 0 0 0; padding-left:14px; font-size:7.5pt;">
      <li><code>POST /synthesize_speech</code>: Digital India Bhashini TTS Base64 audio stream.</li>
      <li><code>POST /get_next_difficulty</code>: Calculates next starting level based on reaction time and mistake curves.</li>
      <li><code>POST /calculate_health_score</code>: Evaluates 7-day CST performance into a 0–100 Clinical Index.</li>
      <li><b>Resilience:</b> Node backend implements a 6-second timeout with local rule-based heuristic fallback.</li>
    </ul>
  </div>
  <div class="card card-highlight">
    <span class="badge badge-green">Conversational AI</span>
    <h3>Google Gemini Multimodal Companion</h3>
    <p><b>SDK:</b> <code>@google/genai</code></p>
    <ul style="margin:4px 0 0 0; padding-left:14px; font-size:7.5pt;">
      <li>Grounded in active patient clinical context (medication schedules, doctor contact, family names).</li>
      <li>Processes natural speech voice input and provides empathetic, dementia-safe replies.</li>
      <li>Supports multilingual text and audio synthesis across Assamese, Hindi, and English.</li>
    </ul>
  </div>
</div>

<h2>🛡️ 5. Security, Hardware Biometrics & DPDP Act 2023 Compliance</h2>
<div class="grid-3">
  <div class="card">
    <h3>Hardware WebAuthn FIDO2</h3>
    <p>Public-key cryptographic authentication via on-device fingerprint/Face sensors. Raw biometric data never leaves the senior's device.</p>
  </div>
  <div class="card">
    <h3>DPDP Act 2023 Consent</h3>
    <p>Explicit consent audit checkboxes before Memory Bank photo uploads, explicit purpose limitation, and transparent privacy terms.</p>
  </div>
  <div class="card">
    <h3>30-Day Right to Erasure</h3>
    <p>Caregivers can trigger account deletion, executing an immediate database cascade and 30-day encrypted purge audit trail.</p>
  </div>
</div>

<h2>🔄 6. End-to-End Cognitive Telemetry Sequence Flow</h2>
<div class="code-block">
                                END-TO-END TELEMETRY & ADHERENCE DATA FLOW
┌─────────────────┐             ┌─────────────────┐             ┌─────────────────┐             ┌─────────────────┐
│ Senior Patient  │             │ React Frontend  │             │ Express Backend │             │ Render ML Engine│
└────────┬────────┘             └────────┬────────┘             └────────┬────────┘             └────────┬────────┘
         │                               │                               │                               │
         │ 1. Completes CST Game Round   │                               │                               │
         ├──────────────────────────────►│ 2. Captures ms Telemetry      │                               │
         │                               ├──────────────────────────────►│ 3. Proxy Telemetry to ML      │
         │                               │                               ├──────────────────────────────►│
         │                               │                               │ 4. Adaptive Difficulty Level  │
         │                               │                               │◄──────────────────────────────┤
         │                               │ 5. Save to Mongo Atlas        │                               │
         │                               │◄──────────────────────────────┤                               │
         │ 6. Audio Celebration Praise   │                               │                               │
         │◄──────────────────────────────┤                               │                               │
         │                               │                               │                               │
         │ 7. Missed Dose (>3h Overdue)  │                               │ 8. Node-Cron Detects Overdue  │
         │                               │                               ├──────────────────────────────┐│
         │                               │                               │ 9. Meta WhatsApp Cloud API   ││
         │                               │                               │◄─────────────────────────────┘│
         │ 10. WhatsApp Alert to Family  │                               │                               │
         │◄──────────────────────────────────────────────────────────────┤                               │
</div>

<div class="footer">
  <span><strong>🌸 Smriti Technical Architecture Dossier</strong> • Smart India Hackathon (SIH26003)</span>
  <span>Team Design Divas • Ministry of Development of North Eastern Region (MDoNER)</span>
</div>

</body>
</html>
`;

async function generateArchitecturePdf() {
  console.log('📝 Writing Architecture HTML to:', OUTPUT_HTML);
  fs.writeFileSync(OUTPUT_HTML, htmlContent, 'utf8');

  console.log('🚀 Launching Chrome for PDF generation from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.goto(`file://${OUTPUT_HTML}`, { waitUntil: 'networkidle0' });

  console.log('🖨️ Generating PDF at:', OUTPUT_PDF);
  await page.pdf({
    path: OUTPUT_PDF,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '12mm',
      right: '12mm',
      bottom: '12mm',
      left: '12mm'
    }
  });

  await browser.close();

  // Copy to root directory for convenient user download
  fs.copyFileSync(OUTPUT_PDF, ROOT_PDF);
  console.log('✅ PDF also copied to root directory:', ROOT_PDF);
  console.log('\n🎉 Complete Architecture PDF generated successfully!');
}

generateArchitecturePdf().catch(err => {
  console.error('Fatal error generating architecture PDF:', err);
  process.exit(1);
});
