import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Book, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText,
  BadgeCheck,
  TrendingUp,
  Receipt,
  Edit3,
  Download,
  Save,
  X,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/useStore';
import { hasPermission } from '../lib/permissions';
import { 
  studentService, 
  financeService, 
  gradeService, 
  attendanceService, 
  subjectService,
  Student, 
  FeeTransaction, 
  Grade, 
  Attendance, 
  Subject 
} from '../services/dataService';

export function StudentProfile() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const canEditGrades = hasPermission(user?.role || null, 'faculty') || hasPermission(user?.role || null, 'settings');

  const [student, setStudent] = useState<Student | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [transactions, setTransactions] = useState<FeeTransaction[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<Student>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'academic' | 'spiritual' | 'financial' | 'documents'>('overview');

  // Grade Edit State
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [editGradeScore, setEditGradeScore] = useState<number>(0);
  const [editGradeMaxScore, setEditGradeMaxScore] = useState<number>(0);
  const [isSavingGrade, setIsSavingGrade] = useState(false);

  const handleSaveGrade = async (gradeId: string) => {
    setIsSavingGrade(true);
    try {
      await gradeService.updateGrade(gradeId, { score: editGradeScore, maxScore: editGradeMaxScore });
      setGrades(prev => prev.map(g => g.id === gradeId ? { ...g, score: editGradeScore, maxScore: editGradeMaxScore } : g));
      setEditingGradeId(null);
    } catch (e) {
      console.error(e);
      alert("Failed to update grade. Check permissions.");
    } finally {
      setIsSavingGrade(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      loadStudentData();
    }
  }, [studentId]);

  const loadStudentData = async () => {
    setIsLoading(true);
    try {
      const studentData = await studentService.getStudentById(studentId!);
      if (!studentData) {
        setIsLoading(false);
        return;
      }
      const tId = studentData.tenantId;

      const val = <T,>(p: PromiseSettledResult<T>): T => p.status === 'fulfilled' ? p.value : [] as T;

      const [subjectsData, gradesData, txData, attendanceData] = await Promise.allSettled([
        subjectService.getSubjectsByStudent(studentId!, tId),
        gradeService.getGradesByStudent(studentId!, tId),
        financeService.getTransactionsByStudent(studentId!, tId),
        attendanceService.getAttendanceByStudent(studentId!, tId)
      ]);

      setStudent(studentData);
      setEditData(studentData || {});
      setSubjects(val(subjectsData));
      setGrades(val(gradesData));
      setTransactions(val(txData));
      setAttendance(val(attendanceData));
    } catch (error) {
      console.error("Failed to load student profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!studentId) return;
    setIsSaving(true);
    try {
      await studentService.updateStudent(studentId, editData);
      setStudent({ ...student, ...editData } as Student);
      setIsEditModalOpen(false);
      alert("Student profile synchronized with institutional registry.");
    } catch (error) {
      console.error("Error updating student:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Type', 'Status', 'Date', 'Amount'];
    const rows = transactions.map(tx => [
      tx.type,
      tx.status,
      tx.date?.toDate?.() ? tx.date.toDate().toLocaleDateString() : 'N/A',
      tx.amount
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `student_finance_${studentId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateGPA = () => {
    if (grades.length === 0) return '0.00';
    let totalPoints = 0;
    grades.forEach(g => {
      const p = (g.score / g.maxScore) * 100;
      if (p >= 90) totalPoints += 4.0;
      else if (p >= 80) totalPoints += 3.0;
      else if (p >= 70) totalPoints += 2.0;
      else if (p >= 60) totalPoints += 1.0;
    });
    return (totalPoints / grades.length).toFixed(2);
  };

  const calculateAttendanceRate = () => {
    if (attendance.length === 0) return '0.0%';
    const present = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
    return ((present / attendance.length) * 100).toFixed(1) + '%';
  };

  const hasUnpaidFees = transactions.some(t => t.status === 'pending' || t.status === 'overdue');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-500/10 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-xs font-medium uppercase  text-slate-400 animate-pulse">Accessing Secure Records...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center p-10">
        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
          <User className="w-10 h-10 text-slate-200" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 italic-serif">Record Not Found</h3>
        <p className="text-slate-400 text-sm mt-1 max-w-[280px]">The requested student ID does not match any entry in the current registry.</p>
        <button 
          onClick={() => navigate('/admissions')}
          className="mt-8 px-6 py-3 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Registry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-500">
        <Link 
          to="/admissions" 
          className="text-xs font-medium uppercase  text-slate-400 hover:text-blue-600 transition-colors"
        >
          Admissions Registry
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-xs font-medium uppercase  text-blue-600 italic-serif">
          Candidate Profile
        </span>
      </nav>

      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-sm">
              {student.photoUrl ? (
                <img src={student.photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{student.name.split(' ').map(n => n[0]).join('')}</span>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-lg border-4 border-slate-50 flex items-center justify-center shadow-md">
              <BadgeCheck className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <button 
                onClick={() => navigate('/admissions')}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                title="Back to Registry"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium uppercase  text-blue-600">Student Profile</span>
            </div>
            <h1 className="text-xl font-semibold text-slate-900">{student.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-medium uppercase tracking-wide text-slate-600">{student.program}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-medium uppercase tracking-wide text-slate-600">Year {student.year}</span>
              </div>
              <span className={cn(
                "px-3 py-1 rounded-md text-xs font-medium uppercase tracking-wide border",
                student.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-200"
              )}>
                {student.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3 text-right">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => alert(`Printing ID Card for ${student.name}...`)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-500 font-bold text-[10px] uppercase tracking-wide hover:text-blue-600 hover:border-blue-200 hover:shadow-sm transition-all shadow-sm flex items-center gap-2"
              title="Print ID Card"
            >
              <User className="w-4 h-4" /> ID Card
            </button>
            <button 
              onClick={() => alert(`Generating Admit Card for ${student.name}...`)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-500 font-bold text-[10px] uppercase tracking-wide hover:text-blue-600 hover:border-blue-200 hover:shadow-sm transition-all shadow-sm flex items-center gap-2"
              title="Print Admit Card"
            >
              <FileText className="w-4 h-4" /> Admit Card
            </button>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-sm transition-all shadow-sm"
              title="Edit Profile"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button 
              onClick={exportToCSV}
              className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-emerald-600 hover:border-emerald-100 hover:shadow-sm transition-all shadow-sm"
              title="Export Financials"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Institutional ID</p>
          <p className="font-mono text-sm font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">{student.studentId || `STU-${student.id?.slice(-8).toUpperCase()}`}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
        <div className="bg-white p-6 rounded-lg border border-slate-200/60 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">GPA Indicator</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{calculateGPA()} </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200/60 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">Attendance Rate</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{calculateAttendanceRate()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200/60 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Receipt className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">Financial Standing</p>
            <p className={cn("text-xl font-bold uppercase", hasUnpaidFees ? "text-amber-600" : "text-emerald-600")}>
              {hasUnpaidFees ? 'Pending Fees' : 'Clear'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-lg w-fit flex-wrap">
          <button 
            onClick={() => setActiveTab('overview')}
            className={cn(
              "px-6 py-2.5 rounded-lg text-xs font-medium uppercase tracking-wide transition-all outline-none",
              activeTab === 'overview' ? "bg-white text-blue-600 shadow-sm" : "hover:bg-white text-slate-400"
            )}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('academic')}
            className={cn(
              "px-6 py-2.5 rounded-lg text-xs font-medium uppercase tracking-wide transition-all outline-none",
              activeTab === 'academic' ? "bg-white text-blue-600 shadow-sm" : "hover:bg-white text-slate-400"
            )}
          >
            Academic
          </button>
          <button 
            onClick={() => setActiveTab('spiritual')}
            className={cn(
              "px-6 py-2.5 rounded-lg text-xs font-medium uppercase tracking-wide transition-all outline-none",
              activeTab === 'spiritual' ? "bg-white text-blue-600 shadow-sm" : "hover:bg-white text-slate-400"
            )}
          >
            Spiritual
          </button>
          <button 
            onClick={() => setActiveTab('financial')}
            className={cn(
              "px-6 py-2.5 rounded-lg text-xs font-medium uppercase tracking-wide transition-all outline-none",
              activeTab === 'financial' ? "bg-white text-blue-600 shadow-sm" : "hover:bg-white text-slate-400"
            )}
          >
            Financial
          </button>
          <button 
            onClick={() => setActiveTab('documents')}
            className={cn(
              "px-6 py-2.5 rounded-lg text-xs font-medium uppercase tracking-wide transition-all outline-none",
              activeTab === 'documents' ? "bg-white text-blue-600 shadow-sm" : "hover:bg-white text-slate-400"
            )}
          >
            Documents
          </button>
        </div>

        {activeTab === 'academic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-hidden lg:col-span-2">
              <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 italic-serif uppercase tracking-wide">Previous Educational Qualifications</h3>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Highest Qualification</p>
                  <p className="font-bold text-slate-900 italic-serif">{student.previousEducation?.qualification || 'Unrecorded'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Institution</p>
                  <p className="font-bold text-slate-900 italic-serif">{student.previousEducation?.institution || 'Unrecorded'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Board / University</p>
                  <p className="font-bold text-slate-900 italic-serif">{student.previousEducation?.boardOrUniversity || 'Unrecorded'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Year of Passing</p>
                  <p className="font-bold text-slate-900 italic-serif">{student.previousEducation?.yearOfPassing || 'Unrecorded'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Marks / Grade</p>
                  <p className="font-bold text-slate-900 italic-serif">{student.previousEducation?.marksOrGrade || 'Unrecorded'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Medium of Instruction</p>
                  <p className="font-bold text-slate-900 italic-serif">{student.previousEducation?.mediumOfInstruction || 'Unrecorded'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Book className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 italic-serif uppercase tracking-wide">Enrolled Subjects</h3>
                </div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{subjects.length} Modules</span>
              </div>
              <div className="p-4 space-y-3">
                {subjects.length === 0 ? (
                  <p className="text-center py-10 text-slate-400 text-sm italic-serif">No subject enrollments found.</p>
                ) : (
                  subjects.map(subject => (
                    <div key={subject.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-lg border border-transparent hover:border-slate-200 transition-all group">
                      <div>
                        <p className="font-bold text-slate-900 italic-serif tracking-tight">{subject.title}</p>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mt-0.5">{subject.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Active Enrollment</p>
                        <p className="text-[9px] font-mono text-slate-400 mt-0.5 whitespace-nowrap">Cohort 2024</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 italic-serif uppercase tracking-wide">Performance Matrix</h3>
                </div>
                <button 
                  onClick={() => alert(`Opening public result portal for ${student.name}...`)}
                  className="px-4 py-2 bg-white text-blue-600 border border-slate-200 rounded-lg text-xs font-medium uppercase tracking-wide hover:border-blue-200 hover:shadow-sm transition-all flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> View Result Sheet
                </button>
              </div>
              <div className="p-4 space-y-3">
                {grades.length === 0 ? (
                  <p className="text-center py-10 text-slate-400 text-sm italic-serif">No assessment data recorded yet.</p>
                ) : (
                  grades.map(grade => {
                    const subject = subjects.find(s => s.id === grade.subjectId);
                    const percentage = (grade.score / grade.maxScore) * 100;
                    const isEditing = editingGradeId === grade.id;

                    if (isEditing) {
                      return (
                        <div key={grade.id} className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div>
                              <p className="font-bold text-slate-900 italic-serif tracking-tight">{subject?.title || 'Unknown Subject'} <span className="text-xs text-blue-600 ml-2">(Editing)</span></p>
                              <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mt-0.5">{grade.type} Assessment</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <input 
                              type="number" 
                              value={editGradeScore} 
                              onChange={e => setEditGradeScore(Number(e.target.value))}
                              className="w-16 px-2 py-1 text-right border border-slate-200 rounded outline-none focus:border-blue-400 text-sm font-bold" 
                            />
                            <span className="text-slate-400 text-sm font-bold">/</span>
                            <input 
                              type="number" 
                              value={editGradeMaxScore} 
                              onChange={e => setEditGradeMaxScore(Number(e.target.value))}
                              className="w-16 px-2 py-1 border border-slate-200 rounded outline-none focus:border-blue-400 text-sm font-bold" 
                            />
                            <div className="flex items-center gap-1 ml-2">
                              <button 
                                onClick={() => handleSaveGrade(grade.id!)}
                                disabled={isSavingGrade}
                                className="p-1.5 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200 transition-colors disabled:opacity-50"
                              >
                                {isSavingGrade ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                              </button>
                              <button 
                                onClick={() => setEditingGradeId(null)}
                                className="p-1.5 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={grade.id} className="p-4 bg-slate-50/50 rounded-lg border border-transparent flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm",
                            percentage >= 80 ? "bg-emerald-50 text-emerald-600" : percentage >= 60 ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                          )}>
                            {percentage >= 90 ? 'A' : percentage >= 80 ? 'B+' : percentage >= 70 ? 'B' : 'C'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 italic-serif tracking-tight">{subject?.title || 'Unknown Subject'}</p>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mt-0.5">{grade.type} Assessment</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-slate-900 tabular-nums">{grade.score}/{grade.maxScore}</p>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{percentage.toFixed(1)}% Score</p>
                          </div>
                          {canEditGrades && (
                            <button 
                              onClick={() => {
                                setEditingGradeId(grade.id!);
                                setEditGradeScore(grade.score);
                                setEditGradeMaxScore(grade.maxScore);
                              }}
                              className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 italic-serif uppercase tracking-wide">Financial Portfolio & Grants</h3>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Fee Structure Assigned</p>
                  <p className="font-bold text-slate-900 italic-serif">{student.financial?.feeStructure || 'Standard'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Scholarship Status</p>
                  <p className="font-bold text-slate-900 italic-serif">{student.financial?.hasScholarship ? 'Awarded' : 'None'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Payment Plan</p>
                  <p className="font-bold text-slate-900 italic-serif">{student.financial?.paymentPlan || 'Monthly'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Account Standing</p>
                  <p className={cn("font-bold italic-serif", hasUnpaidFees ? "text-amber-600" : "text-emerald-600")}>
                    {student.financial?.feeStatus || (hasUnpaidFees ? 'Dues Pending' : 'Cleared')}
                  </p>
                </div>
                {student.financial?.sponsorshipDetails && (
                  <div className="lg:col-span-4 space-y-1 pt-4 border-t border-slate-100">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Sponsorship Details</p>
                    <p className="font-bold text-slate-900 italic-serif leading-relaxed">{student.financial.sponsorshipDetails}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 italic-serif uppercase tracking-wide">Financial Transaction Ledger</h3>
                </div>
              </div>
              <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-xs font-medium text-slate-400 uppercase  border-b border-slate-100">
                    <th className="px-4 py-3">Transaction Details</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3 text-right">Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-10 text-center text-slate-400 text-sm italic-serif">No financial records found in ledger.</td>
                    </tr>
                  ) : (
                    transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                              <Receipt className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-slate-900 italic-serif tracking-tight uppercase">Institutional Fee Entry</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium uppercase tracking-wide text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">{tx.type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className={cn("w-1.5 h-1.5 rounded-full", tx.status === 'paid' ? "bg-emerald-500" : "bg-amber-500")} />
                            <span className={cn("text-xs font-medium uppercase tracking-wide", tx.status === 'paid' ? "text-emerald-600" : "text-amber-600")}>{tx.status}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[9px] text-slate-400 uppercase">
                          {tx.date?.toDate?.() ? tx.date.toDate().toLocaleDateString() : 'Pending Sync'}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900 tabular-nums">
                          ${tx.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 italic-serif uppercase tracking-wide">Live Attendance Log</h3>
              </div>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attendance.length === 0 ? (
                <p className="col-span-full text-center py-10 text-slate-400 text-sm italic-serif">No attendance records found for current term.</p>
              ) : (
                attendance.map(record => {
                  const subject = subjects.find(s => s.id === record.subjectId);
                  return (
                    <div key={record.id} className="p-4 bg-slate-50/50 rounded-lg border border-transparent flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-all shadow-sm",
                        record.status === 'present' ? "bg-emerald-50 text-emerald-500 " : 
                        record.status === 'late' ? "bg-amber-50 text-amber-500 " : 
                        "bg-rose-50 text-rose-500 "
                      )}>
                        {record.status === 'present' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 italic-serif text-sm truncate">{subject?.title || 'Course Module'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{record.date}</p>
                          <div className="w-1 h-1 rounded-full bg-slate-300" />
                          <p className={cn("text-xs font-medium uppercase tracking-wide", 
                            record.status === 'present' ? "text-emerald-600" : 
                            record.status === 'late' ? "text-amber-600" : 
                            "text-rose-600"
                          )}>
                            {record.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'spiritual' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 italic-serif uppercase tracking-wide">Spiritual Profile</h3>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Conversion Date</p>
                  <p className="font-bold text-slate-900 italic-serif">{student.spiritual?.conversionDate ? new Date(student.spiritual.conversionDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Baptized</p>
                  <p className="font-bold text-slate-900 italic-serif">{student.spiritual?.isBaptized ? 'Yes' : 'No'}</p>
                </div>
                {student.spiritual?.isBaptized && (
                  <>
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Baptism Date</p>
                      <p className="font-bold text-slate-900 italic-serif">{student.spiritual?.baptismDate ? new Date(student.spiritual.baptismDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Baptism Church</p>
                      <p className="font-bold text-slate-900 italic-serif">{student.spiritual?.baptismChurch || 'N/A'}</p>
                    </div>
                  </>
                )}
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Current Church</p>
                  <p className="font-bold text-slate-900 italic-serif">{student.spiritual?.currentChurch || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Pastor Name</p>
                  <p className="font-bold text-slate-900 italic-serif">{student.spiritual?.pastorName || 'N/A'}</p>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Ministry Involvement</p>
                  <p className="font-bold text-slate-900 italic-serif leading-relaxed">{student.spiritual?.ministryInvolvement || 'N/A'}</p>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Spiritual Gifts</p>
                  <p className="font-bold text-slate-900 italic-serif leading-relaxed">{student.spiritual?.spiritualGifts || 'N/A'}</p>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Personal Testimony</p>
                  <p className="font-bold text-slate-900 italic-serif leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">{student.spiritual?.testimony || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900 text-white rounded-lg border border-slate-800 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 border-b border-slate-800 bg-slate-800/30 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white italic-serif uppercase tracking-wide">Calling & Ministry</h3>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase  text-slate-400">Divine Calling</p>
                  <p className="font-bold text-white italic-serif">{student.ministry?.isCalled ? 'Yes' : 'Pending Discernment'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase  text-slate-400">Type of Calling</p>
                  <p className="font-bold text-white italic-serif">{student.ministry?.callingType || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase  text-slate-400">Ministry Experience</p>
                  <p className="font-bold text-white italic-serif">{student.ministry?.experience || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase  text-slate-400">Years of Service</p>
                  <p className="font-bold text-white italic-serif">{student.ministry?.yearsOfService || '0'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase  text-slate-400">Preferred Field</p>
                  <p className="font-bold text-white italic-serif">{student.ministry?.preferredField || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase  text-slate-400">Internship Interest</p>
                  <p className="font-bold text-white italic-serif">{student.ministry?.internshipInterest || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
               <h3 className="text-lg font-bold text-slate-900 italic-serif uppercase tracking-wide">Document Repository</h3>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "ID Proof", url: student.documents?.idProofUrl },
                  { label: "Academic Certificates", url: student.documents?.academicCertsUrl },
                  { label: "Baptism Certificate", url: student.documents?.baptismCertUrl },
                  { label: "Recommendation Letter", url: student.documents?.recommendationUrl },
                ].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 italic-serif tracking-tight">{doc.label}</p>
                        <p className={cn("text-xs font-medium uppercase tracking-wide mt-0.5", doc.url ? "text-emerald-500" : "text-amber-500")}>
                          {doc.url ? 'Uploaded' : 'Missing'}
                        </p>
                      </div>
                    </div>
                    {doc.url ? (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 border border-slate-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all">
                        <Download className="w-4 h-4" />
                      </a>
                    ) : (
                      <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wide text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all">
                        Upload
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                  <h3 className="text-lg font-bold text-slate-900 italic-serif uppercase tracking-wide">Personal Identification</h3>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Biological Gender</p>
                    <p className="font-bold text-slate-900 italic-serif capitalize">{student.gender || 'Not Disclosed'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Date of Birth</p>
                    <p className="font-bold text-slate-900 italic-serif">{student.dob ? new Date(student.dob).toLocaleDateString() : 'Unrecorded'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Nationality</p>
                    <p className="font-bold text-slate-900 italic-serif">{student.nationality || 'Unrecorded'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Aadhaar / National ID</p>
                    <p className="font-bold text-slate-900 italic-serif">{student.nationalId || 'Unrecorded'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Passport Number</p>
                    <p className="font-bold text-slate-900 italic-serif">{student.passportNumber || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Primary Phone</p>
                    <p className="font-bold text-slate-900 italic-serif">{student.phone || 'No Contact Number'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Blood Group</p>
                    <p className="font-bold text-rose-600 italic-serif uppercase">{student.bloodGroup || 'Unrecorded'}</p>
                  </div>
                  <div className="md:col-span-2 space-y-1 mt-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Permanent Address</p>
                    <p className="font-bold text-slate-900 italic-serif leading-relaxed">{student.permanentAddress || 'Unrecorded'}</p>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Current Residential Address</p>
                    <p className="font-bold text-slate-900 italic-serif leading-relaxed">{student.currentAddress || student.address || 'Address information restricted or unrecorded.'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                  <h3 className="text-lg font-bold text-slate-900 italic-serif uppercase tracking-wide">Family & Background</h3>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Father's Name</p>
                    <p className="font-bold text-slate-900 italic-serif">{student.family?.fatherName || 'Unrecorded'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Mother's Name</p>
                    <p className="font-bold text-slate-900 italic-serif">{student.family?.motherName || 'Unrecorded'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Guardian Name</p>
                    <p className="font-bold text-slate-900 italic-serif">{student.family?.guardianName || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Occupation</p>
                    <p className="font-bold text-slate-900 italic-serif">{student.family?.occupation || 'Unrecorded'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Contact Number</p>
                    <p className="font-bold text-slate-900 italic-serif">{student.family?.contactNumber || 'Unrecorded'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Religious Background</p>
                    <p className="font-bold text-slate-900 italic-serif">{student.family?.background || 'Unrecorded'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                  <h3 className="text-lg font-bold text-slate-900 italic-serif uppercase tracking-wide text-rose-600">Medical Observations</h3>
                </div>
                <div className="p-8">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2">Health Conditions & Notes</p>
                  <p className="text-sm text-slate-700 leading-relaxed italic-serif mb-6">
                    {student.medicalNotes || "No clinical medical observations or chronic conditions have been flagged for this student record."}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Allergies</p>
                      <p className="font-bold text-slate-900 italic-serif">{student.allergies || 'None Recorded'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Disability</p>
                      <p className="font-bold text-slate-900 italic-serif">{student.disability || 'None Recorded'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-slate-900 text-white rounded-lg p-8  border border-slate-800">
                <h3 className="text-lg font-bold italic-serif uppercase tracking-wide mb-6 text-blue-400">Emergency Protocol</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-medium uppercase  text-slate-500 mb-2">Designated Contact</p>
                    <p className="text-xl font-bold italic-serif">{student.emergencyContact?.name || 'Authorized Kin Only'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase  text-slate-500 mb-1">Relationship</p>
                      <p className="text-sm font-bold opacity-80">{student.emergencyContact?.relationship || 'Restricted'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase  text-slate-500 mb-1">Contact Dial</p>
                      <p className="text-sm font-bold opacity-80">{student.emergencyContact?.phone || 'UNRECORDED'}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-800">
                    <p className="text-xs font-medium uppercase  text-amber-500 mb-2">Security Note</p>
                    <p className="text-[10px] text-slate-400 leading-relaxed italic">Direct verification required before initializing emergency logistics protocols.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-lg w-full max-w-2xl p-10 relative z-10 shadow-md border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 italic-serif uppercase">Edit Candidate Profile</h2>
                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide">Digital provenance for institutional records.</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-8 pr-4 scrollbar-hide">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-400 ml-4">Student ID / Roll No.</label>
                    <input 
                      type="text" 
                      value={editData.studentId || ''}
                      onChange={e => setEditData({...editData, studentId: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all font-bold italic-serif"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-400 ml-4">Profile Photo URL</label>
                    <input 
                      type="url" 
                      value={editData.photoUrl || ''}
                      onChange={e => setEditData({...editData, photoUrl: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all font-bold italic-serif"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-400 ml-4">Full Legal Name</label>
                    <input 
                      type="text" 
                      value={editData.name}
                      onChange={e => setEditData({...editData, name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all font-bold italic-serif"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-400 ml-4">Current Gender</label>
                    <select 
                      value={editData.gender}
                      onChange={e => setEditData({...editData, gender: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all font-bold italic-serif"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-400 ml-4">Residential Provenance</label>
                  <textarea 
                    value={editData.address}
                    onChange={e => setEditData({...editData, address: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all font-bold italic-serif resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-400 ml-4">Program Designation</label>
                    <input 
                      type="text" 
                      value={editData.program}
                      onChange={e => setEditData({...editData, program: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all font-bold italic-serif"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-400 ml-4">Registry Status</label>
                    <select 
                      value={editData.status}
                      onChange={e => setEditData({...editData, status: e.target.value as any})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all font-bold italic-serif"
                    >
                      <option value="active">Active</option>
                      <option value="graduated">Graduated</option>
                      <option value="withdrawn">Withdrawn</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-50 flex justify-end gap-3">
                <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600 transition-all">Cancel</button>
                <button 
                  onClick={handleUpdate}
                  disabled={isSaving}
                  className="px-10 py-3 bg-blue-600 text-white rounded-lg font-bold uppercase tracking-wide hover:bg-slate-900 transition-all shadow-sm flex items-center gap-2"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? 'Saving...' : 'Archive Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
