import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Shield, ShieldCheck, ShieldAlert, Plus, Save, Search, Users,
  ChevronDown, ChevronRight, X, Check, CheckCircle, Crown, GraduationCap,
  UserCheck, BookOpen, Library, DollarSign, Settings, Eye,
  Lock, Unlock, Trash2, UserCog, AlertCircle, Loader2,
  Sparkles, ToggleLeft, ToggleRight, Copy, Edit3, GripVertical,
  CheckSquare, Square, MoreHorizontal, Filter, Ban, UserPlus,
  ClipboardList, Key, Target, Layers, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  collection, getDocs, addDoc, updateDoc, doc, setDoc,
  serverTimestamp, query, where, writeBatch, deleteDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { cn } from '../../lib/utils';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface RolePermission {
  id?: string;
  role: string;
  permissions: Record<string, boolean>;
  description: string;
  isSystemRole: boolean;
  institutionId?: string;
  userCount?: number;
  createdAt?: any;
  updatedAt?: any;
}

interface UserRecord {
  id: string;
  email: string;
  displayName: string;
  role: string;
  institutionId?: string;
  institutionName?: string;
  status?: string;
}

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const PERMISSION_CATEGORIES = [
  {
    id: 'academic',
    label: 'Academic',
    icon: GraduationCap,
    color: 'bg-indigo-600',
    bgLight: 'bg-indigo-50',
    textLight: 'text-indigo-700',
    permissions: [
      'courses.create', 'courses.edit', 'courses.delete',
      'grades.manage', 'attendance.manage'
    ]
  },
  {
    id: 'students',
    label: 'Students',
    icon: UserCheck,
    color: 'bg-blue-600',
    bgLight: 'bg-blue-50',
    textLight: 'text-blue-700',
    permissions: [
      'students.create', 'students.view', 'students.edit', 'students.delete'
    ]
  },
  {
    id: 'faculty',
    label: 'Faculty',
    icon: Users,
    color: 'bg-cyan-600',
    bgLight: 'bg-cyan-50',
    textLight: 'text-cyan-700',
    permissions: [
      'faculty.create', 'faculty.view', 'faculty.edit', 'faculty.delete',
      'payroll.manage'
    ]
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: DollarSign,
    color: 'bg-amber-600',
    bgLight: 'bg-amber-50',
    textLight: 'text-amber-700',
    permissions: [
      'fees.manage', 'invoices.create', 'payments.process', 'reports.view'
    ]
  },
  {
    id: 'library',
    label: 'Library',
    icon: BookOpen,
    color: 'bg-emerald-600',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-700',
    permissions: [
      'books.manage', 'borrowing.manage', 'catalog.admin'
    ]
  },
  {
    id: 'system',
    label: 'System',
    icon: Settings,
    color: 'bg-rose-600',
    bgLight: 'bg-rose-50',
    textLight: 'text-rose-700',
    permissions: [
      'settings.manage', 'users.manage', 'announcements.manage', 'audit.view'
    ]
  }
];

const ALL_PERMISSIONS = PERMISSION_CATEGORIES.flatMap(c => c.permissions);

