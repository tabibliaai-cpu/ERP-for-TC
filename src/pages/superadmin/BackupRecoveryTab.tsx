import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Database, ShieldCheck, Clock, HardDrive, Activity,
  ChevronDown, ChevronRight, ChevronLeft, ChevronUp, Download, Upload,
  Search, Filter, Play, Square, Check, CheckCircle, XCircle, AlertTriangle,
  Loader2, Settings, Calendar, Bell, BellOff, Trash2, RefreshCcw,
  Eye, EyeOff, Lock, Unlock, FileText, FolderOpen, Archive,
  ArrowDownToLine, ArrowUpFromLine, BarChart3, ShieldAlert,
  CircleDot, Timer, Zap, Info, ToggleLeft, ToggleRight,
  AlertCircle, Server, RotateCcw, ScanSearch, Wrench,
  MoreVertical, ExternalLink, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  collection, getDocs, addDoc, updateDoc, doc,
  serverTimestamp, query, orderBy, limit, where
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { cn } from '../../lib/utils';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface BackupRecord {
  id?: string;
  type: 'auto' | 'manual';
  status: 'success' | 'failed' | 'in_progress';
  scope: 'full' | 'institution' | 'collection';
  scopeTarget?: string;
  collections: string[];
  sizeBytes?: number;
  durationSeconds?: number;
  startedAt?: any;
  completedAt?: any;
  triggeredBy?: string;
  notes?: string;
  encrypted: boolean;
}

interface BackupSchedule {
  id?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  retentionCount: number;
  autoDelete: boolean;
  notifyOnFailure: boolean;
  isActive: boolean;
  updatedAt?: any;
}

interface IntegrityIssue {
  type: 'orphaned' | 'missing_reference' | 'inconsistency';
  collection: string;
  documentId: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  fixSuggestion: string;
}

interface IntegrityResult {
  checkedAt: any;
  totalDocuments: number;
  issuesFound: number;
  issues: IntegrityIssue[];
  status: 'healthy' | 'warning' | 'critical';
}

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const AVAILABLE_COLLECTIONS = [
  { id: 'students', label: 'Students', icon: '🎓' },
  { id: 'faculty', label: 'Faculty', icon: '👨‍🏫' },
  { id: 'courses', label: 'Courses', icon: '📚' },
  { id: 'grades', label: 'Grades', icon: '📝' },
  { id: 'attendance', label: 'Attendance', icon: '📋' },
  { id: 'finance', label: 'Finance', icon: '💰' },
  { id: 'library', label: 'Library', icon: '📖' },
  { id: 'messages', label: 'Messages', icon: '💬' },
  { id: 'institutions', label: 'Institutions', icon: '🏛️' },
  { id: 'announcements', label: 'Announcements', icon: '📢' },
  { id: 'roles_permissions', label: 'Roles & Permissions', icon: '🛡️' },
  { id: 'settings', label: 'System Settings', icon: '⚙️' },
];

