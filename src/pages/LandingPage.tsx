import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'motion/react';
import './LandingPage.css';

/* ─── Scroll-triggered fade-in ─── */
function FadeIn({ children, className = '', delay = 0, direction = 'up' }: {
  children: React.ReactNode; className?: string; delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const dirMap = {
    up: { y: 28, x: 0 },
    down: { y: -28, x: 0 },
    left: { x: 28, y: 0 },
    right: { x: -28, y: 0 },
  };
  const d = dirMap[direction];
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...d }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated counter ─── */
function CountUp({ end, suffix = '', prefix = '', decimals = 0 }: {
  end: number; suffix?: string; prefix?: string; decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const totalFrames = 90;
    const step = end / totalFrames;
    const tick = () => {
      start += step;
      if (start >= end) { setVal(end); return; }
      setVal(parseFloat(start.toFixed(decimals)));
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, end, decimals]);
  return <span ref={ref}>{prefix}{decimals > 0 ? val.toFixed(decimals) : val}{suffix}</span>;
}

/* ─── Dashboard preview images ─── */
import dashboardImg from '../assets/images/dashboard-preview.png';
import libraryImg from '../assets/images/library-preview.png';
import academicImg from '../assets/images/academic-preview.png';
import pedagogicalImg from '../assets/images/pedagogical-preview.png';

const SCREENS = [
  { src: dashboardImg, label: 'Dashboard', desc: 'Overview at a glance' },
  { src: libraryImg, label: 'Library', desc: 'Theological resources' },
  { src: academicImg, label: 'Academics', desc: 'Courses & grading' },
  { src: pedagogicalImg, label: 'Classroom', desc: 'Teaching portal' },
];

/* ─── 8 Feature modules ─── */
const FEATURES = [
  {
    title: 'Admissions & Students',
    desc: 'Unified student lifecycle management with automated notifications, document tracking, and pipeline analytics.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
    accent: 'indigo',
  },
  {
    title: 'Finance & Fees',
    desc: 'Fee structures, invoicing, scholarship management, and financial reporting with real-time dashboards.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/></svg>
    ),
    accent: 'emerald',
  },
  {
    title: 'Academic Management',
    desc: 'Curriculum planning, timetables, exams, grading, and transcripts with automated GPA tracking.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/></svg>
    ),
    accent: 'amber',
  },
  {
    title: 'Theological Library',
    desc: 'Manuscript cataloging, borrowing system, citation tools, and a research portal with scripture cross-references.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
    ),
    accent: 'rose',
  },
  {
    title: 'Faculty Management',
    desc: 'Faculty profiles, qualifications tracking, teaching assignments, and performance reviews.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
    accent: 'sky',
  },
  {
    title: 'Church Management',
    desc: 'Congregation records, ministry assignments, event scheduling, and pastoral care tracking.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/><path d="M9 22V12h6v10"/><path d="M9 12V9a3 3 0 0 1 6 0"/></svg>
    ),
    accent: 'violet',
  },
  {
    title: 'Classroom & Pedagogy',
    desc: 'Lesson planning, assignment management, attendance tracking, and student-teacher communication.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
    ),
    accent: 'teal',
  },
  {
    title: 'Multi-Institution',
    desc: 'One platform, unlimited campuses. Centralized control with local autonomy and unified reporting.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
    ),
    accent: 'orange',
  },
];

const STATS = [
  { value: 120, suffix: '+', label: 'Institutions', desc: 'Across 8 countries' },
  { value: 2, suffix: 'x', label: 'Faster Operations', desc: 'Avg. time saved' },
  { value: 100, suffix: '%', label: 'Data Security', desc: 'Encrypted at rest & transit' },
  { value: 99.9, suffix: '%', label: 'Uptime SLA', desc: 'Enterprise reliability', decimals: 1 },
];

const TRUST_LOGOS = [
  'Grace Seminary', 'Bethel College', 'New Life Theological',
  'Covenant University', 'India Bible College', 'SABC Bangalore',
];

