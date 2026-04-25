import { useAuth } from '../context/AuthContext';
import {
  Building2, Users, Shield, BarChart3, GraduationCap, Wallet, UserCog,
  BookOpen, FileText, Plus, UserPlus, FileBarChart, Clock, CheckCircle2,
  TrendingUp, ArrowUpRight, Activity, Server, UserCircle
} from 'lucide-react';

// --- Stat Card ---
function StatCard({ icon: Icon, label, value, change, changeType = 'positive', color = 'bg-blue-500', delay = 0 }: {
  icon: typeof Users;
  label: string;
  value: string;
  change: string;
  changeType?: 'positive' | 'neutral';
  color: string;
  delay?: number;
}) {
  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-0.5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-5">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex items-center gap-1">
          {changeType === 'positive' && <ArrowUpRight className="h-3 w-3 text-emerald-500" />}
          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
            changeType === 'positive'
              ? 'text-emerald-700 bg-emerald-50'
              : 'text-slate-500 bg-slate-50'
          }`}>
            {change}
          </span>
        </div>
      </div>
      <div>
        <p className="text-[28px] font-bold text-slate-900 tracking-tight leading-none">{value}</p>
        <p className="text-sm text-slate-500 mt-1.5 font-medium">{label}</p>
      </div>
    </div>
  );
}

// --- Dashboard View ---
function DashboardView({ role }: { role: 'super_admin' | 'admin' }) {
  if (role === 'super_admin') {
    return (
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-2xl opacity-60 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Super Admin Dashboard</h1>
            </div>
            <p className="text-slate-500 text-sm ml-11">System-wide overview and multi-tenant management</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon={Building2}
            label="Institutions"
            value="24"
            change="+3 this month"
            changeType="positive"
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            delay={0}
          />
          <StatCard
            icon={Users}
            label="Total Users"
            value="1,847"
            change="+128 this month"
            changeType="positive"
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
            delay={75}
          />
          <StatCard
            icon={UserCircle}
            label="Admin Accounts"
            value="48"
            change="+5 this month"
            changeType="positive"
            color="bg-gradient-to-br from-amber-500 to-amber-600"
            delay={150}
          />
          <StatCard
            icon={Activity}
            label="System Uptime"
            value="99.9%"
            change="Last 30 days"
            changeType="neutral"
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            delay={225}
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
              <p className="text-xs text-slate-400 mt-0.5">Latest events across the platform</p>
            </div>
            <button className="text-xs font-medium text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
              View All
            </button>
          </div>
          <div className="space-y-1">
            {[
              { action: 'New institution registered', org: 'Grace Theological Seminary', time: '2 hours ago', icon: Building2, iconColor: 'bg-blue-50 text-blue-500' },
              { action: 'Admin account created', org: 'St. Peters Bible College', time: '5 hours ago', icon: Users, iconColor: 'bg-emerald-50 text-emerald-500' },
              { action: 'System backup completed', org: 'Automated', time: '8 hours ago', icon: Server, iconColor: 'bg-amber-50 text-amber-500' },
              { action: 'New institution registered', org: 'Living Word Seminary', time: '1 day ago', icon: Building2, iconColor: 'bg-purple-50 text-purple-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconColor}`}>
                  <item.icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 group-hover:text-slate-900">{item.action}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.org}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Clock className="h-3 w-3 text-slate-300" />
                  <span className="text-xs text-slate-400 font-medium">{item.time}</span>
                </div>
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
      {/* Header */}
      <div className="relative">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-2xl opacity-60 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institution Dashboard</h1>
          </div>
          <p className="text-slate-500 text-sm ml-11">Welcome back — here's your institution at a glance</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={GraduationCap}
          label="Students"
          value="342"
          change="+12 this month"
          changeType="positive"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          delay={0}
        />
        <StatCard
          icon={Wallet}
          label="Revenue"
          value="$47,850"
          change="+8.2% vs last"
          changeType="positive"
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          delay={75}
        />
        <StatCard
          icon={UserCog}
          label="Faculty"
          value="28"
          change="+2 new"
          changeType="positive"
          color="bg-gradient-to-br from-amber-500 to-amber-600"
          delay={150}
        />
        <StatCard
          icon={BookOpen}
          label="Programs"
          value="6"
          change="B.Th, M.Div..."
          changeType="neutral"
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          delay={225}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Quick Actions</h3>
            <p className="text-xs text-slate-400 mt-0.5">Common tasks you can perform right now</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: UserPlus, label: 'Enroll Student', bg: 'bg-blue-50', text: 'text-blue-600', hover: 'hover:bg-blue-100 hover:border-blue-200', border: 'border-blue-100' },
            { icon: UserCog, label: 'Add Faculty', bg: 'bg-emerald-50', text: 'text-emerald-600', hover: 'hover:bg-emerald-100 hover:border-emerald-200', border: 'border-emerald-100' },
            { icon: Plus, label: 'Create Course', bg: 'bg-amber-50', text: 'text-amber-600', hover: 'hover:bg-amber-100 hover:border-amber-200', border: 'border-amber-100' },
            { icon: FileBarChart, label: 'Generate Report', bg: 'bg-purple-50', text: 'text-purple-600', hover: 'hover:bg-purple-100 hover:border-purple-200', border: 'border-purple-100' },
          ].map((action, i) => (
            <button
              key={i}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${action.bg} ${action.border} ${action.hover} group`}
            >
              <action.icon className={`h-5 w-5 ${action.text} transition-transform group-hover:scale-110`} />
              <span className={`text-sm font-semibold ${action.text}`}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Students Table */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Recent Students</h3>
            <p className="text-xs text-slate-400 mt-0.5">Latest enrollment activity</p>
          </div>
          <button className="text-xs font-medium text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Program</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Enrolled Date</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { name: 'Samuel Johnson', program: 'M.Div', date: 'Apr 20, 2026', status: 'Active' },
                { name: 'David Williams', program: 'B.Th', date: 'Apr 18, 2026', status: 'Active' },
                { name: 'Maria Garcia', program: 'M.Th', date: 'Apr 15, 2026', status: 'Pending' },
                { name: 'James Chen', program: 'D.Min', date: 'Apr 12, 2026', status: 'Active' },
              ].map((student, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-500">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="font-medium text-slate-800">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-md text-xs">
                      {student.program}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">{student.date}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      student.status === 'Pending'
                        ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200/60'
                        : 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/60'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        student.status === 'Pending' ? 'bg-amber-400' : 'bg-emerald-400'
                      }`} />
                      {student.status}
                    </span>
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
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-5 shadow-lg shadow-amber-500/20">
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
