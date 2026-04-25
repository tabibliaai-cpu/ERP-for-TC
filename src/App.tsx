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
import type { ReactNode } from 'react';

function AdminDashboardRouter() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const { user } = useAuth();

  const renderModule = () => {
    switch (activeModule) {
      case 'members': return <StudentsPage />;
      case 'teachers': return <TeachersPage />;
      case 'finances': return <BillingPage />;
      case 'academics': return <AcademicsPage />;
      case 'library': return <LibraryPage />;
      case 'yeshua': return <div className="animate-fade-in p-8 text-center"><p className="text-gray-500">Yeshua AI chatbot — coming soon as in-dashboard widget</p></div>;
      case 'comms': return <div className="animate-fade-in p-8 text-center"><p className="text-gray-500">Communications module — coming soon</p></div>;
      case 'reports': return <ReportsPage />;
      case 'pedagogy': return <PedagogyPage />;
      default: return null;
    }
  };

  // Expose setActiveModule for sidebar navigation
  useEffect(() => {
    (window as any).__setActiveModule = setActiveModule;
    return () => { delete (window as any).__setActiveModule; };
  }, []);

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shrink-0 hidden lg:flex">
        <div className="h-16 flex items-center gap-2 px-4 border-b border-gray-100">
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold text-xs">CE</div>
          <span className="text-lg font-bold tracking-tight text-gray-900">Covenant<span className="text-amber-600">ERP</span></span>
        </div>
        <div className="px-4 py-3 border-b border-gray-100">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Admin Panel
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'members', label: 'Students', icon: '🎓' },
            { id: 'teachers', label: 'Teachers', icon: '👨‍🏫' },
            { id: 'finances', label: 'Finances', icon: '💰' },
            { id: 'academics', label: 'Academics', icon: '📚' },
            { id: 'pedagogy', label: 'Pedagogy', icon: '🧠' },
            { id: 'library', label: 'Library', icon: '📖' },
            { id: 'yeshua', label: 'Yeshua AI', icon: '✨' },
            { id: 'comms', label: 'Communications', icon: '📨' },
            { id: 'reports', label: 'Reports', icon: '📈' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeModule === item.id
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-900">
              {activeModule === 'dashboard' ? 'Dashboard' :
               activeModule === 'members' ? 'Student Management' :
               activeModule === 'teachers' ? 'Teacher Management' :
               activeModule === 'finances' ? 'Billing & Finance' :
               activeModule === 'academics' ? 'Academic Configuration' :
               activeModule === 'pedagogy' ? 'Pedagogical Portal' :
               activeModule === 'library' ? 'Theological Library' :
               activeModule === 'reports' ? 'Reports & Analytics' :
               activeModule.charAt(0).toUpperCase() + activeModule.slice(1)}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                  {user.displayName.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.displayName}</span>
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
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold text-xs mr-2">CE</div>
        <span className="text-lg font-bold tracking-tight text-gray-900 mr-6">Covenant<span className="text-amber-600">ERP</span></span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Super Admin
        </span>
      </header>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <SuperAdminDashboard />
      </div>
    </div>
  );
}

function AppRouter() {
  const [route, setRoute] = useState(getCurrentPath());
  const { user, isAuthenticated, logout } = useAuth();

  const handleRouteChange = useCallback((path: string) => {
    setRoute(path);
  }, []);

  useEffect(() => {
    onRouteChange(handleRouteChange);
  }, [handleRouteChange]);

  // Route matching
  if (route === '/login/super-admin') {
    return <LoginPage role="super_admin" />;
  }
  if (route === '/login/admin') {
    return <LoginPage role="admin" />;
  }

  // Protected routes
  if (!isAuthenticated) {
    return <LandingPage />;
  }

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
