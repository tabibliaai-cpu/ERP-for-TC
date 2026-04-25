import {
  Users, Wallet, BookOpen, Sparkles, Church, Shield, ArrowRight,
  GraduationCap, UserCog, Heart, Globe, Lock, CheckCircle, Menu, X,
  ChevronRight, BookMarked, BarChart3, MessageSquare
} from 'lucide-react';
import { useState } from 'react';
import { navigate } from '../utils/router';

const features = [
  {
    icon: GraduationCap,
    title: 'Student Lifecycle',
    description: 'From enrollment to graduation — spiritual profiles, academic records, ministry tracking, and comprehensive student management.',
  },
  {
    icon: UserCog,
    title: 'Faculty & Staff',
    description: 'Teacher qualifications, performance reviews, theological credentials, payroll, and mentorship tracking.',
  },
  {
    icon: Wallet,
    title: 'Financial Management',
    description: 'Dynamic fee structures, scholarship management, invoicing, sponsor tracking, and complete financial audit trails.',
  },
  {
    icon: BookOpen,
    title: 'Academic Programs',
    description: 'Build B.Th, M.Div, and diploma programs with full curriculum, grading, credit, and semester management.',
  },
  {
    icon: Sparkles,
    title: 'Pedagogy & Formation',
    description: 'Lesson planning, spiritual formation tracking, engagement analytics, and devotional progress monitoring.',
  },
  {
    icon: BookMarked,
    title: 'Theological Library',
    description: 'Manuscript cataloging, scripture-linked search, borrowing workflows, and faculty contribution systems.',
  },
];

