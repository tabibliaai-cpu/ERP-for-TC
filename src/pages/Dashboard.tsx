import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats, getRecentStudents, getToken } from '../utils/api';
import {
  Building2, Users, Shield, BarChart3, GraduationCap, Wallet, UserCog,
  BookOpen, FileText, Plus, UserPlus, FileBarChart, Clock, CheckCircle2,
  TrendingUp, ArrowUpRight, Activity, Server, UserCircle
} from 'lucide-react';

/* ================================================================
   StatCard — Reusable metric card with warm scholarly styling
   ================================================================ */
function StatCard({
  icon: Icon,
  label,
  value,
  change,
  changeType = 'positive',
  color = 'bg-[#6B2D3E]',
  delay = 0,
}: {
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
      className="bg-white rounded-2xl border border-[#E8E5E0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(107,45,62,0.08),0_12px_28px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-0.5 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-5">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex items-center gap-1">
          {changeType === 'positive' && <ArrowUpRight className="h-3 w-3 text-[#2D6A4F]" />}
          <span
            className={`text-xs font-medium px-2 py-1 rounded-lg ${
              changeType === 'positive'
                ? 'text-[#2D6A4F] bg-[#2D6A4F]/8'
                : 'text-[#6B6B6B] bg-[#F5F2EE]'
            }`}
          >
            {change}
          </span>
        </div>
      </div>
      <div>
        <p className="text-[28px] font-bold text-[#1F1F1F] tracking-tight leading-none font-heading">{value}</p>
        <p className="text-sm text-[#6B6B6B] mt-1.5 font-medium">{label}</p>
      </div>
    </div>
  );
}

/* ================================================================
   DashboardView — Role-based dashboard content
   ================================================================ */
