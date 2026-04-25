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
    <div className="min-h-screen flex animate-fade-in">

      {/* ===================== LEFT PANEL — Decorative (hidden on mobile) ===================== */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative bg-slate-900 text-white flex-col justify-between overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Large radial glow top-left */}
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px]" />
          {/* Small accent glow bottom-right */}
          <div className="absolute bottom-24 right-16 w-72 h-72 bg-amber-600/8 rounded-full blur-[80px]" />
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
          {/* Decorative cross watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04]">
            <Church className="h-[300px] w-[300px] text-white" strokeWidth={0.5} />
          </div>
        </div>

        {/* Top section: Logo & back */}
        <div className="relative z-10 p-10 xl:p-14">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
        </div>

        {/* Center section: Hero content */}
        <div className="relative z-10 flex-1 flex items-center px-10 xl:px-14">
          <div className="max-w-lg">
            {/* Logo mark */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center shadow-lg shadow-amber-600/30">
                <Church className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">CovenantERP</span>
            </div>

            <h2 className="text-3xl xl:text-4xl font-bold leading-tight mb-4">
              Empowering Theological
              <br />
              <span className="text-amber-400">Education Worldwide</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed max-w-md">
              A comprehensive management platform designed for seminaries, Bible colleges,
              and theological institutions to streamline administration, academics, and ministry training.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 mt-8">
              {['Student Management', 'Academic Records', 'Finance & Billing', 'Ministry Tracking'].map((feature) => (
                <span
                  key={feature}
                  className="px-4 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-slate-300"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom section: Quote */}
        <div className="relative z-10 p-10 xl:p-14">
          <blockquote className="border-l-2 border-amber-600/50 pl-4">
            <p className="text-slate-500 text-sm italic leading-relaxed">
              "Commit to the Lord whatever you do, and he will establish your plans."
            </p>
            <cite className="text-slate-600 text-xs mt-1 block not-italic">— Proverbs 16:3</cite>
          </blockquote>
        </div>
      </div>

      {/* ===================== RIGHT PANEL — Login Form ===================== */}
      <div className="flex-1 flex flex-col bg-white min-h-screen">
        {/* Mobile back button */}
        <div className="lg:hidden p-4 sm:p-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
        </div>

        {/* Form area — vertically centered */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-8 lg:px-12 py-8">
          <div className="w-full max-w-md">
            {/* Mobile-only logo (visible on small screens) */}
            <div className="lg:hidden flex items-center gap-2.5 mb-8">
              <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center">
                <Church className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">CovenantERP</span>
            </div>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  isSuperAdmin
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {isSuperAdmin ? (
                    <Shield className="h-5 w-5" />
                  ) : (
                    <UserCog className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
                </div>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{subtitle}</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-6 animate-fade-in">
                <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-red-500" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isSuperAdmin ? 'Enter super admin username' : 'Enter admin username'}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all"
                  required
                  autoComplete="username"
                />
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all pr-14"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !username.trim() || !password.trim()}
                className="w-full py-3.5 rounded-xl bg-amber-600 text-white font-semibold text-base shadow-lg shadow-amber-600/25 hover:bg-amber-700 hover:shadow-amber-700/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2.5 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  `Sign in as ${isSuperAdmin ? 'Super Admin' : 'Admin'}`
                )}
              </button>
            </form>

            {/* Support hint - no credentials shown */}
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-400">
                Contact your institution administrator for login credentials
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 lg:px-12 py-5 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center">
            &copy; {new Date().getFullYear()} CovenantERP &middot; Theological Institution Management System
          </p>
        </div>
      </div>
    </div>
  );
}
