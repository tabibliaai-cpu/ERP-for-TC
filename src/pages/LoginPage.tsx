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
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col justify-between overflow-hidden"
        style={{ backgroundColor: '#1A1F36' }}
      >
        {/* Background layers */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Warm ambient glow — top-left */}
          <div
            className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[120px]"
            style={{ backgroundColor: 'rgba(184, 134, 11, 0.07)' }}
          />
          {/* Secondary glow — bottom-right */}
          <div
            className="absolute bottom-16 right-12 w-80 h-80 rounded-full blur-[100px]"
            style={{ backgroundColor: 'rgba(184, 134, 11, 0.05)' }}
          />
          {/* Subtle diamond / cross-hatch texture */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
              backgroundSize: '72px 72px',
            }}
          />
          {/* Large cross watermark — 5% opacity */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05]">
            <Church className="h-[340px] w-[340px] text-white" strokeWidth={0.4} />
          </div>
        </div>

        {/* Top section — Back to Home */}
        <div className="relative z-10 p-10 xl:p-14">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors duration-300 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Home
          </button>
        </div>

        {/* Center section — Hero content */}
        <div className="relative z-10 flex-1 flex items-center px-10 xl:px-14">
          <div className="max-w-lg">
            {/* Logo mark */}
            <div className="flex items-center gap-3.5 mb-10">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  backgroundColor: '#B8860B',
                  boxShadow: '0 8px 24px rgba(184, 134, 11, 0.25)',
                }}
              >
                <Church className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">CovenantERP</span>
            </div>

            {/* Heading */}
            <h2 className="text-3xl xl:text-4xl font-heading font-bold leading-snug mb-5 text-white">
              Empowering Theological
              <br />
              <span className="font-heading" style={{ color: '#D4A03C' }}>
                Education Worldwide
              </span>
            </h2>

            {/* Description */}
            <p className="text-white/40 text-[15px] leading-relaxed max-w-md">
              A comprehensive management platform designed for seminaries, Bible colleges,
              and theological institutions to streamline administration, academics, and ministry training.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2.5 mt-8">
              {['Student Management', 'Academic Records', 'Finance & Billing', 'Ministry Tracking'].map(
                (feature) => (
                  <span
                    key={feature}
                    className="px-4 py-1.5 rounded-full text-xs font-medium text-white/60 transition-colors"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    {feature}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Bottom section — Scripture quote */}
        <div className="relative z-10 p-10 xl:p-14">
          <blockquote
            className="pl-4"
            style={{ borderLeft: '2px solid rgba(184, 134, 11, 0.4)' }}
          >
            <p className="text-white/35 text-sm italic leading-relaxed font-light">
              &ldquo;Commit to the Lord whatever you do, and he will establish your plans.&rdquo;
            </p>
            <cite className="text-white/25 text-xs mt-1.5 block not-italic">
              &mdash; Proverbs 16:3
            </cite>
          </blockquote>
        </div>
      </div>

      {/* ===================== RIGHT PANEL — Login Form ===================== */}
      <div className="flex-1 flex flex-col min-h-screen" style={{ backgroundColor: '#FAFAF7' }}>

        {/* Mobile-only back button */}
        <div className="lg:hidden p-5 sm:p-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity duration-300 group"
            style={{ color: '#8B8680' }}
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Home
          </button>
        </div>

        {/* Form area — vertically centered */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-8 lg:px-12 py-8">
          <div className="w-full max-w-md">
            {/* Mobile-only logo */}
            <div className="lg:hidden flex items-center gap-3 mb-10">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#B8860B' }}
              >
                <Church className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight" style={{ color: '#2D2A26' }}>
                CovenantERP
              </span>
            </div>

            {/* Role icon + heading */}
            <div className="mb-10">
              <div className="flex items-center gap-3.5 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: isSuperAdmin
                      ? 'linear-gradient(135deg, #6B2D3E 0%, #8B3D52 100%)'
                      : 'linear-gradient(135deg, #6B2D3E 0%, #B8860B 100%)',
                  }}
                >
                  {isSuperAdmin ? (
                    <Shield className="h-5.5 w-5.5" style={{ color: '#D4A03C' }} />
                  ) : (
                    <UserCog className="h-5.5 w-5.5" style={{ color: '#D4A03C' }} />
                  )}
                </div>
                <div>
                  <h1
                    className="text-xl font-heading font-bold tracking-tight"
                    style={{ color: '#2D2A26' }}
                  >
                    {title}
                  </h1>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#8B8680' }}>
                {subtitle}
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div
                className="flex items-start gap-3 p-4 rounded-xl text-sm mb-7 animate-fade-in"
                style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                }}
              >
                <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" style={{ color: '#DC2626' }} />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username / Email field */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#4A4540' }}
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isSuperAdmin ? 'Enter super admin username' : 'Enter admin username'}
                  className="w-full px-4 py-3.5 rounded-xl text-base transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    border: '1px solid #E8E5E0',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    color: '#2D2A26',
                    caretColor: '#6B2D3E',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#6B2D3E';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(107, 45, 62, 0.1)';
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E8E5E0';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
                  }}
                  required
                  autoComplete="username"
                />
              </div>

              {/* Password field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#4A4540' }}
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
                    className="w-full px-4 py-3.5 rounded-xl text-base transition-all duration-200 focus:outline-none focus:ring-2 pr-14"
                    style={{
                      border: '1px solid #E8E5E0',
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      color: '#2D2A26',
                      caretColor: '#6B2D3E',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#6B2D3E';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(107, 45, 62, 0.1)';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#E8E5E0';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
                    }}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors duration-200 cursor-pointer"
                    style={{ color: '#8B8680' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(232, 229, 224, 0.6)';
                      e.currentTarget.style.color = '#4A4540';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#8B8680';
                    }}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !username.trim() || !password.trim()}
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  style={{
                    background: 'linear-gradient(135deg, #6B2D3E 0%, #8B3D52 50%, #6B2D3E 100%)',
                    boxShadow: '0 4px 16px rgba(107, 45, 62, 0.3), inset 0 1px 0 rgba(212, 160, 60, 0.15)',
                    backgroundSize: '200% 200%',
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.background =
                        'linear-gradient(135deg, #8B3D52 0%, #A04D65 50%, #8B3D52 100%)';
                      e.currentTarget.style.backgroundSize = '200% 200%';
                      e.currentTarget.style.boxShadow =
                        '0 6px 24px rgba(107, 45, 62, 0.4), inset 0 1px 0 rgba(212, 160, 60, 0.2)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      'linear-gradient(135deg, #6B2D3E 0%, #8B3D52 50%, #6B2D3E 100%)';
                    e.currentTarget.style.backgroundSize = '200% 200%';
                    e.currentTarget.style.boxShadow =
                      '0 4px 16px rgba(107, 45, 62, 0.3), inset 0 1px 0 rgba(212, 160, 60, 0.15)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    `Sign in as ${isSuperAdmin ? 'Super Admin' : 'Admin'}`
                  )}
                </button>
              </div>
            </form>

            {/* Credentials notice — no public credentials shown */}
            <div className="mt-8 text-center">
              <p className="text-xs" style={{ color: '#A8A29E' }}>
                Contact your institution administrator for login credentials
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 lg:px-12 py-5" style={{ borderTop: '1px solid #E8E5E0' }}>
          <p className="text-xs text-center" style={{ color: '#A8A29E' }}>
            &copy; {new Date().getFullYear()} CovenantERP &middot; Theological Institution Management System
          </p>
        </div>
      </div>
    </div>
  );
}
