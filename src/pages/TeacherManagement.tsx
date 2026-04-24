import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Search, Plus, Filter, ShieldAlert, ShieldCheck, Shield, Eye, Lock,
  Download, AlertCircle, ChevronRight, Check, X, Phone, Mail, Briefcase, Award,
  Clock, BookOpen, GraduationCap, Heart, Calendar, DollarSign, FileText,
  Star, TrendingUp, BarChart3, Activity, CheckCircle2, XCircle, Pause,
  Church, Cross, Flame, Globe, Home, Stethoscope, FolderOpen, MessageSquare,
  ClipboardList, PieChart, UserCheck, Ban, EyeOff, ChevronDown, ChevronUp,
  Play, Square, Upload, Video, File, BookMarked, Target, Zap, ArrowUpRight,
  ArrowDownRight, Timer, CalendarDays, UserCog, Settings, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import {
  facultyService, subjectService, teachingAssignmentService,
  teacherLeaveService, teacherAttendanceService, teacherPerformanceService,
  sermonArchiveService, learningMaterialService, activityLogService,
  type Faculty, type Subject, type TeachingAssignment, type TeacherLeave,
  type TeacherAttendance, type TeacherPerformanceReview, type SermonArchive,
  type LearningMaterial
} from '../services/dataService';
import { useAuthStore } from '../store/useStore';
import { hasPermission } from '../lib/permissions';

// ===================================================================
// TYPES & CONSTANTS
// ===================================================================

type TabId = 'overview' | 'classes' | 'students' | 'assignments' | 'spiritual' | 'payroll' | 'documents' | 'performance' | 'attendance' | 'leave' | 'sermons' | 'activity';

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const TABS: TabDef[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'classes', label: 'Classes', icon: BookOpen },
  { id: 'students', label: 'Students', icon: GraduationCap },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList },
  { id: 'spiritual', label: 'Spiritual', icon: Church },
  { id: 'payroll', label: 'Payroll', icon: DollarSign },
  { id: 'documents', label: 'Documents', icon: FolderOpen },
  { id: 'performance', label: 'Performance', icon: Star },
  { id: 'attendance', label: 'Attendance', icon: CalendarDays },
  { id: 'leave', label: 'Leave', icon: Calendar },
  { id: 'sermons', label: 'Sermons', icon: Flame },
  { id: 'activity', label: 'Activity', icon: Activity },
];

const SPIRITUAL_GIFTS = ['Teaching', 'Leadership', 'Pastoral Care', 'Evangelism', 'Prophecy', 'Healing', 'Wisdom', 'Knowledge', 'Faith', 'Miracles', 'Tongues', 'Interpretation', 'Administration', 'Helps', 'Mercy', 'Music'];

const THEOLOGICAL_DEGREES = ['B.Th', 'B.D.', 'M.Div', 'M.Th', 'Th.M', 'PhD', 'D.Min', 'D.Th', 'Certificate', 'Diploma'];

const DEPARTMENTS = ['Theology', 'Old Testament', 'New Testament', 'Systematic Theology', 'Homiletics', 'Church History', 'Pastoral Theology', 'Biblical Languages', 'Mission Studies', 'Christian Ethics', 'Youth Ministry', 'Worship & Music'];

// ===================================================================
// HELPER: Profile Completion Ring
// ===================================================================

function CompletionRing({ percent }: { percent: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const color = percent >= 80 ? '#10b981' : percent >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-20 h-20">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="6" />
        <circle cx="40" cy="40" r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-black text-slate-700">{percent}%</span>
      </div>
    </div>
  );
}

// ===================================================================
// HELPER: Score Bar
// ===================================================================

function ScoreBar({ label, score, max = 10, color = 'bg-gradient-to-r from-fuchsia-500 to-violet-500' }: { label: string; score?: number; max?: number; color?: string }) {
  const pct = score ? (score / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
        <span className="text-xs font-bold text-slate-700">{score || 0}/{max}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
          className={cn("h-full rounded-full", color)} />
      </div>
    </div>
  );
}

// ===================================================================
// MAIN COMPONENT
// ===================================================================

