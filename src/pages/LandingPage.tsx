import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'motion/react';
import './LandingPage.css';

/* ─── Scroll-triggered fade + optional Y shift ─── */
function ScrollReveal({ children, className = '', delay = 0, y = 60 }: {
  children: React.ReactNode; className?: string; delay?: number; y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated counter ─── */
function CountUp({ end, suffix = '', duration = 2 }: { end: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration * 60);
    const tick = () => { start += step; if (start >= end) { setVal(end); return; } setVal(Math.floor(start)); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }, [inView, end, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─── Dashboard mockup images ─── */
import dashboardImg from '../assets/images/dashboard-preview.png';
import libraryImg from '../assets/images/library-preview.png';
import academicImg from '../assets/images/academic-preview.png';
import pedagogicalImg from '../assets/images/pedagogical-preview.png';

const SCREENS = [
  { src: dashboardImg, label: 'Dashboard' },
  { src: libraryImg, label: 'Library Portal' },
  { src: academicImg, label: 'Academic System' },
  { src: pedagogicalImg, label: 'Pedagogical Portal' },
];

const FEATURES = [
  { title: 'Student Management', desc: 'Seamless admissions, records, and tracking' },
  { title: 'Finance Automation', desc: 'Smart billing. Zero confusion.' },
  { title: 'Academic Control', desc: 'Timetables, exams, results — simplified' },
  { title: 'Multi-Institution Control', desc: 'One platform. Unlimited campuses.' },
  { title: 'Theological Focus', desc: 'Built for seminaries & Bible colleges' },
  { title: 'End-to-End Encryption', desc: 'Privacy-first. Always.' },
];

const STATS = [
  { value: 2, suffix: 'x', label: 'Faster Operations' },
  { value: 100, suffix: '%', label: 'Secure Data' },
  { value: 120, suffix: '+', label: 'Institutions' },
];

const TRUST_LOGOS = [
  'Grace Seminary', 'Bethel College', 'New Life Theological',
  'Covenant University', 'India Bible College', 'SABC Bangalore',
];

/* ═══════════════════════════════════════════════════════════════════════ */
/*  LANDING PAGE                                                        */
/* ═══════════════════════════════════════════════════════════════════════ */

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeScreen, setActiveScreen] = useState(0);

  // Auto-rotate product screens
  useEffect(() => {
    const interval = setInterval(() => setActiveScreen((i) => (i + 1) % SCREENS.length), 4000);
    return () => clearInterval(interval);
  }, []);

  /* Parallax for each storytelling section */
  const sections = [
    useScroll({ target: useRef(null), offset: ['start end', 'end start'] }),
    useScroll({ target: useRef(null), offset: ['start end', 'end start'] }),
    useScroll({ target: useRef(null), offset: ['start end', 'end start'] }),
    useScroll({ target: useRef(null), offset: ['start end', 'end start'] }),
  ];
  const parallaxYs = sections.map(s => useTransform(s.scrollYProgress, [0, 1], [80, -80]));

  return (
    <div className="lp-root">

      {/* ════════ 1. HERO ════════ */}
      <section className="lp-hero">
        {/* Subtle radial glow */}
        <div className="lp-hero-glow" />

        <ScrollReveal>
          <p className="lp-hero-tag">CovenantERP</p>
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <h1 className="lp-hero-headline">
            Run Your Institution.<br />
            Like a System Built<br />
            for the Future.
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={0.3}>
          <p className="lp-hero-sub">
            A complete ERP for schools, colleges, and theological institutions.&nbsp;Fast. Secure. Beautiful.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.45}>
          <div className="lp-hero-buttons">
            <button className="lp-btn-primary" onClick={() => navigate('/login')}>Get Started</button>
            <button className="lp-btn-secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              Watch Demo
            </button>
          </div>
        </ScrollReveal>

        {/* Glassmorphism dashboard mockup */}
        <motion.div
          className="lp-hero-mockup"
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="lp-mockup-bar">
            <span /><span /><span />
            <div className="lp-mockup-url">app.covenanterp.com</div>
          </div>
          <img src={dashboardImg} alt="Dashboard" className="lp-mockup-img" />
          <div className="lp-mockup-shine" />
        </motion.div>
      </section>

      {/* ════════ 2. SCROLL STORYTELLING ════════ */}
      {[
        { headline: 'Everything.', sub: 'In One Place.', bg: dashboardImg },
        { headline: 'Track Students, Fees, Attendance', sub: '— Instantly.', bg: academicImg },
        { headline: 'Powerful Academic Management', sub: 'Designed for how you actually teach.', bg: libraryImg },
        { headline: 'End-to-End Encrypted.', sub: 'Built for Privacy.', bg: pedagogicalImg, glow: true },
      ].map((sec, i) => {
        const ref = useRef<HTMLDivElement>(null);
        sections[i] = useScroll({ target: ref, offset: ['start end', 'end start'] });
        parallaxYs[i] = useTransform(sections[i].scrollYProgress, [0, 1], [100, -100]);
        return (
          <section key={i} className={`lp-story ${sec.glow ? 'lp-story-glow' : ''}`} ref={ref}>
            <motion.div className="lp-story-bg" style={{ y: parallaxYs[i] }}>
              <img src={sec.bg} alt="" />
            </motion.div>
            <div className="lp-story-overlay" />
            <ScrollReveal>
              <h2 className="lp-story-headline">{sec.headline}</h2>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="lp-story-sub">{sec.sub}</p>
            </ScrollReveal>
          </section>
        );
      })}

      {/* ════════ 3. FEATURES ════════ */}
      <section className="lp-features">
        <ScrollReveal>
          <h2 className="lp-section-headline">Built for <span className="lp-accent">every</span> need.</h2>
        </ScrollReveal>
        <div className="lp-features-grid">
          {FEATURES.map((f, i) => (
            <ScrollReveal key={i} delay={i * 0.08}>
              <div className="lp-feature-card">
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ════════ 4. PRODUCT PREVIEW ════════ */}
      <section className="lp-preview">
        <ScrollReveal>
          <h2 className="lp-section-headline">Designed for Humans.<br />Built for <span className="lp-accent">Speed</span>.</h2>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="lp-preview-laptop">
            <div className="lp-laptop-lid">
              <div className="lp-laptop-notch" />
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeScreen}
                  src={SCREENS[activeScreen].src}
                  alt={SCREENS[activeScreen].label}
                  className="lp-laptop-screen"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              </AnimatePresence>
            </div>
            <div className="lp-laptop-base" />
          </div>
        </ScrollReveal>

        <div className="lp-preview-tabs">
          {SCREENS.map((s, i) => (
            <button
              key={i}
              className={`lp-preview-tab ${i === activeScreen ? 'active' : ''}`}
              onClick={() => setActiveScreen(i)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      {/* ════════ 5. STATS ════════ */}
      <section className="lp-stats">
        <div className="lp-stats-grid">
          {STATS.map((s, i) => (
            <ScrollReveal key={i} delay={i * 0.15}>
              <div className="lp-stat">
                <span className="lp-stat-value"><CountUp end={s.value} suffix={s.suffix} /></span>
                <span className="lp-stat-label">{s.label}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ════════ 6. USE CASES ════════ */}
      <section className="lp-usecases">
        <ScrollReveal>
          <h2 className="lp-section-headline">From small schools to large institutions.</h2>
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <p className="lp-usecases-sub">Manage everything effortlessly — no matter your size.</p>
        </ScrollReveal>
        <div className="lp-usecases-grid">
          {['Schools', 'Colleges', 'Theological Institutions'].map((u, i) => (
            <ScrollReveal key={i} delay={i * 0.12}>
              <div className="lp-usecase-card">
                <div className="lp-usecase-icon">
                  {i === 0 && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>}
                  {i === 1 && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/></svg>}
                  {i === 2 && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>}
                </div>
                <h3>{u}</h3>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ════════ 7. TRUST ════════ */}
      <section className="lp-trust">
        <ScrollReveal>
          <p className="lp-trust-headline">Trusted by institutions worldwide.</p>
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <div className="lp-trust-logos">
            {TRUST_LOGOS.map((name, i) => (
              <span key={i} className="lp-trust-logo">{name}</span>
            ))}
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.3}>
          <p className="lp-trust-quote">
            "CovenantERP transformed how we manage our seminary. Everything is in one place."
          </p>
        </ScrollReveal>
      </section>

      {/* ════════ 8. FINAL CTA ════════ */}
      <section className="lp-cta">
        <div className="lp-cta-glow" />
        <ScrollReveal>
          <h2 className="lp-cta-headline">Ready to Transform<br />Your Institution?</h2>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <div className="lp-cta-buttons">
            <button className="lp-btn-primary" onClick={() => navigate('/login')}>Start Free Trial</button>
            <button className="lp-btn-secondary">Book Demo</button>
          </div>
        </ScrollReveal>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <span className="lp-footer-logo">CovenantERP</span>
          <div className="lp-footer-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
            <a href="#privacy">Privacy</a>
          </div>
          <span className="lp-footer-copy">&copy; {new Date().getFullYear()} CovenantERP. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
