import { useState, useEffect, useCallback } from 'react';
import {
  User, Mail, Phone, Shield, Building2, Calendar, Church, BookOpen,
  Eye, EyeOff, Lock, Save, X, CheckCircle, AlertCircle, Loader2, Heart, Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCurrentUser, updateProfile, changePassword } from '../../utils/api';

/* ================================================================
   Types
   ================================================================ */

interface UserProfile {
  fullName: string;
  displayName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  churchName: string;
  pastorName: string;
  yearsInMinistry: string;
  statementOfFaith: string;
  role: string;
  institution: string;
  createdAt: string;
  lastLoginAt: string;
}

interface Notification {
  id: number;
  type: 'success' | 'error';
  message: string;
}

/* ================================================================
   Toast — Simple inline auto-dismissing notification
   ================================================================ */

function Toast({ notification, onDismiss }: { notification: Notification; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(notification.id), 4000);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  const isSuccess = notification.type === 'success';

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-fade-in ${
        isSuccess
          ? 'bg-[#2D6A4F]/95 text-white border-[#2D6A4F]'
          : 'bg-[#6B2D3E]/95 text-white border-[#6B2D3E]'
      }`}
    >
      {isSuccess ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
      <span className="text-sm font-medium">{notification.message}</span>
      <button
        onClick={() => onDismiss(notification.id)}
        className="ml-auto hover:bg-white/20 rounded-lg p-0.5 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ================================================================
   Section Card wrapper
   ================================================================ */

function SectionCard({
  title,
  icon: Icon,
  iconBg,
  children,
}: {
  title: string;
  icon: typeof User;
  iconBg: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E5E0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${iconBg}`}>
          <Icon className="h-4.5 w-4.5 text-white" />
        </div>
        <h2 className="text-base font-heading font-semibold text-[#1F1F1F]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ================================================================
   Form Field (editable or display)
   ================================================================ */

