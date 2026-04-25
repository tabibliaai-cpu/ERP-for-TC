import { useState } from 'react';
import {
  BarChart3, Download, Calendar, Filter, Search, FileText, Users,
  Wallet, BookOpen, TrendingUp, TrendingDown, Printer, PieChart, Activity,
  ArrowUpRight, ArrowDownRight, ChevronDown, Church, GraduationCap
} from 'lucide-react';

// Sample report data
const academicStats = {
  totalStudents: 342,
  averageGPA: 3.42,
  passRate: 94.2,
  topCourse: 'Systematic Theology I',
  attendanceRate: 91.5,
  gradeDistribution: [
    { grade: 'A+', count: 28, pct: 12 }, { grade: 'A', count: 52, pct: 22 },
    { grade: 'B+', count: 48, pct: 20 }, { grade: 'B', count: 41, pct: 17 },
    { grade: 'C+', count: 35, pct: 15 }, { grade: 'C', count: 20, pct: 8 },
    { grade: 'Below C', count: 14, pct: 6 },
  ],
  topPerformers: [
    { name: 'John Abraham', program: 'B.Th', gpa: 3.95, rank: 1 },
    { name: 'Sarah Thompson', program: 'M.Div', gpa: 3.91, rank: 2 },
    { name: 'Emily Parker', program: 'B.Th', gpa: 3.88, rank: 3 },
    { name: 'David Kim', program: 'M.Div', gpa: 3.85, rank: 4 },
    { name: 'Grace Okafor', program: 'B.Th', gpa: 3.82, rank: 5 },
  ],
};

const financialStats = {
  totalRevenue: 2847500,
  pendingDues: 387200,
  monthlyCollection: 478500,
  scholarshipGiven: 124000,
  sponsorFunds: 215000,
  monthlyTrend: [
    { month: 'Jan', amount: 412000 }, { month: 'Feb', amount: 398000 },
    { month: 'Mar', amount: 435000 }, { month: 'Apr', amount: 478500 },
  ],
  feeBreakdown: [
    { category: 'Tuition', amount: 1850000, pct: 65 },
    { category: 'Hostel', amount: 523000, pct: 18 },
    { category: 'Library', amount: 167000, pct: 6 },
    { category: 'Exam', amount: 185000, pct: 7 },
    { category: 'Other', amount: 122000, pct: 4 },
  ],
};

const ministryStats = {
  totalOutreachEvents: 24,
  communityService: 156,
  baptismsThisYear: 18,
  newMinistries: 3,
  ministryParticipation: [
    { ministry: 'Youth Ministry', participants: 45, events: 8 },
    { ministry: 'Choir & Worship', participants: 32, events: 12 },
    { ministry: 'Evangelism Team', participants: 28, events: 15 },
    { ministry: 'Community Service', participants: 38, events: 10 },
    { ministry: 'Prayer Ministry', participants: 52, events: 20 },
  ],
};

