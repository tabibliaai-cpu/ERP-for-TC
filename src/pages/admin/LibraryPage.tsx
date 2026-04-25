import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BookOpen, Search, Plus, X, Eye, Download, Upload, BookMarked, Star,
  Library, Filter, Grid3X3, List, Users, FileText, Quote, Globe,
  Lock, ChevronDown, BookCopy, Calendar, Clock, UserCheck, AlertCircle, CheckCircle,
  Bookmark, BookmarkCheck, Sparkles
} from 'lucide-react';
import { getManuscripts, createManuscript, getToken } from '../../utils/api';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Manuscript {
  id: string; title: string; author: string; category: string; type: string;
  language: string; year: number; isbn: string; scriptureRefs: string;
  keywords: string; abstract: string; accessLevel: string; status: string;
  copies: number; available: number; coverColor: string;
}

interface BorrowRecord {
  id: string; manuscriptTitle: string; borrowerName: string; borrowerType: string;
  borrowDate: string; dueDate: string; returnDate: string; status: string; fine: number;
}

// ─── Sample Data ─────────────────────────────────────────────────────────────
const manuscripts: Manuscript[] = [
  { id: '1', title: 'Systematic Theology (3 Vols)', author: 'Charles Hodge', category: 'Systematic Theology', type: 'Book', language: 'English', year: 1872, isbn: '978-1-58134-000-1', scriptureRefs: 'Entire Bible', keywords: 'Reformed, Theology Proper, Christology, Soteriology', abstract: 'Classic Reformed systematic theology covering all major doctrines of the Christian faith. A foundational text for theological education.', accessLevel: 'Students', status: 'Available', copies: 5, available: 3, coverColor: 'from-rose-500 to-red-600' },
  { id: '2', title: 'Christologia', author: 'John Owen', category: 'Systematic Theology', type: 'Book', language: 'English', year: 1679, isbn: '978-1-58134-001-8', scriptureRefs: 'Hebrews 1-10', keywords: 'Christology, Incarnation, Atonement, Reformed', abstract: 'John Owen\'s magisterial work on the person and work of Christ, examining His divine nature, incarnation, and mediatorial office.', accessLevel: 'Students', status: 'Available', copies: 3, available: 2, coverColor: 'from-blue-500 to-indigo-600' },
  { id: '3', title: 'Pensées', author: 'Blaise Pascal', category: 'Apologetics', type: 'Book', language: 'English (Translation)', year: 1669, isbn: '978-0-14-044645-6', scriptureRefs: 'Various', keywords: 'Apologetics, Philosophy of Religion, Faith, Reason', abstract: 'Pascal\'s collected thoughts on religion, philosophy, and the human condition. A masterpiece of Christian apologetics.', accessLevel: 'Students', status: 'Available', copies: 4, available: 1, coverColor: 'from-purple-500 to-violet-600' },
  { id: '4', title: 'The Death of Death in the Death of Christ', author: 'John Owen', category: 'Systematic Theology', type: 'Book', language: 'English', year: 1647, isbn: '978-0-85151-072-1', scriptureRefs: 'Romans 8, Hebrews 9-10', keywords: 'Atonement, Definite Atonement, Reformed, Soteriology', abstract: 'Owen\'s definitive defense of particular redemption (limited atonement), arguing from Scripture that Christ died specifically for the elect.', accessLevel: 'Students', status: 'Available', copies: 3, available: 2, coverColor: 'from-slate-600 to-slate-800' },
  { id: '5', title: 'Institutes of the Christian Religion', author: 'John Calvin', category: 'Systematic Theology', type: 'Book', language: 'English (Translation)', year: 1536, isbn: '978-0-664-22020-0', scriptureRefs: 'Entire Bible', keywords: 'Reformed, Predestination, Sovereignty, Sacraments', abstract: 'The foundational work of Reformed theology, covering the knowledge of God, the person of Christ, the means of grace, and the Christian life.', accessLevel: 'Students', status: 'Available', copies: 6, available: 4, coverColor: 'from-amber-500 to-orange-600' },
  { id: '6', title: 'The Bondage of the Will', author: 'Martin Luther', category: 'Systematic Theology', type: 'Book', language: 'English (Translation)', year: 1525, isbn: '978-0-85151-073-8', scriptureRefs: 'Romans 9, Ephesians 1-2', keywords: 'Free Will, Predestination, Reformation, Sovereignty', abstract: 'Luther\'s response to Erasmus on the bondage of the human will, defending the doctrine of total depravity and sovereign grace.', accessLevel: 'Students', status: 'Available', copies: 4, available: 3, coverColor: 'from-emerald-500 to-teal-600' },
  { id: '7', title: 'Commentary on the Epistle to the Romans', author: 'John Calvin', category: 'Biblical Exegesis', type: 'Commentary', language: 'English (Translation)', year: 1540, isbn: '978-0-85151-274-9', scriptureRefs: 'Romans 1-16', keywords: 'Romans, Exegesis, Justification, Faith, Reformed', abstract: 'Calvin\'s detailed exegetical commentary on Romans, covering themes of sin, justification, sanctification, and the sovereignty of God.', accessLevel: 'Students', status: 'Available', copies: 3, available: 2, coverColor: 'from-cyan-500 to-blue-600' },
  { id: '8', title: 'Evidences of Christianity', author: 'William Paley', category: 'Apologetics', type: 'Book', language: 'English', year: 1794, isbn: '978-1-108-00146-5', scriptureRefs: 'Various', keywords: 'Apologetics, Historical Evidence, Prophecy, Miracles', abstract: 'Classic apologetic work defending the credibility of Christianity through historical evidence, prophecy fulfillment, and miracles.', accessLevel: 'Students', status: 'Available', copies: 3, available: 2, coverColor: 'from-sky-500 to-blue-600' },
  { id: '9', title: 'The History of the Reformation of the Church of England', author: 'Gilbert Burnet', category: 'Church History', type: 'Book', language: 'English', year: 1679, isbn: '978-1-108-00235-6', scriptureRefs: 'Various', keywords: 'Reformation, Church of England, History, Protestantism', abstract: 'Comprehensive history of the English Reformation, detailing the religious and political changes from Henry VIII to Elizabeth I.', accessLevel: 'Students', status: 'Available', copies: 2, available: 1, coverColor: 'from-orange-500 to-red-500' },
  { id: '10', title: 'The Reformation in England', author: 'J.H. Merle D\'Aubigné', category: 'Church History', type: 'Book', language: 'English (Translation)', year: 1848, isbn: '978-1-108-00320-9', scriptureRefs: 'Various', keywords: 'Reformation, England, History, Revival', abstract: 'Detailed account of the Protestant Reformation in England, highlighting key figures, events, and theological developments.', accessLevel: 'Students', status: 'Available', copies: 3, available: 2, coverColor: 'from-yellow-500 to-amber-600' },
  { id: '11', title: 'The Pilgrim\'s Progress', author: 'John Bunyan', category: 'Christian Literature', type: 'Book', language: 'English', year: 1678, isbn: '978-0-14-043735-5', scriptureRefs: 'Various', keywords: 'Allegory, Christian Life, Journey, Faith', abstract: 'The most famous allegory in the English language, depicting the Christian\'s journey from the City of Destruction to the Celestial City.', accessLevel: 'Public', status: 'Available', copies: 8, available: 5, coverColor: 'from-indigo-500 to-purple-600' },
  { id: '12', title: 'Pastoral Care & Counseling', author: 'Howard Clinebell', category: 'Pastoral Ministry', type: 'Book', language: 'English', year: 1984, isbn: '978-0-687-35281-4', scriptureRefs: 'James 5, Galatians 6', keywords: 'Counseling, Pastoral Care, Mental Health, Ministry', abstract: 'Comprehensive guide to pastoral counseling, integrating psychological insights with biblical principles for effective ministry.', accessLevel: 'Teachers', status: 'Available', copies: 4, available: 2, coverColor: 'from-teal-500 to-emerald-600' },
  { id: '13', title: 'Missionary Methods: St. Paul\'s or Ours?', author: 'Roland Allen', category: 'Missiology', type: 'Book', language: 'English', year: 1912, isbn: '978-0-8028-1120-8', scriptureRefs: 'Acts 13-28', keywords: 'Missions, Pauline, Church Planting, Indigenous Church', abstract: 'Groundbreaking analysis of Paul\'s missionary methods compared to modern missionary practices. A must-read for missiology students.', accessLevel: 'Students', status: 'Available', copies: 5, available: 3, coverColor: 'from-lime-500 to-green-600' },
  { id: '14', title: 'Christian Ethics', author: 'Dietrich Bonhoeffer', category: 'Christian Ethics', type: 'Book', language: 'English (Translation)', year: 1949, isbn: '978-0-684-81501-8', scriptureRefs: 'Sermon on the Mount', keywords: 'Ethics, Discipleship, Cost of Grace, Worldly Christianity', abstract: 'Bonhoeffer\'s unfinished masterpiece on Christian ethics, exploring the relationship between faith and ethical living in the modern world.', accessLevel: 'Students', status: 'Available', copies: 4, available: 3, coverColor: 'from-stone-500 to-stone-700' },
  { id: '15', title: 'The Knowledge of the Holy', author: 'A.W. Tozer', category: 'Systematic Theology', type: 'Book', language: 'English', year: 1961, isbn: '978-0-06-068411-1', scriptureRefs: 'Various', keywords: 'Attributes of God, Worship, Theology Proper, Devotional', abstract: 'A devotional exploration of the attributes of God, designed to renew the reader\'s understanding and worship of the Almighty.', accessLevel: 'Public', status: 'Available', copies: 6, available: 4, coverColor: 'from-rose-400 to-pink-600' },
  { id: '16', title: 'Mere Christianity', author: 'C.S. Lewis', category: 'Apologetics', type: 'Book', language: 'English', year: 1952, isbn: '978-0-06-065292-0', scriptureRefs: 'Various', keywords: 'Apologetics, Basics of Faith, Morality, Trilemma', abstract: 'Lewis\'s classic defense of the fundamental doctrines of Christianity, originally delivered as BBC radio talks during WWII.', accessLevel: 'Public', status: 'Available', copies: 7, available: 5, coverColor: 'from-violet-500 to-purple-600' },
  { id: '17', title: 'The Cost of Discipleship', author: 'Dietrich Bonhoeffer', category: 'Christian Ethics', type: 'Book', language: 'English (Translation)', year: 1937, isbn: '978-0-684-81500-1', scriptureRefs: 'Matthew 16, Luke 14', keywords: 'Discipleship, Grace, Sermon on the Mount, Cost', abstract: 'Bonhoeffer\'s powerful call to genuine discipleship, distinguishing between costly grace and cheap grace.', accessLevel: 'Students', status: 'Available', copies: 5, available: 3, coverColor: 'from-red-500 to-rose-600' },
  { id: '18', title: 'Old Testament Theology', author: 'Gerhard von Rad', category: 'Biblical Exegesis', type: 'Book', language: 'English (Translation)', year: 1962, isbn: '978-0-664-21058-4', scriptureRefs: 'Entire OT', keywords: 'Old Testament, Theology, Tradition History, Salvation History', abstract: 'A seminal work in Old Testament theology, examining the traditions and theological themes that shape the Hebrew Scriptures.', accessLevel: 'Teachers', status: 'Available', copies: 3, available: 1, coverColor: 'from-amber-600 to-yellow-600' },
  { id: '19', title: 'Church History in Plain Language', author: 'Bruce Shelley', category: 'Church History', type: 'Book', language: 'English', year: 1982, isbn: '978-0-8499-4390-5', scriptureRefs: 'Various', keywords: 'Church History, Overview, 2000 Years, Movements', abstract: 'An accessible survey of church history from the early church to the modern era, written for students and lay readers.', accessLevel: 'Students', status: 'Available', copies: 6, available: 4, coverColor: 'from-sky-400 to-blue-600' },
  { id: '20', title: 'The Ministry of the Word', author: 'Dr. John Chacko', category: 'Pastoral Ministry', type: 'Book', language: 'English', year: 2018, isbn: '978-81-93812-01-0', scriptureRefs: '2 Timothy 4, Acts 6', keywords: 'Preaching, Ministry, Seminary, Expository', abstract: 'A practical guide to expository preaching and the ministry of the Word, written by the academic dean of Covenant Seminary.', accessLevel: 'Students', status: 'Available', copies: 10, available: 7, coverColor: 'from-emerald-400 to-teal-600' },
];