function FormField({
  label,
  value,
  onChange,
  editMode,
  type = 'text',
  readOnly = false,
  icon: Icon,
  placeholder = '',
  textarea = false,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  editMode?: boolean;
  type?: string;
  readOnly?: boolean;
  icon?: typeof User;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-[#6B6B6B]">
        {Icon && <Icon className="h-3.5 w-3.5 text-[#9CA3AF]" />}
        {label}
      </label>
      {editMode && !readOnly ? (
        textarea ? (
          <textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-[#E8E5E0] text-sm text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#B8860B]/30 focus:border-[#B8860B] transition-all resize-none bg-[#FAFAF7]"
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 rounded-xl border border-[#E8E5E0] text-sm text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#B8860B]/30 focus:border-[#B8860B] transition-all bg-[#FAFAF7]"
          />
        )
      ) : (
        <div className="px-3 py-2 rounded-xl bg-[#FAFAF7] border border-[#F5F2EE] text-sm text-[#1F1F1F] min-h-[2.5rem] flex items-center">
          {value || <span className="text-[#C4BFB8]">Not set</span>}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   Main ProfilePage Component
   ================================================================ */

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

export default function ProfilePage() {
  const { user } = useAuth();

  // ── State ──────────────────────────────────────────────────────
  const [profile, setProfile] = useState<UserProfile>({
    fullName: '',
    displayName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    churchName: '',
    pastorName: '',
    yearsInMinistry: '',
    statementOfFaith: '',
    role: '',
    institution: '',
    createdAt: '',
    lastLoginAt: '',
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Password state
  const [pwFields, setPwFields] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // ── Notification helpers ───────────────────────────────────────
  const notify = useCallback((type: 'success' | 'error', message: string) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismissNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // ── Fetch user profile ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      setLoading(true);
      try {
        const data = await getCurrentUser();
        if (cancelled) return;

        // Map API response to local state — API returns `user` object
        const u = data.user ?? data;
        setProfile({
          fullName: u.fullName || '',
          displayName: u.displayName || '',
          email: u.email || user?.username || '',
          phone: u.phone || '',
          gender: u.gender || '',
          dateOfBirth: u.dateOfBirth || '',
          churchName: u.churchName || '',
          pastorName: u.pastorName || '',
          yearsInMinistry: u.yearsInMinistry || '',
          statementOfFaith: u.statementOfFaith || '',
          role: u.role === 'institution_admin' ? 'Admin' : u.role || user?.role || '',
          institution:
            u.institution?.name ||
            u.institution?.display_name ||
            user?.tenantDbName ||
            '',
          createdAt: u.createdAt || u.created_at || '',
          lastLoginAt: u.lastLoginAt || u.last_login_at || '',
        });
      } catch {
        // Fallback to auth context data
        if (!cancelled) {
          setProfile((prev) => ({
            ...prev,
            displayName: user?.displayName || prev.displayName || '',
            email: user?.username || prev.email || '',
            role: user?.role === 'admin' ? 'Admin' : user?.role || prev.role,
          }));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // ── Profile field updater ──────────────────────────────────────
  const updateField = useCallback(<K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Save profile ───────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        fullName: profile.fullName,
        displayName: profile.displayName,
        phone: profile.phone,
        gender: profile.gender,
        dateOfBirth: profile.dateOfBirth,
        churchName: profile.churchName,
        pastorName: profile.pastorName,
        yearsInMinistry: profile.yearsInMinistry,
        statementOfFaith: profile.statementOfFaith,
      });
      setEditMode(false);
      notify('success', 'Profile updated successfully');
    } catch (err: any) {
      notify('error', err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ────────────────────────────────────────────
  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = pwFields;

    if (!currentPassword) {
      notify('error', 'Please enter your current password');
      return;
    }
    if (newPassword.length < 8) {
      notify('error', 'New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      notify('error', 'New password and confirmation do not match');
      return;
    }
    if (currentPassword === newPassword) {
      notify('error', 'New password must be different from current password');
      return;
    }

    setChangingPw(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPwFields({ currentPassword: '', newPassword: '', confirmPassword: '' });
      notify('success', 'Password changed successfully');
    } catch (err: any) {
      notify('error', err?.message || 'Failed to change password');
    } finally {
      setChangingPw(false);
    }
  };

  // ── Derived values ─────────────────────────────────────────────
  const displayName = profile.displayName || profile.fullName || user?.displayName || 'Admin User';
  const displayEmail = profile.email || user?.username || '';
  const displayRole = profile.role || (user?.role === 'admin' ? 'Admin' : user?.role || 'Admin');
  const displayInstitution = profile.institution || user?.tenantDbName || '—';
  const avatarLetter = (displayName || 'A').charAt(0).toUpperCase();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // ── Loading skeleton ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
        {/* Skeleton header */}
        <div className="bg-white rounded-2xl border border-[#E8E5E0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-[#E8E5E0] animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-48 rounded-lg bg-[#E8E5E0] animate-pulse" />
              <div className="h-4 w-64 rounded-lg bg-[#F5F2EE] animate-pulse" />
              <div className="h-4 w-32 rounded-lg bg-[#F5F2EE] animate-pulse" />
            </div>
          </div>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E8E5E0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
            <div className="h-5 w-40 rounded-lg bg-[#E8E5E0] animate-pulse mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="space-y-2">
                  <div className="h-3 w-20 rounded bg-[#F5F2EE] animate-pulse" />
                  <div className="h-10 rounded-xl bg-[#F5F2EE] animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto relative">
      {/* Background decoration */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-[#6B2D3E]/5 to-[#B8860B]/8 rounded-full blur-3xl opacity-60 pointer-events-none" />

      {/* Toast notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm">
          {notifications.map((n) => (
            <Toast key={n.id} notification={n} onDismiss={dismissNotification} />
          ))}
        </div>
      )}

      {/* Page header */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-[#6B2D3E] flex items-center justify-center shadow-sm shadow-[#6B2D3E]/20">
            <User className="h-4.5 w-4.5 text-white" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-[#1F1F1F] tracking-tight">
            My Profile
          </h1>
        </div>
        <p className="text-[#6B6B6B] text-sm ml-12">
          Manage your personal information and account settings
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          1. Profile Header Card
         ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-[#E8E5E0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] relative overflow-hidden">
        {/* Decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6B2D3E] via-[#B8860B] to-[#6B2D3E]" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pt-2">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6B2D3E] to-[#8B4058] flex items-center justify-center shadow-lg shadow-[#6B2D3E]/20 ring-4 ring-[#6B2D3E]/10 shrink-0">
            <span className="text-2xl font-bold text-white font-heading">{avatarLetter}</span>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <h2 className="text-xl font-heading font-bold text-[#1F1F1F] truncate">
              {displayName}
            </h2>
            <p className="text-sm text-[#6B6B6B] mt-0.5 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate">{displayEmail}</span>
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#6B2D3E]/8 text-[#6B2D3E] ring-1 ring-inset ring-[#6B2D3E]/20">
                <Shield className="h-3 w-3" />
                {displayRole}
              </span>
              {displayInstitution && displayInstitution !== '—' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#B8860B]/8 text-[#8B6914] ring-1 ring-inset ring-[#B8860B]/20">
                  <Building2 className="h-3 w-3" />
                  {displayInstitution}
                </span>
              )}
            </div>
          </div>

          {/* Edit button */}
          <div className="shrink-0">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6B2D3E] text-white text-sm font-semibold shadow-sm shadow-[#6B2D3E]/20 hover:bg-[#7D3850] active:scale-[0.98] transition-all duration-150"
              >
                <User className="h-4 w-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-sm font-semibold shadow-sm shadow-[#2D6A4F]/20 hover:bg-[#357D5C] active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#F5F2EE] text-[#6B6B6B] text-sm font-semibold hover:bg-[#E8E5E0] active:scale-[0.98] transition-all duration-150 disabled:opacity-60"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two-column grid for main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ═══════════════════════════════════════════════════════════
            2. Personal Information Section
           ═══════════════════════════════════════════════════════════ */}
        <SectionCard title="Personal Information" icon={User} iconBg="bg-[#6B2D3E]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Full Name"
              value={profile.fullName}
              onChange={(v) => updateField('fullName', v)}
              editMode={editMode}
              icon={User}
              placeholder="Dr. / Rev. / Prof."
            />
            <FormField
              label="Display Name"
              value={profile.displayName}
              onChange={(v) => updateField('displayName', v)}
              editMode={editMode}
              icon={User}
              placeholder="Preferred display name"
            />
            <FormField
              label="Email"
              value={profile.email}
              editMode={false}
              readOnly
              icon={Mail}
            />
            <FormField
              label="Phone"
              value={profile.phone}
              onChange={(v) => updateField('phone', v)}
              editMode={editMode}
              type="tel"
              icon={Phone}
              placeholder="+1 (555) 000-0000"
            />
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-[#6B6B6B]">
                <User className="h-3.5 w-3.5 text-[#9CA3AF]" />
                Gender
              </label>
              {editMode ? (
                <div className="flex gap-2">
                  {GENDER_OPTIONS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => updateField('gender', g)}
                      className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition-all duration-150 ${
                        profile.gender === g
                          ? 'bg-[#6B2D3E] text-white border-[#6B2D3E] shadow-sm shadow-[#6B2D3E]/20'
                          : 'bg-[#FAFAF7] text-[#6B6B6B] border-[#E8E5E0] hover:border-[#6B2D3E]/40 hover:bg-[#6B2D3E]/5'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-2 rounded-xl bg-[#FAFAF7] border border-[#F5F2EE] text-sm text-[#1F1F1F] min-h-[2.5rem] flex items-center">
                  {profile.gender || <span className="text-[#C4BFB8]">Not set</span>}
                </div>
              )}
            </div>
            <FormField
              label="Date of Birth"
              value={profile.dateOfBirth}
              onChange={(v) => updateField('dateOfBirth', v)}
              editMode={editMode}
              type="date"
              icon={Calendar}
            />
          </div>
        </SectionCard>

        {/* ═══════════════════════════════════════════════════════════
            3. Spiritual Profile Section
           ═══════════════════════════════════════════════════════════ */}
        <SectionCard title="Spiritual Profile" icon={Heart} iconBg="bg-[#B8860B]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Church Name"
              value={profile.churchName}
              onChange={(v) => updateField('churchName', v)}
              editMode={editMode}
              icon={Church}
              placeholder="Home church"
            />
            <FormField
              label="Pastor Name"
              value={profile.pastorName}
              onChange={(v) => updateField('pastorName', v)}
              editMode={editMode}
              icon={BookOpen}
              placeholder="Spiritual mentor"
            />
            <FormField
              label="Years in Ministry"
              value={profile.yearsInMinistry}
              onChange={(v) => updateField('yearsInMinistry', v)}
              editMode={editMode}
              type="number"
              icon={Calendar}
              placeholder="e.g., 15"
            />
            <div className="sm:col-span-2">
              <FormField
                label="Statement of Faith"
                value={profile.statementOfFaith}
                onChange={(v) => updateField('statementOfFaith', v)}
                editMode={editMode}
                icon={BookOpen}
                placeholder="Share your statement of faith and theological convictions..."
                textarea
              />
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ═══════════════════════════════════════════════════════════
            4. Change Password Section
           ═══════════════════════════════════════════════════════════ */}
        <SectionCard title="Change Password" icon={Lock} iconBg="bg-[#1A1F36]">
          <div className="space-y-4">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-[#6B6B6B]">
                <Lock className="h-3.5 w-3.5 text-[#9CA3AF]" />
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={pwFields.currentPassword}
                  onChange={(e) => setPwFields((p) => ({ ...p, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 pr-10 rounded-xl border border-[#E8E5E0] text-sm text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#B8860B]/30 focus:border-[#B8860B] transition-all bg-[#FAFAF7]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw((p) => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B6B6B] transition-colors"
                >
                  {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-[#6B6B6B]">
                <Lock className="h-3.5 w-3.5 text-[#9CA3AF]" />
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={pwFields.newPassword}
                  onChange={(e) => setPwFields((p) => ({ ...p, newPassword: e.target.value }))}
                  placeholder="Enter new password (min. 8 characters)"
                  className="w-full px-3 py-2 pr-10 rounded-xl border border-[#E8E5E0] text-sm text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#B8860B]/30 focus:border-[#B8860B] transition-all bg-[#FAFAF7]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw((p) => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B6B6B] transition-colors"
                >
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-[#6B6B6B]">
                <Lock className="h-3.5 w-3.5 text-[#9CA3AF]" />
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  value={pwFields.confirmPassword}
                  onChange={(e) => setPwFields((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Re-enter new password"
                  className={`w-full px-3 py-2 pr-10 rounded-xl border text-sm text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#B8860B]/30 focus:border-[#B8860B] transition-all bg-[#FAFAF7] ${
                    pwFields.confirmPassword && pwFields.confirmPassword !== pwFields.newPassword
                      ? 'border-red-300 focus:ring-red-500/30 focus:border-red-500'
                      : 'border-[#E8E5E0]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw((p) => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B6B6B] transition-colors"
                >
                  {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {pwFields.confirmPassword && pwFields.confirmPassword !== pwFields.newPassword && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              onClick={handleChangePassword}
              disabled={changingPw || !pwFields.currentPassword || !pwFields.newPassword || !pwFields.confirmPassword}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A1F36] text-white text-sm font-semibold shadow-sm hover:bg-[#252B45] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {changingPw ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {changingPw ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        </SectionCard>

        {/* ═══════════════════════════════════════════════════════════
            5. Account Info Section (read-only)
           ═══════════════════════════════════════════════════════════ */}
        <SectionCard title="Account Information" icon={Shield} iconBg="bg-[#2D6A4F]">
          <div className="space-y-0">
            {[
              { label: 'Role', value: displayRole, icon: Shield },
              { label: 'Institution', value: displayInstitution, icon: Building2 },
              { label: 'Member Since', value: formatDate(profile.createdAt), icon: Calendar },
              { label: 'Last Login', value: formatDate(profile.lastLoginAt), icon: Clock },
            ].map((item) => (
              <div key={item.label} className="py-3.5 border-b border-[#F5F2EE] last:border-0">
                <p className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <item.icon className="h-3 w-3" />
                  {item.label}
                </p>
                <p className="text-sm text-[#1F1F1F] mt-1 font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
