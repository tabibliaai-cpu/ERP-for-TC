import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, Search, Plus, History, Star, Bookmark, FileText, Users,
  Lock, Eye, BarChart3, GraduationCap, ChevronRight, ChevronDown,
  Filter, SortAsc, X, BookMarked, Upload, Calendar, Clock, AlertTriangle,
  CheckCircle2, CircleDot, Shield, Sparkles, Quote, Tag, ExternalLink,
  Layers, FileCheck, TrendingUp, Heart, MessageSquare, Bell, ArrowRight,
  Library as LibraryIcon, PenLine, FolderOpen, Copy, Download, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import {
  manuscriptService, libraryCategoryService, libraryAuthorService,
  libraryBorrowService, libraryBookmarkService, libraryNoteService,
  manuscriptVersionService, libraryAccessControlService,
  Manuscript, LibraryCategory, LibraryAuthor, LibraryBorrowLog,
  LibraryBookmark, LibraryNote, ManuscriptVersion
} from '../services/dataService';
import { useAuthStore } from '../store/useStore';

// ─── Constants ───────────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES = [
  'Systematic Theology', 'Biblical Exegesis', 'Church History',
  'Pastoral Ministry', 'Missiology', 'Apologetics',
  'Christian Ethics', 'Sermon Archives', 'Greek & Hebrew'
];

const MANUSCRIPT_TYPES: { value: Manuscript['type']; label: string }[] = [
  { value: 'book', label: 'Book' },
  { value: 'research_paper', label: 'Research Paper' },
  { value: 'sermon', label: 'Sermon' },
  { value: 'commentary', label: 'Commentary' },
  { value: 'thesis', label: 'Thesis' },
  { value: 'journal', label: 'Journal' },
  { value: 'manuscript', label: 'Manuscript' },
];

const ACCESS_LEVELS: { value: Manuscript['accessLevel']; label: string }[] = [
  { value: 'public', label: 'Public' },
  { value: 'students', label: 'Students Only' },
  { value: 'faculty', label: 'Faculty Only' },
  { value: 'admin', label: 'Admin Only' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Read' },
  { value: 'referenced', label: 'Most Referenced' },
  { value: 'title_asc', label: 'Title A-Z' },
  { value: 'title_desc', label: 'Title Z-A' },
  { value: 'year_new', label: 'Newest Publication' },
  { value: 'year_old', label: 'Oldest Publication' },
];

const CITE_STYLES = ['APA 7th', 'MLA 9th', 'Chicago', 'Turabian', 'SBL'];

const TABS = [
  { id: 'catalog', label: 'Catalog', icon: BookOpen },
  { id: 'categories', label: 'Categories', icon: Layers },
  { id: 'authors', label: 'Authors', icon: Users },
  { id: 'borrowing', label: 'Borrowing', icon: History },
  { id: 'bookmarks', label: 'Bookmarks', icon: Star },
  { id: 'notes', label: 'Notes', icon: PenLine },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Shield },
];

