import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, Search, Plus, History, Star, Users,
  Lock, Eye, BarChart3, ChevronRight,
  Filter, SortAsc, X, BookMarked, Upload, Clock, AlertTriangle,
  CheckCircle2, Shield, Quote, Tag, Bell, ArrowRight,
  Library as LibraryIcon, PenLine, FolderOpen, Copy, Layers,
  FileCheck, TrendingUp
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
  { id: 'catalog', label: 'Catalog', icon: BookOpen },
  { id: 'categories', label: 'Categories', icon: Layers },
  { id: 'authors', label: 'Authors', icon: Users },
  { id: 'borrowing', label: 'Circulation', icon: History },
  { id: 'bookmarks', label: 'Bookmarks', icon: Star },
  { id: 'notes', label: 'Notes', icon: PenLine },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Shield },
];

function genCite(m: Manuscript, style: string): string {
  const a = m.author || 'Unknown', t = m.title || 'Untitled', y = m.publicationYear || new Date().getFullYear(), c = m.category || '';
  const templates: Record<string, string> = {
    'APA 7th': `${a} (${y}). ${t}. ${c}.`,
    'MLA 9th': `${a}. "${t}." ${y}.`,
    'Chicago': `${a}. ${t}. ${c}, ${y}.`,
    'Turabian': `${a}. ${t}. ${c}: ${y}.`,
    'SBL': `${a}. ${t}. ${cat}: ${y}.`.replace('cat', c),
  };
  return templates[style] || `${a}, ${t} (${y})`;
}

const TYPE_COLOR: Record<string, string> = {
  book: 'bg-indigo-500/30', sermon: 'bg-amber-500/30', research_paper: 'bg-emerald-500/30',
  thesis: 'bg-violet-500/30', commentary: 'bg-blue-500/30', journal: 'bg-rose-500/30', manuscript: 'bg-slate-400/30',
};

