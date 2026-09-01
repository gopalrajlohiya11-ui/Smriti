import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import CaregiverLogin from './pages/caregiver/CaregiverLogin';
import CaregiverDashboard from './pages/caregiver/CaregiverDashboard';
import CaregiverPatientDetail from './pages/caregiver/CaregiverPatientDetail';
import CaregiverNotifications from './pages/caregiver/CaregiverNotifications';
import CaregiverProfile from './pages/caregiver/CaregiverProfile';
import PatientLogin from './pages/patient/PatientLogin';
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientReminders from './pages/patient/PatientReminders';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-stone-900 selection:bg-amber-200 selection:text-amber-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Default Entry: Patient Login */}
              <Route path="/" element={<PatientLogin />} />

              {/* Patient Portal */}
              <Route path="/patient" element={<PatientDashboard />} />
              <Route path="/patient/reminders" element={<PatientReminders />} />
              <Route path="/patient/login" element={<PatientLogin />} />

              {/* Caregiver Portal */}
              <Route path="/caregiver/login" element={<CaregiverLogin />} />
              <Route path="/caregiver" element={<CaregiverDashboard />} />
              <Route path="/caregiver/patient/:id" element={<CaregiverPatientDetail />} />
              <Route path="/caregiver/notifications" element={<CaregiverNotifications />} />
              <Route path="/caregiver/profile" element={<CaregiverProfile />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
