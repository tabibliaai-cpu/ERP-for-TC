import { useState, useMemo } from 'react';
import {
  BookOpen, GraduationCap, Plus, Search, X, Eye, Edit3, ChevronLeft, ChevronRight,
  Settings, Layers, Award, Sparkles, Target, LayoutGrid, BookMarked, Clock, CheckCircle
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Program {
  id: string; name: string; shortName: string; duration: string; credits: number;
  level: string; gradingSystem: string; totalSemesters: number; status: string;
  department: string; description: string; version: string; effectiveDate: string;
}

interface Course {
  id: string; code: string; name: string; department: string; credits: number;
  type: string; semester: number; prerequisites: string; description: string;
  program: string; syllabus: string; status: string; instructor: string; hours: number;
}

interface CurriculumEntry {
  semester: number; courseCode: string; courseName: string; credits: number; type: string; status: string;
}

interface GradeConfig {
  grade: string; min: number; max: number; points: number; description: string;
}

// ─── Sample Data ─────────────────────────────────────────────────────────────
const programs: Program[] = [
  { id: '1', name: 'Bachelor of Theology', shortName: 'B.Th', duration: '4 Years', credits: 160, level: 'Undergraduate', gradingSystem: 'GPA (4.0 Scale)', totalSemesters: 8, status: 'Active', department: 'Theology', description: 'Comprehensive undergraduate program covering biblical studies, theology, church history, and practical ministry.', version: 'v3.2', effectiveDate: '2024-06-01' },
  { id: '2', name: 'Master of Divinity', shortName: 'M.Div', duration: '3 Years', credits: 120, level: 'Postgraduate', gradingSystem: 'GPA (4.0 Scale)', totalSemesters: 6, status: 'Active', department: 'Theology', description: 'Advanced graduate program for pastoral ministry, theological research, and specialized ministry training.', version: 'v2.1', effectiveDate: '2024-06-01' },
  { id: '3', name: 'Diploma in Theology', shortName: 'Diploma', duration: '2 Years', credits: 80, level: 'Diploma', gradingSystem: 'GPA (4.0 Scale)', totalSemesters: 4, status: 'Active', department: 'Theology', description: 'Foundational program in theology for those called to ministry without a prior degree.', version: 'v2.0', effectiveDate: '2024-06-01' },
  { id: '4', name: 'Certificate in Ministry', shortName: 'Cert.Min', duration: '1 Year', credits: 40, level: 'Certificate', gradingSystem: 'GPA (4.0 Scale)', totalSemesters: 2, status: 'Active', department: 'Practical Theology', description: 'Short-term program for lay leaders and part-time ministers.', version: 'v1.5', effectiveDate: '2024-06-01' },
];

const courses: Course[] = [
  // B.Th Courses
  { id: '1', code: 'BT101', name: 'Introduction to Old Testament', department: 'Biblical Studies', credits: 4, type: 'Core', semester: 1, prerequisites: 'None', description: 'Survey of OT books, historical context, and major theological themes.', program: 'B.Th', syllabus: 'Uploaded', status: 'Active', instructor: 'Dr. Deepak Sharma', hours: 60 },
  { id: '2', code: 'BT102', name: 'Introduction to New Testament', department: 'Biblical Studies', credits: 4, type: 'Core', semester: 1, prerequisites: 'None', description: 'Survey of NT books, historical context, and major theological themes.', program: 'B.Th', syllabus: 'Uploaded', status: 'Active', instructor: 'Dr. Deepak Sharma', hours: 60 },
  { id: '3', code: 'BT103', name: 'English I (Academic Writing)', department: 'General', credits: 3, type: 'Core', semester: 1, prerequisites: 'None', description: 'Academic writing skills, research methodology, and critical thinking.', program: 'B.Th', syllabus: 'Uploaded', status: 'Active', instructor: 'Prof. Rachel Menon', hours: 45 },
  { id: '4', code: 'BT104', name: 'Spiritual Formation I', department: 'Practical Theology', credits: 3, type: 'Core', semester: 1, prerequisites: 'None', description: 'Disciplines of the spiritual life: prayer, meditation, fasting, and devotional practices.', program: 'B.Th', syllabus: 'Uploaded', status: 'Active', instructor: 'Rev. Dr. Abraham Philip', hours: 45 },
  { id: '5', code: 'BT201', name: 'Pentateuch', department: 'Biblical Studies', credits: 4, type: 'Core', semester: 2, prerequisites: 'BT101', description: 'Detailed study of Genesis through Deuteronomy with critical analysis.', program: 'B.Th', syllabus: 'Uploaded', status: 'Active', instructor: 'Dr. Deepak Sharma', hours: 60 },
  { id: '6', code: 'BT202', name: 'Gospels & Acts', department: 'Biblical Studies', credits: 4, type: 'Core', semester: 2, prerequisites: 'BT102', description: 'Detailed study of the four Gospels and the Acts of the Apostles.', program: 'B.Th', syllabus: 'Uploaded', status: 'Active', instructor: 'Dr. Deepak Sharma', hours: 60 },
  { id: '7', code: 'BT203', name: 'Systematic Theology I', department: 'Theology', credits: 4, type: 'Core', semester: 2, prerequisites: 'None', description: 'Theology Proper: God, revelation, Scripture, creation, and providence.', program: 'B.Th', syllabus: 'Uploaded', status: 'Active', instructor: 'Dr. John Chacko', hours: 60 },
  { id: '8', code: 'BT301', name: 'Hebrew I', department: 'Biblical Languages', credits: 4, type: 'Core', semester: 3, prerequisites: 'None', description: 'Introduction to Biblical Hebrew grammar, vocabulary, and basic exegesis.', program: 'B.Th', syllabus: 'Uploaded', status: 'Active', instructor: 'Dr. Deepak Sharma', hours: 60 },
  { id: '9', code: 'BT302', name: 'Greek I', department: 'Biblical Languages', credits: 4, type: 'Core', semester: 3, prerequisites: 'None', description: 'Introduction to Koine Greek grammar, vocabulary, and basic exegesis.', program: 'B.Th', syllabus: 'Uploaded', status: 'Active', instructor: 'Dr. Deepak Sharma', hours: 60 },
  { id: '10', code: 'BT303', name: 'Church History I', department: 'Church History', credits: 3, type: 'Core', semester: 3, prerequisites: 'None', description: 'Early Church to Reformation: key figures, movements, and theological developments.', program: 'B.Th', syllabus: 'Uploaded', status: 'Active', instructor: 'Prof. Rachel Menon', hours: 45 },
  // M.Div Courses
  { id: '11', code: 'MD501', name: 'Advanced Hermeneutics', department: 'Biblical Studies', credits: 4, type: 'Core', semester: 1, prerequisites: 'B.Th or equivalent', description: 'Advanced principles of biblical interpretation and exegetical methodology.', program: 'M.Div', syllabus: 'Uploaded', status: 'Active', instructor: 'Dr. Deepak Sharma', hours: 60 },
  { id: '12', code: 'MD502', name: 'Systematic Theology I', department: 'Theology', credits: 4, type: 'Core', semester: 1, prerequisites: 'Basic Theology', description: 'Comprehensive study of Prolegomena, Theology Proper, and Bibliology.', program: 'M.Div', syllabus: 'Uploaded', status: 'Active', instructor: 'Dr. John Chacko', hours: 60 },
  { id: '13', code: 'MD503', name: 'Christian Counseling I', department: 'Counseling', credits: 4, type: 'Core', semester: 1, prerequisites: 'None', description: 'Foundations of Christian counseling theory and practice.', program: 'M.Div', syllabus: 'Uploaded', status: 'Active', instructor: 'Dr. Sarah Williams', hours: 60 },
  { id: '14', code: 'MD504', name: 'Introduction to Missions', department: 'Missiology', credits: 3, type: 'Core', semester: 1, prerequisites: 'None', description: 'Biblical, historical, and cultural foundations of Christian missions.', program: 'M.Div', syllabus: 'Uploaded', status: 'Active', instructor: 'Rev. Dr. Timothy George', hours: 45 },
  { id: '15', code: 'MD601', name: 'Systematic Theology II', department: 'Theology', credits: 4, type: 'Core', semester: 2, prerequisites: 'MD502', description: 'Christology, Pneumatology, Angelology, and Anthropology.', program: 'M.Div', syllabus: 'Uploaded', status: 'Active', instructor: 'Dr. John Chacko', hours: 60 },
  { id: '16', code: 'MD602', name: 'Homiletics I', department: 'Practical Theology', credits: 3, type: 'Core', semester: 2, prerequisites: 'None', description: 'Principles and practice of sermon preparation and delivery.', program: 'M.Div', syllabus: 'Uploaded', status: 'Active', instructor: 'Rev. Dr. Abraham Philip', hours: 45 },
  { id: '17', code: 'MD603', name: 'Church Planting Strategies', department: 'Missiology', credits: 3, type: 'Elective', semester: 2, prerequisites: 'MD504', description: 'Models and strategies for effective church planting in diverse contexts.', program: 'M.Div', syllabus: 'Uploaded', status: 'Active', instructor: 'Rev. Dr. Timothy George', hours: 45 },
  // Diploma Courses
  { id: '18', code: 'DP101', name: 'Bible Survey', department: 'Biblical Studies', credits: 4, type: 'Core', semester: 1, prerequisites: 'None', description: 'Comprehensive survey of both Old and New Testaments.', program: 'Diploma', syllabus: 'Uploaded', status: 'Active', instructor: 'Dr. Deepak Sharma', hours: 60 },
  { id: '19', code: 'DP102', name: 'Basic Theology', department: 'Theology', credits: 3, type: 'Core', semester: 1, prerequisites: 'None', description: 'Introduction to major Christian doctrines and beliefs.', program: 'Diploma', syllabus: 'Uploaded', status: 'Active', instructor: 'Dr. John Chacko', hours: 45 },
  { id: '20', code: 'DP103', name: 'Worship & Music Ministry', department: 'Worship Studies', credits: 3, type: 'Core', semester: 1, prerequisites: 'None', description: 'Biblical foundations of worship and practical music ministry skills.', program: 'Diploma', syllabus: 'Uploaded', status: 'Active', instructor: 'Dr. Michael David', hours: 45 },
  { id: '21', code: 'BT205', name: 'Pastoral Epistles', department: 'Biblical Studies', credits: 3, type: 'Elective', semester: 4, prerequisites: 'BT102', description: 'Exegetical study of 1 & 2 Timothy and Titus.', program: 'B.Th', syllabus: 'Draft', status: 'Draft', instructor: '', hours: 45 },
  { id: '22', code: 'BT206', name: 'Apologetics', department: 'Theology', credits: 3, type: 'Elective', semester: 4, prerequisites: 'BT203', description: 'Defense of the Christian faith against contemporary objections.', program: 'B.Th', syllabus: 'Draft', status: 'Draft', instructor: 'Dr. John Chacko', hours: 45 },
  { id: '23', code: 'MD701', name: 'Thesis Research', department: 'General', credits: 6, type: 'Core', semester: 5, prerequisites: 'Completion of core courses', description: 'Independent research and thesis writing under faculty guidance.', program: 'M.Div', syllabus: 'Uploaded', status: 'Active', instructor: 'Faculty Advisor', hours: 90 },
];

const gradeConfig: GradeConfig[] = [
  { grade: 'A+', min: 95, max: 100, points: 4.0, description: 'Outstanding' },
  { grade: 'A', min: 90, max: 94, points: 4.0, description: 'Excellent' },
  { grade: 'A-', min: 85, max: 89, points: 3.7, description: 'Very Good' },
  { grade: 'B+', min: 80, max: 84, points: 3.3, description: 'Good' },
  { grade: 'B', min: 75, max: 79, points: 3.0, description: 'Above Average' },
  { grade: 'B-', min: 70, max: 74, points: 2.7, description: 'Average' },
  { grade: 'C+', min: 65, max: 69, points: 2.3, description: 'Below Average' },
  { grade: 'C', min: 60, max: 64, points: 2.0, description: 'Pass' },
  { grade: 'F', min: 0, max: 59, points: 0.0, description: 'Fail' },
];

const tabs = ['Programs', 'Courses', 'Curriculum', 'Credits & Grades', 'Electives'];

const Input = ({ label, value, onChange, type = 'text', placeholder = '' }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-slate-700">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
  </div>
);

const Select = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-slate-700">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white transition-all">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AcademicsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [filterProgram, setFilterProgram] = useState('All');
  const [filterDept, setFilterDept] = useState('All');
  const [selectedProgram, setSelectedProgram] = useState('B.Th');
  const [showAddProgram, setShowAddProgram] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);

  const [progForm, setProgForm] = useState({ name: '', shortName: '', duration: '', credits: '', level: 'Undergraduate', gradingSystem: 'GPA (4.0 Scale)', totalSemesters: '', department: '', description: '' });
  const [courseForm, setCourseForm] = useState({ code: '', name: '', department: 'Biblical Studies', credits: '', type: 'Core', semester: '', prerequisites: '', description: '', program: 'B.Th', instructor: '', hours: '' });

  const depts = useMemo(() => ['All', ...new Set(courses.map(c => c.department))], []);

  const filteredCourses = useMemo(() => courses.filter(c => {
    const m1 = search === '' || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
    const m2 = filterProgram === 'All' || c.program === filterProgram;
    const m3 = filterDept === 'All' || c.department === filterDept;
    return m1 && m2 && m3;
  }), [search, filterProgram, filterDept]);

  const curriculumView = useMemo(() => {
    return courses
      .filter(c => c.program === selectedProgram && c.status === 'Active')
      .reduce((acc, c) => {
        const sem = c.semester;
        if (!acc[sem]) acc[sem] = [];
        acc[sem].push({ semester: sem, courseCode: c.code, courseName: c.name, credits: c.credits, type: c.type, status: c.status });
        return acc;
      }, {} as Record<number, CurriculumEntry[]>);
  }, [selectedProgram]);

  const stats = useMemo(() => ({
    programs: programs.length,
    courses: courses.filter(c => c.status === 'Active').length,
    totalCredits: programs.reduce((a, p) => a + p.credits, 0),
    departments: new Set(courses.map(c => c.department)).size,
  }), []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-amber-600" /> Academic Configuration
          </h2>
          <p className="text-slate-500 mt-1 text-sm">Programs, courses, curriculum, and grading management</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddCourse(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 shadow-lg shadow-amber-600/20 transition-all">
            <Plus className="h-4 w-4" /> Add Course
          </button>
          <button onClick={() => setShowAddProgram(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all">
            <Plus className="h-4 w-4" /> Add Program
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Programs', value: stats.programs, icon: GraduationCap, color: 'bg-slate-900' },
          { label: 'Active Courses', value: stats.courses, icon: BookMarked, color: 'bg-blue-600' },
          { label: 'Total Credits Offered', value: stats.totalCredits, icon: Award, color: 'bg-emerald-600' },
          { label: 'Departments', value: stats.departments, icon: Layers, color: 'bg-amber-600' },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}><card.icon className="h-5 w-5 text-white" /></div>
            <p className="text-2xl font-extrabold text-slate-900">{card.value}</p>
            <p className="text-xs text-slate-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="border-b border-slate-100 overflow-x-auto">
          <div className="flex px-4 gap-1 min-w-max">
            {tabs.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(i)} className={`px-4 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${activeTab === i ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>{tab}</button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {/* ─── Programs Tab ─────────────────────────────────────────── */}
          {activeTab === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {programs.map(p => {
                const courseCount = courses.filter(c => c.program === p.shortName).length;
                return (
                  <div key={p.id} className="border border-slate-100 rounded-2xl p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors">{p.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{p.shortName} · {p.version}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${p.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{p.status}</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{p.description}</p>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center p-2 rounded-xl bg-slate-50"><p className="text-lg font-bold text-slate-900">{p.duration}</p><p className="text-xs text-slate-400">Duration</p></div>
                      <div className="text-center p-2 rounded-xl bg-slate-50"><p className="text-lg font-bold text-slate-900">{p.credits}</p><p className="text-xs text-slate-400">Credits</p></div>
                      <div className="text-center p-2 rounded-xl bg-slate-50"><p className="text-lg font-bold text-slate-900">{p.totalSemesters}</p><p className="text-xs text-slate-400">Semesters</p></div>
                      <div className="text-center p-2 rounded-xl bg-slate-50"><p className="text-lg font-bold text-slate-900">{courseCount}</p><p className="text-xs text-slate-400">Courses</p></div>
                    </div>
                    <div className="flex items-center gap-3 mt-4 text-xs text-slate-400">
                      <span>{p.level}</span><span>·</span><span>{p.gradingSystem}</span><span>·</span><span>Effective: {p.effectiveDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── Courses Tab ──────────────────────────────────────────── */}
          {activeTab === 1 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses by name or code..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
                </div>
                <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white">
                  <option value="All">All Programs</option>
                  {programs.map(p => <option key={p.id} value={p.shortName}>{p.shortName}</option>)}
                </select>
                <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white">
                  {depts.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Code</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Course Name</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">Department</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">Program</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Credits</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">Sem</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Type</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden xl:table-cell">Instructor</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredCourses.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-amber-700 font-semibold">{c.code}</td>
                        <td className="px-4 py-3"><p className="font-medium text-slate-900">{c.name}</p><p className="text-xs text-slate-400 max-w-[240px] truncate">{c.description}</p></td>
                        <td className="px-4 py-3 hidden md:table-cell"><span className="px-2 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">{c.department}</span></td>
                        <td className="px-4 py-3 hidden lg:table-cell"><span className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-white">{c.program}</span></td>
                        <td className="px-4 py-3 text-center font-semibold text-slate-700">{c.credits}</td>
                        <td className="px-4 py-3 text-center text-slate-600 hidden lg:table-cell">{c.semester}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-lg text-xs font-semibold ${c.type === 'Core' ? 'bg-blue-50 text-blue-700' : c.type === 'Elective' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{c.type}</span></td>
                        <td className="px-4 py-3 text-xs text-slate-500 hidden xl:table-cell">{c.instructor || 'TBD'}</td>
                        <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${c.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{c.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── Curriculum Tab ────────────────────────────────────────── */}
          {activeTab === 2 && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {programs.map(p => (
                  <button key={p.id} onClick={() => setSelectedProgram(p.shortName)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedProgram === p.shortName ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {p.shortName}
                  </button>
                ))}
              </div>
              {Object.entries(curriculumView).sort(([a], [b]) => Number(a) - Number(b)).map(([sem, courseList]) => (
                <div key={sem} className="border border-slate-100 rounded-2xl overflow-hidden">
                  <div className="bg-slate-50 px-5 py-3 flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">Semester {sem}</h4>
                    <span className="text-xs text-slate-500">{courseList.length} courses · {courseList.reduce((a, c) => a + c.credits, 0)} credits</span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {courseList.map((c, i) => (
                      <div key={i} className="px-5 py-3 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                        <span className="font-mono text-xs text-amber-700 font-semibold w-16 shrink-0">{c.courseCode}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{c.courseName}</p>
                          <p className="text-xs text-slate-400">{courses.find(cr => cr.code === c.courseCode)?.department}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold shrink-0 ${c.type === 'Core' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>{c.type}</span>
                        <span className="text-sm font-semibold text-slate-700 w-8 text-center shrink-0">{c.credits}</span>
                        <span className="text-xs text-slate-400 shrink-0">cr</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── Credits & Grades Tab ──────────────────────────────────── */}
          {activeTab === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3">Grade Point Scale (GPA 4.0)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Grade</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Range</th>
                        <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Points</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {gradeConfig.map(g => (
                        <tr key={g.grade} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-900 text-lg">{g.grade}</td>
                          <td className="px-4 py-3 text-slate-600">{g.min}% - {g.max}%</td>
                          <td className="px-4 py-3 text-center font-semibold text-amber-700">{g.points.toFixed(1)}</td>
                          <td className="px-4 py-3 text-slate-500">{g.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-100 rounded-2xl p-5">
                  <h4 className="font-bold text-slate-900 text-sm mb-3">CGPA Calculation</h4>
                  <p className="text-sm text-slate-600 mb-3">CGPA = Total Credit Points / Total Credits</p>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex justify-between text-sm mb-1"><span className="text-slate-500">Sample CGPA</span><span className="font-bold text-slate-900">3.52 / 4.00</span></div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden"><div className="h-full rounded-full bg-emerald-500" style={{ width: '88%' }} /></div>
                    <p className="text-xs text-slate-400 mt-1">Equivalent: First Class with Distinction</p>
                  </div>
                </div>
                <div className="border border-slate-100 rounded-2xl p-5">
                  <h4 className="font-bold text-slate-900 text-sm mb-3">Credit Requirements</h4>
                  {programs.map(p => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <span className="text-sm text-slate-700">{p.shortName}</span>
                      <span className="text-sm font-semibold text-slate-900">{p.credits} credits ({p.totalSemesters} sem)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── Electives Tab ─────────────────────────────────────────── */}
          {activeTab === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <h4 className="font-bold text-amber-800 text-sm flex items-center gap-2"><Sparkles className="h-4 w-4" />Elective Selection Rules</h4>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {programs.map(p => {
                    const electives = courses.filter(c => c.program === p.shortName && c.type === 'Elective');
                    return (
                      <div key={p.id} className="bg-white rounded-xl p-3 border border-amber-100">
                        <p className="text-sm font-semibold text-slate-900">{p.shortName}</p>
                        <p className="text-xs text-slate-500 mt-1">Min: 2 Electives · Max: 4 Electives</p>
                        <p className="text-xs text-amber-600 mt-1">{electives.length} electives available</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Code</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Course</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Program</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Credits</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Prerequisites</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {courses.filter(c => c.type === 'Elective').map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-amber-700 font-semibold">{c.code}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-white">{c.program}</span></td>
                        <td className="px-4 py-3 text-center font-semibold text-slate-700">{c.credits}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{c.prerequisites}</td>
                        <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${c.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{c.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Add Program Modal ─────────────────────────────────────────── */}
      {showAddProgram && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add New Program</h3>
              <button onClick={() => setShowAddProgram(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <Input label="Program Name" value={progForm.name} onChange={v => setProgForm(p => ({ ...p, name: v }))} />
              <Input label="Short Name" value={progForm.shortName} onChange={v => setProgForm(p => ({ ...p, shortName: v }))} placeholder="e.g., B.Th, M.Div" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Duration" value={progForm.duration} onChange={v => setProgForm(p => ({ ...p, duration: v }))} placeholder="e.g., 3 Years" />
                <Input label="Total Credits" value={progForm.credits} onChange={v => setProgForm(p => ({ ...p, credits: v }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select label="Level" value={progForm.level} onChange={v => setProgForm(p => ({ ...p, level: v }))} options={[{label:'Certificate',value:'Certificate'},{label:'Diploma',value:'Diploma'},{label:'Undergraduate',value:'Undergraduate'},{label:'Postgraduate',value:'Postgraduate'},{label:'Doctoral',value:'Doctoral'}]} />
                <Input label="Total Semesters" value={progForm.totalSemesters} onChange={v => setProgForm(p => ({ ...p, totalSemesters: v }))} />
              </div>
              <Input label="Department" value={progForm.department} onChange={v => setProgForm(p => ({ ...p, department: v }))} />
              <div className="space-y-1.5"><label className="block text-sm font-medium text-slate-700">Description</label><textarea value={progForm.description} onChange={e => setProgForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all resize-none" /></div>
            </div>
            <div className="flex items-center justify-end gap-2 p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button onClick={() => setShowAddProgram(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition-all">Cancel</button>
              <button onClick={() => setShowAddProgram(false)} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all"><Plus className="h-4 w-4" />Create Program</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Add Course Modal ──────────────────────────────────────────── */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add New Course</h3>
              <button onClick={() => setShowAddCourse(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Course Code" value={courseForm.code} onChange={v => setCourseForm(p => ({ ...p, code: v }))} placeholder="e.g., BT301" />
                <Select label="Program" value={courseForm.program} onChange={v => setCourseForm(p => ({ ...p, program: v }))} options={programs.map(p => ({ label: p.shortName, value: p.shortName }))} />
              </div>
              <Input label="Course Name" value={courseForm.name} onChange={v => setCourseForm(p => ({ ...p, name: v }))} />
              <div className="grid grid-cols-2 gap-4">
                <Select label="Department" value={courseForm.department} onChange={v => setCourseForm(p => ({ ...p, department: v }))} options={depts.filter(d => d !== 'All').map(d => ({ label: d, value: d }))} />
                <Select label="Type" value={courseForm.type} onChange={v => setCourseForm(p => ({ ...p, type: v }))} options={[{label:'Core',value:'Core'},{label:'Elective',value:'Elective'},{label:'Optional',value:'Optional'}]} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input label="Credits" value={courseForm.credits} onChange={v => setCourseForm(p => ({ ...p, credits: v }))} />
                <Input label="Semester" value={courseForm.semester} onChange={v => setCourseForm(p => ({ ...p, semester: v }))} />
                <Input label="Hours" value={courseForm.hours} onChange={v => setCourseForm(p => ({ ...p, hours: v }))} />
              </div>
              <Input label="Prerequisites" value={courseForm.prerequisites} onChange={v => setCourseForm(p => ({ ...p, prerequisites: v }))} placeholder="e.g., BT101, BT102 or None" />
              <Input label="Instructor" value={courseForm.instructor} onChange={v => setCourseForm(p => ({ ...p, instructor: v }))} />
              <div className="space-y-1.5"><label className="block text-sm font-medium text-slate-700">Description</label><textarea value={courseForm.description} onChange={e => setCourseForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all resize-none" /></div>
            </div>
            <div className="flex items-center justify-end gap-2 p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button onClick={() => setShowAddCourse(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition-all">Cancel</button>
              <button onClick={() => setShowAddCourse(false)} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20"><Plus className="h-4 w-4" />Add Course</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
