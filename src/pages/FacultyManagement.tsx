import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Eye,
  Lock,
  Download,
  AlertCircle,
  ChevronRight,
  Check,
  Activity,
  LogOut,
  X,
  Phone,
  Mail,
  Briefcase,
  Award,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { facultyService, subjectService, type Faculty, type Subject } from '../services/dataService';
import { useAuthStore } from '../store/useStore';
import { hasPermission } from '../lib/permissions';

export function FacultyManagement() {
  const { user } = useAuthStore();
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [isViewingSalary, setIsViewingSalary] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isUpdatingPermissions, setIsUpdatingPermissions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorHeader, setErrorHeader] = useState<{message: string, type: 'error' | 'warning'} | null>(null);

  const isAdmin = hasPermission(user?.role || null, 'settings');
  const canManageFinance = hasPermission(user?.role || null, 'finance');
  const isCurrentUserProfile = Boolean(user && selectedFaculty && user.email === selectedFaculty.email);
  const canEditProfile = isAdmin || isCurrentUserProfile;

  const [newMember, setNewMember] = useState<Partial<Faculty>>({
    name: '',
    email: '',
    phone: '',
    department: 'Theology',
    role: 'Professor',
    bio: '',
    expertise: '',
    officeHours: '',
    status: 'active',
    salary: 0,
    bankAccount: '',
  });

  useEffect(() => {
    if (user?.tenantId) {
      loadFaculty();
    }
  }, [user?.tenantId]);

  const loadFaculty = async () => {
    setIsLoading(true);
    setErrorHeader(null);
    try {
      const val = <T,>(p: PromiseSettledResult<T>): T => p.status === 'fulfilled' ? p.value : [] as T;
      const [facData, subData] = await Promise.allSettled([
        facultyService.getFacultyByTenant(user!.tenantId!),
        subjectService.getSubjectsByTenant(user!.tenantId!)
      ]);
      setFaculty(val(facData));
      setSubjects(val(subData));
    } catch (error: any) {
      console.error("Failed to load faculty & subjects:", error);
      setErrorHeader({ message: "Network Interruption: Failed to synchronize personnel records.", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenantId) return;
    setErrorHeader(null);

    try {
      if (newMember.id) {
        await facultyService.updateFaculty(newMember.id, newMember);
        setFaculty(prev => prev.map(f => f.id === newMember.id ? { ...f, ...newMember } as Faculty : f));
        if (selectedFaculty?.id === newMember.id) {
          setSelectedFaculty({ ...selectedFaculty, ...newMember } as Faculty);
        }
      } else {
        const generatedId = newMember.facultyId || `FAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const added = await facultyService.addFaculty({
          ...newMember,
          facultyId: generatedId,
          tenantId: user.tenantId
        } as Faculty);
        
        // Refresh to get the new id mapping correctly if needed, or rely on loadFaculty
        loadFaculty(); 
      }
      setIsAddModalOpen(false);
      setNewMember({ 
        name: '', 
        facultyId: '',
        photoUrl: '',
        email: '', 
        phone: '', 
        department: 'Theology', 
        role: 'Professor', 
        expertise: '',
        bio: '',
        officeHours: '',
        status: 'active',
        salary: 0,
        bankAccount: ''
      });
    } catch (error: any) {
      console.error("Error saving faculty member:", error);
      setErrorHeader({ message: "Authorization Failure: Could not persist staff member to vault.", type: 'error' });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewMember({ ...newMember, photoUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleUpdatePermissions = async (perms: string[]) => {
    if (!selectedFaculty?.id) return;
    setIsUpdatingPermissions(true);
    try {
      await facultyService.updateFaculty(selectedFaculty.id, { permissions: perms });
      const updated = { ...selectedFaculty, permissions: perms };
      setSelectedFaculty(updated);
      setFaculty(prev => prev.map(f => f.id === updated.id ? updated : f));
      setIsPermissionModalOpen(false);
    } catch (error) {
      console.error("Error updating permissions:", error);
    } finally {
      setIsUpdatingPermissions(false);
    }
  };

  const filteredFaculty = faculty.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Institutional Governance</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Personnel Registry</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-950 tracking-tight italic-serif">Faculty Management</h1>
          <p className="text-slate-500 text-sm mt-1 max-w-lg">Secure records for institution staff and researchers. All PII is vaulted.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest flex items-center gap-2 shadow-sm">
            <Download className="w-4 h-4" />
            <span>Export List</span>
          </button>
          {isAdmin && (
            <button 
              onClick={() => {
                setNewMember({ 
                  name: '', 
                  facultyId: '',
                  photoUrl: '',
                  email: '', 
                  phone: '', 
                  department: 'Theology', 
                  role: 'Professor', 
                  expertise: '',
                  bio: '',
                  officeHours: '',
                  status: 'active',
                  salary: 0,
                  bankAccount: ''
                });
                setIsAddModalOpen(true);
              }}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-200 group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span>Add Member</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 flex flex-wrap items-center gap-4 shadow-sm">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text" 
                placeholder="Search staff registry..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border-none rounded-2xl text-sm outline-none focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-slate-300 font-medium"
              />
            </div>
            <button className="px-5 py-3 border border-slate-200 rounded-xl text-slate-500 hover:bg-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden min-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500/10 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Authenticating Staff Registry...</p>
              </div>
            ) : filteredFaculty.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 text-center">
                <Users className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 italic-serif">No Faculty Members</h3>
                <p className="text-slate-400 text-sm max-w-xs mt-1">Found no faculty matching your current filters in the secure vault.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                    <th className="px-8 py-5">Academic Staff</th>
                    <th className="px-6 py-5">Chair/Department</th>
                    <th className="px-6 py-5">Specialization</th>
                    <th className="px-6 py-5 text-center">Status</th>
                    <th className="px-6 py-5 text-center">Protocol</th>
                    <th className="px-8 py-5 text-right">Privacy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredFaculty.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm uppercase">
                            {member.photoUrl ? (
                              <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{member.name.split(' ').map(n => n[0]).join('')}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 tracking-tight italic-serif">{member.name}</p>
                            <div className="flex gap-2 items-center mt-0.5">
                              {member.facultyId && (
                                <span className="text-[9px] uppercase font-black tracking-widest text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{member.facultyId}</span>
                              )}
                              <p className="text-[10px] uppercase font-bold text-slate-400">{member.email}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-medium text-slate-600">{member.department}</td>
                      <td className="px-6 py-6">
                        <p className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{member.expertise || 'Generalist'}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Faculty Core</p>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex justify-center">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                            member.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                          )}>
                            {member.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-center gap-2 text-slate-300" title="Zero-trust encryption enabled">
                          <ShieldAlert className="w-4 h-4 group-hover:text-amber-500 transition-colors" />
                          <span className="text-[10px] font-black uppercase tracking-tighter">Layer 4</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => setSelectedFaculty(member)}
                          className="px-4 py-2 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border border-slate-100"
                        >
                          Open Vault
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-100/50 sticky top-10">
            {selectedFaculty ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                  <div>
                    <h2 className="font-bold text-slate-900 italic-serif text-xl tracking-tight">Staff Dossier</h2>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5 underline">Secured Record</p>
                  </div>
                  <button onClick={() => setSelectedFaculty(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-[40%] bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center shadow-xl shadow-indigo-100/20 overflow-hidden">
                      {selectedFaculty.photoUrl ? (
                         <img src={selectedFaculty.photoUrl} alt={selectedFaculty.name} className="w-full h-full object-cover" />
                      ) : (
                         <Users className="w-10 h-10 text-indigo-600" />
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center">
                       <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 italic-serif">{selectedFaculty.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{selectedFaculty.role}</p>
                    {selectedFaculty.facultyId && (
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 font-black uppercase text-[9px] rounded tracking-widest">{selectedFaculty.facultyId}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 w-full justify-center">
                    <button 
                      onClick={() => alert(`Printing ID Card for ${selectedFaculty.name}...`)}
                      className="flex-1 px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-3 h-3" />
                      Print ID Card
                    </button>
                    {canEditProfile && (
                      <button 
                        onClick={() => {
                          setNewMember(selectedFaculty);
                          setIsAddModalOpen(true);
                        }}
                        className="flex-1 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-colors hover:bg-white">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm group-hover:text-indigo-600 transition-colors">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                         <div className="flex items-center gap-1.5 mb-1">
                           <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 leading-none">Phone</p>
                           <ShieldCheck className="w-2.5 h-2.5 text-indigo-400" />
                         </div>
                         <p className="text-sm font-bold text-slate-900">{selectedFaculty.phone || 'Not Configured'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-colors hover:bg-white">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm group-hover:text-indigo-600 transition-colors">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                         <div className="flex items-center gap-1.5 mb-1">
                           <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 leading-none">Email</p>
                           <ShieldCheck className="w-2.5 h-2.5 text-indigo-400" />
                         </div>
                         <p className="text-sm font-bold text-slate-900 truncate max-w-[140px]">{selectedFaculty.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-colors hover:bg-white">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm group-hover:text-indigo-600 transition-colors">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                         <div className="flex items-center gap-1.5 mb-1">
                           <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 leading-none">Chair / Department</p>
                           <ShieldCheck className="w-2.5 h-2.5 text-indigo-400" title="Restricted Academic Access" />
                         </div>
                         <p className="text-sm font-bold text-slate-900">{selectedFaculty.department}</p>
                      </div>
                    </div>

                    {selectedFaculty.expertise && (
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-colors hover:bg-white">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm group-hover:text-amber-500 transition-colors">
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                           <div className="flex items-center gap-1.5 mb-1">
                             <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 leading-none">Expertise</p>
                             <ShieldCheck className="w-2.5 h-2.5 text-amber-500" />
                           </div>
                           <p className="text-sm font-bold text-slate-900">{selectedFaculty.expertise}</p>
                        </div>
                      </div>
                    )}

                    {selectedFaculty.officeHours && (
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-colors hover:bg-white">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm group-hover:text-emerald-500 transition-colors">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                           <div className="flex items-center gap-1.5 mb-1">
                             <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 leading-none">Office Hours</p>
                             <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                           </div>
                           <p className="text-sm font-bold text-slate-900">{selectedFaculty.officeHours}</p>
                        </div>
                      </div>
                    )}

                    {selectedFaculty.bio && (
                      <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 italic-serif relative overflow-hidden group">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Academic Biography</p>
                          <ShieldCheck className="w-3 h-3 text-slate-200 group-hover:text-indigo-400 transition-colors" />
                        </div>
                        <p className="text-xs leading-relaxed text-slate-600 font-medium">{selectedFaculty.bio}</p>
                      </div>
                    )}

                    {(() => {
                       const assignedSubjects = subjects.filter(s => s.teacherIds?.includes(selectedFaculty.id!) || s.moderatorIds?.includes(selectedFaculty.id!));
                       if (assignedSubjects.length === 0) return null;
                       return (
                         <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm mt-4">
                           <div className="flex items-center justify-between mb-4">
                             <div className="flex items-center gap-2">
                               <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Assigned Subjects</p>
                               <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black">{assignedSubjects.length}</span>
                             </div>
                             <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
                           </div>
                           <div className="space-y-3">
                             {assignedSubjects.map(subject => (
                               <div key={subject.id} className="flex flex-col gap-1 pb-3 border-b border-slate-50 last:pb-0 last:border-0 border-dashed">
                                 <div className="flex items-center justify-between">
                                   <p className="text-sm font-bold text-slate-900 italic-serif">{subject.title}</p>
                                   <span className="text-[9px] font-black text-slate-400 uppercase">{subject.code}</span>
                                 </div>
                                 <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-500">
                                   <span>{subject.department}</span>
                                   <span>•</span>
                                   <span>{subject.semester || 'All Year'}</span>
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                       );
                    })()}
                  </div>

                    {canManageFinance && (
                      <div className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100 group">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-400 shadow-sm group-hover:text-indigo-600 transition-all">
                              <Lock className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Financial Vault</span>
                          </div>
                          <button 
                            onClick={() => setIsViewingSalary(!isViewingSalary)}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-colors"
                          >
                            {isViewingSalary ? 'Seal' : 'Decrypt'}
                          </button>
                        </div>

                        {isViewingSalary ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4 pt-2"
                          >
                            {[
                              { label: 'Annual Stipend', value: `$${(selectedFaculty.salary || 0).toLocaleString()}.00` },
                              { label: 'Bank Account', value: selectedFaculty.bankAccount || 'Not Provided' },
                            ].map((row, i) => (
                               <div key={i} className="flex justify-between items-center py-2 border-t border-indigo-100/30 group">
                                 <div className="flex items-center gap-2">
                                   <span className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">{row.label}</span>
                                   <ShieldCheck className="w-2.5 h-2.5 text-indigo-300 opacity-50" />
                                 </div>
                                 <span className="text-sm font-bold text-slate-900 font-mono tracking-tight">{row.value}</span>
                               </div>
                            ))}
                          </motion.div>
                        ) : (
                          <div className="py-6 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-indigo-100 rounded-xl bg-white/50 opacity-60">
                            <Shield className="w-6 h-6 text-indigo-300" />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-400 font-mono">Secured Layer 4</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <button 
                      onClick={() => setIsPermissionModalOpen(true)}
                      className="w-full py-5 bg-slate-950 text-white rounded-2xl font-bold text-[11px] uppercase tracking-[0.3em] hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-3 group"
                    >
                      <Lock className="w-4 h-4 group-hover:animate-pulse" />
                      <span>Configure Access</span>
                    </button>
                  )}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                   <Users className="w-8 h-8 text-slate-200" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 italic-serif mb-2">Registry Access</h3>
                <p className="text-slate-400 text-[10px] uppercase tracking-widest leading-relaxed">Select a faculty member <br />to view their cryptographic <br />personnel record.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
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
              className="bg-white rounded-[40px] w-full max-w-lg p-10 relative z-10 shadow-2xl border border-slate-100"
            >
              <div className="mb-8 border-b border-slate-50 pb-8">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight italic-serif">{newMember.id ? 'Edit Faculty Member' : 'Add Faculty Member'}</h2>
                <p className="text-sm text-slate-500 mt-1 capitalize">{newMember.id ? 'Update researcher or staff member details.' : 'Register a new researcher or staff member in the secure institutional registry.'}</p>
              </div>

              <form onSubmit={handleSaveMember} className="space-y-6">
                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="relative group cursor-pointer w-24 h-24">
                    <div className="w-full h-full rounded-3xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center group-hover:border-indigo-400 transition-colors">
                      {newMember.photoUrl ? (
                        <img src={newMember.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-8 h-8 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      title="Upload Profile Photo"
                    />
                    <div className="absolute -bottom-2 bg-white px-2 py-0.5 rounded-full border border-slate-200 text-[8px] font-black uppercase tracking-widest shadow-sm left-1/2 transform -translate-x-1/2">
                      Upload
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Faculty ID (Auto-gen if empty)</label>
                    <input 
                      type="text" 
                      value={newMember.facultyId || ''}
                      onChange={(e) => setNewMember({...newMember, facultyId: e.target.value})}
                      placeholder="e.g. FAC-2024-1001"
                      disabled={!isAdmin}
                      className={cn(
                        "w-full px-6 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none font-bold text-xs transition-all",
                        isAdmin ? "focus:bg-white focus:ring-4 focus:ring-indigo-100" : "opacity-70 cursor-not-allowed"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Profile Photo URL (Or Upload)</label>
                    <input 
                      type="url" 
                      value={newMember.photoUrl || ''}
                      onChange={(e) => setNewMember({...newMember, photoUrl: e.target.value})}
                      placeholder="https://..."
                      className="w-full px-6 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Legal Name</label>
                  <input 
                    required
                    type="text" 
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    placeholder="e.g. Dr. Albert Mohler"
                    disabled={!isAdmin}
                    className={cn(
                      "w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl outline-none font-medium italic-serif text-xl placeholder:text-slate-200 transition-all",
                      isAdmin ? "focus:bg-white focus:ring-8 focus:ring-indigo-100" : "opacity-70 cursor-not-allowed"
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={newMember.email}
                      onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                      placeholder="email@covenant.edu"
                      className="w-full px-6 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Phone Number</label>
                    <input 
                      required
                      type="tel" 
                      value={newMember.phone}
                      onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-6 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-xs font-bold font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Chair / Dept</label>
                    <select 
                      value={newMember.department}
                      onChange={(e) => setNewMember({...newMember, department: e.target.value})}
                      disabled={!isAdmin}
                      className={cn(
                        "w-full px-6 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none text-[10px] font-black uppercase tracking-widest appearance-none transition-all",
                        isAdmin ? "focus:bg-white focus:ring-4 focus:ring-indigo-100" : "opacity-70 cursor-not-allowed"
                      )}
                    >
                      <option>Theology</option>
                      <option>Exegesis</option>
                      <option>History</option>
                      <option>Philosophy</option>
                      <option>Homiletics</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Role</label>
                    <select 
                      value={newMember.role}
                      onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                      disabled={!isAdmin}
                      className={cn(
                        "w-full px-6 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none text-[10px] font-black uppercase tracking-widest appearance-none transition-all",
                        isAdmin ? "focus:bg-white focus:ring-4 focus:ring-indigo-100" : "opacity-70 cursor-not-allowed"
                      )}
                    >
                      <option>Professor</option>
                      <option>Subject Moderator</option>
                      <option>Researcher</option>
                      <option>Tutor</option>
                      <option>Chancellor</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Faculty Expertise</label>
                  <input 
                    type="text" 
                    value={newMember.expertise}
                    onChange={(e) => setNewMember({...newMember, expertise: e.target.value})}
                    placeholder="e.g. Reformation History, Systematic Theology"
                    className="w-full px-6 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Consultation Hours</label>
                    <input 
                      type="text" 
                      value={newMember.officeHours}
                      onChange={(e) => setNewMember({...newMember, officeHours: e.target.value})}
                      placeholder="e.g. Mon/Wed 2pm-4pm"
                      className="w-full px-6 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Instructor Biography</label>
                  <textarea 
                    value={newMember.bio}
                    onChange={(e) => setNewMember({...newMember, bio: e.target.value})}
                    placeholder="Brief academic background and research focus..."
                    rows={3}
                    className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-xs font-medium resize-none"
                  />
                </div>

                {isAdmin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 pl-1 mb-1">
                         <ShieldCheck className="w-3 h-3 text-emerald-500" />
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Annual Salary</label>
                       </div>
                       <input 
                         type="number"
                         value={newMember.salary}
                         onChange={(e) => setNewMember({...newMember, salary: Number(e.target.value)})}
                         placeholder="72000"
                         className="w-full px-6 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-xs font-bold"
                       />
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 pl-1 mb-1">
                         <Lock className="w-3 h-3 text-amber-500" />
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank Account</label>
                       </div>
                       <input 
                         type="text"
                         value={newMember.bankAccount}
                         onChange={(e) => setNewMember({...newMember, bankAccount: e.target.value})}
                         placeholder="XXXX-XXXX-XXXX"
                         className="w-full px-6 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-xs font-bold font-mono"
                       />
                    </div>
                  </div>
                )}

                <div className="pt-8 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-2 py-4 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 shadow-2xl shadow-slate-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{newMember.id ? 'Save Changes' : 'Integrate Staff'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Permissions Management Modal */}
      <AnimatePresence>
        {isPermissionModalOpen && selectedFaculty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPermissionModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-xl p-10 relative z-10 shadow-2xl border border-slate-100"
            >
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Administrative Protocol</span>
                    <ShieldCheck className="w-3 h-3 text-indigo-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight italic-serif">Access Control Matrix</h2>
                  <p className="text-sm text-slate-500 mt-1">Assigning institutional permissions for <span className="font-bold text-slate-900">{selectedFaculty.name}</span>.</p>
                </div>
                <button onClick={() => setIsPermissionModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-10">
                {[
                  'dashboard', 'admissions', 'faculty', 'students', 'courses', 'finance', 
                  'messaging', 'library', 'church', 'classroom', 'settings'
                ].map((perm) => {
                  const isActive = (selectedFaculty.permissions || []).includes(perm);
                  return (
                    <button
                      key={perm}
                      onClick={() => {
                        const current = selectedFaculty.permissions || [];
                        const next = isActive 
                          ? current.filter(p => p !== perm)
                          : [...current, perm];
                        setSelectedFaculty({ ...selectedFaculty, permissions: next });
                      }}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all flex items-center justify-between group",
                        isActive 
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                          : "bg-slate-50 border-slate-100 text-slate-600 hover:border-indigo-200"
                      )}
                    >
                      <div className="flex items-center gap-3">
                         <div className={cn(
                           "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                           isActive ? "bg-white/20" : "bg-white shadow-sm text-slate-300"
                         )}>
                           <Shield className="w-4 h-4" />
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-widest">{perm}</span>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all",
                        isActive ? "bg-white border-white text-indigo-600" : "border-slate-200 text-transparent"
                      )}>
                        <Check className="w-3 h-3" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-4">
                 <button 
                  onClick={() => setIsPermissionModalOpen(false)}
                  className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all"
                >
                  Discard
                </button>
                <button 
                  onClick={() => handleUpdatePermissions(selectedFaculty.permissions || [])}
                  disabled={isUpdatingPermissions}
                  className="flex-2 py-4 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 shadow-2xl shadow-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  {isUpdatingPermissions ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  <span>Commit Permissions</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
