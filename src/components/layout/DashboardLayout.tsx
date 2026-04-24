import React from 'react';
import { Sidebar } from './Sidebar';
import { Bell, Search, User, Sparkles, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f0f0ff 30%, #f0fdfa 60%, #faf5ff 100%)' }}>
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[72px] bg-white/70 backdrop-blur-xl border-b border-fuchsia-100/50 flex items-center justify-between px-10 transition-all duration-500">
          <div className="flex items-center gap-6 w-[450px]">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-fuchsia-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search across institutional archives..." 
                className="w-full pl-12 pr-4 py-2.5 bg-gradient-to-r from-fuchsia-50/50 to-violet-50/50 border border-fuchsia-100/60 rounded-2xl text-sm focus:bg-white focus:border-fuchsia-200 focus:ring-4 focus:ring-fuchsia-500/10 transition-all outline-none placeholder:text-slate-400 font-medium tracking-tight"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/landing')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              title="View Landing Page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Website</span>
            </button>
            <div className="flex items-center gap-1">
              <button className="relative p-2.5 text-slate-400 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-xl transition-all group">
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-r from-fuchsia-500 to-rose-500 rounded-full"></span>
              </button>
            </div>
            
            <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-black text-slate-900 tracking-tight">{user?.name || 'Academic Dean'}</p>
                <p className="text-[10px] font-black bg-gradient-to-r from-fuchsia-500 to-violet-500 bg-clip-text uppercase tracking-widest mt-0.5" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.role?.replace('_', ' ') || 'Admin'}</p>
              </div>
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-fuchsia-100 to-violet-100 border-2 border-fuchsia-200/50 flex items-center justify-center overflow-hidden shadow-sm group cursor-pointer hover:border-fuchsia-300 hover:shadow-md hover:shadow-fuchsia-100 transition-all duration-500">
                  <User className="w-5 h-5 text-fuchsia-500 group-hover:text-fuchsia-700 transition-colors" />
                  {user?.photoURL && (
                     <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-r from-emerald-400 to-cyan-400 border-2 border-white rounded-full"></div>
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
