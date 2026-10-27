import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { API_URL } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithProviders } from '@/test/utils/render';
import { AppRoutes } from './router';

function mockUnauthenticated() {
  server.use(http.get(`${API_URL}/auth/user`, () => new HttpResponse(null, { status: 401 })));
}

function mockSession(username: string, role: string) {
  server.use(http.get(`${API_URL}/auth/user`, () => HttpResponse.json({ username, role })));
}

describe('AppRoutes', () => {
  it('sends unauthenticated visitors to the login page', async () => {
    mockUnauthenticated();
    renderWithProviders(<AppRoutes />, { route: '/' });

    expect(await screen.findByRole('heading', { name: 'Flow Portal' })).toBeInTheDocument();
  });

  it('opens the dashboard after a successful login', async () => {
    mockUnauthenticated();
    const user = userEvent.setup();
    renderWithProviders(<AppRoutes />, { route: '/login' });

    await user.type(await screen.findByLabelText('Usuario'), 'admin');
    await user.type(screen.getByLabelText('Contraseña'), 'admin123');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByTitle('Módulo Dashboard')).toBeInTheDocument();
  });

  it('renders the shield module for admins', async () => {
    renderWithProviders(<AppRoutes />, { route: '/shield' });

    expect(await screen.findByRole('heading', { name: 'Shield' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Shield' })).toBeInTheDocument();
  });

  it('redirects regular users away from restricted modules', async () => {
    mockSession('user', 'USER');
    renderWithProviders(<AppRoutes />, { route: '/shield' });

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('maps the dashboard alias to the root route', async () => {
    renderWithProviders(<AppRoutes />, { route: '/dashboard' });

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('redirects unknown paths to the dashboard', async () => {
    renderWithProviders(<AppRoutes />, { route: '/does-not-exist' });

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('keeps the login route public', async () => {
    mockUnauthenticated();
    renderWithProviders(<AppRoutes />, { route: '/login' });

    expect(await screen.findByLabelText('Usuario')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Salir' })).not.toBeInTheDocument();
  });
});
