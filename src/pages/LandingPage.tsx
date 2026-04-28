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
    <div className="lp-root">

      {/* ═══ NAVBAR ═══ */}
      <nav
        className="lp-nav"
        style={{ borderBottom: navScrolled ? '1px solid var(--lp-border-light)' : '1px solid transparent' }}
      >
        <div className="lp-nav-inner">
          <div className="lp-nav-brand">
            <div className="lp-nav-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#2563eb" />
                <path d="M2 17l10 5 10-5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12l10 5 10-5" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="lp-nav-name">CovenantERP</span>
          </div>
          <div className="lp-nav-links">
            <a href="#features">Features</a>
            <a href="#preview">Product</a>
            <a href="#testimonials">Testimonials</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="lp-nav-actions">
            <button className="lp-nav-login" onClick={() => navigate('/login')}>Sign In</button>
            <button className="lp-nav-cta" onClick={() => navigate('/login')}>Get Started</button>
          </div>
          <button
            className={`lp-nav-hamburger ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="lp-mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#preview" onClick={() => setMobileMenuOpen(false)}>Product</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
              <div className="lp-mobile-actions">
                <button className="lp-nav-login" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>Sign In</button>
                <button className="lp-nav-cta" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>Get Started</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ═══ 1. HERO ═══ */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-hero-content">
            <FadeIn>
              <div className="lp-hero-badge">
                <span className="lp-badge-dot" />
                Now serving 120+ institutions worldwide
              </div>
            </FadeIn>
            <FadeIn delay={0.08}>
              <h1 className="lp-hero-title">
                The ERP built for
                <span className="lp-title-accent"> theological education.</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="lp-hero-desc">
                Manage admissions, academics, finance, library, faculty, and campus operations
                from one unified platform. Designed for seminaries, Bible colleges,
                and theological institutions.
              </p>
            </FadeIn>
            <FadeIn delay={0.24}>
              <div className="lp-hero-actions">
                <button className="lp-btn-primary" onClick={() => navigate('/login')}>
                  Start Free Trial
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                </button>
                <button className="lp-btn-outline">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Watch Demo
                </button>
              </div>
            </FadeIn>
            <FadeIn delay={0.32}>
              <div className="lp-hero-proof">
                <div className="lp-avatars">
                  {['SR', 'MT', 'DK', 'AJ', 'PN'].map((a, i) => (
                    <div key={i} className="lp-avatar" style={{
                      zIndex: 5 - i,
                      marginLeft: i > 0 ? '-8px' : '0',
                      background: AVATAR_COLORS[i],
                    }}>{a}</div>
                  ))}
                </div>
                <div className="lp-proof-text">
                  <div className="lp-stars">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    ))}
                  </div>
                  <span>Trusted by 120+ institutions</span>
                </div>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.15} direction="right">
            <div className="lp-hero-visual">
              <div className="lp-hero-mockup">
                <div className="lp-mockup-bar">
                  <div className="lp-mockup-dots">
                    <span /><span /><span />
                  </div>
                  <div className="lp-mockup-tabs">
                    <span className="active">Dashboard</span>
                    <span>Students</span>
                    <span>Finance</span>
                  </div>
                </div>
                <img src={dashboardImg} alt="CovenantERP Dashboard" className="lp-mockup-img" />
              </div>
              <div className="lp-float-card lp-float-1">
                <div className="lp-float-icon lp-float-green">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div>
                  <div className="lp-float-label">Enrollment</div>
                  <div className="lp-float-value lp-float-value-green">+24%</div>
                </div>
              </div>
              <div className="lp-float-card lp-float-2">
                <div className="lp-float-icon lp-float-indigo">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div>
                  <div className="lp-float-label">Fees Collected</div>
                  <div className="lp-float-value">$48,250</div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ 2. TRUSTED BY ═══ */}
      <section className="lp-trust">
        <FadeIn>
          <p className="lp-trust-label">Trusted by leading theological institutions</p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="lp-trust-logos">
            {TRUST_LOGOS.map((name, i) => (
              <span key={i} className="lp-trust-logo">{name}</span>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ═══ 3. FEATURES ═══ */}
      <section className="lp-features" id="features">
        <FadeIn>
          <p className="lp-section-label">Features</p>
        </FadeIn>
        <FadeIn delay={0.08}>
          <h2 className="lp-section-title">Everything your institution needs.</h2>
        </FadeIn>
        <FadeIn delay={0.16}>
          <p className="lp-section-desc">Eight core modules, one unified platform. Each module integrates seamlessly with the others.</p>
        </FadeIn>

        <div className="lp-bento">
          {FEATURES.map((f, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <div className={`lp-bento-card lp-accent-${f.accent}`}>
                <div className={`lp-bento-icon lp-icon-${f.accent}`}>{f.icon}</div>
                <h3 className="lp-bento-title">{f.title}</h3>
                <p className="lp-bento-desc">{f.desc}</p>
                <div className="lp-bento-arrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 4. PRODUCT PREVIEW ═══ */}
      <section className="lp-preview" id="preview">
        <div className="lp-preview-inner">
          <div className="lp-preview-text">
            <FadeIn>
              <p className="lp-section-label">Product Preview</p>
            </FadeIn>
            <FadeIn delay={0.08}>
              <h2 className="lp-section-title">See it in action.</h2>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="lp-section-desc">Explore the modules that power theological institutions worldwide.</p>
            </FadeIn>
            <div className="lp-preview-list">
              {SCREENS.map((s, i) => (
                <FadeIn key={i} delay={0.24 + i * 0.05}>
                  <button
                    className={`lp-preview-item ${i === activeScreen ? 'active' : ''}`}
                    onClick={() => setActiveScreen(i)}
                  >
                    <span className="lp-preview-dot" />
                    <div>
                      <div className="lp-preview-item-title">{s.label}</div>
                      <div className="lp-preview-item-desc">{s.desc}</div>
                    </div>
                    {i === activeScreen && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
                      </svg>
                    )}
                  </button>
                </FadeIn>
              ))}
            </div>
          </div>
          <FadeIn delay={0.12} direction="right">
            <div className="lp-preview-screen">
              <div className="lp-preview-browser">
                <div className="lp-browser-bar">
                  <span /><span /><span />
                  <div className="lp-browser-url">app.covenanterp.com/{SCREENS[activeScreen].label.toLowerCase()}</div>
                </div>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeScreen}
                    src={SCREENS[activeScreen].src}
                    alt={SCREENS[activeScreen].label}
                    className="lp-browser-img"
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
      <section className="lp-stats">
        <div className="lp-stats-grid">
          {STATS.map((s, i) => (
            <FadeIn key={i} delay={i * 0.06}>
              <div className="lp-stat">
                <span className="lp-stat-value">
                  <CountUp end={s.value} suffix={s.suffix} decimals={s.decimals || 0} />
                </span>
                <span className="lp-stat-label">{s.label}</span>
                <span className="lp-stat-desc">{s.desc}</span>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 6. TESTIMONIALS ═══ */}
      <section className="lp-testimonials" id="testimonials">
        <FadeIn>
          <p className="lp-section-label">Testimonials</p>
        </FadeIn>
        <FadeIn delay={0.08}>
          <h2 className="lp-section-title">Loved by administrators.</h2>
        </FadeIn>
        <FadeIn delay={0.16}>
          <p className="lp-section-desc">Hear from the leaders who transformed their institutions with CovenantERP.</p>
        </FadeIn>
        <div className="lp-testimonial-grid">
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div className={`lp-testimonial-card lp-card-${t.color}`}>
                <div className="lp-testimonial-stars">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  ))}
                </div>
                <p className="lp-testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
                <div className="lp-testimonial-author">
                  <div className={`lp-author-avatar lp-avatar-${t.color}`}>{t.initials}</div>
                  <div>
                    <div className="lp-author-name">{t.name}</div>
                    <div className="lp-author-role">{t.role}</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══ 7. FAQ ═══ */}
      <section className="lp-faq" id="faq">
        <div className="lp-faq-inner">
          <div className="lp-faq-text">
            <FadeIn>
              <p className="lp-section-label">FAQ</p>
            </FadeIn>
            <FadeIn delay={0.08}>
              <h2 className="lp-section-title">Common questions.</h2>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="lp-section-desc">Everything you need to know about getting started with CovenantERP.</p>
            </FadeIn>
          </div>
          <div className="lp-faq-list">
            {FAQ_ITEMS.map((item, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <div className={`lp-faq-item ${faqOpen === i ? 'open' : ''}`}>
                  <button className="lp-faq-q" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                    <span>{item.q}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div className="lp-faq-a">
                    <p>{item.a}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 8. CTA ═══ */}
      <section className="lp-cta">
        <FadeIn>
          <h2 className="lp-cta-title">Ready to modernize your institution?</h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="lp-cta-desc">Join 120+ theological institutions already using CovenantERP. Start your free trial today.</p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="lp-cta-actions">
            <button className="lp-btn-primary" onClick={() => navigate('/login')}>
              Get Started Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
            </button>
            <button className="lp-btn-outline-white">Book a Demo</button>
          </div>
        </FadeIn>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-top">
            <div className="lp-footer-brand">
              <div className="lp-nav-logo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#60a5fa" />
                  <path d="M2 17l10 5 10-5" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12l10 5 10-5" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="lp-footer-name">CovenantERP</span>
              <p className="lp-footer-tagline">The complete ERP platform for theological institutions.</p>
            </div>
            <div className="lp-footer-columns">
              <div className="lp-footer-col">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#preview">Preview</a>
                <a href="#faq">FAQ</a>
              </div>
              <div className="lp-footer-col">
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="#careers">Careers</a>
                <a href="#contact">Contact</a>
              </div>
              <div className="lp-footer-col">
                <h4>Legal</h4>
                <a href="#privacy">Privacy Policy</a>
                <a href="#terms">Terms of Service</a>
                <a href="#security">Security</a>
              </div>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span>&copy; {new Date().getFullYear()} CovenantERP. All rights reserved.</span>
            <div className="lp-footer-socials">
              <a href="#twitter" aria-label="Twitter"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg></a>
              <a href="#linkedin" aria-label="LinkedIn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