export function TeacherManagement() {
  const { user } = useAuthStore();

  // Data state
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<TeachingAssignment[]>([]);
  const [leaves, setLeaves] = useState<TeacherLeave[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<TeacherAttendance[]>([]);
  const [performanceReviews, setPerformanceReviews] = useState<TeacherPerformanceReview[]>([]);
  const [sermons, setSermons] = useState<SermonArchive[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);

  // UI state
  const [selectedTeacher, setSelectedTeacher] = useState<Faculty | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [isPayrollUnlocked, setIsPayrollUnlocked] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false); // View mode = full page teacher profile

  const isAdmin = hasPermission(user?.role || null, 'settings');
  const canManageFinance = hasPermission(user?.role || null, 'finance');

  // Load data
  useEffect(() => {
    if (user?.tenantId) loadAllData();
  }, [user?.tenantId]);

  const loadAllData = async () => {
    setIsLoading(true);
    setErrorBanner(null);
    try {
      const val = <T,>(p: PromiseSettledResult<T>): T => p.status === 'fulfilled' ? p.value : [] as T;
      const [facData, subData, assignData, leaveData, perfData, sermonData, matData] = await Promise.allSettled([
        facultyService.getFacultyByTenant(user!.tenantId!),
        subjectService.getSubjectsByTenant(user!.tenantId!),
        teachingAssignmentService.getByTenant(user!.tenantId!),
        teacherLeaveService.getByTenant(user!.tenantId!),
        teacherPerformanceService.getByTenant(user!.tenantId!),
        sermonArchiveService.getByTenant(user!.tenantId!),
        learningMaterialService.getByTenant(user!.tenantId!),
      ]);
      setFaculty(val(facData));
      setSubjects(val(subData));
      setAssignments(val(assignData));
      setLeaves(val(leaveData));
      setPerformanceReviews(val(perfData));
      setSermons(val(sermonData));
      setMaterials(val(matData));
    } catch (error: any) {
      console.error("Failed to load teacher data:", error);
      setErrorBanner("Network error: Could not synchronize teacher records.");
    } finally {
      setIsLoading(false);
    }
  };

  // Derived data
  const filteredFaculty = useMemo(() => {
    return faculty.filter(f => {
      const matchSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.facultyId || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = filterDept === 'all' || f.department === filterDept;
      const matchStatus = filterStatus === 'all' || f.status === filterStatus;
      return matchSearch && matchDept && matchStatus;
    });
  }, [faculty, searchTerm, filterDept, filterStatus]);

  const stats = useMemo(() => {
    const active = faculty.filter(f => f.status === 'active').length;
    const pending = faculty.filter(f => f.status === 'pending').length;
    const onLeave = faculty.filter(f => f.status === 'on_leave').length;
    const totalLeaves = leaves.filter(l => l.status === 'pending').length;
    return { total: faculty.length, active, pending, onLeave, pendingLeaves: totalLeaves, departments: [...new Set(faculty.map(f => f.department))] };
  }, [faculty, leaves]);

  const selectedTeacherData = useMemo(() => {
    if (!selectedTeacher) return null;
    const teacherAssignments = assignments.filter(a => a.facultyId === selectedTeacher.id);
    const teacherLeaves = leaves.filter(l => l.facultyId === selectedTeacher.id);
    const teacherAttendance = attendanceRecords.filter(a => a.facultyId === selectedTeacher.id);
    const teacherReviews = performanceReviews.filter(r => r.facultyId === selectedTeacher.id);
    const teacherSermons = sermons.filter(s => s.facultyId === selectedTeacher.id);
    const teacherMaterials = materials.filter(m => m.facultyId === selectedTeacher.id);
    const teacherSubjects = subjects.filter(s =>
      s.teacherIds?.includes(selectedTeacher.id!) || s.moderatorIds?.includes(selectedTeacher.id!)
    );
    const profileCompletion = facultyService.calculateProfileCompletion(selectedTeacher);
    return {
      assignments: teacherAssignments,
      leaves: teacherLeaves,
      attendance: teacherAttendance,
      reviews: teacherReviews,
      sermons: teacherSermons,
      materials: teacherMaterials,
      subjects: teacherSubjects,
      profileCompletion,
    };
  }, [selectedTeacher, assignments, leaves, attendanceRecords, performanceReviews, sermons, materials, subjects]);

  // Handlers
  const handleApproveTeacher = async (teacher: Faculty) => {
    try {
      await facultyService.updateFaculty(teacher.id!, { status: 'active' });
      setFaculty(prev => prev.map(f => f.id === teacher.id ? { ...f, status: 'active' } : f));
      if (selectedTeacher?.id === teacher.id) setSelectedTeacher({ ...selectedTeacher, status: 'active' });
      await activityLogService.log({ userId: user!.uid, userName: user?.email, action: 'Approved Teacher', module: 'Faculty', details: `${teacher.name} was approved`, tenantId: user!.tenantId! });
    } catch (err) { setErrorBanner("Failed to approve teacher"); }
  };

  const handleRejectTeacher = async (teacher: Faculty) => {
    try {
      await facultyService.updateFaculty(teacher.id!, { status: 'suspended' });
      setFaculty(prev => prev.map(f => f.id === teacher.id ? { ...f, status: 'suspended' } : f));
      if (selectedTeacher?.id === teacher.id) setSelectedTeacher({ ...selectedTeacher, status: 'suspended' });
    } catch (err) { setErrorBanner("Failed to reject teacher"); }
  };

  const handleLeaveAction = async (leave: TeacherLeave, status: 'approved' | 'rejected') => {
    try {
      await teacherLeaveService.updateStatus(leave.id!, status, user!.uid);
      setLeaves(prev => prev.map(l => l.id === leave.id ? { ...l, status } : l));
    } catch (err) { setErrorBanner(`Failed to ${status} leave request`); }
  };

  const handleDeactivate = async (teacher: Faculty) => {
    if (!confirm(`Deactivate ${teacher.name}? They will lose access.`)) return;
    try {
      await facultyService.updateFaculty(teacher.id!, { status: 'retired' });
      setFaculty(prev => prev.map(f => f.id === teacher.id ? { ...f, status: 'retired' } : f));
      setSelectedTeacher(null);
    } catch (err) { setErrorBanner("Failed to deactivate teacher"); }
  };

  // ===================================================================
  // RENDER: Tab Content Panels
  // ===================================================================

  const renderTabContent = () => {
    if (!selectedTeacher || !selectedTeacherData) return null;

    switch (activeTab) {
      case 'overview':
        return <OverviewTab teacher={selectedTeacher} data={selectedTeacherData} subjects={subjects} />;
      case 'classes':
        return <ClassesTab teacher={selectedTeacher} data={selectedTeacherData} />;
      case 'spiritual':
        return <SpiritualTab teacher={selectedTeacher} />;
      case 'payroll':
        return <PayrollTab teacher={selectedTeacher} isUnlocked={isPayrollUnlocked} onToggleLock={() => setIsPayrollUnlocked(!isPayrollUnlocked)} />;
      case 'documents':
        return <DocumentsTab teacher={selectedTeacher} />;
      case 'performance':
        return <PerformanceTab teacher={selectedTeacher} data={selectedTeacherData} />;
      case 'attendance':
        return <AttendanceTab teacher={selectedTeacher} data={selectedTeacherData} />;
      case 'leave':
        return <LeaveTab teacher={selectedTeacher} data={selectedTeacherData} onAction={handleLeaveAction} />;
      case 'sermons':
        return <SermonsTab teacher={selectedTeacher} data={selectedTeacherData} />;
      case 'students':
        return <StudentsTab teacher={selectedTeacher} data={selectedTeacherData} />;
      case 'assignments':
        return <AssignmentsTab teacher={selectedTeacher} data={selectedTeacherData} />;
      case 'activity':
        return <ActivityTab teacher={selectedTeacher} />;
      default:
        return null;
    }
  };

  // ===================================================================
  // RENDER
  // ===================================================================

  return (
    <div className="space-y-8">
      {/* Error Banner */}
      <AnimatePresence>
        {errorBanner && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-4 rounded-2xl flex items-center justify-between shadow-lg bg-rose-50 border border-rose-100 text-rose-700">
              <div className="flex items-center gap-3"><AlertCircle className="w-5 h-5" /><span className="text-[10px] font-black uppercase tracking-widest">{errorBanner}</span></div>
              <button onClick={() => setErrorBanner(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5"><X className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-600">Theological Institution</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Personnel Management</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-950 tracking-tight italic-serif">Teacher Management</h1>
          <p className="text-slate-500 text-sm mt-1 max-w-lg">Spiritual leaders, educators, and ministers — unified in one secure system.</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/teacher-enrollment" className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-200 group no-underline">
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            <span>Add Teacher</span>
          </a>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Teachers', value: stats.total, icon: Users, color: 'bg-slate-50 text-slate-600', iconBg: 'bg-slate-100' },
          { label: 'Active', value: stats.active, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600', iconBg: 'bg-emerald-100' },
          { label: 'Pending Approval', value: stats.pending, icon: Pause, color: 'bg-amber-50 text-amber-600', iconBg: 'bg-amber-100' },
          { label: 'On Leave', value: stats.onLeave, icon: Calendar, color: 'bg-blue-50 text-blue-600', iconBg: 'bg-blue-100' },
          { label: 'Leave Requests', value: stats.pendingLeaves, icon: Clock, color: 'bg-rose-50 text-rose-600', iconBg: 'bg-rose-100' },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", stat.iconBg)}>
              <stat.icon className={cn("w-5 h-5", stat.color.split(' ')[1])} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900 tabular-nums">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 flex flex-wrap items-center gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input type="text" placeholder="Search by name, email, ID, dept..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border-none rounded-xl text-sm outline-none focus:ring-4 focus:ring-fuchsia-100 transition-all placeholder:text-slate-300 font-medium" />
        </div>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
          className="px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none">
          <option value="all">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="on_leave">On Leave</option>
          <option value="retired">Retired</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Teacher List Table */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-12 h-12 border-4 border-fuchsia-500/10 border-t-fuchsia-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse">Loading Teacher Registry...</p>
          </div>
        ) : filteredFaculty.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <Users className="w-16 h-16 text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 italic-serif">No Teachers Found</h3>
            <p className="text-slate-400 text-sm max-w-xs mt-1">No faculty matching your filters.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-5">Teacher</th>
                <th className="px-5 py-5">Department</th>
                <th className="px-5 py-5">Role</th>
                <th className="px-5 py-5 text-center">Profile</th>
                <th className="px-5 py-5 text-center">Status</th>
                <th className="px-5 py-5 text-center">Calling</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredFaculty.map((teacher) => {
                const completion = facultyService.calculateProfileCompletion(teacher);
                return (
                  <tr key={teacher.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 overflow-hidden rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 group-hover:from-fuchsia-700 hover:to-violet-700 group-hover:text-white transition-all duration-500 shadow-sm uppercase text-xs">
                          {teacher.photoUrl ? <img src={teacher.photoUrl} alt={teacher.name} className="w-full h-full object-cover" /> :
                            <span>{teacher.name.split(' ').map(n => n[0]).join('')}</span>}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 tracking-tight italic-serif text-sm">{teacher.name}</p>
                          <div className="flex gap-2 items-center mt-0.5">
                            {teacher.facultyId && <span className="text-[8px] uppercase font-black tracking-widest text-fuchsia-600 bg-fuchsia-50 px-1.5 py-0.5 rounded">{teacher.facultyId}</span>}
                            <p className="text-[9px] uppercase font-bold text-slate-400">{teacher.email}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-5 font-medium text-slate-600 text-xs">{teacher.department}</td>
                    <td className="px-5 py-5 text-xs font-bold text-slate-700">{teacher.employment?.role || teacher.role}</td>
                    <td className="px-5 py-5">
                      <div className="flex justify-center">
                        <CompletionRing percent={completion} />
                      </div>
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex justify-center">
                        <span className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                          teacher.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          teacher.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                          teacher.status === 'on_leave' ? "bg-blue-50 text-blue-600 border-blue-100" :
                          teacher.status === 'suspended' ? "bg-rose-50 text-rose-600 border-rose-100" :
                          "bg-slate-100 text-slate-500 border-slate-200"
                        )}>{teacher.status.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-5 py-5 text-center">
                      {teacher.ministry?.callingType ? (
                        <span className="text-[9px] font-black text-purple-600 bg-purple-50 px-2 py-1 rounded uppercase tracking-widest">{teacher.ministry.callingType}</span>
                      ) : (
                        <span className="text-[9px] font-black text-slate-300 uppercase">N/A</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {teacher.status === 'pending' && isAdmin && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); handleApproveTeacher(teacher); }}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-colors flex items-center gap-1">
                              <Check className="w-3 h-3" /> Approve
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleRejectTeacher(teacher); }}
                              className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-colors flex items-center gap-1">
                              <X className="w-3 h-3" /> Reject
                            </button>
                          </>
                        )}
                        <button onClick={() => { setSelectedTeacher(teacher); setActiveTab('overview'); }}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm border border-slate-100">
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Teacher Detail Panel (Full Page) */}
      <AnimatePresence>
        {selectedTeacher && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="bg-white rounded-3xl border border-slate-200/60 shadow-lg overflow-hidden"
          >
            {/* Teacher Detail Header */}
            <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-fuchsia-50 border-2 border-fuchsia-200 flex items-center justify-center shadow-xl shadow-fuchsia-100/20">
                    {selectedTeacher.photoUrl ? <img src={selectedTeacher.photoUrl} alt={selectedTeacher.name} className="w-full h-full object-cover" /> :
                      <Users className="w-8 h-8 text-fuchsia-600" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-slate-900 italic-serif tracking-tight">{selectedTeacher.name}</h2>
                      {selectedTeacher.status === 'active' && <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {selectedTeacher.facultyId && <span className="text-[9px] font-black text-fuchsia-600 bg-fuchsia-50 px-2 py-0.5 rounded uppercase tracking-widest">{selectedTeacher.facultyId}</span>}
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{selectedTeacher.department}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-[10px] font-bold text-slate-500">{selectedTeacher.employment?.role || selectedTeacher.role}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-[10px] font-bold text-slate-500">{selectedTeacher.email}</span>
                    </div>
                    {selectedTeacher.ministry?.callingType && (
                      <div className="flex items-center gap-2 mt-2">
                        <Church className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">{selectedTeacher.ministry.callingType}</span>
                        {selectedTeacher.ministry.ordinationStatus && (
                          <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase">{selectedTeacher.ministry.ordinationStatus}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CompletionRing percent={selectedTeacherData?.profileCompletion || 0} />
                  <button onClick={() => setSelectedTeacher(null)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors border border-slate-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Admin Actions */}
              {isAdmin && (
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
                  <a href={`/teacher-enrollment?edit=${selectedTeacher.id}`} className="px-4 py-2 bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:from-fuchsia-700 hover:to-violet-700 hover:text-white transition-colors flex items-center gap-2 no-underline">
                    <Settings className="w-3 h-3" /> Edit Profile
                  </a>
                  {selectedTeacher.status === 'pending' && (
                    <>
                      <button onClick={() => handleApproveTeacher(selectedTeacher)}
                        className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-colors flex items-center gap-2">
                        <Check className="w-3 h-3" /> Approve
                      </button>
                      <button onClick={() => handleRejectTeacher(selectedTeacher)}
                        className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-colors flex items-center gap-2">
                        <X className="w-3 h-3" /> Reject
                      </button>
                    </>
                  )}
                  {selectedTeacher.status !== 'retired' && selectedTeacher.status !== 'suspended' && (
                    <button onClick={() => handleDeactivate(selectedTeacher)}
                      className="px-4 py-2 bg-slate-50 text-slate-500 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-colors flex items-center gap-2">
                      <Ban className="w-3 h-3" /> Deactivate
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-slate-100 overflow-x-auto">
              <div className="flex px-6 gap-1 min-w-max">
                {TABS.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap",
                      activeTab === tab.id
                        ? "border-fuchsia-500 text-fuchsia-600 bg-fuchsia-50/50"
                        : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    )}>
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                    {tab.id === 'leave' && selectedTeacherData?.leaves.filter(l => l.status === 'pending').length ? (
                      <span className="w-4 h-4 bg-rose-500 text-white rounded-full text-[8px] font-bold flex items-center justify-center">
                        {selectedTeacherData.leaves.filter(l => l.status === 'pending').length}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {renderTabContent()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===================================================================
// TAB COMPONENTS
// ===================================================================

function OverviewTab({ teacher, data, subjects }: { teacher: Faculty; data: NonNullable<ReturnType<typeof TeacherManagement>['prototype'] extends { selectedTeacherData?: infer T } ? T : never>; subjects: Subject[] }) {
  const d = data as any;
  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Profile Completion', value: `${d.profileCompletion}%`, icon: Target, color: d.profileCompletion >= 80 ? 'text-emerald-600' : 'text-amber-600' },
          { label: 'Subjects Assigned', value: d.subjects.length, icon: BookOpen },
          { label: 'Teaching Assignments', value: d.assignments.filter((a: any) => a.status === 'active').length, icon: ClipboardList },
          { label: 'Total Sermons', value: d.sermons.length, icon: Flame },
        ].map(s => (
          <div key={s.label} className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={cn("w-4 h-4", s.color || 'text-slate-400')} />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Phone className="w-4 h-4 text-fuchsia-500" /> Contact Information</h3>
          {[
            { icon: Mail, label: 'Email', value: teacher.email },
            { icon: Phone, label: 'Phone', value: teacher.phone },
            { icon: Briefcase, label: 'Department', value: teacher.department },
            { icon: Award, label: 'Qualification', value: teacher.qualifications?.theologicalDegree || teacher.qualifications?.highestQualification || 'N/A' },
            { icon: Clock, label: 'Experience', value: teacher.employment?.experienceYears ? `${teacher.employment.experienceYears} years` : 'N/A' },
            { icon: Calendar, label: 'Joined', value: teacher.employment?.dateOfJoining || 'N/A' },
            { icon: Globe, label: 'Employment Type', value: teacher.employment?.employmentType || 'N/A' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:shadow-sm transition-shadow">
              <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center"><item.icon className="w-4 h-4 text-slate-400" /></div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                <p className="text-sm font-bold text-slate-800">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Performance Scores */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" /> Performance Scores</h3>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
            <ScoreBar label="Teaching Quality" score={teacher.performance?.teachingQualityScore} color="bg-gradient-to-r from-fuchsia-500 to-violet-500" />
            <ScoreBar label="Ministry Impact" score={teacher.performance?.ministryImpactScore} color="bg-purple-500" />
            <ScoreBar label="Student Feedback" score={teacher.performance?.studentFeedbackScore} color="bg-emerald-500" />
            <ScoreBar label="Admin Rating" score={teacher.performance?.adminRating} color="bg-amber-500" />
          </div>

          {/* Spiritual Snapshot */}
          {teacher.spiritual && (
            <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100">
              <h3 className="text-sm font-black text-purple-700 uppercase tracking-widest flex items-center gap-2 mb-4"><Church className="w-4 h-4" /> Spiritual Snapshot</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase">Church</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">{teacher.spiritual.currentChurch || 'N/A'}</p>
                </div>
                <div className="bg-white p-3 rounded-xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase">Pastor</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">{teacher.spiritual.pastorName || 'N/A'}</p>
                </div>
                <div className="bg-white p-3 rounded-xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase">Baptized</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">{teacher.spiritual.isBaptized ? `Yes (${teacher.spiritual.baptismDate || ''})` : 'No'}</p>
                </div>
                <div className="bg-white p-3 rounded-xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase">Min. Years</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">{teacher.spiritual.yearsInMinistry || 0}</p>
                </div>
              </div>
              {teacher.spiritual.spiritualGifts && teacher.spiritual.spiritualGifts.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {teacher.spiritual.spiritualGifts.map(gift => (
                    <span key={gift} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-[8px] font-black uppercase tracking-wider">{gift}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      {teacher.bio && (
        <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 italic-serif">
          <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Biography</h3>
          <p className="text-sm leading-relaxed text-slate-600">{teacher.bio}</p>
        </div>
      )}
    </div>
  );
}

function ClassesTab({ teacher, data }: { teacher: Faculty; data: any }) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Teaching Assignments</h3>
      {data.assignments.length === 0 ? (
        <div className="text-center py-16"><BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" /><p className="text-slate-400 text-sm">No teaching assignments yet.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.assignments.map((a: TeachingAssignment) => (
            <div key={a.id} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className={cn("px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                  a.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                )}>{a.status}</span>
                <span className="text-[8px] font-black text-slate-400 uppercase">{a.mode}</span>
              </div>
              <h4 className="font-bold text-slate-900 italic-serif">{a.subjectName || 'Untitled'}</h4>
              <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-bold uppercase">
                <span>{a.subjectCode || ''}</span>
                {a.batch && <><span className="text-slate-300">|</span><span>{a.batch}</span></>}
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                <div className="text-[9px] text-slate-400"><span className="font-black">{a.weeklyHours || 0}</span> hrs/week</div>
                <div className="text-[9px] text-slate-400"><span className="font-black">{a.semester || '—'}</span> semester</div>
                <div className="text-[9px] text-slate-400"><span className="font-black">{a.academicYear || '—'}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assigned Subjects from subject collection */}
      {data.subjects.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Assigned Subjects (from Course Catalog)</h3>
          <div className="space-y-3">
            {data.subjects.map(s => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:shadow-sm transition-shadow">
                <div>
                  <p className="font-bold text-slate-900 italic-serif">{s.title}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase mt-1">
                    <span>{s.code}</span><span className="text-slate-300">|</span><span>{s.department}</span><span className="text-slate-300">|</span><span>{s.creditHours} credits</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-fuchsia-50 text-fuchsia-600 rounded-lg text-[9px] font-black uppercase">{s.teacherIds?.includes(teacher.id!) ? 'Teacher' : 'Moderator'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SpiritualTab({ teacher }: { teacher: Faculty }) {
  const s = teacher.spiritual;
  const m = teacher.ministry;
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-8 rounded-2xl border border-purple-100">
        <h3 className="text-sm font-black text-purple-800 uppercase tracking-widest flex items-center gap-2 mb-6"><Church className="w-5 h-5" /> Spiritual Profile</h3>
        {s ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Date of Conversion', value: s.conversionDate || 'N/A', icon: Cross },
              { label: 'Baptism Status', value: s.isBaptized ? `Yes — ${s.baptismDate || ''} at ${s.baptismChurch || ''}` : 'Not Baptized', icon: Heart },
              { label: 'Current Church', value: s.currentChurch || 'N/A', icon: Church },
              { label: 'Pastor Name', value: s.pastorName || 'N/A', icon: Users },
              { label: 'Ministry Involvement', value: s.ministryInvolvement || 'N/A', icon: Globe },
              { label: 'Years in Ministry', value: s.yearsInMinistry ? `${s.yearsInMinistry} years` : 'N/A', icon: Timer },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3 p-4 bg-white/80 rounded-xl border border-white">
                <item.icon className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}
            {s.spiritualGifts && s.spiritualGifts.length > 0 && (
              <div className="col-span-full">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Spiritual Gifts</p>
                <div className="flex flex-wrap gap-2">
                  {s.spiritualGifts.map(gift => (
                    <span key={gift} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-xl text-[9px] font-black uppercase tracking-wider">{gift}</span>
                  ))}
                </div>
              </div>
            )}
            {s.personalTestimony && (
              <div className="col-span-full p-5 bg-white/80 rounded-xl border border-white">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Personal Testimony</p>
                <p className="text-sm text-slate-600 italic-serif leading-relaxed">{s.personalTestimony}</p>
              </div>
            )}
            {s.statementOfFaith && (
              <div className="col-span-full p-5 bg-white/80 rounded-xl border border-white">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Statement of Faith</p>
                <p className="text-sm text-slate-600 leading-relaxed">{s.statementOfFaith}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12"><Church className="w-12 h-12 text-purple-200 mx-auto mb-3" /><p className="text-slate-400 text-sm">Spiritual profile not yet filled.</p></div>
        )}
      </div>

      {/* Ministry & Calling */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-2xl border border-amber-100">
        <h3 className="text-sm font-black text-amber-800 uppercase tracking-widest flex items-center gap-2 mb-6"><Target className="w-5 h-5" /> Ministry & Calling</h3>
        {m ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Calling Type', value: m.callingType || 'N/A' },
              { label: 'Ministry Experience', value: m.ministryExperience || 'N/A' },
              { label: 'Current Ministry Role', value: m.currentMinistryRole || 'N/A' },
              { label: 'Church Leadership Role', value: m.churchLeadershipRole || 'N/A' },
              { label: 'Field Experience', value: m.fieldExperience || 'N/A' },
              { label: 'Ordination Status', value: m.ordinationStatus || 'N/A' },
            ].map(item => (
              <div key={item.label} className="p-4 bg-white/80 rounded-xl border border-white">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12"><Target className="w-12 h-12 text-amber-200 mx-auto mb-3" /><p className="text-slate-400 text-sm">Ministry & Calling details not yet filled.</p></div>
        )}
      </div>
    </div>
  );
}

function PayrollTab({ teacher, isUnlocked, onToggleLock }: { teacher: Faculty; isUnlocked: boolean; onToggleLock: () => void }) {
  const p = teacher.payroll;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-500" /> Payroll & Financials</h3>
        <button onClick={onToggleLock}
          className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors",
            isUnlocked ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
          )}>
          {isUnlocked ? <><Lock className="w-3 h-3" /> Lock</> : <><Eye className="w-3 h-3" /> Decrypt</>}
        </button>
      </div>

      {!isUnlocked ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 rounded-2xl">
          <Shield className="w-8 h-8 text-slate-200" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Financial data encrypted</span>
          <span className="text-[10px] text-slate-300">Click Decrypt to view</span>
        </div>
      ) : p ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
            <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Salary Structure</h4>
            {[
              { label: 'Basic Salary', value: p.salaryStructure?.basic },
              { label: 'HRA', value: p.salaryStructure?.hra },
              { label: 'DA', value: p.salaryStructure?.da },
              { label: 'Allowances', value: p.salaryStructure?.allowances },
              { label: 'Deductions', value: p.salaryStructure?.deductions },
              { label: 'Tax', value: p.salaryStructure?.tax },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center py-2 border-t border-slate-50">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{row.label}</span>
                <span className="text-sm font-bold text-slate-800 font-mono">{row.value != null ? `$${row.value.toLocaleString()}` : '—'}</span>
              </div>
            ))}
            <div className="flex justify-between items-center py-3 border-t-2 border-slate-200">
              <span className="text-xs font-black text-slate-700 uppercase">Net Total</span>
              <span className="text-lg font-bold text-emerald-600 font-mono">{p.salaryStructure?.total ? `$${p.salaryStructure.total.toLocaleString()}` : '—'}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-3">
              <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Bank Details</h4>
              {[
                { label: 'Bank Name', value: p.bankDetails?.bankName },
                { label: 'Account Number', value: p.bankDetails?.accountNumber },
                { label: 'IFSC Code', value: p.bankDetails?.ifscCode },
                { label: 'Account Holder', value: p.bankDetails?.accountHolder },
                { label: 'PAN Number', value: p.panNumber },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{row.label}</span>
                  <span className="text-sm font-bold text-slate-800 font-mono">{row.value || '—'}</span>
                </div>
              ))}
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Payment Frequency</span>
              <p className="text-sm font-bold text-slate-800 mt-1">{p.paymentFrequency || 'Monthly'}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16"><DollarSign className="w-12 h-12 text-slate-200 mx-auto mb-3" /><p className="text-slate-400 text-sm">Payroll data not configured.</p></div>
      )}
    </div>
  );
}

function DocumentsTab({ teacher }: { teacher: Faculty }) {
  const docs = teacher.documents;
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><FolderOpen className="w-4 h-4 text-fuchsia-500" /> Documents</h3>
      {docs ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'ID Proof', url: docs.idProofUrl, icon: FileText },
            { label: 'Aadhaar / Passport', url: docs.aadhaarOrPassportUrl, icon: FileText },
            { label: 'Certificates', urls: docs.certificatesUrls, icon: Award },
            { label: 'Experience Letters', urls: docs.experienceLettersUrls, icon: Briefcase },
            { label: 'Ordination Certificate', url: docs.ordinationCertUrl, icon: Church },
            { label: 'Recommendation Letters', urls: docs.recommendationLettersUrls, icon: Star },
            { label: 'Resume / CV', url: docs.resumeUrl, icon: File },
          ].map(item => (
            <div key={item.label} className={cn("p-5 rounded-2xl border transition-all hover:shadow-sm",
              (item.url || (item.urls && item.urls.length > 0)) ? "bg-white border-slate-100" : "bg-slate-50/50 border-dashed border-slate-200"
            )}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center"><item.icon className="w-4 h-4 text-slate-400" /></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
              </div>
              {(item.url || (item.urls && item.urls.length > 0)) ? (
                <div className="flex flex-wrap gap-2">
                  {item.url && <span className="px-3 py-1.5 bg-fuchsia-50 text-fuchsia-600 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer hover:bg-fuchsia-100">View</span>}
                  {item.urls?.map((u, i) => <span key={i} className="px-3 py-1.5 bg-fuchsia-50 text-fuchsia-600 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer hover:bg-fuchsia-100">Doc {i + 1}</span>)}
                </div>
              ) : (
                <span className="text-[9px] text-slate-300 font-bold uppercase">Not uploaded</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16"><FolderOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" /><p className="text-slate-400 text-sm">No documents uploaded.</p></div>
      )}
    </div>
  );
}

function PerformanceTab({ teacher, data }: { teacher: Faculty; data: any }) {
  const p = teacher.performance;
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" /> Performance & Evaluation</h3>

      {/* Current Scores */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100">
        <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-4">Current Performance Scores</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ScoreBar label="Teaching Quality" score={p?.teachingQualityScore} color="bg-gradient-to-r from-fuchsia-500 to-violet-500" />
          <ScoreBar label="Ministry Impact" score={p?.ministryImpactScore} color="bg-purple-500" />
          <ScoreBar label="Student Feedback" score={p?.studentFeedbackScore} color="bg-emerald-500" />
          <ScoreBar label="Admin Rating" score={p?.adminRating} color="bg-amber-500" />
        </div>
      </div>

      {/* Review History */}
      <div>
        <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-4">Review History</h4>
        {data.reviews.length === 0 ? (
          <div className="text-center py-12"><Star className="w-10 h-10 text-slate-200 mx-auto mb-3" /><p className="text-slate-400 text-sm">No performance reviews yet.</p></div>
        ) : (
          <div className="space-y-3">
            {data.reviews.map((r: TeacherPerformanceReview) => (
              <div key={r.id} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-fuchsia-50 text-fuchsia-600 rounded-lg text-[9px] font-black uppercase">{r.type} Review</span>
                    <span className="text-[10px] text-slate-400">{r.reviewDate || '—'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">By: {r.reviewerName || '—'}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="bg-white p-3 rounded-xl"><p className="text-[8px] font-black text-slate-400 uppercase">Teaching</p><p className="text-sm font-bold text-fuchsia-600">{r.teachingQualityScore || 0}/10</p></div>
                  <div className="bg-white p-3 rounded-xl"><p className="text-[8px] font-black text-slate-400 uppercase">Ministry</p><p className="text-sm font-bold text-purple-600">{r.ministryImpactScore || 0}/10</p></div>
                  <div className="bg-white p-3 rounded-xl"><p className="text-[8px] font-black text-slate-400 uppercase">Feedback</p><p className="text-sm font-bold text-emerald-600">{r.studentFeedbackAvg || 0}/10</p></div>
                  <div className="bg-white p-3 rounded-xl"><p className="text-[8px] font-black text-slate-400 uppercase">Admin</p><p className="text-sm font-bold text-amber-600">{r.adminRating || 0}/10</p></div>
                </div>
                {r.reviewNotes && <p className="text-sm text-slate-600 bg-white p-3 rounded-xl mt-2">{r.reviewNotes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AttendanceTab({ teacher, data }: { teacher: Faculty; data: any }) {
  const records = data.attendance;
  const total = records.length;
  const present = records.filter((r: TeacherAttendance) => r.status === 'present').length;
  const late = records.filter((r: TeacherAttendance) => r.status === 'late').length;
  const absent = records.filter((r: TeacherAttendance) => r.status === 'absent').length;
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><CalendarDays className="w-4 h-4 text-blue-500" /> Attendance Record</h3>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Days', value: total, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: 'Present', value: present, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Late', value: late, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Absent', value: absent, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map(s => (
          <div key={s.label} className={cn("p-4 rounded-2xl border text-center", s.bg, `border-${s.color.split('-')[1]}-100`)}>
            <p className="text-2xl font-bold tabular-nums">{s.value}</p>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Attendance Rate */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Attendance Rate</span>
          <span className="text-lg font-bold text-emerald-600">{pct}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }}
            className="h-full bg-emerald-500 rounded-full" />
        </div>
      </div>

      {/* Recent Records */}
      <div>
        <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3">Recent Records</h4>
        {records.length === 0 ? (
          <div className="text-center py-12"><CalendarDays className="w-10 h-10 text-slate-200 mx-auto mb-3" /><p className="text-slate-400 text-sm">No attendance records.</p></div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {records.slice(-20).reverse().map((r: TeacherAttendance) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl">
                <span className="text-sm font-bold text-slate-700">{r.date}</span>
                <span className={cn("px-2 py-1 rounded-lg text-[9px] font-black uppercase",
                  r.status === 'present' ? 'bg-emerald-50 text-emerald-600' :
                  r.status === 'late' ? 'bg-amber-50 text-amber-600' :
                  r.status === 'absent' ? 'bg-rose-50 text-rose-600' :
                  'bg-blue-50 text-blue-600'
                )}>{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LeaveTab({ teacher, data, onAction }: { teacher: Faculty; data: any; onAction: (leave: TeacherLeave, status: 'approved' | 'rejected') => void }) {
  const leaveList = data.leaves;
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Calendar className="w-4 h-4 text-amber-500" /> Leave Management</h3>

      {leaveList.length === 0 ? (
        <div className="text-center py-16"><Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" /><p className="text-slate-400 text-sm">No leave requests.</p></div>
      ) : (
        <div className="space-y-3">
          {leaveList.map((l: TeacherLeave) => (
            <div key={l.id} className="p-5 bg-white rounded-2xl border border-slate-100 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                    l.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    l.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-rose-50 text-rose-600 border-rose-100'
                  )}>{l.status}</span>
                  <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded-lg text-[9px] font-black uppercase">{l.leaveType}</span>
                </div>
                <span className="text-xs font-bold text-slate-500">{l.totalDays} day{l.totalDays > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase">
                <span>{l.startDate}</span><span className="text-slate-300">to</span><span>{l.endDate}</span>
              </div>
              {l.reason && <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl">{l.reason}</p>}
              {l.status === 'pending' && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50">
                  <button onClick={() => onAction(l, 'approved')}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-colors flex items-center gap-1">
                    <Check className="w-3 h-3" /> Approve
                  </button>
                  <button onClick={() => onAction(l, 'rejected')}
                    className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-colors flex items-center gap-1">
                    <X className="w-3 h-3" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SermonsTab({ teacher, data }: { teacher: Faculty; data: any }) {
  const sermonsList = data.sermons;
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500" /> Sermon & Teaching Archive</h3>

      {sermonsList.length === 0 ? (
        <div className="text-center py-16"><Flame className="w-12 h-12 text-slate-200 mx-auto mb-3" /><p className="text-slate-400 text-sm">No sermons uploaded.</p></div>
      ) : (
        <div className="space-y-3">
          {sermonsList.map((s: SermonArchive) => (
            <div key={s.id} className="p-5 bg-white rounded-2xl border border-slate-100 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded-lg text-[9px] font-black uppercase">{s.type}</span>
                  {s.date && <span className="text-[10px] text-slate-400">{s.date}</span>}
                </div>
                <div className="flex items-center gap-2">
                  {s.videoUrl && <Video className="w-4 h-4 text-fuchsia-400" />}
                  {s.audioUrl && <Play className="w-4 h-4 text-emerald-400" />}
                  {s.notesUrl && <File className="w-4 h-4 text-amber-400" />}
                </div>
              </div>
              <h4 className="font-bold text-slate-900 italic-serif">{s.title}</h4>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-bold uppercase">
                {s.scripture && <span>{s.scripture}</span>}
                {s.topic && <><span className="text-slate-300">|</span><span>{s.topic}</span></>}
              </div>
              {s.tags && s.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {s.tags.map(tag => <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-bold uppercase">{tag}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentsTab({ teacher, data }: { teacher: Faculty; data: any }) {
  // Show subjects with student counts
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><GraduationCap className="w-4 h-4 text-fuchsia-500" /> Students</h3>
      <div className="bg-white p-6 rounded-2xl border border-slate-100">
        <p className="text-sm text-slate-600">Students assigned through courses and subjects will appear here. Use the <strong>Academic System</strong> to manage student assignments.</p>
      </div>
      {data.subjects.length > 0 ? (
        <div className="space-y-3">
          {data.subjects.map((s: Subject) => (
            <div key={s.id} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 italic-serif text-sm">{s.title}</p>
                <span className="text-[9px] font-black text-slate-400 uppercase">{s.code}</span>
              </div>
              <span className="px-2.5 py-1 bg-fuchsia-50 text-fuchsia-600 rounded-lg text-[9px] font-black">{s.studentIds?.length || 0} Students</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center py-8 text-slate-400 text-sm">No subjects with students assigned.</p>
      )}
    </div>
  );
}

function AssignmentsTab({ teacher, data }: { teacher: Faculty; data: any }) {
  const matList = data.materials;
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><ClipboardList className="w-4 h-4 text-blue-500" /> Learning Materials</h3>
      {matList.length === 0 ? (
        <div className="text-center py-16"><FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" /><p className="text-slate-400 text-sm">No learning materials uploaded.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matList.map((m: LearningMaterial) => (
            <div key={m.id} className="p-5 bg-white rounded-2xl border border-slate-100 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <span className={cn("px-2 py-1 rounded-lg text-[9px] font-black uppercase",
                  m.type === 'lecture_notes' ? 'bg-blue-50 text-blue-600' :
                  m.type === 'video' ? 'bg-purple-50 text-purple-600' :
                  m.type === 'assignment' ? 'bg-amber-50 text-amber-600' :
                  m.type === 'exam' ? 'bg-rose-50 text-rose-600' :
                  'bg-slate-50 text-slate-600'
                )}>{m.type.replace('_', ' ')}</span>
              </div>
              <h4 className="font-bold text-slate-900">{m.title}</h4>
              {m.description && <p className="text-xs text-slate-500 mt-1">{m.description}</p>}
              {m.downloadCount !== undefined && <p className="text-[9px] text-slate-400 mt-2">{m.downloadCount} downloads</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActivityTab({ teacher }: { teacher: Faculty }) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Activity className="w-4 h-4 text-slate-500" /> Activity Log</h3>
      <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center py-12">
        <Activity className="w-10 h-10 text-slate-200 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Activity tracking for {teacher.name} will be shown here.</p>
        <p className="text-slate-300 text-[10px] mt-2">Actions like profile updates, leave requests, and content uploads are logged.</p>
      </div>
    </div>
  );
}
