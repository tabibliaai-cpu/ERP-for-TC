import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  getDoc,
  doc,
  addDoc,
  updateDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  CheckCircle2,
  Building2,
  Cross,
  GraduationCap,
  Phone,
  Eye,
  Sparkles,
  Upload,
  Globe,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  Users,
  Briefcase,
  Tag,
  Loader2,
  Church,
} from 'lucide-react';

/* ────────────────────────── Types ────────────────────────── */

interface OnboardingWizardProps {
  userEmail: string;
  userId: string;
  onComplete: (institutionId: string) => void;
}

interface FormData {
  // Step 2 – Basic Information
  institutionName: string;
  institutionType: string;
  denomination: string;
  yearEstablished: string;
  physicalAddress: string;
  city: string;
  state: string;
  country: string;
  website: string;

  // Step 3 – Mission & Identity
  missionStatement: string;
  visionStatement: string;
  theologicalSpecialization: string;
  coreValues: string;
  accreditationStatus: string;
  accreditingBody: string;

  // Step 4 – Academic Programs
  programs: string[];
  facultyCount: string;
  studentCapacity: string;
  academicYear: string;
  semesterSystem: string;

  // Step 5 – Admin Contact
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  secondaryName: string;
  secondaryEmail: string;
  secondaryPhone: string;
}

/* ────────────────────────── Constants ────────────────────────── */

const STEPS = [
  { id: 0, name: 'Welcome', icon: Sparkles },
  { id: 1, name: 'Basic Info', icon: Building2 },
  { id: 2, name: 'Mission', icon: Cross },
  { id: 3, name: 'Academics', icon: GraduationCap },
  { id: 4, name: 'Contact', icon: Phone },
  { id: 5, name: 'Review', icon: CheckCircle2 },
] as const;

const INSTITUTION_TYPES = [
  'Seminary',
  'Bible College',
  'Theological University',
  'Divinity School',
  'Pastoral Training Center',
];

const DENOMINATIONS = [
  'Baptist',
  'Pentecostal',
  'Methodist',
  'Presbyterian',
  'Anglican',
  'Non-Denominational',
  'Other',
];

const THEOLOGICAL_SPECIALIZATIONS = [
  'Biblical Studies',
  'Systematic Theology',
  'Pastoral Theology',
  'Missions',
  'Christian Education',
  'Chaplaincy',
  'Youth Ministry',
  'Worship Arts',
];

const ACCREDITMENT_STATUSES = [
  'Accredited',
  'In Progress',
  'Not Accredited',
];

const PROGRAM_OPTIONS = [
  'B.Th',
  'M.Div',
  'Th.M',
  'PhD',
  'D.Min',
  'Certificate Programs',
  'Diploma',
];

const SEMESTER_SYSTEMS = ['Semester', 'Quarter', 'Trimester'];

const initialFormData: FormData = {
  institutionName: '',
  institutionType: '',
  denomination: '',
  yearEstablished: '',
  physicalAddress: '',
  city: '',
  state: '',
  country: '',
  website: '',
  missionStatement: '',
  visionStatement: '',
  theologicalSpecialization: '',
  coreValues: '',
  accreditationStatus: '',
  accreditingBody: '',
  programs: [],
  facultyCount: '',
  studentCapacity: '',
  academicYear: '',
  semesterSystem: '',
  adminName: '',
  adminEmail: '',
  adminPhone: '',
  secondaryName: '',
  secondaryEmail: '',
  secondaryPhone: '',
};

/* ────────────────────────── Helpers ────────────────────────── */

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20',
        className,
      )}
    >
      {children}
    </div>
  );
}

function GradientButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold',
        'hover:from-fuchsia-700 hover:to-violet-700 transition-all duration-200',
        'shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
        'flex items-center justify-center gap-2',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function OutlineButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'border border-fuchsia-200 text-fuchsia-600 px-6 py-3 rounded-xl font-semibold',
        'hover:bg-fuchsia-50 transition-all duration-200',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'flex items-center justify-center gap-2',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function InputField({
  label,
  icon: Icon,
  required,
  error,
  children,
}: {
  label: string;
  icon?: React.ElementType;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
        {Icon && <Icon className="w-4 h-4 text-fuchsia-500" />}
        {label}
        {required && <span className="text-fuchsia-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
}

function inputClasses(error?: string) {
  return cn(
    'w-full px-4 py-3 bg-white/60 border rounded-xl text-sm text-slate-800 placeholder:text-slate-400',
    'focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400',
    'transition-all duration-200',
    error ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 hover:border-slate-300',
  );
}

/* ────────────────────────── Validation ────────────────────────── */

function validateStep(step: number, data: FormData): string | null {
  switch (step) {
    case 1:
      if (!data.institutionName.trim()) return 'Institution name is required.';
      if (!data.institutionType) return 'Please select an institution type.';
      return null;
    case 2:
      if (!data.missionStatement.trim()) return 'Mission statement is required.';
      if (!data.theologicalSpecialization)
        return 'Please select a theological specialization.';
      if (data.accreditationStatus === 'Accredited' && !data.accreditingBody.trim())
        return 'Please enter the accrediting body name.';
      return null;
    case 3:
      if (data.programs.length === 0)
        return 'Please select at least one program.';
      return null;
    case 4:
      if (!data.adminName.trim()) return 'Admin name is required.';
      if (!data.adminPhone.trim()) return 'Admin phone number is required.';
      return null;
    case 5:
      return null;
    default:
      return null;
  }
}

/* ────────────────────────── Step Components ────────────────────────── */

function WelcomeStep({ onProceed }: { onProceed: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center text-center py-8"
    >
      {/* Animated logo area */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="relative mb-8"
      >
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-fuchsia-500/30">
          <Church className="w-14 h-14 text-white" />
        </div>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.4 }}
          className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg border-2 border-fuchsia-100 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.6 }}
          >
            <Check className="w-5 h-5 text-fuchsia-600" strokeWidth={3} />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Background decorative blobs */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-fuchsia-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-violet-200/20 rounded-full blur-3xl pointer-events-none" />

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-fuchsia-600 to-violet-600 bg-clip-text text-transparent mb-3"
      >
        Welcome to CovenantERP
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="text-slate-500 max-w-md mb-2 text-base leading-relaxed"
      >
        Let&apos;s set up your institution profile. This will take about{' '}
        <span className="text-fuchsia-600 font-semibold">5 minutes</span>.
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="text-slate-400 text-sm max-w-sm mb-10"
      >
        We&apos;ll gather essential details about your theological institution to
        personalize your CovenantERP experience.
      </motion.p>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="flex flex-wrap justify-center gap-2 mb-10"
      >
        {['Student Management', 'Academic Records', 'Faculty Portal', 'Finance'].map(
          (feature) => (
            <span
              key={feature}
              className="px-3 py-1.5 bg-fuchsia-50 border border-fuchsia-100 rounded-full text-xs font-medium text-fuchsia-600"
            >
              {feature}
            </span>
          ),
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
      >
        <GradientButton onClick={onProceed} className="px-10 py-4 text-base">
          Get Started
          <ChevronRight className="w-5 h-5" />
        </GradientButton>
      </motion.div>
    </motion.div>
  );
}

function BasicInfoStep({ data, onChange }: { data: FormData; onChange: (d: FormData) => void }) {
  const update = (field: keyof FormData, value: string) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Basic Information</h3>
        <p className="text-sm text-slate-400">
          Tell us about your theological institution.
        </p>
      </div>

      <InputField label="College / Seminary Name" icon={Building2} required>
        <input
          type="text"
          value={data.institutionName}
          onChange={(e) => update('institutionName', e.target.value)}
          placeholder="e.g. Grace Theological Seminary"
          className={inputClasses(!data.institutionName.trim())}
        />
      </InputField>

      <InputField label="Institution Type" icon={GraduationCap} required>
        <select
          value={data.institutionType}
          onChange={(e) => update('institutionType', e.target.value)}
          className={inputClasses(!data.institutionType)}
        >
          <option value="">Select type...</option>
          {INSTITUTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </InputField>

      <InputField label="Denomination / Affiliation" icon={Cross}>
        <select
          value={data.denomination}
          onChange={(e) => update('denomination', e.target.value)}
          className={inputClasses()}
        >
          <option value="">Select denomination...</option>
          {DENOMINATIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </InputField>

      <InputField label="Year Established" icon={Calendar}>
        <input
          type="number"
          value={data.yearEstablished}
          onChange={(e) => update('yearEstablished', e.target.value)}
          placeholder="e.g. 1985"
          min="1800"
          max={new Date().getFullYear()}
          className={inputClasses()}
        />
      </InputField>

      <InputField label="Physical Address" icon={MapPin}>
        <textarea
          value={data.physicalAddress}
          onChange={(e) => update('physicalAddress', e.target.value)}
          placeholder="Street address..."
          rows={2}
          className={cn(inputClasses(), 'resize-none')}
        />
      </InputField>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InputField label="City" icon={MapPin}>
          <input
            type="text"
            value={data.city}
            onChange={(e) => update('city', e.target.value)}
            placeholder="City"
            className={inputClasses()}
          />
        </InputField>

        <InputField label="State / Province">
          <input
            type="text"
            value={data.state}
            onChange={(e) => update('state', e.target.value)}
            placeholder="State"
            className={inputClasses()}
          />
        </InputField>

        <InputField label="Country">
          <input
            type="text"
            value={data.country}
            onChange={(e) => update('country', e.target.value)}
            placeholder="Country"
            className={inputClasses()}
          />
        </InputField>
      </div>

      <InputField label="Website URL" icon={Globe}>
        <input
          type="url"
          value={data.website}
          onChange={(e) => update('website', e.target.value)}
          placeholder="https://yourinstitution.edu"
          className={inputClasses()}
        />
      </InputField>

      {/* Logo upload placeholder */}
      <InputField label="Institution Logo" icon={Upload}>
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-fuchsia-300 hover:bg-fuchsia-50/30 transition-all cursor-pointer group">
          <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2 group-hover:text-fuchsia-400 transition-colors" />
          <p className="text-sm text-slate-400 group-hover:text-fuchsia-500 transition-colors">
            Click to upload logo
          </p>
          <p className="text-xs text-slate-300 mt-1">PNG, JPG up to 2MB</p>
        </div>
      </InputField>
    </div>
  );
}

function MissionIdentityStep({ data, onChange }: { data: FormData; onChange: (d: FormData) => void }) {
  const update = (field: keyof FormData, value: string) => onChange({ ...data, [field]: value });

  const [tagInput, setTagInput] = useState('');

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().replace(/,$/, '');
      if (tag) {
        const current = data.coreValues
          ? data.coreValues.split(',').map((v) => v.trim()).filter(Boolean)
          : [];
        if (!current.includes(tag)) {
          update('coreValues', [...current, tag].join(', '));
        }
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const current = data.coreValues
      ? data.coreValues.split(',').map((v) => v.trim()).filter(Boolean)
      : [];
    update(
      'coreValues',
      current.filter((t) => t !== tagToRemove).join(', '),
    );
  };

  const currentTags = data.coreValues
    ? data.coreValues.split(',').map((v) => v.trim()).filter(Boolean)
    : [];

  return (
    <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Mission &amp; Identity</h3>
        <p className="text-sm text-slate-400">
          Define what makes your institution unique.
        </p>
      </div>

      <InputField label="Mission Statement" icon={Cross} required>
        <textarea
          value={data.missionStatement}
          onChange={(e) => update('missionStatement', e.target.value)}
          placeholder="What is the primary mission of your institution?"
          rows={3}
          className={cn(inputClasses(), 'resize-none')}
        />
      </InputField>

      <InputField label="Vision Statement" icon={Eye}>
        <textarea
          value={data.visionStatement}
          onChange={(e) => update('visionStatement', e.target.value)}
          placeholder="Where do you see your institution in the next decade?"
          rows={3}
          className={cn(inputClasses(), 'resize-none')}
        />
      </InputField>

      <InputField label="Theological Specialization" icon={BookOpen} required>
        <select
          value={data.theologicalSpecialization}
          onChange={(e) => update('theologicalSpecialization', e.target.value)}
          className={inputClasses(!data.theologicalSpecialization)}
        >
          <option value="">Select specialization...</option>
          {THEOLOGICAL_SPECIALIZATIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </InputField>

      <InputField label="Core Values" icon={Tag}>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5 min-h-[32px]">
            {currentTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-fuchsia-50 border border-fuchsia-200 rounded-lg text-xs font-medium text-fuchsia-700"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-0.5 text-fuchsia-400 hover:text-fuchsia-700 transition-colors"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Type a value and press Enter..."
            className={inputClasses()}
          />
          <p className="text-xs text-slate-400">Press Enter or comma to add each value</p>
        </div>
      </InputField>

      <InputField label="Accreditation Status" icon={Award}>
        <select
          value={data.accreditationStatus}
          onChange={(e) => update('accreditationStatus', e.target.value)}
          className={inputClasses()}
        >
          <option value="">Select status...</option>
          {ACCREDITMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </InputField>

      {data.accreditationStatus === 'Accredited' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <InputField label="Accrediting Body" icon={Award} required>
            <input
              type="text"
              value={data.accreditingBody}
              onChange={(e) => update('accreditingBody', e.target.value)}
              placeholder="e.g. Association of Theological Schools (ATS)"
              className={inputClasses(!data.accreditingBody.trim())}
            />
          </InputField>
        </motion.div>
      )}
    </div>
  );
}

function AcademicProgramsStep({ data, onChange }: { data: FormData; onChange: (d: FormData) => void }) {
  const update = (field: keyof FormData, value: string) => onChange({ ...data, [field]: value });

  const toggleProgram = (program: string) => {
    const programs = data.programs.includes(program)
      ? data.programs.filter((p) => p !== program)
      : [...data.programs, program];
    onChange({ ...data, programs });
  };

  return (
    <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Academic Programs</h3>
        <p className="text-sm text-slate-400">
          Configure your academic structure.
        </p>
      </div>

      <InputField label="Available Programs" icon={GraduationCap} required>
        <div className="grid grid-cols-2 gap-2">
          {PROGRAM_OPTIONS.map((prog) => (
            <button
              key={prog}
              type="button"
              onClick={() => toggleProgram(prog)}
              className={cn(
                'px-3 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 text-left',
                data.programs.includes(prog)
                  ? 'bg-fuchsia-50 border-fuchsia-300 text-fuchsia-700 shadow-sm'
                  : 'bg-white/60 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-white/80',
              )}
            >
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    'w-4 h-4 rounded border flex items-center justify-center transition-all',
                    data.programs.includes(prog)
                      ? 'bg-fuchsia-600 border-fuchsia-600'
                      : 'border-slate-300',
                  )}
                >
                  {data.programs.includes(prog) && (
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  )}
                </span>
                {prog}
              </span>
            </button>
          ))}
        </div>
      </InputField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Total Faculty Count" icon={Users}>
          <input
            type="number"
            value={data.facultyCount}
            onChange={(e) => update('facultyCount', e.target.value)}
            placeholder="e.g. 25"
            min="1"
            className={inputClasses()}
          />
        </InputField>

        <InputField label="Total Student Capacity" icon={Users}>
          <input
            type="number"
            value={data.studentCapacity}
            onChange={(e) => update('studentCapacity', e.target.value)}
            placeholder="e.g. 500"
            min="1"
            className={inputClasses()}
          />
        </InputField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Current Academic Year" icon={Calendar}>
          <input
            type="text"
            value={data.academicYear}
            onChange={(e) => update('academicYear', e.target.value)}
            placeholder="e.g. 2024-2025"
            className={inputClasses()}
          />
        </InputField>

        <InputField label="Semester System" icon={BookOpen}>
          <select
            value={data.semesterSystem}
            onChange={(e) => update('semesterSystem', e.target.value)}
            className={inputClasses()}
          >
            <option value="">Select system...</option>
            {SEMESTER_SYSTEMS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </InputField>
      </div>
    </div>
  );
}

function AdminContactStep({ data, onChange }: { data: FormData; onChange: (d: FormData) => void }) {
  const update = (field: keyof FormData, value: string) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Admin Contact</h3>
        <p className="text-sm text-slate-400">
          Who should we contact regarding this account?
        </p>
      </div>

      {/* Primary admin */}
      <div className="space-y-4 p-4 bg-fuchsia-50/40 border border-fuchsia-100 rounded-xl">
        <p className="text-xs font-bold uppercase tracking-wider text-fuchsia-600">
          Primary Administrator
        </p>

        <InputField label="Admin Name" icon={Briefcase} required>
          <input
            type="text"
            value={data.adminName}
            onChange={(e) => update('adminName', e.target.value)}
            placeholder="Full name"
            className={inputClasses(!data.adminName.trim())}
          />
        </InputField>

        <InputField label="Admin Email" icon={Globe}>
          <input
            type="email"
            value={data.adminEmail}
            readOnly
            className={cn(
              inputClasses(),
              'bg-slate-100 cursor-not-allowed text-slate-500',
            )}
          />
          <p className="text-xs text-slate-400 mt-1">Pre-filled from your account</p>
        </InputField>

        <InputField label="Admin Phone Number" icon={Phone} required>
          <input
            type="tel"
            value={data.adminPhone}
            onChange={(e) => update('adminPhone', e.target.value)}
            placeholder="+1 (555) 000-0000"
            className={inputClasses(!data.adminPhone.trim())}
          />
        </InputField>
      </div>

      {/* Secondary contact */}
      <div className="space-y-4 p-4 bg-slate-50/60 border border-slate-100 rounded-xl">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Secondary Contact
          <span className="ml-2 text-slate-400 font-normal normal-case">(optional)</span>
        </p>

        <InputField label="Contact Name" icon={Briefcase}>
          <input
            type="text"
            value={data.secondaryName}
            onChange={(e) => update('secondaryName', e.target.value)}
            placeholder="Full name"
            className={inputClasses()}
          />
        </InputField>

        <InputField label="Contact Email" icon={Globe}>
          <input
            type="email"
            value={data.secondaryEmail}
            onChange={(e) => update('secondaryEmail', e.target.value)}
            placeholder="email@example.com"
            className={inputClasses()}
          />
        </InputField>

        <InputField label="Contact Phone" icon={Phone}>
          <input
            type="tel"
            value={data.secondaryPhone}
            onChange={(e) => update('secondaryPhone', e.target.value)}
            placeholder="+1 (555) 000-0000"
            className={inputClasses()}
          />
        </InputField>
      </div>
    </div>
  );
}

function ReviewStep({ data }: { data: FormData }) {
  const Section = ({
    title,
    icon: Icon,
    children,
  }: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-bold text-fuchsia-600 uppercase tracking-wider">
        <Icon className="w-4 h-4" />
        {title}
      </div>
      <div className="pl-6 space-y-1.5">{children}</div>
    </div>
  );

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-start gap-3">
      <span className="text-xs text-slate-400 w-32 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-slate-700 font-medium">{value || <em className="text-slate-300">Not provided</em>}</span>
    </div>
  );

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Review &amp; Confirm</h3>
        <p className="text-sm text-slate-400">
          Please verify all the information below before saving.
        </p>
      </div>

      <Section title="Basic Information" icon={Building2}>
        <Row label="Name" value={data.institutionName} />
        <Row label="Type" value={data.institutionType} />
        <Row label="Denomination" value={data.denomination} />
        <Row label="Est." value={data.yearEstablished} />
        <Row label="Address" value={[data.physicalAddress, data.city, data.state, data.country].filter(Boolean).join(', ')} />
        <Row label="Website" value={data.website} />
      </Section>

      <Section title="Mission & Identity" icon={Cross}>
        <Row label="Mission" value={data.missionStatement} />
        <Row label="Vision" value={data.visionStatement} />
        <Row label="Specialization" value={data.theologicalSpecialization} />
        <Row label="Core Values" value={data.coreValues} />
        <Row label="Accreditation" value={data.accreditationStatus} />
        {data.accreditationStatus === 'Accredited' && (
          <Row label="Accreditor" value={data.accreditingBody} />
        )}
      </Section>

      <Section title="Academic Programs" icon={GraduationCap}>
        <Row label="Programs" value={data.programs.join(', ')} />
        <Row label="Faculty" value={data.facultyCount ? `${data.facultyCount} members` : ''} />
        <Row label="Capacity" value={data.studentCapacity ? `${data.studentCapacity} students` : ''} />
        <Row label="Acad. Year" value={data.academicYear} />
        <Row label="System" value={data.semesterSystem} />
      </Section>

      <Section title="Admin Contact" icon={Phone}>
        <Row label="Name" value={data.adminName} />
        <Row label="Email" value={data.adminEmail} />
        <Row label="Phone" value={data.adminPhone} />
        {data.secondaryName && <Row label="Sec. Name" value={data.secondaryName} />}
        {data.secondaryEmail && <Row label="Sec. Email" value={data.secondaryEmail} />}
        {data.secondaryPhone && <Row label="Sec. Phone" value={data.secondaryPhone} />}
      </Section>
    </div>
  );
}

