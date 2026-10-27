import { http, HttpResponse } from 'msw';
import { API_URL } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { ApiError, apiRequest, isUnauthorizedError } from './apiClient';

describe('apiRequest', () => {
  it('sends a JSON body and parses the response', async () => {
    let captured: Request | undefined;

    server.use(
      http.post(`${API_URL}/echo`, async ({ request }) => {
        captured = request.clone();
        return HttpResponse.json({ ok: true });
      }),
    );

    const result = await apiRequest<{ ok: boolean }>('/echo', {
      method: 'POST',
      body: { name: 'flow' },
    });

    expect(result).toEqual({ ok: true });
    expect(captured?.headers.get('Content-Type')).toBe('application/json');
    await expect(captured?.json()).resolves.toEqual({ name: 'flow' });
  });

  it('omits the content type when there is no body', async () => {
    let captured: Request | undefined;

    server.use(
      http.get(`${API_URL}/headers`, ({ request }) => {
        captured = request.clone();
        return HttpResponse.json([]);
      }),
    );

    await apiRequest('/headers');

    expect(captured?.headers.get('Content-Type')).toBeNull();
  });

  it('returns undefined for empty and 204 responses', async () => {
    server.use(
      http.get(`${API_URL}/empty`, () => new HttpResponse(null, { status: 200 })),
      http.post(`${API_URL}/no-content`, () => new HttpResponse(null, { status: 204 })),
    );

    await expect(apiRequest('/empty')).resolves.toBeUndefined();
    await expect(apiRequest('/no-content', { method: 'POST' })).resolves.toBeUndefined();
  });

  it('throws an ApiError with the backend error message', async () => {
    server.use(
      http.get(`${API_URL}/forbidden`, () =>
        HttpResponse.json({ error: 'Sin permisos' }, { status: 401 }),
      ),
    );

    const error = await apiRequest('/forbidden').catch((failure: unknown) => failure);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ message: 'Sin permisos', status: 401 });
    expect(isUnauthorizedError(error)).toBe(true);
  });

  it('uses the message field when error is missing', async () => {
    server.use(
      http.get(`${API_URL}/invalid`, () =>
        HttpResponse.json({ message: 'Solicitud inválida' }, { status: 400 }),
      ),
    );

    await expect(apiRequest('/invalid')).rejects.toThrow('Solicitud inválida');
  });

  it('falls back to the HTTP status when the error has no JSON body', async () => {
    server.use(
      http.get(`${API_URL}/boom`, () => new HttpResponse('Server error', { status: 500 })),
    );

    const error = await apiRequest('/boom').catch((failure: unknown) => failure);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ message: 'HTTP 500', status: 500 });
    expect(isUnauthorizedError(error)).toBe(false);
  });

  it('propagates network failures', async () => {
    server.use(http.get(`${API_URL}/offline`, () => HttpResponse.error()));

    await expect(apiRequest('/offline')).rejects.toThrow();
    expect(isUnauthorizedError(new Error('network'))).toBe(false);
  });
});