const SYSTEM_ROLES: Omit<RolePermission, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    role: 'super_admin',
    description: 'Full platform access. Can manage all institutions, users, and system configurations.',
    isSystemRole: true,
    permissions: Object.fromEntries(ALL_PERMISSIONS.map(p => [p, true])),
  },
  {
    role: 'institution_admin',
    description: 'Manages a single institution: users, courses, finance, and settings within their tenant.',
    isSystemRole: true,
    permissions: Object.fromEntries(
      ALL_PERMISSIONS.map(p => [p, !['audit.view', 'settings.manage'].includes(p)])
    ),
  },
  {
    role: 'faculty',
    description: 'Teaching staff with access to courses, grades, attendance, and learning materials.',
    isSystemRole: true,
    permissions: Object.fromEntries(
      ALL_PERMISSIONS.map(p => [
        p,
        ['courses.create', 'courses.edit', 'grades.manage', 'attendance.manage', 'students.view'].includes(p)
      ])
    ),
  },
  {
    role: 'teacher',
    description: 'Similar to faculty but with limited scope. Can manage grades and attendance only.',
    isSystemRole: true,
    permissions: Object.fromEntries(
      ALL_PERMISSIONS.map(p => [
        p,
        ['courses.edit', 'grades.manage', 'attendance.manage', 'students.view'].includes(p)
      ])
    ),
  },
  {
    role: 'student',
    description: 'Learners who can view courses, grades, and manage their own attendance records.',
    isSystemRole: true,
    permissions: Object.fromEntries(
      ALL_PERMISSIONS.map(p => [p, ['students.view', 'reports.view'].includes(p)])
    ),
  },
  {
    role: 'librarian',
    description: 'Library staff managing books, catalogs, and borrowing/return processes.',
    isSystemRole: true,
    permissions: Object.fromEntries(
      ALL_PERMISSIONS.map(p => [
        p,
        ['books.manage', 'borrowing.manage', 'catalog.admin', 'reports.view'].includes(p)
      ])
    ),
  },
  {
    role: 'finance_manager',
    description: 'Financial staff handling fees, invoices, payments, and financial reports.',
    isSystemRole: true,
    permissions: Object.fromEntries(
      ALL_PERMISSIONS.map(p => [
        p,
        ['fees.manage', 'invoices.create', 'payments.process', 'reports.view', 'students.view'].includes(p)
      ])
    ),
  },
  {
    role: 'church_admin',
    description: 'Manages church-related activities, events, and congregation within the institution.',
    isSystemRole: true,
    permissions: Object.fromEntries(
      ALL_PERMISSIONS.map(p => [
        p,
        ['students.view', 'announcements.manage', 'reports.view', 'attendance.manage'].includes(p)
      ])
    ),
  },
];

const ROLE_META: Record<string, { label: string; color: string; gradient: string; icon: React.ElementType; badgeBg: string; badgeText: string }> = {
  super_admin:       { label: 'Super Admin',       color: 'amber',    gradient: 'bg-amber-500',       icon: Crown,          badgeBg: 'bg-amber-100',    badgeText: 'text-amber-700' },
  institution_admin: { label: 'Institution Admin', color: 'fuchsia',  gradient: 'bg-blue-600',    icon: Shield,         badgeBg: 'bg-blue-100',  badgeText: 'text-blue-700' },
  faculty:           { label: 'Faculty',            color: 'violet',   gradient: 'bg-indigo-600',     icon: GraduationCap,  badgeBg: 'bg-indigo-100',   badgeText: 'text-indigo-700' },
  teacher:           { label: 'Teacher',            color: 'blue',     gradient: 'bg-blue-500',          icon: UserCheck,      badgeBg: 'bg-blue-100',     badgeText: 'text-blue-700' },
  student:           { label: 'Student',            color: 'cyan',     gradient: 'bg-cyan-500',          icon: BookOpen,       badgeBg: 'bg-cyan-100',     badgeText: 'text-cyan-700' },
  librarian:         { label: 'Librarian',          color: 'emerald',  gradient: 'bg-emerald-500',    icon: Library,        badgeBg: 'bg-emerald-100',  badgeText: 'text-emerald-700' },
  finance_manager:   { label: 'Finance Manager',    color: 'orange',   gradient: 'bg-orange-500',      icon: DollarSign,     badgeBg: 'bg-orange-100',   badgeText: 'text-orange-700' },
  church_admin:      { label: 'Church Admin',       color: 'rose',     gradient: 'bg-rose-500',          icon: Sparkles,       badgeBg: 'bg-rose-100',     badgeText: 'text-rose-700' },
};

const DEFAULT_CUSTOM_ROLE_META = { label: 'Custom', color: 'slate', gradient: 'bg-slate-500', icon: Layers as React.ElementType, badgeBg: 'bg-slate-100', badgeText: 'text-slate-700' };

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function getRoleMeta(roleKey: string) {
  return ROLE_META[roleKey] || DEFAULT_CUSTOM_ROLE_META;
}

function countEnabledPermissions(permissions: Record<string, boolean>) {
  return Object.values(permissions).filter(Boolean).length;
}

