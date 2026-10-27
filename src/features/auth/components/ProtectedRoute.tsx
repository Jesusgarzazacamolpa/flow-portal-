import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ErrorPanel } from '@/shared/ui/ErrorPanel';
import { FullPageLoader } from '@/shared/ui/FullPageLoader';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, sessionError, refetchSession } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullPageLoader label="Verificando sesión…" />;
  }

  if (sessionError) {
    return (
      <ErrorPanel
        message="No se pudo verificar la sesión. Revisa tu conexión e intenta de nuevo."
        onRetry={() => void refetchSession()}
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
