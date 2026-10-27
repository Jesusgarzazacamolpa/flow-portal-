import { apiRequest, isUnauthorizedError } from '@/shared/api/apiClient';
import { toUserRole } from '@/shared/types';
import type { LoginRequest, User } from '@/shared/types';

interface AuthSessionResponse {
  username: string;
  role: string;
  token?: string;
}

function toUser(payload: AuthSessionResponse): User {
  return {
    id: payload.username,
    username: payload.username,
    email: `${payload.username}@floworchestrator.com`,
    role: toUserRole(payload.role),
  };
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<User> => {
    const session = await apiRequest<AuthSessionResponse>('/auth/login', {
      method: 'POST',
      body: credentials,
    });
    return toUser(session);
  },

  session: async (): Promise<User | null> => {
    try {
      const session = await apiRequest<AuthSessionResponse>('/auth/user');
      return toUser(session);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        return null;
      }
      throw error;
    }
  },

  logout: (): Promise<void> => apiRequest<void>('/auth/logout', { method: 'POST' }),
};
