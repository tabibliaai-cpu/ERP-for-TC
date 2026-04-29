import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  GraduationCap, BookOpen, LayoutGrid, Puzzle, Award, Users, GitBranch,
  Plus, Search, X, Save, Trash2, ChevronRight, Copy, Clock, CreditCard,
  Layers, ArrowRight, Eye, Pencil, ChevronDown, Check, AlertCircle,
  BookMarked, ToggleLeft, ToggleRight, CalendarDays, Star, Hash, Tag,
  Briefcase, BarChart3, ArrowUpDown, Filter, MoreHorizontal,
  Globe, Share2, Sparkles, AlertTriangle, Lock, Download, Zap, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import {
  academicProgramService, curriculumMapService, academicCourseService,
  electiveGroupService, gradingConfigService, programVersionService,
  facultyService, teachingAssignmentService,
  type AcademicProgram, type CurriculumMap, type AcademicCourse,
  type ElectiveGroup, type GradingConfig, type ProgramVersion,
  type CurriculumSemester, type GradeMapping, type Faculty,
  type TeachingAssignment
} from '../services/dataService';
import { useAuthStore } from '../store/useStore';
import { geminiService } from '../services/geminiService';

// ─── Constants ──────────────────────────────────────────────
const TABS = [
  { id: 'programs', label: 'Programs', sub: 'Program Builder', icon: GraduationCap },
  { id: 'courses', label: 'Courses', sub: 'Course Builder', icon: BookOpen },
  { id: 'curriculum', label: 'Curriculum', sub: 'Curriculum Designer', icon: LayoutGrid },
  { id: 'electives', label: 'Electives', sub: 'Elective Selection', icon: Puzzle },
  { id: 'grading', label: 'Grading', sub: 'Credits & Grades', icon: Award },
  { id: 'assignments', label: 'Assignments', sub: 'Course Assignment', icon: Users },
  { id: 'versions', label: 'Versions', sub: 'Version Control', icon: GitBranch },
  { id: 'marketplace', label: 'Marketplace', sub: 'Course Marketplace', icon: Globe },
] as const;

const DEFAULT_GRADE_MAPPINGS: GradeMapping[] = [
  { grade: 'A+', minMarks: 95, maxMarks: 100, gradePoints: 4.0 },
  { grade: 'A', minMarks: 90, maxMarks: 94, gradePoints: 4.0 },
  { grade: 'B+', minMarks: 85, maxMarks: 89, gradePoints: 3.5 },
  { grade: 'B', minMarks: 80, maxMarks: 84, gradePoints: 3.0 },
  { grade: 'C+', minMarks: 75, maxMarks: 79, gradePoints: 2.5 },
  { grade: 'C', minMarks: 70, maxMarks: 74, gradePoints: 2.0 },
  { grade: 'D', minMarks: 60, maxMarks: 69, gradePoints: 1.0 },
  { grade: 'F', minMarks: 0, maxMarks: 59, gradePoints: 0.0 },
];

const LEVEL_OPTIONS = ['Undergraduate', 'Postgraduate', 'Certificate', 'Diploma', 'Doctorate'] as const;
const CREDIT_SYSTEMS = ['mandatory', 'optional'] as const;
const GRADING_SYSTEMS = ['marks', 'gpa', 'cgpa'] as const;
const PATTERNS = ['semester', 'yearly', 'trimester', 'modular'] as const;
const STATUS_OPTIONS = ['active', 'archived', 'draft'] as const;
const COURSE_TYPES = ['core', 'elective', 'optional'] as const;

