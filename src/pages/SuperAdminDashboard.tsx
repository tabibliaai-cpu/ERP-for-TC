import { useState, useEffect, useCallback } from 'react';
import {
  Building2, Users, Shield, BarChart3, Settings, Plus, Search, Edit, Trash2,
  CheckCircle, XCircle, Eye, ToggleLeft, ToggleRight,
  AlertTriangle, TrendingUp, Monitor, Database, Lock, Activity, Zap, Clock,
  Globe, CreditCard, Mail, Phone, MapPin, Church, Palette, ChevronDown,
  Loader2, RefreshCw, Save, X as XIcon, UserCheck, UserX, FileText,
  Info, Briefcase, Flag, Heart, BookOpen, Target
} from 'lucide-react';
import {
  getInstitutions, createInstitution, getInstitution, updateInstitution, deleteInstitution,
  getGlobalUsers, updateUserStatus,
  getPlatformStats, getAuditLogs, getFeatureFlags,
  getPlatformSettings, updatePlatformSetting,
} from '../utils/api';
import { useAuth } from '../context/AuthContext';

/* ═══════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════ */

interface Institution {
  id: string | number;
  name: string;
  code: string;
  type: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  email?: string;
  phone?: string;
  website?: string;
  denomination?: string;
  plan: string;
  status: string;
  admin_name?: string;
  admin_email?: string;
  students?: number;
  display_name?: string;
  short_name?: string;
  address?: string;
  postal_code?: string;
  primary_color?: string;
  secondary_color?: string;
  mission?: string;
  vision?: string;
  statement_of_faith?: string;
  core_values?: string;
  tenant_db_name?: string;
  created_at?: string;
  [key: string]: any;
}

interface GlobalUser {
  id: string | number;
  name: string;
  email: string;
  role: string;
  institution?: string;
  institution_name?: string;
  last_login_at?: string;
  status: string;
  [key: string]: any;
}

interface AuditLog {
  id?: string | number;
  user_name?: string;
  user?: string;
  action: string;
  entity?: string;
  target?: string;
  type?: string;
  created_at?: string;
  time?: string;
  [key: string]: any;
}

interface FeatureFlag {
  feature: string;
  description: string;
  institutions: number;
  enabled: number;
  [key: string]: any;
}

interface PlatformStat {
  totalInstitutions?: number;
  totalUsers?: number;
  totalStudents?: number;
  revenue?: string;
  uptime?: string;
  [key: string]: any;
}

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

/* ═══════════════════════════════════════════════════════════
   FALLBACK / SAMPLE DATA
   ═══════════════════════════════════════════════════════════ */

// Type-reference sample data (not used as default state)
const _sampleInstitutions: Institution[] = [
  { id: 1, name: 'Grace Theological Seminary', code: 'GTS-001', type: 'Seminary', location: 'Chennai, India', city: 'Chennai', state: 'Tamil Nadu', country: 'India', admin_name: 'Dr. Samuel Johnson', admin_email: 'samuel@gts.edu', students: 342, plan: 'Premium', status: 'Active', email: 'info@gts.edu', phone: '+91-44-2345-6789', website: 'www.gts.edu', denomination: 'Protestant' },
  { id: 2, name: 'Living Word Bible College', code: 'LWBC-002', type: 'Bible College', location: 'Bangalore, India', city: 'Bangalore', state: 'Karnataka', country: 'India', admin_name: 'Rev. David Williams', admin_email: 'david@lwbc.edu', students: 185, plan: 'Basic', status: 'Active', email: 'info@lwbc.edu', phone: '+91-80-2345-6789', website: 'www.lwbc.edu', denomination: 'Pentecostal' },
  { id: 3, name: 'Hope International Seminary', code: 'HIS-003', type: 'Seminary', location: 'Mumbai, India', city: 'Mumbai', state: 'Maharashtra', country: 'India', admin_name: 'Prof. Maria Garcia', admin_email: 'maria@his.edu', students: 420, plan: 'Premium', status: 'Active', email: 'info@his.edu', phone: '+91-22-2345-6789', website: 'www.his.edu', denomination: 'Non-denominational' },
  { id: 4, name: 'Covenant Bible Institute', code: 'CBI-004', type: 'Bible College', location: 'Delhi, India', city: 'Delhi', state: 'Delhi', country: 'India', admin_name: 'Dr. Sarah Chen', admin_email: 'sarah@cbi.edu', students: 98, plan: 'Free', status: 'Active', email: 'info@cbi.edu', phone: '+91-11-2345-6789', website: 'www.cbi.edu', denomination: 'Baptist' },
  { id: 5, name: 'Emmanuel School of Theology', code: 'EST-005', type: 'Training Center', location: 'Kerala, India', city: 'Kochi', state: 'Kerala', country: 'India', admin_name: 'Rev. James Anderson', admin_email: 'james@est.edu', students: 156, plan: 'Basic', status: 'Inactive', email: 'info@est.edu', phone: '+91-484-234-5678', website: 'www.est.edu', denomination: 'Mar Thoma' },
  { id: 6, name: 'Redeemed Seminary', code: 'RSM-006', type: 'Seminary', location: 'Hyderabad, India', city: 'Hyderabad', state: 'Telangana', country: 'India', admin_name: 'Dr. Abraham Thomas', admin_email: 'abraham@rsm.edu', students: 210, plan: 'Premium', status: 'Suspended', email: 'info@rsm.edu', phone: '+91-40-2345-6789', website: 'www.rsm.edu', denomination: 'Assemblies of God' },
];