function DashboardView({ role }: { role: 'super_admin' | 'admin' }) {
  /* ── API state for admin dashboard ── */
  const [stats, setStats] = useState<{ totalStudents?: number; totalTeachers?: number; totalPrograms?: number; totalRevenue?: number } | null>(null);
  const [recentStudents, setRecentStudents] = useState<{ full_name?: string; program?: string; enrollment_date?: string; admission_status?: string; name?: string; status?: string; date?: string }[]>([]);
  const [apiLoaded, setApiLoaded] = useState(false);

  useEffect(() => {
    if (role !== 'admin') return;
    const token = getToken();
    if (!token) { setApiLoaded(true); return; }
    Promise.all([
      getDashboardStats().catch(() => null),
      getRecentStudents().catch(() => null),
    ]).then(([statsData, recentData]) => {
      if (statsData) setStats(statsData);
      if (recentData) setRecentStudents(Array.isArray(recentData) ? recentData : []);
      setApiLoaded(true);
    });
  }, [role]);

  const fmt = (n: number | undefined) => n != null ? `$${n.toLocaleString('en-US')}` : undefined;
  const sStudents = stats?.totalStudents ?? 342;
  const sRevenue = stats?.totalRevenue;
  const sTeachers = stats?.totalTeachers ?? 28;
  const sPrograms = stats?.totalPrograms ?? 6;

  const displayRecent = recentStudents.length > 0 ? recentStudents : [
    { name: 'Samuel Johnson', program: 'M.Div', date: 'Apr 20, 2026', status: 'Active' },
    { name: 'David Williams', program: 'B.Th', date: 'Apr 18, 2026', status: 'Active' },
    { name: 'Maria Garcia', program: 'M.Th', date: 'Apr 15, 2026', status: 'Pending' },
    { name: 'James Chen', program: 'D.Min', date: 'Apr 12, 2026', status: 'Active' },
    { name: 'Ruth Adeyemi', program: 'M.Div', date: 'Apr 10, 2026', status: 'Active' },
  ];

  /* ── Super Admin ────────────────────────────────────────── */
  if (role === 'super_admin') {
    return (
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-[#6B2D3E]/5 to-[#B8860B]/8 rounded-full blur-2xl opacity-70 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-[#6B2D3E] flex items-center justify-center shadow-sm shadow-[#6B2D3E]/20">
                <Shield className="h-4.5 w-4.5 text-white" />
              </div>
              <h1 className="text-2xl font-heading font-bold text-[#1F1F1F] tracking-tight">
                Super Admin Dashboard
              </h1>
            </div>
            <p className="text-[#6B6B6B] text-sm ml-12">
              System-wide overview and multi-tenant management
            </p>
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
            color="bg-[#3B6B8A]"
            delay={0}
          />
          <StatCard
            icon={Users}
            label="Total Users"
            value="1,847"
            change="+128 this month"
            changeType="positive"
            color="bg-[#2D6A4F]"
            delay={75}
          />
          <StatCard
            icon={UserCircle}
            label="Admin Accounts"
            value="48"
            change="+5 this month"
            changeType="positive"
            color="bg-[#B8860B]"
            delay={150}
          />
          <StatCard
            icon={Activity}
            label="System Uptime"
            value="99.9%"
            change="Last 30 days"
            changeType="neutral"
            color="bg-[#6B2D3E]"
            delay={225}
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-[#E8E5E0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-heading font-semibold text-[#1F1F1F]">Recent Activity</h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Latest events across the platform</p>
            </div>
            <button className="text-xs font-medium text-[#6B6B6B] hover:text-[#6B2D3E] bg-[#F5F2EE] hover:bg-[#6B2D3E]/8 px-3 py-1.5 rounded-lg transition-colors">
              View All
            </button>
          </div>
          <div className="space-y-1">
            {[
              {
                action: 'New institution registered',
                org: 'Grace Theological Seminary',
                time: '2 hours ago',
                icon: Building2,
                iconColor: 'bg-[#3B6B8A]/10 text-[#3B6B8A]',
              },
              {
                action: 'Admin account created',
                org: 'St. Peters Bible College',
                time: '5 hours ago',
                icon: Users,
                iconColor: 'bg-[#2D6A4F]/10 text-[#2D6A4F]',
              },
              {
                action: 'System backup completed',
                org: 'Automated',
                time: '8 hours ago',
                icon: Server,
                iconColor: 'bg-[#B8860B]/10 text-[#B8860B]',
              },
              {
                action: 'New institution registered',
                org: 'Living Word Seminary',
                time: '1 day ago',
                icon: Building2,
                iconColor: 'bg-[#6B2D3E]/10 text-[#6B2D3E]',
              },
              {
                action: 'Security audit passed',
                org: 'Compliance',
                time: '2 days ago',
                icon: CheckCircle2,
                iconColor: 'bg-[#2D6A4F]/10 text-[#2D6A4F]',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-[#FAFAF7] transition-colors group"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconColor}`}
                >
                  <item.icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1F1F1F] group-hover:text-[#6B2D3E] transition-colors">
                    {item.action}
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{item.org}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Clock className="h-3 w-3 text-[#C4BFB8]" />
                  <span className="text-xs text-[#9CA3AF] font-medium">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Admin (Institution) ─────────────────────────────────── */
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-[#B8860B]/8 to-[#6B2D3E]/5 rounded-full blur-2xl opacity-70 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-[#6B2D3E] flex items-center justify-center shadow-sm shadow-[#6B2D3E]/20">
              <GraduationCap className="h-4.5 w-4.5 text-white" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-[#1F1F1F] tracking-tight">
              Institution Dashboard
            </h1>
          </div>
          <p className="text-[#6B6B6B] text-sm ml-12">
            Welcome back — here's your institution at a glance
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={GraduationCap}
          label="Students"
          value={String(sStudents)}
          change="+12 this month"
          changeType="positive"
          color="bg-[#6B2D3E]"
          delay={0}
        />
        <StatCard
          icon={Wallet}
          label="Revenue"
          value={sRevenue != null ? fmt(sRevenue)! : '$47,850'}
          change="+8.2% vs last"
          changeType="positive"
          color="bg-[#2D6A4F]"
          delay={75}
        />
        <StatCard
          icon={UserCog}
          label="Faculty"
          value={String(sTeachers)}
          change="+2 new"
          changeType="positive"
          color="bg-[#B8860B]"
          delay={150}
        />
        <StatCard
          icon={BookOpen}
          label="Programs"
          value={String(sPrograms)}
          change="B.Th, M.Div..."
          changeType="neutral"
          color="bg-[#3B6B8A]"
          delay={225}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-[#E8E5E0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-heading font-semibold text-[#1F1F1F]">Quick Actions</h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Common tasks you can perform right now</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              icon: UserPlus,
              label: 'Enroll Student',
              bg: 'bg-[#6B2D3E]/8',
              text: 'text-[#6B2D3E]',
              hover: 'hover:bg-[#6B2D3E]/14 hover:border-[#6B2D3E]/20',
              border: 'border-[#6B2D3E]/10',
            },
            {
              icon: UserCog,
              label: 'Add Faculty',
              bg: 'bg-[#2D6A4F]/8',
              text: 'text-[#2D6A4F]',
              hover: 'hover:bg-[#2D6A4F]/14 hover:border-[#2D6A4F]/20',
              border: 'border-[#2D6A4F]/10',
            },
            {
              icon: Plus,
              label: 'Create Course',
              bg: 'bg-[#B8860B]/8',
              text: 'text-[#B8860B]',
              hover: 'hover:bg-[#B8860B]/14 hover:border-[#B8860B]/20',
              border: 'border-[#B8860B]/10',
            },
            {
              icon: FileBarChart,
              label: 'Generate Report',
              bg: 'bg-[#3B6B8A]/8',
              text: 'text-[#3B6B8A]',
              hover: 'hover:bg-[#3B6B8A]/14 hover:border-[#3B6B8A]/20',
              border: 'border-[#3B6B8A]/10',
            },
          ].map((action, i) => (
            <button
              key={i}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${action.bg} ${action.border} ${action.hover} group`}
            >
              <action.icon
                className={`h-5 w-5 ${action.text} transition-transform group-hover:scale-110`}
              />
              <span className={`text-sm font-semibold ${action.text}`}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Students Table */}
      <div className="bg-white rounded-2xl border border-[#E8E5E0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-heading font-semibold text-[#1F1F1F]">Recent Students</h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Latest enrollment activity</p>
          </div>
          <button className="text-xs font-medium text-[#6B6B6B] hover:text-[#6B2D3E] bg-[#F5F2EE] hover:bg-[#6B2D3E]/8 px-3 py-1.5 rounded-lg transition-colors">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Name</th>
                <th>Program</th>
                <th>Enrolled Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayRecent.map((student, i) => {
                const sName = (student as any).full_name || (student as any).name || '';
                const sProgram = (student as any).program || '';
                const sDate = (student as any).enrollment_date
                  ? new Date((student as any).enrollment_date!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : (student as any).date || '';
                const sStatus = (student as any).admission_status || (student as any).status || '';
                return (
                <tr key={i}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F5F2EE] to-[#E8E5E0] flex items-center justify-center">
                        <span className="text-xs font-bold text-[#6B2D3E]">
                          {sName.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <span className="font-medium text-[#1F1F1F]">{sName}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-[#6B2D3E] font-medium bg-[#6B2D3E]/8 px-2.5 py-1 rounded-md text-xs">
                      {sProgram}
                    </span>
                  </td>
                  <td>
                    <span className="text-[#6B6B6B]">{sDate}</span>
                  </td>
                  <td>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        sStatus === 'Pending'
                          ? 'bg-[#B8860B]/10 text-[#8B6914] ring-1 ring-inset ring-[#B8860B]/20'
                          : 'bg-[#2D6A4F]/10 text-[#2D6A4F] ring-1 ring-inset ring-[#2D6A4F]/20'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          sStatus === 'Pending' ? 'bg-[#B8860B]' : 'bg-[#2D6A4F]'
                        }`}
                      />
                      {sStatus}
                    </span>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Main Dashboard export — reads role from auth context
   ================================================================ */
export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  return <DashboardView role={user.role as 'super_admin' | 'admin'} />;
}
