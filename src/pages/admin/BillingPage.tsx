import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DollarSign, Wallet, CreditCard, FileText, Search, X, Plus, Eye, Download,
  ChevronLeft, ChevronRight, Receipt, TrendingUp, AlertCircle, CheckCircle,
  Clock, IndianRupee, Calendar, User, Gift, Printer, Mail
} from 'lucide-react';
import { getFeeStructures, getPayments, createPayment, createFeeStructure, getToken } from '../../utils/api';

// ─── Types ───────────────────────────────────────────────────────────────────
interface FeeStructure {
  id: string; name: string; program: string; type: string; amount: number;
  frequency: string; isMandatory: boolean; status: string; description: string;
}

interface StudentFee {
  id: string; studentName: string; enrollmentNo: string; program: string;
  totalFee: number; paid: number; due: number; status: string;
  lastPayment: string; nextDue: string;
}

interface Payment {
  id: string; studentName: string; enrollmentNo: string; amount: number;
  date: string; mode: string; transactionRef: string; receivedBy: string;
  feeType: string; status: string;
}

interface Invoice {
  id: string; invoiceNo: string; studentName: string; enrollmentNo: string;
  date: string; dueDate: string; subtotal: number; tax: number; total: number;
  status: string; items: { description: string; amount: number }[];
}

interface Scholarship {
  id: string; name: string; type: string; amount: number; donor: string;
  donorContact: string; students: string; status: string;
}

// ─── Sample Data ─────────────────────────────────────────────────────────────
const feeStructures: FeeStructure[] = [
  { id: '1', name: 'B.Th Tuition Fee', program: 'B.Th', type: 'Tuition', amount: 25000, frequency: 'Per Semester', isMandatory: true, status: 'Active', description: 'Core tuition for Bachelor of Theology program per semester' },
  { id: '2', name: 'M.Div Tuition Fee', program: 'M.Div', type: 'Tuition', amount: 40000, frequency: 'Per Semester', isMandatory: true, status: 'Active', description: 'Core tuition for Master of Divinity program per semester' },
  { id: '3', name: 'Diploma Tuition Fee', program: 'Diploma', type: 'Tuition', amount: 18000, frequency: 'Per Semester', isMandatory: true, status: 'Active', description: 'Core tuition for Diploma in Theology program per semester' },
  { id: '4', name: 'Admission Fee', program: 'All', type: 'Admission', amount: 5000, frequency: 'One-time', isMandatory: true, status: 'Active', description: 'One-time admission processing fee for all programs' },
  { id: '5', name: 'Hostel Fee', program: 'All', type: 'Hostel', amount: 12000, frequency: 'Per Semester', isMandatory: false, status: 'Active', description: 'Hostel accommodation fee per semester including mess' },
  { id: '6', name: 'Library Fee', program: 'All', type: 'Library', amount: 2000, frequency: 'Per Year', isMandatory: true, status: 'Active', description: 'Library access and resource fee per academic year' },
  { id: '7', name: 'Exam Fee', program: 'All', type: 'Exam', amount: 3000, frequency: 'Per Semester', isMandatory: true, status: 'Active', description: 'Semester examination fee per semester' },
  { id: '8', name: 'Transport Fee', program: 'All', type: 'Transport', amount: 6000, frequency: 'Per Semester', isMandatory: false, status: 'Active', description: 'Seminary transport facility per semester' },
  { id: '9', name: 'Medical Insurance', program: 'All', type: 'Misc', amount: 1500, frequency: 'Per Year', isMandatory: true, status: 'Active', description: 'Student medical insurance coverage per year' },
  { id: '10', name: 'Graduation Fee', program: 'All', type: 'Misc', amount: 3000, frequency: 'One-time', isMandatory: true, status: 'Active', description: 'Graduation ceremony and certificate fee' },
  { id: '11', name: 'B.Th Online Fee', program: 'B.Th', type: 'Tuition', amount: 15000, frequency: 'Per Semester', isMandatory: true, status: 'Active', description: 'Online mode tuition for B.Th program per semester' },
  { id: '12', name: 'Field Trip Fee', program: 'M.Div', type: 'Misc', amount: 5000, frequency: 'Per Year', isMandatory: false, status: 'Active', description: 'Annual mission exposure trip fee' },
];

