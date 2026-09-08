const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Smriti (স্মৃতি) — SIH26003 Presentation Deck</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

  @page {
    size: 16in 9in;
    margin: 0;
  }

  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    margin: 0;
    padding: 0;
    background-color: #FAF7F2;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1E293B;
  }

  .slide {
    width: 16in;
    height: 9in;
    page-break-after: always;
    position: relative;
    padding: 0.65in 0.8in 0.5in 0.8in;
    background-color: #FAF7F2;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .slide-header {
    margin-bottom: 0.3in;
  }

  .category-badge {
    display: inline-block;
    background: #1E3A2F;
    color: #FFFFFF;
    font-size: 0.16in;
    font-weight: 800;
    letter-spacing: 1px;
    padding: 0.05in 0.18in;
    border-radius: 0.06in;
    text-transform: uppercase;
    margin-bottom: 0.08in;
  }

  .slide-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 0.42in;
    font-weight: 800;
    color: #0F172A;
    margin: 0 0 0.04in 0;
    line-height: 1.15;
  }

  .slide-subtitle {
    font-size: 0.2in;
    color: #475569;
    font-style: italic;
    margin: 0;
  }

  .slide-footer {
    position: absolute;
    bottom: 0.3in;
    left: 0.8in;
    right: 0.8in;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #E2E8F0;
    padding-top: 0.1in;
    font-size: 0.15in;
    color: #64748B;
  }

  /* Cards & Layouts */
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.3in;
  }

  .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.25in;
  }

  .grid-4 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 0.22in;
  }

  .card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 0.14in;
    padding: 0.25in 0.28in;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  }

  .card-forest { border-top: 5px solid #1E3A2F; }
  .card-terra { border-top: 5px solid #C25E2E; }
  .card-blue { border-top: 5px solid #1E40AF; }
  .card-amber { border-top: 5px solid #D97706; }

  .card h3 {
    font-size: 0.22in;
    margin: 0 0 0.08in 0;
    color: #0F172A;
    font-weight: 800;
  }

  .card p, .card li {
    font-size: 0.165in;
    color: #334155;
    line-height: 1.45;
  }

  ul {
    margin: 0.06in 0 0 0.22in;
    padding: 0;
  }

  li {
    margin-bottom: 0.06in;
  }

  /* Table styling */
  table {
    width: 100%;
    border-collapse: collapse;
    background: #FFFFFF;
    border-radius: 0.12in;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    font-size: 0.16in;
  }

  th {
    background: #1E3A2F;
    color: #FFFFFF;
    text-align: left;
    padding: 0.14in 0.18in;
    font-size: 0.16in;
    font-weight: 800;
    letter-spacing: 0.5px;
  }

  td {
    padding: 0.13in 0.18in;
    border-bottom: 1px solid #E2E8F0;
    color: #334155;
    vertical-align: top;
    line-height: 1.35;
  }

  tr:nth-child(even) td {
    background-color: #F8FAFC;
  }

  .tag {
    display: inline-block;
    padding: 0.04in 0.1in;
    border-radius: 0.06in;
    font-size: 0.13in;
    font-weight: 800;
    text-transform: uppercase;
  }

  .tag-done { background: #D1FAE5; color: #065F46; }
  .tag-partial { background: #FEF3C7; color: #92400E; }
  .tag-terra { background: #FDF2EB; color: #C25E2E; }
  .tag-blue { background: #EFF6FF; color: #1E40AF; }

  /* Hero Banner for Title & Thank You */
  .hero-banner {
    background: linear-gradient(135deg, #1E3A2F 0%, #2D5A49 60%, #C25E2E 100%);
    color: #FFFFFF;
    padding: 0.55in 0.65in;
    border-radius: 0.18in;
    margin-bottom: 0.35in;
    box-shadow: 0 8px 24px rgba(30, 58, 47, 0.2);
  }

  .hero-banner h1 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 0.58in;
    margin: 0 0 0.08in 0;
    font-weight: 900;
    letter-spacing: -0.5px;
  }

  .hero-banner h2 {
    font-size: 0.26in;
    color: #FDE68A;
    margin: 0 0 0.08in 0;
    font-weight: 700;
  }

  .hero-banner p {
    font-size: 0.19in;
    margin: 0;
    opacity: 0.95;
    font-style: italic;
  }
</style>
</head>
<body>

<!-- SLIDE 1: TITLE SLIDE -->
<div class="slide">
  <div class="hero-banner">
    <h1>🌸 Smriti (স্মৃতি / स्मृति)</h1>
    <h2>AI-Powered Cognitive Care & Memory Companion Platform</h2>
    <p>Culturally Attuned Dementia & Mild Cognitive Impairment (MCI) Support for North-Eastern India</p>
  </div>

  <div class="grid-3" style="margin-bottom: 0.3in;">
    <div class="card card-blue" style="text-align: center;">
      <span class="tag tag-blue">COMPETITION</span>
      <h3 style="margin-top: 0.08in;">Smart India Hackathon 2026</h3>
      <p style="margin:0; font-weight:700; color:#1E40AF;">Problem Statement: SIH26003</p>
    </div>
    <div class="card card-terra" style="text-align: center;">
      <span class="tag tag-terra">NODAL MINISTRY</span>
      <h3 style="margin-top: 0.08in;">Ministry of DoNER</h3>
      <p style="margin:0; font-weight:700; color:#C25E2E;">Govt. of India North East Focus</p>
    </div>
    <div class="card card-forest" style="text-align: center;">
      <span class="tag tag-done">DEVELOPMENT TEAM</span>
      <h3 style="margin-top: 0.08in;">Team Design Divas</h3>
      <p style="margin:0; font-weight:700; color:#065F46;">AI, Web, PWA & Clinical Telemetry</p>
    </div>
  </div>

  <div class="card" style="background:#FFFFFF; border: 1px solid #CBD5E1; padding: 0.22in 0.3in;">
    <h3 style="color:#C25E2E; margin-bottom: 0.08in; font-size: 0.18in;">🌟 CORE ARCHITECTURAL PILLARS</h3>
    <div class="grid-2" style="gap: 0.2in;">
      <div>
        <p style="margin:0.04in 0;">• <strong>5 Culturally Rooted Cognitive Games:</strong> NER heritage produce, instruments, and family recall.</p>
        <p style="margin:0.04in 0;">• <strong>Multimodal Voice & WhatsApp Bot:</strong> EN/HI live speech synthesis & automated WhatsApp check-ins.</p>
      </div>
      <div>
        <p style="margin:0.04in 0;">• <strong>100% Offline-First PWA:</strong> Workbox Service Worker + IndexedDB + Biometric WebAuthn login.</p>
        <p style="margin:0.04in 0;">• <strong>Caregiver Command Center:</strong> Real-time Red Flag alerts, ML cognitive scoring & DPDP 2023 compliance.</p>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <span>Smriti (স্মৃতি) • Team Design Divas • SIH26003 (MDoNER)</span>
    <span>Slide 1 / 14</span>
  </div>
</div>

<!-- SLIDE 2: PROBLEM STATEMENT -->
<div class="slide">
  <div class="slide-header">
    <div class="category-badge">Problem Statement</div>
    <h1 class="slide-title">SIH26003: Cognitive Care in North-Eastern India</h1>
    <p class="slide-subtitle">Empowering seniors with Alzheimer’s, Dementia & MCI through accessible digital intervention</p>
  </div>

  <div class="card" style="background: #FDF2EB; border: 1.5px solid #C25E2E; margin-bottom: 0.25in; padding: 0.18in 0.25in;">
    <p style="margin:0; font-size:0.17in; color:#0F172A;">
      <strong style="color:#C25E2E;">🚨 THE REGIONAL HEALTHCARE CHALLENGE:</strong> Dementia and MCI are critically underdiagnosed in North-Eastern India due to geographic isolation, scarce specialist access, low digital literacy, and intermittent rural connectivity. Seniors need non-stigmatizing daily cognitive stimulation and caregiver medication monitoring without technical friction.
    </p>
  </div>

  <div class="grid-2">
    <div class="card card-forest">
      <h3>📋 Core Requirements (a – d)</h3>
      <ul>
        <li><strong>(a) Culturally Attuned Games:</strong> Familiar Indian & NER regional contexts to maximize patient engagement.</li>
        <li><strong>(b) AI/ML Adaptive Difficulty:</strong> Dynamically tune game challenge based on round accuracy and cognitive history.</li>
        <li><strong>(c) Cross-Device & Offline Access:</strong> Reliable operation in remote hilly areas with zero connectivity.</li>
        <li><strong>(d) Multilingual Voice Support:</strong> Seamless regional language interaction (Assamese, Hindi, NE dialects).</li>
      </ul>
    </div>
    <div class="card card-terra">
      <h3>📋 Core Requirements (e – h)</h3>
      <ul>
        <li><strong>(e) Longitudinal Telemetry:</strong> Precise clinical tracking of memory scores, reaction times, and cognitive trends.</li>
        <li><strong>(f) Real-Time Red-Flag Alerts:</strong> Instant notifications to caregivers for missed routines & medication lapses.</li>
        <li><strong>(g) Low-Barrier Interaction:</strong> Hands-free voice guidance, WhatsApp chatbot, and oversized touch targets.</li>
        <li><strong>(h) DPDP Act 2023 Compliance:</strong> Explicit photo consent, AES-256 encryption, 30-day erasure guarantees.</li>
      </ul>
    </div>
  </div>

  <div class="slide-footer">
    <span>Smriti (স্মৃতি) • Team Design Divas • SIH26003 (MDoNER)</span>
    <span>Slide 2 / 14</span>
  </div>
</div>

<!-- SLIDE 3: THREE BARRIERS FRAMEWORK -->
<div class="slide">
  <div class="slide-header">
    <div class="category-badge">Solution Philosophy</div>
    <h1 class="slide-title">The Three Barriers Framework</h1>
    <p class="slide-subtitle">How Smriti’s architecture systematically eliminates structural elderly healthcare hurdles</p>
  </div>

  <div class="grid-3">
    <div class="card card-terra">
      <span class="tag tag-terra">BARRIER 1</span>
      <h3>Digital Literacy</h3>
      <p style="color:#64748B; font-weight:700; margin-bottom:0.06in;">Elderly Seniors & Dementia</p>
      <p><strong>The Challenge:</strong> Password fatigue, complex hierarchies, and fear of navigating intricate smartphone apps.</p>
      <p style="margin-top:0.12in; color:#C25E2E; font-weight:800;">Smriti Solution:</p>
      <ul>
        <li>Voice-first auto read-aloud on every screen</li>
        <li>WebAuthn 1-tap biometrics & 4-digit PIN</li>
        <li>WhatsApp Companion on familiar chat app</li>
        <li>56px tactile touch targets & warm contrast</li>
      </ul>
    </div>

    <div class="card card-blue">
      <span class="tag tag-blue">BARRIER 2</span>
      <h3>Connectivity & Power</h3>
      <p style="color:#64748B; font-weight:700; margin-bottom:0.06in;">Intermittent 2G/3G in NER</p>
      <p><strong>The Challenge:</strong> Frequent network blackouts in rural hills; seniors lose progress if disconnected.</p>
      <p style="margin-top:0.12in; color:#1E40AF; font-weight:800;">Smriti Solution:</p>
      <ul>
        <li>Standalone PWA app shell via Workbox</li>
        <li>IndexedDB caches patient profiles & routines</li>
        <li>Background sync auto-pushes offline data</li>
        <li>Ultra-fast, lightweight sub-second bundle</li>
      </ul>
    </div>

    <div class="card card-forest">
      <span class="tag tag-done">BARRIER 3</span>
      <h3>Language & Culture</h3>
      <p style="color:#64748B; font-weight:700; margin-bottom:0.06in;">Western Tests Alienating Patients</p>
      <p><strong>The Challenge:</strong> Standard clinical tests use foreign concepts, causing patient anxiety and false declines.</p>
      <p style="margin-top:0.12in; color:#065F46; font-weight:800;">Smriti Solution:</p>
      <ul>
        <li>NER Themes: Kaji Nemu, Bihu Dhol, Tulsi puja</li>
        <li>Multilingual UI: English, Hindi & Assamese</li>
        <li>Bhashini ULCA pipeline for NE dialects</li>
        <li>Family photo reminiscence therapy</li>
      </ul>
    </div>
  </div>

  <div class="slide-footer">
    <span>Smriti (স্মৃতি) • Team Design Divas • SIH26003 (MDoNER)</span>
    <span>Slide 3 / 14</span>
  </div>
</div>

<!-- SLIDE 4: TECH STACK OVERVIEW -->
<div class="slide">
  <div class="slide-header">
    <div class="category-badge">Technology Stack</div>
    <h1 class="slide-title">Full-Stack Architecture Specification</h1>
    <p class="slide-subtitle">Production-grade stack engineered for high responsiveness, resilience, and clinical reliability</p>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 22%;">Layer / Subsystem</th>
        <th style="width: 28%;">Technologies & Libraries</th>
        <th style="width: 50%;">Key Capabilities & Implementation Role</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Frontend Client</strong></td>
        <td>React 19, Vite 8, React Router v7, Tailwind CSS v4</td>
        <td>Sub-second rendering, tactile senior components, accessible 56px touch targets, warm theme.</td>
      </tr>
      <tr>
        <td><strong>Backend Server</strong></td>
        <td>Node.js, Express.js (v5), Node-Cron, Webhooks</td>
        <td>REST API, WebAuthn challenge verification, JWT middleware, automated scheduled cron triggers.</td>
      </tr>
      <tr>
        <td><strong>Database & Storage</strong></td>
        <td>MongoDB Atlas, Mongoose v9, IndexedDB (<code>idb</code>)</td>
        <td>Document storage for Patient profiles, Reminders, Photos, and Game telemetry with offline sync.</td>
      </tr>
      <tr>
        <td><strong>Conversational AI</strong></td>
        <td>Google Gemini AI SDK (<code>@google/genai</code>)</td>
        <td>Grounded in live MongoDB patient profile & routine data for empathetic, hallucination-free support.</td>
      </tr>
      <tr>
        <td><strong>ML Telemetry Engine</strong></td>
        <td>Python FastAPIs on Render (Live ML Service)</td>
        <td>Endpoints <code>/get_next_difficulty</code> (adaptive starting level) & <code>/calculate_health_score</code>.</td>
      </tr>
      <tr>
        <td><strong>Voice & Audio</strong></td>
        <td>Web Speech Synthesis & Recognition API</td>
        <td>Hands-free microphone voice queries and spoken audio read-aloud (Listen buttons) in EN/HI.</td>
      </tr>
      <tr>
        <td><strong>Messaging Gateway</strong></td>
        <td>Meta WhatsApp Business Cloud API (<code>wa.me</code>)</td>
        <td>Consolidated daily routine alerts, automated "DONE" response parsing & bi-directional bot check-ins.</td>
      </tr>
      <tr>
        <td><strong>Offline PWA</strong></td>
        <td><code>vite-plugin-pwa</code>, Workbox Service Worker</td>
        <td>Complete standalone app caching, background action sync queue, offline routine checklist.</td>
      </tr>
      <tr>
        <td><strong>Auth & Governance</strong></td>
        <td>WebAuthn (FIDO2), JWT (365-day), DPDP Act 2023</td>
        <td>Biometric 1-tap login, explicit photo upload consent, AES-256 encryption, Grievance Officer.</td>
      </tr>
    </tbody>
  </table>

  <div class="slide-footer">
    <span>Smriti (স্মৃতি) • Team Design Divas • SIH26003 (MDoNER)</span>
    <span>Slide 4 / 14</span>
  </div>
</div>

<!-- SLIDE 5: PATIENT PORTAL -->
<div class="slide">
  <div class="slide-header">
    <div class="category-badge">Patient Portal</div>
    <h1 class="slide-title">Senior-Centric Patient Experience</h1>
    <p class="slide-subtitle">Empowering independence through accessible design, time-aware horizons, and multi-modal guidance</p>
  </div>

  <div class="grid-3" style="gap: 0.22in;">
    <div class="card card-forest">
      <span class="tag tag-done">ENGAGEMENT</span>
      <h3>🎮 Games-First Dashboard</h3>
      <p>Prominently features cognitive games right on the home screen to encourage daily brain stimulation before checking routine tasks.</p>
    </div>
    <div class="card card-terra">
      <span class="tag tag-terra">ADHERENCE</span>
      <h3>⏰ Time-Aware Horizons</h3>
      <p>Smart time segmentation (Morning, Afternoon, Evening, Night) automatically surfaces active medications and hydration goals.</p>
    </div>
    <div class="card card-blue">
      <span class="tag tag-blue">ACCESSIBILITY</span>
      <h3>🔊 Universal Audio (Listen)</h3>
      <p>Every card and reminder features a high-contrast [🔊 Listen] button powered by Web Speech API for seniors with low reading literacy.</p>
    </div>
    <div class="card card-amber">
      <span class="tag tag-partial">CONVERSATIONAL</span>
      <h3>🤖 Grounded Gemini AI</h3>
      <p>Floating sparkle assistant with voice STT/TTS, answering health and schedule questions grounded dynamically in patient data.</p>
    </div>
    <div class="card card-forest">
      <span class="tag tag-done">COMMUNICATION</span>
      <h3>📱 1-Tap WhatsApp Bridge</h3>
      <p>Dedicated green launcher connecting seniors to the Smriti WhatsApp companion bot without searching phone contact lists.</p>
    </div>
    <div class="card card-terra">
      <span class="tag tag-terra">SECURITY</span>
      <h3>🔐 Frictionless Auth</h3>
      <p>1-Tap hardware biometric fingerprint/Face ID login or simplified 4-digit PIN pad with persistent 365-day sessions.</p>
    </div>
  </div>

  <div class="slide-footer">
    <span>Smriti (স্মৃতি) • Team Design Divas • SIH26003 (MDoNER)</span>
    <span>Slide 5 / 14</span>
  </div>
</div>

<!-- SLIDE 6: THE 5 COGNITIVE GAMES -->
<div class="slide">
  <div class="slide-header">
    <div class="category-badge">Cognitive Suite</div>
    <h1 class="slide-title">The 5 Culturally Attuned Cognitive Games</h1>
    <p class="slide-subtitle">Culturally familiar Indian & North-Eastern themes designed to maximize reminiscence and clinical telemetry</p>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Game Title</th>
        <th style="width: 23%;">Cognitive Domain</th>
        <th style="width: 26%;">Cultural Context (NER Theme)</th>
        <th style="width: 26%;">Clinical Goal & Mechanics</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Market Day Basket<br>(বজাৰৰ পাচি / बाज़ार की टोकरी)</strong></td>
        <td>Categorization, Visual Recall & Mental Math</td>
        <td>10 North-East produce items (Kaji Nemu, King Chilli, Assam Tea, Bamboo Shoot, Lai Xaak).</td>
        <td>Scales item count dynamically. Evaluates visual memory retention and price summation accuracy.</td>
      </tr>
      <tr>
        <td><strong>Daily Routine Sequencer<br>(দैनिक দিনচर्या क्रम)</strong></td>
        <td>Executive Function & Logical Step Sequencing</td>
        <td>Familiar Indian morning routines (brewing Assam tea, watering sacred Tulsi plant, morning bath).</td>
        <td>Measures chronological reasoning, step ordering logic, hesitation time, and error correction rates.</td>
      </tr>
      <tr>
        <td><strong>Faces & Family Recall<br>(চেহৰা আৰু পৰিয়াল / चेहरे और परिवार)</strong></td>
        <td>Reminiscence Therapy & Facial Memory</td>
        <td>Real family member portraits, generational relationships (Grandson, Daughter, Spouse).</td>
        <td>Reinforces facial recognition, reduces caregiver alienation, and tracks associative recall latency.</td>
      </tr>
      <tr>
        <td><strong>Sound & Rhythm Match<br>(শব্দ আৰু ছন্দ / ध्वनि और लय)</strong></td>
        <td>Auditory Perception & Pattern Memory</td>
        <td>Authentic regional instruments (Bihu Dhol, Pepa flute, Temple Bell, Shankha, Mridangam).</td>
        <td>Tests auditory sequence repetition, musical cadence recognition, and rhythmic reaction timing.</td>
      </tr>
      <tr>
        <td><strong>Odd One Out<br>(সুকীয়া বস্তু বাছনি / अलग पहचानें)</strong></td>
        <td>Semantic Discrimination & Category Boundaries</td>
        <td>Indigenous flora, fauna, traditional kitchen tools (Japi, Xorai), and cultural festivals.</td>
        <td>Detects semantic anomaly discrimination, visual processing latency, and category boundary confusion.</td>
      </tr>
    </tbody>
  </table>

  <div class="slide-footer">
    <span>Smriti (স্মৃতি) • Team Design Divas • SIH26003 (MDoNER)</span>
    <span>Slide 6 / 14</span>
  </div>
</div>

<!-- SLIDE 7: CAREGIVER COMMAND CENTER -->
<div class="slide">
  <div class="slide-header">
    <div class="category-badge">Caregiver Portal</div>
    <h1 class="slide-title">Clinical Caregiver Command Center</h1>
    <p class="slide-subtitle">Real-time supervision, compliance tracking, and longitudinal cognitive analytics for clinicians & families</p>
  </div>

  <div class="grid-2">
    <div class="card card-terra">
      <h3>🚨 Real-Time Red Flag Alerts</h3>
      <p style="color:#C25E2E; font-weight:700; margin-bottom:0.08in;">Instant Intervention for Lapsed Medication</p>
      <ul>
        <li>Real-time detection of unacknowledged critical prescriptions.</li>
        <li>1-Tap direct phone call button to immediately reach the patient.</li>
        <li>Database-persisted dismissal audit log with clinician acknowledgement.</li>
      </ul>
    </div>
    <div class="card card-blue">
      <h3>📊 7-Day Adherence Analytics</h3>
      <p style="color:#1E40AF; font-weight:700; margin-bottom:0.08in;">Deterministic Compliance Charts</p>
      <ul>
        <li>Longitudinal line charts tracking medication & hydration completion.</li>
        <li>10-slot customizable routine editor with time-of-day scheduling.</li>
        <li>Exportable clinical compliance logs for attending neurologists.</li>
      </ul>
    </div>
    <div class="card card-forest">
      <h3>🧠 Cognitive Telemetry Dashboard</h3>
      <p style="color:#065F46; font-weight:700; margin-bottom:0.08in;">Longitudinal Session Insights</p>
      <ul>
        <li>Deep analytics tracking reaction speed, hesitation time, and accuracy.</li>
        <li>Game-by-game breakdown across all 5 cognitive domains.</li>
        <li>Weekly Composite Cognitive Health index powered by AI ML API.</li>
      </ul>
    </div>
    <div class="card card-amber">
      <h3>👥 Multi-Patient Roster Management</h3>
      <p style="color:#D97706; font-weight:700; margin-bottom:0.08in;">Clinic & Hospital Multi-Tenancy</p>
      <ul>
        <li>Caregivers monitor multiple distinct patients across NER clinics.</li>
        <li>Strict per-caregiver data isolation with role-scoped JWT security.</li>
        <li>Rapid patient profile switching with individual photo galleries.</li>
      </ul>
    </div>
  </div>

  <div class="slide-footer">
    <span>Smriti (স্মৃতি) • Team Design Divas • SIH26003 (MDoNER)</span>
    <span>Slide 7 / 14</span>
  </div>
</div>

<!-- SLIDE 8: WHATSAPP COMPANION BOT -->
<div class="slide">
  <div class="slide-header">
    <div class="category-badge">Multi-Channel Outreach</div>
    <h1 class="slide-title">WhatsApp Companion Bot (Meta Cloud API)</h1>
    <p class="slide-subtitle">Meeting elderly patients on their most familiar messaging application without requiring app navigation</p>
  </div>

  <div class="grid-2" style="gap: 0.35in;">
    <div class="card" style="background:#E6F4EA; border:1.5px solid #1E3A2F;">
      <h3 style="color:#1E3A2F; margin-bottom:0.12in;">💬 Automated WhatsApp Bot Pipeline</h3>
      <ol style="margin-left: 0.22in; font-size: 0.165in; color:#1E293B; line-height: 1.55;">
        <li><strong>Node-Cron Daily Trigger:</strong> Evaluates patient routine times (09:00, 14:00, 20:00).</li>
        <li><strong>Meta Cloud API Outbound Dispatch:</strong> Sends consolidated WhatsApp reminder to patient phone.</li>
        <li><strong>1-Tap Link:</strong> <a href="https://wa.me/15556680031" target="_blank" style="color:#065F46; font-weight:700; text-decoration:underline;">wa.me/15556680031</a> — Patient receives alert or initiates conversation directly.</li>
        <li><strong>Automated "DONE" Acknowledgment:</strong> Replying "Done", "Ho gaya" or "হ’ল" ticks routine in DB.</li>
        <li><strong>Multi-Turn Gemini AI Webhook:</strong> Natural conversational Q&A grounded in patient context.</li>
      </ol>
    </div>

    <div>
      <div class="card card-forest" style="margin-bottom: 0.18in;">
        <h3>✓ Zero-Friction Routine Check-Ins</h3>
        <p>Consolidated daily routine schedules sent right to WhatsApp. Elderly users do not need to remember URLs or passwords.</p>
      </div>
      <div class="card card-blue" style="margin-bottom: 0.18in;">
        <h3>✓ Bidirectional Synchronization</h3>
        <p>When a senior marks a medicine done via WhatsApp, the Caregiver Command Center updates instantaneously in real time.</p>
      </div>
      <div class="card card-terra">
        <h3>✓ Empathetic Conversational Care</h3>
        <p>Powered by Gemini AI webhook integration, providing warm reassurance, memory prompts, and calming guidance.</p>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <span>Smriti (স্মৃতি) • Team Design Divas • SIH26003 (MDoNER)</span>
    <span>Slide 8 / 14</span>
  </div>
</div>

<!-- SLIDE 9: AI & ML ARCHITECTURE -->
<div class="slide">
  <div class="slide-header">
    <div class="category-badge">AI & ML Systems</div>
    <h1 class="slide-title">Dedicated AI & Machine Learning Architecture</h1>
    <p class="slide-subtitle">Rigorous, honest, and production-integrated AI systems for personalization and cognitive scoring</p>
  </div>

  <div class="grid-2">
    <div class="card card-blue">
      <span class="tag tag-blue">CONVERSATIONAL LLM</span>
      <h3>🤖 Google Gemini AI (Live)</h3>
      <ul>
        <li>In-app conversational companion powered by official <code>@google/genai</code> SDK.</li>
        <li><strong>Real-time Grounding:</strong> Injects MongoDB patient records (active medications, daily routines, family relations).</li>
        <li><strong>Dementia Guardrails:</strong> Calming tone, simple sentences, strictly avoids medical misinformation.</li>
      </ul>
    </div>

    <div class="card card-forest">
      <span class="tag tag-done">ADAPTIVE SCORING API</span>
      <h3>⚙️ Dedicated ML Engine on Render (Live)</h3>
      <ul>
        <li>Hosted at <a href="https://dementia-ai-engine.onrender.com" target="_blank" style="color:#065F46; font-weight:700; text-decoration:underline;">https://dementia-ai-engine.onrender.com</a> (Live Integration).</li>
        <li><code>POST /get_next_difficulty</code>: Evaluates past session history to calibrate adaptive starting difficulty.</li>
        <li><code>POST /calculate_health_score</code>: Computes 0-100 composite cognitive health index from telemetry.</li>
      </ul>
    </div>

    <div class="card card-terra">
      <span class="tag tag-terra">REAL-TIME SCALING</span>
      <h3>🔄 Within-Session Accuracy Adaptation</h3>
      <ul>
        <li>Round-to-round dynamic difficulty adjustment directly during gameplay.</li>
        <li>Low accuracy (&lt;60%) triggers automatic deceleration and prompt hints.</li>
        <li>High accuracy (&gt;85%) progressively introduces more complex item sets.</li>
        <li><strong>Offline Fallback:</strong> Deterministic heuristic calibration if API is disconnected.</li>
      </ul>
    </div>

    <div class="card card-amber">
      <span class="tag tag-partial">CLINICAL RIGOR</span>
      <h3>📊 Analytics Transparency & Classification</h3>
      <ul>
        <li><strong>7-Day Adherence Line Chart:</strong> Explicitly classified as deterministic MongoDB calculation from real daily routine completion logs.</li>
        <li><strong>Honest Separation:</strong> Clear demarcation between deterministic adherence telemetry and predictive/adaptive ML models.</li>
      </ul>
    </div>
  </div>

  <div class="slide-footer">
    <span>Smriti (স্মৃতি) • Team Design Divas • SIH26003 (MDoNER)</span>
    <span>Slide 9 / 14</span>
  </div>
</div>

<!-- SLIDE 10: BHASHINI MULTILINGUAL INTEGRATION -->
<div class="slide">
  <div class="slide-header">
    <div class="category-badge">Inclusivity & Languages</div>
    <h1 class="slide-title">Multilingual Access & Bhashini Integration</h1>
    <p class="slide-subtitle">Bridging linguistic diversity across North-East India through regional speech models</p>
  </div>

  <div class="grid-2">
    <div class="card card-forest">
      <h3 style="color:#065F46;">🟢 Current Production State (Live)</h3>
      <p style="margin-top:0.1in;"><strong>✓ Web Speech API (Voice Synthesis & Recognition):</strong></p>
      <p>Natural speech read-aloud and hands-free microphone input for English and Hindi (<code>hi-IN</code>) across all dashboards and games.</p>

      <p style="margin-top:0.12in;"><strong>✓ Assamese (অসমীয়া) UI Localization:</strong></p>
      <p>Complete internationalization covering patient navigation, reminders, routines, and cognitive game prompts.</p>

      <p style="margin-top:0.12in;"><strong>✓ Tactile Visual Signifiers:</strong></p>
      <p>Iconography, high-contrast color badges, and phonetic labels enabling non-readers to operate the app effortlessly.</p>
    </div>

    <div class="card card-terra">
      <h3 style="color:#C25E2E;">🚀 Bhashini Integration (In Progress)</h3>
      <p style="margin-top:0.1in;"><strong>⚡ Digital India Bhashini ULCA Pipeline:</strong></p>
      <p>Architecture designed to connect with Govt. of India Bhashini microservices for North-Eastern languages.</p>

      <p style="margin-top:0.12in;"><strong>⚡ Targeted NER Language Models:</strong></p>
      <p>Integration underway for native Assamese, Khasi, Mizo, and Bengali ASR (speech-to-text) and TTS (text-to-speech).</p>

      <p style="margin-top:0.12in;"><strong>⚡ Modular Microservice Adapter:</strong></p>
      <p>Backend API wrapper ready to route voice requests to Bhashini endpoints with offline fallback caching.</p>
    </div>
  </div>

  <div class="slide-footer">
    <span>Smriti (স্মৃতি) • Team Design Divas • SIH26003 (MDoNER)</span>
    <span>Slide 10 / 14</span>
  </div>
</div>

<!-- SLIDE 11: OFFLINE PWA & DATA PRIVACY -->
<div class="slide">
  <div class="slide-header">
    <div class="category-badge">Resilience & Governance</div>
    <h1 class="slide-title">Offline-First PWA & DPDP Act 2023 Compliance</h1>
    <p class="slide-subtitle">Engineered for rural network resilience and full compliance with Indian data protection laws</p>
  </div>

  <div class="grid-2">
    <div class="card card-blue">
      <h3 style="color:#1E40AF;">📴 Offline-First PWA Architecture</h3>
      <ul>
        <li><strong>Workbox Service Worker:</strong> Caches complete app bundle for standalone installation on Android, iOS, and PC.</li>
        <li><strong>IndexedDB Local Storage (<code>idb</code>):</strong> Caches senior profiles, family reminiscence photos, and 10 daily routines on device.</li>
        <li><strong>Resilient Action Sync Queue:</strong> Routine acknowledgements and game scores logged offline auto-sync when internet resumes.</li>
        <li><strong>Zero App Crash Policy:</strong> Graceful offline fallbacks prevent blank screens or connection error dialogs.</li>
      </ul>
    </div>

    <div class="card card-forest">
      <h3 style="color:#065F46;">🛡️ DPDP Act 2023 Compliance</h3>
      <ul>
        <li><strong>Mandatory Photo Consent Checkbox:</strong> Explicit caregiver agreement under DPDP 2023 required before uploading any senior portrait.</li>
        <li><strong>Public Legal Policy Route (<code>/privacy-policy</code>):</strong> Transparent disclosure of data types, processing purposes, and security safeguards.</li>
        <li><strong>AES-256 Storage & Scoped JWTs:</strong> Multi-tenant data isolation; biometrics remain on-device (FIDO2 public key standard).</li>
        <li><strong>30-Day Erasure & Grievance Redressal:</strong> Complete data erasure guarantee upon request with appointed Grievance Officer.</li>
      </ul>
    </div>
  </div>

  <div class="slide-footer">
    <span>Smriti (স্মৃতি) • Team Design Divas • SIH26003 (MDoNER)</span>
    <span>Slide 11 / 14</span>
  </div>
</div>

<!-- SLIDE 12: REQUIREMENT COVERAGE MATRIX -->
<div class="slide">
  <div class="slide-header">
    <div class="category-badge">Verification Matrix</div>
    <h1 class="slide-title">SIH26003 Requirement Coverage Matrix</h1>
    <p class="slide-subtitle">Comprehensive mapping of Smart India Hackathon problem statement specifications against Smriti delivery</p>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 8%;">Req</th>
        <th style="width: 32%;">SIH26003 Specification</th>
        <th style="width: 46%;">Smriti Implementation Details</th>
        <th style="width: 14%;">Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>(a)</strong></td>
        <td>Culturally Attuned Cognitive Games</td>
        <td>5 games themed around NER produce, instruments, routines, and family reminiscence.</td>
        <td><span class="tag tag-done">DONE (100%)</span></td>
      </tr>
      <tr>
        <td><strong>(b)</strong></td>
        <td>AI/ML Adaptive Difficulty Scaling</td>
        <td>Live Render ML API (<code>/get_next_difficulty</code>) + real-time within-session scaling.</td>
        <td><span class="tag tag-done">DONE (100%)</span></td>
      </tr>
      <tr>
        <td><strong>(c)</strong></td>
        <td>Cross-Device & Offline PWA Access</td>
        <td>Workbox service worker, IndexedDB local caching, and background sync queue.</td>
        <td><span class="tag tag-done">DONE (100%)</span></td>
      </tr>
      <tr>
        <td><strong>(d)</strong></td>
        <td>Multilingual Voice & Text Support</td>
        <td>Web Speech API (EN/HI live), Assamese UI live; Bhashini NER voice in progress.</td>
        <td><span class="tag tag-partial">PARTIAL (80%)</span></td>
      </tr>
      <tr>
        <td><strong>(e)</strong></td>
        <td>Longitudinal Cognitive Telemetry</td>
        <td>Reaction speed, accuracy metrics, session history, and ML health score index.</td>
        <td><span class="tag tag-done">DONE (100%)</span></td>
      </tr>
      <tr>
        <td><strong>(f)</strong></td>
        <td>Real-Time Red-Flag Caregiver Alerts</td>
        <td>Missed routine alerts, 1-tap patient calling button, and database dismissal audit.</td>
        <td><span class="tag tag-done">DONE (100%)</span></td>
      </tr>
      <tr>
        <td><strong>(g)</strong></td>
        <td>Low-Barrier Senior Interaction</td>
        <td>Voice-first read aloud, Meta WhatsApp bot, 56px touch targets, WebAuthn biometrics.</td>
        <td><span class="tag tag-done">DONE (100%)</span></td>
      </tr>
      <tr>
        <td><strong>(h)</strong></td>
        <td>Data Privacy & DPDP Compliance</td>
        <td>Mandatory consent checkboxes, AES-256 encryption, 30-day erasure, Grievance Officer.</td>
        <td><span class="tag tag-done">DONE (100%)</span></td>
      </tr>
    </tbody>
  </table>

  <div class="slide-footer">
    <span>Smriti (স্মৃতি) • Team Design Divas • SIH26003 (MDoNER)</span>
    <span>Slide 12 / 14</span>
  </div>
</div>

<!-- SLIDE 13: FUTURE ROADMAP -->
<div class="slide">
  <div class="slide-header">
    <div class="category-badge">Future Vision</div>
    <h1 class="slide-title">Scalability & Future Development Roadmap</h1>
    <p class="slide-subtitle">Expanding Smriti from a digital companion into a nationwide community healthcare infrastructure</p>
  </div>

  <div class="grid-4">
    <div class="card card-forest">
      <span class="tag tag-done">PHASE 1 (NEXT 30D)</span>
      <h3 style="margin-top:0.08in;">Full Bhashini Voice</h3>
      <p>Deploy native Assamese, Khasi, Mizo, and Bengali ASR/TTS models via Bhashini microservices for zero-barrier regional voice interactions.</p>
    </div>
    <div class="card card-blue">
      <span class="tag tag-blue">PHASE 2 (Q2 2026)</span>
      <h3 style="margin-top:0.08in;">Tier 2 IVR / SMS</h3>
      <p>Automated interactive voice response phone calls and SMS reminders for non-smartphone feature phones in remote hilly terrains.</p>
    </div>
    <div class="card card-terra">
      <span class="tag tag-terra">PHASE 3 (Q3 2026)</span>
      <h3 style="margin-top:0.08in;">Tier 3 ASHA Kiosk</h3>
      <p>Community tablet interface empowering ASHA healthcare workers to administer standardized weekly cognitive assessments in villages.</p>
    </div>
    <div class="card card-amber">
      <span class="tag tag-partial">PHASE 4 (Q4 2026)</span>
      <h3 style="margin-top:0.08in;">Predictive Decline AI</h3>
      <p>Multi-month longitudinal machine learning models predicting clinical decline trajectories and alerting clinicians prior to stage transitions.</p>
    </div>
  </div>

  <div class="slide-footer">
    <span>Smriti (স্মৃতি) • Team Design Divas • SIH26003 (MDoNER)</span>
    <span>Slide 13 / 14</span>
  </div>
</div>

<!-- SLIDE 14: THANK YOU / TEAM SLIDE -->
<div class="slide">
  <div class="hero-banner">
    <h1>🌸 Smriti (স্মৃতি / स्मृति)</h1>
    <h2>Restoring Dignity • Preserving Memories • Empowering Caregivers</h2>
    <p>Thank you to the Judges, Ministry of DoNER & Smart India Hackathon 2026</p>
  </div>

  <div class="grid-2">
    <div class="card card-terra">
      <h3 style="color:#C25E2E;">👥 Team Design Divas</h3>
      <ul>
        <li><strong>Competition:</strong> Smart India Hackathon 2026 Finalist Team</li>
        <li><strong>Problem Statement:</strong> SIH26003 (Ministry of DoNER)</li>
        <li><strong>Domain:</strong> AI-Augmented Healthcare & Cognitive Care</li>
        <li><strong>Contact:</strong> <a href="mailto:gopalrajlohiya2@gmail.com" style="color:#C25E2E; font-weight:700; text-decoration:underline;">gopalrajlohiya2@gmail.com</a></li>
      </ul>
    </div>

    <div class="card card-blue">
      <h3 style="color:#1E40AF;">🌐 Live Repository & Deployments</h3>
      <ul>
        <li><strong>Live Frontend:</strong> Deployed on Vercel SPA Engine</li>
        <li><strong>Live Backend:</strong> Node.js / MongoDB Atlas on Render</li>
        <li><strong>Live ML Engine:</strong> <a href="https://dementia-ai-engine.onrender.com" target="_blank" style="color:#1E40AF; font-weight:700; text-decoration:underline;">https://dementia-ai-engine.onrender.com</a></li>
        <li><strong>WhatsApp Bot:</strong> <a href="https://wa.me/15556680031" target="_blank" style="color:#1E40AF; font-weight:700; text-decoration:underline;">https://wa.me/15556680031</a></li>
      </ul>
    </div>
  </div>

  <div class="slide-footer">
    <span>Smriti (স্মৃতি) • Team Design Divas • SIH26003 (MDoNER)</span>
    <span>Slide 14 / 14</span>
  </div>
</div>

</body>
</html>
`;

const htmlPath = path.join('d:\\Design Divas\\docs', 'Smriti_SIH26003_Presentation.html');
const pdfPath = path.join('d:\\Design Divas\\docs', 'Smriti_SIH26003_Presentation.pdf');
const brainPdfPath = path.join('C:\\Users\\Admin\\.gemini\\antigravity\\brain\\59ecb97c-f629-4d21-ab31-179ae6e55398', 'Smriti_SIH26003_Presentation.pdf');

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('✅ HTML Slide Deck saved at:', htmlPath);

const chromePath = 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe';
const edgePath = 'C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe';
const browserExe = fs.existsSync(chromePath) ? chromePath : edgePath;

console.log('Using browser binary for PDF conversion:', browserExe);
const cmd = `"${browserExe}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${htmlPath}"`;
console.log('Executing PDF export...');
execSync(cmd);
console.log('✅ PDF successfully exported at:', pdfPath);

try {
  fs.copyFileSync(pdfPath, brainPdfPath);
  console.log('✅ PDF copied to artifact brain path:', brainPdfPath);
} catch (e) {
  console.warn('Could not copy to brain:', e.message);
}
