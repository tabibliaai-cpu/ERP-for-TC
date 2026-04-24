import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Search, 
  Plus, 
  MoreHorizontal, 
  ChevronRight, 
  ChevronDown, 
  Filter,
  Calendar,
  Users,
  Clock,
  Shield,
  Award,
  ArrowRight,
  Target,
  Layers,
  Save,
  Trash2,
  X,
  FileText,
  Activity,
  Check,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { courseService, subjectService, facultyService, studentService, type Course, type Subject, type Faculty, type Student } from '../services/dataService';
import { geminiService } from '../services/geminiService';
import { useAuthStore } from '../store/useStore';

export default function AcademicSystem() {
  const { user } = useAuthStore();
  // Master State Configuration
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('all');

  // UI Mechanics
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [enrollmentFilter, setEnrollmentFilter] = useState<'all' | 'enrolled'>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingSyllabus, setIsGeneratingSyllabus] = useState(false);

  // Transactional Subject State
  const [newSubject, setNewSubject] = useState<Omit<Subject, 'id'>>({
    title: '',
    code: '',
    department: '',
    creditHours: 3,
    courseId: '',
    facultyId: '',
    moderatorIds: [],
    teacherIds: [],
    studentIds: [],
    syllabus: '',
    semester: 'Fall 2024'
  });

  const [enrolledStudentIds, setEnrolledStudentIds] = useState<string[]>([]);

  useEffect(() => {
    loadInstitutionalData();
  }, []);

  const loadInstitutionalData = async () => {
    if (!user?.tenantId) return;
    setLoading(true);
    try {
      const val = <T,>(p: PromiseSettledResult<T>): T => p.status === 'fulfilled' ? p.value : [] as T;
      const [c, f, s, sub] = await Promise.allSettled([
        courseService.getCoursesByTenant(user.tenantId),
        facultyService.getFacultyByTenant(user.tenantId),
        studentService.getStudentsByTenant(user.tenantId),
        subjectService.getSubjectsByTenant(user.tenantId)
      ]);
      setCourses(val(c));
      setFaculty(val(f));
      setAllStudents(val(s));
      setSubjects(val(sub));
      if (val(c).length > 0) setSelectedCourse(val(c)[0]);
    } catch (error) {
      console.error('Failed to load academic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const subjectData: Subject = {
        ...newSubject,
        courseId: selectedCourse?.id || '',
        department: selectedCourse?.department || 'Theology',
        studentIds: enrolledStudentIds,
        tenantId: user?.tenantId || ''
      };
      await subjectService.addSubject(subjectData);
      await loadInstitutionalData();
      closeSubjectModal();
    } catch (error) {
      console.error('Failed to establish subject:', error);
    }
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject?.id) return;
    try {
      const subjectData = {
        ...newSubject,
        studentIds: enrolledStudentIds
      };
      await subjectService.updateSubject(editingSubject.id, subjectData);
      await loadInstitutionalData();
      closeSubjectModal();
    } catch (error) {
      console.error('Failed to update subject:', error);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Are you sure you want to expunge this subject? All associated metadata will be lost.')) return;
    try {
      await subjectService.deleteSubject(id);
      await loadInstitutionalData();
      closeSubjectModal();
    } catch (error) {
      console.error('Failed to expunge subject:', error);
    }
  };

  const openSubjectModal = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setNewSubject(subject);
      setEnrolledStudentIds(subject.studentIds || []);
    } else {
      setEditingSubject(null);
      setNewSubject({
        title: '',
        code: '',
        department: selectedCourse?.department || '',
        creditHours: 3,
        courseId: selectedCourse?.id || '',
        facultyId: '',
        moderatorIds: [],
        teacherIds: [],
        studentIds: [],
        syllabus: '',
        semester: 'Fall 2024'
      });
      setEnrolledStudentIds([]);
    }
    setIsSubjectModalOpen(true);
  };

  const closeSubjectModal = () => {
    setIsSubjectModalOpen(false);
    setEditingSubject(null);
    setTeacherSearch('');
    setStudentSearch('');
  };

  const toggleTeacherAssignment = (id: string) => {
    const next = newSubject.teacherIds.includes(id) 
      ? newSubject.teacherIds.filter(tid => tid !== id)
      : [...newSubject.teacherIds, id];
    setNewSubject({...newSubject, teacherIds: next});
  };

  const toggleStudentEnrollment = (id: string) => {
    const next = enrolledStudentIds.includes(id) 
      ? enrolledStudentIds.filter(sid => sid !== id)
      : [...enrolledStudentIds, id];
    setEnrolledStudentIds(next);
  };

  const handleAIGenerateDescription = async () => {
    if (!newSubject.title) {
      alert('Please provide a Subject Title first.');
      return;
    }
    setIsGenerating(true);
    try {
      const desc = await geminiService.generateSubjectDescription(
        newSubject.title, 
        selectedCourse?.department || 'Theology'
      );
      setNewSubject({ ...newSubject, syllabus: desc });
    } catch (error) {
      console.error('AI Generation Failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIGenerateSyllabusDraft = async () => {
    if (!newSubject.title) {
      alert('Please provide a Subject Title first to generate a syllabus.');
      return;
    }
    setIsGeneratingSyllabus(true);
    try {
      const syllabusDraft = await geminiService.generateSyllabusDraft(
        newSubject.title, 
        selectedCourse?.department || 'Theology'
      );
      // Append or replace? "generates a syllabus draft... This should save the generated syllabus into the syllabus field."
      // I'll append it or replace it. Replacing is fine if it generates the whole thing.
      setNewSubject({ ...newSubject, syllabus: syllabusDraft });
    } catch (error) {
      console.error('AI Syllabus Draft Generation Failed:', error);
    } finally {
      setIsGeneratingSyllabus(false);
    }
  };

  const filteredCourses = courses.filter(c => 
    (c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterDept === 'all' || c.department === filterDept)
  );

  if (loading) {
     return (
       <div className="flex items-center justify-center min-h-screen bg-slate-50">
         <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-slate-200 border-t-fuchsia-600 rounded-full animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Governance Matrix...</p>
         </div>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Institutional Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-[1600px] mx-auto px-8 py-4 flex items-center justify-between">
           <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <GraduationCap className="w-4 h-4" />
              <span>Institutional</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-900">Academic Governance</span>
           </div>
           <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 shadow-sm" />
                 ))}
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">14 Active Deans</span>
           </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 mt-12 grid grid-cols-12 gap-5">
        {/* Course Sidebar Hub */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
               <div>
                  <h2 className="text-xl font-bold text-slate-900 ">Program Hierarchy</h2>
                  <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 mt-1">Foundational Credentials</p>
               </div>
               <button className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-slate-700 transition-colors shadow-lg shadow-slate-200">
                  <Plus className="w-5 h-5" />
               </button>
            </div>

            <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-fuchsia-500 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search programs..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm outline-none focus:bg-white focus:border-fuchsia-200 focus:ring-4 focus:ring-fuchsia-50/50 transition-all font-medium" 
               />
            </div>

            <div className="space-y-3 max-h-[calc(100vh-450px)] overflow-y-auto custom-scrollbar pr-2">
              {filteredCourses.map(course => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className={cn(
                    "w-full p-5 rounded-3xl text-left transition-all border group relative",
                    selectedCourse?.id === course.id 
                      ? "bg-slate-900 border-slate-900 text-white shadow-2xl shadow-slate-200 translate-x-2" 
                      : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                     <span className="px-2.5 py-1 bg-white/10 text-white/60 rounded-lg text-[8px] font-black tracking-widest uppercase">
                        {course.code}
                     </span>
                     <ChevronRight className={cn(
                       "w-4 h-4 transition-transform",
                       selectedCourse?.id === course.id ? "translate-x-0" : "-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                     )} />
                  </div>
                  <h3 className="font-bold  text-lg leading-tight mb-2 pr-6">{course.title}</h3>
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-1.5 opacity-40">
                        <Users className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Cohort Size: {course.durationYears || 3}Y</span>
                     </div>
                     <div className="flex items-center gap-1.5 opacity-40">
                        <Calendar className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">{course.department}</span>
                     </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-[2.5rem] p-6 text-white relative overflow-hidden group shadow-2xl shadow-fuchsia-200">
             <div className="relative z-10">
                <ShieldCheck className="w-10 h-10 mb-6 opacity-80" />
                <h3 className="text-xl font-bold  mb-2">Curriculum Audit</h3>
                <p className="text-xs text-indigo-100 font-medium leading-relaxed mb-6">Internal review of subject syllabi and faculty credentials required for ISO-9001 compliance.</p>
                <button className="px-6 py-2.5 bg-white text-fuchsia-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-xl">
                   Start Session Review
                </button>
             </div>
             <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
          </div>
        </div>

        {/* Subject Workspace Canvas */}
        <div className="col-span-12 lg:col-span-8">
          {selectedCourse ? (
            <motion.div
              layoutId={selectedCourse.id}
              className="space-y-5"
            >
              {/* Context Dashboard */}
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-6 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-4 py-1.5 bg-fuchsia-50 text-fuchsia-600 rounded-full text-[10px] font-black uppercase tracking-widest">Active Curriculum</span>
                    <span className="px-4 py-1.5 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedCourse.department} Department</span>
                  </div>
                  <h1 className="text-4xl font-bold text-slate-900  tracking-tight leading-tight mb-8">
                     Master Oversight: <br/>{selectedCourse.title}
                  </h1>
                  
                  <div className="grid grid-cols-4 gap-6">
                    {[
                      { label: 'Total Modules', value: subjects.filter(s => s.courseId === selectedCourse.id).length, icon: Layers, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
                      { label: 'Enrolled Candidates', value: '1,240', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { label: 'Average Credits', value: '3.0', icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
                      { label: 'Session Velocity', value: '94%', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
                    ].map((stat, i) => (
                      <div key={i} className="p-5 rounded-3xl bg-slate-50/50 border border-slate-50">
                         <stat.icon className={cn("w-5 h-5 mb-3", stat.color)} />
                         <p className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
                         <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-fuchsia-50/30 to-transparent pointer-none" />
              </div>

              {/* Subject Grid Hub */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                   <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-fuchsia-600" />
                      <h2 className="text-xl font-bold text-slate-900 ">Module Catalog</h2>
                   </div>
                   <button 
                     onClick={() => openSubjectModal()}
                     className="px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm flex items-center gap-2"
                   >
                     <Plus className="w-4 h-4" />
                     Establish Subject
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {subjects.filter(s => s.courseId === selectedCourse.id).map(subject => (
                     <div key={subject.id} className="group p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-fuchsia-50/50 hover:border-fuchsia-200 transition-all duration-500">
                        <div className="flex items-start justify-between mb-8">
                           <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 font-bold group-hover:from-fuchsia-700 hover:to-violet-700 group-hover:text-white transition-all shadow-inner">
                              {subject.code[0]}
                           </div>
                           <button 
                             onClick={() => openSubjectModal(subject)}
                             className="p-3 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                           >
                              <MoreHorizontal className="w-5 h-5" />
                           </button>
                        </div>
                        <h4 className="text-xl font-bold text-slate-900  mb-2 line-clamp-1">{subject.title}</h4>
                        <div className="flex items-center gap-3 mb-6">
                           <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">{subject.code}</span>
                           <span className="text-[10px] font-black tracking-widest uppercase text-fuchsia-500">• {subject.creditHours} Credits</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-8">
                           <div className="px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Moderated View</span>
                           </div>
                           <div className="px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                              <GraduationCap className="w-3.5 h-3.5 text-fuchsia-400" />
                              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Academic Lead</span>
                           </div>
                        </div>
                        <button className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-slate-900 group-hover:text-white transition-all">
                           <span>Access Governance Panel</span>
                           <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                     </div>
                  ))}

                  <button 
                    onClick={() => openSubjectModal()}
                    className="p-12 border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-fuchsia-200 hover:bg-fuchsia-50/10 transition-all group"
                  >
                     <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center group-hover:animate-bounce">
                        <Plus className="w-6 h-6" />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 group-hover:text-fuchsia-400 transition-colors">Establish Additional Module</p>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-[600px] border-4 border-dashed border-slate-100 rounded-[3rem]">
               <div className="text-center space-y-4">
                  <GraduationCap className="w-16 h-16 text-slate-200 mx-auto" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Select Credential for Detailed Audit</p>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Institutional Subject Drawer */}
      <AnimatePresence>
        {isSubjectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSubjectModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col p-12 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900  tracking-tight">
                    {editingSubject ? 'Revise Module' : 'Establish Institutional Subject'}
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Governance Framework v2.4</p>
                </div>
                <button 
                  onClick={closeSubjectModal}
                  className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={editingSubject ? handleUpdateSubject : handleAddSubject} className="space-y-6">
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Inherited Course Assignment</label>
                      <select 
                        required
                        value={selectedCourse?.id || newSubject.courseId}
                        onChange={(e) => setNewSubject({...newSubject, courseId: e.target.value})}
                        disabled={!!selectedCourse?.id}
                        className={cn(
                          "w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none text-sm font-bold tracking-widest uppercase appearance-none transition-all",
                          !!selectedCourse?.id ? "opacity-60 cursor-not-allowed bg-slate-100" : "focus:bg-white focus:ring-8 focus:ring-fuchsia-100"
                        )}
                      >
                      <option value="">Select Parent Course</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title} ({c.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Subject Title</label>
                    <input 
                      required
                      type="text" 
                      value={newSubject.title}
                      onChange={(e) => setNewSubject({...newSubject, title: e.target.value})}
                      placeholder="e.g. History of the First 500 Years"
                      className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-fuchsia-100 transition-all outline-none font-medium  text-xl placeholder:text-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Registry Code</label>
                      <input 
                        required
                        type="text" 
                        value={newSubject.code}
                        onChange={(e) => setNewSubject({...newSubject, code: e.target.value})}
                        placeholder="TH-102-A"
                        className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-fuchsia-100 transition-all outline-none text-sm font-bold tracking-widest uppercase placeholder:text-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Credit Weight</label>
                      <input 
                        required
                        type="number" 
                        value={newSubject.creditHours}
                        onChange={(e) => setNewSubject({...newSubject, creditHours: parseInt(e.target.value)})}
                        className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-fuchsia-100 transition-all outline-none text-sm font-bold placeholder:text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Institutional Description / Syllabus</label>
                      <div className="flex items-center gap-3">
                        <button 
                          type="button"
                          onClick={handleAIGenerateDescription}
                          disabled={isGenerating || isGeneratingSyllabus}
                          className="flex items-center gap-1.5 text-[9px] font-black uppercase text-fuchsia-500 tracking-widest hover:text-fuchsia-700 transition-colors disabled:opacity-50"
                        >
                          {isGenerating ? (
                            <div className="w-2.5 h-2.5 border border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Sparkles className="w-2.5 h-2.5" />
                          )}
                          <span>Draft Desc.</span>
                        </button>
                        <button 
                          type="button"
                          onClick={handleAIGenerateSyllabusDraft}
                          disabled={isGenerating || isGeneratingSyllabus}
                          className="flex items-center gap-1.5 text-[9px] font-black uppercase text-emerald-600 tracking-widest hover:text-emerald-800 transition-colors disabled:opacity-50"
                        >
                          {isGeneratingSyllabus ? (
                            <div className="w-2.5 h-2.5 border border-emerald-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FileText className="w-2.5 h-2.5" />
                          )}
                          <span>Generate Syllabus</span>
                        </button>
                      </div>
                    </div>
                    <textarea 
                      value={newSubject.syllabus}
                      onChange={(e) => setNewSubject({...newSubject, syllabus: e.target.value})}
                      placeholder="Enter scholastic inquiry objectives..."
                      rows={4}
                      className="w-full px-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:bg-white focus:ring-8 focus:ring-fuchsia-100 transition-all outline-none text-xs font-medium leading-relaxed resize-none"
                    />
                  </div>

                  {/* Moderator Assignment Block */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Moderator Assignment</label>
                      <span className="text-[9px] font-black uppercase text-fuchsia-500 tracking-widest">Multi-Select Enabled</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar p-1">
                      {faculty
                        .filter(f => f.role === 'Subject Moderator' || f.role === 'admin')
                        .map(f => {
                          const isAssigned = (newSubject.moderatorIds || []).includes(f.id!);
                          return (
                            <div 
                              key={f.id}
                              onClick={() => {
                                const current = newSubject.moderatorIds || [];
                                const next = current.includes(f.id!) 
                                  ? current.filter(id => id !== f.id)
                                  : [...current, f.id!];
                                setNewSubject({...newSubject, moderatorIds: next});
                              }}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border",
                                isAssigned 
                                  ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200" 
                                  : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                              )}
                            >
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px]",
                                isAssigned ? "bg-gradient-to-r from-fuchsia-600 to-violet-600" : "bg-slate-100 text-slate-400"
                              )}>
                                {f.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div className="min-w-0 pr-2">
                                <p className={cn("text-[11px] font-bold  truncate", isAssigned ? "text-white" : "text-slate-900")}>{f.name}</p>
                                <p className={cn("text-[9px] font-black uppercase tracking-tighter", isAssigned ? "text-indigo-300" : "text-slate-400")}>{f.role}</p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Student Registry Hub */}
                  <div className="space-y-4">
                     <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate Enrollment</label>
                        <div className="flex items-center gap-3">
                           <div className="relative">
                             <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />
                             <input 
                               type="text" 
                               placeholder="Find candidates..." 
                               value={studentSearch}
                               onChange={(e) => setStudentSearch(e.target.value)}
                               className="pl-8 pr-3 py-1.5 bg-slate-50 border-none rounded-lg text-[9px] font-bold outline-none focus:ring-2 focus:ring-fuchsia-100 uppercase tracking-tight w-32"
                             />
                           </div>
                           <div className="flex h-6 bg-slate-100 rounded-lg p-0.5">
                              {(['all', 'enrolled'] as const).map((mode) => (
                                <button
                                  key={mode}
                                  type="button"
                                  onClick={() => setEnrollmentFilter(mode)}
                                  className={cn(
                                    "px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest transition-all",
                                    enrollmentFilter === mode 
                                      ? "bg-white text-fuchsia-600 shadow-sm" 
                                      : "text-slate-400 hover:text-slate-600"
                                  )}
                                >
                                  {mode === 'all' ? 'All' : 'Enrolled'}
                                </button>
                              ))}
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                       {allStudents
                         .filter(s => {
                           const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase());
                           const matchesFilter = enrollmentFilter === 'all' || enrolledStudentIds.includes(s.id!);
                           return matchesSearch && matchesFilter;
                         })
                         .map(student => {
                           const isEnrolled = enrolledStudentIds.includes(student.id!);
                           return (
                             <div 
                               key={student.id}
                               onClick={() => toggleStudentEnrollment(student.id!)}
                               className={cn(
                                 "group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border",
                                 isEnrolled 
                                   ? "bg-fuchsia-50/50 border-fuchsia-200" 
                                   : "bg-white border-slate-100 hover:border-slate-300"
                               )}
                             >
                               <div className="flex items-center gap-3">
                                 <div className={cn(
                                   "w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold transition-colors",
                                   isEnrolled ? "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                                 )}>
                                   {student.name.split(' ').map(n => n[0]).join('')}
                                 </div>
                                 <div className="min-w-0 pr-4">
                                   <p className={cn("text-[11px] font-bold truncate", isEnrolled ? "text-fuchsia-900" : "text-slate-700")}>{student.name}</p>
                                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{student.program}</p>
                                 </div>
                               </div>
                               <div className={cn(
                                 "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                                 isEnrolled ? "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white" : "bg-slate-50 text-slate-300 opacity-10 group-hover:opacity-100"
                               )}>
                                 {isEnrolled ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                               </div>
                             </div>
                           );
                         })}
                     </div>
                  </div>
                </div>

                <div className="pt-8 flex gap-4">
                  <button 
                    type="button"
                    onClick={closeSubjectModal}
                    className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all"
                  >
                    Discard
                  </button>
                  {editingSubject && (
                    <button 
                      type="button"
                      onClick={() => handleDeleteSubject(editingSubject.id!)}
                      className="px-8 py-5 bg-rose-50 text-rose-500 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-100 transition-all"
                    >
                      Expunge
                    </button>
                  )}
                  <button 
                    type="submit"
                    className="flex-2 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] hover:from-fuchsia-700 hover:to-violet-700 shadow-2xl shadow-fuchsia-100 transition-all flex items-center justify-center gap-2"
                  >
                    {editingSubject ? <Save className="w-4 h-4 shadow-sm" /> : <Plus className="w-4 h-4" />}
                    <span>{editingSubject ? 'Save Changes' : 'Establish Subject'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
