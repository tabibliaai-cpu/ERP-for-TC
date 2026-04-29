import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Bell, Search, Menu, User, ExternalLink, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import { useNavigate, useLocation } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/* ─── Breadcrumb mapping ─── */
const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/admissions': 'Students',
  '/enrollment': 'New Enrollment',
  '/faculty': 'Faculty',
  '/teachers': 'Teachers',
  '/teacher-enrollment': 'Teacher Enrollment',
  '/academic-config': 'Academic Setup',
  '/courses': 'Subject Portal',
  '/classroom': 'Classroom',
  '/finance': 'Finance',
  '/messages': 'Messaging',
  '/library': 'Library',
  '/church': 'Church',
  '/super-admin': 'Super Admin',
  '/settings': 'Settings',
  '/landing': 'Marketing',
};

function Breadcrumbs() {
  const location = useLocation();
  const pathname = location.pathname;

  // Handle sub-routes like /admissions/:id
  const basePath = '/' + pathname.split('/').filter(Boolean)[0];
  const label = routeLabels[basePath] || routeLabels[pathname];

  return (
    <nav className="flex items-center gap-1 text-sm">
      <span className="text-slate-400">Home</span>
      {pathname !== '/' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-700 font-medium">{label || 'Page'}</span>
        </>
      )}
    </nav>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* ─── Sidebar ─── */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ─── Header ─── */}
        <header className="h-[56px] bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger - mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors -ml-2"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumbs */}
            <div className="hidden sm:flex">
              <Breadcrumbs />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search - hidden on mobile */}
            <div className="hidden md:flex items-center w-[240px]">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Mobile search icon */}
            <button className="md:hidden p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
              <Search className="w-[18px] h-[18px]" />
            </button>

            <button
              onClick={() => navigate('/landing')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
              title="View Landing Page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Website</span>
            </button>

            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
            </button>

            {/* User avatar */}
            <div className="flex items-center gap-2 pl-2 ml-1 border-l border-slate-200">
              <div className="text-right hidden lg:block">
                <p className="text-[13px] font-medium text-slate-800 leading-tight">{user?.name || 'Administrator'}</p>
                <p className="text-[11px] font-medium text-slate-400 capitalize">{user?.role?.replace('_', ' ') || 'User'}</p>
              </div>
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
          </div>
        </header>

        {/* ─── Page Content ─── */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
