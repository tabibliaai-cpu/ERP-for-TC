import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrandProvider } from './context/BrandContext';
import { getCurrentPath, onRouteChange } from './utils/router';
import LandingPage from './components/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import StudentsPage from './pages/admin/StudentsPage';
import TeachersPage from './pages/admin/TeachersPage';
import BillingPage from './pages/admin/BillingPage';
import AcademicsPage from './pages/admin/AcademicsPage';
import LibraryPage from './pages/admin/LibraryPage';
import PedagogyPage from './pages/admin/PedagogyPage';
import ReportsPage from './pages/admin/ReportsPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import {
  LogOut, Church, LayoutDashboard, GraduationCap, UserCog, Wallet,
  BookOpen, Brain, Library, Sparkles, Send, BarChart3, Menu, X, Bell
} from 'lucide-react';
import type { ReactNode } from 'react';

const adminNav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'members', label: 'Students', icon: GraduationCap },
  { id: 'teachers', label: 'Teachers', icon: UserCog },
  { id: 'finances', label: 'Finances', icon: Wallet },
  { id: 'academics', label: 'Academics', icon: BookOpen },
  { id: 'pedagogy', label: 'Pedagogy', icon: Brain },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'yeshua', label: 'Yeshua AI', icon: Sparkles },
  { id: 'comms', label: 'Communications', icon: Send },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

function AdminDashboardRouter() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const renderModule = () => {
    switch (activeModule) {
      case 'members': return <StudentsPage />;
      case 'teachers': return <TeachersPage />;
      case 'finances': return <BillingPage />;
      case 'academics': return <AcademicsPage />;
      case 'library': return <LibraryPage />;
      case 'yeshua': return <div className="animate-fade-in p-8 text-center"><p className="text-slate-400">Yeshua AI chatbot — coming soon as in-dashboard widget</p></div>;
      case 'comms': return <div className="animate-fade-in p-8 text-center"><p className="text-slate-400">Communications module — coming soon</p></div>;
      case 'reports': return <ReportsPage />;
      case 'pedagogy': return <PedagogyPage />;
      default: return null;
    }
  };

  const handleNav = (id: string) => {
    setActiveModule(id);
    setSidebarOpen(false);
  };

  const currentPage = adminNav.find(n => n.id === activeModule);

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-100 flex flex-col transition-transform duration-200 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-slate-100 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-amber-600 flex items-center justify-center">
            <Church className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">
            Covenant<span className="text-amber-600">ERP</span>
          </span>
        </div>

        {/* Role badge */}
        <div className="px-4 py-2.5 border-b border-slate-100">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            Admin Panel
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const active = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-slate-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-8 h-8 rounded-lg hover:bg-slate-50 flex items-center justify-center"
            >
              <Menu className="h-4.5 w-4.5 text-slate-500" />
            </button>
            <h1 className="text-sm font-semibold text-slate-900">{currentPage?.label || 'Dashboard'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-lg hover:bg-slate-50 flex items-center justify-center relative">
              <Bell className="h-4 w-4 text-slate-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            {user && (
              <div className="flex items-center gap-2 ml-1">
                <div className="w-7 h-7 rounded-lg bg-amber-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.displayName.charAt(0)}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:block">{user.displayName}</span>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeModule === 'dashboard' ? <Dashboard /> : renderModule()}
        </div>
      </main>
    </div>
  );
}

function SuperAdminRouter() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-600 flex items-center justify-center">
            <Church className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">Covenant<span className="text-amber-600">ERP</span></span>
          <span className="ml-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            Super Admin
          </span>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </header>
      <div className="p-4 lg:p-6">
        <SuperAdminDashboard />
      </div>
    </div>
  );
}

function AppRouter() {
  const [route, setRoute] = useState(getCurrentPath());
  const { user, isAuthenticated } = useAuth();

  const handleRouteChange = useCallback((path: string) => {
    setRoute(path);
  }, []);

  useEffect(() => {
    onRouteChange(handleRouteChange);
  }, [handleRouteChange]);

  if (route === '/login/super-admin') return <LoginPage role="super_admin" />;
  if (route === '/login/admin') return <LoginPage role="admin" />;

  if (!isAuthenticated) return <LandingPage />;

  if (route.startsWith('/super-admin')) {
    return user?.role === 'super_admin' ? <SuperAdminRouter /> : <LandingPage />;
  }

  return <AdminDashboardRouter />;
}

export default function App() {
  return (
    <BrandProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrandProvider>
  );
}
