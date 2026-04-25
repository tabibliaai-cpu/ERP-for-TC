import {
  Users, Wallet, CalendarDays, BookOpen, MessageSquare, Sparkles,
  Church, Shield, ArrowRight, Heart, UserCog, Lock
} from 'lucide-react';
import { navigate } from '../utils/router';

const features = [
  { icon: Users, title: 'Student Enrollment', description: 'Comprehensive profiles with academic, spiritual, ministry, and administrative details for every theology student.' },
  { icon: UserCog, title: 'Teacher Management', description: 'Manage faculty with spiritual profiles, qualifications, teaching assignments, payroll, and performance tracking.' },
  { icon: Wallet, title: 'Billing & Finance', description: 'Dynamic fee structures, scholarship management, sponsor tracking, invoicing, and complete financial audit trail.' },
  { icon: BookOpen, title: 'Academic Configuration', description: 'Build programs, courses, and curricula dynamically. Support for semester, yearly, and modular patterns.' },
  { icon: Sparkles, title: 'Pedagogical Portal', description: 'Lesson planning, teaching resources, student engagement tracking, spiritual formation, and mentorship systems.' },
  { icon: MessageSquare, title: 'Theological Library', description: 'Research-grade manuscript management, scripture-linked search, borrowing system, and faculty contribution workflows.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Church className="h-7 w-7 text-amber-600" />
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Covenant<span className="text-amber-600">ERP</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#about" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">About</a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-500 rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              Theological Institution Management
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Transforming Theological Education{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300">
                with Divine Purpose
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-blue-100/80 leading-relaxed max-w-2xl">
              The complete ERP platform for seminaries, Bible colleges, and theological training centers. Manage students, faculty, academics, finances, and spiritual formation — all in one place.
            </p>

            {/* LOGIN BUTTONS - PROMINENT */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/login/super-admin')}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 font-bold text-sm shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Lock className="h-5 w-5" />
                Super Admin Login
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/login/admin')}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl border-2 border-white/30 text-white font-bold text-sm hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <UserCog className="h-5 w-5" />
                Admin Login
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Info */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-blue-200/60">
              <span>Demo: superadmin / SuperAdmin@2024</span>
              <span className="hidden sm:inline">|</span>
              <span>Demo: admin / Admin@2024</span>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L48 55C96 50 192 40 288 35C384 30 480 30 576 33.3C672 36.7 768 43.3 864 45C960 46.7 1056 43.3 1152 38.3C1248 33.3 1344 26.7 1392 23.3L1440 20V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Login Cards Section */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Super Admin Card */}
            <button
              onClick={() => navigate('/login/super-admin')}
              className="group p-6 rounded-2xl border-2 border-gray-100 bg-white hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 text-left"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Super Admin</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Full platform control. Manage all institutions, global users, feature toggles, revenue analytics, and system security. Multi-tenant SaaS administration.
              </p>
              <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm group-hover:gap-3 transition-all">
                Sign in as Super Admin <ArrowRight className="h-4 w-4" />
              </div>
            </button>

            {/* Admin Card */}
            <button
              onClick={() => navigate('/login/admin')}
              className="group p-6 rounded-2xl border-2 border-gray-100 bg-white hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 text-left"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <UserCog className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Institution Admin</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Manage your seminary or Bible college. Students, teachers, academics, billing, library, pedagogy, reports, and spiritual formation tracking.
              </p>
              <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all">
                Sign in as Admin <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider">Complete ERP Platform</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Everything a Theological Institution Needs
            </h2>
            <p className="mt-4 text-gray-500 text-lg">
              From enrollment to graduation, academics to spiritual formation — a purpose-built platform for theological education.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="group relative p-6 lg:p-8 rounded-2xl border border-gray-100 bg-white hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-5">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider">About CovenantERP</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Purpose-Built for Theological Education
              </h2>
              <p className="mt-6 text-gray-600 leading-relaxed">
                CovenantERP is not a generic school management system adapted for theology. It is built from the ground up for seminaries, Bible colleges, and theological training centers — with spiritual formation at its core.
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Our platform treats every teacher as a spiritual leader and educator, every student as a minister in training. From baptism records to ministry calling tracking, from sermon archives to devotional engagement — every feature reflects the unique mission of theological education.
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Whether you lead a small Bible training center or a thriving seminary with multiple programs, CovenantERP scales with your needs through its multi-tenant SaaS architecture.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: Shield, text: 'End-to-End Encryption' },
                  { icon: Users, text: 'Multi-Tenant SaaS' },
                  { icon: Sparkles, text: 'AI-Powered Assistant' },
                  { icon: Heart, text: 'Spiritual Formation' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <item.icon className="h-4 w-4 text-amber-500" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-amber-100 to-blue-50 rounded-3xl blur-2xl opacity-60" />
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gradient-to-br from-slate-900 to-blue-950 p-8 sm:p-10">
                <h3 className="text-lg font-bold text-white mb-6">ERP Modules</h3>
                <div className="space-y-3">
                  {['Student Enrollment & Spiritual Profiles', 'Teacher Management & Performance', 'Dynamic Academic Configuration', 'Billing, Scholarships & Sponsorships', 'Pedagogical Portal & Mentorship', 'Theological Library System', 'Reports & Custom Analytics', 'Multi-Tenant Institution Control', 'Yeshua AI Biblical Assistant', 'White-Label Branding System'].map((mod, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-sm text-blue-100">{mod}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Ready to Equip Your Institution?
          </h2>
          <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
            Join theological institutions that are transforming their administration with CovenantERP.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/login/admin')} className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold text-sm shadow-lg hover:from-slate-800 hover:to-slate-700 transition-all">
              Get Started <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Church className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-semibold text-gray-700">CovenantERP</span>
            </div>
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} CovenantERP. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
