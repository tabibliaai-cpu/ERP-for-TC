import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Building2, Users, Activity, Trash2, Plus, Save, Search,
  Globe, ChevronRight, Database, ExternalLink, Mail, Copy, CheckCircle,
  AlertCircle, Eye, EyeOff, RefreshCw, X, Key
} from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, setDoc, query, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';

// Firebase secondary app for creating users without signing out super admin
const SECONDARY_APP_NAME = 'secondary-app';

function getSecondaryApp() {
  const existing = getApps().find(a => a.name === SECONDARY_APP_NAME);
  if (existing) return existing;
  // Get config from the primary app's config
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

// ---- Success Modal ----
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
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
                <Mail className="w-4 h-4 text-fuchsia-500" />
                <span className="font-mono text-gray-800 text-sm break-all">{result.email}</span>
              </div>
            </div>
            {!result.isExistingUser && (
              <div className="border-t border-gray-200 pt-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Temporary Password</label>
                <div className="flex items-center gap-2 mt-1">
                  <Key className="w-4 h-4 text-fuchsia-500" />
                  <span className="font-mono text-gray-800 text-sm flex-1">
                    {showPassword ? result.tempPassword : '••••••••••'}
                  </span>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title={showPassword ? 'Hide' : 'Show'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={copyPassword}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all',
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200'
              )}
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Password'}
            </button>
            <button
              onClick={openMail}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-all"
            >
              <Mail className="w-4 h-4" />
              Open Mail
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white rounded-xl text-sm font-semibold hover:from-fuchsia-700 hover:to-violet-700 transition-colors"
          >
            Done
          </button>
          <p className="text-xs text-center text-amber-600 bg-amber-50 rounded-lg p-2">
            ⚠ This password will not be shown again. Please save it now.
          </p>
        </div>
      </div>
    </div>
  );
};