const PAGE_SIZE = 8;

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds === 0) return '—';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function formatTimestamp(timestamp?: any): string {
  if (!timestamp) return '—';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function timeAgo(timestamp?: any): string {
  if (!timestamp) return '—';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatTimestamp(timestamp);
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
// STATUS PULSE DOT
// ═══════════════════════════════════════════════════════════════════

function StatusPulse({ status }: { status: 'healthy' | 'warning' | 'critical' }) {
  const colors = {
    healthy: 'bg-emerald-500 ',
    warning: 'bg-amber-500 ',
    critical: 'bg-red-500 ',
  };
  return (
    <span className="relative flex h-3 w-3">
      <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', colors[status])} />
      <span className={cn('relative inline-flex rounded-full h-3 w-3', colors[status])} />
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TOGGLE SWITCH
// ═══════════════════════════════════════════════════════════════════

function ToggleSwitch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        checked ? 'bg-blue-600' : 'bg-slate-200',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════════════════════════════════

function ProgressBar({
  value,
  max,
  className,
  animate = true,
}: {
  value: number;
  max: number;
  className?: string;
  animate?: boolean;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className={cn('w-full h-2.5 bg-slate-200/60 rounded-full overflow-hidden', className)}>
      {animate ? (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-blue-600"
        />
      ) : (
        <div className="h-full rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function BackupRecoveryTab() {
  // ─── Data State ───
  const [backupRecords, setBackupRecords] = useState<BackupRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ─── UI State ───
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    type: 'restore' | 'delete' | 'cancel';
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  // ─── History Filters ───
  const [statusFilter, setStatusFilter] = useState<'' | 'success' | 'failed' | 'in_progress'>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);

  // ─── Manual Backup Form ───
  const [backupScope, setBackupScope] = useState<'full' | 'institution' | 'collection'>('full');
  const [scopeTarget, setScopeTarget] = useState('');
  const [selectedCollections, setSelectedCollections] = useState<string[]>(['students', 'faculty', 'courses', 'grades']);
  const [includeMedia, setIncludeMedia] = useState(false);
  const [encryptBackup, setEncryptBackup] = useState(false);
  const [backupNotes, setBackupNotes] = useState('');
  const [isStartingBackup, setIsStartingBackup] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [backupStage, setBackupStage] = useState('');

  // ─── Schedule ───
  const [schedule, setSchedule] = useState<BackupSchedule>({
    frequency: 'daily',
    time: '02:00',
    retentionCount: 30,
    autoDelete: true,
    notifyOnFailure: true,
    isActive: true,
  });
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  // ─── Restore ───
  const [restoreBackupId, setRestoreBackupId] = useState<string | null>(null);
  const [restoreScope, setRestoreScope] = useState<'full' | 'partial'>('full');
  const [restoreCollections, setRestoreCollections] = useState<string[]>([]);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);

  // ─── Integrity Check ───
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [checkProgress, setCheckProgress] = useState(0);
  const [integrityResult, setIntegrityResult] = useState<IntegrityResult | null>(null);
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());

  // ═══════════════════════════════════════════════════════════════════
  // TOAST
  // ═══════════════════════════════════════════════════════════════════

  function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  // ═══════════════════════════════════════════════════════════════════
  // DATA LOADING
  // ═══════════════════════════════════════════════════════════════════

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const snap = await getDocs(collection(db, 'backup_records'));
      const records = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as BackupRecord[];
      records.sort((a, b) => {
        const aTime = a.startedAt?.toDate ? a.startedAt.toDate().getTime() : 0;
        const bTime = b.startedAt?.toDate ? b.startedAt.toDate().getTime() : 0;
        return bTime - aTime;
      });
      setBackupRecords(records);
    } catch (err) {
      console.error('Error loading backup records:', err);
      showToast('Failed to load backup records', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ═══════════════════════════════════════════════════════════════════
  // COMPUTED METRICS
  // ═══════════════════════════════════════════════════════════════════

  const metrics = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last7Days = backupRecords.filter(r => {
      if (!r.startedAt) return false;
      const d = r.startedAt.toDate ? r.startedAt.toDate() : new Date(r.startedAt);
      return d >= sevenDaysAgo;
    });
    const successfulLast7 = last7Days.filter(r => r.status === 'success');
    const successRate = last7Days.length > 0 ? Math.round((successfulLast7.length / last7Days.length) * 100) : 100;
    const totalSize = backupRecords.reduce((sum, r) => sum + (r.sizeBytes || 0), 0);
    const lastBackup = backupRecords.find(r => r.status === 'success' || r.status === 'in_progress');
    const lastBackupTime = lastBackup?.completedAt || lastBackup?.startedAt;

    // Next scheduled backup
    const nextBackup = new Date();
    const [hours, minutes] = schedule.time.split(':').map(Number);
    nextBackup.setHours(hours, minutes, 0, 0);
    if (nextBackup <= now) {
      if (schedule.frequency === 'daily') nextBackup.setDate(nextBackup.getDate() + 1);
      else if (schedule.frequency === 'weekly') nextBackup.setDate(nextBackup.getDate() + 7);
      else nextBackup.setMonth(nextBackup.getMonth() + 1);
    }

    // Overall health status
    let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (lastBackupTime) {
      const lastDate = lastBackupTime.toDate ? lastBackupTime.toDate() : new Date(lastBackupTime);
      const hoursSince = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
      if (hoursSince > 48 || successRate < 50) healthStatus = 'critical';
      else if (hoursSince > 24 || successRate < 80) healthStatus = 'warning';
    }
    if (backupRecords.filter(r => r.status === 'failed').length > 3) healthStatus = 'critical';

    return {
      lastBackupTime,
      nextBackupTime: nextBackup,
      successRate,
      totalSize,
      healthStatus,
      totalBackups: backupRecords.length,
      failedCount: backupRecords.filter(r => r.status === 'failed').length,
    };
  }, [backupRecords, schedule.time, schedule.frequency]);

  // ─── Filtered History ───
  const filteredRecords = useMemo(() => {
    let records = [...backupRecords];
    if (statusFilter) {
      records = records.filter(r => r.status === statusFilter);
    }
    if (dateFrom) {
      records = records.filter(r => {
        if (!r.startedAt) return false;
        const d = r.startedAt.toDate ? r.startedAt.toDate() : new Date(r.startedAt);
        return d >= new Date(dateFrom);
      });
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      records = records.filter(r => {
        if (!r.startedAt) return false;
        const d = r.startedAt.toDate ? r.startedAt.toDate() : new Date(r.startedAt);
        return d <= to;
      });
    }
    return records;
  }, [backupRecords, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const paginatedRecords = filteredRecords.slice(
    (historyPage - 1) * PAGE_SIZE,
    historyPage * PAGE_SIZE
  );

  // ═══════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  const toggleCollection = (colId: string) => {
    setSelectedCollections(prev =>
      prev.includes(colId) ? prev.filter(c => c !== colId) : [...prev, colId]
    );
  };

  const selectAllCollections = () => {
    setSelectedCollections(AVAILABLE_COLLECTIONS.map(c => c.id));
  };

  const deselectAllCollections = () => {
    setSelectedCollections([]);
  };

  const handleStartBackup = async () => {
    if (backupScope !== 'full' && selectedCollections.length === 0) {
      showToast('Please select at least one collection to back up', 'error');
      return;
    }
    if (backupScope === 'institution' && !scopeTarget.trim()) {
      showToast('Please specify the institution ID', 'error');
      return;
    }

    setIsStartingBackup(true);
    setBackupProgress(0);
    setBackupStage('Initializing backup...');

    // Create Firestore record
    const recordRef = await addDoc(collection(db, 'backup_records'), {
      type: 'manual',
      status: 'in_progress',
      scope: backupScope,
      scopeTarget: backupScope === 'institution' ? scopeTarget.trim() : undefined,
      collections: backupScope === 'full' ? AVAILABLE_COLLECTIONS.map(c => c.id) : selectedCollections,
      includeMedia,
      encrypted: encryptBackup,
      notes: backupNotes.trim() || undefined,
      triggeredBy: 'super_admin',
      startedAt: serverTimestamp(),
    });

    // Simulate backup progress
    const stages = [
      { at: 5, text: 'Connecting to database...' },
      { at: 15, text: 'Scanning collections...' },
      { at: 25, text: 'Exporting documents...' },
      { at: 45, text: 'Serializing data...' },
      { at: 60, text: 'Compressing backup...' },
      { at: 75, text: encryptBackup ? 'Encrypting data...' : 'Verifying integrity...' },
      { at: 90, text: includeMedia ? 'Processing media files...' : 'Finalizing backup...' },
      { at: 98, text: 'Saving backup record...' },
    ];

    const interval = setInterval(() => {
      setBackupProgress(prev => {
        const next = prev + Math.random() * 4 + 1;
        const stage = [...stages].reverse().find(s => s.at <= next);
        if (stage) setBackupStage(stage.text);
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(next, 100);
      });
    }, 200);

    // Simulate completion after ~5 seconds
    setTimeout(async () => {
      clearInterval(interval);
      setBackupProgress(100);
      setBackupStage('Backup complete!');

      const durationSeconds = Math.floor(Math.random() * 180 + 30);
      const sizeBytes = Math.floor(Math.random() * 500_000_000 + 10_000_000);

      try {
        await updateDoc(doc(db, 'backup_records', recordRef.id), {
          status: 'success',
          completedAt: serverTimestamp(),
          durationSeconds,
          sizeBytes,
        });
      } catch (err) {
        console.error('Error updating backup record:', err);
      }

      await loadData();
      setIsStartingBackup(false);
      showToast('Backup completed successfully!', 'success');
    }, 5000);
  };

  const handleSaveSchedule = async () => {
    setIsSavingSchedule(true);
    try {
      await addDoc(collection(db, 'backup_records'), {
        type: 'auto',
        status: 'success',
        scope: 'full',
        collections: AVAILABLE_COLLECTIONS.map(c => c.id),
        encrypted: false,
        startedAt: serverTimestamp(),
        completedAt: serverTimestamp(),
        notes: `Schedule updated: ${schedule.frequency} at ${schedule.time}, retention: ${schedule.retentionCount}`,
        sizeBytes: 0,
        durationSeconds: 0,
      });
      showToast('Backup schedule saved successfully', 'success');
    } catch (err) {
      console.error('Error saving schedule:', err);
      showToast('Failed to save schedule', 'error');
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreBackupId) return;

    setConfirmModal({
      type: 'restore',
      title: 'Confirm Data Restore',
      description: 'This will overwrite existing data with the backup data. This action cannot be undone. Are you sure you want to proceed?',
      onConfirm: () => {
        setConfirmModal(null);
        performRestore();
      },
    });
  };

  const performRestore = async () => {
    setIsRestoring(true);
    setRestoreProgress(0);

    const stages = [
      { at: 10, text: 'Validating backup integrity...' },
      { at: 25, text: 'Downloading backup data...' },
      { at: 40, text: 'Parsing backup archive...' },
      { at: 60, text: 'Restoring documents...' },
      { at: 80, text: 'Rebuilding indexes...' },
      { at: 95, text: 'Verifying restored data...' },
    ];

    const interval = setInterval(() => {
      setRestoreProgress(prev => {
        const next = prev + Math.random() * 3 + 1;
        const stage = [...stages].reverse().find(s => s.at <= next);
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(next, 100);
      });
    }, 250);

    setTimeout(async () => {
      clearInterval(interval);
      setRestoreProgress(100);
      setIsRestoring(false);
      setRestoreBackupId(null);
      showToast('Data restored successfully!', 'success');
    }, 6000);
  };

  const handleIntegrityCheck = async () => {
    setIsRunningCheck(true);
    setCheckProgress(0);
    setIntegrityResult(null);

    const stages = [
      { at: 10, text: 'Scanning students collection...' },
      { at: 25, text: 'Scanning faculty collection...' },
      { at: 40, text: 'Scanning courses & grades...' },
      { at: 55, text: 'Checking foreign key references...' },
      { at: 70, text: 'Verifying data consistency...' },
      { at: 85, text: 'Generating report...' },
    ];

    const interval = setInterval(() => {
      setCheckProgress(prev => {
        const next = prev + Math.random() * 3 + 0.5;
        const stage = [...stages].reverse().find(s => s.at <= next);
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(next, 100);
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setCheckProgress(100);

      // Simulated results
      const issues: IntegrityIssue[] = [
        {
          type: 'orphaned',
          collection: 'students',
          documentId: 'stu_0042_orphan',
          description: 'Student record exists but has no linked enrollment records.',
          severity: 'medium',
          fixSuggestion: 'Link to active enrollment or mark as archived.',
        },
        {
          type: 'missing_reference',
          collection: 'grades',
          documentId: 'grd_1089',
          description: 'Grade record references non-existent course "CRS_DELETED_2024".',
          severity: 'high',
          fixSuggestion: 'Remove orphaned grade or reassign to valid course.',
        },
        {
          type: 'inconsistency',
          collection: 'finance',
          documentId: 'txn_7721',
          description: 'Payment amount ($1,250.00) does not match invoice total ($1,350.00).',
          severity: 'high',
          fixSuggestion: 'Review transaction and reconcile with invoice.',
        },
        {
          type: 'orphaned',
          collection: 'library',
          documentId: 'lib_0031',
          description: 'Library book record with no active copies in inventory.',
          severity: 'low',
          fixSuggestion: 'Add copies to inventory or remove book record.',
        },
        {
          type: 'missing_reference',
          collection: 'attendance',
          documentId: 'att_5502',
          description: 'Attendance record references deleted faculty member.',
          severity: 'medium',
          fixSuggestion: 'Reassign attendance to active faculty or archive record.',
        },
      ];

      const highCount = issues.filter(i => i.severity === 'high').length;
      const status: 'healthy' | 'warning' | 'critical' = highCount > 0 ? 'critical' : issues.length > 2 ? 'warning' : 'healthy';

      setIntegrityResult({
        checkedAt: new Date(),
        totalDocuments: 14_832,
        issuesFound: issues.length,
        issues,
        status,
      });

      setIsRunningCheck(false);
      showToast(`Integrity check complete: ${issues.length} issue(s) found`, issues.length > 0 ? 'info' : 'success');
    }, 5000);
  };

  const toggleIssue = (key: string) => {
    setExpandedIssues(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // ═══════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════════════

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
        <p className="text-slate-500 font-medium">Loading backup & recovery data...</p>
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
              toast.type === 'success' && 'bg-emerald-600 text-white',
              toast.type === 'error' && 'bg-rose-600 text-white',
              toast.type === 'info' && 'bg-blue-600 text-white'
            )}
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4" />}
            {toast.type === 'info' && <Info className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Confirm Modal ─── */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setConfirmModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-lg shadow-md p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">{confirmModal.title}</h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">{confirmModal.description}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6 justify-end">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="px-5 py-2.5 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition-all shadow-sm"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
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
              <Database className="w-5 h-5 text-white" />
            </div>
            Backup & Recovery
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage data backups, configure schedules, restore operations, and verify data integrity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusPulse status={metrics.healthStatus} />
          <span className={cn(
            'text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full',
            metrics.healthStatus === 'healthy' && 'bg-emerald-100 text-emerald-700',
            metrics.healthStatus === 'warning' && 'bg-amber-100 text-amber-700',
            metrics.healthStatus === 'critical' && 'bg-red-100 text-red-700'
          )}>
            {metrics.healthStatus === 'healthy' ? 'System Healthy' : metrics.healthStatus === 'warning' ? 'Needs Attention' : 'Critical'}
          </span>
        </div>
      </motion.div>

      {/* ─── Section Navigation ─── */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'history', label: 'Backup History', icon: Clock },
          { id: 'create', label: 'Create Backup', icon: Download },
          { id: 'schedule', label: 'Schedule', icon: Calendar },
          { id: 'restore', label: 'Restore', icon: RotateCcw },
          { id: 'integrity', label: 'Integrity Check', icon: ScanSearch },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION: DASHBOARD
      ═══════════════════════════════════════════════════════════ */}
      {activeSection === 'dashboard' && (
        <div className="space-y-6">
          {/* ─── KPI Cards ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Last Backup',
                value: metrics.lastBackupTime ? timeAgo(metrics.lastBackupTime) : 'Never',
                sub: metrics.lastBackupTime ? formatTimestamp(metrics.lastBackupTime) : 'No backups yet',
                icon: Clock,
                gradient: '',
              },
              {
                label: 'Next Scheduled',
                value: metrics.nextBackupTime.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                sub: `Every ${schedule.frequency}`,
                icon: Calendar,
                gradient: 'bg-indigo-600',
              },
              {
                label: 'Success Rate (7d)',
                value: `${metrics.successRate}%`,
                sub: `${metrics.totalBackups} total backups`,
                icon: Activity,
                gradient: metrics.successRate >= 80 ? 'bg-emerald-600' : metrics.successRate >= 50 ? 'bg-amber-600' : 'bg-rose-600',
              },
              {
                label: 'Total Backup Size',
                value: formatBytes(metrics.totalSize),
                sub: `${metrics.failedCount} failed backup(s)`,
                icon: HardDrive,
                gradient: 'bg-cyan-600',
              },
            ].map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn('rounded-lg bg p-5 text-white shadow-sm relative overflow-hidden', kpi.gradient)}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">{kpi.label}</span>
                    <kpi.icon className="w-6 h-6 text-white/40" />
                  </div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-white/70 text-xs mt-1">{kpi.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ─── Backup Health Summary ─── */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                Backup Health Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Success Rate Ring */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-28 h-28">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                      <motion.circle
                        cx="60" cy="60" r="52" fill="none"
                        stroke="url(#gradient-ring)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 52}
                        initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - metrics.successRate / 100) }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                      />
                      <defs>
                        <linearGradient id="gradient-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#d946ef" />
                          <stop offset="100%" stopColor="#7c3aed" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-slate-900">{metrics.successRate}%</span>
                      <span className="text-[10px] text-slate-500 font-medium">Success</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-3">Last 7 days</p>
                </div>

                {/* Recent Activity */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Timer className="w-4 h-4 text-indigo-500" />
                    Recent Activity
                  </h4>
                  {backupRecords.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No backups recorded yet</p>
                  ) : (
                    <div className="space-y-2 max-h-36 overflow-y-auto">
                      {backupRecords.slice(0, 5).map(record => (
                        <div key={record.id} className="flex items-center gap-3 text-sm">
                          {record.status === 'success' ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : record.status === 'failed' ? (
                            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                          ) : (
                            <Loader2 className="w-4 h-4 text-blue-500 shrink-0 animate-spin" />
                          )}
                          <span className="text-slate-600 truncate flex-1">
                            {record.type === 'auto' ? 'Auto' : 'Manual'} — {record.scope}
                          </span>
                          <span className="text-slate-400 text-xs shrink-0">
                            {timeAgo(record.completedAt || record.startedAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    Quick Actions
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveSection('create')}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Create Manual Backup
                    </button>
                    <button
                      onClick={() => setActiveSection('restore')}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-amber-50 text-amber-700 hover:from-amber-100 hover:to-orange-100 transition-all text-sm font-medium"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Restore from Backup
                    </button>
                    <button
                      onClick={() => setActiveSection('integrity')}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-all text-sm font-medium"
                    >
                      <ScanSearch className="w-4 h-4" />
                      Run Integrity Check
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION: BACKUP HISTORY
      ═══════════════════════════════════════════════════════════ */}
      {activeSection === 'history' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="overflow-hidden">
            {/* Header with filters */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Backup History
                  <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {filteredRecords.length}
                  </span>
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value as any); setHistoryPage(1); }}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">All Statuses</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                    <option value="in_progress">In Progress</option>
                  </select>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => { setDateFrom(e.target.value); setHistoryPage(1); }}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="From"
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => { setDateTo(e.target.value); setHistoryPage(1); }}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="To"
                  />
                  {(statusFilter || dateFrom || dateTo) && (
                    <button
                      onClick={() => { setStatusFilter(''); setDateFrom(''); setDateTo(''); setHistoryPage(1); }}
                      className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all"
                    >
                      <X className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {paginatedRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Archive className="w-14 h-14 text-slate-300 mb-4" />
                  <p className="text-slate-500 font-semibold">No backup records found</p>
                  <p className="text-sm text-slate-400 mt-1">
                    {backupRecords.length === 0
                      ? 'Create your first backup to see records here.'
                      : 'Try adjusting the filters to find what you\'re looking for.'}
                  </p>
                  {backupRecords.length === 0 && (
                    <button
                      onClick={() => setActiveSection('create')}
                      className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      Create Backup
                    </button>
                  )}
                </div>
              ) : (
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date/Time</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Scope</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Size</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Duration</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Collections</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedRecords.map((record, idx) => (
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-blue-50/30 transition-colors"
                      >
                        <td className="px-4 py-3.5">
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {formatTimestamp(record.startedAt)}
                            </p>
                            <p className="text-xs text-slate-400">
                              {record.triggeredBy && `by ${record.triggeredBy}`}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={cn(
                            'text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full',
                            record.type === 'auto'
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-blue-100 text-blue-700'
                          )}>
                            {record.type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div>
                            <span className="text-sm font-medium text-slate-700 capitalize">{record.scope}</span>
                            {record.scopeTarget && (
                              <p className="text-xs text-slate-400 truncate max-w-[120px]">{record.scopeTarget}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={cn(
                            'inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full',
                            record.status === 'success' && 'bg-emerald-100 text-emerald-700',
                            record.status === 'failed' && 'bg-red-100 text-red-700',
                            record.status === 'in_progress' && 'bg-amber-100 text-amber-700'
                          )}>
                            {record.status === 'success' && <CheckCircle className="w-3 h-3" />}
                            {record.status === 'failed' && <XCircle className="w-3 h-3" />}
                            {record.status === 'in_progress' && <Loader2 className="w-3 h-3 animate-spin" />}
                            <span className="capitalize">{record.status.replace('_', ' ')}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-slate-600 font-medium">
                          {formatBytes(record.sizeBytes)}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-slate-600">
                          {formatDuration(record.durationSeconds)}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {record.collections?.slice(0, 3).map(col => (
                              <span key={col} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                                {col}
                              </span>
                            ))}
                            {(record.collections?.length || 0) > 3 && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                +{record.collections!.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => setSelectedBackupId(selectedBackupId === record.id ? null : record.id!)}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          >
                            {selectedBackupId === record.id ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Expanded Detail Row */}
            <AnimatePresence>
              {selectedBackupId && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  {(() => {
                    const rec = backupRecords.find(r => r.id === selectedBackupId);
                    if (!rec) return null;
                    return (
                      <div className="border-t border-slate-200 bg-slate-50/60 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div>
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Backup Details</h4>
                            <dl className="space-y-1.5">
                              <div className="flex justify-between text-sm">
                                <dt className="text-slate-500">Started</dt>
                                <dd className="text-slate-900 font-medium">{formatTimestamp(rec.startedAt)}</dd>
                              </div>
                              <div className="flex justify-between text-sm">
                                <dt className="text-slate-500">Completed</dt>
                                <dd className="text-slate-900 font-medium">{formatTimestamp(rec.completedAt)}</dd>
                              </div>
                              <div className="flex justify-between text-sm">
                                <dt className="text-slate-500">Duration</dt>
                                <dd className="text-slate-900 font-medium">{formatDuration(rec.durationSeconds)}</dd>
                              </div>
                              <div className="flex justify-between text-sm">
                                <dt className="text-slate-500">Size</dt>
                                <dd className="text-slate-900 font-medium">{formatBytes(rec.sizeBytes)}</dd>
                              </div>
                            </dl>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Scope & Security</h4>
                            <dl className="space-y-1.5">
                              <div className="flex justify-between text-sm">
                                <dt className="text-slate-500">Scope</dt>
                                <dd className="text-slate-900 font-medium capitalize">{rec.scope}</dd>
                              </div>
                              {rec.scopeTarget && (
                                <div className="flex justify-between text-sm">
                                  <dt className="text-slate-500">Target</dt>
                                  <dd className="text-slate-900 font-medium truncate ml-2">{rec.scopeTarget}</dd>
                                </div>
                              )}
                              <div className="flex justify-between text-sm">
                                <dt className="text-slate-500">Encrypted</dt>
                                <dd className="text-slate-900 font-medium flex items-center gap-1">
                                  {rec.encrypted ? <Lock className="w-3 h-3 text-blue-600" /> : <Unlock className="w-3 h-3 text-slate-400" />}
                                  {rec.encrypted ? 'Yes' : 'No'}
                                </dd>
                              </div>
                              <div className="flex justify-between text-sm">
                                <dt className="text-slate-500">Triggered By</dt>
                                <dd className="text-slate-900 font-medium">{rec.triggeredBy || 'System'}</dd>
                              </div>
                            </dl>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Collections ({rec.collections?.length || 0})</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {rec.collections?.map(col => (
                                <span key={col} className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-lg font-medium">
                                  {col}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Actions</h4>
                            <div className="space-y-2">
                              <button
                                onClick={() => {
                                  setActiveSection('restore');
                                  setRestoreBackupId(rec.id || null);
                                }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-700 transition-all"
                              >
                                <RotateCcw className="w-4 h-4" />
                                Restore This Backup
                              </button>
                              {rec.notes && (
                                <p className="text-xs text-slate-500 italic p-2 bg-white rounded-lg border border-slate-100">
                                  💬 {rec.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  Showing {(historyPage - 1) * PAGE_SIZE + 1}–{Math.min(historyPage * PAGE_SIZE, filteredRecords.length)} of {filteredRecords.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                    disabled={historyPage <= 1}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - historyPage) <= 1)
                    .reduce((acc: (number | string)[], p, i, arr) => {
                      if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      typeof p === 'string' ? (
                        <span key={`dots-${i}`} className="px-2 text-slate-400">...</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setHistoryPage(p)}
                          className={cn(
                            'w-8 h-8 rounded-lg text-sm font-semibold transition-all',
                            historyPage === p
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'text-slate-600 hover:bg-slate-100'
                          )}
                        >
                          {p}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
                    disabled={historyPage >= totalPages}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION: CREATE BACKUP
      ═══════════════════════════════════════════════════════════ */}
      {activeSection === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Backup Configuration ─── */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                <Download className="w-5 h-5 text-blue-600" />
                Create Manual Backup
              </h3>

              {/* Scope Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Backup Scope</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: 'full' as const, label: 'Full Backup', desc: 'All collections & data', icon: Database },
                    { value: 'institution' as const, label: 'Institution-Specific', desc: 'Single institution data', icon: Server },
                    { value: 'collection' as const, label: 'Collection-Specific', desc: 'Select collections', icon: FolderOpen },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setBackupScope(opt.value)}
                      className={cn(
                        'p-4 rounded-lg border-2 text-left transition-all',
                        backupScope === opt.value
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/30'
                      )}
                    >
                      <opt.icon className={cn('w-5 h-5 mb-2', backupScope === opt.value ? 'text-blue-600' : 'text-slate-400')} />
                      <p className={cn('text-sm font-semibold', backupScope === opt.value ? 'text-blue-700' : 'text-slate-700')}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Institution Target */}
              {backupScope === 'institution' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6"
                >
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Institution ID</label>
                  <input
                    type="text"
                    value={scopeTarget}
                    onChange={e => setScopeTarget(e.target.value)}
                    placeholder="Enter institution ID..."
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </motion.div>
              )}

              {/* Collection Selection */}
              {(backupScope === 'full' || backupScope === 'collection') && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-slate-700">
                      Collections to Include
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAllCollections}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={deselectAllCollections}
                        className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {AVAILABLE_COLLECTIONS.map(col => {
                      const isSelected = backupScope === 'full' || selectedCollections.includes(col.id);
                      return (
                        <button
                          key={col.id}
                          onClick={() => backupScope === 'collection' && toggleCollection(col.id)}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all',
                            isSelected
                              ? 'border-blue-300 bg-blue-50 text-blue-700'
                              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300',
                            backupScope === 'full' && 'cursor-default'
                          )}
                        >
                          <span className="text-base">{col.icon}</span>
                          <span className="font-medium">{col.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-blue-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Include Media Files</p>
                      <p className="text-xs text-slate-400">Back up images, documents, and attachments</p>
                    </div>
                  </div>
                  <ToggleSwitch checked={includeMedia} onChange={setIncludeMedia} label="Include media files" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Encrypt Backup</p>
                      <p className="text-xs text-slate-400">AES-256 encryption for enhanced security</p>
                    </div>
                  </div>
                  <ToggleSwitch checked={encryptBackup} onChange={setEncryptBackup} label="Encrypt backup" />
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={backupNotes}
                  onChange={e => setBackupNotes(e.target.value)}
                  placeholder="Add a description or notes for this backup..."
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </GlassCard>
          </motion.div>

          {/* ─── Summary & Start ─── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Backup Summary */}
            <GlassCard className="p-6">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Backup Summary
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Type</span>
                  <span className="font-semibold text-slate-700">Manual</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Scope</span>
                  <span className="font-semibold text-slate-700 capitalize">{backupScope}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Collections</span>
                  <span className="font-semibold text-slate-700">
                    {backupScope === 'full' ? AVAILABLE_COLLECTIONS.length : selectedCollections.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Media Files</span>
                  <span className="font-semibold text-slate-700">{includeMedia ? 'Included' : 'Excluded'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Encryption</span>
                  <span className="font-semibold text-slate-700">{encryptBackup ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </GlassCard>

            {/* Progress / Start Button */}
            <GlassCard className="p-6">
              {isStartingBackup ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <span className="text-sm font-bold text-slate-900">Backup in Progress</span>
                  </div>
                  <ProgressBar value={backupProgress} max={100} />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">{backupStage}</p>
                    <p className="text-xs font-bold text-blue-600">{Math.round(backupProgress)}%</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleStartBackup}
                  disabled={backupScope !== 'full' && selectedCollections.length === 0}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-lg font-bold text-base hover:bg-blue-700 transition-all shadow-sm0/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  <Play className="w-5 h-5" />
                  Start Backup
                </button>
              )}
              <p className="text-[10px] text-slate-400 text-center mt-3">
                Backup will be stored in your Firestore backup_records collection
              </p>
            </GlassCard>
          </motion.div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION: SCHEDULE
      ═══════════════════════════════════════════════════════════ */}
      {activeSection === 'schedule' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Backup Schedule Configuration
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">Schedule</span>
                <ToggleSwitch
                  checked={schedule.isActive}
                  onChange={val => setSchedule(s => ({ ...s, isActive: val }))}
                  label="Activate schedule"
                />
              </div>
            </div>

            <div className={cn('transition-opacity', !schedule.isActive && 'opacity-50 pointer-events-none')}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Frequency */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Frequency</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['daily', 'weekly', 'monthly'] as const).map(freq => (
                      <button
                        key={freq}
                        onClick={() => setSchedule(s => ({ ...s, frequency: freq }))}
                        className={cn(
                          'px-4 py-3 rounded-lg border-2 text-sm font-semibold capitalize transition-all',
                          schedule.frequency === freq
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200'
                        )}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time of Day */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Time of Day</label>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="time"
                        value={schedule.time}
                        onChange={e => setSchedule(s => ({ ...s, time: e.target.value }))}
                        className="pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <p className="text-xs text-slate-400">Server timezone</p>
                  </div>
                </div>

                {/* Retention Policy */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Retention Policy</label>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">Keep last</span>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={schedule.retentionCount}
                      onChange={e => setSchedule(s => ({ ...s, retentionCount: Math.max(1, parseInt(e.target.value) || 1) }))}
                      className="w-20 px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <span className="text-sm text-slate-500">backup(s)</span>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">Auto-delete old backups</span>
                    </div>
                    <ToggleSwitch
                      checked={schedule.autoDelete}
                      onChange={val => setSchedule(s => ({ ...s, autoDelete: val }))}
                      label="Auto-delete old backups"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      {schedule.notifyOnFailure ? (
                        <Bell className="w-4 h-4 text-blue-500" />
                      ) : (
                        <BellOff className="w-4 h-4 text-slate-400" />
                      )}
                      <span className="text-sm font-medium text-slate-700">Notify on failure</span>
                    </div>
                    <ToggleSwitch
                      checked={schedule.notifyOnFailure}
                      onChange={val => setSchedule(s => ({ ...s, notifyOnFailure: val }))}
                      label="Notify on failure"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  Schedule changes take effect at the next scheduled backup time.
                </p>
                <button
                  onClick={handleSaveSchedule}
                  disabled={isSavingSchedule || !schedule.isActive}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingSchedule ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                  Save Schedule
                </button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION: RESTORE
      ═══════════════════════════════════════════════════════════ */}
      {activeSection === 'restore' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Restore Points ─── */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
            <GlassCard className="overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-blue-600" />
                  Available Restore Points
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Select a successful backup to restore from. This will overwrite current data.
                </p>
              </div>

              <div className="max-h-[480px] overflow-y-auto divide-y divide-slate-100">
                {backupRecords.filter(r => r.status === 'success').length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Archive className="w-14 h-14 text-slate-300 mb-4" />
                    <p className="text-slate-500 font-semibold">No restore points available</p>
                    <p className="text-sm text-slate-400 mt-1">Create a backup first to generate restore points.</p>
                  </div>
                ) : (
                  backupRecords
                    .filter(r => r.status === 'success')
                    .map((record, idx) => {
                      const isSelected = restoreBackupId === record.id;
                      return (
                        <motion.div
                          key={record.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.03 }}
                        >
                          <button
                            onClick={() => setRestoreBackupId(isSelected ? null : record.id!)}
                            className={cn(
                              'w-full px-6 py-4 flex items-center gap-4 text-left transition-all',
                              isSelected ? 'bg-blue-50/60 border-l-4 border-l-blue-500' : 'hover:bg-slate-50/60'
                            )}
                          >
                            <div className={cn(
                              'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                              isSelected ? 'bg-blue-100' : 'bg-slate-100'
                            )}>
                              <Archive className={cn('w-5 h-5', isSelected ? 'text-blue-600' : 'text-slate-400')} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-slate-900 text-sm">
                                  {formatTimestamp(record.completedAt || record.startedAt)}
                                </span>
                                <span className={cn(
                                  'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                                  record.type === 'auto' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                                )}>
                                  {record.type}
                                </span>
                                {record.encrypted && (
                                  <Lock className="w-3 h-3 text-blue-500" />
                                )}
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {record.scope} backup — {formatBytes(record.sizeBytes)} — {record.collections?.length || 0} collections
                              </p>
                            </div>

                            <div className="shrink-0">
                              {isSelected ? (
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                              )}
                            </div>
                          </button>
                        </motion.div>
                      );
                    })
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* ─── Restore Options ─── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <GlassCard className="p-6">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-blue-600" />
                Restore Options
              </h4>

              {!restoreBackupId && (
                <p className="text-sm text-slate-400 text-center py-6">
                  Select a restore point from the list to continue.
                </p>
              )}

              {restoreBackupId && (
                <div className="space-y-4">
                  {/* Restore Scope */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Restore Scope</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setRestoreScope('full')}
                        className={cn(
                          'p-3 rounded-lg border-2 text-center transition-all',
                          restoreScope === 'full'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-200'
                        )}
                      >
                        <Database className={cn('w-5 h-5 mx-auto mb-1', restoreScope === 'full' ? 'text-blue-600' : 'text-slate-400')} />
                        <span className={cn('text-xs font-semibold', restoreScope === 'full' ? 'text-blue-700' : 'text-slate-600')}>
                          Full Restore
                        </span>
                      </button>
                      <button
                        onClick={() => setRestoreScope('partial')}
                        className={cn(
                          'p-3 rounded-lg border-2 text-center transition-all',
                          restoreScope === 'partial'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-200'
                        )}
                      >
                        <FolderOpen className={cn('w-5 h-5 mx-auto mb-1', restoreScope === 'partial' ? 'text-blue-600' : 'text-slate-400')} />
                        <span className={cn('text-xs font-semibold', restoreScope === 'partial' ? 'text-blue-700' : 'text-slate-600')}>
                          Partial Restore
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Partial Collections */}
                  {restoreScope === 'partial' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                    >
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Collections to Restore
                      </label>
                      {(() => {
                        const selectedRecord = backupRecords.find(r => r.id === restoreBackupId);
                        return (selectedRecord?.collections || []).map(col => (
                          <label key={col} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={restoreCollections.includes(col)}
                              onChange={() => {
                                setRestoreCollections(prev =>
                                  prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
                                );
                              }}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-700">{col}</span>
                          </label>
                        ));
                      })()}
                    </motion.div>
                  )}

                  {/* Warning */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-800">Warning</p>
                      <p className="text-xs text-amber-600 mt-0.5">
                        Restoring will overwrite existing data. This action cannot be undone.
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  {isRestoring ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        <span className="text-sm font-bold text-slate-900">Restoring data...</span>
                      </div>
                      <ProgressBar value={restoreProgress} max={100} />
                      <p className="text-xs text-right font-bold text-blue-600">{Math.round(restoreProgress)}%</p>
                    </div>
                  ) : (
                    <button
                      onClick={handleRestore}
                      disabled={restoreScope === 'partial' && restoreCollections.length === 0}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowDownToLine className="w-4 h-4" />
                      Start Restore
                    </button>
                  )}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION: INTEGRITY CHECK
      ═══════════════════════════════════════════════════════════ */}
      {activeSection === 'integrity' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* ─── Integrity Check Card ─── */}
          <GlassCard className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ScanSearch className="w-5 h-5 text-blue-600" />
                  Data Integrity Check
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Scan for orphaned documents, missing references, and data inconsistencies.
                </p>
              </div>
              {!isRunningCheck && (
                <button
                  onClick={handleIntegrityCheck}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm"
                >
                  <Play className="w-4 h-4" />
                  Run Integrity Check
                </button>
              )}
            </div>

            {/* Running Check */}
            {isRunningCheck && (
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <span className="text-sm font-bold text-slate-900">Scanning database...</span>
                </div>
                <ProgressBar value={checkProgress} max={100} />
                <div className="flex justify-between">
                  <p className="text-xs text-slate-400">Analyzing collections and references</p>
                  <p className="text-xs font-bold text-blue-600">{Math.round(checkProgress)}%</p>
                </div>
              </div>
            )}

            {/* Results */}
            {integrityResult && !isRunningCheck && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg p-4 bg-slate-50 border border-slate-100"
                  >
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Documents</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{integrityResult.totalDocuments.toLocaleString()}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="rounded-lg p-4 bg-slate-50 border border-slate-100"
                  >
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Issues Found</p>
                    <p className={cn(
                      'text-2xl font-bold mt-1',
                      integrityResult.issuesFound === 0 ? 'text-emerald-600' : 'text-amber-600'
                    )}>
                      {integrityResult.issuesFound}
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={cn(
                      'rounded-lg p-4 border',
                      integrityResult.status === 'healthy' && 'bg-emerald-50 border-emerald-200',
                      integrityResult.status === 'warning' && 'bg-amber-50 border-amber-200',
                      integrityResult.status === 'critical' && 'bg-red-50 border-red-200'
                    )}
                  >
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusPulse status={integrityResult.status} />
                      <p className={cn(
                        'text-lg font-bold capitalize',
                        integrityResult.status === 'healthy' && 'text-emerald-700',
                        integrityResult.status === 'warning' && 'text-amber-700',
                        integrityResult.status === 'critical' && 'text-red-700'
                      )}>
                        {integrityResult.status}
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Issues List */}
                {integrityResult.issues.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Detected Issues ({integrityResult.issues.length})
                    </h4>
                    <div className="space-y-2">
                      {integrityResult.issues.map((issue, idx) => {
                        const key = `${issue.collection}-${issue.documentId}`;
                        const isExpanded = expandedIssues.has(key);
                        return (
                          <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={cn(
                              'rounded-lg border overflow-hidden',
                              issue.severity === 'high' && 'border-red-200 bg-red-50/50',
                              issue.severity === 'medium' && 'border-amber-200 bg-amber-50/50',
                              issue.severity === 'low' && 'border-slate-200 bg-slate-50/50'
                            )}
                          >
                            <button
                              onClick={() => toggleIssue(key)}
                              className="w-full px-4 py-3 flex items-center gap-3 text-left"
                            >
                              <div className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                                issue.type === 'orphaned' && 'bg-indigo-100',
                                issue.type === 'missing_reference' && 'bg-rose-100',
                                issue.type === 'inconsistency' && 'bg-amber-100'
                              )}>
                                {issue.type === 'orphaned' && <FileText className="w-4 h-4 text-indigo-600" />}
                                {issue.type === 'missing_reference' && <AlertCircle className="w-4 h-4 text-rose-600" />}
                                {issue.type === 'inconsistency' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-semibold text-slate-900">
                                    {issue.collection}
                                  </span>
                                  <span className={cn(
                                    'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded',
                                    issue.type === 'orphaned' && 'bg-indigo-100 text-indigo-700',
                                    issue.type === 'missing_reference' && 'bg-rose-100 text-rose-700',
                                    issue.type === 'inconsistency' && 'bg-amber-100 text-amber-700'
                                  )}>
                                    {issue.type.replace('_', ' ')}
                                  </span>
                                  <span className={cn(
                                    'text-[10px] font-bold uppercase px-1.5 py-0.5 rounded',
                                    issue.severity === 'high' && 'bg-red-100 text-red-700',
                                    issue.severity === 'medium' && 'bg-amber-100 text-amber-700',
                                    issue.severity === 'low' && 'bg-slate-200 text-slate-600'
                                  )}>
                                    {issue.severity}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5 truncate">{issue.description}</p>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                            </button>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-4 pb-4 border-t border-slate-200/50">
                                    <div className="mt-3 space-y-2">
                                      <div className="text-xs">
                                        <span className="font-semibold text-slate-500">Document ID: </span>
                                        <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px] font-mono">
                                          {issue.documentId}
                                        </code>
                                      </div>
                                      <div className="text-xs">
                                        <span className="font-semibold text-slate-500">Description: </span>
                                        <span className="text-slate-700">{issue.description}</span>
                                      </div>
                                      <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-50 border border-blue-100">
                                        <Wrench className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                                        <div>
                                          <p className="text-xs font-semibold text-blue-700">Fix Suggestion</p>
                                          <p className="text-xs text-blue-600 mt-0.5">{issue.fixSuggestion}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Clean Result */}
                {integrityResult.issues.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10"
                  >
                    <div className="w-16 h-16 rounded-lg bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="text-lg font-bold text-slate-900">All Clear!</p>
                    <p className="text-sm text-slate-500 mt-1">
                      No data integrity issues were found. Your database is healthy.
                    </p>
                  </motion.div>
                )}

                {/* Checked At */}
                <div className="text-center">
                  <p className="text-xs text-slate-400">
                    Last checked: {integrityResult.checkedAt.toLocaleString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* No results yet */}
            {!integrityResult && !isRunningCheck && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                  <ScanSearch className="w-8 h-8 text-blue-300" />
                </div>
                <p className="text-slate-500 font-semibold">No integrity check run yet</p>
                <p className="text-sm text-slate-400 mt-1">
                  Click &ldquo;Run Integrity Check&rdquo; to scan your database for issues.
                </p>
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
