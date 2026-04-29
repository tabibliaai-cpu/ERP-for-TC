import React, { useState, useEffect, useCallback } from 'react';
import {
  BadgeDollarSign,
  HandCoins,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Plus,
  HeartHandshake,
  Download,
  GraduationCap,
  ShieldCheck,
  AlertCircle,
  X,
  LayoutDashboard,
  FileText,
  Receipt,
  CreditCard,
  FileSpreadsheet,
  Users,
  Award,
  Edit3,
  Trash2,
  Eye,
  Printer,
  RefreshCcw,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  UserPlus,
  Mail,
  Phone,
  Building2,
  Sparkles,
  MoreVertical,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/useStore';
import {
  feeStructureService,
  studentFeeService,
  paymentService,
  invoiceService,
  sponsorService,
  scholarshipService,
  transactionLogService,
  financeService,
  studentService,
  type FeeStructure,
  type FeeComponent,
  type StudentFeeAssignment,
  type Payment,
  type Invoice,
  type Sponsor,
  type Scholarship,
  type TransactionLog,
  type FeeTransaction,
  type Student,
} from '../services/dataService';

// ===================================================================
// CONSTANTS
// ===================================================================

type TabId =
  | 'overview'
  | 'fee-structures'
  | 'student-fees'
  | 'payments'
  | 'invoices'
  | 'reports'
  | 'sponsors-scholarships';

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const TABS: TabConfig[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'fee-structures', label: 'Fee Structures', icon: FileText },
  { id: 'student-fees', label: 'Student Fees', icon: Users },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'invoices', label: 'Invoices', icon: Receipt },
  { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  { id: 'sponsors-scholarships', label: 'Sponsors & Aid', icon: Award },
];

const PROGRAMS = ['B.Th', 'M.Div', 'Th.M', 'PhD', 'D.Min', 'Certificate', 'Diploma'];
const ACADEMIC_YEARS = ['2023-2024', '2024-2025', '2025-2026', '2026-2027'];
const PAYMENT_MODES = ['cash', 'upi', 'bank_transfer', 'online', 'cheque'] as const;
const PAYMENT_PLANS = ['full', 'monthly', 'quarterly', 'custom'] as const;
const SCHOLARSHIP_CRITERIA = ['merit', 'need', 'ministry', 'general'] as const;

// ===================================================================
// HELPERS
// ===================================================================

