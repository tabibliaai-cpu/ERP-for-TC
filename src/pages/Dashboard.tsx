import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../utils/router';
import {
  Church, Users, Wallet, CalendarDays, BookOpen, MessageSquare, Sparkles,
  Settings, LogOut, LayoutDashboard, BarChart3, Bell, ChevronDown, Menu, X,
  Shield, Building2, FileText, Heart
} from 'lucide-react';

// --- Sidebar ---
const superAdminNav = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: Building2, label: 'Organizations', id: 'organizations' },
  { icon: Users, label: 'User Management', id: 'users' },
  { icon: Shield, label: 'Roles & Permissions', id: 'roles' },
  { icon: BarChart3, label: 'Analytics', id: 'analytics' },
  { icon: Settings, label: 'System Settings', id: 'settings' },
];

const adminNav = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: Users, label: 'Members', id: 'members' },
  { icon: Wallet, label: 'Finances', id: 'finances' },
  { icon: CalendarDays, label: 'Events', id: 'events' },
  { icon: BookOpen, label: 'Ministries', id: 'ministries' },
  { icon: MessageSquare, label: 'Communications', id: 'comms' },
  { icon: Sparkles, label: 'Yeshua AI', id: 'yeshua' },
  { icon: FileText, label: 'Reports', id: 'reports' },
  { icon: Settings, label: 'Settings', id: 'settings' },
];

