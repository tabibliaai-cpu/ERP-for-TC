import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Users, Save, ChevronRight, ChevronDown, ChevronUp, Camera, X,
  Church, BookOpen, DollarSign, Home, Stethoscope, FileText, ShieldCheck,
  Phone, GraduationCap, Building, Target, CheckCircle, Upload, Cross,
  Heart, Award, ClipboardCheck, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import {
  studentService,
  type Student,
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
  { id: 'basic', label: 'Basic Information', icon: Users, description: 'Personal identity, photo, demographics' },
  { id: 'contact', label: 'Contact Details', icon: Phone, description: 'Email, phone, addresses, emergency contact' },
  { id: 'family', label: 'Family & Guardian', icon: Home, description: 'Parent and guardian information' },
  { id: 'spiritual', label: 'Spiritual Profile', icon: Church, description: 'Conversion, baptism, church, spiritual gifts' },
  { id: 'education', label: 'Previous Education', icon: GraduationCap, description: 'Academic background before enrollment' },
  { id: 'program', label: 'Program Enrollment', icon: BookOpen, description: 'Program, department, semester, year' },
  { id: 'accommodation', label: 'Accommodation & Transport', icon: Building, description: 'Hostel, room allocation, transport' },
  { id: 'financial', label: 'Financial Information', icon: DollarSign, description: 'Fee structure, scholarship, payment plan' },
  { id: 'medical', label: 'Medical Information', icon: Stethoscope, description: 'Health conditions, allergies, disability' },
  { id: 'documents', label: 'Documents Upload', icon: FileText, description: 'ID proof, certificates, recommendations' },
  { id: 'ministry', label: 'Ministry & Calling', icon: Target, description: 'Calling type, experience, internship' },
  { id: 'admin', label: 'Admin & Verification', icon: ShieldCheck, description: 'Admission status, remarks' },
  { id: 'declaration', label: 'Declaration & Consent', icon: CheckCircle, description: 'Terms acceptance and confirmation' },
];

const SPIRITUAL_GIFTS = [
  'Teaching', 'Leadership', 'Pastoral Care', 'Evangelism', 'Prophecy', 'Healing',
  'Wisdom', 'Knowledge', 'Faith', 'Administration', 'Helps', 'Mercy', 'Music', 'Youth Ministry',
];

const PROGRAMS = ['B.Th', 'B.D.', 'M.Div', 'M.Th', 'PhD Theology', 'D.Min', 'Diploma', 'Certificate', 'Th.M'];

const DEPARTMENTS = [
  'Theology', 'Old Testament', 'New Testament', 'Systematic Theology', 'Homiletics',
  'Church History', 'Pastoral Theology', 'Biblical Languages', 'Mission Studies', 'Christian Ethics',
];

