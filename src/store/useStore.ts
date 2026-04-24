import { create } from 'zustand';

interface User {
  uid: string;
  email: string | null;
  phoneNumber?: string | null;
  tenantId: string | null;
  role: string | null;
  name?: string | null;
  photoURL?: string | null;
  isSubscribed?: boolean;
  onboardingComplete?: boolean;
  institutionId?: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  appView: 'public' | 'onboarding' | 'app';
  setAppView: (view: 'public' | 'onboarding' | 'app') => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  appView: 'public',
  setAppView: (appView) => set({ appView }),
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));

interface Tenant {
  id: string;
  name: string;
  institutionType: string;
}

interface AppState {
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant | null) => void;
  isImpersonating: boolean;
  setImpersonating: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentTenant: null,
  setCurrentTenant: (currentTenant) => set({ currentTenant }),
  isImpersonating: false,
  setImpersonating: (isImpersonating) => set({ isImpersonating }),
}));
