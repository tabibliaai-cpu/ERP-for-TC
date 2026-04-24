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
  Cpu,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const NAV_LINKS = ["Features", "About", "How It Works", "Pricing", "Testimonials", "Contact"] as const;

const FEATURES = [
  {
    icon: GraduationCap,
    title: "Student Lifecycle Management",
    description:
      "Track every student from admissions inquiry through graduation — applications, enrollment, academic progress, and alumni records in one seamless flow. Automate repetitive tasks and never lose track of a student again.",
    color: "from-indigo-500 to-blue-500",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-600",
  },
  {
    icon: Users,
    title: "Faculty & HR Suite",
    description:
      "Comprehensive faculty profiles, payroll processing, leave management, performance reviews, and workload scheduling — all automated. Reduce administrative overhead by up to 70% with intelligent scheduling tools.",
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-50",
    textColor: "text-violet-600",
  },
  {
    icon: BookOpen,
    title: "Academic Configuration",
    description:
      "Design programs, define curricula, set grading rubrics, schedule classes, and manage examinations with fine-grained control. Support for B.Th, M.Div, Th.M, PhD, and D.Min programs out of the box.",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
  },
  {
    icon: Library,
    title: "Smart Library System",
    description:
      "Digitize catalogs, manage borrowing cycles, track rare manuscripts, and provide students with a modern discovery and reservation experience. Integrated barcode scanning and overdue notification system included.",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
  {
    icon: DollarSign,
    title: "Financial Operations",
    description:
      "Fee collection, invoice generation, scholarship management, donor tracking, and real-time financial reporting at your fingertips. Generate GST-compliant receipts and export reports for audits in one click.",
    color: "from-rose-500 to-pink-500",
    bgColor: "bg-rose-50",
    textColor: "text-rose-600",
  },
  {
    icon: Church,
    title: "Church & Ministry Integration",
    description:
      "Coordinate chapel services, manage ministry placements, track congregation engagement, and archive sermon libraries effortlessly. Purpose-built for institutions where faith and academics intersect.",
    color: "from-sky-500 to-cyan-500",
    bgColor: "bg-sky-50",
    textColor: "text-sky-600",
  },
  {
    icon: MessageSquare,
    title: "Built-in Messaging",
    description:
      "Internal communication system connecting administrators, faculty, students, and staff. Share announcements, send targeted messages, and keep everyone in the loop without external tools.",
    color: "from-fuchsia-500 to-violet-500",
    bgColor: "bg-fuchsia-50",
    textColor: "text-fuchsia-600",
  },
  {
    icon: Cpu,
    title: "AI-Powered Analytics",
    description:
      "Leverage Google Gemini AI for intelligent insights — predictive enrollment analytics, automated report generation, smart recommendations for curriculum optimization, and natural language data queries.",
    color: "from-cyan-500 to-blue-500",
    bgColor: "bg-cyan-50",
    textColor: "text-cyan-600",
  },
];

const PRICING = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for small Bible colleges getting started with digital management",
    features: [
      "Up to 200 students",
      "Basic admissions portal",
      "Faculty management",
      "Simple grade reports",
      "Library catalog",
      "Email support",
      "5 GB storage",
    ],
    highlighted: false,
    cta: "Start Free Trial",
  },
  {
    name: "Professional",
    price: "$79",
    period: "/month",
    description: "For established seminaries that need the complete academic and financial suite",
    features: [
      "Up to 2,000 students",
      "Full academic suite",
      "Library management",
      "Financial operations",
      "Church integration",
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
    period: "/month",
    description: "For theological universities with multi-campus operations and custom needs",
    features: [
      "Unlimited students",
      "Multi-campus support",
      "Advanced AI analytics",
      "Custom integrations",
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
      "We evaluated five ERP systems before choosing CovenantERP. None of them understood the unique needs of theological education like this platform does. The church integration module is absolutely brilliant.",
    name: "Prof. David Kurian",
    role: "Director of IT",
    institution: "Covenant Theological University, Kerala",
    avatar: "DK",
  },
];

const TRUSTED_LOGOS = [
  "Grace Seminary",
  "Bethel College",
  "New Life Theological",
  "Covenant University",
  "India Bible College",
  "SABC Bangalore",
];

const STATS = [
  { value: "120+", label: "Institutions", icon: GraduationCap },
  { value: "50,000+", label: "Students Managed", icon: Users },
  { value: "99.9%", label: "Platform Uptime", icon: Cloud },
  { value: "4.9/5", label: "User Rating", icon: Star },
  { value: "2M+", label: "Records Processed", icon: BarChart3 },
  { value: "< 60s", label: "Average Response Time", icon: Clock },
];

/* ------------------------------------------------------------------ */
/*  Reusable animation wrapper                                        */
/* ------------------------------------------------------------------ */

function FadeInSection({
  children,
  className,
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const directionOffset = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{
        opacity: 0,
        ...directionOffset[direction],
      }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, ...directionOffset[direction] }
      }
      transition={{
        duration: 0.7,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  1. Navigation Bar                                                  */
/* ------------------------------------------------------------------ */

function Navbar({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id.toLowerCase().replace(/\s+/g, "-"));
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.nav
        className={cn(
          "fixed left-0 right-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-white/10 bg-[#070714]/90 backdrop-blur-2xl shadow-lg shadow-black/10"
            : "bg-transparent"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white font-display">
              Covenant<span className="text-indigo-400">ERP</span>
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                onClick={() => scrollTo(link)}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-white/5 hover:text-white"
              >
                {link}
              </button>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-3 lg:flex">
            <button
              onClick={() => onNavigate("/login")}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/5 hover:text-white"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate("/login")}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 hover:brightness-110"
            >
              Get Started Free
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-[#070714]/98 backdrop-blur-2xl pt-24 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col items-center gap-2 px-6">
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link}
                  onClick={() => scrollTo(link)}
                  className="w-full rounded-xl py-3.5 text-center text-lg font-medium text-slate-200 transition-colors hover:bg-white/5 hover:text-white"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 + 0.05 }}
                >
                  {link}
                </motion.button>
              ))}
              <motion.div
                className="mt-6 flex w-full flex-col gap-3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onNavigate("/login");
                  }}
                  className="w-full rounded-xl border border-white/10 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/5"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onNavigate("/login");
                  }}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg"
                >
                  Get Started Free
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  2. Hero Section                                                    */
/* ------------------------------------------------------------------ */

