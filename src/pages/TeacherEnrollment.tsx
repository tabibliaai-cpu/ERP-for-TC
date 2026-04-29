import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Users, Save, ChevronRight, ChevronDown, ChevronUp, Camera, X,
  Church, BookOpen, Briefcase, DollarSign, Heart, FileText, Star,
  ShieldCheck, Home, Stethoscope, Award, Phone, Mail, MapPin,
  Calendar, CalendarDays, Globe, Cross, Target, Flame, Upload, Settings, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import {
  facultyService,
  type Faculty,
  type TeacherSpiritualProfile,
  type TeacherQualification,
  type TeacherEmployment,
  type TeacherPayroll,
  type TeacherAccommodation,
  type TeacherMedical,
  type TeacherDocument,
  type TeacherMinistryCalling,
} from '../services/dataService';
import { useAuthStore } from '../store/useStore';

// ===================================================================
// SECTION DEFINITIONS
// ===================================================================

interface SectionDef {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

const SECTIONS: SectionDef[] = [
  { id: 'basic', label: 'Basic Information', icon: Users, description: 'Personal identity and demographics' },
  { id: 'contact', label: 'Contact Details', icon: Phone, description: 'Phone, email, address, emergency contact' },
  { id: 'spiritual', label: 'Spiritual Profile', icon: Church, description: 'Conversion, baptism, church, spiritual gifts' },
  { id: 'qualifications', label: 'Academic & Theological Qualifications', icon: BookOpen, description: 'Degrees, seminary, specialization, certifications' },
  { id: 'employment', label: 'Employment Details', icon: Briefcase, description: 'Role, department, joining, experience' },
  { id: 'ministry', label: 'Ministry & Calling', icon: Target, description: 'Calling type, ordination, field experience' },
  { id: 'payroll', label: 'Payroll & Financials', icon: DollarSign, description: 'Salary structure, bank details, tax info' },
  { id: 'accommodation', label: 'Accommodation & Facilities', icon: Home, description: 'Hostel, room, transport' },
  { id: 'medical', label: 'Medical Information', icon: Stethoscope, description: 'Health, insurance, emergency' },
  { id: 'documents', label: 'Documents Management', icon: FileText, description: 'Upload certificates, ID proofs, ordination' },
  { id: 'performance', label: 'Performance & Evaluation', icon: Star, description: 'Teaching quality, ministry impact scores' },
  { id: 'teaching', label: 'Teaching Assignment', icon: CalendarDays, description: 'Assigned courses, batch, subjects, schedule, lecture hours' },
  { id: 'attendance', label: 'Attendance & Leave Config', icon: Calendar, description: 'Leave balance, attendance tracking setup' },
  { id: 'permissions', label: 'User Roles & Permissions', icon: ShieldCheck, description: 'Dashboard access, feature permissions, role assignment' },
  { id: 'content', label: 'Content & Learning Mgmt', icon: Upload, description: 'Material upload access, assignment and exam creation' },
  { id: 'admin', label: 'Admin Controls', icon: Settings, description: 'Approval status, institution mapping, monitoring' },
  { id: 'security', label: 'Security & Compliance', icon: Lock, description: 'E2E encryption, audit trails, data protection' },
];

const SPIRITUAL_GIFTS = ['Teaching', 'Leadership', 'Pastoral Care', 'Evangelism', 'Prophecy', 'Healing', 'Wisdom', 'Knowledge', 'Faith', 'Miracles', 'Administration', 'Helps', 'Mercy', 'Music', 'Tongues', 'Interpretation'];

const DEPARTMENTS = ['Theology', 'Old Testament', 'New Testament', 'Systematic Theology', 'Homiletics', 'Church History', 'Pastoral Theology', 'Biblical Languages', 'Mission Studies', 'Christian Ethics', 'Youth Ministry', 'Worship & Music'];

const THEOLOGICAL_DEGREES = ['B.Th', 'B.D.', 'M.Div', 'M.Th', 'Th.M', 'PhD', 'D.Min', 'D.Th', 'Certificate', 'Diploma'];

// ===================================================================
// REUSABLE FORM COMPONENTS
// ===================================================================

function FormField({ label, children, required = false, span = 1 }: { label: string; children: React.ReactNode; required?: boolean; span?: number }) {
  return (
    <div className={cn(span === 2 && "col-span-2")}>
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide pl-1 mb-2 block">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', placeholder, required, disabled, span }: {
  label: string; value: string | number | undefined; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; disabled?: boolean; span?: number;
}) {
  return (
    <FormField label={label} required={required} span={span}>
      <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        className={cn(
          "w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-lg outline-none font-bold text-sm transition-all",
          disabled ? "opacity-50 cursor-not-allowed" : "focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
          type === 'number' && "font-mono"
        )} />
    </FormField>
  );
}

function SelectField({ label, value, onChange, options, required, span }: {
  label: string; value: string | number | undefined; onChange: (v: string) => void;
  options: { value: string; label: string }[]; required?: boolean; span?: number;
}) {
  return (
    <FormField label={label} required={required} span={span}>
      <select value={value ?? ''} onChange={e => onChange(e.target.value)}
        className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-lg outline-none text-[11px] font-black uppercase tracking-wide appearance-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
        <option value="">Select...</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </FormField>
  );
}

function TextAreaField({ label, value, onChange, placeholder, rows = 3, span }: {
  label: string; value: string | undefined; onChange: (v: string) => void;
  placeholder?: string; rows?: number; span?: number;
}) {
  return (
    <FormField label={label} span={span}>
      <textarea value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-lg outline-none font-medium text-sm transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none placeholder:text-slate-300" />
    </FormField>
  );
}

function CheckboxGroup({ label, options, selected, onToggle }: {
  label: string; options: string[]; selected: string[]; onToggle: (gift: string) => void;
}) {
  return (
    <FormField label={label}>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => onToggle(opt)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all border",
              selected.includes(opt)
                ? "bg-blue-50 text-blue-600 border-blue-200"
                : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
            )}>
            {opt}
          </button>
        ))}
      </div>
    </FormField>
  );
}

