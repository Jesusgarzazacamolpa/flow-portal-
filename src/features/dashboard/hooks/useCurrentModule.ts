import { useLocation } from 'react-router-dom';
import { getModuleForPath } from '@/modules/registry';
import type { ModuleDefinition } from '@/modules/registry';

export function useCurrentModule(): ModuleDefinition {
  const { pathname } = useLocation();
  return getModuleForPath(pathname);
}
