import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, Search, Plus, History, Star, Users,
  Lock, Eye, BarChart3, ChevronRight,
  Filter, SortAsc, X, BookMarked, Upload, Clock, AlertTriangle,
  CheckCircle2, Shield, Quote, Tag, Bell, ArrowRight,
  Library as LibraryIcon, PenLine, FolderOpen, Copy, Layers,
  FileCheck, TrendingUp, Sparkles, Globe, BookCopy, Cross
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import {
  manuscriptService, libraryCategoryService, libraryAuthorService,
  libraryBorrowService, libraryBookmarkService, libraryNoteService,
  Manuscript, LibraryCategory, LibraryAuthor, LibraryBorrowLog, LibraryBookmark, LibraryNote,
} from '../services/dataService';
import { useAuthStore } from '../store/useStore';

const DEFAULT_CATEGORIES = [
  'Systematic Theology', 'Biblical Exegesis', 'Church History',
  'Pastoral Ministry', 'Missiology', 'Apologetics',
  'Christian Ethics', 'Sermon Archives', 'Greek & Hebrew',
];

const TYPES: { value: Manuscript['type']; label: string }[] = [
  { value: 'book', label: 'Book' }, { value: 'research_paper', label: 'Paper' },
  { value: 'sermon', label: 'Sermon' }, { value: 'commentary', label: 'Commentary' },
  { value: 'thesis', label: 'Thesis' }, { value: 'journal', label: 'Journal' },
  { value: 'manuscript', label: 'Manuscript' },
];

const ACCESS: { value: Manuscript['accessLevel']; label: string }[] = [
  { value: 'public', label: 'Public' }, { value: 'students', label: 'Students' },
  { value: 'faculty', label: 'Faculty' }, { value: 'admin', label: 'Admin' },
];

const SORTS = [
  { value: 'recent', label: 'Recent' }, { value: 'popular', label: 'Most Read' },
  { value: 'referenced', label: 'Most Cited' }, { value: 'title_asc', label: 'A-Z' },
  { value: 'year_new', label: 'Newest' }, { value: 'year_old', label: 'Oldest' },
];

const CITE_STYLES = ['APA 7th', 'MLA 9th', 'Chicago', 'Turabian', 'SBL'];

const TABS = [
  { id: 'catalog', label: 'Catalog', icon: BookOpen, gradient: 'from-blue-500 to-cyan-400' },
  { id: 'categories', label: 'Categories', icon: Layers, gradient: 'from-violet-500 to-purple-400' },
  { id: 'authors', label: 'Authors', icon: Users, gradient: 'from-fuchsia-500 to-pink-400' },
  { id: 'borrowing', label: 'Circulation', icon: History, gradient: 'from-amber-500 to-orange-400' },
  { id: 'bookmarks', label: 'Bookmarks', icon: Star, gradient: 'from-yellow-500 to-amber-400' },
  { id: 'notes', label: 'Notes', icon: PenLine, gradient: 'from-emerald-500 to-teal-400' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, gradient: 'from-rose-500 to-red-400' },
  { id: 'settings', label: 'Settings', icon: Shield, gradient: 'from-slate-500 to-gray-400' },
];

const CAT_COLORS = [
  'from-blue-500 to-indigo-500', 'from-emerald-500 to-teal-500', 'from-violet-500 to-purple-500',
  'from-amber-500 to-orange-500', 'from-rose-500 to-pink-500', 'from-cyan-500 to-sky-500',
  'from-fuchsia-500 to-pink-500', 'from-lime-500 to-green-500', 'from-orange-500 to-red-500',
];

const STAT_GRADIENTS = [
  'from-blue-600 to-cyan-500', 'from-emerald-600 to-teal-500', 'from-amber-500 to-orange-500',
  'from-violet-600 to-purple-500', 'from-rose-600 to-pink-500', 'from-indigo-600 to-blue-500',
];

function genCite(m: Manuscript, style: string): string {
  const a = m.author || 'Unknown', t = m.title || 'Untitled', y = m.publicationYear || new Date().getFullYear(), c = m.category || '';
  const templates: Record<string, string> = {
    'APA 7th': `${a} (${y}). ${t}. ${c}.`,
    'MLA 9th': `${a}. "${t}." ${y}.`,
    'Chicago': `${a}. ${t}. ${c}, ${y}.`,
    'Turabian': `${a}. ${t}. ${c}: ${y}.`,
    'SBL': `${a}. ${t}. ${c}: ${y}.`,
  };
  return templates[style] || `${a}, ${t} (${y})`;
}

const TYPE_GRADIENT: Record<string, string> = {
  book: 'from-blue-500 to-indigo-600', sermon: 'from-amber-500 to-orange-600',
  research_paper: 'from-emerald-500 to-teal-600', thesis: 'from-violet-500 to-purple-600',
  commentary: 'from-cyan-500 to-sky-600', journal: 'from-rose-500 to-pink-600',
  manuscript: 'from-slate-400 to-gray-600',
};

const STATUS_COLOR: Record<string, string> = {
  available: 'bg-emerald-400 shadow-emerald-400/50', published: 'bg-emerald-400 shadow-emerald-400/50',
  borrowed: 'bg-amber-400 shadow-amber-400/50', under_review: 'bg-blue-400 shadow-blue-400/50',
  reserved: 'bg-violet-400 shadow-violet-400/50', draft: 'bg-slate-300 shadow-slate-300/50',
  overdue: 'bg-red-400 shadow-red-400/50', returned: 'bg-emerald-400 shadow-emerald-400/50',
};

