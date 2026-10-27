import { QueryClientProvider } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { API_URL } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { adminUser } from '@/test/fixtures/users';
import { createTestQueryClient } from '@/test/utils/render';
import { sessionQueryKey, useLogin, useLogout, useSession } from './useAuth';

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe('useSession', () => {
  it('loads the active session', async () => {
    const client = createTestQueryClient();
    const { result } = renderHook(() => useSession(), { wrapper: createWrapper(client) });

    expect(result.current.isPending).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toMatchObject({ username: 'admin', role: 'ADMIN' });
  });

  it('surfaces unexpected failures', async () => {
    server.use(http.get(`${API_URL}/auth/user`, () => new HttpResponse(null, { status: 500 })));
    const client = createTestQueryClient();
    const { result } = renderHook(() => useSession(), { wrapper: createWrapper(client) });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toMatchObject({ message: 'HTTP 500' });
  });
});

describe('useLogin', () => {
  it('stores the authenticated user in the session cache', async () => {
    const client = createTestQueryClient();
    const { result } = renderHook(
      () => {
        const login = useLogin();
        const session = useSession();
        return { login, session };
      },
      { wrapper: createWrapper(client) },
    );

    await waitFor(() => expect(result.current.session.isSuccess).toBe(true));

    await act(async () => {
      await result.current.login.mutateAsync({ username: 'operator', password: 'operator123' });
    });

    expect(client.getQueryData(sessionQueryKey)).toMatchObject({ role: 'OPERATOR' });
    await waitFor(() =>
      expect(result.current.session.data).toMatchObject({ username: 'operator' }),
    );
  });

  it('exposes invalid credential errors', async () => {
    const client = createTestQueryClient();
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper(client) });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ username: 'admin', password: 'wrong' }),
      ).rejects.toThrow('Credenciales inválidas');
    });

    await waitFor(() =>
      expect(result.current.error).toMatchObject({ message: 'Credenciales inválidas' }),
    );
  });
});

describe('useLogout', () => {
  it('clears the session cache', async () => {
    let logoutCalls = 0;
    server.use(
      http.post(`${API_URL}/auth/logout`, () => {
        logoutCalls += 1;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const client = createTestQueryClient();
    client.setQueryData(sessionQueryKey, adminUser);
    const { result } = renderHook(() => useLogout(), { wrapper: createWrapper(client) });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(logoutCalls).toBe(1);
    expect(client.getQueryData(sessionQueryKey)).toBeNull();
  });

  it('clears the local session even when the request fails', async () => {
    server.use(http.post(`${API_URL}/auth/logout`, () => new HttpResponse(null, { status: 500 })));
    const client = createTestQueryClient();
    client.setQueryData(sessionQueryKey, adminUser);
    const { result } = renderHook(() => useLogout(), { wrapper: createWrapper(client) });

    await act(async () => {
      await expect(result.current.mutateAsync()).rejects.toThrow('HTTP 500');
    });

    expect(client.getQueryData(sessionQueryKey)).toBeNull();
  });
});
