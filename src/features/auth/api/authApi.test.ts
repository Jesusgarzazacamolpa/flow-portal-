import { http, HttpResponse } from 'msw';
import { API_URL } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { authApi } from './authApi';

describe('authApi', () => {
  it('logs in and maps the backend payload to a user', async () => {
    await expect(authApi.login({ username: 'admin', password: 'admin123' })).resolves.toEqual({
      id: 'admin',
      username: 'admin',
      email: 'admin@floworchestrator.com',
      role: 'ADMIN',
    });
  });

  it('falls back to the USER role when the backend returns an unknown role', async () => {
    server.use(
      http.post(`${API_URL}/auth/login`, () =>
        HttpResponse.json({ username: 'guest', role: 'GUEST' }),
      ),
    );

    const user = await authApi.login({ username: 'guest', password: 'secret' });

    expect(user.role).toBe('USER');
    expect(user.email).toBe('guest@floworchestrator.com');
  });

  it('rejects invalid credentials', async () => {
    await expect(authApi.login({ username: 'admin', password: 'nope' })).rejects.toThrow(
      'Credenciales inválidas',
    );
  });

  it('returns the active session', async () => {
    await expect(authApi.session()).resolves.toMatchObject({ username: 'admin', role: 'ADMIN' });
  });

  it('returns null when the session is unauthorized', async () => {
    server.use(http.get(`${API_URL}/auth/user`, () => new HttpResponse(null, { status: 401 })));

    await expect(authApi.session()).resolves.toBeNull();
  });

  it('rethrows unexpected session errors', async () => {
    server.use(http.get(`${API_URL}/auth/user`, () => new HttpResponse(null, { status: 500 })));

    await expect(authApi.session()).rejects.toThrow('HTTP 500');
  });

  it('closes the session', async () => {
    await expect(authApi.logout()).resolves.toBeUndefined();
  });
});