const studentFees: StudentFee[] = [
  { id: '1', studentName: 'Samuel Joshua Mathew', enrollmentNo: 'COV2024-001', program: 'M.Div', totalFee: 92000, paid: 92000, due: 0, status: 'Paid', lastPayment: '2025-03-15', nextDue: '2025-07-01' },
  { id: '2', studentName: 'Grace Rebecca David', enrollmentNo: 'COV2024-002', program: 'B.Th', totalFee: 54000, paid: 32000, due: 22000, status: 'Partial', lastPayment: '2025-02-20', nextDue: '2025-04-15' },
  { id: '3', studentName: 'Daniel Prasad Rao', enrollmentNo: 'COV2024-003', program: 'M.Div', totalFee: 86000, paid: 86000, due: 0, status: 'Paid', lastPayment: '2025-01-10', nextDue: '2025-07-01' },
  { id: '4', studentName: 'Ruth Anne Joseph', enrollmentNo: 'COV2025-004', program: 'Diploma', totalFee: 42000, paid: 0, due: 42000, status: 'Due', lastPayment: '—', nextDue: '2025-06-30' },
  { id: '5', studentName: 'Emmanuel Thankachan', enrollmentNo: 'COV2024-005', program: 'B.Th', totalFee: 54000, paid: 35000, due: 19000, status: 'Partial', lastPayment: '2025-03-01', nextDue: '2025-04-30' },
  { id: '6', studentName: 'Priya Christina Singh', enrollmentNo: 'COV2024-006', program: 'M.Div', totalFee: 92000, paid: 92000, due: 0, status: 'Paid', lastPayment: '2025-02-28', nextDue: '2025-07-01' },
  { id: '7', studentName: 'Thomas D\'Souza', enrollmentNo: 'COV2025-007', program: 'B.Th', totalFee: 33000, paid: 33000, due: 0, status: 'Paid', lastPayment: '2025-05-20', nextDue: '2025-11-01' },
  { id: '8', studentName: 'Arun Kumar Verma', enrollmentNo: 'COV2024-008', program: 'M.Div', totalFee: 48000, paid: 48000, due: 0, status: 'Paid', lastPayment: '2025-03-10', nextDue: '2025-07-01' },
  { id: '9', studentName: 'Mary Jessinta Cherian', enrollmentNo: 'COV2025-009', program: 'B.Th', totalFee: 54000, paid: 0, due: 54000, status: 'Overdue', lastPayment: '—', nextDue: '2025-06-01' },
  { id: '10', studentName: 'James Chandra Bose', enrollmentNo: 'COV2024-010', program: 'M.Div', totalFee: 92000, paid: 92000, due: 0, status: 'Paid', lastPayment: '2025-01-05', nextDue: '2025-07-01' },
];

