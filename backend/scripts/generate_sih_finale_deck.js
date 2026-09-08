const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ==========================================
// 1. PPTX GENERATOR (python-pptx equivalent via pptxgenjs)
// ==========================================
async function generatePPTX() {
  console.log('--- Generating 6-Slide Finale PPTX ---');
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Team Design Divas';
  pptx.company = 'Smart India Hackathon 2026 (MDoNER)';
  pptx.title = 'Smriti (স্মৃতি) — SIH26003 Presentation Deck';

  // Palette
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
  const C_BORDER = 'CBD5E1';

  function addSlideHeader(slide, title, teamTag = 'Design Divas', psTag = 'SIH26003') {
    // Top Banner
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: 0.35, w: 2.2, h: 0.35,
      fill: { color: C_FOREST },
      line: { color: C_FOREST }
    });
    slide.addText(teamTag.toUpperCase(), {
      x: 0.5, y: 0.35, w: 2.2, h: 0.35,
      fontSize: 10, bold: true, color: C_WHITE,
      align: 'center', valign: 'middle'
    });

    slide.addText(title.toUpperCase(), {
      x: 3.0, y: 0.3, w: 7.2, h: 0.45,
      fontSize: 18, bold: true, color: C_DARK,
      fontFace: 'Calibri', align: 'center'
    });

    // Right SIH Badge
    slide.addShape(pptx.ShapeType.rect, {
      x: 10.5, y: 0.35, w: 2.3, h: 0.35,
      fill: { color: C_BLUE },
      line: { color: C_BLUE }
    });
    slide.addText('SMART INDIA HACKATHON 2026', {
      x: 10.5, y: 0.35, w: 2.3, h: 0.35,
      fontSize: 8, bold: true, color: C_WHITE,
      align: 'center', valign: 'middle'
    });

    // Slide footer
    slide.addText('Smriti (স্মৃতি) • SIH26003 • Ministry of DoNER', {
      x: 0.5, y: 7.05, w: 8.0, h: 0.25,
      fontSize: 8, color: C_MUTED
    });
  }

  // ------------------------------------------
  // SLIDE 1: TITLE SLIDE
  // ------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_CREAM };

    // Header Badge
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 3.5, y: 0.4, w: 6.3, h: 0.6,
      rectRadius: 0.1,
      fill: { color: '0284C7' },
      line: { color: '0284C7' }
    });
    slide.addText('SMART INDIA HACKATHON 2026', {
      x: 3.5, y: 0.4, w: 6.3, h: 0.6,
      fontSize: 16, bold: true, color: C_WHITE, align: 'center', valign: 'middle'
    });

    // Main Details Card
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 1.3, w: 7.6, h: 5.5,
      rectRadius: 0.1,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1.5 }
    });

    slide.addText('Problem Statement ID — SIH26003', {
      x: 1.1, y: 1.5, w: 7.0, h: 0.4,
      fontSize: 14, bold: true, color: C_DARK
    });

    slide.addText('Problem Statement Title —', {
      x: 1.1, y: 2.0, w: 7.0, h: 0.3,
      fontSize: 12, bold: true, color: C_SLATE
    });
    slide.addText('AI-Based Cognitive Gaming and Memory Assistance Platform for Elderly Dementia Patients in North Eastern Region (NER)', {
      x: 1.1, y: 2.35, w: 7.0, h: 0.85,
      fontSize: 13, bold: true, color: C_FOREST, lineSpacing: 18
    });

    slide.addText('Theme — MedTech / BioTech / HealthTech', {
      x: 1.1, y: 3.35, w: 7.0, h: 0.35,
      fontSize: 12, bold: true, color: C_DARK
    });

    slide.addText('PS Category — Software', {
      x: 1.1, y: 3.8, w: 7.0, h: 0.35,
      fontSize: 12, bold: true, color: C_DARK
    });

    slide.addText('Organization — Ministry of Development of North Eastern Region (MDoNER)', {
      x: 1.1, y: 4.25, w: 7.0, h: 0.5,
      fontSize: 11.5, bold: true, color: C_TERRA
    });

    slide.addText('Team Name (Registered on Portal) — Design Divas', {
      x: 1.1, y: 4.9, w: 7.0, h: 0.4,
      fontSize: 13, bold: true, color: C_BLUE
    });

    slide.addText('🌸 Smriti (স্মৃতি / स्मृति) — AI-Powered Memory & Healthcare Companion', {
      x: 1.1, y: 5.5, w: 7.0, h: 0.4,
      fontSize: 11, italic: true, color: C_SLATE
    });

    // Right Side Graphic Box (Hero Branding)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.7, y: 1.3, w: 4.1, h: 5.5,
      rectRadius: 0.15,
      fill: { color: C_FOREST },
      line: { color: C_FOREST }
    });

    slide.addText('🌸 SMRITI', {
      x: 8.9, y: 1.6, w: 3.7, h: 0.6,
      fontSize: 26, bold: true, color: C_WHITE, align: 'center'
    });
    slide.addText('(স্মৃতি / स्मृति)', {
      x: 8.9, y: 2.15, w: 3.7, h: 0.4,
      fontSize: 15, bold: true, color: 'FDE68A', align: 'center'
    });

    const pillars1 = [
      '• 5 Culturally Rooted Games',
      '• WhatsApp Companion Bot',
      '• Live ML Difficulty Engine',
      '• Offline-First PWA (idb)',
      '• Voice STT & Spoken Audio',
      '• Clinical Caregiver Hub',
      '• DPDP Act 2023 Compliant'
    ];
    slide.addText(pillars1.join('\n\n'), {
      x: 9.1, y: 2.8, w: 3.4, h: 3.6,
      fontSize: 10, color: C_WHITE, lineSpacing: 16
    });
  }

  // ------------------------------------------
  // SLIDE 2: SOLUTION + PROTOTYPE + WHY WE STAND OUT
  // ------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_CREAM };
    addSlideHeader(slide, 'SOLUTION & PROTOTYPE OVERVIEW');

    // Left Column: SOLUTION
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.5, y: 0.85, w: 6.4, h: 4.3,
      rectRadius: 0.08,
      fill: { color: C_WHITE },
      line: { color: C_FOREST, width: 2 }
    });

    slide.addShape(pptx.ShapeType.rect, {
      x: 0.7, y: 0.95, w: 1.6, h: 0.3,
      fill: { color: C_FOREST }
    });
    slide.addText('SOLUTION', {
      x: 0.7, y: 0.95, w: 1.6, h: 0.3,
      fontSize: 9, bold: true, color: C_WHITE, align: 'center', valign: 'middle'
    });

    slide.addText('Smriti is a hybrid cognitive-care ecosystem combining a WhatsApp AI companion bot, an offline-first PWA with 5 culturally-grounded cognitive games, and a clinical caregiver dashboard — built to meet elderly NER dementia patients where they already are (WhatsApp), instead of asking them to adopt new technology.', {
      x: 0.7, y: 1.35, w: 6.0, h: 0.9,
      fontSize: 8.2, color: C_DARK, bold: true, lineSpacing: 12
    });

    const solBullets = [
      '• Patient Portal: Frictionless PIN/biometrics, 5 NER-themed games (Bihu Dhol, Kaji Nemu, Assam Tea).',
      '• Gemini AI Companion: Voice-first, multilingual, live-grounded in patient medicines & routine.',
      '• WhatsApp Bot: Daily reminders + automated DONE acknowledgment, zero app-install friction.',
      '• Caregiver Portal: Real-time red-flag alerts, 7-day cognitive performance analytics, patient CRUD.',
      '• Live ML Engine: Adaptive difficulty + cognitive scoring on Render (dementia-ai-engine.onrender.com).',
      '• True Offline-First PWA: Full functionality with zero internet, auto-sync on reconnect.'
    ];
    slide.addText(solBullets.join('\n'), {
      x: 0.7, y: 2.3, w: 6.0, h: 2.7,
      fontSize: 7.8, color: C_SLATE, lineSpacing: 13
    });

    // Right Column: PROTOTYPE
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 7.1, y: 0.85, w: 5.7, h: 4.3,
      rectRadius: 0.08,
      fill: { color: C_WHITE },
      line: { color: C_BLUE, width: 2 }
    });

    slide.addShape(pptx.ShapeType.rect, {
      x: 7.3, y: 0.95, w: 1.8, h: 0.3,
      fill: { color: C_BLUE }
    });
    slide.addText('PROTOTYPE', {
      x: 7.3, y: 0.95, w: 1.8, h: 0.3,
      fontSize: 9, bold: true, color: C_WHITE, align: 'center', valign: 'middle'
    });

    slide.addText('"English + Hindi live voice (Assamese text live, voice in progress), elder-friendly high-contrast UI, hands-free Web Speech API interaction, one-tap WhatsApp deep link."', {
      x: 7.3, y: 1.35, w: 5.3, h: 0.65,
      fontSize: 8.2, color: C_DARK, italic: true, bold: true
    });

    // 4 Mini Prototype Cards
    const protoCards = [
      { title: '📱 Patient Portal WebApp', desc: '56px touch targets, horizon routines, Family Photo Vault, offline IndexedDB cache.' },
      { title: '💬 WhatsApp Companion', desc: 'wa.me/15556680031 bridge, cron schedule dispatch, conversational Gemini Q&A.' },
      { title: '🧠 Cognitive Games Suite', desc: '5 games logging accuracy & reaction speed; live ML starting level calibration.' },
      { title: '📊 Caregiver Dashboard', desc: 'Red-flag missed medicine alerts, 1-tap call button, 7-day adherence charts.' }
    ];
    protoCards.forEach((pc, idx) => {
      const px = 7.3 + (idx % 2) * 2.7;
      const py = 2.1 + Math.floor(idx / 2) * 1.45;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: px, y: py, w: 2.55, h: 1.35,
        rectRadius: 0.05,
        fill: { color: C_BLUE_LIGHT },
        line: { color: C_BLUE, width: 0.8 }
      });
      slide.addText(pc.title, {
        x: px + 0.1, y: py + 0.08, w: 2.35, h: 0.3,
        fontSize: 7.8, bold: true, color: C_BLUE
      });
      slide.addText(pc.desc, {
        x: px + 0.1, y: py + 0.38, w: 2.35, h: 0.9,
        fontSize: 7.2, color: C_SLATE, lineSpacing: 11
      });
    });

    // Bottom Section: WHY WE STAND OUT (4 Boxes)
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: 5.25, w: 2.6, h: 0.3,
      fill: { color: C_TERRA }
    });
    slide.addText('WHY WE STAND OUT ?', {
      x: 0.5, y: 5.25, w: 2.6, h: 0.3,
      fontSize: 9, bold: true, color: C_WHITE, align: 'center', valign: 'middle'
    });

    const standouts = [
      {
        title: 'Real ML-Powered Engine',
        desc: 'Live FastAPI on Render computes per-session difficulty & 0-100 cognitive score from real gameplay telemetry, not static rules.'
      },
      {
        title: 'Culturally Authentic',
        desc: 'Every game, produce item & sound grounded in real NER culture (Kaji Nemu, Dhol), unlike Western apps like Lumosity.'
      },
      {
        title: 'True Offline-First PWA',
        desc: 'Workbox Service Worker + IndexedDB caching works in zero-connectivity hill areas, verified in production build.'
      },
      {
        title: 'Zero-Install WhatsApp',
        desc: 'Patients unwilling/unable to install apps get daily routine reminders and check-ins on the platform they already use.'
      }
    ];

    standouts.forEach((so, idx) => {
      const sx = 0.5 + idx * 3.1;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: sx, y: 5.65, w: 2.95, h: 1.35,
        rectRadius: 0.06,
        fill: { color: C_WHITE },
        line: { color: C_TERRA, width: 1.5 }
      });
      slide.addText(`★ ${so.title}`, {
        x: sx + 0.1, y: 5.72, w: 2.75, h: 0.28,
        fontSize: 8.2, bold: true, color: C_TERRA
      });
      slide.addText(so.desc, {
        x: sx + 0.1, y: 6.02, w: 2.75, h: 0.9,
        fontSize: 7.2, color: C_SLATE, lineSpacing: 11
      });
    });
  }

  // ------------------------------------------
  // SLIDE 3: TECHNICAL APPROACH
  // ------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_CREAM };
    addSlideHeader(slide, 'TECHNICAL APPROACH & ARCHITECTURE');

    // Left Column: BACKEND ARCHITECTURE
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.5, y: 0.85, w: 4.8, h: 4.2,
      rectRadius: 0.08,
      fill: { color: C_WHITE },
      line: { color: C_FOREST, width: 2 }
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.7, y: 0.95, w: 2.8, h: 0.28,
      fill: { color: C_FOREST }
    });
    slide.addText('BACKEND ARCHITECTURE', {
      x: 0.7, y: 0.95, w: 2.8, h: 0.28,
      fontSize: 8.5, bold: true, color: C_WHITE, align: 'center', valign: 'middle'
    });

    const backendPoints = [
      '• Node.js/Express REST API, JWT + bcrypt (365-day persistent sessions, isolated roles).',
      '• MongoDB Atlas: Patients, Caregivers, Reminders, GameSessions, Photos, Chat history.',
      '• node-cron scheduled reminder dispatch engine.',
      '• Google Gemini API powers in-app & WhatsApp bot with live per-patient memory injection.',
      '• Teammate FastAPI ML microservice (Render): /get_next_difficulty & /calculate_health_score with 6s timeout + rule-based fallback.',
      '• Meta WhatsApp Cloud API: webhook + wa.me link.',
      '• vite-plugin-pwa + Workbox + IndexedDB for offline caching and background sync queue.'
    ];
    slide.addText(backendPoints.join('\n'), {
      x: 0.7, y: 1.3, w: 4.4, h: 3.6,
      fontSize: 7.4, color: C_SLATE, lineSpacing: 12
    });

    // Right Column: THREE-TIER USER FLOW
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 5.5, y: 0.85, w: 7.3, h: 4.2,
      rectRadius: 0.08,
      fill: { color: C_WHITE },
      line: { color: C_BLUE, width: 2 }
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 5.7, y: 0.95, w: 2.6, h: 0.28,
      fill: { color: C_BLUE }
    });
    slide.addText('THREE-TIER USER FLOW', {
      x: 5.7, y: 0.95, w: 2.6, h: 0.28,
      fontSize: 8.5, bold: true, color: C_WHITE, align: 'center', valign: 'middle'
    });

    const flowTiers = [
      {
        tier: '1. Patient Tier (Web/WhatsApp)',
        desc: 'PIN/biometrics login or WhatsApp message → plays cognitive games, checks horizon routines, queries AI companion → auto-synced to MongoDB with offline fallback.'
      },
      {
        tier: '2. Caregiver Tier (Web Dashboard)',
        desc: 'Email/password or Google OAuth → scoped patient roster, real-time red-flag alerts for missed medicines, 7-day adherence charts, and cognitive decline telemetry.'
      },
      {
        tier: '3. AI/ML Layer (Hybrid Resilience)',
        desc: 'Gemini (conversational grounding) + FastAPI ML (difficulty & health scoring), backed by immediate rule-based fallback so the system never fails even during outages.'
      }
    ];
    flowTiers.forEach((ft, idx) => {
      const fy = 1.35 + idx * 1.25;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 5.7, y: fy, w: 6.9, h: 1.15,
        rectRadius: 0.05,
        fill: { color: C_BLUE_LIGHT },
        line: { color: C_BLUE, width: 0.8 }
      });
      slide.addText(ft.tier, {
        x: 5.85, y: fy + 0.08, w: 6.6, h: 0.25,
        fontSize: 8.2, bold: true, color: C_BLUE
      });
      slide.addText(ft.desc, {
        x: 5.85, y: fy + 0.35, w: 6.6, h: 0.75,
        fontSize: 7.4, color: C_DARK, lineSpacing: 11
      });
    });

    // Bottom Container: AI COMPONENTS
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.5, y: 5.15, w: 12.3, h: 1.85,
      rectRadius: 0.08,
      fill: { color: C_WHITE },
      line: { color: C_TERRA, width: 1.5 }
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.7, y: 5.25, w: 2.2, h: 0.28,
      fill: { color: C_TERRA }
    });
    slide.addText('AI COMPONENTS', {
      x: 0.7, y: 5.25, w: 2.2, h: 0.28,
      fontSize: 8.5, bold: true, color: C_WHITE, align: 'center', valign: 'middle'
    });

    const aiComp = [
      '• Google Gemini LLM — Real-time conversational memory grounding using live MongoDB patient records (medications, routine, family relation context).',
      '• ML Difficulty/Scoring Engine (FastAPI on Render) — Evaluates reaction time + mistakes + level → recommends next difficulty + 0-100 cognitive score + clinical status.',
      '• Rule-Based Fallback Layer — Zero-latency accuracy-threshold logic backing every ML call, guaranteeing 100% demo stability.'
    ];
    slide.addText(aiComp.join('\n'), {
      x: 0.7, y: 5.6, w: 11.9, h: 1.3,
      fontSize: 7.8, color: C_SLATE, lineSpacing: 13
    });
  }

  // ------------------------------------------
  // SLIDE 4: FEASIBILITY AND VIABILITY + CHALLENGES
  // ------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_CREAM };
    addSlideHeader(slide, 'FEASIBILITY, VIABILITY & CHALLENGES');

    // Left Column: FEASIBILITY (4 Cards)
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: 0.85, w: 2.0, h: 0.28,
      fill: { color: C_FOREST }
    });
    slide.addText('FEASIBILITY', {
      x: 0.5, y: 0.85, w: 2.0, h: 0.28,
      fontSize: 8.5, bold: true, color: C_WHITE, align: 'center', valign: 'middle'
    });

    const feas = [
      {
        title: 'Technical Feasibility',
        desc: 'Built on production-proven free-tier stacks (React, Node, MongoDB Atlas, Gemini free tier, Meta WhatsApp free tier) — ₹0 infrastructure cost at pilot scale.'
      },
      {
        title: 'Operational Feasibility',
        desc: 'WhatsApp has near-universal penetration in rural NER; seniors require no new app-learning curve beyond replying to a known contact.'
      },
      {
        title: 'Economic Feasibility',
        desc: '100% free and open-access to rural clinics & ASHA centers — unlike Western apps (CogniFit/Lumosity $15–20/mo, unaffordable in rural NER).'
      },
      {
        title: 'Regulatory Feasibility',
        desc: 'DPDP Act 2023-compliant by design: explicit photo consent, AES-256 at rest, role-scoped access, named Grievance Officer, 30-day erasure guarantee.'
      }
    ];

    feas.forEach((f, idx) => {
      const fy = 1.2 + idx * 1.4;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.5, y: fy, w: 5.8, h: 1.3,
        rectRadius: 0.06,
        fill: { color: C_WHITE },
        line: { color: C_FOREST, width: 1 }
      });
      slide.addText(`✓ ${f.title}`, {
        x: 0.65, y: fy + 0.08, w: 5.5, h: 0.25,
        fontSize: 8.2, bold: true, color: C_FOREST
      });
      slide.addText(f.desc, {
        x: 0.65, y: fy + 0.35, w: 5.5, h: 0.9,
        fontSize: 7.4, color: C_SLATE, lineSpacing: 11
      });
    });

    // Right Column: CHALLENGES & MITIGATIONS (3 Blocks)
    slide.addShape(pptx.ShapeType.rect, {
      x: 6.8, y: 0.85, w: 2.0, h: 0.28,
      fill: { color: C_TERRA }
    });
    slide.addText('CHALLENGES', {
      x: 6.8, y: 0.85, w: 2.0, h: 0.28,
      fontSize: 8.5, bold: true, color: C_WHITE, align: 'center', valign: 'middle'
    });

    const challenges = [
      {
        ch: '1. Reaching patients with zero digital literacy or no smartphone',
        sol: 'WhatsApp-first design (no new app to learn); tiered fallback architecture (SMS/IVR Tier 2, ASHA-assisted Kiosk Mode Tier 3) — architecture-ready, future scope.'
      },
      {
        ch: '2. Usability for cognitively-impaired elderly users',
        sol: '56px+ touch targets, zero hidden menus, high-contrast palette (aligned with Apple Assistive Access / GrandPad accessibility); voice-first read-aloud eliminates typing.'
      },
      {
        ch: '3. Reliability in NER’s low-connectivity hill terrain',
        sol: 'True offline-first PWA (Workbox Service Worker + IndexedDB), verified in production build; background sync queue ensures zero score/routine data loss.'
      }
    ];

    challenges.forEach((c, idx) => {
      const cy = 1.2 + idx * 1.85;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 6.8, y: cy, w: 6.0, h: 1.75,
        rectRadius: 0.06,
        fill: { color: C_WHITE },
        line: { color: C_TERRA, width: 1.5 }
      });
      slide.addText(`🚨 Challenge: ${c.ch}`, {
        x: 6.95, y: cy + 0.08, w: 5.7, h: 0.4,
        fontSize: 7.8, bold: true, color: C_TERRA
      });
      slide.addText(`💡 Smriti Mitigation:\n${c.sol}`, {
        x: 6.95, y: cy + 0.5, w: 5.7, h: 1.2,
        fontSize: 7.2, color: C_DARK, lineSpacing: 11
      });
    });
  }

  // ------------------------------------------
  // SLIDE 5: IMPACTS AND BENEFITS
  // ------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_CREAM };
    addSlideHeader(slide, 'IMPACTS AND BENEFITS');

    // Top 3 Boxes: Economic, Social, Systemic
    const benefits = [
      {
        title: 'ECONOMIC BENEFITS',
        desc: 'Reduces dependency on scarce, Guwahati-concentrated neurologists (85%+ in Guwahati) by enabling remote cognitive care & progress tracking — eliminating costly specialist travel for rural families.',
        color: C_FOREST, bg: C_FOREST_LIGHT
      },
      {
        title: 'SOCIAL BENEFITS',
        desc: 'Reduces elderly isolation via daily WhatsApp check-ins; empowers family caregivers with real visibility; counters regional stigma where dementia is dismissed as normal aging ("বুঢ়া বয়সৰ পাহৰণি").',
        color: C_BLUE, bg: C_BLUE_LIGHT
      },
      {
        title: 'SYSTEMIC BENEFITS',
        desc: 'Reduces unnecessary travel across rugged mountain terrain; strengthens MDoNER and Digital India telemedicine initiatives with longitudinal adherence & cognitive decline data.',
        color: C_TERRA, bg: C_TERRA_LIGHT
      }
    ];

    benefits.forEach((b, idx) => {
      const bx = 0.5 + idx * 4.2;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: bx, y: 0.85, w: 3.95, h: 1.8,
        rectRadius: 0.06,
        fill: { color: C_WHITE },
        line: { color: b.color, width: 2 }
      });
      slide.addShape(pptx.ShapeType.rect, {
        x: bx + 0.15, y: 0.95, w: 3.65, h: 0.25,
        fill: { color: b.bg }
      });
      slide.addText(b.title, {
        x: bx + 0.15, y: 0.95, w: 3.65, h: 0.25,
        fontSize: 7.8, bold: true, color: b.color, align: 'center', valign: 'middle'
      });
      slide.addText(b.desc, {
        x: bx + 0.15, y: 1.25, w: 3.65, h: 1.35,
        fontSize: 7.2, color: C_SLATE, lineSpacing: 11
      });
    });

    // Middle Container: STAKEHOLDERS & IMPACT FLOW (4 Steps)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.5, y: 2.8, w: 12.3, h: 2.65,
      rectRadius: 0.08,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1.5 }
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.7, y: 2.9, w: 3.0, h: 0.28,
      fill: { color: C_DARK }
    });
    slide.addText('STAKEHOLDERS & IMPACT FLOW', {
      x: 0.7, y: 2.9, w: 3.0, h: 0.28,
      fontSize: 8.5, bold: true, color: C_WHITE, align: 'center', valign: 'middle'
    });

    const flowSteps = [
      { step: '1. Patient', text: 'Receives a WhatsApp reminder or opens PWA; plays culturally familiar game or acknowledges daily medicine.' },
      { step: '2. Smriti AI Layer', text: 'Gemini interprets & responds conversationally; live ML engine scores session and adjusts next difficulty.' },
      { step: '3. Caregiver', text: 'Views real-time red-flag alerts and 7-day adherence charts; intervenes only when clinical lapses occur.' },
      { step: '4. Health System / ASHA', text: 'Aggregated adherence & cognitive decline data informs community health worker rounds & regional monitoring.' }
    ];

    flowSteps.forEach((fs, idx) => {
      const fx = 0.7 + idx * 3.0;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: fx, y: 3.3, w: 2.8, h: 2.0,
        rectRadius: 0.05,
        fill: { color: C_CREAM },
        line: { color: C_BLUE, width: 1 }
      });
      slide.addText(fs.step, {
        x: fx + 0.1, y: 3.4, w: 2.6, h: 0.3,
        fontSize: 8.5, bold: true, color: C_BLUE, align: 'center'
      });
      slide.addText(fs.text, {
        x: fx + 0.1, y: 3.75, w: 2.6, h: 1.5,
        fontSize: 7.2, color: C_DARK, lineSpacing: 11
      });
    });

    // Bottom Container: OUR PROMISE & GOAL
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.5, y: 5.6, w: 12.3, h: 1.4,
      rectRadius: 0.08,
      fill: { color: C_FOREST_LIGHT },
      line: { color: C_FOREST, width: 1.5 }
    });
    slide.addText('🌍 OUR PROMISE & SUSTAINABLE IMPACT', {
      x: 0.7, y: 5.7, w: 11.9, h: 0.25,
      fontSize: 8.5, bold: true, color: C_FOREST
    });
    slide.addText('Aligns with UN SDG 3 (Good Health & Well-Being) and SDG 10 (Reduced Inequalities — bridging the urban vs hill-state neurological care gap). Directly advances Ministry of DoNER’s regional mandate by providing a 100% free, scalable digital health ecosystem tailored for all 8 North-Eastern states.', {
      x: 0.7, y: 5.95, w: 11.9, h: 0.95,
      fontSize: 7.6, color: C_DARK, lineSpacing: 12
    });
  }

  // ------------------------------------------
  // SLIDE 6: RESEARCH AND REFERENCES
  // ------------------------------------------
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_CREAM };
    addSlideHeader(slide, 'RESEARCH AND REFERENCES');

    // Left Column: CLINICAL & EPIDEMIOLOGICAL RESEARCH
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.5, y: 0.85, w: 5.9, h: 4.3,
      rectRadius: 0.08,
      fill: { color: C_WHITE },
      line: { color: C_FOREST, width: 2 }
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.7, y: 0.95, w: 3.2, h: 0.28,
      fill: { color: C_FOREST }
    });
    slide.addText('CLINICAL & EPIDEMIOLOGICAL DATA', {
      x: 0.7, y: 0.95, w: 3.2, h: 0.28,
      fontSize: 8, bold: true, color: C_WHITE, align: 'center', valign: 'middle'
    });

    const resPoints = [
      '• LASI-DAD National Study (Lancet Public Health / PLOS ONE): 8.8M Indian seniors (60+) with dementia (2026), 7.4–8.44% prevalence, 17.6% MCI; projected 14.3M by 2036.',
      '• WHO / Alzheimer’s Disease International: ~55M global cases (2026) → 139M by 2050; 60%+ in LMICs.',
      '• NER Specifics: ~280,000–350,000 cases across 8 states (Assam ~180K+); Vascular Dementia is ~20% of cases due to hypertension (Kamrup ~33%) & high-sodium diets (Khar, Ngari, Shidol).',
      '• "Neurology Desert": 85%+ of NER neurologists are in Guwahati; hill states have near-zero full-time rural neurologists.'
    ];
    slide.addText(resPoints.join('\n\n'), {
      x: 0.7, y: 1.3, w: 5.5, h: 3.7,
      fontSize: 7.2, color: C_SLATE, lineSpacing: 11
    });

    // Right Column: OUR WORKS & OPEN SOURCE REFERENCES
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.7, y: 0.85, w: 6.1, h: 4.3,
      rectRadius: 0.08,
      fill: { color: C_WHITE },
      line: { color: C_BLUE, width: 2 }
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 6.9, y: 0.95, w: 2.2, h: 0.28,
      fill: { color: C_BLUE }
    });
    slide.addText('OUR WORKS & REPOSITORIES', {
      x: 6.9, y: 0.95, w: 2.2, h: 0.28,
      fontSize: 8, bold: true, color: C_WHITE, align: 'center', valign: 'middle'
    });

    const worksList = [
      '• Live Frontend SPA: Deployed on Vercel Engine',
      '• Live Backend API: Node.js / MongoDB Atlas on Render',
      '• Live ML Microservice: https://dementia-ai-engine.onrender.com',
      '• WhatsApp Companion Bot: https://wa.me/15556680031',
      '• GitHub Codebase: github.com/gopalrajlohiya11-ui/Smriti'
    ];
    slide.addText(worksList.join('\n'), {
      x: 6.9, y: 1.3, w: 5.7, h: 1.4,
      fontSize: 7.4, color: C_DARK, lineSpacing: 12
    });

    slide.addShape(pptx.ShapeType.rect, {
      x: 6.9, y: 2.75, w: 3.2, h: 0.25,
      fill: { color: C_TERRA }
    });
    slide.addText('ACADEMIC & OPEN-SOURCE CITATIONS', {
      x: 6.9, y: 2.75, w: 3.2, h: 0.25,
      fontSize: 7.5, bold: true, color: C_WHITE, align: 'center', valign: 'middle'
    });

    const openSourceList = [
      '• LASI-DAD Diagnostic Study: doi.org/10.1016/S2468-2667(22)00301-7',
      '• DementiaVoiceAnalyzer: github.com/Butovens/DementiaVoiceAnalyzer',
      '• NEUROHACK2022_Dementia: github.com/shreyasgite/dementianet',
      '• NICE Clinical Guidelines CG42: Cognitive Stimulation Therapy',
      '• Institutions: ARDSI Guwahati/Mizoram, NIMHANS (Tele-MANAS 14416), SCARF India (DEMCARES), MDoNER & NEC'
    ];
    slide.addText(openSourceList.join('\n'), {
      x: 6.9, y: 3.05, w: 5.7, h: 2.0,
      fontSize: 7.2, color: C_SLATE, lineSpacing: 11
    });

    // Bottom Container: WHY EXISTING SOLUTIONS FAIL
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.5, y: 5.25, w: 12.3, h: 1.75,
      rectRadius: 0.08,
      fill: { color: C_WHITE },
      line: { color: C_TERRA, width: 1.5 }
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.7, y: 5.35, w: 3.0, h: 0.25,
      fill: { color: C_TERRA }
    });
    slide.addText('WHY EXISTING SOLUTIONS FAIL IN NER', {
      x: 0.7, y: 5.35, w: 3.0, h: 0.25,
      fontSize: 7.8, bold: true, color: C_WHITE, align: 'center', valign: 'middle'
    });

    const compPoints = [
      '• CogniFit / Lumosity / BrainHQ: $15–20/month subscription (unaffordable in rural NER), English-only, abstract geometric puzzles with zero cultural resonance, requires high-speed broadband.',
      '• MindMate / Timeless / CareZone: Geared for Western/NHS healthcare pathways, lacks Indian joint-family context, zero Assamese/Hindi voice, no WhatsApp outreach, crashes on slow 2G rural hill connections.',
      '• Smriti Advantage: 100% Free, culturally familiar NER themes (Kaji Nemu, Bihu Dhol), true offline-first PWA, WhatsApp bot check-ins, live Render ML telemetry.'
    ];
    slide.addText(compPoints.join('\n'), {
      x: 0.7, y: 5.65, w: 11.9, h: 1.3,
      fontSize: 7.2, color: C_SLATE, lineSpacing: 11
    });
  }

  const pptxOutPath = path.join('d:\\Design Divas\\docs', 'Smriti_SIH26003_Presentation.pptx');
  await pptx.writeFile({ fileName: pptxOutPath });
  console.log('✅ 6-Slide Finale PPTX saved at:', pptxOutPath);
}