const borrowRecords: BorrowRecord[] = [
  { id: '1', manuscriptTitle: 'Systematic Theology (3 Vols)', borrowerName: 'Samuel Joshua Mathew', borrowerType: 'Student', borrowDate: '2025-03-01', dueDate: '2025-04-01', returnDate: '2025-03-28', status: 'Returned', fine: 0 },
  { id: '2', manuscriptTitle: 'The Bondage of the Will', borrowerName: 'Daniel Prasad Rao', borrowerType: 'Student', borrowDate: '2025-03-15', dueDate: '2025-04-15', returnDate: '', status: 'Borrowed', fine: 0 },
  { id: '3', manuscriptTitle: 'Mere Christianity', borrowerName: 'Emmanuel Thankachan', borrowerType: 'Student', borrowDate: '2025-02-20', dueDate: '2025-03-20', returnDate: '', status: 'Overdue', fine: 50 },
  { id: '4', manuscriptTitle: 'Commentary on Romans', borrowerName: 'Priya Christina Singh', borrowerType: 'Student', borrowDate: '2025-04-01', dueDate: '2025-05-01', returnDate: '', status: 'Borrowed', fine: 0 },
  { id: '5', manuscriptTitle: 'Pensées', borrowerName: 'Dr. John Chacko', borrowerType: 'Faculty', borrowDate: '2025-01-10', dueDate: '2025-04-10', returnDate: '', status: 'Borrowed', fine: 0 },
  { id: '6', manuscriptTitle: 'The Cost of Discipleship', borrowerName: 'Grace Rebecca David', borrowerType: 'Student', borrowDate: '2025-04-05', dueDate: '2025-05-05', returnDate: '', status: 'Borrowed', fine: 0 },
  { id: '7', manuscriptTitle: 'Missionary Methods', borrowerName: 'Arun Kumar Verma', borrowerType: 'Student', borrowDate: '2025-03-20', dueDate: '2025-04-20', returnDate: '2025-04-18', status: 'Returned', fine: 0 },
  { id: '8', manuscriptTitle: 'Christologia', borrowerName: 'Mary Jessinta Cherian', borrowerType: 'Student', borrowDate: '2025-04-10', dueDate: '2025-05-10', returnDate: '', status: 'Borrowed', fine: 0 },
];