const payments: Payment[] = [
  { id: 'P001', studentName: 'Samuel Joshua Mathew', enrollmentNo: 'COV2024-001', amount: 46000, date: '2025-03-15', mode: 'Bank Transfer', transactionRef: 'NEFT-SJM-2025-0315', receivedBy: 'Admin Office', feeType: 'Semester 4 Fees', status: 'Completed' },
  { id: 'P002', studentName: 'Samuel Joshua Mathew', enrollmentNo: 'COV2024-001', amount: 46000, date: '2024-09-10', mode: 'Bank Transfer', transactionRef: 'NEFT-SJM-2024-0910', receivedBy: 'Admin Office', feeType: 'Semester 3 Fees', status: 'Completed' },
  { id: 'P003', studentName: 'Grace Rebecca David', enrollmentNo: 'COV2024-002', amount: 18000, date: '2025-02-20', mode: 'UPI', transactionRef: 'UPI-GRD-2025-0220', receivedBy: 'Finance Dept', feeType: 'Semester 4 Partial', status: 'Completed' },
  { id: 'P004', studentName: 'Grace Rebecca David', enrollmentNo: 'COV2024-002', amount: 14000, date: '2024-11-15', mode: 'Cash', transactionRef: 'CASH-GRD-2024-1115', receivedBy: 'Finance Dept', feeType: 'Semester 3 Partial', status: 'Completed' },
  { id: 'P005', studentName: 'Daniel Prasad Rao', enrollmentNo: 'COV2024-003', amount: 86000, date: '2025-01-10', mode: 'Online', transactionRef: 'ONL-DPR-2025-0110', receivedBy: 'Admin Office', feeType: 'Full Year Payment', status: 'Completed' },
  { id: 'P006', studentName: 'Emmanuel Thankachan', enrollmentNo: 'COV2024-005', amount: 20000, date: '2025-03-01', mode: 'UPI', transactionRef: 'UPI-ETK-2025-0301', receivedBy: 'Finance Dept', feeType: 'Semester 4 Partial', status: 'Completed' },
  { id: 'P007', studentName: 'Priya Christina Singh', enrollmentNo: 'COV2024-006', amount: 46000, date: '2025-02-28', mode: 'Bank Transfer', transactionRef: 'NEFT-PCS-2025-0228', receivedBy: 'Admin Office', feeType: 'Semester 4 Fees', status: 'Completed' },
  { id: 'P008', studentName: 'Thomas D\'Souza', enrollmentNo: 'COV2025-007', amount: 33000, date: '2025-05-20', mode: 'Online', transactionRef: 'ONL-TDS-2025-0520', receivedBy: 'Finance Dept', feeType: 'Full Year Online', status: 'Completed' },
  { id: 'P009', studentName: 'Arun Kumar Verma', enrollmentNo: 'COV2024-008', amount: 48000, date: '2025-03-10', mode: 'Sponsor', transactionRef: 'SPN-AKV-2025-0310', receivedBy: 'Admin Office', feeType: 'Sponsored Full Year', status: 'Completed' },
  { id: 'P010', studentName: 'James Chandra Bose', enrollmentNo: 'COV2024-010', amount: 92000, date: '2025-01-05', mode: 'Bank Transfer', transactionRef: 'NEFT-JCB-2025-0105', receivedBy: 'Admin Office', feeType: 'Full Year Payment', status: 'Completed' },
];

const invoices: Invoice[] = [
  { id: '1', invoiceNo: 'INV-2025-001', studentName: 'Samuel Joshua Mathew', enrollmentNo: 'COV2024-001', date: '2025-07-01', dueDate: '2025-07-31', subtotal: 41504, tax: 4496, total: 46000, status: 'Paid', items: [{ description: 'M.Div Tuition - Semester 5', amount: 40000 }, { description: 'Library Fee (Pro-rated)', amount: 1000 }, { description: 'Exam Fee', amount: 3000 }, { description: 'Medical Insurance', amount: 2004 }] },
  { id: '2', invoiceNo: 'INV-2025-002', studentName: 'Grace Rebecca David', enrollmentNo: 'COV2024-002', date: '2025-07-01', dueDate: '2025-07-31', subtotal: 29456, tax: 2544, total: 32000, status: 'Pending', items: [{ description: 'B.Th Tuition - Semester 5', amount: 25000 }, { description: 'Transport Fee', amount: 6000 }, { description: 'Exam Fee', amount: 3000 }] },
  { id: '3', invoiceNo: 'INV-2025-003', studentName: 'Ruth Anne Joseph', enrollmentNo: 'COV2025-004', date: '2025-06-01', dueDate: '2025-06-30', subtotal: 28456, tax: 4544, total: 33000, status: 'Overdue', items: [{ description: 'Diploma Tuition - Semester 1', amount: 18000 }, { description: 'Admission Fee', amount: 5000 }, { description: 'Hostel Fee', amount: 12000 }, { description: 'Library Fee', amount: 2000 }] },
];

