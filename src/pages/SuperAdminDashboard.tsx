import { useState } from 'react';
import {
  Building2, Users, Shield, BarChart3, Settings, Plus, Search, Edit, Trash2,
  CheckCircle, XCircle, ChevronRight, Globe, CreditCard, Bell, Eye, ToggleLeft, ToggleRight,
  AlertTriangle, TrendingUp, Monitor, Database, Lock, Activity, Zap, Clock
} from 'lucide-react';

interface Institution {
  id: number; name: string; code: string; type: string; location: string; admin: string;
  students: number; plan: string; status: 'Active' | 'Inactive' | 'Suspended'; revenue: string;
}

const sampleInstitutions: Institution[] = [
  { id: 1, name: 'Grace Theological Seminary', code: 'GTS-001', type: 'Seminary', location: 'Chennai, India', admin: 'Dr. Samuel Johnson', students: 342, plan: 'Premium', status: 'Active', revenue: '₹18.5L' },
  { id: 2, name: 'Living Word Bible College', code: 'LWBC-002', type: 'Bible College', location: 'Bangalore, India', admin: 'Rev. David Williams', students: 185, plan: 'Basic', status: 'Active', revenue: '₹9.2L' },
  { id: 3, name: 'Hope International Seminary', code: 'HIS-003', type: 'Seminary', location: 'Mumbai, India', admin: 'Prof. Maria Garcia', students: 420, plan: 'Premium', status: 'Active', revenue: '₹24.8L' },
  { id: 4, name: 'Covenant Bible Institute', code: 'CBI-004', type: 'Bible College', location: 'Delhi, India', admin: 'Dr. Sarah Chen', students: 98, plan: 'Free', status: 'Active', revenue: '₹2.1L' },
  { id: 5, name: 'Emmanuel School of Theology', code: 'EST-005', type: 'Training Center', location: 'Kerala, India', admin: 'Rev. James Anderson', students: 156, plan: 'Basic', status: 'Inactive', revenue: '₹7.8L' },
  { id: 6, name: 'Redeemed Seminary', code: 'RSM-006', type: 'Seminary', location: 'Hyderabad, India', admin: 'Dr. Abraham Thomas', students: 210, plan: 'Premium', status: 'Suspended', revenue: '₹12.4L' },
];

const sampleUsers = [
  { id: 1, name: 'Dr. Samuel Johnson', email: 'samuel@gts.edu', role: 'Institution Admin', institution: 'Grace Theological Seminary', status: 'Active', lastLogin: '2026-04-26' },
  { id: 2, name: 'Rev. David Williams', email: 'david@lwbc.edu', role: 'Institution Admin', institution: 'Living Word Bible College', status: 'Active', lastLogin: '2026-04-25' },
  { id: 3, name: 'John Abraham', email: 'john@student.gts.edu', role: 'Student', institution: 'Grace Theological Seminary', status: 'Active', lastLogin: '2026-04-26' },
  { id: 4, name: 'Prof. Maria Garcia', email: 'maria@his.edu', role: 'Institution Admin', institution: 'Hope International', status: 'Active', lastLogin: '2026-04-24' },
  { id: 5, name: 'Sarah Thompson', email: 'sarah@student.lwbc.edu', role: 'Student', institution: 'Living Word Bible College', status: 'Suspended', lastLogin: '2026-04-10' },
  { id: 6, name: 'Dr. Abraham Thomas', email: 'abraham@rsm.edu', role: 'Institution Admin', institution: 'Redeemed Seminary', status: 'Active', lastLogin: '2026-04-22' },
];

const featureFlags = [
  { feature: 'Academic Module', description: 'Program & course management', institutions: 6, enabled: 6 },
  { feature: 'Pedagogical Portal', description: 'Teaching methods & resources', institutions: 6, enabled: 4 },
  { feature: 'Library System', description: 'Manuscript & resource management', institutions: 6, enabled: 5 },
  { feature: 'Billing System', description: 'Fee structures & payments', institutions: 6, enabled: 6 },
  { feature: 'Yeshua AI', description: 'AI biblical assistant', institutions: 6, enabled: 3 },
  { feature: 'Multi-tenant Branding', description: 'Custom institution branding', institutions: 6, enabled: 2 },
  { feature: 'Advanced Analytics', description: 'AI-powered insights', institutions: 6, enabled: 1 },
  { feature: 'Ministry Tracking', description: 'Ministry involvement & outreach', institutions: 6, enabled: 4 },
];

