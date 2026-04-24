import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  BadgeDollarSign, 
  ArrowUpRight,
  Plus,
  Calendar,
  ChevronRight,
  TrendingUp,
  Activity,
  ShieldCheck,
  Heart
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { globalService, studentService, churchService, Student, InstitutionalEvent } from '../services/dataService';
import { useAuthStore } from '../store/useStore';

export function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    studentCount: 0,
    courseCount: 0,
    totalRevenue: 0,
  });
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<InstitutionalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  if (user?.role === 'super_admin') {
    return <Navigate to="/super-admin" replace />;
  }

  useEffect(() => {
    if (user?.tenantId) {
      loadStats();
      loadRecentStudents();
      loadEvents();
    }
  }, [user?.tenantId]);

  const loadStats = async () => {
    try {
      const data = await globalService.getTenantStats(user!.tenantId!);
      setStats(data);
    } catch (error) {
      console.error("Dashboard error:", error);
    }
  };

  const loadRecentStudents = async () => {
    setIsLoading(true);
    try {
      const data = await studentService.getStudentsByTenant(user!.tenantId!);
      // Sort or limit as needed, for now just taking first 5
      setRecentStudents(data.slice(0, 5));
    } catch (error) {
      console.error("Failed to load students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEvents = async () => {
    if (!user?.tenantId) return;
    try {
      const events = await churchService.getEventsByTenant(user.tenantId);
      setUpcomingEvents(events.slice(0, 3));
    } catch (error) {
      console.error("Failed to load events:", error);
    }
  };

  const metrics = [
    { name: 'Enrollment', value: stats.studentCount.toLocaleString(), label: 'Active Students', icon: Users, color: 'indigo' },
    { name: 'Curriculum', value: stats.courseCount.toLocaleString(), label: 'Active Modules', icon: BookOpen, color: 'blue' },
    { name: 'Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, label: 'Institution Ledger', icon: BadgeDollarSign, color: 'emerald' },
    { name: 'Capacity', value: '92%', label: 'Room Utilization', icon: Activity, color: 'amber' },
  ];

  return (
    <div className="space-y-10">
      {/* Header with Breadcrumb-ish feel */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Overview</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Governance Portal</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-950 tracking-tight ">Covenant Council</h1>
          <p className="text-slate-500 text-sm mt-1 max-w-lg">Welcome to the central command for St. Peter's Seminary. All data layers are cryptographically secured.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest flex items-center gap-2 shadow-sm">
            <Calendar className="w-4 h-4" />
            <span>2024 Cycle</span>
          </button>
          <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-200">
            <Plus className="w-4 h-4" />
            <span>Quick Entry</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid - Recipe 1 Inspired */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-slate-200 rounded-3xl bg-white divide-x divide-y divide-slate-200 overflow-hidden shadow-sm">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 hover:bg-slate-50/50 transition-colors group"
          >
            <div className="flex items-center justify-between mb-8">
              <div className={cn(
                "p-2.5 rounded-lg border",
                metric.color === 'indigo' && "bg-indigo-50 border-indigo-100 text-indigo-600",
                metric.color === 'blue' && "bg-blue-50 border-blue-100 text-blue-600",
                metric.color === 'emerald' && "bg-emerald-50 border-emerald-100 text-emerald-600",
                metric.color === 'amber' && "bg-amber-50 border-amber-100 text-amber-600",
              )}>
                <metric.icon className="w-5 h-5" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{metric.name}</p>
            <div className="mt-2 flex items-end gap-2">
              <h3 className="text-3xl font-bold text-slate-900 leading-none tabular-nums font-mono">
                {isLoading ? '---' : metric.value}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-2 ">{metric.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight ">Academic Registry</h2>
            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 hover:underline">Full Database</button>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Enrollment</th>
                  <th className="px-6 py-4 text-right">Privacy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </td>
                  </tr>
                ) : recentStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-bold">No recent registry entries.</td>
                  </tr>
                ) : (
                  recentStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                      <td className="px-6 py-5">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          student.status === 'active' ? "bg-emerald-500" : "bg-amber-400"
                        )}></div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-800 ">{student.name}</p>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">{student.program}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-mono text-slate-500">{student.id.slice(0, 8)}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <ShieldCheck className="w-4 h-4 text-slate-200 ml-auto group-hover:text-indigo-600 transition-colors" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
           <h2 className="text-xl font-bold text-slate-900 tracking-tight ">Upcoming Liturgy</h2>
           <div className="space-y-4">
             {upcomingEvents.length === 0 && !isLoading && (
               <div className="p-5 border-2 border-dashed border-slate-200 rounded-3xl text-center text-[10px] font-black uppercase text-slate-400">
                 No upcoming events
               </div>
             )}
             {upcomingEvents.map((event) => (
               <div key={event.id} className="p-5 bg-white border border-slate-200/60 rounded-3xl flex gap-5 hover:border-indigo-100 hover:shadow-sm transition-all group">
                 <div className="w-14 h-14 rounded-2xl bg-slate-950 text-white flex flex-col items-center justify-center shrink-0 shadow-lg shadow-slate-200">
                   <span className="text-[10px] font-black">
                     {new Date(event.date || Date.now()).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                   </span>
                   <span className="text-xl font-bold tabular-nums">
                     {new Date(event.date || Date.now()).getDate()}
                   </span>
                 </div>
                 <div className="flex-1 min-w-0">
                   <h3 className="text-sm font-bold text-slate-900  truncate group-hover:text-indigo-600 transition-colors">
                     {event.title}
                   </h3>
                   <div className="flex items-center gap-3 mt-1.5 font-mono text-[10px] text-slate-400 uppercase font-black">
                     <span>{event.time}</span>
                     {event.type && (
                       <>
                         <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                         <span className="text-indigo-500/60">{event.type}</span>
                       </>
                     )}
                   </div>
                 </div>
               </div>
             ))}
           </div>
           <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50/10 transition-all">
             View Complete Calendar
           </button>
        </div>
      </div>
    </div>
  );
}
