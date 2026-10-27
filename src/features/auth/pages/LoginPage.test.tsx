import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router-dom';
import { sessionQueryKey } from '@/features/auth/hooks/useAuth';
import { API_URL } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithProviders } from '@/test/utils/render';
import { LoginPage } from './LoginPage';

function mockUnauthenticated() {
  server.use(http.get(`${API_URL}/auth/user`, () => new HttpResponse(null, { status: 401 })));
}

function renderLoginPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<p>portal home</p>} />
    </Routes>,
    { route: '/login' },
  );
}

describe('LoginPage', () => {
  it('renders the credentials form', async () => {
    mockUnauthenticated();
    renderLoginPage();

    expect(await screen.findByRole('heading', { name: 'Flow Portal' })).toBeInTheDocument();
    expect(screen.getByLabelText('Usuario')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeEnabled();
  });

  it('shows the backend error for invalid credentials', async () => {
    mockUnauthenticated();
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText('Usuario'), 'admin');
    await user.type(screen.getByLabelText('Contraseña'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas');
  });

  it('stores the session and navigates home after a successful login', async () => {
    mockUnauthenticated();
    const user = userEvent.setup();
    const { queryClient } = renderLoginPage();

    await user.type(screen.getByLabelText('Usuario'), 'admin');
    await user.type(screen.getByLabelText('Contraseña'), 'admin123');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(await screen.findByText('portal home')).toBeInTheDocument();
    expect(queryClient.getQueryData(sessionQueryKey)).toMatchObject({
      username: 'admin',
      role: 'ADMIN',
    });
  });

  it('disables the submit button while authenticating', async () => {
    mockUnauthenticated();
    server.use(
      http.post(`${API_URL}/auth/login`, async () => {
        await delay(80);
        return HttpResponse.json({ username: 'admin', role: 'ADMIN' });
      }),
    );
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText('Usuario'), 'admin');
    await user.type(screen.getByLabelText('Contraseña'), 'admin123');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(screen.getByRole('button', { name: 'Autenticando...' })).toBeDisabled();
    expect(await screen.findByText('portal home')).toBeInTheDocument();
  });

  it('redirects to the target page when a session is already active', async () => {
    renderLoginPage();

    expect(await screen.findByText('portal home')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Flow Portal' })).not.toBeInTheDocument();
  });
});
