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
import ProfilePage from './pages/admin/ProfilePage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import {
  LogOut, Church, LayoutDashboard, GraduationCap, UserCog, Wallet,
  BookOpen, Brain, Library, Sparkles, Send, BarChart3, Menu, X, Bell, UserCircle
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
  { id: 'profile', label: 'My Profile', icon: UserCircle },
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
      case 'yeshua': return <div className="animate-fade-in p-8 text-center"><p className="text-[#9CA3AF]">Yeshua AI chatbot — coming soon as in-dashboard widget</p></div>;
      case 'comms': return <div className="animate-fade-in p-8 text-center"><p className="text-[#9CA3AF]">Communications module — coming soon</p></div>;
      case 'reports': return <ReportsPage />;
      case 'pedagogy': return <PedagogyPage />;
      case 'profile': return <ProfilePage />;
      default: return null;
    }
  };

  const handleNav = (id: string) => {
    setActiveModule(id);
    setSidebarOpen(false);
  };

  const currentPage = adminNav.find(n => n.id === activeModule);

  const userInitial = user?.displayName?.charAt(0)?.toUpperCase() || 'A';

  return (
    <div className="h-screen flex bg-[#FAFAF7] overflow-hidden">

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-[17rem] bg-[#1A1F36] flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4">
          <div className="w-9 h-9 rounded-xl bg-[#B8860B] flex items-center justify-center shadow-lg shadow-[#B8860B]/20">
            <Church className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-bold tracking-tight text-white leading-tight font-heading">
              Covenant<span className="text-[#D4A03C]">ERP</span>
            </span>
            <span className="text-[11px] font-medium text-[#9CA3AF] tracking-wide uppercase mt-0.5">
              Admin Panel
            </span>
          </div>
        </div>

        {/* Thin separator */}
        <div className="mx-5 h-px bg-white/10" />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const active = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-[#9CA3AF] hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 pb-3">
          {/* Thin separator */}
          <div className="mx-2 mb-3 h-px bg-white/10" />

          {/* User info row */}
          {user && (
            <div className="flex items-center gap-3 px-3 py-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-[#B8860B] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {userInitial}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-white/80 truncate">
                  {user.displayName}
                </span>
                <span className="text-[11px] text-[#9CA3AF] truncate">
                  {user.username}
                </span>
              </div>
            </div>
          )}

          {/* Logout button */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[#9CA3AF] hover:bg-white/5 hover:text-red-400 transition-all duration-150"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top header bar */}
        <header className="h-14 bg-white border-b border-[#E8E5E0] flex items-center justify-between px-4 lg:px-6 shrink-0">
          {/* Left: hamburger + page title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-lg hover:bg-[#F5F2EE] flex items-center justify-center transition-colors"
            >
              <Menu className="h-[18px] w-[18px] text-[#6B6B6B]" />
            </button>
            <h1 className="text-base font-semibold text-[#1F1F1F] font-heading">
              {currentPage?.label || 'Dashboard'}
            </h1>
          </div>

          {/* Right: notification + avatar */}
          <div className="flex items-center gap-1.5">
            {/* Notification bell */}
            <button className="w-9 h-9 rounded-lg hover:bg-[#F5F2EE] flex items-center justify-center relative transition-colors">
              <Bell className="h-[18px] w-[18px] text-[#6B6B6B]" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-[#E8E5E0] mx-1.5 hidden sm:block" />

            {/* User avatar + name */}
            {user && (
              <div className="flex items-center gap-2.5 px-2 py-1 rounded-lg hover:bg-[#F5F2EE] transition-colors cursor-default">
                <div className="w-8 h-8 rounded-full bg-[#6B2D3E] flex items-center justify-center text-white text-xs font-bold">
                  {userInitial}
                </div>
                <span className="text-sm font-medium text-[#1F1F1F] hidden sm:block">
                  {user.displayName}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#FAFAF7]">
          {activeModule === 'dashboard' ? <Dashboard /> : renderModule()}
        </div>
      </main>
    </div>
  );
}

function SuperAdminRouter() {
  const { user, logout } = useAuth();

  const userInitial = user?.displayName?.charAt(0)?.toUpperCase() || 'S';

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col">
      {/* Top header bar */}
      <header className="h-14 bg-white border-b border-[#E8E5E0] flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-30">
        {/* Left: branding + badge */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#6B2D3E] flex items-center justify-center">
            <Church className="h-4 w-4 text-white" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-base font-bold tracking-tight text-[#1F1F1F] font-heading">
              Covenant<span className="text-[#B8860B]">ERP</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#6B2D3E]/8 text-[#6B2D3E] ring-1 ring-[#6B2D3E]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6B2D3E]" />
              Super Admin
            </span>
          </div>
        </div>

        {/* Right: avatar + logout */}
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-medium text-[#6B6B6B] hidden md:block">
            Platform Administration
          </h1>

          <div className="w-px h-6 bg-[#E8E5E0] mx-1 hidden md:block" />

          {user && (
            <div className="flex items-center gap-2.5 px-2 py-1 rounded-lg hover:bg-[#F5F2EE] transition-colors cursor-default">
              <div className="w-8 h-8 rounded-full bg-[#B8860B] flex items-center justify-center text-white text-xs font-bold">
                {userInitial}
              </div>
              <span className="text-sm font-medium text-[#1F1F1F] hidden sm:block">
                {user.displayName}
              </span>
            </div>
          )}

          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#6B6B6B] hover:text-red-600 hover:bg-red-50 transition-all duration-150 ml-1"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 lg:p-6">
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
