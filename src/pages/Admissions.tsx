import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ShieldCheck,
  UserPlus,
  ChevronRight,
  Save,
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { studentService, Student } from '../services/dataService';
import { useAuthStore } from '../store/useStore';

export function Admissions() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorHeader, setErrorHeader] = useState<{message: string, type: 'error' | 'warning'} | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  // Form State
  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    dob: '',
    gender: 'Other',
    bloodGroup: '',
    medicalNotes: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    program: 'M.Div',
    year: 1,
    status: 'active',
  });

  const [formTab, setFormTab] = useState<'academic' | 'personal' | 'emergency'>('academic');

  useEffect(() => {
    if (user?.tenantId) {
      loadStudents();
    }
  }, [user?.tenantId]);

  const loadStudents = async () => {
    setIsLoading(true);
    setErrorHeader(null);
    try {
      const data = await studentService.getStudentsByTenant(user!.tenantId!);
      setStudents(data);
    } catch (error: any) {
      console.error("Failed to load students:", error);
      setErrorHeader({ message: "Network Integrity Failure: Cannot synchronize scholarly registry.", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenantId) return;
    setErrorHeader(null);

    // Auto-generate a student ID if not provided
    const generatedId = newStudent.studentId || `STU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await studentService.addStudent({
        ...newStudent,
        studentId: generatedId,
        tenantId: user.tenantId,
      } as Student);
      setIsAddModalOpen(false);
      setNewStudent({ 
        name: '', 
        studentId: '',
        photoUrl: '',
        email: '', 
        phone: '',
        address: '',
        dob: '',
        gender: 'Other',
        bloodGroup: '',
        medicalNotes: '',
        emergencyContact: { name: '', relationship: '', phone: '' },
        program: 'M.Div', 
        year: 1, 
        status: 'active' 
      });
      loadStudents();
    } catch (error: any) {
      console.error("Error adding student:", error);
      setErrorHeader({ message: "Registry Authorization Denied: Enrollment record could not be vaulted.", type: 'error' });
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentToEdit?.id) return;

    try {
      await studentService.updateStudent(studentToEdit.id, studentToEdit);
      setStudentToEdit(null);
      loadStudents();
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [studentToWithdraw, setStudentToWithdraw] = useState<string | null>(null);

  const handleWithdrawStudent = async () => {
    if (!studentToWithdraw) return;
    
    const confirmed = window.confirm('Are you sure you want to mark this student as withdrawn? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await studentService.updateStudent(studentToWithdraw, { status: 'withdrawn' });
      setIsWithdrawModalOpen(false);
      setStudentToWithdraw(null);
      loadStudents();
    } catch (error) {
      console.error("Error withdrawing student:", error);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    graduated: students.filter(s => s.status === 'graduated').length,
    withdrawn: students.filter(s => s.status === 'withdrawn').length,
  };

  return (
    <div className="space-y-10">
      <AnimatePresence>
        {errorHeader && (
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
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Academic Affairs</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Student Management</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-950 tracking-tight italic-serif">Registry Hub</h1>
          <p className="text-slate-500 text-sm mt-1 max-w-lg">Unified management of student identities, academic lifecycles, and cryptographic status logs.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-200"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Enrollment</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Registry', value: stats.total, icon: Users, color: 'indigo' },
          { label: 'Active Scholars', value: stats.active, icon: ShieldCheck, color: 'emerald' },
          { label: 'Alumni', value: stats.graduated, icon: Plus, color: 'amber' },
          { label: 'Withdrawn', value: stats.withdrawn, icon: Filter, color: 'rose' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center",
              stat.color === 'indigo' ? "bg-blue-50 text-blue-600" :
              stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
              stat.color === 'amber' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
            )}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900 tabular-nums">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm min-h-[400px]">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search registry..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-300 font-medium"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-5 py-3 border border-slate-200 rounded-xl text-slate-500 hover:bg-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-80 gap-4">
             <div className="w-12 h-12 border-4 border-blue-500/10 border-t-blue-600 rounded-full animate-spin"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse">Decrypting Records...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 text-center p-10">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 italic-serif">No Students Found</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-xs">The search criteria did not match any records in the secure registry.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="px-8 py-5 whitespace-nowrap">Identity</th>
                  <th className="px-6 py-5 whitespace-nowrap text-center">Module</th>
                  <th className="px-6 py-5 whitespace-nowrap text-center">Cohort</th>
                  <th className="px-6 py-5 whitespace-nowrap text-center">Status</th>
                  <th className="px-8 py-5 text-right">Integrity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredStudents.map((student) => (
                  <tr 
                    key={student.id} 
                    onClick={() => navigate(`/admissions/${student.id}`)}
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 overflow-hidden rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm uppercase shadow-sm group-hover:from-blue-700 hover:to-indigo-700 group-hover:text-white transition-all duration-500">
                          {student.photoUrl ? (
                            <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{student.name.split(' ').map(n => n[0]).join('')}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 tracking-tight italic-serif">{student.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {student.studentId && (
                              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-black uppercase text-slate-500">{student.studentId}</span>
                            )}
                            <p className="text-[10px] font-mono text-slate-400">{student.email}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">{student.program}</span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className="font-mono text-xs text-slate-500">YEAR {student.year}</span>
                    </td>
                    <td className="px-6 py-6 scroll-m-0">
                      <div className="flex justify-center">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em]",
                          student.status === 'active' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"
                        )}>
                          {student.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setStudentToEdit(student);
                          }}
                          className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                        >
                          Modify
                        </button>
                        <ShieldCheck className="w-4 h-4 text-slate-200 group-hover:text-blue-600 transition-colors" />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setStudentToWithdraw(student.id!);
                            setIsWithdrawModalOpen(true);
                          }}
                          className="text-slate-300 hover:text-rose-600 transition-colors p-1"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-2xl p-10 relative z-10 shadow-2xl border border-slate-100"
            >
              <div className="mb-8 border-b border-slate-50 pb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight italic-serif">Enroll New Student</h2>
                  <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-black text-[10px]">Institutional Registry Protocol</p>
                </div>
                <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                  {(['academic', 'personal', 'emergency'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setFormTab(tab)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                        formTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAddStudent} className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {formTab === 'academic' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Student ID/Roll No.</label>
                         <input 
                           type="text" 
                           value={newStudent.studentId || ''}
                           onChange={(e) => setNewStudent({...newStudent, studentId: e.target.value})}
                           placeholder="Auto-generated if empty"
                           className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold"
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Profile Photo URL</label>
                         <input 
                           type="url" 
                           value={newStudent.photoUrl || ''}
                           onChange={(e) => setNewStudent({...newStudent, photoUrl: e.target.value})}
                           placeholder="https://..."
                           className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold"
                         />
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Identity</label>
                        <input 
                          required
                          type="text" 
                          value={newStudent.name}
                          onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                          placeholder="Legal name"
                          className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Institutional Email</label>
                        <input 
                          required
                          type="email" 
                          value={newStudent.email}
                          onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                          placeholder="email@institution.edu"
                          className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Program Selection</label>
                        <select 
                          value={newStudent.program}
                          onChange={(e) => setNewStudent({...newStudent, program: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold uppercase tracking-widest text-xs appearance-none"
                        >
                          <option>M.Div</option>
                          <option>B.Th</option>
                          <option>PhD Theology</option>
                          <option>Diploma</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Academic Year</label>
                        <input 
                          type="number" 
                          min="1"
                          max="6"
                          value={newStudent.year}
                          onChange={(e) => setNewStudent({...newStudent, year: parseInt(e.target.value)})}
                          className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formTab === 'personal' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Contact Phone</label>
                        <input 
                          type="tel" 
                          value={newStudent.phone || ''}
                          onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Date of Birth</label>
                        <input 
                          type="date" 
                          value={newStudent.dob || ''}
                          onChange={(e) => setNewStudent({...newStudent, dob: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Gender</label>
                        <select 
                          value={newStudent.gender || 'Other'}
                          onChange={(e) => setNewStudent({...newStudent, gender: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold uppercase tracking-widest text-xs appearance-none"
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                          <option>Prefer not to say</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Blood Group</label>
                        <input 
                          type="text" 
                          value={newStudent.bloodGroup || ''}
                          onChange={(e) => setNewStudent({...newStudent, bloodGroup: e.target.value})}
                          placeholder="A+"
                          className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold uppercase"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Residential Address</label>
                      <textarea 
                        value={newStudent.address || ''}
                        onChange={(e) => setNewStudent({...newStudent, address: e.target.value})}
                        placeholder="Street, City, Postal Code"
                        rows={2}
                        className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold resize-none"
                      />
                    </div>
                  </div>
                )}

                {formTab === 'emergency' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-rose-50/30 rounded-3xl border border-rose-100/50 space-y-6">
                      <div className="flex items-center gap-2 mb-2">
                         <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Primary Emergency Contact</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Contact Name</label>
                          <input 
                            type="text" 
                            value={newStudent.emergencyContact?.name || ''}
                            onChange={(e) => setNewStudent({
                              ...newStudent, 
                              emergencyContact: { ...newStudent.emergencyContact!, name: e.target.value } 
                            })}
                            className="w-full px-6 py-4 bg-white/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Relationship</label>
                          <input 
                            type="text" 
                            value={newStudent.emergencyContact?.relationship || ''}
                            onChange={(e) => setNewStudent({
                              ...newStudent, 
                              emergencyContact: { ...newStudent.emergencyContact!, relationship: e.target.value } 
                            })}
                            className="w-full px-6 py-4 bg-white/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Emergency Phone</label>
                        <input 
                          type="tel" 
                          value={newStudent.emergencyContact?.phone || ''}
                          onChange={(e) => setNewStudent({
                            ...newStudent, 
                            emergencyContact: { ...newStudent.emergencyContact!, phone: e.target.value } 
                          })}
                          className="w-full px-6 py-4 bg-white/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Medical Observations</label>
                      <textarea 
                        value={newStudent.medicalNotes || ''}
                        onChange={(e) => setNewStudent({...newStudent, medicalNotes: e.target.value})}
                        placeholder="Allergies, chronic conditions, or medications..."
                        rows={3}
                        className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold resize-none"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-6 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Discard Entry
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-5 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:from-blue-700 hover:to-indigo-700 shadow-2xl shadow-blue-100 transition-all flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Authorize Enrollment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Student Modal */}
      <AnimatePresence>
        {studentToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStudentToEdit(null)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-lg p-8 relative z-10 shadow-2xl border border-slate-100"
            >
              <div className="mb-8 border-b border-slate-100 pb-6">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight italic-serif">Modify Student Record</h2>
                <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-black text-[10px]">Registry Identification: {studentToEdit.id?.slice(-8)}</p>
              </div>

              <form onSubmit={handleUpdateStudent} className="space-y-6 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex gap-1 p-1 bg-slate-50 rounded-2xl mb-6">
                  {(['academic', 'personal', 'emergency'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setFormTab(tab)}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        formTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {formTab === 'academic' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Student ID/Roll No.</label>
                         <input 
                           type="text" 
                           value={studentToEdit.studentId || ''}
                           onChange={(e) => setStudentToEdit({...studentToEdit, studentId: e.target.value})}
                           className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold text-sm"
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Profile Photo URL</label>
                         <input 
                           type="url" 
                           value={studentToEdit.photoUrl || ''}
                           onChange={(e) => setStudentToEdit({...studentToEdit, photoUrl: e.target.value})}
                           className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold text-sm"
                         />
                       </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Identity</label>
                      <input 
                        required
                        type="text" 
                        value={studentToEdit.name}
                        onChange={(e) => setStudentToEdit({...studentToEdit, name: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Institutional Email</label>
                      <input 
                        required
                        type="email" 
                        value={studentToEdit.email}
                        onChange={(e) => setStudentToEdit({...studentToEdit, email: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Academic Program</label>
                        <select 
                          value={studentToEdit.program}
                          onChange={(e) => setStudentToEdit({...studentToEdit, program: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold text-sm appearance-none uppercase tracking-widest"
                        >
                          <option>M.Div</option>
                          <option>B.Th</option>
                          <option>PhD Theology</option>
                          <option>Diploma</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Lifecycle Status</label>
                        <select 
                          value={studentToEdit.status}
                          onChange={(e) => setStudentToEdit({...studentToEdit, status: e.target.value as any})}
                          className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold text-sm appearance-none uppercase tracking-widest"
                        >
                          <option value="active">Active Enrollment</option>
                          <option value="graduated">Alumni (Graduated)</option>
                          <option value="withdrawn">Withdrawn / Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {formTab === 'personal' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Contact Phone</label>
                        <input 
                          type="tel" 
                          value={studentToEdit.phone || ''}
                          onChange={(e) => setStudentToEdit({...studentToEdit, phone: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Date of Birth</label>
                        <input 
                          type="date" 
                          value={studentToEdit.dob || ''}
                          onChange={(e) => setStudentToEdit({...studentToEdit, dob: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Gender</label>
                        <select 
                          value={studentToEdit.gender || 'Other'}
                          onChange={(e) => setStudentToEdit({...studentToEdit, gender: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold text-sm appearance-none uppercase tracking-widest"
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                          <option>Prefer not to say</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Blood Group</label>
                        <input 
                          type="text" 
                          value={studentToEdit.bloodGroup || ''}
                          onChange={(e) => setStudentToEdit({...studentToEdit, bloodGroup: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold uppercase"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Residential Address</label>
                      <textarea 
                        value={studentToEdit.address || ''}
                        onChange={(e) => setStudentToEdit({...studentToEdit, address: e.target.value})}
                        rows={2}
                        className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold resize-none"
                      />
                    </div>
                  </div>
                )}

                {formTab === 'emergency' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Contact Name</label>
                        <input 
                          type="text" 
                          value={studentToEdit.emergencyContact?.name || ''}
                          onChange={(e) => setStudentToEdit({
                            ...studentToEdit, 
                            emergencyContact: { ...(studentToEdit.emergencyContact || {relationship:'', phone:''}), name: e.target.value } 
                          })}
                          className="w-full px-6 py-4 bg-white border border-slate-100 rounded-3xl focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Relationship</label>
                          <input 
                            type="text" 
                            value={studentToEdit.emergencyContact?.relationship || ''}
                            onChange={(e) => setStudentToEdit({
                              ...studentToEdit, 
                              emergencyContact: { ...(studentToEdit.emergencyContact || {name:'', phone:''}), relationship: e.target.value } 
                            })}
                            className="w-full px-6 py-4 bg-white border border-slate-100 rounded-3xl focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Emergency Phone</label>
                          <input 
                            type="tel" 
                            value={studentToEdit.emergencyContact?.phone || ''}
                            onChange={(e) => setStudentToEdit({
                              ...studentToEdit, 
                              emergencyContact: { ...(studentToEdit.emergencyContact || {name:'', relationship:''}), phone: e.target.value } 
                            })}
                            className="w-full px-6 py-4 bg-white border border-slate-100 rounded-3xl focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Medical Observations</label>
                      <textarea 
                        value={studentToEdit.medicalNotes || ''}
                        onChange={(e) => setStudentToEdit({...studentToEdit, medicalNotes: e.target.value})}
                        rows={3}
                        className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all outline-none font-bold resize-none"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-6 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setStudentToEdit(null)}
                    className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Discard Changes
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-5 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:from-blue-700 hover:to-indigo-700 shadow-2xl shadow-blue-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Commit Update
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Withdraw Confirmation Modal */}
      <AnimatePresence>
        {isWithdrawModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWithdrawModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-sm p-8 relative z-10 shadow-2xl border border-rose-100 text-center"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-rose-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 italic-serif mb-3">Permanent Withdrawal</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Are you sure you want to mark this student as withdrawn? 
                <span className="block mt-2 font-bold text-rose-600 uppercase text-[10px] tracking-widest">This action cannot be undone.</span>
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleWithdrawStudent}
                  className="flex-1 py-3.5 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-700 shadow-xl shadow-rose-100 transition-all"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
