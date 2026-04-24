"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useInView,
  AnimatePresence,
  useScroll,
  useTransform,
} from "motion/react";
import { cn } from "../lib/utils";
import {
  Sparkles,
  GraduationCap,
  Users,
  BookOpen,
  Library,
  DollarSign,
  Church,
  ArrowRight,
  Check,
  Play,
  Menu,
  X,
  Quote,
  ChevronRight,
  Shield,
  Zap,
  Globe,
  Star,
  Mail,
  Phone,
  MapPin,
  Heart,
  Target,
  Award,
  TrendingUp,
  Clock,
  BarChart3,
  MessageSquare,
  Lock,
  Cloud,
  Monitor,
  Presentation,
  Layers,
  Building2,
  Palette,
  UserCheck,
  Briefcase,
} from "lucide-react";

import dashboardPreview from "../assets/images/dashboard-preview.png";
import libraryPreview from "../assets/images/library-preview.png";
import academicPreview from "../assets/images/academic-preview.png";
import pedagogicalPreview from "../assets/images/pedagogical-preview.png";

/* ================================================================== */
/*  CONSTANTS                                                          */
/* ================================================================== */

const NAV_LINKS = ["Features", "Why Us", "How It Works", "Screens", "Pricing", "Testimonials"] as const;

const MODULES = [
  { icon: GraduationCap, label: "Student Management", desc: "Enrollment, profiles, academic progress" },
  { icon: BookOpen, label: "Academic System", desc: "Programs, curricula, grading, exams" },
  { icon: Briefcase, label: "Faculty Portal", desc: "Profiles, HR, workload scheduling" },
  { icon: Library, label: "Library", desc: "Catalog, borrowing, rare manuscripts" },
  { icon: DollarSign, label: "Finance", desc: "Billing, scholarships, donor tracking" },
  { icon: Presentation, label: "Pedagogical Portal", desc: "Lesson planning, engagement, classroom" },
];

