import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { LoginRequest } from '@/shared/types';
import { authApi } from '../api/authApi';

export const sessionQueryKey = ['auth', 'session'] as const;

export function useSession() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: authApi.session,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: async (user) => {
      // A session check started before the login may still be in flight; cancel it so its
      // stale (unauthenticated) result cannot overwrite the freshly authenticated user.
      await queryClient.cancelQueries({ queryKey: sessionQueryKey, exact: true });
      queryClient.setQueryData(sessionQueryKey, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      queryClient.setQueryData(sessionQueryKey, null);
    },
  });
}

export function useAuth() {
  const session = useSession();
  const login = useLogin();
  const logout = useLogout();

  return {
    user: session.data ?? null,
    isAuthenticated: Boolean(session.data),
    isLoading: session.isPending,
    sessionError: session.error,
    refetchSession: session.refetch,
    login: login.mutateAsync,
    isLoggingIn: login.isPending,
    loginError: login.error,
    logout: logout.mutate,
  };
}
