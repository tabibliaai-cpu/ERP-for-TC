import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  GraduationCap, BookOpen, Plus, Save, Search, ChevronDown, ChevronRight,
  X, Check, CheckCircle, AlertCircle, Loader2, Sparkles, Trash2, Edit3,
  BarChart3, Globe, Building2, Layers, FileText, Award, Target,
  Scale, TrendingUp, Users, ArrowRight, Copy, Send, Settings2,
  BookMarked, ClipboardList, Percent, Clock, CreditCard, Shield,
  LayoutGrid, ListChecks, PieChart, ToggleLeft, ToggleRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  collection, getDocs, addDoc, updateDoc, doc, setDoc,
  serverTimestamp, query, where, deleteDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { cn } from '../../lib/utils';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface SemesterConfig {
  semester: number;
  courses: string[];
  credits: number;
}

interface CreditDistribution {
  core: number;
  elective: number;
  ministry: number;
  thesis: number;
}

interface AcademicTemplate {
  id?: string;
  name: string;
  programType: string;
  totalCredits: number;
  totalSemesters: number;
  semesters: SemesterConfig[];
  gradingScale: string;
  creditDistribution: CreditDistribution;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

interface GradeRange {
  grade: string;
  minScore: number;
  maxScore: number;
  description: string;
  isPassing: boolean;
  color: string;
}

interface GradeScale {
  id?: string;
  name: string;
  scaleType: 'letter' | 'percentage' | 'gpa';
  grades: GradeRange[];
  passThreshold: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt?: any;
}

interface AcademicPolicy {
  id?: string;
  policyKey: string;
  policyValue: any;
  description: string;
  category: 'attendance' | 'grading' | 'enrollment' | 'financial';
  isGlobal: boolean;
  institutionId?: string;
  updatedAt?: any;
}

interface CurriculumStandard {
  id?: string;
  programType: string;
  totalCredits: number;
  corePercentage: number;
  electivePercentage: number;
  ministryCredits: number;
  thesisRequired: boolean;
  thesisCredits: number;
  minSemesterLoad: number;
  maxSemesterLoad: number;
  practicumHours: number;
  chapelCredits: number;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

interface Institution {
  id: string;
  name: string;
  templateIds?: string[];
}

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const PROGRAM_TYPES = ['B.Th', 'M.Div', 'Th.M', 'PhD', 'D.Min'];

const PROGRAM_COLORS: Record<string, { gradient: string; bg: string; text: string; badge: string }> = {
  'B.Th':  { gradient: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  'M.Div': { gradient: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-50', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700' },
  'Th.M':  { gradient: 'from-purple-500 to-blue-500', bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
  'PhD':   { gradient: 'from-rose-500 to-blue-500', bg: 'bg-rose-50', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-700' },
  'D.Min': { gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
};

const DEFAULT_GRADE_SCALES: GradeScale[] = [
  {
    id: 'letter',
    name: 'Letter Grade (A-F)',
    scaleType: 'letter',
    passThreshold: 50,
    isDefault: true,
    isActive: true,
    grades: [
      { grade: 'A', minScore: 90, maxScore: 100, description: 'Excellent', isPassing: true, color: 'bg-emerald-500' },
      { grade: 'B', minScore: 80, maxScore: 89, description: 'Very Good', isPassing: true, color: 'bg-teal-500' },
      { grade: 'C', minScore: 70, maxScore: 79, description: 'Good', isPassing: true, color: 'bg-sky-500' },
      { grade: 'D', minScore: 50, maxScore: 69, description: 'Satisfactory', isPassing: true, color: 'bg-amber-500' },
      { grade: 'F', minScore: 0, maxScore: 49, description: 'Fail', isPassing: false, color: 'bg-rose-500' },
    ],
  },
  {
    id: 'percentage',
    name: 'Percentage (0-100)',
    scaleType: 'percentage',
    passThreshold: 50,
    isDefault: true,
    isActive: true,
    grades: [
      { grade: '90-100', minScore: 90, maxScore: 100, description: 'Distinction', isPassing: true, color: 'bg-emerald-500' },
      { grade: '75-89', minScore: 75, maxScore: 89, description: 'Merit', isPassing: true, color: 'bg-teal-500' },
      { grade: '50-74', minScore: 50, maxScore: 74, description: 'Pass', isPassing: true, color: 'bg-sky-500' },
      { grade: '0-49', minScore: 0, maxScore: 49, description: 'Fail', isPassing: false, color: 'bg-rose-500' },
    ],
  },
  {
    id: 'gpa',
    name: 'GPA (4.0 Scale)',
    scaleType: 'gpa',
    passThreshold: 1.0,
    isDefault: true,
    isActive: true,
    grades: [
      { grade: '4.0', minScore: 3.7, maxScore: 4.0, description: 'A / Excellent', isPassing: true, color: 'bg-emerald-500' },
      { grade: '3.0', minScore: 2.7, maxScore: 3.69, description: 'B / Very Good', isPassing: true, color: 'bg-teal-500' },
      { grade: '2.0', minScore: 1.7, maxScore: 2.69, description: 'C / Good', isPassing: true, color: 'bg-sky-500' },
      { grade: '1.0', minScore: 1.0, maxScore: 1.69, description: 'D / Pass', isPassing: true, color: 'bg-amber-500' },
      { grade: '0.0', minScore: 0, maxScore: 0.99, description: 'F / Fail', isPassing: false, color: 'bg-rose-500' },
    ],
  },
];

const DEFAULT_POLICIES: Omit<AcademicPolicy, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    policyKey: 'min_attendance',
    policyValue: 75,
    description: 'Minimum attendance percentage required to pass a course',
    category: 'attendance',
    isGlobal: true,
  },
  {
    policyKey: 'assignment_weight',
    policyValue: 40,
    description: 'Percentage weight of assignments in final grade calculation',
    category: 'grading',
    isGlobal: true,
  },
  {
    policyKey: 'exam_weight',
    policyValue: 60,
    description: 'Percentage weight of examinations in final grade calculation',
    category: 'grading',
    isGlobal: true,
  },
  {
    policyKey: 'max_semester_load',
    policyValue: 21,
    description: 'Maximum credit hours allowed per semester',
    category: 'enrollment',
    isGlobal: true,
  },
  {
    policyKey: 'min_semester_load',
    policyValue: 12,
    description: 'Minimum credit hours required per semester for full-time status',
    category: 'enrollment',
    isGlobal: true,
  },
  {
    policyKey: 'academic_probation_gpa',
    policyValue: 2.0,
    description: 'GPA threshold below which a student is placed on academic probation',
    category: 'grading',
    isGlobal: true,
  },
  {
    policyKey: 'grace_period_days',
    policyValue: 14,
    description: 'Grace period in days for fee payment before exam access is blocked',
    category: 'financial',
    isGlobal: true,
  },
  {
    policyKey: 'max_incomplete_courses',
    policyValue: 2,
    description: 'Maximum number of incomplete courses allowed concurrently',
    category: 'enrollment',
    isGlobal: true,
  },
];

const DEFAULT_CURRICULUM: Omit<CurriculumStandard, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    programType: 'B.Th',
    totalCredits: 126,
    corePercentage: 60,
    electivePercentage: 20,
    ministryCredits: 12,
    thesisRequired: false,
    thesisCredits: 0,
    minSemesterLoad: 12,
    maxSemesterLoad: 18,
    practicumHours: 120,
    chapelCredits: 2,
    isActive: true,
  },
  {
    programType: 'M.Div',
    totalCredits: 90,
    corePercentage: 55,
    electivePercentage: 25,
    ministryCredits: 10,
    thesisRequired: false,
    thesisCredits: 0,
    minSemesterLoad: 12,
    maxSemesterLoad: 18,
    practicumHours: 200,
    chapelCredits: 2,
    isActive: true,
  },
  {
    programType: 'Th.M',
    totalCredits: 60,
    corePercentage: 50,
    electivePercentage: 25,
    ministryCredits: 6,
    thesisRequired: true,
    thesisCredits: 12,
    minSemesterLoad: 9,
    maxSemesterLoad: 15,
    practicumHours: 100,
    chapelCredits: 0,
    isActive: true,
  },
  {
    programType: 'PhD',
    totalCredits: 72,
    corePercentage: 40,
    electivePercentage: 20,
    ministryCredits: 4,
    thesisRequired: true,
    thesisCredits: 24,
    minSemesterLoad: 9,
    maxSemesterLoad: 12,
    practicumHours: 50,
    chapelCredits: 0,
    isActive: true,
  },
  {
    programType: 'D.Min',
    totalCredits: 48,
    corePercentage: 45,
    electivePercentage: 20,
    ministryCredits: 8,
    thesisRequired: true,
    thesisCredits: 12,
    minSemesterLoad: 6,
    maxSemesterLoad: 12,
    practicumHours: 300,
    chapelCredits: 0,
    isActive: true,
  },
];

// ═══════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20', className)}>
      {children}
    </div>
  );
}