const TESTIMONIALS = [
  {
    quote: 'CovenantERP unified our admissions, finance, and academic workflows into a single system. What used to take days now takes minutes.',
    name: 'Dr. Samuel Raj',
    role: 'Principal, Grace Seminary',
    initials: 'SR',
    color: 'indigo',
  },
  {
    quote: 'The theological library module alone justified the investment. Our faculty and students love the manuscript cataloging and citation tools.',
    name: 'Prof. Maria Thomas',
    role: 'Dean of Academics, Bethel College',
    initials: 'MT',
    color: 'emerald',
  },
  {
    quote: 'Multi-institution support means we manage all three of our campuses from one dashboard. Incredible efficiency and time savings.',
    name: 'Rev. David Kumar',
    role: 'Director, New Life Theological',
    initials: 'DK',
    color: 'amber',
  },
];

const FAQ_ITEMS = [
  { q: 'Is CovenantERP suitable for small Bible colleges?', a: 'Absolutely. CovenantERP is designed to scale from single-campus Bible institutes with 50 students to multi-campus universities with thousands. Our flexible plans and modular architecture mean you only pay for what you need, and the system grows with your institution.' },
  { q: 'How long does onboarding take?', a: 'Most institutions are fully operational within 3-5 business days. Our onboarding wizard handles institution setup, branding, and initial configuration. Our support team is available throughout the process to ensure a smooth transition.' },
  { q: 'Can we migrate from our current system?', a: 'Yes. We provide guided data migration for student records, financial history, academic transcripts, and library catalogs. Our team handles the technical work while your staff validates the data at each step.' },
  { q: 'Is our data secure?', a: 'Security is foundational. All data is encrypted at rest and in transit using AES-256 encryption. We implement role-based access control, comprehensive audit logging, and maintain SOC 2 compliance with 99.9% uptime SLA.' },
  { q: 'Do you offer training for our staff?', a: 'Yes. Every subscription includes onboarding training sessions, comprehensive documentation, and video tutorials. Premium plans include dedicated account management and quarterly training workshops.' },
];

const AVATAR_COLORS = ['#2563eb', '#059669', '#d97706', '#0284c7', '#7c3aed'];

/* ─── Accent color maps ─── */
const accentIconBg: Record<string, string> = {
  indigo: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  sky: 'bg-sky-50 text-sky-600',
  violet: 'bg-violet-50 text-violet-600',
  teal: 'bg-teal-50 text-teal-600',
  orange: 'bg-orange-50 text-orange-600',
};

const accentTopBar: Record<string, string> = {
  indigo: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  sky: 'bg-sky-500',
  violet: 'bg-violet-500',
  teal: 'bg-teal-500',
  orange: 'bg-orange-500',
};

const accentAvatar: Record<string, string> = {
  indigo: 'bg-blue-100 text-blue-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
};

const accentBorder: Record<string, string> = {
  indigo: 'border-t-blue-500',
  emerald: 'border-t-emerald-500',
  amber: 'border-t-amber-500',
};

