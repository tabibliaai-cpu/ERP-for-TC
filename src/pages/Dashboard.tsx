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
    <div className="p-4 md:p-6 space-y-6">
      {/* ═══ PAGE HEADER ═══ */}
      <div className="erp-page-header mb-0">
        <div>
          <h1 className="erp-page-title">Dashboard</h1>
          <p className="erp-page-subtitle">
            {user?.institutionName || 'Institution'} — Academic Overview
          </p>
        </div>
        <button className="erp-btn-secondary">
          <Calendar className="w-4 h-4" />
          2024 Cycle
        </button>
      </div>

      {/* ═══ METRIC CARDS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.3 }}
            className="erp-stat hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {metric.name}
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {isLoading ? '—' : metric.value}
                </p>
                <p className="text-xs text-slate-400 mt-1.5">{metric.label}</p>
              </div>
              <div className={cn("p-2.5 rounded-lg border", metric.color)}>
                <metric.icon className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ═══ CONTENT GRID: TABLE + EVENTS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ──── Recent Students Table ──── */}
        <div className="lg:col-span-2">
          <div className="erp-card overflow-hidden">
            <div className="erp-card-header">
              <h2 className="text-sm font-semibold text-slate-900">Recent Students</h2>
              <button className="erp-btn-ghost text-xs text-blue-600 hover:text-blue-700">
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Student</th>
                    <th>Program</th>
                    <th>Enrollment</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                          <span className="text-xs text-slate-400">Loading records…</span>
                        </div>
                      </td>
                    </tr>
                  ) : recentStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                        No recent entries.
                      </td>
                    </tr>
                  ) : (
                    recentStudents.map((student) => (
                      <tr key={student.id}>
                        <td>
                          <span className={cn(
                            "inline-flex items-center gap-1.5 text-xs font-medium",
                            student.status === 'active' ? "text-emerald-700" : "text-amber-700"
                          )}>
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              student.status === 'active' ? "bg-emerald-500" : "bg-amber-500"
                            )} />
                            {student.status === 'active' ? 'Active' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          <p className="font-medium text-slate-800">{student.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{student.email}</p>
                        </td>
                        <td>
                          <span className="erp-badge-slate">{student.program}</span>
                        </td>
                        <td>
                          <span className="font-mono text-xs text-slate-500">{student.id?.slice(0, 8)}</span>
                        </td>
                        <td className="text-right">
                          <button className="erp-btn-ghost p-1.5 text-slate-400 hover:text-blue-600">
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
        </div>

        {/* ──── Upcoming Events ──── */}
        <div>
          <div className="erp-card">
            <div className="erp-card-header">
              <h2 className="text-sm font-semibold text-slate-900">Upcoming Events</h2>
              <GraduationCap className="w-4 h-4 text-slate-400" />
            </div>
            <div className="p-4">
              {upcomingEvents.length === 0 && !isLoading && (
                <div className="py-8 text-center text-xs text-slate-400">
                  No upcoming events
                </div>
              )}
              <div className="space-y-4">
                {upcomingEvents.map((event) => {
                  const eventDate = new Date(event.date || Date.now());
                  const month = eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                  const day = eventDate.getDate();

                  return (
                    <div
                      key={event.id}
                      className="flex gap-3 group"
                    >
                      {/* Date Block */}
                      <div className="w-14 h-14 rounded-lg bg-blue-600 text-white flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-semibold uppercase leading-none tracking-wide">
                          {month}
                        </span>
                        <span className="text-xl font-bold leading-tight mt-0.5">
                          {day}
                        </span>
                      </div>

                      {/* Event Info */}
                      <div className="flex-1 min-w-0 border-b border-slate-100 pb-4 group-last:border-b-0 group-last:pb-0">
                        <h3 className="text-sm font-medium text-slate-900 truncate">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>{event.time}</span>
                          {event.location && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="truncate">{event.location}</span>
                            </>
                          )}
                        </div>
                        {event.type && (
                          <span className={cn(
                            "erp-badge mt-2",
                            event.type === 'academic' && "erp-badge-blue",
                            event.type === 'liturgy' && "erp-badge-amber",
                            event.type === 'seminar' && "erp-badge-green",
                            event.type === 'community' && "erp-badge-slate"
                          )}>
                            {event.type}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button className="erp-btn-secondary w-full mt-4 text-xs border-dashed">
                View Complete Calendar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
