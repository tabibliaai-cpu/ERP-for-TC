import React from 'react';
import { Sidebar } from './Sidebar';
import { Bell, Search, User, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  return (
    <div className="flex h-screen overflow-hidden font-sans bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4 w-[380px]">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/landing')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 rounded-md hover:bg-slate-100 transition-colors border border-slate-200"
              title="View Landing Page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Website</span>
            </button>
            <button className="relative p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
            </button>
            
            <div className="flex items-center gap-2.5 pl-4 border-l border-slate-200">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-medium text-slate-900 leading-tight">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] font-medium text-slate-500 capitalize">{user?.role?.replace('_', ' ') || 'User'}</p>
              </div>
              <div className="relative">
                <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                  <User className="w-4 h-4 text-slate-500" />
                  {user?.photoURL && (
                     <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