/* ────────────────────────── Progress Bar ────────────────────────── */

function ProgressBar({
  currentStep,
  onStepClick,
}: {
  currentStep: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <div className="w-full px-2">
      {/* Step indicators */}
      <div className="flex items-center justify-between relative">
        {/* Background track */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 mx-8" />
        {/* Active track */}
        <motion.div
          className="absolute top-5 h-0.5 bg-gradient-to-r from-fuchsia-500 to-violet-500 mx-8"
          initial={false}
          animate={{
            left: `${(currentStep / (STEPS.length - 1)) * 100}%`,
            right: currentStep >= STEPS.length - 1 ? '0%' : undefined,
            width: currentStep < STEPS.length - 1 ? `${(1 - currentStep / (STEPS.length - 1)) * 100}%` : undefined,
          }}
          style={{ left: 0, right: 'auto' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />

        {STEPS.map((step) => {
          const isActive = step.id <= currentStep;
          const isCurrent = step.id === currentStep;
          const Icon = step.icon;

          return (
            <button
              key={step.id}
              onClick={() => {
                if (step.id <= currentStep) onStepClick(step.id);
              }}
              disabled={step.id > currentStep}
              className={cn(
                'relative flex flex-col items-center gap-1.5 z-10 group transition-all',
                step.id <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed',
              )}
            >
              <motion.div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  isCurrent
                    ? 'bg-gradient-to-br from-fuchsia-500 to-violet-600 border-transparent shadow-lg shadow-fuchsia-500/30'
                    : isActive
                      ? 'bg-fuchsia-100 border-fuchsia-400 text-fuchsia-600'
                      : 'bg-white border-slate-200 text-slate-300',
                )}
                whileHover={step.id <= currentStep ? { scale: 1.1 } : undefined}
                whileTap={step.id <= currentStep ? { scale: 0.95 } : undefined}
              >
                {isActive && step.id < currentStep ? (
                  <Check className="w-4 h-4" strokeWidth={3} />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </motion.div>
              <span
                className={cn(
                  'text-[10px] font-semibold tracking-wide transition-colors whitespace-nowrap',
                  isCurrent
                    ? 'text-fuchsia-600'
                    : isActive
                      ? 'text-slate-500'
                      : 'text-slate-300',
                )}
              >
                {step.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────── Main Wizard ────────────────────────── */

export function OnboardingWizard({ userEmail, userId, onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    ...initialFormData,
    adminEmail: userEmail,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  const goNext = useCallback(() => {
    const validationError = validateStep(currentStep, formData);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setDirection(1);
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  }, [currentStep, formData]);

  const goBack = useCallback(() => {
    setError(null);
    setDirection(-1);
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      setError(null);
      setDirection(step > currentStep ? 1 : -1);
      setCurrentStep(step);
    },
    [currentStep],
  );

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Save to Firestore institutions collection
      const docRef = await addDoc(collection(db, 'institutions'), {
        ...formData,
        createdBy: userId,
        createdAt: serverTimestamp(),
        onboarding_complete: true,
      });

      // Update user document
      try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          await updateDoc(userDocRef, {
            onboarding_complete: true,
            institution_id: docRef.id,
          });
        } else {
          // Create user doc if it doesn't exist
          const { setDoc: fdSetDoc } = await import('firebase/firestore');
          await fdSetDoc(userDocRef, {
            email: userEmail,
            onboarding_complete: true,
            institution_id: docRef.id,
            createdAt: serverTimestamp(),
          });
        }
      } catch (userErr) {
        console.warn('Could not update user document, continuing:', userErr);
      }

      onComplete(docRef.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(`Failed to save profile: ${message}`);
    } finally {
      setIsSaving(false);
    }
  }, [formData, userId, userEmail, onComplete]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-fuchsia-50/30 to-violet-50/40 p-4 md:p-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-fuchsia-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-fuchsia-100/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="p-6 md:p-8">
            {/* Progress bar – hidden on welcome step */}
            {currentStep > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <ProgressBar currentStep={currentStep - 1} onStepClick={goToStep} />
              </motion.div>
            )}

            {/* Step content */}
            <div className="relative min-h-[400px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  {currentStep === 0 && <WelcomeStep onProceed={goNext} />}
                  {currentStep === 1 && (
                    <BasicInfoStep data={formData} onChange={setFormData} />
                  )}
                  {currentStep === 2 && (
                    <MissionIdentityStep data={formData} onChange={setFormData} />
                  )}
                  {currentStep === 3 && (
                    <AcademicProgramsStep data={formData} onChange={setFormData} />
                  )}
                  {currentStep === 4 && (
                    <AdminContactStep data={formData} onChange={setFormData} />
                  )}
                  {currentStep === 5 && <ReviewStep data={formData} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <p className="text-sm text-rose-600 font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            {currentStep > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100"
              >
                <div>
                  {currentStep > 1 && (
                    <OutlineButton onClick={goBack}>
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </OutlineButton>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Skip button for steps 2-4 (non-required fields are optional) */}
                  {currentStep >= 2 && currentStep <= 4 && (
                    <button
                      onClick={goNext}
                      className="text-sm text-slate-400 hover:text-slate-600 font-medium px-3 py-2 transition-colors"
                    >
                      Skip optional
                    </button>
                  )}

                  {currentStep < 5 ? (
                    <GradientButton onClick={goNext}>
                      Continue
                      <ChevronRight className="w-4 h-4" />
                    </GradientButton>
                  ) : (
                    <GradientButton
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-8"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Save &amp; Launch Dashboard
                        </>
                      )}
                    </GradientButton>
                  )}
                </div>
              </motion.div>
            )}
          </GlassCard>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-xs text-slate-400 mt-4"
          >
            Step {currentStep + 1} of {STEPS.length} &middot; Your data is saved securely
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
