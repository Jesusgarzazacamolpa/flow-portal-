import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router-dom';
import { API_URL } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithProviders } from '@/test/utils/render';
import { ProtectedRoute } from './ProtectedRoute';

function renderProtectedArea(route = '/') {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<p>login page</p>} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<p>private area</p>} />
      </Route>
    </Routes>,
    { route },
  );
}

describe('ProtectedRoute', () => {
  it('shows a loader while the session is checked', async () => {
    server.use(
      http.get(`${API_URL}/auth/user`, async () => {
        await delay(80);
        return HttpResponse.json({ username: 'admin', role: 'ADMIN' });
      }),
    );
    renderProtectedArea();

    expect(screen.getByRole('status')).toHaveTextContent('Verificando sesión…');
    expect(await screen.findByText('private area')).toBeInTheDocument();
  });

  it('redirects unauthenticated visitors to the login page', async () => {
    server.use(http.get(`${API_URL}/auth/user`, () => new HttpResponse(null, { status: 401 })));
    renderProtectedArea();

    expect(await screen.findByText('login page')).toBeInTheDocument();
  });

  it('renders the protected content for an active session', async () => {
    renderProtectedArea();

    expect(await screen.findByText('private area')).toBeInTheDocument();
  });

  it('shows an error panel and recovers when the session check is retried', async () => {
    server.use(http.get(`${API_URL}/auth/user`, () => new HttpResponse(null, { status: 500 })));
    const user = userEvent.setup();
    renderProtectedArea();

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo verificar la sesión');

    server.resetHandlers();
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText('private area')).toBeInTheDocument();
  });
});