/* ═══════════════════════════════════════════════════════════════════════ */

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeScreen, setActiveScreen] = useState(0);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setActiveScreen((i) => (i + 1) % SCREENS.length), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMobileMenuOpen(false); };
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll);
    return () => { window.removeEventListener('resize', onResize); window.removeEventListener('scroll', onScroll); };
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased overflow-x-hidden">

      {/* ═══ NAVBAR ═══ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md transition-colors duration-200 ${navScrolled ? 'border-b border-slate-200' : 'border-b border-transparent'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#2563eb" />
                <path d="M2 17l10 5 10-5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12l10 5 10-5" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">CovenantERP</span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {['Features', 'Product', 'Testimonials', 'FAQ'].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className={`md:hidden flex flex-col justify-center items-center gap-[5px] w-9 h-9 bg-transparent border-none cursor-pointer p-2 rounded-md hover:bg-slate-50 transition-colors`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-[18px] h-[1.5px] bg-slate-900 rounded transition-all duration-200 origin-center ${mobileMenuOpen ? 'translate-y-[3.5px] rotate-45' : ''}`} />
            <span className={`block w-[18px] h-[1.5px] bg-slate-900 rounded transition-all duration-200 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-[18px] h-[1.5px] bg-slate-900 rounded transition-all duration-200 origin-center ${mobileMenuOpen ? '-translate-y-[3.5px] -rotate-45' : ''}`} />
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="overflow-hidden border-t border-slate-100 bg-white px-4 sm:px-6 lg:px-8"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {['Features', 'Product', 'Testimonials', 'FAQ'].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3.5 text-base font-medium text-slate-500 hover:text-blue-600 border-b border-slate-50 last:border-b-0 transition-colors"
                >
                  {link}
                </a>
              ))}
              <div className="flex gap-3 py-4 pb-5">
                <button
                  onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                  className="flex-1 text-center py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                  className="flex-1 text-center py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ═══ 1. HERO ═══ */}
      <section className="min-h-screen pt-32 pb-24 md:pt-40 md:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="max-w-xl">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-sm font-medium text-blue-600 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Now serving 120+ institutions worldwide
              </div>
            </FadeIn>
            <FadeIn delay={0.08}>
              <h1 className="text-4xl sm:text-[2.75rem] lg:text-[3.25rem] font-extrabold tracking-tight leading-[1.1] text-slate-900 mb-5">
                The ERP built for{' '}
                <span className="text-blue-600">theological education.</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="text-base sm:text-lg text-slate-500 leading-relaxed mb-8">
                Manage admissions, academics, finance, library, faculty, and campus operations
                from one unified platform. Designed for seminaries, Bible colleges,
                and theological institutions.
              </p>
            </FadeIn>
            <FadeIn delay={0.24}>
              <div className="flex flex-wrap gap-3 mb-10">
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                >
                  Start Free Trial
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                </button>
                <button className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 cursor-pointer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Watch Demo
                </button>
              </div>
            </FadeIn>
            <FadeIn delay={0.32}>
              <div className="flex items-center gap-3.5">
                <div className="flex">
                  {['SR', 'MT', 'DK', 'AJ', 'PN'].map((a, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full text-white flex items-center justify-center text-[0.6rem] font-semibold border-2 border-white shadow-sm hover:-translate-y-0.5 transition-transform"
                      style={{
                        zIndex: 5 - i,
                        marginLeft: i > 0 ? '-8px' : '0',
                        background: AVATAR_COLORS[i],
                      }}
                    >
                      {a}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex gap-px">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    ))}
                  </div>
                  <span className="text-xs font-medium text-slate-400">Trusted by 120+ institutions</span>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right Visual */}
          <FadeIn delay={0.15} direction="right">
            <div className="relative">
              {/* Browser Mockup */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                {/* Browser Bar */}
                <div className="flex items-center px-4 py-3 bg-slate-50 border-b border-slate-100 gap-3">
                  <div className="flex gap-1.5 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    {['Dashboard', 'Students', 'Finance'].map((tab, i) => (
                      <span
                        key={tab}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                          i === 0
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-400 hover:text-slate-500'
                        }`}
                      >
                        {tab}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Screenshot */}
                <img
                  src={dashboardImg}
                  alt="CovenantERP Dashboard"
                  className="block w-full h-auto"
                />
              </div>

              {/* Floating Stat Card 1 */}
              <div className="hidden lg:flex absolute top-[8%] -right-3 items-center gap-2.5 px-3.5 py-2.5 bg-white border border-slate-100 rounded-xl shadow-lg z-10">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div>
                  <div className="text-[0.65rem] text-slate-400 font-medium leading-none mb-0.5">Enrollment</div>
                  <div className="text-sm font-bold text-emerald-600 leading-none">+24%</div>
                </div>
              </div>

              {/* Floating Stat Card 2 */}
              <div className="hidden lg:flex absolute bottom-[12%] -left-3 items-center gap-2.5 px-3.5 py-2.5 bg-white border border-slate-100 rounded-xl shadow-lg z-10">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div>
                  <div className="text-[0.65rem] text-slate-400 font-medium leading-none mb-0.5">Fees Collected</div>
                  <div className="text-sm font-bold text-slate-900 leading-none">$48,250</div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ 2. TRUSTED BY ═══ */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 border-t border-b border-slate-100">
        <FadeIn>
          <p className="text-center text-xs font-medium text-slate-400 uppercase tracking-wide mb-5">
            Trusted by leading theological institutions
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center items-center gap-6 sm:gap-8">
            {TRUST_LOGOS.map((name, i) => (
              <span
                key={i}
                className="text-sm sm:text-base font-semibold text-slate-300 opacity-35 hover:opacity-70 transition-opacity select-none tracking-tight"
              >
                {name}
              </span>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ═══ 3. FEATURES ═══ */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <FadeIn>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-3">
                <span className="w-4 h-0.5 bg-blue-600 rounded" />
                Features
              </p>
            </FadeIn>
            <FadeIn delay={0.08}>
              <h2 className="text-2xl sm:text-3xl lg:text-[2.6rem] font-bold tracking-tight leading-tight text-slate-900 mb-4">
                Everything your institution needs.
              </h2>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="text-base text-slate-500 leading-relaxed max-w-lg mx-auto">
                Eight core modules, one unified platform. Each module integrates seamlessly with the others.
              </p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <div className="group relative bg-white border border-slate-100 rounded-xl p-6 text-left hover:border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                  {/* Top accent line on hover */}
                  <div className={`absolute top-0 left-0 right-0 h-0.5 ${accentTopBar[f.accent]} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${accentIconBg[f.accent]}`}>
                    {f.icon}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2 tracking-tight">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed pr-4">{f.desc}</p>
                  <div className="absolute bottom-6 right-6 w-6 h-6 rounded-full flex items-center justify-center text-slate-300 opacity-0 -translate-x-1 group-hover:opacity-50 group-hover:translate-x-0 transition-all duration-200">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4. PRODUCT PREVIEW ═══ */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50" id="preview">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12 items-start">
          <div>
            <FadeIn>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-3">
                <span className="w-4 h-0.5 bg-blue-600 rounded" />
                Product Preview
              </p>
            </FadeIn>
            <FadeIn delay={0.08}>
              <h2 className="text-2xl sm:text-3xl lg:text-[2.6rem] font-bold tracking-tight leading-tight text-slate-900 mb-4">
                See it in action.
              </h2>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="text-base text-slate-500 leading-relaxed mb-6">
                Explore the modules that power theological institutions worldwide.
              </p>
            </FadeIn>
            <div className="flex flex-col gap-1">
              {SCREENS.map((s, i) => (
                <FadeIn key={i} delay={0.24 + i * 0.05}>
                  <button
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-left transition-all duration-150 w-full cursor-pointer ${
                      i === activeScreen
                        ? 'bg-white border border-slate-200 shadow-sm'
                        : 'bg-transparent border border-transparent hover:bg-white hover:border-slate-100'
                    }`}
                    onClick={() => setActiveScreen(i)}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 transition-all duration-150 ${
                      i === activeScreen
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-slate-300'
                    }`} style={i === activeScreen ? {} : { borderWidth: '2px' }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900">{s.label}</div>
                      <div className="text-xs text-slate-400 leading-none">{s.desc}</div>
                    </div>
                    {i === activeScreen && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 shrink-0">
                        <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
                      </svg>
                    )}
                  </button>
                </FadeIn>
              ))}
            </div>
          </div>

          <FadeIn delay={0.12} direction="right">
            <div className="relative">
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                {/* Browser Bar */}
                <div className="flex items-center px-4 py-3 bg-slate-50 border-b border-slate-100 gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  <div className="ml-2.5 text-xs text-slate-400 bg-white px-3 py-1 rounded-md border border-slate-100 flex-1 truncate font-mono">
                    app.covenanterp.com/{SCREENS[activeScreen].label.toLowerCase()}
                  </div>
                </div>
                {/* Screenshot */}
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeScreen}
                    src={SCREENS[activeScreen].src}
                    alt={SCREENS[activeScreen].label}
                    className="block w-full h-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ 5. STATS ═══ */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 border-t border-b border-slate-100">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
          {STATS.map((s, i) => (
            <FadeIn key={i} delay={i * 0.06}>
              <div className="relative flex flex-col items-center text-center py-7 px-4 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="hidden lg:block absolute right-0 top-[20%] h-[60%] w-px bg-slate-100 last:hidden" />
                <span className="text-3xl sm:text-[2.5rem] lg:text-[2.75rem] font-extrabold tracking-tight text-blue-600 leading-none">
                  <CountUp end={s.value} suffix={s.suffix} decimals={s.decimals || 0} />
                </span>
                <span className="text-sm sm:text-base font-semibold text-slate-900 mt-2">{s.label}</span>
                <span className="text-xs text-slate-400 mt-1">{s.desc}</span>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 6. TESTIMONIALS ═══ */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8" id="testimonials">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <FadeIn>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-3">
                <span className="w-4 h-0.5 bg-blue-600 rounded" />
                Testimonials
              </p>
            </FadeIn>
            <FadeIn delay={0.08}>
              <h2 className="text-2xl sm:text-3xl lg:text-[2.6rem] font-bold tracking-tight leading-tight text-slate-900 mb-4">
                Loved by administrators.
              </h2>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="text-base text-slate-500 leading-relaxed max-w-lg mx-auto">
                Hear from the leaders who transformed their institutions with CovenantERP.
              </p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className={`bg-white border border-slate-100 border-t-2 ${accentBorder[t.color]} rounded-xl p-6 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
                  <div className="flex gap-0.5 mb-3.5">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    ))}
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed italic mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${accentAvatar[t.color]}`}>
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                      <div className="text-xs text-slate-400">{t.role}</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. FAQ ═══ */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50" id="faq">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 lg:gap-12 items-start">
          <div>
            <FadeIn>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-3">
                <span className="w-4 h-0.5 bg-blue-600 rounded" />
                FAQ
              </p>
            </FadeIn>
            <FadeIn delay={0.08}>
              <h2 className="text-2xl sm:text-3xl lg:text-[2.6rem] font-bold tracking-tight leading-tight text-slate-900 mb-4">
                Common questions.
              </h2>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="text-base text-slate-500 leading-relaxed">
                Everything you need to know about getting started with CovenantERP.
              </p>
            </FadeIn>
          </div>

          <div className="flex flex-col gap-2">
            {FAQ_ITEMS.map((item, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <div className={`bg-white border rounded-xl overflow-hidden transition-all duration-200 ${
                  faqOpen === i
                    ? 'border-blue-100 shadow-sm'
                    : 'border-slate-100 hover:border-slate-200'
                }`}>
                  <button
                    className="flex items-center justify-between gap-4 w-full px-5 py-4 bg-transparent border-none cursor-pointer text-left text-sm font-semibold text-slate-900 transition-colors"
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  >
                    <span className={faqOpen === i ? 'text-blue-600' : ''}>{item.q}</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`shrink-0 transition-all duration-200 ${faqOpen === i ? 'rotate-180 text-blue-600' : 'text-slate-400'}`}
                    >
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    faqOpen === i ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <p className="px-5 pb-4 text-sm text-slate-500 leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 8. CTA ═══ */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white text-center relative overflow-hidden">
        <FadeIn>
          <h2 className="text-2xl sm:text-3xl lg:text-[2.4rem] font-bold tracking-tight mb-4 relative z-10">
            Ready to modernize your institution?
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-base text-slate-400 max-w-md mx-auto leading-relaxed mb-8 relative z-10">
            Join 120+ theological institutions already using CovenantERP. Start your free trial today.
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="flex flex-wrap gap-3 justify-center relative z-10">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              Get Started Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
            </button>
            <button className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white border border-white/20 rounded-lg hover:bg-white/10 hover:border-white/40 transition-all cursor-pointer">
              Book a Demo
            </button>
          </div>
        </FadeIn>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-slate-900 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          {/* Top */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-10 lg:gap-16 pb-12 border-b border-white/[0.08]">
            {/* Brand */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#60a5fa" />
                  <path d="M2 17l10 5 10-5" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12l10 5 10-5" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-bold text-lg tracking-tight text-white">CovenantERP</span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed max-w-[280px]">
                The complete ERP platform for theological institutions.
              </p>
            </div>

            {/* Columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-1">Product</h4>
                <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</a>
                <a href="#preview" className="text-sm text-white/60 hover:text-white transition-colors">Preview</a>
                <a href="#faq" className="text-sm text-white/60 hover:text-white transition-colors">FAQ</a>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-1">Company</h4>
                <a href="#about" className="text-sm text-white/60 hover:text-white transition-colors">About</a>
                <a href="#careers" className="text-sm text-white/60 hover:text-white transition-colors">Careers</a>
                <a href="#contact" className="text-sm text-white/60 hover:text-white transition-colors">Contact</a>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-1">Legal</h4>
                <a href="#privacy" className="text-sm text-white/60 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#terms" className="text-sm text-white/60 hover:text-white transition-colors">Terms of Service</a>
                <a href="#security" className="text-sm text-white/60 hover:text-white transition-colors">Security</a>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
            <span className="text-xs text-white/30">
              &copy; {new Date().getFullYear()} CovenantERP. All rights reserved.
            </span>
            <div className="flex gap-4">
              <a href="#twitter" aria-label="Twitter" className="text-white/30 hover:text-white/70 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#linkedin" aria-label="LinkedIn" className="text-white/30 hover:text-white/70 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