const trustedBy = [
  'Grace Theological Seminary',
  'Living Word Bible College',
  'Hope International Seminary',
  'Covenant Bible Institute',
  'Emmanuel School of Theology',
  'Redeemed Seminary',
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ═══ NAVBAR ═══ */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <Church className="h-4 w-4 text-amber-400" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              Covenant<span className="text-amber-600">ERP</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Features</a>
            <a href="#modules" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Modules</a>
            <a href="#trusted" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Trusted By</a>
            <a href="#about" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">About</a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/login/admin')}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/login/super-admin')}
              className="text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 px-5 py-2 rounded-lg transition-colors shadow-sm"
            >
              Admin Portal
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2 -mr-2 text-slate-600" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-6 py-5 animate-fade-in">
            <div className="flex flex-col gap-1">
              <a href="#features" onClick={() => setMobileOpen(false)} className="py-2.5 text-sm text-slate-600 font-medium">Features</a>
              <a href="#modules" onClick={() => setMobileOpen(false)} className="py-2.5 text-sm text-slate-600 font-medium">Modules</a>
              <a href="#trusted" onClick={() => setMobileOpen(false)} className="py-2.5 text-sm text-slate-600 font-medium">Trusted By</a>
              <a href="#about" onClick={() => setMobileOpen(false)} className="py-2.5 text-sm text-slate-600 font-medium">About</a>
            </div>
            <div className="mt-5 pt-5 border-t border-slate-100 flex flex-col gap-2.5">
              <button onClick={() => { setMobileOpen(false); navigate('/login/admin'); }} className="w-full py-2.5 text-sm font-semibold text-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
                Sign In
              </button>
              <button onClick={() => { setMobileOpen(false); navigate('/login/super-admin'); }} className="w-full py-2.5 text-sm font-semibold text-center rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors">
                Admin Portal
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ═══ HERO ═══ */}
      <section className="relative pt-32 pb-24 md:pt-44 md:pb-36 px-6 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-amber-100/40 rounded-full blur-[100px]" />
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-slate-100/60 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/60 text-amber-700 text-xs font-semibold mb-8">
              <Shield className="h-3.5 w-3.5" />
              Built for Theological Education
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight text-slate-900">
              Manage your seminary
              <span className="block text-amber-600 mt-2">with purpose.</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-8 text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl">
              CovenantERP is the all-in-one platform for theological colleges and seminaries.
              Students, faculty, academics, finances, and spiritual formation — unified.
            </p>

            {/* CTA */}
            <div className="mt-10 flex flex-col sm:flex-row gap-3.5">
              <button
                onClick={() => navigate('/login/admin')}
                className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 shadow-lg shadow-amber-600/15 transition-all"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                Explore Features
              </a>
            </div>

            {/* Quick stats */}
            <div className="mt-16 flex flex-wrap gap-x-10 gap-y-4">
              {[
                { value: '50+', label: 'Institutions' },
                { value: '10,000+', label: 'Students' },
                { value: '99.9%', label: 'Uptime' },
                { value: '8+', label: 'Core Modules' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRUSTED BY ═══ */}
      <section id="trusted" className="py-16 px-6 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-10">
            Trusted by theological institutions worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            {trustedBy.map((name) => (
              <div key={name} className="flex items-center gap-2 text-slate-400">
                <Church className="h-4 w-4" />
                <span className="text-sm font-medium">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-4">
              Everything You Need
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              One platform for your entire institution
            </h2>
            <p className="mt-5 text-slate-500 text-lg leading-relaxed">
              Purpose-built for seminaries, Bible colleges, and theological training centers.
              Every module reflects the unique mission of theological education.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group p-8 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-100/50 transition-all duration-300 bg-white"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center mb-6 group-hover:bg-amber-600 transition-colors duration-300">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ MODULES ═══ */}
      <section id="modules" className="py-24 md:py-32 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <div className="lg:sticky lg:top-28">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-4">
                All Modules
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                Comprehensive theological management
              </h2>
              <p className="mt-5 text-slate-500 leading-relaxed text-lg">
                From student enrollment to graduation, academics to spiritual formation — every
                module is designed for the unique rhythm of theological education.
              </p>
              <button
                onClick={() => navigate('/login/admin')}
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 group transition-colors"
              >
                Start using all modules
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-0">
              {[
                'Student Enrollment & Spiritual Profiles',
                'Faculty Management & Performance Reviews',
                'Dynamic Academic Configuration',
                'Billing, Scholarships & Sponsorships',
                'Pedagogical Portal & Mentorship',
                'Theological Library & Research',
                'Reports & Custom Analytics',
                'Multi-Tenant Institution Control',
                'Yeshua AI Biblical Assistant',
                'White-Label Branding System',
                'Communications & Notifications',
                'Spiritual Formation Tracking',
              ].map((mod, i) => (
                <div key={i} className="flex items-start gap-3 py-5 border-b border-slate-200/60">
                  <CheckCircle className="h-4.5 w-4.5 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-600 font-medium">{mod}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ABOUT ═══ */}
      <section id="about" className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-4">
              Our Mission
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              Built for theological education,
              <span className="block text-amber-600 mt-2">not adapted for it.</span>
            </h2>
            <p className="mt-6 text-slate-500 text-lg leading-relaxed">
              CovenantERP treats every teacher as a spiritual leader, every student as a minister in
              training. From baptism records to ministry calling tracking, from sermon archives to
              devotional engagement — every feature reflects the unique mission of theological education.
            </p>
          </div>

          <div className="mt-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Lock, title: 'Secure', desc: 'End-to-end encryption for all institutional data' },
              { icon: Globe, title: 'Multi-Tenant', desc: 'Independent databases per institution' },
              { icon: Sparkles, title: 'AI-Powered', desc: 'Yeshua AI biblical research assistant' },
              { icon: Heart, title: 'Spiritual Formation', desc: 'Track faith journey alongside academics' },
            ].map((item) => (
              <div key={item.title} className="text-center p-8 rounded-2xl border border-slate-100 bg-white hover:shadow-lg hover:shadow-slate-100/50 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1.5">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 md:py-32 px-6 bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <Church className="h-10 w-10 text-amber-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Ready to equip your institution?
          </h2>
          <p className="mt-5 text-slate-300 text-lg leading-relaxed">
            Join theological institutions that are transforming their administration with
            CovenantERP. Set up in minutes, not months.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3.5 justify-center">
            <button
              onClick={() => navigate('/login/admin')}
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-500 shadow-lg shadow-amber-600/20 transition-all"
            >
              Admin Login
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/login/super-admin')}
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl border border-slate-600 text-slate-200 text-sm font-semibold hover:bg-slate-800 hover:border-slate-500 transition-all"
            >
              Super Admin Login
            </button>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-slate-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center">
              <Church className="h-3 w-3 text-amber-400" />
            </div>
            <span className="text-sm font-semibold text-slate-700">CovenantERP</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Features</a>
            <a href="#modules" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Modules</a>
            <a href="#about" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">About</a>
          </div>
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} CovenantERP. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
