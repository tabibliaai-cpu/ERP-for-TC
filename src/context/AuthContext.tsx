import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type UserRole = 'super_admin' | 'admin' | null;

export interface AuthUser {
  username: string;
  role: UserRole;
  displayName: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, role: 'super_admin' | 'admin') => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Default credentials (stored in code for demo - DO NOT use in production)
const CREDENTIALS: Record<string, { password: string; displayName: string; role: UserRole }> = {
  'superadmin': { password: 'SuperAdmin@2024', displayName: 'Super Administrator', role: 'super_admin' },
  'admin': { password: 'Admin@2024', displayName: 'Church Administrator', role: 'admin' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('covenantERP_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const login = useCallback((username: string, password: string, role: 'super_admin' | 'admin') => {
    const cred = CREDENTIALS[username.toLowerCase()];
    if (!cred) return { success: false, error: 'Invalid username or password' };
    if (cred.password !== password) return { success: false, error: 'Invalid username or password' };
    if (cred.role !== role) return { success: false, error: `This account is not a ${role === 'super_admin' ? 'Super Admin' : 'Admin'} account` };

    const authUser: AuthUser = {
      username: username.toLowerCase(),
      role: cred.role,
      displayName: cred.displayName,
    };

    setUser(authUser);
    localStorage.setItem('covenantERP_user', JSON.stringify(authUser));
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('covenantERP_user');
    window.location.hash = '/';
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
