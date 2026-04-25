import {
  Users, Wallet, BookOpen, MessageSquare, Sparkles,
  Church, Shield, ArrowRight, Heart, UserCog, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { navigate } from '../utils/router';

const features = [
  { icon: Users, title: 'Student Enrollment', desc: 'Spiritual profiles, academic records, ministry tracking, and comprehensive student lifecycle management.' },
  { icon: UserCog, title: 'Faculty Management', desc: 'Teacher qualifications, performance reviews, payroll, teaching assignments, and spiritual mentorship tracking.' },
  { icon: Wallet, title: 'Billing & Finance', desc: 'Dynamic fee structures, scholarship management, invoicing, sponsor tracking, and financial audit trails.' },
  { icon: BookOpen, title: 'Academic Programs', desc: 'Build programs, courses, and curricula dynamically with full semester, grading, and credit management.' },
  { icon: Sparkles, title: 'Pedagogy & Formation', desc: 'Lesson planning, resource hubs, student engagement analytics, and spiritual formation tracking.' },
  { icon: MessageSquare, title: 'Theological Library', desc: 'Manuscript cataloging, scripture-linked search, borrowing workflows, and faculty contribution systems.' },
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ═══════════ NAVBAR ═══════════ */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center">
              <Church className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Covenant<span className="text-amber-600">ERP</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <a href="#features" className="px-3.5 py-2 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors rounded-lg">Features</a>
            <a href="#modules" className="px-3.5 py-2 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors rounded-lg">Modules</a>
            <a href="#about" className="px-3.5 py-2 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors rounded-lg">About</a>

            <div className="w-px h-5 bg-slate-200 mx-2" />

            <button onClick={() => navigate('/login/admin')} className="px-4 py-2 text-[13px] font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              Sign In
            </button>
            <button onClick={() => navigate('/login/super-admin')} className="px-4 py-2 text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors">
              Super Admin
            </button>
          </div>

          <button className="md:hidden p-2 -mr-2 text-slate-500" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4 space-y-1 animate-fade-in">
            <a href="#features" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-slate-600">Features</a>
            <a href="#modules" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-slate-600">Modules</a>
            <a href="#about" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-slate-600">About</a>
            <div className="pt-3 flex flex-col gap-2">
              <button onClick={() => { setMobileOpen(false); navigate('/login/admin'); }} className="w-full py-2.5 text-sm font-semibold text-center rounded-lg border border-slate-200 text-slate-700">Admin Login</button>
              <button onClick={() => { setMobileOpen(false); navigate('/login/super-admin'); }} className="w-full py-2.5 text-sm font-semibold text-center rounded-lg bg-slate-900 text-white">Super Admin Login</button>
            </div>
          </div>
        )}
      </header>

      {/* ═══════════ HERO ═══════════ */}
      <section className="pt-32 pb-20 md:pt-44 md:pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-amber-700 text-xs font-semibold mb-8">
              <Shield className="h-3.5 w-3.5" />
              Theological Institution Management
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight text-slate-900">
              The ERP built for
              <br />
              <span className="text-amber-600">theological education</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 md:mt-8 text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl">
              Manage students, faculty, academics, finances, and spiritual formation across your seminary or Bible college — all from one platform.
            </p>

            {/* CTA */}
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/login/admin')}
                className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 shadow-lg shadow-amber-600/20 transition-all"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
              >
                See Features
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="features" className="py-20 md:py-28 px-6 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-3">Platform</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Everything your institution needs
            </h2>
            <p className="mt-4 text-slate-500 max-w-xl mx-auto">
              Purpose-built for seminaries, Bible colleges, and theological training centers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="group p-8 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-5">
                  <f.icon className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ MODULES LIST ═══════════ */}
      <section id="modules" className="py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-start">
            <div className="lg:sticky lg:top-28">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-3">All Modules</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Comprehensive theological management
              </h2>
              <p className="mt-4 text-slate-500 leading-relaxed">
                From student enrollment to graduation, academics to spiritual formation — every module reflects the unique mission of theological education.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-0">
              {[
                'Student Enrollment & Spiritual Profiles',
                'Teacher Management & Performance',
                'Dynamic Academic Configuration',
                'Billing, Scholarships & Sponsorships',
                'Pedagogical Portal & Mentorship',
                'Theological Library System',
                'Reports & Custom Analytics',
                'Multi-Tenant Institution Control',
                'Yeshua AI Biblical Assistant',
                'White-Label Branding System',
              ].map((mod, i) => (
                <div key={i} className="flex items-start gap-3 py-4 border-b border-slate-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <span className="text-sm text-slate-600">{mod}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ ABOUT ═══════════ */}
      <section id="about" className="py-20 md:py-28 px-6 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-3">About</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Built for theological education, not adapted for it
            </h2>
            <p className="mt-6 text-slate-500 text-lg leading-relaxed">
              CovenantERP treats every teacher as a spiritual leader, every student as a minister in training. From baptism records to ministry calling tracking, from sermon archives to devotional engagement — every feature reflects the unique mission of theological education.
            </p>
          </div>

          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, text: 'End-to-End Encryption' },
              { icon: Users, text: 'Multi-Tenant SaaS' },
              { icon: Sparkles, text: 'AI-Powered Assistant' },
              { icon: Heart, text: 'Spiritual Formation' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-5 rounded-2xl bg-white border border-slate-100">
                <item.icon className="h-5 w-5 text-amber-600 shrink-0" />
                <span className="text-sm font-medium text-slate-700">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Ready to equip your institution?
          </h2>
          <p className="mt-4 text-slate-500 max-w-lg mx-auto">
            Join theological institutions transforming their administration with CovenantERP.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/login/admin')}
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all"
            >
              Admin Login
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/login/super-admin')}
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
            >
              Super Admin Login
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-slate-100 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Church className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold text-slate-700">CovenantERP</span>
          </div>
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} CovenantERP. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
