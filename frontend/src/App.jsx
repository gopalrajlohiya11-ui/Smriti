import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import CaregiverLogin from './pages/caregiver/CaregiverLogin';
import CaregiverDashboard from './pages/caregiver/CaregiverDashboard';
import CaregiverPatientDetail from './pages/caregiver/CaregiverPatientDetail';
import CaregiverCognitiveGames from './pages/caregiver/CaregiverCognitiveGames';
import CaregiverNotifications from './pages/caregiver/CaregiverNotifications';
import CaregiverProfile from './pages/caregiver/CaregiverProfile';
import PatientLogin from './pages/patient/PatientLogin';
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientReminders from './pages/patient/PatientReminders';
import PatientFamily from './pages/patient/PatientFamily';
import PatientProfile from './pages/patient/PatientProfile';
import MarketDayBasket from './pages/patient/games/MarketDayBasket';
import DailyRoutineSequencer from './pages/patient/games/DailyRoutineSequencer';
import FacesFamilyRecall from './pages/patient/games/FacesFamilyRecall';
import SoundRhythmMatch from './pages/patient/games/SoundRhythmMatch';
import OddOneOut from './pages/patient/games/OddOneOut';
import PatientAllGames from './pages/patient/PatientAllGames';
import PatientChatbot from './components/patient/PatientChatbot';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-stone-900 selection:bg-amber-200 selection:text-amber-900">
          <Navbar />
          <main className="flex-1">
            <ErrorBoundary>
              <Routes>
                {/* Default Entry: Patient Login */}
                <Route path="/" element={<PatientLogin />} />

                {/* Patient Portal */}
                <Route path="/patient" element={<PatientDashboard />} />
                <Route path="/patient/profile" element={<PatientProfile />} />
                <Route path="/patient/reminders" element={<PatientReminders />} />
                <Route path="/patient/family" element={<PatientFamily />} />
                <Route path="/patient/games" element={<PatientAllGames />} />
                <Route path="/patient/games/market-day-basket" element={<MarketDayBasket />} />
                <Route path="/patient/games/daily-routine-sequencer" element={<DailyRoutineSequencer />} />
                <Route path="/patient/games/faces-family-recall" element={<FacesFamilyRecall />} />
                <Route path="/patient/games/sound-rhythm-match" element={<SoundRhythmMatch />} />
                <Route path="/patient/games/odd-one-out" element={<OddOneOut />} />
                <Route path="/patient/login" element={<PatientLogin />} />

              {/* Caregiver Portal */}
              <Route path="/caregiver/login" element={<CaregiverLogin />} />
              <Route path="/caregiver" element={<CaregiverDashboard />} />
              <Route path="/caregiver/patient/:id" element={<CaregiverPatientDetail />} />
              <Route path="/caregiver/patient/:id/games" element={<CaregiverCognitiveGames />} />
              <Route path="/caregiver/notifications" element={<CaregiverNotifications />} />
              <Route path="/caregiver/profile" element={<CaregiverProfile />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </main>
          {/* Floating AI Chatbot for Patient Portal */}
          <PatientChatbot />

          {/* In-App PWA Install Banner & Guidance */}
          <PwaInstallPrompt />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
