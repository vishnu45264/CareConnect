import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import SeniorDashboard from './pages/SeniorDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RequestHelpPage from './pages/RequestHelpPage';
import HealthTrackerPage from './pages/HealthTrackerPage';
import CommunityEventsPage from './pages/CommunityEventsPage';
import VolunteerRequestsPage from './pages/VolunteerRequestsPage';
import EmergencyPage from './pages/EmergencyPage';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/senior/dashboard" element={<SeniorDashboard />} />
        <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/senior/request-help" element={<RequestHelpPage />} />
        <Route path="/senior/health-tracker" element={<HealthTrackerPage />} />
        <Route path="/community/events" element={<CommunityEventsPage />} />
        <Route path="/volunteer/requests" element={<VolunteerRequestsPage />} />
        <Route path="/emergency" element={<EmergencyPage />} />
      </Routes>
    </div>
  );
};

export default App; 