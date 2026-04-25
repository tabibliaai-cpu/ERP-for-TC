import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { login as apiLogin, setAuthData, clearAuthData } from '../utils/api';

export type UserRole = 'super_admin' | 'admin' | null;

export interface AuthUser {
  username: string;
  role: UserRole;
  displayName: string;
  institutionId?: string;
  tenantDbName?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, role: 'super_admin' | 'admin') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Default demo credentials for offline/fallback
const DEMO_CREDENTIALS: Record<string, { password: string; displayName: string; role: UserRole }> = {
  'superadmin': { password: 'SuperAdmin@2024', displayName: 'Super Administrator', role: 'super_admin' },
  'admin': { password: 'Admin@2024', displayName: 'Church Administrator', role: 'admin' },
  'admin@gracetheological.edu': { password: 'Admin@2024', displayName: 'Dr. Samuel Johnson', role: 'admin' },
  'superadmin@covenanterp.com': { password: 'SuperAdmin@2024', displayName: 'Super Administrator', role: 'super_admin' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('covenantERP_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (username: string, password: string, role: 'super_admin' | 'admin') => {
    setIsLoading(true);
    try {
      // Try API login first
      const response = await apiLogin(username, password, role === 'admin' ? 'institution_admin' : 'super_admin');
      
      const authUser: AuthUser = {
        username: response.user.email,
        role: response.user.role === 'institution_admin' ? 'admin' : 'super_admin',
        displayName: response.user.fullName || response.user.displayName,
        institutionId: response.user.institutionId,
        tenantDbName: response.user.tenantDbName,
      };

      setUser(authUser);
      setAuthData(response);
      setIsLoading(false);
      return { success: true };
    } catch (apiError: any) {
      // Fallback to demo credentials (offline mode)
      const cred = DEMO_CREDENTIALS[username.toLowerCase()];
      if (cred && cred.password === password) {
        const authUser: AuthUser = {
          username: username.toLowerCase(),
          role: cred.role,
          displayName: cred.displayName,
        };
        setUser(authUser);
        localStorage.setItem('covenantERP_user', JSON.stringify(authUser));
        setIsLoading(false);
        return { success: true };
      }
      
      setIsLoading(false);
      return { success: false, error: apiError.message || 'Invalid username or password' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearAuthData();
    window.location.hash = '/';
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