const STATUS_DOT: Record<string, string> = {
  available: 'bg-emerald-400', published: 'bg-emerald-400', borrowed: 'bg-amber-400',
  under_review: 'bg-blue-400', reserved: 'bg-violet-400', draft: 'bg-slate-300',
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
        if (d > 0) { w.push({ id: x.id || '', msg: `"${x.manuscriptTitle}" — ${d}d overdue`, type: 'warning' }); libraryBorrowService.markOverdue(x.id!); }
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

  // ─── Shared small components ────────────────────────────────────────────
  const Badge = ({ children, color = 'slate' }: { children: React.ReactNode; color?: string }) => (
    <span className={cn("px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider leading-none",
      color === 'indigo' && 'bg-indigo-50 text-indigo-600',
      color === 'amber' && 'bg-amber-50 text-amber-600',
      color === 'emerald' && 'bg-emerald-50 text-emerald-600',
      color === 'slate' && 'bg-slate-100 text-slate-500',
      color === 'rose' && 'bg-rose-50 text-rose-600',
      color === 'blue' && 'bg-blue-50 text-blue-600',
      color === 'violet' && 'bg-violet-50 text-violet-600',
    )}>{children}</span>
  );

  const Empty = ({ icon: Icon, msg, sub }: { icon: React.ElementType; msg: string; sub?: string }) => (
    <div className="bg-white rounded-xl border border-dashed border-slate-200 p-10 text-center">
      <Icon className="w-8 h-8 text-slate-200 mx-auto mb-3" />
      <p className="text-xs font-bold text-slate-400">{msg}</p>
      {sub && <p className="text-[10px] text-slate-300 mt-1">{sub}</p>}
    </div>
  );

  const ModalShell = ({ show, onClose, title, wide, children }: { show: boolean; onClose: () => void; title: string; wide?: boolean; children: React.ReactNode }) => (
    <AnimatePresence>{show && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
          className={cn("bg-white rounded-xl relative z-10 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto", wide ? "w-full max-w-3xl p-5" : "w-full max-w-md p-5")}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{title}</h2>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"><X className="w-3.5 h-3.5" /></button>
          </div>
          {children}
        </motion.div>
      </div>
    )}</AnimatePresence>
  );

  const Input = ({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) => (
    <div className="space-y-1">
      {label && <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">{label}</label>}
      <input {...props} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-xs font-medium placeholder:text-slate-300" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-indigo-600">Theological Repository</span>
            <ChevronRight className="w-2.5 h-2.5 text-slate-300" />
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Knowledge Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Library Portal</h1>
        </div>
        <div className="flex items-center gap-2">
          {notifs.length > 0 && (
            <button className="relative p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full text-[7px] text-white font-bold flex items-center justify-center">{notifs.length}</span>
            </button>
          )}
          <button onClick={() => setShowBorrow(true)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-50 transition-colors flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" />Circulation
          </button>
          <button onClick={() => { setStep(1); setShowAdd(true); }} className="px-3 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-600 transition-colors flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />Add Manuscript
          </button>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { l: 'Works', v: st.total, c: 'text-slate-900' }, { l: 'Available', v: st.avail, c: 'text-emerald-600' },
          { l: 'On Loan', v: st.borrowed, c: 'text-amber-600' }, { l: 'Authors', v: st.authors, c: 'text-violet-600' },
          { l: 'Views', v: st.views, c: 'text-blue-600' }, { l: 'Categories', v: st.catCount, c: 'text-rose-600' },
        ].map(s => (
          <div key={s.l} className="bg-white px-3 py-2 rounded-lg border border-slate-100">
            <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest block">{s.l}</span>
            <span className={cn("text-lg font-bold", s.c)}>{s.v}</span>
          </div>
        ))}
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="flex gap-0.5 border-b border-slate-100 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("flex items-center gap-1.5 px-3 py-2 text-[9px] font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap",
              tab === t.id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-400 hover:text-slate-600")}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
            {t.id === 'bookmarks' && bms.length > 0 && <span className="w-3.5 h-3.5 bg-indigo-100 text-indigo-600 rounded-full text-[7px] font-bold flex items-center justify-center">{bms.length}</span>}
            {t.id === 'borrowing' && st.activeB > 0 && <span className="w-3.5 h-3.5 bg-amber-100 text-amber-600 rounded-full text-[7px] font-bold flex items-center justify-center">{st.activeB}</span>}
          </button>
        ))}
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>

          {/* ═══ CATALOG ═══ */}
          {tab === 'catalog' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Sidebar */}
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest px-1 block">Categories</span>
                  <button onClick={() => setFCat('all')}
                    className={cn("w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-between",
                      fCat === 'all' ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50")}>
                    <span>All</span><span className="text-[8px] font-mono bg-slate-100 px-1.5 py-0.5 rounded">{ms.length}</span>
                  </button>
                  {activeCats.filter(c => c.isActive).map(c => (
                    <button key={c.id} onClick={() => setFCat(c.name)}
                      className={cn("w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-between",
                        fCat === c.name ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50")}>
                      <span className="truncate">{c.name}</span><span className="text-[8px] font-mono bg-slate-100 px-1.5 py-0.5 rounded">{ms.filter(m => m.category === c.name).length}</span>
                    </button>
                  ))}
                </div>
                <div className="bg-indigo-600 p-4 rounded-xl text-white relative overflow-hidden group">
                  <div className="absolute -right-3 -bottom-3 w-28 h-28 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  <LibraryIcon className="w-7 h-7 mb-2 opacity-30 group-hover:opacity-60 transition-opacity" />
                  <p className="font-bold text-xs leading-tight">Digital Archives</p>
                  <p className="text-[9px] text-indigo-100 mt-1 opacity-80 leading-relaxed">Secure zero-trust portal with cryptographic provenance.</p>
                </div>
              </div>

              {/* Main */}
              <div className="lg:col-span-3 space-y-3">
                {/* Search + Filters */}
                <div className="flex gap-2">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input type="text" placeholder="Search title, author, scripture, topic..."
                      value={q} onChange={e => setQ(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg outline-none shadow-sm focus:ring-2 focus:ring-indigo-100 transition-all text-xs placeholder:text-slate-300" />
                  </div>
                  <button onClick={() => setShowF(!showF)} className={cn("px-3 py-2.5 bg-white border rounded-lg transition-colors flex items-center gap-1.5 shadow-sm",
                    showF ? "border-indigo-200 text-indigo-600" : "border-slate-200 text-slate-400 hover:text-slate-600")}>
                    <Filter className="w-3.5 h-3.5" />
                  </button>
                  <div className="relative">
                    <SortAsc className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
                    <select value={sort} onChange={e => setSort(e.target.value)}
                      className="pl-8 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg outline-none shadow-sm text-[9px] font-bold uppercase tracking-wider cursor-pointer appearance-none">
                      {SORTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                <AnimatePresence>
                  {showF && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-sm flex flex-wrap items-end gap-3">
                        <div>
                          <label className="text-[7px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Type</label>
                          <select value={fType} onChange={e => setFType(e.target.value)} className="px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-md text-[9px] font-bold uppercase cursor-pointer">
                            <option value="all">All</option>{TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[7px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Access</label>
                          <select value={fAccess} onChange={e => setFAccess(e.target.value)} className="px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-md text-[9px] font-bold uppercase cursor-pointer">
                            <option value="all">All</option>{ACCESS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                          </select>
                        </div>
                        {(q || fCat !== 'all' || fType !== 'all' || fAccess !== 'all') && (
                          <button onClick={() => { setQ(''); setFCat('all'); setFType('all'); setFAccess('all'); }}
                            className="px-2 py-1.5 bg-rose-50 text-rose-500 rounded-md text-[9px] font-bold flex items-center gap-1">
                            <X className="w-2.5 h-2.5" />Clear
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Notifications */}
                {notifs.length > 0 && (
                  <div className="space-y-1.5">{notifs.map(n => (
                    <div key={n.id} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold border",
                      n.type === 'warning' ? "bg-amber-50 border-amber-100 text-amber-700" : "bg-blue-50 border-blue-100 text-blue-700")}>
                      {n.type === 'warning' ? <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> : <Bell className="w-3.5 h-3.5 shrink-0" />}{n.msg}
                    </div>
                  ))}</div>
                )}

                {/* Grid */}
                {loading ? (
                  <div className="flex items-center justify-center py-12 gap-3">
                    <div className="w-8 h-8 border-3 border-indigo-500/10 border-t-indigo-600 rounded-full animate-spin" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Syncing...</span>
                  </div>
                ) : filtered.length === 0 ? (
                  <Empty icon={BookOpen} msg={q ? 'No manuscripts match your search' : 'No manuscripts archived yet'} sub={q ? 'Try adjusting your filters' : 'Add your first manuscript to begin'} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filtered.map((m, i) => {
                      const bk = bms.some(b => b.manuscriptId === m.id);
                      return (
                        <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                          className="bg-white p-3.5 rounded-xl border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-lg transition-all group flex gap-3.5">
                          {/* Cover */}
                          <div className={cn("w-16 h-20 rounded-lg shrink-0 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer bg-gradient-to-br from-slate-50 to-slate-100",
                            "hover:shadow-md transition-shadow")} onClick={() => openDet(m)}>
                            <div className={cn("absolute top-0 left-0 w-1 h-full", TYPE_COLOR[m.type] || 'bg-slate-400/30')} />
                            <BookOpen className="w-5 h-5 text-slate-200 group-hover:scale-110 group-hover:text-indigo-400 transition-all" />
                            <span className="text-[6px] font-bold uppercase text-slate-300 mt-0.5 tracking-wider">{m.type.replace('_', ' ')}</span>
                          </div>

                          {/* Info */}
                          <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 mb-1">
                                <Badge color="indigo">{m.category}</Badge>
                                {m.accessLevel !== 'public' && <Lock className="w-2.5 h-2.5 text-slate-400" />}
                                <div className={cn("w-1.5 h-1.5 rounded-full ml-auto", STATUS_DOT[m.status] || 'bg-slate-300')} />
                              </div>
                              <h4 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors cursor-pointer truncate"
                                onClick={() => openDet(m)}>{m.title}</h4>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{m.author}</p>
                              {m.abstract && <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{m.abstract}</p>}
                              {m.scriptureReferences && m.scriptureReferences.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {m.scriptureReferences.slice(0, 3).map(r => (
                                    <span key={r} className="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded text-[7px] font-bold flex items-center gap-0.5">
                                      <Quote className="w-2 h-2" />{r}
                                    </span>
                                  ))}
                                  {m.scriptureReferences.length > 3 && <span className="text-[7px] text-slate-300 font-bold">+{m.scriptureReferences.length - 3}</span>}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                              <div className="flex items-center gap-2 text-[8px] text-slate-400 font-mono">
                                {m.isbn && <span>{m.isbn}</span>}
                                <span className="flex items-center gap-0.5 text-slate-300"><Eye className="w-2.5 h-2.5" />{m.viewCount || 0}</span>
                                {m.publicationYear && <span>{m.publicationYear}</span>}
                              </div>
                              <div className="flex items-center gap-0.5">
                                <button onClick={() => toggleBk(m.id!, m.title)} className="p-1 rounded hover:bg-slate-50 transition-colors">
                                  <Star className={cn("w-3 h-3", bk ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
                                </button>
                                <button onClick={() => { setSel(m); setShowCite(true); }} className="p-1 rounded hover:bg-slate-50 transition-colors">
                                  <Copy className="w-3 h-3 text-slate-300" />
                                </button>
                                {(m.status === 'available' || m.status === 'published') && (
                                  <button onClick={() => borrow(m.id!, m.title)}
                                    className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[8px] font-bold uppercase tracking-wider hover:bg-indigo-600 hover:text-white transition-colors">
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">Categories</h2>
                {isAdmin && <button onClick={() => setShowAddCat(true)} className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[9px] font-bold flex items-center gap-1"><Plus className="w-3 h-3" />Add</button>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {activeCats.filter(c => c.isActive).map(c => {
                  const cnt = ms.filter(m => m.category === c.name).length;
                  return (
                    <div key={c.id} className="bg-white p-3.5 rounded-xl border border-slate-100 hover:border-indigo-100 transition-all group cursor-pointer"
                      onClick={() => { setTab('catalog'); setFCat(c.name); }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center"><Layers className="w-3.5 h-3.5 text-indigo-500" /></div>
                        <ArrowRight className="w-3 h-3 text-slate-200 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <p className="text-xs font-bold text-slate-900">{c.name}</p>
                      {c.description && <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">{c.description}</p>}
                      <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[8px] font-bold text-slate-400">{cnt} works</span>
                        <span className="text-[8px] font-bold text-indigo-400 group-hover:text-indigo-600 transition-colors">Browse</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ AUTHORS ═══ */}
          {tab === 'authors' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">Authors</h2>
                <button onClick={() => setShowAddAuth(true)} className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[9px] font-bold flex items-center gap-1"><Plus className="w-3 h-3" />Add</button>
              </div>
              {authors.length === 0 ? <Empty icon={Users} msg="No authors yet" sub="Tracked automatically from manuscript entries" /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {authors.map(a => {
                    const wc = ms.filter(m => m.author === a.name).length;
                    return (
                      <div key={a.id} className="bg-white p-3.5 rounded-xl border border-slate-100 hover:shadow-md transition-all">
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 font-bold text-[10px] uppercase">{a.name[0]}</div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{a.name}</p>
                            {a.affiliation && <p className="text-[8px] text-slate-400 uppercase tracking-wider truncate">{a.affiliation}</p>}
                          </div>
                        </div>
                        {a.expertise && a.expertise.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {a.expertise.map(e => <span key={e} className="px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded text-[7px] font-bold">{e}</span>)}
                          </div>
                        )}
                        <div className="pt-2 border-t border-slate-50"><span className="text-[8px] font-bold text-indigo-500">{wc} work(s)</span></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══ BORROWING ═══ */}
          {tab === 'borrowing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">Circulation Registry</h2>
                <div className="flex items-center gap-2">
                  {st.overdueB > 0 && <Badge color="rose"><AlertTriangle className="w-2.5 h-2.5 inline mr-0.5" />{st.overdueB} overdue</Badge>}
                  <Badge color="emerald">{st.activeB} active</Badge>
                </div>
              </div>
              {logs.length === 0 ? <Empty icon={History} msg="No borrowing activity" sub="Borrow a manuscript from the catalog" /> : (
                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/50 text-[8px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                          <th className="px-4 py-2.5">Manuscript</th>
                          <th className="px-4 py-2.5 text-center">Borrowed</th>
                          <th className="px-4 py-2.5 text-center">Due</th>
                          <th className="px-4 py-2.5 text-center">Status</th>
                          <th className="px-4 py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {logs.map(l => (
                          <tr key={l.id} className="text-xs hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-bold text-slate-900 truncate max-w-[200px]">{l.manuscriptTitle || 'Unknown'}</p>
                              <p className="text-[7px] font-mono text-slate-400 uppercase">REF: {l.id?.slice(-8)}</p>
                            </td>
                            <td className="px-4 py-3 text-center font-mono text-[10px] text-emerald-600">{l.borrowDate ? new Date(l.borrowDate.seconds * 1000).toLocaleDateString() : '—'}</td>
                            <td className="px-4 py-3 text-center font-mono text-[10px] text-slate-500">{l.dueDate ? new Date(l.dueDate.seconds * 1000).toLocaleDateString() : '—'}</td>
                            <td className="px-4 py-3 text-center">
                              <Badge color={l.status === 'overdue' ? 'rose' : l.status === 'borrowed' ? 'amber' : 'emerald'}>{l.status}</Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {(l.status === 'borrowed' || l.status === 'overdue') ? (
                                <button onClick={() => ret(l.id!, l.manuscriptId)} className="px-3 py-1 bg-indigo-600 text-white rounded text-[8px] font-bold uppercase tracking-wider hover:bg-slate-900 transition-colors">Return</button>
                              ) : <CheckCircle2 className="w-4 h-4 text-emerald-300 mx-auto" />}
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
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900">My Bookmarks</h2>
              {bms.length === 0 ? <Empty icon={Star} msg="No bookmarks yet" sub="Star any manuscript to save it here" /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {bms.map(b => (
                    <div key={b.id} className="bg-white p-3.5 rounded-xl border border-slate-100 hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-1.5"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /><span className="text-[8px] font-bold text-amber-500 uppercase tracking-wider">Saved</span></div>
                        <button onClick={() => libraryBookmarkService.delete(b.id!).then(load)} className="p-0.5 rounded hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-colors"><X className="w-3 h-3" /></button>
                      </div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer truncate"
                        onClick={() => { const m = ms.find(x => x.id === b.manuscriptId); if (m) openDet(m); }}>{b.manuscriptTitle || 'Untitled'}</p>
                      {b.collectionName && <Badge color="indigo"><FolderOpen className="w-2 h-2 inline mr-0.5" />{b.collectionName}</Badge>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ NOTES ═══ */}
          {tab === 'notes' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Research Notes</h2>
              {nts.length === 0 ? <Empty icon={PenLine} msg="No notes yet" sub="Open a manuscript detail to add annotations" /> : (
                <div className="space-y-2">
                  {nts.map(n => (
                    <div key={n.id} className="bg-white p-3.5 rounded-xl border border-slate-100 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{n.manuscriptTitle || 'Untitled'}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {n.chapter && <Badge color="indigo">Ch: {n.chapter}</Badge>}
                            {n.pageNumber && <span className="text-[8px] font-mono text-slate-400">p.{n.pageNumber}</span>}
                            <span className="text-[8px] text-slate-300 font-mono">{n.createdAt ? new Date(n.createdAt.seconds * 1000).toLocaleDateString() : ''}</span>
                          </div>
                        </div>
                        <button onClick={() => libraryNoteService.delete(n.id!).then(load)} className="p-0.5 rounded hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-colors"><X className="w-3 h-3" /></button>
                      </div>
                      {n.highlightText && <div className="mt-2 px-2.5 py-1.5 bg-amber-50/70 border-l-2 border-amber-400 rounded-r-lg"><p className="text-[10px] text-amber-800 italic">"{n.highlightText}"</p></div>}
                      {n.content && <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">{n.content}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ ANALYTICS ═══ */}
          {tab === 'analytics' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Analytics</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  { l: 'Total Views', v: st.views, icon: Eye, sub: 'All manuscripts' },
                  { l: 'Avg Views', v: ms.length ? Math.round(st.views / ms.length) : 0, icon: TrendingUp, sub: 'Per manuscript' },
                  { l: 'Circulation', v: logs.length, icon: Clock, sub: 'Total events' },
                  { l: 'Your Activity', v: st.bk + st.notes, icon: Star, sub: 'Bookmarks & notes' },
                ].map(s => (
                  <div key={s.l} className="bg-white p-3.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center"><s.icon className="w-3.5 h-3.5 text-indigo-500" /></div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{s.l}</span>
                    </div>
                    <p className="text-xl font-bold text-slate-900">{s.v.toLocaleString()}</p>
                    <p className="text-[8px] text-slate-400 mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Top Read */}
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Most Read</span>
                  {ms.length === 0 ? <p className="text-[10px] text-slate-300 text-center py-3">No data</p> : ms.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5).map((m, i) => (
                    <div key={m.id} className="flex items-center gap-2.5 py-2 border-b border-slate-50 last:border-0">
                      <span className="text-[8px] font-bold text-slate-300 font-mono w-4">#{i + 1}</span>
                      <div className="flex-1 min-w-0"><p className="text-[10px] font-bold text-slate-900 truncate">{m.title}</p><p className="text-[7px] text-slate-400 uppercase">{m.author}</p></div>
                      <span className="text-[9px] font-bold text-indigo-500 font-mono">{m.viewCount || 0}</span>
                    </div>
                  ))}
                </div>
                {/* Category Dist */}
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Category Distribution</span>
                  {(() => {
                    const cc: Record<string, number> = {}; ms.forEach(m => { cc[m.category] = (cc[m.category] || 0) + 1; });
                    const s = Object.entries(cc).sort((a, b) => b[1] - a[1]), mx = s[0]?.[1] || 1;
                    return s.length === 0 ? <p className="text-[10px] text-slate-300 text-center py-3">No data</p> : s.map(([c, n]) => (
                      <div key={c} className="py-2 border-b border-slate-50 last:border-0">
                        <div className="flex items-center justify-between mb-1"><span className="text-[10px] font-bold text-slate-700">{c}</span><span className="text-[8px] font-bold text-slate-400 font-mono">{n}</span></div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${(n / mx) * 100}%` }} /></div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Pending Review */}
              {isAdmin && ms.filter(m => m.status === 'under_review').length > 0 && (
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-3 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />Pending Faculty Contributions
                  </span>
                  <div className="space-y-2">
                    {ms.filter(m => m.status === 'under_review').map(m => (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                        <div><p className="text-[10px] font-bold text-slate-900">{m.title}</p><p className="text-[8px] text-slate-400 uppercase">{m.author}</p></div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => approve(m.id!)} className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[7px] font-bold uppercase hover:bg-emerald-700">Approve</button>
                          <button onClick={() => manuscriptService.delete(m.id!).then(load)} className="px-2.5 py-1 bg-rose-600 text-white rounded text-[7px] font-bold uppercase hover:bg-rose-700">Reject</button>
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
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Library Settings</h2>
              {/* Access Control */}
              <div className="bg-white p-4 rounded-xl border border-slate-100">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Access Levels</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {ACCESS.map(a => {
                    const cnt = ms.filter(m => m.accessLevel === a.value).length;
                    return (
                      <div key={a.value} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-700">{a.label}</p>
                        <p className="text-lg font-bold text-slate-900">{cnt}</p>
                        <p className="text-[7px] text-slate-400">manuscripts</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Faculty Flow */}
              <div className="bg-white p-4 rounded-xl border border-slate-100">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Faculty Contribution Flow</span>
                <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 flex items-center gap-3">
                  <Upload className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-700">Teacher submits &rarr; Admin reviews &rarr; Published</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge color="amber">{st.review} pending</Badge>
                      {isAdmin && st.review > 0 && <button onClick={() => setTab('analytics')} className="text-[8px] font-bold text-indigo-600 hover:text-indigo-800">Review now &rarr;</button>}
                    </div>
                  </div>
                </div>
              </div>
              {/* Citation */}
              <div className="bg-white p-4 rounded-xl border border-slate-100">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Citation Styles</span>
                <div className="flex flex-wrap gap-1.5">
                  {CITE_STYLES.map(s => <span key={s} className="px-2.5 py-1.5 bg-slate-50 rounded-lg text-[9px] font-bold text-slate-600 border border-slate-100">{s}</span>)}
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* ═══════ MODALS ═══════ */}

      {/* Add Manuscript — 3 Step */}
      <ModalShell show={showAdd} onClose={() => setShowAdd(false)} title="Add Manuscript">
        <div className="flex gap-1 mb-4">{[1, 2, 3].map(s => <div key={s} className={cn("flex-1 h-0.5 rounded-full", step >= s ? "bg-indigo-500" : "bg-slate-100")} />)}</div>
        {step === 1 && (
          <div className="space-y-3">
            <Input label="Title *" required value={fm.title} onChange={e => setFm({ ...fm, title: e.target.value })} placeholder="Full title..." />
            <Input label="Author *" required value={fm.author} onChange={e => setFm({ ...fm, author: e.target.value })} placeholder="Author name" />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Type</label>
                <select value={fm.type} onChange={e => setFm({ ...fm, type: e.target.value as Manuscript['type'] })} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-lg outline-none text-[10px] font-bold uppercase cursor-pointer">
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Category</label>
                <select value={fm.category} onChange={e => setFm({ ...fm, category: e.target.value })} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-lg outline-none text-[10px] font-bold uppercase cursor-pointer">
                  {DEFAULT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-bold uppercase border border-slate-100">Cancel</button>
              <button onClick={() => setStep(2)} disabled={!fm.title || !fm.author} className="flex-1 py-2 bg-slate-900 text-white rounded-lg text-[9px] font-bold uppercase hover:bg-indigo-600 disabled:opacity-30 transition-colors flex items-center justify-center gap-1">Next <ArrowRight className="w-3 h-3" /></button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Language" value={fm.language} onChange={e => setFm({ ...fm, language: e.target.value })} />
              <Input label="Year" type="number" value={fm.publicationYear} onChange={e => setFm({ ...fm, publicationYear: parseInt(e.target.value) || 2024 })} />
            </div>
            <Input label="ISBN" value={fm.isbn} onChange={e => setFm({ ...fm, isbn: e.target.value })} placeholder="978-..." />
            <div className="space-y-1">
              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Abstract</label>
              <textarea value={fm.abstract} onChange={e => setFm({ ...fm, abstract: e.target.value })} rows={3} placeholder="Brief description..." className="w-full px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-lg outline-none text-[10px] font-medium placeholder:text-slate-300 resize-none" />
            </div>
            <div className="flex gap-2 pt-3">
              <button onClick={() => setStep(1)} className="flex-1 py-2 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-bold uppercase border border-slate-100">Back</button>
              <button onClick={() => setStep(3)} className="flex-1 py-2 bg-slate-900 text-white rounded-lg text-[9px] font-bold uppercase hover:bg-indigo-600 transition-colors flex items-center justify-center gap-1">Next <ArrowRight className="w-3 h-3" /></button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-0.5 flex items-center gap-1"><Quote className="w-2.5 h-2.5 text-amber-500" />Scripture References</label>
              <input value={fm.refs} onChange={e => setFm({ ...fm, refs: e.target.value })} placeholder="John 3:16, Romans 8:28..." className="w-full px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-lg outline-none text-[10px] font-medium placeholder:text-slate-300" />
              <p className="text-[7px] text-slate-300 pl-0.5">Comma-separated</p>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-0.5 flex items-center gap-1"><Tag className="w-2.5 h-2.5 text-indigo-500" />Keywords</label>
              <input value={fm.keywords} onChange={e => setFm({ ...fm, keywords: e.target.value })} placeholder="Grace, Salvation, Trinity..." className="w-full px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-lg outline-none text-[10px] font-medium placeholder:text-slate-300" />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-0.5 flex items-center gap-1"><Lock className="w-2.5 h-2.5 text-violet-500" />Access Level</label>
              <select value={fm.accessLevel} onChange={e => setFm({ ...fm, accessLevel: e.target.value as Manuscript['accessLevel'] })} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-lg outline-none text-[10px] font-bold uppercase cursor-pointer">
                {ACCESS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <p className="text-[9px] text-slate-400">{isFaculty ? 'Published immediately (faculty/admin).' : 'Submitted for admin review.'}</p>
            </div>
            <div className="flex gap-2 pt-3">
              <button onClick={() => setStep(2)} className="flex-1 py-2 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-bold uppercase border border-slate-100">Back</button>
              <button onClick={addMs} disabled={!fm.title || !fm.author} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-[9px] font-bold uppercase hover:bg-indigo-700 disabled:opacity-30 transition-colors flex items-center justify-center gap-1"><Plus className="w-3 h-3" />Submit</button>
            </div>
          </div>
        )}
      </ModalShell>

      {/* Circulation Modal */}
      <ModalShell show={showBorrow} onClose={() => setShowBorrow(false)} title="Circulation Registry" wide>
        {logs.length === 0 ? <p className="text-[10px] text-slate-300 text-center py-6">No records</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white">
                <tr className="text-[8px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-3 py-2">Manuscript</th>
                  <th className="px-3 py-2 text-center">Borrowed</th>
                  <th className="px-3 py-2 text-center">Due</th>
                  <th className="px-3 py-2 text-center">Status</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map(l => (
                  <tr key={l.id} className="text-[10px] hover:bg-slate-50/50">
                    <td className="px-3 py-2.5"><p className="font-bold text-slate-900 truncate max-w-[180px]">{l.manuscriptTitle || '—'}</p><p className="text-[7px] font-mono text-slate-400">{l.id?.slice(-8)}</p></td>
                    <td className="px-3 py-2.5 text-center font-mono text-emerald-600">{l.borrowDate ? new Date(l.borrowDate.seconds * 1000).toLocaleDateString() : '—'}</td>
                    <td className="px-3 py-2.5 text-center font-mono text-slate-500">{l.dueDate ? new Date(l.dueDate.seconds * 1000).toLocaleDateString() : '—'}</td>
                    <td className="px-3 py-2.5 text-center"><Badge color={l.status === 'overdue' ? 'rose' : l.status === 'borrowed' ? 'amber' : 'emerald'}>{l.status}</Badge></td>
                    <td className="px-3 py-2.5 text-right">
                      {(l.status === 'borrowed' || l.status === 'overdue') ? (
                        <button onClick={() => ret(l.id!, l.manuscriptId)} className="px-2.5 py-1 bg-indigo-600 text-white rounded text-[7px] font-bold uppercase hover:bg-slate-900">Return</button>
                      ) : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 mx-auto" />}
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
        <div className="flex flex-wrap gap-1.5 mb-3">
          {CITE_STYLES.map(s => (
            <button key={s} onClick={() => setCiteStyle(s)} className={cn("px-2.5 py-1 rounded text-[8px] font-bold uppercase border transition-colors",
              citeStyle === s ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-200 hover:border-indigo-200")}>{s}</button>
          ))}
        </div>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 mb-3">
          <p className="text-xs text-slate-700 italic leading-relaxed">{sel && genCite(sel, citeStyle)}</p>
        </div>
        <button onClick={() => copy(sel ? genCite(sel, citeStyle) : '')} className="w-full py-2 bg-slate-900 text-white rounded-lg text-[9px] font-bold uppercase hover:bg-indigo-600 transition-colors flex items-center justify-center gap-1.5">
          {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{copied ? 'Copied!' : 'Copy Citation'}
        </button>
      </ModalShell>

      {/* Detail Modal */}
      <ModalShell show={showDetail && !!sel} onClose={() => setShowDetail(false)} title="Manuscript Detail">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                <Badge color="indigo">{sel?.category}</Badge>
                <Badge color="slate">{sel?.type?.replace('_', ' ')}</Badge>
                {sel?.accessLevel !== 'public' && <Badge color="violet"><Lock className="w-2 h-2 inline mr-0.5" />{sel?.accessLevel}</Badge>}
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">{sel?.title}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">by <span className="font-bold text-slate-700">{sel?.author}</span></p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { l: 'Language', v: sel?.language }, { l: 'Year', v: sel?.publicationYear },
              { l: 'ISBN', v: sel?.isbn || 'N/A' }, { l: 'Views', v: sel?.viewCount || 0 },
            ].map(x => (
              <div key={x.l} className="p-2 bg-slate-50 rounded-lg">
                <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest block">{x.l}</span>
                <span className="text-[10px] font-bold text-slate-700">{x.v}</span>
              </div>
            ))}
          </div>
          {sel?.abstract && <div><span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Abstract</span><p className="text-[10px] text-slate-600 leading-relaxed">{sel.abstract}</p></div>}
          {sel?.scriptureReferences && sel.scriptureReferences.length > 0 && (
            <div><span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Scripture</span>
              <div className="flex flex-wrap gap-1">{sel.scriptureReferences.map(r => <span key={r} className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[9px] font-bold">{r}</span>)}</div>
            </div>
          )}
          {sel?.keywords && sel.keywords.length > 0 && (
            <div><span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Keywords</span>
              <div className="flex flex-wrap gap-1">{sel.keywords.map(k => <span key={k} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-bold">{k}</span>)}</div>
            </div>
          )}
          <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
            {(sel?.status === 'available' || sel?.status === 'published') && <button onClick={() => { if (sel) { borrow(sel.id!, sel.title); setShowDetail(false); } }} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[9px] font-bold uppercase hover:bg-indigo-700 transition-colors flex items-center gap-1"><BookMarked className="w-3 h-3" />Borrow</button>}
            <button onClick={() => { if (sel) toggleBk(sel.id!, sel.title); }} className={cn("px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase flex items-center gap-1 border transition-colors", bms.some(b => b.manuscriptId === sel?.id) ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-white text-slate-500 border-slate-200 hover:border-amber-200")}>
              <Star className={cn("w-3 h-3", bms.some(b => b.manuscriptId === sel?.id) && "fill-amber-400")} />{bms.some(b => b.manuscriptId === sel?.id) ? 'Saved' : 'Save'}
            </button>
            <button onClick={() => { setShowDetail(false); setShowCite(true); }} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-bold uppercase text-slate-500 hover:border-indigo-200 hover:text-indigo-600 transition-colors flex items-center gap-1"><Copy className="w-3 h-3" />Cite</button>
          </div>
        </div>
      </ModalShell>

      {/* Add Category Modal */}
      <ModalShell show={showAddCat} onClose={() => setShowAddCat(false)} title="Add Category">
        <div className="space-y-3">
          <Input label="Name *" value={newCat.name} onChange={e => setNewCat({ ...newCat, name: e.target.value })} placeholder="e.g., Hermeneutics" />
          <div className="space-y-1">
            <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Description</label>
            <textarea value={newCat.desc} onChange={e => setNewCat({ ...newCat, desc: e.target.value })} rows={2} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-lg outline-none text-[10px] font-medium placeholder:text-slate-300 resize-none" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setShowAddCat(false)} className="flex-1 py-2 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-bold uppercase border border-slate-100">Cancel</button>
            <button onClick={addCat} disabled={!newCat.name} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-[9px] font-bold uppercase hover:bg-indigo-700 disabled:opacity-30">Add</button>
          </div>
        </div>
      </ModalShell>

      {/* Add Author Modal */}
      <ModalShell show={showAddAuth} onClose={() => setShowAddAuth(false)} title="Add Author">
        <div className="space-y-3">
          <Input label="Full Name *" value={newAuth.name} onChange={e => setNewAuth({ ...newAuth, name: e.target.value })} placeholder="Dr. John Calvin" />
          <Input label="Affiliation" value={newAuth.affiliation} onChange={e => setNewAuth({ ...newAuth, affiliation: e.target.value })} placeholder="Geneva Seminary" />
          <Input label="Expertise (comma-separated)" value={newAuth.expertise} onChange={e => setNewAuth({ ...newAuth, expertise: e.target.value })} placeholder="Systematic Theology, Soteriology" />
          <div className="space-y-1">
            <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Bio</label>
            <textarea value={newAuth.bio} onChange={e => setNewAuth({ ...newAuth, bio: e.target.value })} rows={2} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-lg outline-none text-[10px] font-medium placeholder:text-slate-300 resize-none" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setShowAddAuth(false)} className="flex-1 py-2 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-bold uppercase border border-slate-100">Cancel</button>
            <button onClick={addAuth} disabled={!newAuth.name} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-[9px] font-bold uppercase hover:bg-indigo-700 disabled:opacity-30">Add</button>
          </div>
        </div>
      </ModalShell>
    </div>
  );
}