function HeroSection({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070714] px-6 pt-20"
    >
      {/* Animated gradient mesh background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[150px]" />
        <div className="absolute right-1/4 top-1/4 h-[500px] w-[500px] translate-x-1/4 rounded-full bg-violet-600/15 blur-[150px]" />
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[150px]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <motion.div
        className="relative z-10 mx-auto max-w-5xl text-center"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        {/* Badge */}
        <motion.div
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-5 py-2 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Zap className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-xs font-semibold text-indigo-300 tracking-wide">
            Trusted by 120+ theological institutions across India
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="mb-6 font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          The Complete
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-amber-400 bg-clip-text text-transparent">
            ERP Platform
          </span>
          <br />
          for Theological Education
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg md:text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          From admissions to graduation, faculty to finance, library to chapel — manage your
          entire seminary ecosystem in one powerful, beautifully designed platform.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <button
            onClick={() => onNavigate("/login")}
            className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-4 text-sm font-semibold text-white shadow-2xl shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:brightness-110"
          >
            Start Your Free Trial
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button className="group flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <Play className="h-3.5 w-3.5 fill-white text-white" />
            </div>
            Watch Demo
          </button>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 border-t border-white/[0.06] pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          {[
            { value: "120+", label: "Institutions" },
            { value: "50K+", label: "Students" },
            { value: "99.9%", label: "Uptime" },
            { value: "4.9/5", label: "Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl font-bold text-white sm:text-2xl">
                {stat.value}
              </div>
              <div className="mt-0.5 text-xs text-slate-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  3. Trusted By Section                                              */
/* ------------------------------------------------------------------ */

function TrustedBySection() {
  return (
    <section className="relative bg-white py-16 px-6">
      <div className="mx-auto max-w-7xl">
        <FadeInSection>
          <p className="mb-10 text-center text-sm font-semibold uppercase tracking-widest text-slate-400">
            Trusted by leading theological institutions
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {TRUSTED_LOGOS.map((name, i) => (
              <motion.div
                key={name}
                className="flex h-12 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-5 text-sm font-semibold text-slate-400 transition-all hover:border-slate-200 hover:text-slate-600 md:h-14 md:px-6 md:text-base"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <GraduationCap className="h-4 w-4" />
                {name}
              </motion.div>
            ))}
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  4. Features Section                                               */
/* ------------------------------------------------------------------ */

function FeaturesGrid() {
  return (
    <section id="features" className="relative bg-slate-50 py-28 px-6">
      <div className="mx-auto max-w-7xl">
        <FadeInSection className="mb-20 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5">
            <Zap className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-xs font-semibold text-indigo-600">Complete Platform</span>
          </div>
          <h2 className="mb-5 font-display text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl">
            Everything your institution needs,{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              in one place
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-base text-slate-500 md:text-lg leading-relaxed">
            Purpose-built for theological education. Eight powerful modules designed with deep
            understanding of how seminaries and Bible colleges actually operate.
          </p>
        </FadeInSection>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <FadeInSection key={feature.title} delay={i * 0.06}>
              <div className="group h-full rounded-2xl border border-slate-200/80 bg-white p-7 transition-all duration-500 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1">
                {/* Icon */}
                <div
                  className={cn(
                    "mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl shadow-lg",
                    feature.bgColor,
                  )}
                >
                  <feature.icon className={cn("h-6 w-6", feature.textColor)} />
                </div>

                <h3 className="mb-2.5 text-base font-bold text-slate-900">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {feature.description}
                </p>

                {/* Hover arrow */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-500 transition-colors group-hover:text-indigo-700">
                    Learn more
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  5. About Us Section                                               */
/* ------------------------------------------------------------------ */

function AboutSection() {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description:
        "To empower every theological institution with world-class management tools that are affordable, secure, and designed specifically for the unique rhythms of faith-based education.",
    },
    {
      icon: Heart,
      title: "Our Heart",
      description:
        "We believe that administrative burden should never distract from the sacred work of theological education. Every feature we build is aimed at freeing administrators and faculty to focus on what truly matters — shaping lives.",
    },
    {
      icon: TrendingUp,
      title: "Our Vision",
      description:
        "A future where every seminary and Bible college, regardless of size or budget, has access to the same enterprise-grade technology that transforms institutional efficiency and student success.",
    },
  ];

  return (
    <section id="about" className="relative bg-white py-28 px-6 overflow-hidden">
      {/* Decorative gradient */}
      <div className="pointer-events-none absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-indigo-100/40 blur-[120px]" />
      <div className="pointer-events-none absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-violet-100/40 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Top part — Company story */}
        <div className="mb-20 grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <FadeInSection direction="right">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 mb-6">
              <Award className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-600">About CovenantERP</span>
            </div>
            <h2 className="mb-6 font-display text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl leading-tight">
              Built for people who{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                build the future
              </span>
              <br />of the Church
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-slate-600">
              <p>
                CovenantERP was born from a simple observation: theological institutions across India
                were struggling with outdated systems, scattered spreadsheets, and generic software
                that failed to understand their unique needs. Faculty members spent more time on
                paperwork than on pastoral preparation, and administrators were drowning in manual
                processes that should have been automated years ago.
              </p>
              <p>
                Founded in 2023 by a team of technologists and theological educators, CovenantERP
                set out to change that narrative. We spent hundreds of hours visiting seminaries,
                sitting in on administrative meetings, and understanding the daily realities of
                running a Bible college. The result is a platform that speaks the language of
                theological education — not generic enterprise software with a theological label
                slapped on.
              </p>
            </div>
          </FadeInSection>

          <FadeInSection direction="left" delay={0.15}>
            <div className="relative">
              <div className="rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 p-1">
                <div className="rounded-[22px] bg-slate-900 p-8 md:p-10">
                  <div className="space-y-6">
                    {[
                      { label: "Founded", value: "2023", sub: "Bangalore, India" },
                      { label: "Team Size", value: "25+", sub: "Engineers & Theologians" },
                      { label: "Mission", value: "120+", sub: "Institutions Served" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 rounded-xl bg-white/5 p-4 border border-white/10"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20">
                          <span className="text-lg font-bold text-indigo-400">{item.value}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{item.label}</p>
                          <p className="text-xs text-slate-400">{item.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating decoration */}
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 opacity-20 blur-2xl" />
            </div>
          </FadeInSection>
        </div>

        {/* Bottom part — Values */}
        <div className="grid gap-6 md:grid-cols-3">
          {values.map((value, i) => (
            <FadeInSection key={value.title} delay={i * 0.1}>
              <div className="h-full rounded-2xl border border-slate-100 bg-slate-50/50 p-8 transition-all hover:shadow-lg hover:border-indigo-100">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
                  <value.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-3 text-lg font-bold text-slate-900">{value.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{value.description}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  6. Stats / Numbers Section                                         */
/* ------------------------------------------------------------------ */

function StatsSection() {
  return (
    <section className="relative bg-[#070714] py-28 px-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-indigo-600/15 blur-[150px]" />
        <div className="absolute right-1/4 bottom-0 h-[400px] w-[400px] rounded-full bg-violet-600/15 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <FadeInSection className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-400">
            By the Numbers
          </p>
          <h2 className="mb-4 font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Impact that speaks{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-amber-400 bg-clip-text text-transparent">
              for itself
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-base text-slate-400">
            Real metrics from real institutions. See how CovenantERP is transforming theological education management.
          </p>
        </FadeInSection>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {STATS.map((stat, i) => (
            <FadeInSection key={stat.label} delay={i * 0.08}>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-7 transition-all hover:border-indigo-500/20 hover:bg-white/[0.05]">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                  <stat.icon className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1 font-display">{stat.value}</div>
                <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  7. How It Works                                                    */
/* ------------------------------------------------------------------ */

function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Sign Up",
      description:
        "Create your institution's account with your official email. Our verification process takes under 60 seconds and requires no credit card to get started with your 14-day free trial.",
      icon: Mail,
      color: "from-indigo-500 to-blue-500",
    },
    {
      num: "02",
      title: "Configure",
      description:
        "Complete your institution profile through our guided setup wizard. Define your academic programs (B.Th, M.Div, Th.M, PhD, D.Min), configure grading systems, and import existing data.",
      icon: Zap,
      color: "from-violet-500 to-purple-500",
    },
    {
      num: "03",
      title: "Launch",
      description:
        "Start managing your seminary with full access to every module. Invite your team, onboard faculty and students, and watch your institution's efficiency soar from day one.",
      icon: Globe,
      color: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <section id="how-it-works" className="relative bg-white py-28 px-6">
      <div className="mx-auto max-w-5xl">
        <FadeInSection className="mb-20 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5">
            <Clock className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-xs font-semibold text-indigo-600">Quick Setup</span>
          </div>
          <h2 className="mb-5 font-display text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl">
            Up and running in{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              under 15 minutes
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-base text-slate-500">
            From sign-up to full deployment, we've made every step effortless so you can focus on what matters most.
          </p>
        </FadeInSection>

        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="absolute left-0 right-0 top-20 hidden h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent md:block" />

          <div className="grid gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((step, i) => (
              <FadeInSection key={step.num} delay={i * 0.15}>
                <div className="relative flex flex-col items-center text-center">
                  {/* Step circle */}
                  <div className="relative mb-8">
                    <div className={cn(
                      "flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br shadow-xl",
                      step.color,
                      "shadow-indigo-500/20"
                    )}>
                      <step.icon className="h-9 w-9 text-white" />
                    </div>
                    {/* Number badge */}
                    <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-900 shadow-lg ring-2 ring-slate-100">
                      {step.num}
                    </div>
                  </div>

                  <h3 className="mb-3 text-xl font-bold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="max-w-xs text-sm leading-relaxed text-slate-500">
                    {step.description}
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  8. Pricing Preview                                                 */
/* ------------------------------------------------------------------ */

function PricingPreview({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <section id="pricing" className="relative bg-slate-50 py-28 px-6">
      <div className="mx-auto max-w-6xl">
        <FadeInSection className="mb-20 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5">
            <DollarSign className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-xs font-semibold text-indigo-600">Transparent Pricing</span>
          </div>
          <h2 className="mb-5 font-display text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl">
            Plans that grow{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              with you
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-base text-slate-500">
            No hidden fees. No long-term contracts. Start with a 14-day free trial and choose the plan that fits your institution.
          </p>
        </FadeInSection>

        <div className="grid gap-6 md:grid-cols-3">
          {PRICING.map((plan, i) => (
            <FadeInSection key={plan.name} delay={i * 0.1}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border p-7 md:p-8 transition-all hover:shadow-xl",
                  plan.highlighted
                    ? "border-indigo-200 bg-white shadow-2xl shadow-indigo-500/10 scale-[1.02]"
                    : "border-slate-200 bg-white hover:border-indigo-100"
                )}
              >
                {/* Popular badge */}
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <div className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="mb-1 text-lg font-bold text-slate-900">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <span className="text-5xl font-bold text-slate-900 font-display">
                    {plan.price}
                  </span>
                  <span className="text-slate-400 font-medium">{plan.period}</span>
                </div>

                <ul className="mb-8 flex flex-1 flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-slate-600"
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50">
                        <Check className="h-3 w-3 text-indigo-500" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => onNavigate("/login")}
                  className={cn(
                    "w-full rounded-xl py-3.5 text-sm font-semibold transition-all",
                    plan.highlighted
                      ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:brightness-110"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50"
                  )}
                >
                  {plan.cta}
                </button>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  9. Testimonial Section                                             */
/* ------------------------------------------------------------------ */

function TestimonialSection() {
  return (
    <section id="testimonials" className="relative bg-white py-28 px-6">
      <div className="mx-auto max-w-7xl">
        <FadeInSection className="mb-20 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5">
            <Star className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-amber-700">Testimonials</span>
          </div>
          <h2 className="mb-5 font-display text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl">
            Loved by{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              administrators
            </span>{" "}
            nationwide
          </h2>
          <p className="mx-auto max-w-xl text-base text-slate-500">
            Hear from the leaders who transformed their institutions with CovenantERP.
          </p>
        </FadeInSection>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <FadeInSection key={i} delay={i * 0.1}>
              <div className="group relative h-full rounded-2xl border border-slate-100 bg-slate-50/50 p-7 transition-all hover:border-indigo-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 md:p-8">
                <Quote className="mb-5 h-8 w-8 text-indigo-200" />
                <p className="mb-6 text-sm leading-relaxed text-slate-600 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-auto flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">
                      {t.role}, {t.institution}
                    </p>
                  </div>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  10. Security / Trust Section                                       */
/* ------------------------------------------------------------------ */

function SecuritySection() {
  const features = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "All sensitive data is encrypted client-side before it ever leaves your device. Your keys never touch our servers.",
    },
    {
      icon: Shield,
      title: "SOC-2 Compliant",
      description: "Built with enterprise-grade security standards. Regular third-party audits ensure your data is always protected.",
    },
    {
      icon: Cloud,
      title: "99.9% Uptime SLA",
      description: "Hosted on Google Cloud Platform with redundant backups, automatic failover, and 24/7 infrastructure monitoring.",
    },
    {
      icon: Globe,
      title: "GDPR Ready",
      description: "Full data portability, right to erasure, and consent management built in. Your data, your control, always.",
    },
  ];

  return (
    <section className="relative bg-slate-50 py-28 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <FadeInSection direction="right">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 mb-6">
              <Shield className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">Enterprise Security</span>
            </div>
            <h2 className="mb-5 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
              Your data security is{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                non-negotiable
              </span>
            </h2>
            <p className="mb-8 text-base text-slate-500 leading-relaxed">
              We understand that institutional data — student records, financial information, personnel
              files — requires the highest level of protection. That's why security isn't a feature we
              bolt on; it's the foundation everything is built upon. From encryption at rest and in
              transit to granular access controls, every layer of CovenantERP is designed with a
              zero-trust philosophy.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature, i) => (
                <div key={i} className="flex gap-3 rounded-xl bg-white p-4 border border-slate-100">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                    <feature.icon className="h-4.5 w-4.5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 mb-0.5">{feature.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeInSection>

          <FadeInSection direction="left" delay={0.15}>
            <div className="relative">
              <div className="rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-1">
                <div className="rounded-[22px] bg-slate-900 p-8">
                  {/* Visual security metaphor */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-xl bg-white/5 p-4 border border-white/10">
                      <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-sm font-medium text-emerald-300">Secure Connection Active</span>
                      <span className="ml-auto text-xs text-slate-500 font-mono">TLS 1.3</span>
                    </div>
                    {[
                      { label: "Encryption", value: "AES-256-GCM", status: "Active" },
                      { label: "Authentication", value: "OAuth 2.0 + MFA", status: "Active" },
                      { label: "Data Residency", value: "India (Mumbai)", status: "Active" },
                      { label: "Backup", value: "Every 6 hours", status: "Active" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-4 py-3 border border-white/[0.04]">
                        <span className="text-sm text-slate-400">{item.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 font-mono">{item.value}</span>
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  11. CTA Section                                                    */
/* ------------------------------------------------------------------ */

function CTASection({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <section id="contact" className="relative bg-[#070714] py-28 px-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-0 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[150px]" />
        <div className="absolute right-1/3 bottom-0 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <FadeInSection>
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-amber-500/5 p-12 text-center md:p-20">
            <h2 className="mb-5 font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl leading-tight">
              Ready to transform
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-amber-400 bg-clip-text text-transparent">
                your institution?
              </span>
            </h2>
            <p className="mx-auto mb-10 max-w-lg text-base text-slate-400 md:text-lg leading-relaxed">
              Start your 14-day free trial today. No credit card required. Full access
              to every module, every feature, from day one.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={() => onNavigate("/login")}
                className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-4 text-sm font-semibold text-white shadow-2xl shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:brightness-110"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white transition-all hover:border-white/20 hover:bg-white/10">
                <Phone className="h-4 w-4" />
                Schedule a Demo
              </button>
            </div>
            <p className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-indigo-400" />
                SOC-2 Compliant
              </span>
              <span className="hidden sm:inline text-slate-700">|</span>
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-indigo-400" />
                256-bit Encryption
              </span>
              <span className="hidden sm:inline text-slate-700">|</span>
              <span className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-indigo-400" />
                GDPR Ready
              </span>
            </p>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  12. Footer                                                         */
/* ------------------------------------------------------------------ */

function Footer({ onNavigate }: { onNavigate: (path: string) => void }) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id.toLowerCase().replace(/\s+/g, "-"));
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-white/[0.06] bg-[#070714] px-6 pt-16 pb-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white font-display">
                Covenant<span className="text-indigo-400">ERP</span>
              </span>
            </div>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-slate-500">
              The all-in-one management platform built exclusively for theological colleges,
              seminaries, and Bible institutes across India and beyond.
            </p>
            <div className="flex gap-3">
              {[
                { icon: "X", label: "Twitter" },
                { icon: "in", label: "LinkedIn" },
                { icon: "G", label: "GitHub" },
              ].map((social) => (
                <button
                  key={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] text-xs font-bold text-slate-500 transition-all hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-400"
                  aria-label={social.label}
                >
                  {social.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Product</h4>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Features", id: "features" },
                { label: "Pricing", id: "pricing" },
                { label: "Security", id: "security" },
                { label: "Integrations", id: "features" },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => scrollTo(item.id)}
                    className="text-sm text-slate-500 transition-colors hover:text-indigo-400"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Company</h4>
            <ul className="flex flex-col gap-3">
              {[
                { label: "About Us", id: "about" },
                { label: "Blog", id: "features" },
                { label: "Careers", id: "features" },
                { label: "Contact", id: "contact" },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => scrollTo(item.id)}
                    className="text-sm text-slate-500 transition-colors hover:text-indigo-400"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Legal</h4>
            <ul className="flex flex-col gap-3">
              {["Privacy Policy", "Terms of Service", "Cookie Policy", "Security"].map(
                (item) => (
                  <li key={item}>
                    <button
                      onClick={() => scrollTo("contact")}
                      className="text-sm text-slate-500 transition-colors hover:text-indigo-400"
                    >
                      {item}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 md:flex-row">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Covenant Research Systems. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Export                                                        */
/* ------------------------------------------------------------------ */

export function MarketingLanding({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="overflow-x-hidden">
      <Navbar onNavigate={onNavigate} />
      <HeroSection onNavigate={onNavigate} />
      <TrustedBySection />
      <FeaturesGrid />
      <AboutSection />
      <StatsSection />
      <HowItWorks />
      <SecuritySection />
      <PricingPreview onNavigate={onNavigate} />
      <TestimonialSection />
      <CTASection onNavigate={onNavigate} />
      <Footer onNavigate={onNavigate} />
    </div>
  );
}

export default MarketingLanding;
