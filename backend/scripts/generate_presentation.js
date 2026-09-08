const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

async function generateDeck() {
  console.log('--- Initializing Smriti Presentation Generator ---');
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Team Design Divas';
  pptx.company = 'Smart India Hackathon 2026 (MDoNER)';
  pptx.title = 'Smriti (স্মৃতি) — AI-Powered Cognitive Care Platform';
  pptx.subject = 'SIH26003 Technical Presentation Deck';

  // Palette constants
  const C_CREAM = 'FAF7F2';
  const C_WHITE = 'FFFFFF';
  const C_DARK = '0F172A';
  const C_SLATE = '334155';
  const C_MUTED = '64748B';
  const C_FOREST = '1E3A2F';
  const C_FOREST_LIGHT = 'E6F4EA';
  const C_TERRA = 'C25E2E';
  const C_TERRA_LIGHT = 'FDF2EB';
  const C_AMBER = 'D97706';
  const C_AMBER_LIGHT = 'FEF3C7';
  const C_BLUE = '1E40AF';
  const C_BLUE_LIGHT = 'EFF6FF';
  const C_BORDER = 'E2E8F0';

  function addHeader(slide, category, title, subtitle) {
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.6, y: 0.4, w: 2.2, h: 0.32,
      fill: { color: C_FOREST },
      line: { color: C_FOREST }
    });
    slide.addText(category.toUpperCase(), {
      x: 0.6, y: 0.4, w: 2.2, h: 0.32,
      fontSize: 8.5, bold: true, color: C_WHITE,
      align: 'center', valign: 'middle'
    });

    slide.addText(title, {
      x: 0.6, y: 0.78, w: 12.0, h: 0.5,
      fontSize: 20, bold: true, color: C_DARK,
      fontFace: 'Calibri'
    });

    if (subtitle) {
      slide.addText(subtitle, {
        x: 0.6, y: 1.25, w: 12.0, h: 0.3,
        fontSize: 11, color: C_SLATE, italic: true,
        fontFace: 'Calibri'
      });
    }

    slide.addText('Smriti (স্মৃতি) • Team Design Divas • SIH26003 (MDoNER)', {
      x: 0.6, y: 7.0, w: 10.0, h: 0.3,
      fontSize: 8, color: C_MUTED
    });
  }

  // ==========================================
  // SLIDE 1: TITLE SLIDE
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_CREAM };

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 0.8, w: 11.7, h: 2.6,
      rectRadius: 0.15,
      fill: { color: C_FOREST },
      line: { color: C_FOREST }
    });

    slide.addText('🌸 SMRITI (স্মৃতি / स्मृति)', {
      x: 1.2, y: 1.0, w: 11.0, h: 0.6,
      fontSize: 28, bold: true, color: 'FFFFFF',
      fontFace: 'Calibri'
    });

    slide.addText('AI-Powered Cognitive Care & Memory Companion Platform', {
      x: 1.2, y: 1.65, w: 11.0, h: 0.4,
      fontSize: 15, bold: true, color: 'FDE68A',
      fontFace: 'Calibri'
    });

    slide.addText('Culturally Attuned Dementia & Mild Cognitive Impairment (MCI) Support for North-Eastern India', {
      x: 1.2, y: 2.1, w: 11.0, h: 0.35,
      fontSize: 11, color: 'FFFFFF', italic: true,
      fontFace: 'Calibri'
    });

    const metas = [
      { title: 'SMART INDIA HACKATHON 2026', desc: 'Problem Statement: SIH26003', bg: C_WHITE, border: C_BLUE },
      { title: 'MINISTRY OF DONER', desc: 'Govt. of India North East Focus', bg: C_WHITE, border: C_TERRA },
      { title: 'TEAM DESIGN DIVAS', desc: 'Full-Stack & ML Healthcare Solution', bg: C_WHITE, border: C_FOREST }
    ];

    metas.forEach((m, idx) => {
      const x = 0.8 + idx * 4.0;
      slide.addShape(pptx.ShapeType.roundRect, {
        x, y: 3.65, w: 3.7, h: 1.1,
        rectRadius: 0.1,
        fill: { color: m.bg },
        line: { color: m.border, width: 2 }
      });
      slide.addText(m.title, {
        x: x + 0.15, y: 3.75, w: 3.4, h: 0.35,
        fontSize: 10, bold: true, color: C_DARK, align: 'center'
      });
      slide.addText(m.desc, {
        x: x + 0.15, y: 4.1, w: 3.4, h: 0.5,
        fontSize: 9.5, color: C_SLATE, align: 'center'
      });
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 4.95, w: 11.7, h: 1.8,
      rectRadius: 0.1,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1 }
    });

    slide.addText('CORE ARCHITECTURAL PILLARS', {
      x: 1.0, y: 5.05, w: 11.3, h: 0.3,
      fontSize: 10, bold: true, color: C_TERRA
    });

    const pillars = [
      '• 5 Culturally Rooted Cognitive Games with NER Heritage Themes & Dynamic ML Difficulty Scaling',
      '• Multimodal Voice-First Experience (EN/HI Live + Assamese UI) & Meta WhatsApp Companion Bot',
      '• 100% Offline-First PWA (Workbox + IndexedDB) with Biometric Auth & Background Action Sync Queue',
      '• Clinical Caregiver Command Center with Real-Time Red Flag Alerts, Adherence Analytics & DPDP 2023 Compliance'
    ];

    slide.addText(pillars.join('\n'), {
      x: 1.0, y: 5.35, w: 11.3, h: 1.3,
      fontSize: 9.5, color: C_SLATE, lineSpacing: 18
    });
  }

  // ==========================================
  // SLIDE 2: PROBLEM STATEMENT (SIH26003)
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_CREAM };
    addHeader(slide, 'Problem Statement', 'SIH26003: Cognitive Care in North-Eastern India', 'Empowering seniors with Alzheimer’s, Dementia & MCI through accessible digital intervention');

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6, y: 1.6, w: 12.1, h: 1.0,
      rectRadius: 0.08,
      fill: { color: C_TERRA_LIGHT },
      line: { color: C_TERRA, width: 1.5 }
    });
    slide.addText('🚨 THE REGIONAL HEALTHCARE CHALLENGE', {
      x: 0.8, y: 1.68, w: 11.7, h: 0.25,
      fontSize: 9.5, bold: true, color: C_TERRA
    });
    slide.addText('Dementia and MCI remain severely underdiagnosed in North-Eastern India due to geographic isolation, limited specialist clinical access, language barriers, and intermittent rural connectivity. Seniors need daily cognitive stimulation and medication adherence monitoring without friction.', {
      x: 0.8, y: 1.95, w: 11.7, h: 0.55,
      fontSize: 9, color: C_DARK
    });

    const reqsCol1 = [
      { code: '(a)', title: 'Culturally Attuned Games', desc: 'Indian & NER regional contexts for familiar, engaging cognitive therapy.' },
      { code: '(b)', title: 'AI/ML Adaptive Difficulty', desc: 'Dynamically scale difficulty based on round-to-round patient accuracy.' },
      { code: '(c)', title: 'Offline & Cross-Device Access', desc: 'Work seamlessly in low-connectivity areas with local caching & sync.' },
      { code: '(d)', title: 'Multilingual Voice/Text', desc: 'Support local languages (Assamese, Hindi, NE languages) via voice STT/TTS.' }
    ];

    const reqsCol2 = [
      { code: '(e)', title: 'Cognitive Decline Telemetry', desc: 'Longitudinal monitoring of accuracy, reaction speed, and memory trends.' },
      { code: '(f)', title: 'Real-Time Red-Flag Alerts', desc: 'Instant caregiver notifications for missed medicines and routine lapses.' },
      { code: '(g)', title: 'Low-Barrier Senior UX', desc: 'Voice-first, WhatsApp chatbot, and oversized tactile touch targets.' },
      { code: '(h)', title: 'DPDP Act 2023 Compliance', desc: 'Explicit photo consent, AES-256 encryption, 30-day erasure policy.' }
    ];

    const renderReqList = (reqs, startX) => {
      reqs.forEach((r, idx) => {
        const y = 2.75 + idx * 1.0;
        slide.addShape(pptx.ShapeType.roundRect, {
          x: startX, y, w: 5.9, h: 0.9,
          rectRadius: 0.06,
          fill: { color: C_WHITE },
          line: { color: C_BORDER, width: 1 }
        });
        slide.addText(`${r.code} ${r.title}`, {
          x: startX + 0.15, y: y + 0.08, w: 5.6, h: 0.3,
          fontSize: 9.5, bold: true, color: C_FOREST
        });
        slide.addText(r.desc, {
          x: startX + 0.15, y: y + 0.38, w: 5.6, h: 0.45,
          fontSize: 8.5, color: C_SLATE
        });
      });
    };

    renderReqList(reqsCol1, 0.6);
    renderReqList(reqsCol2, 6.8);
  }

  // ==========================================
  // SLIDE 3: SOLUTION PHILOSOPHY (3 BARRIERS)
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_CREAM };
    addHeader(slide, 'Solution Philosophy', 'The Three Barriers Framework', 'How Smriti’s architecture systematically eliminates structural healthcare hurdles');

    const barriers = [
      {
        title: 'BARRIER 1: DIGITAL LITERACY',
        sub: 'Elderly Seniors & Cognitive Decline',
        color: C_TERRA,
        bg: C_TERRA_LIGHT,
        challenges: [
          '• Password fatigue & forgotten logins',
          '• Complex menu trees & tiny buttons',
          '• Anxiety navigating modern apps'
        ],
        solutions: [
          '✓ Voice-First: Auto read-aloud everywhere',
          '✓ WebAuthn 1-Tap Biometrics & 4-digit PIN',
          '✓ WhatsApp Companion Bot (wa.me)',
          '✓ 56px touch targets & warm contrast'
        ]
      },
      {
        title: 'BARRIER 2: CONNECTIVITY & POWER',
        sub: 'Intermittent 2G/3G in Remote NER',
        color: C_BLUE,
        bg: C_BLUE_LIGHT,
        challenges: [
          '• Frequent network drops in rural hills',
          '• Data loss when routine completed offline',
          '• Heavy apps failing on slow mobile data'
        ],
        solutions: [
          '✓ Standalone PWA shell via Workbox',
          '✓ IndexedDB: Caches profiles & 10 routines',
          '✓ Resilient Sync: Auto-sync on reconnect',
          '✓ Lightweight sub-second bundle size'
        ]
      },
      {
        title: 'BARRIER 3: LANGUAGE & CULTURE',
        sub: 'Western Tests Alienating Local Patients',
        color: C_FOREST,
        bg: C_FOREST_LIGHT,
        challenges: [
          '• Generic tests use foreign concepts',
          '• High anxiety during formal clinical tests',
          '• Lack of local North-Eastern dialects'
        ],
        solutions: [
          '✓ NER Themes: Kaji Nemu, Dhol, Tulsi',
          '✓ Multilingual UI: EN, HI & Assamese live',
          '✓ Bhashini Architecture for NE dialects',
          '✓ Family photo reminiscence therapy'
        ]
      }
    ];

    barriers.forEach((b, idx) => {
      const x = 0.6 + idx * 4.1;
      slide.addShape(pptx.ShapeType.roundRect, {
        x, y: 1.65, w: 3.9, h: 5.15,
        rectRadius: 0.1,
        fill: { color: C_WHITE },
        line: { color: b.color, width: 2 }
      });

      slide.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.15, y: 1.8, w: 3.6, h: 0.6,
        rectRadius: 0.05,
        fill: { color: b.bg },
        line: { color: b.color, width: 1 }
      });
      slide.addText(b.title, {
        x: x + 0.2, y: 1.85, w: 3.5, h: 0.25,
        fontSize: 9, bold: true, color: b.color, align: 'center'
      });
      slide.addText(b.sub, {
        x: x + 0.2, y: 2.1, w: 3.5, h: 0.25,
        fontSize: 8, color: C_SLATE, align: 'center'
      });

      slide.addText('CHALLENGES', {
        x: x + 0.2, y: 2.55, w: 3.5, h: 0.2,
        fontSize: 8.5, bold: true, color: C_MUTED
      });
      slide.addText(b.challenges.join('\n'), {
        x: x + 0.2, y: 2.75, w: 3.5, h: 1.3,
        fontSize: 8, color: C_SLATE, lineSpacing: 14
      });

      slide.addText('SMRITI ARCHITECTURAL SOLUTION', {
        x: x + 0.2, y: 4.15, w: 3.5, h: 0.2,
        fontSize: 8.5, bold: true, color: b.color
      });
      slide.addText(b.solutions.join('\n'), {
        x: x + 0.2, y: 4.4, w: 3.5, h: 2.2,
        fontSize: 8, color: C_DARK, bold: false, lineSpacing: 14
      });
    });
  }

  // ==========================================
  // SLIDE 4: TECH STACK OVERVIEW (TABLE)
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_CREAM };
    addHeader(slide, 'Technology Stack', 'Full-Stack Architecture Specification', 'Production-grade stack engineered for high responsiveness, resilience, and clinical reliability');

    const headers = [
      { text: 'LAYER / SUBSYSTEM', options: { fill: C_FOREST, color: C_WHITE, bold: true, fontSize: 9 } },
      { text: 'TECHNOLOGIES & LIBS', options: { fill: C_FOREST, color: C_WHITE, bold: true, fontSize: 9 } },
      { text: 'KEY CAPABILITIES & IMPLEMENTATION ROLE', options: { fill: C_FOREST, color: C_WHITE, bold: true, fontSize: 9 } }
    ];

    const rows = [
      ['Frontend UI / SPA', 'React 19, Vite 8, React Router v7, Tailwind CSS v4', 'Sub-second rendering, tactile senior components, accessible 56px touch targets, warm theme.'],
      ['Backend Server', 'Node.js, Express.js (v5), Node-Cron, Webhooks', 'REST API, WebAuthn challenge verification, JWT middleware, automated scheduled cron triggers.'],
      ['Database & Storage', 'MongoDB Atlas, Mongoose v9, IndexedDB (idb)', 'Document storage for Patient profiles, Reminders, Photos, and Game telemetry with offline sync.'],
      ['Conversational AI', 'Google Gemini AI SDK (@google/genai)', 'Grounded in live MongoDB patient profile & routine data for empathetic, hallucination-free support.'],
      ['ML Telemetry Engine', 'Python FastAPIs on Render (Live Dedicated ML Service)', 'Endpoints /get_next_difficulty (adaptive starting level) & /calculate_health_score (weekly index).'],
      ['Voice & Audio', 'Web Speech Synthesis & Recognition API', 'Hands-free microphone voice queries and spoken audio read-aloud (Listen buttons) in EN/HI.'],
      ['Messaging Gateway', 'Meta WhatsApp Business Cloud API (wa.me)', 'Consolidated daily routine alerts, automated "DONE" response parsing & bi-directional bot check-ins.'],
      ['Offline PWA', 'vite-plugin-pwa, Workbox Service Worker', 'Complete standalone app caching, background action sync queue, offline routine checklist.'],
      ['Auth & Governance', 'WebAuthn (FIDO2), JWT (365-day), DPDP Act 2023', 'Biometric 1-tap login, explicit photo upload consent, AES-256 encryption, Grievance Officer.']
    ];

    const tableData = [headers, ...rows.map(r => [
      { text: r[0], options: { bold: true, color: C_DARK, fontSize: 8.5 } },
      { text: r[1], options: { color: C_FOREST, fontSize: 8 } },
      { text: r[2], options: { color: C_SLATE, fontSize: 8 } }
    ])];

    slide.addTable(tableData, {
      x: 0.6, y: 1.6, w: 12.1,
      colW: [2.2, 3.2, 6.7],
      border: { color: C_BORDER, width: 1 },
      fill: { color: C_WHITE }
    });
  }

  // ==========================================
  // SLIDE 5: PATIENT PORTAL
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_CREAM };
    addHeader(slide, 'Patient Portal', 'Senior-Centric Patient Experience', 'Empowering independence through accessible design, time-aware horizons, and multi-modal guidance');

    const features = [
      {
        icon: '🎮',
        title: 'Games-First Dashboard',
        desc: 'Prominently features cognitive games right on the home screen to encourage daily brain engagement before daily routines.',
        badge: 'ENGAGEMENT'
      },
      {
        icon: '⏰',
        title: 'Time-Aware Horizon Routines',
        desc: 'Smart time segmentation (Morning, Afternoon, Evening, Night) automatically surfaces active medications and hydration goals.',
        badge: 'ADHERENCE'
      },
      {
        icon: '🔊',
        title: 'Universal Spoken Audio (Listen)',
        desc: 'Every card and reminder features a high-contrast [🔊 Listen] button powered by Web Speech API for low-literacy seniors.',
        badge: 'ACCESSIBILITY'
      },
      {
        icon: '🤖',
        title: 'Grounded Gemini AI Companion',
        desc: 'Floating sparkle assistant with voice STT/TTS, answering health and schedule questions grounded in real patient data.',
        badge: 'CONVERSATIONAL'
      },
      {
        icon: '📱',
        title: 'Direct WhatsApp Bridge',
        desc: '1-Tap launch button connecting seniors to the Smriti WhatsApp companion bot without navigating phone address books.',
        badge: 'COMMUNICATION'
      },
      {
        icon: '🔐',
        title: 'Frictionless Senior Auth',
        desc: '1-Tap hardware biometric fingerprint/Face ID login or simplified 4-digit PIN pad with persistent 365-day sessions.',
        badge: 'SECURITY'
      }
    ];

    features.forEach((f, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = 0.6 + col * 4.1;
      const y = 1.7 + row * 2.5;

      slide.addShape(pptx.ShapeType.roundRect, {
        x, y, w: 3.9, h: 2.3,
        rectRadius: 0.08,
        fill: { color: C_WHITE },
        line: { color: C_BORDER, width: 1.5 }
      });

      slide.addShape(pptx.ShapeType.rect, {
        x: x + 0.15, y: y + 0.15, w: 1.2, h: 0.25,
        fill: { color: C_TERRA_LIGHT },
        line: { color: C_TERRA, width: 0.5 }
      });
      slide.addText(f.badge, {
        x: x + 0.15, y: y + 0.15, w: 1.2, h: 0.25,
        fontSize: 7, bold: true, color: C_TERRA, align: 'center', valign: 'middle'
      });

      slide.addText(`${f.icon} ${f.title}`, {
        x: x + 0.15, y: y + 0.48, w: 3.6, h: 0.35,
        fontSize: 10.5, bold: true, color: C_DARK
      });

      slide.addText(f.desc, {
        x: x + 0.15, y: y + 0.88, w: 3.6, h: 1.3,
        fontSize: 8.5, color: C_SLATE, lineSpacing: 15
      });
    });
  }

  // ==========================================
  // SLIDE 6: THE 5 COGNITIVE GAMES (TABLE)
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_CREAM };
    addHeader(slide, 'Cognitive Suite', 'The 5 Culturally Attuned Cognitive Games', 'Culturally familiar Indian & North-Eastern themes designed to maximize reminiscence and clinical telemetry');

    const headers = [
      { text: 'GAME TITLE', options: { fill: C_FOREST, color: C_WHITE, bold: true, fontSize: 8.5 } },
      { text: 'COGNITIVE DOMAIN', options: { fill: C_FOREST, color: C_WHITE, bold: true, fontSize: 8.5 } },
      { text: 'CULTURAL CONTEXT (NER THEME)', options: { fill: C_FOREST, color: C_WHITE, bold: true, fontSize: 8.5 } },
      { text: 'CLINICAL GOAL & MECHANICS', options: { fill: C_FOREST, color: C_WHITE, bold: true, fontSize: 8.5 } }
    ];

    const games = [
      [
        'Market Day Basket\n(বজাৰৰ পাচি / बाज़ार की टोकरी)',
        'Categorization, Visual Recall & Mental Math',
        '10 North-East produce items: Kaji Nemu, King Chilli (Bhut Jolokia), Assam Tea, Bamboo Shoot, Lai Xaak.',
        'Scales item count dynamically. Evaluates visual memory retention and price summation accuracy.'
      ],
      [
        'Daily Routine Sequencer\n(दैनिक दिनचर्या क्रम)',
        'Executive Function & Logical Step Sequencing',
        'Familiar Indian morning routines: Brewing Assam tea, watering sacred Tulsi plant, morning bath.',
        'Measures chronological reasoning, step ordering logic, hesitation time, and error correction rates.'
      ],
      [
        'Faces & Family Recall\n(চেহৰা আৰু পৰিয়াল / चेहरे और परिवार)',
        'Reminiscence Therapy & Facial Memory',
        'Real family member portraits, generational relationships (Grandson, Daughter, Spouse), and ancestral memories.',
        'Reinforces facial recognition, reduces caregiver alienation, and tracks associative recall latency.'
      ],
      [
        'Sound & Rhythm Match\n(শব্দ আৰু ছন্দ / ध्वनि और लय)',
        'Auditory Perception & Pattern Memory',
        'Authentic regional instruments: Bihu Dhol, Pepa flute, Temple Bell, Shankha, Mridangam.',
        'Tests auditory sequence repetition, musical cadence recognition, and rhythmic reaction timing.'
      ],
      [
        'Odd One Out\n(সুকীয়া বস্তু বাছনি / अलग पहचानें)',
        'Semantic Discrimination & Category Boundaries',
        'Indigenous flora, fauna, traditional kitchen tools (Japi, Xorai), and cultural festival elements.',
        'Detects semantic anomaly discrimination, visual processing latency, and category boundary confusion.'
      ]
    ];

    const tableData = [headers, ...games.map(g => [
      { text: g[0], options: { bold: true, color: C_DARK, fontSize: 8 } },
      { text: g[1], options: { bold: true, color: C_TERRA, fontSize: 7.5 } },
      { text: g[2], options: { color: C_FOREST, fontSize: 7.5 } },
      { text: g[3], options: { color: C_SLATE, fontSize: 7.5 } }
    ])];

    slide.addTable(tableData, {
      x: 0.6, y: 1.6, w: 12.1,
      colW: [2.6, 2.5, 3.4, 3.6],
      border: { color: C_BORDER, width: 1 },
      fill: { color: C_WHITE }
    });
  }

  // ==========================================
  // SLIDE 7: CAREGIVER COMMAND CENTER
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_CREAM };
    addHeader(slide, 'Caregiver Portal', 'Clinical Caregiver Command Center', 'Real-time supervision, compliance tracking, and longitudinal cognitive analytics for clinicians & families');

    const caregiverCards = [
      {
        title: '🚨 Real-Time Red Flag Alerts',
        sub: 'Instant Intervention for Lapsed Medication',
        points: [
          '• Real-time detection of unacknowledged critical prescriptions',
          '• 1-Tap direct phone call button to immediately reach the patient',
          '• Database-persisted dismissal audit log with clinician acknowledgement'
        ],
        border: C_TERRA
      },
      {
        title: '📊 7-Day Adherence Analytics',
        sub: 'Deterministic Compliance Charts',
        points: [
          '• Longitudinal line charts tracking medication & hydration completion',
          '• 10-slot customizable routine editor with time-of-day scheduling',
          '• Exportable clinical compliance logs for attending neurologists'
        ],
        border: C_BLUE
      },
      {
        title: '🧠 Cognitive Telemetry Dashboard',
        sub: 'Longitudinal Session Insights',
        points: [
          '• Deep analytics tracking reaction speed, hesitation time, and accuracy',
          '• Game-by-game breakdown across all 5 cognitive domains',
          '• Weekly Composite Cognitive Health index powered by AI ML API'
        ],
        border: C_FOREST
      },
      {
        title: '👥 Multi-Patient Roster Management',
        sub: 'Clinic & Hospital Multi-Tenancy',
        points: [
          '• Caregivers monitor multiple distinct patients across NER clinics',
          '• Strict per-caregiver data isolation with role-scoped JWT security',
          '• Rapid patient profile switching with individual photo galleries'
        ],
        border: C_AMBER
      }
    ];

    caregiverCards.forEach((c, idx) => {
      const x = (idx % 2 === 0) ? 0.6 : 6.8;
      const y = idx < 2 ? 1.7 : 4.4;

      slide.addShape(pptx.ShapeType.roundRect, {
        x, y, w: 5.9, h: 2.5,
        rectRadius: 0.08,
        fill: { color: C_WHITE },
        line: { color: c.border, width: 2 }
      });

      slide.addText(c.title, {
        x: x + 0.2, y: y + 0.15, w: 5.5, h: 0.35,
        fontSize: 11, bold: true, color: C_DARK
      });

      slide.addText(c.sub, {
        x: x + 0.2, y: y + 0.5, w: 5.5, h: 0.25,
        fontSize: 8.5, color: C_MUTED, italic: true
      });

      slide.addText(c.points.join('\n'), {
        x: x + 0.2, y: y + 0.85, w: 5.5, h: 1.5,
        fontSize: 8.5, color: C_SLATE, lineSpacing: 17
      });
    });
  }

  // ==========================================
  // SLIDE 8: WHATSAPP COMPANION BOT
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_CREAM };
    addHeader(slide, 'Multi-Channel Outreach', 'WhatsApp Companion Bot (Meta Cloud API)', 'Meeting elderly patients on their most familiar messaging application without requiring app navigation');

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6, y: 1.7, w: 5.2, h: 5.0,
      rectRadius: 0.1,
      fill: { color: C_FOREST_LIGHT },
      line: { color: C_FOREST, width: 1.5 }
    });

    slide.addText('💬 WHATSAPP BOT WORKFLOW', {
      x: 0.8, y: 1.85, w: 4.8, h: 0.3,
      fontSize: 10, bold: true, color: C_FOREST
    });

    const flowSteps = [
      '1. Node-Cron Daily Trigger\n   Evaluates patient schedule times (09:00, 14:00, 20:00).',
      '2. Meta Cloud API Outbound Dispatch\n   Sends consolidated WhatsApp reminder to patient phone.',
      '3. 1-Tap Link (wa.me/15556680031)\n   Patient receives reminder or initiates chat directly.',
      '4. Automated "DONE" Acknowledgment\n   Replying "Done", "Ho gaya" or "হ’ল" ticks routine in DB.',
      '5. Multi-Turn Gemini AI Webhook\n   Natural conversational Q&A grounded in patient context.'
    ];

    slide.addText(flowSteps.join('\n\n'), {
      x: 0.8, y: 2.25, w: 4.8, h: 4.2,
      fontSize: 8.5, color: C_DARK, lineSpacing: 14
    });

    const rightCards = [
      {
        title: 'Zero-Friction Routine Check-Ins',
        desc: 'Consolidated daily routine schedules sent right to WhatsApp. Elderly users do not need to remember URLs or passwords.'
      },
      {
        title: 'Bidirectional Adherence Synchronization',
        desc: 'When a senior marks a medicine done via WhatsApp, the Caregiver Command Center updates instantaneously in real time.'
      },
      {
        title: 'Empathetic Conversational Care',
        desc: 'Powered by Gemini AI webhook integration, providing warm reassurance, memory prompts, and calming guidance.'
      }
    ];

    rightCards.forEach((rc, idx) => {
      const y = 1.7 + idx * 1.65;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 6.1, y, w: 6.6, h: 1.45,
        rectRadius: 0.08,
        fill: { color: C_WHITE },
        line: { color: C_BORDER, width: 1.5 }
      });
      slide.addText(`✓ ${rc.title}`, {
        x: 6.3, y: y + 0.15, w: 6.2, h: 0.3,
        fontSize: 10, bold: true, color: C_FOREST
      });
      slide.addText(rc.desc, {
        x: 6.3, y: y + 0.5, w: 6.2, h: 0.85,
        fontSize: 8.5, color: C_SLATE, lineSpacing: 14
      });
    });
  }

  // ==========================================
  // SLIDE 9: AI & ML ARCHITECTURE (HONEST & RIGOROUS)
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_CREAM };
    addHeader(slide, 'AI & ML Systems', 'Dedicated AI & Machine Learning Architecture', 'Rigorous, honest, and production-integrated AI systems for personalization and cognitive scoring');

    const aiPillars = [
      {
        title: '🤖 GOOGLE GEMINI AI (LIVE)',
        badge: 'CONVERSATIONAL LLM',
        color: C_BLUE,
        bg: C_BLUE_LIGHT,
        points: [
          '• In-app conversational companion powered by @google/genai SDK',
          '• Real-time Memory Grounding: Injects MongoDB patient records (active medications, daily routines, family relations)',
          '• Empathetic Dementia Guardrails: Calming tone, simple sentences, no hallucinated medical advice'
        ]
      },
      {
        title: '⚙️ DEDICATED ML ENGINE ON RENDER (LIVE)',
        badge: 'ADAPTIVE SCORING API',
        color: C_FOREST,
        bg: C_FOREST_LIGHT,
        points: [
          '• Hosted at https://dementia-ai-engine.onrender.com (Live Integration)',
          '• POST /get_next_difficulty: Evaluates past session history to set adaptive starting difficulty (e.g. starting item count 3 vs 4 vs 5)',
          '• POST /calculate_health_score: Computes 0-100 composite cognitive health index from reaction time, memory recall, and accuracy'
        ]
      },
      {
        title: '🔄 WITHIN-SESSION ACCURACY ADAPTATION',
        badge: 'REAL-TIME SCALING',
        color: C_TERRA,
        bg: C_TERRA_LIGHT,
        points: [
          '• Round-to-round dynamic difficulty adjustment directly during gameplay',
          '• Low accuracy (<60%) triggers automatic deceleration & prompt hints',
          '• High accuracy (>85%) progressively introduces more complex item sets',
          '• Offline Fallback: Deterministic heuristic calibration if API is offline'
        ]
      },
      {
        title: '📊 ANALYTICS TRANSPARENCY & CLASSIFICATION',
        badge: 'CLINICAL RIGOR',
        color: C_AMBER,
        bg: C_AMBER_LIGHT,
        points: [
          '• 7-Day Adherence Line Chart: Explicitly classified as deterministic MongoDB calculation from real daily routine completion logs',
          '• Honest Separation: Clear demarcation between deterministic adherence telemetry and predictive/adaptive ML models'
        ]
      }
    ];

    aiPillars.forEach((p, idx) => {
      const x = (idx % 2 === 0) ? 0.6 : 6.8;
      const y = idx < 2 ? 1.7 : 4.4;

      slide.addShape(pptx.ShapeType.roundRect, {
        x, y, w: 5.9, h: 2.5,
        rectRadius: 0.08,
        fill: { color: C_WHITE },
        line: { color: p.color, width: 2 }
      });

      slide.addShape(pptx.ShapeType.rect, {
        x: x + 0.2, y: y + 0.15, w: 1.8, h: 0.22,
        fill: { color: p.bg },
        line: { color: p.color, width: 0.5 }
      });
      slide.addText(p.badge, {
        x: x + 0.2, y: y + 0.15, w: 1.8, h: 0.22,
        fontSize: 6.5, bold: true, color: p.color, align: 'center', valign: 'middle'
      });

      slide.addText(p.title, {
        x: x + 0.2, y: y + 0.42, w: 5.5, h: 0.3,
        fontSize: 9.5, bold: true, color: C_DARK
      });

      slide.addText(p.points.join('\n'), {
        x: x + 0.2, y: y + 0.78, w: 5.5, h: 1.6,
        fontSize: 8, color: C_SLATE, lineSpacing: 14
      });
    });
  }

  // ==========================================
  // SLIDE 10: BHASHINI MULTILINGUAL INTEGRATION
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_CREAM };
    addHeader(slide, 'Inclusivity & Languages', 'Multilingual Access & Bhashini Integration', 'Bridging linguistic diversity across North-East India through regional speech models');

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6, y: 1.7, w: 5.9, h: 5.0,
      rectRadius: 0.1,
      fill: { color: C_WHITE },
      line: { color: C_FOREST, width: 2 }
    });

    slide.addText('🟢 CURRENT PRODUCTION STATE (LIVE)', {
      x: 0.8, y: 1.85, w: 5.5, h: 0.3,
      fontSize: 11, bold: true, color: C_FOREST
    });

    const liveItems = [
      '✓ Web Speech API (Voice Synthesis & Recognition)\n   Natural speech read-aloud and hands-free microphone input for English and Hindi (hi-IN) across all pages.',
      '✓ Assamese (অসমীয়া) UI Localization\n   Complete internationalization covering patient navigation, reminders, routines, and cognitive game prompts.',
      '✓ Tactile Visual Signifiers\n   Iconography, high-contrast color badges, and phonetic labels enabling non-readers to operate the app effortlessly.',
      '✓ Resilient Audio Fallback\n   Gracefully handles browser audio engine variances across Android, iOS, and desktop browsers.'
    ];

    slide.addText(liveItems.join('\n\n'), {
      x: 0.8, y: 2.25, w: 5.5, h: 4.2,
      fontSize: 8.5, color: C_DARK, lineSpacing: 14
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.8, y: 1.7, w: 5.9, h: 5.0,
      rectRadius: 0.1,
      fill: { color: C_WHITE },
      line: { color: C_TERRA, width: 2 }
    });

    slide.addText('🚀 BHASHINI INTEGRATION (IN PROGRESS)', {
      x: 7.0, y: 1.85, w: 5.5, h: 0.3,
      fontSize: 11, bold: true, color: C_TERRA
    });

    const bhashiniItems = [
      '⚡ Digital India Bhashini ULCA Pipeline\n   Architecture designed to connect with Govt. of India Bhashini microservices for North-Eastern languages.',
      '⚡ Targeted NER Language Models\n   Integration underway for native Assamese, Khasi, Mizo, and Bengali ASR (speech-to-text) and TTS (text-to-speech).',
      '⚡ Modular Microservice Adapter\n   Backend API wrapper ready to route voice requests to Bhashini endpoints with offline fallback caching.',
      '⚡ Dialect Adaptation & Cultural Nuance\n   Tailored acoustic models to understand local accents and elderly speech cadences accurately.'
    ];

    slide.addText(bhashiniItems.join('\n\n'), {
      x: 7.0, y: 2.25, w: 5.5, h: 4.2,
      fontSize: 8.5, color: C_SLATE, lineSpacing: 14
    });
  }

  // ==========================================
  // SLIDE 11: OFFLINE PWA & DATA PRIVACY
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_CREAM };
    addHeader(slide, 'Resilience & Governance', 'Offline-First PWA & DPDP Act 2023 Compliance', 'Engineered for rural network resilience and full compliance with Indian data protection laws');

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6, y: 1.7, w: 5.9, h: 5.0,
      rectRadius: 0.1,
      fill: { color: C_WHITE },
      line: { color: C_BLUE, width: 2 }
    });

    slide.addText('📴 OFFLINE-FIRST PWA ARCHITECTURE', {
      x: 0.8, y: 1.85, w: 5.5, h: 0.3,
      fontSize: 11, bold: true, color: C_BLUE
    });

    const pwaPoints = [
      '• Workbox Service Worker: Caches complete app bundle for standalone installation on Android, iOS, and PC.',
      '• IndexedDB Local Storage (idb): Caches senior profiles, family reminiscence photos, and 10 daily routines on device.',
      '• Resilient Action Sync Queue: Routine acknowledgements and game scores logged offline auto-sync when internet resumes.',
      '• Zero App Crash Policy: Graceful offline fallbacks prevent blank screens or connection error dialogs.'
    ];

    slide.addText(pwaPoints.join('\n\n'), {
      x: 0.8, y: 2.3, w: 5.5, h: 4.2,
      fontSize: 8.5, color: C_SLATE, lineSpacing: 14
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.8, y: 1.7, w: 5.9, h: 5.0,
      rectRadius: 0.1,
      fill: { color: C_WHITE },
      line: { color: C_FOREST, width: 2 }
    });

    slide.addText('🛡️ DPDP ACT 2023 COMPLIANCE', {
      x: 7.0, y: 1.85, w: 5.5, h: 0.3,
      fontSize: 11, bold: true, color: C_FOREST
    });

    const dpdpPoints = [
      '• Mandatory Photo Consent Checkbox: Explicit caregiver agreement under DPDP 2023 required before uploading any senior portrait.',
      '• Public Legal Policy Route (/privacy-policy): Transparent disclosure of data types, processing purposes, and security safeguards.',
      '• AES-256 Storage & Scoped JWTs: Multi-tenant data isolation; biometrics remain on-device (FIDO2 public key standard).',
      '• 30-Day Erasure & Grievance Redressal: Complete data erasure guarantee upon request with appointed Grievance Officer.'
    ];

    slide.addText(dpdpPoints.join('\n\n'), {
      x: 7.0, y: 2.3, w: 5.5, h: 4.2,
      fontSize: 8.5, color: C_DARK, lineSpacing: 14
    });
  }

  // ==========================================
  // SLIDE 12: REQUIREMENT COVERAGE MATRIX
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_CREAM };
    addHeader(slide, 'Verification Matrix', 'SIH26003 Requirement Coverage Matrix', 'Comprehensive mapping of Smart India Hackathon problem statement specifications against Smriti delivery');

    const headers = [
      { text: 'REQ', options: { fill: C_FOREST, color: C_WHITE, bold: true, fontSize: 8.5 } },
      { text: 'SIH26003 SPECIFICATION', options: { fill: C_FOREST, color: C_WHITE, bold: true, fontSize: 8.5 } },
      { text: 'SMRITI IMPLEMENTATION & STATUS', options: { fill: C_FOREST, color: C_WHITE, bold: true, fontSize: 8.5 } },
      { text: 'STATUS', options: { fill: C_FOREST, color: C_WHITE, bold: true, fontSize: 8.5 } }
    ];

    const matrix = [
      ['(a)', 'Culturally Attuned Cognitive Games', '5 games themed around NER produce, instruments, routines, and family reminiscence.', 'DONE (100%)'],
      ['(b)', 'AI/ML Adaptive Difficulty Scaling', 'Live Render ML API (/get_next_difficulty) + real-time within-session scaling.', 'DONE (100%)'],
      ['(c)', 'Cross-Device & Offline PWA Access', 'Workbox service worker, IndexedDB local caching, and background sync queue.', 'DONE (100%)'],
      ['(d)', 'Multilingual Voice & Text Support', 'Web Speech API (EN/HI live), Assamese UI live; Bhashini NER voice in progress.', 'PARTIAL (80%)'],
      ['(e)', 'Longitudinal Cognitive Decline Telemetry', 'Reaction speed, accuracy metrics, session history, and ML health score index.', 'DONE (100%)'],
      ['(f)', 'Real-Time Red-Flag Caregiver Alerts', 'Missed routine alerts, 1-tap patient calling button, and database dismissal audit.', 'DONE (100%)'],
      ['(g)', 'Low-Barrier Senior Interaction', 'Voice-first read aloud, Meta WhatsApp bot, 56px touch targets, WebAuthn biometrics.', 'DONE (100%)'],
      ['(h)', 'Data Privacy & DPDP Compliance', 'Mandatory consent checkboxes, AES-256 encryption, 30-day erasure, Grievance Officer.', 'DONE (100%)']
    ];

    const tableData = [headers, ...matrix.map(m => [
      { text: m[0], options: { bold: true, color: C_FOREST, fontSize: 8 } },
      { text: m[1], options: { bold: true, color: C_DARK, fontSize: 7.5 } },
      { text: m[2], options: { color: C_SLATE, fontSize: 7.5 } },
      { text: m[3], options: { bold: true, color: m[3].startsWith('DONE') ? '065F46' : '92400E', fontSize: 7.5 } }
    ])];

    slide.addTable(tableData, {
      x: 0.6, y: 1.6, w: 12.1,
      colW: [0.8, 3.2, 6.3, 1.8],
      border: { color: C_BORDER, width: 1 },
      fill: { color: C_WHITE }
    });
  }

  // ==========================================
  // SLIDE 13: FUTURE ROADMAP
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_CREAM };
    addHeader(slide, 'Future Vision', 'Scalability & Future Development Roadmap', 'Expanding Smriti from a digital companion into a nationwide community healthcare infrastructure');

    const roadmap = [
      {
        phase: 'PHASE 1 (NEXT 30 DAYS)',
        title: 'Full Bhashini Voice Rollout',
        desc: 'Deploy native Assamese, Khasi, Mizo, and Bengali ASR/TTS models via Bhashini microservices for zero-barrier regional voice interactions.',
        color: C_FOREST,
        bg: C_FOREST_LIGHT
      },
      {
        phase: 'PHASE 2 (Q2 2026)',
        title: 'Tier 2 IVR & SMS Fallback',
        desc: 'Automated interactive voice response phone calls and SMS reminders for non-smartphone feature phones in remote hilly terrains.',
        color: C_BLUE,
        bg: C_BLUE_LIGHT
      },
      {
        phase: 'PHASE 3 (Q3 2026)',
        title: 'Tier 3 ASHA Kiosk Mode',
        desc: 'Community tablet interface empowering ASHA healthcare workers to administer standardized weekly cognitive assessments in villages.',
        color: C_TERRA,
        bg: C_TERRA_LIGHT
      },
      {
        phase: 'PHASE 4 (Q4 2026)',
        title: 'Longitudinal Predictive Decline AI',
        desc: 'Multi-month longitudinal machine learning models predicting clinical decline trajectories and alerting clinicians prior to stage transitions.',
        color: C_AMBER,
        bg: C_AMBER_LIGHT
      }
    ];

    roadmap.forEach((r, idx) => {
      const x = 0.6 + idx * 3.1;
      slide.addShape(pptx.ShapeType.roundRect, {
        x, y: 1.7, w: 2.9, h: 5.0,
        rectRadius: 0.1,
        fill: { color: C_WHITE },
        line: { color: r.color, width: 2 }
      });

      slide.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.15, y: 1.85, w: 2.6, h: 0.35,
        rectRadius: 0.05,
        fill: { color: r.bg },
        line: { color: r.color, width: 0.5 }
      });
      slide.addText(r.phase, {
        x: x + 0.15, y: 1.85, w: 2.6, h: 0.35,
        fontSize: 7.5, bold: true, color: r.color, align: 'center', valign: 'middle'
      });

      slide.addText(r.title, {
        x: x + 0.15, y: 2.35, w: 2.6, h: 0.6,
        fontSize: 10, bold: true, color: C_DARK, align: 'center'
      });

      slide.addText(r.desc, {
        x: x + 0.15, y: 3.1, w: 2.6, h: 3.4,
        fontSize: 8.5, color: C_SLATE, lineSpacing: 15
      });
    });
  }

  // ==========================================
  // SLIDE 14: THANK YOU / TEAM SLIDE
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_CREAM };

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 0.8, w: 11.7, h: 2.6,
      rectRadius: 0.15,
      fill: { color: C_FOREST },
      line: { color: C_FOREST }
    });

    slide.addText('🌸 SMRITI (স্মৃতি / स्मृति)', {
      x: 1.2, y: 1.0, w: 11.0, h: 0.6,
      fontSize: 28, bold: true, color: 'FFFFFF',
      fontFace: 'Calibri'
    });

    slide.addText('Restoring Dignity • Preserving Memories • Empowering Caregivers', {
      x: 1.2, y: 1.65, w: 11.0, h: 0.4,
      fontSize: 15, bold: true, color: 'FDE68A',
      fontFace: 'Calibri'
    });

    slide.addText('Thank you to the Judges, Ministry of DoNER & Smart India Hackathon 2026', {
      x: 1.2, y: 2.1, w: 11.0, h: 0.35,
      fontSize: 11, color: 'FFFFFF', italic: true,
      fontFace: 'Calibri'
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 3.65, w: 5.7, h: 3.0,
      rectRadius: 0.1,
      fill: { color: C_WHITE },
      line: { color: C_TERRA, width: 2 }
    });

    slide.addText('👥 TEAM DESIGN DIVAS', {
      x: 1.0, y: 3.8, w: 5.3, h: 0.3,
      fontSize: 11, bold: true, color: C_TERRA
    });

    const teamPoints = [
      '• Smart India Hackathon 2026 Finalist Team',
      '• Problem Statement: SIH26003 (Ministry of DoNER)',
      '• Domain: AI-Augmented Healthcare & Cognitive Care',
      '• Contact: gopalrajlohiya2@gmail.com'
    ];

    slide.addText(teamPoints.join('\n\n'), {
      x: 1.0, y: 4.25, w: 5.3, h: 2.2,
      fontSize: 9, color: C_DARK, lineSpacing: 16
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.8, y: 3.65, w: 5.7, h: 3.0,
      rectRadius: 0.1,
      fill: { color: C_WHITE },
      line: { color: C_BLUE, width: 2 }
    });

    slide.addText('🌐 LIVE REPOSITORY & DEPLOYMENTS', {
      x: 7.0, y: 3.8, w: 5.3, h: 0.3,
      fontSize: 11, bold: true, color: C_BLUE
    });

    const repoPoints = [
      '• Live Frontend: Deployed on Vercel SPA Engine',
      '• Live Backend: Node.js / MongoDB Atlas on Render',
      '• Live ML Engine: https://dementia-ai-engine.onrender.com',
      '• WhatsApp Bot: https://wa.me/15556680031'
    ];

    slide.addText(repoPoints.join('\n\n'), {
      x: 7.0, y: 4.25, w: 5.3, h: 2.2,
      fontSize: 9, color: C_SLATE, lineSpacing: 16
    });
  }

  // Save PPTX
  const pptxOutPath = path.join('d:\\Design Divas\\docs', 'Smriti_SIH26003_Presentation.pptx');
  await pptx.writeFile({ fileName: pptxOutPath });
  console.log('✅ PPTX successfully generated at:', pptxOutPath);
}

generateDeck().catch(err => {
  console.error('Error generating presentation:', err);
  process.exit(1);
});