const categories = ['All', 'Systematic Theology', 'Biblical Exegesis', 'Church History', 'Pastoral Ministry', 'Missiology', 'Apologetics', 'Christian Ethics', 'Christian Literature'];

const tabs = ['Catalog', 'Borrowed', 'Bookmarks', 'Uploads'];

const accessBadge = (level: string) => {
  const m: Record<string, { bg: string; icon: typeof Lock }> = {
    'Public': { bg: 'bg-emerald-50 text-emerald-700', icon: Globe },
    'Students': { bg: 'bg-blue-50 text-blue-700', icon: Users },
    'Teachers': { bg: 'bg-amber-50 text-amber-700', icon: Lock },
    'Admin': { bg: 'bg-red-50 text-red-700', icon: Lock },
  };
  const config = m[level] || m['Public'];
  return <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${config.bg}`}><config.icon className="h-3 w-3" />{level}</span>;
};

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

// ─── Main Component ──────────────────────────────────────────────────────────
export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedManuscript, setSelectedManuscript] = useState<Manuscript | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>(['1', '3', '16', '17']);
  const [submitting, setSubmitting] = useState(false);
  const { show: showToast, ToastUI } = useToast();

  const [form, setForm] = useState({ title: '', author: '', category: 'Systematic Theology', type: 'Book', language: 'English', year: '', isbn: '', scriptureRefs: '', keywords: '', abstract: '', accessLevel: 'Students', copies: '1' });

  // ─── API Data Layer ──────────────────────────────────────────────────
  const [apiManuscripts, setApiManuscripts] = useState<Manuscript[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const effectiveManuscripts = apiManuscripts;

  useEffect(() => {
    const token = getToken();
    if (!token) { setDataLoaded(true); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await getManuscripts({ search: search || undefined, category: selectedCategory !== 'All' ? selectedCategory : undefined });
        if (cancelled) return;
        if (Array.isArray(res)) {
          const mapped = res.map((m: any) => ({
            id: String(m.id ?? ''), title: m.title ?? '', author: m.author ?? '', category: m.category ?? '', type: m.type ?? 'Book', language: m.language ?? 'English', year: Number(m.year ?? 0), isbn: m.isbn ?? '', scriptureRefs: m.scripture_refs ?? m.scriptureRefs ?? '', keywords: m.keywords ?? '', abstract: m.abstract ?? '', accessLevel: m.access_level ?? m.accessLevel ?? 'Students', status: m.status ?? 'Available', copies: Number(m.copies ?? 1), available: Number(m.available ?? m.copies ?? 1), coverColor: m.cover_color ?? 'from-slate-500 to-slate-700',
          }));
          setApiManuscripts(mapped);
        }
      } catch { /* api data stays empty */ }
      setDataLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [search, selectedCategory]);

  const filtered = useMemo(() => effectiveManuscripts.filter(m => {
    const m1 = search === '' || m.title.toLowerCase().includes(search.toLowerCase()) || m.author.toLowerCase().includes(search.toLowerCase()) || m.keywords.toLowerCase().includes(search.toLowerCase()) || m.scriptureRefs.toLowerCase().includes(search.toLowerCase());
    const m2 = selectedCategory === 'All' || m.category === selectedCategory;
    return m1 && m2;
  }), [search, selectedCategory, effectiveManuscripts]);

  const totalBooks = effectiveManuscripts.reduce((a, m) => a + m.copies, 0);
  const totalAvailable = effectiveManuscripts.reduce((a, m) => a + m.available, 0);
  const borrowed = borrowRecords.filter(b => b.status === 'Borrowed').length;
  const overdue = borrowRecords.filter(b => b.status === 'Overdue').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {ToastUI}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Library className="h-7 w-7 text-amber-600" /> Theological Library
          </h2>
          <p className="text-slate-500 mt-1 text-sm">Manuscripts, books, commentaries, and research resources</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all">
            <Upload className="h-4 w-4" /> Add Manuscript
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Collection', value: totalBooks, icon: BookOpen, color: 'bg-slate-900', sub: `${effectiveManuscripts.length} titles` },
          { label: 'Available', value: totalAvailable, icon: BookCopy, color: 'bg-emerald-600', sub: 'Ready to borrow' },
          { label: 'Currently Borrowed', value: borrowed, icon: BookMarked, color: 'bg-blue-600', sub: 'Active loans' },
          { label: 'Overdue', value: overdue, icon: AlertCircle, color: 'bg-red-600', sub: 'Action needed' },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}><card.icon className="h-5 w-5 text-white" /></div>
            <p className="text-2xl font-extrabold text-slate-900">{card.value}</p>
            <p className="text-xs text-slate-500 mt-1">{card.label}</p>
            <p className="text-xs text-slate-400">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex gap-4">
        {/* Sidebar - Categories */}
        <div className="w-56 shrink-0 hidden lg:block">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 sticky top-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Filter className="h-4 w-4 text-amber-600" />Categories</h3>
            <div className="space-y-1">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === cat ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                  }`}>
                  {cat}
                  <span className="float-right text-xs text-slate-400">{cat === 'All' ? effectiveManuscripts.length : effectiveManuscripts.filter(m => m.category === cat).length}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {/* Search & Controls */}
            <div className="p-4 border-b border-slate-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, author, scripture, or keywords..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
                </div>
                <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}><Grid3X3 className="h-4 w-4" /></button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}><List className="h-4 w-4" /></button>
                </div>
              </div>
              {/* Mobile Categories */}
              <div className="flex gap-2 overflow-x-auto lg:hidden">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}>{cat}</button>
                ))}
              </div>
              {/* Tabs */}
              <div className="flex gap-1 border-b border-slate-100 -mb-4">
                {tabs.map((tab, i) => (
                  <button key={tab} onClick={() => setActiveTab(i)} className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === i ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>{tab}</button>
                ))}
              </div>
            </div>

            <div className="p-5">
              {/* ─── Catalog Tab ───────────────────────────────────────── */}
              {activeTab === 0 && viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map(m => (
                    <div key={m.id} className="border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 transition-all group">
                      <div className={`h-32 bg-gradient-to-br ${m.coverColor} relative flex items-center justify-center`}>
                        <BookOpen className="h-12 w-12 text-white/30" />
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">{m.type}</span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <button onClick={() => setBookmarks(prev => prev.includes(m.id) ? prev.filter(b => b !== m.id) : [...prev, m.id])}
                            className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-all">
                            {bookmarks.includes(m.id) ? <BookmarkCheck className="h-4 w-4 text-amber-300" /> : <Bookmark className="h-4 w-4 text-white/60" />}
                          </button>
                        </div>
                        <div className="absolute bottom-3 right-3">{accessBadge(m.accessLevel)}</div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-amber-700 transition-colors">{m.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">{m.author} · {m.year}</p>
                        <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{m.abstract}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-600">{m.category}</span>
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className={`font-semibold ${m.available > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{m.available}/{m.copies}</span>
                            <span className="text-slate-400">available</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => { setSelectedManuscript(m); }} className="flex-1 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all">View Details</button>
                          <button onClick={() => setShowBorrowModal(true)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all">Borrow</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 0 && viewMode === 'list' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Title</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">Author</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">Category</th>
                        <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Copies</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Access</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filtered.map(m => (
                        <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3"><p className="font-medium text-slate-900">{m.title}</p><p className="text-xs text-slate-400">{m.year} · {m.language}</p></td>
                          <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{m.author}</td>
                          <td className="px-4 py-3 hidden lg:table-cell"><span className="px-2 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">{m.category}</span></td>
                          <td className="px-4 py-3 text-center"><span className={`font-semibold ${m.available > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{m.available}</span><span className="text-slate-400">/{m.copies}</span></td>
                          <td className="px-4 py-3">{accessBadge(m.accessLevel)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ─── Borrowed Tab ──────────────────────────────────────── */}
              {activeTab === 1 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Title</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">Borrower</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">Borrowed</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Due</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                        <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {borrowRecords.map(b => (
                        <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-900">{b.manuscriptTitle}</td>
                          <td className="px-4 py-3 hidden md:table-cell"><p className="text-slate-700">{b.borrowerName}</p><p className="text-xs text-slate-400">{b.borrowerType}</p></td>
                          <td className="px-4 py-3 text-slate-500 text-xs hidden lg:table-cell">{b.borrowDate}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{b.dueDate}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${b.status === 'Returned' ? 'bg-emerald-50 text-emerald-700' : b.status === 'Borrowed' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>{b.status}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {b.status !== 'Returned' && <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all">Return</button>}
                            {b.fine > 0 && <p className="text-xs text-red-600 font-medium mt-1">Fine: ₹{b.fine}</p>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ─── Bookmarks Tab ─────────────────────────────────────── */}
              {activeTab === 2 && (
                <div className="space-y-3">
                  {effectiveManuscripts.filter(m => bookmarks.includes(m.id)).map(m => (
                    <div key={m.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:shadow-md hover:shadow-slate-200/50 transition-all">
                      <div className={`w-12 h-16 rounded-lg bg-gradient-to-br ${m.coverColor} flex items-center justify-center shrink-0`}><BookOpen className="h-6 w-6 text-white/40" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm">{m.title}</p>
                        <p className="text-xs text-slate-500">{m.author} · {m.year}</p>
                      </div>
                      <button onClick={() => setBookmarks(prev => prev.filter(b => b !== m.id))} className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"><BookmarkCheck className="h-4 w-4" /></button>
                    </div>
                  ))}
                  {bookmarks.length === 0 && <p className="text-center text-slate-400 py-8">No bookmarks yet. Browse the catalog and save your favorites.</p>}
                </div>
              )}

              {/* ─── Uploads Tab ───────────────────────────────────────── */}
              {activeTab === 3 && (
                <div className="space-y-4">
                  <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center hover:border-amber-400 transition-colors cursor-pointer" onClick={() => setShowAddModal(true)}>
                    <Upload className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="font-semibold text-slate-700">Upload Manuscript</p>
                    <p className="text-sm text-slate-400 mt-1">Drag & drop or click to upload PDF, DOC, or image files</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-3">Recent Faculty Contributions</h4>
                    <div className="space-y-2">
                      {[
                        { title: 'Sermon Notes: The Sovereignty of God in Salvation', author: 'Dr. John Chacko', date: '2025-04-10', status: 'Approved' },
                        { title: 'Research Paper: The Role of Women in Early Church', author: 'Prof. Rachel Menon', date: '2025-04-05', status: 'Under Review' },
                        { title: 'Worship Leading Guide for Small Groups', author: 'Dr. Michael David', date: '2025-03-28', status: 'Approved' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                          <FileText className="h-8 w-8 text-slate-400 shrink-0" />
                          <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-900">{item.title}</p><p className="text-xs text-slate-400">{item.author} · {item.date}</p></div>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 ${item.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{item.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── View Manuscript Modal ─────────────────────────────────────── */}
      {selectedManuscript && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className={`h-40 bg-gradient-to-br ${selectedManuscript.coverColor} relative flex items-center justify-center rounded-t-2xl`}>
              <BookOpen className="h-16 w-16 text-white/20" />
              <button onClick={() => setSelectedManuscript(null)} className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-all"><X className="h-5 w-5 text-white" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedManuscript.title}</h3>
                <p className="text-slate-500 mt-1">{selectedManuscript.author} · {selectedManuscript.year} · {selectedManuscript.language}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">{selectedManuscript.type}</span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">{selectedManuscript.category}</span>
                {accessBadge(selectedManuscript.accessLevel)}
              </div>
              <p className="text-sm text-slate-600">{selectedManuscript.abstract}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-slate-50"><p className="text-xs text-slate-400">ISBN</p><p className="font-mono text-xs text-slate-700 mt-0.5">{selectedManuscript.isbn}</p></div>
                <div className="p-3 rounded-xl bg-slate-50"><p className="text-xs text-slate-400">Scripture References</p><p className="text-xs text-slate-700 mt-0.5">{selectedManuscript.scriptureRefs}</p></div>
                <div className="p-3 rounded-xl bg-slate-50"><p className="text-xs text-slate-400">Keywords</p><p className="text-xs text-slate-700 mt-0.5">{selectedManuscript.keywords}</p></div>
                <div className="p-3 rounded-xl bg-slate-50"><p className="text-xs text-slate-400">Availability</p><p className={`text-xs font-semibold mt-0.5 ${selectedManuscript.available > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{selectedManuscript.available} of {selectedManuscript.copies} copies available</p></div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-800 font-medium">Citation Generator</p>
                <p className="text-xs text-amber-600 mt-1">APA: {selectedManuscript.author}. ({selectedManuscript.year}). <i>{selectedManuscript.title}</i>. ISBN: {selectedManuscript.isbn}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition-all"><Quote className="h-4 w-4" />Cite</button>
              <button className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all"><Download className="h-4 w-4" />Download PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Add Manuscript Modal ─────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 pt-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mb-8 animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add Manuscript</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Title" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" /></div>
                <input type="text" value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} placeholder="Author" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white transition-all">
                  <option value="Book">Book</option><option value="Research Paper">Research Paper</option><option value="Sermon">Sermon</option><option value="Commentary">Commentary</option><option value="Thesis">Thesis</option>
                </select>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white transition-all">
                  {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="text" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} placeholder="Year" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
                <input type="text" value={form.isbn} onChange={e => setForm(p => ({ ...p, isbn: e.target.value }))} placeholder="ISBN" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
                <input type="text" value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))} placeholder="Language" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
                <input type="text" value={form.scriptureRefs} onChange={e => setForm(p => ({ ...p, scriptureRefs: e.target.value }))} placeholder="Scripture References" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
                <input type="text" value={form.keywords} onChange={e => setForm(p => ({ ...p, keywords: e.target.value }))} placeholder="Keywords (comma separated)" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
                <select value={form.accessLevel} onChange={e => setForm(p => ({ ...p, accessLevel: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white transition-all">
                  <option value="Public">Public</option><option value="Students">Students</option><option value="Teachers">Teachers</option><option value="Admin">Admin Only</option>
                </select>
                <input type="number" value={form.copies} onChange={e => setForm(p => ({ ...p, copies: e.target.value }))} placeholder="Copies" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
                <div className="col-span-2"><textarea value={form.abstract} onChange={e => setForm(p => ({ ...p, abstract: e.target.value }))} placeholder="Abstract / Description" rows={3} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all resize-none" /></div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition-all">Cancel</button>
              <button onClick={async () => {
                if (!form.title || !form.author) { showToast('Title and author are required', 'error'); return; }
                setSubmitting(true);
                try {
                  await createManuscript({ title: form.title, author: form.author, category: form.category, type: form.type, language: form.language, year: Number(form.year) || 0, isbn: form.isbn, scripture_refs: form.scriptureRefs, keywords: form.keywords, abstract: form.abstract, access_level: form.accessLevel, copies: Number(form.copies) || 1 });
                  showToast('Manuscript added successfully');
                  setShowAddModal(false);
                  setForm({ title: '', author: '', category: 'Systematic Theology', type: 'Book', language: 'English', year: '', isbn: '', scriptureRefs: '', keywords: '', abstract: '', accessLevel: 'Students', copies: '1' });
                  const res = await getManuscripts({ search: '', category: undefined });
                  if (Array.isArray(res)) { setApiManuscripts(res.map((m: any) => ({ id: String(m.id ?? ''), title: m.title ?? '', author: m.author ?? '', category: m.category ?? '', type: m.type ?? 'Book', language: m.language ?? 'English', year: Number(m.year ?? 0), isbn: m.isbn ?? '', scriptureRefs: m.scripture_refs ?? '', keywords: m.keywords ?? '', abstract: m.abstract ?? '', accessLevel: m.access_level ?? 'Students', status: m.status ?? 'Available', copies: Number(m.copies ?? 1), available: Number(m.available ?? m.copies ?? 1), coverColor: m.cover_color ?? 'from-slate-500 to-slate-700' }))); }
                } catch (e: any) { showToast(e.message || 'Failed to add manuscript', 'error'); }
                setSubmitting(false);
              }} disabled={submitting} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all disabled:opacity-50"><Plus className="h-4 w-4" />{submitting ? 'Adding...' : 'Add Manuscript'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Borrow Modal ─────────────────────────────────────────────── */}
      {showBorrowModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Borrow Book</h3>
              <button onClick={() => setShowBorrowModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <BookCopy className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <p className="text-sm text-amber-800 font-medium">Borrowing period: 30 days</p>
                <p className="text-xs text-amber-600 mt-1">Late fee: ₹5/day after due date</p>
              </div>
              <input type="text" placeholder="Select student or faculty..." className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
            </div>
            <div className="flex items-center justify-end gap-2 p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button onClick={() => setShowBorrowModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition-all">Cancel</button>
              <button onClick={() => setShowBorrowModal(false)} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all"><BookCopy className="h-4 w-4" />Issue Book</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