const FEATURES = [
  {
    icon: UserCheck,
    title: "Student Enrollment & Profiles",
    description:
      "End-to-end student lifecycle management — from inquiry and application through enrollment, academic tracking, and graduation. Automated workflows reduce paperwork by 80% and keep every record accessible in real time.",
    color: "from-indigo-500 to-blue-500",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
  },
  {
    icon: BookOpen,
    title: "Academic & Curriculum Management",
    description:
      "Design programs for B.Th, M.Div, Th.M, PhD, and D.Min with fine-grained control. Define curricula, set grading rubrics, schedule classes, manage examinations, and track academic performance across every department.",
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
    text: "text-violet-600",
  },
  {
    icon: Users,
    title: "Faculty & Teaching Tools",
    description:
      "Comprehensive faculty profiles, workload scheduling, leave management, performance reviews, and payroll — all automated. Give your faculty the tools they need to focus on teaching rather than administration.",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  {
    icon: Library,
    title: "Theological Library System",
    description:
      "Digitize your entire catalog, manage borrowing cycles, track rare manuscripts, and provide a modern discovery experience. Integrated barcode scanning, overdue alerts, and reservation system for students.",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
  {
    icon: DollarSign,
    title: "Billing & Sponsorship Tracking",
    description:
      "Comprehensive financial operations — fee collection, GST-compliant invoice generation, scholarship management, sponsor tracking, and real-time reporting. Generate audit-ready financial statements in one click.",
    color: "from-rose-500 to-pink-500",
    bg: "bg-rose-50",
    text: "text-rose-600",
  },
  {
    icon: Presentation,
    title: "Pedagogical Portal",
    description:
      "Purpose-built teaching hub — lesson planning, classroom engagement tracking, assignment management, and real-time student interaction. Empower faculty with tools designed for theological pedagogy.",
    color: "from-sky-500 to-cyan-500",
    bg: "bg-sky-50",
    text: "text-sky-600",
  },
];

const UNIQUE_VALUES = [
  {
    icon: Target,
    title: "Theology-Focused System",
    description:
      "Unlike generic ERP platforms retrofitted for education, CovenantERP was built from day one for theological institutions. Every module — from chapel management to sermon archiving — reflects the unique rhythms of seminary life. We understand that a Bible college operates fundamentally differently from a business school.",
  },
  {
    icon: Heart,
    title: "Ministry & Spiritual Tracking",
    description:
      "Track ministry placements, chapel attendance, spiritual formation progress, and congregation engagement alongside academic records. CovenantERP recognizes that theological education is not just about grades — it's about holistic formation of future leaders for the Church.",
  },
  {
    icon: Building2,
    title: "Multi-Institution SaaS",
    description:
      "Built on a true multi-tenant architecture with centralized Super Admin control. Manage multiple campuses, oversee dozens of institutions from a single dashboard, and maintain full data isolation between tenants. Scale from one campus to a nationwide network seamlessly.",
  },
  {
    icon: Palette,
    title: "White-Label Branding",
    description:
      "Every institution gets a fully branded experience — custom logos, colors, email templates, and login pages. Your students and faculty see your brand, not ours. Deploy your institution's visual identity across every touchpoint with zero technical effort.",
  },
];

const HOW_STEPS = [
  {
    num: "01",
    title: "Create Institution",
    description:
      "Sign up with your institutional email, verify in under 60 seconds. No credit card required. Your 14-day free trial starts immediately with full access to every module and feature.",
    icon: Globe,
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    num: "02",
    title: "Configure Academic & Faculty",
    description:
      "Use our guided setup wizard to define your programs (B.Th, M.Div, Th.M, PhD, D.Min), configure grading systems, set up departments, and invite your faculty. Import existing data with our CSV migration tool.",
    icon: Layers,
    gradient: "from-violet-500 to-purple-500",
  },
  {
    num: "03",
    title: "Start Managing & Teaching",
    description:
      "Begin enrolling students, scheduling classes, managing library resources, and tracking finances from day one. Your entire institution runs on one secure, beautifully designed platform.",
    icon: Monitor,
    gradient: "from-amber-500 to-orange-500",
  },
];

const SCREENS = [
  {
    title: "Dashboard",
    description: "Real-time institutional overview with enrollment stats, financial summaries, and activity feeds",
    src: dashboardPreview,
  },
  {
    title: "Library Portal",
    description: "Modern catalog discovery with borrowing management, reservation system, and overdue tracking",
    src: libraryPreview,
  },
  {
    title: "Academic System",
    description: "Program configuration, curriculum management, examination scheduling, and grade tracking",
    src: academicPreview,
  },
  {
    title: "Pedagogical Portal",
    description: "Lesson planning, classroom engagement, assignment management, and student interaction tools",
    src: pedagogicalPreview,
  },
];

const PRICING = [
  {
    name: "Basic",
    price: "$29",
    period: "/mo",
    description: "For small Bible colleges getting started",
    features: [
      "Up to 200 students",
      "Student enrollment & profiles",
      "Basic academic configuration",
      "Faculty management",
      "Library catalog",
      "Email support",
      "5 GB storage",
    ],
    highlighted: false,
    cta: "Start Free Trial",
  },
  {
    name: "Pro",
    price: "$79",
    period: "/mo",
    description: "For established seminaries with full needs",
    features: [
      "Up to 2,000 students",
      "Full academic suite",
      "Complete library system",
      "Financial operations & billing",
      "Church & ministry integration",
      "Pedagogical portal",
      "AI-powered analytics",
      "Priority support",
      "25 GB storage",
    ],
    highlighted: true,
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/mo",
    description: "For theological universities at scale",
    features: [
      "Unlimited students",
      "Multi-campus support",
      "White-label branding",
      "Advanced AI analytics",
      "Custom integrations & API",
      "Dedicated account manager",
      "On-site training",
      "SLA guarantee",
      "Unlimited storage",
    ],
    highlighted: false,
    cta: "Contact Sales",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "CovenantERP transformed how we manage our seminary. What used to take our admin team three days now happens in three clicks. The student lifecycle tracking alone saved us hundreds of hours per semester.",
    name: "Dr. Samuel Raj",
    role: "Principal",
    institution: "Grace Theological Seminary, Bangalore",
    avatar: "SR",
  },
  {
    quote:
      "The financial module is exceptional. We can now track fee collections, generate invoices, and manage scholarships all in one place. Our finance team loves the real-time dashboards and GST compliance features.",
    name: "Rev. Dr. Mercy Thomas",
    role: "Dean of Administration",
    institution: "New Life Bible College, Chennai",
    avatar: "MT",
  },
  {
    quote:
      "We evaluated five ERP systems before choosing CovenantERP. None of them understood the unique needs of theological education. The church integration and ministry tracking modules are absolutely brilliant.",
    name: "Prof. David Kurian",
    role: "Director of IT",
    institution: "Covenant Theological University, Kerala",
    avatar: "DK",
  },
];

const TRUSTED = [
  "Grace Seminary", "Bethel College", "New Life Theological",
  "Covenant University", "India Bible College", "SABC Bangalore",
];

/* ================================================================== */
/*  REUSABLES                                                          */
/* ================================================================== */

function FadeIn({
  children, className = "", delay = 0, direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const offsets: Record<string, { x?: number; y?: number }> = {
    up: { y: 36 }, down: { y: -36 }, left: { x: 36 }, right: { x: -36 },
  };
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, ...offsets[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...offsets[direction] }}
      transition={{ duration: 0.65, delay, ease: [0.22, 0.61, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function SectionBadge({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5">
      <Icon className="h-3.5 w-3.5 text-indigo-500" />
      <span className="text-xs font-semibold text-indigo-600">{children}</span>
    </div>
  );
}

function GradientHeading({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent", className)}>
      {children}
    </span>
  );
}

/* ================================================================== */
/*  1. NAVBAR                                                          */
/* ================================================================== */

function Navbar({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id.toLowerCase().replace(/\s+/g, "-"))?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.nav
        className={cn(
          "fixed left-0 right-0 top-0 z-50 transition-all duration-500",
          scrolled ? "border-b border-slate-200/80 bg-white/85 backdrop-blur-2xl shadow-sm" : "bg-white/60 backdrop-blur-lg"
        )}
        initial={{ y: -80 }} animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
          {/* Logo */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-shadow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 font-display">
              Covenant<span className="text-indigo-600">ERP</span>
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <button key={link} onClick={() => scrollTo(link)}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
                {link}
              </button>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-3 lg:flex">
            <button onClick={() => onNavigate("/login")}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
              Sign In
            </button>
            <button onClick={() => onNavigate("/login")}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-xl hover:shadow-indigo-500/30 hover:brightness-110">
              Get Started
            </button>
          </div>

          {/* Mobile toggle */}
          <button className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-40 bg-white/98 backdrop-blur-2xl pt-20 lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <div className="flex flex-col gap-1 px-6">
              {NAV_LINKS.map((link, i) => (
                <motion.button key={link} onClick={() => scrollTo(link)}
                  className="w-full rounded-xl py-3.5 text-left text-base font-medium text-slate-700 hover:bg-slate-50"
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 + 0.05 }}>
                  {link}
                </motion.button>
              ))}
              <div className="mt-6 flex flex-col gap-3" >
                <button onClick={() => { setMobileOpen(false); onNavigate("/login"); }}
                  className="w-full rounded-xl border border-slate-200 py-3.5 text-sm font-semibold text-slate-700">Sign In</button>
                <button onClick={() => { setMobileOpen(false); onNavigate("/login"); }}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg">Get Started</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ================================================================== */
/*  2. HERO                                                            */
/* ================================================================== */

function HeroSection({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 pt-20">
      {/* Decorative gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-20 h-[600px] w-[600px] rounded-full bg-indigo-200/30 blur-[120px]" />
        <div className="absolute -right-40 top-40 h-[500px] w-[500px] rounded-full bg-violet-200/25 blur-[120px]" />
        <div className="absolute left-1/3 bottom-0 h-[300px] w-[400px] rounded-full bg-purple-100/20 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Copy */}
          <div>
            <motion.div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-1.5 backdrop-blur-sm"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
              <Zap className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-600">Built for Seminaries & Bible Colleges</span>
            </motion.div>

            <motion.h1 className="mb-6 font-display text-3xl font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-[3.5rem]"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 0.61, 0.36, 1] }}>
              Run Your Entire Theological Institution on{" "}
              <GradientHeading>One Platform</GradientHeading>
            </motion.h1>

            <motion.p className="mb-10 max-w-lg text-base leading-relaxed text-slate-500 sm:text-lg"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
              Manage students, faculty, academics, library, finance, and ministry training — all in one secure ERP built exclusively for theological education.
            </motion.p>

            <motion.div className="flex flex-col gap-3.5 sm:flex-row"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }}>
              <button onClick={() => onNavigate("/login")}
                className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/35 hover:brightness-110">
                Get Started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                className="group flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
                <Play className="h-4 w-4 text-indigo-500" />
                Request Demo
              </button>
            </motion.div>

            {/* Mini trust bar */}
            <motion.div className="mt-10 flex flex-wrap items-center gap-6 border-t border-slate-200/60 pt-6"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.7 }}>
              {[{ v: "120+", l: "Institutions" }, { v: "50K+", l: "Students" }, { v: "99.9%", l: "Uptime" }, { v: "4.9/5", l: "Rating" }].map((s) => (
                <div key={s.l}>
                  <div className="text-lg font-bold text-slate-900">{s.v}</div>
                  <div className="text-xs text-slate-400 font-medium">{s.l}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Dashboard mockup */}
          <motion.div className="relative"
            initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 0.61, 0.36, 1] }}>
            {/* Glow behind */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-indigo-200 via-violet-200 to-purple-200 opacity-40 blur-2xl" />
            <div className="relative rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-2xl shadow-indigo-500/10">
              <img
                src={dashboardPreview}
                alt="CovenantERP Dashboard Preview"
                className="w-full rounded-xl object-cover"
                loading="eager"
              />
              {/* Browser chrome */}
              <div className="absolute left-0 right-0 top-0 flex items-center gap-1.5 rounded-t-xl bg-slate-100 px-3 py-2.5">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                </div>
                <div className="ml-3 flex-1 rounded-md bg-white/80 px-3 py-1 text-[10px] text-slate-400">
                  app.covenanterp.com/dashboard
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  3. TRUST INDICATORS                                                */
/* ================================================================== */

function TrustSection() {
  return (
    <section className="relative bg-white py-14 px-5 border-y border-slate-100">
      <div className="mx-auto max-w-7xl">
        <FadeIn className="text-center mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            Trusted by seminaries & Bible colleges worldwide
          </p>
        </FadeIn>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {MODULES.map((m, i) => (
            <FadeIn key={m.label} delay={i * 0.06}>
              <div className="group flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-center transition-all hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 shadow-sm">
                  <m.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">{m.label}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400 leading-snug">{m.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="mt-10">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {TRUSTED.map((name, i) => (
              <div key={name} className="flex h-11 items-center gap-2 rounded-lg border border-slate-100 bg-white px-4 text-xs font-semibold text-slate-400">
                <GraduationCap className="h-3.5 w-3.5" />
                {name}
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  4. FEATURES GRID                                                   */
/* ================================================================== */

function FeaturesSection() {
  return (
    <section id="features" className="relative bg-slate-50 py-24 px-5">
      <div className="mx-auto max-w-7xl">
        <FadeIn className="mb-16 max-w-2xl">
          <SectionBadge icon={Layers}>Complete Platform</SectionBadge>
          <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            Six powerful modules. <GradientHeading>One unified system.</GradientHeading>
          </h2>
          <p className="mt-4 text-base text-slate-500 leading-relaxed">
            Every feature purpose-built for theological education — not generic ERP retrofitted with a theological label.
          </p>
        </FadeIn>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.06}>
              <div className="group h-full rounded-2xl border border-slate-200/80 bg-white p-7 transition-all duration-400 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-1">
                <div className={cn("mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl shadow-sm", f.bg)}>
                  <f.icon className={cn("h-6 w-6", f.text)} />
                </div>
                <h3 className="mb-2.5 text-base font-bold text-slate-900">{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{f.description}</p>
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-500 group-hover:text-indigo-700 transition-colors">
                    Learn more <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  5. UNIQUE VALUE                                                    */
/* ================================================================== */

function UniqueValueSection() {
  return (
    <section id="why-us" className="relative bg-white py-24 px-5 overflow-hidden">
      {/* Decorative */}
      <div className="pointer-events-none absolute -right-60 top-0 h-[500px] w-[500px] rounded-full bg-indigo-100/30 blur-[120px]" />
      <div className="pointer-events-none absolute -left-60 bottom-0 h-[500px] w-[500px] rounded-full bg-violet-100/30 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        <FadeIn className="mb-16 max-w-2xl mx-auto text-center">
          <SectionBadge icon={Award}>Why CovenantERP</SectionBadge>
          <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            What makes us <GradientHeading>fundamentally different</GradientHeading>
          </h2>
          <p className="mt-4 text-base text-slate-500 leading-relaxed">
            We didn't adapt a generic ERP for theological education. We built one from the ground up.
          </p>
        </FadeIn>

        <div className="grid gap-6 md:grid-cols-2">
          {UNIQUE_VALUES.map((v, i) => (
            <FadeIn key={v.title} delay={i * 0.08} direction={i % 2 === 0 ? "right" : "left"}>
              <div className="h-full rounded-2xl border border-slate-100 bg-slate-50/50 p-8 transition-all hover:shadow-lg hover:border-indigo-100">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/15">
                  <v.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-3 text-lg font-bold text-slate-900">{v.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{v.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  6. HOW IT WORKS                                                    */
/* ================================================================== */

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-gradient-to-b from-slate-50 to-white py-24 px-5">
      <div className="mx-auto max-w-5xl">
        <FadeIn className="mb-16 text-center">
          <SectionBadge icon={Clock}>Quick Setup</SectionBadge>
          <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            Up and running in <GradientHeading>three steps</GradientHeading>
          </h2>
          <p className="mt-4 text-base text-slate-500">No credit card required. Full access from day one.</p>
        </FadeIn>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-0 right-0 top-[52px] hidden h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent md:block" />

          <div className="grid gap-10 md:grid-cols-3 md:gap-8">
            {HOW_STEPS.map((s, i) => (
              <FadeIn key={s.num} delay={i * 0.15}>
                <div className="relative flex flex-col items-center text-center">
                  <div className="relative mb-7">
                    <div className={cn("flex h-[76px] w-[76px] items-center justify-center rounded-2xl bg-gradient-to-br shadow-xl", s.gradient, "shadow-indigo-500/15")}>
                      <s.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-900 shadow-md ring-2 ring-slate-100">
                      {s.num}
                    </div>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-900">{s.title}</h3>
                  <p className="max-w-xs text-sm leading-relaxed text-slate-500">{s.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  7. SCREENS PREVIEW                                                 */
/* ================================================================== */

function ScreensPreview() {
  const [active, setActive] = useState(0);

  return (
    <section id="screens" className="relative bg-white py-24 px-5">
      <div className="mx-auto max-w-7xl">
        <FadeIn className="mb-14 text-center">
          <SectionBadge icon={Monitor}>Live Preview</SectionBadge>
          <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            See CovenantERP <GradientHeading>in action</GradientHeading>
          </h2>
          <p className="mt-4 text-base text-slate-500">Real screens from the platform your institution will use every day.</p>
        </FadeIn>

        <FadeIn>
          <div>
            {/* Tabs */}
            <div className="mb-8 flex flex-wrap justify-center gap-2">
              {SCREENS.map((s, i) => (
                <button key={s.title} onClick={() => setActive(i)}
                  className={cn(
                    "rounded-xl px-5 py-2.5 text-sm font-semibold transition-all",
                    active === i
                      ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}>
                  {s.title}
                </button>
              ))}
            </div>

            {/* Preview card */}
            <div className="mx-auto max-w-4xl">
              <AnimatePresence mode="wait">
                <motion.div key={active}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35 }}>
                  <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-xl shadow-slate-200/50">
                    {/* Browser chrome */}
                    <div className="mb-3 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 border border-slate-100">
                      <div className="flex gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                        <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                      </div>
                      <div className="ml-3 flex-1 rounded-md bg-slate-100 px-3 py-1 text-[10px] text-slate-400 font-mono">
                        app.covenanterp.com/{SCREENS[active].title.toLowerCase().replace(/\s+/g, "-")}
                      </div>
                    </div>
                    <img
                      src={SCREENS[active].src}
                      alt={SCREENS[active].title}
                      className="w-full rounded-xl object-cover"
                    />
                  </div>
                  <p className="mt-4 text-center text-sm text-slate-500">{SCREENS[active].description}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  8. TESTIMONIALS                                                    */
/* ================================================================== */

function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative bg-slate-50 py-24 px-5">
      <div className="mx-auto max-w-7xl">
        <FadeIn className="mb-16 text-center">
          <SectionBadge icon={Star}>Social Proof</SectionBadge>
          <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            Trusted by <GradientHeading>administrators</GradientHeading> nationwide
          </h2>
          <p className="mt-4 text-base text-slate-500">Hear from the leaders who transformed their institutions.</p>
        </FadeIn>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="group h-full rounded-2xl border border-slate-200/80 bg-white p-7 transition-all hover:shadow-lg hover:border-indigo-100 md:p-8">
                <Quote className="mb-5 h-7 w-7 text-indigo-100" />
                <p className="mb-6 text-sm leading-relaxed text-slate-600 italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}, {t.institution}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  9. PRICING                                                         */
/* ================================================================== */

function PricingSection({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <section id="pricing" className="relative bg-white py-24 px-5">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="mb-16 text-center">
          <SectionBadge icon={DollarSign}>Pricing</SectionBadge>
          <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            Simple, transparent <GradientHeading>pricing</GradientHeading>
          </h2>
          <p className="mt-4 text-base text-slate-500">No hidden fees. No long-term contracts. Start with a 14-day free trial.</p>
        </FadeIn>

        <div className="grid gap-6 md:grid-cols-3">
          {PRICING.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.1}>
              <div className={cn(
                "relative flex h-full flex-col rounded-2xl border p-7 md:p-8 transition-all hover:shadow-xl",
                plan.highlighted
                  ? "border-indigo-200 bg-white shadow-2xl shadow-indigo-500/10 scale-[1.02]"
                  : "border-slate-200 bg-white hover:border-indigo-100"
              )}>
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <div className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="mb-1 text-lg font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <span className="text-5xl font-bold text-slate-900 font-display">{plan.price}</span>
                  <span className="text-slate-400 font-medium">{plan.period}</span>
                </div>

                <ul className="mb-8 flex flex-1 flex-col gap-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50">
                        <Check className="h-3 w-3 text-indigo-500" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <button onClick={() => onNavigate("/login")}
                  className={cn(
                    "w-full rounded-xl py-3.5 text-sm font-semibold transition-all",
                    plan.highlighted
                      ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:brightness-110"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50"
                  )}>
                  {plan.cta}
                </button>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  10. FINAL CTA                                                      */
/* ================================================================== */

function FinalCTA({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <section className="relative bg-[#070714] py-24 px-5 overflow-hidden">
      {/* Gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-0 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[150px]" />
        <div className="absolute right-1/3 bottom-0 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <FadeIn>
          <h2 className="mb-5 font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl leading-tight">
            Start Your Institution&apos;s{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-amber-400 bg-clip-text text-transparent">
              Digital Transformation
            </span>{" "}
            Today
          </h2>
          <p className="mx-auto mb-10 max-w-lg text-base text-slate-400 leading-relaxed">
            Join 120+ theological institutions that have already modernized their operations. 14-day free trial, no credit card required.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button onClick={() => onNavigate("/login")}
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-4 text-sm font-semibold text-white shadow-2xl shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:brightness-110">
              Get Started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/10">
              <Phone className="h-4 w-4" /> Request Demo
            </button>
          </div>
          <p className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-indigo-400" /> SOC-2 Compliant</span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-indigo-400" /> 256-bit Encryption</span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-indigo-400" /> GDPR Ready</span>
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  11. FOOTER                                                         */
/* ================================================================== */

function Footer() {
  return (
    <footer className="relative bg-[#070714] border-t border-white/[0.06] px-5 pt-16 pb-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white font-display">Covenant<span className="text-indigo-400">ERP</span></span>
            </div>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-slate-500">
              The all-in-one management platform built exclusively for theological colleges, seminaries, and Bible institutes.
            </p>
          </div>

          {[
            { title: "Product", links: ["Features", "Pricing", "Security", "Integrations"] },
            { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
            { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Security"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-semibold text-white">{col.title}</h4>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <button className="text-sm text-slate-500 transition-colors hover:text-indigo-400">{link}</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 md:flex-row">
          <p className="text-xs text-slate-600">&copy; {new Date().getFullYear()} CovenantERP. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ================================================================== */
/*  MAIN EXPORT                                                        */
/* ================================================================== */

export function MarketingLanding({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="overflow-x-hidden">
      <Navbar onNavigate={onNavigate} />
      <HeroSection onNavigate={onNavigate} />
      <TrustSection />
      <FeaturesSection />
      <UniqueValueSection />
      <HowItWorks />
      <ScreensPreview />
      <TestimonialsSection />
      <PricingSection onNavigate={onNavigate} />
      <FinalCTA onNavigate={onNavigate} />
      <Footer />
    </div>
  );
}

export default MarketingLanding;
