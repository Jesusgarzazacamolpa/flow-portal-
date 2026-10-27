import { env } from '@/shared/config/env';
import type { UserRole } from '@/shared/types';

export const MODULE_IDS = ['dashboard', 'shield', 'interventions'] as const;

export type ModuleId = (typeof MODULE_IDS)[number];

export interface ModuleDefinition {
  id: ModuleId;
  label: string;
  icon: string;
  path: string;
  url: string;
  roles: readonly UserRole[];
}

const DASHBOARD_MODULE: ModuleDefinition = {
  id: 'dashboard',
  label: 'Dashboard',
  icon: '📊',
  path: '/',
  url: env.moduleUrls.dashboard,
  roles: ['ADMIN', 'USER', 'OPERATOR'],
};

const SHIELD_MODULE: ModuleDefinition = {
  id: 'shield',
  label: 'Shield',
  icon: '🛡️',
  path: '/shield',
  url: env.moduleUrls.shield,
  roles: ['ADMIN'],
};

const INTERVENTIONS_MODULE: ModuleDefinition = {
  id: 'interventions',
  label: 'Intervención Humana',
  icon: '👤',
  path: '/interventions',
  url: env.moduleUrls.interventions,
  roles: ['ADMIN', 'OPERATOR'],
};

export const MODULES: readonly ModuleDefinition[] = [
  DASHBOARD_MODULE,
  SHIELD_MODULE,
  INTERVENTIONS_MODULE,
];

const PATH_TO_MODULE: Readonly<Record<string, ModuleId>> = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/shield': 'shield',
  '/interventions': 'interventions',
};

export function getModuleForPath(pathname: string): ModuleDefinition {
  const moduleId = PATH_TO_MODULE[pathname] ?? 'dashboard';
  return MODULES.find((module) => module.id === moduleId) ?? DASHBOARD_MODULE;
}

export function canAccessModule(module: ModuleDefinition, role: UserRole | undefined): boolean {
  return role !== undefined && module.roles.includes(role);
}

export function getNavigationModules(role: UserRole | undefined): ModuleDefinition[] {
  return MODULES.filter((module) => canAccessModule(module, role));
}
