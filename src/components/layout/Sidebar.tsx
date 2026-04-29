import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserPlus,
  BookMarked,
  Presentation,
  Settings2,
  BookOpen,
  BadgeDollarSign,
  MessageSquare,
  Library,
  Heart,
  ShieldCheck,
  Settings,
  ChevronDown,
  LogOut,
  Building2,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuthStore } from '../../store/useStore';
import { hasPermission } from '../../lib/permissions';

/* ─── Navigation Groups ─── */
interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  feature: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard, feature: 'dashboard' },
      { name: 'Messaging', href: '/messages', icon: MessageSquare, feature: 'messaging' },
    ],
  },
  {
    label: 'People',
    items: [
      { name: 'Students', href: '/admissions', icon: GraduationCap, feature: 'admissions' },
      { name: 'New Enrollment', href: '/enrollment', icon: UserPlus, feature: 'admissions' },
      { name: 'Faculty', href: '/faculty', icon: Users, feature: 'faculty' },
      { name: 'Teachers', href: '/teachers', icon: BookMarked, feature: 'faculty' },
      { name: 'Teacher Enrollment', href: '/teacher-enrollment', icon: Presentation, feature: 'faculty' },
    ],
  },
  {
    label: 'Academics',
    items: [
      { name: 'Academic Setup', href: '/academic-config', icon: Settings2, feature: 'courses' },
      { name: 'Subject Portal', href: '/courses', icon: BookOpen, feature: 'courses' },
      { name: 'Classroom', href: '/classroom', icon: Presentation, feature: 'classroom' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Finance', href: '/finance', icon: BadgeDollarSign, feature: 'finance' },
      { name: 'Library', href: '/library', icon: Library, feature: 'library' },
      { name: 'Church', href: '/church', icon: Heart, feature: 'church' },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Super Admin', href: '/super-admin', icon: ShieldCheck, feature: 'super-admin' },
      { name: 'Settings', href: '/settings', icon: Settings, feature: 'settings' },
    ],
  },
];

/* ─── Collapsible Group ─── */
function NavGroupItem({ group }: { group: NavGroup }) {
  const { user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const filteredItems = group.items.filter(item =>
    hasPermission(user?.role || null, item.feature)
  );

  if (filteredItems.length === 0) return null;

  const hasActive = filteredItems.some(
    item => item.href === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.href)
  );

  return (
    <div className="mb-1">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors",
          hasActive ? "text-blue-400" : "text-slate-500 hover:text-slate-400"
        )}
      >
        {group.label}
        <ChevronDown
          className={cn(
            "w-3 h-3 transition-transform",
            collapsed && "-rotate-90"
          )}
        />
      </button>
      {!collapsed && (
        <div className="space-y-0.5 mt-0.5">
          {filteredItems.map((item) => (
            <SidebarNavLink key={item.href} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Sidebar Nav Link ─── */
function SidebarNavLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.href}
      end={item.href === '/'}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-3 py-[7px] rounded-md text-[13px] font-medium transition-all duration-150",
        isActive
          ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-400 ml-0 pl-[10px]"
          : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"
      )}
    >
      <item.icon className="w-[18px] h-[18px] shrink-0 opacity-80" />
      <span className="truncate">{item.name}</span>
    </NavLink>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuthStore();
  const handleSignOut = () => signOut(auth);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-[240px] bg-slate-900 border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* ─── Logo ─── */}
        <div className="h-[56px] flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <Building2 className="text-white w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-[13px] text-white tracking-tight block leading-tight">CovenantERP</span>
              <span className="text-[10px] font-medium text-slate-500 tracking-wide uppercase">Governance</span>
            </div>
          </div>
          {/* Close button - mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ─── Navigation ─── */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navGroups.map((group) => (
            <NavGroupItem key={group.label} group={group} />
          ))}
        </nav>

        {/* ─── User section ─── */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-xs shrink-0">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-300 truncate">{user?.name || user?.email || 'Administrator'}</p>
              <p className="text-[10px] text-slate-500 capitalize">{user?.role?.replace('_', ' ') || 'User'}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 px-3 py-[7px] w-full rounded-md text-[13px] font-medium text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors mt-1"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