function StatCard({
  label, value, icon: Icon, gradient, delay = 0
}: {
  label: string; value: number | string; icon: React.ElementType; gradient: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn('rounded-2xl bg-gradient-to-br p-4 text-white shadow-lg', gradient)}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-xs font-medium">{label}</p>
          <p className="text-2xl font-bold mt-0.5">{value}</p>
        </div>
        <Icon className="w-8 h-8 text-white/30" />
      </div>
    </motion.div>
  );
}

function SectionHeader({
  icon: Icon, title, badge, children
}: {
  icon: React.ElementType; title: string; badge?: number; children?: React.ReactNode;
}) {
  return (
    <div className="p-6 border-b border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Icon className="w-5 h-5 text-blue-600" />
          {title}
          {badge !== undefined && (
            <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </h3>
        {children}
      </div>
    </div>
  );
}

function GradeBarChart({ grades, scaleType }: { grades: GradeRange[]; scaleType: string }) {
  const maxRange = scaleType === 'gpa' ? 4.0 : 100;
  return (
    <div className="space-y-2">
      {grades.map((g, i) => {
        const width = Math.max(4, ((g.maxScore - g.minScore) / maxRange) * 100);
        return (
          <motion.div
            key={g.grade}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3"
          >
            <span className="text-xs font-bold text-gray-700 w-12 text-right shrink-0">{g.grade}</span>
            <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={cn('h-full rounded-lg flex items-center px-2', g.color, g.isPassing ? 'opacity-90' : 'opacity-70')}
              >
                <span className="text-[10px] font-semibold text-white truncate">
                  {g.minScore}{scaleType === 'gpa' ? '' : '-'}{g.maxScore === 100 ? '' : scaleType === 'gpa' ? '' : g.maxScore}
                  {scaleType === 'gpa' ? '' : '%'}
                </span>
              </motion.div>
            </div>
            <span className={cn('text-[10px] font-medium w-20 truncate shrink-0', g.isPassing ? 'text-gray-600' : 'text-rose-500')}>
              {g.description}
            </span>
            {!g.isPassing && <span className="text-[9px] font-bold bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded shrink-0">FAIL</span>}
          </motion.div>
        );
      })}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="w-12 h-12 text-gray-300 mb-3" />
      <p className="text-gray-500 font-medium">{title}</p>
      <p className="text-xs text-gray-400 mt-1 max-w-sm">{description}</p>
    </div>
  );
}

function PolicyCategoryIcon({ category }: { category: string }) {
  const config: Record<string, { icon: React.ElementType; color: string }> = {
    attendance: { icon: Clock, color: 'text-emerald-600 bg-emerald-50' },
    grading: { icon: Scale, color: 'text-blue-600 bg-blue-50' },
    enrollment: { icon: Users, color: 'text-indigo-600 bg-indigo-50' },
    financial: { icon: CreditCard, color: 'text-amber-600 bg-amber-50' },
  };
  const c = config[category] || config.grading;
  const Icon = c.icon;
  return <div className={cn('rounded-lg p-2', c.color)}><Icon className="w-4 h-4" /></div>;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function AcademicsControlTab() {
  // ─── Data State ───
  const [templates, setTemplates] = useState<AcademicTemplate[]>([]);
  const [policies, setPolicies] = useState<AcademicPolicy[]>([]);
  const [gradeScales, setGradeScales] = useState<GradeScale[]>([]);
  const [curriculumStandards, setCurriculumStandards] = useState<CurriculumStandard[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ─── UI State ───
  const [activeSection, setActiveSection] = useState<'templates' | 'grades' | 'policies' | 'curriculum'>('templates');
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Modal State ───
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showCreateGradeScale, setShowCreateGradeScale] = useState(false);
  const [showPushModal, setShowPushModal] = useState<string | null>(null);

  // ─── Template Form ───
  const [templateForm, setTemplateForm] = useState<Partial<AcademicTemplate>>({
    name: '',
    programType: 'B.Th',
    totalCredits: 126,
    totalSemesters: 8,
    semesters: [],
    gradingScale: 'letter',
    creditDistribution: { core: 0, elective: 0, ministry: 0, thesis: 0 },
    isActive: true,
  });

  // ─── Grade Scale Form ───
  const [gradeScaleForm, setGradeScaleForm] = useState<Partial<GradeScale>>({
    name: '',
    scaleType: 'letter',
    grades: [],
    passThreshold: 50,
    isDefault: false,
    isActive: true,
  });
  const [newGradeRow, setNewGradeRow] = useState({ grade: '', minScore: 0, maxScore: 100, description: '', isPassing: true, color: 'bg-blue-500' });

  // ─── Policy Edit ───
  const [editingPolicy, setEditingPolicy] = useState<string | null>(null);
  const [editedPolicyValue, setEditedPolicyValue] = useState<any>(null);

  // ─── Toast ───
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ═══════════════════════════════════════════════════════════════════
  // DATA LOADING
  // ═══════════════════════════════════════════════════════════════════

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load templates
      const templatesSnap = await getDocs(collection(db, 'academic_templates'));
      let loadedTemplates = templatesSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as AcademicTemplate[];

      if (loadedTemplates.length === 0) {
        for (const tmpl of generateDefaultTemplates()) {
          const ref = await addDoc(collection(db, 'academic_templates'), {
            ...tmpl,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          loadedTemplates.push({ ...tmpl, id: ref.id });
        }
      }
      setTemplates(loadedTemplates);

      // Load policies
      const policiesSnap = await getDocs(collection(db, 'academic_policies'));
      let loadedPolicies = policiesSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as AcademicPolicy[];

      if (loadedPolicies.length === 0) {
        for (const pol of DEFAULT_POLICIES) {
          const ref = await addDoc(collection(db, 'academic_policies'), {
            ...pol,
            updatedAt: serverTimestamp(),
          });
          loadedPolicies.push({ ...pol, id: ref.id });
        }
      }
      setPolicies(loadedPolicies);

      // Load grade scales
      const scalesSnap = await getDocs(collection(db, 'academic_grade_scales'));
      let loadedScales = scalesSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as GradeScale[];

      if (loadedScales.length === 0) {
        for (const scale of DEFAULT_GRADE_SCALES) {
          const ref = await addDoc(collection(db, 'academic_grade_scales'), {
            ...scale,
            createdAt: serverTimestamp(),
          });
          loadedScales.push({ ...scale, id: ref.id });
        }
      }
      setGradeScales(loadedScales);

      // Load curriculum standards
      const currSnap = await getDocs(collection(db, 'academic_curriculum_standards'));
      let loadedCurr = currSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as CurriculumStandard[];

      if (loadedCurr.length === 0) {
        for (const cs of DEFAULT_CURRICULUM) {
          const ref = await addDoc(collection(db, 'academic_curriculum_standards'), {
            ...cs,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          loadedCurr.push({ ...cs, id: ref.id });
        }
      }
      setCurriculumStandards(loadedCurr);

      // Load institutions for push functionality
      try {
        const instSnap = await getDocs(collection(db, 'institutions'));
        setInstitutions(instSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Institution[]);
      } catch {
        setInstitutions([]);
      }
    } catch (err) {
      console.error('Error loading academics data:', err);
      showToast('Failed to load academic configuration data', 'error');
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

  // ─── Template Handlers ───

  const handleCreateTemplate = async () => {
    if (!templateForm.name?.trim()) {
      showToast('Template name is required', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const semesters: SemesterConfig[] = [];
      const creditsPerSemester = Math.floor(templateForm.totalCredits! / templateForm.totalSemesters!);
      for (let i = 1; i <= templateForm.totalSemesters!; i++) {
        semesters.push({
          semester: i,
          courses: [],
          credits: i === templateForm.totalSemesters
            ? templateForm.totalCredits! - creditsPerSemester * (templateForm.totalSemesters! - 1)
            : creditsPerSemester,
        });
      }

      const dist = templateForm.creditDistribution || { core: 0, elective: 0, ministry: 0, thesis: 0 };
      const total = dist.core + dist.elective + dist.ministry + dist.thesis;
      if (total === 0) {
        dist.core = Math.round(templateForm.totalCredits! * 0.6);
        dist.elective = Math.round(templateForm.totalCredits! * 0.2);
        dist.ministry = Math.round(templateForm.totalCredits! * 0.15);
        dist.thesis = templateForm.totalCredits! - dist.core - dist.elective - dist.ministry;
      }

      await addDoc(collection(db, 'academic_templates'), {
        ...templateForm,
        semesters,
        creditDistribution: dist,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setShowCreateTemplate(false);
      resetTemplateForm();
      await loadData();
      showToast('Academic template created successfully');
    } catch (err) {
      console.error('Error creating template:', err);
      showToast('Failed to create template', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleTemplate = async (templateId: string, currentActive: boolean) => {
    try {
      await updateDoc(doc(db, 'academic_templates', templateId), {
        isActive: !currentActive,
        updatedAt: serverTimestamp(),
      });
      await loadData();
      showToast(`Template ${!currentActive ? 'activated' : 'deactivated'}`);
    } catch {
      showToast('Failed to update template status', 'error');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteDoc(doc(db, 'academic_templates', templateId));
      await loadData();
      showToast('Template deleted successfully');
    } catch {
      showToast('Failed to delete template', 'error');
    }
  };

  const handlePushToInstitution = async (templateId: string, institutionId: string) => {
    try {
      await addDoc(collection(db, 'institution_template_assignments'), {
        templateId,
        institutionId,
        assignedAt: serverTimestamp(),
        status: 'deployed',
      });
      setShowPushModal(null);
      showToast('Template deployed to institution successfully');
    } catch {
      showToast('Failed to deploy template', 'error');
    }
  };

  const handleDuplicateTemplate = async (template: AcademicTemplate) => {
    setIsSaving(true);
    try {
      const { id, createdAt, updatedAt, ...data } = template;
      await addDoc(collection(db, 'academic_templates'), {
        ...data,
        name: `${data.name} (Copy)`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await loadData();
      showToast('Template duplicated successfully');
    } catch {
      showToast('Failed to duplicate template', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Grade Scale Handlers ───

  const handleCreateGradeScale = async () => {
    if (!gradeScaleForm.name?.trim()) {
      showToast('Scale name is required', 'error');
      return;
    }
    if ((gradeScaleForm.grades?.length ?? 0) === 0) {
      showToast('Add at least one grade range', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'academic_grade_scales'), {
        ...gradeScaleForm,
        createdAt: serverTimestamp(),
      });
      setShowCreateGradeScale(false);
      resetGradeScaleForm();
      await loadData();
      showToast('Grade scale created successfully');
    } catch {
      showToast('Failed to create grade scale', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleGradeScale = async (scaleId: string, currentActive: boolean) => {
    try {
      await updateDoc(doc(db, 'academic_grade_scales', scaleId), { isActive: !currentActive });
      await loadData();
      showToast(`Grade scale ${!currentActive ? 'activated' : 'deactivated'}`);
    } catch {
      showToast('Failed to update grade scale', 'error');
    }
  };

  const handleDeleteGradeScale = async (scaleId: string) => {
    try {
      await deleteDoc(doc(db, 'academic_grade_scales', scaleId));
      await loadData();
      showToast('Grade scale deleted');
    } catch {
      showToast('Failed to delete grade scale', 'error');
    }
  };

  // ─── Policy Handlers ───

  const handleSavePolicy = async (policy: AcademicPolicy) => {
    try {
      await updateDoc(doc(db, 'academic_policies', policy.id!), {
        policyValue: editedPolicyValue,
        updatedAt: serverTimestamp(),
      });
      setEditingPolicy(null);
      setEditedPolicyValue(null);
      await loadData();
      showToast('Policy updated successfully');
    } catch {
      showToast('Failed to update policy', 'error');
    }
  };

  const handleToggleGlobalPolicy = async (policy: AcademicPolicy) => {
    try {
      await updateDoc(doc(db, 'academic_policies', policy.id!), {
        isGlobal: !policy.isGlobal,
        updatedAt: serverTimestamp(),
      });
      await loadData();
      showToast(`Policy ${!policy.isGlobal ? 'set as global' : 'set as local'}`);
    } catch {
      showToast('Failed to update policy scope', 'error');
    }
  };

  // ─── Form Resets ───

  function resetTemplateForm() {
    setTemplateForm({
      name: '',
      programType: 'B.Th',
      totalCredits: 126,
      totalSemesters: 8,
      semesters: [],
      gradingScale: 'letter',
      creditDistribution: { core: 0, elective: 0, ministry: 0, thesis: 0 },
      isActive: true,
    });
  }

  function resetGradeScaleForm() {
    setGradeScaleForm({ name: '', scaleType: 'letter', grades: [], passThreshold: 50, isDefault: false, isActive: true });
    setNewGradeRow({ grade: '', minScore: 0, maxScore: 100, description: '', isPassing: true, color: 'bg-blue-500' });
  }

  // ─── Filtered Data ───

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    const q = searchQuery.toLowerCase();
    return templates.filter(
      t => t.name.toLowerCase().includes(q) || t.programType.toLowerCase().includes(q)
    );
  }, [templates, searchQuery]);

  // ─── Stats ───

  const stats = useMemo(() => ({
    totalTemplates: templates.length,
    activeTemplates: templates.filter(t => t.isActive).length,
    activePolicies: policies.filter(p => p.isGlobal).length,
    gradeScales: gradeScales.filter(g => g.isActive).length,
  }), [templates, policies, gradeScales]);

  // ═══════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════════════

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
        <p className="text-gray-500 font-medium">Loading academics configuration...</p>
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
              'fixed top-6 left-1/2 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold',
              toast.type === 'success'
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                : 'bg-gradient-to-r from-rose-500 to-red-600 text-white'
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
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-1.5">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            Academics Control
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage academic templates, grade scales, policies, and curriculum standards across all institutions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeSection === 'templates' && (
            <button
              onClick={() => setShowCreateTemplate(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 text-sm"
            >
              <Plus className="w-4 h-4" />
              New Template
            </button>
          )}
          {activeSection === 'grades' && (
            <button
              onClick={() => setShowCreateGradeScale(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 text-sm"
            >
              <Plus className="w-4 h-4" />
              New Grade Scale
            </button>
          )}
        </div>
      </motion.div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Templates" value={stats.totalTemplates} icon={LayoutGrid} gradient="from-blue-600 to-indigo-600" delay={0} />
        <StatCard label="Active Templates" value={stats.activeTemplates} icon={BookOpen} gradient="from-indigo-500 to-purple-600" delay={0.06} />
        <StatCard label="Global Policies" value={stats.activePolicies} icon={Shield} gradient="from-amber-500 to-orange-500" delay={0.12} />
        <StatCard label="Grade Scales" value={stats.gradeScales} icon={BarChart3} gradient="from-emerald-500 to-green-600" delay={0.18} />
      </div>

      {/* ─── Section Tabs ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {[
          { key: 'templates' as const, label: 'Academic Templates', icon: LayoutGrid },
          { key: 'grades' as const, label: 'Grade Scales', icon: BarChart3 },
          { key: 'policies' as const, label: 'Academic Policies', icon: Shield },
          { key: 'curriculum' as const, label: 'Curriculum Standards', icon: BookMarked },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap',
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white/80 text-gray-600 hover:bg-gray-100 border border-gray-200'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION: ACADEMIC TEMPLATES
      ═══════════════════════════════════════════════════════════ */}
      {activeSection === 'templates' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard className="overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-blue-600" />
                  Academic Templates
                  <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {templates.length}
                  </span>
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search templates..."
                    className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full sm:w-64"
                  />
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-[520px] overflow-y-auto">
              {filteredTemplates.length === 0 ? (
                <EmptyState
                  icon={GraduationCap}
                  title="No templates found"
                  description="Create your first academic template to define program structures for institutions."
                />
              ) : (
                filteredTemplates.map((template, idx) => {
                  const colors = PROGRAM_COLORS[template.programType] || PROGRAM_COLORS['B.Th'];
                  const isExpanded = expandedTemplate === template.id;
                  const totalCred = template.creditDistribution;
                  const distTotal = totalCred.core + totalCred.elective + totalCred.ministry + totalCred.thesis;

                  return (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <button
                        onClick={() => setExpandedTemplate(isExpanded ? null : template.id!)}
                        className="w-full px-6 py-4 flex items-center gap-4 hover:bg-blue-50/40 transition-colors text-left"
                      >
                        <div className={cn('rounded-xl p-2.5 bg-gradient-to-br shadow-sm', colors.gradient)}>
                          <GraduationCap className="w-5 h-5 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">{template.name}</span>
                            <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full', colors.badge)}>
                              {template.programType}
                            </span>
                            {template.isActive ? (
                              <span className="text-[10px] font-medium bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <ToggleRight className="w-3 h-3" /> Active
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <ToggleLeft className="w-3 h-3" /> Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {template.totalCredits} credits &middot; {template.totalSemesters} semesters &middot; {template.gradingScale} grading
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={e => { e.stopPropagation(); handleDuplicateTemplate(template); }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setShowPushModal(template.id!); }}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Push to Institution"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteTemplate(template.id!); }}
                            className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-5 bg-gray-50/50 space-y-4">
                              {/* Credit Distribution */}
                              <div>
                                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                  <PieChart className="w-3.5 h-3.5 text-blue-500" />
                                  Credit Distribution
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  {[
                                    { label: 'Core', value: totalCred.core, color: 'from-blue-500 to-indigo-500', pct: distTotal > 0 ? Math.round(totalCred.core / distTotal * 100) : 0 },
                                    { label: 'Elective', value: totalCred.elective, color: 'from-indigo-500 to-purple-500', pct: distTotal > 0 ? Math.round(totalCred.elective / distTotal * 100) : 0 },
                                    { label: 'Ministry', value: totalCred.ministry, color: 'from-purple-500 to-blue-500', pct: distTotal > 0 ? Math.round(totalCred.ministry / distTotal * 100) : 0 },
                                    { label: 'Thesis', value: totalCred.thesis, color: 'from-rose-500 to-blue-500', pct: distTotal > 0 ? Math.round(totalCred.thesis / distTotal * 100) : 0 },
                                  ].map(d => (
                                    <div key={d.label} className="bg-white rounded-xl p-3 border border-gray-100">
                                      <p className="text-[10px] font-medium text-gray-500 uppercase">{d.label}</p>
                                      <p className="text-lg font-bold text-gray-900 mt-0.5">{d.value}</p>
                                      <div className="mt-1.5 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${d.pct}%` }}
                                          transition={{ duration: 0.5 }}
                                          className={cn('h-full rounded-full bg-gradient-to-r', d.color)}
                                        />
                                      </div>
                                      <p className="text-[10px] text-gray-400 mt-1">{d.pct}%</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Semester Breakdown */}
                              <div>
                                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                  <ListChecks className="w-3.5 h-3.5 text-blue-500" />
                                  Semester Breakdown
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {template.semesters.map(sem => (
                                    <div key={sem.semester} className="bg-white rounded-lg p-2.5 border border-gray-100 text-center">
                                      <p className="text-[10px] font-medium text-gray-500">Sem {sem.semester}</p>
                                      <p className="text-sm font-bold text-gray-900">{sem.credits} <span className="text-[10px] font-normal text-gray-400">cr</span></p>
                                      <p className="text-[9px] text-gray-400">{sem.courses.length} courses</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-3 pt-2">
                                <button
                                  onClick={() => handleToggleTemplate(template.id!, template.isActive)}
                                  className={cn(
                                    'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all',
                                    template.isActive
                                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  )}
                                >
                                  {template.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                                  {template.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  onClick={() => setShowPushModal(template.id!)}
                                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/20"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  Push to Institution
                                </button>
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
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION: GRADE SCALES
      ═══════════════════════════════════════════════════════════ */}
      {activeSection === 'grades' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
          {gradeScales.map((scale, idx) => (
            <motion.div
              key={scale.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <GlassCard className="overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-2.5 shadow-sm">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900">{scale.name}</h4>
                          {scale.isDefault && (
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">DEFAULT</span>
                          )}
                          {scale.isActive ? (
                            <span className="text-[10px] font-medium bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle className="w-2.5 h-2.5" /> Active
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {scale.scaleType.toUpperCase()} scale &middot; Pass threshold: {scale.passThreshold}{scale.scaleType === 'gpa' ? ' GPA' : '%'} &middot; {scale.grades.length} grades
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleGradeScale(scale.id!, scale.isActive)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                          scale.isActive
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        )}
                      >
                        {scale.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                        {scale.isActive ? 'Disable' : 'Enable'}
                      </button>
                      {!scale.isDefault && (
                        <button
                          onClick={() => handleDeleteGradeScale(scale.id!)}
                          className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <GradeBarChart grades={scale.grades} scaleType={scale.scaleType} />
                </div>
              </GlassCard>
            </motion.div>
          ))}

          {gradeScales.length === 0 && (
            <EmptyState
              icon={BarChart3}
              title="No grade scales configured"
              description="Create your first grade scale to define how student performance is evaluated."
            />
          )}
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION: ACADEMIC POLICIES
      ═══════════════════════════════════════════════════════════ */}
      {activeSection === 'policies' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard className="overflow-hidden">
            <SectionHeader icon={Shield} title="Cross-Institution Academic Policies" badge={policies.length}>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {policies.filter(p => p.isGlobal).length} global, {policies.filter(p => !p.isGlobal).length} local
                </span>
              </div>
            </SectionHeader>

            <div className="divide-y divide-gray-100 max-h-[520px] overflow-y-auto">
              {policies.length === 0 ? (
                <EmptyState
                  icon={Shield}
                  title="No policies configured"
                  description="Academic policies define the rules that govern institutions on the platform."
                />
              ) : (
                policies.map((policy, idx) => {
                  const isEditing = editingPolicy === policy.id;
                  const categoryIcons: Record<string, { icon: React.ElementType; color: string }> = {
                    attendance: { icon: Clock, color: 'text-emerald-600 bg-emerald-50' },
                    grading: { icon: Scale, color: 'text-blue-600 bg-blue-50' },
                    enrollment: { icon: Users, color: 'text-indigo-600 bg-indigo-50' },
                    financial: { icon: CreditCard, color: 'text-amber-600 bg-amber-50' },
                  };
                  const catConfig = categoryIcons[policy.category] || categoryIcons.grading;
                  const CatIcon = catConfig.icon;

                  return (
                    <motion.div
                      key={policy.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="px-6 py-4 flex items-center gap-4 hover:bg-blue-50/30 transition-colors"
                    >
                      <PolicyCategoryIcon category={policy.category} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 text-sm">
                            {formatPolicyLabel(policy.policyKey)}
                          </span>
                          <span className={cn(
                            'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                            policy.category === 'attendance' ? 'bg-emerald-100 text-emerald-700' :
                            policy.category === 'grading' ? 'bg-blue-100 text-blue-700' :
                            policy.category === 'enrollment' ? 'bg-indigo-100 text-indigo-700' :
                            'bg-amber-100 text-amber-700'
                          )}>
                            {policy.category}
                          </span>
                          {policy.isGlobal ? (
                            <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Globe className="w-2.5 h-2.5" /> Global
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Building2 className="w-2.5 h-2.5" /> Local
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{policy.description}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type={typeof policy.policyValue === 'number' ? 'number' : 'text'}
                              value={editedPolicyValue ?? policy.policyValue}
                              onChange={e => {
                                const val = typeof policy.policyValue === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
                                setEditedPolicyValue(val);
                              }}
                              className="w-24 px-3 py-1.5 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleSavePolicy(policy);
                                if (e.key === 'Escape') { setEditingPolicy(null); setEditedPolicyValue(null); }
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => handleSavePolicy(policy)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setEditingPolicy(null); setEditedPolicyValue(null); }}
                              className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="bg-blue-50 px-3 py-1.5 rounded-lg">
                              <span className="text-sm font-bold text-blue-700">
                                {typeof policy.policyValue === 'number'
                                  ? policy.policyKey.includes('gpa') ? policy.policyValue.toFixed(1) : policy.policyValue
                                  : policy.policyValue}
                              </span>
                              <span className="text-[10px] text-blue-500 ml-1">
                                {getPolicyUnit(policy.policyKey)}
                              </span>
                            </div>
                            <button
                              onClick={() => { setEditingPolicy(policy.id!); setEditedPolicyValue(policy.policyValue); }}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleGlobalPolicy(policy)}
                              className={cn(
                                'p-1.5 rounded-lg transition-colors',
                                policy.isGlobal
                                  ? 'text-blue-600 hover:bg-blue-50'
                                  : 'text-gray-400 hover:bg-gray-100'
                              )}
                              title={policy.isGlobal ? 'Set as local' : 'Set as global'}
                            >
                              <Globe className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION: CURRICULUM STANDARDS
      ═══════════════════════════════════════════════════════════ */}
      {activeSection === 'curriculum' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
          {curriculumStandards.length === 0 ? (
            <GlassCard className="overflow-hidden">
              <EmptyState
                icon={BookMarked}
                title="No curriculum standards defined"
                description="Define curriculum frameworks for each program type to ensure consistency across institutions."
              />
            </GlassCard>
          ) : (
            curriculumStandards.map((cs, idx) => {
              const colors = PROGRAM_COLORS[cs.programType] || PROGRAM_COLORS['B.Th'];
              const usedCredits = Math.round(cs.totalCredits * (cs.corePercentage + cs.electivePercentage) / 100);
              const remaining = cs.totalCredits - usedCredits;

              return (
                <motion.div
                  key={cs.id || cs.programType}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <GlassCard className="overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={cn('rounded-xl p-2.5 bg-gradient-to-br shadow-sm', colors.gradient)}>
                            <BookMarked className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900">{cs.programType} Curriculum Standards</h4>
                              <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full', colors.badge)}>
                                {cs.programType}
                              </span>
                              {cs.isActive && (
                                <span className="text-[10px] font-medium bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <CheckCircle className="w-2.5 h-2.5" /> Active
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {cs.totalCredits} total credits &middot; {cs.minSemesterLoad}-{cs.maxSemesterLoad} credits/semester
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* Core Credits */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-blue-50 rounded-lg p-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <span className="text-[10px] font-semibold text-gray-500 uppercase">Core Courses</span>
                          </div>
                          <p className="text-xl font-bold text-gray-900">{cs.corePercentage}%</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{Math.round(cs.totalCredits * cs.corePercentage / 100)} credits</p>
                          <div className="mt-2 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${cs.corePercentage}%` }}
                              transition={{ duration: 0.5, delay: 0.1 }}
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                            />
                          </div>
                        </div>

                        {/* Elective Credits */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-indigo-50 rounded-lg p-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            </div>
                            <span className="text-[10px] font-semibold text-gray-500 uppercase">Electives</span>
                          </div>
                          <p className="text-xl font-bold text-gray-900">{cs.electivePercentage}%</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{Math.round(cs.totalCredits * cs.electivePercentage / 100)} credits</p>
                          <div className="mt-2 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${cs.electivePercentage}%` }}
                              transition={{ duration: 0.5, delay: 0.15 }}
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            />
                          </div>
                        </div>

                        {/* Ministry / Practicum */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-purple-50 rounded-lg p-1.5">
                              <Award className="w-3.5 h-3.5 text-purple-600" />
                            </div>
                            <span className="text-[10px] font-semibold text-gray-500 uppercase">Ministry/Practicum</span>
                          </div>
                          <p className="text-xl font-bold text-gray-900">{cs.ministryCredits}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">credits</p>
                          <p className="text-[10px] text-purple-500 mt-1 font-medium">{cs.practicumHours} practicum hours</p>
                        </div>

                        {/* Thesis */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={cn('rounded-lg p-1.5', cs.thesisRequired ? 'bg-rose-50' : 'bg-gray-50')}>
                              <FileText className={cn('w-3.5 h-3.5', cs.thesisRequired ? 'text-rose-600' : 'text-gray-400')} />
                            </div>
                            <span className="text-[10px] font-semibold text-gray-500 uppercase">Thesis</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-xl font-bold text-gray-900">
                              {cs.thesisRequired ? `${cs.thesisCredits}` : '—'}
                            </p>
                            {cs.thesisRequired && <span className="text-[10px] text-gray-400">credits</span>}
                          </div>
                          <span className={cn(
                            'text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 inline-block',
                            cs.thesisRequired
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-gray-100 text-gray-500'
                          )}>
                            {cs.thesisRequired ? 'Required' : 'Not Required'}
                          </span>
                        </div>
                      </div>

                      {/* Chapel Credits & Additional Info */}
                      <div className="mt-4 flex flex-wrap items-center gap-4">
                        {cs.chapelCredits > 0 && (
                          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-xs text-gray-600">
                              <span className="font-semibold">{cs.chapelCredits}</span> chapel credits required
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-xs text-gray-600">
                            Semester load: <span className="font-semibold">{cs.minSemesterLoad}–{cs.maxSemesterLoad} credits</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })
          )}
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL: CREATE TEMPLATE
      ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showCreateTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateTemplate(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  Create Academic Template
                </h3>
                <button onClick={() => setShowCreateTemplate(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Template Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Template Name</label>
                  <input
                    type="text"
                    value={templateForm.name || ''}
                    onChange={e => setTemplateForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. B.Th Standard Curriculum"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Program Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Program Type</label>
                  <div className="flex flex-wrap gap-2">
                    {PROGRAM_TYPES.map(pt => {
                      const colors = PROGRAM_COLORS[pt];
                      const isSelected = templateForm.programType === pt;
                      return (
                        <button
                          key={pt}
                          onClick={() => setTemplateForm(f => ({ ...f, programType: pt }))}
                          className={cn(
                            'px-3 py-2 rounded-xl text-xs font-bold transition-all',
                            isSelected
                              ? cn('text-white bg-gradient-to-r shadow-md', colors.gradient)
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          )}
                        >
                          {pt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Credits & Semesters */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Total Credits</label>
                    <input
                      type="number"
                      value={templateForm.totalCredits || ''}
                      onChange={e => setTemplateForm(f => ({ ...f, totalCredits: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Total Semesters</label>
                    <input
                      type="number"
                      value={templateForm.totalSemesters || ''}
                      onChange={e => setTemplateForm(f => ({ ...f, totalSemesters: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Grading Scale */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Grading Scale</label>
                  <select
                    value={templateForm.gradingScale || 'letter'}
                    onChange={e => setTemplateForm(f => ({ ...f, gradingScale: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="letter">Letter Grade (A-F)</option>
                    <option value="percentage">Percentage (0-100)</option>
                    <option value="gpa">GPA (4.0 Scale)</option>
                  </select>
                </div>

                {/* Credit Distribution */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Credit Distribution</label>
                  <p className="text-[10px] text-gray-400 mb-2">Leave empty to auto-calculate based on defaults (60% core, 20% elective, 15% ministry, 5% other)</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'core' as const, label: 'Core', color: 'from-blue-500 to-indigo-500' },
                      { key: 'elective' as const, label: 'Elective', color: 'from-indigo-500 to-purple-500' },
                      { key: 'ministry' as const, label: 'Ministry', color: 'from-purple-500 to-blue-500' },
                      { key: 'thesis' as const, label: 'Thesis', color: 'from-rose-500 to-blue-500' },
                    ].map(d => (
                      <div key={d.key} className="bg-gray-50 rounded-xl p-3">
                        <label className="text-[10px] font-semibold text-gray-500 uppercase">{d.label}</label>
                        <input
                          type="number"
                          value={templateForm.creditDistribution?.[d.key] || ''}
                          onChange={e => setTemplateForm(f => ({
                            ...f,
                            creditDistribution: {
                              ...f.creditDistribution!,
                              [d.key]: parseInt(e.target.value) || 0,
                            }
                          }))}
                          className="w-full mt-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => { setShowCreateTemplate(false); resetTemplateForm(); }}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTemplate}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-60"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Create Template
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          MODAL: CREATE GRADE SCALE
      ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showCreateGradeScale && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateGradeScale(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Create Grade Scale
                </h3>
                <button onClick={() => setShowCreateGradeScale(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Scale Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Scale Name</label>
                  <input
                    type="text"
                    value={gradeScaleForm.name || ''}
                    onChange={e => setGradeScaleForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Custom Theological Grading"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Scale Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Scale Type</label>
                  <div className="flex gap-2">
                    {[
                      { key: 'letter' as const, label: 'Letter' },
                      { key: 'percentage' as const, label: 'Percentage' },
                      { key: 'gpa' as const, label: 'GPA' },
                    ].map(t => (
                      <button
                        key={t.key}
                        onClick={() => setGradeScaleForm(f => ({ ...f, scaleType: t.key }))}
                        className={cn(
                          'px-4 py-2 rounded-xl text-xs font-bold transition-all',
                          gradeScaleForm.scaleType === t.key
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pass Threshold */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pass Threshold</label>
                  <input
                    type="number"
                    value={gradeScaleForm.passThreshold || ''}
                    onChange={e => setGradeScaleForm(f => ({ ...f, passThreshold: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Add Grade Row */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Grade Ranges</label>
                  <p className="text-[10px] text-gray-400 mb-2">Define each grade level and its score range</p>

                  {gradeScaleForm.grades && gradeScaleForm.grades.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {gradeScaleForm.grades.map((g, i) => (
                        <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-sm font-bold text-gray-700 w-12">{g.grade}</span>
                          <span className="text-xs text-gray-500 flex-1">
                            {g.minScore}–{g.maxScore} &middot; {g.description}
                          </span>
                          {g.isPassing ? (
                            <span className="text-[9px] font-bold bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded">PASS</span>
                          ) : (
                            <span className="text-[9px] font-bold bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded">FAIL</span>
                          )}
                          <button
                            onClick={() => setGradeScaleForm(f => ({
                              ...f,
                              grades: f.grades!.filter((_, idx) => idx !== i)
                            }))}
                            className="p-1 text-gray-400 hover:text-rose-500 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newGradeRow.grade}
                        onChange={e => setNewGradeRow(r => ({ ...r, grade: e.target.value }))}
                        placeholder="Grade (e.g. A+)"
                        className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={newGradeRow.description}
                        onChange={e => setNewGradeRow(r => ({ ...r, description: e.target.value }))}
                        placeholder="Description"
                        className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        value={newGradeRow.minScore}
                        onChange={e => setNewGradeRow(r => ({ ...r, minScore: parseFloat(e.target.value) || 0 }))}
                        placeholder="Min Score"
                        className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        value={newGradeRow.maxScore}
                        onChange={e => setNewGradeRow(r => ({ ...r, maxScore: parseFloat(e.target.value) || 0 }))}
                        placeholder="Max Score"
                        className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newGradeRow.isPassing}
                          onChange={e => setNewGradeRow(r => ({ ...r, isPassing: e.target.checked }))}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs font-medium text-gray-600">Passing grade</span>
                      </label>
                      <button
                        onClick={() => {
                          if (!newGradeRow.grade.trim()) return;
                          setGradeScaleForm(f => ({
                            ...f,
                            grades: [...(f.grades || []), { ...newGradeRow }]
                          }));
                          setNewGradeRow({ grade: '', minScore: 0, maxScore: 100, description: '', isPassing: true, color: 'bg-blue-500' });
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => { setShowCreateGradeScale(false); resetGradeScaleForm(); }}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGradeScale}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-60"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Create Scale
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          MODAL: PUSH TO INSTITUTION
      ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showPushModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPushModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Send className="w-5 h-5 text-blue-600" />
                  Push to Institution
                </h3>
                <button onClick={() => setShowPushModal(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-500 mb-4">
                  Select an institution to deploy this template. The institution will receive the full academic configuration.
                </p>

                {institutions.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No institutions found</p>
                    <p className="text-xs text-gray-400 mt-1">Institutions need to be registered on the platform first.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {institutions.map(inst => (
                      <button
                        key={inst.id}
                        onClick={() => handlePushToInstitution(showPushModal, inst.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
                      >
                        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg p-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{inst.name || inst.id}</p>
                          <p className="text-[10px] text-gray-400">{inst.id}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setShowPushModal(null)}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function generateDefaultTemplates(): Omit<AcademicTemplate, 'id' | 'createdAt' | 'updatedAt'>[] {
  return [
    {
      name: 'B.Th Standard Curriculum',
      programType: 'B.Th',
      totalCredits: 126,
      totalSemesters: 8,
      gradingScale: 'letter',
      creditDistribution: { core: 76, elective: 25, ministry: 19, thesis: 6 },
      semesters: Array.from({ length: 8 }, (_, i) => ({
        semester: i + 1,
        courses: [],
        credits: i === 7 ? 18 : 16,
      })),
      isActive: true,
    },
    {
      name: 'M.Div Standard Curriculum',
      programType: 'M.Div',
      totalCredits: 90,
      totalSemesters: 6,
      gradingScale: 'letter',
      creditDistribution: { core: 50, elective: 23, ministry: 12, thesis: 5 },
      semesters: Array.from({ length: 6 }, (_, i) => ({
        semester: i + 1,
        courses: [],
        credits: i === 5 ? 15 : 15,
      })),
      isActive: true,
    },
    {
      name: 'Th.M Standard Curriculum',
      programType: 'Th.M',
      totalCredits: 60,
      totalSemesters: 4,
      gradingScale: 'gpa',
      creditDistribution: { core: 30, elective: 15, ministry: 6, thesis: 9 },
      semesters: Array.from({ length: 4 }, (_, i) => ({
        semester: i + 1,
        courses: [],
        credits: i === 3 ? 12 : 16,
      })),
      isActive: true,
    },
    {
      name: 'PhD Standard Curriculum',
      programType: 'PhD',
      totalCredits: 72,
      totalSemesters: 6,
      gradingScale: 'gpa',
      creditDistribution: { core: 29, elective: 14, ministry: 4, thesis: 25 },
      semesters: Array.from({ length: 6 }, (_, i) => ({
        semester: i + 1,
        courses: [],
        credits: i === 5 ? 12 : 12,
      })),
      isActive: true,
    },
    {
      name: 'D.Min Standard Curriculum',
      programType: 'D.Min',
      totalCredits: 48,
      totalSemesters: 4,
      gradingScale: 'gpa',
      creditDistribution: { core: 22, elective: 10, ministry: 8, thesis: 8 },
      semesters: Array.from({ length: 4 }, (_, i) => ({
        semester: i + 1,
        courses: [],
        credits: i === 3 ? 12 : 12,
      })),
      isActive: true,
    },
  ];
}

function formatPolicyLabel(key: string): string {
  return key
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function getPolicyUnit(key: string): string {
  if (key.includes('gpa')) return 'GPA';
  if (key.includes('percentage') || key.includes('weight') || key.includes('attendance')) return '%';
  if (key.includes('load') || key.includes('credits') || key.includes('courses')) return 'cr';
  if (key.includes('days') || key.includes('period')) return 'days';
  return '';
}
