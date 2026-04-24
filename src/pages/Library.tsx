import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  BookMarked, 
  History, 
  Plus, 
  Tag, 
  ArrowRight,
  ChevronRight,
  Library as LibraryIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { bookService, borrowingService, Book, BookBorrowing } from '../services/dataService';
import { useAuthStore } from '../store/useStore';

export function Library() {
  const { user } = useAuthStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowingHistory, setBorrowingHistory] = useState<BookBorrowing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Theology',
    status: 'available' as const
  });

  useEffect(() => {
    if (user?.tenantId) {
      loadBooks();
      loadHistory();
    }
  }, [user?.tenantId]);

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const data = await bookService.getBooksByTenant(user!.tenantId!);
      setBooks(data);
    } catch (error) {
      console.error("Failed to load books:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!user?.tenantId) return;
    try {
      const data = await borrowingService.getBorrowingByTenant(user.tenantId);
      setBorrowingHistory(data);
    } catch (error) {
      console.error("Failed to load borrowing history:", error);
    }
  };

  const handleBorrow = async (bookId: string) => {
    if (!user?.tenantId || !user?.uid) return;
    try {
      await borrowingService.borrowBook({
        bookId,
        studentId: user.uid,
        tenantId: user.tenantId,
        status: 'borrowed'
      });
      alert("Manuscript borrowed. Digital ledger synchronized.");
      loadBooks();
      loadHistory();
    } catch (error) {
      console.error("Error borrowing book:", error);
    }
  };

  const handleReturn = async (borrowingId: string, bookId: string) => {
    try {
      await borrowingService.returnBook(borrowingId, bookId);
      alert("Manuscript returned to repository.");
      loadBooks();
      loadHistory();
    } catch (error) {
      console.error("Error returning book:", error);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenantId) return;

    try {
      await bookService.addBook({
        ...newBook,
        tenantId: user.tenantId
      });
      setIsAddModalOpen(false);
      setNewBook({ title: '', author: '', isbn: '', category: 'Theology', status: 'available' });
      loadBooks();
    } catch (error) {
      console.error("Error adding book:", error);
    }
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Theological Repository</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Institutional Catalog</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-950 tracking-tight ">Library Catalog</h1>
          <p className="text-slate-500 text-sm mt-1 max-w-lg">Access theological research papers, commentaries, and historical manuscripts with cryptographic provenance.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsHistoryModalOpen(true)}
            className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest flex items-center gap-2 shadow-sm"
          >
            <History className="w-4 h-4" />
            <span>Borrowing Logs</span>
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manuscript</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Quick Selection</h3>
            <div className="space-y-2">
              {['All Collections', 'Systematic Theology', 'Biblical Exegesis', 'Church History', 'Greek & Hebrew'].map((cat, i) => (
                <button 
                  key={cat} 
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all group flex items-center justify-between uppercase tracking-widest",
                    i === 0 ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <span>{cat}</span>
                  {i === 0 && <ArrowRight className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-indigo-600 p-6 rounded-3xl shadow-2xl shadow-indigo-200 text-white relative overflow-hidden group">
             <div className="absolute -right-4 -bottom-4 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
             <LibraryIcon className="w-10 h-10 mb-6 opacity-30 group-hover:opacity-60 transition-opacity" />
             <h4 className="font-bold text-xl leading-tight ">Digital Archives Open</h4>
             <p className="text-xs text-indigo-100 mt-2 leading-relaxed opacity-80">Access rare 16th-century manuscripts through our secure zero-trust portal.</p>
             <button className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-indigo-400 pb-1 hover:border-white transition-colors">Access Portal</button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-5">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by title, author, or ISBN..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-2xl outline-none shadow-sm focus:ring-8 focus:ring-indigo-100 transition-all font-medium  text-xl placeholder:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <div className="md:col-span-2 flex flex-col items-center justify-center py-10 gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500/10 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Archives...</p>
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="md:col-span-2 flex flex-col items-center justify-center py-10 bg-white rounded-2xl border border-slate-200 border-dashed text-slate-400">
                <BookOpen className="w-12 h-12 text-slate-100 mb-4" />
                <p className="font-bold">No manuscripts found for this session.</p>
              </div>
            ) : (
              filteredBooks.map((book) => (
                <div key={book.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group flex gap-6">
                  <div className="w-28 h-36 bg-slate-100 rounded-2xl shrink-0 flex items-center justify-center relative shadow-inner overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600/30"></div>
                    <BookOpen className="w-10 h-10 text-slate-200 group-hover:scale-110 group-hover:text-indigo-400 transition-all duration-700" />
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-200/50 to-transparent"></div>
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{book.category}</span>
                        <div className="flex items-center gap-1.5">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            book.status === 'available' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                          )}></div>
                          <span className="text-[8px] font-black uppercase text-slate-400">{book.status}</span>
                        </div>
                      </div>
                      <h4 className="text-xl font-bold text-slate-900  leading-tight group-hover:text-indigo-600 transition-colors">{book.title}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{book.author}</p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-300 mt-6 group-hover:text-slate-400 transition-colors border-t border-slate-50 pt-4">
                      <span className="font-mono text-[9px] uppercase tracking-tighter">I: {book.isbn}</span>
                      {book.status === 'available' ? (
                        <button 
                          onClick={() => handleBorrow(book.id!)}
                          className="px-4 py-2 bg-slate-50 text-indigo-600 rounded-xl font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
                        >Request</button>
                      ) : (
                        <span className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl font-black uppercase tracking-widest border border-amber-100 ">On Loan</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Manuscript Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-lg p-6 relative z-10 shadow-2xl border border-slate-100"
            >
              <div className="mb-8 border-b border-slate-50 pb-8 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
                  <LibraryIcon className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight  uppercase">Add New Manuscript</h2>
                <p className="text-sm text-slate-400 mt-1 capitalize">Archive a new research paper or historical theological text.</p>
              </div>

              <form onSubmit={handleAddBook} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Manuscript Title</label>
                  <input 
                    required
                    type="text" 
                    value={newBook.title}
                    onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                    placeholder="Enter full title of the record..."
                    className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-8 focus:ring-indigo-100 transition-all outline-none font-medium  text-xl placeholder:text-slate-200 shadow-inner"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Author / Scribe</label>
                  <input 
                    required
                    type="text" 
                    value={newBook.author}
                    onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                    placeholder="Name of the moderator or author"
                    className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-8 focus:ring-indigo-100 transition-all outline-none text-sm font-bold uppercase tracking-widest placeholder:text-slate-200 shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Identification (ISBN/REF)</label>
                    <input 
                      required
                      type="text" 
                      value={newBook.isbn}
                      onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
                      placeholder="978-..."
                      className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-8 focus:ring-indigo-100 transition-all outline-none text-xs font-mono font-bold shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Collection Category</label>
                    <select 
                      value={newBook.category}
                      onChange={(e) => setNewBook({...newBook, category: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-8 focus:ring-indigo-100 transition-all outline-none text-xs font-bold uppercase tracking-widest shadow-inner appearance-none bg-no-repeat bg-[right_1.5rem_center] cursor-pointer"
                    >
                      <option value="Theology">Systematic Theology</option>
                      <option value="Biblical Exegesis">Biblical Exegesis</option>
                      <option value="Church History">Church History</option>
                      <option value="Ethics">Ethics</option>
                      <option value="Greek & Hebrew">Greek & Hebrew</option>
                    </select>
                  </div>
                </div>

                <div className="pt-8 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all border border-slate-100 transition-all"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit"
                    className="flex-2 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 shadow-2xl shadow-slate-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Archive Entry</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Borrowing History Modal */}
      <AnimatePresence>
        {isHistoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsHistoryModalOpen(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl w-full max-w-4xl p-6 relative z-10 shadow-2xl border border-slate-100 flex flex-col max-h-[80vh]">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900  uppercase">Circulation Registry</h2>
                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Chronological archive of institutional borrowing activities.</p>
                </div>
                <button onClick={() => setIsHistoryModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
                  <ArrowRight className="w-4 h-4 rotate-45" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="px-4 py-4">Manuscript & Identification</th>
                      <th className="px-4 py-4 text-center">Circulation Cycle</th>
                      <th className="px-4 py-4 text-center">Status</th>
                      <th className="px-4 py-4 text-right">Action Protocol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {borrowingHistory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-slate-300 ">No circulation records found in archive.</td>
                      </tr>
                    ) : (
                      borrowingHistory.map((log) => {
                        const book = books.find(b => b.id === log.bookId);
                        return (
                          <tr key={log.id} className="text-sm">
                            <td className="px-4 py-6">
                              <p className="font-bold text-slate-900 ">{book?.title || 'Unknown Manuscript'}</p>
                              <p className="text-[9px] font-mono text-slate-400 mt-0.5 uppercase tracking-tighter">REF: {log.id?.slice(-8)}</p>
                            </td>
                            <td className="px-4 py-6 text-center">
                              <div className="flex flex-col items-center gap-1 font-mono text-[10px]">
                                <span className="text-emerald-600">Borrowed: {new Date(log.borrowDate?.seconds * 1000).toLocaleDateString() || 'Live'}</span>
                                {log.returnDate && <span className="text-slate-400">Returned: {new Date(log.returnDate?.seconds * 1000).toLocaleDateString()}</span>}
                              </div>
                            </td>
                            <td className="px-4 py-6 text-center">
                              <span className={cn(
                                "px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest",
                                log.status === 'borrowed' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                              )}>
                                {log.status}
                              </span>
                            </td>
                            <td className="px-4 py-6 text-right">
                              {log.status === 'borrowed' && (
                                <button 
                                  onClick={() => handleReturn(log.id!, log.bookId)}
                                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100"
                                >
                                  Return Manuscript
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
