import React, { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  BadgeDollarSign, 
  Calendar,
  TrendingUp,
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
    { name: 'Enrollment', value: stats.studentCount.toLocaleString(), label: 'Active Students', icon: Users, color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { name: 'Curriculum', value: stats.courseCount.toLocaleString(), label: 'Active Modules', icon: BookOpen, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { name: 'Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, label: 'Institution Ledger', icon: BadgeDollarSign, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { name: 'Capacity', value: '92%', label: 'Room Utilization', icon: TrendingUp, color: 'bg-amber-50 text-amber-600 border-amber-100' },
  ];

  return (
    <div className="space-y-6">
      {/* ═══ HEADER ═══ */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              {user?.institutionName || 'Institution'} — Academic Overview
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <Calendar className="w-4 h-4" />
              2024 Cycle
            </button>
          </div>
        </div>
      </div>

      {/* ═══ METRICS CARDS ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-md border", metric.color)}>
                <metric.icon className="w-4 h-4" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100" />
            </div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{metric.name}</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">
              {isLoading ? '---' : metric.value}
            </p>
            <p className="text-xs text-slate-400 mt-1">{metric.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ═══ RECENT STUDENTS TABLE ═══ */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent Students</h2>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700">View All</button>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Enrollment</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center">
                      <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    </td>
                  </tr>
                ) : recentStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-sm">No recent entries.</td>
                  </tr>
                ) : (
                  recentStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          student.status === 'active' ? "bg-emerald-500" : "bg-amber-500"
                        )}></div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{student.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{student.program}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-slate-500">{student.id.slice(0, 8)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-slate-400 hover:text-blue-600 transition-colors">
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ═══ UPCOMING EVENTS ═══ */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Upcoming Events</h2>
          <div className="space-y-3">
            {upcomingEvents.length === 0 && !isLoading && (
              <div className="p-4 border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400">
                No upcoming events
              </div>
            )}
            {upcomingEvents.map((event) => (
              <div key={event.id} className="p-4 bg-white border border-slate-200 rounded-lg flex gap-3 hover:border-slate-300 hover:shadow-sm transition-all">
                <div className="w-12 h-12 rounded-md bg-blue-600 text-white flex flex-col items-center justify-center shrink-0">
                  <span className="text-[9px] font-semibold uppercase leading-none">
                    {new Date(event.date || Date.now()).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className="text-lg font-bold leading-tight">
                    {new Date(event.date || Date.now()).getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-slate-900 truncate">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span>{event.time}</span>
                    {event.type && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-blue-600">{event.type}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-2.5 border border-dashed border-slate-300 rounded-lg text-slate-500 text-xs font-medium hover:border-blue-300 hover:text-blue-600 transition-colors">
            View Complete Calendar
          </button>
        </div>
      </div>
    </div>
  );
}
