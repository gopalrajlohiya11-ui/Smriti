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

## 📑 Table of Contents

1. [🔬 Clinical Research Dossier & Neurological Foundation](#-clinical-research-dossier--neurological-foundation)
   - [What Actually Happens in Dementia?](#what-actually-happens-in-dementia)
   - [5 Core Cognitive Domains & Smriti Game Mapping](#5-core-cognitive-domains--smriti-game-mapping)
   - [Raw Epidemiological Data & Demographic Statistics](#raw-epidemiological-data--demographic-statistics)
   - [Why Does the North-Eastern Region (NER) Suffer Disproportionately?](#why-does-the-north-eastern-region-ner-suffer-disproportionately)
   - [Major NGOs, Clinical Institutions & Government Initiatives in India](#major-ngos-clinical-institutions--government-initiatives-in-india)
   - [Existing Commercial Apps vs. Smriti](#existing-commercial-apps-vs-smriti)
   - [Verified Open-Source Repositories & Academic Research Papers](#verified-open-source-repositories--academic-research-papers)
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

## 🔬 Clinical Research Dossier & Neurological Foundation

### What Actually Happens in Dementia?
Dementia is **not normal aging**. It is a progressive, irreversible neurodegenerative syndrome characterized by synaptic failure, widespread neuronal loss, and cerebral microvascular degeneration that systematically degrades a senior's **Activities of Daily Living (ADLs)**.

```
                      ┌───────────────────────────────────────────────┐
                      │        NEUROPATHOLOGICAL CASCADE              │
                      └───────────────────────┬───────────────────────┘
                                              │
              ┌───────────────────────────────┼───────────────────────────────┐
              ▼                               ▼                               ▼
    ┌───────────────────┐           ┌───────────────────┐           ┌───────────────────┐
    │ Alzheimer's (~65%)│           │ Vascular (~20%)   │           │ FTD / LBD (~15%)  │
    │ Extracellular Aβ  │           │ Chronic cerebral  │           │ Frontotemporal    │
    │ plaques + hyper-  │           │ hypoperfusion,    │           │ lobar atrophy,    │
    │ phosphorylated    │           │ micro-infarcts,   │           │ α-synuclein Lewy  │
    │ Tau tangles       │           │ lacunar strokes   │           │ body aggregates   │
    └─────────┬─────────┘           └─────────┬─────────┘           └─────────┬─────────┘
              │                               │                               │
              └───────────────────────────────┼───────────────────────────────┘
                                              │
                                              ▼
                      ┌───────────────────────────────────────────────┐
                      │   PROGRESSIVE COGNITIVE & FUNCTIONAL LOSS     │
                      │   • Working Memory Loss   • Executive Deficit │
                      │   • Facial Agnosia        • Speech Dyspraxia  │
                      └───────────────────────────────────────────────┘
```

1. **Alzheimer's Disease (AD) (~65% of cases)**:
   - Extracellular Amyloid-β (Aβ) plaques and intracellular hyperphosphorylated Tau neurofibrillary tangles cause severe cholinergic neuron loss in the basal forebrain and irreversible hippocampal atrophy.
2. **Vascular Dementia (VaD) (~20% of cases — *highest incidence in NER*)**:
   - Chronic cerebral hypoperfusion, diffuse white matter ischemia, and lacunar micro-infarcts triggered by uncontrolled hypertension, atherosclerosis, and microvascular stiffening.
3. **Frontotemporal & Lewy Body Dementias (FTD / LBD) (~15% of cases)**:
   - Frontal and anterior temporal lobe degeneration causing behavioral disinhibition, executive dysfunction, and alpha-synuclein neuronal aggregates causing visual hallucinations and motor fluctuations.

---

### 5 Core Cognitive Domains & Smriti Game Mapping
Smriti translates clinical **Cognitive Stimulation Therapy (CST)** protocols into 5 culturally grounded digital exercises targeting specific neurological networks:

| # | Cognitive Domain | Neuroanatomical Focus | Clinical Manifestation in Dementia | Smriti Game Countermeasure |
|---|---|---|---|---|
| **1** | **Episodic & Working Memory** | Hippocampus & Entorhinal Cortex | Forgetting recent meals, names of common ingredients, and market tasks. | **Market Day Basket (বজাৰৰ পাচি)**<br/>Recall and gather authentic regional produce items (*Bhut Jolokia, Bamboo Shoot, Kaji Nemu, Assam Tea*) under dynamic basket constraints. |
| **2** | **Executive Function & Planning** | Dorsolateral Prefrontal Cortex | Inability to sequence multi-step daily activities (brewing morning tea, dressing, watering Tulsi). | **Daily Routine Sequencer (দैनिक दिनचर्या)**<br/>Step-by-step chronological reordering of familiar cultural daily routines to reinforce motor and procedural memory. |
| **3** | **Facial Recognition & Reminiscence** | Fusiform Gyrus (FFA) & Limbic System | Prosopagnosia / Facial agnosia; progressive alienation and inability to identify close family members. | **Faces & Family Recall (चेहरे और यादें)**<br/>Reminiscence matching of real family photos, names, and kinship bonds integrated directly with the patient’s Memory Bank. |
| **4** | **Auditory Attention & Discrimination** | Superior Temporal Gyrus & Auditory Cortex | Inability to localize auditory stimuli, sound confusion, sensory disorientation. | **Sound & Rhythm Match (ध्वनि और लय)**<br/>Acoustic memory association with traditional indigenous instruments (*Assamese Dhol, Pepa horn, Shankha, Temple Bell*). |
| **5** | **Semantic Categorization & Logic** | Left Temporal Pole & Inferior Parietal Lobule | Semantic confusion; inability to identify category anomalies or functional classifications. | **Odd One Out (अलग पहचानें)**<br/>Visual and semantic discrimination identifying the non-conforming item across regional botanical, culinary, and cultural sets. |

---

### Raw Epidemiological Data & Demographic Statistics

```
                                  DEMENTIA BURDEN OVERVIEW
┌───────────────────────────┬───────────────────────────────┬──────────────────────────────────────────┐
│ Jurisdiction / Scope      │ Prevalence / Population Count │ Key Demographic Insights & Source        │
├───────────────────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ Global Burden             │ ~55 Million (2026)            │ WHO / Alzheimer's Disease International: │
│                           │ → 139 Million by 2050         │ >60% in LMICs. Global cost >$1.3 Trillion│
├───────────────────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ India National (60+)      │ 8.8 Million (2026)            │ LASI-DAD Study (Lancet Public Health):   │
│                           │ 7.4% – 8.44% prevalence rate  │ Over 17.6% (24M+) have MCI. Projected    │
│                           │                               │ to reach 14.3 Million by 2036.           │
├───────────────────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ Rural vs. Urban Disparity │ 68% Rural vs. 32% Urban       │ Rural India bears >2/3 of total burden   │
│                           │                               │ due to zero local specialist coverage.   │
├───────────────────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ Gender & Literacy Impact  │ Females: 9.0% (vs. 5.8% Men)  │ Significantly higher in illiterate rural │
│                           │ Non-literate: 10.1%           │ seniors due to lower cognitive reserve.  │
├───────────────────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ North-Eastern Region (NER)│ ~280,000 – 350,000 cases      │ Assam accounts for 180,000+ cases.       │
│ (8 States)                │ across the 8 NER states       │ Mizoram & Meghalaya have fastest-growing │
│                           │                               │ vascular dementia risk curves in India.  │
└───────────────────────────┴───────────────────────────────┴──────────────────────────────────────────┘
```

---

### Why Does the North-Eastern Region (NER) Suffer Disproportionately?

The North-Eastern Region of India faces a unique intersection of epidemiological, geographical, and healthcare deficits that make dementia far more severe than in mainland India:

1. **The Vascular Risk Triad (Hypertension + Dietary Practices)**:
   - **Epidemic Hypertension**: Clinical surveys in Assam (Kamrup ~33%) and Mizoram show hypertension prevalence **15–20% above the national average**, directly escalating cerebral micro-infarcts and Vascular Dementia.
   - **High-Sodium Indigenous Diets**: Heavy dietary reliance on alkaline preparations (*Khar*), fermented high-salt fish (*Ngari, Shidol*), smoked meats, and widespread betel nut chewing (*Tamul-Paan*) causes chronic endothelial injury and microvascular stiffening.
2. **The "Neurology Desert" (Extreme Specialist Deficit)**:
   - **85%+ Specialist Concentration in Guwahati**: Over 85% of all DM/MCh neurologists across the entire 8 states operate exclusively out of Guwahati (GMCH, GNRC, Apollo).
   - **Near-Zero Rural Coverage**: Hill states such as Arunachal Pradesh, Nagaland, and Mizoram have near-zero full-time cognitive neurologists outside capital cities, forcing frail elderly patients to undertake grueling 12-hour mountain journeys for basic clinical evaluations.
3. **Topography & Connectivity Chasm**:
   - Mountainous terrain, monsoon floods, and landslides sever physical access to secondary healthcare centers.
   - Intermittent 2G/3G mobile networks cause conventional, cloud-reliant health apps to crash, permanently corrupting patient telemetry.
4. **Linguistic Diversity & Cultural Alienation**:
   - NER is home to over **220+ indigenous dialects** (Assamese, Bodo, Khasi, Garo, Mizo, Meitei, Nagamese).
   - Standard Western cognitive tests (e.g., MMSE using US seasons or Western objects) cause massive false-positive cognitive impairment diagnoses.
   - Severe societal stigma: Over 90% of families write off early memory loss as natural aging (*"বুঢ়া বয়সৰ পাহৰণি"* / *"Bura boyoxor pahoroni"*), resulting in diagnosis only at advanced Stage 3 or 4.

---

### Major NGOs, Clinical Institutions & Government Initiatives in India

| Organization / Body | Headquarters & Scope | Key Clinical Programs & Regional Presence |
|---|---|---|
| **ARDSI** *(Alzheimer's & Related Disorders Society of India)* | Kochi / National Apex NGO (Est. 1992) | Publishes the authoritative *Dementia in India Report*. Operates active regional chapters in **Guwahati (Dr. H. K. Goswami)** and **Mizoram (Aizawl)** providing caregiver respite training and day-care centers. |
| **NIMHANS Bangalore** | National Institute of Mental Health & Neurosciences | Developed the ICMR-NCDC Cognitive Assessment Toolkits; operates the national 24×7 **Tele-MANAS (14416)** tele-counseling grid linked across all NER states. |
| **Dementia India Alliance (DIA)** | National Non-Profit Network | Operates *"DemClinic"* national digital clinical support, family peer support groups, and elder rights legal advocacy. |
| **Nightingales Medical Trust (NMT)** | Bangalore / Pan-India | Runs specialized dementia day care, memory screening mobile vans, and community caregiver training. |
| **SCARF India (DEMCARES)** | Chennai (WHO Collaborating Centre) | Developed community dementia screening toolkits specifically adapted for rural **ASHA** and **Anganwadi** frontline healthcare workers. |
| **Ministry of DoNER & NEC** | Government of India / Shillong | Funds regional healthcare connectivity, rural telemedicine nodes, and SIH26003 innovation challenges. |

---

### Existing Commercial Apps vs. Smriti

```
┌───────────────────────────────┬───────────────────────────────┬──────────────────────────────────────────┐
│ App / Platform                │ Target Market / Model         │ Critical Failure Modes in Rural NER      │
├───────────────────────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ CogniFit / Lumosity / BrainHQ │ US / EU Commercial            │ • Prohibitive subscription ($15-$20/mo)  │
│                               │ ($15–$20 / month)             │ • English-only abstract geometric tasks  │
│                               │                               │ • Requires high-speed broadband; crashes │
├───────────────────────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ MindMate / Timeless / CareZone│ Western Dementia Care         │ • Geared for nuclear Western families    │
│                               │ (NHS / Medicare)              │ • Zero Assamese / Hindi voice guidance   │
│                               │                               │ • No WhatsApp integration; no 2G support │
├───────────────────────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ 🌸 SMRITI                      │ North-Eastern & Rural Indian  │ ✓ 100% Free & Open-Access for clinics    │
│ (Our SIH26003 Platform)       │ Demographics                  │ ✓ Culturally Attuned (Kaji Nemu, Dhol)   │
│                               │                               │ ✓ 100% Offline-First PWA (IndexedDB)     │
│                               │                               │ ✓ Multilingual Voice + WhatsApp Bot      │
│                               │                               │ ✓ Real-time ML Adaptive Telemetry on Render│
└───────────────────────────────┴───────────────────────────────┴──────────────────────────────────────────┘
```

---

### Verified Open-Source Repositories & Academic Research Papers

- **LASI-DAD Diagnostic Study (*The Lancet Public Health*, 2023)**:
  - *Paper DOI*: [`10.1016/S2468-2667(22)00301-7`](https://doi.org/10.1016/S2468-2667(22)00301-7) • *Clinical Portal*: [https://lasi-dad.org](https://lasi-dad.org)
  - Nationally representative clinical assessment dataset of 4,000+ Indian seniors establishing the 7.4% national dementia prevalence baseline.
- **NEUROHACK2022_Dementia (Clinical Dementia Rating ML Model)**:
  - *Repositories*: [`github.com/shreyasgite/dementianet`](https://github.com/shreyasgite/dementianet) • [`github.com/DEMON-NEUROHACK`](https://github.com/DEMON-NEUROHACK)
  - Machine learning pipeline using PCA, Support Vector Machines (SVM), and Random Forests to predict Clinical Dementia Rating (CDR) progression.
- **DementiaVoiceAnalyzer (Acoustic Biomarker Pipeline)**:
  - *Repository*: [`github.com/Butovens/DementiaVoiceAnalyzer`](https://github.com/Butovens/DementiaVoiceAnalyzer)
  - Extracts acoustic speech biomarkers (pitch variability, shimmer, jitter, spectral centroids via openSMILE) to detect early cognitive decline.
- **Alzheimer-Detection NLP (Spontaneous Speech Analysis)**:
  - *Repository*: [`github.com/42bismuth/Alzheimer-Detection`](https://github.com/42bismuth/Alzheimer-Detection)
  - React + Python NLP pipeline analyzing hesitation pauses, lexical richness, and syntactic complexity in dementia speech.
- **NICE Clinical Guidelines on Cognitive Stimulation Therapy (CG42)**:
  - *Guidelines*: [nice.org.uk/guidance/cg42](https://www.nice.org.uk/guidance/cg42) • *World Alzheimer Report (ADI)*
  - Gold-standard medical evidence proving regular Cognitive Stimulation Therapy (CST) significantly slows cognitive decline by 6 to 9 months.

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

### 1. Senior-Centric Patient Portal & Horizon Routines
- **Cognitive-Load Reduced Interface**: High-contrast, warm soothing palette (`#FAF7F2`), large 56px touch targets, and zero complex navigation trees.
- **Horizon Routines**: Forward chronological progression through 10 daily routines (Morning Tea, Blood Pressure Medication, Hydration, Tulsi walk, Memory Game, Night Rest). Completing a routine dynamically spotlights the next scheduled task.
- **Audible Celebrations**: Confetti animations and reassuring audio praise upon completing daily health milestones.

### 2. Culturally Attuned Cognitive Games Suite
All 5 games are deeply rooted in North-Eastern Indian heritage:
- **Market Day Basket (বজাৰৰ পাচি)**: Memory & classification with 10 authentic NER botanical assets (*Kaji Nemu, Bamboo Shoot, Bhut Jolokia, Assam Tea, Malbhog Banana*).
- **Daily Routine Sequencer (दैनिक दिनचर्या)**: Procedural memory sequencing daily cultural routines.
- **Faces & Family Recall (चेहरे और यादें)**: Reminiscence therapy reinforcing family facial recognition and kinship relations.
- **Sound & Rhythm Match (ध्वनि और लय)**: Auditory memory recognizing regional acoustic instruments (*Assamese Dhol, Pepa horn, Shankha, Temple Bell*).
- **Odd One Out (अलग पहचानें)**: Semantic discrimination identifying categorical anomalies.

### 3. Multimodal Voice Guidance & Google Gemini AI Assistant
- **Web Speech Synthesis**: Instant text-to-speech aloud reading across Assamese (`as-IN`), Hindi (`hi-IN`), and English (`en-IN`) with a race-condition-proof audio queue.
- **Google Gemini Generative AI**: Context-grounded conversational companion aware of the patient’s active prescriptions, caregiver contact, and daily schedule. Supports natural voice audio input and spoken playback.

### 4. Meta WhatsApp Bot & Automated Routine Engine
- **Direct Bot Link**: Instant 1-tap connection via [`https://wa.me/15556680031`](https://wa.me/15556680031?text=Hi%20Smriti).
- **Automated Node-Cron Reminders**: Background cron engine checks active patient prescription times and dispatches timely WhatsApp notifications.
- **Bidirectional Sync**: Patient replies on WhatsApp automatically acknowledge reminders on the caregiver’s live dashboard.

### 5. Clinical Caregiver Hub & Real-Time Red Flag Alerts
- **Caregiver Command Center**: Patient roster management, vitals monitoring, and 7-day adherence visualizations.
- **Active Red Flag Alerts**: Immediate high-priority alerts when critical morning or evening doses are missed, with 1-tap phone dialer and dismissal audit trails.
- **Deep Cognitive Telemetry**: Graphical dashboards plotting reaction time distributions, mistake curves, and cognitive domain scores over time.

### 6. Live Machine Learning Microservice
- **Hosted on Render**: [`https://dementia-ai-engine.onrender.com`](https://dementia-ai-engine.onrender.com).
- **Dynamic Adaptive Difficulty (`POST /get_next_difficulty`)**: Continuously analyzes round reaction times and mistake counts to calibrate next-session starting difficulties in real time.
- **Longitudinal Health Scoring (`POST /calculate_health_score`)**: Synthesizes weekly cognitive game performance into a standardized Cognitive Health Score (0–100) and clinical status label (*Stable*, *Mild Decline*, *Moderate Decline*).

### 7. 100% Offline-First PWA Architecture
- **Workbox Service Worker**: Full application shell pre-cached for 100% functionality during complete internet outages.
- **IndexedDB Sync Queue (`idb`)**: Medication completions, Memory Bank photos, and game telemetry are stored locally in IndexedDB and automatically synchronized with MongoDB when network connectivity returns.

### 8. Hardware-Level WebAuthn FIDO2 Biometrics & DPDP Act 2023 Compliance
- **FIDO2 Fingerprint & Face Unlock**: Hardware-level biometric authentication via the Web Authentication API; raw biometric data never leaves the senior's device.
- **DPDP Act 2023 Compliance**: Mandatory caregiver/patient consent checkboxes prior to Memory Bank photo uploads, explicit data purpose limitation, 30-day right to erasure, and Grievance Officer audit logs.

---

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