// ─── Citation Generator ──────────────────────────────────────────────────────
function generateCitation(m: Manuscript, style: string): string {
  const author = m.author || 'Unknown Author';
  const title = m.title || 'Untitled';
  const year = m.publicationYear || new Date().getFullYear();
  const cat = m.category || '';
  switch (style) {
    case 'APA 7th':
      return `${author} (${year}). *${title}*. ${cat}.`;
    case 'MLA 9th':
      return `${author}. *${title}*. ${year}.`;
    case 'Chicago':
      return `${author}. *${title}*. ${cat}, ${year}.`;
    case 'Turabian':
      return `${author}. *${title}*. ${cat}: ${year}.`;
    case 'SBL':
      return `${author}. *${title}*. ${cat}, ${year}.`;
    default:
      return `${author}, ${title} (${year})`;
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function Library() {
  const { user } = useAuthStore();
  const tenantId = user?.tenantId || '';
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isFaculty = user?.role === 'faculty' || isAdmin;

  // Tab state
  const [activeTab, setActiveTab] = useState('catalog');

  // Data states
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [categories, setCategories] = useState<LibraryCategory[]>([]);
  const [authors, setAuthors] = useState<LibraryAuthor[]>([]);
  const [borrowLogs, setBorrowLogs] = useState<LibraryBorrowLog[]>([]);
  const [bookmarks, setBookmarks] = useState<LibraryBookmark[]>([]);
  const [notes, setNotes] = useState<LibraryNote[]>([]);

  // Loading
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterAccess, setFilterAccess] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showCiteModal, setShowCiteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedManuscript, setSelectedManuscript] = useState<Manuscript | null>(null);
  const [citeStyle, setCiteStyle] = useState('APA 7th');
  const [copiedCite, setCopiedCite] = useState(false);

  // Add manuscript form
  const [formStep, setFormStep] = useState(1);
  const [newManuscript, setNewManuscript] = useState({
    title: '', author: '', category: 'Systematic Theology', type: 'book' as Manuscript['type'],
    language: 'English', publicationYear: new Date().getFullYear(), isbn: '',
    abstract: '', scriptureReferences: '', keywords: '', accessLevel: 'public' as Manuscript['accessLevel'],
  });
  const [newCategory, setNewCategory] = useState({ name: '', description: '', sortOrder: 0 });
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newAuthor, setNewAuthor] = useState({ name: '', bio: '', expertise: '', affiliation: '' });
  const [showAddAuthor, setShowAddAuthor] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'info' | 'warning' | 'success' }[]>([]);

  // ─── Data Loading ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (tenantId) loadAllData();
  }, [tenantId]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [ms, cats, auths, logs, bms, nts] = await Promise.all([
        manuscriptService.getByTenant(tenantId).catch(() => []),
        libraryCategoryService.getByTenant(tenantId).catch(() => []),
        libraryAuthorService.getByTenant(tenantId).catch(() => []),
        libraryBorrowService.getByTenant(tenantId).catch(() => []),
        user?.uid ? libraryBookmarkService.getByUser(tenantId, user.uid).catch(() => []) : Promise.resolve([]),
        user?.uid ? libraryNoteService.getByUser(tenantId, user.uid).catch(() => []) : Promise.resolve([]),
      ]);
      setManuscripts(ms);
      setCategories(cats);
      setAuthors(auths);
      setBorrowLogs(logs);
      setBookmarks(bms);
      setNotes(nts);
      checkOverdueLogs(logs);
    } catch (error) {
      console.error('Failed to load library data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkOverdueLogs = (logs: LibraryBorrowLog[]) => {
    const now = new Date();
    const warnings: { id: string; message: string; type: 'info' | 'warning' | 'success' }[] = [];
    logs.forEach(log => {
      if (log.status === 'borrowed' && log.dueDate) {
        const due = new Date(log.dueDate?.seconds * 1000);
        const diffDays = Math.ceil((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 0) {
          warnings.push({ id: log.id || '', message: `"${log.manuscriptTitle}" is ${diffDays} day(s) overdue`, type: 'warning' });
          libraryBorrowService.markOverdue(log.id!);
        } else if (diffDays >= -2) {
          warnings.push({ id: log.id || '', message: `"${log.manuscriptTitle}" due in ${Math.abs(diffDays)} day(s)`, type: 'info' });
        }
      }
    });
    if (warnings.length > 0) setNotifications(warnings);
  };

  // ─── Filtered & Sorted Manuscripts ──────────────────────────────────────────
  const filteredManuscripts = useMemo(() => {
    let result = [...manuscripts];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(m =>
        m.title.toLowerCase().includes(term) ||
        m.author.toLowerCase().includes(term) ||
        m.isbn?.toLowerCase().includes(term) ||
        m.abstract?.toLowerCase().includes(term) ||
        m.keywords?.some(k => k.toLowerCase().includes(term)) ||
        m.scriptureReferences?.some(s => s.toLowerCase().includes(term))
      );
    }
    if (filterCategory !== 'all') result = result.filter(m => m.category === filterCategory);
    if (filterType !== 'all') result = result.filter(m => m.type === filterType);
    if (filterAccess !== 'all') result = result.filter(m => m.accessLevel === filterAccess);
    switch (sortBy) {
      case 'popular': result.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)); break;
      case 'referenced': result.sort((a, b) => (b.referenceCount || 0) - (a.referenceCount || 0)); break;
      case 'title_asc': result.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'title_desc': result.sort((a, b) => b.title.localeCompare(a.title)); break;
      case 'year_new': result.sort((a, b) => (b.publicationYear || 0) - (a.publicationYear || 0)); break;
      case 'year_old': result.sort((a, b) => (a.publicationYear || 0) - (b.publicationYear || 0)); break;
      default: break; // 'recent' uses Firestore orderBy
    }
    return result;
  }, [manuscripts, searchTerm, filterCategory, filterType, filterAccess, sortBy]);

  const stats = useMemo(() => ({
    total: manuscripts.length,
    available: manuscripts.filter(m => m.status === 'available' || m.status === 'published').length,
    borrowed: manuscripts.filter(m => m.status === 'borrowed').length,
    underReview: manuscripts.filter(m => m.status === 'under_review').length,
    totalViews: manuscripts.reduce((sum, m) => sum + (m.viewCount || 0), 0),
    totalAuthors: new Set(manuscripts.map(m => m.author)).size,
    activeBorrows: borrowLogs.filter(l => l.status === 'borrowed').length,
    overdueBorrows: borrowLogs.filter(l => l.status === 'overdue').length,
    myBookmarks: bookmarks.length,
    myNotes: notes.length,
    categoriesCount: categories.length > 0 ? categories.length : DEFAULT_CATEGORIES.length,
  }), [manuscripts, borrowLogs, bookmarks, notes, categories]);

  const activeCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES.map((c, i) => ({
    id: `default-${i}`, name: c, description: '', icon: '', sortOrder: i, isActive: true, tenantId: ''
  }));

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleAddManuscript = async () => {
    if (!tenantId) return;
    try {
      await manuscriptService.addManuscript({
        ...newManuscript,
        tenantId,
        status: isFaculty ? 'published' : 'under_review',
        contributedBy: user?.uid,
        scriptureReferences: newManuscript.scriptureReferences.split(',').map(s => s.trim()).filter(Boolean),
        keywords: newManuscript.keywords.split(',').map(k => k.trim()).filter(Boolean),
      });
      setShowAddModal(false);
      setFormStep(1);
      setNewManuscript({ title: '', author: '', category: 'Systematic Theology', type: 'book', language: 'English', publicationYear: new Date().getFullYear(), isbn: '', abstract: '', scriptureReferences: '', keywords: '', accessLevel: 'public' });
      loadAllData();
    } catch (error) { console.error('Error adding manuscript:', error); }
  };

  const handleBorrow = async (manuscriptId: string, manuscriptTitle: string) => {
    if (!tenantId || !user?.uid) return;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    try {
      await libraryBorrowService.borrowManuscript({
        manuscriptId, manuscriptTitle, userId: user.uid, userName: user.email,
        dueDate, tenantId,
      });
      setShowBorrowModal(false);
      loadAllData();
    } catch (error) { console.error('Error borrowing:', error); }
  };

  const handleReturn = async (borrowId: string, manuscriptId: string) => {
    try {
      await libraryBorrowService.returnManuscript(borrowId, manuscriptId);
      loadAllData();
    } catch (error) { console.error('Error returning:', error); }
  };

  const handleBookmark = async (manuscriptId: string, title: string) => {
    if (!tenantId || !user?.uid) return;
    try {
      const isBookmarked = bookmarks.some(b => b.manuscriptId === manuscriptId);
      if (isBookmarked) {
        const bm = bookmarks.find(b => b.manuscriptId === manuscriptId);
        if (bm?.id) await libraryBookmarkService.delete(bm.id);
      } else {
        await libraryBookmarkService.addBookmark({ userId: user.uid, manuscriptId, manuscriptTitle: title, tenantId });
      }
      loadAllData();
    } catch (error) { console.error('Error bookmarking:', error); }
  };

  const handleAddNote = async () => {
    if (!tenantId || !user?.uid || !selectedManuscript) return;
    try {
      await libraryNoteService.addNote({
        userId: user.uid, manuscriptId: selectedManuscript.id!,
        manuscriptTitle: selectedManuscript.title, content: '', tenantId,
      });
      loadAllData();
    } catch (error) { console.error('Error adding note:', error); }
  };

  const handleApproveManuscript = async (id: string) => {
    try {
      await manuscriptService.update(id, { status: 'published', approvedBy: user?.uid, approvedAt: new Date() });
      loadAllData();
    } catch (error) { console.error('Error approving:', error); }
  };

  const handleAddCategory = async () => {
    if (!tenantId || !newCategory.name) return;
    try {
      await libraryCategoryService.addCategory({
        ...newCategory, sortOrder: categories.length, isActive: true, tenantId,
      });
      setShowAddCategory(false);
      setNewCategory({ name: '', description: '', sortOrder: 0 });
      loadAllData();
    } catch (error) { console.error('Error adding category:', error); }
  };

  const handleAddAuthor = async () => {
    if (!tenantId || !newAuthor.name) return;
    try {
      await libraryAuthorService.addAuthor({
        ...newAuthor, expertise: newAuthor.expertise.split(',').map(e => e.trim()).filter(Boolean), tenantId,
      });
      setShowAddAuthor(false);
      setNewAuthor({ name: '', bio: '', expertise: '', affiliation: '' });
      loadAllData();
    } catch (error) { console.error('Error adding author:', error); }
  };

  const handleCopyCitation = (citation: string) => {
    navigator.clipboard.writeText(citation);
    setCopiedCite(true);
    setTimeout(() => setCopiedCite(false), 2000);
  };

  const openDetail = (m: Manuscript) => {
    manuscriptService.incrementViews(m.id!);
    setSelectedManuscript(m);
    setShowDetailModal(true);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 min-h-screen">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Theological Repository</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Knowledge Engine</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-950 tracking-tight">Theological Library Portal</h1>
          <p className="text-slate-500 text-sm mt-1 max-w-xl">
            Research manuscripts, commentaries, and ministry knowledge hub with cryptographic provenance and AI-powered discovery.
          </p>
        </div>
        <div className="flex gap-3">
          {notifications.length > 0 && (
            <button className="relative px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span>{notifications.length}</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-[8px] text-white font-bold flex items-center justify-center">{notifications.length}</span>
            </button>
          )}
          <button onClick={() => setShowBorrowModal(true)} className="px-5 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest flex items-center gap-2 shadow-sm">
            <History className="w-4 h-4" /><span>Borrowing</span>
          </button>
          <button onClick={() => { setFormStep(1); setShowAddModal(true); }} className="px-5 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-200">
            <Plus className="w-4 h-4" /><span>Add Manuscript</span>
          </button>
        </div>
      </div>

      {/* ── Stats Bar ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Works', value: stats.total, icon: BookOpen, color: 'indigo' },
          { label: 'Available', value: stats.available, icon: CheckCircle2, color: 'emerald' },
          { label: 'On Loan', value: stats.borrowed, icon: Clock, color: 'amber' },
          { label: 'Authors', value: stats.totalAuthors, icon: Users, color: 'violet' },
          { label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'blue' },
          { label: 'Categories', value: stats.categoriesCount, icon: Layers, color: 'rose' },
        ].map(s => (
          <div key={s.label} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <s.icon className={cn("w-4 h-4", `text-${s.color}-500`)} />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-100">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap",
                activeTab === tab.id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-400 hover:text-slate-600"
              )}>
              <tab.icon className="w-4 h-4" />{tab.label}
              {tab.id === 'bookmarks' && bookmarks.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[8px] font-bold">{bookmarks.length}</span>
              )}
              {tab.id === 'borrowing' && stats.activeBorrows > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[8px] font-bold">{stats.activeBorrows}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

          {/* ═══════ CATALOG TAB ═══════ */}
          {activeTab === 'catalog' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left Sidebar */}
              <div className="lg:col-span-1 space-y-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Categories</h3>
                  <div className="space-y-1.5">
                    <button onClick={() => setFilterCategory('all')}
                      className={cn("w-full text-left px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between uppercase tracking-wider",
                        filterCategory === 'all' ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50")}>
                      <span>All Collections</span>
                      <span className="text-[9px] font-mono bg-slate-100 px-2 py-0.5 rounded-md">{manuscripts.length}</span>
                    </button>
                    {activeCategories.filter(c => c.isActive).map(cat => (
                      <button key={cat.id} onClick={() => setFilterCategory(cat.name)}
                        className={cn("w-full text-left px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between uppercase tracking-wider",
                          filterCategory === cat.name ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50")}>
                        <span className="truncate">{cat.name}</span>
                        <span className="text-[9px] font-mono bg-slate-100 px-2 py-0.5 rounded-md">{manuscripts.filter(m => m.category === cat.name).length}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Digital Archives Promo */}
                <div className="bg-indigo-600 p-6 rounded-3xl shadow-2xl shadow-indigo-200 text-white relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                  <LibraryIcon className="w-10 h-10 mb-4 opacity-30 group-hover:opacity-60 transition-opacity" />
                  <h4 className="font-bold text-lg leading-tight">Digital Archives Open</h4>
                  <p className="text-xs text-indigo-100 mt-2 leading-relaxed opacity-80">Access rare manuscripts through our secure zero-trust portal with cryptographic provenance.</p>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3 space-y-5">
                {/* Search Bar */}
                <div className="flex gap-3">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input type="text" placeholder="Search by title, author, scripture, topic, keyword..."
                      value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none shadow-sm focus:ring-4 focus:ring-indigo-100 transition-all font-medium text-base placeholder:text-slate-200" />
                  </div>
                  <button onClick={() => setShowFilters(!showFilters)}
                    className={cn("px-4 py-4 bg-white border rounded-2xl transition-all flex items-center gap-2 shadow-sm",
                      showFilters ? "border-indigo-200 text-indigo-600" : "border-slate-200 text-slate-400 hover:text-slate-600")}>
                    <Filter className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-widest">Filters</span>
                  </button>
                  <div className="relative">
                    <SortAsc className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                      className="pl-9 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none shadow-sm text-[10px] font-bold uppercase tracking-widest cursor-pointer appearance-none">
                      {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Filter Panel */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4">
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Type</label>
                          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                            className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer">
                            <option value="all">All Types</option>
                            {MANUSCRIPT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Access</label>
                          <select value={filterAccess} onChange={(e) => setFilterAccess(e.target.value)}
                            className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer">
                            <option value="all">All Levels</option>
                            {ACCESS_LEVELS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                          </select>
                        </div>
                        {(searchTerm || filterCategory !== 'all' || filterType !== 'all' || filterAccess !== 'all') && (
                          <button onClick={() => { setSearchTerm(''); setFilterCategory('all'); setFilterType('all'); setFilterAccess('all'); }}
                            className="px-3 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <X className="w-3 h-3" /> Clear
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Notifications */}
                {notifications.length > 0 && (
                  <div className="space-y-2">
                    {notifications.map(n => (
                      <div key={n.id} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold border",
                        n.type === 'warning' ? "bg-amber-50 border-amber-100 text-amber-700" : "bg-blue-50 border-blue-100 text-blue-700")}>
                        {n.type === 'warning' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <Bell className="w-4 h-4 shrink-0" />}
                        <span>{n.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Manuscript Grid */}
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500/10 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Archives...</p>
                  </div>
                ) : filteredManuscripts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
                    <BookOpen className="w-16 h-16 text-slate-100 mb-6" />
                    <p className="text-lg font-bold text-slate-400 mb-2">{searchTerm ? 'No manuscripts match your search' : 'No manuscripts in the archive yet'}</p>
                    <p className="text-xs text-slate-300 mb-6">{searchTerm ? 'Try adjusting your filters or search terms' : 'Start building your theological knowledge engine'}</p>
                    {!searchTerm && (
                      <div className="flex gap-3">
                        {['Systematic Theology', 'Biblical Exegesis', 'Church History'].map(cat => (
                          <button key={cat} onClick={() => setFilterCategory(cat)}
                            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-100 transition-all">
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredManuscripts.map((m, idx) => {
                      const isBookmarked = bookmarks.some(b => b.manuscriptId === m.id);
                      return (
                        <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group flex gap-5">
                          {/* Book Cover */}
                          <div className="w-24 h-32 bg-gradient-to-br from-indigo-50 to-slate-100 rounded-xl shrink-0 flex flex-col items-center justify-center relative shadow-inner overflow-hidden cursor-pointer"
                            onClick={() => openDetail(m)}>
                            <div className={cn("absolute top-0 left-0 w-1.5 h-full",
                              m.type === 'book' ? "bg-indigo-500/40" :
                              m.type === 'sermon' ? "bg-amber-500/40" :
                              m.type === 'research_paper' ? "bg-emerald-500/40" :
                              m.type === 'thesis' ? "bg-violet-500/40" : "bg-rose-500/40"
                            )} />
                            <BookOpen className="w-8 h-8 text-slate-200 group-hover:scale-110 group-hover:text-indigo-400 transition-all duration-500" />
                            <span className="text-[7px] font-black uppercase text-slate-300 mt-1 tracking-wider">{m.type.replace('_', ' ')}</span>
                          </div>

                          {/* Info */}
                          <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest truncate mr-2">{m.category}</span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {m.accessLevel !== 'public' && <Lock className="w-3 h-3 text-slate-400" />}
                                  <div className={cn("w-2 h-2 rounded-full",
                                    m.status === 'available' || m.status === 'published' ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" :
                                    m.status === 'borrowed' ? "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]" :
                                    m.status === 'under_review' ? "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]" : "bg-slate-300"
                                  )} />
                                  <span className="text-[7px] font-black uppercase text-slate-400">{m.status.replace('_', ' ')}</span>
                                </div>
                              </div>
                              <h4 className="text-base font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors cursor-pointer truncate"
                                onClick={() => openDetail(m)}>{m.title}</h4>
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{m.author}</p>
                              {m.abstract && <p className="text-[10px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">{m.abstract}</p>}
                              {m.scriptureReferences && m.scriptureReferences.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {m.scriptureReferences.slice(0, 3).map(ref => (
                                    <span key={ref} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[7px] font-bold uppercase tracking-wider flex items-center gap-1">
                                      <Quote className="w-2 h-2" />{ref}
                                    </span>
                                  ))}
                                  {m.scriptureReferences.length > 3 && (
                                    <span className="text-[7px] text-slate-300 font-bold">+{m.scriptureReferences.length - 3}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-slate-300 mt-3 pt-3 border-t border-slate-50">
                              <div className="flex items-center gap-3">
                                <span className="font-mono">I: {m.isbn || 'N/A'}</span>
                                <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{m.viewCount || 0}</span>
                                <span>{m.publicationYear || ''}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleBookmark(m.id!, m.title)} className="p-1.5 rounded-lg hover:bg-slate-50 transition-all">
                                  <Star className={cn("w-3.5 h-3.5 transition-colors", isBookmarked ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
                                </button>
                                <button onClick={() => { setSelectedManuscript(m); setShowCiteModal(true); }} className="p-1.5 rounded-lg hover:bg-slate-50 transition-all">
                                  <Copy className="w-3.5 h-3.5 text-slate-300" />
                                </button>
                                {(m.status === 'available' || m.status === 'published') && (
                                  <button onClick={() => { setSelectedManuscript(m); handleBorrow(m.id!, m.title); }}
                                    className="px-3 py-1.5 bg-slate-50 text-indigo-600 rounded-lg font-black uppercase tracking-wider hover:bg-slate-900 hover:text-white transition-all text-[8px]">
                                    Borrow
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════ CATEGORIES TAB ═══════ */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Category Management</h2>
                  <p className="text-xs text-slate-400 mt-1">Organize manuscripts into theological disciplines</p>
                </div>
                {isAdmin && (
                  <button onClick={() => setShowAddCategory(true)} className="px-5 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all uppercase tracking-widest flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Category
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeCategories.filter(c => c.isActive).map(cat => {
                  const count = manuscripts.filter(m => m.category === cat.name).length;
                  return (
                    <div key={cat.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-100 shadow-sm transition-all group cursor-pointer"
                      onClick={() => { setActiveTab('catalog'); setFilterCategory(cat.name); }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                          <Layers className="w-5 h-5 text-indigo-500" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{cat.name}</h3>
                      {cat.description && <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{cat.description}</p>}
                      <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{count} works</span>
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Browse</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════ AUTHORS TAB ═══════ */}
          {activeTab === 'authors' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Author Directory</h2>
                  <p className="text-xs text-slate-400 mt-1">Manage contributors and theological scholars</p>
                </div>
                <button onClick={() => setShowAddAuthor(true)} className="px-5 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all uppercase tracking-widest flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Author
                </button>
              </div>
              {authors.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-16 text-center">
                  <Users className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                  <p className="font-bold text-slate-400 mb-1">No authors registered yet</p>
                  <p className="text-xs text-slate-300">Authors are automatically tracked from manuscript entries</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {authors.map(a => {
                    const workCount = manuscripts.filter(m => m.author === a.name).length;
                    return (
                      <div key={a.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 font-bold text-sm uppercase">
                            {a.name[0]}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm">{a.name}</h3>
                            {a.affiliation && <p className="text-[9px] text-slate-400 uppercase tracking-widest">{a.affiliation}</p>}
                          </div>
                        </div>
                        {a.bio && <p className="text-[10px] text-slate-400 leading-relaxed mb-3">{a.bio}</p>}
                        {a.expertise && a.expertise.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {a.expertise.map(e => (
                              <span key={e} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md text-[8px] font-bold uppercase tracking-wider">{e}</span>
                            ))}
                          </div>
                        )}
                        <div className="pt-3 border-t border-slate-50">
                          <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{workCount} work(s) in archive</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══════ BORROWING TAB ═══════ */}
          {activeTab === 'borrowing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Circulation Registry</h2>
                  <p className="text-xs text-slate-400 mt-1">Borrowing, returns, and due date tracking</p>
                </div>
                <div className="flex gap-3">
                  {stats.overdueBorrows > 0 && (
                    <span className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />{stats.overdueBorrows} Overdue
                    </span>
                  )}
                  <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />{stats.activeBorrows} Active
                  </span>
                </div>
              </div>
              {borrowLogs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-16 text-center">
                  <History className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                  <p className="font-bold text-slate-400 mb-1">No borrowing activity recorded</p>
                  <p className="text-xs text-slate-300">Borrow a manuscript from the catalog to begin tracking</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                          <th className="px-5 py-4">Manuscript</th>
                          <th className="px-5 py-4 text-center">Borrowed</th>
                          <th className="px-5 py-4 text-center">Due Date</th>
                          <th className="px-5 py-4 text-center">Returned</th>
                          <th className="px-5 py-4 text-center">Status</th>
                          <th className="px-5 py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {borrowLogs.map(log => (
                          <tr key={log.id} className="text-sm hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-4">
                              <p className="font-bold text-slate-900">{log.manuscriptTitle || 'Unknown'}</p>
                              <p className="text-[8px] font-mono text-slate-400 mt-0.5 uppercase tracking-tighter">REF: {log.id?.slice(-8)}</p>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className="font-mono text-[10px] text-emerald-600">
                                {log.borrowDate ? new Date(log.borrowDate.seconds * 1000).toLocaleDateString() : 'Live'}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className="font-mono text-[10px] text-slate-500">
                                {log.dueDate ? new Date(log.dueDate.seconds * 1000).toLocaleDateString() : 'N/A'}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className="font-mono text-[10px] text-slate-400">
                                {log.returnDate ? new Date(log.returnDate.seconds * 1000).toLocaleDateString() : '—'}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className={cn("px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                                log.status === 'borrowed' ? "bg-amber-50 text-amber-600" :
                                log.status === 'overdue' ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                              )}>{log.status}</span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              {log.status === 'borrowed' || log.status === 'overdue' ? (
                                <button onClick={() => handleReturn(log.id!, log.manuscriptId)}
                                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100">
                                  Return
                                </button>
                              ) : (
                                <CheckCircle2 className="w-5 h-5 text-emerald-300 mx-auto" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════ BOOKMARKS TAB ═══════ */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">My Bookmarks & Collections</h2>
                  <p className="text-xs text-slate-400 mt-1">Personal reading lists and saved manuscripts</p>
                </div>
              </div>
              {bookmarks.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-16 text-center">
                  <Star className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                  <p className="font-bold text-slate-400 mb-1">No bookmarks saved yet</p>
                  <p className="text-xs text-slate-300">Click the star icon on any manuscript to save it here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookmarks.map(bm => (
                    <div key={bm.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Bookmarked</span>
                        </div>
                        <button onClick={() => libraryBookmarkService.delete(bm.id!).then(loadAllData)}
                          className="p-1 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors cursor-pointer"
                        onClick={() => { const m = manuscripts.find(ms => ms.id === bm.manuscriptId); if (m) openDetail(m); }}>
                        {bm.manuscriptTitle || 'Untitled'}
                      </h3>
                      {bm.collectionName && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[8px] font-bold uppercase tracking-wider">
                          <FolderOpen className="w-2.5 h-2.5 inline mr-1" />{bm.collectionName}
                        </span>
                      )}
                      {bm.notes && <p className="text-[10px] text-slate-400 mt-2 italic">"{bm.notes}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════ NOTES TAB ═══════ */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Research Notes & Highlights</h2>
                  <p className="text-xs text-slate-400 mt-1">Annotations, insights, and study notes from manuscripts</p>
                </div>
              </div>
              {notes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-16 text-center">
                  <PenLine className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                  <p className="font-bold text-slate-400 mb-1">No notes yet</p>
                  <p className="text-xs text-slate-300">Open a manuscript detail view to add notes and highlights</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map(n => (
                    <div key={n.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{n.manuscriptTitle || 'Untitled'}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            {n.chapter && <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">Ch: {n.chapter}</span>}
                            {n.pageNumber && <span className="text-[9px] font-bold text-slate-400 font-mono">p. {n.pageNumber}</span>}
                            <span className="text-[9px] text-slate-300 font-mono">{n.createdAt ? new Date(n.createdAt.seconds * 1000).toLocaleDateString() : ''}</span>
                          </div>
                        </div>
                        <button onClick={() => libraryNoteService.delete(n.id!).then(loadAllData)}
                          className="p-1 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      {n.highlightText && (
                        <div className="mt-3 px-3 py-2 bg-amber-50 border-l-2 border-amber-400 rounded-r-lg">
                          <p className="text-[10px] text-amber-800 italic leading-relaxed">"{n.highlightText}"</p>
                        </div>
                      )}
                      {n.content && (
                        <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">{n.content}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════ ANALYTICS TAB ═══════ */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Library Analytics</h2>
                <p className="text-xs text-slate-400 mt-1">Usage statistics, popular topics, and engagement metrics</p>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center"><Eye className="w-5 h-5 text-indigo-500" /></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Views</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalViews.toLocaleString()}</p>
                  <p className="text-[9px] text-emerald-500 mt-1 font-bold">Across all manuscripts</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-amber-500" /></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Views</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{manuscripts.length > 0 ? Math.round(stats.totalViews / manuscripts.length) : 0}</p>
                  <p className="text-[9px] text-slate-400 mt-1 font-bold">Per manuscript</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><Clock className="w-5 h-5 text-emerald-500" /></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Circulation</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{borrowLogs.length}</p>
                  <p className="text-[9px] text-slate-400 mt-1 font-bold">Total borrow events</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center"><Users className="w-5 h-5 text-violet-500" /></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Engagement</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{stats.myBookmarks + stats.myNotes}</p>
                  <p className="text-[9px] text-slate-400 mt-1 font-bold">Your bookmarks & notes</p>
                </div>
              </div>

              {/* Top Read */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Most Read Manuscripts</h3>
                  {manuscripts.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5).map((m, i) => (
                    <div key={m.id} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                      <span className="text-[9px] font-black text-slate-300 font-mono w-4">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{m.title}</p>
                        <p className="text-[8px] text-slate-400 uppercase tracking-wider">{m.author}</p>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-500 font-mono">{m.viewCount || 0}</span>
                    </div>
                  ))}
                  {manuscripts.length === 0 && <p className="text-xs text-slate-300 py-4 text-center">No data yet</p>}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Category Distribution</h3>
                  {(() => {
                    const catCounts: Record<string, number> = {};
                    manuscripts.forEach(m => { catCounts[m.category] = (catCounts[m.category] || 0) + 1; });
                    const sorted = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
                    const maxCount = sorted.length > 0 ? sorted[0][1] : 1;
                    return sorted.map(([cat, count]) => (
                      <div key={cat} className="py-3 border-b border-slate-50 last:border-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-slate-700">{cat}</span>
                          <span className="text-[9px] font-bold text-slate-400 font-mono">{count}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${(count / maxCount) * 100}%` }} />
                        </div>
                      </div>
                    ));
                  })()}
                  {manuscripts.length === 0 && <p className="text-xs text-slate-300 py-4 text-center">No data yet</p>}
                </div>
              </div>

              {/* Pending Review (Admin) */}
              {isAdmin && manuscripts.filter(m => m.status === 'under_review').length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <CircleDot className="w-4 h-4 text-amber-500" />Pending Faculty Contributions
                  </h3>
                  <div className="space-y-3">
                    {manuscripts.filter(m => m.status === 'under_review').map(m => (
                      <div key={m.id} className="flex items-center justify-between p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{m.title}</p>
                          <p className="text-[9px] text-slate-400 uppercase tracking-wider">by {m.author}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleApproveManuscript(m.id!)}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all">
                            Approve
                          </button>
                          <button onClick={() => manuscriptService.delete(m.id!).then(loadAllData)}
                            className="px-4 py-2 bg-rose-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all">
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════ SETTINGS TAB ═══════ */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Library Settings</h2>
                <p className="text-xs text-slate-400 mt-1">Configuration and access control for the theological library</p>
              </div>

              {/* Access Control Overview */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Access Control Levels</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {ACCESS_LEVELS.map(level => {
                    const count = manuscripts.filter(m => m.accessLevel === level.value).length;
                    return (
                      <div key={level.value} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                          {level.value === 'public' ? <Eye className="w-4 h-4 text-emerald-500" /> :
                           level.value === 'students' ? <GraduationCap className="w-4 h-4 text-blue-500" /> :
                           level.value === 'faculty' ? <BookMarked className="w-4 h-4 text-violet-500" /> :
                           <Shield className="w-4 h-4 text-rose-500" />}
                          <span className="text-xs font-bold text-slate-700">{level.label}</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{count}</p>
                        <p className="text-[8px] text-slate-400 mt-1">manuscripts at this level</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Faculty Contribution System */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-indigo-500" />Faculty Contribution System
                </h3>
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center"><Upload className="w-4 h-4 text-indigo-600" /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Faculty Upload Flow</p>
                      <p className="text-[10px] text-slate-400">Teacher submits → Admin reviews → Published to archive</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-11">
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-[8px] font-bold">{stats.underReview} pending review</span>
                    {isAdmin && stats.underReview > 0 && (
                      <button onClick={() => setActiveTab('analytics')} className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                        Review now →
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Citation Styles */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Copy className="w-4 h-4 text-indigo-500" />Supported Citation Styles
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {CITE_STYLES.map(style => (
                    <div key={style} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <p className="text-xs font-bold text-slate-700">{style}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* ═══════ ADD MANUSCRIPT MODAL ═══════ */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-lg relative z-10 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                      <LibraryIcon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 uppercase">Add Manuscript</h2>
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest">Step {formStep} of 3</p>
                    </div>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Progress Steps */}
                <div className="flex gap-2">
                  {[1, 2, 3].map(step => (
                    <div key={step} className={cn("flex-1 h-1 rounded-full transition-all", formStep >= step ? "bg-indigo-500" : "bg-slate-100")} />
                  ))}
                </div>
              </div>

              {/* Step 1: Basic Info */}
              {formStep === 1 && (
                <div className="p-6 space-y-5">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Manuscript Title *</label>
                    <input required type="text" value={newManuscript.title} onChange={e => setNewManuscript({ ...newManuscript, title: e.target.value })}
                      placeholder="Enter full title..." className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm font-medium placeholder:text-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Author *</label>
                    <input required type="text" value={newManuscript.author} onChange={e => setNewManuscript({ ...newManuscript, author: e.target.value })}
                      placeholder="Name of author or contributor" className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm font-bold uppercase tracking-wider placeholder:text-slate-200" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Type</label>
                      <select value={newManuscript.type} onChange={e => setNewManuscript({ ...newManuscript, type: e.target.value as Manuscript['type'] })}
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-xs font-bold uppercase tracking-wider cursor-pointer">
                        {MANUSCRIPT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Category</label>
                      <select value={newManuscript.category} onChange={e => setNewManuscript({ ...newManuscript, category: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-xs font-bold uppercase tracking-wider cursor-pointer">
                        {DEFAULT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all border border-slate-100">Discard</button>
                    <button onClick={() => setFormStep(2)} disabled={!newManuscript.title || !newManuscript.author}
                      className="flex-2 py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed">
                      Next <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Details */}
              {formStep === 2 && (
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Language</label>
                      <input type="text" value={newManuscript.language} onChange={e => setNewManuscript({ ...newManuscript, language: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-xs font-bold uppercase tracking-wider" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Publication Year</label>
                      <input type="number" value={newManuscript.publicationYear} onChange={e => setNewManuscript({ ...newManuscript, publicationYear: parseInt(e.target.value) || 2024 })}
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-xs font-bold font-mono" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">ISBN / Reference</label>
                    <input type="text" value={newManuscript.isbn} onChange={e => setNewManuscript({ ...newManuscript, isbn: e.target.value })}
                      placeholder="978-..." className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-xs font-mono placeholder:text-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Abstract / Summary</label>
                    <textarea value={newManuscript.abstract} onChange={e => setNewManuscript({ ...newManuscript, abstract: e.target.value })}
                      placeholder="Brief description of the manuscript..." rows={3}
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-xs font-medium placeholder:text-slate-200 resize-none" />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button onClick={() => setFormStep(1)} className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all border border-slate-100">Back</button>
                    <button onClick={() => setFormStep(3)} className="flex-2 py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all flex items-center justify-center gap-2">
                      Next <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Advanced */}
              {formStep === 3 && (
                <div className="p-6 space-y-5">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                      <Quote className="w-3 h-3 text-amber-500" />Scripture References
                    </label>
                    <input type="text" value={newManuscript.scriptureReferences} onChange={e => setNewManuscript({ ...newManuscript, scriptureReferences: e.target.value })}
                      placeholder="John 3:16, Romans 8:28, Genesis 1:1..." className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-xs font-medium placeholder:text-slate-200" />
                    <p className="text-[8px] text-slate-300 pl-1">Comma-separated Bible verse references</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-indigo-500" />Keywords / Tags
                    </label>
                    <input type="text" value={newManuscript.keywords} onChange={e => setNewManuscript({ ...newManuscript, keywords: e.target.value })}
                      placeholder="Grace, Salvation, Trinity, Eschatology..." className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-xs font-medium placeholder:text-slate-200" />
                    <p className="text-[8px] text-slate-300 pl-1">Comma-separated theological topics and keywords</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-violet-500" />Access Level
                    </label>
                    <select value={newManuscript.accessLevel} onChange={e => setNewManuscript({ ...newManuscript, accessLevel: e.target.value as Manuscript['accessLevel'] })}
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-xs font-bold uppercase tracking-wider cursor-pointer">
                      {ACCESS_LEVELS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[9px] text-slate-400 leading-relaxed">
                      {isFaculty ? 'Your manuscript will be published immediately as you have faculty/admin privileges.' :
                        'Your manuscript will be submitted for admin review before being published to the archive.'}
                    </p>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button onClick={() => setFormStep(2)} className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all border border-slate-100">Back</button>
                    <button onClick={handleAddManuscript} disabled={!newManuscript.title || !newManuscript.author}
                      className="flex-2 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed">
                      <Plus className="w-4 h-4" /> Submit Manuscript
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════ BORROWING LOGS MODAL ═══════ */}
      <AnimatePresence>
        {showBorrowModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBorrowModal(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-4xl p-6 relative z-10 shadow-2xl border border-slate-100 flex flex-col max-h-[80vh]">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 uppercase">Circulation Registry</h2>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Chronological archive of borrowing activities</p>
                </div>
                <button onClick={() => setShowBorrowModal(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
                  <ArrowRight className="w-4 h-4 rotate-45" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-white">
                    <tr className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="px-4 py-3">Manuscript</th>
                      <th className="px-4 py-3 text-center">Borrowed</th>
                      <th className="px-4 py-3 text-center">Due</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {borrowLogs.length === 0 ? (
                      <tr><td colSpan={5} className="py-10 text-center text-slate-300">No circulation records found</td></tr>
                    ) : borrowLogs.map(log => (
                      <tr key={log.id} className="text-sm">
                        <td className="px-4 py-4">
                          <p className="font-bold text-slate-900">{log.manuscriptTitle || 'Unknown'}</p>
                          <p className="text-[8px] font-mono text-slate-400 mt-0.5 uppercase">REF: {log.id?.slice(-8)}</p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-mono text-[10px] text-emerald-600">
                            {log.borrowDate ? new Date(log.borrowDate.seconds * 1000).toLocaleDateString() : 'Live'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={cn("font-mono text-[10px]",
                            log.status === 'overdue' ? "text-rose-500" : "text-slate-400")}>
                            {log.dueDate ? new Date(log.dueDate.seconds * 1000).toLocaleDateString() : 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={cn("px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest",
                            log.status === 'borrowed' ? "bg-amber-50 text-amber-600" :
                            log.status === 'overdue' ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                          )}>{log.status}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          {(log.status === 'borrowed' || log.status === 'overdue') && (
                            <button onClick={() => handleReturn(log.id!, log.manuscriptId)}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100">
                              Return
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════ CITATION MODAL ═══════ */}
      <AnimatePresence>
        {showCiteModal && selectedManuscript && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCiteModal(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 relative z-10 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900 uppercase flex items-center gap-2">
                  <Copy className="w-5 h-5 text-indigo-600" />Citation Generator
                </h2>
                <button onClick={() => setShowCiteModal(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100"><X className="w-4 h-4" /></button>
              </div>
              <p className="text-xs text-slate-400 mb-4">Select a citation style and copy for your research</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {CITE_STYLES.map(style => (
                  <button key={style} onClick={() => setCiteStyle(style)}
                    className={cn("px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border",
                      citeStyle === style ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-200 hover:border-indigo-200")}>
                    {style}
                  </button>
                ))}
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                <p className="text-sm text-slate-700 leading-relaxed italic">{generateCitation(selectedManuscript, citeStyle)}</p>
              </div>
              <button onClick={() => handleCopyCitation(generateCitation(selectedManuscript, citeStyle))}
                className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2">
                {copiedCite ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedCite ? 'Copied!' : 'Copy Citation'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════ MANUSCRIPT DETAIL MODAL ═══════ */}
      <AnimatePresence>
        {showDetailModal && selectedManuscript && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDetailModal(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-2xl p-6 relative z-10 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest px-2 py-0.5 bg-indigo-50 rounded-md">{selectedManuscript.category}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-50 rounded-md">{selectedManuscript.type.replace('_', ' ')}</span>
                    {selectedManuscript.accessLevel !== 'public' && (
                      <span className="text-[9px] font-black text-violet-500 uppercase tracking-widest px-2 py-0.5 bg-violet-50 rounded-md flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />{selectedManuscript.accessLevel}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">{selectedManuscript.title}</h2>
                  <p className="text-xs text-slate-500 mt-1">by <span className="font-bold text-slate-700">{selectedManuscript.author}</span></p>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 shrink-0 ml-4">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Language</span>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">{selectedManuscript.language || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Year</span>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">{selectedManuscript.publicationYear || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">ISBN</span>
                  <p className="text-xs font-bold text-slate-700 mt-0.5 font-mono">{selectedManuscript.isbn || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Views</span>
                  <p className="text-xs font-bold text-slate-700 mt-0.5 flex items-center gap-1"><Eye className="w-3 h-3 text-indigo-500" />{(selectedManuscript.viewCount || 0)}</p>
                </div>
              </div>

              {/* Abstract */}
              {selectedManuscript.abstract && (
                <div className="mb-6">
                  <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Abstract</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedManuscript.abstract}</p>
                </div>
              )}

              {/* Scripture References */}
              {selectedManuscript.scriptureReferences && selectedManuscript.scriptureReferences.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Quote className="w-3 h-3 text-amber-500" />Scripture References
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedManuscript.scriptureReferences.map(ref => (
                      <span key={ref} className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-bold flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />{ref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords */}
              {selectedManuscript.keywords && selectedManuscript.keywords.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-indigo-500" />Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedManuscript.keywords.map(kw => (
                      <span key={kw} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold">{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-100">
                {(selectedManuscript.status === 'available' || selectedManuscript.status === 'published') && (
                  <button onClick={() => { handleBorrow(selectedManuscript.id!, selectedManuscript.title); setShowDetailModal(false); }}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2">
                    <BookMarked className="w-4 h-4" /> Borrow
                  </button>
                )}
                <button onClick={() => handleBookmark(selectedManuscript.id!, selectedManuscript.title)}
                  className={cn("px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border transition-all",
                    bookmarks.some(b => b.manuscriptId === selectedManuscript.id)
                      ? "bg-amber-50 text-amber-600 border-amber-200"
                      : "bg-white text-slate-500 border-slate-200 hover:border-amber-200 hover:text-amber-600")}>
                  <Star className={cn("w-4 h-4", bookmarks.some(b => b.manuscriptId === selectedManuscript.id) && "fill-amber-400")} />
                  {bookmarks.some(b => b.manuscriptId === selectedManuscript.id) ? 'Bookmarked' : 'Bookmark'}
                </button>
                <button onClick={() => { setShowCiteModal(true); }}
                  className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center gap-2">
                  <Copy className="w-4 h-4" /> Cite
                </button>
                <button onClick={() => { setShowDetailModal(false); setSelectedManuscript(selectedManuscript); handleAddNote(); }}
                  className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center gap-2">
                  <PenLine className="w-4 h-4" /> Add Note
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════ ADD CATEGORY MODAL ═══════ */}
      <AnimatePresence>
        {showAddCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddCategory(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 relative z-10 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900 uppercase">Add Category</h2>
                <button onClick={() => setShowAddCategory(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Category Name *</label>
                  <input type="text" value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="e.g., Hermeneutics" className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm font-bold uppercase tracking-wider placeholder:text-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Description</label>
                  <textarea value={newCategory.description} onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Brief description of this category..." rows={2}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-xs font-medium placeholder:text-slate-200 resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowAddCategory(false)} className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all border border-slate-100">Cancel</button>
                  <button onClick={handleAddCategory} disabled={!newCategory.name}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all disabled:opacity-30">Add</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════ ADD AUTHOR MODAL ═══════ */}
      <AnimatePresence>
        {showAddAuthor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddAuthor(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 relative z-10 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900 uppercase">Add Author</h2>
                <button onClick={() => setShowAddAuthor(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name *</label>
                  <input type="text" value={newAuthor.name} onChange={e => setNewAuthor({ ...newAuthor, name: e.target.value })}
                    placeholder="Dr. John Calvin" className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm font-bold placeholder:text-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Affiliation</label>
                  <input type="text" value={newAuthor.affiliation} onChange={e => setNewAuthor({ ...newAuthor, affiliation: e.target.value })}
                    placeholder="Geneva Seminary" className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-xs font-bold uppercase tracking-wider placeholder:text-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Expertise (comma-separated)</label>
                  <input type="text" value={newAuthor.expertise} onChange={e => setNewAuthor({ ...newAuthor, expertise: e.target.value })}
                    placeholder="Systematic Theology, Soteriology, Christology" className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-xs font-medium placeholder:text-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Bio</label>
                  <textarea value={newAuthor.bio} onChange={e => setNewAuthor({ ...newAuthor, bio: e.target.value })}
                    placeholder="Brief author biography..." rows={2}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-xs font-medium placeholder:text-slate-200 resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowAddAuthor(false)} className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all border border-slate-100">Cancel</button>
                  <button onClick={handleAddAuthor} disabled={!newAuthor.name}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all disabled:opacity-30">Add</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