export function Library() {
  const { user } = useAuthStore();
  const tid = user?.tenantId || '';
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isFaculty = user?.role === 'faculty' || isAdmin;

  const [tab, setTab] = useState('catalog');
  const [ms, setMs] = useState<Manuscript[]>([]);
  const [cats, setCats] = useState<LibraryCategory[]>([]);
  const [authors, setAuthors] = useState<LibraryAuthor[]>([]);
  const [logs, setLogs] = useState<LibraryBorrowLog[]>([]);
  const [bms, setBms] = useState<LibraryBookmark[]>([]);
  const [nts, setNts] = useState<LibraryNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [fCat, setFCat] = useState('all');
  const [fType, setFType] = useState('all');
  const [fAccess, setFAccess] = useState('all');
  const [sort, setSort] = useState('recent');
  const [showF, setShowF] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showBorrow, setShowBorrow] = useState(false);
  const [showCite, setShowCite] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [sel, setSel] = useState<Manuscript | null>(null);
  const [citeStyle, setCiteStyle] = useState('APA 7th');
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(1);
  const [fm, setFm] = useState({
    title: '', author: '', category: 'Systematic Theology', type: 'book' as Manuscript['type'],
    language: 'English', publicationYear: new Date().getFullYear(), isbn: '',
    abstract: '', refs: '', keywords: '', accessLevel: 'public' as Manuscript['accessLevel'],
  });
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', desc: '' });
  const [showAddAuth, setShowAddAuth] = useState(false);
  const [newAuth, setNewAuth] = useState({ name: '', bio: '', expertise: '', affiliation: '' });
  const [notifs, setNotifs] = useState<{ id: string; msg: string; type: string }[]>([]);

  useEffect(() => { if (tid) load(); }, [tid]);

  const load = async () => {
    setLoading(true);
    try {
      const [m, c, a, l, b, n] = await Promise.all([
        manuscriptService.getByTenant(tid).catch(() => []),
        libraryCategoryService.getByTenant(tid).catch(() => []),
        libraryAuthorService.getByTenant(tid).catch(() => []),
        libraryBorrowService.getByTenant(tid).catch(() => []),
        user?.uid ? libraryBookmarkService.getByUser(tid, user.uid).catch(() => []) : Promise.resolve([]),
        user?.uid ? libraryNoteService.getByUser(tid, user.uid).catch(() => []) : Promise.resolve([]),
      ]);
      setMs(m); setCats(c); setAuthors(a); setLogs(l); setBms(b); setNts(n);
      checkOverdue(l);
    } finally { setLoading(false); }
  };

  const checkOverdue = (l: LibraryBorrowLog[]) => {
    const now = new Date(), w: typeof notifs = [];
    l.forEach(x => {
      if (x.status === 'borrowed' && x.dueDate) {
        const d = Math.ceil((now.getTime() - new Date(x.dueDate.seconds * 1000).getTime()) / 864e5);
        if (d > 0) { w.push({ id: x.id || '', msg: `"${x.manuscriptTitle}" \u2014 ${d}d overdue`, type: 'warning' }); libraryBorrowService.markOverdue(x.id!); }
        else if (d >= -2) w.push({ id: x.id || '', msg: `"${x.manuscriptTitle}" due ${Math.abs(d)}d`, type: 'info' });
      }
    });
    if (w.length) setNotifs(w);
  };

  const filtered = useMemo(() => {
    let r = [...ms];
    if (q) { const t = q.toLowerCase(); r = r.filter(m => m.title.toLowerCase().includes(t) || m.author.toLowerCase().includes(t) || m.isbn?.toLowerCase().includes(t) || m.abstract?.toLowerCase().includes(t) || m.keywords?.some(k => k.toLowerCase().includes(t)) || m.scriptureReferences?.some(s => s.toLowerCase().includes(t))); }
    if (fCat !== 'all') r = r.filter(m => m.category === fCat);
    if (fType !== 'all') r = r.filter(m => m.type === fType);
    if (fAccess !== 'all') r = r.filter(m => m.accessLevel === fAccess);
    switch (sort) {
      case 'popular': r.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)); break;
      case 'referenced': r.sort((a, b) => (b.referenceCount || 0) - (a.referenceCount || 0)); break;
      case 'title_asc': r.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'year_new': r.sort((a, b) => (b.publicationYear || 0) - (a.publicationYear || 0)); break;
      case 'year_old': r.sort((a, b) => (a.publicationYear || 0) - (b.publicationYear || 0)); break;
    }
    return r;
  }, [ms, q, fCat, fType, fAccess, sort]);

  const st = useMemo(() => ({
    total: ms.length, avail: ms.filter(m => m.status === 'available' || m.status === 'published').length,
    borrowed: ms.filter(m => m.status === 'borrowed').length, review: ms.filter(m => m.status === 'under_review').length,
    views: ms.reduce((s, m) => s + (m.viewCount || 0), 0), authors: new Set(ms.map(m => m.author)).size,
    activeB: logs.filter(l => l.status === 'borrowed').length, overdueB: logs.filter(l => l.status === 'overdue').length,
    bk: bms.length, notes: nts.length, catCount: cats.length > 0 ? cats.length : DEFAULT_CATEGORIES.length,
  }), [ms, logs, bms, nts, cats]);

  const activeCats = cats.length > 0 ? cats : DEFAULT_CATEGORIES.map((c, i) => ({ id: `d${i}`, name: c, description: '', icon: '', sortOrder: i, isActive: true, tenantId: '' }));

  const addMs = async () => {
    if (!tid) return;
    await manuscriptService.addManuscript({ ...fm, tenantId: tid, status: isFaculty ? 'published' : 'under_review', contributedBy: user?.uid, scriptureReferences: fm.refs.split(',').map(s => s.trim()).filter(Boolean), keywords: fm.keywords.split(',').map(k => k.trim()).filter(Boolean) });
    setShowAdd(false); setStep(1); setFm({ title: '', author: '', category: 'Systematic Theology', type: 'book', language: 'English', publicationYear: new Date().getFullYear(), isbn: '', abstract: '', refs: '', keywords: '', accessLevel: 'public' }); load();
  };
  const borrow = async (id: string, title: string) => {
    if (!tid || !user?.uid) return;
    const due = new Date(); due.setDate(due.getDate() + 14);
    await libraryBorrowService.borrowManuscript({ manuscriptId: id, manuscriptTitle: title, userId: user.uid, userName: user.email, dueDate: due, tenantId: tid }); setShowBorrow(false); load();
  };
  const ret = async (bId: string, mId: string) => { await libraryBorrowService.returnManuscript(bId, mId); load(); };
  const toggleBk = async (id: string, title: string) => {
    if (!tid || !user?.uid) return;
    const ex = bms.find(b => b.manuscriptId === id);
    if (ex?.id) await libraryBookmarkService.delete(ex.id);
    else await libraryBookmarkService.addBookmark({ userId: user.uid, manuscriptId: id, manuscriptTitle: title, tenantId: tid });
    load();
  };
  const approve = async (id: string) => { await manuscriptService.update(id, { status: 'published', approvedBy: user?.uid }); load(); };
  const addCat = async () => { if (!tid || !newCat.name) return; await libraryCategoryService.addCategory({ ...newCat, description: newCat.desc, sortOrder: cats.length, isActive: true, tenantId: tid }); setShowAddCat(false); setNewCat({ name: '', desc: '' }); load(); };
  const addAuth = async () => { if (!tid || !newAuth.name) return; await libraryAuthorService.addAuthor({ ...newAuth, expertise: newAuth.expertise.split(',').map(e => e.trim()).filter(Boolean), tenantId: tid }); setShowAddAuth(false); setNewAuth({ name: '', bio: '', expertise: '', affiliation: '' }); load(); };
  const copy = (t: string) => { navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const openDet = (m: Manuscript) => { manuscriptService.incrementViews(m.id!); setSel(m); setShowDetail(true); };

  // ─── Shared UI Components ─────────────────────────────────────────────
  const Pill = ({ children, color = 'slate' }: { children: React.ReactNode; color?: string }) => (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold leading-none",
      color === 'indigo' && 'bg-indigo-100 text-indigo-700',
      color === 'amber' && 'bg-amber-100 text-amber-700',
      color === 'emerald' && 'bg-emerald-100 text-emerald-700',
      color === 'slate' && 'bg-slate-100 text-slate-500',
      color === 'rose' && 'bg-rose-100 text-rose-700',
      color === 'blue' && 'bg-blue-100 text-blue-700',
      color === 'violet' && 'bg-violet-100 text-violet-700',
      color === 'cyan' && 'bg-cyan-100 text-cyan-700',
      color === 'fuchsia' && 'bg-fuchsia-100 text-fuchsia-700',
    )}>{children}</span>
  );

  const Empty = ({ icon: Icon, msg, sub }: { icon: React.ElementType; msg: string; sub?: string }) => (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 p-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-slate-300" />
      </div>
      <p className="text-sm font-bold text-slate-500">{msg}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );

  const ModalShell = ({ show, onClose, title, wide, children }: { show: boolean; onClose: () => void; title: string; wide?: boolean; children: React.ReactNode }) => (
    <AnimatePresence>{show && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={cn("bg-white rounded-2xl relative z-10 shadow-2xl max-h-[85vh] overflow-y-auto", wide ? "w-full max-w-3xl p-6" : "w-full max-w-md p-6")}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">{title}</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-100 hover:text-rose-500 transition-all"><X className="w-4 h-4" /></button>
          </div>
          {children}
        </motion.div>
      </div>
    )}</AnimatePresence>
  );

  const Input = ({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) => (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-semibold text-slate-500">{label}</label>}
      <input {...props} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all outline-none text-sm placeholder:text-slate-400" />
    </div>
  );

  return (
    <div className="space-y-5">

      {/* ═══ HERO HEADER ═══ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-900 via-indigo-900 to-blue-900 p-6 md:p-8">
        {/* Animated background orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-fuchsia-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-cyan-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-2xl" />
        {/* Cross pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <LibraryIcon className="w-4 h-4 text-amber-300" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200">Theological Repository</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Library <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-transparent">Portal</span>
            </h1>
            <p className="text-sm text-indigo-200/80 mt-1.5 max-w-md">Sacred knowledge, organized. Search, cite, and manage theological works across every discipline.</p>
          </div>
          <div className="flex items-center gap-2">
            {notifs.length > 0 && (
              <button className="relative w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 text-white hover:bg-white/20 transition-all">
                <Bell className="w-4 h-4 mx-auto" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-rose-500 to-orange-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center shadow-lg">{notifs.length}</span>
              </button>
            )}
            <button onClick={() => setShowBorrow(true)} className="px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl text-xs font-semibold text-white hover:bg-white/20 transition-all flex items-center gap-1.5">
              <History className="w-4 h-4" />Circulation
            </button>
            <button onClick={() => { setStep(1); setShowAdd(true); }} className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl text-xs font-bold text-slate-900 hover:from-amber-300 hover:to-orange-400 transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/25">
              <Plus className="w-4 h-4" />Add Manuscript
            </button>
          </div>
        </div>
      </div>

      {/* ═══ STATS BAR ═══ */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
        {[
          { l: 'Works', v: st.total, g: STAT_GRADIENTS[0], icon: BookCopy },
          { l: 'Available', v: st.avail, g: STAT_GRADIENTS[1], icon: CheckCircle2 },
          { l: 'On Loan', v: st.borrowed, g: STAT_GRADIENTS[2], icon: Clock },
          { l: 'Authors', v: st.authors, g: STAT_GRADIENTS[3], icon: Users },
          { l: 'Views', v: st.views, g: STAT_GRADIENTS[4], icon: Eye },
          { l: 'Categories', v: st.catCount, g: STAT_GRADIENTS[5], icon: Layers },
        ].map((s, i) => (
          <motion.div key={s.l} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="relative overflow-hidden rounded-xl p-3 group cursor-default">
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity", s.g)} />
            <div className={cn("absolute inset-0 border border-slate-200 rounded-xl", `hover:border-transparent transition-colors`)} />
            <s.icon className={cn("w-4 h-4 mb-1.5 bg-gradient-to-br bg-clip-text", s.g)} style={{ color: 'transparent', backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
            <span className="text-xs font-semibold text-slate-400 block">{s.l}</span>
            <span className="text-xl font-black text-slate-800">{s.v}</span>
          </motion.div>
        ))}
      </div>

      {/* ═══ TABS ═══ */}
      <div className="flex gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl overflow-x-auto">
        {TABS.map(t => {
          const isActive = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                isActive
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50")}>
              {isActive && <div className={cn("absolute inset-0 rounded-xl bg-gradient-to-r opacity-10", t.gradient)} />}
              <t.icon className={cn("w-4 h-4 relative z-10", isActive && "text-indigo-600")} />
              <span className="relative z-10">{t.label}</span>
              {t.id === 'bookmarks' && bms.length > 0 && (
                <span className="relative z-10 min-w-[18px] h-[18px] bg-gradient-to-r from-amber-400 to-orange-400 rounded-full text-[9px] text-white font-bold flex items-center justify-center px-1">{bms.length}</span>
              )}
              {t.id === 'borrowing' && st.activeB > 0 && (
                <span className="relative z-10 min-w-[18px] h-[18px] bg-gradient-to-r from-rose-400 to-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center px-1">{st.activeB}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══ CONTENT ═══ */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

          {/* ═══ CATALOG ═══ */}
          {tab === 'catalog' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
              {/* Sidebar */}
              <div className="space-y-3">
                <div className="bg-white rounded-2xl border border-slate-100 p-3 space-y-1 shadow-sm">
                  <div className="flex items-center gap-2 px-1 pb-2 mb-1 border-b border-slate-100">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Categories</span>
                  </div>
                  <button onClick={() => setFCat('all')}
                    className={cn("w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between",
                      fCat === 'all' ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-200" : "text-slate-600 hover:bg-slate-50")}>
                    <span>All Works</span>
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md", fCat === 'all' ? "bg-white/20" : "bg-slate-100 text-slate-400")}>{ms.length}</span>
                  </button>
                  {activeCats.filter(c => c.isActive).map((c, idx) => (
                    <button key={c.id} onClick={() => setFCat(c.name)}
                      className={cn("w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between group",
                        fCat === c.name ? "bg-gradient-to-r text-white shadow-md" : "text-slate-600 hover:bg-slate-50")}>
                      <span className="truncate flex items-center gap-2">
                        <span className={cn("w-2 h-2 rounded-full shrink-0", fCat === c.name ? "bg-white/50" : `bg-gradient-to-br ${CAT_COLORS[idx % CAT_COLORS.length]}`)} />
                        {c.name}
                      </span>
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md", fCat === c.name ? "bg-white/20" : "bg-slate-100 text-slate-400")}>{ms.filter(m => m.category === c.name).length}</span>
                    </button>
                  ))}
                </div>
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-5 text-white group cursor-default">
                  <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  <div className="absolute -left-4 -top-4 w-24 h-24 bg-fuchsia-500/20 rounded-full blur-2xl" />
                  <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3">
                      <Sparkles className="w-5 h-5 text-amber-300" />
                    </div>
                    <p className="font-bold text-sm leading-tight">Digital Archives</p>
                    <p className="text-xs text-indigo-100/70 mt-1.5 leading-relaxed">Secure zero-trust portal with cryptographic provenance and automated citation.</p>
                  </div>
                </div>
              </div>

              {/* Main */}
              <div className="lg:col-span-3 space-y-3">
                {/* Search + Filters */}
                <div className="flex gap-2">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input type="text" placeholder="Search title, author, scripture, topic..."
                      value={q} onChange={e => setQ(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none shadow-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all text-sm placeholder:text-slate-400" />
                  </div>
                  <button onClick={() => setShowF(!showF)} className={cn("px-3.5 py-3 bg-white border rounded-xl transition-all flex items-center gap-1.5 shadow-sm",
                    showF ? "border-indigo-300 text-indigo-600 bg-indigo-50" : "border-slate-200 text-slate-400 hover:text-slate-600")}>
                    <Filter className="w-4 h-4" />
                  </button>
                  <div className="relative">
                    <SortAsc className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select value={sort} onChange={e => setSort(e.target.value)}
                      className="pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none shadow-sm text-xs font-semibold cursor-pointer appearance-none hover:border-slate-300">
                      {SORTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                <AnimatePresence>
                  {showF && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm flex flex-wrap items-end gap-4">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block mb-1">Type</label>
                          <select value={fType} onChange={e => setFType(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer">
                            <option value="all">All</option>{TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block mb-1">Access</label>
                          <select value={fAccess} onChange={e => setFAccess(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer">
                            <option value="all">All</option>{ACCESS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                          </select>
                        </div>
                        {(q || fCat !== 'all' || fType !== 'all' || fAccess !== 'all') && (
                          <button onClick={() => { setQ(''); setFCat('all'); setFType('all'); setFAccess('all'); }}
                            className="px-3 py-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-rose-100">
                            <X className="w-3 h-3" />Clear
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Notifications */}
                {notifs.length > 0 && (
                  <div className="space-y-2">{notifs.map(n => (
                    <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      className={cn("flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold border",
                        n.type === 'warning' ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-800" : "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-800")}>
                      {n.type === 'warning' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <Bell className="w-4 h-4 shrink-0" />}{n.msg}
                    </motion.div>
                  ))}</div>
                )}

                {/* Grid */}
                {loading ? (
                  <div className="flex items-center justify-center py-16 gap-3">
                    <div className="w-10 h-10 border-[3px] border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Syncing...</span>
                  </div>
                ) : filtered.length === 0 ? (
                  <Empty icon={BookOpen} msg={q ? 'No manuscripts match your search' : 'No manuscripts archived yet'} sub={q ? 'Try adjusting your filters' : 'Add your first manuscript to begin'} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filtered.map((m, i) => {
                      const bk = bms.some(b => b.manuscriptId === m.id);
                      const typeGrad = TYPE_GRADIENT[m.type] || 'from-slate-400 to-gray-500';
                      return (
                        <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                          className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl transition-all group flex gap-4">
                          {/* Cover */}
                          <div className={cn("w-[52px] h-[68px] rounded-xl shrink-0 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer shadow-inner group-hover:shadow-lg transition-shadow",
                            "bg-gradient-to-br", typeGrad)} onClick={() => openDet(m)}>
                            <div className="absolute inset-0 bg-white/5" />
                            <BookOpen className="w-5 h-5 text-white/80 group-hover:scale-110 transition-transform relative z-10" />
                            <span className="text-[7px] font-bold uppercase text-white/60 mt-0.5 tracking-wider relative z-10">{m.type.replace('_', ' ')}</span>
                          </div>

                          {/* Info */}
                          <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <Pill color="indigo">{m.category}</Pill>
                                {m.accessLevel !== 'public' && <Lock className="w-3 h-3 text-slate-400" />}
                                <div className={cn("w-2 h-2 rounded-full ml-auto shadow-sm", STATUS_COLOR[m.status] || 'bg-slate-300')} />
                              </div>
                              <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors cursor-pointer line-clamp-1"
                                onClick={() => openDet(m)}>{m.title}</h4>
                              <p className="text-[11px] font-medium text-slate-400 mt-0.5">{m.author}</p>
                              {m.abstract && <p className="text-xs text-slate-400 mt-1.5 line-clamp-1">{m.abstract}</p>}
                              {m.scriptureReferences && m.scriptureReferences.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {m.scriptureReferences.slice(0, 3).map(r => (
                                    <span key={r} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-semibold flex items-center gap-1 border border-amber-100">
                                      <Cross className="w-2.5 h-2.5" />{r}
                                    </span>
                                  ))}
                                  {m.scriptureReferences.length > 3 && <span className="text-[10px] text-slate-400 font-semibold px-1">+{m.scriptureReferences.length - 3}</span>}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                              <div className="flex items-center gap-2.5 text-[11px] text-slate-400">
                                {m.publicationYear && <span className="font-medium">{m.publicationYear}</span>}
                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{m.viewCount || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button onClick={() => toggleBk(m.id!, m.title)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-amber-50 transition-colors">
                                  <Star className={cn("w-4 h-4 transition-colors", bk ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-300")} />
                                </button>
                                <button onClick={() => { setSel(m); setShowCite(true); }} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors">
                                  <Copy className="w-3.5 h-3.5 text-slate-300" />
                                </button>
                                {(m.status === 'available' || m.status === 'published') && (
                                  <button onClick={() => borrow(m.id!, m.title)}
                                    className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:from-indigo-600 hover:to-violet-600 transition-all shadow-sm shadow-indigo-200">
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

          {/* ═══ CATEGORIES ═══ */}
          {tab === 'categories' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Categories</h2>
                {isAdmin && <button onClick={() => setShowAddCat(true)} className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-200"><Plus className="w-4 h-4" />Add</button>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeCats.filter(c => c.isActive).map((c, idx) => {
                  const cnt = ms.filter(m => m.category === c.name).length;
                  const grad = CAT_COLORS[idx % CAT_COLORS.length];
                  return (
                    <motion.div key={c.id} whileHover={{ y: -2 }}
                      className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all group cursor-pointer shadow-sm hover:shadow-lg"
                      onClick={() => { setTab('catalog'); setFCat(c.name); }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm", grad)}>
                          <Layers className="w-5 h-5 text-white" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">{c.name}</p>
                      {c.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{c.description}</p>}
                      <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">{cnt} works</span>
                        <span className="text-xs font-semibold text-indigo-500 group-hover:text-indigo-600 transition-colors">Browse &rarr;</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ AUTHORS ═══ */}
          {tab === 'authors' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Authors</h2>
                <button onClick={() => setShowAddAuth(true)} className="px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-fuchsia-200"><Plus className="w-4 h-4" />Add</button>
              </div>
              {authors.length === 0 ? <Empty icon={Users} msg="No authors yet" sub="Tracked automatically from manuscript entries" /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {authors.map((a, idx) => {
                    const wc = ms.filter(m => m.author === a.name).length;
                    const grad = CAT_COLORS[idx % CAT_COLORS.length];
                    return (
                      <motion.div key={a.id} whileHover={{ y: -2 }}
                        className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all shadow-sm hover:shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm shadow-sm", grad)}>
                            {a.name[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{a.name}</p>
                            {a.affiliation && <p className="text-[10px] text-slate-400 uppercase tracking-wider truncate font-medium">{a.affiliation}</p>}
                          </div>
                        </div>
                        {a.expertise && a.expertise.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {a.expertise.map(e => <span key={e} className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded-full text-[10px] font-semibold border border-slate-100">{e}</span>)}
                          </div>
                        )}
                        <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                          <span className="text-xs font-semibold text-indigo-600">{wc} work(s)</span>
                          <Globe className="w-4 h-4 text-slate-300" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══ BORROWING ═══ */}
          {tab === 'borrowing' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Circulation Registry</h2>
                <div className="flex items-center gap-2">
                  {st.overdueB > 0 && <span className="px-3 py-1.5 bg-gradient-to-r from-rose-100 to-red-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" />{st.overdueB} overdue</span>}
                  <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200">{st.activeB} active</span>
                </div>
              </div>
              {logs.length === 0 ? <Empty icon={History} msg="No borrowing activity" sub="Borrow a manuscript from the catalog" /> : (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                          <th className="px-5 py-3">Manuscript</th>
                          <th className="px-5 py-3 text-center">Borrowed</th>
                          <th className="px-5 py-3 text-center">Due</th>
                          <th className="px-5 py-3 text-center">Status</th>
                          <th className="px-5 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {logs.map(l => (
                          <tr key={l.id} className="text-sm hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3.5">
                              <p className="font-semibold text-slate-900 truncate max-w-[200px]">{l.manuscriptTitle || 'Unknown'}</p>
                              <p className="text-[10px] font-mono text-slate-400">REF: {l.id?.slice(-8)}</p>
                            </td>
                            <td className="px-5 py-3.5 text-center font-mono text-xs text-emerald-600 font-medium">{l.borrowDate ? new Date(l.borrowDate.seconds * 1000).toLocaleDateString() : '\u2014'}</td>
                            <td className="px-5 py-3.5 text-center font-mono text-xs text-slate-500 font-medium">{l.dueDate ? new Date(l.dueDate.seconds * 1000).toLocaleDateString() : '\u2014'}</td>
                            <td className="px-5 py-3.5 text-center">
                              <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                                l.status === 'overdue' && "bg-rose-100 text-rose-700",
                                l.status === 'borrowed' && "bg-amber-100 text-amber-700",
                                l.status === 'returned' && "bg-emerald-100 text-emerald-700"
                              )}>{l.status.replace('_', ' ')}</span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              {(l.status === 'borrowed' || l.status === 'overdue') ? (
                                <button onClick={() => ret(l.id!, l.manuscriptId)} className="px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:from-indigo-600 hover:to-violet-600 transition-all shadow-sm">Return</button>
                              ) : <CheckCircle2 className="w-5 h-5 text-emerald-300 mx-auto" />}
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

          {/* ═══ BOOKMARKS ═══ */}
          {tab === 'bookmarks' && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-slate-900">My Bookmarks</h2>
              {bms.length === 0 ? <Empty icon={Star} msg="No bookmarks yet" sub="Star any manuscript to save it here" /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {bms.map(b => (
                    <motion.div key={b.id} whileHover={{ y: -2 }}
                      className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-amber-200 transition-all group shadow-sm hover:shadow-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"><Star className="w-3 h-3 text-white fill-white" /></div>
                          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Saved</span>
                        </div>
                        <button onClick={() => libraryBookmarkService.delete(b.id!).then(load)} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                      </div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer truncate"
                        onClick={() => { const m = ms.find(x => x.id === b.manuscriptId); if (m) openDet(m); }}>{b.manuscriptTitle || 'Untitled'}</p>
                      {b.collectionName && <Pill color="amber"><FolderOpen className="w-2.5 h-2.5 inline mr-0.5" />{b.collectionName}</Pill>}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ NOTES ═══ */}
          {tab === 'notes' && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-slate-900">Research Notes</h2>
              {nts.length === 0 ? <Empty icon={PenLine} msg="No notes yet" sub="Open a manuscript detail to add annotations" /> : (
                <div className="space-y-3">
                  {nts.map(n => (
                    <div key={n.id} className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all shadow-sm hover:shadow-md">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{n.manuscriptTitle || 'Untitled'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {n.chapter && <Pill color="cyan">Ch: {n.chapter}</Pill>}
                            {n.pageNumber && <span className="text-xs font-mono text-slate-400">p.{n.pageNumber}</span>}
                            <span className="text-xs text-slate-300 font-mono">{n.createdAt ? new Date(n.createdAt.seconds * 1000).toLocaleDateString() : ''}</span>
                          </div>
                        </div>
                        <button onClick={() => libraryNoteService.delete(n.id!).then(load)} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                      </div>
                      {n.highlightText && <div className="mt-3 px-4 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border-l-[3px] border-amber-400 rounded-r-xl"><p className="text-xs text-amber-800 italic">"{n.highlightText}"</p></div>}
                      {n.content && <p className="text-xs text-slate-500 mt-3 leading-relaxed">{n.content}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ ANALYTICS ═══ */}
          {tab === 'analytics' && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-slate-900">Analytics</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { l: 'Total Views', v: st.views, icon: Eye, sub: 'All manuscripts', g: 'from-blue-500 to-cyan-500' },
                  { l: 'Avg Views', v: ms.length ? Math.round(st.views / ms.length) : 0, icon: TrendingUp, sub: 'Per manuscript', g: 'from-emerald-500 to-teal-500' },
                  { l: 'Circulation', v: logs.length, icon: Clock, sub: 'Total events', g: 'from-amber-500 to-orange-500' },
                  { l: 'Your Activity', v: st.bk + st.notes, icon: Star, sub: 'Bookmarks & notes', g: 'from-fuchsia-500 to-pink-500' },
                ].map((s, i) => (
                  <motion.div key={s.l} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className={cn("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm", s.g)}>
                        <s.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.l}</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900">{s.v.toLocaleString()}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{s.sub}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Top Read */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Most Read</span>
                  {ms.length === 0 ? <p className="text-xs text-slate-300 text-center py-6">No data</p> : [...ms].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5).map((m, i) => (
                    <div key={m.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                      <span className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold", i === 0 ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white" : i === 1 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-white" : i === 2 ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white" : "bg-slate-100 text-slate-400")}>{i + 1}</span>
                      <div className="flex-1 min-w-0"><p className="text-xs font-bold text-slate-900 truncate">{m.title}</p><p className="text-[10px] text-slate-400">{m.author}</p></div>
                      <span className="text-xs font-bold text-indigo-500 font-mono">{m.viewCount || 0}</span>
                    </div>
                  ))}
                </div>
                {/* Category Dist */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Category Distribution</span>
                  {(() => {
                    const cc: Record<string, number> = {}; ms.forEach(m => { cc[m.category] = (cc[m.category] || 0) + 1; });
                    const s = Object.entries(cc).sort((a, b) => b[1] - a[1]), mx = s[0]?.[1] || 1;
                    return s.length === 0 ? <p className="text-xs text-slate-300 text-center py-6">No data</p> : s.map(([c, n], idx) => (
                      <div key={c} className="py-2.5 border-b border-slate-50 last:border-0">
                        <div className="flex items-center justify-between mb-1.5"><span className="text-xs font-bold text-slate-700">{c}</span><span className="text-[10px] font-bold text-slate-400 font-mono">{n}</span></div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden"><div className={cn("h-2 rounded-full transition-all bg-gradient-to-r", CAT_COLORS[idx % CAT_COLORS.length])} style={{ width: `${(n / mx) * 100}%` }} /></div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Pending Review */}
              {isAdmin && ms.filter(m => m.status === 'under_review').length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block mb-4 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />Pending Faculty Contributions
                  </span>
                  <div className="space-y-2">
                    {ms.filter(m => m.status === 'under_review').map(m => (
                      <div key={m.id} className="flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                        <div><p className="text-xs font-bold text-slate-900">{m.title}</p><p className="text-[10px] text-slate-500 mt-0.5">{m.author}</p></div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => approve(m.id!)} className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-[10px] font-bold uppercase hover:from-emerald-600 hover:to-teal-600 shadow-sm">Approve</button>
                          <button onClick={() => manuscriptService.delete(m.id!).then(load)} className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-lg text-[10px] font-bold uppercase hover:from-rose-600 hover:to-red-600 shadow-sm">Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ SETTINGS ═══ */}
          {tab === 'settings' && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-slate-900">Library Settings</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Access Control */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Access Levels</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {ACCESS.map((a, i) => {
                      const cnt = ms.filter(m => m.accessLevel === a.value).length;
                      const grad = ['from-emerald-500 to-teal-500', 'from-blue-500 to-cyan-500', 'from-violet-500 to-purple-500', 'from-rose-500 to-pink-500'][i];
                      return (
                        <div key={a.value} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                          <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center mb-2 shadow-sm", grad)}>
                            {i === 0 ? <Globe className="w-4 h-4 text-white" /> : i === 1 ? <Users className="w-4 h-4 text-white" /> : i === 2 ? <Shield className="w-4 h-4 text-white" /> : <Lock className="w-4 h-4 text-white" />}
                          </div>
                          <p className="text-xs font-bold text-slate-700">{a.label}</p>
                          <p className="text-xl font-black text-slate-900">{cnt}</p>
                          <p className="text-[10px] text-slate-400">manuscripts</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Faculty Flow */}
                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Faculty Contribution Flow</span>
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0 shadow-sm">
                        <Upload className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-700">Teacher submits &rarr; Admin reviews &rarr; Published</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Pill color="amber">{st.review} pending</Pill>
                          {isAdmin && st.review > 0 && <button onClick={() => setTab('analytics')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Review now &rarr;</button>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Citation Styles</span>
                    <div className="flex flex-wrap gap-2">
                      {CITE_STYLES.map(s => (
                        <span key={s} className="px-3 py-2 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* ═══════ MODALS ═══════ */}

      {/* Add Manuscript — 3 Step */}
      <ModalShell show={showAdd} onClose={() => setShowAdd(false)} title="Add Manuscript">
        <div className="flex gap-1.5 mb-5">{[1, 2, 3].map(s => (
          <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-100">
            <motion.div initial={{ width: 0 }} animate={{ width: step >= s ? '100%' : '0%' }} transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
          </div>
        ))}</div>
        {step === 1 && (
          <div className="space-y-4">
            <Input label="Title *" required value={fm.title} onChange={e => setFm({ ...fm, title: e.target.value })} placeholder="Full title..." />
            <Input label="Author *" required value={fm.author} onChange={e => setFm({ ...fm, author: e.target.value })} placeholder="Author name" />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Type</label>
                <select value={fm.type} onChange={e => setFm({ ...fm, type: e.target.value as Manuscript['type'] })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-semibold cursor-pointer">
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Category</label>
                <select value={fm.category} onChange={e => setFm({ ...fm, category: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-semibold cursor-pointer">
                  {DEFAULT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold uppercase border border-slate-200 hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={() => setStep(2)} disabled={!fm.title || !fm.author} className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl text-xs font-bold uppercase hover:from-indigo-600 hover:to-violet-600 disabled:opacity-30 transition-all flex items-center justify-center gap-1 shadow-md shadow-indigo-200">Next <ArrowRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Language" value={fm.language} onChange={e => setFm({ ...fm, language: e.target.value })} />
              <Input label="Year" type="number" value={fm.publicationYear} onChange={e => setFm({ ...fm, publicationYear: parseInt(e.target.value) || 2024 })} />
            </div>
            <Input label="ISBN" value={fm.isbn} onChange={e => setFm({ ...fm, isbn: e.target.value })} placeholder="978-..." />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Abstract</label>
              <textarea value={fm.abstract} onChange={e => setFm({ ...fm, abstract: e.target.value })} rows={3} placeholder="Brief description..." className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs placeholder:text-slate-400 resize-none" />
            </div>
            <div className="flex gap-2 pt-4">
              <button onClick={() => setStep(1)} className="flex-1 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold uppercase border border-slate-200 hover:bg-slate-200 transition-colors">Back</button>
              <button onClick={() => setStep(3)} className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl text-xs font-bold uppercase hover:from-indigo-600 hover:to-violet-600 transition-all flex items-center justify-center gap-1 shadow-md shadow-indigo-200">Next <ArrowRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><Cross className="w-3.5 h-3.5 text-amber-500" />Scripture References</label>
              <input value={fm.refs} onChange={e => setFm({ ...fm, refs: e.target.value })} placeholder="John 3:16, Romans 8:28..." className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs placeholder:text-slate-400" />
              <p className="text-[10px] text-slate-400 pl-0.5">Comma-separated</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-indigo-500" />Keywords</label>
              <input value={fm.keywords} onChange={e => setFm({ ...fm, keywords: e.target.value })} placeholder="Grace, Salvation, Trinity..." className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs placeholder:text-slate-400" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-violet-500" />Access Level</label>
              <select value={fm.accessLevel} onChange={e => setFm({ ...fm, accessLevel: e.target.value as Manuscript['accessLevel'] })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-semibold cursor-pointer">
                {ACCESS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
            <div className="p-3.5 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-100">
              <p className="text-xs text-slate-600">{isFaculty ? 'Published immediately (faculty/admin).' : 'Submitted for admin review.'}</p>
            </div>
            <div className="flex gap-2 pt-4">
              <button onClick={() => setStep(2)} className="flex-1 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold uppercase border border-slate-200 hover:bg-slate-200 transition-colors">Back</button>
              <button onClick={addMs} disabled={!fm.title || !fm.author} className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-xs font-bold uppercase hover:from-emerald-600 hover:to-teal-600 disabled:opacity-30 transition-all flex items-center justify-center gap-1 shadow-md shadow-emerald-200"><Plus className="w-3.5 h-3.5" />Submit</button>
            </div>
          </div>
        )}
      </ModalShell>

      {/* Circulation Modal */}
      <ModalShell show={showBorrow} onClose={() => setShowBorrow(false)} title="Circulation Registry" wide>
        {logs.length === 0 ? <p className="text-xs text-slate-300 text-center py-8">No records</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white">
                <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-4 py-2.5">Manuscript</th>
                  <th className="px-4 py-2.5 text-center">Borrowed</th>
                  <th className="px-4 py-2.5 text-center">Due</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map(l => (
                  <tr key={l.id} className="text-xs hover:bg-slate-50/50">
                    <td className="px-4 py-3"><p className="font-semibold text-slate-900 truncate max-w-[180px]">{l.manuscriptTitle || '\u2014'}</p><p className="text-[10px] font-mono text-slate-400">{l.id?.slice(-8)}</p></td>
                    <td className="px-4 py-3 text-center font-mono text-xs text-emerald-600">{l.borrowDate ? new Date(l.borrowDate.seconds * 1000).toLocaleDateString() : '\u2014'}</td>
                    <td className="px-4 py-3 text-center font-mono text-xs text-slate-500">{l.dueDate ? new Date(l.dueDate.seconds * 1000).toLocaleDateString() : '\u2014'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                        l.status === 'overdue' && "bg-rose-100 text-rose-700",
                        l.status === 'borrowed' && "bg-amber-100 text-amber-700",
                        l.status === 'returned' && "bg-emerald-100 text-emerald-700"
                      )}>{l.status.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(l.status === 'borrowed' || l.status === 'overdue') ? (
                        <button onClick={() => ret(l.id!, l.manuscriptId)} className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-lg text-[10px] font-bold uppercase hover:from-indigo-600 hover:to-violet-600 shadow-sm">Return</button>
                      ) : <CheckCircle2 className="w-4 h-4 text-emerald-300 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ModalShell>

      {/* Citation Modal */}
      <ModalShell show={showCite && !!sel} onClose={() => setShowCite(false)} title="Citation Generator">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {CITE_STYLES.map(s => (
            <button key={s} onClick={() => setCiteStyle(s)} className={cn("px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all",
              citeStyle === s ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-transparent shadow-md shadow-indigo-200" : "bg-white text-slate-500 border-slate-200 hover:border-indigo-200")}>{s}</button>
          ))}
        </div>
        <div className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-xl border border-slate-100 mb-4">
          <p className="text-sm text-slate-700 italic leading-relaxed">{sel && genCite(sel, citeStyle)}</p>
        </div>
        <button onClick={() => copy(sel ? genCite(sel, citeStyle) : '')} className="w-full py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl text-xs font-bold uppercase hover:from-slate-700 hover:to-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg">
          {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? 'Copied!' : 'Copy Citation'}
        </button>
      </ModalShell>

      {/* Detail Modal */}
      <ModalShell show={showDetail && !!sel} onClose={() => setShowDetail(false)} title="Manuscript Detail">
        <div className="space-y-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <Pill color="indigo">{sel?.category}</Pill>
                <Pill color="slate">{sel?.type?.replace('_', ' ')}</Pill>
                {sel?.accessLevel !== 'public' && <Pill color="violet"><Lock className="w-2.5 h-2.5 inline mr-0.5" />{sel?.accessLevel}</Pill>}
              </div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">{sel?.title}</h3>
              <p className="text-sm text-slate-500 mt-1">by <span className="font-semibold text-slate-700">{sel?.author}</span></p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { l: 'Language', v: sel?.language, g: 'from-blue-500 to-cyan-500' },
              { l: 'Year', v: sel?.publicationYear, g: 'from-emerald-500 to-teal-500' },
              { l: 'ISBN', v: sel?.isbn || 'N/A', g: 'from-violet-500 to-purple-500' },
              { l: 'Views', v: sel?.viewCount || 0, g: 'from-amber-500 to-orange-500' },
            ].map(x => (
              <div key={x.l} className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{x.l}</span>
                <span className="text-sm font-bold text-slate-700">{x.v}</span>
              </div>
            ))}
          </div>
          {sel?.abstract && <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Abstract</span><p className="text-sm text-slate-600 leading-relaxed">{sel.abstract}</p></div>}
          {sel?.scriptureReferences && sel.scriptureReferences.length > 0 && (
            <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Scripture</span>
              <div className="flex flex-wrap gap-1.5">{sel.scriptureReferences.map(r => <span key={r} className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold border border-amber-100 flex items-center gap-1"><Cross className="w-3 h-3" />{r}</span>)}</div>
            </div>
          )}
          {sel?.keywords && sel.keywords.length > 0 && (
            <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Keywords</span>
              <div className="flex flex-wrap gap-1.5">{sel.keywords.map(k => <span key={k} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-100">{k}</span>)}</div>
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
            {(sel?.status === 'available' || sel?.status === 'published') && <button onClick={() => { if (sel) { borrow(sel.id!, sel.title); setShowDetail(false); } }} className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl text-xs font-bold uppercase hover:from-indigo-600 hover:to-violet-600 transition-all flex items-center gap-1.5 shadow-md shadow-indigo-200"><BookMarked className="w-4 h-4" />Borrow</button>}
            <button onClick={() => { if (sel) toggleBk(sel.id!, sel.title); }} className={cn("px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 border transition-all",
              bms.some(b => b.manuscriptId === sel?.id) ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-white text-slate-500 border-slate-200 hover:border-amber-200")}>
              <Star className={cn("w-4 h-4", bms.some(b => b.manuscriptId === sel?.id) && "fill-amber-400")} />{bms.some(b => b.manuscriptId === sel?.id) ? 'Saved' : 'Save'}
            </button>
            <button onClick={() => { setShowDetail(false); setShowCite(true); }} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase text-slate-500 hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center gap-1.5"><Copy className="w-4 h-4" />Cite</button>
          </div>
        </div>
      </ModalShell>

      {/* Add Category Modal */}
      <ModalShell show={showAddCat} onClose={() => setShowAddCat(false)} title="Add Category">
        <div className="space-y-4">
          <Input label="Name *" value={newCat.name} onChange={e => setNewCat({ ...newCat, name: e.target.value })} placeholder="e.g., Hermeneutics" />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Description</label>
            <textarea value={newCat.desc} onChange={e => setNewCat({ ...newCat, desc: e.target.value })} rows={2} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs placeholder:text-slate-400 resize-none" />
          </div>
          <div className="flex gap-2 pt-3">
            <button onClick={() => setShowAddCat(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold uppercase border border-slate-200 hover:bg-slate-200 transition-colors">Cancel</button>
            <button onClick={addCat} disabled={!newCat.name} className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl text-xs font-bold uppercase hover:from-indigo-600 hover:to-violet-600 disabled:opacity-30 shadow-md shadow-indigo-200">Add</button>
          </div>
        </div>
      </ModalShell>

      {/* Add Author Modal */}
      <ModalShell show={showAddAuth} onClose={() => setShowAddAuth(false)} title="Add Author">
        <div className="space-y-4">
          <Input label="Full Name *" value={newAuth.name} onChange={e => setNewAuth({ ...newAuth, name: e.target.value })} placeholder="Dr. John Calvin" />
          <Input label="Affiliation" value={newAuth.affiliation} onChange={e => setNewAuth({ ...newAuth, affiliation: e.target.value })} placeholder="Geneva Seminary" />
          <Input label="Expertise (comma-separated)" value={newAuth.expertise} onChange={e => setNewAuth({ ...newAuth, expertise: e.target.value })} placeholder="Systematic Theology, Soteriology" />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Bio</label>
            <textarea value={newAuth.bio} onChange={e => setNewAuth({ ...newAuth, bio: e.target.value })} rows={2} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs placeholder:text-slate-400 resize-none" />
          </div>
          <div className="flex gap-2 pt-3">
            <button onClick={() => setShowAddAuth(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold uppercase border border-slate-200 hover:bg-slate-200 transition-colors">Cancel</button>
            <button onClick={addAuth} disabled={!newAuth.name} className="flex-1 py-2.5 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white rounded-xl text-xs font-bold uppercase hover:from-fuchsia-600 hover:to-pink-600 disabled:opacity-30 shadow-md shadow-fuchsia-200">Add</button>
          </div>
        </div>
      </ModalShell>
    </div>
  );
}
