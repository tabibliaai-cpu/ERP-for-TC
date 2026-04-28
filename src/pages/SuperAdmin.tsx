import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Building2, Users, Activity, Trash2, Plus, Save, Search,
  Globe, ChevronRight, Database, ExternalLink, Mail, Copy, CheckCircle,
  AlertCircle, Eye, EyeOff, RefreshCw, X, Key, TrendingUp, DollarSign,
  Lock, Unlock, Bell, Settings, BarChart3, ToggleLeft, ToggleRight,
  Megaphone, FileText, Shield, Zap, Crown, Sparkles, ChevronDown, Filter,
  Calendar, Clock, UserCheck, UserX, Power, Globe2, Layers, BookOpen,
  Heart, MessageSquare, Presentation, KeyRound, GraduationCap, Brain, HardDrive,
  ArrowLeftRight, Wifi, WifiOff, StopCircle
} from 'lucide-react';
import { RolesPermissionsTab } from './superadmin/RolesPermissionsTab';
import { AcademicsControlTab } from './superadmin/AcademicsControlTab';
import { AICenterTab } from './superadmin/AICenterTab';
import { BackupRecoveryTab } from './superadmin/BackupRecoveryTab';
import { motion } from 'motion/react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, setDoc, query, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { superAdminService } from '../services/dataService';
import type { PlatformSubscription, FeatureFlag, PlatformAnnouncement, PlatformAuditLog, PlatformStats } from '../services/dataService';
import { cn } from '../lib/utils';
import { institutionService, impersonationService, auditLogService } from '../services/institutionService';
import type { ImpersonationToken } from '../services/institutionService';
import { useAppStore, useAuthStore } from '../store/useStore';

// ─── Firebase secondary app for creating users without signing out super admin ───
const SECONDARY_APP_NAME = 'secondary-app';

function getSecondaryApp() {
  const existing = getApps().find(a => a.name === SECONDARY_APP_NAME);
  if (existing) return existing;
  const primaryApp = getApps()[0];
  if (!primaryApp) throw new Error('No Firebase app initialized');
  return initializeApp((primaryApp as any).options, SECONDARY_APP_NAME);
}

function generatePassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '@#$!';
  const all = upper + lower + digits + special;
  let pwd = '';
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += digits[Math.floor(Math.random() * digits.length)];
  pwd += special[Math.floor(Math.random() * special.length)];
  for (let i = 4; i < 10; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
}

// ─── Interfaces ───
interface Institution {
  id: string;
  name: string;
  institutionType: string;
  status: 'active' | 'suspended' | 'inactive';
  subdomain?: string;
  customDomain?: string;
  studentCount: number;
  facultyCount: number;
  adminEmail: string;
  logoUrl?: string;
  createdAt: any;
  lastActivity?: any;
  modules: string[];
  tradition?: string;
  userCount?: number;
  location?: string;
  subscriptionPlan?: string;
}

interface TenantAdmin {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

interface ProvisioningResult {
  email: string;
  tempPassword: string;
  institutionName: string;
  isExistingUser?: boolean;
}

// ─── Tab definitions ───
const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'institutions', label: 'Institutions', icon: Building2 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'roles', label: 'Roles', icon: KeyRound },
  { id: 'academics', label: 'Academics', icon: GraduationCap },
  { id: 'features', label: 'Features', icon: Layers },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'ai-center', label: 'AI Center', icon: Brain },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'announcements', label: 'Announce', icon: Megaphone },
  { id: 'backup', label: 'Backup', icon: HardDrive },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

type TabId = typeof TABS[number]['id'];

// ─── Loading Spinner ───
function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
      <p className="text-gray-500 font-medium">{text}</p>
    </div>
  );
}

