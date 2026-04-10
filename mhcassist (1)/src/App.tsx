import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { PatientIntake } from './pages/PatientIntake';
import { RiskDashboard } from './pages/RiskDashboard';
import { PatientDetail } from './pages/PatientDetail';
import { Reports } from './pages/Reports';
import { Compliance } from './pages/Compliance';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';

import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />

          <Route path="/intake" element={
            <Layout>
              <PatientIntake />
            </Layout>
          } />

          <Route path="/patient/:id" element={
            <Layout>
              <PatientDetail />
            </Layout>
          } />

          <Route path="/risk-dashboard" element={
            <Layout>
              <RiskDashboard />
            </Layout>
          } />

          <Route path="/reports" element={
            <Layout>
              <Reports />
            </Layout>
          } />

          <Route path="/compliance" element={
            <Layout>
              <Compliance />
            </Layout>
          } />

          <Route path="/notifications" element={
            <Layout>
              <Notifications />
            </Layout>
          } />

          <Route path="/settings" element={
            <Layout>
              <Settings />
            </Layout>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
