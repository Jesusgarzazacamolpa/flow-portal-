import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { useCurrentModule } from './useCurrentModule';

function renderAt(pathname: string) {
  return renderHook(() => useCurrentModule(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={[pathname]}>{children}</MemoryRouter>
    ),
  });
}

describe('useCurrentModule', () => {
  it('resolves the module from the current path', () => {
    expect(renderAt('/interventions').result.current.id).toBe('interventions');
    expect(renderAt('/shield').result.current.id).toBe('shield');
    expect(renderAt('/dashboard').result.current.id).toBe('dashboard');
  });

  it('falls back to the dashboard for unknown paths', () => {
    expect(renderAt('/nope').result.current.id).toBe('dashboard');
  });
});
