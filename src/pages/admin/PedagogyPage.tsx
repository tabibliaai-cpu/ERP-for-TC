import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Upload, Users, MessageSquare, Calendar, BarChart3, Plus,
  Search, Filter, Star, Clock, ChevronRight, FileText, Video, ExternalLink,
  X, CheckCircle, AlertCircle, TrendingUp, Heart, Brain
} from 'lucide-react';
import { getLessonPlans, createLessonPlan, getToken } from '../../utils/api';

// --- Sample Data ---
const lessonPlans = [
  { id: 1, course: 'Systematic Theology I', topic: 'Doctrine of God - His Attributes', teacher: 'Dr. Samuel Johnson', date: '2026-04-28', duration: '90 min', method: 'Lecture + Discussion', status: 'Upcoming', engagement: 0 },
  { id: 2, course: 'New Testament Survey', topic: 'The Gospel of John - Prologue', teacher: 'Prof. Maria Garcia', date: '2026-04-27', duration: '75 min', method: 'Sermon-based Teaching', status: 'Completed', engagement: 92 },
  { id: 3, course: 'Pastoral Ministry', topic: 'Hospital Visitation & Pastoral Care', teacher: 'Rev. David Williams', date: '2026-04-26', duration: '60 min', method: 'Case Study', status: 'Completed', engagement: 88 },
  { id: 4, course: 'Hermeneutics', topic: 'Principles of Biblical Interpretation', teacher: 'Dr. Sarah Chen', date: '2026-04-25', duration: '90 min', method: 'Interactive Bible Study', status: 'Completed', engagement: 95 },
  { id: 5, course: 'Church History I', topic: 'The Early Church Fathers', teacher: 'Prof. James Anderson', date: '2026-04-24', duration: '75 min', method: 'Lecture', status: 'Completed', engagement: 78 },
];

const resources = [
  { id: 1, title: 'Lecture Notes: Doctrine of the Trinity', type: 'PDF', course: 'Systematic Theology I', uploadedBy: 'Dr. Samuel Johnson', date: '2026-04-26', downloads: 34 },
  { id: 2, title: 'Video: Exegesis of Romans 8', type: 'Video', course: 'Hermeneutics', uploadedBy: 'Dr. Sarah Chen', date: '2026-04-25', downloads: 28 },
  { id: 3, title: 'Sermon: The Great Commission', type: 'Audio', course: 'Pastoral Ministry', uploadedBy: 'Rev. David Williams', date: '2026-04-24', downloads: 19 },
  { id: 4, title: 'Reading List: Christology in the Early Church', type: 'Link', course: 'Church History I', uploadedBy: 'Prof. James Anderson', date: '2026-04-23', downloads: 15 },
  { id: 5, title: 'Assignment: Spiritual Gifts Assessment', type: 'PDF', course: 'Practical Theology', uploadedBy: 'Prof. Maria Garcia', date: '2026-04-22', downloads: 42 },
];

const mentorships = [
  { id: 1, mentor: 'Dr. Samuel Johnson', student: 'John Abraham', focus: 'Academic + Spiritual', meetings: 8, lastMeeting: '2026-04-25', status: 'Active', growth: 'Strong' },
  { id: 2, mentor: 'Rev. David Williams', student: 'Sarah Thompson', focus: 'Ministry Formation', meetings: 12, lastMeeting: '2026-04-24', status: 'Active', growth: 'Excellent' },
  { id: 3, mentor: 'Dr. Sarah Chen', student: 'Michael Davis', focus: 'Academic Research', meetings: 5, lastMeeting: '2026-04-22', status: 'Active', growth: 'Growing' },
  { id: 4, mentor: 'Prof. James Anderson', student: 'Emily Parker', focus: 'Spiritual Formation', meetings: 15, lastMeeting: '2026-04-26', status: 'Active', growth: 'Strong' },
];

const teachingMethods = [
  { name: 'Lecture', desc: 'Traditional expository teaching with structured outline', usage: 45 },
  { name: 'Discussion', desc: 'Interactive dialogue exploring theological concepts', usage: 20 },
  { name: 'Case Study', desc: 'Real-world ministry scenarios for analysis', usage: 15 },
  { name: 'Sermon-based', desc: 'Teaching through sermon preparation and delivery', usage: 12 },
  { name: 'Field-based', desc: 'Practical ministry immersion and experiential learning', usage: 8 },
];

