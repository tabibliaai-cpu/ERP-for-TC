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
  LogOut,
  Presentation,
  UserPlus,
  BookMarked,
  Settings2,
  Building2
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
  { name: 'Teacher Enrollment', href: '/teacher-enrollment', icon: Presentation, feature: 'faculty' },
  { name: 'Academic Setup', href: '/academic-config', icon: Settings2, feature: 'courses' },
  { name: 'Subject Portal', href: '/courses', icon: BookOpen, feature: 'courses' },
  { name: 'Classroom', href: '/classroom', icon: Presentation, feature: 'classroom' },
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
    <div className="flex flex-col h-full w-60 bg-slate-900 border-r border-slate-800">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <Building2 className="text-white w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold text-sm text-white tracking-tight block leading-tight">CovenantERP</span>
          <span className="text-[10px] font-medium text-slate-500 tracking-wide uppercase">Governance Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        <p className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Main Menu</p>
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) => cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors",
              isActive 
                ? "bg-blue-600 text-white" 
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-medium text-xs">
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-300 truncate">{user?.email || 'Administrator'}</p>
            <p className="text-[10px] text-slate-500 capitalize">{user?.role?.replace('_', ' ') || 'User'}</p>
          </div>
        </div>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-3 py-2 w-full rounded-md text-[13px] font-medium text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors mt-1"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
