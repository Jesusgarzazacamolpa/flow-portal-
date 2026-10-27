import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router-dom';
import { API_URL } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithProviders } from '@/test/utils/render';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';

function renderGuardedArea(route: string) {
  return renderWithProviders(
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<p>dashboard area</p>} />
        <Route
          path="/shield"
          element={
            <RoleGuard>
              <p>shield area</p>
            </RoleGuard>
          }
        />
        <Route
          path="/interventions"
          element={
            <RoleGuard>
              <p>interventions area</p>
            </RoleGuard>
          }
        />
      </Route>
    </Routes>,
    { route },
  );
}

function mockSession(username: string, role: string) {
  server.use(http.get(`${API_URL}/auth/user`, () => HttpResponse.json({ username, role })));
}

describe('RoleGuard', () => {
  it('allows admins into restricted modules', async () => {
    renderGuardedArea('/shield');

    expect(await screen.findByText('shield area')).toBeInTheDocument();
  });

  it('redirects regular users to the dashboard', async () => {
    mockSession('user', 'USER');
    renderGuardedArea('/shield');

    expect(await screen.findByText('dashboard area')).toBeInTheDocument();
    expect(screen.queryByText('shield area')).not.toBeInTheDocument();
  });

  it('allows operators into interventions but not shield', async () => {
    mockSession('operator', 'OPERATOR');
    const { unmount } = renderGuardedArea('/interventions');

    expect(await screen.findByText('interventions area')).toBeInTheDocument();
    unmount();

    renderGuardedArea('/shield');

    expect(await screen.findByText('dashboard area')).toBeInTheDocument();
  });
});
