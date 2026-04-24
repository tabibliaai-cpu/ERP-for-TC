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
  Heart,
  Sparkles
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
    { name: 'Enrollment', value: stats.studentCount.toLocaleString(), label: 'Active Students', icon: Users, gradient: 'from-fuchsia-500 to-pink-500', bg: 'from-fuchsia-50 to-pink-50', ring: 'ring-fuchsia-200' },
    { name: 'Curriculum', value: stats.courseCount.toLocaleString(), label: 'Active Modules', icon: BookOpen, gradient: 'from-violet-500 to-indigo-500', bg: 'from-violet-50 to-indigo-50', ring: 'ring-violet-200' },
    { name: 'Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, label: 'Institution Ledger', icon: BadgeDollarSign, gradient: 'from-emerald-500 to-teal-500', bg: 'from-emerald-50 to-teal-50', ring: 'ring-emerald-200' },
    { name: 'Capacity', value: '92%', label: 'Room Utilization', icon: Activity, gradient: 'from-amber-500 to-orange-500', bg: 'from-amber-50 to-orange-50', ring: 'ring-amber-200' },
  ];

  return (
    <div className="space-y-8">
      {/* ═══ HERO HEADER ═══ */}
      <div className="relative overflow-hidden rounded-2xl p-8" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 30%, #ec4899 70%, #f43f5e 100%)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-fuchsia-300/15 rounded-full blur-2xl" />
        <div className="absolute top-4 left-4 w-20 h-20 bg-cyan-300/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Command Center</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Covenant <span className="bg-gradient-to-r from-yellow-200 via-amber-200 to-orange-200 bg-clip-text" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Council</span>
            </h1>
            <p className="text-sm text-white/70 mt-2 max-w-lg">Welcome to the central command for St. Peter's Seminary. All data layers are cryptographically secured.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl text-xs font-bold text-white hover:bg-white/20 transition-all uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>2024 Cycle</span>
            </button>
            <button className="px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl text-xs font-bold text-slate-900 hover:from-yellow-300 hover:to-amber-400 transition-all uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-amber-500/25">
              <Plus className="w-4 h-4" />
              <span>Quick Entry</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ METRICS CARDS ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group cursor-default"
          >
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-[0.04] group-hover:opacity-[0.08] transition-opacity", metric.bg)} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className={cn("p-2.5 rounded-xl bg-gradient-to-br ring-1", metric.bg, metric.ring)}>
                  <metric.icon className="w-5 h-5 text-slate-700" />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{metric.name}</p>
              <div className="mt-2 flex items-end gap-2">
                <h3 className={cn("text-3xl font-black leading-none tabular-nums font-mono bg-gradient-to-br bg-clip-text", metric.gradient)} style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {isLoading ? '---' : metric.value}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-2">{metric.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Academic Registry</h2>
            <button className="text-[10px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-fuchsia-500 to-violet-500 bg-clip-text hover:underline" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Full Database</button>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gradient-to-r from-fuchsia-50/80 to-violet-50/80 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-fuchsia-100/50">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Enrollment</th>
                  <th className="px-6 py-4 text-right">Privacy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center">
                      <div className="w-6 h-6 border-2 border-fuchsia-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </td>
                  </tr>
                ) : recentStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-bold">No recent registry entries.</td>
                  </tr>
                ) : (
                  recentStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-fuchsia-50/30 transition-colors group cursor-pointer">
                      <td className="px-6 py-4">
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full shadow-sm",
                          student.status === 'active' ? "bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-emerald-200" : "bg-gradient-to-r from-amber-400 to-orange-400 shadow-amber-200"
                        )}></div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{student.name}</p>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">{student.program}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-slate-500">{student.id.slice(0, 8)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ShieldCheck className="w-4 h-4 text-slate-200 ml-auto group-hover:text-fuchsia-500 transition-colors" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Upcoming Events</h2>
          <div className="space-y-3">
            {upcomingEvents.length === 0 && !isLoading && (
              <div className="p-5 border-2 border-dashed border-fuchsia-100 rounded-2xl text-center text-[10px] font-black uppercase text-slate-400">
                No upcoming events
              </div>
            )}
            {upcomingEvents.map((event) => (
              <div key={event.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex gap-4 hover:border-fuchsia-200 hover:shadow-md hover:shadow-fuchsia-50 transition-all group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white flex flex-col items-center justify-center shrink-0 shadow-lg shadow-fuchsia-200">
                  <span className="text-[10px] font-black">
                    {new Date(event.date || Date.now()).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                  </span>
                  <span className="text-xl font-bold tabular-nums">
                    {new Date(event.date || Date.now()).getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-fuchsia-600 transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5 font-mono text-[10px] text-slate-400 uppercase font-black">
                    <span>{event.time}</span>
                    {event.type && (
                      <>
                        <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                        <span className="text-fuchsia-500">{event.type}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-3.5 border-2 border-dashed border-fuchsia-200 rounded-2xl text-fuchsia-500 text-[10px] font-black uppercase tracking-[0.2em] hover:border-fuchsia-300 hover:text-fuchsia-600 hover:bg-fuchsia-50/50 transition-all">
            View Complete Calendar
          </button>
        </div>
      </div>
    </div>
  );
}
