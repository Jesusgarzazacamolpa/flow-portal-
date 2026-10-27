import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router-dom';
import { sessionQueryKey } from '@/features/auth/hooks/useAuth';
import { API_URL } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithProviders } from '@/test/utils/render';
import { PortalLayout } from './PortalLayout';

function renderLayout(route = '/') {
  return renderWithProviders(
    <Routes>
      <Route element={<PortalLayout />}>
        <Route path="/" element={<p>dashboard content</p>} />
        <Route path="/shield" element={<p>shield content</p>} />
      </Route>
    </Routes>,
    { route },
  );
}

describe('PortalLayout', () => {
  it('shows every module available for an admin', async () => {
    renderLayout();

    expect(await screen.findByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Shield' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Intervención Humana' })).toBeInTheDocument();
    expect(screen.getByText('admin (ADMIN)')).toBeInTheDocument();
    expect(screen.getByText('dashboard content')).toBeInTheDocument();
  });

  it('hides restricted modules for regular users', async () => {
    server.use(
      http.get(`${API_URL}/auth/user`, () => HttpResponse.json({ username: 'user', role: 'USER' })),
    );
    renderLayout();

    expect(await screen.findByText('user (USER)')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Shield' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Intervención Humana' })).not.toBeInTheDocument();
  });

  it('toggles the theme from the header', async () => {
    const user = userEvent.setup();
    renderLayout();

    await screen.findByText('admin (ADMIN)');
    expect(document.documentElement).not.toHaveClass('dark');

    await user.click(screen.getByRole('button', { name: 'Cambiar tema' }));

    expect(document.documentElement).toHaveClass('dark');
  });

  it('clears the session when logging out', async () => {
    const user = userEvent.setup();
    const { queryClient } = renderLayout();

    await screen.findByText('admin (ADMIN)');
    await user.click(screen.getByRole('button', { name: 'Salir' }));

    await waitFor(() => expect(queryClient.getQueryData(sessionQueryKey)).toBeNull());
  });

  it('marks the active route in the navigation', async () => {
    renderLayout('/shield');

    const activeLink = await screen.findByRole('link', { name: 'Shield' });

    expect(activeLink).toHaveClass('text-sky-600');
    expect(screen.getByText('shield content')).toBeInTheDocument();
  });
});
