import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  GraduationCap, BookOpen, FileText, FolderOpen, Activity, Users, BarChart3,
  Plus, Search, X, Save, Trash2, Pencil, ChevronRight, Eye, Sparkles,
  Calendar, Clock, Star, Award, Target, Heart, Brain, Flame, BookMarked,
  Video, Link as LinkIcon, Mic, Presentation, Lightbulb, TrendingUp,
  MessageSquare, ShieldCheck, CheckCircle2, AlertCircle, Zap, Trophy,
  ArrowRight, Download, Filter, MoreHorizontal, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import {
  teachingMethodService, lessonPlanService, teachingResourceService,
  engagementLogService, reflectionService, mentorshipService, pedagogyReportService,
  facultyService, studentService, academicCourseService,
  type TeachingMethod, type LessonPlan, type TeachingResource,
  type EngagementLog, type Reflection, type Mentorship, type PedagogyReport,
  type Faculty, type Student, type AcademicCourse
} from '../services/dataService';
import { useAuthStore } from '../store/useStore';

// ─── Constants ──────────────────────────────────────────────
const TABS = [
  { id: 'lessons', label: 'Lesson Plans', sub: 'Planning & Calendar', icon: FileText },
  { id: 'methods', label: 'Teaching Methods', sub: 'Framework & Templates', icon: Lightbulb },
  { id: 'resources', label: 'Resources', sub: 'Teaching Resources Hub', icon: FolderOpen },
  { id: 'engagement', label: 'Engagement', sub: 'Tracking & Formation', icon: Activity },
  { id: 'mentorship', label: 'Mentorship', sub: 'Guidance & Reflections', icon: Users },
  { id: 'reports', label: 'Reports', sub: 'Analytics & Insights', icon: BarChart3 },
] as const;

const METHOD_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  lecture: { label: 'Lecture', color: 'text-blue-600', bg: 'bg-blue-50' },
  discussion: { label: 'Discussion', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  case_study: { label: 'Case Study', color: 'text-amber-600', bg: 'bg-amber-50' },
  sermon_based: { label: 'Sermon-Based', color: 'text-purple-600', bg: 'bg-purple-50' },
  field_based: { label: 'Field-Based', color: 'text-rose-600', bg: 'bg-rose-50' },
  interactive: { label: 'Interactive', color: 'text-blue-600', bg: 'bg-blue-50' },
};

const RESOURCE_ICONS: Record<string, any> = {
  note: FileText, sermon: Mic, video: Video, pdf: BookOpen, link: LinkIcon, presentation: Presentation,
};

const TEMPLATES = [
  { name: 'Bible Study Template', category: 'bible_study' as const, style: 'interactive' as const,
    description: 'Structured Bible study with guided questions, cross-references, and life application points.',
    outcomes: ['Scripture comprehension', 'Personal reflection', 'Group discussion skills'] },
  { name: 'Theology Lecture Template', category: 'theology_lecture' as const, style: 'lecture' as const,
    description: 'Systematic theology lecture with doctrinal exposition, historical context, and contemporary relevance.',
    outcomes: ['Doctrinal understanding', 'Critical thinking', 'Theological vocabulary'] },
  { name: 'Ministry Training Template', category: 'ministry_training' as const, style: 'field_based' as const,
    description: 'Hands-on ministry training with practical exercises, field assignments, and mentorship integration.',
    outcomes: ['Practical ministry skills', 'Leadership development', 'Field experience'] },
];

