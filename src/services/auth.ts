import { LoginResponse, LoginRequest, User, ModuleConfig } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8085';

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    console.log('Login attempt:', data);
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'HTTP error' }));
      throw new Error(err.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('Backend response:', result);
    
    // Backend returns { username, role, token }
    return {
      username: result.username,
      role: result.role,
      token: result.token,
      user: {
        id: '1',
        username: result.username,
        email: result.username + '@floworchestrator.com',
        role: result.role,
      }
    };
  },

  logout: async () => {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
  },

  isAuthenticated: (): boolean => false,

  checkToken: async (): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE}/auth/user`, {
        credentials: 'include',
      });
      if (!response.ok) return null;
      const data = await response.json();
      const user: User = {
        id: '1',
        username: data.username,
        email: data.username + '@floworchestrator.com',
        role: data.role,
      };
      return user;
    } catch {
      return null;
    }
  },
};

export const MODULES: ModuleConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    url: 'http://localhost:4200',
    roles: ['ADMIN', 'USER'],
  },
  {
    id: 'shield',
    label: 'Shield',
    icon: '🛡️',
    url: 'http://localhost:5173/shield',
    roles: ['ADMIN'],
  },
  {
    id: 'interventions',
    label: 'Intervención Humana',
    icon: '👤',
    url: 'http://localhost:5173/interventions',
    roles: ['ADMIN', 'OPERATOR'],
  },
];

export const getUserModules = (role: string): ModuleConfig[] => {
  return MODULES.filter(m => m.roles.includes(role));
};