function formatPermissionLabel(key: string) {
  const [resource, action] = key.split('.');
  const resourceLabel = resource.charAt(0).toUpperCase() + resource.slice(1);
  const actionLabel = action.charAt(0).toUpperCase() + action.slice(1);
  return `${resourceLabel} ${actionLabel}`;
}

// ═══════════════════════════════════════════════════════════════════
// GLASS CARD
// ═══════════════════════════════════════════════════════════════════

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-white/20', className)}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function RolesPermissionsTab() {
  // ─── Data State ───
  const [roles, setRoles] = useState<RolePermission[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ─── UI State ───
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // ─── Matrix Edit State (unsaved changes) ───
  const [editedPermissions, setEditedPermissions] = useState<Record<string, Record<string, boolean>>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // ─── Create Role Form ───
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState<Record<string, boolean>>(
    Object.fromEntries(ALL_PERMISSIONS.map(p => [p, false]))
  );
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // ─── User Role Assignment ───
  const [selectedUserRole, setSelectedUserRole] = useState<Record<string, string>>({});
  const [isAssigning, setIsAssigning] = useState(false);

  // ─── Toast ───
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ═══════════════════════════════════════════════════════════════════
  // DATA LOADING
  // ═══════════════════════════════════════════════════════════════════

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load roles
      const rolesSnap = await getDocs(collection(db, 'roles_permissions'));
      let loadedRoles = rolesSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      } as RolePermission));

      // Seed system roles if collection is empty
      if (loadedRoles.length === 0) {
        const batch = writeBatch(db);
        SYSTEM_ROLES.forEach(sysRole => {
          const ref = doc(collection(db, 'roles_permissions'));
          batch.set(ref, {
            ...sysRole,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });
        await batch.commit();

        const freshSnap = await getDocs(collection(db, 'roles_permissions'));
        loadedRoles = freshSnap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        } as RolePermission));
      }

      // Count users per role
      const usersSnap = await getDocs(collection(db, 'users'));
      const allUsers: UserRecord[] = usersSnap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          email: data.email || '',
          displayName: data.displayName || data.email || 'Unknown',
          role: data.role || 'student',
          institutionId: data.institutionId,
          institutionName: data.institutionName,
          status: data.status,
        };
      });

      // Attach user counts
      const roleCounts: Record<string, number> = {};
      allUsers.forEach(u => {
        roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
      });

      loadedRoles = loadedRoles.map(r => ({
        ...r,
        userCount: roleCounts[r.role] || 0,
      }));

      setRoles(loadedRoles);
      setUsers(allUsers);

      // Initialize edit state from loaded roles
      const initialEdits: Record<string, Record<string, boolean>> = {};
      loadedRoles.forEach(r => {
        initialEdits[r.id!] = { ...r.permissions };
      });
      setEditedPermissions(initialEdits);
    } catch (err) {
      console.error('Error loading roles data:', err);
      showToast('Failed to load roles and permissions', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ═══════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  const togglePermission = (roleId: string, permission: string) => {
    setEditedPermissions(prev => {
      const updated = {
        ...prev,
        [roleId]: {
          ...prev[roleId],
          [permission]: !prev[roleId]?.[permission],
        },
      };
      // Check if there are unsaved changes
      const originalRole = roles.find(r => r.id === roleId);
      if (originalRole) {
        const hasDiff = Object.keys(updated[roleId]).some(
          key => updated[roleId][key] !== (originalRole.permissions[key] ?? false)
        );
        setHasChanges(hasDiff);
      }
      return updated;
    });
  };

  const handleBatchSave = async () => {
    setIsSaving(true);
    try {
      const batch = writeBatch(db);
      let changedCount = 0;

      roles.forEach(role => {
        const edited = editedPermissions[role.id!];
        if (!edited) return;

        const hasDiff = Object.keys(edited).some(
          key => edited[key] !== (role.permissions[key] ?? false)
        );
        if (hasDiff) {
          const ref = doc(db, 'roles_permissions', role.id!);
          batch.update(ref, {
            permissions: edited,
            updatedAt: serverTimestamp(),
          });
          changedCount++;
        }
      });

      if (changedCount === 0) {
        showToast('No changes to save');
        setIsSaving(false);
        return;
      }

      await batch.commit();
      setHasChanges(false);
      await loadData();
      showToast(`${changedCount} role(s) updated successfully`);
    } catch (err) {
      console.error('Error saving permissions:', err);
      showToast('Failed to save permission changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      setCreateError('Role name is required');
      return;
    }
    const roleSlug = newRoleName.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    if (!roleSlug) {
      setCreateError('Invalid role name format');
      return;
    }
    if (roles.some(r => r.role === roleSlug)) {
      setCreateError('A role with this name already exists');
      return;
    }

    setIsCreating(true);
    setCreateError('');

    try {
      const enabledCount = Object.values(newRolePermissions).filter(Boolean).length;
      if (enabledCount === 0) {
        setCreateError('Please enable at least one permission');
        setIsCreating(false);
        return;
      }

      await addDoc(collection(db, 'roles_permissions'), {
        role: roleSlug,
        description: newRoleDescription.trim() || `Custom role: ${newRoleName.trim()}`,
        permissions: newRolePermissions,
        isSystemRole: false,
        userCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Register in ROLE_META so it gets proper styling
      ROLE_META[roleSlug] = {
        label: newRoleName.trim(),
        color: 'fuchsia',
        gradient: 'bg-blue-600',
        icon: Layers as React.ElementType,
        badgeBg: 'bg-blue-100',
        badgeText: 'text-blue-700',
      };

      setShowCreateModal(false);
      setNewRoleName('');
      setNewRoleDescription('');
      setNewRolePermissions(Object.fromEntries(ALL_PERMISSIONS.map(p => [p, false])));
      await loadData();
      showToast(`Role "${newRoleName.trim()}" created successfully`);
    } catch (err) {
      console.error('Error creating role:', err);
      showToast('Failed to create custom role', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    if (role.isSystemRole) {
      showToast('Cannot delete system roles', 'error');
      setShowDeleteConfirm(null);
      return;
    }
    if (role.userCount && role.userCount > 0) {
      showToast(`Cannot delete: ${role.userCount} user(s) assigned to this role`, 'error');
      setShowDeleteConfirm(null);
      return;
    }

    try {
      await deleteDoc(doc(db, 'roles_permissions', roleId));
      setShowDeleteConfirm(null);
      await loadData();
      showToast(`Role "${role.role}" deleted successfully`);
    } catch (err) {
      console.error('Error deleting role:', err);
      showToast('Failed to delete role', 'error');
    }
  };

  const handleAssignRole = async (userId: string, newRole: string) => {
    if (!newRole) return;
    setIsAssigning(true);
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      await loadData();
      showToast('User role updated successfully');
    } catch (err) {
      console.error('Error assigning role:', err);
      showToast('Failed to update user role', 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  const resetChanges = () => {
    const initialEdits: Record<string, Record<string, boolean>> = {};
    roles.forEach(r => {
      initialEdits[r.id!] = { ...r.permissions };
    });
    setEditedPermissions(initialEdits);
    setHasChanges(false);
  };

  // ─── Filtered Data ───
  const filteredRoles = useMemo(() => {
    if (!searchQuery.trim()) return roles;
    const q = searchQuery.toLowerCase();
    return roles.filter(
      r =>
        r.role.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        getRoleMeta(r.role).label.toLowerCase().includes(q)
    );
  }, [roles, searchQuery]);

  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return users;
    const q = userSearchQuery.toLowerCase();
    return users.filter(
      u =>
        u.email.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, userSearchQuery]);

  const allAvailableRoles = useMemo(
    () => Array.from(new Set([...SYSTEM_ROLES.map(r => r.role), ...roles.map(r => r.role)])),
    [roles]
  );

  // ═══════════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════════

  function PermissionBadge({ count, total }: { count: number; total: number }) {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={cn(
              'h-full rounded-full',
              pct === 100 ? 'bg-blue-600' : 'bg-blue-500'
            )}
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">{count}/{total}</span>
      </div>
    );
  }

  function CheckboxToggle({
    checked,
    onChange,
    disabled,
  }: {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
  }) {
    return (
      <button
        onClick={onChange}
        disabled={disabled}
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
          checked
            ? 'bg-blue-600 text-white shadow-sm hover:shadow-sm0/30 scale-105'
            : 'bg-slate-100 text-slate-400 hover:bg-slate-200',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {checked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
      </button>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════════════

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
        <p className="text-slate-500 font-medium">Loading roles & permissions...</p>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* ─── Toast Notification ─── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={cn(
              'fixed top-6 left-1/2 z-50 px-5 py-3 rounded-lg shadow-sm flex items-center gap-2 text-sm font-semibold',
              toast.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 text-white'
            )}
          >
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-1.5">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            Roles & Permissions
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage platform roles, configure permission matrices, and assign roles to users.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
              <button
                onClick={resetChanges}
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
              >
                Discard
              </button>
              <button
                onClick={handleBatchSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </motion.div>
          )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Role
          </button>
        </div>
      </motion.div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Roles', value: roles.length, icon: Shield, gradient: '' },
          { label: 'System Roles', value: roles.filter(r => r.isSystemRole).length, icon: Lock, gradient: 'bg-amber-600' },
          { label: 'Custom Roles', value: roles.filter(r => !r.isSystemRole).length, icon: Layers, gradient: 'bg-cyan-600' },
          { label: 'Total Permissions', value: ALL_PERMISSIONS.length, icon: Key, gradient: 'bg-emerald-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={cn('rounded-lg bg p-4 text-white shadow-md', stat.gradient)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs font-medium">{stat.label}</p>
                <p className="text-2xl font-bold mt-0.5">{stat.value}</p>
              </div>
              <stat.icon className="w-8 h-8 text-white/30" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1: ROLE DEFINITIONS
      ═══════════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <GlassCard className="overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Crown className="w-5 h-5 text-blue-600" />
                Role Definitions
                <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {roles.length}
                </span>
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search roles..."
                  className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full sm:w-64"
                />
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
            {filteredRoles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Shield className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No roles found</p>
                <p className="text-xs text-slate-400 mt-1">Try a different search or create a new role.</p>
              </div>
            ) : (
              filteredRoles.map((role, idx) => {
                const meta = getRoleMeta(role.role);
                const Icon = meta.icon;
                const isExpanded = expandedRole === role.id;
                const enabledCount = countEnabledPermissions(editedPermissions[role.id!] || role.permissions);
                const originalCount = countEnabledPermissions(role.permissions);

                return (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <button
                      onClick={() => setExpandedRole(isExpanded ? null : role.id!)}
                      className="w-full px-6 py-4 flex items-center gap-4 hover:bg-blue-50/40 transition-colors text-left"
                    >
                      <div className={cn('rounded-lg p-2.5 bg shadow-sm', meta.gradient)}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900">{meta.label}</span>
                          <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full', meta.badgeBg, meta.badgeText)}>
                            {role.role}
                          </span>
                          {role.isSystemRole && (
                            <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> System
                            </span>
                          )}
                          {!role.isSystemRole && (
                            <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> Custom
                            </span>
                          )}
                          {role.userCount !== undefined && role.userCount > 0 && (
                            <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Users className="w-2.5 h-2.5" /> {role.userCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 truncate">{role.description}</p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <PermissionBadge count={enabledCount} total={ALL_PERMISSIONS.length} />
                        {!role.isSystemRole && (
                          <button
                            onClick={e => { e.stopPropagation(); setShowDeleteConfirm(role.id!); }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete role"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Expanded: Mini permission summary */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-4 bg-slate-50/50">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                              {PERMISSION_CATEGORIES.map(cat => {
                                const CatIcon = cat.icon;
                                const catEnabled = cat.permissions.filter(
                                  p => editedPermissions[role.id!]?.[p]
                                ).length;
                                const catTotal = cat.permissions.length;
                                return (
                                  <div
                                    key={cat.id}
                                    className={cn('rounded-lg p-3 border', cat.bgLight)}
                                  >
                                    <div className="flex items-center gap-1.5 mb-2">
                                      <CatIcon className={cn('w-3.5 h-3.5', cat.textLight)} />
                                      <span className={cn('text-xs font-semibold', cat.textLight)}>
                                        {cat.label}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {cat.permissions.map(p => (
                                        <span
                                          key={p}
                                          className={cn(
                                            'text-[9px] px-1.5 py-0.5 rounded font-medium',
                                            editedPermissions[role.id!]?.[p]
                                              ? 'bg-blue-500 text-white'
                                              : 'bg-slate-200 text-slate-400'
                                          )}
                                        >
                                          {p.split('.')[1]}
                                        </span>
                                      ))}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1.5">{catEnabled}/{catTotal} enabled</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2: PERMISSION MATRIX
      ═══════════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <GlassCard className="overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Permission Matrix
              {hasChanges && (
                <span className="flex items-center gap-1 text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full animate-pulse">
                  <Zap className="w-3 h-3" /> Unsaved changes
                </span>
              )}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Toggle permissions for each role. Changes are batch-saved when you click "Save Changes".
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase sticky left-0 bg-slate-50/95 backdrop-blur-sm z-10 min-w-[160px]">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase min-w-[140px]">
                    Permission
                  </th>
                  {roles.map(role => {
                    const meta = getRoleMeta(role.role);
                    return (
                      <th key={role.id} className="px-2 py-3 text-center min-w-[72px]">
                        <div className="flex flex-col items-center gap-1">
                          <div className={cn('w-6 h-6 rounded-lg bg flex items-center justify-center', meta.gradient)}>
                            <meta.icon className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-[10px] font-semibold text-slate-600 leading-tight max-w-[68px] truncate" title={meta.label}>
                            {meta.label}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {PERMISSION_CATEGORIES.map((cat, catIdx) => (
                  <React.Fragment key={cat.id}>
                    {/* Category Header Row */}
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <td
                        colSpan={2 + roles.length}
                        className="px-4 py-2.5 sticky left-0 bg-slate-50/95 backdrop-blur-sm z-10"
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn('w-5 h-5 rounded-md bg flex items-center justify-center', cat.color)}>
                            <cat.icon className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{cat.label}</span>
                          <span className="text-[10px] text-slate-400">({cat.permissions.length})</span>
                        </div>
                      </td>
                    </tr>
                    {cat.permissions.map((perm, permIdx) => (
                      <tr
                        key={perm}
                        className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors"
                      >
                        {permIdx === 0 ? (
                          <td
                            rowSpan={cat.permissions.length}
                            className="px-4 py-2 align-top sticky left-0 bg-white backdrop-blur-sm z-10"
                          >
                            <span className={cn('text-[10px] font-semibold px-2 py-1 rounded-md', cat.bgLight, cat.textLight)}>
                              {cat.label}
                            </span>
                          </td>
                        ) : null}
                        <td className="px-4 py-2 text-xs font-medium text-slate-700">
                          {formatPermissionLabel(perm)}
                        </td>
                        {roles.map(role => {
                          const isChecked = editedPermissions[role.id!]?.[perm] ?? role.permissions[perm] ?? false;
                          const isSystemRoleSuperAdmin = role.role === 'super_admin';
                          return (
                            <td key={role.id} className="px-2 py-2 text-center">
                              <div className="flex justify-center">
                                <CheckboxToggle
                                  checked={isChecked}
                                  onChange={() => togglePermission(role.id!, perm)}
                                  disabled={isSystemRoleSuperAdmin}
                                />
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: ROLE ASSIGNMENT
      ═══════════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <GlassCard className="overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-blue-600" />
                  Role Assignment
                  <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {users.length} users
                  </span>
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Search users and change their role assignment via dropdown.
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={e => setUserSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or role..."
                  className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full sm:w-72"
                />
              </div>
            </div>
          </div>

          <div className="max-h-[480px] overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No users found</p>
                <p className="text-xs text-slate-400 mt-1">Try a different search term.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredUsers.map((user, idx) => {
                  const meta = getRoleMeta(user.role);
                  const Icon = meta.icon;
                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="px-6 py-3 flex items-center gap-4 hover:bg-blue-50/30 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-blue-600">
                          {user.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user.displayName}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>

                      {user.institutionName && (
                        <span className="hidden md:inline text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {user.institutionName}
                        </span>
                      )}

                      <select
                        value={selectedUserRole[user.id] ?? user.role}
                        onChange={e => {
                          const newRole = e.target.value;
                          setSelectedUserRole(prev => ({ ...prev, [user.id]: newRole }));
                          handleAssignRole(user.id, newRole);
                        }}
                        disabled={isAssigning}
                        className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer min-w-[140px]"
                      >
                        {allAvailableRoles.map(roleKey => (
                          <option key={roleKey} value={roleKey}>
                            {getRoleMeta(roleKey).label}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          MODAL: CREATE CUSTOM ROLE
      ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-lg shadow-md w-full max-w-2xl max-h-[85vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-blue-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 rounded-lg p-2">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Create Custom Role</h2>
                      <p className="text-blue-200 text-sm">Define a new institution-specific role with custom permissions.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)] space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Role Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newRoleName}
                      onChange={e => { setNewRoleName(e.target.value); setCreateError(''); }}
                      placeholder="e.g. Lab Assistant, Dean, Program Coordinator"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={newRoleDescription}
                      onChange={e => setNewRoleDescription(e.target.value)}
                      placeholder="Describe the purpose and scope of this role..."
                      rows={2}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {createError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {createError}
                  </motion.div>
                )}

                {/* Permission Selector */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-slate-700">Permissions</label>
                    <span className="text-xs font-medium text-slate-500">
                      {Object.values(newRolePermissions).filter(Boolean).length}/{ALL_PERMISSIONS.length} enabled
                    </span>
                  </div>
                  <div className="space-y-3">
                    {PERMISSION_CATEGORIES.map(cat => {
                      const CatIcon = cat.icon;
                      const catEnabled = cat.permissions.filter(p => newRolePermissions[p]).length;
                      const allCatEnabled = catEnabled === cat.permissions.length;
                      return (
                        <div key={cat.id} className={cn('rounded-lg border p-4', cat.bgLight)}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <CatIcon className={cn('w-4 h-4', cat.textLight)} />
                              <span className="text-sm font-bold text-slate-800">{cat.label}</span>
                              <span className="text-[10px] font-medium text-slate-400">
                                {catEnabled}/{cat.permissions.length}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                const newState = { ...newRolePermissions };
                                cat.permissions.forEach(p => {
                                  newState[p] = !allCatEnabled;
                                });
                                setNewRolePermissions(newState);
                              }}
                              className={cn(
                                'text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all',
                                allCatEnabled
                                  ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                  : 'bg-blue-600 text-white hover:from-blue-600 hover:to-indigo-600'
                              )}
                            >
                              {allCatEnabled ? 'Deselect All' : 'Select All'}
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {cat.permissions.map(p => {
                              const isEnabled = newRolePermissions[p];
                              return (
                                <button
                                  key={p}
                                  onClick={() => {
                                    setNewRolePermissions(prev => ({
                                      ...prev,
                                      [p]: !prev[p],
                                    }));
                                  }}
                                  className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                                    isEnabled
                                      ? 'bg-blue-600 text-white shadow-sm'
                                      : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
                                  )}
                                >
                                  {isEnabled ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                                  {formatPermissionLabel(p)}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateError('');
                    setNewRoleName('');
                    setNewRoleDescription('');
                    setNewRolePermissions(Object.fromEntries(ALL_PERMISSIONS.map(p => [p, false])));
                  }}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRole}
                  disabled={isCreating || !newRoleName.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create Role
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          MODAL: DELETE CONFIRMATION
      ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-md w-full max-w-sm overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="bg-rose-100 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7 text-rose-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Custom Role</h3>
                <p className="text-sm text-slate-500 mb-1">
                  Are you sure you want to delete this role?
                </p>
                <p className="text-xs text-slate-400">
                  This action cannot be undone. The role will be permanently removed.
                </p>
              </div>
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteRole(showDeleteConfirm)}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-all shadow-sm"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