// ─── Component ──────────────────────────────────────────────
export default function AcademicConfig() {
  const { user } = useAuthStore();
  const tenantId = user?.tenantId || '';

  // Data states
  const [programs, setPrograms] = useState<AcademicProgram[]>([]);
  const [courses, setCourses] = useState<AcademicCourse[]>([]);
  const [curriculums, setCurriculums] = useState<CurriculumMap[]>([]);
  const [electives, setElectives] = useState<ElectiveGroup[]>([]);
  const [gradingConfigs, setGradingConfigs] = useState<GradingConfig[]>([]);
  const [versions, setVersions] = useState<ProgramVersion[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [assignments, setAssignments] = useState<TeachingAssignment[]>([]);

  // UI states
  const [activeTab, setActiveTab] = useState('programs');
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [drawerType, setDrawerType] = useState<string>('program');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumMap | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [addCourseSemesterIdx, setAddCourseSemesterIdx] = useState<number | null>(null);

  // ─── AI & Advanced States ─────────────────────────────
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState('');
  const [depWarnings, setDepWarnings] = useState<{ courseId: string; warnings: string[] }[]>([]);

  // ─── Permission Helpers ───────────────────────────────
  const isSuperAdmin = user?.role === 'super_admin';
  const isInstitutionAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'faculty';
  const canEdit = isSuperAdmin || isInstitutionAdmin;
  const canSuggest = isTeacher;

  // ─── Dependency Engine ────────────────────────────────
  const validateDependencies = useCallback(() => {
    const warnings: { courseId: string; warnings: string[] }[] = [];
    courses.forEach((course) => {
      const courseWarnings: string[] = [];
      if (course.prerequisites && course.prerequisites.length > 0) {
        course.prerequisites.forEach((preqId) => {
          const preqCourse = courses.find((c) => c.id === preqId);
          if (!preqCourse) {
            courseWarnings.push(`Prerequisite course not found (ID: ${preqId.slice(0, 8)})`);
          } else if (preqCourse.prerequisites?.includes(course.id!)) {
            courseWarnings.push(`Circular dependency detected with ${preqCourse.name}`);
          } else if (preqCourse.level && course.level && preqCourse.level >= course.level) {
            courseWarnings.push(`Prerequisite ${preqCourse.name} is same or higher level`);
          }
        });
      }
      if (courseWarnings.length > 0) {
        warnings.push({ courseId: course.id!, warnings: courseWarnings });
      }
    });
    setDepWarnings(warnings);
  }, [courses]);

  useEffect(() => { validateDependencies(); }, [validateDependencies]);

  // ─── AI Curriculum Generator ──────────────────────────
  const handleAIGenerateCurriculum = async () => {
    const prog = programs.find((p) => p.id === selectedProgramId);
    if (!prog) return;
    setIsGeneratingAI(true);
    setAiStatusMessage('Generating curriculum with AI...');
    try {
      const semesters = await geminiService.generateFullCurriculum(
        prog.name, prog.code, prog.durationSemesters, prog.department || 'Theology'
      );
      const curriculumSemesters: CurriculumSemester[] = semesters.map((sem) => ({
        semesterNumber: sem.semesterNumber,
        semesterName: `Semester ${sem.semesterNumber}`,
        courseIds: [],
        totalCredits: sem.courses.reduce((s, c) => s + c.credits, 0),
      }));
      // Auto-create courses that don't exist
      const newCourses: string[] = [];
      for (const sem of semesters) {
        for (const c of sem.courses) {
          const exists = courses.find((existing) => existing.code === c.code);
          if (!exists) {
            const added = await academicCourseService.addCourse({
              name: c.name, code: c.code, department: prog.department || 'Theology',
              credits: c.credits, courseType: (c.type as any) || 'core', level: sem.semesterNumber,
              status: 'draft', tenantId, version: 1,
              syllabusUrl: '', videoResources: [], readingMaterials: [],
              isMasterCourse: false, sharedWithTenants: [],
            });
            newCourses.push(added.id);
          }
        }
      }
      await loadData();
      // Now set curriculum form with the generated semesters (course IDs will be matched after reload)
      setCurriculumForm({
        programId: prog.id, academicYear: new Date().getFullYear().toString(),
        batch: '', version: 1, status: 'draft', semesters: curriculumSemesters,
      });
      setAiStatusMessage(`AI generated ${semesters.length} semesters with ${semesters.reduce((s, sem) => s + sem.courses.length, 0)} courses. ${newCourses.length} new courses created.`);
    } catch (err) {
      console.error('AI Curriculum Generation failed:', err);
      setAiStatusMessage('AI generation failed. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAISuggestCourses = async () => {
    const prog = programs.find((p) => p.id === selectedProgramId);
    if (!prog) return;
    setIsGeneratingAI(true);
    setAiStatusMessage('AI is analyzing your program and suggesting courses...');
    try {
      const existingNames = courses.map((c) => c.name);
      const suggestions = await geminiService.suggestCourses(
        prog.name, prog.department || 'Theology', existingNames
      );
      setAiSuggestions(suggestions);
      setShowAiSuggestions(true);
      setAiStatusMessage(`AI suggested ${suggestions.length} complementary courses.`);
    } catch (err) {
      console.error('AI Suggestion failed:', err);
      setAiStatusMessage('AI suggestion failed. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleImportAISuggestion = async (suggestion: any) => {
    try {
      await academicCourseService.addCourse({
        name: suggestion.name, code: suggestion.code, department: '',
        credits: suggestion.credits, courseType: (suggestion.type as any) || 'elective',
        level: 1, status: 'draft', tenantId, version: 1,
        syllabusUrl: '', videoResources: [], readingMaterials: [],
        isMasterCourse: false, sharedWithTenants: [],
      });
      setAiSuggestions((prev) => prev.filter((s) => s.code !== suggestion.code));
      await loadData();
    } catch (err) {
      console.error('Failed to import AI suggestion:', err);
    }
  };

  // ─── Multi-Institution Share Handler ──────────────────
  const handleToggleMasterProgram = (value: boolean) => {
    setProgramForm((f) => ({ ...f, isMasterProgram: value }));
  };
  const handleToggleMasterCourse = (value: boolean) => {
    setCourseForm((f) => ({ ...f, isMasterCourse: value }));
  };

  // ─── Load Data ─────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    const val = <T,>(r: PromiseSettledResult<T>): T =>
      r.status === 'fulfilled' ? r.value : ([] as unknown as T);
    try {
      const results = await Promise.allSettled([
        academicProgramService.getByTenant(tenantId),
        academicCourseService.getByTenant(tenantId),
        curriculumMapService.getByTenant(tenantId),
        electiveGroupService.getByTenant(tenantId),
        gradingConfigService.getByTenant(tenantId),
        programVersionService.getByTenant(tenantId),
        facultyService.getFacultyByTenant(tenantId),
        teachingAssignmentService.getByTenant(tenantId),
      ]);
      setPrograms(val(results[0]));
      setCourses(val(results[1]));
      setCurriculums(val(results[2]));
      setElectives(val(results[3]));
      setGradingConfigs(val(results[4]));
      setVersions(val(results[5]));
      setFaculty(val(results[6]));
      setAssignments(val(results[7]));
    } catch (err) {
      console.error('Failed to load academic config data:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Helpers ───────────────────────────────────────────
  const openDrawer = (type: string, item?: any) => {
    setDrawerType(type);
    setEditingItem(item || null);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingItem(null);
    setDrawerType('program');
    setAddCourseSemesterIdx(null);
  };

  const getCourseName = (id: string) =>
    courses.find((c) => c.id === id)?.name || id;
  const getCourseCredits = (id: string) =>
    courses.find((c) => c.id === id)?.credits || 0;
  const getFacultyName = (id: string) =>
    faculty.find((f) => f.id === id)?.name || id;
  const getProgramName = (id: string) =>
    programs.find((p) => p.id === id)?.name || id;

  const totalCredits = useMemo(
    () => courses.reduce((s, c) => s + c.credits, 0),
    [courses]
  );

  // ─── Program Form State ────────────────────────────────
  const [programForm, setProgramForm] = useState({
    name: '', code: '', level: 'Undergraduate' as AcademicProgram['level'],
    department: '', durationYears: 3, durationSemesters: 6, totalCredits: 120,
    creditSystem: 'mandatory' as AcademicProgram['creditSystem'],
    gradingSystem: 'gpa' as AcademicProgram['gradingSystem'],
    pattern: 'semester' as AcademicProgram['pattern'],
    description: '', enableMinistryPracticum: false, enableInternship: false,
    enableThesis: false, status: 'draft' as AcademicProgram['status'],
  });

  const resetProgramForm = () =>
    setProgramForm({
      name: '', code: '', level: 'Undergraduate', department: '',
      durationYears: 3, durationSemesters: 6, totalCredits: 120,
      creditSystem: 'mandatory', gradingSystem: 'gpa', pattern: 'semester',
      description: '', enableMinistryPracticum: false, enableInternship: false,
      enableThesis: false, status: 'draft',
    });

  const fillProgramForm = (p: AcademicProgram) =>
    setProgramForm({
      name: p.name, code: p.code, level: p.level, department: p.department || '',
      durationYears: p.durationYears, durationSemesters: p.durationSemesters,
      totalCredits: p.totalCredits, creditSystem: p.creditSystem,
      gradingSystem: p.gradingSystem, pattern: p.pattern,
      description: p.description || '', enableMinistryPracticum: p.enableMinistryPracticum,
      enableInternship: p.enableInternship, enableThesis: p.enableThesis,
      status: p.status,
    });

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data: AcademicProgram = {
        ...programForm, tenantId, version: editingItem?.version || 1,
        effectiveFrom: new Date().toISOString(),
        isMasterProgram: (programForm as any).isMasterProgram || false,
        sharedWithTenants: editingItem?.sharedWithTenants || [],
      };
      if (editingItem?.id) {
        await academicProgramService.update(editingItem.id, data);
      } else {
        await academicProgramService.addProgram(data);
      }
      await loadData();
      closeDrawer();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm('Delete this program permanently?')) return;
    try { await academicProgramService.delete(id); await loadData(); } catch (err) { console.error(err); }
  };

  // ─── Course Form State ─────────────────────────────────
  const [courseForm, setCourseForm] = useState({
    name: '', code: '', department: '', credits: 3,
    courseType: 'core' as AcademicCourse['courseType'],
    level: 1, description: '', syllabus: '',
    status: 'draft' as AcademicCourse['status'],
    prerequisites: [] as string[],
  });

  const resetCourseForm = () =>
    setCourseForm({
      name: '', code: '', department: '', credits: 3,
      courseType: 'core', level: 1, description: '', syllabus: '',
      status: 'draft', prerequisites: [],
    });

  const fillCourseForm = (c: AcademicCourse) =>
    setCourseForm({
      name: c.name, code: c.code, department: c.department || '',
      credits: c.credits, courseType: c.courseType, level: c.level || 1,
      description: c.description || '', syllabus: c.syllabus || '',
      status: c.status, prerequisites: c.prerequisites || [],
    });

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data: AcademicCourse = {
        ...courseForm, tenantId, version: editingItem?.version || 1,
        syllabusUrl: '', videoResources: [], readingMaterials: [],
        isMasterCourse: (courseForm as any).isMasterCourse || false,
        sharedWithTenants: editingItem?.sharedWithTenants || [],
      };
      if (editingItem?.id) {
        await academicCourseService.update(editingItem.id, data);
      } else {
        await academicCourseService.addCourse(data);
      }
      await loadData();
      closeDrawer();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Delete this course permanently?')) return;
    try { await academicCourseService.delete(id); await loadData(); } catch (err) { console.error(err); }
  };

  const togglePrerequisite = (cid: string) => {
    setCourseForm((f) => ({
      ...f,
      prerequisites: f.prerequisites.includes(cid)
        ? f.prerequisites.filter((x) => x !== cid)
        : [...f.prerequisites, cid],
    }));
  };

  // ─── Curriculum Form State ─────────────────────────────
  const [curriculumForm, setCurriculumForm] = useState({
    programId: '', academicYear: '', batch: '', version: 1,
    status: 'draft' as CurriculumMap['status'],
    semesters: [] as CurriculumSemester[],
  });

  const handleSaveCurriculum = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data: CurriculumMap = {
        ...curriculumForm, tenantId,
        programName: getProgramName(curriculumForm.programId),
        totalCredits: curriculumForm.semesters.reduce((s, sem) => s + sem.totalCredits, 0),
      };
      if (editingItem?.id) {
        await curriculumMapService.update(editingItem.id, data);
      } else {
        await curriculumMapService.addCurriculum(data);
      }
      await loadData();
      closeDrawer();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleCloneCurriculum = async (curriculum: CurriculumMap) => {
    if (!confirm(`Clone "${curriculum.programName}" curriculum for a new batch?`)) return;
    setSubmitting(true);
    try {
      const batch = prompt('Enter new batch name:');
      if (!batch) return;
      await curriculumMapService.addCurriculum({
        ...curriculum, id: undefined,
        batch, status: 'draft',
        clonedFrom: curriculum.id,
        version: curriculum.version + 1,
        createdAt: undefined, updatedAt: undefined,
      });
      await loadData();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleAddCourseToSemester = (semesterIdx: number, courseId: string) => {
    setCurriculumForm((f) => {
      const semesters = [...f.semesters];
      const sem = { ...semesters[semesterIdx] };
      if (sem.courseIds.includes(courseId)) return f;
      sem.courseIds = [...sem.courseIds, courseId];
      sem.totalCredits = sem.courseIds.reduce((s, c) => s + getCourseCredits(c), 0) + getCourseCredits(courseId);
      semesters[semesterIdx] = sem;
      return { ...f, semesters };
    });
  };

  const handleRemoveCourseFromSemester = (semesterIdx: number, courseId: string) => {
    setCurriculumForm((f) => {
      const semesters = [...f.semesters];
      const sem = { ...semesters[semesterIdx] };
      sem.courseIds = sem.courseIds.filter((c) => c !== courseId);
      sem.totalCredits = sem.courseIds.reduce((s, c) => s + getCourseCredits(c), 0);
      semesters[semesterIdx] = sem;
      return { ...f, semesters };
    });
  };

  const handleInitCurriculumSemesters = (numSemesters: number) => {
    const semesters: CurriculumSemester[] = Array.from({ length: numSemesters }, (_, i) => ({
      semesterNumber: i + 1,
      semesterName: `Semester ${i + 1}`,
      courseIds: [],
      totalCredits: 0,
    }));
    setCurriculumForm((f) => ({ ...f, semesters }));
  };

  // ─── Elective Form State ───────────────────────────────
  const [electiveForm, setElectiveForm] = useState({
    name: '', code: '', programId: '', semester: 1,
    minElectives: 1, maxElectives: 2, eligibilityCriteria: '',
    courseIds: [] as string[], status: 'draft' as ElectiveGroup['status'],
  });

  const resetElectiveForm = () =>
    setElectiveForm({
      name: '', code: '', programId: '', semester: 1,
      minElectives: 1, maxElectives: 2, eligibilityCriteria: '',
      courseIds: [], status: 'draft',
    });

  const fillElectiveForm = (g: ElectiveGroup) =>
    setElectiveForm({
      name: g.name, code: g.code || '', programId: g.programId || '',
      semester: g.semester || 1, minElectives: g.minElectives,
      maxElectives: g.maxElectives, eligibilityCriteria: g.eligibilityCriteria || '',
      courseIds: g.courseIds || [], status: g.status,
    });

  const handleSaveElective = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data: ElectiveGroup = { ...electiveForm, tenantId };
      if (editingItem?.id) {
        await electiveGroupService.update(editingItem.id, data);
      } else {
        await electiveGroupService.addGroup(data);
      }
      await loadData();
      closeDrawer();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleDeleteElective = async (id: string) => {
    if (!confirm('Delete this elective group?')) return;
    try { await electiveGroupService.delete(id); await loadData(); } catch (err) { console.error(err); }
  };

  const toggleElectiveCourse = (cid: string) => {
    setElectiveForm((f) => ({
      ...f,
      courseIds: f.courseIds.includes(cid) ? f.courseIds.filter((x) => x !== cid) : [...f.courseIds, cid],
    }));
  };

  // ─── Grading Form State ────────────────────────────────
  const [gradingForm, setGradingForm] = useState({
    name: '', type: 'gpa' as GradingConfig['type'], maxMarks: 100,
    passingMarks: 40, creditSystem: 'mandatory' as GradingConfig['creditSystem'],
    creditsPerSubject: 3, isDefault: false, gradeMappings: [...DEFAULT_GRADE_MAPPINGS],
  });

  const resetGradingForm = () =>
    setGradingForm({
      name: '', type: 'gpa', maxMarks: 100, passingMarks: 40,
      creditSystem: 'mandatory', creditsPerSubject: 3, isDefault: false,
      gradeMappings: [...DEFAULT_GRADE_MAPPINGS],
    });

  const fillGradingForm = (g: GradingConfig) =>
    setGradingForm({
      name: g.name, type: g.type, maxMarks: g.maxMarks, passingMarks: g.passingMarks,
      creditSystem: g.creditSystem, creditsPerSubject: g.creditsPerSubject || 3,
      isDefault: g.isDefault, gradeMappings: g.gradeMappings?.length ? g.gradeMappings : [...DEFAULT_GRADE_MAPPINGS],
    });

  const handleSaveGrading = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data: GradingConfig = { ...gradingForm, tenantId };
      if (editingItem?.id) {
        await gradingConfigService.update(editingItem.id, data);
      } else {
        await gradingConfigService.addConfig(data);
      }
      await loadData();
      closeDrawer();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleDeleteGrading = async (id: string) => {
    if (!confirm('Delete this grading configuration?')) return;
    try { await gradingConfigService.delete(id); await loadData(); } catch (err) { console.error(err); }
  };

  const addGradeMappingRow = () =>
    setGradingForm((f) => ({
      ...f,
      gradeMappings: [...f.gradeMappings, { grade: '', minMarks: 0, maxMarks: 0, gradePoints: 0 }],
    }));

  const removeGradeMappingRow = (idx: number) =>
    setGradingForm((f) => ({ ...f, gradeMappings: f.gradeMappings.filter((_, i) => i !== idx) }));

  const updateGradeMapping = (idx: number, field: keyof GradeMapping, value: any) =>
    setGradingForm((f) => {
      const rows = [...f.gradeMappings];
      rows[idx] = { ...rows[idx], [field]: value };
      return { ...f, gradeMappings: rows };
    });

  // ─── Assignment Form State ─────────────────────────────
  const [assignmentForm, setAssignmentForm] = useState({
    facultyId: '', courseId: '', subjectId: '', subjectName: '',
    subjectCode: '', batch: '', classType: 'Lecture' as TeachingAssignment['classType'],
    mode: 'Offline' as TeachingAssignment['mode'],
    weeklyHours: 3, lectureHours: 3, semester: '', academicYear: '',
    status: 'active' as TeachingAssignment['status'],
  });

  const resetAssignmentForm = () =>
    setAssignmentForm({
      facultyId: '', courseId: '', subjectId: '', subjectName: '',
      subjectCode: '', batch: '', classType: 'Lecture',
      mode: 'Offline', weeklyHours: 3, lectureHours: 3,
      semester: '', academicYear: '', status: 'active',
    });

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data: TeachingAssignment = { ...assignmentForm, tenantId };
      await teachingAssignmentService.addAssignment(data);
      await loadData();
      closeDrawer();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  // ─── Version Form State ────────────────────────────────
  const [versionForm, setVersionForm] = useState({
    programId: '', version: 1, effectiveFrom: '', effectiveBatch: '', changes: '',
    status: 'draft' as ProgramVersion['status'],
  });

  const resetVersionForm = () =>
    setVersionForm({
      programId: '', version: 1, effectiveFrom: '', effectiveBatch: '',
      changes: '', status: 'draft',
    });

  const handleSaveVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const existingVersions = versions.filter((v) => v.programId === versionForm.programId);
      const nextVersion = existingVersions.length > 0
        ? Math.max(...existingVersions.map((v) => v.version)) + 1
        : 1;
      const data: ProgramVersion = {
        ...versionForm, version: nextVersion,
        programName: getProgramName(versionForm.programId),
        tenantId, curriculumSnapshot: [],
      };
      await programVersionService.addVersion(data);
      await loadData();
      closeDrawer();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  // ─── Status Badge ──────────────────────────────────────
  const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
      active: 'bg-emerald-50 text-emerald-600',
      archived: 'bg-slate-100 text-slate-500',
      draft: 'bg-amber-50 text-amber-600',
      superseded: 'bg-rose-50 text-rose-500',
      completed: 'bg-blue-50 text-blue-500',
      cancelled: 'bg-red-50 text-red-500',
      pending: 'bg-yellow-50 text-yellow-600',
    };
    return (
      <span className={cn('px-2.5 py-1 rounded-lg text-xs font-medium tracking-wide uppercase', map[status] || 'bg-slate-100 text-slate-500')}>
        {status}
      </span>
    );
  };

  // ─── Loading ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-xs font-medium uppercase  text-slate-400">Loading Configuration System...</p>
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-[1600px] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wide">
            <GraduationCap className="w-4 h-4" />
            <span>Academic Setup</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900">Configuration System</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              {user?.name || 'Administrator'}
            </span>
            <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-bold">
              {(user?.name || 'A')[0]}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 mt-8 space-y-6">
        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Programs', value: programs.length, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active Courses', value: courses.filter((c) => c.status === 'active').length, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Total Credits', value: totalCredits, icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Curriculum Maps', value: curriculums.length, icon: LayoutGrid, color: 'text-rose-600', bg: 'bg-rose-50' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', s.bg)}>
                <s.icon className={cn('w-5 h-5', s.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs font-medium uppercase  text-slate-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tab Navigation ── */}
        <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                  className={cn(
                    'flex items-center gap-2.5 px-5 py-3 rounded-lg text-xs font-medium uppercase  transition-all whitespace-nowrap',
                    activeTab === tab.id
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            TAB 1: PROGRAMS
        ═══════════════════════════════════════════════════ */}
        {activeTab === 'programs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 font-display">Program Builder</h2>
                <p className="text-xs font-medium uppercase  text-slate-400 mt-1">
                  Manage degree & certificate programs
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="text" placeholder="Search programs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64"
                  />
                </div>
                <button
                  onClick={() => { resetProgramForm(); openDrawer('program'); }}
                  disabled={!canEdit}
                  className="px-5 py-3 bg-slate-900 text-white rounded-lg text-xs font-medium uppercase tracking-wide hover:bg-slate-700 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" /> {canEdit ? 'Create Program' : (canSuggest ? 'Suggest Program' : 'View Only')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {programs
                .filter((p) =>
                  !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((p) => (
                  <div key={p.id} className="bg-white rounded-lg border border-slate-100 shadow-sm p-6 hover:shadow-sm hover:border-blue-200 transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium tracking-wide uppercase">
                          {p.level}
                        </span>
                        <StatusBadge status={p.status} />
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { fillProgramForm(p); openDrawer('program', p); }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProgram(p.id!)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{p.name}</h3>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-4">{p.code}</p>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-2.5 bg-slate-50 rounded-lg">
                        <p className="text-sm font-bold text-slate-900">{p.durationYears}Y</p>
                        <p className="text-xs font-medium uppercase text-slate-400">Duration</p>
                      </div>
                      <div className="text-center p-2.5 bg-slate-50 rounded-lg">
                        <p className="text-sm font-bold text-slate-900">{p.totalCredits}</p>
                        <p className="text-xs font-medium uppercase text-slate-400">Credits</p>
                      </div>
                      <div className="text-center p-2.5 bg-slate-50 rounded-lg">
                        <p className="text-sm font-bold text-slate-900">{p.durationSemesters}S</p>
                        <p className="text-xs font-medium uppercase text-slate-400">Pattern</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {p.enableMinistryPracticum && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[7px] font-black uppercase tracking-wide">Practicum</span>
                      )}
                      {p.enableInternship && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[7px] font-black uppercase tracking-wide">Internship</span>
                      )}
                      {p.enableThesis && (
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[7px] font-black uppercase tracking-wide">Thesis</span>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {p.isMasterProgram && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[7px] font-black uppercase tracking-wide flex items-center gap-1">
                            <Globe className="w-2.5 h-2.5" /> Shared
                          </span>
                        )}
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{p.creditSystem} credits &middot; {p.gradingSystem}</span>
                      </div>
                      <span className="text-xs font-medium text-blue-500">v{p.version}</span>
                    </div>
                  </div>
                ))}

              {programs.filter((p) =>
                !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 && (
                <div className="col-span-full flex items-center justify-center py-20 border-4 border-dashed border-slate-100 rounded-lg">
                  <div className="text-center">
                    <GraduationCap className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-xs font-medium uppercase  text-slate-300">No programs configured yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            TAB 2: COURSES
        ═══════════════════════════════════════════════════ */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 font-display">Course Builder</h2>
                <p className="text-xs font-medium uppercase  text-slate-400 mt-1">
                  Design and manage academic courses
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="text" placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64"
                  />
                </div>
                <button
                  onClick={() => { resetCourseForm(); openDrawer('course'); }}
                  className="px-5 py-3 bg-slate-900 text-white rounded-lg text-xs font-medium uppercase tracking-wide hover:bg-slate-700 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Create Course
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {courses
                .filter((c) =>
                  !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((c) => (
                  <div key={c.id} className="bg-white rounded-lg border border-slate-100 shadow-sm p-6 hover:shadow-sm hover:border-blue-200 transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-4">
                      <span className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-medium tracking-wide uppercase',
                        c.courseType === 'core' ? 'bg-blue-50 text-blue-600' :
                        c.courseType === 'elective' ? 'bg-amber-50 text-amber-600' :
                        'bg-slate-100 text-slate-500'
                      )}>
                        {c.courseType}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { fillCourseForm(c); openDrawer('course', c); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteCourse(c.id!)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{c.name}</h3>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-4">{c.code}</p>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-2.5 bg-slate-50 rounded-lg">
                        <p className="text-sm font-bold text-slate-900">{c.credits}</p>
                        <p className="text-xs font-medium uppercase text-slate-400">Credits</p>
                      </div>
                      <div className="text-center p-2.5 bg-slate-50 rounded-lg">
                        <p className="text-sm font-bold text-slate-900">L{c.level || 1}</p>
                        <p className="text-xs font-medium uppercase text-slate-400">Level</p>
                      </div>
                      <div className="text-center p-2.5 bg-slate-50 rounded-lg">
                        <p className="text-sm font-bold text-slate-900">{c.prerequisites?.length || 0}</p>
                        <p className="text-xs font-medium uppercase text-slate-400">Prereqs</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <StatusBadge status={c.status} />
                      <div className="flex items-center gap-2">
                        {depWarnings.find((dw) => dw.courseId === c.id) && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-lg text-[7px] font-black uppercase tracking-wide">
                            <AlertTriangle className="w-2.5 h-2.5" /> Dep Issue
                          </span>
                        )}
                        <span className="text-xs font-medium text-blue-500">v{c.version}</span>
                      </div>
                    </div>
                  </div>
                ))}

              {courses.filter((c) =>
                !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 && (
                <div className="col-span-full flex items-center justify-center py-20 border-4 border-dashed border-slate-100 rounded-lg">
                  <div className="text-center">
                    <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-xs font-medium uppercase  text-slate-300">No courses configured yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            TAB 3: CURRICULUM DESIGNER
        ═══════════════════════════════════════════════════ */}
        {activeTab === 'curriculum' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 font-display">Curriculum Designer</h2>
                <p className="text-xs font-medium uppercase  text-slate-400 mt-1">
                  Build semester-wise curriculum maps
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={selectedProgramId}
                  onChange={(e) => {
                    setSelectedProgramId(e.target.value);
                    setShowAiSuggestions(false);
                    setAiStatusMessage('');
                    const cur = curriculums.find((c) => c.programId === e.target.value && c.status === 'active');
                    setSelectedCurriculum(cur || null);
                    if (cur) {
                      setCurriculumForm({
                        programId: cur.programId, academicYear: cur.academicYear,
                        batch: cur.batch || '', version: cur.version, status: cur.status,
                        semesters: cur.semesters,
                      });
                    }
                  }}
                  className="px-5 py-3 bg-white border border-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer font-medium"
                >
                  <option value="">Select Program</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
                {canEdit && (
                  <button
                    onClick={handleAIGenerateCurriculum}
                    disabled={!selectedProgramId || isGeneratingAI}
                    className="px-5 py-3 bg-blue-600 text-white rounded-lg text-xs font-medium uppercase tracking-wide hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isGeneratingAI ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    AI Generate
                  </button>
                )}
                {canEdit && (
                  <button
                    onClick={handleAISuggestCourses}
                    disabled={!selectedProgramId || isGeneratingAI}
                    className="px-5 py-3 bg-white border border-blue-200 text-blue-600 rounded-lg text-xs font-medium uppercase tracking-wide hover:bg-blue-50 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-4 h-4" /> AI Suggest
                  </button>
                )}
                <button
                  onClick={() => {
                    const prog = programs.find((p) => p.id === selectedProgramId);
                    if (prog) {
                      handleInitCurriculumSemesters(prog.durationSemesters);
                      setCurriculumForm((f) => ({ ...f, programId: selectedProgramId, academicYear: new Date().getFullYear().toString() }));
                    }
                    openDrawer('curriculum');
                  }}
                  disabled={!selectedProgramId || !canEdit}
                  className="px-5 py-3 bg-slate-900 text-white rounded-lg text-xs font-medium uppercase tracking-wide hover:bg-slate-700 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" /> Create Curriculum
                </button>
              </div>

              {/* AI Status Banner */}
              {(aiStatusMessage || depWarnings.length > 0) && (
                <div className={cn(
                  "p-4 rounded-lg flex items-center gap-3 border",
                  depWarnings.length > 0 ? "bg-amber-50 border-amber-100" : "bg-blue-50 border-blue-200"
                )}>
                  {depWarnings.length > 0 ? <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" /> : <Sparkles className="w-5 h-5 text-blue-500 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900">{aiStatusMessage || `${depWarnings.length} dependency warnings detected`}</p>
                    {depWarnings.slice(0, 3).map((dw, i) => (
                      <p key={i} className="text-[10px] text-slate-600 truncate">
                        {getCourseName(dw.courseId)}: {dw.warnings[0]}
                      </p>
                    ))}
                  </div>
                  {showAiSuggestions && (
                    <button onClick={() => setShowAiSuggestions(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                  )}
                </div>
              )}

              {/* AI Suggestions Panel */}
              {showAiSuggestions && aiSuggestions.length > 0 && (
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-900">AI-Recommended Courses</h3>
                    </div>
                    <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium tracking-wide uppercase">{aiSuggestions.length} suggestions</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {aiSuggestions.map((s, idx) => (
                      <div key={idx} className="bg-white rounded-lg border border-slate-100 p-4 flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{s.name}</p>
                          <p className="text-xs font-medium uppercase text-slate-400">{s.code} &middot; {s.credits}cr &middot; {s.type}</p>
                          <p className="text-[9px] text-slate-500 mt-1 truncate">{s.rationale}</p>
                        </div>
                        <button
                          onClick={() => handleImportAISuggestion(s)}
                          disabled={!canEdit}
                          className="ml-3 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-700 hover:text-white transition-all disabled:opacity-40"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Existing Curriculum Maps */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {curriculums
                .filter((c) => !selectedProgramId || c.programId === selectedProgramId)
                .map((cur) => (
                  <div key={cur.id} className="bg-white rounded-lg border border-slate-100 shadow-sm p-6 hover:shadow-sm transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <StatusBadge status={cur.status} />
                        <span className="text-xs font-medium text-blue-500 ml-2">v{cur.version}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedCurriculum(cur);
                            setCurriculumForm({
                              programId: cur.programId, academicYear: cur.academicYear,
                              batch: cur.batch || '', version: cur.version, status: cur.status,
                              semesters: cur.semesters,
                            });
                            openDrawer('curriculum', cur);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCloneCurriculum(cur)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{cur.programName}</h3>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-4">
                      {cur.academicYear} &middot; Batch {cur.batch || 'N/A'} &middot; {cur.semesters.length} Semesters
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {cur.semesters.map((sem, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                          <span className="text-[10px] font-bold text-slate-600">{sem.semesterName}</span>
                          <span className="text-[10px] font-bold text-blue-600">{sem.courseIds.length} courses &middot; {sem.totalCredits} cr</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-50 text-right">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Total: {cur.totalCredits} credits</span>
                    </div>
                  </div>
                ))}

              {curriculums.filter((c) => !selectedProgramId || c.programId === selectedProgramId).length === 0 && (
                <div className="col-span-full flex items-center justify-center py-20 border-4 border-dashed border-slate-100 rounded-lg">
                  <div className="text-center">
                    <LayoutGrid className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-xs font-medium uppercase  text-slate-300">
                      {selectedProgramId ? 'No curricula for this program' : 'Select a program to view curricula'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            TAB 4: ELECTIVES
        ═══════════════════════════════════════════════════ */}
        {activeTab === 'electives' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 font-display">Elective Selection</h2>
                <p className="text-xs font-medium uppercase  text-slate-400 mt-1">
                  Configure elective groups and pools
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="text" placeholder="Search electives..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64"
                  />
                </div>
                <button
                  onClick={() => { resetElectiveForm(); openDrawer('elective'); }}
                  className="px-5 py-3 bg-slate-900 text-white rounded-lg text-xs font-medium uppercase tracking-wide hover:bg-slate-700 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Create Elective Group
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {electives
                .filter((e) =>
                  !searchQuery || e.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((e) => (
                  <div key={e.id} className="bg-white rounded-lg border border-slate-100 shadow-sm p-6 hover:shadow-sm hover:border-blue-200 transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-4">
                      <StatusBadge status={e.status} />
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { fillElectiveForm(e); openDrawer('elective', e); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteElective(e.id!)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{e.name}</h3>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-4">
                      {e.code || 'No Code'} &middot; {getProgramName(e.programId || '')} &middot; Sem {e.semester || '-'}
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="text-center p-2.5 bg-slate-50 rounded-lg">
                        <p className="text-sm font-bold text-slate-900">Min {e.minElectives}</p>
                        <p className="text-xs font-medium uppercase text-slate-400">Minimum</p>
                      </div>
                      <div className="text-center p-2.5 bg-slate-50 rounded-lg">
                        <p className="text-sm font-bold text-slate-900">Max {e.maxElectives}</p>
                        <p className="text-xs font-medium uppercase text-slate-400">Maximum</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {e.courseIds.slice(0, 4).map((cid, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[10px] text-slate-600">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                          {getCourseName(cid)}
                        </div>
                      ))}
                      {e.courseIds.length > 4 && (
                        <p className="text-xs font-medium text-blue-500 pl-3.5">+{e.courseIds.length - 4} more courses</p>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{e.courseIds.length} courses</span>
                      {e.eligibilityCriteria && (
                        <span className="text-xs font-medium uppercase tracking-wide text-amber-500">{e.eligibilityCriteria}</span>
                      )}
                    </div>
                  </div>
                ))}

              {electives.length === 0 && (
                <div className="col-span-full flex items-center justify-center py-20 border-4 border-dashed border-slate-100 rounded-lg">
                  <div className="text-center">
                    <Puzzle className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-xs font-medium uppercase  text-slate-300">No elective groups configured</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            TAB 5: GRADING
        ═══════════════════════════════════════════════════ */}
        {activeTab === 'grading' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 font-display">Credits & Grades</h2>
                <p className="text-xs font-medium uppercase  text-slate-400 mt-1">
                  Configure grading systems and credit structures
                </p>
              </div>
              <button
                onClick={() => { resetGradingForm(); openDrawer('grading'); }}
                className="px-5 py-3 bg-slate-900 text-white rounded-lg text-xs font-medium uppercase tracking-wide hover:bg-slate-700 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create Grading Config
              </button>
            </div>

            <div className="space-y-5">
              {gradingConfigs.map((gc) => (
                <div key={gc.id} className="bg-white rounded-lg border border-slate-100 shadow-sm p-6 hover:shadow-sm transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{gc.name}</h3>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          {gc.type} system &middot; {gc.creditSystem} credits
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {gc.isDefault && (
                        <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium tracking-wide uppercase">Default</span>
                      )}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { fillGradingForm(gc); openDrawer('grading', gc); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteGrading(gc.id!)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-3 bg-slate-50 rounded-lg text-center">
                      <p className="text-lg font-bold text-slate-900">{gc.maxMarks}</p>
                      <p className="text-xs font-medium uppercase text-slate-400">Max Marks</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg text-center">
                      <p className="text-lg font-bold text-slate-900">{gc.passingMarks}</p>
                      <p className="text-xs font-medium uppercase text-slate-400">Passing Marks</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg text-center">
                      <p className="text-lg font-bold text-slate-900">{gc.creditsPerSubject || '-'}</p>
                      <p className="text-xs font-medium uppercase text-slate-400">Credits/Subject</p>
                    </div>
                  </div>

                  {/* Grade Mapping Table */}
                  <div className="rounded-lg border border-slate-100 overflow-hidden">
                    <div className="grid grid-cols-4 bg-slate-50 px-4 py-2.5">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Grade</span>
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-400 text-center">Min</span>
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-400 text-center">Max</span>
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-400 text-right">Points</span>
                    </div>
                    {(gc.gradeMappings || []).map((gm, idx) => (
                      <div key={idx} className="grid grid-cols-4 px-4 py-2.5 border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <span className="text-sm font-bold text-slate-900">{gm.grade}</span>
                        <span className="text-sm text-slate-600 text-center">{gm.minMarks}</span>
                        <span className="text-sm text-slate-600 text-center">{gm.maxMarks}</span>
                        <span className="text-sm font-bold text-blue-600 text-right">{gm.gradePoints.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {gradingConfigs.length === 0 && (
                <div className="flex items-center justify-center py-20 border-4 border-dashed border-slate-100 rounded-lg">
                  <div className="text-center">
                    <Award className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-xs font-medium uppercase  text-slate-300">No grading configurations yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            TAB 6: ASSIGNMENTS
        ═══════════════════════════════════════════════════ */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 font-display">Course Assignment</h2>
                <p className="text-xs font-medium uppercase  text-slate-400 mt-1">
                  Smart course-to-faculty assignment system
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="text" placeholder="Search assignments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64"
                  />
                </div>
                <button
                  onClick={() => { resetAssignmentForm(); openDrawer('assignment'); }}
                  className="px-5 py-3 bg-slate-900 text-white rounded-lg text-xs font-medium uppercase tracking-wide hover:bg-slate-700 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Assign Course
                </button>
              </div>
            </div>

            {/* Two Panel Layout */}
            <div className="grid grid-cols-12 gap-6">
              {/* Left: Courses */}
              <div className="col-span-12 lg:col-span-4">
                <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Available Courses</h3>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-4">{courses.length} total</p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {courses.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{c.name}</p>
                          <p className="text-xs font-medium uppercase text-slate-400">{c.code} &middot; {c.credits}cr</p>
                        </div>
                        <StatusBadge status={c.status} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Faculty + Assignments */}
              <div className="col-span-12 lg:col-span-8">
                {/* Faculty Panel */}
                <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-5 mb-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Faculty Members</h3>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-4">{faculty.filter(f => f.status === 'active').length} active</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                    {faculty.filter((f) => f.status === 'active').map((f) => {
                      const workload = assignments.filter((a) => a.facultyId === f.id && a.status === 'active').length;
                      return (
                        <div key={f.id} className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-lg">
                          <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                            {f.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-slate-900 truncate">{f.name}</p>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{f.role} &middot; {workload} assigned</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Assignment Cards */}
                <div className="space-y-3 max-h-[480px] overflow-y-auto">
                  {assignments
                    .filter((a) =>
                      !searchQuery ||
                      a.subjectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      getFacultyName(a.facultyId).toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((a) => (
                      <div key={a.id} className="bg-white rounded-lg border border-slate-100 shadow-sm p-4 flex items-center justify-between hover:shadow-sm transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                            {a.subjectCode?.[0] || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{a.subjectName || 'Unnamed Course'}</p>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              {getFacultyName(a.facultyId)} &middot; {a.batch || 'No Batch'} &middot; Sem {a.semester || '-'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            'text-xs font-medium uppercase tracking-wide',
                            a.mode === 'Online' ? 'text-blue-500' : a.mode === 'Hybrid' ? 'text-indigo-500' : 'text-slate-400'
                          )}>{a.mode}</span>
                          <StatusBadge status={a.status || 'active'} />
                        </div>
                      </div>
                    ))}

                  {assignments.length === 0 && (
                    <div className="flex items-center justify-center py-16 border-4 border-dashed border-slate-100 rounded-lg">
                      <div className="text-center">
                        <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-xs font-medium uppercase  text-slate-300">No course assignments yet</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            TAB 7: VERSION CONTROL
        ═══════════════════════════════════════════════════ */}
        {activeTab === 'versions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 font-display">Version Control</h2>
                <p className="text-xs font-medium uppercase  text-slate-400 mt-1">
                  Track program changes across academic years
                </p>
              </div>
              <button
                onClick={() => { resetVersionForm(); openDrawer('version'); }}
                className="px-5 py-3 bg-slate-900 text-white rounded-lg text-xs font-medium uppercase tracking-wide hover:bg-slate-700 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create Version
              </button>
            </div>

            {/* Timeline */}
            <div className="relative">
              {versions.length > 0 && (
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-100" />
              )}
              <div className="space-y-4">
                {versions
                  .sort((a, b) => b.version - a.version)
                  .map((v, idx) => (
                    <div key={v.id} className="relative flex gap-6">
                      {/* Timeline dot */}
                      <div className="relative z-10 shrink-0">
                        <div className={cn(
                          'w-16 h-16 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm',
                          v.status === 'active' ? 'bg-blue-600 text-white' :
                          v.status === 'superseded' ? 'bg-slate-200 text-slate-500' :
                          'bg-amber-100 text-amber-700'
                        )}>
                          v{v.version}
                        </div>
                      </div>

                      {/* Content card */}
                      <div className="flex-1 bg-white rounded-lg border border-slate-100 shadow-sm p-6 hover:shadow-sm transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">{v.programName}</h3>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              Version {v.version} &middot; Batch {v.effectiveBatch || 'N/A'}
                            </p>
                          </div>
                          <StatusBadge status={v.status} />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="p-3 bg-slate-50 rounded-lg flex items-center gap-3">
                            <CalendarDays className="w-4 h-4 text-blue-500" />
                            <div>
                              <p className="text-xs font-medium uppercase text-slate-400">Effective From</p>
                              <p className="text-xs font-bold text-slate-900">{v.effectiveFrom || 'Not set'}</p>
                            </div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg flex items-center gap-3">
                            <Layers className="w-4 h-4 text-emerald-500" />
                            <div>
                              <p className="text-xs font-medium uppercase text-slate-400">Semesters Snapshotted</p>
                              <p className="text-xs font-bold text-slate-900">{v.curriculumSnapshot?.length || 0} semesters</p>
                            </div>
                          </div>
                        </div>

                        {v.changes && (
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2">Change Description</p>
                            <p className="text-sm text-slate-600 leading-relaxed">{v.changes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                {versions.length === 0 && (
                  <div className="flex items-center justify-center py-20 border-4 border-dashed border-slate-100 rounded-lg">
                    <div className="text-center">
                      <GitBranch className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p className="text-xs font-medium uppercase  text-slate-300">No versions created yet</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            TAB 8: COURSE MARKETPLACE
        ═══════════════════════════════════════════════════ */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 font-display">Course Marketplace</h2>
                <p className="text-xs font-medium uppercase  text-slate-400 mt-1">
                  Multi-institution course sharing and discovery
                </p>
              </div>
              {isSuperAdmin && (
                <span className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4" /> Super Admin Access
                </span>
              )}
            </div>

            {/* Permission Notice */}
            {isTeacher && (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-3">
                <Lock className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700 font-medium">
                  As a faculty member, you can browse the marketplace but cannot import or share courses. Contact your administrator for access.
                </p>
              </div>
            )}

            {/* Shared Courses from Other Institutions */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Shared Courses</h3>
                </div>
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {courses.filter((c) => c.isMasterCourse && c.sharedWithTenants && c.sharedWithTenants.length > 0).length} available
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {courses
                  .filter((c) => c.isMasterCourse || (c.sharedWithTenants && c.sharedWithTenants.length > 0))
                  .map((c) => (
                    <div key={c.id} className="bg-white rounded-lg border border-blue-200 shadow-sm p-6 hover:shadow-sm transition-all duration-300 group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 -translate-y-8 translate-x-8 rounded-full" />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium tracking-wide uppercase">
                              Shared
                            </span>
                            <StatusBadge status={c.status} />
                          </div>
                          {isSuperAdmin && (
                            <Share2 className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{c.name}</h3>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-4">{c.code} &middot; {c.department || 'General'}</p>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="text-center p-2.5 bg-blue-50/50 rounded-lg">
                            <p className="text-sm font-bold text-blue-700">{c.credits}</p>
                            <p className="text-xs font-medium uppercase text-blue-400">Credits</p>
                          </div>
                          <div className="text-center p-2.5 bg-blue-50/50 rounded-lg">
                            <p className="text-sm font-bold text-blue-700">{c.sharedWithTenants?.length || 0}</p>
                            <p className="text-xs font-medium uppercase text-blue-400">Shared</p>
                          </div>
                        </div>
                        {c.description && (
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">{c.description}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { fillCourseForm(c); openDrawer('course', c); }}
                            className="flex-1 py-2.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium uppercase tracking-wide hover:bg-blue-700 hover:text-white transition-all flex items-center justify-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Details
                          </button>
                          {canEdit && (
                            <button className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-medium uppercase tracking-wide hover:bg-slate-700 transition-all flex items-center justify-center gap-1.5">
                              <Download className="w-3.5 h-3.5" /> Import
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                {courses.filter((c) => c.isMasterCourse || (c.sharedWithTenants && c.sharedWithTenants.length > 0)).length === 0 && (
                  <div className="col-span-full flex items-center justify-center py-20 border-4 border-dashed border-blue-200 rounded-lg bg-blue-50/10">
                    <div className="text-center">
                      <Globe className="w-12 h-12 text-indigo-200 mx-auto mb-3" />
                      <p className="text-xs font-medium uppercase  text-indigo-300">No shared courses available yet</p>
                      <p className="text-[9px] text-blue-400 mt-2">Super admins can share programs and courses across institutions</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Our Shared Programs */}
            {isSuperAdmin && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">Our Shared Programs</h3>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {programs
                    .filter((p) => p.isMasterProgram)
                    .map((p) => (
                      <div key={p.id} className="bg-white rounded-lg border border-emerald-100 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-medium tracking-wide uppercase">Master</span>
                          <StatusBadge status={p.status} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{p.name}</h3>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-3">{p.code}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{p.durationYears}Y &middot; {p.totalCredits} credits</span>
                          <span className="text-xs font-medium uppercase tracking-wide text-emerald-500">{p.sharedWithTenants?.length || 0} tenants</span>
                        </div>
                      </div>
                    ))}

                  {programs.filter((p) => p.isMasterProgram).length === 0 && (
                    <div className="col-span-full flex items-center justify-center py-12 border-4 border-dashed border-emerald-100 rounded-lg">
                      <div className="text-center">
                        <Share2 className="w-8 h-8 text-emerald-200 mx-auto mb-2" />
                        <p className="text-xs font-medium uppercase  text-emerald-300">No programs shared yet</p>
                        <p className="text-[9px] text-emerald-400 mt-1">Toggle "Master Program" in a program to share it</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════
          DRAWER
      ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl h-full bg-white shadow-md flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-8 pb-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-display tracking-tight">
                      {editingItem ? `Edit ${drawerType}` : `Create ${drawerType}`}
                    </h2>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mt-1">
                      Academic Configuration
                    </p>
                  </div>
                  <button
                    onClick={closeDrawer}
                    className="w-10 h-10 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-8">

                {/* ── PROGRAM FORM ── */}
                {drawerType === 'program' && (
                  <form onSubmit={handleSaveProgram} className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <InputField label="Program Name" value={programForm.name} onChange={(v) => setProgramForm({ ...programForm, name: v })} placeholder="e.g. Bachelor of Theology" required />
                      <InputField label="Program Code" value={programForm.code} onChange={(v) => setProgramForm({ ...programForm, code: v })} placeholder="e.g. B.TH" required />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <SelectField label="Level" value={programForm.level} onChange={(v) => setProgramForm({ ...programForm, level: v as any })} options={LEVEL_OPTIONS} />
                      <InputField label="Department" value={programForm.department} onChange={(v) => setProgramForm({ ...programForm, department: v })} placeholder="e.g. Theology" />
                    </div>
                    <div className="grid grid-cols-3 gap-5">
                      <InputField label="Duration (Years)" type="number" value={String(programForm.durationYears)} onChange={(v) => setProgramForm({ ...programForm, durationYears: parseInt(v) || 0 })} />
                      <InputField label="Semesters" type="number" value={String(programForm.durationSemesters)} onChange={(v) => setProgramForm({ ...programForm, durationSemesters: parseInt(v) || 0 })} />
                      <InputField label="Total Credits" type="number" value={String(programForm.totalCredits)} onChange={(v) => setProgramForm({ ...programForm, totalCredits: parseInt(v) || 0 })} />
                    </div>
                    <div className="grid grid-cols-3 gap-5">
                      <SelectField label="Credit System" value={programForm.creditSystem} onChange={(v) => setProgramForm({ ...programForm, creditSystem: v as any })} options={CREDIT_SYSTEMS} />
                      <SelectField label="Grading System" value={programForm.gradingSystem} onChange={(v) => setProgramForm({ ...programForm, gradingSystem: v as any })} options={GRADING_SYSTEMS} />
                      <SelectField label="Pattern" value={programForm.pattern} onChange={(v) => setProgramForm({ ...programForm, pattern: v as any })} options={PATTERNS} />
                    </div>
                    <TextAreaField label="Description" value={programForm.description} onChange={(v) => setProgramForm({ ...programForm, description: v })} placeholder="Program description..." />

                    {/* Power Features */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase  text-slate-400 mb-3">Power Features</p>
                      <ToggleRow label="Ministry Practicum" checked={programForm.enableMinistryPracticum} onChange={(v) => setProgramForm({ ...programForm, enableMinistryPracticum: v })} />
                      <ToggleRow label="Internship" checked={programForm.enableInternship} onChange={(v) => setProgramForm({ ...programForm, enableInternship: v })} />
                      <ToggleRow label="Thesis" checked={programForm.enableThesis} onChange={(v) => setProgramForm({ ...programForm, enableThesis: v })} />
                    </div>

                    <SelectField label="Status" value={programForm.status} onChange={(v) => setProgramForm({ ...programForm, status: v as any })} options={STATUS_OPTIONS} />

                    {/* Multi-Institution Control */}
                    {isSuperAdmin && (
                      <div className="space-y-3 p-4 bg-blue-50/50 rounded-lg border border-blue-200">
                        <p className="text-xs font-medium uppercase  text-blue-600 mb-3 flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5" /> Multi-Institution Control
                        </p>
                        <ToggleRow label="Master Program (share across institutions)" checked={!!(programForm as any).isMasterProgram} onChange={handleToggleMasterProgram} />
                      </div>
                    )}

                    <DrawerFooter onCancel={closeDrawer} onDelete={editingItem ? () => handleDeleteProgram(editingItem.id) : undefined} submitting={submitting} />
                  </form>
                )}

                {/* ── COURSE FORM ── */}
                {drawerType === 'course' && (
                  <form onSubmit={handleSaveCourse} className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <InputField label="Course Name" value={courseForm.name} onChange={(v) => setCourseForm({ ...courseForm, name: v })} placeholder="e.g. Old Testament Survey" required />
                      <InputField label="Course Code" value={courseForm.code} onChange={(v) => setCourseForm({ ...courseForm, code: v })} placeholder="e.g. OT-101" required />
                    </div>
                    <div className="grid grid-cols-3 gap-5">
                      <InputField label="Department" value={courseForm.department} onChange={(v) => setCourseForm({ ...courseForm, department: v })} placeholder="e.g. Theology" />
                      <InputField label="Credits" type="number" value={String(courseForm.credits)} onChange={(v) => setCourseForm({ ...courseForm, credits: parseInt(v) || 0 })} />
                      <SelectField label="Course Type" value={courseForm.courseType} onChange={(v) => setCourseForm({ ...courseForm, courseType: v as any })} options={COURSE_TYPES} />
                    </div>
                    <InputField label="Level" type="number" value={String(courseForm.level)} onChange={(v) => setCourseForm({ ...courseForm, level: parseInt(v) || 1 })} />
                    <TextAreaField label="Description" value={courseForm.description} onChange={(v) => setCourseForm({ ...courseForm, description: v })} placeholder="Course description..." />
                    <TextAreaField label="Syllabus" value={courseForm.syllabus} onChange={(v) => setCourseForm({ ...courseForm, syllabus: v })} placeholder="Detailed syllabus..." rows={6} />
                    <SelectField label="Status" value={courseForm.status} onChange={(v) => setCourseForm({ ...courseForm, status: v as any })} options={STATUS_OPTIONS} />

                    {/* Multi-Institution Control for Courses */}
                    {isSuperAdmin && (
                      <div className="space-y-3 p-4 bg-blue-50/50 rounded-lg border border-blue-200">
                        <p className="text-xs font-medium uppercase  text-blue-600 mb-3 flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5" /> Multi-Institution Control
                        </p>
                        <ToggleRow label="Master Course (share across institutions)" checked={!!(courseForm as any).isMasterCourse} onChange={handleToggleMasterCourse} />
                      </div>
                    )}

                    {/* Prerequisites Multi-Select */}
                    <div className="space-y-3">
                      <p className="text-xs font-medium uppercase  text-slate-400">Prerequisites (click to toggle)</p>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {courses
                          .filter((c) => c.id !== editingItem?.id)
                          .map((c) => {
                            const selected = courseForm.prerequisites.includes(c.id!);
                            return (
                              <button
                                key={c.id} type="button"
                                onClick={() => togglePrerequisite(c.id!)}
                                className={cn(
                                  'flex items-center gap-2 p-3 rounded-lg text-left text-xs font-medium transition-all border',
                                  selected
                                    ? 'bg-slate-900 border-slate-900 text-white'
                                    : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                                )}
                              >
                                {selected ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Plus className="w-3.5 h-3.5 shrink-0 opacity-40" />}
                                <span className="truncate">{c.name} ({c.code})</span>
                              </button>
                            );
                          })}
                      </div>
                    </div>

                    <DrawerFooter onCancel={closeDrawer} onDelete={editingItem ? () => handleDeleteCourse(editingItem.id) : undefined} submitting={submitting} />
                  </form>
                )}

                {/* ── CURRICULUM FORM ── */}
                {drawerType === 'curriculum' && (
                  <form onSubmit={handleSaveCurriculum} className="space-y-5">
                    <SelectField
                      label="Program"
                      value={curriculumForm.programId}
                      onChange={(v) => {
                        const prog = programs.find((p) => p.id === v);
                        setCurriculumForm({ ...curriculumForm, programId: v });
                        if (prog && curriculumForm.semesters.length === 0) {
                          handleInitCurriculumSemesters(prog.durationSemesters);
                        }
                      }}
                      options={programs.map((p) => ({ value: p.id!, label: `${p.name} (${p.code})` }))}
                    />
                    <div className="grid grid-cols-2 gap-5">
                      <InputField label="Academic Year" value={curriculumForm.academicYear} onChange={(v) => setCurriculumForm({ ...curriculumForm, academicYear: v })} placeholder="e.g. 2024-2025" />
                      <InputField label="Batch" value={curriculumForm.batch} onChange={(v) => setCurriculumForm({ ...curriculumForm, batch: v })} placeholder="e.g. 2024" />
                    </div>
                    <SelectField label="Status" value={curriculumForm.status} onChange={(v) => setCurriculumForm({ ...curriculumForm, status: v as any })} options={['active', 'draft', 'archived']} />

                    {/* Semester Editor */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium uppercase  text-slate-400">Semesters ({curriculumForm.semesters.length})</p>
                        {curriculumForm.programId && curriculumForm.semesters.length === 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const prog = programs.find((p) => p.id === curriculumForm.programId);
                              if (prog) handleInitCurriculumSemesters(prog.durationSemesters);
                            }}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            Auto-generate from program
                          </button>
                        )}
                      </div>

                      {curriculumForm.semesters.map((sem, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xs font-bold">
                                {sem.semesterNumber}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{sem.semesterName}</p>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                  {sem.courseIds.length} courses &middot; {sem.totalCredits} credits
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Course chips */}
                          <div className="flex flex-wrap gap-1.5">
                            {sem.courseIds.map((cid, cidx) => (
                              <span
                                key={cidx}
                                onClick={() => handleRemoveCourseFromSemester(idx, cid)}
                                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 cursor-pointer hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all flex items-center gap-1"
                              >
                                {getCourseName(cid)}
                                <X className="w-3 h-3" />
                              </span>
                            ))}
                          </div>

                          {/* Add course button */}
                          <div className="relative">
                            {addCourseSemesterIdx === idx ? (
                              <div className="space-y-2">
                                <div className="grid grid-cols-1 gap-1.5 max-h-32 overflow-y-auto bg-white rounded-lg border border-slate-100 p-2">
                                  {courses
                                    .filter((c) => !sem.courseIds.includes(c.id!))
                                    .map((c) => (
                                      <button
                                        key={c.id} type="button"
                                        onClick={() => handleAddCourseToSemester(idx, c.id!)}
                                        className="flex items-center justify-between p-2 rounded-lg text-[10px] font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all"
                                      >
                                        <span>{c.name} ({c.code})</span>
                                        <span className="text-[8px] font-bold text-slate-400">{c.credits}cr</span>
                                      </button>
                                    ))}
                                </div>
                                <button
                                  type="button" onClick={() => setAddCourseSemesterIdx(null)}
                                  className="text-xs font-medium text-slate-400 hover:text-slate-600"
                                >Done</button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setAddCourseSemesterIdx(idx)}
                                className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <Plus className="w-3 h-3" /> Add Course
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <DrawerFooter onCancel={closeDrawer} submitting={submitting} />
                  </form>
                )}

                {/* ── ELECTIVE FORM ── */}
                {drawerType === 'elective' && (
                  <form onSubmit={handleSaveElective} className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <InputField label="Group Name" value={electiveForm.name} onChange={(v) => setElectiveForm({ ...electiveForm, name: v })} placeholder="e.g. NT Elective Pool" required />
                      <InputField label="Code" value={electiveForm.code} onChange={(v) => setElectiveForm({ ...electiveForm, code: v })} placeholder="e.g. NT-ELEC-01" />
                    </div>
                    <div className="grid grid-cols-3 gap-5">
                      <SelectField
                        label="Program"
                        value={electiveForm.programId}
                        onChange={(v) => setElectiveForm({ ...electiveForm, programId: v })}
                        options={programs.map((p) => ({ value: p.id!, label: p.name }))}
                      />
                      <InputField label="Semester" type="number" value={String(electiveForm.semester)} onChange={(v) => setElectiveForm({ ...electiveForm, semester: parseInt(v) || 1 })} />
                      <InputField label="Eligibility" value={electiveForm.eligibilityCriteria} onChange={(v) => setElectiveForm({ ...electiveForm, eligibilityCriteria: v })} placeholder="e.g. GPA 3.0+" />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <InputField label="Min Electives" type="number" value={String(electiveForm.minElectives)} onChange={(v) => setElectiveForm({ ...electiveForm, minElectives: parseInt(v) || 1 })} />
                      <InputField label="Max Electives" type="number" value={String(electiveForm.maxElectives)} onChange={(v) => setElectiveForm({ ...electiveForm, maxElectives: parseInt(v) || 2 })} />
                    </div>
                    <SelectField label="Status" value={electiveForm.status} onChange={(v) => setElectiveForm({ ...electiveForm, status: v as any })} options={STATUS_OPTIONS} />

                    {/* Course Multi-Select */}
                    <div className="space-y-3">
                      <p className="text-xs font-medium uppercase  text-slate-400">
                        Courses ({electiveForm.courseIds.length} selected — click to toggle)
                      </p>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {courses.map((c) => {
                          const selected = electiveForm.courseIds.includes(c.id!);
                          return (
                            <button
                              key={c.id} type="button"
                              onClick={() => toggleElectiveCourse(c.id!)}
                              className={cn(
                                'flex items-center gap-2 p-3 rounded-lg text-left text-xs font-medium transition-all border',
                                selected
                                  ? 'bg-slate-900 border-slate-900 text-white'
                                  : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                              )}
                            >
                              {selected ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Plus className="w-3.5 h-3.5 shrink-0 opacity-40" />}
                              <span className="truncate">{c.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <DrawerFooter onCancel={closeDrawer} onDelete={editingItem ? () => handleDeleteElective(editingItem.id) : undefined} submitting={submitting} />
                  </form>
                )}

                {/* ── GRADING FORM ── */}
                {drawerType === 'grading' && (
                  <form onSubmit={handleSaveGrading} className="space-y-5">
                    <InputField label="Config Name" value={gradingForm.name} onChange={(v) => setGradingForm({ ...gradingForm, name: v })} placeholder="e.g. Standard GPA System" required />
                    <div className="grid grid-cols-3 gap-5">
                      <SelectField label="Type" value={gradingForm.type} onChange={(v) => setGradingForm({ ...gradingForm, type: v as any })} options={['marks', 'gpa', 'cgpa']} />
                      <InputField label="Max Marks" type="number" value={String(gradingForm.maxMarks)} onChange={(v) => setGradingForm({ ...gradingForm, maxMarks: parseInt(v) || 100 })} />
                      <InputField label="Passing Marks" type="number" value={String(gradingForm.passingMarks)} onChange={(v) => setGradingForm({ ...gradingForm, passingMarks: parseInt(v) || 40 })} />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <SelectField label="Credit System" value={gradingForm.creditSystem} onChange={(v) => setGradingForm({ ...gradingForm, creditSystem: v as any })} options={CREDIT_SYSTEMS} />
                      <InputField label="Credits Per Subject" type="number" value={String(gradingForm.creditsPerSubject)} onChange={(v) => setGradingForm({ ...gradingForm, creditsPerSubject: parseInt(v) || 3 })} />
                    </div>

                    <ToggleRow label="Set as Default" checked={gradingForm.isDefault} onChange={(v) => setGradingForm({ ...gradingForm, isDefault: v })} />

                    {/* Grade Mapping Editor */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium uppercase  text-slate-400">Grade Mappings</p>
                        <button
                          type="button" onClick={addGradeMappingRow}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Row
                        </button>
                      </div>
                      <div className="rounded-lg border border-slate-100 overflow-hidden">
                        <div className="grid grid-cols-4 bg-slate-50 px-4 py-2.5">
                          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Grade</span>
                          <span className="text-xs font-medium uppercase tracking-wide text-slate-400 text-center">Min</span>
                          <span className="text-xs font-medium uppercase tracking-wide text-slate-400 text-center">Max</span>
                          <span className="text-xs font-medium uppercase tracking-wide text-slate-400 text-right">Points</span>
                        </div>
                        {gradingForm.gradeMappings.map((gm, idx) => (
                          <div key={idx} className="grid grid-cols-4 gap-2 px-4 py-2 border-t border-slate-50 items-center">
                            <input
                              type="text" value={gm.grade}
                              onChange={(e) => updateGradeMapping(idx, 'grade', e.target.value)}
                              className="px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-lg text-xs outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold"
                            />
                            <input
                              type="number" value={gm.minMarks}
                              onChange={(e) => updateGradeMapping(idx, 'minMarks', parseInt(e.target.value) || 0)}
                              className="px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-lg text-xs outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-center"
                            />
                            <input
                              type="number" value={gm.maxMarks}
                              onChange={(e) => updateGradeMapping(idx, 'maxMarks', parseInt(e.target.value) || 0)}
                              className="px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-lg text-xs outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-center"
                            />
                            <div className="flex items-center gap-1 justify-end">
                              <input
                                type="number" step="0.1" value={gm.gradePoints}
                                onChange={(e) => updateGradeMapping(idx, 'gradePoints', parseFloat(e.target.value) || 0)}
                                className="w-16 px-2 py-2 bg-slate-50/50 border border-slate-100 rounded-lg text-xs outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-right font-bold text-blue-600"
                              />
                              <button
                                type="button" onClick={() => removeGradeMappingRow(idx)}
                                className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <DrawerFooter onCancel={closeDrawer} onDelete={editingItem ? () => handleDeleteGrading(editingItem.id) : undefined} submitting={submitting} />
                  </form>
                )}

                {/* ── ASSIGNMENT FORM ── */}
                {drawerType === 'assignment' && (
                  <form onSubmit={handleSaveAssignment} className="space-y-5">
                    <SelectField
                      label="Faculty Member"
                      value={assignmentForm.facultyId}
                      onChange={(v) => setAssignmentForm({ ...assignmentForm, facultyId: v })}
                      options={faculty.filter((f) => f.status === 'active').map((f) => ({ value: f.id!, label: `${f.name} — ${f.role}` }))}
                      required
                    />
                    <div className="grid grid-cols-2 gap-5">
                      <InputField label="Subject Name" value={assignmentForm.subjectName} onChange={(v) => setAssignmentForm({ ...assignmentForm, subjectName: v })} placeholder="e.g. Systematic Theology I" required />
                      <InputField label="Subject Code" value={assignmentForm.subjectCode} onChange={(v) => setAssignmentForm({ ...assignmentForm, subjectCode: v })} placeholder="e.g. ST-101" />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <InputField label="Batch" value={assignmentForm.batch} onChange={(v) => setAssignmentForm({ ...assignmentForm, batch: v })} placeholder="e.g. 2024" />
                      <InputField label="Academic Year" value={assignmentForm.academicYear} onChange={(v) => setAssignmentForm({ ...assignmentForm, academicYear: v })} placeholder="e.g. 2024-2025" />
                    </div>
                    <div className="grid grid-cols-3 gap-5">
                      <InputField label="Semester" value={assignmentForm.semester} onChange={(v) => setAssignmentForm({ ...assignmentForm, semester: v })} placeholder="e.g. Fall 2024" />
                      <SelectField label="Class Type" value={assignmentForm.classType || 'Lecture'} onChange={(v) => setAssignmentForm({ ...assignmentForm, classType: v as any })} options={['Lecture', 'Lab', 'Seminar', 'Practical']} />
                      <SelectField label="Mode" value={assignmentForm.mode || 'Offline'} onChange={(v) => setAssignmentForm({ ...assignmentForm, mode: v as any })} options={['Online', 'Offline', 'Hybrid']} />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <InputField label="Weekly Hours" type="number" value={String(assignmentForm.weeklyHours)} onChange={(v) => setAssignmentForm({ ...assignmentForm, weeklyHours: parseInt(v) || 0 })} />
                      <InputField label="Lecture Hours" type="number" value={String(assignmentForm.lectureHours)} onChange={(v) => setAssignmentForm({ ...assignmentForm, lectureHours: parseInt(v) || 0 })} />
                    </div>
                    <SelectField label="Status" value={assignmentForm.status || 'active'} onChange={(v) => setAssignmentForm({ ...assignmentForm, status: v as any })} options={['active', 'completed', 'cancelled']} />

                    <DrawerFooter onCancel={closeDrawer} submitting={submitting} />
                  </form>
                )}

                {/* ── VERSION FORM ── */}
                {drawerType === 'version' && (
                  <form onSubmit={handleSaveVersion} className="space-y-5">
                    <SelectField
                      label="Program"
                      value={versionForm.programId}
                      onChange={(v) => {
                        const existingVersions = versions.filter((ver) => ver.programId === v);
                        const nextVer = existingVersions.length > 0
                          ? Math.max(...existingVersions.map((ver) => ver.version)) + 1
                          : 1;
                        setVersionForm({ ...versionForm, programId: v, version: nextVer });
                      }}
                      options={programs.map((p) => ({ value: p.id!, label: `${p.name} (${p.code})` }))}
                      required
                    />
                    <div className="grid grid-cols-2 gap-5">
                      <InputField label="Version Number" type="number" value={String(versionForm.version)} onChange={(v) => setVersionForm({ ...versionForm, version: parseInt(v) || 1 })} disabled />
                      <InputField label="Effective Batch" value={versionForm.effectiveBatch} onChange={(v) => setVersionForm({ ...versionForm, effectiveBatch: v })} placeholder="e.g. 2025" required />
                    </div>
                    <InputField label="Effective From" type="date" value={versionForm.effectiveFrom} onChange={(v) => setVersionForm({ ...versionForm, effectiveFrom: v })} required />
                    <SelectField label="Status" value={versionForm.status} onChange={(v) => setVersionForm({ ...versionForm, status: v as any })} options={['active', 'draft', 'superseded']} />
                    <TextAreaField label="Changes" value={versionForm.changes} onChange={(v) => setVersionForm({ ...versionForm, changes: v })} placeholder="Describe the changes made in this version..." rows={5} />

                    <DrawerFooter onCancel={closeDrawer} submitting={submitting} />
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Reusable Sub-Components ─────────────────────────────

function InputField({ label, value, onChange, placeholder, type = 'text', required = false, disabled = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; required?: boolean; disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium uppercase  text-slate-400 pl-1">{label}</label>
      <input
        type={type} required={required} disabled={disabled}
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={cn(
          'w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm',
          disabled && 'opacity-50 cursor-not-allowed bg-slate-100'
        )}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, required = false }: {
  label: string; value: string; onChange: (v: string) => void;
  options: readonly string[] | { value: string; label: string }[]; required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium uppercase  text-slate-400 pl-1">{label}</label>
      <select
        value={value} required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm appearance-none cursor-pointer"
      >
        {typeof options[0] === 'string'
          ? (options as string[]).map((o) => <option key={o} value={o}>{o}</option>)
          : (options as { value: string; label: string }[]).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)
        }
      </select>
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium uppercase  text-slate-400 pl-1">{label}</label>
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm resize-none"
      />
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button type="button" onClick={() => onChange(!checked)} className="focus:outline-none">
        {checked ? (
          <ToggleRight className="w-8 h-8 text-blue-600" />
        ) : (
          <ToggleLeft className="w-8 h-8 text-slate-300" />
        )}
      </button>
    </div>
  );
}

function DrawerFooter({ onCancel, onDelete, submitting }: { onCancel: () => void; onDelete?: () => void; submitting: boolean }) {
  return (
    <div className="flex gap-3 pt-6 border-t border-slate-100 mt-4">
      <button
        type="button" onClick={onCancel}
        className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-lg font-black uppercase tracking-wide text-[10px] hover:bg-slate-100 transition-all"
      >
        Cancel
      </button>
      {onDelete && (
        <button
          type="button" onClick={onDelete}
          className="px-6 py-4 bg-rose-50 text-rose-500 rounded-lg font-black uppercase tracking-wide text-[10px] hover:bg-rose-100 transition-all"
        >
          Delete
        </button>
      )}
      <button
        type="submit" disabled={submitting}
        className="flex-2 py-4 bg-slate-900 text-white rounded-lg font-black uppercase tracking-wide text-[10px] hover:bg-blue-700 shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {submitting ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        <span>{submitting ? 'Saving...' : 'Save'}</span>
      </button>
    </div>
  );
}
