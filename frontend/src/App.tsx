import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './layouts/PublicLayout';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { ResponsibleAIPage } from './pages/ResponsibleAIPage';
import { PrivacyConsentPage } from './pages/PrivacyConsentPage';
import { SubmitSightingPage } from './pages/SubmitSightingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Authenticated Pages
import { DashboardPage } from './pages/DashboardPage';
import { CasesPage } from './pages/CasesPage';
import { CreateCasePage } from './pages/CreateCasePage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { AIAnalysisCenterPage } from './pages/AIAnalysisCenterPage';
import { PatternInsightsPage } from './pages/PatternInsightsPage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { ConsentWallPage } from './pages/ConsentWallPage';
import { SecureCommunicationPage } from './pages/SecureCommunicationPage';
import { AuditHistoryPage } from './pages/AuditHistoryPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes with PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/responsible-ai" element={<ResponsibleAIPage />} />
            <Route path="/privacy-consent" element={<PrivacyConsentPage />} />
            <Route path="/submit-sighting" element={<SubmitSightingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Authenticated Application Routes with AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/cases/create" element={<CreateCasePage />} />
            <Route path="/cases/:id" element={<CaseDetailPage />} />
            <Route path="/ai-center" element={<AIAnalysisCenterPage />} />

            {/* Investigator and Admin only */}
            <Route
              path="/patterns"
              element={
                <ProtectedRoute allowedRoles={['investigator', 'admin']}>
                  <PatternInsightsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reviews"
              element={
                <ProtectedRoute allowedRoles={['investigator', 'admin']}>
                  <ReviewQueuePage />
                </ProtectedRoute>
              }
            />

            {/* Core Consent and Comms */}
            <Route path="/consent-wall" element={<ConsentWallPage />} />
            <Route path="/communication" element={<SecureCommunicationPage />} />

            {/* Audit Logs */}
            <Route
              path="/audit"
              element={
                <ProtectedRoute allowedRoles={['investigator', 'admin']}>
                  <AuditHistoryPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Governance */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
