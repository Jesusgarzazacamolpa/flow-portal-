export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export type ModuleRoute = 'dashboard' | 'shield' | 'interventions';

export interface ModuleConfig {
  id: ModuleRoute;
  label: string;
  icon: string;
  url: string;
  roles: string[];
}