const CALLING_TYPES = [
  'Pastor', 'Missionary', 'Evangelist', 'Teacher', 'Worship Leader', 'Youth Pastor', 'Chaplain', 'Church Planter',
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const MEDIUMS = ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Other'];

// ===================================================================
// REUSABLE FORM COMPONENTS
// ===================================================================

function FormField({ label, children, required = false, span = 1 }: { label: string; children: React.ReactNode; required?: boolean; span?: number }) {
  return (
    <div className={cn(span === 2 && "col-span-2")}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">
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
          "w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none font-bold text-sm transition-all",
          disabled ? "opacity-50 cursor-not-allowed" : "focus:bg-white focus:ring-4 focus:ring-blue-100",
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
        className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none text-[11px] font-black uppercase tracking-widest appearance-none transition-all focus:bg-white focus:ring-4 focus:ring-blue-100">
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
        className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none font-medium text-sm transition-all focus:bg-white focus:ring-4 focus:ring-blue-100 resize-none placeholder:text-slate-300" />
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
            className={cn("px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border",
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

function FileUploadField({ label, value, onChange, accept }: {
  label: string; value: string | undefined; onChange: (v: string) => void; accept?: string;
}) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <FormField label={label}>
      <div className="flex items-center gap-3">
        <label className="flex-1 flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all">
          <Upload className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {value ? 'File selected — Change' : 'Choose File'}
          </span>
          <input type="file" accept={accept || '*'} onChange={handleFileUpload} className="hidden" />
        </label>
        {value && (
          <button type="button" onClick={() => onChange('')}
            className="p-2 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors">
            <X className="w-3 h-3 text-rose-500" />
          </button>
        )}
      </div>
    </FormField>
  );
}

function SectionHeader({ section, isOpen, onToggle, sectionIndex }: { section: SectionDef; isOpen: boolean; onToggle: () => void; sectionIndex: number }) {
  return (
    <button type="button" onClick={onToggle}
      className="w-full flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-100 hover:shadow-sm transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
          <section.icon className="w-5 h-5 text-blue-600" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Section {sectionIndex + 1}</span>
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

export function StudentEnrollment() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('edit');

  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['basic']));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    email: '',
    program: '',
    year: 1,
    status: 'active',
    gender: '',
    dob: '',
    nationality: 'Indian',
    bloodGroup: '',
    mode: 'Regular',
    spiritual: {},
    family: {},
    previousEducation: {},
    financial: {},
    ministry: {},
    documents: {},
    emergencyContact: { name: '', phone: '' },
  });

  // Load existing student for editing
  useEffect(() => {
    if (editId) {
      studentService.getStudentById(editId).then(student => {
        if (student) {
          setFormData(student);
          setOpenSections(new Set(['basic', 'contact', 'program']));
          setDeclarationAccepted(true);
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
    const raw = formData.spiritual?.spiritualGifts || '';
    const current = raw ? raw.split(',').map(g => g.trim()).filter(Boolean) : [];
    const updated = current.includes(gift) ? current.filter(g => g !== gift) : [...current, gift];
    updateNested('spiritual', 'spiritualGifts', updated.join(', '));
  };

  const getGiftsArray = (): string[] => {
    const raw = formData.spiritual?.spiritualGifts || '';
    return raw ? raw.split(',').map(g => g.trim()).filter(Boolean) : [];
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

    if (!declarationAccepted) {
      setError('Please accept the declaration to proceed.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const studentId = formData.studentId || `STU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const saveData = {
        ...formData,
        studentId,
        tenantId: user.tenantId,
        createdBy: user.uid,
        status: editId ? formData.status : 'active',
        admissionStatus: editId ? formData.admissionStatus : 'Pending',
      };

      if (editId) {
        await studentService.updateStudent(editId, saveData);
      } else {
        await studentService.addStudent(saveData as Student);
      }

      setSuccess(true);
      setTimeout(() => navigate('/admissions'), 1500);
    } catch (err: any) {
      console.error("Failed to save student:", err);
      setError(err.message || "Failed to save student. Check permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-100 pb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Student Management</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{editId ? 'Edit Profile' : 'New Enrollment'}</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-950 tracking-tight italic-serif">
          {editId ? 'Edit Student Profile' : 'Student Enrollment'}
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-lg">
          {editId ? `Updating profile for ${formData.name || 'this student'}.` : 'Register a new student for the theological program. Every enrollment is a step toward kingdom impact.'}
        </p>
      </div>

      {/* Error / Success */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-4 rounded-2xl flex items-center justify-between shadow-lg bg-rose-50 border border-rose-100 text-rose-700">
              <div className="flex items-center gap-3"><X className="w-5 h-5" /><span className="text-[10px] font-black uppercase tracking-widest">{error}</span></div>
              <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-4 rounded-2xl shadow-lg bg-emerald-50 border border-emerald-100 text-emerald-700">
              <span className="text-[10px] font-black uppercase tracking-widest">Student profile saved successfully! Redirecting...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Photo Upload Section */}
        <div className="flex justify-center py-6">
          <div className="relative group cursor-pointer w-28 h-28">
            <div className="w-full h-full rounded-3xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center group-hover:border-blue-400 transition-colors">
              {formData.photoUrl ? (
                <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Users className="w-10 h-10 text-slate-300 group-hover:text-blue-400 transition-colors" />
              )}
            </div>
            <input type="file" accept="image/*" onChange={handlePhotoUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <div className="absolute -bottom-2 bg-white px-3 py-0.5 rounded-full border border-slate-200 text-[8px] font-black uppercase tracking-widest shadow-sm left-1/2 transform -translate-x-1/2 flex items-center gap-1">
              <Camera className="w-3 h-3" /> Upload Photo
            </div>
          </div>
        </div>

        {/* ============================== SECTION 1: BASIC INFORMATION ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[0]} isOpen={openSections.has('basic')} onToggle={() => toggleSection('basic')} sectionIndex={0} />
          <AnimatePresence>
            {openSections.has('basic') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                <div className="p-8 bg-white rounded-2xl border border-slate-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Full Legal Name" value={formData.name} onChange={v => updateField('name', v)} required placeholder="e.g. John Samuel" span={2} />
                    <SelectField label="Gender" value={formData.gender} onChange={v => updateField('gender', v)} required
                      options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }]} />
                    <InputField label="Date of Birth" value={formData.dob} onChange={v => updateField('dob', v)} type="date" />
                    <InputField label="Nationality" value={formData.nationality} onChange={v => updateField('nationality', v)} placeholder="e.g. Indian" />
                    <InputField label="National ID / Aadhaar" value={formData.nationalId} onChange={v => updateField('nationalId', v)} placeholder="ID Number" />
                    <InputField label="Passport Number" value={formData.passportNumber} onChange={v => updateField('passportNumber', v)} placeholder="Passport No." />
                    <SelectField label="Blood Group" value={formData.bloodGroup} onChange={v => updateField('bloodGroup', v)}
                      options={BLOOD_GROUPS.map(bg => ({ value: bg, label: bg }))} />
                    <InputField label="Student ID (Auto-generated if empty)" value={formData.studentId} onChange={v => updateField('studentId', v)} disabled={!!editId} placeholder="STU-2025-XXXX" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 2: CONTACT DETAILS ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[1]} isOpen={openSections.has('contact')} onToggle={() => toggleSection('contact')} sectionIndex={1} />
          <AnimatePresence>
            {openSections.has('contact') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-white rounded-2xl border border-slate-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Email Address" value={formData.email} onChange={v => updateField('email', v)} required type="email" placeholder="student@institution.com" />
                    <InputField label="Phone Number" value={formData.phone} onChange={v => updateField('phone', v)} type="tel" placeholder="+91 98765 43210" />
                    <TextAreaField label="Permanent Address" value={formData.permanentAddress} onChange={v => updateField('permanentAddress', v)} placeholder="Street, City, State, PIN" span={2} />
                    <TextAreaField label="Current Address (if different)" value={formData.currentAddress} onChange={v => updateField('currentAddress', v)} placeholder="Hostel / rented address" span={2} />
                  </div>
                  <div className="border-t border-slate-100 pt-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 pl-1">Emergency Contact</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <InputField label="Emergency Contact Name" value={formData.emergencyContact?.name} onChange={v => setFormData(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact!, name: v } }))} placeholder="Name" />
                      <InputField label="Emergency Contact Phone" value={formData.emergencyContact?.phone} onChange={v => setFormData(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact!, phone: v } }))} placeholder="Phone" />
                      <InputField label="Relationship" value={formData.emergencyContact?.relationship} onChange={v => setFormData(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact!, relationship: v } }))} placeholder="e.g. Parent, Spouse" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 3: FAMILY & GUARDIAN ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[2]} isOpen={openSections.has('family')} onToggle={() => toggleSection('family')} sectionIndex={2} />
          <AnimatePresence>
            {openSections.has('family') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-white rounded-2xl border border-slate-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Father's Name" value={formData.family?.fatherName} onChange={v => updateNested('family', 'fatherName', v)} placeholder="Father's Full Name" />
                    <InputField label="Mother's Name" value={formData.family?.motherName} onChange={v => updateNested('family', 'motherName', v)} placeholder="Mother's Full Name" />
                    <InputField label="Guardian Name (if applicable)" value={formData.family?.guardianName} onChange={v => updateNested('family', 'guardianName', v)} placeholder="Guardian Name" />
                    <InputField label="Occupation (Guardian/Parent)" value={formData.family?.occupation} onChange={v => updateNested('family', 'occupation', v)} placeholder="e.g. Farmer, Business" />
                    <InputField label="Contact Number" value={formData.family?.contactNumber} onChange={v => updateNested('family', 'contactNumber', v)} placeholder="+91 98765 43210" />
                    <SelectField label="Family Background" value={formData.family?.background} onChange={v => updateNested('family', 'background', v)}
                      options={[
                        { value: 'Christian', label: 'Christian' },
                        { value: 'Non-Christian', label: 'Non-Christian' },
                        { value: 'New Believer', label: 'New Believer' },
                      ]} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 4: SPIRITUAL PROFILE ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[3]} isOpen={openSections.has('spiritual')} onToggle={() => toggleSection('spiritual')} sectionIndex={3} />
          <AnimatePresence>
            {openSections.has('spiritual') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Date of Conversion" value={formData.spiritual?.conversionDate} onChange={v => updateNested('spiritual', 'conversionDate', v)} type="date" />
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">Baptized?</label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-white/60 rounded-xl">
                        <input type="checkbox" checked={formData.spiritual?.isBaptized || false}
                          onChange={e => updateNested('spiritual', 'isBaptized', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-bold text-slate-700">Yes</span>
                      </label>
                    </div>
                    <InputField label="Baptism Date" value={formData.spiritual?.baptismDate} onChange={v => updateNested('spiritual', 'baptismDate', v)} type="date" />
                    <InputField label="Baptism Church" value={formData.spiritual?.baptismChurch} onChange={v => updateNested('spiritual', 'baptismChurch', v)} placeholder="Church Name" />
                    <InputField label="Current Church" value={formData.spiritual?.currentChurch} onChange={v => updateNested('spiritual', 'currentChurch', v)} placeholder="Church Name" />
                    <InputField label="Pastor Name" value={formData.spiritual?.pastorName} onChange={v => updateNested('spiritual', 'pastorName', v)} placeholder="Pastor Name" />
                    <TextAreaField label="Ministry Involvement" value={formData.spiritual?.ministryInvolvement} onChange={v => updateNested('spiritual', 'ministryInvolvement', v)} placeholder="Describe current ministry involvement..." />
                    <TextAreaField label="Personal Testimony" value={formData.spiritual?.testimony} onChange={v => updateNested('spiritual', 'testimony', v)} placeholder="Brief testimony of faith..." rows={3} />
                  </div>
                  <CheckboxGroup label="Spiritual Gifts" options={SPIRITUAL_GIFTS}
                    selected={getGiftsArray()} onToggle={toggleGift} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 5: PREVIOUS EDUCATION ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[4]} isOpen={openSections.has('education')} onToggle={() => toggleSection('education')} sectionIndex={4} />
          <AnimatePresence>
            {openSections.has('education') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-white rounded-2xl border border-slate-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField label="Highest Qualification" value={formData.previousEducation?.qualification} onChange={v => updateNested('previousEducation', 'qualification', v)}
                      options={[
                        { value: 'High School', label: 'High School' },
                        { value: 'Pre-University', label: 'Pre-University (PUC)' },
                        { value: 'Diploma', label: 'Diploma' },
                        { value: 'Bachelor', label: 'Bachelor Degree' },
                        { value: 'Master', label: 'Master Degree' },
                        { value: 'Other', label: 'Other' },
                      ]} />
                    <InputField label="Institution Name" value={formData.previousEducation?.institution} onChange={v => updateNested('previousEducation', 'institution', v)} placeholder="Last attended institution" />
                    <InputField label="Board / University" value={formData.previousEducation?.boardOrUniversity} onChange={v => updateNested('previousEducation', 'boardOrUniversity', v)} placeholder="e.g. CBSE, State Board" />
                    <InputField label="Year of Passing" value={formData.previousEducation?.yearOfPassing} onChange={v => updateNested('previousEducation', 'yearOfPassing', v)} type="number" placeholder="2024" />
                    <InputField label="Marks / Grade" value={formData.previousEducation?.marksOrGrade} onChange={v => updateNested('previousEducation', 'marksOrGrade', v)} placeholder="e.g. 85%, First Class" />
                    <SelectField label="Medium of Instruction" value={formData.previousEducation?.mediumOfInstruction} onChange={v => updateNested('previousEducation', 'mediumOfInstruction', v)}
                      options={MEDIUMS.map(m => ({ value: m, label: m }))} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 6: PROGRAM ENROLLMENT ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[5]} isOpen={openSections.has('program')} onToggle={() => toggleSection('program')} sectionIndex={5} />
          <AnimatePresence>
            {openSections.has('program') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-gradient-to-br from-sky-50 to-indigo-50 rounded-2xl border border-sky-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField label="Program" value={formData.program} onChange={v => updateField('program', v)} required
                      options={PROGRAMS.map(p => ({ value: p, label: p }))} />
                    <SelectField label="Department" value={formData.department} onChange={v => updateField('department', v)}
                      options={DEPARTMENTS.map(d => ({ value: d, label: d }))} />
                    <InputField label="Admission Date" value={formData.admissionDate} onChange={v => updateField('admissionDate', v)} type="date" />
                    <InputField label="Academic Year" value={formData.academicYear} onChange={v => updateField('academicYear', v)} placeholder="e.g. 2024-2025" />
                    <InputField label="Semester" value={formData.semester} onChange={v => updateField('semester', parseInt(v) || 1)} type="number" placeholder="1" />
                    <SelectField label="Mode of Study" value={formData.mode} onChange={v => updateField('mode', v)}
                      options={[
                        { value: 'Regular', label: 'Regular' },
                        { value: 'Online', label: 'Online' },
                      ]} />
                    <InputField label="Current Year of Study" value={formData.year} onChange={v => updateField('year', parseInt(v) || 1)} type="number" placeholder="1" />
                    <InputField label="Campus" value={formData.campus} onChange={v => updateField('campus', v)} placeholder="e.g. Main Campus" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 7: ACCOMMODATION & TRANSPORT ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[6]} isOpen={openSections.has('accommodation')} onToggle={() => toggleSection('accommodation')} sectionIndex={6} />
          <AnimatePresence>
            {openSections.has('accommodation') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-white rounded-2xl border border-slate-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">Hostel Required</label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-xl">
                        <input type="checkbox" checked={formData.hostelRequired || false}
                          onChange={e => updateField('hostelRequired', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-bold text-slate-700">Yes, hostel needed</span>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">Transport Required</label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-xl">
                        <input type="checkbox" checked={formData.transportRequired || false}
                          onChange={e => updateField('transportRequired', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-bold text-slate-700">Yes, transport needed</span>
                      </label>
                    </div>
                    <InputField label="Room Allocation" value={formData.roomAllocation} onChange={v => updateField('roomAllocation', v)} placeholder="e.g. Block A, Room 204" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 8: FINANCIAL INFORMATION ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[7]} isOpen={openSections.has('financial')} onToggle={() => toggleSection('financial')} sectionIndex={7} />
          <AnimatePresence>
            {openSections.has('financial') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-white rounded-2xl border border-slate-100 space-y-6">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 p-3 rounded-xl flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> All financial data is encrypted end-to-end
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Fee Structure" value={formData.financial?.feeStructure} onChange={v => updateNested('financial', 'feeStructure', v)} placeholder="e.g. Standard, Scholarship" />
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">Has Scholarship?</label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-xl">
                        <input type="checkbox" checked={formData.financial?.hasScholarship || false}
                          onChange={e => updateNested('financial', 'hasScholarship', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-bold text-slate-700">Yes, has scholarship</span>
                      </label>
                    </div>
                    <TextAreaField label="Sponsorship Details" value={formData.financial?.sponsorshipDetails} onChange={v => updateNested('financial', 'sponsorshipDetails', v)} placeholder="Church sponsorship, donor details..." rows={2} />
                    <SelectField label="Payment Plan" value={formData.financial?.paymentPlan} onChange={v => updateNested('financial', 'paymentPlan', v)}
                      options={[
                        { value: 'Monthly', label: 'Monthly' },
                        { value: 'Quarterly', label: 'Quarterly' },
                        { value: 'Full', label: 'Full Payment' },
                      ]} />
                    <SelectField label="Fee Status" value={formData.financial?.feeStatus} onChange={v => updateNested('financial', 'feeStatus', v)}
                      options={[
                        { value: 'Paid', label: 'Paid' },
                        { value: 'Partial', label: 'Partial' },
                        { value: 'Pending', label: 'Pending' },
                        { value: 'Overdue', label: 'Overdue' },
                        { value: 'Waived', label: 'Waived' },
                      ]} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 9: MEDICAL INFORMATION ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[8]} isOpen={openSections.has('medical')} onToggle={() => toggleSection('medical')} sectionIndex={8} />
          <AnimatePresence>
            {openSections.has('medical') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-white rounded-2xl border border-slate-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextAreaField label="Medical Notes" value={formData.medicalNotes} onChange={v => updateField('medicalNotes', v)} placeholder="Any known health conditions..." />
                    <InputField label="Allergies" value={formData.allergies} onChange={v => updateField('allergies', v)} placeholder="e.g. Penicillin, Peanuts" />
                    <InputField label="Disability (if any)" value={formData.disability} onChange={v => updateField('disability', v)} placeholder="Describe if applicable" />
                    <div>
                      <FileUploadField label="Medical Certificate" value={formData.medicalCertUrl} onChange={v => updateField('medicalCertUrl', v)} accept=".pdf,.jpg,.png" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 10: DOCUMENTS UPLOAD ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[9]} isOpen={openSections.has('documents')} onToggle={() => toggleSection('documents')} sectionIndex={9} />
          <AnimatePresence>
            {openSections.has('documents') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-white rounded-2xl border border-slate-100 space-y-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Upload required documents for enrollment verification</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FileUploadField label="ID Proof (Aadhaar / Voter / Passport)" value={formData.documents?.idProofUrl} onChange={v => updateNested('documents', 'idProofUrl', v)} accept=".pdf,.jpg,.png" />
                    <FileUploadField label="Academic Certificates / Marksheet" value={formData.documents?.academicCertsUrl} onChange={v => updateNested('documents', 'academicCertsUrl', v)} accept=".pdf,.jpg,.png" />
                    <FileUploadField label="Baptism Certificate" value={formData.documents?.baptismCertUrl} onChange={v => updateNested('documents', 'baptismCertUrl', v)} accept=".pdf,.jpg,.png" />
                    <FileUploadField label="Pastor Recommendation Letter" value={formData.documents?.recommendationUrl} onChange={v => updateNested('documents', 'recommendationUrl', v)} accept=".pdf,.jpg,.png" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 11: MINISTRY & CALLING ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[10]} isOpen={openSections.has('ministry')} onToggle={() => toggleSection('ministry')} sectionIndex={10} />
          <AnimatePresence>
            {openSections.has('ministry') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">Called to Ministry?</label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-white/60 rounded-xl">
                        <input type="checkbox" checked={formData.ministry?.isCalled || false}
                          onChange={e => updateNested('ministry', 'isCalled', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-bold text-slate-700">Yes, I am called</span>
                      </label>
                    </div>
                    <SelectField label="Calling Type" value={formData.ministry?.callingType} onChange={v => updateNested('ministry', 'callingType', v)}
                      options={CALLING_TYPES.map(c => ({ value: c, label: c }))} />
                    <TextAreaField label="Ministry Experience" value={formData.ministry?.experience} onChange={v => updateNested('ministry', 'experience', v)} placeholder="Describe your ministry experience..." />
                    <InputField label="Years of Service" value={formData.ministry?.yearsOfService} onChange={v => updateNested('ministry', 'yearsOfService', parseInt(v) || 0)} type="number" placeholder="e.g. 3" />
                    <InputField label="Preferred Field of Ministry" value={formData.ministry?.preferredField} onChange={v => updateNested('ministry', 'preferredField', v)} placeholder="e.g. Youth Ministry, Rural Missions" />
                    <TextAreaField label="Internship Interest" value={formData.ministry?.internshipInterest} onChange={v => updateNested('ministry', 'internshipInterest', v)} placeholder="Areas of internship interest..." rows={2} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 12: ADMIN & VERIFICATION ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[11]} isOpen={openSections.has('admin')} onToggle={() => toggleSection('admin')} sectionIndex={11} />
          <AnimatePresence>
            {openSections.has('admin') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl border border-slate-200 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField label="Admission Status" value={formData.admissionStatus} onChange={v => updateField('admissionStatus', v)}
                      options={[
                        { value: 'Pending', label: 'Pending Review' },
                        { value: 'Approved', label: 'Approved' },
                        { value: 'Rejected', label: 'Rejected' },
                      ]} />
                    {!editId && <p className="text-[9px] text-amber-500 font-bold col-span-2 pl-1">Admission status can only be changed in edit mode by an administrator</p>}
                    <InputField label="Verified By" value={formData.verifiedBy} onChange={v => updateField('verifiedBy', v)} placeholder="Admin name" disabled={true} />
                    <InputField label="Enrollment Approval Date" value={formData.enrollmentApprovalDate} onChange={v => updateField('enrollmentApprovalDate', v)} type="date" disabled={true} />
                  </div>
                  <TextAreaField label="Admin Remarks" value={formData.remarks} onChange={v => updateField('remarks', v)} placeholder="Internal admin notes about this enrollment..." span={2} rows={3} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SECTION 13: DECLARATION & CONSENT ============================== */}
        <div className="space-y-3">
          <SectionHeader section={SECTIONS[12]} isOpen={openSections.has('declaration')} onToggle={() => toggleSection('declaration')} sectionIndex={12} />
          <AnimatePresence>
            {openSections.has('declaration') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-8 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-100 space-y-6">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 p-3 rounded-xl flex items-center gap-2 border border-emerald-100">
                      <CheckCircle className="w-4 h-4" /> Please read and accept before submitting
                    </p>

                    <div className="bg-white/70 rounded-2xl p-6 border border-emerald-100 space-y-3">
                      <p className="text-xs font-bold text-slate-700 leading-relaxed">
                        I hereby declare that all the information provided in this enrollment form is true and accurate to the best of my knowledge. I understand that:
                      </p>
                      <ul className="text-xs text-slate-600 space-y-2 pl-4">
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">&#9679;</span>
                          Any false information may result in the cancellation of my enrollment.
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">&#9679;</span>
                          I agree to abide by the rules, regulations, and code of conduct of the institution.
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">&#9679;</span>
                          I will maintain discipline, attend classes regularly, and complete all required coursework.
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">&#9679;</span>
                          I commit to the spiritual formation objectives of this theological institution.
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">&#9679;</span>
                          My personal data will be processed in accordance with the institution&apos;s privacy policy.
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer p-4 bg-white rounded-xl border-2 border-dashed border-emerald-200 hover:border-emerald-400 transition-colors">
                        <input type="checkbox" checked={declarationAccepted}
                          onChange={e => setDeclarationAccepted(e.target.checked)}
                          className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <div>
                          <span className="text-sm font-bold text-slate-800 block">I accept the declaration</span>
                          <span className="text-[10px] text-slate-400">By checking this box, you confirm that all information is accurate.</span>
                        </div>
                      </label>
                    </div>

                    {!declarationAccepted && (
                      <p className="text-[9px] text-amber-600 font-bold pl-1 flex items-center gap-1">
                        <X className="w-3 h-3" /> You must accept the declaration to submit the form.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================== SUBMIT ============================== */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <button type="button" onClick={() => navigate('/admissions')}
            className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-widest">
            Cancel
          </button>
          <button type="submit" disabled={isSaving || !declarationAccepted}
            className="px-8 py-3.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:from-blue-700 hover:to-indigo-700 transition-all uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed">
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : editId ? 'Update Profile' : 'Enroll Student'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
