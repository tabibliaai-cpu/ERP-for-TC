import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface Branding {
  display_name: string;
  short_name: string;
  logo_url: string;
  sidebar_logo_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
  theme_mode: 'light' | 'dark';
  footer_text: string;
  login_background: string;
}

const DEFAULT_BRANDING: Branding = {
  display_name: 'CovenantERP',
  short_name: 'CovenantERP',
  logo_url: '',
  sidebar_logo_url: '',
  favicon_url: '',
  primary_color: '#f59e0b',     // amber-500
  secondary_color: '#1e293b',  // slate-800
  theme_mode: 'light',
  footer_text: 'Built with faith and purpose.',
  login_background: '',
};

// Sample institution branding (simulates multi-tenant)
const INSTITUTION_BRANDS: Record<string, Branding> = {
  'gts': {
    display_name: 'Grace Theological Seminary',
    short_name: 'GTS',
    logo_url: '',
    sidebar_logo_url: '',
    favicon_url: '',
    primary_color: '#2563eb',     // blue-600
    secondary_color: '#1e3a5f',
    theme_mode: 'light',
    footer_text: 'Grace Theological Seminary - Equipping Servants of Christ',
    login_background: '',
  },
  'lwbc': {
    display_name: 'Living Word Bible College',
    short_name: 'LWBC',
    logo_url: '',
    sidebar_logo_url: '',
    favicon_url: '',
    primary_color: '#059669',     // emerald-600
    secondary_color: '#064e3b',
    theme_mode: 'light',
    footer_text: 'Living Word Bible College - Anchored in the Word',
    login_background: '',
  },
};

interface BrandContextType {
  branding: Branding;
  updateBranding: (branding: Partial<Branding>) => void;
  tenantId: string | null;
  setTenantId: (id: string | null) => void;
  isLoaded: boolean;
}

const BrandContext = createContext<BrandContextType | null>(null);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);
  const [tenantId, setTenantIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem('covenantERP_tenant') || null;
    } catch { return null; }
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (tenantId && INSTITUTION_BRANDS[tenantId]) {
      setBranding(INSTITUTION_BRANDS[tenantId]);
    } else {
      setBranding(DEFAULT_BRANDING);
    }
    setIsLoaded(true);
  }, [tenantId]);

  // Apply CSS variables for branding
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', branding.primary_color);
    root.style.setProperty('--brand-secondary', branding.secondary_color);
  }, [branding]);

  const updateBranding = (partial: Partial<Branding>) => {
    setBranding(prev => ({ ...prev, ...partial }));
  };

  const setTenantId = (id: string | null) => {
    setTenantIdState(id);
    try {
      if (id) localStorage.setItem('covenantERP_tenant', id);
      else localStorage.removeItem('covenantERP_tenant');
    } catch {}
  };

  return (
    <BrandContext.Provider value={{ branding, updateBranding, tenantId, setTenantId, isLoaded }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error('useBrand must be used within BrandProvider');
  return ctx;
}
