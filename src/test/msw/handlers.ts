import { http, HttpResponse } from 'msw';

export const API_URL = 'http://localhost:8085';

interface Credentials {
  username?: string;
  password?: string;
}

const USERS: Record<string, { password: string; role: string }> = {
  admin: { password: 'admin123', role: 'ADMIN' },
  operator: { password: 'operator123', role: 'OPERATOR' },
  user: { password: 'user123', role: 'USER' },
};

export const handlers = [
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as Credentials;
    const account = body.username ? USERS[body.username] : undefined;

    if (!account || account.password !== body.password) {
      return HttpResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    return HttpResponse.json({
      username: body.username,
      role: account.role,
      token: 'test-token',
    });
  }),

  http.get(`${API_URL}/auth/user`, () => HttpResponse.json({ username: 'admin', role: 'ADMIN' })),

  http.post(`${API_URL}/auth/logout`, () => new HttpResponse(null, { status: 204 })),
];
