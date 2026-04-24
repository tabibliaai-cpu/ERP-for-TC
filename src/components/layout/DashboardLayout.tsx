import React from 'react';
import { Sidebar } from './Sidebar';
import { Bell, Search, User } from 'lucide-react';
import { useAuthStore } from '../../store/useStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuthStore();
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 transition-all duration-500">
          <div className="flex items-center gap-6 w-[450px]">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Secure search across institutional archives..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-indigo-100 focus:ring-8 focus:ring-indigo-500/5 transition-all outline-none placeholder:text-slate-300 font-medium tracking-tight"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <button className="relative p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all group">
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
              </button>
            </div>
            
            <div className="flex items-center gap-4 pl-8 border-l border-slate-100">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-black text-slate-900 tracking-tight ">{user?.name || 'Academic Dean'}</p>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">{user?.role?.replace('_', ' ') || 'Jurisdiction Admin'}</p>
              </div>
              <div className="relative">
                <div className="w-12 h-12 rounded-[40%] bg-slate-100 border-2 border-indigo-100 flex items-center justify-center overflow-hidden shadow-sm group cursor-pointer hover:border-indigo-300 transition-all duration-500">
                  <User className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  {user?.photoURL && (
                     <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
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