const libraryStats = {
  totalBooks: 4850,
  borrowedThisMonth: 156,
  activeBorrowers: 89,
  popularCategories: [
    { category: 'Systematic Theology', count: 245 },
    { category: 'Biblical Exegesis', count: 198 },
    { category: 'Church History', count: 167 },
    { category: 'Pastoral Ministry', count: 142 },
    { category: 'Apologetics', count: 98 },
  ],
  mostBorrowed: [
    { title: 'Systematic Theology (Hodge Vol.1)', borrows: 34 },
    { title: 'Christologia', borrows: 28 },
    { title: 'Pensees (Pascal)', borrows: 25 },
    { title: 'The Trinity', borrows: 22 },
    { title: 'Lectures on Systematic Theology (Finney)', borrows: 20 },
  ],
};

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('academic');
  const [dateRange, setDateRange] = useState('this_month');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'financial', label: 'Financial', icon: Wallet },
    { id: 'ministry', label: 'Ministry', icon: Church },
    { id: 'library', label: 'Library', icon: BookOpen },
    { id: 'custom', label: 'Custom', icon: Filter },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-500 mt-1">Comprehensive institutional insights and data analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
              className="text-sm text-gray-700 bg-transparent outline-none cursor-pointer">
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="this_quarter">This Quarter</option>
              <option value="this_year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-white font-bold text-sm shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-300 transition-all">
            <Download className="h-4 w-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <tab.icon className="h-4 w-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* Academic Report */}
      {activeTab === 'academic' && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, label: 'Total Students', value: academicStats.totalStudents.toString(), change: '+12', up: true, color: 'bg-blue-500' },
              { icon: TrendingUp, label: 'Average GPA', value: academicStats.averageGPA.toFixed(2), change: '+0.08', up: true, color: 'bg-emerald-500' },
              { icon: Activity, label: 'Pass Rate', value: `${academicStats.passRate}%`, change: '+1.2%', up: true, color: 'bg-amber-500' },
              { icon: BarChart3, label: 'Attendance', value: `${academicStats.attendanceRate}%`, change: '-0.5%', up: false, color: 'bg-purple-500' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}><s.icon className="h-5 w-5 text-white" /></div>
                  <span className={`flex items-center gap-0.5 text-xs font-semibold ${s.up ? 'text-emerald-600' : 'text-red-500'}`}>
                    {s.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{s.change}
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Grade Distribution */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Grade Distribution</h3>
            <div className="flex flex-wrap gap-3 mb-4">
              {academicStats.gradeDistribution.map((g, i) => (
                <div key={i} className="flex-1 min-w-[100px] p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                  <p className="text-lg font-extrabold text-gray-900">{g.grade}</p>
                  <p className="text-xs text-gray-500">{g.count} students</p>
                  <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${g.pct * 3}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{g.pct}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Students</h3>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-400 border-b border-gray-100"><th className="pb-3 font-medium">Rank</th><th className="pb-3 font-medium">Name</th><th className="pb-3 font-medium">Program</th><th className="pb-3 font-medium">GPA</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {academicStats.topPerformers.map((s) => (
                  <tr key={s.rank} className="hover:bg-gray-50">
                    <td className="py-3"><span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white ${s.rank <= 3 ? 'bg-amber-500' : 'bg-gray-400'}`}>{s.rank}</span></td>
                    <td className="py-3 font-medium text-gray-900">{s.name}</td>
                    <td className="py-3 text-gray-500">{s.program}</td>
                    <td className="py-3 font-bold text-gray-900">{s.gpa.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Financial Report */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Total Revenue', value: `₹${(financialStats.totalRevenue / 100000).toFixed(1)}L`, icon: Wallet, color: 'bg-emerald-500' },
              { label: 'Pending Dues', value: `₹${(financialStats.pendingDues / 100000).toFixed(1)}L`, icon: TrendingDown, color: 'bg-red-500' },
              { label: 'Monthly Collection', value: `₹${(financialStats.monthlyCollection / 100000).toFixed(1)}L`, icon: TrendingUp, color: 'bg-blue-500' },
              { label: 'Scholarships Given', value: `₹${(financialStats.scholarshipGiven / 1000).toFixed(0)}K`, icon: GraduationCap, color: 'bg-amber-500' },
              { label: 'Sponsor Funds', value: `₹${(financialStats.sponsorFunds / 1000).toFixed(0)}K`, icon: Church, color: 'bg-purple-500' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}><s.icon className="h-5 w-5 text-white" /></div>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
                <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Monthly Trend */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Collection Trend</h3>
            <div className="flex items-end gap-6 h-48">
              {financialStats.monthlyTrend.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <p className="text-xs font-semibold text-gray-700">₹{(m.amount / 1000).toFixed(0)}K</p>
                  <div className="w-full bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-lg transition-all" style={{ height: `${(m.amount / 500000) * 100}%` }} />
                  <p className="text-xs text-gray-500">{m.month}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue by Fee Category</h3>
            <div className="space-y-3">
              {financialStats.feeBreakdown.map((f, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-gray-700">{f.category}</div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full" style={{ width: `${f.pct}%` }} />
                  </div>
                  <div className="w-20 text-sm font-bold text-gray-900 text-right">₹{(f.amount / 100000).toFixed(1)}L</div>
                  <div className="w-10 text-xs text-gray-400">{f.pct}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ministry Report */}
      {activeTab === 'ministry' && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Outreach Events', value: ministryStats.totalOutreachEvents.toString(), color: 'bg-blue-500' },
              { label: 'Community Service Hours', value: ministryStats.communityService.toString(), color: 'bg-emerald-500' },
              { label: 'Baptisms This Year', value: ministryStats.baptismsThisYear.toString(), color: 'bg-amber-500' },
              { label: 'New Ministries', value: ministryStats.newMinistries.toString(), color: 'bg-purple-500' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
                <p className="text-3xl font-extrabold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ministry Participation</h3>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-400 border-b border-gray-100"><th className="pb-3 font-medium">Ministry</th><th className="pb-3 font-medium">Participants</th><th className="pb-3 font-medium">Events</th><th className="pb-3 font-medium">Engagement</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {ministryStats.ministryParticipation.map((m, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{m.ministry}</td>
                    <td className="py-3 text-gray-500">{m.participants}</td>
                    <td className="py-3 text-gray-500">{m.events}</td>
                    <td className="py-3"><div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(m.participants / 52) * 100}%` }} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Library Report */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Books', value: libraryStats.totalBooks.toLocaleString(), color: 'bg-blue-500' },
              { label: 'Borrowed This Month', value: libraryStats.borrowedThisMonth.toString(), color: 'bg-emerald-500' },
              { label: 'Active Borrowers', value: libraryStats.activeBorrowers.toString(), color: 'bg-amber-500' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
                <p className="text-3xl font-extrabold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Popular Categories</h3>
              <div className="space-y-3">
                {libraryStats.popularCategories.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-36 text-sm font-medium text-gray-700">{c.category}</div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(c.count / 245) * 100}%` }} />
                    </div>
                    <span className="text-sm text-gray-500 w-10 text-right">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Most Borrowed Books</h3>
              <div className="space-y-3">
                {libraryStats.mostBorrowed.map((b, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{b.title}</p>
                    </div>
                    <span className="text-sm text-gray-500">{b.borrows}x</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Report Builder */}
      {activeTab === 'custom' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Custom Report Builder</h3>
          <p className="text-sm text-gray-500 mb-6">Select data points, filters, and date range to generate custom reports</p>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Report Type</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-amber-400 transition-all">
                  <option>Student Enrollment Report</option><option>Financial Summary</option><option>Attendance Report</option><option>Grade Report</option><option>Ministry Activity Report</option><option>Library Usage Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date Range</label>
                <div className="flex gap-2">
                  <input type="date" className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-amber-400 transition-all" />
                  <input type="date" className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-amber-400 transition-all" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Filters</label>
              <div className="flex flex-wrap gap-2">
                {['Program', 'Department', 'Semester', 'Gender', 'Status', 'Church'].map(f => (
                  <button key={f} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-colors">{f}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Include Columns</label>
              <div className="flex flex-wrap gap-2">
                {['Name', 'ID', 'Program', 'GPA', 'Attendance', 'Fee Status', 'Spiritual Status'].map(c => (
                  <label key={c} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" defaultChecked className="rounded text-amber-500" /> {c}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-white font-bold text-sm shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-300 transition-all">
                <PieChart className="h-4 w-4" /> Generate Report
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <Printer className="h-4 w-4" /> Print Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
