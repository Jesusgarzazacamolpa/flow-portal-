import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { API_URL } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { App } from './App';

describe('App', () => {
  it('boots the portal and resolves the unauthenticated session', async () => {
    server.use(http.get(`${API_URL}/auth/user`, () => new HttpResponse(null, { status: 401 })));

    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Flow Portal' })).toBeInTheDocument();
  });
});