const _sampleUsers: GlobalUser[] = [
  { id: 1, name: 'Dr. Samuel Johnson', email: 'samuel@gts.edu', role: 'Institution Admin', institution: 'Grace Theological Seminary', status: 'Active', last_login_at: '2026-04-26' },
  { id: 2, name: 'Rev. David Williams', email: 'david@lwbc.edu', role: 'Institution Admin', institution: 'Living Word Bible College', status: 'Active', last_login_at: '2026-04-25' },
  { id: 3, name: 'John Abraham', email: 'john@student.gts.edu', role: 'Student', institution: 'Grace Theological Seminary', status: 'Active', last_login_at: '2026-04-26' },
  { id: 4, name: 'Prof. Maria Garcia', email: 'maria@his.edu', role: 'Institution Admin', institution: 'Hope International', status: 'Active', last_login_at: '2026-04-24' },
  { id: 5, name: 'Sarah Thompson', email: 'sarah@student.lwbc.edu', role: 'Student', institution: 'Living Word Bible College', status: 'Suspended', last_login_at: '2026-04-10' },
  { id: 6, name: 'Dr. Abraham Thomas', email: 'abraham@rsm.edu', role: 'Institution Admin', institution: 'Redeemed Seminary', status: 'Active', last_login_at: '2026-04-22' },
];

const _sampleAuditLogs: AuditLog[] = [
  { time: '2026-04-26 14:32', user: 'Super Admin', user_name: 'Super Admin', action: 'Created institution', target: 'Redeemed Seminary', entity: 'Institution', type: 'create', created_at: '2026-04-26 14:32' },
  { time: '2026-04-26 13:15', user_name: 'Dr. Samuel Johnson', action: 'Updated fee structure', target: 'B.Th Program', entity: 'FeeStructure', type: 'update', created_at: '2026-04-26 13:15' },
  { time: '2026-04-26 11:45', user_name: 'System', action: 'Auto backup completed', target: 'All institutions', entity: 'System', type: 'system', created_at: '2026-04-26 11:45' },
  { time: '2026-04-26 10:20', user_name: 'Super Admin', action: 'Suspended user', target: 'sarah@student.lwbc.edu', entity: 'User', type: 'security', created_at: '2026-04-26 10:20' },
  { time: '2026-04-25 16:00', user_name: 'Rev. David Williams', action: 'Added 15 students', target: 'LWBC Batch 2026', entity: 'Student', type: 'create', created_at: '2026-04-25 16:00' },
  { time: '2026-04-25 09:30', user_name: 'System', action: 'Payment reminder sent', target: '42 students', entity: 'Payment', type: 'system', created_at: '2026-04-25 09:30' },
];

const _sampleFeatures: FeatureFlag[] = [
  { feature: 'Academic Module', description: 'Program & course management', institutions: 6, enabled: 6 },
  { feature: 'Pedagogical Portal', description: 'Teaching methods & resources', institutions: 6, enabled: 4 },
  { feature: 'Library System', description: 'Manuscript & resource management', institutions: 6, enabled: 5 },
  { feature: 'Billing System', description: 'Fee structures & payments', institutions: 6, enabled: 6 },
  { feature: 'Yeshua AI', description: 'AI biblical assistant', institutions: 6, enabled: 3 },
  { feature: 'Multi-tenant Branding', description: 'Custom institution branding', institutions: 6, enabled: 2 },
  { feature: 'Advanced Analytics', description: 'AI-powered insights', institutions: 6, enabled: 1 },
  { feature: 'Ministry Tracking', description: 'Ministry involvement & outreach', institutions: 6, enabled: 4 },
];

const _sampleStats: PlatformStat = {
  totalInstitutions: 6,
  totalUsers: 1847,
  totalStudents: 1411,
  revenue: '₹74.8L',
  uptime: '99.9%',
};

const _sampleSettings = [
  { key: 'default_theme_mode', label: 'Default Theme Mode', desc: 'Set default theme for new institutions', value: 'light', enabled: true },
  { key: 'allow_self_registration', label: 'Allow Self-Registration', desc: 'Let institutions sign up without approval', value: 'disabled', enabled: false },
  { key: 'email_notifications', label: 'Email Notifications', desc: 'System-wide email notifications', value: 'enabled', enabled: true },
  { key: 'sms_notifications', label: 'SMS Notifications', desc: 'System-wide SMS notifications', value: 'disabled', enabled: false },
  { key: 'maintenance_mode', label: 'Maintenance Mode', desc: 'Put platform in maintenance mode', value: 'off', enabled: false },
  { key: 'api_access', label: 'API Access', desc: 'Allow third-party API integrations', value: 'enabled', enabled: true },
];

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */

const statusBadge = (status: string) => {
  const s = status?.toLowerCase() || '';
  if (s === 'active') return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20';
  if (s === 'suspended') return 'bg-red-50 text-red-700 ring-1 ring-red-600/20';
  return 'bg-[#F5F2EE] text-[#6B6B6B] ring-1 ring-[#E8E5E0]';
};

const planBadge = (plan: string) => {
  const p = plan?.toLowerCase() || '';
  if (p === 'premium') return 'bg-[#B8860B]/10 text-[#B8860B] ring-1 ring-[#B8860B]/20';
  if (p === 'basic') return 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/20';
  return 'bg-[#F5F2EE] text-[#6B6B6B] ring-1 ring-[#E8E5E0]';
};

const roleBadge = (role: string) => {
  const r = role?.toLowerCase() || '';
  if (r.includes('admin')) return 'bg-[#B8860B]/10 text-[#B8860B] ring-1 ring-[#B8860B]/20';
  return 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/20';
};

