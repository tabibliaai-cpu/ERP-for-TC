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
    ? 'Full system access — manage organizations, users, and global settings'
    : 'Manage your church — members, finances, events, and ministries';
  const accentColor = isSuperAdmin ? 'amber' : 'blue';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const result = login(username, password, role);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-100/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
              isSuperAdmin ? 'from-amber-500 to-amber-400' : 'from-blue-600 to-blue-500'
            } flex items-center justify-center mx-auto mb-4 shadow-lg ${
              isSuperAdmin ? 'shadow-amber-200' : 'shadow-blue-200'
            }`}>
              {isSuperAdmin ? (
                <Shield className="h-8 w-8 text-white" />
              ) : (
                <UserCog className="h-8 w-8 text-white" />
              )}
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Church className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-bold text-gray-900">CovenantERP</span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm mb-6 animate-fade-in">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isSuperAdmin ? 'Enter super admin username' : 'Enter admin username'}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all pr-12"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !username.trim() || !password.trim()}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isSuperAdmin
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-amber-500/25 hover:from-amber-400 hover:to-amber-300'
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-500/25 hover:from-blue-500 hover:to-blue-400'
              }`}
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
          <div className="mt-6 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              {isSuperAdmin ? (
                <>Demo: <span className="text-gray-600 font-medium">superadmin</span> / <span className="text-gray-600 font-medium">SuperAdmin@2024</span></>
              ) : (
                <>Demo: <span className="text-gray-600 font-medium">admin</span> / <span className="text-gray-600 font-medium">Admin@2024</span></>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
