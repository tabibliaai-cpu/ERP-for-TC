import React, { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { ShieldCheck, LogIn, Phone, Key, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Login() {
  const [showGovernance, setShowGovernance] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [govEmail, setGovEmail] = useState('rajesh@sibbc.org');
  const [govPassword, setGovPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (!email || !password) {
        throw new Error("Please provide both email and password.");
      }
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError("Authentication failed: Invalid email or password.");
      } else {
        setError(`Authentication failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        setError(`Google login failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGovernanceLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (!govEmail || !govPassword) {
        throw new Error("Credentials required for governance access.");
      }
      await signInWithEmailAndPassword(auth, govEmail, govPassword);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        setError(`Master credentials denied. Ensure rajesh@sibbc.org is created in Firebase Users.`);
      } else {
        setError(`Governance access denied: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#312e81,transparent)] opacity-40"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-indigo-900/20 border border-slate-800/10">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6">
              <ShieldCheck className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight ">CovenantERP</h1>
            <p className="text-slate-500 mt-2 text-sm max-w-[240px]">The definitive privacy-first OS for modern theological institutions.</p>
          </div>

          <div className="space-y-5">
            <AnimatePresence mode="wait">
              {!showGovernance ? (
                <motion.div
                  key="login-options"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {/* Institutional Admin Path */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">Institutional Login</h2>
                    <form onSubmit={handleEmailLogin} className="space-y-3">
                       <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin Email" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl" />
                       <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl" />
                       <button type="submit" disabled={isLoading} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black disabled:opacity-50">Login as Admin</button>
                    </form>
                    
                    <button 
                      onClick={handleGoogleLogin} 
                      disabled={isLoading}
                      className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-black flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                      Sign in with Google
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                    <div className="relative flex justify-center text-xs font-bold text-slate-400 bg-white px-2 uppercase">Or</div>
                  </div>

                  {/* Governance Path Toggle */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 border-l-4 border-rose-600 pl-3">Super Admin Governance</h2>
                    <button 
                      onClick={() => setShowGovernance(true)}
                      className="w-full flex items-center justify-center gap-3 bg-slate-950 text-white py-4 rounded-xl font-black hover:bg-rose-900 transition-all shadow-lg"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Governance Gateway</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="governance-login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="flex items-center justify-between mb-2">
                     <button onClick={() => setShowGovernance(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 flex items-center gap-1 transition-colors">
                        <ChevronRight className="w-3 h-3 rotate-180" />
                        Back
                     </button>
                     <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Master Control</span>
                  </div>

                  <form onSubmit={handleGovernanceLogin} className="space-y-4">
                     <div className="space-y-3">
                        <div className="relative">
                           <LogIn className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                           <input 
                              required
                              type="email" 
                              value={govEmail}
                              onChange={(e) => setGovEmail(e.target.value)}
                              placeholder="Super Admin Email"
                              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-rose-100 transition-all outline-none font-bold"
                           />
                        </div>
                        <div className="relative">
                           <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                           <input 
                              required
                              type="password" 
                              value={govPassword}
                              onChange={(e) => setGovPassword(e.target.value)}
                              placeholder="Master Password"
                              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-rose-100 transition-all outline-none font-bold"
                           />
                        </div>
                     </div>
                     <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-rose-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all disabled:opacity-50"
                     >
                        {isLoading ? 'Decrypting Access...' : 'Verify Master Identity'}
                     </button>
                  </form>

                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600">
                      <X className="w-4 h-4 shrink-0" />
                      <p className="text-[10px] font-bold uppercase tracking-wide">{error}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase font-bold text-slate-400">
                <span className="bg-white px-4 tracking-widest leading-none">Security Guaranteed</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex gap-3">
                <LogIn className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 leading-relaxed">
                  <p className="font-bold text-slate-900 mb-1">Zero-Trust Protocol</p>
                  Your keys never leave your device. All sensitive faculty & student data is encrypted client-side.
                </div>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400 font-medium tracking-wide leading-none uppercase">
            &copy; 2024 Covenant Research Systems
          </p>
        </div>
      </motion.div>
    </div>
  );
}
