import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { canAccessModule, getModuleForPath } from '@/modules/registry';
import { useAuth } from '../hooks/useAuth';

export interface RoleGuardProps {
  children: ReactNode;
}

export function RoleGuard({ children }: RoleGuardProps) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const module = getModuleForPath(pathname);

  if (!canAccessModule(module, user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