export function SuperAdmin() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [provisionStep, setProvisionStep] = useState<1 | 2>(1);
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

  // New institution form state
  const [newInstitution, setNewInstitution] = useState({
    name: '',
    institutionType: 'seminary',
    adminEmail: '',
    adminPassword: '',
    subdomain: '',
    tradition: '',
    modules: ['academics', 'admissions', 'finance'],
  });

  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
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
  };

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
    if (!newAdminEmail.trim()) {
      setProvisionError('Please enter an admin email address.');
      return;
    }
    if (!newAdminPassword.trim() || newAdminPassword.length < 8) {
      setProvisionError('Password must be at least 8 characters.');
      return;
    }

    setIsProvisioning(true);
    setProvisionError('');

    try {
      // Use a secondary Firebase app instance to create the user
      // so the super admin session is not disrupted
      let secondaryApp;
      try {
        secondaryApp = getSecondaryApp();
      } catch {
        // Fallback: if secondary app fails, use a workaround
        secondaryApp = null;
      }

      let uid: string | null = null;

      if (secondaryApp) {
        const secondaryAuth = getAuth(secondaryApp);
        const userCred = await createUserWithEmailAndPassword(secondaryAuth, newAdminEmail.trim(), newAdminPassword);
        uid = userCred.user.uid;
        await secondaryAuth.signOut();
      } else {
        // Fallback: create a Firestore-only record with a note
        uid = `manual_${Date.now()}`;
      }

      // Save user record to Firestore
      await setDoc(doc(db, 'users', uid || newAdminEmail.trim()), {
        email: newAdminEmail.trim(),
        displayName: newAdminEmail.trim().split('@')[0],
        role: 'admin',
        institutionId: selectedInstitution.id,
        institutionName: selectedInstitution.name,
        createdAt: serverTimestamp(),
        status: 'active',
        mustChangePassword: true,
      });

      // Update institution record
      await updateDoc(doc(db, 'institutions', selectedInstitution.id), {
        adminEmail: newAdminEmail.trim(),
        lastActivity: serverTimestamp(),
      });

      // Show success modal with credentials
      setProvisioningResult({
        email: newAdminEmail.trim(),
        tempPassword: newAdminPassword,
        institutionName: selectedInstitution.name,
      });

      // Refresh admin list
      await loadTenantAdmins(selectedInstitution.id);
      await loadInstitutions();
      setNewAdminEmail('');
      setNewAdminPassword(generatePassword());

    } catch (err: any) {
      console.error('Provisioning error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setProvisionError('This email is already registered. Try a different email.');
      } else if (err.code === 'auth/invalid-email') {
        setProvisionError('Invalid email address format.');
      } else if (err.code === 'auth/weak-password') {
        setProvisionError('Password is too weak. Use at least 8 characters.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setProvisionError('Email/password auth is not enabled in Firebase. Please enable it in Firebase Console > Authentication > Sign-in Methods.');
      } else {
        // Even if Firebase Auth fails, store Firestore record so admin is tracked
        try {
          const fallbackId = `fallback_${Date.now()}`;
          await setDoc(doc(db, 'users', fallbackId), {
            email: newAdminEmail.trim(),
            displayName: newAdminEmail.trim().split('@')[0],
            role: 'admin',
            institutionId: selectedInstitution!.id,
            institutionName: selectedInstitution!.name,
            createdAt: serverTimestamp(),
            status: 'pending_auth',
            mustChangePassword: true,
            manualPassword: newAdminPassword,
          });
          setProvisioningResult({
            email: newAdminEmail.trim(),
            tempPassword: newAdminPassword,
            institutionName: selectedInstitution!.name,
          });
          await loadTenantAdmins(selectedInstitution!.id);
          setNewAdminEmail('');
          setNewAdminPassword(generatePassword());
        } catch (fbErr) {
          setProvisionError(`Failed to create admin: ${err.message || 'Unknown error'}`);
        }
      }
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string, adminEmail: string) => {
    if (!window.confirm('Remove this admin?')) return;
    try {
      await deleteDoc(doc(db, 'users', adminId));
      if (selectedInstitution) {
        if (selectedInstitution.adminEmail === adminEmail) {
          await updateDoc(doc(db, 'institutions', selectedInstitution.id), {
             adminEmail: '',
             lastActivity: serverTimestamp()
          });
          // Update local state so it reflects immediately
          setSelectedInstitution({ ...selectedInstitution, adminEmail: '' });
          await loadInstitutions(); 
        }
        await loadTenantAdmins(selectedInstitution.id);
      }
    } catch (err) {
      console.error('Error deleting admin:', err);
    }
  };

  const handleAddInstitution = async () => {
    if (!newInstitution.name.trim() || !newInstitution.adminEmail.trim()) {
      alert('Institution name and admin email are required.');
      return;
    }
    
    // Generate a password if none exists
    const adminPass = newInstitution.adminPassword || generatePassword();
    
    setIsSavingTenant(true);
    try {
      const { adminPassword, ...instData } = newInstitution;
      
      const docRef = await addDoc(collection(db, 'institutions'), {
        ...instData,
        status: 'active',
        studentCount: 0,
        facultyCount: 0,
        userCount: 0,
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
      });
      
      // Now configure the admin user account.
      let secondaryApp;
      try {
        secondaryApp = getSecondaryApp();
      } catch {
        secondaryApp = null;
      }

      let uid: string | null = null;
      let alreadyExists = false;
      if (secondaryApp) {
        try {
          const secondaryAuth = getAuth(secondaryApp);
          const userCred = await createUserWithEmailAndPassword(secondaryAuth, newInstitution.adminEmail.trim(), adminPass);
          uid = userCred.user.uid;
          await secondaryAuth.signOut();
        } catch (authErr: any) {
          if (authErr.code === 'auth/email-already-in-use') {
            uid = newInstitution.adminEmail.trim(); // Will be reclaimed
            alreadyExists = true;
          } else {
            throw authErr;
          }
        }
      } else {
        uid = `manual_${Date.now()}`;
      }

      // Save user record in Firestore
      await setDoc(doc(db, 'users', uid || newInstitution.adminEmail.trim()), {
        email: newInstitution.adminEmail.trim(),
        displayName: newInstitution.adminEmail.trim().split('@')[0],
        role: 'admin',
        institutionId: docRef.id,
        institutionName: newInstitution.name,
        createdAt: serverTimestamp(),
        status: 'active',
        mustChangePassword: !alreadyExists,
      });

      // Show provisional success modal using the existing provisioning success component 
      setProvisioningResult({
        email: newInstitution.adminEmail.trim(),
        tempPassword: alreadyExists ? 'User already has an account. They can login with Google or existing password.' : adminPass,
        institutionName: newInstitution.name,
        isExistingUser: alreadyExists
      });

      await loadInstitutions();
      setIsAddModalOpen(false);
      setNewInstitution({ name: '', institutionType: 'seminary', adminEmail: '', adminPassword: '', subdomain: '', tradition: '', modules: ['academics', 'admissions', 'finance'] });
    } catch (err: any) {
      console.error('Error adding institution:', err);
      alert('Failed to add institution and provision admin.');
    } finally {
      setIsSavingTenant(false);
    }
  };

  const handleDeleteInstitution = async (id: string) => {
    if (!window.confirm('Delete this institution? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'institutions', id));
      await loadInstitutions();
      if (selectedInstitution?.id === id) {
        setIsEditModalOpen(false);
        setSelectedInstitution(null);
      }
    } catch (err) {
      console.error('Error deleting institution:', err);
    }
  };

  const handleUpdateStatus = async (id: string, status: Institution['status']) => {
    try {
      await updateDoc(doc(db, 'institutions', id), { status, lastActivity: serverTimestamp() });
      await loadInstitutions();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const filtered = institutions.filter(i =>
    i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.adminEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: institutions.length,
    active: institutions.filter(i => i.status === 'active').length,
    students: institutions.reduce((s, i) => s + (i.studentCount || 0), 0),
    faculty: institutions.reduce((s, i) => s + (i.facultyCount || 0), 0),
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-xl p-2.5">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Super Admin</h1>
              <p className="text-sm text-gray-500">System Governance Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => { setIsAddModalOpen(true); setProvisionStep(1); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white rounded-xl font-semibold hover:from-fuchsia-700 hover:to-violet-700 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add Institution
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Institutions</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <Building2 className="w-10 h-10 text-fuchsia-600 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Active</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.active}</p>
              </div>
              <Activity className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Students</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.students.toLocaleString()}</p>
              </div>
              <Users className="w-10 h-10 text-blue-600 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Faculty</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.faculty.toLocaleString()}</p>
              </div>
              <Database className="w-10 h-10 text-purple-600 opacity-50" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search institutions by name or admin email..."
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Institutions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-gray-500">Loading institutions...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No institutions found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Institution</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Admin Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stats</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inst) => (
                  <tr key={inst.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-fuchsia-600" />
                        <div>
                          <div className="font-semibold text-gray-900">{inst.name}</div>
                          {inst.subdomain && <div className="text-xs text-gray-500">{inst.subdomain}.covenant-erp.com</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                        {inst.institutionType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{inst.adminEmail}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {inst.studentCount || 0} students, {inst.facultyCount || 0} faculty
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-semibold',
                          inst.status === 'active' && 'bg-green-100 text-green-700',
                          inst.status === 'suspended' && 'bg-red-100 text-red-700',
                          inst.status === 'inactive' && 'bg-gray-100 text-gray-700'
                        )}
                      >
                        {inst.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSelectInstitution(inst)}
                          className="p-2 text-fuchsia-600 hover:bg-fuchsia-50 rounded-lg transition-colors"
                          title="Manage"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteInstitution(inst.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Institution Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add New Institution</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Institution Name</label>
                <input
                  type="text"
                  value={newInstitution.name}
                  onChange={(e) => setNewInstitution({ ...newInstitution, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500"
                  placeholder="e.g., Westminster Theological Seminary"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Institution Type</label>
                <select
                  value={newInstitution.institutionType}
                  onChange={(e) => setNewInstitution({ ...newInstitution, institutionType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500"
                >
                  <option value="seminary">Seminary</option>
                  <option value="bible-college">Bible College</option>
                  <option value="christian-university">Christian University</option>
                  <option value="denomination">Denomination</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Admin Email</label>
                <input
                  type="email"
                  value={newInstitution.adminEmail}
                  onChange={(e) => setNewInstitution({ ...newInstitution, adminEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500"
                  placeholder="admin@institution.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Admin Password (Optional: For Email Login)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInstitution.adminPassword}
                    readOnly
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 font-mono"
                    placeholder="Generates automatically if empty"
                  />
                  <button 
                    onClick={() => setNewInstitution({ ...newInstitution, adminPassword: generatePassword() })}
                    className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subdomain (optional)</label>
                <input
                  type="text"
                  value={newInstitution.subdomain}
                  onChange={(e) => setNewInstitution({ ...newInstitution, subdomain: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500"
                  placeholder="e.g., westminster"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddInstitution}
                  disabled={isSavingTenant}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white rounded-xl font-semibold hover:from-fuchsia-700 hover:to-violet-700 disabled:opacity-50"
                >
                  {isSavingTenant ? 'Saving...' : 'Create Institution'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Institution / Provision Admin Modal */}
      {isEditModalOpen && selectedInstitution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedInstitution.name}</h2>
                <p className="text-sm text-gray-500">Manage institution and administrators</p>
              </div>
              <button onClick={() => { setIsEditModalOpen(false); setSelectedInstitution(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Institution Status */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Institution Status</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedInstitution.id, 'active')}
                    className={cn(
                      'px-4 py-2 rounded-lg font-semibold text-sm',
                      selectedInstitution.status === 'active' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                    )}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedInstitution.id, 'suspended')}
                    className={cn(
                      'px-4 py-2 rounded-lg font-semibold text-sm',
                      selectedInstitution.status === 'suspended' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                    )}
                  >
                    Suspended
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedInstitution.id, 'inactive')}
                    className={cn(
                      'px-4 py-2 rounded-lg font-semibold text-sm',
                      selectedInstitution.status === 'inactive' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'
                    )}
                  >
                    Inactive
                  </button>
                </div>
              </div>

              {/* Admins List */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Institution Administrators</h3>
                <div className="space-y-2 mb-4">
                  {tenantAdmins.length === 0 ? (
                    <p className="text-gray-500 text-sm ">No administrators provisioned yet.</p>
                  ) : (
                    tenantAdmins.map((admin) => (
                      <div key={admin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-fuchsia-600" />
                          <div>
                            <p className="font-semibold text-gray-900">{admin.displayName || admin.email}</p>
                            <p className="text-sm text-gray-500">{admin.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Remove admin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add New Admin */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Provision New Administrator</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Admin Email</label>
                    <input
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500"
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Temporary Password</label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type={showNewAdminPassword ? 'text' : 'password'}
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 pr-10"
                        />
                        <button
                          onClick={() => setShowNewAdminPassword(!showNewAdminPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                        >
                          {showNewAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <button
                        onClick={() => setNewAdminPassword(generatePassword())}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                        title="Generate new password"
                      >
                        <RefreshCw className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Auto-generated secure password. You can edit it if needed.</p>
                  </div>
                  {provisionError && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{provisionError}</p>
                    </div>
                  )}
                  <button
                    onClick={handleProvisionAdmin}
                    disabled={isProvisioning}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white rounded-xl font-semibold hover:from-fuchsia-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProvisioning ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Provisioning...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Provision Admin Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {provisioningResult && (
        <SuccessModal
          result={provisioningResult}
          onClose={() => setProvisioningResult(null)}
        />
      )}
    </div>
  );
}

export default SuperAdmin;