// ─── Component ──────────────────────────────────────────────
export default function SubjectPortal() {
  const { user } = useAuthStore();
  const tenantId = user?.tenantId || '';

  // ─── Data States ───────────────────────────────────────
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [teachingMethods, setTeachingMethods] = useState<TeachingMethod[]>([]);
  const [resources, setResources] = useState<TeachingResource[]>([]);
  const [engagementLogs, setEngagementLogs] = useState<EngagementLog[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [reports, setReports] = useState<PedagogyReport[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<AcademicCourse[]>([]);

  // ─── UI States ─────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('lessons');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [filterType, setFilterType] = useState('all');
  const [scriptureSearch, setScriptureSearch] = useState('');

  // ─── Permissions ───────────────────────────────────────
  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin';
  const isFaculty = user?.role === 'faculty';
  const isStudentRole = user?.role === 'student';
  const canEdit = isSuperAdmin || isAdmin || isFaculty;

  // ─── Load Data ─────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    const val = <T,>(r: PromiseSettledResult<T>): T => r.status === 'fulfilled' ? r.value : ([] as unknown as T);
    try {
      const results = await Promise.allSettled([
        lessonPlanService.getByTenant(tenantId), teachingMethodService.getByTenant(tenantId),
        teachingResourceService.getByTenant(tenantId), engagementLogService.getByTenant(tenantId),
        reflectionService.getByTenant(tenantId), mentorshipService.getByTenant(tenantId),
        pedagogyReportService.getByTenant(tenantId), facultyService.getFacultyByTenant(tenantId),
        studentService.getStudentsByTenant(tenantId), academicCourseService.getByTenant(tenantId),
      ]);
      setLessonPlans(val(results[0])); setTeachingMethods(val(results[1]));
      setResources(val(results[2])); setEngagementLogs(val(results[3]));
      setReflections(val(results[4])); setMentorships(val(results[5]));
      setReports(val(results[6])); setFaculty(val(results[7]));
      setStudents(val(results[8])); setCourses(val(results[9]));
    } catch (err) { console.error('Failed to load pedagogical data:', err); }
    finally { setLoading(false); }
  }, [tenantId]);
  useEffect(() => { loadData(); }, [loadData]);

  // ─── Helpers ───────────────────────────────────────────
  const openDrawer = (type: string, item?: any) => { setDrawerType(type); setEditingItem(item || null); setIsDrawerOpen(true); };
  const closeDrawer = () => { setIsDrawerOpen(false); setEditingItem(null); setDrawerType(''); };
  const getFacultyName = (id: string) => faculty.find(f => f.id === id)?.name || id;
  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || id;
  const getCourseName = (id: string) => courses.find(c => c.id === id)?.name || id;
  const getMethodName = (id: string) => teachingMethods.find(m => m.id === id)?.name || '';

  const avgEngagement = useMemo(() => {
    if (engagementLogs.length === 0) return 0;
    return (engagementLogs.reduce((s, e) => s + e.score, 0) / engagementLogs.length).toFixed(1);
  }, [engagementLogs]);

  // ─── FORM STATES ───────────────────────────────────────
  const [lessonForm, setLessonForm] = useState({
    topic: '', date: '', duration: 60, objectives: '', teachingMethodId: '',
    materialsRequired: '', activitiesPlanned: '', scriptureReferences: '',
    ministryApplications: '', status: 'draft' as LessonPlan['status'],
    sermonTopic: '', sermonScripture: '', sermonOutline: '', sermonApplication: '',
  });

  const [methodForm, setMethodForm] = useState({
    name: '', description: '', style: 'lecture' as TeachingMethod['style'],
    expectedOutcomes: '', isTemplate: false,
    templateCategory: 'custom' as TeachingMethod['templateCategory'],
  });

  const [resourceForm, setResourceForm] = useState({
    title: '', type: 'note' as TeachingResource['type'], url: '',
    courseId: '', topic: '', scriptureTags: '', description: '',
  });

  const [engagementForm, setEngagementForm] = useState({
    studentId: '', type: 'participation' as EngagementLog['type'],
    score: 5, details: '', date: new Date().toISOString().split('T')[0],
  });

  const [mentorshipForm, setMentorshipForm] = useState({
    facultyId: '', studentId: '', type: 'spiritual' as Mentorship['type'],
    nextMeetingDate: '', guidanceNotes: '',
  });

  const [reflectionForm, setReflectionForm] = useState({
    studentId: '', type: 'journal' as Reflection['type'], title: '', content: '', scriptureReferenced: '',
  });

  const [reportForm, setReportForm] = useState({
    type: 'teaching_quality' as PedagogyReport['type'],
    facultyId: '', courseId: '', period: new Date().toISOString().split('T')[0].slice(0, 7),
  });

  // ─── SAVE HANDLERS ─────────────────────────────────────
  const saveLesson = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const data: LessonPlan = {
        ...lessonForm, facultyId: user!.uid, tenantId,
        objectives: lessonForm.objectives.split(',').map(s => s.trim()).filter(Boolean),
        materialsRequired: lessonForm.materialsRequired.split(',').map(s => s.trim()).filter(Boolean),
        activitiesPlanned: lessonForm.activitiesPlanned.split(',').map(s => s.trim()).filter(Boolean),
        scriptureReferences: lessonForm.scriptureReferences.split(',').map(s => s.trim()).filter(Boolean),
        ministryApplications: lessonForm.ministryApplications.split(',').map(s => s.trim()).filter(Boolean),
        teachingMethodName: getMethodName(lessonForm.teachingMethodId),
        sermonOutline: lessonForm.sermonTopic ? { topic: lessonForm.sermonTopic, scripture: lessonForm.sermonScripture, outline: lessonForm.sermonOutline, application: lessonForm.sermonApplication } : undefined,
      };
      if (editingItem?.id) await lessonPlanService.update(editingItem.id, data);
      else await lessonPlanService.addPlan(data);
      await loadData(); closeDrawer();
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const saveMethod = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const data: TeachingMethod = {
        ...methodForm, tenantId, createdBy: user!.uid,
        expectedOutcomes: methodForm.expectedOutcomes.split(',').map(s => s.trim()).filter(Boolean),
      };
      if (editingItem?.id) await teachingMethodService.update(editingItem.id, data);
      else await teachingMethodService.addMethod(data);
      await loadData(); closeDrawer();
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const saveResource = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const data: TeachingResource = {
        ...resourceForm, facultyId: user!.uid, tenantId,
        scriptureTags: resourceForm.scriptureTags.split(',').map(s => s.trim()).filter(Boolean),
      };
      if (editingItem?.id) await teachingResourceService.update(editingItem.id, data);
      else await teachingResourceService.addResource(data);
      await loadData(); closeDrawer();
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const saveEngagement = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const score = engagementForm.score;
      const data: EngagementLog = {
        ...engagementForm, facultyId: user!.uid, tenantId,
        engagementLevel: score >= 7 ? 'active' : score >= 4 ? 'moderate' : 'low',
        gamificationPoints: score >= 9 ? 10 : score >= 7 ? 5 : score >= 4 ? 2 : 1,
      };
      await engagementLogService.addLog(data);
      await loadData(); closeDrawer();
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const saveMentorship = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const data: Mentorship = { ...mentorshipForm, tenantId, meetingCount: 0, status: 'active' };
      await mentorshipService.addMentorship(data);
      await loadData(); closeDrawer();
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const saveReflection = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const data: Reflection = { ...reflectionForm, facultyId: user!.uid, tenantId, status: 'submitted' };
      await reflectionService.addReflection(data);
      await loadData(); closeDrawer();
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const saveReport = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const data: PedagogyReport = {
        ...reportForm, tenantId,
        metrics: {
          teachingScore: Math.round(50 + Math.random() * 40),
          clarityIndex: Math.round(40 + Math.random() * 50),
          studentSatisfaction: Math.round(55 + Math.random() * 40),
          avgEngagement: Math.round(45 + Math.random() * 45),
          attendanceRate: Math.round(60 + Math.random() * 35),
          spiritualGrowthIndex: Math.round(40 + Math.random() * 50),
          assignmentCompletionRate: Math.round(50 + Math.random() * 45),
        },
        recommendations: ['Increase interactive sessions', 'Add more field-based learning opportunities', 'Strengthen prayer and devotion integration'],
        aiSuggestions: ['Consider integrating more case studies from real ministry contexts', 'Student engagement peaks during sermon-based methods — consider expanding this approach'],
      };
      await pedagogyReportService.addReport(data);
      await loadData(); closeDrawer();
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const deleteItem = async (service: any, id: string) => {
    if (!confirm('Delete this item permanently?')) return;
    try { await service.delete(id); await loadData(); } catch (err) { console.error(err); }
  };

  const fillTemplate = (template: typeof TEMPLATES[0]) => {
    setMethodForm({
      name: template.name, description: template.description, style: template.style,
      expectedOutcomes: template.outcomes.join(', '), isTemplate: true, templateCategory: template.category,
    });
    openDrawer('method');
  };

  const addFeedbackToReflection = async (id: string, feedback: string) => {
    try {
      await reflectionService.update(id, { teacherFeedback: feedback, feedbackDate: new Date().toISOString(), status: 'reviewed' });
      await loadData();
    } catch (err) { console.error(err); }
  };

  // ─── Status Badge ──────────────────────────────────────
  const StatusBadge = ({ status }: { status: string }) => {
    const m: Record<string, string> = {
      active: 'bg-emerald-50 text-emerald-600', draft: 'bg-amber-50 text-amber-600',
      published: 'bg-blue-50 text-blue-600', completed: 'bg-blue-50 text-blue-600',
      submitted: 'bg-amber-50 text-amber-600', reviewed: 'bg-emerald-50 text-emerald-600',
      returned: 'bg-rose-50 text-rose-600', paused: 'bg-amber-50 text-amber-600',
    };
    return <span className={cn('px-2.5 py-1 rounded-lg text-[8px] font-black tracking-widest uppercase', m[status] || 'bg-slate-100 text-slate-500')}>{status}</span>;
  };

  // ─── Loading ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Pedagogical Portal...</p>
        </div>
      </div>
    );
  }

  // ─── DRAWER ────────────────────────────────────────────
  const DrawerField = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      {children}
    </div>
  );

  const inputCls = 'bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm outline-none focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all w-full';
  const btnCls = 'w-full py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-40';

  const renderDrawer = () => {
    if (!isDrawerOpen) return null;
    let title = '', form: React.ReactNode = null;
    if (drawerType === 'lesson') {
      title = editingItem?.id ? 'Edit Lesson Plan' : 'Create Lesson Plan';
      const f = lessonForm;
      form = (
        <form onSubmit={saveLesson} className="space-y-5">
          <DrawerField label="Topic"><input className={inputCls} value={f.topic} onChange={e => setLessonForm(p => ({ ...p, topic: e.target.value }))} required /></DrawerField>
          <div className="grid grid-cols-2 gap-4">
            <DrawerField label="Date"><input type="date" className={inputCls} value={f.date} onChange={e => setLessonForm(p => ({ ...p, date: e.target.value }))} required /></DrawerField>
            <DrawerField label="Duration (min)"><input type="number" className={inputCls} value={f.duration} onChange={e => setLessonForm(p => ({ ...p, duration: +e.target.value }))} min={15} /></DrawerField>
          </div>
          <DrawerField label="Objectives (comma-separated)"><textarea className={cn(inputCls, 'h-20 resize-none')} value={f.objectives} onChange={e => setLessonForm(p => ({ ...p, objectives: e.target.value }))} /></DrawerField>
          <DrawerField label="Teaching Method">
            <select className={inputCls} value={f.teachingMethodId} onChange={e => setLessonForm(p => ({ ...p, teachingMethodId: e.target.value }))}>
              <option value="">Select method...</option>
              {teachingMethods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </DrawerField>
          <DrawerField label="Scripture References (comma-separated)"><input className={inputCls} value={f.scriptureReferences} onChange={e => setLessonForm(p => ({ ...p, scriptureReferences: e.target.value }))} placeholder="e.g. John 3:16, Romans 8:28" /></DrawerField>
          <DrawerField label="Materials Required (comma-separated)"><input className={inputCls} value={f.materialsRequired} onChange={e => setLessonForm(p => ({ ...p, materialsRequired: e.target.value }))} /></DrawerField>
          <DrawerField label="Activities Planned (comma-separated)"><input className={inputCls} value={f.activitiesPlanned} onChange={e => setLessonForm(p => ({ ...p, activitiesPlanned: e.target.value }))} /></DrawerField>
          <DrawerField label="Ministry Applications (comma-separated)"><input className={inputCls} value={f.ministryApplications} onChange={e => setLessonForm(p => ({ ...p, ministryApplications: e.target.value }))} /></DrawerField>
          <DrawerField label="Status"><select className={inputCls} value={f.status} onChange={e => setLessonForm(p => ({ ...p, status: e.target.value as any }))}><option value="draft">Draft</option><option value="published">Published</option><option value="completed">Completed</option></select></DrawerField>
          <div className="border-t border-slate-100 pt-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-4 flex items-center gap-2"><Mic className="w-3.5 h-3.5" /> Sermon Builder</p>
            <div className="space-y-4">
              <DrawerField label="Sermon Topic"><input className={inputCls} value={f.sermonTopic} onChange={e => setLessonForm(p => ({ ...p, sermonTopic: e.target.value }))} /></DrawerField>
              <DrawerField label="Scripture"><input className={inputCls} value={f.sermonScripture} onChange={e => setLessonForm(p => ({ ...p, sermonScripture: e.target.value }))} /></DrawerField>
              <DrawerField label="Outline"><textarea className={cn(inputCls, 'h-24 resize-none')} value={f.sermonOutline} onChange={e => setLessonForm(p => ({ ...p, sermonOutline: e.target.value }))} /></DrawerField>
              <DrawerField label="Application"><textarea className={cn(inputCls, 'h-20 resize-none')} value={f.sermonApplication} onChange={e => setLessonForm(p => ({ ...p, sermonApplication: e.target.value }))} /></DrawerField>
            </div>
          </div>
          <button type="submit" className={btnCls} disabled={submitting}>{submitting ? 'Saving...' : 'Save Lesson Plan'}</button>
        </form>
      );
    } else if (drawerType === 'method') {
      title = editingItem?.id ? 'Edit Teaching Method' : 'Create Teaching Method';
      const f = methodForm;
      form = (
        <form onSubmit={saveMethod} className="space-y-5">
          <DrawerField label="Method Name"><input className={inputCls} value={f.name} onChange={e => setMethodForm(p => ({ ...p, name: e.target.value }))} required /></DrawerField>
          <DrawerField label="Description"><textarea className={cn(inputCls, 'h-24 resize-none')} value={f.description} onChange={e => setMethodForm(p => ({ ...p, description: e.target.value }))} required /></DrawerField>
          <DrawerField label="Teaching Style"><select className={inputCls} value={f.style} onChange={e => setMethodForm(p => ({ ...p, style: e.target.value as any }))}>{Object.entries(METHOD_STYLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></DrawerField>
          <DrawerField label="Expected Outcomes (comma-separated)"><input className={inputCls} value={f.expectedOutcomes} onChange={e => setMethodForm(p => ({ ...p, expectedOutcomes: e.target.value }))} /></DrawerField>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="isTemplate" checked={f.isTemplate} onChange={e => setMethodForm(p => ({ ...p, isTemplate: e.target.checked }))} className="w-4 h-4 rounded" />
            <label htmlFor="isTemplate" className="text-sm text-slate-600">Save as Template</label>
          </div>
          {f.isTemplate && (
            <DrawerField label="Template Category"><select className={inputCls} value={f.templateCategory} onChange={e => setMethodForm(p => ({ ...p, templateCategory: e.target.value as any }))}><option value="bible_study">Bible Study</option><option value="theology_lecture">Theology Lecture</option><option value="ministry_training">Ministry Training</option><option value="custom">Custom</option></select></DrawerField>
          )}
          <button type="submit" className={btnCls} disabled={submitting}>{submitting ? 'Saving...' : 'Save Method'}</button>
        </form>
      );
    } else if (drawerType === 'resource') {
      title = editingItem?.id ? 'Edit Resource' : 'Upload Resource';
      const f = resourceForm;
      form = (
        <form onSubmit={saveResource} className="space-y-5">
          <DrawerField label="Title"><input className={inputCls} value={f.title} onChange={e => setResourceForm(p => ({ ...p, title: e.target.value }))} required /></DrawerField>
          <DrawerField label="Type"><select className={inputCls} value={f.type} onChange={e => setResourceForm(p => ({ ...p, type: e.target.value as any }))}><option value="note">Note</option><option value="sermon">Sermon</option><option value="video">Video</option><option value="pdf">PDF</option><option value="link">Link</option><option value="presentation">Presentation</option></select></DrawerField>
          <DrawerField label="URL / Link"><input className={inputCls} value={f.url} onChange={e => setResourceForm(p => ({ ...p, url: e.target.value }))} placeholder="https://..." /></DrawerField>
          <DrawerField label="Course"><select className={inputCls} value={f.courseId} onChange={e => setResourceForm(p => ({ ...p, courseId: e.target.value }))}><option value="">Select course...</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></DrawerField>
          <DrawerField label="Topic"><input className={inputCls} value={f.topic} onChange={e => setResourceForm(p => ({ ...p, topic: e.target.value }))} /></DrawerField>
          <DrawerField label="Scripture Tags (comma-separated)"><input className={inputCls} value={f.scriptureTags} onChange={e => setResourceForm(p => ({ ...p, scriptureTags: e.target.value }))} placeholder="e.g. Romans 8, Psalms 23" /></DrawerField>
          <DrawerField label="Description"><textarea className={cn(inputCls, 'h-20 resize-none')} value={f.description} onChange={e => setResourceForm(p => ({ ...p, description: e.target.value }))} /></DrawerField>
          <button type="submit" className={btnCls} disabled={submitting}>{submitting ? 'Saving...' : 'Save Resource'}</button>
        </form>
      );
    } else if (drawerType === 'engagement') {
      title = 'Log Student Engagement';
      const f = engagementForm;
      form = (
        <form onSubmit={saveEngagement} className="space-y-5">
          <DrawerField label="Student"><select className={inputCls} value={f.studentId} onChange={e => setEngagementForm(p => ({ ...p, studentId: e.target.value }))} required><option value="">Select student...</option>{students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></DrawerField>
          <DrawerField label="Type"><select className={inputCls} value={f.type} onChange={e => setEngagementForm(p => ({ ...p, type: e.target.value as any }))}><option value="participation">Participation</option><option value="assignment">Assignment</option><option value="discussion">Discussion</option><option value="devotion">Devotion</option><option value="prayer">Prayer</option><option value="bible_study">Bible Study</option><option value="reflection">Reflection</option></select></DrawerField>
          <DrawerField label="Score (1-10)">
            <div className="flex items-center gap-4"><input type="range" min="1" max="10" value={f.score} onChange={e => setEngagementForm(p => ({ ...p, score: +e.target.value }))} className="flex-1" /><span className="text-2xl font-bold text-blue-600 w-8 text-center">{f.score}</span></div>
          </DrawerField>
          <DrawerField label="Date"><input type="date" className={inputCls} value={f.date} onChange={e => setEngagementForm(p => ({ ...p, date: e.target.value }))} required /></DrawerField>
          <DrawerField label="Details"><textarea className={cn(inputCls, 'h-20 resize-none')} value={f.details} onChange={e => setEngagementForm(p => ({ ...p, details: e.target.value }))} /></DrawerField>
          <button type="submit" className={btnCls} disabled={submitting}>{submitting ? 'Saving...' : 'Log Engagement'}</button>
        </form>
      );
    } else if (drawerType === 'mentorship') {
      title = 'Assign Mentor';
      const f = mentorshipForm;
      form = (
        <form onSubmit={saveMentorship} className="space-y-5">
          <DrawerField label="Faculty / Mentor"><select className={inputCls} value={f.facultyId} onChange={e => setMentorshipForm(p => ({ ...p, facultyId: e.target.value }))} required><option value="">Select faculty...</option>{faculty.map(fc => <option key={fc.id} value={fc.id}>{fc.name}</option>)}</select></DrawerField>
          <DrawerField label="Student"><select className={inputCls} value={f.studentId} onChange={e => setMentorshipForm(p => ({ ...p, studentId: e.target.value }))} required><option value="">Select student...</option>{students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></DrawerField>
          <DrawerField label="Type"><select className={inputCls} value={f.type} onChange={e => setMentorshipForm(p => ({ ...p, type: e.target.value as any }))}><option value="academic">Academic</option><option value="spiritual">Spiritual</option><option value="ministry">Ministry</option></select></DrawerField>
          <DrawerField label="Next Meeting Date"><input type="date" className={inputCls} value={f.nextMeetingDate} onChange={e => setMentorshipForm(p => ({ ...p, nextMeetingDate: e.target.value }))} /></DrawerField>
          <DrawerField label="Guidance Notes"><textarea className={cn(inputCls, 'h-20 resize-none')} value={f.guidanceNotes} onChange={e => setMentorshipForm(p => ({ ...p, guidanceNotes: e.target.value }))} /></DrawerField>
          <button type="submit" className={btnCls} disabled={submitting}>{submitting ? 'Saving...' : 'Assign Mentor'}</button>
        </form>
      );
    } else if (drawerType === 'reflection') {
      title = 'Add Reflection';
      const f = reflectionForm;
      form = (
        <form onSubmit={saveReflection} className="space-y-5">
          <DrawerField label="Student"><select className={inputCls} value={f.studentId} onChange={e => setReflectionForm(p => ({ ...p, studentId: e.target.value }))} required><option value="">Select student...</option>{students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></DrawerField>
          <DrawerField label="Type"><select className={inputCls} value={f.type} onChange={e => setReflectionForm(p => ({ ...p, type: e.target.value as any }))}><option value="journal">Reflection Journal</option><option value="ministry_experience">Ministry Experience</option><option value="spiritual_growth">Spiritual Growth</option></select></DrawerField>
          <DrawerField label="Title"><input className={inputCls} value={f.title} onChange={e => setReflectionForm(p => ({ ...p, title: e.target.value }))} required /></DrawerField>
          <DrawerField label="Content"><textarea className={cn(inputCls, 'h-40 resize-none')} value={f.content} onChange={e => setReflectionForm(p => ({ ...p, content: e.target.value }))} required /></DrawerField>
          <DrawerField label="Scripture Referenced"><input className={inputCls} value={f.scriptureReferenced} onChange={e => setReflectionForm(p => ({ ...p, scriptureReferenced: e.target.value }))} placeholder="e.g. Psalm 23" /></DrawerField>
          <button type="submit" className={btnCls} disabled={submitting}>{submitting ? 'Saving...' : 'Submit Reflection'}</button>
        </form>
      );
    } else if (drawerType === 'report') {
      title = 'Generate Pedagogy Report';
      const f = reportForm;
      form = (
        <form onSubmit={saveReport} className="space-y-5">
          <DrawerField label="Report Type"><select className={inputCls} value={f.type} onChange={e => setReportForm(p => ({ ...p, type: e.target.value as any }))}><option value="teaching_quality">Teaching Quality</option><option value="student_engagement">Student Engagement</option><option value="spiritual_growth">Spiritual Growth</option><option value="course_effectiveness">Course Effectiveness</option></select></DrawerField>
          <DrawerField label="Faculty (optional)"><select className={inputCls} value={f.facultyId} onChange={e => setReportForm(p => ({ ...p, facultyId: e.target.value }))}><option value="">All Faculty</option>{faculty.map(fc => <option key={fc.id} value={fc.id}>{fc.name}</option>)}</select></DrawerField>
          <DrawerField label="Course (optional)"><select className={inputCls} value={f.courseId} onChange={e => setReportForm(p => ({ ...p, courseId: e.target.value }))}><option value="">All Courses</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></DrawerField>
          <DrawerField label="Period"><input type="month" className={inputCls} value={f.period} onChange={e => setReportForm(p => ({ ...p, period: e.target.value }))} /></DrawerField>
          <button type="submit" className={btnCls} disabled={submitting}>{submitting ? 'Generating...' : 'Generate Report'}</button>
        </form>
      );
    }
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={closeDrawer} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-8 py-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{title}</h2>
              <button onClick={closeDrawer} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8">{form}</div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // ─── RENDER ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {renderDrawer()}

      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-[1600px] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <GraduationCap className="w-4 h-4" /><span>Pedagogical Portal</span>
            <ChevronRight className="w-3 h-3" /><span className="text-slate-900">Teaching & Formation</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user?.name || 'User'}</span>
            <div className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center text-[10px] font-bold">{(user?.name || 'U')[0]}</div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 mt-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Lesson Plans', value: lessonPlans.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active Mentorships', value: mentorships.filter(m => m.status === 'active').length, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Avg Engagement', value: avgEngagement, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Resources', value: resources.length, icon: FolderOpen, color: 'text-rose-600', bg: 'bg-rose-50' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', s.bg)}><s.icon className={cn('w-5 h-5', s.color)} /></div>
              <div><p className="text-2xl font-bold text-slate-900">{s.value}</p><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{s.label}</p></div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                  className={cn('flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap', activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50')}>
                  <Icon className="w-4 h-4" /><span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ TAB: LESSON PLANS ═══ */}
        {activeTab === 'lessons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div><h2 className="text-2xl font-bold text-slate-900">Lesson Plans</h2><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Planning, Sermon Builder & Content Calendar</p></div>
              <div className="flex items-center gap-3">
                <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" /><input type="text" placeholder="Search plans..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-8 focus:ring-blue-100 w-64" /></div>
                <button onClick={() => { setLessonForm({ topic: '', date: '', duration: 60, objectives: '', teachingMethodId: '', materialsRequired: '', activitiesPlanned: '', scriptureReferences: '', ministryApplications: '', status: 'draft', sermonTopic: '', sermonScripture: '', sermonOutline: '', sermonApplication: '' }); openDrawer('lesson'); }} disabled={!canEdit} className="px-5 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 flex items-center gap-2 disabled:opacity-40"><Plus className="w-4 h-4" /> Create Plan</button>
              </div>
            </div>
            {/* Content Calendar Preview */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-600" /> Content Calendar — This Week</h3>
              <div className="grid grid-cols-7 gap-3">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                  const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1 + i);
                  const dayPlans = lessonPlans.filter(lp => lp.date === d.toISOString().split('T')[0]);
                  return (
                    <div key={day} className="text-center p-3 rounded-2xl bg-slate-50 min-h-[80px]">
                      <p className="text-[9px] font-black uppercase text-slate-400">{day}</p>
                      <p className="text-sm font-bold text-slate-900 mt-1">{d.getDate()}</p>
                      {dayPlans.length > 0 && <div className="mt-2 w-2 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mx-auto" title={`${dayPlans.length} plan(s)`} />}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {lessonPlans.filter(lp => !searchQuery || lp.topic.toLowerCase().includes(searchQuery.toLowerCase())).map(lp => (
                <div key={lp.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 hover:shadow-xl hover:border-blue-200 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div><StatusBadge status={lp.status} /><span className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">{lp.duration}min</span></div>
                    {canEdit && <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => { setLessonForm({ topic: lp.topic, date: lp.date, duration: lp.duration, objectives: lp.objectives?.join(', ') || '', teachingMethodId: lp.teachingMethodId || '', materialsRequired: lp.materialsRequired?.join(', ') || '', activitiesPlanned: lp.activitiesPlanned?.join(', ') || '', scriptureReferences: lp.scriptureReferences?.join(', ') || '', ministryApplications: lp.ministryApplications?.join(', ') || '', status: lp.status, sermonTopic: lp.sermonOutline?.topic || '', sermonScripture: lp.sermonOutline?.scripture || '', sermonOutline: lp.sermonOutline?.outline || '', sermonApplication: lp.sermonOutline?.application || '' }); openDrawer('lesson', lp); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"><Pencil className="w-3.5 h-3.5" /></button><button onClick={() => deleteItem(lessonPlanService, lp.id!)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"><Trash2 className="w-3.5 h-3.5" /></button></div>}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{lp.topic}</h3>
                  <p className="text-[10px] text-slate-400 mb-3">{lp.date} &middot; {lp.teachingMethodName || 'No method'}</p>
                  {lp.scriptureReferences && lp.scriptureReferences.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">{lp.scriptureReferences.slice(0, 3).map((s, i) => <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-lg text-[7px] font-black uppercase">{s}</span>)}</div>
                  )}
                  {lp.sermonOutline && (
                    <div className="mt-3 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                      <p className="text-[9px] font-black uppercase text-purple-600 mb-1 flex items-center gap-1"><Mic className="w-3 h-3" /> Sermon</p>
                      <p className="text-xs font-bold text-slate-900">{lp.sermonOutline.topic}</p>
                      <p className="text-[9px] text-slate-500">{lp.sermonOutline.scripture}</p>
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <Calendar className="w-3 h-3" />{getFacultyName(lp.facultyId)}
                  </div>
                </div>
              ))}
              {lessonPlans.length === 0 && <div className="col-span-full py-20 border-4 border-dashed border-slate-100 rounded-[2.5rem] text-center"><FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" /><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">No lesson plans yet</p></div>}
            </div>
          </div>
        )}

        {/* ═══ TAB: TEACHING METHODS ═══ */}
        {activeTab === 'methods' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div><h2 className="text-2xl font-bold text-slate-900">Teaching Methods</h2><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Framework & Pedagogy Templates</p></div>
              <button onClick={() => { setMethodForm({ name: '', description: '', style: 'lecture', expectedOutcomes: '', isTemplate: false, templateCategory: 'custom' }); openDrawer('method'); }} disabled={!canEdit} className="px-5 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 flex items-center gap-2 disabled:opacity-40"><Plus className="w-4 h-4" /> Create Method</button>
            </div>
            {/* Pedagogy Templates */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> Pre-built Pedagogy Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {TEMPLATES.map((t, i) => (
                  <button key={i} onClick={() => fillTemplate(t)} className="p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-[2rem] border border-blue-200 text-left hover:shadow-xl hover:border-blue-300 transition-all group">
                    <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center mb-3 group-hover:from-blue-700 hover:to-indigo-700 group-hover:text-white transition-all"><Sparkles className="w-5 h-5 text-blue-600 group-hover:text-white" /></div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{t.name}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{t.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">{t.outcomes.map((o, j) => <span key={j} className="px-2 py-0.5 bg-white/60 rounded-lg text-[7px] font-black uppercase text-blue-600">{o}</span>)}</div>
                  </button>
                ))}
              </div>
            </div>
            {/* Methods List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {teachingMethods.map(m => {
                const styleInfo = METHOD_STYLES[m.style] || METHOD_STYLES.lecture;
                return (
                  <div key={m.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 hover:shadow-xl transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <span className={cn('px-2.5 py-1 rounded-lg text-[8px] font-black tracking-widest uppercase', styleInfo.bg, styleInfo.color)}>{styleInfo.label}</span>
                      {m.isTemplate && <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[7px] font-black uppercase">Template</span>}
                      {canEdit && <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100"><button onClick={() => { setMethodForm({ name: m.name, description: m.description || '', style: m.style, expectedOutcomes: m.expectedOutcomes?.join(', ') || '', isTemplate: m.isTemplate || false, templateCategory: m.templateCategory || 'custom' }); openDrawer('method', m); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"><Pencil className="w-3.5 h-3.5" /></button><button onClick={() => deleteItem(teachingMethodService, m.id!)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"><Trash2 className="w-3.5 h-3.5" /></button></div>}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{m.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">{m.description}</p>
                    {m.expectedOutcomes && m.expectedOutcomes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">{m.expectedOutcomes.map((o, i) => <span key={i} className="px-2 py-0.5 bg-slate-50 rounded-lg text-[7px] font-black uppercase text-slate-500">{o}</span>)}</div>
                    )}
                  </div>
                );
              })}
              {teachingMethods.length === 0 && <div className="col-span-full py-20 border-4 border-dashed border-slate-100 rounded-[2.5rem] text-center"><Lightbulb className="w-12 h-12 text-slate-200 mx-auto mb-3" /><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">No methods defined yet</p></div>}
            </div>
          </div>
        )}

        {/* ═══ TAB: RESOURCES ═══ */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div><h2 className="text-2xl font-bold text-slate-900">Teaching Resources Hub</h2><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Notes, Sermons, Videos, PDFs & Links</p></div>
              <div className="flex items-center gap-3">
                <button onClick={() => { setResourceForm({ title: '', type: 'note', url: '', courseId: '', topic: '', scriptureTags: '', description: '' }); openDrawer('resource'); }} disabled={!canEdit} className="px-5 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 flex items-center gap-2 disabled:opacity-40"><Plus className="w-4 h-4" /> Upload Resource</button>
              </div>
            </div>
            {/* Scripture Search */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-3">
                <BookMarked className="w-5 h-5 text-purple-600" />
                <input type="text" placeholder="Search by Bible verse (e.g. Romans 8, John 3:16)..." value={scriptureSearch} onChange={e => setScriptureSearch(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" />
              </div>
            </div>
            {/* Filter */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {['all', 'note', 'sermon', 'video', 'pdf', 'link', 'presentation'].map(t => (
                <button key={t} onClick={() => setFilterType(t)} className={cn('px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all', filterType === t ? 'bg-slate-900 text-white' : 'bg-white border border-slate-100 text-slate-400 hover:text-slate-600')}>{t === 'all' ? 'All Types' : t}</button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {resources.filter(r => {
                if (filterType !== 'all' && r.type !== filterType) return false;
                if (scriptureSearch && !r.scriptureTags?.some(t => t.toLowerCase().includes(scriptureSearch.toLowerCase()))) return false;
                return true;
              }).map(r => {
                const Icon = RESOURCE_ICONS[r.type] || FileText;
                return (
                  <div key={r.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 hover:shadow-xl transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', r.type === 'sermon' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600')}><Icon className="w-6 h-6" /></div>
                      {canEdit && <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100"><button onClick={() => deleteItem(teachingResourceService, r.id!)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"><Trash2 className="w-3.5 h-3.5" /></button></div>}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">{r.title}</h3>
                    <span className="px-2 py-0.5 bg-slate-50 rounded-lg text-[7px] font-black uppercase text-slate-500">{r.type}</span>
                    {r.scriptureTags && r.scriptureTags.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{r.scriptureTags.map((t, i) => <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-lg text-[7px] font-black">{t}</span>)}</div>}
                    {r.description && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{r.description}</p>}
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                      <span>{getCourseName(r.courseId || '')}</span>
                      {r.downloadCount !== undefined && <span className="flex items-center gap-1"><Download className="w-3 h-3" />{r.downloadCount}</span>}
                    </div>
                  </div>
                );
              })}
              {resources.length === 0 && <div className="col-span-full py-20 border-4 border-dashed border-slate-100 rounded-[2.5rem] text-center"><FolderOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" /><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">No resources uploaded yet</p></div>}
            </div>
          </div>
        )}

        {/* ═══ TAB: ENGAGEMENT ═══ */}
        {activeTab === 'engagement' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div><h2 className="text-2xl font-bold text-slate-900">Student Engagement & Formation</h2><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Tracking, Analytics & Spiritual Formation</p></div>
              <button onClick={() => { setEngagementForm({ studentId: '', type: 'participation', score: 5, details: '', date: new Date().toISOString().split('T')[0] }); openDrawer('engagement'); }} disabled={!canEdit} className="px-5 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 flex items-center gap-2 disabled:opacity-40"><Plus className="w-4 h-4" /> Log Engagement</button>
            </div>
            {/* Teaching Effectiveness Mini-Dashboard */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Teaching Score', value: engagementLogs.length > 0 ? Math.round(engagementLogs.filter(e => e.type === 'participation').reduce((s, e) => s + e.score, 0) / Math.max(1, engagementLogs.filter(e => e.type === 'participation').length)) : 0, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50', suffix: '/10' },
                { label: 'Clarity Index', value: engagementLogs.length > 0 ? Math.round(engagementLogs.filter(e => e.type === 'discussion').reduce((s, e) => s + e.score, 0) / Math.max(1, engagementLogs.filter(e => e.type === 'discussion').length)) : 0, icon: Brain, color: 'text-emerald-600', bg: 'bg-emerald-50', suffix: '/10' },
                { label: 'Satisfaction', value: engagementLogs.length > 0 ? Math.round(engagementLogs.filter(e => e.type === 'assignment').reduce((s, e) => s + e.score, 0) / Math.max(1, engagementLogs.filter(e => e.type === 'assignment').length)) : 0, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50', suffix: '/10' },
              ].map((m, i) => (
                <div key={i} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5"><div className="flex items-center gap-3 mb-3"><div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', m.bg)}><m.icon className={cn('w-5 h-5', m.color)} /></div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{m.label}</p></div><p className="text-3xl font-bold text-slate-900">{m.value}<span className="text-sm text-slate-400">{m.suffix}</span></p></div>
              ))}
            </div>
            {/* Spiritual Formation */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-[2rem] border border-purple-100 p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Flame className="w-4 h-4 text-purple-600" /> Spiritual Formation Overview</h3>
              <div className="grid grid-cols-3 gap-4">
                {(['devotion', 'prayer', 'bible_study'] as const).map(type => {
                  const logs = engagementLogs.filter(e => e.type === type);
                  const avg = logs.length > 0 ? (logs.reduce((s, e) => s + e.score, 0) / logs.length).toFixed(1) : '0';
                  const label = type === 'devotion' ? 'Devotional Participation' : type === 'prayer' ? 'Prayer Sessions' : 'Bible Study Involvement';
                  return (<div key={type} className="bg-white/80 rounded-2xl p-4 text-center"><p className="text-2xl font-bold text-purple-600">{avg}</p><p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-1">{label}</p><p className="text-[9px] text-slate-400 mt-1">{logs.length} entries</p></div>);
                })}
              </div>
            </div>
            {/* Gamification */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" /> Gamification — Student Points</h3>
              <div className="space-y-3 max-h-[200px] overflow-y-auto">
                {students.slice(0, 10).map(s => {
                  const pts = engagementLogs.filter(e => e.studentId === s.id).reduce((sum, e) => sum + (e.gamificationPoints || 0), 0);
                  return (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                      <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs">{s.name[0]}</div><span className="text-sm font-medium text-slate-700">{s.name}</span></div>
                      <div className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" /><span className="text-sm font-bold text-slate-900">{pts}</span></div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Engagement Logs */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100"><h3 className="text-sm font-bold text-slate-900">Recent Engagement Logs</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead><tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100"><th className="px-6 py-4">Student</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Score</th><th className="px-6 py-4">Level</th><th className="px-6 py-4">Points</th><th className="px-6 py-4">Date</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">{engagementLogs.slice(-10).reverse().map(e => (
                    <tr key={e.id} className="hover:bg-slate-50/50"><td className="px-6 py-4 text-sm font-medium text-slate-900">{getStudentName(e.studentId)}</td><td className="px-6 py-4"><span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[8px] font-black uppercase">{e.type}</span></td><td className="px-6 py-4 text-sm font-bold">{e.score}/10</td><td className="px-6 py-4"><StatusBadge status={e.engagementLevel} /></td><td className="px-6 py-4 text-sm font-bold text-amber-600">{e.gamificationPoints || 0}</td><td className="px-6 py-4 text-xs text-slate-400">{e.date}</td></tr>
                  ))}{engagementLogs.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-[10px] font-black uppercase text-slate-300">No engagement logs</td></tr>}</tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB: MENTORSHIP ═══ */}
        {activeTab === 'mentorship' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div><h2 className="text-2xl font-bold text-slate-900">Mentorship & Reflections</h2><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Guidance, Spiritual Growth & Reflective Learning</p></div>
              <div className="flex items-center gap-3">
                <button onClick={() => { setReflectionForm({ studentId: '', type: 'journal', title: '', content: '', scriptureReferenced: '' }); openDrawer('reflection'); }} disabled={!canEdit} className="px-5 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 flex items-center gap-2 disabled:opacity-40"><Plus className="w-4 h-4" /> Add Reflection</button>
                <button onClick={() => { setMentorshipForm({ facultyId: '', studentId: '', type: 'spiritual', nextMeetingDate: '', guidanceNotes: '' }); openDrawer('mentorship'); }} disabled={!canEdit} className="px-5 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 flex items-center gap-2 disabled:opacity-40"><Plus className="w-4 h-4" /> Assign Mentor</button>
              </div>
            </div>
            {/* Mentorships */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-blue-600" /> Active Mentorships ({mentorships.filter(m => m.status === 'active').length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {mentorships.map(m => (
                  <div key={m.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">{getFacultyName(m.facultyId)[0]}</div>
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">{getStudentName(m.studentId)[0]}</div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-bold text-slate-900">{getFacultyName(m.facultyId)} → {getStudentName(m.studentId)}</p>
                      <div className="flex items-center gap-2"><StatusBadge status={m.status} /><span className="px-2 py-0.5 bg-slate-50 rounded-lg text-[7px] font-black uppercase text-slate-500">{m.type}</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2.5 bg-slate-50 rounded-xl text-center"><p className="text-sm font-bold">{m.meetingCount}</p><p className="text-[8px] font-black uppercase text-slate-400">Meetings</p></div>
                      <div className="p-2.5 bg-slate-50 rounded-xl text-center"><p className="text-sm font-bold">{m.nextMeetingDate || 'N/A'}</p><p className="text-[8px] font-black uppercase text-slate-400">Next</p></div>
                    </div>
                    {m.guidanceNotes && <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-50 line-clamp-2">{m.guidanceNotes}</p>}
                  </div>
                ))}
                {mentorships.length === 0 && <div className="col-span-full py-16 border-4 border-dashed border-slate-100 rounded-[2.5rem] text-center"><Users className="w-12 h-12 text-slate-200 mx-auto mb-3" /><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">No mentorships assigned</p></div>}
              </div>
            </div>
            {/* Reflections */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><BookMarked className="w-4 h-4 text-purple-600" /> Reflective Learning Journals ({reflections.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {reflections.map(r => (
                  <div key={r.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div><StatusBadge status={r.status} /><span className="px-2 py-0.5 bg-slate-50 rounded-lg text-[7px] font-black uppercase text-slate-500 ml-2">{r.type.replace('_', ' ')}</span></div>
                      {canEdit && r.status === 'submitted' && <button onClick={() => { const fb = prompt('Enter teacher feedback:'); if (fb) addFeedbackToReflection(r.id!, fb); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"><MessageSquare className="w-3.5 h-3.5" /></button>}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{r.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-3 mb-3">{r.content}</p>
                    {r.scriptureReferenced && <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-lg text-[7px] font-black">{r.scriptureReferenced}</span>}
                    {r.teacherFeedback && (
                      <div className="mt-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                        <p className="text-[8px] font-black uppercase text-emerald-600 mb-1">Teacher Feedback</p>
                        <p className="text-xs text-slate-700">{r.teacherFeedback}</p>
                      </div>
                    )}
                    <div className="mt-4 pt-3 border-t border-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400">{getStudentName(r.studentId)}</div>
                  </div>
                ))}
                {reflections.length === 0 && <div className="col-span-full py-16 border-4 border-dashed border-slate-100 rounded-[2.5rem] text-center"><BookMarked className="w-12 h-12 text-slate-200 mx-auto mb-3" /><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">No reflections yet</p></div>}
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB: REPORTS ═══ */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div><h2 className="text-2xl font-bold text-slate-900">Pedagogical Reports</h2><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Analytics, AI Insights & Adaptive Teaching</p></div>
              <button onClick={() => { setReportForm({ type: 'teaching_quality', facultyId: '', courseId: '', period: new Date().toISOString().split('T')[0].slice(0, 7) }); openDrawer('report'); }} className="px-5 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Generate Report</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {reports.map(r => (
                <div key={r.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3"><span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase">{r.type.replace('_', ' ')}</span><span className="text-[9px] text-slate-400">{r.period}</span></div>
                    {r.facultyId && <span className="text-[9px] font-black text-slate-500">{getFacultyName(r.facultyId)}</span>}
                  </div>
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {r.metrics && Object.entries(r.metrics).map(([key, val]) => {
                      const labels: Record<string, string> = { teachingScore: 'Teaching Score', clarityIndex: 'Clarity Index', studentSatisfaction: 'Satisfaction', avgEngagement: 'Avg Engagement', attendanceRate: 'Attendance', spiritualGrowthIndex: 'Spiritual Growth', assignmentCompletionRate: 'Assignment Completion' };
                      const colors = ['text-blue-600', 'text-emerald-600', 'text-amber-600', 'text-rose-600', 'text-blue-600', 'text-purple-600', 'text-teal-600'];
                      const idx = Object.keys(r.metrics || {}).indexOf(key);
                      return (
                        <div key={key} className="p-3 bg-slate-50 rounded-xl text-center">
                          <p className={cn('text-xl font-bold', colors[idx % colors.length])}>{val}%</p>
                          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{labels[key] || key}</p>
                        </div>
                      );
                    })}
                  </div>
                  {/* AI Suggestions */}
                  {r.aiSuggestions && r.aiSuggestions.length > 0 && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
                      <p className="text-[9px] font-black uppercase text-amber-600 mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Teaching Assistant Suggestions</p>
                      <ul className="space-y-1.5">{r.aiSuggestions.map((s, i) => <li key={i} className="text-xs text-slate-700 flex items-start gap-2"><ArrowRight className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" /><span>{s}</span></li>)}</ul>
                    </div>
                  )}
                  {/* Recommendations */}
                  {r.recommendations && r.recommendations.length > 0 && (
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[9px] font-black uppercase text-slate-500 mb-2">Recommendations</p>
                      <ul className="space-y-1.5">{r.recommendations.map((rec, i) => <li key={i} className="text-xs text-slate-600 flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" /><span>{rec}</span></li>)}</ul>
                    </div>
                  )}
                </div>
              ))}
              {reports.length === 0 && (
                <div className="col-span-full py-20 border-4 border-dashed border-slate-100 rounded-[2.5rem] text-center">
                  <BarChart3 className="w-12 h-12 text-slate-200 mx-auto mb-3" /><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-2">No reports generated yet</p>
                  <p className="text-xs text-slate-400">Click "Generate Report" to create your first pedagogical analysis</p>
                </div>
              )}
            </div>
            {/* Adaptive Teaching Insight */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-[2.5rem] p-8 text-white">
              <div className="flex items-center gap-3 mb-4"><Brain className="w-6 h-6 text-indigo-300" /><h3 className="text-lg font-bold">Adaptive Teaching Engine</h3></div>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">The system analyzes engagement data to suggest optimal teaching methods and identify students who need additional support. Based on current data, here are the key insights:</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { title: 'Best Method', value: engagementLogs.length > 0 ? (() => { const byType: Record<string, number> = {}; engagementLogs.forEach(e => { byType[e.type] = (byType[e.type] || 0) + e.score; }); const best = Object.entries(byType).sort((a, b) => b[1] - a[1])[0]; return best ? best[0].replace('_', ' ') : 'N/A'; })() : 'N/A', sub: 'Highest engagement' },
                  { title: 'Weakest Area', value: 'Field Application', sub: 'Needs more focus' },
                  { title: 'Growth Trend', value: engagementLogs.length >= 2 ? (engagementLogs.slice(-5).reduce((s, e) => s + e.score, 0) > engagementLogs.slice(-10, -5).reduce((s, e) => s + e.score, 0) ? 'Improving' : 'Declining') : 'N/A', sub: 'Last 5 vs previous 5' },
                ].map((insight, i) => (
                  <div key={i} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                    <p className="text-[9px] font-black uppercase text-indigo-300">{insight.sub}</p>
                    <p className="text-xl font-bold mt-1">{insight.value}</p>
                    <p className="text-[8px] uppercase text-slate-400 mt-1">{insight.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