function generateId(prefix: string): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${year}-${random}`;
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function toDate(val: any): Date {
  if (!val) return new Date(0);
  if (val?.toDate) return val.toDate();
  return new Date(val);
}

function statusBadge(status: string) {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    paid: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    completed: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    partial: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    pending: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200' },
    overdue: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
    failed: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
    refunded: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    draft: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200' },
    sent: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    cancelled: { bg: 'bg-zinc-100', text: 'text-zinc-500', border: 'border-zinc-200' },
    active: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    inactive: { bg: 'bg-zinc-100', text: 'text-zinc-500', border: 'border-zinc-200' },
    processed: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    disbursed: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  };
  const s = map[status] || map.pending;
  return (
    <span className={cn('px-3 py-1.5 rounded-md text-xs font-medium uppercase tracking-wide border', s.bg, s.text, s.border)}>
      {status}
    </span>
  );
}

function logAction(
  tenantId: string,
  performedBy: string,
  entityType: TransactionLog['entityType'],
  action: TransactionLog['action'],
  entityId: string,
  newData?: any,
) {
  transactionLogService.log({
    tenantId,
    performedBy,
    entityType,
    action,
    entityId,
    newData,
  });
}

// ===================================================================
// MAIN COMPONENT
// ===================================================================

export function Finance() {
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Data states
  const [students, setStudents] = useState<Student[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [studentFees, setStudentFees] = useState<StudentFeeAssignment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [legacyTransactions, setLegacyTransactions] = useState<FeeTransaction[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorHeader, setErrorHeader] = useState<{ message: string; type: 'error' | 'warning' } | null>(null);

  // Modal states
  const [isFeeStructureModalOpen, setIsFeeStructureModalOpen] = useState(false);
  const [isAssignFeeModalOpen, setIsAssignFeeModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const [isScholarshipModalOpen, setIsScholarshipModalOpen] = useState(false);

  // Edit states
  const [editingFeeStructure, setEditingFeeStructure] = useState<FeeStructure | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [subTab, setSubTab] = useState<'sponsors' | 'scholarships'>('sponsors');

  // Dropdown states
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // ----------------------------------------------------------------
  // DATA LOADING
  // ----------------------------------------------------------------
  const loadAllData = useCallback(async () => {
    if (!user?.tenantId) return;
    setIsLoading(true);
    setErrorHeader(null);
    try {
      const results = await Promise.allSettled([
        studentService.getStudentsByTenant(user.tenantId),
        feeStructureService.getByTenant(user.tenantId),
        studentFeeService.getByTenant(user.tenantId),
        paymentService.getByTenant(user.tenantId),
        invoiceService.getByTenant(user.tenantId),
        sponsorService.getByTenant(user.tenantId),
        scholarshipService.getByTenant(user.tenantId),
        financeService.getTransactionsByTenant(user.tenantId),
      ]);
      const val = <T,>(r: PromiseSettledResult<T>): T => r.status === 'fulfilled' ? r.value : [] as unknown as T;
      const st = val(results[0]);
      const fs = val(results[1]);
      const sf = val(results[2]);
      const pm = val(results[3]);
      const inv = val(results[4]);
      const sp = val(results[5]);
      const sc = val(results[6]);
      const lt = val(results[7]);
      setStudents(st);
      setFeeStructures(fs);
      setStudentFees(sf);
      setPayments(pm);
      setInvoices(inv);
      setSponsors(sp);
      setScholarships(sc);
      setLegacyTransactions(lt);
    } catch (err: any) {
      console.error('Failed to load billing data:', err);
      setErrorHeader({ message: 'Billing Synchronisation Failure: Financial records are currently inaccessible.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [user?.tenantId]);

  useEffect(() => {
    if (user?.tenantId) loadAllData();
  }, [loadAllData]);

  // ----------------------------------------------------------------
  // COMPUTED VALUES
  // ----------------------------------------------------------------
  const totalRevenue = payments.filter((p) => p.status === 'completed').reduce((s, p) => s + p.amount, 0) +
    legacyTransactions.reduce((s, t) => s + (t.status === 'paid' ? t.amount : 0), 0);

  const pendingDues = studentFees.reduce((s, f) => s + (f.balanceAmount || 0), 0);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyCollection = payments
    .filter((p) => {
      if (!p.createdAt) return false;
      const d = toDate(p.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && p.status === 'completed';
    })
    .reduce((s, p) => s + p.amount, 0);

  const activeSponsors = sponsors.filter((s) => s.status === 'active').length;
  const scholarshipCount = scholarships.filter((s) => s.status === 'active').length;
  const overdueCount = studentFees.filter((f) => f.status === 'overdue').length;

  const recentPayments = [...payments].sort((a, b) => {
    const da = toDate(a.createdAt);
    const db2 = toDate(b.createdAt);
    return db2.getTime() - da.getTime();
  }).slice(0, 10);

  const getStudentName = (id: string) => students.find((s) => s.id === id)?.name || id.slice(0, 8);
  const getStudentProgram = (id: string) => students.find((s) => s.id === id)?.program || '';

  // ----------------------------------------------------------------
  // FEE STRUCTURE LOGIC
  // ----------------------------------------------------------------
  const [fsForm, setFsForm] = useState({
    name: '',
    program: 'B.Th',
    academicYear: ACADEMIC_YEARS[1],
    semester: 1,
    components: [] as FeeComponent[],
    isActive: true,
  });

  const openCreateFeeStructure = () => {
    setEditingFeeStructure(null);
    setFsForm({ name: '', program: 'B.Th', academicYear: ACADEMIC_YEARS[1], semester: 1, components: [], isActive: true });
    setIsFeeStructureModalOpen(true);
  };

  const openEditFeeStructure = (fs: FeeStructure) => {
    setEditingFeeStructure(fs);
    setFsForm({
      name: fs.name,
      program: fs.program,
      academicYear: fs.academicYear,
      semester: fs.semester,
      components: [...fs.components],
      isActive: fs.isActive,
    });
    setIsFeeStructureModalOpen(true);
  };

  const addFeeComponent = () => {
    setFsForm({ ...fsForm, components: [...fsForm.components, { name: '', amount: 0, type: 'one_time', frequency: 'annual', isMandatory: true }] });
  };

  const removeFeeComponent = (index: number) => {
    setFsForm({ ...fsForm, components: fsForm.components.filter((_, i) => i !== index) });
  };

  const updateFeeComponent = (index: number, field: keyof FeeComponent, value: any) => {
    const updated = [...fsForm.components];
    (updated[index] as any)[field] = value;
    setFsForm({ ...fsForm, components: updated });
  };

  const fsTotal = fsForm.components.reduce((s, c) => s + (c.amount || 0), 0);

  const handleSaveFeeStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenantId || !fsForm.name.trim()) return;
    try {
      if (editingFeeStructure?.id) {
        await feeStructureService.update(editingFeeStructure.id, {
          ...fsForm,
          totalAmount: fsTotal,
        });
        logAction(user.tenantId, user.uid, 'fee_assignment', 'update', editingFeeStructure.id, { name: fsForm.name });
      } else {
        await feeStructureService.addFeeStructure({
          ...fsForm,
          totalAmount: fsTotal,
          tenantId: user.tenantId,
        });
        logAction(user.tenantId, user.uid, 'fee_assignment', 'create', generateId('FS'), { name: fsForm.name });
      }
      setIsFeeStructureModalOpen(false);
      loadAllData();
    } catch (err) {
      console.error(err);
      setErrorHeader({ message: 'Failed to save fee structure.', type: 'error' });
    }
  };

  const handleDeleteFeeStructure = async (id: string) => {
    if (!user?.tenantId || !confirm('Delete this fee structure? This action cannot be undone.')) return;
    try {
      await feeStructureService.delete(id);
      logAction(user.tenantId, user.uid, 'fee_assignment', 'reverse', id);
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------------------
  // STUDENT FEE ASSIGNMENT LOGIC
  // ----------------------------------------------------------------
  const [sfForm, setSfForm] = useState({
    studentId: '',
    feeStructureId: '',
    discount: 0,
    paymentPlan: 'full' as const,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
  });

  const selectedStructure = feeStructures.find((fs) => fs.id === sfForm.feeStructureId);
  const sfAdjustedFee = (selectedStructure?.totalAmount || 0) - sfForm.discount;

  const openAssignFee = () => {
    setSfForm({ studentId: '', feeStructureId: '', discount: 0, paymentPlan: 'full', startDate: new Date().toISOString().split('T')[0], dueDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0] });
    setStudentSearchTerm('');
    setIsAssignFeeModalOpen(true);
  };

  const handleAssignFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenantId || !sfForm.studentId || !sfForm.feeStructureId) return;
    try {
      await studentFeeService.assignFee({
        studentId: sfForm.studentId,
        feeStructureId: sfForm.feeStructureId,
        feeStructureName: selectedStructure?.name || '',
        totalFee: selectedStructure?.totalAmount || 0,
        discount: sfForm.discount,
        adjustedFee: sfAdjustedFee,
        paidAmount: 0,
        balanceAmount: sfAdjustedFee,
        paymentPlan: sfForm.paymentPlan,
        status: sfAdjustedFee <= 0 ? 'paid' : 'pending',
        startDate: sfForm.startDate,
        dueDate: sfForm.dueDate,
        tenantId: user.tenantId,
      });
      logAction(user.tenantId, user.uid, 'fee_assignment', 'create', sfForm.studentId, { feeStructure: selectedStructure?.name });
      setIsAssignFeeModalOpen(false);
      loadAllData();
    } catch (err) {
      console.error(err);
      setErrorHeader({ message: 'Failed to assign fee.', type: 'error' });
    }
  };

  // ----------------------------------------------------------------
  // PAYMENT LOGIC
  // ----------------------------------------------------------------
  const [pmForm, setPmForm] = useState({
    studentFeeId: '',
    amount: 0,
    paymentMode: 'cash' as (typeof PAYMENT_MODES)[number],
    transactionRef: '',
    remarks: '',
  });

  const selectedAssignment = studentFees.find((sf) => sf.id === pmForm.studentFeeId);

  const openPaymentModal = () => {
    setPmForm({ studentFeeId: '', amount: 0, paymentMode: 'cash', transactionRef: '', remarks: '' });
    setStudentSearchTerm('');
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenantId || !pmForm.studentFeeId || pmForm.amount <= 0 || !selectedAssignment) return;
    try {
      const payId = generateId('PAY');
      const rcptId = generateId('RCPT');
      const newPaid = (selectedAssignment.paidAmount || 0) + pmForm.amount;
      const newBalance = selectedAssignment.adjustedFee - newPaid;

      await paymentService.recordPayment({
        paymentId: payId,
        receiptNumber: rcptId,
        studentFeeId: pmForm.studentFeeId,
        studentId: selectedAssignment.studentId,
        studentName: getStudentName(selectedAssignment.studentId),
        amount: pmForm.amount,
        paymentMode: pmForm.paymentMode,
        transactionRef: pmForm.transactionRef || undefined,
        remarks: pmForm.remarks || undefined,
        receivedBy: user.uid,
        balanceAfterPayment: Math.max(0, newBalance),
        status: 'completed',
        tenantId: user.tenantId,
      });

      await studentFeeService.update(pmForm.studentFeeId, {
        paidAmount: newPaid,
        balanceAmount: Math.max(0, newBalance),
        status: newBalance <= 0 ? 'paid' : 'partial',
      });

      logAction(user.tenantId, user.uid, 'payment', 'create', payId, { amount: pmForm.amount, student: getStudentName(selectedAssignment.studentId) });
      setIsPaymentModalOpen(false);
      loadAllData();
    } catch (err) {
      console.error(err);
      setErrorHeader({ message: 'Failed to record payment.', type: 'error' });
    }
  };

  const printReceipt = (payment: Payment) => {
    const studentName = getStudentName(payment.studentId);
    const win = window.open('', '_blank', 'width=400,height=600');
    if (win) {
      win.document.write(`
        <html><head><title>Receipt ${payment.receiptNumber}</title>
        <style>body{font-family:monospace;padding:40px;font-size:14px}h2{text-align:center}.line{border-top:1px dashed #000;margin:16px 0}.row{display:flex;justify-content:space-between;margin:6px 0}</style></head>
        <body><h2>Payment Receipt</h2><div class="line"></div>
        <div class="row"><span>Receipt No:</span><strong>${payment.receiptNumber}</strong></div>
        <div class="row"><span>Payment ID:</span><strong>${payment.paymentId}</strong></div>
        <div class="row"><span>Student:</span><strong>${studentName}</strong></div>
        <div class="row"><span>Date:</span><strong>${new Date().toLocaleDateString()}</strong></div>
        <div class="row"><span>Mode:</span><strong>${payment.paymentMode.toUpperCase()}</strong></div>
        ${payment.transactionRef ? `<div class="row"><span>Reference:</span><strong>${payment.transactionRef}</strong></div>` : ''}
        <div class="line"></div>
        <div class="row"><span>Amount:</span><strong style="font-size:18px">${formatCurrency(payment.amount)}</strong></div>
        <div class="line"></div>
        <p style="text-align:center;margin-top:40px">Thank you for your payment.</p>
        <script>window.print();</script></body></html>
      `);
    }
  };

  // ----------------------------------------------------------------
  // INVOICE LOGIC
  // ----------------------------------------------------------------
  const handleGenerateInvoice = async (sf: StudentFeeAssignment) => {
    if (!user?.tenantId || !sf.id) return;
    try {
      const fs = feeStructures.find((f) => f.id === sf.feeStructureId);
      const invNum = generateId('INV');
      const breakdown = (fs?.components || []).map((c) => ({ component: c.name, amount: c.amount }));
      await invoiceService.createInvoice({
        invoiceNumber: invNum,
        studentId: sf.studentId,
        studentName: getStudentName(sf.studentId),
        studentFeeId: sf.id,
        program: getStudentProgram(sf.studentId),
        feeBreakdown: breakdown,
        totalAmount: sf.totalFee,
        discount: sf.discount,
        netAmount: sf.adjustedFee,
        paidAmount: sf.paidAmount || 0,
        balanceDue: sf.balanceAmount || 0,
        status: sf.status === 'paid' ? 'paid' : sf.status === 'overdue' ? 'overdue' : 'sent',
        dueDate: sf.dueDate,
        tenantId: user.tenantId,
      });
      logAction(user.tenantId, user.uid, 'invoice', 'create', invNum, { student: getStudentName(sf.studentId) });
      loadAllData();
    } catch (err) {
      console.error(err);
      setErrorHeader({ message: 'Failed to generate invoice.', type: 'error' });
    }
  };

  // ----------------------------------------------------------------
  // SPONSOR LOGIC
  // ----------------------------------------------------------------
  const [spForm, setSpForm] = useState({ name: '', email: '', phone: '', organization: '', linkedStudents: [] as string[], totalContributed: 0, notes: '' });

  const openSponsorModal = () => {
    setSpForm({ name: '', email: '', phone: '', organization: '', linkedStudents: [], totalContributed: 0, notes: '' });
    setIsSponsorModalOpen(true);
  };

  const handleSaveSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenantId || !spForm.name.trim()) return;
    try {
      await sponsorService.addSponsor({ ...spForm, status: 'active', tenantId: user.tenantId });
      logAction(user.tenantId, user.uid, 'refund', 'create', generateId('SP'), { name: spForm.name });
      setIsSponsorModalOpen(false);
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSponsor = async (id: string) => {
    if (!user?.tenantId || !confirm('Delete this sponsor?')) return;
    try {
      await sponsorService.update(id, { status: 'inactive' });
      logAction(user.tenantId, user.uid, 'refund', 'reverse', id);
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------------------
  // SCHOLARSHIP LOGIC
  // ----------------------------------------------------------------
  const [scForm, setScForm] = useState({
    name: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    criteria: 'general' as (typeof SCHOLARSHIP_CRITERIA)[number],
    maxStudents: 10,
    currentRecipients: 0,
    totalDisbursed: 0,
    description: '',
  });

  const openScholarshipModal = () => {
    setScForm({ name: '', type: 'percentage', value: 0, criteria: 'general', maxStudents: 10, currentRecipients: 0, totalDisbursed: 0, description: '' });
    setIsScholarshipModalOpen(true);
  };

  const handleSaveScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenantId || !scForm.name.trim()) return;
    try {
      await scholarshipService.addScholarship({ ...scForm, status: 'active', tenantId: user.tenantId });
      logAction(user.tenantId, user.uid, 'invoice', 'create', generateId('SCH'), { name: scForm.name });
      setIsScholarshipModalOpen(false);
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteScholarship = async (id: string) => {
    if (!user?.tenantId || !confirm('Deactivate this scholarship?')) return;
    try {
      await scholarshipService.update(id, { status: 'inactive' });
      logAction(user.tenantId, user.uid, 'invoice', 'reverse', id);
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------------------
  // EXPORT CSV
  // ----------------------------------------------------------------
  const exportReportsCSV = () => {
    const headers = ['Student', 'Fee Structure', 'Total Fee', 'Discount', 'Adjusted', 'Paid', 'Balance', 'Status', 'Plan', 'Due Date'];
    const rows = studentFees.map((sf) => [
      getStudentName(sf.studentId),
      sf.feeStructureName,
      sf.totalFee,
      sf.discount,
      sf.adjustedFee,
      sf.paidAmount || 0,
      sf.balanceAmount || 0,
      sf.status,
      sf.paymentPlan,
      sf.dueDate || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `billing_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ----------------------------------------------------------------
  // FILTERED LISTS
  // ----------------------------------------------------------------
  const filteredStudents = students.filter(
    (s) => s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) || (s.email && s.email.toLowerCase().includes(studentSearchTerm.toLowerCase())),
  );

  const filteredStudentFees = studentFees.filter((sf) => {
    if (!searchQuery) return true;
    const low = searchQuery.toLowerCase();
    return getStudentName(sf.studentId).toLowerCase().includes(low) || sf.feeStructureName.toLowerCase().includes(low) || sf.status.includes(low);
  });

  const filteredPayments = payments.filter((p) => {
    if (!searchQuery) return true;
    const low = searchQuery.toLowerCase();
    return (p.studentName || getStudentName(p.studentId)).toLowerCase().includes(low) || p.paymentId.toLowerCase().includes(low) || p.status.includes(low);
  });

  const filteredInvoices = invoices.filter((inv) => {
    if (!searchQuery) return true;
    const low = searchQuery.toLowerCase();
    return (inv.studentName || getStudentName(inv.studentId)).toLowerCase().includes(low) || inv.invoiceNumber.toLowerCase().includes(low) || inv.status.includes(low);
  });

  // Course-wise collection
  const courseWiseCollection: Record<string, number> = {};
  studentFees.forEach((sf) => {
    const fs = feeStructures.find((f) => f.id === sf.feeStructureId);
    const program = fs?.program || 'Unknown';
    if (!courseWiseCollection[program]) courseWiseCollection[program] = 0;
    courseWiseCollection[program] += sf.paidAmount || 0;
  });

  // Fee type breakdown
  const feeTypeBreakdown: Record<string, number> = {};
  feeStructures.forEach((fs) => {
    fs.components.forEach((c) => {
      if (!feeTypeBreakdown[c.name]) feeTypeBreakdown[c.name] = 0;
      feeTypeBreakdown[c.name] += c.amount;
    });
  });

  // ===================================================================
  // SHARED UI HELPERS
  // ===================================================================

  const Spinner = () => (
    <div className="flex flex-col items-center justify-center h-80 gap-4">
      <div className="w-12 h-12 border-4 border-blue-500/10 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-xs font-medium uppercase  text-slate-400 animate-pulse">Syncing Ledger...</p>
    </div>
  );

  const EmptyState = ({ icon: Icon, message, actionLabel, onAction }: { icon: React.ElementType; message: string; actionLabel?: string; onAction?: () => void }) => (
    <div className="flex flex-col items-center justify-center h-80 text-center p-6 text-slate-400">
      <Icon className="w-16 h-16 text-slate-200 mb-4" />
      <p className="font-bold">{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg text-xs font-medium uppercase tracking-wide hover:bg-slate-900 transition-all">
          {actionLabel}
        </button>
      )}
    </div>
  );

  const ModalWrapper = ({ isOpen, onClose, title, subtitle, children, wide }: { isOpen: boolean; onClose: () => void; title: string; subtitle: string; children: React.ReactNode; wide?: boolean }) => (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn('bg-white rounded-lg w-full p-6 relative z-10 shadow-md border border-slate-100 max-h-[90vh] overflow-y-auto', wide ? 'max-w-2xl' : 'max-w-lg')}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
                <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-all">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1">
      <label className="text-xs font-medium uppercase  text-slate-400 pl-1">{label}</label>
      {children}
    </div>
  );

  const FormInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      {...props}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm font-medium"
    />
  );

  const FormSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select
      {...props}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm font-bold"
    />
  );

  const StudentSearchDropdown = ({ value, onSelect }: { value: string; onSelect: (id: string, name: string) => void }) => (
    <div className="space-y-1 relative">
      <label className="text-xs font-medium uppercase  text-slate-400 pl-1">Student</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
        <input
          type="text"
          placeholder="Search students..."
          value={value || studentSearchTerm}
          onFocus={() => setStudentDropdownOpen(true)}
          onChange={(e) => setStudentSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm font-medium"
        />
      </div>
      <AnimatePresence>
        {studentDropdownOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setStudentDropdownOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-100 rounded-lg shadow-md z-30 max-h-60 overflow-y-auto p-2"
            >
              {filteredStudents.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-sm">No students found</div>
              ) : (
                filteredStudents.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      onSelect(s.id!, s.name);
                      setStudentSearchTerm(s.name);
                      setStudentDropdownOpen(false);
                    }}
                    className="w-full text-left p-3 rounded-lg hover:bg-white border border-transparent hover:border-slate-100 transition-all"
                  >
                    <p className="text-sm font-bold text-slate-900">{s.name}</p>
                    <p className="text-[10px] font-mono text-slate-400 uppercase ">
                      {s.program} · Sem {s.semester || 1}
                    </p>
                  </button>
                ))
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );

  const ModalActions = ({ onCancel, onSubmit, submitLabel, submitColor }: { onCancel: () => void; onSubmit: () => void; submitLabel: string; submitColor?: string }) => (
    <div className="pt-4 flex gap-3">
      <button type="button" onClick={onCancel} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-200 transition-all">
        Cancel
      </button>
      <button
        type="submit"
        className={cn(
          'flex-1 py-3 text-white rounded-lg font-bold text-sm shadow-sm transition-all',
          submitColor === 'dark' ? 'bg-slate-900 hover:bg-slate-800 shadow-sm' : 'bg-blue-600 hover:bg-blue-700',
        )}
      >
        {submitLabel}
      </button>
    </div>
  );

  // ===================================================================
  // RENDER: TAB CONTENT
  // ===================================================================

  // --- TAB 1: OVERVIEW ---
  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          { label: 'Total Revenue', value: totalRevenue, icon: BadgeDollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', isCurrency: true },
          { label: 'Pending Dues', value: pendingDues, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', isCurrency: true },
          { label: 'This Month Collection', value: monthlyCollection, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', isCurrency: true },
          { label: 'Active Sponsors', value: activeSponsors, icon: HeartHandshake, color: 'text-rose-600', bg: 'bg-rose-50', isCurrency: false },
          { label: 'Scholarships', value: scholarshipCount, icon: Sparkles, color: 'text-indigo-600', bg: 'bg-indigo-50', isCurrency: false },
          { label: 'Overdue Accounts', value: overdueCount, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', isCurrency: false },
        ].map((stat) => (
          <div key={stat.label} className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm group hover:border-blue-200 transition-all">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-4 shadow-sm', stat.bg, stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium uppercase  text-slate-400">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2 font-mono tabular-nums leading-none">
              {stat.isCurrency ? formatCurrency(stat.value) : stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={() => { setActiveTab('payments'); setTimeout(() => openPaymentModal(), 100); }} className="px-6 py-3 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all uppercase tracking-wide flex items-center gap-2 ">
          <Plus className="w-4 h-4" />Record Payment
        </button>
        <button onClick={() => { setActiveTab('fee-structures'); setTimeout(() => openCreateFeeStructure(), 100); }} className="px-6 py-3 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all uppercase tracking-wide flex items-center gap-2 shadow-sm">
          <FileText className="w-4 h-4" />Create Fee Structure
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <p className="text-xs font-medium uppercase  text-slate-400">Recent Transactions</p>
          <button onClick={loadAllData} className="p-2 rounded-lg hover:bg-slate-100 transition-all"><RefreshCcw className="w-4 h-4 text-slate-400" /></button>
        </div>
        {recentPayments.length === 0 ? (
          <EmptyState icon={CreditCard} message="No payments recorded yet." actionLabel="Record First Payment" onAction={() => { setActiveTab('payments'); setTimeout(() => openPaymentModal(), 100); }} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-xs font-medium text-slate-400 uppercase  border-b border-slate-100">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3 text-center">Payment ID</th>
                  <th className="px-4 py-3 text-center">Amount</th>
                  <th className="px-4 py-3 text-center">Mode</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer text-sm">
                    <td className="px-4 py-3 text-sm">
                      <p className="font-bold text-slate-900">{p.studentName || getStudentName(p.studentId)}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{p.paymentId}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono font-bold text-slate-900 tabular-nums">{formatCurrency(p.amount)}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-slate-500">{p.paymentMode}</td>
                    <td className="px-4 py-3 text-center">{statusBadge(p.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-medium uppercase text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{p.receiptNumber}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // --- TAB 2: FEE STRUCTURES ---
  const renderFeeStructures = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input type="text" placeholder="Search fee structures..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none w-64" />
        </div>
        <button onClick={openCreateFeeStructure} className="px-6 py-3 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all uppercase tracking-wide flex items-center gap-2 ">
          <Plus className="w-4 h-4" />Create Fee Structure
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {feeStructures.length === 0 ? (
          <EmptyState icon={FileText} message="No fee structures defined." actionLabel="Create First Structure" onAction={openCreateFeeStructure} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-xs font-medium text-slate-400 uppercase  border-b border-slate-100">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3 text-center">Program</th>
                  <th className="px-4 py-3 text-center">Year</th>
                  <th className="px-4 py-3 text-center">Semester</th>
                  <th className="px-4 py-3 text-center">Total</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feeStructures.filter((fs) => !searchQuery || fs.name.toLowerCase().includes(searchQuery.toLowerCase()) || fs.program.toLowerCase().includes(searchQuery.toLowerCase())).map((fs) => (
                  <tr key={fs.id} className="hover:bg-slate-50/50 transition-colors group text-sm">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{fs.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{fs.components.length} component{fs.components.length !== 1 ? 's' : ''}</p>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-600">{fs.program}</td>
                    <td className="px-4 py-3 text-center text-slate-500">{fs.academicYear}</td>
                    <td className="px-4 py-3 text-center text-slate-500">{fs.semester}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-900 tabular-nums">{formatCurrency(fs.totalAmount)}</td>
                    <td className="px-4 py-3 text-center">{statusBadge(fs.isActive ? 'active' : 'inactive')}</td>
                    <td className="px-4 py-3 text-right flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditFeeStructure(fs)} className="p-2 rounded-lg hover:bg-blue-50 transition-all"><Edit3 className="w-4 h-4 text-blue-500" /></button>
                      <button onClick={() => handleDeleteFeeStructure(fs.id!)} className="p-2 rounded-lg hover:bg-rose-50 transition-all"><Trash2 className="w-4 h-4 text-rose-500" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // --- TAB 3: STUDENT FEES ---
  const renderStudentFees = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input type="text" placeholder="Search student fees..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none w-64" />
        </div>
        <button onClick={openAssignFee} className="px-6 py-3 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all uppercase tracking-wide flex items-center gap-2 ">
          <UserPlus className="w-4 h-4" />Assign Fee
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {filteredStudentFees.length === 0 ? (
          <EmptyState icon={Users} message="No student fee assignments." actionLabel="Assign First Fee" onAction={openAssignFee} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-xs font-medium text-slate-400 uppercase  border-b border-slate-100">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3 text-center">Structure</th>
                  <th className="px-4 py-3 text-center">Total</th>
                  <th className="px-4 py-3 text-center">Paid</th>
                  <th className="px-4 py-3 text-center">Balance</th>
                  <th className="px-4 py-3 text-center">Plan</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudentFees.map((sf) => (
                  <tr key={sf.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="px-4 py-3 font-bold text-slate-900">{getStudentName(sf.studentId)}</td>
                    <td className="px-4 py-3 text-center text-slate-500 text-xs">{sf.feeStructureName}</td>
                    <td className="px-4 py-3 text-center font-mono font-medium text-slate-700 tabular-nums">{formatCurrency(sf.totalFee)}</td>
                    <td className="px-4 py-3 text-center font-mono font-medium text-emerald-600 tabular-nums">{formatCurrency(sf.paidAmount || 0)}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold tabular-nums">{formatCurrency(sf.balanceAmount || 0)}</td>
                    <td className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-slate-400">{sf.paymentPlan}</td>
                    <td className="px-4 py-3 text-center">{statusBadge(sf.status)}</td>
                    <td className="px-4 py-3 text-center text-xs text-slate-400">{sf.dueDate || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // --- TAB 4: PAYMENTS ---
  const renderPayments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input type="text" placeholder="Search payments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none w-64" />
        </div>
        <button onClick={openPaymentModal} className="px-6 py-3 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all uppercase tracking-wide flex items-center gap-2 ">
          <Plus className="w-4 h-4" />Record Payment
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {filteredPayments.length === 0 ? (
          <EmptyState icon={CreditCard} message="No payments recorded yet." actionLabel="Record First Payment" onAction={openPaymentModal} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-xs font-medium text-slate-400 uppercase  border-b border-slate-100">
                  <th className="px-4 py-3">Payment ID</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3 text-center">Amount</th>
                  <th className="px-4 py-3 text-center">Mode</th>
                  <th className="px-4 py-3 text-center">Reference</th>
                  <th className="px-4 py-3 text-center">Received By</th>
                  <th className="px-4 py-3 text-center">Date</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group text-sm">
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{p.paymentId}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">{p.studentName || getStudentName(p.studentId)}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-900 tabular-nums">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-slate-500">{p.paymentMode}</td>
                    <td className="px-4 py-3 text-center text-xs text-slate-400">{p.transactionRef || '—'}</td>
                    <td className="px-4 py-3 text-center text-xs text-slate-400">{p.receivedBy ? p.receivedBy.slice(0, 8) : '—'}</td>
                    <td className="px-4 py-3 text-center text-xs text-slate-400">{p.createdAt ? toDate(p.createdAt).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-center">{statusBadge(p.status)}</td>
                    <td className="px-4 py-3 text-right flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => printReceipt(p)} className="p-2 rounded-lg hover:bg-blue-50 transition-all"><Printer className="w-4 h-4 text-blue-500" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // --- TAB 5: INVOICES ---
  const renderInvoices = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input type="text" placeholder="Search invoices..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none w-64" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <EmptyState icon={Receipt} message="No invoices generated yet." actionLabel="Go to Student Fees" onAction={() => setActiveTab('student-fees')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-xs font-medium text-slate-400 uppercase  border-b border-slate-100">
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3 text-center">Program</th>
                  <th className="px-4 py-3 text-center">Total</th>
                  <th className="px-4 py-3 text-center">Discount</th>
                  <th className="px-4 py-3 text-center">Net</th>
                  <th className="px-4 py-3 text-center">Paid</th>
                  <th className="px-4 py-3 text-center">Balance</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{inv.invoiceNumber}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">{inv.studentName || getStudentName(inv.studentId)}</td>
                    <td className="px-4 py-3 text-center text-xs text-slate-500">{inv.program || '—'}</td>
                    <td className="px-4 py-3 text-center font-mono font-medium text-slate-700 tabular-nums">{formatCurrency(inv.totalAmount)}</td>
                    <td className="px-4 py-3 text-center font-mono font-medium text-amber-600 tabular-nums">{formatCurrency(inv.discount)}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-900 tabular-nums">{formatCurrency(inv.netAmount)}</td>
                    <td className="px-4 py-3 text-center font-mono font-medium text-emerald-600 tabular-nums">{formatCurrency(inv.paidAmount || 0)}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold tabular-nums">{formatCurrency(inv.balanceDue || 0)}</td>
                    <td className="px-4 py-3 text-center">{statusBadge(inv.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // --- TAB 6: REPORTS ---
  const renderReports = () => (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Collected', value: totalRevenue, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Pending', value: pendingDues, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Fee Assignments', value: studentFees.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Overdue Accounts', value: overdueCount, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat) => (
          <div key={stat.label} className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3 shadow-sm', stat.bg, stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium uppercase  text-slate-400">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
              {typeof stat.value === 'number' && stat.value > 999 ? formatCurrency(stat.value) : stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Course-wise Collection */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
          <p className="text-xs font-medium uppercase  text-slate-400">Fee Type Breakdown</p>
        </div>
        <div className="p-6">
          {Object.keys(feeTypeBreakdown).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No fee data available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(feeTypeBreakdown).map(([name, amount]) => (
                <div key={name} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <span className="text-sm font-bold text-slate-700">{name}</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pending Fees Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <p className="text-xs font-medium uppercase  text-slate-400">Pending Fees</p>
          <button onClick={exportReportsCSV} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium uppercase tracking-wide hover:bg-blue-700 transition-all flex items-center gap-2">
            <Download className="w-3.5 h-3.5" />Export CSV
          </button>
        </div>
        {studentFees.filter((sf) => sf.status === 'pending' || sf.status === 'overdue' || sf.status === 'partial').length === 0 ? (
          <EmptyState icon={CheckCircle2} message="All fees are settled." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-xs font-medium text-slate-400 uppercase  border-b border-slate-100">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3 text-center">Structure</th>
                  <th className="px-4 py-3 text-center">Adjusted Fee</th>
                  <th className="px-4 py-3 text-center">Paid</th>
                  <th className="px-4 py-3 text-center">Balance</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentFees.filter((sf) => sf.status === 'pending' || sf.status === 'overdue' || sf.status === 'partial').map((sf) => (
                  <tr key={sf.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="px-4 py-3 font-bold text-slate-900">{getStudentName(sf.studentId)}</td>
                    <td className="px-4 py-3 text-center text-xs text-slate-500">{sf.feeStructureName}</td>
                    <td className="px-4 py-3 text-center font-mono text-slate-600 tabular-nums">{formatCurrency(sf.adjustedFee)}</td>
                    <td className="px-4 py-3 text-center font-mono text-emerald-600 tabular-nums">{formatCurrency(sf.paidAmount || 0)}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-rose-600 tabular-nums">{formatCurrency(sf.balanceAmount || 0)}</td>
                    <td className="px-4 py-3 text-center">{statusBadge(sf.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // --- TAB 7: SPONSORS & SCHOLARSHIPS ---
  const renderSponsorsScholarships = () => (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-2">
        {(['sponsors', 'scholarships'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={cn(
              'px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all',
              subTab === tab
                ? 'bg-slate-900 text-white '
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
            )}
          >
            {tab === 'sponsors' ? 'Sponsors' : 'Scholarships'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {subTab === 'sponsors' ? (
          <motion.div key="sponsors" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="flex justify-end">
              <button onClick={openSponsorModal} className="px-6 py-3 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all uppercase tracking-wide flex items-center gap-2 ">
                <UserPlus className="w-4 h-4" />Add Sponsor
              </button>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              {sponsors.length === 0 ? (
                <EmptyState icon={HeartHandshake} message="No sponsors registered." actionLabel="Add First Sponsor" onAction={openSponsorModal} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-xs font-medium text-slate-400 uppercase  border-b border-slate-100">
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3 text-center">Email</th>
                        <th className="px-4 py-3 text-center">Phone</th>
                        <th className="px-4 py-3 text-center">Organization</th>
                        <th className="px-4 py-3 text-center">Contributed</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sponsors.map((sp) => (
                        <tr key={sp.id} className="hover:bg-slate-50/50 transition-colors group text-sm">
                          <td className="px-4 py-3 font-bold text-slate-900">{sp.name}</td>
                          <td className="px-4 py-3 text-center text-xs text-slate-500">{sp.email || '—'}</td>
                          <td className="px-4 py-3 text-center text-xs text-slate-500">{sp.phone || '—'}</td>
                          <td className="px-4 py-3 text-center text-xs text-slate-500">{sp.organization || '—'}</td>
                          <td className="px-4 py-3 text-center font-mono font-bold text-emerald-600 tabular-nums">{formatCurrency(sp.totalContributed || 0)}</td>
                          <td className="px-4 py-3 text-center">{statusBadge(sp.status || 'active')}</td>
                          <td className="px-4 py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleDeleteSponsor(sp.id!)} className="p-2 rounded-lg hover:bg-rose-50 transition-all"><Trash2 className="w-4 h-4 text-rose-500" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="scholarships" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="flex justify-end">
              <button onClick={openScholarshipModal} className="px-6 py-3 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all uppercase tracking-wide flex items-center gap-2 ">
                <Plus className="w-4 h-4" />Add Scholarship
              </button>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              {scholarships.length === 0 ? (
                <EmptyState icon={Award} message="No scholarships defined." actionLabel="Add First Scholarship" onAction={openScholarshipModal} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-xs font-medium text-slate-400 uppercase  border-b border-slate-100">
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3 text-center">Type</th>
                        <th className="px-4 py-3 text-center">Value</th>
                        <th className="px-4 py-3 text-center">Criteria</th>
                        <th className="px-4 py-3 text-center">Recipients</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {scholarships.map((sc) => (
                        <tr key={sc.id} className="hover:bg-slate-50/50 transition-colors group text-sm">
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-900">{sc.name}</p>
                            {sc.description && <p className="text-[10px] text-slate-400 mt-0.5">{sc.description}</p>}
                          </td>
                          <td className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-slate-500">{sc.type}</td>
                          <td className="px-4 py-3 text-center font-mono font-bold text-blue-600 tabular-nums">
                            {sc.type === 'percentage' ? `${sc.value}%` : formatCurrency(sc.value)}
                          </td>
                          <td className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-slate-400">{sc.criteria || 'general'}</td>
                          <td className="px-4 py-3 text-center font-mono text-slate-600 tabular-nums">
                            {sc.currentRecipients || 0}/{sc.maxStudents || '∞'}
                          </td>
                          <td className="px-4 py-3 text-center">{statusBadge(sc.status || 'active')}</td>
                          <td className="px-4 py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleDeleteScholarship(sc.id!)} className="p-2 rounded-lg hover:bg-rose-50 transition-all"><Trash2 className="w-4 h-4 text-rose-500" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ===================================================================
  // MODALS
  // ===================================================================

  // Fee Structure Modal
  const renderFeeStructureModal = () => (
    <ModalWrapper isOpen={isFeeStructureModalOpen} onClose={() => setIsFeeStructureModalOpen(false)} title={editingFeeStructure ? 'Edit Fee Structure' : 'Create Fee Structure'} subtitle="Define fee components for a program and semester" wide>
      <form onSubmit={handleSaveFeeStructure} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Structure Name">
            <FormInput placeholder="e.g. B.Th 1st Year" value={fsForm.name} onChange={(e) => setFsForm({ ...fsForm, name: e.target.value })} required />
          </FormField>
          <FormField label="Program">
            <FormSelect value={fsForm.program} onChange={(e) => setFsForm({ ...fsForm, program: e.target.value })}>
              {PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </FormSelect>
          </FormField>
          <FormField label="Academic Year">
            <FormSelect value={fsForm.academicYear} onChange={(e) => setFsForm({ ...fsForm, academicYear: e.target.value })}>
              {ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </FormSelect>
          </FormField>
          <FormField label="Semester">
            <FormSelect value={String(fsForm.semester)} onChange={(e) => setFsForm({ ...fsForm, semester: Number(e.target.value) })}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s} value={s}>{s}</option>)}
            </FormSelect>
          </FormField>
        </div>

        {/* Dynamic Fee Components */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase  text-slate-400">Fee Components</p>
            <button type="button" onClick={addFeeComponent} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium uppercase tracking-wide hover:bg-blue-100 transition-all flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />Add Component
            </button>
          </div>

          <AnimatePresence>
            {fsForm.components.map((comp, index) => (
              <motion.div key={index} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase  text-slate-400">Component {index + 1}</span>
                  <button type="button" onClick={() => removeFeeComponent(index)} className="p-1.5 rounded-lg hover:bg-rose-50 transition-all"><X className="w-3.5 h-3.5 text-rose-400" /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormField label="Name">
                    <FormInput placeholder="e.g. Tuition Fee" value={comp.name} onChange={(e) => updateFeeComponent(index, 'name', e.target.value)} required />
                  </FormField>
                  <FormField label="Amount">
                    <FormInput type="number" min="0" step="0.01" value={comp.amount || ''} onChange={(e) => updateFeeComponent(index, 'amount', Number(e.target.value))} required />
                  </FormField>
                  <FormField label="Type">
                    <FormSelect value={comp.type} onChange={(e) => updateFeeComponent(index, 'type', e.target.value)}>
                      <option value="one_time">One-time</option>
                      <option value="recurring">Recurring</option>
                    </FormSelect>
                  </FormField>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={comp.isMandatory} onChange={(e) => updateFeeComponent(index, 'isMandatory', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-xs font-bold text-slate-500">Mandatory</span>
                  </label>
                  {comp.type === 'recurring' && (
                    <FormField label="Frequency">
                      <FormSelect value={comp.frequency || 'annual'} onChange={(e) => updateFeeComponent(index, 'frequency', e.target.value)}>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annually">Annually</option>
                      </FormSelect>
                    </FormField>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {fsForm.components.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-xs font-medium uppercase  text-blue-400">Auto-calculated Total</span>
              <span className="text-xl font-mono font-bold text-blue-600 tabular-nums">{formatCurrency(fsTotal)}</span>
            </div>
          )}
        </div>

        <ModalActions onCancel={() => setIsFeeStructureModalOpen(false)} onSubmit={() => {}} submitLabel={editingFeeStructure ? 'Update Structure' : 'Create Structure'} />
      </form>
    </ModalWrapper>
  );

  // Assign Fee Modal
  const renderAssignFeeModal = () => (
    <ModalWrapper isOpen={isAssignFeeModalOpen} onClose={() => setIsAssignFeeModalOpen(false)} title="Assign Fee" subtitle="Assign a fee structure to a student">
      <form onSubmit={handleAssignFee} className="space-y-5">
        <StudentSearchDropdown value={sfForm.studentId ? getStudentName(sfForm.studentId) : ''} onSelect={(id) => setSfForm({ ...sfForm, studentId: id })} />
        <FormField label="Fee Structure">
          <FormSelect value={sfForm.feeStructureId} onChange={(e) => setSfForm({ ...sfForm, feeStructureId: e.target.value })} required>
            <option value="">Select structure...</option>
            {feeStructures.filter((fs) => fs.isActive).map((fs) => (
              <option key={fs.id} value={fs.id}>{fs.name} — {formatCurrency(fs.totalAmount)}</option>
            ))}
          </FormSelect>
        </FormField>
        {selectedStructure && (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
            <div className="flex justify-between text-xs"><span className="text-slate-400">Base Fee:</span><span className="font-mono font-bold text-slate-700">{formatCurrency(selectedStructure.totalAmount)}</span></div>
            <FormField label="Discount">
              <FormInput type="number" min="0" step="0.01" value={sfForm.discount || ''} onChange={(e) => setSfForm({ ...sfForm, discount: Number(e.target.value) })} />
            </FormField>
            <div className="flex justify-between text-xs pt-2 border-t border-slate-200"><span className="text-slate-400 font-bold">Adjusted Fee:</span><span className="font-mono font-bold text-blue-600">{formatCurrency(sfAdjustedFee)}</span></div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Payment Plan">
            <FormSelect value={sfForm.paymentPlan} onChange={(e) => setSfForm({ ...sfForm, paymentPlan: e.target.value as any })}>
              {PAYMENT_PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
            </FormSelect>
          </FormField>
          <FormField label="Start Date">
            <FormInput type="date" value={sfForm.startDate} onChange={(e) => setSfForm({ ...sfForm, startDate: e.target.value })} />
          </FormField>
          <FormField label="Due Date">
            <FormInput type="date" value={sfForm.dueDate} onChange={(e) => setSfForm({ ...sfForm, dueDate: e.target.value })} />
          </FormField>
        </div>
        <ModalActions onCancel={() => setIsAssignFeeModalOpen(false)} onSubmit={() => {}} submitLabel="Assign Fee" />
      </form>
    </ModalWrapper>
  );

  // Record Payment Modal
  const renderPaymentModal = () => (
    <ModalWrapper isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Record Payment" subtitle="Record a new payment from a student">
      <form onSubmit={handleRecordPayment} className="space-y-5">
        <FormField label="Student Fee Assignment">
          <FormSelect value={pmForm.studentFeeId} onChange={(e) => setPmForm({ ...pmForm, studentFeeId: e.target.value })} required>
            <option value="">Select assignment...</option>
            {studentFees.filter((sf) => sf.balanceAmount > 0).map((sf) => (
              <option key={sf.id} value={sf.id}>{getStudentName(sf.studentId)} — {sf.feeStructureName} (Balance: {formatCurrency(sf.balanceAmount || 0)})</option>
            ))}
          </FormSelect>
        </FormField>
        {selectedAssignment && (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
            <div className="flex justify-between text-xs"><span className="text-slate-400">Student:</span><span className="font-bold text-slate-700">{getStudentName(selectedAssignment.studentId)}</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400">Adjusted Fee:</span><span className="font-mono text-slate-600">{formatCurrency(selectedAssignment.adjustedFee)}</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400">Already Paid:</span><span className="font-mono text-emerald-600">{formatCurrency(selectedAssignment.paidAmount || 0)}</span></div>
            <div className="flex justify-between text-xs pt-1 border-t border-slate-200"><span className="text-slate-400 font-bold">Balance Due:</span><span className="font-mono font-bold text-rose-600">{formatCurrency(selectedAssignment.balanceAmount || 0)}</span></div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Amount">
            <FormInput type="number" min="0.01" step="0.01" value={pmForm.amount || ''} onChange={(e) => setPmForm({ ...pmForm, amount: Number(e.target.value) })} required />
          </FormField>
          <FormField label="Payment Mode">
            <FormSelect value={pmForm.paymentMode} onChange={(e) => setPmForm({ ...pmForm, paymentMode: e.target.value as any })}>
              {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
            </FormSelect>
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Transaction Reference">
            <FormInput placeholder="Optional reference number" value={pmForm.transactionRef} onChange={(e) => setPmForm({ ...pmForm, transactionRef: e.target.value })} />
          </FormField>
          <FormField label="Remarks">
            <FormInput placeholder="Optional remarks" value={pmForm.remarks} onChange={(e) => setPmForm({ ...pmForm, remarks: e.target.value })} />
          </FormField>
        </div>
        {pmForm.studentFeeId && pmForm.amount > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
            <span className="text-xs font-medium uppercase  text-blue-400">Generated IDs</span>
            <div className="flex gap-3">
              <span className="text-[10px] font-mono text-blue-600 bg-white px-2 py-1 rounded-md">PAY-{new Date().getFullYear()}-XXXXX</span>
              <span className="text-[10px] font-mono text-blue-600 bg-white px-2 py-1 rounded-md">RCPT-{new Date().getFullYear()}-XXXXX</span>
            </div>
          </div>
        )}
        <ModalActions onCancel={() => setIsPaymentModalOpen(false)} onSubmit={() => {}} submitLabel="Record Payment" />
      </form>
    </ModalWrapper>
  );

  // Sponsor Modal
  const renderSponsorModal = () => (
    <ModalWrapper isOpen={isSponsorModalOpen} onClose={() => setIsSponsorModalOpen(false)} title="Add Sponsor" subtitle="Register a new financial sponsor">
      <form onSubmit={handleSaveSponsor} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Name">
            <FormInput placeholder="Sponsor name" value={spForm.name} onChange={(e) => setSpForm({ ...spForm, name: e.target.value })} required />
          </FormField>
          <FormField label="Email">
            <FormInput type="email" placeholder="sponsor@email.com" value={spForm.email} onChange={(e) => setSpForm({ ...spForm, email: e.target.value })} />
          </FormField>
          <FormField label="Phone">
            <FormInput placeholder="Phone number" value={spForm.phone} onChange={(e) => setSpForm({ ...spForm, phone: e.target.value })} />
          </FormField>
          <FormField label="Organization">
            <FormInput placeholder="Organization name" value={spForm.organization} onChange={(e) => setSpForm({ ...spForm, organization: e.target.value })} />
          </FormField>
        </div>
        <FormField label="Notes">
          <textarea placeholder="Optional notes about the sponsor..." value={spForm.notes} onChange={(e) => setSpForm({ ...spForm, notes: e.target.value })} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm font-medium resize-none" />
        </FormField>
        <ModalActions onCancel={() => setIsSponsorModalOpen(false)} onSubmit={() => {}} submitLabel="Add Sponsor" />
      </form>
    </ModalWrapper>
  );

  // Scholarship Modal
  const renderScholarshipModal = () => (
    <ModalWrapper isOpen={isScholarshipModalOpen} onClose={() => setIsScholarshipModalOpen(false)} title="Add Scholarship" subtitle="Create a new scholarship program">
      <form onSubmit={handleSaveScholarship} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Scholarship Name">
            <FormInput placeholder="e.g. Merit Scholarship" value={scForm.name} onChange={(e) => setScForm({ ...scForm, name: e.target.value })} required />
          </FormField>
          <FormField label="Type">
            <FormSelect value={scForm.type} onChange={(e) => setScForm({ ...scForm, type: e.target.value as any })}>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </FormSelect>
          </FormField>
          <FormField label={scForm.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}>
            <FormInput type="number" min="0" step={scForm.type === 'percentage' ? '1' : '0.01'} value={scForm.value || ''} onChange={(e) => setScForm({ ...scForm, value: Number(e.target.value) })} required />
          </FormField>
          <FormField label="Criteria">
            <FormSelect value={scForm.criteria} onChange={(e) => setScForm({ ...scForm, criteria: e.target.value as any })}>
              {SCHOLARSHIP_CRITERIA.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </FormSelect>
          </FormField>
          <FormField label="Max Students">
            <FormInput type="number" min="1" value={scForm.maxStudents || ''} onChange={(e) => setScForm({ ...scForm, maxStudents: Number(e.target.value) })} />
          </FormField>
        </div>
        <FormField label="Description">
          <textarea placeholder="Describe the scholarship..." value={scForm.description} onChange={(e) => setScForm({ ...scForm, description: e.target.value })} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm font-medium resize-none" />
        </FormField>
        <ModalActions onCancel={() => setIsScholarshipModalOpen(false)} onSubmit={() => {}} submitLabel="Add Scholarship" />
      </form>
    </ModalWrapper>
  );

  // ===================================================================
  // MAIN RENDER
  // ===================================================================

  const tabContentMap: Record<TabId, () => React.ReactNode> = {
    'overview': renderOverview,
    'fee-structures': renderFeeStructures,
    'student-fees': renderStudentFees,
    'payments': renderPayments,
    'invoices': renderInvoices,
    'reports': renderReports,
    'sponsors-scholarships': renderSponsorsScholarships,
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Error Header */}
      <AnimatePresence>
        {errorHeader && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={cn('mx-6 mt-4 p-4 rounded-lg border flex items-center gap-3', errorHeader.type === 'error' ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100')}>
            <AlertCircle className={cn('w-5 h-5', errorHeader.type === 'error' ? 'text-rose-500' : 'text-amber-500')} />
            <p className={cn('text-sm font-medium', errorHeader.type === 'error' ? 'text-rose-700' : 'text-amber-700')}>{errorHeader.message}</p>
            <button onClick={() => setErrorHeader(null)} className="ml-auto p-1 rounded-lg hover:bg-white transition-all"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <BadgeDollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Billing System</h1>
            <p className="text-xs text-slate-400">Fee structures, payments, invoices & financial reporting</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-slate-100">
        <div className="flex gap-1 overflow-x-auto pb-px">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
              className={cn(
                'flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all border-b-2 -mb-px',
                activeTab === tab.id
                  ? 'text-blue-600 border-blue-500'
                  : 'text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-200',
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {isLoading ? <Spinner /> : (
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {tabContentMap[activeTab]()}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Modals */}
      {renderFeeStructureModal()}
      {renderAssignFeeModal()}
      {renderPaymentModal()}
      {renderSponsorModal()}
      {renderScholarshipModal()}
    </div>
  );
}
