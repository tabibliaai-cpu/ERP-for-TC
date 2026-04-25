import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../utils/router';
import {
  Church, Users, Wallet, CalendarDays, BookOpen, MessageSquare, Sparkles,
  Settings, LogOut, LayoutDashboard, BarChart3, Bell, ChevronDown, Menu, X,
  Shield, Building2, FileText, Heart, UserCog, GraduationCap, Brain, Library, Send
} from 'lucide-react';

// --- Stat Card ---
function StatCard({ icon: Icon, label, value, change, color }: {
  icon: typeof Users; label: string; value: string; change: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md hover:shadow-slate-200/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{change}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

// --- Dashboard View ---
function DashboardView({ role }: { role: 'super_admin' | 'admin' }) {
  if (role === 'super_admin') {
    return (
      <div className="animate-fade-in space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Super Admin Dashboard</h2>
          <p className="text-slate-500 mt-0.5">System-wide overview and management</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Building2} label="Institutions" value="24" change="+3 this month" color="bg-blue-500" />
          <StatCard icon={Users} label="Total Users" value="1,847" change="+128 this month" color="bg-emerald-500" />
          <StatCard icon={Shield} label="Admin Accounts" value="48" change="+5 this month" color="bg-amber-500" />
          <StatCard icon={BarChart3} label="System Uptime" value="99.9%" change="Last 30 days" color="bg-purple-500" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-1">
            {[
              { action: 'New institution registered', org: 'Grace Theological Seminary', time: '2 hours ago', icon: Building2 },
              { action: 'Admin account created', org: 'St. Peters Bible College', time: '5 hours ago', icon: Users },
              { action: 'System backup completed', org: 'Automated', time: '8 hours ago', icon: Shield },
              { action: 'New institution registered', org: 'Living Word Seminary', time: '1 day ago', icon: Building2 },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <item.icon className="h-4 w-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{item.action}</p>
                  <p className="text-xs text-slate-400">{item.org}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{item.time}</span>
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
        <h2 className="text-xl font-bold text-slate-900">Institution Dashboard</h2>
        <p className="text-slate-500 mt-0.5">Overview of your institution operations</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={GraduationCap} label="Active Students" value="342" change="+12 this month" color="bg-blue-500" />
        <StatCard icon={Wallet} label="Monthly Revenue" value="$47,850" change="+8.2% vs last" color="bg-emerald-500" />
        <StatCard icon={UserCog} label="Faculty" value="28" change="+2 new" color="bg-amber-500" />
        <StatCard icon={BookOpen} label="Active Programs" value="6" change="B.Th, M.Div..." color="bg-purple-500" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: GraduationCap, label: 'Enroll Student', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
            { icon: UserCog, label: 'Add Faculty', color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
            { icon: BookOpen, label: 'Create Course', color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
            { icon: FileText, label: 'Generate Report', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
          ].map((action, i) => (
            <button key={i} className={`flex items-center gap-3 p-3.5 rounded-xl transition-colors ${action.color}`}>
              <action.icon className="h-4.5 w-4.5" />
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent Students</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-2.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Program</th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Enrolled</th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { name: 'Samuel Johnson', program: 'M.Div', date: 'Apr 20, 2026', status: 'Active' },
                { name: 'David Williams', program: 'B.Th', date: 'Apr 18, 2026', status: 'Active' },
                { name: 'Maria Garcia', program: 'M.Th', date: 'Apr 15, 2026', status: 'Pending' },
                { name: 'James Chen', program: 'D.Min', date: 'Apr 12, 2026', status: 'Active' },
              ].map((m, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{m.name}</td>
                  <td className="px-4 py-3 text-slate-500">{m.program}</td>
                  <td className="px-4 py-3 text-slate-500">{m.date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                      m.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
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
      <div className="w-16 h-16 rounded-2xl bg-amber-600 flex items-center justify-center mb-5 shadow-lg shadow-amber-600/20">
        <Icon className="h-8 w-8 text-white" />
      </div>
      <h2 className="text-lg font-bold text-slate-900 mb-1">{title}</h2>
      <p className="text-sm text-slate-500 text-center max-w-sm">{description}</p>
      <div className="mt-6 px-5 py-2 rounded-lg bg-slate-100 text-slate-500 text-xs font-medium">
        Coming Soon
      </div>
    </div>
  );
}

// --- Main Dashboard (now only used as content panel, not full layout) ---
export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <DashboardView role={user.role as 'super_admin' | 'admin'} />
  );
}
