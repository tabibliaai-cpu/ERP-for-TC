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

// ─── Impersonation Context ───
export interface ImpersonationContext {
  institutionId: string;
  institutionName: string;
  adminEmail: string;
  tokenId: string;
  startedAt: number;
  reason?: string;
}

interface AppState {
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant | null) => void;
  
  // ─── Impersonation State ───
  isImpersonating: boolean;
  setImpersonating: (value: boolean) => void;
  impersonationContext: ImpersonationContext | null;
  startImpersonation: (context: ImpersonationContext) => void;
  stopImpersonation: () => void;
  
  // ─── Real-time Sync Indicator ───
  isRealtimeSynced: boolean;
  setRealtimeSynced: (value: boolean) => void;
  lastSyncTime: number | null;
  setLastSyncTime: (time: number | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentTenant: null,
  setCurrentTenant: (currentTenant) => set({ currentTenant }),
  
  // Impersonation
  isImpersonating: false,
  setImpersonating: (isImpersonating) => set({ isImpersonating }),
  impersonationContext: null,
  startImpersonation: (context) => set({
    isImpersonating: true,
    impersonationContext: context,
  }),
  stopImpersonation: () => set({
    isImpersonating: false,
    impersonationContext: null,
  }),
  
  // Real-time sync
  isRealtimeSynced: false,
  setRealtimeSynced: (isRealtimeSynced) => set({ isRealtimeSynced }),
  lastSyncTime: null,
  setLastSyncTime: (lastSyncTime) => set({ lastSyncTime }),
}));
