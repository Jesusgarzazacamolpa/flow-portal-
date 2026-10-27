import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { RoleGuard } from '@/features/auth/components/RoleGuard';
import { PortalLayout } from '@/shared/layout/PortalLayout';
import { FullPageLoader } from '@/shared/ui/FullPageLoader';

const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((module) => ({ default: module.LoginPage })),
);

const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
);

export function AppRoutes() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<PortalLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<Navigate to="/" replace />} />
            <Route
              path="shield"
              element={
                <RoleGuard>
                  <DashboardPage />
                </RoleGuard>
              }
            />
            <Route
              path="interventions"
              element={
                <RoleGuard>
                  <DashboardPage />
                </RoleGuard>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
