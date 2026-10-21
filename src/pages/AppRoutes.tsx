import { Routes, Route, Navigate } from 'react-router-dom';
import { PortalLayout } from '../components/PortalLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { LoginPage } from './LoginPage';
import { DashboardPage } from './DashboardPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

       <Route element={<ProtectedRoute />}>
        <Route element={<PortalLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/shield" element={<DashboardPage />} />
          <Route path="/interventions" element={<DashboardPage />} />
          <Route index element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