const scholarships: Scholarship[] = [
  { id: '1', name: 'Dr. John Chacko Merit Scholarship', type: 'Merit-based', amount: 25000, donor: 'Alumni Association', donorContact: 'alumni@covenant.edu', students: 'Samuel Joshua Mathew, Emmanuel Thankachan', status: 'Active' },
  { id: '2', name: 'Need-Based Assistance Fund', type: 'Need-based', amount: 50000, donor: 'Covenant Foundation', donorContact: 'foundation@covenant.edu', students: 'Grace Rebecca David, Emmanuel Thankachan, Mary Jessinta Cherian', status: 'Active' },
  { id: '3', name: 'Pastor Family Grant', type: 'Institutional', amount: 30000, donor: 'Covenant Seminary', donorContact: 'registrar@covenant.edu', students: 'Ruth Anne Joseph', status: 'Active' },
  { id: '4', name: 'International Student Scholarship', type: 'Institutional', amount: 60000, donor: 'Nepal Mission Society', donorContact: 'nms@mission.org', students: 'Arun Kumar Verma', status: 'Active' },
  { id: '5', name: 'Women in Ministry Scholarship', type: 'Merit-based', amount: 20000, donor: 'Women Missionary League', donorContact: 'wml@mission.org', students: 'Priya Christina Singh, Grace Rebecca David', status: 'Active' },
];

const tabs = ['Overview', 'Fee Structures', 'Student Fees', 'Payments', 'Invoices', 'Sponsors'];

