import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '../services/auth';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user && !isLoading;

  useEffect(() => {
    authService.checkToken().then((checkedUser) => {
      console.log('AuthProvider checkToken result:', checkedUser);
      setUser(checkedUser);
      setIsLoading(false);
    }).catch(err => {
      console.error('AuthProvider checkToken error:', err);
      setIsLoading(false);
    });
  }, []);

  const login = async (username: string, password: string) => {
    const data = await authService.login({ username, password });
    setUser(data.user);
    setIsLoading(false);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token: null, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
