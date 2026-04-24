import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  Clock, 
  FileText, 
  Calendar, 
  ChevronRight, 
  Search, 
  Filter, 
  Plus, 
  Save, 
  Download, 
  Shield, 
  ShieldCheck, 
  AlertCircle,
  Clock3,
  Award,
  Activity,
  UserPlus,
  Sparkles,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { subjectService, facultyService, studentService, courseService, type Subject, type Faculty, type Student, type Course, type Attendance } from '../services/dataService';
import { geminiService } from '../services/geminiService';
import { useAuthStore } from '../store/useStore';

export default function SubjectPortal() {
  const { user } = useAuthStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allFaculty, setAllFaculty] = useState<Faculty[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'materials' | 'registry'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectFormData, setSubjectFormData] = useState({
    title: '',
    code: '',
    department: 'Theology',
    creditHours: 3,
    courseId: '',
    teacherIds: [] as string[],
    moderatorIds: [] as string[]
  });
  const [errorHeader, setErrorHeader] = useState<{message: string, type: 'error' | 'warning'} | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user?.tenantId) return;
    setLoading(true);
    setErrorHeader(null);
    try {
      const val = <T,>(p: PromiseSettledResult<T>): T => p.status === 'fulfilled' ? p.value : [] as T;
      const [allSub, allFac, allStu, allCou] = await Promise.allSettled([
        subjectService.getSubjectsByTenant(user.tenantId),
        facultyService.getFacultyByTenant(user.tenantId),
        studentService.getStudentsByTenant(user.tenantId),
        courseService.getCoursesByTenant(user.tenantId)
      ]);
      setSubjects(val(allSub));
      setAllFaculty(val(allFac));
      setStudents(val(allStu));
      setCourses(val(allCou));
      if (val(allSub).length > 0) setSelectedSubject(val(allSub)[0]);
    } catch (error: any) {
      console.error('Failed to load portal data:', error);
      setErrorHeader({ message: "Repository Sync Failure: Could not establish a secure connection to the academic vault.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAIGenerateOutline = async () => {
    if (!selectedSubject) return;
    setIsGenerating(true);
    setErrorHeader(null);
    try {
      const outline = await geminiService.generateSyllabusOutline(
        selectedSubject.title,
        selectedSubject.code
      );
      // In a real app we'd save this to the subject's 'syllabusOutline' field
      // For this demo, we'll update the syllabus field or just alert it
      const updatedSyllabus = (selectedSubject.syllabus || '') + "\n\nInstitutional Syllabus Preview:\n" + outline;
      await subjectService.updateSubject(selectedSubject.id, { syllabus: updatedSyllabus });
      const updated = { ...selectedSubject, syllabus: updatedSyllabus };
      setSelectedSubject(updated);
      setSubjects(prev => prev.map(s => s.id === updated.id ? updated : s));
    } catch (error: any) {
      console.error('AI Syllabus Error:', error);
      setErrorHeader({ message: "AI Assistant Interruption: Could not generate curriculum outline.", type: 'warning' });
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredSubjects = subjects.filter(s => 
    (s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterDept === 'all' || s.department === filterDept)
  );

  const handleAddDocument = () => {
    // Document upload logic
  };

  const handleSaveGrades = async () => {
    // Grade commitment logic
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenantId) return;
    try {
      if (editingSubject) {
        await subjectService.updateSubject(editingSubject.id!, subjectFormData);
      } else {
        await subjectService.addSubject({
          ...subjectFormData,
          tenantId: user.tenantId,
          teacherIds: [],
          moderatorIds: [],
          studentIds: []
        });
      }
      setIsAddSubjectModalOpen(false);
      setEditingSubject(null);
      setSubjectFormData({ 
        title: '', 
        code: '', 
        department: 'Theology', 
        creditHours: 3, 
        courseId: '',
        teacherIds: [],
        moderatorIds: []
      });
      loadData();
    } catch (error) {
      console.error('Failed to save subject:', error);
      setErrorHeader({ message: "Registry Write Failure: Could not commit scholastic updates.", type: 'error' });
    }
  };

  const openAddModal = () => {
    setEditingSubject(null);
    setSubjectFormData({ 
      title: '', 
      code: '', 
      department: 'Theology', 
      creditHours: 3, 
      courseId: '',
      teacherIds: [],
      moderatorIds: []
    });
    setIsAddSubjectModalOpen(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectFormData({
      title: subject.title,
      code: subject.code,
      department: subject.department,
      creditHours: subject.creditHours,
      courseId: subject.courseId,
      teacherIds: subject.teacherIds || [],
      moderatorIds: subject.moderatorIds || []
    });
    setIsAddSubjectModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Synchronizing Repository...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <AnimatePresence>
        {errorHeader && (
          <div className="max-w-[1600px] mx-auto px-8 pt-6">
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className={cn(
                "p-4 rounded-2xl flex items-center justify-between shadow-lg",
                errorHeader.type === 'error' ? "bg-rose-50 border border-rose-100 text-rose-700" : "bg-amber-50 border border-amber-100 text-amber-700"
              )}>
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{errorHeader.message}</span>
                </div>
                <button onClick={() => setErrorHeader(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header Strategy */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                <BookOpen className="w-6 h-6 text-white" />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-slate-900  tracking-tight">Institutional Subject Portal</h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Academic Governance & Curriculum Oversight</p>
             </div>
          </div>
          <div className="flex items-center gap-6">
             <button 
               onClick={openAddModal}
               className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all uppercase tracking-widest flex items-center gap-2"
             >
               <Plus className="w-4 h-4" />
               New Discipline
             </button>
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Master Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-6 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm outline-none focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all w-80 font-medium"
                />
             </div>
             <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                <button className="p-3.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-2xl transition-all relative">
                   <Activity className="w-5 h-5" />
                   <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                </button>
                <div className="h-10 w-10 rounded-2xl bg-slate-900 flex items-center justify-center font-bold text-white shadow-lg">
                   AD
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 mt-10 flex gap-5">
        {/* Sidebar Logic */}
        <div className="w-96 flex-shrink-0 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 ">Module Directory</h2>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest">{filteredSubjects.length} Disciplines</span>
             </div>
             <div className="p-4 space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto custom-scrollbar">
                {filteredSubjects.map(subject => (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject)}
                    className={cn(
                      "w-full p-4 rounded-2xl text-left transition-all group relative",
                      selectedSubject?.id === subject.id 
                        ? "bg-slate-900 text-white shadow-xl shadow-slate-200 translate-x-2" 
                        : "hover:bg-slate-50 text-slate-600"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{subject.code}</span>
                      <ChevronRight className={cn(
                        "w-4 h-4 transition-transform",
                        selectedSubject?.id === subject.id ? "translate-x-0" : "-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                      )} />
                    </div>
                    <p className="font-bold  truncate pr-4">{subject.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className={cn(
                        "text-[10px] uppercase font-medium tracking-tighter opacity-40",
                        selectedSubject?.id === subject.id ? "text-indigo-300" : "text-slate-400"
                      )}>{subject.department}</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openEditModal(subject); }}
                        className="text-[9px] font-black uppercase text-slate-400 hover:text-white transition-colors"
                      >
                        Adjust
                      </button>
                    </div>
                  </button>
                ))}
             </div>
          </div>

          <div className="bg-indigo-600 rounded-[2rem] p-6 text-white relative overflow-hidden group shadow-2xl shadow-indigo-200">
             <div className="relative z-10">
                <Shield className="w-10 h-10 mb-6 opacity-80" />
                <h3 className="text-xl font-bold  mb-2">Institutional Registry</h3>
                <p className="text-xs text-indigo-100 font-medium leading-relaxed mb-6">Manage advanced academic registrations and moderator credentials for the 2024 session.</p>
                <div className="flex items-center gap-3">
                   <button className="px-4 py-2.5 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                      Access Vault
                   </button>
                </div>
             </div>
             <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
          </div>
        </div>

        {/* Workspace Hub */}
        <div className="flex-1 space-y-5">
          {selectedSubject ? (
            <motion.div
              layoutId={selectedSubject.id}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden"
            >
              {/* Context Bar */}
              <div className="p-6 border-b border-slate-100 bg-[#FCFDFF]">
                <div className="flex items-start justify-between mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black tracking-[0.2em] uppercase">Core Discipline</span>
                      <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black tracking-widest uppercase">{selectedSubject.creditHours} Credit Hours</span>
                    </div>
                    <h2 className="text-4xl font-bold text-slate-900  tracking-tight leading-tight">{selectedSubject.title}</h2>
                    <div className="flex items-center gap-6">
                       <div className="flex items-center gap-2 text-slate-400">
                         <Users className="w-4 h-4" />
                         <span className="text-[11px] font-black uppercase tracking-widest">{students.length} Candidates</span>
                       </div>
                       <div className="flex items-center gap-2 text-slate-400">
                         <Calendar className="w-4 h-4" />
                         <span className="text-[11px] font-black uppercase tracking-widest">Modified Apr 2024</span>
                       </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white transition-all shadow-sm">
                       <Download className="w-6 h-6" />
                    </button>
                    <button className="px-8 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 hover:bg-slate-900 transition-all">
                       Audit Submissions
                    </button>
                  </div>
                </div>

                {/* Navigation Rail */}
                <div className="flex gap-10 mt-10">
                   {[
                     { id: 'overview', label: 'Overview', icon: BookOpen },
                     { id: 'attendance', label: 'Roll Call', icon: Clock },
                     { id: 'materials', label: 'Repository', icon: FileText },
                     { id: 'registry', label: 'Institutional Registry', icon: ShieldCheck }
                   ].map(tab => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                          "flex items-center gap-3 py-2 px-1 relative transition-all group",
                          activeTab === tab.id ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                        )}
                     >
                        <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-indigo-600" : "text-slate-300 opacity-60 group-hover:opacity-100")} />
                        <span className="text-[11px] font-black uppercase tracking-widest">{tab.label}</span>
                        {activeTab === tab.id && (
                          <motion.div 
                            layoutId="activeTabSubject"
                            className="absolute -bottom-2 left-0 right-0 h-1 bg-indigo-600 rounded-full"
                          />
                        )}
                     </button>
                   ))}
                </div>
              </div>

              {/* View Controller */}
              <div className="min-h-[600px]">
                <AnimatePresence mode="wait">
                  {activeTab === 'overview' ? (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-12"
                    >
                      <div className="grid grid-cols-3 gap-5">
                         <div className="col-span-2 space-y-12">
                            <section>
                               <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-300">Subject Abstract</h3>
                                <button 
                                  onClick={handleAIGenerateOutline}
                                  disabled={isGenerating}
                                  className="flex items-center gap-1.5 text-[9px] font-black uppercase text-indigo-500 tracking-widest hover:text-indigo-700 transition-colors disabled:opacity-50"
                                >
                                  {isGenerating ? (
                                    <div className="w-2.5 h-2.5 border border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Sparkles className="w-2.5 h-2.5" />
                                  )}
                                  <span>Draft Syllabus with AI</span>
                                </button>
                               </div>
                               <p className="text-xl text-slate-600 leading-relaxed  whitespace-pre-line">
                                 {selectedSubject.syllabus || `This curriculum focuses on the master-level study of ${selectedSubject.title}, integrating historical precedents with contemporary theoretical frameworks.`}
                               </p>
                            </section>

                            <div className="grid grid-cols-2 gap-5">
                               <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-4 group hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-500">
                                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <Clock3 className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-slate-900 ">Contact Session</h4>
                                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-1">14:00 - 17:00 / Mon & Wed</p>
                                  </div>
                               </div>
                               <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-4 group hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-500">
                                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                    <Award className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-slate-900 ">Credit Value</h4>
                                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-1">{selectedSubject.creditHours}.0 Module Points</p>
                                  </div>
                               </div>
                            </div>
                         </div>

                         <div className="space-y-5">
                            <div className="p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
                               <h3 className="text-sm font-black uppercase tracking-widest text-slate-300 mb-6">Subject Governance</h3>
                               <div className="space-y-6">
                                  <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Academic Lead</p>
                                    <div className="space-y-3">
                                      {selectedSubject.teacherIds && selectedSubject.teacherIds.length > 0 ? (
                                        selectedSubject.teacherIds.map(id => {
                                          const fac = allFaculty.find(f => f.id === id);
                                          if (!fac) return null;
                                          return (
                                            <div key={id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-white hover:ring-1 hover:ring-slate-100 transition-all cursor-pointer group">
                                              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-4 ring-slate-100">
                                                {fac.name[0]}
                                              </div>
                                              <div>
                                                <p className="text-xs font-bold text-slate-900 ">{fac.name}</p>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600 mt-0.5">Primary Oversight</p>
                                              </div>
                                            </div>
                                          );
                                        })
                                      ) : (
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center">
                                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Unassigned</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="pt-4 border-t border-slate-50">
                                     <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
                                        <Plus className="w-3.5 h-3.5" />
                                        Appoint Co-Moderator
                                     </button>
                                  </div>
                               </div>
                            </div>

                            <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-[2.5rem]">
                               <div className="flex items-start gap-4">
                                  <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                                  <div className="space-y-2">
                                     <h4 className="text-sm font-bold text-slate-900 ">Session Alert</h4>
                                     <p className="text-xs text-slate-500 leading-relaxed font-medium">Internal review of candidate portfolios is scheduled for the transition of the next semester.</p>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                    </motion.div>
                  ) : activeTab === 'attendance' ? (
                    <div className="p-0">
                      <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                               {[1,2,3,4].map(i => (
                                 <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                               ))}
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Session • 14 Present</span>
                         </div>
                         <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100">
                           Roll Call
                         </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                              <th className="px-8 py-5">Candidate</th>
                              <th className="px-6 py-5">Registry ID</th>
                              <th className="px-6 py-5">Last Entry</th>
                              <th className="px-8 py-5 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {students.length === 0 ? (
                               <tr><td colSpan={4} className="py-10 text-center text-slate-400 text-[10px] font-black uppercase">No records found</td></tr>
                            ) : (
                              students.map((student) => {
                                const entry = attendance.find(a => a.studentId === student.id);
                                if (!entry) return null;
                                return (
                                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">
                                          {student.name[0]}
                                        </div>
                                        <span className="text-sm font-bold text-slate-900 ">{student.name}</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-6 font-mono text-[10px] text-slate-400">{student.id?.slice(0, 8)}</td>
                                    <td className="px-6 py-6 text-[10px] font-black text-slate-500 uppercase tracking-tighter">14:20 PM</td>
                                    <td className="px-8 py-6 text-right">
                                      <span className={cn(
                                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                        entry.status === 'present' ? "bg-emerald-50 text-emerald-600" : 
                                        entry.status === 'absent' ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                                      )}>
                                        {entry.status}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : activeTab === 'materials' ? (
                    <div className="p-6 space-y-5 min-h-[400px]">
                       <div className="flex items-center justify-between">
                         <h3 className="text-xl font-bold text-slate-900 ">Course Repository</h3>
                         <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                            onClick={handleAddDocument}
                          >
                           <Plus className="w-3.5 h-3.5" />
                           Upload Document
                         </button>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {[
                           { title: 'Theological Greek Syllabus', type: 'PDF', size: '2.4 MB', date: '2024-03-20' },
                           { title: 'Intro to Exegesis', type: 'PDF', size: '1.8 MB', date: '2024-03-18' },
                           { title: 'Module Bibliography', type: 'DOCX', size: '450 KB', date: '2024-03-15' },
                         ].map((doc, i) => (
                           <div key={i} className="p-5 bg-slate-50 border border-slate-100 rounded-3xl flex gap-4 hover:bg-white hover:border-indigo-100 transition-all group">
                             <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                               <FileText className="w-6 h-6" />
                             </div>
                             <div className="flex-1 min-w-0">
                               <p className="text-sm font-bold text-slate-900  truncate">{doc.title}</p>
                               <p className="text-[9px] font-black uppercase text-slate-400 mt-1">{doc.type} • {doc.size}</p>
                             </div>
                           </div>
                         ))}
                       </div>
                    </div>
                  ) : activeTab === 'registry' ? (
                    <div className="p-12 space-y-12 min-h-[400px]">
                      <div className="space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                          <div className="flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-indigo-600" />
                            <div>
                               <h3 className="text-xl font-bold text-slate-900 ">Ecclesiastical Oversight</h3>
                               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Authorized Moderator Matrix</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {[
                            { title: 'Academic Leads', ids: selectedSubject.teacherIds, color: 'bg-indigo-600' },
                            { title: 'Subject Moderators', ids: selectedSubject.moderatorIds, color: 'bg-amber-500' }
                          ].map(group => (
                            <div key={group.title} className="space-y-4">
                               <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">{group.title}</h4>
                               <div className="space-y-3">
                                  {group.ids && group.ids.length > 0 ? (
                                    group.ids.map(id => {
                                      const mod = allFaculty.find(f => f.id === id);
                                      if (!mod) return null;
                                      return (
                                        <div key={id} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100/50">
                                          <div className={cn("w-12 h-12 rounded-2xl text-white flex items-center justify-center font-bold text-sm shadow-lg", group.color)}>
                                            {mod.name.split(' ').map(n => n[0]).join('')}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900  truncate">{mod.name}</p>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{mod.role}</p>
                                          </div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div className="flex items-center justify-center py-8 bg-slate-50/50 rounded-[1.5rem] border border-dashed border-slate-200">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No {group.title} Assigned</p>
                                    </div>
                                  )}
                               </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                           <div>
                              <h3 className="text-xl font-bold text-slate-900 ">Scholastic Registry</h3>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Enrolled Theological Candidates</p>
                           </div>
                           <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {students.filter(s => selectedSubject.studentIds?.includes(s.id!)).length} Registered
                           </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {selectedSubject.studentIds && selectedSubject.studentIds.length > 0 ? (
                            students.filter(s => selectedSubject.studentIds?.includes(s.id!)).map(student => (
                               <div key={student.id} className="p-5 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-between group hover:shadow-xl hover:shadow-slate-100/50 transition-all">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-bold text-slate-300 text-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
                                       {student.name[0]}
                                     </div>
                                     <div>
                                        <p className="text-sm font-bold  text-slate-900">{student.name}</p>
                                        <p className="text-[9px] font-mono text-slate-400 mt-1">REG: {student.id?.slice(0, 8)}</p>
                                     </div>
                                  </div>
                               </div>
                            ))
                          ) : (
                             <div className="col-span-full py-10 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center gap-4">
                                <Users className="w-8 h-8 text-slate-200" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No Candidates Enrolled in this Discipline</p>
                             </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                         <div className="relative w-full max-w-sm">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                           <input type="text" placeholder="Filter cohort..." className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-medium" />
                         </div>
                         <div className="flex gap-2 relative">
                           <select onChange={async (e) => {
                             const sid = e.target.value;
                             if (!sid) return;
                             const current = selectedSubject?.studentIds || [];
                             if (current.includes(sid)) return;
                             const newIds = [...current, sid];
                             await subjectService.updateSubject(selectedSubject!.id!, { studentIds: newIds });
                             setSelectedSubject({ ...selectedSubject!, studentIds: newIds });
                             setSubjects(subjects.map(s => s.id === selectedSubject!.id ? { ...s, studentIds: newIds } : s));
                             e.target.value = '';
                           }} className="px-6 py-3 bg-slate-900 text-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none hover:bg-slate-800 transition-all cursor-pointer">
                             <option value="">+ Enroll Candidate</option>
                             {students.filter(s => !(selectedSubject?.studentIds || []).includes(s.id!)).map(s => (
                               <option key={s.id} value={s.id}>{s.name}</option>
                             ))}
                           </select>
                         </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-slate-100/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                              <th className="px-8 py-5">Candidate</th>
                              <th className="px-6 py-5">Program</th>
                              <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                             {students.filter(s => (selectedSubject?.studentIds || []).includes(s.id!)).length === 0 ? (
                               <tr>
                                  <td colSpan={3} className="px-8 py-10 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">
                                     No candidates enrolled.
                                  </td>
                               </tr>
                             ) : students.filter(s => (selectedSubject?.studentIds || []).includes(s.id!)).map(student => (
                                <tr key={student.id} className="hover:bg-slate-50/30 transition-colors">
                                   <td className="px-8 py-6">
                                      <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-sm">
                                            {student.name[0]}
                                         </div>
                                         <span className="text-sm font-bold text-slate-900 ">{student.name}</span>
                                      </div>
                                   </td>
                                   <td className="px-6 py-6">
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{student.program || 'N/A'}</span>
                                   </td>
                                   <td className="px-8 py-6 text-right">
                                      <button 
                                        onClick={async () => {
                                          if(!window.confirm('Remove from roster?')) return;
                                          const newIds = (selectedSubject?.studentIds || []).filter(id => id !== student.id);
                                          await subjectService.updateSubject(selectedSubject!.id!, { studentIds: newIds });
                                          setSelectedSubject({ ...selectedSubject!, studentIds: newIds });
                                          setSubjects(subjects.map(s => s.id === selectedSubject!.id ? { ...s, studentIds: newIds } : s));
                                        }}
                                        className="text-[10px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest p-2 transition-colors">
                                         Remove
                                      </button>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-[800px] border-4 border-dashed border-slate-100 rounded-[3rem]">
               <div className="text-center space-y-4">
                  <BookOpen className="w-16 h-16 text-slate-200 mx-auto" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Select Module for Institutional Audit</p>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Subject Configuration Modal */}
      <AnimatePresence>
        {isAddSubjectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddSubjectModalOpen(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2.5rem] w-full max-w-md p-6 relative z-10 shadow-2xl border border-slate-100">
               <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900  tracking-tight">{editingSubject ? 'Adjust Discipline' : 'Initialize Discipline'}</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Academic Registry Protocol</p>
                  </div>
                  <X className="w-6 h-6 text-slate-300 cursor-pointer hover:text-slate-600" onClick={() => setIsAddSubjectModalOpen(false)} />
               </div>

               <form onSubmit={handleSaveSubject} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Title</label>
                    <input 
                      required
                      type="text" 
                      value={subjectFormData.title}
                      onChange={(e) => setSubjectFormData({...subjectFormData, title: e.target.value})}
                      placeholder="e.g. Systematic Theology I"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-8 focus:ring-indigo-50 transition-all outline-none font-medium text-lg "
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Code</label>
                      <input 
                        required
                        type="text" 
                        value={subjectFormData.code}
                        onChange={(e) => setSubjectFormData({...subjectFormData, code: e.target.value})}
                        placeholder="THL-101"
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white transition-all outline-none font-mono text-sm uppercase"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Credit Hours</label>
                      <input 
                        required
                        type="number" 
                        value={subjectFormData.creditHours}
                        onChange={(e) => setSubjectFormData({...subjectFormData, creditHours: parseInt(e.target.value)})}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white transition-all outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Department Jurisdiction</label>
                    <select 
                      value={subjectFormData.department}
                      onChange={(e) => setSubjectFormData({...subjectFormData, department: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-8 focus:ring-indigo-50 transition-all outline-none text-sm font-bold uppercase tracking-widest appearance-none"
                    >
                      <option value="Theology">Systematic Theology</option>
                      <option value="Biblical Studies">Biblical Studies</option>
                      <option value="Church History">Church History</option>
                      <option value="Practical Ministry">Practical Ministry</option>
                      <option value="Philosophy">Christian Philosophy</option>
                      <option value="Ethics">Social Ethics</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Assign to Program</label>
                    <select 
                      required
                      value={subjectFormData.courseId}
                      onChange={(e) => setSubjectFormData({...subjectFormData, courseId: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white transition-all outline-none text-sm font-bold appearance-none"
                    >
                      <option value="">Select Master Program</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Personnel Assignment Section */}
                  <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Academic Teachers</label>
                      <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                         {allFaculty.map(fac => (
                           <label key={fac.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                              <input 
                                type="checkbox"
                                checked={subjectFormData.teacherIds.includes(fac.id!)}
                                onChange={(e) => {
                                  const ids = e.target.checked 
                                    ? [...subjectFormData.teacherIds, fac.id!]
                                    : subjectFormData.teacherIds.filter(id => id !== fac.id);
                                  setSubjectFormData({...subjectFormData, teacherIds: ids});
                                }}
                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="text-[11px] font-bold text-slate-700 truncate">{fac.name}</span>
                           </label>
                         ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Governance Moderators</label>
                      <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                         {allFaculty.map(fac => (
                           <label key={fac.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                              <input 
                                type="checkbox"
                                checked={subjectFormData.moderatorIds.includes(fac.id!)}
                                onChange={(e) => {
                                  const ids = e.target.checked 
                                    ? [...subjectFormData.moderatorIds, fac.id!]
                                    : subjectFormData.moderatorIds.filter(id => id !== fac.id);
                                  setSubjectFormData({...subjectFormData, moderatorIds: ids});
                                }}
                                className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                              />
                              <span className="text-[11px] font-bold text-slate-700 truncate">{fac.name}</span>
                           </label>
                         ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-indigo-100 hover:bg-indigo-600 transition-all mt-4 flex items-center justify-center gap-3"
                  >
                    <Save className="w-4 h-4" />
                    <span>Commit to Registry</span>
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
