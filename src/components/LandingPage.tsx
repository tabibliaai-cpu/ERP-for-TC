import {
  Users, Wallet, CalendarDays, BookOpen, MessageSquare, Sparkles,
  Church, Shield, ArrowRight, Heart, UserCog, Lock, Menu, X
} from 'lucide-react';
import { useState } from 'react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ═══════════════════ HEADER / NAVBAR ═══════════════════ */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-sm">
                <Church className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900">
                Covenant<span className="text-amber-600">ERP</span>
              </span>
            </div>

            {/* Desktop: Nav Links + Login Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <a href="#features" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#about" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">About</a>

              {/* Divider */}
              <div className="w-px h-6 bg-gray-200 mx-1" />

              {/* Super Admin Login — Gold */}
              <button
                onClick={() => navigate('/login/super-admin')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors shadow-sm"
              >
                <Shield className="h-4 w-4" />
                Super Admin
              </button>

              {/* Admin Login — Slate */}
              <button
                onClick={() => navigate('/login/admin')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                <UserCog className="h-4 w-4" />
                Admin Login
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-3 space-y-1 animate-fade-in">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Features</a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">About</a>
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/login/super-admin'); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-semibold"
                >
                  <Shield className="h-4 w-4" />
                  Super Admin Login
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/login/admin'); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold"
                >
                  <UserCog className="h-4 w-4" />
                  Admin Login
                </button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Subtle glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              The Complete ERP for{' '}
              <span className="text-amber-400">Theological Institutions</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Manage students, faculty, academics, finances, library, and spiritual formation across multiple seminaries and Bible colleges — all from one powerful platform.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/login/admin')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-slate-600 text-slate-300 font-semibold text-sm hover:bg-slate-800 transition-colors"
              >
                Explore Features
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES SECTION ═══════════════════ */}
      <section id="features" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Everything Your Institution Needs
            </h2>
            <p className="mt-3 text-gray-500">
              Purpose-built modules for seminaries, Bible colleges, and theological training centers.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <div key={feature.title} className="p-6 rounded-xl border border-gray-200 bg-white hover:border-amber-300 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1.5">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ ABOUT SECTION ═══════════════════ */}
      <section id="about" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Built for Theological Education
              </h2>
              <p className="mt-5 text-gray-600 leading-relaxed">
                CovenantERP is not a generic school management system. It is built from the ground up for seminaries, Bible colleges, and theological training centers — with spiritual formation at its core.
              </p>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Every teacher is a spiritual leader. Every student is a minister in training. From baptism records to ministry calling tracking, every feature reflects the unique mission of theological education.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
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
            <div className="rounded-xl border border-gray-200 bg-slate-900 p-8">
              <h3 className="text-base font-bold text-white mb-5">All Modules</h3>
              <div className="space-y-2.5">
                {['Student Enrollment & Spiritual Profiles', 'Teacher Management & Performance', 'Dynamic Academic Configuration', 'Billing, Scholarships & Sponsorships', 'Pedagogical Portal & Mentorship', 'Theological Library System', 'Reports & Custom Analytics', 'Multi-Tenant Institution Control', 'Yeshua AI Biblical Assistant', 'White-Label Branding System'].map((mod, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="text-sm text-slate-300">{mod}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Church className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-semibold text-gray-700">CovenantERP</span>
            </div>
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} CovenantERP. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
