import { screen } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router-dom';
import { API_URL } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithProviders } from '@/test/utils/render';
import { DashboardPage } from './DashboardPage';

function renderDashboard(route = '/') {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/shield" element={<DashboardPage />} />
    </Routes>,
    { route },
  );
}

describe('DashboardPage', () => {
  it('embeds the dashboard module on the root route', async () => {
    renderDashboard();

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(await screen.findByText('Bienvenido, admin')).toBeInTheDocument();
    expect(screen.getByTitle('Módulo Dashboard')).toHaveAttribute('src', 'http://localhost:4200');
  });

  it('embeds the module matching the current route', async () => {
    renderDashboard('/shield');

    expect(await screen.findByRole('heading', { name: 'Shield' })).toBeInTheDocument();
    expect(screen.getByTitle('Módulo Shield')).toHaveAttribute(
      'src',
      'http://localhost:5173/shield',
    );
  });

  it('shows a generic greeting while the session is loading', async () => {
    server.use(
      http.get(`${API_URL}/auth/user`, async () => {
        await delay(80);
        return HttpResponse.json({ username: 'admin', role: 'ADMIN' });
      }),
    );
    renderDashboard();

    expect(screen.getByText('Bienvenido, Usuario')).toBeInTheDocument();
    expect(await screen.findByText('Bienvenido, admin')).toBeInTheDocument();
  });
});