// ==========================================
// 2. HTML & PDF GENERATOR (High-Res 16:9 Finale Deck)
// ==========================================
function generatePDF() {
  console.log('--- Generating 6-Slide Finale HTML & PDF ---');
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Smriti (স্মৃতি) — SIH26003 Finale Presentation Deck</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

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
    padding: 0.45in 0.65in 0.4in 0.65in;
    background-color: #FAF7F2;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .top-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.2in;
  }

  .team-badge {
    background: #1E3A2F;
    color: #FFFFFF;
    font-size: 0.16in;
    font-weight: 800;
    letter-spacing: 1px;
    padding: 0.06in 0.2in;
    border-radius: 0.06in;
    text-transform: uppercase;
  }

  .slide-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 0.32in;
    font-weight: 900;
    color: #0F172A;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0;
  }

  .sih-badge {
    background: #0284C7;
    color: #FFFFFF;
    font-size: 0.14in;
    font-weight: 800;
    letter-spacing: 0.8px;
    padding: 0.06in 0.2in;
    border-radius: 0.06in;
    text-transform: uppercase;
  }

  .slide-footer {
    position: absolute;
    bottom: 0.22in;
    left: 0.65in;
    right: 0.65in;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #CBD5E1;
    padding-top: 0.08in;
    font-size: 0.13in;
    color: #64748B;
    font-weight: 600;
  }

  /* Cards and Boxes */
  .card {
    background: #FFFFFF;
    border: 1.5px solid #CBD5E1;
    border-radius: 0.1in;
    padding: 0.2in 0.24in;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  }

  .section-pill {
    display: inline-block;
    color: #FFFFFF;
    font-size: 0.13in;
    font-weight: 800;
    padding: 0.04in 0.14in;
    border-radius: 0.04in;
    text-transform: uppercase;
    margin-bottom: 0.08in;
  }

  .pill-forest { background: #1E3A2F; }
  .pill-terra { background: #C25E2E; }
  .pill-blue { background: #0284C7; }
  .pill-dark { background: #0F172A; }

  p, li {
    font-size: 0.14in;
    color: #334155;
    line-height: 1.35;
    margin: 0.04in 0;
  }

  ul, ol {
    margin: 0.04in 0 0 0.2in;
    padding: 0;
  }

  li {
    margin-bottom: 0.04in;
  }

  a {
    color: #0284C7;
    text-decoration: underline;
    font-weight: 700;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 0.22in;
  }

  .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.2in;
  }

  .grid-4 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 0.16in;
  }
</style>
</head>
<body>

<!-- SLIDE 1: TITLE SLIDE -->
<div class="slide" style="justify-content: center; align-items: center;">
  <div style="width: 100%; max-width: 14.5in;">
    <div style="text-align: center; margin-bottom: 0.3in;">
      <div style="display: inline-block; background: #0284C7; color: #FFFFFF; font-size: 0.22in; font-weight: 800; padding: 0.08in 0.4in; border-radius: 0.08in; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);">
        SMART INDIA HACKATHON 2026
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 0.35in;">
      <div class="card" style="border: 2px solid #0284C7; padding: 0.35in 0.4in;">
        <p style="font-size: 0.2in; font-weight: 800; color: #0F172A; margin: 0 0 0.1in 0;">
          Problem Statement ID &mdash; <span style="color: #0284C7;">SIH26003</span>
        </p>

        <p style="font-size: 0.15in; font-weight: 800; color: #475569; margin: 0 0 0.04in 0;">Problem Statement Title &mdash;</p>
        <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 0.22in; font-weight: 800; color: #1E3A2F; margin: 0 0 0.18in 0; line-height: 1.3;">
          AI-Based Cognitive Gaming and Memory Assistance Platform for Elderly Dementia Patients in North Eastern Region (NER)
        </h2>

        <div style="margin-top: 0.15in; border-top: 1px solid #E2E8F0; padding-top: 0.15in;">
          <p style="font-size: 0.16in; margin: 0.06in 0;"><strong>Theme &mdash;</strong> <span style="color: #C25E2E; font-weight: 700;">MedTech / BioTech / HealthTech</span></p>
          <p style="font-size: 0.16in; margin: 0.06in 0;"><strong>PS Category &mdash;</strong> <span style="color: #0F172A; font-weight: 700;">Software</span></p>
          <p style="font-size: 0.16in; margin: 0.06in 0;"><strong>Organization &mdash;</strong> <span style="color: #1E3A2F; font-weight: 700;">Ministry of Development of North Eastern Region (MDoNER)</span></p>
          <p style="font-size: 0.18in; margin: 0.12in 0 0 0;"><strong>Team Name (Registered on Portal) &mdash;</strong> <span style="color: #0284C7; font-weight: 900;">Design Divas</span></p>
        </div>
      </div>

      <div style="background: linear-gradient(135deg, #1E3A2F 0%, #2D5A49 60%, #C25E2E 100%); color: #FFFFFF; border-radius: 0.14in; padding: 0.4in 0.35in; display: flex; flex-direction: column; justify-content: center; box-shadow: 0 8px 24px rgba(30, 58, 47, 0.25);">
        <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 0.44in; margin: 0; font-weight: 900; letter-spacing: -0.5px; text-align: center;">
          🌸 SMRITI
        </h1>
        <h3 style="font-size: 0.22in; color: #FDE68A; margin: 0.04in 0 0.18in 0; text-align: center; font-weight: 700;">
          (স্মৃতি / स्मृति)
        </h3>
        <p style="font-size: 0.14in; color: #FFFFFF; opacity: 0.95; text-align: center; font-style: italic; margin-bottom: 0.2in;">
          AI-Powered Cognitive Care & Memory Companion for Dementia & MCI
        </p>
        <ul style="font-size: 0.135in; color: #F8FAFC; line-height: 1.5; margin-left: 0.18in;">
          <li>5 Culturally Rooted Cognitive Games (NER Themes)</li>
          <li>Meta WhatsApp Bot for Zero-Install Outreach</li>
          <li>Live Render ML Adaptive Difficulty Engine</li>
          <li>100% Offline-First PWA (Workbox + IndexedDB)</li>
          <li>Clinical Caregiver Command Center & Alerts</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <span>Smriti (স্মৃতি) • Team Design Divas • SIH26003 (MDoNER)</span>
    <span>Slide 1 / 6</span>
  </div>
</div>

<!-- SLIDE 2: SOLUTION + PROTOTYPE + WHY WE STAND OUT -->
<div class="slide">
  <div class="top-banner">
    <span class="team-badge">Design Divas</span>
    <h1 class="slide-title">SOLUTION & PROTOTYPE OVERVIEW</h1>
    <span class="sih-badge">SIH26003</span>
  </div>

  <div class="grid-2" style="margin-bottom: 0.15in;">
    <!-- Solution Card -->
    <div class="card" style="border: 2px solid #1E3A2F;">
      <span class="section-pill pill-forest">SOLUTION</span>
      <p style="font-weight: 700; color: #0F172A; font-size: 0.135in; margin-bottom: 0.06in;">
        Smriti is a hybrid cognitive-care ecosystem combining a WhatsApp AI companion bot, an offline-first PWA with 5 culturally-grounded cognitive games, and a clinical caregiver dashboard — built to meet elderly NER dementia patients where they already are (WhatsApp), instead of asking them to adopt new technology.
      </p>
      <ul style="font-size: 0.125in;">
        <li><strong>Patient Portal:</strong> Frictionless PIN/biometric login, 5 cognitive games themed with real NER cultural context (Bihu Dhol, Kaji Nemu, Assam Tea, Bamboo Shoot).</li>
        <li><strong>Gemini AI Companion:</strong> Voice-first, multilingual, grounded live in each patient's own medicine/schedule/family data.</li>
        <li><strong>WhatsApp Bot:</strong> Daily reminders + auto-acknowledgment, zero app-install friction.</li>
        <li><strong>Caregiver Portal:</strong> Real-time red-flag alerts, 7-day cognitive performance analytics, full patient management.</li>
        <li><strong>Live ML Engine:</strong> Adaptive difficulty + cognitive health scoring live on Render.</li>
        <li><strong>True Offline-First PWA:</strong> Full functionality with zero internet, auto-sync on reconnect.</li>
      </ul>
    </div>

    <!-- Prototype Card -->
    <div class="card" style="border: 2px solid #0284C7;">
      <span class="section-pill pill-blue">PROTOTYPE</span>
      <p style="font-weight: 700; font-style: italic; color: #0284C7; font-size: 0.13in; margin-bottom: 0.08in;">
        "English + Hindi live voice (Assamese text live, voice in progress), elder-friendly high-contrast UI, hands-free Web Speech API interaction, one-tap WhatsApp deep link."
      </p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.1in;">
        <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 0.06in; padding: 0.08in 0.1in;">
          <p style="font-weight: 800; color: #1E40AF; margin: 0; font-size: 0.12in;">📱 Patient PWA App</p>
          <p style="font-size: 0.115in; color: #334155; margin: 0.02in 0 0 0;">56px touch targets, horizon routines, Family Photo Vault.</p>
        </div>
        <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 0.06in; padding: 0.08in 0.1in;">
          <p style="font-weight: 800; color: #065F46; margin: 0; font-size: 0.12in;">💬 WhatsApp Bot</p>
          <p style="font-size: 0.115in; color: #334155; margin: 0.02in 0 0 0;"><a href="https://wa.me/15556680031" target="_blank">wa.me/15556680031</a> bridge, cron reminder dispatch.</p>
        </div>
        <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 0.06in; padding: 0.08in 0.1in;">
          <p style="font-weight: 800; color: #92400E; margin: 0; font-size: 0.12in;">🧠 5 Cognitive Games</p>
          <p style="font-size: 0.115in; color: #334155; margin: 0.02in 0 0 0;">Visual memory, sequencing, reminiscence, auditory rhythm.</p>
        </div>
        <div style="background: #FDF2EB; border: 1px solid #FED7AA; border-radius: 0.06in; padding: 0.08in 0.1in;">
          <p style="font-weight: 800; color: #9A3412; margin: 0; font-size: 0.12in;">📊 Caregiver Center</p>
          <p style="font-size: 0.115in; color: #334155; margin: 0.02in 0 0 0;">Red-flag alerts, 1-tap call, 7-day adherence charts.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Why We Stand Out (4 Boxes) -->
  <div>
    <span class="section-pill pill-terra" style="margin-bottom: 0.06in;">WHY WE STAND OUT ?</span>
    <div class="grid-4">
      <div class="card" style="border: 1.5px solid #C25E2E; padding: 0.12in 0.14in;">
        <p style="font-weight: 800; color: #C25E2E; margin: 0 0 0.04in 0; font-size: 0.125in;">1. Real ML-Powered Engine</p>
        <p style="font-size: 0.115in; margin: 0; color: #334155;">Live FastAPI model on Render calculates per-session difficulty and cognitive health scores from real gameplay telemetry, not static rules.</p>
      </div>
      <div class="card" style="border: 1.5px solid #C25E2E; padding: 0.12in 0.14in;">
        <p style="font-weight: 800; color: #C25E2E; margin: 0 0 0.04in 0; font-size: 0.125in;">2. Culturally Authentic</p>
        <p style="font-size: 0.115in; margin: 0; color: #334155;">Every game, name, and image grounded in real NER culture (Kaji Nemu, Bihu Dhol), unlike Western apps like Lumosity/BrainHQ.</p>
      </div>
      <div class="card" style="border: 1.5px solid #C25E2E; padding: 0.12in 0.14in;">
        <p style="font-weight: 800; color: #C25E2E; margin: 0 0 0.04in 0; font-size: 0.125in;">3. True Offline-First PWA</p>
        <p style="font-size: 0.115in; margin: 0; color: #334155;">Service Worker + IndexedDB caching works in zero-connectivity hill areas, verified via production PWA build.</p>
      </div>
      <div class="card" style="border: 1.5px solid #C25E2E; padding: 0.12in 0.14in;">
        <p style="font-weight: 800; color: #C25E2E; margin: 0 0 0.04in 0; font-size: 0.125in;">4. Zero-Install WhatsApp</p>
        <p style="font-size: 0.115in; margin: 0; color: #334155;">Patients unwilling/unable to install an app still get daily reminders and engagement through a platform they already use.</p>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <span>Smriti (স্মৃতি) • Team Design Divas • SIH26003 (MDoNER)</span>
    <span>Slide 2 / 6</span>
  </div>
</div>

<!-- SLIDE 3: TECHNICAL APPROACH -->
<div class="slide">
  <div class="top-banner">
    <span class="team-badge">Design Divas</span>
    <h1 class="slide-title">TECHNICAL APPROACH & ARCHITECTURE</h1>
    <span class="sih-badge">SIH26003</span>
  </div>

  <div class="grid-2" style="margin-bottom: 0.15in;">
    <!-- Backend Architecture -->
    <div class="card" style="border: 2px solid #1E3A2F;">
      <span class="section-pill pill-forest">BACKEND ARCHITECTURE</span>
      <ul style="font-size: 0.125in;">
        <li><strong>REST & Auth:</strong> Node.js/Express REST API, JWT + bcrypt auth (365-day persistent sessions, isolated Patient/Caregiver roles).</li>
        <li><strong>Database Layer:</strong> MongoDB Atlas (Mongoose ODM): Patients, Caregivers, Reminders, GameSessions, Photos, Chat history.</li>
        <li><strong>Scheduled Cron:</strong> <code>node-cron</code> scheduled reminder dispatch engine.</li>
        <li><strong>Conversational AI:</strong> Google Gemini API powers both in-app chatbot and WhatsApp bot with live per-patient context injection.</li>
        <li><strong>ML Engine Microservice:</strong> Teammate's independent FastAPI ML microservice (Render) exposing <code>/get_next_difficulty</code> and <code>/calculate_health_score</code>, called via <code>mlService.js</code> with a 6-second timeout + automatic rule-based fallback if unreachable.</li>
        <li><strong>Messaging:</strong> Meta WhatsApp Business Cloud API: webhook receiver + <code>wa.me</code> deep link.</li>
        <li><strong>Offline Caching:</strong> <code>vite-plugin-pwa</code> + Workbox + IndexedDB for offline-first caching and background sync queue.</li>
      </ul>
    </div>

    <!-- Three-Tier Flow -->
    <div class="card" style="border: 2px solid #0284C7;">
      <span class="section-pill pill-blue">THREE-TIER USER FLOW</span>
      <div style="display: flex; flex-direction: column; gap: 0.08in;">
        <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 0.06in; padding: 0.08in 0.1in;">
          <p style="font-weight: 800; color: #1E40AF; margin: 0; font-size: 0.12in;">1. Patient (Web/WhatsApp)</p>
          <p style="font-size: 0.115in; color: #334155; margin: 0.02in 0 0 0;">PIN/biometric login or WhatsApp message &rarr; games/reminders/AI chat, synced to MongoDB.</p>
        </div>
        <div style="background: #FDF2EB; border: 1px solid #FED7AA; border-radius: 0.06in; padding: 0.08in 0.1in;">
          <p style="font-weight: 800; color: #9A3412; margin: 0; font-size: 0.12in;">2. Caregiver (Web Dashboard)</p>
          <p style="font-size: 0.115in; color: #334155; margin: 0.02in 0 0 0;">Email/password or Google OAuth &rarr; scoped patient roster, red-flag alerts, cognitive analytics.</p>
        </div>
        <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 0.06in; padding: 0.08in 0.1in;">
          <p style="font-weight: 800; color: #065F46; margin: 0; font-size: 0.12in;">3. AI/ML Layer (Resilience)</p>
          <p style="font-size: 0.115in; color: #334155; margin: 0.02in 0 0 0;">Gemini (conversational) + FastAPI ML service (adaptive difficulty & health scoring), each with graceful fallback.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- AI Components -->
  <div class="card" style="border: 2px solid #C25E2E; padding: 0.14in 0.2in;">
    <span class="section-pill pill-terra" style="margin-bottom: 0.06in;">AI COMPONENTS & INTEGRATION</span>
    <div class="grid-3" style="gap: 0.15in;">
      <div>
        <p style="font-weight: 800; color: #0284C7; margin: 0 0 0.02in 0; font-size: 0.125in;">Google Gemini LLM</p>
        <p style="font-size: 0.115in; margin: 0; color: #334155;">Real-time conversational grounding using live patient data (medications, daily schedule, family relationships) with empathetic dementia care guardrails.</p>
      </div>
      <div>
        <p style="font-weight: 800; color: #065F46; margin: 0 0 0.02in 0; font-size: 0.125in;">ML Difficulty/Scoring (Render)</p>
        <p style="font-size: 0.115in; margin: 0; color: #334155;">Reaction time + mistakes + level &rarr; new difficulty + cognitive health score (0-100) + clinical status label (hosted at <a href="https://dementia-ai-engine.onrender.com" target="_blank">dementia-ai-engine.onrender.com</a>).</p>
      </div>
      <div>
        <p style="font-weight: 800; color: #C25E2E; margin: 0 0 0.02in 0; font-size: 0.125in;">Rule-Based Fallback Layer</p>
        <p style="font-size: 0.115in; margin: 0; color: #334155;">Zero-latency accuracy-threshold logic backing every ML call, guaranteeing continuous uptime even during network drops.</p>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <span>Smriti (স্মৃতি) • Team Design Divas • SIH26003 (MDoNER)</span>
    <span>Slide 3 / 6</span>
  </div>
</div>

<!-- SLIDE 4: FEASIBILITY AND VIABILITY + CHALLENGES -->
<div class="slide">
  <div class="top-banner">
    <span class="team-badge">Design Divas</span>
    <h1 class="slide-title">FEASIBILITY, VIABILITY & CHALLENGES</h1>
    <span class="sih-badge">SIH26003</span>
  </div>

  <div class="grid-2">
    <!-- Left: Feasibility -->
    <div class="card" style="border: 2px solid #1E3A2F;">
      <span class="section-pill pill-forest">FEASIBILITY & VIABILITY</span>
      <div style="display: flex; flex-direction: column; gap: 0.08in;">
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 0.06in; padding: 0.08in 0.1in;">
          <p style="font-weight: 800; color: #1E3A2F; margin: 0; font-size: 0.12in;">✓ Technical Feasibility</p>
          <p style="font-size: 0.115in; color: #334155; margin: 0.02in 0 0 0;">Built entirely on free-tier, production-proven technology (React, Node.js, MongoDB Atlas, Gemini free tier, Meta WhatsApp Cloud API free tier) &mdash; no paid infrastructure required at pilot scale.</p>
        </div>
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 0.06in; padding: 0.08in 0.1in;">
          <p style="font-weight: 800; color: #1E3A2F; margin: 0; font-size: 0.12in;">✓ Operational Feasibility</p>
          <p style="font-size: 0.115in; color: #334155; margin: 0.02in 0 0 0;">WhatsApp already has near-universal penetration across rural NER households; the app requires no new behavior from patients beyond messaging a known contact.</p>
        </div>
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 0.06in; padding: 0.08in 0.1in;">
          <p style="font-weight: 800; color: #1E3A2F; margin: 0; font-size: 0.12in;">✓ Economic Feasibility</p>
          <p style="font-size: 0.115in; color: #334155; margin: 0.02in 0 0 0;">100% free and open-access to any rural clinic or ASHA center &mdash; no subscription, unlike CogniFit/Lumosity/BrainHQ ($15–20/month, unaffordable for rural NER families).</p>
        </div>
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 0.06in; padding: 0.08in 0.1in;">
          <p style="font-weight: 800; color: #1E3A2F; margin: 0; font-size: 0.12in;">✓ Regulatory Feasibility</p>
          <p style="font-size: 0.115in; color: #334155; margin: 0.02in 0 0 0;">DPDP Act 2023-aligned by design &mdash; explicit consent checkboxes, AES-256 encryption at rest, role-scoped access, named Grievance Officer, 30-day deletion guarantee.</p>
        </div>
      </div>
    </div>

    <!-- Right: Challenges -->
    <div class="card" style="border: 2px solid #C25E2E;">
      <span class="section-pill pill-terra">CHALLENGES & MITIGATIONS</span>
      <div style="display: flex; flex-direction: column; gap: 0.08in;">
        <div style="background: #FDF2EB; border: 1px solid #FED7AA; border-radius: 0.06in; padding: 0.08in 0.1in;">
          <p style="font-weight: 800; color: #9A3412; margin: 0; font-size: 0.12in;">🚨 1. Zero digital literacy / no smartphone</p>
          <p style="font-size: 0.115in; color: #334155; margin: 0.02in 0 0 0;"><strong>Mitigation:</strong> WhatsApp-first design (no new app to learn); tiered fallback plan (SMS/IVR Tier 2, ASHA-assisted Kiosk Mode Tier 3) &mdash; architecture-ready, future scope.</p>
        </div>
        <div style="background: #FDF2EB; border: 1px solid #FED7AA; border-radius: 0.06in; padding: 0.08in 0.1in;">
          <p style="font-weight: 800; color: #9A3412; margin: 0; font-size: 0.12in;">🚨 2. Usability for cognitively-impaired elderly</p>
          <p style="font-size: 0.115in; color: #334155; margin: 0.02in 0 0 0;"><strong>Mitigation:</strong> 56px+ touch targets, zero hidden/hamburger navigation, high-contrast palette (following Apple Assistive Access / GrandPad patterns); voice-first interaction eliminates typing.</p>
        </div>
        <div style="background: #FDF2EB; border: 1px solid #FED7AA; border-radius: 0.06in; padding: 0.08in 0.1in;">
          <p style="font-weight: 800; color: #9A3412; margin: 0; font-size: 0.12in;">🚨 3. Reliability in NER's low-connectivity hills</p>
          <p style="font-size: 0.115in; color: #334155; margin: 0.02in 0 0 0;"><strong>Mitigation:</strong> True offline-first PWA (Service Worker + IndexedDB), verified via production build; background sync queue so no progress is lost when connectivity returns.</p>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <span>Smriti (স্মৃতি) • Team Design Divas • SIH26003 (MDoNER)</span>
    <span>Slide 4 / 6</span>
  </div>
</div>

<!-- SLIDE 5: IMPACTS AND BENEFITS -->
<div class="slide">
  <div class="top-banner">
    <span class="team-badge">Design Divas</span>
    <h1 class="slide-title">IMPACTS AND BENEFITS</h1>
    <span class="sih-badge">SIH26003</span>
  </div>

  <!-- Top 3 Benefits -->
  <div class="grid-3" style="margin-bottom: 0.15in;">
    <div class="card" style="border-top: 4px solid #1E3A2F;">
      <p style="font-weight: 800; color: #1E3A2F; margin: 0 0 0.04in 0; font-size: 0.13in;">Economic Benefits</p>
      <p style="font-size: 0.12in; color: #334155; margin: 0;">Reduces dependency on scarce, Guwahati-concentrated neurology specialists (85%+ of NER neurologists are based in Guwahati) by enabling remote, at-home cognitive engagement and caregiver-visible progress tracking &mdash; reducing costly, difficult specialist travel for families.</p>
    </div>
    <div class="card" style="border-top: 4px solid #0284C7;">
      <p style="font-weight: 800; color: #0284C7; margin: 0 0 0.04in 0; font-size: 0.13in;">Social Benefits</p>
      <p style="font-size: 0.12in; color: #334155; margin: 0;">Reduces elderly isolation through daily WhatsApp check-ins and culturally familiar engagement; empowers family caregivers with real visibility; helps counter regional stigma where cognitive decline is dismissed as normal aging ("বুঢ়া বয়সৰ পাহৰণি").</p>
    </div>
    <div class="card" style="border-top: 4px solid #C25E2E;">
      <p style="font-weight: 800; color: #C25E2E; margin: 0 0 0.04in 0; font-size: 0.13in;">Systemic Benefits</p>
      <p style="font-size: 0.12in; color: #334155; margin: 0;">Reduces unnecessary travel to distant specialist centers given NER's rugged terrain; supports the broader Digital India / DoNER telemedicine infrastructure push with structured longitudinal data.</p>
    </div>
  </div>

  <!-- Stakeholder & Impact Flow -->
  <div class="card" style="border: 2px solid #0F172A; margin-bottom: 0.15in; padding: 0.14in 0.2in;">
    <span class="section-pill pill-dark" style="margin-bottom: 0.06in;">STAKEHOLDERS & IMPACT FLOW</span>
    <div class="grid-4" style="gap: 0.14in;">
      <div style="background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 0.06in; padding: 0.08in 0.1in;">
        <p style="font-weight: 800; color: #0284C7; margin: 0; font-size: 0.12in;">1. Patient</p>
        <p style="font-size: 0.115in; color: #334155; margin: 0.02in 0 0 0;">Receives a WhatsApp reminder or opens the PWA, plays a culturally familiar game or replies to a reminder.</p>
      </div>
      <div style="background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 0.06in; padding: 0.08in 0.1in;">
        <p style="font-weight: 800; color: #065F46; margin: 0; font-size: 0.12in;">2. Smriti AI Layer</p>
        <p style="font-size: 0.115in; color: #334155; margin: 0.02in 0 0 0;">Gemini interprets/responds conversationally; ML engine scores session and adjusts difficulty.</p>
      </div>
      <div style="background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 0.06in; padding: 0.08in 0.1in;">
        <p style="font-weight: 800; color: #C25E2E; margin: 0; font-size: 0.12in;">3. Caregiver</p>
        <p style="font-size: 0.115in; color: #334155; margin: 0.02in 0 0 0;">Sees real-time red-flag alerts and 7-day cognitive trend charts, intervenes only when needed.</p>
      </div>
      <div style="background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 0.06in; padding: 0.08in 0.1in;">
        <p style="font-weight: 800; color: #D97706; margin: 0; font-size: 0.12in;">4. Health / ASHA</p>
        <p style="font-size: 0.115in; color: #334155; margin: 0.02in 0 0 0;">Aggregated adherence and cognitive data informs community health worker rounds & regional monitoring.</p>
      </div>
    </div>
  </div>

  <!-- Our Promise -->
  <div style="background: #E6F4EA; border: 1.5px solid #1E3A2F; border-radius: 0.08in; padding: 0.12in 0.2in;">
    <p style="font-weight: 800; color: #1E3A2F; margin: 0 0 0.02in 0; font-size: 0.13in;">🌍 OUR PROMISE & UN SDG ALIGNMENT</p>
    <p style="font-size: 0.12in; color: #0F172A; margin: 0;">
      Aligns with <strong>UN SDG 3 (Good Health & Well-Being)</strong> and <strong>SDG 10 (Reduced Inequalities &mdash; bridging the urban-vs-hill-state care gap)</strong>. Directly supports MDoNER's own mandate of strengthening region-specific development and digital healthcare accessibility across the 8 NER states.
    </p>
  </div>

  <div class="slide-footer">
    <span>Smriti (স্মৃতি) • Team Design Divas • SIH26003 (MDoNER)</span>
    <span>Slide 5 / 6</span>
  </div>
</div>

<!-- SLIDE 6: RESEARCH AND REFERENCES -->
<div class="slide">
  <div class="top-banner">
    <span class="team-badge">Design Divas</span>
    <h1 class="slide-title">RESEARCH AND REFERENCES</h1>
    <span class="sih-badge">SIH26003</span>
  </div>

  <div class="grid-2" style="margin-bottom: 0.15in;">
    <!-- Clinical Research -->
    <div class="card" style="border: 2px solid #1E3A2F;">
      <span class="section-pill pill-forest">CLINICAL & EPIDEMIOLOGICAL DATA</span>
      <ul style="font-size: 0.12in;">
        <li><strong>LASI-DAD National Study (Lancet Public Health / PLOS ONE):</strong> 8.8M Indian seniors with dementia (2026), 7.4–8.44% prevalence, projected 14.3M by 2036.</li>
        <li><strong>WHO / Alzheimer's Disease International:</strong> ~55M global cases (2026) &rarr; 139M by 2050; 60%+ in LMICs.</li>
        <li><strong>NER-Specific Burden:</strong> ~280,000–350,000 cases across 8 states; Assam alone ~180,000+; Vascular Dementia (driven by hypertension + high-sodium diets &mdash; Khar, Ngari, Shidol) is ~20% of cases, highest-in-NER subtype.</li>
        <li><strong>The "Neurology Desert":</strong> 85%+ of NER's neurologists concentrated in Guwahati; hill states have near-zero full-time cognitive neurologists.</li>
      </ul>
    </div>

    <!-- Our Works & Repos -->
    <div class="card" style="border: 2px solid #0284C7;">
      <span class="section-pill pill-blue">OUR WORKS & CODE REPOSITORIES</span>
      <div style="font-size: 0.12in; line-height: 1.5;">
        <p style="margin: 0.04in 0;">• <strong>Live Frontend SPA:</strong> Deployed on Vercel Engine</p>
        <p style="margin: 0.04in 0;">• <strong>Live Backend API:</strong> Node.js / MongoDB Atlas on Render</p>
        <p style="margin: 0.04in 0;">• <strong>Live ML Microservice:</strong> <a href="https://dementia-ai-engine.onrender.com" target="_blank">dementia-ai-engine.onrender.com</a></p>
        <p style="margin: 0.04in 0;">• <strong>WhatsApp Companion Bot:</strong> <a href="https://wa.me/15556680031" target="_blank">wa.me/15556680031</a></p>
        <p style="margin: 0.04in 0;">• <strong>GitHub Repository:</strong> <a href="https://github.com/gopalrajlohiya11-ui/Smriti" target="_blank">github.com/gopalrajlohiya11-ui/Smriti</a></p>
      </div>

      <div style="margin-top: 0.1in; border-top: 1px solid #E2E8F0; padding-top: 0.08in;">
        <span class="section-pill pill-terra" style="font-size: 0.11in; padding: 0.02in 0.1in;">OPEN-SOURCE & ACADEMIC CITATIONS</span>
        <p style="font-size: 0.11in; margin: 0.02in 0;">• <a href="https://doi.org/10.1016/S2468-2667(22)00301-7" target="_blank">LASI-DAD Diagnostic Study (DOI)</a> &bull; <a href="https://github.com/Butovens/DementiaVoiceAnalyzer" target="_blank">DementiaVoiceAnalyzer Repo</a></p>
        <p style="font-size: 0.11in; margin: 0.02in 0;">• <a href="https://www.nice.org.uk/guidance/cg42" target="_blank">NICE Guidelines CG42 (CST)</a> &bull; ARDSI Guwahati/Mizoram &bull; NIMHANS Tele-MANAS (14416)</p>
      </div>
    </div>
  </div>

  <!-- Why Existing Solutions Fail -->
  <div class="card" style="border: 2px solid #C25E2E; padding: 0.12in 0.2in;">
    <span class="section-pill pill-terra" style="margin-bottom: 0.04in;">WHY EXISTING SOLUTIONS FAIL HERE</span>
    <p style="font-size: 0.12in; margin: 0.02in 0; color: #334155;">
      • <strong>CogniFit / Lumosity / BrainHQ:</strong> $15–20/month subscription (unaffordable for rural families), English-only, broadband-dependent &mdash; inaccessible to rural NER families.<br>
      • <strong>MindMate / Timeless / CareZone:</strong> Built for Western/NHS healthcare pathways, no Assamese/Hindi voice, no WhatsApp integration, break on 2G connections.<br>
      • <strong>Smriti Solution:</strong> 100% Free & open-access, culturally authentic NER themes, offline-first PWA, WhatsApp companion bot, and clinical ML telemetry.
    </p>
  </div>

  <div class="slide-footer">
    <span>Smriti (স্মৃতি) • Team Design Divas • SIH26003 (MDoNER)</span>
    <span>Slide 6 / 6</span>
  </div>
</div>

</body>
</html>
`;

  const htmlPath = path.join('d:\\Design Divas\\docs', 'Smriti_SIH26003_Presentation.html');
  const pdfPath = path.join('d:\\Design Divas\\docs', 'Smriti_SIH26003_Presentation.pdf');
  const brainPdfPath = path.join('C:\\Users\\Admin\\.gemini\\antigravity\\brain\\59ecb97c-f629-4d21-ab31-179ae6e55398', 'Smriti_SIH26003_Presentation.pdf');

  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log('✅ 6-Slide Finale HTML saved at:', htmlPath);

  const chromePath = 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe';
  const edgePath = 'C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe';
  const browserExe = fs.existsSync(chromePath) ? chromePath : edgePath;

  const cmd = `"${browserExe}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${htmlPath}"`;
  execSync(cmd);
  console.log('✅ 6-Slide Finale PDF successfully exported at:', pdfPath);

  try {
    fs.copyFileSync(pdfPath, brainPdfPath);
    console.log('✅ PDF copied to artifact brain path');
  } catch (e) {
    console.warn('Could not copy to brain:', e.message);
  }
}

async function main() {
  await generatePPTX();
  generatePDF();
  console.log('🎉 ALL 6-SLIDE FINALE PRESENTATION FILES SUCCESSFULLY GENERATED!');
}

main().catch(err => {
  console.error('Generation Error:', err);
  process.exit(1);
});