const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-[#E8E5E0] bg-[#FAFAF7] text-sm outline-none focus:border-[#6B2D3E] focus:ring-2 focus:ring-[#6B2D3E]/20 transition-all placeholder:text-[#9CA3AF] text-[#1F1F1F]';
const selectClass = 'w-full px-4 py-2.5 rounded-xl border border-[#E8E5E0] bg-[#FAFAF7] text-sm outline-none focus:border-[#6B2D3E] focus:ring-2 focus:ring-[#6B2D3E]/20 transition-all cursor-pointer text-[#1F1F1F]';
const labelClass = 'block text-xs font-semibold text-[#1F1F1F] mb-1.5';
const btnPrimary = 'px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6B2D3E] to-[#8B3D52] text-white text-sm font-semibold shadow-lg shadow-[#6B2D3E]/20 hover:from-[#5A2535] hover:to-[#7A3448] active:scale-[0.98] transition-all cursor-pointer';
const btnSecondary = 'px-5 py-2.5 rounded-xl border border-[#E8E5E0] text-sm font-medium text-[#6B6B6B] hover:bg-white transition-colors cursor-pointer';
const btnIcon = 'w-8 h-8 rounded-lg hover:bg-[#F5F2EE] flex items-center justify-center transition-colors cursor-pointer';

let toastId = 0;

/* ═══════════════════════════════════════════════════════════
   TOAST NOTIFICATION COMPONENT
   ═══════════════════════════════════════════════════════════ */

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: number) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-slide-in ${
            t.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
            t.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-sky-50 border-sky-200 text-sky-800'
          }`}
        >
          {t.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0" /> :
           t.type === 'error' ? <XCircle className="h-4 w-4 shrink-0" /> :
           <Info className="h-4 w-4 shrink-0" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="cursor-pointer shrink-0 hover:opacity-70">
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LOADING SPINNER
   ═══════════════════════════════════════════════════════════ */

function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="h-8 w-8 text-[#6B2D3E] animate-spin" />
      <p className="text-sm text-[#6B6B6B]">{message}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INSTITUTION PROFILE MODAL
   ═══════════════════════════════════════════════════════════ */

interface ProfileField {
  key: string;
  label: string;
  icon: React.ElementType;
  section: string;
}

const profileFields: ProfileField[] = [
  // Basic Info
  { key: 'name', label: 'Name', icon: Building2, section: 'Basic Info' },
  { key: 'code', label: 'Code', icon: FileText, section: 'Basic Info' },
  { key: 'type', label: 'Type', icon: Briefcase, section: 'Basic Info' },
  { key: 'display_name', label: 'Display Name', icon: FileText, section: 'Basic Info' },
  { key: 'short_name', label: 'Short Name', icon: FileText, section: 'Basic Info' },
  // Location
  { key: 'city', label: 'City', icon: MapPin, section: 'Location' },
  { key: 'state', label: 'State', icon: MapPin, section: 'Location' },
  { key: 'country', label: 'Country', icon: Flag, section: 'Location' },
  { key: 'location', label: 'Location Summary', icon: MapPin, section: 'Location' },
  { key: 'address', label: 'Address', icon: MapPin, section: 'Location' },
  { key: 'postal_code', label: 'Postal Code', icon: FileText, section: 'Location' },
  // Contact
  { key: 'email', label: 'Email', icon: Mail, section: 'Contact' },
  { key: 'phone', label: 'Phone', icon: Phone, section: 'Contact' },
  { key: 'website', label: 'Website', icon: Globe, section: 'Contact' },
  // Identity
  { key: 'denomination', label: 'Denomination', icon: Church, section: 'Identity' },
  { key: 'mission', label: 'Mission', icon: Target, section: 'Identity' },
  { key: 'vision', label: 'Vision', icon: Eye, section: 'Identity' },
  { key: 'statement_of_faith', label: 'Statement of Faith', icon: BookOpen, section: 'Identity' },
  { key: 'core_values', label: 'Core Values', icon: Heart, section: 'Identity' },
  // Admin
  { key: 'admin_name', label: 'Admin Name', icon: Users, section: 'Admin' },
  { key: 'admin_email', label: 'Admin Email', icon: Mail, section: 'Admin' },
  // Branding
  { key: 'primary_color', label: 'Primary Color', icon: Palette, section: 'Branding' },
  { key: 'secondary_color', label: 'Secondary Color', icon: Palette, section: 'Branding' },
  // Plan & Status
  { key: 'plan', label: 'Plan', icon: CreditCard, section: 'Plan & Status' },
  { key: 'status', label: 'Status', icon: Activity, section: 'Plan & Status' },
];

function getSections(fields: ProfileField[]): string[] {
  return [...new Set(fields.map(f => f.section))];
}

function InstitutionProfileModal({
  institution,
  editMode,
  onClose,
  onSave,
  onEdit,
}: {
  institution: Institution;
  editMode: boolean;
  onClose: () => void;
  onSave: (data: Institution) => Promise<void>;
  onEdit: () => void;
}) {
  const [isEditing, setIsEditing] = useState(editMode);
  const [formData, setFormData] = useState<Institution>({ ...institution });
  const [saving, setSaving] = useState(false);

  const sections = getSections(profileFields);
  const typeOptions = ['Seminary', 'Bible College', 'Training Center'];
  const planOptions = ['Free', 'Basic', 'Premium'];
  const statusOptions = ['Active', 'Inactive', 'Suspended'];

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      setFormData({ ...institution });
      setIsEditing(false);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5E0] sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h3 className="text-base font-bold text-[#1F1F1F] font-heading flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#6B2D3E]" />
              Institution Profile
            </h3>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              {institution.name} ({institution.code})
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button onClick={onEdit} className={`${btnSecondary} flex items-center gap-1.5 text-xs py-2 px-3`}>
                <Edit className="h-3.5 w-3.5" /> Edit
              </button>
            )}
            <button onClick={handleCancel} className={btnIcon}>
              <XCircle className="h-5 w-5 text-[#9CA3AF]" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {sections.map(section => {
            const sectionFields = profileFields.filter(f => f.section === section);
            const sectionColors: Record<string, string> = {
              'Basic Info': 'text-[#6B2D3E]',
              'Location': 'text-emerald-600',
              'Contact': 'text-sky-600',
              'Identity': 'text-[#B8860B]',
              'Admin': 'text-purple-600',
              'Branding': 'text-pink-600',
              'Plan & Status': 'text-[#1A1F36]',
            };
            return (
              <div key={section}>
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${sectionColors[section] || 'text-[#6B2D3E]'}`}>
                  {section}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sectionFields.map(field => {
                    const val = formData[field.key] || '';
                    const isLongField = ['mission', 'vision', 'statement_of_faith', 'core_values', 'address'].includes(field.key);

                    if (isEditing) {
                      if (field.key === 'type') {
                        return (
                          <div key={field.key} className={isLongField ? 'sm:col-span-2' : ''}>
                            <label className={labelClass}>{field.label}</label>
                            <select value={val} onChange={e => handleChange(field.key, e.target.value)} className={selectClass}>
                              {typeOptions.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                        );
                      }
                      if (field.key === 'plan') {
                        return (
                          <div key={field.key}>
                            <label className={labelClass}>{field.label}</label>
                            <select value={val} onChange={e => handleChange(field.key, e.target.value)} className={selectClass}>
                              {planOptions.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                        );
                      }
                      if (field.key === 'status') {
                        return (
                          <div key={field.key}>
                            <label className={labelClass}>{field.label}</label>
                            <select value={val} onChange={e => handleChange(field.key, e.target.value)} className={selectClass}>
                              {statusOptions.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                        );
                      }
                      if (field.key === 'primary_color' || field.key === 'secondary_color') {
                        return (
                          <div key={field.key}>
                            <label className={labelClass}>{field.label}</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={val || '#6B2D3E'}
                                onChange={e => handleChange(field.key, e.target.value)}
                                className="w-10 h-10 rounded-lg border border-[#E8E5E0] cursor-pointer p-0.5"
                              />
                              <input
                                type="text"
                                value={val}
                                onChange={e => handleChange(field.key, e.target.value)}
                                placeholder="#000000"
                                className={inputClass}
                              />
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div key={field.key} className={isLongField ? 'sm:col-span-2' : ''}>
                          <label className={labelClass}>{field.label}</label>
                          {isLongField ? (
                            <textarea
                              value={val}
                              onChange={e => handleChange(field.key, e.target.value)}
                              rows={3}
                              className={inputClass}
                              placeholder={`Enter ${field.label.toLowerCase()}...`}
                            />
                          ) : (
                            <input
                              type="text"
                              value={val}
                              onChange={e => handleChange(field.key, e.target.value)}
                              placeholder={`Enter ${field.label.toLowerCase()}...`}
                              className={inputClass}
                            />
                          )}
                        </div>
                      );
                    }

                    // View mode
                    if (field.key === 'primary_color' || field.key === 'secondary_color') {
                      return (
                        <div key={field.key}>
                          <label className={labelClass}>{field.label}</label>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-lg border border-[#E8E5E0] shadow-sm"
                              style={{ backgroundColor: val || '#6B2D3E' }}
                            />
                            <span className="text-sm text-[#1F1F1F] font-mono">{val || 'Not set'}</span>
                          </div>
                        </div>
                      );
                    }
                    if (field.key === 'plan') {
                      return (
                        <div key={field.key}>
                          <label className={labelClass}>{field.label}</label>
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${planBadge(val)}`}>
                            {val || 'Not set'}
                          </span>
                        </div>
                      );
                    }
                    if (field.key === 'status') {
                      return (
                        <div key={field.key}>
                          <label className={labelClass}>{field.label}</label>
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${statusBadge(val)}`}>
                            {val || 'Not set'}
                          </span>
                        </div>
                      );
                    }
                    if (field.key === 'website' && val) {
                      return (
                        <div key={field.key} className={isLongField ? 'sm:col-span-2' : ''}>
                          <label className={labelClass}>{field.label}</label>
                          <a
                            href={val.startsWith('http') ? val : `https://${val}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#6B2D3E] hover:underline flex items-center gap-1"
                          >
                            <Globe className="h-3.5 w-3.5" />
                            {val}
                          </a>
                        </div>
                      );
                    }
                    return (
                      <div key={field.key} className={isLongField ? 'sm:col-span-2' : ''}>
                        <label className={labelClass}>{field.label}</label>
                        <p className="text-sm text-[#1F1F1F] whitespace-pre-wrap">
                          {val || <span className="text-[#9CA3AF] italic">Not set</span>}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E8E5E0] bg-[#FAFAF7] rounded-b-2xl sticky bottom-0">
            <button onClick={handleCancel} className={btnSecondary} disabled={saving}>
              Cancel
            </button>
            <button onClick={handleSave} className={`${btnPrimary} flex items-center gap-2`} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ADD INSTITUTION MODAL
   ═══════════════════════════════════════════════════════════ */

function AddInstitutionModal({
  onSubmit,
  onClose,
  submitting,
}: {
  onSubmit: (data: Record<string, string>) => Promise<void>;
  onClose: () => void;
  submitting: boolean;
}) {
  const [form, setForm] = useState({
    name: '', code: '', type: 'Seminary', location: '', city: '', state: '', country: '',
    email: '', phone: '', website: '', denomination: '', plan: 'Free',
    adminName: '', adminEmail: '',
  });

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5E0]">
          <div>
            <h3 className="text-sm font-bold text-[#1F1F1F] font-heading">Add New Institution</h3>
            <p className="text-xs text-[#6B6B6B] mt-0.5">Register a new institution on the platform</p>
          </div>
          <button onClick={onClose} className={btnIcon}><XCircle className="h-5 w-5 text-[#9CA3AF]" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className={labelClass}>Institution Name *</label>
            <input type="text" required value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g., Grace Theological Seminary" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Code *</label>
              <input type="text" required value={form.code} onChange={e => update('code', e.target.value)} placeholder="e.g., GTS-001" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Type *</label>
              <select value={form.type} onChange={e => update('type', e.target.value)} className={selectClass}>
                <option>Seminary</option>
                <option>Bible College</option>
                <option>Training Center</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>City</label>
              <input type="text" value={form.city} onChange={e => update('city', e.target.value)} placeholder="City" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <input type="text" value={form.state} onChange={e => update('state', e.target.value)} placeholder="State" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Country</label>
              <input type="text" value={form.country} onChange={e => update('country', e.target.value)} placeholder="Country" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Location Summary</label>
              <input type="text" value={form.location} onChange={e => update('location', e.target.value)} placeholder="City, Country" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="info@institution.edu" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+91-XX-XXXX-XXXX" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Website</label>
              <input type="text" value={form.website} onChange={e => update('website', e.target.value)} placeholder="www.institution.edu" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Denomination</label>
              <input type="text" value={form.denomination} onChange={e => update('denomination', e.target.value)} placeholder="e.g., Baptist, Pentecostal" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Plan</label>
            <select value={form.plan} onChange={e => update('plan', e.target.value)} className={selectClass}>
              <option>Free</option>
              <option>Basic</option>
              <option>Premium</option>
            </select>
          </div>

          <div className="border-t border-[#E8E5E0] pt-5">
            <p className="text-xs font-semibold text-[#6B2D3E] mb-3 uppercase tracking-wider">Administrator</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Admin Name *</label>
                <input type="text" required value={form.adminName} onChange={e => update('adminName', e.target.value)} placeholder="Full name" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Admin Email *</label>
                <input type="email" required value={form.adminEmail} onChange={e => update('adminEmail', e.target.value)} placeholder="admin@institution.edu" className={inputClass} />
              </div>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E8E5E0] bg-[#FAFAF7] rounded-b-2xl">
          <button onClick={onClose} className={btnSecondary} disabled={submitting}>Cancel</button>
          <button onClick={() => {
            const btn = document.querySelector('form') as HTMLFormElement;
            btn?.requestSubmit();
          }} className={`${btnPrimary} flex items-center gap-2`} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {submitting ? 'Creating...' : 'Create Institution'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */

export default function SuperAdminDashboard() {
  const { user } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState('institutions');
  const [searchTerm, setSearchTerm] = useState('');

  // Data states
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [users, setUsers] = useState<GlobalUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStat>({});
  const [platformSettings, setPlatformSettings] = useState<any[]>([]);

  // Loading states
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingFeatures, setLoadingFeatures] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [profileInstitution, setProfileInstitution] = useState<Institution | null>(null);
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Toast
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  /* ── Data Fetching ── */

  const fetchInstitutions = useCallback(async () => {
    setLoadingInstitutions(true);
    try {
      const data = await getInstitutions();
      const list = Array.isArray(data) ? data : data.institutions || data.data || [];
      setInstitutions(list);
    } catch {
      setInstitutions([]);
      addToast('error', 'Failed to load institutions. Please check your connection.');
    } finally {
      setLoadingInstitutions(false);
    }
  }, [addToast]);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const data = await getGlobalUsers();
      const list = Array.isArray(data) ? data : data.users || data.data || [];
      setUsers(list);
    } catch {
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await getPlatformStats();
      if (data && typeof data === 'object') {
        setPlatformStats(prev => ({ ...prev, ...data }));
      }
    } catch {
      // keep fallback
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const data = await getAuditLogs();
      const list = Array.isArray(data) ? data : data.logs || data.data || [];
      setAuditLogs(list);
    } catch {
      setAuditLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  const fetchFeatures = useCallback(async () => {
    setLoadingFeatures(true);
    try {
      const data = await getFeatureFlags('all');
      const list = Array.isArray(data) ? data : data.features || data.data || [];
      setFeatures(list);
    } catch {
      setFeatures([]);
    } finally {
      setLoadingFeatures(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const data = await getPlatformSettings();
      if (Array.isArray(data) && data.length > 0) {
        setPlatformSettings(data.map((s: any) => ({
          key: s.key || s.setting_key,
          label: s.label || s.setting_key || s.key,
          desc: s.description || s.desc || '',
          value: s.value || s.setting_value || '',
          enabled: s.value === 'enabled' || s.value === 'true' || s.value === 'on' || s.enabled === true || s.enabled === 1,
        })));
      }
    } catch {
      // keep fallback
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchInstitutions();
  }, [fetchInstitutions]);

  // Lazy load per tab
  useEffect(() => {
    if (activeTab === 'users' && users.length === 0 && !loadingUsers) fetchUsers();
    if (activeTab === 'analytics' && !loadingStats) fetchStats();
    if (activeTab === 'security' && auditLogs.length === 0 && !loadingLogs) fetchAuditLogs();
    if (activeTab === 'features' && features.length === 0 && !loadingFeatures) fetchFeatures();
    if (activeTab === 'settings' && !loadingSettings) fetchSettings();
  }, [activeTab, users.length, auditLogs.length, features.length, fetchUsers, fetchStats, fetchAuditLogs, fetchFeatures, fetchSettings, loadingUsers, loadingStats, loadingLogs, loadingFeatures, loadingSettings]);

  /* ── Actions ── */

  const handleCreateInstitution = async (formData: Record<string, string>) => {
    setSubmittingAdd(true);
    try {
      await createInstitution(formData);
      addToast('success', 'Institution created successfully!');
      setShowAddModal(false);
      fetchInstitutions();
    } catch (err: any) {
      addToast('error', err.message || 'Failed to create institution.');
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleDeleteInstitution = async (id: string | number) => {
    try {
      await deleteInstitution(String(id));
      addToast('success', 'Institution deleted successfully!');
      setConfirmDelete(null);
      fetchInstitutions();
    } catch (err: any) {
      addToast('error', err.message || 'Failed to delete institution.');
    }
  };

  const handleViewInstitution = async (inst: Institution) => {
    setLoadingProfile(true);
    setProfileEditMode(false);
    try {
      const data = await getInstitution(String(inst.id));
      setProfileInstitution({ ...inst, ...(data || {}) });
    } catch {
      setProfileInstitution(inst);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleEditInstitution = async (inst: Institution) => {
    setLoadingProfile(true);
    setProfileEditMode(true);
    try {
      const data = await getInstitution(String(inst.id));
      setProfileInstitution({ ...inst, ...(data || {}) });
    } catch {
      setProfileInstitution(inst);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveInstitution = async (updated: Institution) => {
    if (!profileInstitution) return;
    try {
      await updateInstitution(String(profileInstitution.id), updated);
      addToast('success', 'Institution updated successfully!');
      setProfileInstitution(updated);
      setProfileEditMode(false);
      fetchInstitutions();
    } catch (err: any) {
      addToast('error', err.message || 'Failed to update institution.');
      throw err;
    }
  };

  const handleToggleUserStatus = async (userId: string | number, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      await updateUserStatus(String(userId), newStatus);
      addToast('success', `User ${newStatus.toLowerCase()} successfully.`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err: any) {
      addToast('error', err.message || 'Failed to update user status.');
    }
  };

  const handleToggleSetting = async (setting: any) => {
    const newValue = setting.enabled ? 'disabled' : 'enabled';
    try {
      await updatePlatformSetting(setting.key, newValue, setting.desc);
      addToast('success', `${setting.label} updated.`);
      setPlatformSettings(prev =>
        prev.map(s => s.key === setting.key ? { ...s, enabled: !s.enabled, value: newValue } : s)
      );
    } catch (err: any) {
      addToast('error', err.message || 'Failed to update setting.');
    }
  };

  /* ── Filtering ── */

  const filteredInstitutions = institutions.filter(i =>
    i.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.admin_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.institution?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.institution_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ── Computed stats ── */
  const statsCards = [
    { icon: Building2, label: 'Institutions', value: String(platformStats.totalInstitutions ?? institutions.length), change: '+2 this month', iconBg: 'bg-[#6B2D3E]/10', iconColor: 'text-[#6B2D3E]' },
    { icon: Users, label: 'Total Users', value: platformStats.totalUsers?.toLocaleString() ?? '1,847', change: '+128 this month', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-600' },
    { icon: CreditCard, label: 'Revenue', value: platformStats.revenue ?? '₹74.8L', change: '+15% vs last', iconBg: 'bg-[#B8860B]/10', iconColor: 'text-[#B8860B]' },
    { icon: Activity, label: 'Uptime', value: platformStats.uptime ?? '99.9%', change: 'Last 30 days', iconBg: 'bg-[#6B2D3E]/10', iconColor: 'text-[#8B3D52]' },
  ];

  /* ── Plan distribution from data ── */
  const planDistribution = institutions.reduce((acc, inst) => {
    const p = inst.plan || 'Free';
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const totalInsts = institutions.length || 1;

  const planColors: Record<string, string> = {
    Premium: 'from-[#B8860B] to-[#D4A017]',
    Basic: 'from-[#6B2D3E] to-[#8B3D52]',
    Free: 'from-[#9CA3AF] to-[#B0B8C4]',
  };

  /* ── Tabs ── */
  const tabs = [
    { id: 'institutions', label: 'Institutions', icon: Building2 },
    { id: 'users', label: 'Global Users', icon: Users },
    { id: 'features', label: 'Feature Toggles', icon: ToggleLeft },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'security', label: 'Security & Audit', icon: Lock },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toasts */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* ── Header ── */}
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
        <button onClick={() => setShowAddModal(true)} className={btnPrimary}>
          <Plus className="h-4 w-4" /> Add Institution
        </button>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((s, i) => (
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
            onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
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
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search institutions by name, location, code, or admin..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E5E0] bg-white text-sm outline-none focus:border-[#6B2D3E] focus:ring-2 focus:ring-[#6B2D3E]/20 transition-all placeholder:text-[#9CA3AF] text-[#1F1F1F]`}
            />
          </div>

          {loadingInstitutions ? (
            <LoadingState message="Loading institutions..." />
          ) : (
            <div className="bg-white rounded-2xl border border-[#E8E5E0] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#FAFAF7] border-b border-[#E8E5E0]">
                      {['Institution', 'Code', 'Location', 'Admin', 'Students', 'Plan', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E5E0]">
                    {filteredInstitutions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-12 text-center text-sm text-[#9CA3AF]">
                          No institutions found.
                        </td>
                      </tr>
                    ) : (
                      filteredInstitutions.map(inst => (
                        <tr key={inst.id} className="hover:bg-[#FAFAF7] transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-[#6B2D3E]/10 flex items-center justify-center text-[#6B2D3E] font-bold text-xs shrink-0">
                                {(inst.code || inst.name || '??').split('-')[0].slice(0, 3)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-[#1F1F1F] truncate">{inst.name}</p>
                                <p className="text-xs text-[#6B6B6B]">{inst.type}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-[#6B6B6B] font-mono text-xs">{inst.code}</td>
                          <td className="px-5 py-3.5 text-[#1F1F1F]">{inst.location || `${inst.city || ''}${inst.city && inst.state ? ', ' : ''}${inst.state || ''}`}</td>
                          <td className="px-5 py-3.5 text-[#1F1F1F]">{inst.admin_name || '—'}</td>
                          <td className="px-5 py-3.5 font-semibold text-[#1F1F1F]">{inst.students ?? '—'}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${planBadge(inst.plan)}`}>{inst.plan || 'Free'}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${statusBadge(inst.status)}`}>{inst.status || 'Active'}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleViewInstitution(inst)} className={btnIcon} title="View Profile">
                                <Eye className="h-4 w-4 text-[#6B2D3E]" />
                              </button>
                              <button onClick={() => handleEditInstitution(inst)} className={btnIcon} title="Edit">
                                <Edit className="h-4 w-4 text-[#9CA3AF]" />
                              </button>
                              {confirmDelete === String(inst.id) ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDeleteInstitution(inst.id)}
                                    className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold cursor-pointer hover:bg-red-600 transition-colors"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="px-2 py-1 rounded-lg bg-[#F5F2EE] text-[#6B6B6B] text-xs font-medium cursor-pointer hover:bg-[#E8E5E0] transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button onClick={() => setConfirmDelete(String(inst.id))} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer" title="Delete">
                                  <Trash2 className="h-4 w-4 text-red-400" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E5E0] bg-white text-sm outline-none focus:border-[#6B2D3E] focus:ring-2 focus:ring-[#6B2D3E]/20 transition-all placeholder:text-[#9CA3AF] text-[#1F1F1F]"
            />
          </div>

          {loadingUsers ? (
            <LoadingState message="Loading users..." />
          ) : (
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
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-[#9CA3AF]">No users found.</td></tr>
                    ) : (
                      filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-[#FAFAF7] transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#F5F2EE] flex items-center justify-center text-xs font-bold text-[#6B2D3E] shrink-0">
                                {(u.name || '??').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-semibold text-[#1F1F1F]">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-[#6B6B6B]">{u.email}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${roleBadge(u.role)}`}>{u.role}</span>
                          </td>
                          <td className="px-5 py-3.5 text-[#1F1F1F]">{u.institution || u.institution_name || '—'}</td>
                          <td className="px-5 py-3.5 text-[#6B6B6B]">{u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : '—'}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${statusBadge(u.status)}`}>{u.status}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => handleToggleUserStatus(u.id, u.status)}
                              className={btnIcon}
                              title={u.status === 'Active' ? 'Suspend User' : 'Activate User'}
                            >
                              {u.status === 'Active' ? (
                                <UserX className="h-4 w-4 text-red-400" />
                              ) : (
                                <UserCheck className="h-4 w-4 text-emerald-500" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════
          TAB 3 — Feature Toggles
          ════════════════════════════════════════════════ */}
      {activeTab === 'features' && (
        <div className="bg-white rounded-2xl border border-[#E8E5E0] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#E8E5E0] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#1F1F1F] font-heading">Feature Toggle System</h3>
              <p className="text-sm text-[#6B6B6B] mt-0.5">Control which features each institution has access to</p>
            </div>
            <button onClick={fetchFeatures} className={btnIcon} title="Refresh">
              <RefreshCw className={`h-4 w-4 text-[#9CA3AF] ${loadingFeatures ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {loadingFeatures ? (
            <LoadingState message="Loading features..." />
          ) : (
            <div className="divide-y divide-[#E8E5E0]">
              {features.map((f, i) => (
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
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════
          TAB 4 — Analytics
          ════════════════════════════════════════════════ */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Revenue Overview */}
          <div className="bg-gradient-to-br from-[#1A1F36] via-[#1A1F36] to-[#2A2F46] rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-[#B8860B]" />
              <h3 className="text-sm font-semibold font-heading">Platform Revenue Overview</h3>
            </div>
            <p className="text-sm text-[#9CA3AF] mb-6">Combined revenue from all institutions</p>
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <p className="text-3xl font-extrabold text-[#B8860B]">{platformStats.revenue || '₹74.8L'}</p>
                <p className="text-sm text-[#9CA3AF] mt-1">Total Annual Revenue</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-emerald-400">
                  {platformStats.totalStudents?.toLocaleString() || '1,411'}
                </p>
                <p className="text-sm text-[#9CA3AF] mt-1">Total Students</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#8B3D52]">
                  {platformStats.totalInstitutions || institutions.length}
                </p>
                <p className="text-sm text-[#9CA3AF] mt-1">Active Institutions</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Student Enrollment */}
            <div className="bg-white rounded-2xl border border-[#E8E5E0] p-6">
              <h3 className="text-sm font-bold text-[#1F1F1F] mb-5 font-heading">Student Enrollment</h3>
              <div className="space-y-3">
                {institutions.slice(0, 6).map(inst => {
                  const maxStudents = Math.max(...institutions.map(x => x.students || 0), 1);
                  return (
                    <div key={inst.id} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium text-[#6B6B6B] truncate shrink-0">{inst.name?.split(' ')[0]}</div>
                      <div className="flex-1 h-7 bg-[#F5F2EE] rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#6B2D3E] to-[#8B3D52] rounded-lg flex items-center justify-end px-2 transition-all"
                          style={{ width: `${Math.max(((inst.students || 0) / maxStudents) * 100, 15)}%` }}
                        >
                          <span className="text-xs font-bold text-white">{inst.students || 0}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Plan Distribution */}
            <div className="bg-white rounded-2xl border border-[#E8E5E0] p-6">
              <h3 className="text-sm font-bold text-[#1F1F1F] mb-5 font-heading">Plan Distribution</h3>
              <div className="space-y-4">
                {['Premium', 'Basic', 'Free'].map(plan => {
                  const count = planDistribution[plan] || 0;
                  const pct = Math.round((count / totalInsts) * 100);
                  return (
                    <div key={plan} className="flex items-center gap-4">
                      <div className="w-20 text-sm font-semibold text-[#1F1F1F]">{plan}</div>
                      <div className="flex-1 h-8 bg-[#F5F2EE] rounded-lg overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${planColors[plan]} rounded-lg flex items-center px-3 transition-all`}
                          style={{ width: `${Math.max(pct, 10)}%` }}
                        >
                          <span className="text-xs font-bold text-white">{count} institutions</span>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-[#6B6B6B] w-10 text-right">{pct}%</span>
                    </div>
                  );
                })}
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
            { plan: 'Free', price: '₹0', features: ['Up to 50 students', 'Basic Academic Module', 'Community Support'], card: 'bg-white border border-[#E8E5E0]', popular: false },
            { plan: 'Basic', price: '₹4,999/mo', features: ['Up to 500 students', 'All Core Modules', 'Email Support', 'Library Access'], card: 'bg-white border border-[#6B2D3E]/30 ring-2 ring-[#6B2D3E]', popular: true },
            { plan: 'Premium', price: '₹14,999/mo', features: ['Unlimited Students', 'All Modules + AI', 'Priority Support', 'Custom Branding', 'Advanced Analytics'], card: 'bg-white border border-[#B8860B]/30', popular: false },
          ].map((p, i) => (
            <div key={i} className={`rounded-2xl border p-6 ${p.card} flex flex-col ${p.popular ? 'shadow-lg shadow-[#6B2D3E]/10' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-[#1F1F1F] font-heading">{p.plan}</h4>
                {p.popular && (
                  <span className="text-[10px] font-bold text-[#6B2D3E] bg-[#6B2D3E]/10 px-2 py-0.5 rounded-md uppercase tracking-wider">Popular</span>
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
          {/* Security Status */}
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

          {/* Audit Log */}
          <div className="bg-white rounded-2xl border border-[#E8E5E0] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#E8E5E0] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1F1F1F] font-heading">Audit Log</h3>
                <p className="text-xs text-[#6B6B6B] mt-0.5">Recent activity across the platform</p>
              </div>
              <button onClick={fetchAuditLogs} className={btnIcon} title="Refresh">
                <RefreshCw className={`h-4 w-4 text-[#9CA3AF] ${loadingLogs ? 'animate-spin' : ''}`} />
              </button>
            </div>
            {loadingLogs ? (
              <LoadingState message="Loading audit logs..." />
            ) : (
              <div className="divide-y divide-[#E8E5E0]">
                {auditLogs.length === 0 ? (
                  <div className="px-6 py-12 text-center text-sm text-[#9CA3AF]">No audit logs available.</div>
                ) : (
                  auditLogs.map((log, i) => {
                    const logType = log.type || (log.action?.toLowerCase().includes('create') ? 'create' : log.action?.toLowerCase().includes('suspend') ? 'security' : 'update');
                    const dotColor =
                      logType === 'security' ? 'bg-red-500' :
                      logType === 'create' ? 'bg-emerald-500' :
                      logType === 'update' ? 'bg-[#6B2D3E]' : 'bg-[#9CA3AF]';
                    const ringColor =
                      logType === 'security' ? 'ring-red-500/20' :
                      logType === 'create' ? 'ring-emerald-500/20' :
                      logType === 'update' ? 'ring-[#6B2D3E]/20' : 'ring-[#9CA3AF]/20';
                    const time = log.time || log.created_at || '—';
                    const userName = log.user_name || log.user || 'Unknown';
                    const target = log.target || log.entity || '';

                    return (
                      <div key={i} className="flex items-center gap-4 px-6 py-3.5 hover:bg-[#FAFAF7] transition-colors">
                        <div className={`w-2.5 h-2.5 rounded-full ${dotColor} ring-4 ${ringColor} shrink-0`} />
                        <span className="text-xs text-[#9CA3AF] font-mono w-36 shrink-0">{time}</span>
                        <span className="text-sm font-semibold text-[#1F1F1F] w-36 truncate shrink-0">{userName}</span>
                        <span className="text-sm text-[#6B6B6B] flex-1 min-w-0">{log.action}</span>
                        <span className="text-xs text-[#6B6B6B] shrink-0">{target}</span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          TAB 7 — System Settings
          ════════════════════════════════════════════════ */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-[#E8E5E0] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#E8E5E0] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#1F1F1F] font-heading">Platform Settings</h3>
              <p className="text-xs text-[#6B6B6B] mt-0.5">Configure global platform behavior</p>
            </div>
            <button onClick={fetchSettings} className={btnIcon} title="Refresh">
              <RefreshCw className={`h-4 w-4 text-[#9CA3AF] ${loadingSettings ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="divide-y divide-[#E8E5E0]">
            {platformSettings.map((s, i) => (
              <div key={s.key || i} className="flex items-center justify-between px-6 py-4 hover:bg-[#FAFAF7] transition-colors">
                <div>
                  <p className="text-sm font-semibold text-[#1F1F1F]">{s.label}</p>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">{s.desc}</p>
                </div>
                <button
                  onClick={() => handleToggleSetting(s)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ml-4"
                  style={{ backgroundColor: s.enabled ? '#6B2D3E' : '#E8E5E0' }}
                >
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
        <AddInstitutionModal
          onSubmit={handleCreateInstitution}
          onClose={() => setShowAddModal(false)}
          submitting={submittingAdd}
        />
      )}

      {/* ════════════════════════════════════════════════
          INSTITUTION PROFILE MODAL
          ════════════════════════════════════════════════ */}
      {loadingProfile ? (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
          <LoadingState message="Loading institution profile..." />
        </div>
      ) : profileInstitution ? (
        <InstitutionProfileModal
          institution={profileInstitution}
          editMode={profileEditMode}
          onClose={() => setProfileInstitution(null)}
          onSave={handleSaveInstitution}
          onEdit={() => setProfileEditMode(true)}
        />
      ) : null}
    </div>
  );
}
