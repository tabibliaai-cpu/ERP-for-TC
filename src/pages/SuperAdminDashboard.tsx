import { useState } from 'react';
import {
  Building2, Users, Shield, BarChart3, Settings, Plus, Search, Edit, Trash2,
  CheckCircle, XCircle, ChevronRight, Globe, CreditCard, Bell, Eye, ToggleLeft, ToggleRight,
  AlertTriangle, TrendingUp, Monitor, Database, Lock
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <Shield className="h-3 w-3" /> Super Admin
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Platform Administration</h2>
          <p className="text-slate-500 mt-1">Manage all institutions, users, and platform settings</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-white font-bold text-sm shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-300 transition-all">
          <Plus className="h-4 w-4" /> Add Institution
        </button>
      </div>

      {/* Platform Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Building2, label: 'Total Institutions', value: sampleInstitutions.length.toString(), change: '+2 this month', color: 'bg-blue-500' },
          { icon: Users, label: 'Total Users', value: '1,847', change: '+128 this month', color: 'bg-emerald-500' },
          { icon: CreditCard, label: 'Platform Revenue', value: '₹74.8L', change: '+15% vs last', color: 'bg-amber-500' },
          { icon: Monitor, label: 'System Uptime', value: '99.9%', change: 'Last 30 days', color: 'bg-purple-500' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}><s.icon className="h-5 w-5 text-white" /></div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">{s.change}</span>
            </div>
            <p className="text-xl font-bold text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            <tab.icon className="h-4 w-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* Institutions Tab */}
      {activeTab === 'institutions' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search institutions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all" />
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-3 font-medium">Institution</th>
                    <th className="px-6 py-3 font-medium">Code</th>
                    <th className="px-6 py-3 font-medium">Location</th>
                    <th className="px-6 py-3 font-medium">Admin</th>
                    <th className="px-6 py-3 font-medium">Students</th>
                    <th className="px-6 py-3 font-medium">Plan</th>
                    <th className="px-6 py-3 font-medium">Revenue</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredInstitutions.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">{inst.code.split('-')[0]}</div>
                          <div>
                            <p className="font-medium text-slate-900">{inst.name}</p>
                            <p className="text-xs text-slate-500">{inst.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">{inst.code}</td>
                      <td className="px-6 py-4 text-slate-500">{inst.location}</td>
                      <td className="px-6 py-4 text-slate-600">{inst.admin}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{inst.students}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                          inst.plan === 'Premium' ? 'bg-amber-50 text-amber-700' :
                          inst.plan === 'Basic' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                        }`}>{inst.plan}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">{inst.revenue}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                          inst.status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                          inst.status === 'Suspended' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                        }`}>{inst.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center" title="View"><Eye className="h-4 w-4 text-slate-500" /></button>
                          <button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center" title="Edit"><Edit className="h-4 w-4 text-slate-500" /></button>
                          <button className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center" title="Suspend"><Trash2 className="h-4 w-4 text-red-400" /></button>
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

      {/* Global Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search users across institutions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all" />
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-3 font-medium">User</th>
                    <th className="px-6 py-3 font-medium">Email</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 font-medium">Institution</th>
                    <th className="px-6 py-3 font-medium">Last Login</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                      <td className="px-6 py-4 text-slate-500">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          u.role === 'Institution Admin' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-600'
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{u.institution}</td>
                      <td className="px-6 py-4 text-slate-500">{u.lastLogin}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                          u.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>{u.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"><Eye className="h-4 w-4 text-slate-500" /></button>
                          <button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"><Edit className="h-4 w-4 text-slate-500" /></button>
                          {u.status === 'Active' ? (
                            <button className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center" title="Suspend"><XCircle className="h-4 w-4 text-red-400" /></button>
                          ) : (
                            <button className="w-8 h-8 rounded-lg hover:bg-emerald-50 flex items-center justify-center" title="Activate"><CheckCircle className="h-4 w-4 text-emerald-500" /></button>
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

      {/* Feature Toggles Tab */}
      {activeTab === 'features' && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Feature Toggle System</h3>
            <p className="text-sm text-slate-500">Control which features each institution has access to</p>
          </div>
          <div className="divide-y divide-slate-50">
            {featureFlags.map((f, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <ToggleRight className={`h-6 w-6 ${f.enabled === f.institutions ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{f.feature}</p>
                    <p className="text-xs text-slate-500">{f.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500">{f.enabled}/{f.institutions} institutions</span>
                  <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">Configure</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Institution Growth</h3>
              <div className="space-y-4">
                {sampleInstitutions.slice(0, 5).map((inst) => (
                  <div key={inst.id} className="flex items-center gap-4">
                    <div className="w-28 text-sm font-medium text-slate-700 truncate">{inst.name.split(' ')[0]}</div>
                    <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-lg flex items-center px-2" style={{ width: `${(inst.students / 420) * 100}%` }}>
                        <span className="text-xs font-bold text-white">{inst.students}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Plan Distribution</h3>
              <div className="space-y-4">
                {[
                  { plan: 'Premium', count: 3, color: 'bg-amber-500', pct: 50 },
                  { plan: 'Basic', count: 2, color: 'bg-blue-500', pct: 33 },
                  { plan: 'Free', count: 1, color: 'bg-slate-400', pct: 17 },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-20 text-sm font-medium text-slate-700">{p.plan}</div>
                    <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
                      <div className={`h-full ${p.color} rounded-lg flex items-center px-3`} style={{ width: `${p.pct}%` }}>
                        <span className="text-xs font-bold text-white">{p.count} institutions</span>
                      </div>
                    </div>
                    <span className="text-sm text-slate-500">{p.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Revenue Analytics */}
          <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-2xl p-6 text-white">
            <h3 className="text-sm font-semibold mb-2">Platform Revenue Overview</h3>
            <p className="text-blue-200 text-sm mb-6">Combined revenue from all institutions</p>
            <div className="grid sm:grid-cols-3 gap-6">
              <div><p className="text-3xl font-extrabold text-amber-400">₹74.8L</p><p className="text-blue-200 text-sm">Total Annual Revenue</p></div>
              <div><p className="text-3xl font-extrabold text-emerald-400">₹6.2L</p><p className="text-blue-200 text-sm">Monthly Average</p></div>
              <div><p className="text-3xl font-extrabold text-blue-400">+18%</p><p className="text-blue-200 text-sm">Growth vs Last Year</p></div>
            </div>
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { plan: 'Free', price: '₹0', features: ['Up to 50 students', 'Basic Academic Module', 'Community Support'], color: 'bg-slate-100 border-slate-200' },
              { plan: 'Basic', price: '₹4,999/mo', features: ['Up to 500 students', 'All Core Modules', 'Email Support', 'Library Access'], color: 'bg-blue-50 border-blue-200', popular: true },
              { plan: 'Premium', price: '₹14,999/mo', features: ['Unlimited Students', 'All Modules + AI', 'Priority Support', 'Custom Branding', 'Advanced Analytics'], color: 'bg-amber-50 border-amber-200' },
            ].map((p, i) => (
              <div key={i} className={`rounded-2xl border p-6 ${p.color} ${p.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
                {p.popular && <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-lg">Most Popular</span>}
                <h4 className="text-sm font-semibold text-slate-900 mt-2">{p.plan}</h4>
                <p className="text-xl font-bold text-slate-900 mt-1">{p.price}</p>
                <ul className="mt-4 space-y-2">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle className="h-4 w-4 text-emerald-500" />{f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security & Audit Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5"><div className="flex items-center gap-3 mb-2"><Shield className="h-5 w-5 text-emerald-500" /><span className="text-sm font-semibold text-slate-900">Data Encryption</span></div><p className="text-xs text-slate-500">End-to-end AES-256 encryption enabled for all institutions</p></div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5"><div className="flex items-center gap-3 mb-2"><Database className="h-5 w-5 text-blue-500" /><span className="text-sm font-semibold text-slate-900">Auto Backups</span></div><p className="text-xs text-slate-500">Daily automated backups. Last backup: 2 hours ago</p></div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5"><div className="flex items-center gap-3 mb-2"><AlertTriangle className="h-5 w-5 text-amber-500" /><span className="text-sm font-semibold text-slate-900">Security Alerts</span></div><p className="text-xs text-slate-500">2 suspicious login attempts detected this week</p></div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100"><h3 className="text-sm font-semibold text-slate-900">Audit Log</h3></div>
            <div className="divide-y divide-slate-50">
              {auditLogs.map((log, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${log.type === 'security' ? 'bg-red-500' : log.type === 'create' ? 'bg-emerald-500' : log.type === 'update' ? 'bg-blue-500' : 'bg-slate-400'}`} />
                  <span className="text-xs text-slate-400 w-36 shrink-0">{log.time}</span>
                  <span className="text-sm font-medium text-slate-900 w-36 truncate">{log.user}</span>
                  <span className="text-sm text-slate-600 flex-1">{log.action}</span>
                  <span className="text-xs text-slate-500">{log.target}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Platform Settings</h3>
            <div className="space-y-4">
              {[
                { label: 'Default Theme Mode', desc: 'Set default theme for new institutions', value: 'Light' },
                { label: 'Allow Self-Registration', desc: 'Let institutions sign up without approval', value: 'Disabled' },
                { label: 'Email Notifications', desc: 'System-wide email notifications', value: 'Enabled' },
                { label: 'SMS Notifications', desc: 'System-wide SMS notifications', value: 'Disabled' },
                { label: 'Maintenance Mode', desc: 'Put platform in maintenance mode', value: 'Off' },
                { label: 'API Access', desc: 'Allow third-party API integrations', value: 'Enabled' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{s.label}</p>
                    <p className="text-xs text-slate-500">{s.desc}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${s.value === 'Enabled' || s.value === 'On' || s.value === 'Light' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Institution Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Add New Institution</h3>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"><XCircle className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Institution Name</label><input type="text" placeholder="e.g., Grace Theological Seminary" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-amber-500 transition-all" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Type</label><select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-amber-500 transition-all"><option>Seminary</option><option>Bible College</option><option>Training Center</option></select></div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Plan</label><select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-amber-500 transition-all"><option>Free</option><option>Basic</option><option>Premium</option></select></div>
              </div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Location</label><input type="text" placeholder="City, Country" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-amber-500 transition-all" /></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Admin Email</label><input type="email" placeholder="admin@institution.edu" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-amber-500 transition-all" /></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Admin Name</label><input type="text" placeholder="Full name of the administrator" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-amber-500 transition-all" /></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Denomination</label><input type="text" placeholder="e.g., Baptist, Pentecostal" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-amber-500 transition-all" /></div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100">
              <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-white font-bold text-sm shadow-lg shadow-amber-500/25">Create Institution</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