// ─── Success Modal ───
const SuccessModal: React.FC<{
  result: ProvisioningResult;
  onClose: () => void;
}> = ({ result, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(result.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = result.tempPassword;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openMail = () => {
    const subject = encodeURIComponent(`Your ${result.institutionName} Admin Credentials`);
    const body = encodeURIComponent(
      `Hello,\n\nYour administrator access for ${result.institutionName} on CovenantERP has been configured.\n\nLogin URL: https://erp-for-tc.vercel.app\nEmail: ${result.email}\n${result.isExistingUser ? 'Please log in with Google using this email address.' : `Temporary Password: ${result.tempPassword}\n\nPlease log in and change your password immediately.`}\n\nRegards,\nCovenantERP Super Admin`
    );
    window.open(`mailto:${result.email}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{result.isExistingUser ? 'Admin Access Granted!' : 'Admin Account Created!'}</h2>
              <p className="text-green-100 text-sm">{result.isExistingUser ? 'Existing user linked' : 'Provisioning successful'}</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-gray-600 text-sm">
            {result.isExistingUser
              ? 'This email already has an account. They have been granted admin access.'
              : 'Save these credentials — share them securely with the admin.'}
          </p>
          <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</label>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4 text-blue-500" />
                <span className="font-mono text-gray-800 text-sm break-all">{result.email}</span>
              </div>
            </div>
            {!result.isExistingUser && (
              <div className="border-t border-gray-200 pt-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Temporary Password</label>
                <div className="flex items-center gap-2 mt-1">
                  <Key className="w-4 h-4 text-blue-500" />
                  <span className="font-mono text-gray-800 text-sm flex-1">
                    {showPassword ? result.tempPassword : '••••••••••'}
                  </span>
                  <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 transition-colors" title={showPassword ? 'Hide' : 'Show'}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={copyPassword} className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all', copied ? 'bg-green-500 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100')}>
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Password'}
            </button>
            <button onClick={openMail} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-all">
              <Mail className="w-4 h-4" />Open Mail
            </button>
          </div>
          <button onClick={onClose} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors">Done</button>
          <p className="text-xs text-center text-amber-600 bg-amber-50 rounded-lg p-2">⚠ This password will not be shown again. Please save it now.</p>
        </div>
      </div>
    </div>
  );
};

// ─── Empty State Component ───
function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="w-16 h-16 text-gray-300 mb-4" />
      <p className="text-lg font-semibold text-gray-600">{title}</p>
      <p className="text-sm text-gray-400 mt-1 max-w-sm">{description}</p>
    </div>
  );
}

// ─── Glass Card ───
function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white/80 backdrop-blur-xl rounded-lg shadow-lg border border-white/20', className)}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN SUPER ADMIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function SuperAdmin() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // ─── Institutions State ───
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [tenantAdmins, setTenantAdmins] = useState<TenantAdmin[]>([]);
  const [isSavingTenant, setIsSavingTenant] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [showNewAdminPassword, setShowNewAdminPassword] = useState(false);
  const [provisioningResult, setProvisioningResult] = useState<ProvisioningResult | null>(null);
  const [provisionError, setProvisionError] = useState('');
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Users Tab State ───
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersRoleFilter, setUsersRoleFilter] = useState('all');

  // ─── Feature Flags State ───
  const [featureFlags, setFeatureFlags] = useState<any[]>([]);
  const [flagsLoading, setFlagsLoading] = useState(false);
  const [selectedFlagInstitution, setSelectedFlagInstitution] = useState('');
  const [flagOverrides, setFlagOverrides] = useState<Record<string, boolean>>({});
  const [isSavingFlags, setIsSavingFlags] = useState(false);

  // ─── Finance State ───
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);

  // ─── Audit Logs State ───
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logInstitutionFilter, setLogInstitutionFilter] = useState('');
  const [logModuleFilter, setLogModuleFilter] = useState('');
  const [logPage, setLogPage] = useState(1);
  const logsPerPage = 50;

  // ─── Announcements State ───
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [annLoading, setAnnLoading] = useState(false);
  const [isCreatingAnn, setIsCreatingAnn] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: '', content: '', type: 'info' as const, targetInstitutions: [] as string[] });

  // ─── Platform Stats State ───
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);

  // ─── Impersonation State ───
  const [impersonateModalOpen, setImpersonateModalOpen] = useState(false);
  const [impersonateTarget, setImpersonateTarget] = useState<Institution | null>(null);
  const [impersonateReason, setImpersonateReason] = useState('Support troubleshooting');
  const [impersonateTTL, setImpersonateTTL] = useState(2);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [activeTokens, setActiveTokens] = useState<ImpersonationToken[]>([]);
  const [showActiveTokens, setShowActiveTokens] = useState(false);

  // ─── Real-time Sync State ───
  const [isLive, setIsLive] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  const { isImpersonating, impersonationContext, startImpersonation, stopImpersonation, isRealtimeSynced, setRealtimeSynced, setLastSyncTime: setStoreLastSync } = useAppStore();
  const { user } = useAuthStore();

  // ─── New institution form state ───
  const [newInstitution, setNewInstitution] = useState({
    name: '',
    institutionType: 'seminary',
    adminEmail: '',
    adminPassword: '',
    subdomain: '',
    tradition: '',
    location: '',
    modules: ['academics', 'admissions', 'finance'],
  });

  // ─── Data Loading ───
  const loadInstitutions = useCallback(async () => {
    setIsLoading(true);
    try {
      const snap = await getDocs(collection(db, 'institutions'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Institution));
      setInstitutions(data);
    } catch (err) {
      console.error('Error loading institutions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPlatformStats = useCallback(async () => {
    try {
      const stats = await superAdminService.getPlatformStats();
      setPlatformStats(stats);
    } catch (err) {
      console.error('Error loading platform stats:', err);
    }
  }, []);

  useEffect(() => {
    loadInstitutions();
    loadPlatformStats();
  }, [loadInstitutions, loadPlatformStats]);

  // ─── Real-time Sync for Institutions ───
  useEffect(() => {
    const unsubscribe = institutionService.subscribeToInstitutions((data) => {
      setInstitutions(data.map(d => ({
        id: d.id,
        name: d.name,
        institutionType: d.institutionType,
        status: d.status as Institution['status'],
        subdomain: d.subdomain,
        customDomain: d.customDomain,
        studentCount: d.studentCount || 0,
        facultyCount: d.facultyCount || 0,
        adminEmail: d.adminEmail,
        logoUrl: d.logoUrl,
        createdAt: d.createdAt,
        lastActivity: d.lastActivity,
        modules: d.modules || [],
        tradition: d.tradition,
        userCount: d.userCount || 0,
        location: d.location,
        subscriptionPlan: d.subscriptionPlan,
      })));
      setIsLive(true);
      setIsLoading(false);
      const now = Date.now();
      setLastSyncTime(now);
      setStoreLastSync(now);
      setRealtimeSynced(true);
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Impersonation Handlers ───
  const handleOpenImpersonate = (inst: Institution) => {
    setImpersonateTarget(inst);
    setImpersonateReason('Support troubleshooting');
    setImpersonateTTL(2);
    setImpersonateModalOpen(true);
  };

  const handleGenerateImpersonationToken = async () => {
    if (!impersonateTarget || !user) return;
    setIsGeneratingToken(true);
    try {
      const tokenId = await impersonationService.generateToken(
        impersonateTarget.id,
        impersonateTarget.name,
        impersonateTarget.adminEmail,
        user.email || 'super-admin',
        impersonateReason,
        impersonateTTL
      );

      // Validate and start impersonation
      const token = await impersonationService.validateToken(tokenId);
      if (token) {
        startImpersonation({
          institutionId: token.institutionId,
          institutionName: token.institutionName,
          adminEmail: token.adminEmail,
          tokenId: token.id,
          startedAt: Date.now(),
          reason: impersonateReason,
        });

        await auditLogService.logImpersonationAction(
          user.uid, user.email || 'super-admin', 'impersonate_start',
          token.institutionId, token.institutionName, token.id
        );

        setImpersonateModalOpen(false);
        setImpersonateTarget(null);
      }
    } catch (err) {
      console.error('Failed to generate impersonation token:', err);
      alert('Failed to generate impersonation token.');
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleStopImpersonation = async () => {
    if (!impersonationContext || !user) return;
    try {
      await impersonationService.revokeToken(impersonationContext.tokenId);
      await auditLogService.logImpersonationAction(
        user.uid, user.email || 'super-admin', 'impersonate_end',
        impersonationContext.institutionId, impersonationContext.institutionName, impersonationContext.tokenId
      );
    } catch (err) {
      console.error('Failed to revoke token:', err);
    }
    stopImpersonation();
  };

  const loadActiveTokens = async () => {
    try {
      const tokens = await impersonationService.getActiveTokens();
      setActiveTokens(tokens);
      setShowActiveTokens(true);
    } catch (err) {
      console.error('Failed to load active tokens:', err);
    }
  };

  // Load tab-specific data when tab changes
  useEffect(() => {
    if (activeTab === 'users' && allUsers.length === 0) {
      setUsersLoading(true);
      superAdminService.getAllUsers().then(data => { setAllUsers(data); setUsersLoading(false); }).catch(() => setUsersLoading(false));
    }
    if (activeTab === 'features' && featureFlags.length === 0) {
      setFlagsLoading(true);
      superAdminService.getFeatureFlags().then(data => { setFeatureFlags(data); setFlagsLoading(false); }).catch(() => setFlagsLoading(false));
    }
    if (activeTab === 'finance' && subscriptions.length === 0) {
      setSubsLoading(true);
      superAdminService.getAllSubscriptions().then(data => { setSubscriptions(data); setSubsLoading(false); }).catch(() => setSubsLoading(false));
    }
    if (activeTab === 'security' && auditLogs.length === 0) {
      setLogsLoading(true);
      superAdminService.getAuditLogs(500).then(data => { setAuditLogs(data); setLogsLoading(false); }).catch(() => setLogsLoading(false));
    }
    if (activeTab === 'announcements' && announcements.length === 0) {
      setAnnLoading(true);
      superAdminService.getAllAnnouncements().then(data => { setAnnouncements(data); setAnnLoading(false); }).catch(() => setAnnLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ─── Institution CRUD ───
  const loadTenantAdmins = async (institutionId: string) => {
    try {
      const q = query(collection(db, 'users'), where('institutionId', '==', institutionId), where('role', '==', 'admin'));
      const snap = await getDocs(q);
      setTenantAdmins(snap.docs.map(d => ({ id: d.id, ...d.data() } as TenantAdmin)));
    } catch (err) {
      console.error('Error loading admins:', err);
    }
  };

  const handleSelectInstitution = (inst: Institution) => {
    setSelectedInstitution(inst);
    setIsEditModalOpen(true);
    loadTenantAdmins(inst.id);
    setNewAdminEmail('');
    setNewAdminPassword(generatePassword());
    setProvisionError('');
    setProvisioningResult(null);
  };

  const handleProvisionAdmin = async () => {
    if (!selectedInstitution) return;
    if (!newAdminEmail.trim()) { setProvisionError('Please enter an admin email address.'); return; }
    if (!newAdminPassword.trim() || newAdminPassword.length < 8) { setProvisionError('Password must be at least 8 characters.'); return; }

    setIsProvisioning(true);
    setProvisionError('');

    try {
      let secondaryApp;
      try { secondaryApp = getSecondaryApp(); } catch { secondaryApp = null; }

      let uid: string | null = null;
      if (secondaryApp) {
        const secondaryAuth = getAuth(secondaryApp);
        const userCred = await createUserWithEmailAndPassword(secondaryAuth, newAdminEmail.trim(), newAdminPassword);
        uid = userCred.user.uid;
        await secondaryAuth.signOut();
      } else {
        uid = `manual_${Date.now()}`;
      }

      await setDoc(doc(db, 'users', uid || newAdminEmail.trim()), {
        email: newAdminEmail.trim(), displayName: newAdminEmail.trim().split('@')[0], role: 'admin',
        institutionId: selectedInstitution.id, institutionName: selectedInstitution.name,
        createdAt: serverTimestamp(), status: 'active', mustChangePassword: true,
      });

      await updateDoc(doc(db, 'institutions', selectedInstitution.id), { adminEmail: newAdminEmail.trim(), lastActivity: serverTimestamp() });

      setProvisioningResult({ email: newAdminEmail.trim(), tempPassword: newAdminPassword, institutionName: selectedInstitution.name });
      await loadTenantAdmins(selectedInstitution.id);
      await loadInstitutions();
      setNewAdminEmail('');
      setNewAdminPassword(generatePassword());
    } catch (err: any) {
      console.error('Provisioning error:', err);
      if (err.code === 'auth/email-already-in-use') { setProvisionError('This email is already registered.'); }
      else if (err.code === 'auth/invalid-email') { setProvisionError('Invalid email address format.'); }
      else if (err.code === 'auth/weak-password') { setProvisionError('Password is too weak.'); }
      else {
        try {
          const fallbackId = `fallback_${Date.now()}`;
          await setDoc(doc(db, 'users', fallbackId), {
            email: newAdminEmail.trim(), displayName: newAdminEmail.trim().split('@')[0], role: 'admin',
            institutionId: selectedInstitution!.id, institutionName: selectedInstitution!.name,
            createdAt: serverTimestamp(), status: 'pending_auth', mustChangePassword: true, manualPassword: newAdminPassword,
          });
          setProvisioningResult({ email: newAdminEmail.trim(), tempPassword: newAdminPassword, institutionName: selectedInstitution!.name });
          await loadTenantAdmins(selectedInstitution!.id);
          setNewAdminEmail(''); setNewAdminPassword(generatePassword());
        } catch { setProvisionError(`Failed: ${err.message || 'Unknown error'}`); }
      }
    } finally { setIsProvisioning(false); }
  };

  const handleDeleteAdmin = async (adminId: string, adminEmail: string) => {
    if (!window.confirm('Remove this admin?')) return;
    try {
      await deleteDoc(doc(db, 'users', adminId));
      if (selectedInstitution) {
        if (selectedInstitution.adminEmail === adminEmail) {
          await updateDoc(doc(db, 'institutions', selectedInstitution.id), { adminEmail: '', lastActivity: serverTimestamp() });
          setSelectedInstitution({ ...selectedInstitution, adminEmail: '' });
          await loadInstitutions();
        }
        await loadTenantAdmins(selectedInstitution.id);
      }
    } catch (err) { console.error('Error deleting admin:', err); }
  };

  const handleAddInstitution = async () => {
    if (!newInstitution.name.trim() || !newInstitution.adminEmail.trim()) { alert('Institution name and admin email are required.'); return; }
    const adminPass = newInstitution.adminPassword || generatePassword();
    setIsSavingTenant(true);
    try {
      const { adminPassword, ...instData } = newInstitution;
      const docRef = await addDoc(collection(db, 'institutions'), {
        ...instData, status: 'active', studentCount: 0, facultyCount: 0, userCount: 0,
        createdAt: serverTimestamp(), lastActivity: serverTimestamp(),
      });

      let secondaryApp;
      try { secondaryApp = getSecondaryApp(); } catch { secondaryApp = null; }
      let uid: string | null = null;
      let alreadyExists = false;
      if (secondaryApp) {
        try {
          const secondaryAuth = getAuth(secondaryApp);
          const userCred = await createUserWithEmailAndPassword(secondaryAuth, newInstitution.adminEmail.trim(), adminPass);
          uid = userCred.user.uid;
          await secondaryAuth.signOut();
        } catch (authErr: any) {
          if (authErr.code === 'auth/email-already-in-use') { uid = newInstitution.adminEmail.trim(); alreadyExists = true; } else { throw authErr; }
        }
      } else { uid = `manual_${Date.now()}`; }

      await setDoc(doc(db, 'users', uid || newInstitution.adminEmail.trim()), {
        email: newInstitution.adminEmail.trim(), displayName: newInstitution.adminEmail.trim().split('@')[0], role: 'admin',
        institutionId: docRef.id, institutionName: newInstitution.name,
        createdAt: serverTimestamp(), status: 'active', mustChangePassword: !alreadyExists,
      });

      setProvisioningResult({ email: newInstitution.adminEmail.trim(), tempPassword: alreadyExists ? 'User already has an account.' : adminPass, institutionName: newInstitution.name, isExistingUser: alreadyExists });
      await loadInstitutions();
      setIsAddModalOpen(false);
      setNewInstitution({ name: '', institutionType: 'seminary', adminEmail: '', adminPassword: '', subdomain: '', tradition: '', location: '', modules: ['academics', 'admissions', 'finance'] });
    } catch (err: any) { console.error('Error adding institution:', err); alert('Failed to add institution.'); }
    finally { setIsSavingTenant(false); }
  };

  const handleDeleteInstitution = async (id: string) => {
    if (!window.confirm('Delete this institution? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'institutions', id));
      await loadInstitutions();
      if (selectedInstitution?.id === id) { setIsEditModalOpen(false); setSelectedInstitution(null); }
    } catch (err) { console.error('Error deleting institution:', err); }
  };

  const handleUpdateStatus = async (id: string, status: Institution['status']) => {
    try {
      await updateDoc(doc(db, 'institutions', id), { status, lastActivity: serverTimestamp() });
      await loadInstitutions();
    } catch (err) { console.error('Error updating status:', err); }
  };

  const filteredInstitutions = institutions.filter(i =>
    i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.adminEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Feature Flags Helpers ───
  const availableModules = superAdminService.getAvailableModules();
  const subscriptionPlans = superAdminService.getSubscriptionPlans();

  const handleToggleFlag = (module: string) => {
    setFlagOverrides(prev => ({ ...prev, [module]: !prev[module] }));
  };

  const handleSaveFlags = async () => {
    if (!selectedFlagInstitution) { alert('Select an institution first.'); return; }
    setIsSavingFlags(true);
    try {
      await superAdminService.batchSetFeatureFlags(selectedFlagInstitution, flagOverrides);
      const fresh = await superAdminService.getFeatureFlags(selectedFlagInstitution);
      setFeatureFlags(fresh);
      setFlagOverrides({});
    } catch (err) { console.error('Error saving flags:', err); }
    setIsSavingFlags(false);
  };

  const getInstitutionFlags = (instId: string): Record<string, boolean> => {
    const result: Record<string, boolean> = {};
    featureFlags.filter(f => f.institutionId === instId).forEach(f => { result[f.module] = f.enabled; });
    return result;
  };

  // ─── Subscription Plan Info ───
  const totalMRR = subscriptions.filter(s => s.status === 'active').reduce((sum: number, s: any) => sum + (s.monthlyPrice || 0), 0);

  // ─── Audit Logs Helpers ───
  const filteredLogs = auditLogs.filter((log: any) => {
    if (logInstitutionFilter && log.institutionId !== logInstitutionFilter) return false;
    if (logModuleFilter && log.module !== logModuleFilter) return false;
    return true;
  });

  const paginatedLogs = filteredLogs.slice((logPage - 1) * logsPerPage, logPage * logsPerPage);
  const totalLogPages = Math.ceil(filteredLogs.length / logsPerPage);

  const getActionColor = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes('create') || a.includes('add')) return 'bg-emerald-100 text-emerald-700';
    if (a.includes('update') || a.includes('edit') || a.includes('change')) return 'bg-blue-100 text-blue-700';
    if (a.includes('delete') || a.includes('remove')) return 'bg-rose-100 text-rose-700';
    if (a.includes('login') || a.includes('auth')) return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      {/* ─── Header ─── */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-700 rounded-xl p-2.5 shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-700">
                Super Admin
              </h1>
              <p className="text-xs text-gray-500">Platform Operating System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadActiveTokens}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all text-sm"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Tokens
            </button>
            <button
              onClick={() => { setIsAddModalOpen(true); setActiveTab('institutions'); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Institution
            </button>
            {/* Real-time Sync Indicator */}
            <div className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium', isLive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500')}>
              {isLive ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isLive ? 'Live Sync' : 'Offline'}
              {lastSyncTime && <span className="text-[10px] opacity-70">{new Date(lastSyncTime).toLocaleTimeString()}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Impersonation Banner ─── */}
      {isImpersonating && impersonationContext && (
        <div className="bg-amber-500 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 rounded-full p-1.5">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sm">Impersonation Mode Active</p>
              <p className="text-amber-100 text-xs">
                Viewing as <span className="font-semibold">{impersonationContext.institutionName}</span> ({impersonationContext.adminEmail})
                {impersonationContext.reason && <> — {impersonationContext.reason}</>}
              </p>
            </div>
          </div>
          <button
            onClick={handleStopImpersonation}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors"
          >
            <StopCircle className="w-4 h-4" />
            Exit Impersonation
          </button>
        </div>
      )}

      {/* ─── Pill Tab Navigation ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 hover:border-blue-200 hover:text-blue-600'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Tab Content ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-4 py-3">

        {/* ═══════════════════════════════════════════════════════════
            TAB 1: OVERVIEW
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-lg bg-slate-800 p-8 text-white shadow-md"
              style={{ background: '#1e293b' }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_60%)]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.1),transparent_60%)]"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-8 h-8 text-amber-400" />
                  <h2 className="text-3xl font-bold">Platform Analytics</h2>
                </div>
                <p className="text-indigo-200 max-w-lg">Real-time overview of your entire SaaS platform. Monitor institutions, users, revenue, and system health at a glance.</p>
              </div>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Total Institutions', value: platformStats?.totalInstitutions ?? institutions.length, icon: Building2, color: 'bg-blue-600', shadow: 'shadow-blue-500/20' },
                { label: 'Active Users', value: platformStats?.totalUsers ?? '-', icon: Users, color: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
                { label: 'Monthly Revenue', value: `$${(platformStats?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign, color: 'bg-amber-500', shadow: 'shadow-amber-500/20' },
                { label: 'Total Students', value: platformStats?.totalStudents ?? '-', icon: BookOpen, color: 'bg-sky-500', shadow: 'shadow-sky-500/20' },
                { label: 'Faculty Count', value: platformStats?.totalFaculty ?? '-', icon: Presentation, color: 'bg-rose-500', shadow: 'shadow-rose-500/20' },
                { label: 'System Health', value: '99.9%', icon: Activity, color: 'bg-slate-600', shadow: 'shadow-slate-500/20' },
              ].map((kpi, i) => (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={cn('relative overflow-hidden rounded-lg p-5 text-white shadow-lg', kpi.color, kpi.shadow)}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm font-medium">{kpi.label}</p>
                      <p className="text-3xl font-bold mt-1">{kpi.value}</p>
                    </div>
                    <kpi.icon className="w-10 h-10 text-white/40" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" /> Platform Summary
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Active Institutions', value: platformStats?.activeInstitutions ?? '-', color: 'text-emerald-600' },
                    { label: 'Monthly Active Users', value: platformStats?.monthlyActiveUsers ?? '-', color: 'text-blue-600' },
                    { label: 'Total Announcements', value: platformStats?.totalAnnouncements ?? '-', color: 'text-amber-600' },
                    { label: 'Audit Log Entries', value: platformStats?.totalAuditLogs ?? '-', color: 'text-indigo-600' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-gray-600 text-sm">{item.label}</span>
                      <span className={cn('font-bold text-lg', item.color)}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" /> Subscription Distribution
                </h3>
                <div className="space-y-3">
                  {subscriptionPlans.filter(p => p.id !== 'free').map(plan => {
                    const count = subscriptions.filter((s: any) => s.plan === plan.id && s.status === 'active').length;
                    const pct = subscriptions.length > 0 ? (count / Math.max(subscriptions.length, 1)) * 100 : 0;
                    return (
                      <div key={plan.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{plan.name}</span>
                          <span className="text-gray-500">{count} institutions</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.3, duration: 0.8 }} className="h-full bg-blue-600 rounded-full"></motion.div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB 2: INSTITUTIONS
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'institutions' && (
          <div className="space-y-6">
            {/* Gradient Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total', value: institutions.length, icon: Building2, color: 'bg-blue-600' },
                { label: 'Active', value: institutions.filter(i => i.status === 'active').length, icon: Activity, color: 'bg-emerald-500' },
                { label: 'Students', value: institutions.reduce((s, i) => s + (i.studentCount || 0), 0).toLocaleString(), icon: Users, color: 'bg-sky-500' },
                { label: 'Faculty', value: institutions.reduce((s, i) => s + (i.facultyCount || 0), 0).toLocaleString(), icon: Presentation, color: 'bg-rose-500' },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className={cn('rounded-lg p-4 text-white shadow-lg', s.color)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-xs font-medium">{s.label}</p>
                      <p className="text-2xl font-bold mt-0.5">{s.value}</p>
                    </div>
                    <s.icon className="w-8 h-8 text-white/30" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search institutions by name or admin email..." className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white/80 backdrop-blur focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
            </div>

            {/* Institutions Table */}
            <GlassCard className="overflow-hidden">
              {isLoading ? (
                <LoadingSpinner text="Loading institutions..." />
              ) : filteredInstitutions.length === 0 ? (
                <EmptyState icon={Building2} title="No institutions found" description="Add your first institution to get started." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/80">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Institution</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Plan</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stats</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInstitutions.map((inst) => (
                        <tr key={inst.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-50 rounded-lg p-2">
                                <Building2 className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{inst.name}</div>
                                {inst.location && <div className="text-xs text-gray-400 flex items-center gap-1"><Globe2 className="w-3 h-3" />{inst.location}</div>}
                                {inst.subdomain && <div className="text-xs text-gray-400">{inst.subdomain}.covenant-erp.com</div>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4"><span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">{inst.institutionType}</span></td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              'px-2.5 py-1 rounded-lg text-xs font-semibold',
                              (inst.subscriptionPlan || 'free') === 'enterprise' && 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700',
                              (inst.subscriptionPlan || 'free') === 'premium' && 'bg-blue-50 text-blue-700',
                              (inst.subscriptionPlan || 'free') === 'basic' && 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700',
                              (inst.subscriptionPlan || 'free') === 'free' && 'bg-gray-100 text-gray-600',
                            )}>
                              {inst.subscriptionPlan || 'free'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{inst.studentCount || 0}S / {inst.facultyCount || 0}F</td>
                          <td className="px-6 py-4">
                            <span className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold', inst.status === 'active' && 'bg-emerald-100 text-emerald-700', inst.status === 'suspended' && 'bg-rose-100 text-rose-700', inst.status === 'inactive' && 'bg-gray-100 text-gray-600')}>
                              {inst.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleSelectInstitution(inst)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Manage"><ChevronRight className="w-5 h-5" /></button>
                              <button onClick={() => handleOpenImpersonate(inst)} className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors" title="Impersonate"><Eye className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteInstitution(inst.id)} className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB 3: USERS (GLOBAL)
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-lg bg-blue-700 p-6 text-white shadow-sm" style={{ background: '#1d4ed8' }}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.3),transparent_60%)]"></div>
              <div className="relative z-10 flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-200" />
                <div>
                  <h2 className="text-2xl font-bold">Global User Management</h2>
                  <p className="text-blue-200 text-sm">View and manage all users across every institution</p>
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={usersSearch} onChange={(e) => setUsersSearch(e.target.value)} placeholder="Search users by name, email..." className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white/80 backdrop-blur focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <select value={usersRoleFilter} onChange={(e) => setUsersRoleFilter(e.target.value)} className="px-4 py-3 border border-gray-200 rounded-xl bg-white/80 backdrop-blur focus:ring-2 focus:ring-blue-500 min-w-[160px]">
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="faculty">Faculty</option>
                <option value="teacher">Teachers</option>
                <option value="admin">Admin</option>
                <option value="super-admin">Super Admin</option>
              </select>
            </div>

            <GlassCard className="overflow-hidden">
              {usersLoading ? (
                <LoadingSpinner text="Loading users..." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/80">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Institution</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers
                        .filter(u => {
                          if (usersRoleFilter !== 'all' && u.role !== usersRoleFilter) return false;
                          if (usersSearch) {
                            const q = usersSearch.toLowerCase();
                            return (u.displayName || u.email || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
                          }
                          return true;
                        })
                        .slice(0, 100)
                        .map(user => (
                          <tr key={user.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                  {(user.displayName || user.email || '?')[0].toUpperCase()}
                                </div>
                                <span className="font-medium text-gray-900 text-sm">{user.displayName || user.email?.split('@')[0] || '-'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                'px-2.5 py-1 rounded-lg text-xs font-semibold',
                                user.role === 'super-admin' && 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700',
                                user.role === 'admin' && 'bg-blue-50 text-blue-700',
                                (user.role === 'faculty' || user.role === 'teacher') && 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700',
                                user.role === 'student' && 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700',
                                !['super-admin', 'admin', 'faculty', 'teacher', 'student'].includes(user.role) && 'bg-gray-100 text-gray-600',
                              )}>{user.role || '-'}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{user.institutionName || '-'}</td>
                            <td className="px-6 py-4">
                              <span className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold', user.status === 'active' && 'bg-emerald-100 text-emerald-700', user.status === 'suspended' && 'bg-rose-100 text-rose-700', (!user.status || user.status === 'pending_auth') && 'bg-amber-100 text-amber-700')}>
                                {user.status || 'active'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={async () => {
                                  const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
                                  await superAdminService.updateUser(user.id, { status: newStatus });
                                  setAllUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
                                }}
                                className={cn('p-2 rounded-lg transition-colors', user.status === 'suspended' ? 'text-emerald-600 hover:bg-emerald-100' : 'text-rose-600 hover:bg-rose-100')}
                                title={user.status === 'suspended' ? 'Activate' : 'Suspend'}
                              >
                                {user.status === 'suspended' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {allUsers.length === 0 && <EmptyState icon={Users} title="No users found" description="Users will appear here once institutions onboard." />}
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB 4: FEATURE TOGGLES
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-lg bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #059669, #0d9488, #0e7490)' }}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.3),transparent_60%)]"></div>
              <div className="relative z-10 flex items-center gap-3">
                <Layers className="w-8 h-8 text-emerald-200" />
                <div>
                  <h2 className="text-2xl font-bold">Feature Toggles</h2>
                  <p className="text-emerald-200 text-sm">Control module access per institution. {availableModules.length} modules available.</p>
                </div>
              </div>
            </motion.div>

            {/* Institution Selector */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Institution</label>
                <select value={selectedFlagInstitution} onChange={(e) => { setSelectedFlagInstitution(e.target.value); setFlagOverrides({}); }} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white/80 backdrop-blur focus:ring-2 focus:ring-emerald-500">
                  <option value="">— Choose institution —</option>
                  {institutions.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                </select>
              </div>
              <button
                onClick={async () => {
                  if (!selectedFlagInstitution) return;
                  const flags = getInstitutionFlags(selectedFlagInstitution);
                  const allOn: Record<string, boolean> = {};
                  availableModules.forEach(m => { allOn[m.id] = true; });
                  setFlagOverrides(allOn);
                }}
                disabled={!selectedFlagInstitution}
                className="px-4 py-3 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Enable All
              </button>
              <button
                onClick={async () => {
                  if (!selectedFlagInstitution) return;
                  const allOff: Record<string, boolean> = {};
                  availableModules.forEach(m => { allOff[m.id] = false; });
                  setFlagOverrides(allOff);
                }}
                disabled={!selectedFlagInstitution}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Disable All
              </button>
              <button onClick={handleSaveFlags} disabled={isSavingFlags || !selectedFlagInstitution || Object.keys(flagOverrides).length === 0} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 transition-all">
                <Save className="w-4 h-4" /> {isSavingFlags ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {selectedFlagInstitution ? (
              flagsLoading ? <LoadingSpinner text="Loading feature flags..." /> : (
                <GlassCard className="p-6">
                  <div className="space-y-3">
                    {availableModules.map(mod => {
                      const existingFlags = getInstitutionFlags(selectedFlagInstitution);
                      const currentVal = mod.id in flagOverrides ? flagOverrides[mod.id] : (existingFlags[mod.id] ?? false);
                      const isChanged = mod.id in flagOverrides;
                      return (
                        <div key={mod.id} className={cn('flex items-center justify-between p-4 rounded-xl border transition-all', isChanged ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-200 bg-white/50 hover:bg-gray-50')}>
                          <div className="flex items-center gap-3">
                            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', currentVal ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400')}>
                              <Zap className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{mod.label}</p>
                              <p className="text-xs text-gray-500">{mod.description} &middot; {mod.category}</p>
                            </div>
                          </div>
                          <button onClick={() => handleToggleFlag(mod.id)} className="focus:outline-none">
                            {currentVal ? (
                              <div className="flex items-center gap-1.5 bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm">
                                <ToggleRight className="w-4 h-4" /> ON
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 bg-gray-200 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-semibold">
                                <ToggleLeft className="w-4 h-4" /> OFF
                              </div>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              )
            ) : (
              <EmptyState icon={Layers} title="Select an institution" description="Choose an institution from the dropdown above to manage its feature flags." />
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB 5: FINANCE
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-lg bg-gradient-to-br from-amber-600 via-orange-600 to-rose-600 p-6 text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #d97706, #ea580c, #e11d48)' }}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,0.3),transparent_60%)]"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-amber-200" />
                  <div>
                    <h2 className="text-2xl font-bold">Subscription & Revenue</h2>
                    <p className="text-amber-200 text-sm">Manage plans, track MRR, and monitor financial health</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-amber-200 text-xs font-medium uppercase tracking-wide">Monthly Recurring Revenue</p>
                  <p className="text-4xl font-bold">${totalMRR.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subscriptionPlans.filter(p => p.id !== 'free').map((plan, i) => {
                const count = subscriptions.filter((s: any) => s.plan === plan.id && s.status === 'active').length;
                const isPopular = plan.id === 'premium';
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      'relative overflow-hidden rounded-lg p-6 text-white shadow-sm',
                      plan.id === 'basic' && 'bg-gradient-to-br from-blue-600 to-indigo-700',
                      plan.id === 'premium' && 'bg-blue-700',
                      plan.id === 'enterprise' && 'bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600',
                    )}
                  >
                    {isPopular && <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-5 h-5 text-amber-300" />
                        <h3 className="text-lg font-bold">{plan.name}</h3>
                      </div>
                      <p className="text-white/80 text-xs mb-4">{plan.description}</p>
                      <div className="mb-4">
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-white/60 text-sm">/mo</span>
                      </div>
                      <p className="text-white/70 text-xs mb-3">{count} active subscriptions</p>
                      <div className="space-y-1.5">
                        {plan.features.map(f => {
                          const mod = availableModules.find(m => m.id === f);
                          return (
                            <div key={f} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
                              <span className="text-white/90">{mod?.label || f}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Subscriptions Table */}
            <GlassCard className="overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" /> All Subscriptions
                </h3>
              </div>
              {subsLoading ? <LoadingSpinner text="Loading subscriptions..." /> : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/80">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Institution</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Plan</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Start Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.map((sub: any) => (
                        <tr key={sub.id} className="border-b border-gray-100 hover:bg-amber-50/30 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900 text-sm">{sub.institutionName || sub.institutionId}</td>
                          <td className="px-6 py-4">
                            <span className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold', sub.plan === 'enterprise' && 'bg-amber-100 text-amber-700', sub.plan === 'premium' && 'bg-blue-50 text-blue-700', sub.plan === 'basic' && 'bg-blue-100 text-blue-700', sub.plan === 'free' && 'bg-gray-100 text-gray-600')}>
                              {sub.plan}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold', sub.status === 'active' && 'bg-emerald-100 text-emerald-700', sub.status === 'trial' && 'bg-blue-100 text-blue-700', sub.status === 'past_due' && 'bg-rose-100 text-rose-700', sub.status === 'cancelled' && 'bg-gray-100 text-gray-600')}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900">${sub.monthlyPrice || 0}/mo</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{sub.startDate?.seconds ? new Date(sub.startDate.seconds * 1000).toLocaleDateString() : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {subscriptions.length === 0 && <EmptyState icon={DollarSign} title="No subscriptions yet" description="Subscriptions will appear as institutions sign up for plans." />}
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB 6: SECURITY (AUDIT LOGS)
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-lg bg-slate-700 p-6 text-white shadow-sm" style={{ background: '#334155' }}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_60%)]"></div>
              <div className="relative z-10 flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-200" />
                <div>
                  <h2 className="text-2xl font-bold">Security & Audit Logs</h2>
                  <p className="text-blue-200 text-sm">Track every action across the platform. {auditLogs.length} total entries.</p>
                </div>
              </div>
            </motion.div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <select value={logInstitutionFilter} onChange={(e) => { setLogInstitutionFilter(e.target.value); setLogPage(1); }} className="px-4 py-3 border border-gray-200 rounded-xl bg-white/80 backdrop-blur focus:ring-2 focus:ring-blue-500 min-w-[180px]">
                <option value="">All Institutions</option>
                {institutions.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
              </select>
              <select value={logModuleFilter} onChange={(e) => { setLogModuleFilter(e.target.value); setLogPage(1); }} className="px-4 py-3 border border-gray-200 rounded-xl bg-white/80 backdrop-blur focus:ring-2 focus:ring-blue-500 min-w-[180px]">
                <option value="">All Modules</option>
                {availableModules.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
              <button onClick={async () => { setLogsLoading(true); const fresh = await superAdminService.getAuditLogs(500); setAuditLogs(fresh); setLogsLoading(false); }} className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>

            <GlassCard className="overflow-hidden">
              {logsLoading ? <LoadingSpinner text="Loading audit logs..." /> : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/80">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Timestamp</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Module</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Institution</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedLogs.map((log: any) => (
                          <tr key={log.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                              <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{log.timestamp?.seconds ? new Date(log.timestamp.seconds * 1000).toLocaleString() : '-'}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">{log.userName || log.userEmail || log.userId || '-'}</td>
                            <td className="px-4 py-3">
                              <span className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold', getActionColor(log.action))}>{log.action}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{log.module || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{log.institutionName || '-'}</td>
                            <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate">{log.details || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredLogs.length === 0 && <EmptyState icon={Shield} title="No audit logs found" description="Audit logs will appear as actions are performed across the platform." />}
                  </div>
                  {totalLogPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500">Showing {(logPage - 1) * logsPerPage + 1}–{Math.min(logPage * logsPerPage, filteredLogs.length)} of {filteredLogs.length}</span>
                      <div className="flex gap-2">
                        <button onClick={() => setLogPage(p => Math.max(1, p - 1))} disabled={logPage === 1} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-50">Previous</button>
                        <button onClick={() => setLogPage(p => Math.min(totalLogPages, p + 1))} disabled={logPage === totalLogPages} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50">Next</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </GlassCard>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB 7: ANNOUNCEMENTS
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-lg bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 p-6 text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #0284c7, #2563eb, #4338ca)' }}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.3),transparent_60%)]"></div>
              <div className="relative z-10 flex items-center gap-3">
                <Megaphone className="w-8 h-8 text-sky-200" />
                <div>
                  <h2 className="text-2xl font-bold">Platform Announcements</h2>
                  <p className="text-sky-200 text-sm">Broadcast messages, warnings, and feature updates to all or specific institutions</p>
                </div>
              </div>
            </motion.div>

            {/* Create Announcement Form */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" /> Create Announcement
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                  <input type="text" value={newAnn.title} onChange={(e) => setNewAnn(prev => ({ ...prev, title: e.target.value }))} placeholder="Announcement title" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                    <select value={newAnn.type} onChange={(e) => setNewAnn(prev => ({ ...prev, type: e.target.value as any }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white/80 focus:ring-2 focus:ring-blue-500">
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="feature">Feature</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Target</label>
                    <select
                      value={newAnn.targetInstitutions.length === 0 ? 'all' : 'specific'}
                      onChange={(e) => {
                        if (e.target.value === 'all') setNewAnn(prev => ({ ...prev, targetInstitutions: [] }));
                      }}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white/80 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Institutions</option>
                      <option value="specific">Specific...</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Content</label>
                <textarea value={newAnn.content} onChange={(e) => setNewAnn(prev => ({ ...prev, content: e.target.value }))} rows={3} placeholder="Write your announcement..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
              </div>
              <button
                onClick={async () => {
                  if (!newAnn.title.trim() || !newAnn.content.trim()) { alert('Title and content are required.'); return; }
                  setIsCreatingAnn(true);
                  try {
                    await superAdminService.createAnnouncement({
                      title: newAnn.title, content: newAnn.content, type: newAnn.type,
                      targetInstitutions: newAnn.targetInstitutions, isActive: true,
                      createdBy: 'super-admin',
                    });
                    const fresh = await superAdminService.getAllAnnouncements();
                    setAnnouncements(fresh);
                    setNewAnn({ title: '', content: '', type: 'info', targetInstitutions: [] });
                  } catch (err) { console.error('Error creating announcement:', err); }
                  setIsCreatingAnn(false);
                }}
                disabled={isCreatingAnn}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 shadow-lg shadow-blue-500/25 transition-all"
              >
                {isCreatingAnn ? <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div> Publishing...</> : <><Bell className="w-4 h-4" /> Publish Announcement</>}
              </button>
            </GlassCard>

            {/* Announcements Table */}
            <GlassCard className="overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" /> All Announcements ({announcements.length})
                </h3>
              </div>
              {annLoading ? <LoadingSpinner text="Loading announcements..." /> : (
                <div className="divide-y divide-gray-100">
                  {announcements.map((ann: any) => (
                    <div key={ann.id} className="p-5 hover:bg-blue-50/30 transition-colors flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn('px-2.5 py-0.5 rounded-lg text-xs font-semibold', ann.type === 'info' && 'bg-blue-100 text-blue-700', ann.type === 'warning' && 'bg-amber-100 text-amber-700', ann.type === 'maintenance' && 'bg-rose-100 text-rose-700', ann.type === 'feature' && 'bg-emerald-100 text-emerald-700')}>
                            {ann.type}
                          </span>
                          <span className={cn('px-2.5 py-0.5 rounded-lg text-xs font-semibold', ann.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500')}>
                            {ann.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900">{ann.title}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ann.content}</p>
                        <p className="text-xs text-gray-400 mt-2">{ann.targetInstitutions?.length ? `Target: ${ann.targetInstitutions.length} institutions` : 'Target: All institutions'}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={async () => {
                            await superAdminService.toggleAnnouncement(ann.id, !ann.isActive);
                            setAnnouncements(prev => prev.map(a => a.id === ann.id ? { ...a, isActive: !a.isActive } : a));
                          }}
                          className={cn('p-2 rounded-lg transition-colors', ann.isActive ? 'text-rose-600 hover:bg-rose-100' : 'text-emerald-600 hover:bg-emerald-100')}
                          title={ann.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm('Delete this announcement?')) return;
                            await superAdminService.deleteAnnouncement(ann.id);
                            setAnnouncements(prev => prev.filter(a => a.id !== ann.id));
                          }}
                          className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {announcements.length === 0 && <EmptyState icon={Megaphone} title="No announcements yet" description="Create your first announcement to broadcast to institutions." />}
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB 4: ROLES & PERMISSIONS
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'roles' && <RolesPermissionsTab />}

        {/* ═══════════════════════════════════════════════════════════
            TAB 5: ACADEMICS CONTROL
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'academics' && <AcademicsControlTab />}

        {/* ═══════════════════════════════════════════════════════════
            TAB 8: AI CENTER
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'ai-center' && <AICenterTab />}

        {/* ═══════════════════════════════════════════════════════════
            TAB 11: BACKUP & RECOVERY
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'backup' && <BackupRecoveryTab />}

        {/* ═══════════════════════════════════════════════════════════
            TAB 12: SETTINGS
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-700 via-gray-800 to-zinc-900 p-6 text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #334155, #1f2937, #18181b)' }}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(100,116,139,0.3),transparent_60%)]"></div>
              <div className="relative z-10 flex items-center gap-3">
                <Settings className="w-8 h-8 text-slate-300" />
                <div>
                  <h2 className="text-2xl font-bold">Platform Settings</h2>
                  <p className="text-slate-300 text-sm">System configuration, data policies, and maintenance</p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Platform Configuration */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" /> Platform Configuration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Platform Name</label>
                    <input type="text" defaultValue="CovenantERP" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white/80 focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Version</label>
                      <input type="text" defaultValue="2.4.0" readOnly className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Environment</label>
                      <input type="text" defaultValue="Production" readOnly className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700">System Status</span>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">OPERATIONAL</span>
                  </div>
                </div>
              </GlassCard>

              {/* Data Retention */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" /> Data Retention Policies
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Audit Logs', period: '365 days', color: 'bg-blue-50 border-blue-200' },
                    { label: 'Activity Logs', period: '180 days', color: 'bg-purple-50 border-purple-200' },
                    { label: 'Login Sessions', period: '90 days', color: 'bg-amber-50 border-amber-200' },
                    { label: 'Temporary Files', period: '30 days', color: 'bg-rose-50 border-rose-200' },
                    { label: 'Deleted Records', period: '90 days (soft delete)', color: 'bg-gray-50 border-gray-200' },
                  ].map(policy => (
                    <div key={policy.label} className={cn('flex items-center justify-between p-3 rounded-xl border', policy.color)}>
                      <span className="text-sm font-medium text-gray-700">{policy.label}</span>
                      <span className="text-sm text-gray-500">{policy.period}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Security Policies */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-indigo-600" /> Security Policies
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Password Minimum Length', value: '8 characters', icon: Key },
                    { label: 'Two-Factor Authentication', value: 'Available', icon: ShieldCheck },
                    { label: 'Session Timeout', value: '30 minutes', icon: Clock },
                    { label: 'Max Login Attempts', value: '5 before lockout', icon: AlertCircle },
                    { label: 'Password Expiry', value: '90 days', icon: RefreshCw },
                    { label: 'IP Whitelisting', value: 'Disabled', icon: Globe2 },
                  ].map(policy => (
                    <div key={policy.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2">
                        <policy.icon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{policy.label}</span>
                      </div>
                      <span className="text-sm text-gray-500">{policy.value}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* System Maintenance */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" /> System Maintenance
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-semibold text-amber-700">Backup & Restore</span>
                    </div>
                    <p className="text-xs text-amber-600 mb-3">Trigger a manual backup of all platform data. This includes institutions, users, subscriptions, and audit logs.</p>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25 transition-all">
                      <Database className="w-4 h-4" /> Trigger System Backup
                    </button>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-700">Cache Invalidation</span>
                    </div>
                    <p className="text-xs text-blue-600 mb-3">Clear all server-side and client-side caches. Users may experience brief loading delays.</p>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-500/25 transition-all">
                      <RefreshCw className="w-4 h-4" /> Clear All Caches
                    </button>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        )}

      </div>

      {/* ═══════════════════════════════════════════════════════════
          MODALS
      ═══════════════════════════════════════════════════════════ */}

      {/* Add Institution Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-lg shadow-md w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 rounded-xl p-2">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Add New Institution</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Institution Name *</label>
                <input type="text" value={newInstitution.name} onChange={(e) => setNewInstitution({ ...newInstitution, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Westminster Theological Seminary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Institution Type</label>
                  <select value={newInstitution.institutionType} onChange={(e) => setNewInstitution({ ...newInstitution, institutionType: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                    <option value="seminary">Seminary</option>
                    <option value="bible-college">Bible College</option>
                    <option value="christian-university">Christian University</option>
                    <option value="denomination">Denomination</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                  <input type="text" value={newInstitution.location} onChange={(e) => setNewInstitution({ ...newInstitution, location: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="City, Country" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Admin Email *</label>
                <input type="email" value={newInstitution.adminEmail} onChange={(e) => setNewInstitution({ ...newInstitution, adminEmail: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="admin@institution.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Admin Password (auto-generated if empty)</label>
                <div className="flex gap-2">
                  <input type="text" value={newInstitution.adminPassword} readOnly className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-mono" placeholder="Auto-generates on creation" />
                  <button onClick={() => setNewInstitution({ ...newInstitution, adminPassword: generatePassword() })} className="px-4 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 rounded-xl text-sm font-semibold transition-colors">Regenerate</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subdomain (optional)</label>
                <input type="text" value={newInstitution.subdomain} onChange={(e) => setNewInstitution({ ...newInstitution, subdomain: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="e.g., westminster" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tradition / Denomination</label>
                <input type="text" value={newInstitution.tradition} onChange={(e) => setNewInstitution({ ...newInstitution, tradition: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="e.g., Reformed, Baptist, Pentecostal" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsAddModalOpen(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleAddInstitution} disabled={isSavingTenant} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-50 shadow-lg shadow-blue-500/20 transition-all">
                  {isSavingTenant ? 'Creating...' : 'Create Institution'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Institution / Provision Admin Modal */}
      {isEditModalOpen && selectedInstitution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-lg shadow-md w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 rounded-xl p-2">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedInstitution.name}</h2>
                  <p className="text-sm text-gray-500">Manage institution and administrators</p>
                </div>
              </div>
              <button onClick={() => { setIsEditModalOpen(false); setSelectedInstitution(null); }} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Institution Status */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Institution Status</label>
                <div className="flex gap-2">
                  {(['active', 'suspended', 'inactive'] as const).map(status => (
                    <button key={status} onClick={() => handleUpdateStatus(selectedInstitution.id, status)} className={cn('px-4 py-2 rounded-lg font-semibold text-sm transition-all', selectedInstitution.status === status ? (status === 'active' ? 'bg-emerald-600 text-white' : status === 'suspended' ? 'bg-rose-600 text-white' : 'bg-gray-600 text-white') : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admins List */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><Users className="w-5 h-5 text-blue-600" /> Institution Administrators</h3>
                <div className="space-y-2 mb-4">
                  {tenantAdmins.length === 0 ? (
                    <p className="text-gray-500 text-sm">No administrators provisioned yet.</p>
                  ) : (
                    tenantAdmins.map((admin) => (
                      <div key={admin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                            {(admin.displayName || admin.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{admin.displayName || admin.email}</p>
                            <p className="text-sm text-gray-500">{admin.email}</p>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteAdmin(admin.id, admin.email)} className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors" title="Remove admin"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Provision New Admin */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><UserCheck className="w-5 h-5 text-emerald-600" /> Provision New Administrator</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Admin Email</label>
                    <input type="email" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="admin@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Temporary Password</label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input type={showNewAdminPassword ? 'text' : 'password'} value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10" />
                        <button onClick={() => setShowNewAdminPassword(!showNewAdminPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                          {showNewAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <button onClick={() => setNewAdminPassword(generatePassword())} className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors" title="Generate new password"><RefreshCw className="w-5 h-5 text-gray-600" /></button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Auto-generated secure password. You can edit it if needed.</p>
                  </div>
                  {provisionError && (
                    <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-rose-700">{provisionError}</p>
                    </div>
                  )}
                  <button onClick={handleProvisionAdmin} disabled={isProvisioning} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 transition-all">
                    {isProvisioning ? (<><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div> Provisioning...</>) : (<><CheckCircle className="w-5 h-5" /> Provision Admin Account</>)}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Success Modal */}
      {provisioningResult && (
        <SuccessModal result={provisioningResult} onClose={() => setProvisioningResult(null)} />
      )}

      {/* ─── IMPERSONATION MODAL ─── */}
      {impersonateModalOpen && impersonateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-md w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Eye className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Impersonate Institution</h2>
                  <p className="text-amber-100 text-sm">{impersonateTarget.name}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-700 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-semibold text-sm">Warning: Read-Only Mode</span>
                </div>
                <p className="text-amber-600 text-xs">You will view the admin portal as this institution. All actions are audited. The token expires automatically.</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Institution</span>
                  <span className="font-semibold text-gray-900">{impersonateTarget.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Admin Email</span>
                  <span className="font-mono text-gray-900 text-xs">{impersonateTarget.adminEmail}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className={cn('px-2 py-0.5 rounded text-xs font-semibold', impersonateTarget.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600')}>{impersonateTarget.status}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Reason</label>
                <input type="text" value={impersonateReason} onChange={(e) => setImpersonateReason(e.target.value)} placeholder="Why are you impersonating?" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white/80 focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Token Expiry</label>
                <select value={impersonateTTL} onChange={(e) => setImpersonateTTL(Number(e.target.value))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white/80 focus:ring-2 focus:ring-amber-500">
                  <option value={1}>1 Hour</option>
                  <option value={2}>2 Hours</option>
                  <option value={4}>4 Hours</option>
                  <option value={8}>8 Hours</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setImpersonateModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={handleGenerateImpersonationToken} disabled={isGeneratingToken} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/25">
                  {isGeneratingToken ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Eye className="w-4 h-4" />}
                  {isGeneratingToken ? 'Generating...' : 'Start Impersonation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── ACTIVE TOKENS PANEL ─── */}
      {showActiveTokens && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-md w-full max-w-lg mx-4 overflow-hidden">
            <div className="bg-blue-700 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <KeyRound className="w-6 h-6" />
                <h2 className="text-lg font-bold">Active Impersonation Tokens</h2>
              </div>
              <button onClick={() => setShowActiveTokens(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {activeTokens.length === 0 ? (
                <div className="text-center py-8">
                  <KeyRound className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No active tokens</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeTokens.map(token => (
                    <div key={token.id} className="border border-gray-200 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900 text-sm">{token.institutionName}</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">Active</span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex justify-between"><span>Admin:</span><span className="font-mono">{token.adminEmail}</span></div>
                        <div className="flex justify-between"><span>Created by:</span><span>{token.createdBy}</span></div>
                        <div className="flex justify-between"><span>Expires:</span><span>{token.expiresAt?.toDate?.()?.toLocaleString() || '-'}</span></div>
                        <div className="flex justify-between"><span>Used:</span><span>{token.usageCount} times</span></div>
                        {token.reason && <div className="flex justify-between"><span>Reason:</span><span>{token.reason}</span></div>}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={async () => {
                            const validToken = await impersonationService.validateToken(token.id);
                            if (validToken && user) {
                              startImpersonation({
                                institutionId: validToken.institutionId,
                                institutionName: validToken.institutionName,
                                adminEmail: validToken.adminEmail,
                                tokenId: validToken.id,
                                startedAt: Date.now(),
                                reason: validToken.reason,
                              });
                              await auditLogService.logImpersonationAction(
                                user.uid, user.email || 'super-admin', 'impersonate_start',
                                validToken.institutionId, validToken.institutionName, validToken.id
                              );
                              setShowActiveTokens(false);
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-200 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Use Token
                        </button>
                        <button
                          onClick={async () => {
                            await impersonationService.revokeToken(token.id);
                            setActiveTokens(prev => prev.filter(t => t.id !== token.id));
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold hover:bg-rose-200 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" /> Revoke
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
