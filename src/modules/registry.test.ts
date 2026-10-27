import { MODULES, canAccessModule, getModuleForPath, getNavigationModules } from './registry';

const dashboard = MODULES[0]!;
const shield = MODULES[1]!;
const interventions = MODULES[2]!;

describe('getModuleForPath', () => {
  it('resolves every registered path', () => {
    expect(getModuleForPath('/').id).toBe('dashboard');
    expect(getModuleForPath('/dashboard').id).toBe('dashboard');
    expect(getModuleForPath('/shield').id).toBe('shield');
    expect(getModuleForPath('/interventions').id).toBe('interventions');
  });

  it('falls back to the dashboard for unknown paths', () => {
    expect(getModuleForPath('/unknown').id).toBe('dashboard');
    expect(getModuleForPath('').id).toBe('dashboard');
  });

  it('exposes the remote urls', () => {
    expect(dashboard.url).toBe('http://localhost:4200');
    expect(shield.url).toBe('http://localhost:5173/shield');
    expect(interventions.url).toBe('http://localhost:5173/interventions');
  });
});

describe('canAccessModule', () => {
  it('checks the module roles', () => {
    expect(canAccessModule(shield, 'ADMIN')).toBe(true);
    expect(canAccessModule(shield, 'USER')).toBe(false);
    expect(canAccessModule(interventions, 'OPERATOR')).toBe(true);
    expect(canAccessModule(interventions, 'USER')).toBe(false);
  });

  it('denies access without a role', () => {
    expect(canAccessModule(dashboard, undefined)).toBe(false);
  });
});

describe('getNavigationModules', () => {
  it('only exposes the dashboard to regular users', () => {
    expect(getNavigationModules('USER').map((module) => module.id)).toEqual(['dashboard']);
  });

  it('exposes all modules to admins', () => {
    expect(getNavigationModules('ADMIN').map((module) => module.id)).toEqual([
      'dashboard',
      'shield',
      'interventions',
    ]);
  });

  it('exposes dashboard and interventions to operators', () => {
    expect(getNavigationModules('OPERATOR').map((module) => module.id)).toEqual([
      'dashboard',
      'interventions',
    ]);
  });

  it('returns no modules without a role', () => {
    expect(getNavigationModules(undefined)).toEqual([]);
  });
});