const Input = ({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-slate-700">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
  </div>
);

const Select = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-slate-700">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white transition-all">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const feeStatusBadge = (s: string) => {
  const m: Record<string, string> = { Paid: 'bg-emerald-50 text-emerald-700', Partial: 'bg-amber-50 text-amber-700', Due: 'bg-blue-50 text-blue-700', Overdue: 'bg-red-50 text-red-700' };
  return <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${m[s] || 'bg-gray-100 text-gray-600'}`}>{s}</span>;
};

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

// ─── Toast helper ─────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState<{msg: string; type: 'success' | 'error'} | null>(null);
  const show = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);
  const ToastUI = toast ? (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white animate-fade-in ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
      {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      {toast.msg}
    </div>
  ) : null;
  return { show, ToastUI };
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function BillingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showAddFeeModal, setShowAddFeeModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { show: showToast, ToastUI } = useToast();

  const [payForm, setPayForm] = useState({ student: '', amount: '', mode: 'Cash', ref: '', date: new Date().toISOString().split('T')[0] });
  const [feeForm, setFeeForm] = useState({ name: '', program: 'B.Th', type: 'Tuition', amount: '', frequency: 'Per Semester', mandatory: true, description: '' });

  // ─── API Data Layer ──────────────────────────────────────────────────
  const [apiFeeStructures, setApiFeeStructures] = useState<FeeStructure[]>([]);
  const [apiPayments, setApiPayments] = useState<Payment[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const effectiveFeeStructures = dataLoaded && apiFeeStructures.length > 0 ? apiFeeStructures : feeStructures;
  const effectivePayments = dataLoaded && apiPayments.length > 0 ? apiPayments : payments;

  useEffect(() => {
    const token = getToken();
    if (!token) { setDataLoaded(true); return; }
    let cancelled = false;
    (async () => {
      try {
        const [fRes, pRes] = await Promise.allSettled([getFeeStructures(), getPayments()]);
        if (cancelled) return;
        if (fRes.status === 'fulfilled' && Array.isArray(fRes.value)) {
          const mapped = fRes.value.map((f: any) => ({
            id: String(f.id ?? ''), name: f.name ?? '', program: f.program_name ?? f.program ?? '', type: f.type ?? '', amount: Number(f.amount ?? 0), frequency: f.frequency ?? '', isMandatory: f.is_mandatory ?? f.isMandatory ?? true, status: f.status ?? 'Active', description: f.description ?? '',
          }));
          setApiFeeStructures(mapped);
        }
        if (pRes.status === 'fulfilled' && Array.isArray(pRes.value)) {
            const mapped = pRes.value.map((p: any) => ({
              id: String(p.id ?? ''), studentName: p.student_name ?? p.studentName ?? '', enrollmentNo: p.enrollment_number ?? p.enrollmentNo ?? '', amount: Number(p.amount ?? 0), date: p.date ?? '', mode: p.mode ?? '', transactionRef: p.transaction_ref ?? p.transactionRef ?? '', receivedBy: p.received_by ?? '', feeType: p.fee_type ?? p.feeType ?? '', status: p.status ?? 'Completed',
            }));
            setApiPayments(mapped);
        }
      } catch { /* fallback remains */ }
      setDataLoaded(true);
    })();
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => ({
    totalRevenue: effectivePayments.reduce((a, p) => a + p.amount, 0),
    pendingDues: studentFees.reduce((a, s) => a + s.due, 0),
    monthlyCollection: effectivePayments.filter(p => p.date.startsWith('2025-03')).reduce((a, p) => a + p.amount, 0),
    scholarshipsGiven: scholarships.reduce((a, s) => a + s.amount, 0),
  }), [effectivePayments]);

  const filteredFees = useMemo(() => effectiveFeeStructures.filter(f => search === '' || f.name.toLowerCase().includes(search.toLowerCase())), [search, effectiveFeeStructures]);
  const filteredStudentFees = useMemo(() => studentFees.filter(s => search === '' || s.studentName.toLowerCase().includes(search.toLowerCase()) || s.enrollmentNo.toLowerCase().includes(search.toLowerCase())), [search]);
  const filteredPayments = useMemo(() => effectivePayments.filter(p => search === '' || p.studentName.toLowerCase().includes(search.toLowerCase())), [search, effectivePayments]);

  const handleRecordPayment = async () => {
    if (!payForm.student || !payForm.amount) { showToast('Student and amount are required', 'error'); return; }
    setSubmitting(true);
    try {
      // Backend expects camelCase: studentId, amountPaid, paymentMode, transactionRef
      await createPayment({ studentId: payForm.student, amountPaid: Number(payForm.amount), paymentMode: payForm.mode, transactionRef: payForm.ref, date: payForm.date, feeType: 'General', });
      showToast('Payment recorded successfully');
      setShowPaymentModal(false);
      setPayForm({ student: '', amount: '', mode: 'Cash', ref: '', date: new Date().toISOString().split('T')[0] });
      const pRes = await getPayments();
      if (Array.isArray(pRes)) { setApiPayments(pRes.map((p: any) => ({ id: String(p.id ?? ''), studentName: p.student_name ?? '', enrollmentNo: p.enrollment_number ?? '', amount: Number(p.amount ?? 0), date: p.date ?? '', mode: p.mode ?? '', transactionRef: p.transaction_ref ?? '', receivedBy: p.received_by ?? '', feeType: p.fee_type ?? '', status: p.status ?? 'Completed' }))); }
    } catch (e: any) { showToast(e.message || 'Failed to record payment', 'error'); }
    setSubmitting(false);
  };

  const handleAddFee = async () => {
    if (!feeForm.name || !feeForm.amount) { showToast('Fee name and amount are required', 'error'); return; }
    setSubmitting(true);
    try {
      await createFeeStructure({ name: feeForm.name, program: feeForm.program, type: feeForm.type, amount: Number(feeForm.amount), frequency: feeForm.frequency, mandatory: feeForm.mandatory, description: feeForm.description });
      showToast('Fee structure created successfully');
      setShowAddFeeModal(false);
      setFeeForm({ name: '', program: 'B.Th', type: 'Tuition', amount: '', frequency: 'Per Semester', mandatory: true, description: '' });
      const fRes = await getFeeStructures();
      if (Array.isArray(fRes)) {
        const mapped = fRes.map((f: any) => ({
          id: String(f.id ?? ''), name: f.name ?? '', program: f.program_name ?? f.program ?? '', type: f.type ?? '', amount: Number(f.amount ?? 0), frequency: f.frequency ?? '', isMandatory: f.is_mandatory ?? f.isMandatory ?? true, status: f.status ?? 'Active', description: f.description ?? '',
        }));
        setApiFeeStructures(mapped);
      }
    } catch (e: any) { showToast(e.message || 'Failed to create fee structure', 'error'); }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {ToastUI}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-amber-600" /> Financial Management
          </h2>
          <p className="text-slate-500 mt-1 text-sm">Fee structures, payments, invoices, and scholarships</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPaymentModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 shadow-lg shadow-amber-600/20 transition-all">
            <CreditCard className="h-4 w-4" /> Record Payment
          </button>
          <button onClick={() => setShowAddFeeModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all">
            <Plus className="h-4 w-4" /> Add Fee Structure
          </button>
        </div>
      </div>

      {/* Financial Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: fmt(stats.totalRevenue), icon: TrendingUp, color: 'bg-emerald-600', sub: 'All time collection' },
          { label: 'Pending Dues', value: fmt(stats.pendingDues), icon: AlertCircle, color: 'bg-red-600', sub: 'Outstanding fees' },
          { label: 'Monthly Collection', value: fmt(stats.monthlyCollection), icon: Wallet, color: 'bg-blue-600', sub: 'March 2025' },
          { label: 'Scholarships Given', value: fmt(stats.scholarshipsGiven), icon: Gift, color: 'bg-amber-600', sub: `${scholarships.length} active` },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}><card.icon className="h-5 w-5 text-white" /></div>
            <p className="text-xl font-extrabold text-slate-900">{card.value}</p>
            <p className="text-xs text-slate-500 mt-1">{card.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="border-b border-slate-100 overflow-x-auto">
          <div className="flex px-4 gap-1 min-w-max">
            {tabs.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(i)}
                className={`px-4 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === i ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}>{tab}</button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {/* ─── Overview Tab ─────────────────────────────────────────────── */}
          {activeTab === 0 && (
            <div className="space-y-6">
              {/* Revenue Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white">
                  <p className="text-sm text-slate-300">Total Billed (2024-25)</p>
                  <p className="text-2xl font-extrabold mt-1">{fmt(659000)}</p>
                  <p className="text-xs text-emerald-400 mt-2">10 students across 3 programs</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-5 text-white">
                  <p className="text-sm text-emerald-100">Collected (2024-25)</p>
                  <p className="text-2xl font-extrabold mt-1">{fmt(stats.totalRevenue)}</p>
                  <p className="text-xs text-emerald-200 mt-2">{Math.round((stats.totalRevenue / 659000) * 100)}% collection rate</p>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white">
                  <p className="text-sm text-amber-100">Scholarships Awarded</p>
                  <p className="text-2xl font-extrabold mt-1">{fmt(stats.scholarshipsGiven)}</p>
                  <p className="text-xs text-amber-200 mt-2">{scholarships.length} scholarship programs</p>
                </div>
              </div>

              {/* Recent Payments */}
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3">Recent Payments</h3>
                <div className="space-y-2">
                  {effectivePayments.slice(0, 5).map(p => (
                    <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center"><CheckCircle className="h-4 w-4 text-emerald-600" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{p.studentName}</p>
                        <p className="text-xs text-slate-400">{p.enrollmentNo} · {p.feeType}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-slate-900">{fmt(p.amount)}</p>
                        <p className="text-xs text-slate-400">{p.date} · {p.mode}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Mode Breakdown */}
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3">Payment Methods</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[{ mode: 'Bank Transfer', count: 4, color: 'bg-blue-50 text-blue-700 border-blue-200' },
                    { mode: 'UPI', count: 3, color: 'bg-purple-50 text-purple-700 border-purple-200' },
                    { mode: 'Cash', count: 1, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                    { mode: 'Online/Sponsor', count: 2, color: 'bg-amber-50 text-amber-700 border-amber-200' },
                  ].map(m => (
                    <div key={m.mode} className={`p-4 rounded-xl border ${m.color}`}>
                      <p className="text-2xl font-extrabold">{m.count}</p>
                      <p className="text-xs font-medium mt-1">{m.mode}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── Fee Structures Tab ──────────────────────────────────────── */}
          {activeTab === 1 && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search fee structures..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Fee Name</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Program</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">Type</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Amount</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">Frequency</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">Mandatory</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredFees.map(f => (
                      <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900">{f.name}</td>
                        <td className="px-4 py-3"><span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">{f.program}</span></td>
                        <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{f.type}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{fmt(f.amount)}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs hidden lg:table-cell">{f.frequency}</td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${f.isMandatory ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                            {f.isMandatory ? 'Required' : 'Optional'}
                          </span>
                        </td>
                        <td className="px-4 py-3"><span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700">{f.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── Student Fees Tab ────────────────────────────────────────── */}
          {activeTab === 2 && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student name or enrollment..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Student</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">Program</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Total</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">Paid</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Due</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredStudentFees.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{s.studentName}</p>
                          <p className="text-xs text-slate-400">{s.enrollmentNo}</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell"><span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">{s.program}</span></td>
                        <td className="px-4 py-3 text-right font-medium text-slate-700">{fmt(s.totalFee)}</td>
                        <td className="px-4 py-3 text-right text-emerald-600 font-medium hidden md:table-cell">{fmt(s.paid)}</td>
                        <td className="px-4 py-3 text-right font-medium text-red-600">{fmt(s.due)}</td>
                        <td className="px-4 py-3">{feeStatusBadge(s.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── Payments Tab ────────────────────────────────────────────── */}
          {activeTab === 3 && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search payments..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Payment ID</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Student</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Amount</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">Mode</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">Ref</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">Date</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {effectivePayments.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">{p.id}</td>
                        <td className="px-4 py-3"><p className="font-medium text-slate-900 truncate max-w-[160px]">{p.studentName}</p><p className="text-xs text-slate-400">{p.feeType}</p></td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-700">{fmt(p.amount)}</td>
                        <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{p.mode}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500 hidden lg:table-cell truncate max-w-[140px]">{p.transactionRef}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{p.date}</td>
                        <td className="px-4 py-3"><span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700">{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── Invoices Tab ────────────────────────────────────────────── */}
          {activeTab === 4 && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Invoice</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Student</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">Date</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">Due Date</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Total</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {invoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-slate-600 font-semibold">{inv.invoiceNo}</td>
                        <td className="px-4 py-3"><p className="font-medium text-slate-900">{inv.studentName}</p><p className="text-xs text-slate-400">{inv.enrollmentNo}</p></td>
                        <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{inv.date}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{inv.dueDate}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">{fmt(inv.total)}</td>
                        <td className="px-4 py-3">{feeStatusBadge(inv.status)}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => { setSelectedInvoice(inv); setShowInvoiceModal(true); }} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                            <Eye className="h-3.5 w-3.5" />View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── Sponsors Tab ────────────────────────────────────────────── */}
          {activeTab === 5 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scholarships.map(s => (
                  <div key={s.id} className="border border-slate-100 rounded-2xl p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><Gift className="h-5 w-5 text-amber-600" /></div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${s.type === 'Merit-based' ? 'bg-blue-50 text-blue-700' : s.type === 'Need-based' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{s.type}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                    <p className="text-lg font-extrabold text-amber-600 mt-1">{fmt(s.amount)}</p>
                    <div className="mt-3 space-y-1.5">
                      <p className="text-xs text-slate-500"><span className="font-medium text-slate-600">Donor:</span> {s.donor}</p>
                      <p className="text-xs text-slate-500"><span className="font-medium text-slate-600">Contact:</span> {s.donorContact}</p>
                      <p className="text-xs text-slate-500"><span className="font-medium text-slate-600">Students:</span> {s.students}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Record Payment Modal ───────────────────────────────────────── */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><CreditCard className="h-5 w-5 text-amber-600" />Record Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <Select label="Student" value={payForm.student} onChange={v => setPayForm(p => ({ ...p, student: v }))} options={studentFees.map(s => ({ label: `${s.studentName} (${s.enrollmentNo})`, value: s.id }))} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Amount (₹)" value={payForm.amount} onChange={v => setPayForm(p => ({ ...p, amount: v }))} />
                <Select label="Payment Mode" value={payForm.mode} onChange={v => setPayForm(p => ({ ...p, mode: v }))} options={[{label:'Cash',value:'Cash'},{label:'UPI',value:'UPI'},{label:'Bank Transfer',value:'Bank Transfer'},{label:'Online',value:'Online'},{label:'Sponsor',value:'Sponsor'}]} />
              </div>
              <Input label="Transaction Reference" value={payForm.ref} onChange={v => setPayForm(p => ({ ...p, ref: v }))} />
              <div className="space-y-1.5"><label className="block text-sm font-medium text-slate-700">Date</label><input type="date" value={payForm.date} onChange={e => setPayForm(p => ({ ...p, date: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" /></div>
            </div>
            <div className="flex items-center justify-end gap-2 p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button onClick={() => setShowPaymentModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition-all">Cancel</button>
              <button onClick={handleRecordPayment} disabled={submitting} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"><CheckCircle className="h-4 w-4" />{submitting ? 'Recording...' : 'Record Payment'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Add Fee Structure Modal ────────────────────────────────────── */}
      {showAddFeeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Plus className="h-5 w-5 text-amber-600" />Add Fee Structure</h3>
              <button onClick={() => setShowAddFeeModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <Input label="Fee Name" value={feeForm.name} onChange={v => setFeeForm(p => ({ ...p, name: v }))} />
              <div className="grid grid-cols-2 gap-4">
                <Select label="Program" value={feeForm.program} onChange={v => setFeeForm(p => ({ ...p, program: v }))} options={[{label:'B.Th',value:'B.Th'},{label:'M.Div',value:'M.Div'},{label:'Diploma',value:'Diploma'},{label:'All',value:'All'}]} />
                <Select label="Type" value={feeForm.type} onChange={v => setFeeForm(p => ({ ...p, type: v }))} options={[{label:'Tuition',value:'Tuition'},{label:'Admission',value:'Admission'},{label:'Hostel',value:'Hostel'},{label:'Library',value:'Library'},{label:'Exam',value:'Exam'},{label:'Transport',value:'Transport'},{label:'Misc',value:'Misc'}]} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Amount (₹)" value={feeForm.amount} onChange={v => setFeeForm(p => ({ ...p, amount: v }))} />
                <Select label="Frequency" value={feeForm.frequency} onChange={v => setFeeForm(p => ({ ...p, frequency: v }))} options={[{label:'One-time',value:'One-time'},{label:'Per Semester',value:'Per Semester'},{label:'Per Year',value:'Per Year'},{label:'Monthly',value:'Monthly'}]} />
              </div>
              <div className="flex items-center gap-2"><input type="checkbox" checked={feeForm.mandatory} onChange={e => setFeeForm(p => ({ ...p, mandatory: e.target.checked }))} className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500" /><label className="text-sm font-medium text-slate-700">Mandatory Fee</label></div>
              <div className="space-y-1.5"><label className="block text-sm font-medium text-slate-700">Description</label><textarea value={feeForm.description} onChange={e => setFeeForm(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all resize-none" /></div>
            </div>
            <div className="flex items-center justify-end gap-2 p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button onClick={() => setShowAddFeeModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition-all">Cancel</button>
              <button onClick={handleAddFee} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"><Plus className="h-4 w-4" />Add Fee</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Invoice Preview Modal ──────────────────────────────────────── */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><FileText className="h-5 w-5 text-amber-600" />Invoice Preview</h3>
              <button onClick={() => setShowInvoiceModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6">
              <div className="bg-slate-50 rounded-xl p-5 space-y-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">From</p>
                    <p className="font-bold text-slate-900">Covenant Theological Seminary</p>
                    <p className="text-xs text-slate-500">12, Seminary Road, Kottayam, Kerala</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-slate-900">{selectedInvoice.invoiceNo}</p>
                    <p className="text-xs text-slate-500">Date: {selectedInvoice.date}</p>
                    <p className="text-xs text-slate-500">Due: {selectedInvoice.dueDate}</p>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Bill To</p>
                  <p className="font-semibold text-slate-900">{selectedInvoice.studentName}</p>
                  <p className="text-xs text-slate-500">{selectedInvoice.enrollmentNo}</p>
                </div>
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-slate-400 border-b border-slate-200"><th className="pb-2 text-xs">Description</th><th className="pb-2 text-xs text-right">Amount</th></tr></thead>
                  <tbody>
                    {selectedInvoice.items.map((item, i) => (
                      <tr key={i} className="border-b border-slate-100"><td className="py-2 text-slate-700">{item.description}</td><td className="py-2 text-right font-medium">{fmt(item.amount)}</td></tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-end">
                  <div className="w-48 space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{fmt(selectedInvoice.subtotal)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Tax</span><span>{fmt(selectedInvoice.tax)}</span></div>
                    <div className="flex justify-between font-bold text-lg border-t border-slate-200 pt-1"><span>Total</span><span className="text-slate-900">{fmt(selectedInvoice.total)}</span></div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-center text-slate-400 mt-4">UPI QR Code for payment would be displayed here</p>
            </div>
            <div className="flex items-center justify-end gap-2 p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition-all"><Printer className="h-4 w-4" />Print</button>
              <button className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition-all"><Mail className="h-4 w-4" />Email</button>
              <button className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all"><Download className="h-4 w-4" />PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
