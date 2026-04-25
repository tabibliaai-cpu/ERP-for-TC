import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { Church, Shield, UserCog, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';
import { navigate } from '../utils/router';

interface LoginPageProps {
  role: 'super_admin' | 'admin';
}

export default function LoginPage({ role }: LoginPageProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isSuperAdmin = role === 'super_admin';
  const title = isSuperAdmin ? 'Super Admin Login' : 'Admin Login';
  const subtitle = isSuperAdmin
    ? 'Full platform access — manage all institutions, users, and system settings'
    : 'Manage your institution — students, teachers, academics, and finances';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await login(username, password, role);
      if (result.success) {
        navigate(isSuperAdmin ? '/super-admin' : '/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-100/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-50/40 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 mb-8 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-600/20">
              {isSuperAdmin ? (
                <Shield className="h-7 w-7 text-white" />
              ) : (
                <UserCog className="h-7 w-7 text-white" />
              )}
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Church className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-bold text-slate-900">CovenantERP</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm mb-6 animate-fade-in">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isSuperAdmin ? 'Enter super admin username' : 'Enter admin username'}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all pr-12"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !username.trim() || !password.trim()}
              className="w-full py-2.5 rounded-xl bg-amber-600 text-white font-semibold text-sm shadow-lg shadow-amber-600/20 hover:bg-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                `Sign in as ${isSuperAdmin ? 'Super Admin' : 'Admin'}`
              )}
            </button>
          </form>

          {/* Hint */}
          <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-400 text-center">
              {isSuperAdmin ? (
                <>Demo: <span className="text-slate-600 font-medium">superadmin</span> / <span className="text-slate-600 font-medium">SuperAdmin@2024</span></>
              ) : (
                <>Demo: <span className="text-slate-600 font-medium">admin</span> / <span className="text-slate-600 font-medium">Admin@2024</span></>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