function SectionHeader({ section, isOpen, onToggle, sectionIndex }: { section: SectionDef; isOpen: boolean; onToggle: () => void; sectionIndex: number }) {
  return (
    <button type="button" onClick={onToggle}
      className="w-full flex items-center justify-between p-6 bg-white rounded-lg border border-slate-100 hover:shadow-sm transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
          <section.icon className="w-5 h-5 text-blue-600" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-300 uppercase tracking-wide">Section {sectionIndex + 1}</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 italic-serif">{section.label}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">{section.description}</p>
        </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
        {isOpen ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </div>
    </button>
  );
}

// ===================================================================
// MAIN COMPONENT
// ===================================================================

export function TeacherEnrollment() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('edit');

  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['basic']));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<Partial<Faculty>>({
    name: '', email: '', phone: '', department: 'Theology', role: 'Teacher',
    status: 'pending', gender: '', dob: '', nationality: 'Indian', maritalStatus: '',
    address: '', bio: '', expertise: '', officeHours: '',
    spiritual: {},
    qualifications: {},
    employment: { employmentType: 'Full-time' },
    ministry: {},
    payroll: {},
    accommodation: {},
    medical: {},
    documents: {},
    performance: {},
    permissions: [],
    teachingConfig: {},
    attendanceConfig: {},
    contentConfig: {},
    adminConfig: {},
    securityConfig: {},
    emergencyContact: { name: '', phone: '' },
  });

  // Load existing teacher for editing
  useEffect(() => {
    if (editId) {
      facultyService.getFacultyById(editId).then(teacher => {
        if (teacher) {
          setFormData(teacher);
          setOpenSections(new Set(['basic', 'contact', 'spiritual']));
        }
      }).catch(console.error);
    }
  }, [editId]);

  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNested = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...(prev[section] as any || {}), [field]: value }
    }));
  };

  const toggleGift = (gift: string) => {
    const current = formData.spiritual?.spiritualGifts || [];
    const updated = current.includes(gift) ? current.filter(g => g !== gift) : [...current, gift];
    updateNested('spiritual', 'spiritualGifts', updated);
  };

  const togglePermission = (perm: string) => {
    const current = formData.permissions || [];
    const updated = current.includes(perm) ? current.filter(p => p !== perm) : [...current, perm];
    updateField('permissions', updated);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => updateField('photoUrl', reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenantId) return;
    setIsSaving(true);
    setError(null);

    try {
      const employeeId = formData.employment?.employeeId || `EMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const facultyId = formData.facultyId || `FAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const saveData = {
        ...formData,
        facultyId,
        employment: { ...formData.employment, employeeId },
        tenantId: user.tenantId,
        createdBy: user.uid,
        status: editId ? formData.status : 'pending',
      };

      if (editId) {
        await facultyService.updateFaculty(editId, saveData);
      } else {
        await facultyService.addFaculty(saveData as Faculty);
      }

      setSuccess(true);
      setTimeout(() => navigate('/teachers'), 1500);
    } catch (err: any) {
      console.error("Failed to save teacher:", err);
      setError(err.message || "Failed to save teacher. Check permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-100 pb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium uppercase  text-blue-600">Teacher Management</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-xs font-medium uppercase  text-slate-400">{editId ? 'Edit Profile' : 'New Enrollment'}</span>
        </div>
        <h1 className="text-xl font-semibold text-slate-900">
          {editId ? 'Edit Teacher Profile' : 'Teacher Enrollment'}
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-lg">
          {editId ? `Updating profile for ${formData.name || 'this teacher'}.` : 'Register a new spiritual leader and educator. Treat them as ministers, not just employees.'}
        </p>
      </div>

      {/* Error / Success */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-4 rounded-lg flex items-center justify-between shadow-sm bg-rose-50 border border-rose-100 text-rose-700">
              <div className="flex items-center gap-3"><X className="w-5 h-5" /><span className="text-xs font-medium uppercase tracking-wide">{error}</span></div>
              <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-4 rounded-lg shadow-sm bg-emerald-50 border border-emerald-100 text-emerald-700">
              <span className="text-xs font-medium uppercase tracking-wide">Teacher profile saved successfully! Redirecting...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Photo Upload Section */}
        <div className="flex justify-center py-6">
          <div className="relative group cursor-pointer w-28 h-28">
            <div className="w-full h-full rounded-lg overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center group-hover:border-blue-400 transition-colors">
              {formData.photoUrl ? (
                <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Users className="w-10 h-10 text-slate-300 group-hover:text-blue-400 transition-colors" />
              )}
            </div>
            <input type="file" accept="image/*" onChange={handlePhotoUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <div className="absolute -bottom-2 bg-white px-3 py-0.5 rounded-full border border-slate-200 text-xs font-medium uppercase tracking-wide shadow-sm left-1/2 transform -translate-x-1/2 flex items-center gap-1">
              <Camera className="w-3 h-3" /> Upload Photo
            </div>
          </div>
        </div>

        {/* ============================== SECTION 1: BASIC ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[0]} isOpen={openSections.has('basic')} onToggle={() => toggleSection('basic')} sectionIndex={0} />
          <AnimatePresence>
            {openSections.has('basic') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                <div className="p-8 bg-white rounded-lg border border-slate-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Full Legal Name" value={formData.name} onChange={v => updateField('name', v)} required placeholder="e.g. Dr. Samuel Johnson" span={2} />
                    <SelectField label="Gender" value={formData.gender} onChange={v => updateField('gender', v)}
                      options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }]} />
                    <InputField label="Date of Birth" value={formData.dob} onChange={v => updateField('dob', v)} type="date" />
                    <InputField label="Nationality" value={formData.nationality} onChange={v => updateField('nationality', v)} placeholder="e.g. Indian" />
                    <InputField label="National ID / Aadhaar" value={formData.nationalId} onChange={v => updateField('nationalId', v)} placeholder="ID Number" />
                    <InputField label="Passport Number" value={formData.passportNumber} onChange={v => updateField('passportNumber', v)} placeholder="Passport No." />
                    <SelectField label="Marital Status" value={formData.maritalStatus} onChange={v => updateField('maritalStatus', v)}
                      options={[{ value: 'Single', label: 'Single' }, { value: 'Married', label: 'Married' }, { value: 'Widowed', label: 'Widowed' }, { value: 'Divorced', label: 'Divorced' }]} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 2: CONTACT ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[1]} isOpen={openSections.has('contact')} onToggle={() => toggleSection('contact')} sectionIndex={1} />
          <AnimatePresence>
            {openSections.has('contact') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-white rounded-lg border border-slate-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Email Address" value={formData.email} onChange={v => updateField('email', v)} required type="email" placeholder="email@institution.com" />
                    <InputField label="Phone Number" value={formData.phone} onChange={v => updateField('phone', v)} required type="tel" placeholder="+91 98765 43210" />
                    <TextAreaField label="Full Address" value={formData.address} onChange={v => updateField('address', v)} placeholder="Street, City, State, PIN" span={2} />
                  </div>
                  <div className="border-t border-slate-100 pt-6">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-4 pl-1">Emergency Contact</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <InputField label="Emergency Contact Name" value={formData.emergencyContact?.name} onChange={v => setFormData(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact!, name: v } }))} placeholder="Name" />
                      <InputField label="Emergency Contact Phone" value={formData.emergencyContact?.phone} onChange={v => setFormData(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact!, phone: v } }))} placeholder="Phone" />
                      <InputField label="Relationship" value={formData.emergencyContact?.relationship} onChange={v => setFormData(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact!, relationship: v } }))} placeholder="e.g. Spouse" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 3: SPIRITUAL ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[2]} isOpen={openSections.has('spiritual')} onToggle={() => toggleSection('spiritual')} sectionIndex={2} />
          <AnimatePresence>
            {openSections.has('spiritual') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-indigo-50 rounded-lg border border-indigo-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Date of Conversion" value={formData.spiritual?.conversionDate} onChange={v => updateNested('spiritual', 'conversionDate', v)} type="date" />
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide pl-1 block">Baptized?</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={formData.spiritual?.isBaptized || false}
                            onChange={e => updateNested('spiritual', 'isBaptized', e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                          <span className="text-sm font-bold text-slate-700">Yes</span>
                        </label>
                      </div>
                    </div>
                    <InputField label="Baptism Date" value={formData.spiritual?.baptismDate} onChange={v => updateNested('spiritual', 'baptismDate', v)} type="date" />
                    <InputField label="Baptism Church" value={formData.spiritual?.baptismChurch} onChange={v => updateNested('spiritual', 'baptismChurch', v)} placeholder="Church Name" />
                    <InputField label="Current Church" value={formData.spiritual?.currentChurch} onChange={v => updateNested('spiritual', 'currentChurch', v)} placeholder="Church Name" />
                    <InputField label="Pastor Name" value={formData.spiritual?.pastorName} onChange={v => updateNested('spiritual', 'pastorName', v)} placeholder="Pastor Name" />
                    <InputField label="Years in Ministry" value={formData.spiritual?.yearsInMinistry} onChange={v => updateNested('spiritual', 'yearsInMinistry', parseInt(v) || 0)} type="number" />
                    <InputField label="Ministry Involvement" value={formData.spiritual?.ministryInvolvement} onChange={v => updateNested('spiritual', 'ministryInvolvement', v)} placeholder="Describe ministry involvement" />
                    <TextAreaField label="Personal Testimony" value={formData.spiritual?.personalTestimony} onChange={v => updateNested('spiritual', 'personalTestimony', v)} placeholder="Share their testimony..." span={2} rows={4} />
                    <TextAreaField label="Statement of Faith" value={formData.spiritual?.statementOfFaith} onChange={v => updateNested('spiritual', 'statementOfFaith', v)} placeholder="Statement of faith..." span={2} rows={3} />
                  </div>
                  <CheckboxGroup label="Spiritual Gifts" options={SPIRITUAL_GIFTS}
                    selected={formData.spiritual?.spiritualGifts || []} onToggle={toggleGift} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 4: QUALIFICATIONS ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[3]} isOpen={openSections.has('qualifications')} onToggle={() => toggleSection('qualifications')} sectionIndex={3} />
          <AnimatePresence>
            {openSections.has('qualifications') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-white rounded-lg border border-slate-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField label="Highest Qualification" value={formData.qualifications?.highestQualification} onChange={v => updateNested('qualifications', 'highestQualification', v)}
                      options={[
                        { value: 'High School', label: 'High School' }, { value: 'Bachelor', label: 'Bachelor' },
                        { value: 'Master', label: 'Master' }, { value: 'Doctorate', label: 'Doctorate' }, { value: 'Other', label: 'Other' }
                      ]} />
                    <SelectField label="Theological Degree" value={formData.qualifications?.theologicalDegree} onChange={v => updateNested('qualifications', 'theologicalDegree', v)}
                      options={THEOLOGICAL_DEGREES.map(d => ({ value: d, label: d }))} />
                    <InputField label="Bible School / Seminary" value={formData.qualifications?.seminaryName} onChange={v => updateNested('qualifications', 'seminaryName', v)} placeholder="e.g. SIBBC" />
                    <InputField label="Year of Completion" value={formData.qualifications?.yearOfCompletion} onChange={v => updateNested('qualifications', 'yearOfCompletion', v)} type="number" placeholder="2024" />
                    <SelectField label="Specialization" value={formData.qualifications?.specialization} onChange={v => updateNested('qualifications', 'specialization', v)}
                      options={[
                        { value: 'Old Testament', label: 'Old Testament' }, { value: 'New Testament', label: 'New Testament' },
                        { value: 'Systematic Theology', label: 'Systematic Theology' }, { value: 'Biblical Languages', label: 'Biblical Languages' },
                        { value: 'Homiletics', label: 'Homiletics' }, { value: 'Church History', label: 'Church History' },
                        { value: 'Pastoral Theology', label: 'Pastoral Theology' }, { value: 'Mission Studies', label: 'Mission Studies' },
                        { value: 'Christian Ethics', label: 'Christian Ethics' }, { value: 'Other', label: 'Other' }
                      ]} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 5: EMPLOYMENT ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[4]} isOpen={openSections.has('employment')} onToggle={() => toggleSection('employment')} sectionIndex={4} />
          <AnimatePresence>
            {openSections.has('employment') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-white rounded-lg border border-slate-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Employee ID (Auto-generated if empty)" value={formData.employment?.employeeId} onChange={v => updateNested('employment', 'employeeId', v)} disabled={!!editId} />
                    <SelectField label="Role" value={formData.employment?.role} onChange={v => updateNested('employment', 'role', v)}
                      options={[
                        { value: 'Teacher', label: 'Teacher' }, { value: 'Pastor', label: 'Pastor' },
                        { value: 'Visiting Faculty', label: 'Visiting Faculty' }, { value: 'Guest Lecturer', label: 'Guest Lecturer' },
                        { value: 'HOD', label: 'Head of Department' }, { value: 'Principal', label: 'Principal' }
                      ]} />
                    <SelectField label="Department" value={formData.department} onChange={v => updateField('department', v)}
                      options={DEPARTMENTS.map(d => ({ value: d, label: d }))} />
                    <InputField label="Date of Joining" value={formData.employment?.dateOfJoining} onChange={v => updateNested('employment', 'dateOfJoining', v)} type="date" />
                    <SelectField label="Employment Type" value={formData.employment?.employmentType} onChange={v => updateNested('employment', 'employmentType', v)}
                      options={[
                        { value: 'Full-time', label: 'Full-time' }, { value: 'Part-time', label: 'Part-time' },
                        { value: 'Contract', label: 'Contract' }, { value: 'Visiting', label: 'Visiting' }
                      ]} />
                    <InputField label="Years of Experience" value={formData.employment?.experienceYears} onChange={v => updateNested('employment', 'experienceYears', parseInt(v) || 0)} type="number" />
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <TextAreaField label="Office Hours" value={formData.officeHours} onChange={v => updateField('officeHours', v)} placeholder="e.g. Mon-Fri 9AM - 5PM" />
                    <TextAreaField label="Biography / About" value={formData.bio} onChange={v => updateField('bio', v)} placeholder="Brief professional and spiritual biography..." rows={4} />
                    <InputField label="Expertise / Specialization" value={formData.expertise} onChange={v => updateField('expertise', v)} placeholder="e.g. Old Testament Exegesis, Hebrew" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 6: MINISTRY ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[5]} isOpen={openSections.has('ministry')} onToggle={() => toggleSection('ministry')} sectionIndex={5} />
          <AnimatePresence>
            {openSections.has('ministry') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-amber-50 rounded-lg border border-amber-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField label="Calling Type" value={formData.ministry?.callingType} onChange={v => updateNested('ministry', 'callingType', v)}
                      options={[
                        { value: 'Teacher', label: 'Teacher' }, { value: 'Pastor', label: 'Pastor' },
                        { value: 'Missionary', label: 'Missionary' }, { value: 'Evangelist', label: 'Evangelist' },
                        { value: 'Prophet', label: 'Prophet' }, { value: 'Apostle', label: 'Apostle' }
                      ]} />
                    <SelectField label="Ordination Status" value={formData.ministry?.ordinationStatus} onChange={v => updateNested('ministry', 'ordinationStatus', v)}
                      options={[
                        { value: 'Ordained', label: 'Ordained' }, { value: 'Licensed', label: 'Licensed' },
                        { value: 'In-Process', label: 'In-Process' }, { value: 'Not-Applied', label: 'Not Applied' }
                      ]} />
                    <InputField label="Current Ministry Role" value={formData.ministry?.currentMinistryRole} onChange={v => updateNested('ministry', 'currentMinistryRole', v)} placeholder="e.g. Senior Pastor" />
                    <InputField label="Church Leadership Role" value={formData.ministry?.churchLeadershipRole} onChange={v => updateNested('ministry', 'churchLeadershipRole', v)} placeholder="e.g. Elder" />
                    <SelectField label="Field Experience" value={formData.ministry?.fieldExperience} onChange={v => updateNested('ministry', 'fieldExperience', v)}
                      options={[
                        { value: 'Rural', label: 'Rural' }, { value: 'Urban', label: 'Urban' },
                        { value: 'International', label: 'International' }, { value: 'Multi-context', label: 'Multi-context' }
                      ]} />
                    <TextAreaField label="Ministry Experience" value={formData.ministry?.ministryExperience} onChange={v => updateNested('ministry', 'ministryExperience', v)} placeholder="Describe ministry experience..." />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 7: PAYROLL ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[6]} isOpen={openSections.has('payroll')} onToggle={() => toggleSection('payroll')} sectionIndex={6} />
          <AnimatePresence>
            {openSections.has('payroll') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-white rounded-lg border border-slate-100 space-y-6">
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide bg-blue-50 p-3 rounded-lg flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> All financial data is encrypted end-to-end
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="Basic Salary (Monthly)" value={formData.payroll?.salaryStructure?.basic} onChange={v => updateNested('payroll', 'salaryStructure', { ...formData.payroll?.salaryStructure, basic: parseFloat(v) || 0 })} type="number" />
                    <InputField label="HRA" value={formData.payroll?.salaryStructure?.hra} onChange={v => updateNested('payroll', 'salaryStructure', { ...formData.payroll?.salaryStructure, hra: parseFloat(v) || 0 })} type="number" />
                    <InputField label="DA" value={formData.payroll?.salaryStructure?.da} onChange={v => updateNested('payroll', 'salaryStructure', { ...formData.payroll?.salaryStructure, da: parseFloat(v) || 0 })} type="number" />
                    <InputField label="Allowances" value={formData.payroll?.salaryStructure?.allowances} onChange={v => updateNested('payroll', 'salaryStructure', { ...formData.payroll?.salaryStructure, allowances: parseFloat(v) || 0 })} type="number" />
                    <InputField label="Deductions" value={formData.payroll?.salaryStructure?.deductions} onChange={v => updateNested('payroll', 'salaryStructure', { ...formData.payroll?.salaryStructure, deductions: parseFloat(v) || 0 })} type="number" />
                    <InputField label="Tax" value={formData.payroll?.salaryStructure?.tax} onChange={v => updateNested('payroll', 'salaryStructure', { ...formData.payroll?.salaryStructure, tax: parseFloat(v) || 0 })} type="number" />
                  </div>
                  <div className="border-t border-slate-100 pt-6">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-4 pl-1">Bank Details</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField label="Bank Name" value={formData.payroll?.bankDetails?.bankName} onChange={v => updateNested('payroll', 'bankDetails', { ...formData.payroll?.bankDetails, bankName: v })} placeholder="Bank Name" />
                      <InputField label="Account Number" value={formData.payroll?.bankDetails?.accountNumber} onChange={v => updateNested('payroll', 'bankDetails', { ...formData.payroll?.bankDetails, accountNumber: v })} placeholder="Account No." />
                      <InputField label="IFSC Code" value={formData.payroll?.bankDetails?.ifscCode} onChange={v => updateNested('payroll', 'bankDetails', { ...formData.payroll?.bankDetails, ifscCode: v })} placeholder="IFSC" />
                      <InputField label="Account Holder" value={formData.payroll?.bankDetails?.accountHolder} onChange={v => updateNested('payroll', 'bankDetails', { ...formData.payroll?.bankDetails, accountHolder: v })} placeholder="Name on Account" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField label="Payment Frequency" value={formData.payroll?.paymentFrequency} onChange={v => updateNested('payroll', 'paymentFrequency', v)}
                      options={[{ value: 'Monthly', label: 'Monthly' }, { value: 'Bi-weekly', label: 'Bi-weekly' }, { value: 'One-time', label: 'One-time' }]} />
                    <InputField label="PAN Number" value={formData.payroll?.panNumber} onChange={v => updateNested('payroll', 'panNumber', v)} placeholder="PAN" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 8: ACCOMMODATION ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[7]} isOpen={openSections.has('accommodation')} onToggle={() => toggleSection('accommodation')} sectionIndex={7} />
          <AnimatePresence>
            {openSections.has('accommodation') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-white rounded-lg border border-slate-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide pl-1 block">Hostel / Staff Quarters Assigned</label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-lg">
                        <input type="checkbox" checked={formData.accommodation?.hostelAssigned || false}
                          onChange={e => updateNested('accommodation', 'hostelAssigned', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-bold text-slate-700">Yes, assigned</span>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide pl-1 block">Transport Facility</label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-lg">
                        <input type="checkbox" checked={formData.accommodation?.transportFacility || false}
                          onChange={e => updateNested('accommodation', 'transportFacility', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-bold text-slate-700">Yes, provided</span>
                      </label>
                    </div>
                    <InputField label="Room Details" value={formData.accommodation?.roomDetails} onChange={v => updateNested('accommodation', 'roomDetails', v)} placeholder="e.g. Room 204, Block A" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 9: MEDICAL ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[8]} isOpen={openSections.has('medical')} onToggle={() => toggleSection('medical')} sectionIndex={8} />
          <AnimatePresence>
            {openSections.has('medical') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-white rounded-lg border border-slate-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextAreaField label="Health Conditions" value={formData.medical?.healthConditions} onChange={v => updateNested('medical', 'healthConditions', v)} placeholder="Any known conditions..." />
                    <TextAreaField label="Emergency Medical Info" value={formData.medical?.emergencyMedicalInfo} onChange={v => updateNested('medical', 'emergencyMedicalInfo', v)} placeholder="Blood group, allergies, etc." />
                    <InputField label="Insurance Provider" value={formData.medical?.insuranceProvider} onChange={v => updateNested('medical', 'insuranceProvider', v)} placeholder="Insurance company" />
                    <InputField label="Insurance Number" value={formData.medical?.insuranceNumber} onChange={v => updateNested('medical', 'insuranceNumber', v)} placeholder="Policy number" />
                    <InputField label="Blood Group" value={formData.medical?.bloodGroup} onChange={v => updateNested('medical', 'bloodGroup', v)}
                      placeholder="e.g. B+, O-" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 10: DOCUMENTS ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[9]} isOpen={openSections.has('documents')} onToggle={() => toggleSection('documents')} sectionIndex={9} />
          <AnimatePresence>
            {openSections.has('documents') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-white rounded-lg border border-slate-100 space-y-6">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-4">Upload URLs for documents (Firebase Storage integration coming soon)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="ID Proof URL" value={formData.documents?.idProofUrl} onChange={v => updateNested('documents', 'idProofUrl', v)} placeholder="https://..." />
                    <InputField label="Aadhaar / Passport URL" value={formData.documents?.aadhaarOrPassportUrl} onChange={v => updateNested('documents', 'aadhaarOrPassportUrl', v)} placeholder="https://..." />
                    <InputField label="Ordination Certificate URL" value={formData.documents?.ordinationCertUrl} onChange={v => updateNested('documents', 'ordinationCertUrl', v)} placeholder="https://..." />
                    <InputField label="Resume / CV URL" value={formData.documents?.resumeUrl} onChange={v => updateNested('documents', 'resumeUrl', v)} placeholder="https://..." />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 11: PERFORMANCE ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[10]} isOpen={openSections.has('performance')} onToggle={() => toggleSection('performance')} sectionIndex={10} />
          <AnimatePresence>
            {openSections.has('performance') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-white rounded-lg border border-slate-100 space-y-6">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-4">Initial Performance Scores (1-10 scale)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Teaching Quality Score" value={formData.performance?.teachingQualityScore} onChange={v => updateNested('performance', 'teachingQualityScore', parseInt(v) || 0)} type="number" />
                    <InputField label="Ministry Impact Score" value={formData.performance?.ministryImpactScore} onChange={v => updateNested('performance', 'ministryImpactScore', parseInt(v) || 0)} type="number" />
                    <InputField label="Student Feedback Score" value={formData.performance?.studentFeedbackScore} onChange={v => updateNested('performance', 'studentFeedbackScore', parseInt(v) || 0)} type="number" />
                    <InputField label="Admin Rating" value={formData.performance?.adminRating} onChange={v => updateNested('performance', 'adminRating', parseInt(v) || 0)} type="number" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 12: TEACHING ASSIGNMENT ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[11]} isOpen={openSections.has('teaching')} onToggle={() => toggleSection('teaching')} sectionIndex={11} />
          <AnimatePresence>
            {openSections.has('teaching') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-white rounded-lg border border-slate-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Class / Batch" value={formData.teachingConfig?.classBatch} onChange={v => updateNested('teachingConfig', 'classBatch', v)} placeholder="e.g. 2024-Batch A" />
                    <InputField label="Weekly Lecture Hours" value={formData.teachingConfig?.weeklyLectureHours} onChange={v => updateNested('teachingConfig', 'weeklyLectureHours', parseInt(v) || 0)} type="number" />
                    <SelectField label="Mode" value={formData.teachingConfig?.mode} onChange={v => updateNested('teachingConfig', 'mode', v)}
                      options={[
                        { value: 'Online', label: 'Online' },
                        { value: 'Offline', label: 'Offline' },
                        { value: 'Hybrid', label: 'Hybrid' },
                      ]} />
                    <InputField label="Semester" value={formData.teachingConfig?.semester} onChange={v => updateNested('teachingConfig', 'semester', v)} placeholder="e.g. Fall 2024" />
                    <InputField label="Academic Year" value={formData.teachingConfig?.academicYear} onChange={v => updateNested('teachingConfig', 'academicYear', v)} placeholder="e.g. 2024-2025" />
                    <TextAreaField label="Subjects (comma-separated)" value={formData.teachingConfig?.subjects} onChange={v => updateNested('teachingConfig', 'subjects', v)} placeholder="e.g. Old Testament, Hebrew, Homiletics" rows={3} />
                    <TextAreaField label="Schedule Notes" value={formData.teachingConfig?.scheduleNotes} onChange={v => updateNested('teachingConfig', 'scheduleNotes', v)} placeholder="Any scheduling preferences or notes..." span={2} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 13: ATTENDANCE & LEAVE CONFIG ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[12]} isOpen={openSections.has('attendance')} onToggle={() => toggleSection('attendance')} sectionIndex={12} />
          <AnimatePresence>
            {openSections.has('attendance') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-white rounded-lg border border-slate-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Casual Leave Balance" value={formData.attendanceConfig?.casualLeave} onChange={v => updateNested('attendanceConfig', 'casualLeave', parseInt(v) || 0)} type="number" />
                    <InputField label="Medical Leave Balance" value={formData.attendanceConfig?.medicalLeave} onChange={v => updateNested('attendanceConfig', 'medicalLeave', parseInt(v) || 0)} type="number" />
                    <InputField label="Ministry Leave Balance" value={formData.attendanceConfig?.ministryLeave} onChange={v => updateNested('attendanceConfig', 'ministryLeave', parseInt(v) || 0)} type="number" />
                    <InputField label="Total Annual Leave" value={formData.attendanceConfig?.totalAnnualLeave} onChange={v => updateNested('attendanceConfig', 'totalAnnualLeave', parseInt(v) || 0)} type="number" />
                    <SelectField label="Leave Approval Workflow" value={formData.attendanceConfig?.leaveWorkflow} onChange={v => updateNested('attendanceConfig', 'leaveWorkflow', v)}
                      options={[
                        { value: 'Admin Only', label: 'Admin Only' },
                        { value: 'HOD + Admin', label: 'HOD + Admin' },
                        { value: 'Automatic', label: 'Automatic' },
                      ]} />
                    <SelectField label="Working Days" value={formData.attendanceConfig?.workingDays} onChange={v => updateNested('attendanceConfig', 'workingDays', v)}
                      options={[
                        { value: 'Monday-Friday', label: 'Monday-Friday' },
                        { value: 'Monday-Saturday', label: 'Monday-Saturday' },
                        { value: 'Custom', label: 'Custom' },
                      ]} />
                    <TextAreaField label="Notes" value={formData.attendanceConfig?.notes} onChange={v => updateNested('attendanceConfig', 'notes', v)} placeholder="Additional attendance/leave notes..." span={2} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 14: USER ROLES & PERMISSIONS ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[13]} isOpen={openSections.has('permissions')} onToggle={() => toggleSection('permissions')} sectionIndex={13} />
          <AnimatePresence>
            {openSections.has('permissions') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-blue-50 rounded-lg border border-blue-200 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField label="System Role" value={formData.adminConfig?.systemRole} onChange={v => updateNested('adminConfig', 'systemRole', v)}
                      options={[
                        { value: 'Faculty', label: 'Faculty' },
                        { value: 'HOD', label: 'HOD' },
                        { value: 'Principal', label: 'Principal' },
                        { value: 'Admin', label: 'Admin' },
                        { value: 'Librarian', label: 'Librarian' },
                      ]} />
                    <SelectField label="Dashboard Access Level" value={formData.adminConfig?.dashboardAccess} onChange={v => updateNested('adminConfig', 'dashboardAccess', v)}
                      options={[
                        { value: 'Full Dashboard', label: 'Full Dashboard' },
                        { value: 'Limited (Own Classes Only)', label: 'Limited (Own Classes Only)' },
                        { value: 'Read-Only', label: 'Read-Only' },
                      ]} />
                  </div>
                  <CheckboxGroup
                    label="Permissions"
                    options={['View Students', 'Enter Marks', 'Upload Materials', 'Manage Attendance', 'View Payroll', 'Manage Exams', 'Access Library', 'View Reports', 'Manage Courses']}
                    selected={formData.permissions || []}
                    onToggle={togglePermission}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 15: CONTENT & LEARNING MGMT ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[14]} isOpen={openSections.has('content')} onToggle={() => toggleSection('content')} sectionIndex={14} />
          <AnimatePresence>
            {openSections.has('content') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-white rounded-lg border border-slate-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide pl-1 block">Can Upload Lecture Notes</label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-lg">
                        <input type="checkbox" checked={formData.contentConfig?.canUploadLectureNotes || false}
                          onChange={e => updateNested('contentConfig', 'canUploadLectureNotes', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-bold text-slate-700">Yes, allowed</span>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide pl-1 block">Can Create Video Classes</label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-lg">
                        <input type="checkbox" checked={formData.contentConfig?.canCreateVideoClasses || false}
                          onChange={e => updateNested('contentConfig', 'canCreateVideoClasses', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-bold text-slate-700">Yes, allowed</span>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide pl-1 block">Can Create Assignments</label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-lg">
                        <input type="checkbox" checked={formData.contentConfig?.canCreateAssignments || false}
                          onChange={e => updateNested('contentConfig', 'canCreateAssignments', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-bold text-slate-700">Yes, allowed</span>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide pl-1 block">Can Create Exams</label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-lg">
                        <input type="checkbox" checked={formData.contentConfig?.canCreateExams || false}
                          onChange={e => updateNested('contentConfig', 'canCreateExams', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-bold text-slate-700">Yes, allowed</span>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide pl-1 block">Can Submit Grades</label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-lg">
                        <input type="checkbox" checked={formData.contentConfig?.canSubmitGrades || false}
                          onChange={e => updateNested('contentConfig', 'canSubmitGrades', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-bold text-slate-700">Yes, allowed</span>
                      </label>
                    </div>
                    <SelectField label="Max File Upload Size" value={formData.contentConfig?.maxUploadSize} onChange={v => updateNested('contentConfig', 'maxUploadSize', v)}
                      options={[
                        { value: '10MB', label: '10MB' },
                        { value: '50MB', label: '50MB' },
                        { value: '100MB', label: '100MB' },
                        { value: '500MB', label: '500MB' },
                      ]} />
                    <InputField label="Allowed File Types" value={formData.contentConfig?.allowedFileTypes} onChange={v => updateNested('contentConfig', 'allowedFileTypes', v)} placeholder="e.g. PDF, DOCX, PPTX, MP4" />
                    <TextAreaField label="Notes" value={formData.contentConfig?.notes} onChange={v => updateNested('contentConfig', 'notes', v)} placeholder="Content management notes..." span={2} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 16: ADMIN CONTROLS ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[15]} isOpen={openSections.has('admin')} onToggle={() => toggleSection('admin')} sectionIndex={15} />
          <AnimatePresence>
            {openSections.has('admin') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-slate-50 rounded-lg border border-slate-200 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField label="Approval Status" value={formData.status} onChange={v => updateField('status', v)}
                      options={[
                        { value: 'Pending Review', label: 'Pending Review' },
                        { value: 'Approved', label: 'Approved' },
                        { value: 'Rejected', label: 'Rejected' },
                        { value: 'On Probation', label: 'On Probation' },
                      ]} />
                    {!editId && <p className="text-[9px] text-amber-500 font-bold col-span-2 pl-1">Approval status can only be changed in edit mode</p>}
                    <TextAreaField label="Assigned Institutions (comma-separated)" value={formData.adminConfig?.assignedInstitutions} onChange={v => updateNested('adminConfig', 'assignedInstitutions', v)} placeholder="e.g. Main Campus, Extension Center" />
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide pl-1 block">Activity Monitoring Enabled</label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-lg border border-slate-100">
                        <input type="checkbox" checked={formData.adminConfig?.activityMonitoring || false}
                          onChange={e => updateNested('adminConfig', 'activityMonitoring', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-bold text-slate-700">Yes, enabled</span>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide pl-1 block">Login Tracking Enabled</label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-lg border border-slate-100">
                        <input type="checkbox" checked={formData.adminConfig?.loginTracking || false}
                          onChange={e => updateNested('adminConfig', 'loginTracking', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-bold text-slate-700">Yes, enabled</span>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide pl-1 block">Two-Factor Authentication Required</label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-lg border border-slate-100">
                        <input type="checkbox" checked={formData.adminConfig?.twoFactorAuth || false}
                          onChange={e => updateNested('adminConfig', 'twoFactorAuth', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-bold text-slate-700">Yes, required</span>
                      </label>
                    </div>
                    {formData.status === 'On Probation' && (
                      <InputField label="Probation End Date" value={formData.adminConfig?.probationEndDate} onChange={v => updateNested('adminConfig', 'probationEndDate', v)} type="date" />
                    )}
                    <TextAreaField label="Admin Notes" value={formData.adminConfig?.adminNotes} onChange={v => updateNested('adminConfig', 'adminNotes', v)} placeholder="Internal admin notes..." span={2} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 17: SECURITY & COMPLIANCE ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[16]} isOpen={openSections.has('security')} onToggle={() => toggleSection('security')} sectionIndex={16} />
          <AnimatePresence>
            {openSections.has('security') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-emerald-50 rounded-lg border border-emerald-100 space-y-6">
                  <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide bg-emerald-50 p-3 rounded-lg flex items-center gap-2 border border-emerald-100">
                    <Lock className="w-4 h-4" /> All sensitive data is encrypted end-to-end by default
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide pl-1 block">Personal Data Encrypted</label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-lg border border-emerald-100">
                        <input type="checkbox" checked={formData.securityConfig?.personalDataEncrypted ?? true} disabled
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-bold text-emerald-700">Always encrypted (default)</span>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide pl-1 block">Spiritual Records Encrypted</label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-lg border border-emerald-100">
                        <input type="checkbox" checked={formData.securityConfig?.spiritualDataEncrypted ?? true} disabled
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-bold text-emerald-700">Always encrypted (default)</span>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide pl-1 block">Financial Data Encrypted</label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-lg border border-emerald-100">
                        <input type="checkbox" checked={formData.securityConfig?.financialDataEncrypted ?? true} disabled
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-bold text-emerald-700">Always encrypted (default)</span>
                      </label>
                    </div>
                    <SelectField label="Activity Log Retention" value={formData.securityConfig?.logRetention} onChange={v => updateNested('securityConfig', 'logRetention', v)}
                      options={[
                        { value: '30 Days', label: '30 Days' },
                        { value: '90 Days', label: '90 Days' },
                        { value: '1 Year', label: '1 Year' },
                        { value: 'Permanent', label: 'Permanent' },
                      ]} />
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide pl-1 block">Data Sharing Consent</label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-lg border border-emerald-100">
                        <input type="checkbox" checked={formData.securityConfig?.dataSharingConsent || false}
                          onChange={e => updateNested('securityConfig', 'dataSharingConsent', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-bold text-slate-700">I consent to institutional data sharing</span>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide pl-1 block">GDPR / Data Protection Compliant</label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-lg border border-emerald-100">
                        <input type="checkbox" checked={formData.securityConfig?.gdprCompliant || false}
                          onChange={e => updateNested('securityConfig', 'gdprCompliant', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-bold text-slate-700">Compliant with data protection regulations</span>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SUBMIT ============================== */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <button type="button" onClick={() => navigate('/teachers')}
            className="px-6 py-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wide">
            Cancel
          </button>
          <button type="submit" disabled={isSaving}
            className="px-8 py-3.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all uppercase tracking-wide flex items-center gap-2  disabled:opacity-50 disabled:cursor-not-allowed">
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : editId ? 'Update Profile' : 'Enroll Teacher'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
