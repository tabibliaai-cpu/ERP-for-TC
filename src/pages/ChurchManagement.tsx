import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Calendar, 
  Users, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ChevronRight,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Filter,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  churchService, 
  prayerService, 
  congregationService, 
  InstitutionalEvent, 
  PrayerRequest, 
  CongregationMember 
} from '../services/dataService';
import { useAuthStore } from '../store/useStore';

export function ChurchManagement() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'events' | 'prayer' | 'congregation'>('events');
  const [events, setEvents] = useState<InstitutionalEvent[]>([]);
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [members, setMembers] = useState<CongregationMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  // Forms
  const [newEvent, setNewEvent] = useState<Omit<InstitutionalEvent, 'id' | 'tenantId'>>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'liturgy',
    location: ''
  });

  const [newRequest, setNewRequest] = useState({
    userName: user?.name || '',
    content: ''
  });

  const [newMember, setNewMember] = useState<Omit<CongregationMember, 'id' | 'tenantId' | 'joinDate'>>({
    name: '',
    email: '',
    phone: '',
    category: 'frequent'
  });

  useEffect(() => {
    if (user?.tenantId) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [eventsData, prayersData, membersData] = await Promise.all([
        churchService.getEventsByTenant(user!.tenantId!),
        prayerService.getRequestsByTenant(user!.tenantId!),
        congregationService.getMembersByTenant(user!.tenantId!)
      ]);
      setEvents(eventsData);
      setPrayers(prayersData);
      setMembers(membersData);
    } catch (error) {
      console.error("Failed to load church data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenantId) return;
    try {
      await churchService.addEvent({ ...newEvent, tenantId: user.tenantId });
      setIsEventModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  const handleAddRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenantId) return;
    try {
      await prayerService.addRequest({ ...newRequest, status: 'pending', tenantId: user.tenantId });
      setIsRequestModalOpen(false);
      setNewRequest({ ...newRequest, content: '' });
      loadData();
    } catch (error) {
      console.error("Error adding prayer request:", error);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenantId) return;
    try {
      await congregationService.addMember({ ...newMember, tenantId: user.tenantId });
      setIsMemberModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const togglePrayerStatus = async (id: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'pending' ? 'answered' : 'pending';
      await prayerService.updateStatus(id, nextStatus as 'pending' | 'answered');
      loadData();
    } catch (error) {
      console.error("Error updating prayer status:", error);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Spiritual Oversight</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Institutional Liturgy</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-950 tracking-tight ">Church Operations</h1>
          <p className="text-slate-500 text-sm mt-1 max-w-lg">Manage congregation lifecycle, prayer intercessions, and the ecclesiastical calendar with theological precision.</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'events' && (
            <button 
              onClick={() => setIsEventModalOpen(true)}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-200"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Event</span>
            </button>
          )}
          {activeTab === 'prayer' && (
            <button 
              onClick={() => setIsRequestModalOpen(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-100"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Submit Request</span>
            </button>
          )}
          {activeTab === 'congregation' && (
            <button 
              onClick={() => setIsMemberModalOpen(true)}
              className="px-6 py-3 bg-slate-950 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-200"
            >
              <Users className="w-4 h-4" />
              <span>Register Member</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-5">
            {[
              { id: 'events', label: 'Liturgy & Events', icon: Calendar },
              { id: 'prayer', label: 'Prayer Board', icon: Heart },
              { id: 'congregation', label: 'Congregation', icon: Users },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative py-2",
                  activeTab === tab.id ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {activeTab === tab.id && <motion.div layoutId="church-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 border border-slate-200 rounded-xl text-slate-400 hover:bg-white transition-all shadow-sm">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2.5 border border-slate-200 rounded-xl text-slate-400 hover:bg-white transition-all shadow-sm">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 min-h-[500px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-80 gap-4">
              <div className="w-12 h-12 border-4 border-indigo-500/10 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse">Syncing Ecclesiastical Data...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'events' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  {events.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-slate-300">
                      <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p className=" font-bold">No liturgical events scheduled for this cycle.</p>
                    </div>
                  ) : (
                    events.map((event) => (
                      <div key={event.id} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                         <div className="flex items-center justify-between mb-6">
                            <span className={cn(
                              "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
                              event.type === 'liturgy' ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
                            )}>
                              {event.type}
                            </span>
                            <div className="text-right">
                               <p className="text-[10px] font-black text-slate-900 uppercase">{event.date}</p>
                               <p className="text-[9px] font-mono text-slate-400 uppercase">{event.time}</p>
                            </div>
                         </div>
                         <h3 className="text-xl font-bold text-slate-900  tracking-tight mb-3 group-hover:text-indigo-600 transition-colors uppercase leading-tight">
                           {event.title}
                         </h3>
                         <p className="text-sm text-slate-500 line-clamp-2 mb-6">{event.description}</p>
                         <div className="flex items-center gap-2 pt-6 border-t border-slate-50">
                            <MapPin className="w-3.5 h-3.5 text-slate-300" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{event.location}</span>
                         </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === 'prayer' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {prayers.length === 0 ? (
                    <div className="py-10 text-center text-slate-300">
                      <Heart className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p className=" font-bold">The prayer board is currenty serene. No pending intercessions.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {prayers.map((prayer) => (
                        <div key={prayer.id} className="p-6 bg-slate-50/50 border border-slate-100 rounded-3xl hover:bg-white hover:border-indigo-100 transition-all group">
                           <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-indigo-400" />
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-slate-900 ">{prayer.userName}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Petition Registry</p>
                                 </div>
                              </div>
                              <button 
                                onClick={() => togglePrayerStatus(prayer.id!, prayer.status)}
                                className={cn(
                                  "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all",
                                  prayer.status === 'answered' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-white text-slate-400 border-slate-100"
                                )}
                              >
                                {prayer.status === 'answered' ? 'Answered' : 'Pending Intercession'}
                              </button>
                           </div>
                           <p className="text-slate-600 text-sm leading-relaxed mb-6 ">"{prayer.content}"</p>
                           <div className="flex items-center justify-between text-[9px] font-mono text-slate-300 uppercase font-black pt-4 border-t border-white">
                              <span>Ref: #{prayer.id?.slice(-8)}</span>
                              <span>System Time: {new Date(prayer.date?.seconds * 1000).toLocaleString() || 'Live'}</span>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'congregation' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/30 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                        <th className="px-8 py-5">Full Name & Identity</th>
                        <th className="px-6 py-5 text-center">Commitment Tier</th>
                        <th className="px-6 py-5 text-center">Contact Protocol</th>
                        <th className="px-8 py-5 text-right">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {members.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-8 py-10 text-center text-slate-300  font-bold">No registered congregation members yet.</td>
                        </tr>
                      ) : (
                        members.map((member) => (
                          <tr key={member.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all uppercase">
                                    {member.name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <div>
                                     <p className="text-base font-bold text-slate-900  tracking-tight">{member.name}</p>
                                     <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">Member ID: {member.id?.slice(0, 8)}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-6 text-center">
                               <span className={cn(
                                 "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                 member.category === 'leader' ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-slate-50 text-slate-500 border border-slate-100"
                               )}>
                                 {member.category}
                               </span>
                            </td>
                            <td className="px-6 py-6 text-center">
                               <div className="space-y-1">
                                  <p className="text-xs font-medium text-slate-600">{member.email || 'N/A'}</p>
                                  <p className="text-[10px] font-mono text-slate-400">{member.phone || 'N/A'}</p>
                               </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <div className="flex items-center justify-end gap-2 text-slate-200 group-hover:text-indigo-600 transition-colors">
                                  <ShieldCheck className="w-4 h-4" />
                                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">Verified</span>
                               </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isEventModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEventModalOpen(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-3xl w-full max-w-md p-6 relative z-10 shadow-2xl">
                <h2 className="text-xl font-bold text-slate-900  mb-6">Schedule Institutional Event</h2>
                <form onSubmit={handleAddEvent} className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</label>
                      <input required type="text" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none font-bold " />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                          <input required type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</label>
                          <input required type="time" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" />
                       </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</label>
                      <select value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value as any})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none uppercase font-black text-[10px] tracking-widest">
                         <option value="liturgy">Liturgy</option>
                         <option value="academic">Academic Event</option>
                         <option value="community">Community Service</option>
                         <option value="seminar">Institutional Seminar</option>
                      </select>
                   </div>
                   {(newEvent.type === 'liturgy' || newEvent.type === 'academic') && (
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</label>
                        <input required type="text" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-medium" />
                     </div>
                   )}
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Short Description</label>
                      <textarea value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none h-24 text-sm" />
                   </div>
                   <div className="pt-4 flex gap-3">
                      <button type="button" onClick={() => setIsEventModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm">Cancel</button>
                      <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-100">Establish Registry</button>
                   </div>
                </form>
            </motion.div>
          </div>
        )}

        {isRequestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsRequestModalOpen(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-3xl w-full max-w-md p-6 relative z-10 shadow-2xl">
                <h2 className="text-xl font-bold text-slate-900  mb-6">Submit Spiritual Petition</h2>
                <form onSubmit={handleAddRequest} className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Petition Source</label>
                      <input required type="text" value={newRequest.userName} onChange={e => setNewRequest({...newRequest, userName: e.target.value})} placeholder="Full name for intercession..." className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none font-bold " />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Petition Content</label>
                      <textarea required value={newRequest.content} onChange={e => setNewRequest({...newRequest, content: e.target.value})} placeholder="Explain the focus for communal prayer..." className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none h-40 text-sm leading-relaxed" />
                   </div>
                   <div className="pt-4 flex gap-3">
                      <button type="button" onClick={() => setIsRequestModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm">Cancel</button>
                      <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-100">Submit for Intercession</button>
                   </div>
                </form>
            </motion.div>
          </div>
        )}

        {isMemberModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMemberModalOpen(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-3xl w-full max-w-md p-6 relative z-10 shadow-2xl">
                <h2 className="text-xl font-bold text-slate-900  mb-6">Register Congregation Member</h2>
                <form onSubmit={handleAddMember} className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Legal Name</label>
                      <input required type="text" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none font-bold " />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email (Optional)</label>
                          <input type="email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone (Optional)</label>
                          <input type="tel" value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs" />
                       </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commitment Category</label>
                      <select value={newMember.category} onChange={e => setNewMember({...newMember, category: e.target.value as any})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none uppercase font-black text-[10px] tracking-widest">
                         <option value="frequent">Frequent Attendant</option>
                         <option value="occasional">Occasional Visitor</option>
                         <option value="leader">Institutional Leader</option>
                      </select>
                   </div>
                   <div className="pt-4 flex gap-3">
                      <button type="button" onClick={() => setIsMemberModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm">Cancel</button>
                      <button type="submit" className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-xl shadow-slate-200">Finalize Registration</button>
                   </div>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