// --- Dashboard Stats Cards ---
function StatCard({ icon: Icon, label, value, change, color }: {
  icon: typeof Users; label: string; value: string; change: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:shadow-gray-100 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{change}</span>
      </div>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

// --- Dashboard View ---
function DashboardView({ role }: { role: 'super_admin' | 'admin' }) {
  if (role === 'super_admin') {
    return (
      <div className="animate-fade-in space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Super Admin Dashboard</h2>
          <p className="text-gray-500 mt-1">System-wide overview and management</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Building2} label="Organizations" value="24" change="+3 this month" color="bg-blue-500" />
          <StatCard icon={Users} label="Total Users" value="1,847" change="+128 this month" color="bg-emerald-500" />
          <StatCard icon={Shield} label="Admin Accounts" value="48" change="+5 this month" color="bg-amber-500" />
          <StatCard icon={BarChart3} label="System Uptime" value="99.9%" change="Last 30 days" color="bg-purple-500" />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'New organization registered', org: 'Grace Community Church', time: '2 hours ago', icon: Building2 },
              { action: 'Admin account created', org: 'St. Peters Cathedral', time: '5 hours ago', icon: Users },
              { action: 'System backup completed', org: 'Automated', time: '8 hours ago', icon: Shield },
              { action: 'New organization registered', org: 'Living Word Fellowship', time: '1 day ago', icon: Building2 },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{item.action}</p>
                  <p className="text-xs text-gray-500">{item.org}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900">Church Dashboard</h2>
        <p className="text-gray-500 mt-1">Overview of your church operations</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Active Members" value="342" change="+12 this month" color="bg-blue-500" />
        <StatCard icon={Wallet} label="Monthly Giving" value="$47,850" change="+8.2% vs last" color="bg-emerald-500" />
        <StatCard icon={CalendarDays} label="Upcoming Events" value="8" change="Next 30 days" color="bg-amber-500" />
        <StatCard icon={BookOpen} label="Active Ministries" value="14" change="+2 new" color="bg-purple-500" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Users, label: 'Add Member', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
            { icon: Wallet, label: 'Record Donation', color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
            { icon: CalendarDays, label: 'Create Event', color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
            { icon: MessageSquare, label: 'Send Message', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
          ].map((action, i) => (
            <button key={i} className={`flex items-center gap-3 p-4 rounded-xl transition-colors ${action.color}`}>
              <action.icon className="h-5 w-5" />
              <span className="text-sm font-semibold">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Members */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Members</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Joined</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { name: 'Sarah Johnson', email: 'sarah.j@email.com', date: 'Apr 20, 2026', status: 'Active' },
                { name: 'David Williams', email: 'david.w@email.com', date: 'Apr 18, 2026', status: 'Active' },
                { name: 'Maria Garcia', email: 'maria.g@email.com', date: 'Apr 15, 2026', status: 'New' },
                { name: 'James Chen', email: 'james.c@email.com', date: 'Apr 12, 2026', status: 'Active' },
              ].map((m, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-900">{m.name}</td>
                  <td className="py-3 text-gray-500">{m.email}</td>
                  <td className="py-3 text-gray-500">{m.date}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                      m.status === 'New' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>{m.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Module Placeholder View ---
function ModuleView({ title, description, icon: Icon }: { title: string; description: string; icon: typeof Users }) {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center py-20">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center mb-6 shadow-lg shadow-amber-200">
        <Icon className="h-10 w-10 text-white" />
      </div>
      <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 text-center max-w-md">{description}</p>
      <div className="mt-8 px-6 py-3 rounded-xl bg-gray-100 text-gray-500 text-sm font-medium">
        Coming Soon
      </div>
    </div>
  );
}

// --- Main Dashboard Component ---
export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  if (!user) return null;

  const navItems = user.role === 'super_admin' ? superAdminNav : adminNav;

  const moduleDescriptions: Record<string, string> = {
    organizations: 'Manage all registered church organizations on the platform',
    users: 'Create, edit, and manage user accounts across all organizations',
    roles: 'Configure roles and permissions for the entire system',
    analytics: 'View system-wide analytics and performance metrics',
    members: 'Manage congregation members, profiles, and attendance',
    finances: 'Track tithes, offerings, budgets, and financial reports',
    events: 'Plan and coordinate church services and events',
    ministries: 'Organize and track all church ministries and volunteers',
    comms: 'Send announcements, newsletters, and pastoral messages',
    yeshua: 'Interact with the Yeshua AI biblical wisdom assistant',
    reports: 'Generate and view detailed church reports',
    settings: 'Configure your church profile and preferences',
  };

  const moduleIcons: Record<string, typeof Users> = {
    organizations: Building2,
    users: Users,
    roles: Shield,
    analytics: BarChart3,
    members: Users,
    finances: Wallet,
    events: CalendarDays,
    ministries: BookOpen,
    comms: MessageSquare,
    yeshua: Sparkles,
    reports: FileText,
    settings: Settings,
  };

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-16'
      }`}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-2 px-4 border-b border-gray-100 shrink-0">
          <Church className="h-7 w-7 text-amber-600 shrink-0" />
          {sidebarOpen && (
            <span className="text-lg font-bold tracking-tight text-gray-900">
              Covenant<span className="text-amber-600">ERP</span>
            </span>
          )}
        </div>

        {/* Role Badge */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-gray-100">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
              user.role === 'super_admin'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {user.role === 'super_admin' ? <Shield className="h-3 w-3" /> : <UserCog className="h-3 w-3" />}
              {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${sidebarOpen ? '' : 'mx-auto'}`} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-gray-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className={`h-5 w-5 shrink-0 ${sidebarOpen ? '' : 'mx-auto'}`} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              {sidebarOpen ? <X className="h-5 w-5 text-gray-500" /> : <Menu className="h-5 w-5 text-gray-500" />}
            </button>
            <h1 className="text-lg font-bold text-gray-900 hidden sm:block">
              {navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors relative">
              <Bell className="h-5 w-5 text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                  user.role === 'super_admin' ? 'bg-amber-500' : 'bg-blue-500'
                }`}>
                  {user.displayName.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.displayName}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-fade-in">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user.displayName}</p>
                      <p className="text-xs text-gray-500">{user.username}</p>
                    </div>
                    <button
                      onClick={() => { setProfileOpen(false); logout(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeTab === 'dashboard' ? (
            <DashboardView role={user.role} />
          ) : (
            <ModuleView
              title={navItems.find(n => n.id === activeTab)?.label || activeTab}
              description={moduleDescriptions[activeTab] || 'Module coming soon'}
              icon={moduleIcons[activeTab] || LayoutDashboard}
            />
          )}
        </div>
      </main>
    </div>
  );
}
