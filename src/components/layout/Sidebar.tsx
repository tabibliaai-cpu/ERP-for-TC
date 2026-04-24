import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Heart,
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  BadgeDollarSign, 
  MessageSquare, 
  Settings,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Presentation,
  UserPlus,
  BookMarked
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuthStore } from '../../store/useStore';
import { hasPermission } from '../../lib/permissions';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, feature: 'dashboard' },
  { name: 'Students', href: '/admissions', icon: GraduationCap, feature: 'admissions' },
  { name: 'New Enrollment', href: '/enrollment', icon: UserPlus, feature: 'admissions' },
  { name: 'Faculty', href: '/faculty', icon: Users, feature: 'faculty' },
  { name: 'Teachers', href: '/teachers', icon: BookMarked, feature: 'faculty' },
  { name: 'Academic System', href: '/courses', icon: BookOpen, feature: 'courses' },
  { name: 'Pedagogical Portal', href: '/classroom', icon: Presentation, feature: 'classroom' },
  { name: 'Finance', href: '/finance', icon: BadgeDollarSign, feature: 'finance' },
  { name: 'Messaging', href: '/messages', icon: MessageSquare, feature: 'messaging' },
  { name: 'Library', href: '/library', icon: BookOpen, feature: 'library' },
  { name: 'Church Operations', href: '/church', icon: Heart, feature: 'church' },
  { name: 'Super Admin', href: '/super-admin', icon: ShieldCheck, feature: 'super-admin' },
  { name: 'Settings', href: '/settings', icon: Settings, feature: 'settings' },
];

export function Sidebar() {
  const { user } = useAuthStore();
  const handleSignOut = () => signOut(auth);

  const filteredNavItems = navItems.filter(item => hasPermission(user?.role || null, item.feature));

  return (
    <div className="flex flex-col h-full w-64 bg-slate-950 text-slate-300 border-r border-slate-900 relative overflow-y-auto custom-scrollbar">
      {/* Decorative vertical rail text */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-90 origin-center select-none pointer-events-none opacity-[0.03] whitespace-nowrap">
        <span className="text-8xl font-black tracking-[0.2em] uppercase">Jurisdiction</span>
      </div>

      <div className="p-8 flex items-center gap-4 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/20 ring-1 ring-white/10">
          <ShieldCheck className="text-white w-6 h-6" />
        </div>
        <div>
          <span className="font-bold text-xl text-white tracking-tight block">Covenant</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/80 -mt-1 block">Governance</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-1 relative z-10">
        <div className="mb-4 px-4 pb-2 border-b border-white/[0.03]">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Core Modules</p>
        </div>
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group text-[11px] font-bold uppercase tracking-widest",
              isActive 
                ? "bg-white/5 text-white shadow-xl ring-1 ring-white/5" 
                : "text-slate-400 hover:bg-white/[0.02] hover:text-indigo-400"
            )}
          >
            <item.icon className={cn(
              "w-4 h-4 transition-transform duration-500 group-hover:scale-110",
              "group-hover:text-indigo-400"
            )} />
            <span className="flex-1">{item.name}</span>
            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-white/[0.03] space-y-4 relative z-10">
        <div className="px-4 flex items-center gap-3 py-3 bg-white/[0.02] rounded-2xl border border-white/[0.03]">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs uppercase">
            {user?.email?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-white truncate">{user?.email || 'Administrator'}</p>
            <p className="text-[8px] font-black text-indigo-500 uppercase tracking-tighter">{user?.role || 'User'}</p>
          </div>
        </div>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-rose-500/10 hover:text-rose-400 transition-all text-[11px] font-bold uppercase tracking-widest group"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Terminate Session</span>
        </button>
      </div>
    </div>
  );
}
