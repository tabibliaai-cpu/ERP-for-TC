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
  BookMarked,
  Settings2,
  Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuthStore } from '../../store/useStore';
import { hasPermission } from '../../lib/permissions';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, feature: 'dashboard', gradient: 'from-fuchsia-500 to-pink-500' },
  { name: 'Students', href: '/admissions', icon: GraduationCap, feature: 'admissions', gradient: 'from-blue-500 to-cyan-500' },
  { name: 'New Enrollment', href: '/enrollment', icon: UserPlus, feature: 'admissions', gradient: 'from-violet-500 to-purple-500' },
  { name: 'Faculty', href: '/faculty', icon: Users, feature: 'faculty', gradient: 'from-emerald-500 to-teal-500' },
  { name: 'Teachers', href: '/teachers', icon: BookMarked, feature: 'faculty', gradient: 'from-amber-500 to-orange-500' },
  { name: 'Academic Setup', href: '/academic-config', icon: Settings2, feature: 'courses', gradient: 'from-rose-500 to-red-500' },
  { name: 'Subject Portal', href: '/courses', icon: BookOpen, feature: 'courses', gradient: 'from-indigo-500 to-blue-500' },
  { name: 'Pedagogical Portal', href: '/classroom', icon: Presentation, feature: 'classroom', gradient: 'from-cyan-500 to-sky-500' },
  { name: 'Finance', href: '/finance', icon: BadgeDollarSign, feature: 'finance', gradient: 'from-yellow-500 to-amber-500' },
  { name: 'Messaging', href: '/messages', icon: MessageSquare, feature: 'messaging', gradient: 'from-pink-500 to-rose-500' },
  { name: 'Library', href: '/library', icon: BookOpen, feature: 'library', gradient: 'from-fuchsia-500 to-violet-500' },
  { name: 'Church Operations', href: '/church', icon: Heart, feature: 'church', gradient: 'from-red-500 to-orange-500' },
  { name: 'Super Admin', href: '/super-admin', icon: ShieldCheck, feature: 'super-admin', gradient: 'from-fuchsia-500 to-violet-600' },
  { name: 'Settings', href: '/settings', icon: Settings, feature: 'settings', gradient: 'from-gray-400 to-gray-600' },
];

export function Sidebar() {
  const { user } = useAuthStore();
  const handleSignOut = () => signOut(auth);

  const filteredNavItems = navItems.filter(item => hasPermission(user?.role || null, item.feature));

  return (
    <div className="flex flex-col h-full w-64 relative overflow-y-auto custom-scrollbar" style={{
      background: 'linear-gradient(180deg, #0f0a1e 0%, #1a0e2e 25%, #12082a 50%, #0d0618 75%, #08040f 100%)'
    }}>
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-fuchsia-600/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-32 right-0 w-40 h-40 bg-violet-500/8 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/5 rounded-full blur-[50px] pointer-events-none" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="p-6 flex items-center gap-3.5 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/20 ring-1 ring-white/10">
          <Sparkles className="text-white w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-lg text-white tracking-tight block bg-gradient-to-r from-white to-fuchsia-200 bg-clip-text" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Covenant</span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text -mt-0.5 block" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Governance</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-0.5 relative z-10">
        <div className="mb-3 px-4 pb-2 border-b border-white/[0.04]">
          <p className="text-[9px] font-black uppercase tracking-[0.15em] bg-gradient-to-r from-fuchsia-400/50 to-transparent bg-clip-text" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Core Modules</p>
        </div>
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group text-[11px] font-bold uppercase tracking-widest relative overflow-hidden",
              isActive 
                ? "text-white shadow-lg" 
                : "text-slate-400/70 hover:text-white/90 hover:bg-white/[0.04]"
            )}
            style={undefined}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className={cn("absolute inset-0 bg-gradient-to-r opacity-15", item.gradient)} />
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-gradient-to-b from-fuchsia-400 to-violet-500" />
                )}
                <item.icon className={cn(
                  "w-4 h-4 transition-all duration-300 relative z-10",
                  isActive 
                    ? "text-white drop-shadow-lg" 
                    : "group-hover:text-fuchsia-400 group-hover:scale-110"
                )} />
                <span className="flex-1 relative z-10">{item.name}</span>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-60 group-hover:translate-x-1 transition-all relative z-10" />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/[0.04] space-y-3 relative z-10">
        <div className="px-3 flex items-center gap-3 py-2.5 bg-white/[0.03] rounded-xl border border-white/[0.04] backdrop-blur-sm">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 flex items-center justify-center text-fuchsia-300 font-bold text-xs uppercase ring-1 ring-fuchsia-500/20">
            {user?.email?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-white/90 truncate">{user?.email || 'Administrator'}</p>
            <p className="text-[8px] font-black uppercase tracking-tighter bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.role || 'User'}</p>
          </div>
        </div>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl hover:bg-rose-500/10 hover:text-rose-400 transition-all text-[11px] font-bold uppercase tracking-widest group text-slate-500"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
