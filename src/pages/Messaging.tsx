import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Send, 
  Lock, 
  Search,
  MoreVertical,
  Phone,
  Video,
  User,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { encryptMessage, decryptMessage, deriveKeyFromPassphrase } from '../lib/crypto';
import { useAuthStore } from '../store/useStore';
import { facultyService, messageService, type MessageDoc, type Faculty } from '../services/dataService';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function Messaging() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [activeChat, setActiveChat] = useState<Faculty | null>(null);
  
  const [input, setInput] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load contacts
  useEffect(() => {
    if (user?.tenantId) {
      facultyService.getFacultyByTenant(user.tenantId).then(data => {
        // Exclude self if faculty
        setFaculty(data.filter(f => f.id !== user.uid));
      }).catch(console.error);
    }
  }, [user?.tenantId, user?.uid]);

  // Load messages realtime
  useEffect(() => {
    if (!user?.tenantId || !user?.uid || !activeChat?.id) return;
    
    // We listen to messages where we are either sender or receiver
    const q1 = query(collection(db, 'messages'), where('tenantId', '==', user.tenantId), where('senderId', '==', user.uid), where('receiverId', '==', activeChat.id));
    const q2 = query(collection(db, 'messages'), where('tenantId', '==', user.tenantId), where('senderId', '==', activeChat.id), where('receiverId', '==', user.uid));
    
    // Quick hack for 2 queries: combine in state
    let msgs1: MessageDoc[] = [];
    let msgs2: MessageDoc[] = [];

    const updateMessages = () => {
      const all = [...msgs1, ...msgs2].sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeA - timeB;
      });
      setMessages(all);
    };

    const unsub1 = onSnapshot(q1, (snap) => {
      msgs1 = snap.docs.map(d => ({ id: d.id, ...d.data() } as MessageDoc));
      updateMessages();
    });

    const unsub2 = onSnapshot(q2, (snap) => {
      msgs2 = snap.docs.map(d => ({ id: d.id, ...d.data() } as MessageDoc));
      updateMessages();
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [activeChat?.id, user?.tenantId, user?.uid]);

  const handleUnlock = async () => {
    if (!passphrase) return;
    try {
      const key = await deriveKeyFromPassphrase(passphrase, 'covenant-erp-salt-123'); // Simple shared salt
      setCryptoKey(key);
      setIsUnlocked(true);
    } catch (e) {
      console.error('Failed to derive key:', e);
    }
  };

  const handleSend = async () => {
    if (!input || !isUnlocked || !cryptoKey || !user?.uid || !user?.tenantId || !activeChat?.id) return;
    
    try {
      const enc = await encryptMessage(input, cryptoKey);
      await messageService.sendMessage({
        tenantId: user.tenantId,
        senderId: user.uid,
        senderName: user.name || 'User',
        receiverId: activeChat.id,
        content: enc.ciphertext,
        iv: enc.iv,
        createdAt: null,
        isEncrypted: true
      });
      setInput('');
    } catch (err) {
      console.error("Error sending message", err);
      alert("Failed to send encrypted message.");
    }
  };

  const [decryptedTexts, setDecryptedTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (cryptoKey && messages.length > 0) {
      const decryptAll = async () => {
        const newDecrypted: Record<string, string> = {};
        for (const msg of messages) {
          if (msg.isEncrypted && cryptoKey && msg.iv) {
             try {
               const plain = await decryptMessage({ ciphertext: msg.content, iv: msg.iv }, cryptoKey); 
               newDecrypted[msg.id!] = plain;
             } catch (e) {
               newDecrypted[msg.id!] = '[Encrypted Content]';
             }
          } else {
             newDecrypted[msg.id!] = msg.content;
          }
        }
        setDecryptedTexts(newDecrypted);
      };
      decryptAll();
    }
  }, [messages, cryptoKey]);

  // Simplify decryption for demo: Since our encryptMessage generated specific payloads, to avoid breaking, we will just show the plain input while unlocked. But wait! The actual plaintext is lost!
  // To make it functional, I should update the messageService to store the IV if it was a real app.
  // We will just do a mock decrypt and just render the plaintext if `isUnlocked` because this is a UI prototype.

  const filteredFaculty = faculty.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="h-[calc(100vh-160px)] flex bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Contact List */}
      <div className="w-80 border-r border-slate-100 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search faculty..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-fuchsia-500/10 transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredFaculty.map((fac) => (
            <div key={fac.id} onClick={() => { setActiveChat(fac); setIsUnlocked(false); setPassphrase(''); }} className={cn(
              "p-4 hover:bg-slate-50 cursor-pointer transition-colors border-l-4",
              activeChat?.id === fac.id ? "bg-fuchsia-50/30 border-fuchsia-500" : "border-transparent"
            )}>
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-slate-900  tracking-tight">{fac.name}</span>
              </div>
              <p className="text-xs text-slate-500 truncate">{fac.role}</p>
            </div>
          ))}
          {filteredFaculty.length === 0 && (
             <div className="p-6 text-center text-slate-400 flex flex-col items-center gap-2">
                <Users className="w-8 h-8 text-slate-200" />
                <span className="text-[10px] uppercase font-bold tracking-widest">No Contacts</span>
             </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30">
        {activeChat ? (
          <>
            <div className="h-16 border-b border-slate-100 bg-white px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center font-bold text-xs ring-2 ring-white">
                  {activeChat.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 tracking-tight ">{activeChat.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeChat.role}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <Phone className="w-4 h-4 hover:text-fuchsia-600 cursor-pointer" />
                <Video className="w-4 h-4 hover:text-fuchsia-600 cursor-pointer" />
                <MoreVertical className="w-4 h-4 hover:text-fuchsia-600 cursor-pointer" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <AnimatePresence>
                {!isUnlocked ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center h-full text-center space-y-4 max-w-sm mx-auto"
                  >
                    <div className="w-16 h-16 bg-fuchsia-50 rounded-full flex items-center justify-center border-2 border-fuchsia-200">
                      <Lock className="w-8 h-8 text-fuchsia-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">End-to-End Encrypted</h4>
                      <p className="text-sm text-slate-500 mt-1">Chat is secured. Enter your shared vault passphrase to view encrypted messages.</p>
                    </div>
                    <div className="w-full space-y-2">
                      <input 
                        type="password" 
                        placeholder="Enter Vault Passphrase" 
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleUnlock()}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-fuchsia-100 transition-all text-center"
                      />
                      <button 
                        onClick={handleUnlock}
                        className="w-full py-3 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-fuchsia-100 hover:from-fuchsia-700 hover:to-violet-700 transition-all"
                      >
                        Unlock Conversation
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                       <ShieldCheck className="w-8 h-8 opacity-20" />
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Start Secure Connection</span>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex flex-col max-w-[70%]",
                          msg.senderId === user?.uid ? "ml-auto items-end" : "items-start"
                        )}
                      >
                        <div className={cn(
                          "px-4 py-3 rounded-2xl text-sm relative group",
                          msg.senderId === user?.uid 
                            ? "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white rounded-tr-none shadow-md shadow-fuchsia-100" 
                            : "bg-white text-slate-900 border border-slate-100 rounded-tl-none shadow-sm"
                        )}>
                          {isUnlocked && msg.id ? (decryptedTexts[msg.id] || '[Decrypting...]') : '[Encrypted Payload]'}
                          {msg.isEncrypted && (
                            <ShieldCheck className={cn(
                              "w-3 h-3 absolute -bottom-4 right-0",
                              msg.senderId === user?.uid ? "text-fuchsia-400" : "text-slate-300"
                            )} />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold mt-1 px-1">
                          {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                        </span>
                      </motion.div>
                    ))
                  )
                )}
              </AnimatePresence>
            </div>

            {isUnlocked && (
              <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      placeholder="Encrypt & Send Message..." 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      className="w-full pl-4 pr-12 py-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-fuchsia-500/10 transition-all"
                    />
                    <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 opacity-50" title="Auto-encrypted" />
                  </div>
                  <button 
                    onClick={handleSend}
                    disabled={!input}
                    className="p-3 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white rounded-xl shadow-lg shadow-fuchsia-100 hover:from-fuchsia-700 hover:to-violet-700 transition-all group disabled:opacity-50"
                  >
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
           <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                 <Lock className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Contact to establish secure connection</p>
           </div>
        )}
      </div>
    </div>
  );
}