const spiritualActivities = [
  { activity: 'Morning Devotions', participation: 85, trend: 'up' },
  { activity: 'Prayer Meetings', participation: 72, trend: 'up' },
  { activity: 'Bible Study Groups', participation: 68, trend: 'stable' },
  { activity: 'Choir Practice', participation: 45, trend: 'down' },
  { activity: 'Outreach Programs', participation: 38, trend: 'up' },
];

// ─── Toast helper ─────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState<{msg: string; type: 'success' | 'error'} | null>(null);
  const show = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);
  const ToastUI = toast ? (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white animate-fade-in ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
      {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      {toast.msg}
    </div>
  ) : null;
  return { show, ToastUI };
}

export default function PedagogyPage() {
  const [activeTab, setActiveTab] = useState('lessons');
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { show: showToast, ToastUI } = useToast();

  // Lesson plan form state
  const [lpForm, setLpForm] = useState({ course: 'Systematic Theology I', date: new Date().toISOString().split('T')[0], topic: '', method: 'Lecture', duration: '60 min', scripture: '', objectives: '', activities: '' });

  // ─── API Data Layer ──────────────────────────────────────────────────
  const [apiLessonPlans, setApiLessonPlans] = useState(lessonPlans);
  const [dataLoaded, setDataLoaded] = useState(false);

  const effectiveLessonPlans = dataLoaded && apiLessonPlans.length > 0 ? apiLessonPlans : lessonPlans;

  useEffect(() => {
    const token = getToken();
    if (!token) { setDataLoaded(true); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await getLessonPlans();
        if (cancelled) return;
        if (Array.isArray(res)) {
          const mapped = res.map((l: any) => ({
            id: l.id ?? l.lesson_plan_id ?? 0, course: l.course_name ?? l.course ?? '', topic: l.topic ?? '', teacher: l.teacher_name ?? l.teacher ?? '', date: l.date ?? '', duration: l.duration ?? '60 min', method: l.method ?? 'Lecture', status: l.status ?? 'Upcoming', engagement: Number(l.engagement ?? 0),
          }));
          setApiLessonPlans(mapped);
        }
      } catch { /* fallback remains */ }
      setDataLoaded(true);
    })();
    return () => { cancelled = true; };
  }, []);

  const tabs = [
    { id: 'lessons', label: 'Lesson Plans', icon: BookOpen },
    { id: 'resources', label: 'Resources', icon: FileText },
    { id: 'engagement', label: 'Engagement', icon: TrendingUp },
    { id: 'mentorship', label: 'Mentorship', icon: Users },
    { id: 'spiritual', label: 'Spiritual Formation', icon: Heart },
  ];

  const filteredLessons = effectiveLessonPlans.filter(l =>
    l.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {ToastUI}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pedagogical Portal</h2>
          <p className="text-slate-500 mt-1">Teaching methods, resources, and formation tracking</p>
        </div>
        <button
          onClick={() => { setActiveTab('lessons'); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-white font-bold text-sm shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-300 transition-all"
        >
          <Plus className="h-4 w-4" />
          Create Lesson Plan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: 'Active Lesson Plans', value: effectiveLessonPlans.filter(l => l.status !== 'Archived').length.toString(), color: 'bg-blue-500' },
          { icon: FileText, label: 'Teaching Resources', value: resources.length.toString(), color: 'bg-emerald-500' },
          { icon: TrendingUp, label: 'Avg Engagement', value: '88%', color: 'bg-amber-500' },
          { icon: Users, label: 'Active Mentorships', value: mentorships.length.toString(), color: 'bg-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
            <p className="text-xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lesson Plans Tab */}
      {activeTab === 'lessons' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search lesson plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>

          {/* Teaching Methods Overview */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-amber-500" />
              Teaching Methods Distribution
            </h3>
            <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {teachingMethods.map((method, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition-colors">
                  <p className="text-sm font-semibold text-slate-900">{method.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{method.desc.substring(0, 40)}...</p>
                  <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${method.usage}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{method.usage}% usage</p>
                </div>
              ))}
            </div>
          </div>

          {/* Lesson Plans Table */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-3 font-medium">Course</th>
                    <th className="px-6 py-3 font-medium">Topic</th>
                    <th className="px-6 py-3 font-medium">Teacher</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Method</th>
                    <th className="px-6 py-3 font-medium">Engagement</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLessons.map((plan) => (
                    <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{plan.course}</td>
                      <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{plan.topic}</td>
                      <td className="px-6 py-4 text-slate-500">{plan.teacher}</td>
                      <td className="px-6 py-4 text-slate-500">{plan.date}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">{plan.method}</span>
                      </td>
                      <td className="px-6 py-4">
                        {plan.engagement > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${plan.engagement >= 90 ? 'bg-emerald-500' : plan.engagement >= 75 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${plan.engagement}%` }} />
                            </div>
                            <span className="text-xs font-medium text-slate-600">{plan.engagement}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">--</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                          plan.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                          plan.status === 'Upcoming' ? 'bg-blue-50 text-blue-600' :
                          'bg-slate-100 text-slate-500'
                        }`}>{plan.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search resources..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all" />
            </div>
            <button onClick={() => setShowResourceModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors">
              <Upload className="h-4 w-4" /> Upload Resource
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((res) => (
              <div key={res.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:border-amber-200 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    res.type === 'PDF' ? 'bg-red-50 text-red-600' :
                    res.type === 'Video' ? 'bg-purple-50 text-purple-600' :
                    res.type === 'Audio' ? 'bg-blue-50 text-blue-600' :
                    'bg-emerald-50 text-emerald-600'
                  }`}>
                    {res.type === 'PDF' ? <FileText className="h-5 w-5" /> :
                     res.type === 'Video' ? <Video className="h-5 w-5" /> :
                     <ExternalLink className="h-5 w-5" />}
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-slate-100 text-slate-500">{res.type}</span>
                </div>
                <h4 className="font-semibold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">{res.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{res.course}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                  <p className="text-xs text-slate-400">By {res.uploadedBy}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <MessageSquare className="h-3 w-3" /> {res.downloads}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement Tab */}
      {activeTab === 'engagement' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Engagement Overview */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Student Engagement Overview</h3>
            <div className="space-y-4">
              {[
                { metric: 'Class Participation', value: 87, color: 'bg-blue-500' },
                { metric: 'Assignment Submission', value: 82, color: 'bg-emerald-500' },
                { metric: 'Discussion Activity', value: 71, color: 'bg-amber-500' },
                { metric: 'Attendance Rate', value: 93, color: 'bg-purple-500' },
                { metric: 'Resource Access', value: 65, color: 'bg-pink-500' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{item.metric}</span>
                    <span className="text-sm font-bold text-slate-900">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Teaching Effectiveness */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Teaching Effectiveness Scores</h3>
            <div className="space-y-4">
              {effectiveLessonPlans.filter(l => l.engagement > 0).map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{plan.teacher}</p>
                    <p className="text-xs text-slate-500">{plan.course}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className={`h-4 w-4 ${plan.engagement >= 90 ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                    <span className={`text-sm font-bold ${plan.engagement >= 90 ? 'text-emerald-600' : plan.engagement >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                      {plan.engagement}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mentorship Tab */}
      {activeTab === 'mentorship' && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Active Mentorships</h3>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-700 text-sm font-medium hover:bg-amber-100 transition-colors">
              <Plus className="h-4 w-4" /> Assign Mentorship
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-3 font-medium">Mentor</th>
                  <th className="px-6 py-3 font-medium">Student</th>
                  <th className="px-6 py-3 font-medium">Focus Area</th>
                  <th className="px-6 py-3 font-medium">Meetings</th>
                  <th className="px-6 py-3 font-medium">Last Meeting</th>
                  <th className="px-6 py-3 font-medium">Growth</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {mentorships.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{m.mentor}</td>
                    <td className="px-6 py-4 text-slate-600">{m.student}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">{m.focus}</span></td>
                    <td className="px-6 py-4 text-slate-500">{m.meetings}</td>
                    <td className="px-6 py-4 text-slate-500">{m.lastMeeting}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        m.growth === 'Excellent' ? 'bg-emerald-50 text-emerald-600' :
                        m.growth === 'Strong' ? 'bg-blue-50 text-blue-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>{m.growth}</span>
                    </td>
                    <td className="px-6 py-4"><span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-semibold">{m.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Spiritual Formation Tab */}
      {activeTab === 'spiritual' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Heart className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Spiritual Formation Index</h3>
                <p className="text-blue-200 text-sm">Overall campus spiritual health</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-4xl font-extrabold text-amber-400">73%</div>
              <p className="text-blue-200 text-sm">Based on devotional participation, prayer life, Bible study engagement, and ministry involvement</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {spiritualActivities.map((act, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-900">{act.activity}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${
                    act.trend === 'up' ? 'bg-emerald-50 text-emerald-600' :
                    act.trend === 'down' ? 'bg-red-50 text-red-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {act.trend === 'up' ? '↑ Rising' : act.trend === 'down' ? '↓ Declining' : '→ Stable'}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full" style={{ width: `${act.participation}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-2">{act.participation}% participation rate</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lesson Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Create Lesson Plan</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Course</label>
                  <select value={lpForm.course} onChange={e => setLpForm(p => ({ ...p, course: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-amber-500 transition-all">
                    <option>Systematic Theology I</option>
                    <option>New Testament Survey</option>
                    <option>Pastoral Ministry</option>
                    <option>Hermeneutics</option>
                    <option>Church History I</option>
                    <option>Practical Theology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
                  <input type="date" value={lpForm.date} onChange={e => setLpForm(p => ({ ...p, date: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-amber-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Topic</label>
                <input type="text" value={lpForm.topic} onChange={e => setLpForm(p => ({ ...p, topic: e.target.value }))} placeholder="Lesson topic..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-amber-500 transition-all" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Teaching Method</label>
                  <select value={lpForm.method} onChange={e => setLpForm(p => ({ ...p, method: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-amber-500 transition-all">
                    <option>Lecture</option><option>Discussion</option><option>Case Study</option><option>Sermon-based Teaching</option><option>Interactive Bible Study</option><option>Field-based Learning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Duration</label>
                  <select value={lpForm.duration} onChange={e => setLpForm(p => ({ ...p, duration: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-amber-500 transition-all">
                    <option>60 min</option><option>75 min</option><option>90 min</option><option>120 min</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Scripture References</label>
                <input type="text" value={lpForm.scripture} onChange={e => setLpForm(p => ({ ...p, scripture: e.target.value }))} placeholder="e.g., John 3:16, Romans 8:28-39" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-amber-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Objectives</label>
                <textarea rows={3} value={lpForm.objectives} onChange={e => setLpForm(p => ({ ...p, objectives: e.target.value }))} placeholder="What students should learn..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-amber-500 transition-all resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Activities Planned</label>
                <textarea rows={2} value={lpForm.activities} onChange={e => setLpForm(p => ({ ...p, activities: e.target.value }))} placeholder="Class activities, discussions, assignments..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-amber-500 transition-all resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={async () => {
                if (!lpForm.topic) { showToast('Topic is required', 'error'); return; }
                setSubmitting(true);
                try {
                  await createLessonPlan({ title: lpForm.topic, course: lpForm.course, date: lpForm.date, topic: lpForm.topic, duration: lpForm.duration, method: lpForm.method, objectives: lpForm.objectives, methodology: lpForm.activities });
                  showToast('Lesson plan created successfully');
                  setShowModal(false);
                  setLpForm({ course: 'Systematic Theology I', date: new Date().toISOString().split('T')[0], topic: '', method: 'Lecture', duration: '60 min', scripture: '', objectives: '', activities: '' });
                  const res = await getLessonPlans();
                  if (Array.isArray(res)) { setApiLessonPlans(res.map((l: any) => ({ id: l.id ?? 0, course: l.course_name ?? l.course ?? '', topic: l.topic ?? l.title ?? '', teacher: l.teacher_name ?? '', date: l.date ?? '', duration: l.duration ?? '60 min', method: l.method ?? 'Lecture', status: l.status ?? 'Upcoming', engagement: 0 }))); }
                } catch (e: any) { showToast(e.message || 'Failed to create lesson plan', 'error'); }
                setSubmitting(false);
              }} disabled={submitting} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-white font-bold text-sm shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-300 transition-all disabled:opacity-50">{submitting ? 'Creating...' : 'Create Plan'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Resource Modal */}
      {showResourceModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowResourceModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Upload Teaching Resource</h3>
              <button onClick={() => setShowResourceModal(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Resource Title</label><input type="text" placeholder="e.g., Lecture Notes: Doctrine of God" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-amber-500 transition-all" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Course</label><select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-amber-500 transition-all"><option>Systematic Theology I</option><option>Hermeneutics</option><option>Pastoral Ministry</option><option>Church History I</option></select></div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Type</label><select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-amber-500 transition-all"><option>PDF</option><option>Video</option><option>Audio</option><option>External Link</option></select></div>
              </div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Upload File</label><div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-amber-400 transition-colors cursor-pointer"><Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" /><p className="text-sm text-slate-500">Click or drag file to upload</p><p className="text-xs text-slate-400 mt-1">PDF, MP4, MP3, DOC up to 50MB</p></div></div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100">
              <button onClick={() => setShowResourceModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={() => setShowResourceModal(false)} className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors">Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
