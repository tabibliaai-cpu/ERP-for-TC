import {
  Users, Wallet, BookOpen, Sparkles, Church, Shield, ArrowRight,
  GraduationCap, UserCog, Heart, Globe, Lock, CheckCircle, Menu, X,
  ChevronRight, BookMarked, BarChart3
} from 'lucide-react';
import { useState } from 'react';
import { navigate } from '../utils/router';

/* ================================================================
   Data
   ================================================================ */

const features = [
  {
    icon: GraduationCap,
    title: 'Student Lifecycle',
    description:
      'From enrollment to graduation — spiritual profiles, academic records, ministry tracking, and comprehensive student management.',
  },
  {
    icon: UserCog,
    title: 'Faculty & Staff',
    description:
      'Teacher qualifications, performance reviews, theological credentials, payroll, and mentorship tracking.',
  },
  {
    icon: Wallet,
    title: 'Financial Management',
    description:
      'Dynamic fee structures, scholarship management, invoicing, sponsor tracking, and complete financial audit trails.',
  },
  {
    icon: BookOpen,
    title: 'Academic Programs',
    description:
      'Build B.Th, M.Div, and diploma programs with full curriculum, grading, credit, and semester management.',
  },
  {
    icon: Sparkles,
    title: 'Pedagogy & Formation',
    description:
      'Lesson planning, spiritual formation tracking, engagement analytics, and devotional progress monitoring.',
  },
  {
    icon: BookMarked,
    title: 'Theological Library',
    description:
      'Manuscript cataloging, scripture-linked search, borrowing workflows, and faculty contribution systems.',
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

const modules = [
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
];

const trustCards = [
  {
    icon: Lock,
    title: 'Secure',
    description: 'End-to-end encryption for all institutional data',
  },
  {
    icon: Globe,
    title: 'Multi-Tenant',
    description: 'Independent databases per institution',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered',
    description: 'Yeshua AI biblical research assistant',
  },
  {
    icon: Heart,
    title: 'Spiritual Formation',
    description: 'Track faith journey alongside academics',
  },
];

const stats = [
  { value: '50+', label: 'Institutions' },
  { value: '10,000+', label: 'Students' },
  { value: '99.9%', label: 'Uptime' },
  { value: '8+', label: 'Core Modules' },
];

/* ================================================================
   Component
   ================================================================ */

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1F1F1F]">
      {/* ═══════════════════════════════════════════════════════════
          NAVBAR — Fixed, Glassmorphism
          ═══════════════════════════════════════════════════════════ */}
      <header className="fixed top-0 inset-x-0 z-50 glass-card border-b border-[#E8E5E0]/60">
        <nav className="max-w-7xl mx-auto px-6 lg:px-10 h-18 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#6B2D3E] flex items-center justify-center shadow-sm">
              <Church className="h-4.5 w-4.5 text-[#D4A03C]" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#1F1F1F]">
              Covenant<span className="text-[#B8860B]">ERP</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            <a
              href="#features"
              className="text-sm font-medium text-[#6B6B6B] hover:text-[#6B2D3E] transition-colors"
            >
              Features
            </a>
            <a
              href="#modules"
              className="text-sm font-medium text-[#6B6B6B] hover:text-[#6B2D3E] transition-colors"
            >
              Modules
            </a>
            <a
              href="#trusted"
              className="text-sm font-medium text-[#6B6B6B] hover:text-[#6B2D3E] transition-colors"
            >
              Trusted By
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-[#6B6B6B] hover:text-[#6B2D3E] transition-colors"
            >
              About
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/login/admin')}
              className="text-sm font-semibold text-[#6B2D3E] px-5 py-2.5 rounded-lg border border-[#6B2D3E]/20 hover:bg-[#6B2D3E]/[0.04] hover:border-[#6B2D3E]/40 transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/login/super-admin')}
              className="text-sm font-semibold text-white bg-[#6B2D3E] hover:bg-[#8B3D52] px-5 py-2.5 rounded-lg transition-all shadow-sm shadow-[#6B2D3E]/20"
            >
              Admin Portal
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 -mr-2 text-[#6B6B6B]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#E8E5E0] bg-white/95 backdrop-blur-xl px-6 py-6 animate-fade-in">
            <div className="flex flex-col gap-1">
              {['Features', 'Modules', 'Trusted By', 'About'].map((label) => (
                <a
                  key={label}
                  href={`#${label.toLowerCase().replace(' ', '-')}`}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-sm text-[#6B6B6B] font-medium hover:text-[#6B2D3E] transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-[#E8E5E0] flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  navigate('/login/admin');
                }}
                className="w-full py-3 text-sm font-semibold text-center rounded-lg border border-[#6B2D3E]/20 text-[#6B2D3E] hover:bg-[#6B2D3E]/[0.04] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  navigate('/login/super-admin');
                }}
                className="w-full py-3 text-sm font-semibold text-center rounded-lg bg-[#6B2D3E] text-white hover:bg-[#8B3D52] transition-colors"
              >
                Admin Portal
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION — Very Spacious
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative pt-40 pb-28 md:pt-48 md:pb-36 px-6 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#6B2D3E]/[0.03] rounded-full blur-[120px]" />
          <div className="absolute top-1/4 -left-32 w-[400px] h-[400px] bg-[#B8860B]/[0.04] rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 right-1/4 w-[350px] h-[350px] bg-[#D4A03C]/[0.03] rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="badge-primary mb-10">
              <Shield className="h-3.5 w-3.5" />
              Built for Theological Education
            </div>

            {/* Headline */}
            <h1 className="font-heading text-5xl md:text-6xl lg:text-[4.25rem] font-bold leading-[1.1] tracking-tight text-[#1F1F1F]">
              Equipping the Next Generation of{' '}
              <span className="text-[#B8860B]">Theological Leaders</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-8 text-lg md:text-xl text-[#6B6B6B] leading-relaxed max-w-2xl">
              CovenantERP unifies student management, academics, finances, spiritual
              formation, and library resources into one dignified platform.
            </p>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/login/admin')}
                className="btn-gold h-12 px-8 text-base"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#features"
                className="btn-outline h-12 px-8 text-base"
              >
                Explore Features
              </a>
            </div>

            {/* Stats Row */}
            <div className="mt-20 pt-12 border-t border-[#E8E5E0]">
              <div className="flex flex-wrap gap-x-14 gap-y-6">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="font-heading text-3xl font-bold text-[#1F1F1F]">
                      {stat.value}
                    </p>
                    <p className="text-sm text-[#9CA3AF] mt-1 font-medium">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TRUSTED BY SECTION
          ═══════════════════════════════════════════════════════════ */}
      <section id="trusted" className="py-20 px-6 bg-[#F5F2EE] border-y border-[#E8E5E0]">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs font-semibold text-[#9CA3AF] uppercase tracking-[0.15em] mb-12">
            Trusted by theological institutions worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {trustedBy.map((name) => (
              <div
                key={name}
                className="flex items-center gap-2.5 text-[#9CA3AF] hover:text-[#6B6B6B] transition-colors"
              >
                <Church className="h-4 w-4 opacity-60" />
                <span className="text-sm font-medium">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURES SECTION — 6 Cards in 3-Col Grid
          ═══════════════════════════════════════════════════════════ */}
      <section id="features" className="py-28 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-20">
            <div className="badge-gold mb-5">Everything You Need</div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-[#1F1F1F]">
              Purpose-Built for Theological Education
            </h2>
            <p className="mt-6 text-[#6B6B6B] text-lg leading-relaxed">
              Every module reflects the unique mission of theological education --
              from enrollment to spiritual formation, from academics to library management.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="card-elevated bg-white p-9 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#6B2D3E] flex items-center justify-center mb-7 group-hover:bg-[#8B3D52] transition-colors duration-300">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-[#1F1F1F] mb-3">
                    {f.title}
                  </h3>
                  <p className="text-[#6B6B6B] leading-relaxed text-[0.9375rem]">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          MODULES CHECKLIST SECTION — Two Column
          ═══════════════════════════════════════════════════════════ */}
      <section id="modules" className="py-28 md:py-32 px-6 bg-[#F5F2EE] border-y border-[#E8E5E0]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* Left Column */}
            <div className="lg:sticky lg:top-28">
              <div className="badge-primary mb-5">All Modules</div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-[#1F1F1F] leading-tight">
                Comprehensive Theological Management
              </h2>
              <p className="mt-6 text-[#6B6B6B] leading-relaxed text-lg">
                From student enrollment to graduation, academics to spiritual formation
                -- every module is designed for the unique rhythm of theological education.
              </p>
              <button
                onClick={() => navigate('/login/admin')}
                className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-[#B8860B] hover:text-[#8B6914] group transition-colors"
              >
                Start using all modules
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right Column — Checklist */}
            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-0">
              {modules.map((mod, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3.5 py-5 border-b border-[#E8E5E0]/80"
                >
                  <CheckCircle className="h-[18px] w-[18px] text-[#B8860B] mt-0.5 shrink-0" />
                  <span className="text-[0.9375rem] text-[#1F1F1F] font-medium leading-snug">
                    {mod}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          ABOUT / MISSION SECTION
          ═══════════════════════════════════════════════════════════ */}
      <section id="about" className="py-28 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Mission Statement */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="badge-primary mb-5">Our Mission</div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-[#1F1F1F] leading-tight">
              Built for theological education,
              <span className="block text-[#B8860B] mt-2">not adapted for it.</span>
            </h2>
            <p className="mt-8 text-[#6B6B6B] text-lg leading-relaxed">
              CovenantERP treats every teacher as a spiritual leader, every student as a
              minister in training. From baptism records to ministry calling tracking, from
              sermon archives to devotional engagement -- every feature reflects the sacred
              mission of theological education.
            </p>

            {/* Scripture Quote */}
            <blockquote className="mt-10 py-6 px-8 border-l-4 border-[#B8860B] bg-[#B8860B]/[0.03] rounded-r-lg text-left">
              <p className="font-heading text-lg italic text-[#1F1F1F] leading-relaxed">
                "Study to shew thyself approved unto God, a workman that needeth not to be
                ashamed, rightly dividing the word of truth."
              </p>
              <cite className="mt-3 block text-sm text-[#9CA3AF] font-semibold not-italic">
                -- 2 Timothy 2:15 (KJV)
              </cite>
            </blockquote>
          </div>

          {/* Trust Cards */}
          <div className="mt-24 grid sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {trustCards.map((item) => (
              <div
                key={item.title}
                className="text-center p-9 rounded-2xl border border-[#E8E5E0] bg-white card-elevated"
              >
                <div className="w-12 h-12 rounded-xl bg-[#6B2D3E]/[0.06] flex items-center justify-center mx-auto mb-6">
                  <item.icon className="h-5 w-5 text-[#6B2D3E]" />
                </div>
                <h3 className="font-heading text-base font-semibold text-[#1F1F1F] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA SECTION — Dark Background
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-32 px-6 bg-[#1A1F36] text-white relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#6B2D3E]/[0.12] rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-[#B8860B]/[0.06] rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mx-auto mb-8">
            <Church className="h-7 w-7 text-[#D4A03C]" />
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-white">
            Ready to Equip Your Institution?
          </h2>
          <p className="mt-6 text-[#9CA3AF] text-lg leading-relaxed">
            Join theological institutions that are transforming their administration
            with CovenantERP. Set up in minutes, not months.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login/admin')}
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-[#B8860B] text-white text-sm font-semibold hover:bg-[#D4A03C] shadow-lg shadow-[#B8860B]/20 transition-all"
            >
              Admin Login
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/login/super-admin')}
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl border border-white/20 text-white/90 text-sm font-semibold hover:bg-white/[0.06] hover:border-white/30 transition-all"
            >
              Super Admin Login
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-[#E8E5E0] bg-white py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#6B2D3E] flex items-center justify-center">
                <Church className="h-4 w-4 text-[#D4A03C]" />
              </div>
              <span className="text-base font-bold tracking-tight text-[#1F1F1F]">
                Covenant<span className="text-[#B8860B]">ERP</span>
              </span>
            </div>

            {/* Nav Links */}
            <div className="flex items-center gap-8">
              <a
                href="#features"
                className="text-sm text-[#9CA3AF] hover:text-[#6B2D3E] transition-colors font-medium"
              >
                Features
              </a>
              <a
                href="#modules"
                className="text-sm text-[#9CA3AF] hover:text-[#6B2D3E] transition-colors font-medium"
              >
                Modules
              </a>
              <a
                href="#trusted"
                className="text-sm text-[#9CA3AF] hover:text-[#6B2D3E] transition-colors font-medium"
              >
                Trusted By
              </a>
              <a
                href="#about"
                className="text-sm text-[#9CA3AF] hover:text-[#6B2D3E] transition-colors font-medium"
              >
                About
              </a>
            </div>

            {/* Copyright */}
            <p className="text-sm text-[#9CA3AF]">
              &copy; {new Date().getFullYear()} CovenantERP. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