const auditLogs = [
  { time: '2026-04-26 14:32', user: 'Super Admin', action: 'Created institution', target: 'Redeemed Seminary', type: 'create' },
  { time: '2026-04-26 13:15', user: 'Dr. Samuel Johnson', action: 'Updated fee structure', target: 'B.Th Program', type: 'update' },
  { time: '2026-04-26 11:45', user: 'System', action: 'Auto backup completed', target: 'All institutions', type: 'system' },
  { time: '2026-04-26 10:20', user: 'Super Admin', action: 'Suspended user', target: 'sarah@student.lwbc.edu', type: 'security' },
  { time: '2026-04-25 16:00', user: 'Rev. David Williams', action: 'Added 15 students', target: 'LWBC Batch 2026', type: 'create' },
  { time: '2026-04-25 09:30', user: 'System', action: 'Payment reminder sent', target: '42 students', type: 'system' },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
    Suspended: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
    Inactive: 'bg-[#F5F2EE] text-[#6B6B6B] ring-1 ring-[#E8E5E0]',
  };
  return map[status] || map.Inactive;
};

const planBadge = (plan: string) => {
  const map: Record<string, string> = {
    Premium: 'bg-[#B8860B]/10 text-[#B8860B] ring-1 ring-[#B8860B]/20',
    Basic: 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/20',
    Free: 'bg-[#F5F2EE] text-[#6B6B6B] ring-1 ring-[#E8E5E0]',
  };
  return map[plan] || map.Free;
};

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('institutions');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'institutions', label: 'Institutions', icon: Building2 },
    { id: 'users', label: 'Global Users', icon: Users },
    { id: 'features', label: 'Feature Toggles', icon: ToggleLeft },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'security', label: 'Security & Audit', icon: Lock },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const filteredInstitutions = sampleInstitutions.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.admin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = sampleUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.institution.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header Section ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold tracking-tight text-[#1F1F1F] font-heading">Platform Administration</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#B8860B]/10 text-[#B8860B] ring-1 ring-[#B8860B]/20">
              <Shield className="h-3 w-3" /> Super Admin
            </span>
          </div>
          <p className="text-sm text-[#6B6B6B]">Manage institutions, users, billing, and platform configuration for CovenantERP.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6B2D3E] to-[#8B3D52] text-white text-sm font-semibold shadow-lg shadow-[#6B2D3E]/20 hover:from-[#5A2535] hover:to-[#7A3448] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Institution
        </button>
      </div>

      {/* ── Platform Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Building2, label: 'Institutions', value: sampleInstitutions.length.toString(), change: '+2 this month', iconBg: 'bg-[#6B2D3E]/10', iconColor: 'text-[#6B2D3E]' },
          { icon: Users, label: 'Total Users', value: '1,847', change: '+128 this month', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-600' },
          { icon: CreditCard, label: 'Revenue', value: '₹74.8L', change: '+15% vs last', iconBg: 'bg-[#B8860B]/10', iconColor: 'text-[#B8860B]' },
          { icon: Activity, label: 'Uptime', value: '99.9%', change: 'Last 30 days', iconBg: 'bg-[#6B2D3E]/10', iconColor: 'text-[#8B3D52]' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E8E5E0] p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center`}>
                <s.icon className={`h-5 w-5 ${s.iconColor}`} />
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                <TrendingUp className="h-3 w-3" /> {s.change}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-[#1F1F1F]">{s.value}</p>
              <p className="text-xs text-[#6B6B6B] mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex gap-1 p-1 bg-[#F5F2EE] rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white text-[#6B2D3E] shadow-sm'
                : 'text-[#6B6B6B] hover:text-[#1F1F1F] hover:bg-white/50'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════
          TAB 1 — Institutions
          ════════════════════════════════════════════════ */}
      {activeTab === 'institutions' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search institutions by name, location, or admin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E5E0] bg-white text-sm outline-none focus:border-[#6B2D3E] focus:ring-2 focus:ring-[#6B2D3E]/20 transition-all placeholder:text-[#9CA3AF] text-[#1F1F1F]"
            />
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-2xl border border-[#E8E5E0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#FAFAF7] border-b border-[#E8E5E0]">
                    {['Institution', 'Code', 'Location', 'Admin', 'Students', 'Plan', 'Revenue', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5E0]">
                  {filteredInstitutions.map((inst) => (
                    <tr key={inst.id} className="hover:bg-[#FAFAF7] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#6B2D3E]/10 flex items-center justify-center text-[#6B2D3E] font-bold text-xs shrink-0">
                            {inst.code.split('-')[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#1F1F1F] truncate">{inst.name}</p>
                            <p className="text-xs text-[#6B6B6B]">{inst.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#6B6B6B] font-mono text-xs">{inst.code}</td>
                      <td className="px-5 py-3.5 text-[#1F1F1F]">{inst.location}</td>
                      <td className="px-5 py-3.5 text-[#1F1F1F]">{inst.admin}</td>
                      <td className="px-5 py-3.5 font-semibold text-[#1F1F1F]">{inst.students}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${planBadge(inst.plan)}`}>
                          {inst.plan}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-[#1F1F1F]">{inst.revenue}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${statusBadge(inst.status)}`}>
                          {inst.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button className="w-8 h-8 rounded-lg hover:bg-[#F5F2EE] flex items-center justify-center transition-colors cursor-pointer" title="View"><Eye className="h-4 w-4 text-[#9CA3AF]" /></button>
                          <button className="w-8 h-8 rounded-lg hover:bg-[#F5F2EE] flex items-center justify-center transition-colors cursor-pointer" title="Edit"><Edit className="h-4 w-4 text-[#9CA3AF]" /></button>
                          <button className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer" title="Delete"><Trash2 className="h-4 w-4 text-red-400" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          TAB 2 — Global Users
          ════════════════════════════════════════════════ */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search users across institutions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E5E0] bg-white text-sm outline-none focus:border-[#6B2D3E] focus:ring-2 focus:ring-[#6B2D3E]/20 transition-all placeholder:text-[#9CA3AF] text-[#1F1F1F]"
            />
          </div>

          <div className="bg-white rounded-2xl border border-[#E8E5E0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#FAFAF7] border-b border-[#E8E5E0]">
                    {['User', 'Email', 'Role', 'Institution', 'Last Login', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5E0]">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FAFAF7] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#F5F2EE] flex items-center justify-center text-xs font-bold text-[#6B2D3E] shrink-0">
                            {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="font-semibold text-[#1F1F1F]">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#6B6B6B]">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          u.role === 'Institution Admin' ? 'bg-[#B8860B]/10 text-[#B8860B] ring-1 ring-[#B8860B]/20' : 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/20'
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-5 py-3.5 text-[#1F1F1F]">{u.institution}</td>
                      <td className="px-5 py-3.5 text-[#6B6B6B]">{u.lastLogin}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${statusBadge(u.status)}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button className="w-8 h-8 rounded-lg hover:bg-[#F5F2EE] flex items-center justify-center transition-colors cursor-pointer"><Eye className="h-4 w-4 text-[#9CA3AF]" /></button>
                          <button className="w-8 h-8 rounded-lg hover:bg-[#F5F2EE] flex items-center justify-center transition-colors cursor-pointer"><Edit className="h-4 w-4 text-[#9CA3AF]" /></button>
                          {u.status === 'Active' ? (
                            <button className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer" title="Suspend"><XCircle className="h-4 w-4 text-red-400" /></button>
                          ) : (
                            <button className="w-8 h-8 rounded-lg hover:bg-emerald-50 flex items-center justify-center transition-colors cursor-pointer" title="Activate"><CheckCircle className="h-4 w-4 text-emerald-500" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          TAB 3 — Feature Toggles
          ════════════════════════════════════════════════ */}
      {activeTab === 'features' && (
        <div className="bg-white rounded-2xl border border-[#E8E5E0] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#E8E5E0]">
            <h3 className="text-sm font-bold text-[#1F1F1F] font-heading">Feature Toggle System</h3>
            <p className="text-sm text-[#6B6B6B] mt-0.5">Control which features each institution has access to</p>
          </div>
          <div className="divide-y divide-[#E8E5E0]">
            {featureFlags.map((f, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-[#FAFAF7] transition-colors">
                <div className="flex items-center gap-4">
                  {f.enabled === f.institutions ? (
                    <ToggleRight className="h-6 w-6 text-emerald-500 shrink-0" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-[#9CA3AF] shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-[#1F1F1F]">{f.feature}</p>
                    <p className="text-xs text-[#6B6B6B] mt-0.5">{f.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full bg-[#F5F2EE] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${f.enabled === f.institutions ? 'bg-emerald-500' : 'bg-[#B8860B]'}`}
                        style={{ width: `${(f.enabled / f.institutions) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#6B6B6B] w-20 text-right">{f.enabled}/{f.institutions}</span>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg border border-[#E8E5E0] text-xs font-medium text-[#6B6B6B] hover:bg-[#FAFAF7] transition-colors cursor-pointer">
                    Configure
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          TAB 4 — Analytics
          ════════════════════════════════════════════════ */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Revenue Overview — dark gradient */}
          <div className="bg-gradient-to-br from-[#1A1F36] via-[#1A1F36] to-[#2A2F46] rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-[#B8860B]" />
              <h3 className="text-sm font-semibold font-heading">Platform Revenue Overview</h3>
            </div>
            <p className="text-sm text-[#9CA3AF] mb-6">Combined revenue from all institutions</p>
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <p className="text-3xl font-extrabold text-[#B8860B]">₹74.8L</p>
                <p className="text-sm text-[#9CA3AF] mt-1">Total Annual Revenue</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-emerald-400">₹6.2L</p>
                <p className="text-sm text-[#9CA3AF] mt-1">Monthly Average</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#8B3D52]">+18%</p>
                <p className="text-sm text-[#9CA3AF] mt-1">Growth vs Last Year</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Institution Growth */}
            <div className="bg-white rounded-2xl border border-[#E8E5E0] p-6">
              <h3 className="text-sm font-bold text-[#1F1F1F] mb-5 font-heading">Student Enrollment</h3>
              <div className="space-y-3">
                {sampleInstitutions.slice(0, 5).map((inst) => (
                  <div key={inst.id} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-[#6B6B6B] truncate shrink-0">{inst.name.split(' ')[0]}</div>
                    <div className="flex-1 h-7 bg-[#F5F2EE] rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#6B2D3E] to-[#8B3D52] rounded-lg flex items-center justify-end px-2 transition-all"
                        style={{ width: `${Math.max((inst.students / 420) * 100, 20)}%` }}
                      >
                        <span className="text-xs font-bold text-white">{inst.students}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Distribution */}
            <div className="bg-white rounded-2xl border border-[#E8E5E0] p-6">
              <h3 className="text-sm font-bold text-[#1F1F1F] mb-5 font-heading">Plan Distribution</h3>
              <div className="space-y-4">
                {[
                  { plan: 'Premium', count: 3, color: 'from-[#B8860B] to-[#D4A017]', pct: 50 },
                  { plan: 'Basic', count: 2, color: 'from-[#6B2D3E] to-[#8B3D52]', pct: 33 },
                  { plan: 'Free', count: 1, color: 'from-[#9CA3AF] to-[#B0B8C4]', pct: 17 },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-20 text-sm font-semibold text-[#1F1F1F]">{p.plan}</div>
                    <div className="flex-1 h-8 bg-[#F5F2EE] rounded-lg overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${p.color} rounded-lg flex items-center px-3 transition-all`}
                        style={{ width: `${Math.max(p.pct, 25)}%` }}
                      >
                        <span className="text-xs font-bold text-white">{p.count} institutions</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-[#6B6B6B] w-10 text-right">{p.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          TAB 5 — Billing
          ════════════════════════════════════════════════ */}
      {activeTab === 'billing' && (
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              plan: 'Free', price: '₹0', features: ['Up to 50 students', 'Basic Academic Module', 'Community Support'],
              card: 'bg-white border border-[#E8E5E0]', popular: false,
            },
            {
              plan: 'Basic', price: '₹4,999/mo', features: ['Up to 500 students', 'All Core Modules', 'Email Support', 'Library Access'],
              card: 'bg-white border border-[#6B2D3E]/30 ring-2 ring-[#6B2D3E]', popular: true,
            },
            {
              plan: 'Premium', price: '₹14,999/mo', features: ['Unlimited Students', 'All Modules + AI', 'Priority Support', 'Custom Branding', 'Advanced Analytics'],
              card: 'bg-white border border-[#B8860B]/30', popular: false,
            },
          ].map((p, i) => (
            <div key={i} className={`rounded-2xl border p-6 ${p.card} flex flex-col ${p.popular ? 'shadow-lg shadow-[#6B2D3E]/10' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-[#1F1F1F] font-heading">{p.plan}</h4>
                {p.popular && (
                  <span className="text-[10px] font-bold text-[#6B2D3E] bg-[#6B2D3E]/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Popular
                  </span>
                )}
              </div>
              <p className="text-2xl font-extrabold text-[#1F1F1F] mb-4">{p.price}</p>
              <ul className="mt-auto space-y-2.5">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2.5 text-sm text-[#1F1F1F]">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════════════
          TAB 6 — Security & Audit
          ════════════════════════════════════════════════ */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Security Status Cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Shield, label: 'Data Encryption', desc: 'End-to-end AES-256 encryption enabled for all institutions', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-600' },
              { icon: Database, label: 'Auto Backups', desc: 'Daily automated backups. Last backup: 2 hours ago', iconBg: 'bg-[#6B2D3E]/10', iconColor: 'text-[#6B2D3E]' },
              { icon: AlertTriangle, label: 'Security Alerts', desc: '2 suspicious login attempts detected this week', iconBg: 'bg-[#B8860B]/10', iconColor: 'text-[#B8860B]' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E8E5E0] p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center`}>
                    <s.icon className={`h-5 w-5 ${s.iconColor}`} />
                  </div>
                  <span className="text-sm font-bold text-[#1F1F1F]">{s.label}</span>
                </div>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Audit Log Timeline */}
          <div className="bg-white rounded-2xl border border-[#E8E5E0] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#E8E5E0]">
              <h3 className="text-sm font-bold text-[#1F1F1F] font-heading">Audit Log</h3>
              <p className="text-xs text-[#6B6B6B] mt-0.5">Recent activity across the platform</p>
            </div>
            <div className="divide-y divide-[#E8E5E0]">
              {auditLogs.map((log, i) => {
                const dotColor =
                  log.type === 'security' ? 'bg-red-500' :
                  log.type === 'create' ? 'bg-emerald-500' :
                  log.type === 'update' ? 'bg-[#6B2D3E]' : 'bg-[#9CA3AF]';
                const ringColor =
                  log.type === 'security' ? 'ring-red-500/20' :
                  log.type === 'create' ? 'ring-emerald-500/20' :
                  log.type === 'update' ? 'ring-[#6B2D3E]/20' : 'ring-[#9CA3AF]/20';
                return (
                  <div key={i} className="flex items-center gap-4 px-6 py-3.5 hover:bg-[#FAFAF7] transition-colors">
                    <div className={`w-2.5 h-2.5 rounded-full ${dotColor} ring-4 ${ringColor} shrink-0`} />
                    <span className="text-xs text-[#9CA3AF] font-mono w-36 shrink-0">{log.time}</span>
                    <span className="text-sm font-semibold text-[#1F1F1F] w-36 truncate shrink-0">{log.user}</span>
                    <span className="text-sm text-[#6B6B6B] flex-1 min-w-0">{log.action}</span>
                    <span className="text-xs text-[#6B6B6B] shrink-0">{log.target}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          TAB 7 — System Settings
          ════════════════════════════════════════════════ */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-[#E8E5E0] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#E8E5E0]">
            <h3 className="text-sm font-bold text-[#1F1F1F] font-heading">Platform Settings</h3>
            <p className="text-xs text-[#6B6B6B] mt-0.5">Configure global platform behavior</p>
          </div>
          <div className="divide-y divide-[#E8E5E0]">
            {[
              { label: 'Default Theme Mode', desc: 'Set default theme for new institutions', enabled: true, value: 'Light' },
              { label: 'Allow Self-Registration', desc: 'Let institutions sign up without approval', enabled: false, value: 'Disabled' },
              { label: 'Email Notifications', desc: 'System-wide email notifications', enabled: true, value: 'Enabled' },
              { label: 'SMS Notifications', desc: 'System-wide SMS notifications', enabled: false, value: 'Disabled' },
              { label: 'Maintenance Mode', desc: 'Put platform in maintenance mode', enabled: false, value: 'Off' },
              { label: 'API Access', desc: 'Allow third-party API integrations', enabled: true, value: 'Enabled' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-[#FAFAF7] transition-colors">
                <div>
                  <p className="text-sm font-semibold text-[#1F1F1F]">{s.label}</p>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">{s.desc}</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ml-4"
                  style={{ backgroundColor: s.enabled ? '#6B2D3E' : '#E8E5E0' }}>
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform"
                    style={{ translate: s.enabled ? '24px' : '2px' }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          ADD INSTITUTION MODAL
          ════════════════════════════════════════════════ */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5E0]">
              <div>
                <h3 className="text-sm font-bold text-[#1F1F1F] font-heading">Add New Institution</h3>
                <p className="text-xs text-[#6B6B6B] mt-0.5">Register a new institution on the platform</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-[#F5F2EE] flex items-center justify-center transition-colors cursor-pointer"
              >
                <XCircle className="h-5 w-5 text-[#9CA3AF]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#1F1F1F] mb-1.5">Institution Name</label>
                <input
                  type="text"
                  placeholder="e.g., Grace Theological Seminary"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5E0] bg-[#FAFAF7] text-sm outline-none focus:border-[#6B2D3E] focus:ring-2 focus:ring-[#6B2D3E]/20 transition-all placeholder:text-[#9CA3AF] text-[#1F1F1F]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F1F1F] mb-1.5">Type</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5E0] bg-[#FAFAF7] text-sm outline-none focus:border-[#6B2D3E] focus:ring-2 focus:ring-[#6B2D3E]/20 transition-all cursor-pointer text-[#1F1F1F]">
                    <option>Seminary</option>
                    <option>Bible College</option>
                    <option>Training Center</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1F1F1F] mb-1.5">Plan</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5E0] bg-[#FAFAF7] text-sm outline-none focus:border-[#6B2D3E] focus:ring-2 focus:ring-[#6B2D3E]/20 transition-all cursor-pointer text-[#1F1F1F]">
                    <option>Free</option>
                    <option>Basic</option>
                    <option>Premium</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F1F1F] mb-1.5">Location</label>
                <input
                  type="text"
                  placeholder="City, Country"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5E0] bg-[#FAFAF7] text-sm outline-none focus:border-[#6B2D3E] focus:ring-2 focus:ring-[#6B2D3E]/20 transition-all placeholder:text-[#9CA3AF] text-[#1F1F1F]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F1F1F] mb-1.5">Admin Name</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5E0] bg-[#FAFAF7] text-sm outline-none focus:border-[#6B2D3E] focus:ring-2 focus:ring-[#6B2D3E]/20 transition-all placeholder:text-[#9CA3AF] text-[#1F1F1F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1F1F1F] mb-1.5">Admin Email</label>
                  <input
                    type="email"
                    placeholder="admin@institution.edu"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5E0] bg-[#FAFAF7] text-sm outline-none focus:border-[#6B2D3E] focus:ring-2 focus:ring-[#6B2D3E]/20 transition-all placeholder:text-[#9CA3AF] text-[#1F1F1F]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F1F1F] mb-1.5">Denomination</label>
                <input
                  type="text"
                  placeholder="e.g., Baptist, Pentecostal"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E5E0] bg-[#FAFAF7] text-sm outline-none focus:border-[#6B2D3E] focus:ring-2 focus:ring-[#6B2D3E]/20 transition-all placeholder:text-[#9CA3AF] text-[#1F1F1F]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E8E5E0] bg-[#FAFAF7] rounded-b-2xl">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 rounded-xl border border-[#E8E5E0] text-sm font-medium text-[#6B6B6B] hover:bg-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6B2D3E] to-[#8B3D52] text-white text-sm font-semibold shadow-lg shadow-[#6B2D3E]/20 hover:from-[#5A2535] hover:to-[#7A3448] active:scale-[0.98] transition-all cursor-pointer"
              >
                Create Institution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
