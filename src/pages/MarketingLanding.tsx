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
  Twitter,
  Linkedin,
  Github,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const NAV_LINKS = ["Features", "Pricing", "About", "Contact"] as const;

const FEATURES = [
  {
    icon: GraduationCap,
    title: "Student Lifecycle Management",
    description:
      "Track every student from admissions inquiry through graduation — applications, enrollment, academic progress, and alumni records in one seamless flow.",
    gradient: "from-fuchsia-500 to-violet-500",
  },
  {
    icon: Users,
    title: "Faculty & HR Suite",
    description:
      "Comprehensive faculty profiles, payroll processing, leave management, performance reviews, and workload scheduling — all automated.",
    gradient: "from-violet-500 to-cyan-400",
  },
  {
    icon: BookOpen,
    title: "Academic Configuration",
    description:
      "Design programs, define curricula, set grading rubrics, schedule classes, and manage examinations with fine-grained control.",
    gradient: "from-cyan-400 to-fuchsia-500",
  },
  {
    icon: Library,
    title: "Smart Library System",
    description:
      "Digitize catalogs, manage borrowing cycles, track rare manuscripts, and provide students with a modern discovery and reservation experience.",
    gradient: "from-fuchsia-500 to-pink-500",
  },
  {
    icon: DollarSign,
    title: "Financial Operations",
    description:
      "Fee collection, invoice generation, scholarship management, donor tracking, and real-time financial reporting at your fingertips.",
    gradient: "from-violet-500 to-indigo-500",
  },
  {
    icon: Church,
    title: "Church & Ministry Integration",
    description:
      "Coordinate chapel services, manage ministry placements, track congregation engagement, and archive sermon libraries effortlessly.",
    gradient: "from-cyan-400 to-teal-400",
  },
];

const PRICING = [
  {
    name: "Basic",
    price: "$29",
    period: "/mo",
    description: "For small Bible colleges",
    features: [
      "Up to 200 students",
      "Basic admissions portal",
      "Faculty management",
      "Simple grade reports",
      "Email support",
    ],
    highlighted: false,
  },
  {
    name: "Premium",
    price: "$79",
    period: "/mo",
    description: "For established seminaries",
    features: [
      "Up to 2,000 students",
      "Full academic suite",
      "Library management",
      "Financial operations",
      "Church integration",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/mo",
    description: "For theological universities",
    features: [
      "Unlimited students",
      "Multi-campus support",
      "Advanced analytics",
      "Custom integrations",
      "Dedicated account manager",
    ],
    highlighted: false,
  },
];

const TESTIMONIALS = [
  {
    quote:
      "CovenantERP transformed how we manage our seminary. What used to take our admin team three days now happens in three clicks. The student lifecycle tracking alone saved us hundreds of hours per semester.",
    name: "Dr. Samuel Raj",
    role: "Principal",
    institution: "Grace Theological Seminary, Bangalore",
  },
  {
    quote:
      "The financial module is exceptional. We can now track fee collections, generate invoices, and manage scholarships all in one place. Our finance team loves the real-time dashboards.",
    name: "Rev. Dr. Mercy Thomas",
    role: "Dean of Administration",
    institution: "New Life Bible College, Chennai",
  },
  {
    quote:
      "We evaluated five ERP systems before choosing CovenantERP. None of them understood the unique needs of theological education like this platform does. The church integration module is brilliant.",
    name: "Prof. David Kurian",
    role: "Director of IT",
    institution: "Covenant Theological University, Kerala",
  },
];

const TRUSTED_LOGOS = [
  "Grace Seminary",
  "Bethel College",
  "New Life Theological",
  "Covenant University",
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
  const isInView = useInView(ref, { once: true, margin: "-80px" });

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
/*  Background floating orbs                                           */
/* ------------------------------------------------------------------ */

function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Fuchsia orb */}
      <motion.div
        className="absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full bg-fuchsia-500/20 blur-[120px]"
        animate={{
          y: [0, -40, 0],
          x: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Violet orb */}
      <motion.div
        className="absolute -right-32 top-1/3 h-[400px] w-[400px] rounded-full bg-violet-500/20 blur-[120px]"
        animate={{
          y: [0, 30, 0],
          x: [0, -20, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      {/* Cyan orb */}
      <motion.div
        className="absolute -bottom-32 left-1/3 h-[350px] w-[350px] rounded-full bg-cyan-400/15 blur-[120px]"
        animate={{
          y: [0, -20, 0],
          x: [0, 30, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Grid pattern overlay                                               */
/* ------------------------------------------------------------------ */

function GridPattern() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Gradient text helper                                               */
/* ------------------------------------------------------------------ */

function GradientText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Glass card                                                         */
/* ------------------------------------------------------------------ */

function GlassCard({
  children,
  className,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl",
        hover &&
          "transition-all duration-500 hover:border-fuchsia-500/20 hover:bg-white/[0.05] hover:shadow-lg hover:shadow-fuchsia-500/5",
        className
      )}
    >
      {children}
    </div>
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
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.nav
        className={cn(
          "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-xl"
            : "bg-transparent"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <button
            onClick={() => scrollTo("hero")}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-violet-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Covenant<span className="text-fuchsia-400">ERP</span>
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                onClick={() => scrollTo(link)}
                className="text-sm text-slate-400 transition-colors hover:text-white"
              >
                {link}
              </button>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={() => onNavigate("/login")}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:border-white/20 hover:bg-white/5"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate("/login")}
              className="rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 px-4 py-2 text-sm font-medium text-white transition-all hover:from-fuchsia-600 hover:to-violet-600 hover:shadow-lg hover:shadow-fuchsia-500/25"
            >
              Get Started
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="text-white md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-xl pt-20 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col items-center gap-6 pt-8">
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link}
                  onClick={() => scrollTo(link)}
                  className="text-lg text-slate-300 transition-colors hover:text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 + 0.1 }}
                >
                  {link}
                </motion.button>
              ))}
              <motion.div
                className="mt-4 flex flex-col gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onNavigate("/login");
                  }}
                  className="rounded-lg border border-white/10 px-8 py-3 text-sm font-medium text-white"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onNavigate("/login");
                  }}
                  className="rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 px-8 py-3 text-sm font-medium text-white"
                >
                  Get Started
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
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 pt-20"
    >
      <FloatingOrbs />
      <GridPattern />

      <motion.div
        className="relative z-10 mx-auto max-w-5xl text-center"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        {/* Badge */}
        <motion.div
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-1.5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Zap className="h-3.5 w-3.5 text-fuchsia-400" />
          <span className="text-xs font-medium text-fuchsia-300">
            Now serving 120+ theological institutions
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          The Operating System
          <br />
          for{" "}
          <GradientText>Theological Education</GradientText>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg md:text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          Manage your seminary&apos;s entire ecosystem — from admissions to graduation,
          faculty to finance, library to chapel — in one beautiful platform.
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
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition-all hover:from-fuchsia-600 hover:to-violet-600 hover:shadow-xl hover:shadow-fuchsia-500/30"
          >
            Start Free Trial
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
              <Play className="h-3.5 w-3.5 fill-white text-white" />
            </div>
            Watch Demo
          </button>
        </motion.div>

        {/* Subtle stats bar */}
        <motion.div
          className="mt-16 flex flex-wrap items-center justify-center gap-8 border-t border-white/[0.06] pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          {[
            { value: "120+", label: "Institutions" },
            { value: "50K+", label: "Students Managed" },
            { value: "99.9%", label: "Uptime" },
            { value: "4.9/5", label: "User Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl font-bold text-white sm:text-2xl">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-slate-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  3. Trusted By Section                                              */
/* ------------------------------------------------------------------ */

function TrustedBySection() {
  return (
    <section className="relative bg-slate-950 py-16 px-6">
      <div className="mx-auto max-w-7xl">
        <FadeInSection>
          <p className="mb-10 text-center text-sm font-medium uppercase tracking-widest text-slate-500">
            Trusted by theological institutions across India
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {TRUSTED_LOGOS.map((name, i) => (
              <motion.div
                key={name}
                className="flex h-12 items-center rounded-lg border border-white/[0.06] bg-white/[0.02] px-6 text-sm font-semibold text-slate-500 transition-all hover:border-white/10 hover:text-slate-300 md:h-14 md:px-8 md:text-base"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <GraduationCap className="mr-2 h-4 w-4" />
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
/*  4. Features Grid                                                   */
/* ------------------------------------------------------------------ */

function FeaturesGrid() {
  return (
    <section id="features" className="relative bg-slate-950 py-24 px-6">
      <FloatingOrbs />
      <div className="relative z-10 mx-auto max-w-7xl">
        <FadeInSection className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-fuchsia-400">
            Everything You Need
          </p>
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            One Platform.{" "}
            <GradientText>Infinite Possibilities.</GradientText>
          </h2>
          <p className="mx-auto max-w-2xl text-base text-slate-400 md:text-lg">
            Purpose-built for theological education. Every module designed with
            deep understanding of seminary operations.
          </p>
        </FadeInSection>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <FadeInSection
              key={feature.title}
              delay={i * 0.08}
              direction={i % 2 === 0 ? "up" : "up"}
            >
              <GlassCard className="group flex h-full flex-col p-6 md:p-8">
                {/* Icon */}
                <div
                  className={cn(
                    "mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
                    feature.gradient,
                    "bg-opacity-20"
                  )}
                  style={{
                    background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                  }}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>

                <h3 className="mb-2 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {feature.description}
                </p>

                {/* Hover arrow */}
                <div className="mt-auto pt-6">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors group-hover:text-fuchsia-400">
                    Learn more
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </GlassCard>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  5. How It Works                                                    */
/* ------------------------------------------------------------------ */

function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Sign Up",
      description:
        "Create your account with your institutional email. Verification takes under 60 seconds.",
      icon: Mail,
    },
    {
      num: "02",
      title: "Set Up",
      description:
        "Complete your institution profile, configure programs, and import existing data in minutes.",
      icon: Zap,
    },
    {
      num: "03",
      title: "Launch",
      description:
        "Start managing your seminary with full access to every module. Onboard your team effortlessly.",
      icon: Globe,
    },
  ];

  return (
    <section id="about" className="relative bg-slate-950 py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <FadeInSection className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-fuchsia-400">
            Getting Started
          </p>
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Up and Running in{" "}
            <GradientText>Three Steps</GradientText>
          </h2>
          <p className="mx-auto max-w-xl text-base text-slate-400">
            From sign-up to full deployment, we&apos;ve made every step effortless.
          </p>
        </FadeInSection>

        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="absolute left-0 right-0 top-16 hidden h-px bg-gradient-to-r from-transparent via-fuchsia-500/30 to-transparent md:block" />

          <div className="grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((step, i) => (
              <FadeInSection key={step.num} delay={i * 0.15}>
                <div className="relative flex flex-col items-center text-center">
                  {/* Step circle */}
                  <div className="relative mb-6">
                    <motion.div
                      className="flex h-16 w-16 items-center justify-center rounded-2xl border border-fuchsia-500/20 bg-slate-950 shadow-lg shadow-fuchsia-500/10"
                      whileHover={{ scale: 1.05, borderColor: "rgba(217,70,239,0.4)" }}
                      transition={{ duration: 0.3 }}
                    >
                      <step.icon className="h-7 w-7 text-fuchsia-400" />
                    </motion.div>
                    {/* Number badge */}
                    <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-500 text-[10px] font-bold text-white">
                      {step.num}
                    </div>
                  </div>

                  <h3 className="mb-2 text-lg font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="max-w-xs text-sm leading-relaxed text-slate-400">
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
/*  6. Pricing Preview                                                 */
/* ------------------------------------------------------------------ */

function PricingPreview({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <section id="pricing" className="relative bg-slate-950 py-24 px-6">
      <FloatingOrbs />
      <div className="relative z-10 mx-auto max-w-6xl">
        <FadeInSection className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-fuchsia-400">
            Pricing
          </p>
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Simple, Transparent{" "}
            <GradientText>Pricing</GradientText>
          </h2>
          <p className="mx-auto max-w-xl text-base text-slate-400">
            No hidden fees. No surprises. Start free and scale as you grow.
          </p>
        </FadeInSection>

        <div className="grid gap-6 md:grid-cols-3">
          {PRICING.map((plan, i) => (
            <FadeInSection key={plan.name} delay={i * 0.1}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border p-6 md:p-8",
                  plan.highlighted
                    ? "border-fuchsia-500/30 bg-gradient-to-b from-fuchsia-500/10 via-violet-500/5 to-transparent shadow-2xl shadow-fuchsia-500/10"
                    : "border-white/[0.06] bg-white/[0.02]"
                )}
              >
                {/* Popular badge */}
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-fuchsia-500/25">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="mb-1 text-lg font-semibold text-white">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-slate-500">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-slate-500">{plan.period}</span>
                </div>

                <ul className="mb-8 flex flex-1 flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-slate-300"
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-fuchsia-500/10">
                        <Check className="h-3 w-3 text-fuchsia-400" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => onNavigate("/login")}
                  className={cn(
                    "w-full rounded-xl py-3 text-sm font-semibold transition-all",
                    plan.highlighted
                      ? "bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white shadow-lg shadow-fuchsia-500/25 hover:from-fuchsia-600 hover:to-violet-600 hover:shadow-xl hover:shadow-fuchsia-500/30"
                      : "border border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10"
                  )}
                >
                  Get Started
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
/*  7. Testimonial Section                                             */
/* ------------------------------------------------------------------ */

function TestimonialSection() {
  return (
    <section className="relative bg-slate-950 py-24 px-6">
      <div className="mx-auto max-w-7xl">
        <FadeInSection className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-fuchsia-400">
            Testimonials
          </p>
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Loved by{" "}
            <GradientText>Administrators</GradientText>
          </h2>
          <p className="mx-auto max-w-xl text-base text-slate-400">
            Hear from the leaders who transformed their institutions with
            CovenantERP.
          </p>
        </FadeInSection>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <FadeInSection key={i} delay={i * 0.1}>
              <div className="group relative h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-fuchsia-500/20 hover:bg-white/[0.04] md:p-8">
                {/* Gradient top line */}
                <div className="absolute left-6 right-6 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent" />

                <Quote className="mb-4 h-8 w-8 text-fuchsia-500/30" />
                <p className="mb-6 text-sm leading-relaxed text-slate-300 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-auto">
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star
                        key={si}
                        className="h-3.5 w-3.5 fill-fuchsia-400 text-fuchsia-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">
                    {t.role}, {t.institution}
                  </p>
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
/*  8. CTA Section                                                     */
/* ------------------------------------------------------------------ */

function CTASection({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <section id="contact" className="relative bg-slate-950 py-24 px-6">
      <div className="mx-auto max-w-4xl">
        <FadeInSection>
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-fuchsia-500/10 via-violet-500/5 to-cyan-400/5 p-10 text-center md:p-16">
            {/* Decorative orbs */}
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-fuchsia-500/20 blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-violet-500/20 blur-[80px]" />

            <div className="relative z-10">
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                Ready to Transform
                <br />
                <GradientText>Your Seminary?</GradientText>
              </h2>
              <p className="mx-auto mb-8 max-w-lg text-base text-slate-400 md:text-lg">
                Start your free trial today. No credit card required. Full access
                to every feature for 14 days.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  onClick={() => onNavigate("/login")}
                  className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition-all hover:from-fuchsia-600 hover:to-violet-600 hover:shadow-xl hover:shadow-fuchsia-500/30"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <button className="flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white">
                  <Phone className="h-4 w-4" />
                  Schedule a Demo
                </button>
              </div>
              <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Shield className="h-3.5 w-3.5" />
                SOC-2 Compliant &middot; 256-bit Encryption &middot; GDPR Ready
              </p>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  9. Footer                                                          */
/* ------------------------------------------------------------------ */

function Footer({ onNavigate }: { onNavigate: (path: string) => void }) {
  const scrollTo = (id: string) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-white/[0.06] bg-slate-950 px-6 pt-16 pb-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-violet-500">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Covenant<span className="text-fuchsia-400">ERP</span>
              </span>
            </div>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-slate-500">
              The all-in-one management platform built exclusively for
              theological colleges and seminaries.
            </p>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <button
                  key={i}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] text-slate-500 transition-all hover:border-white/10 hover:text-white"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Product</h4>
            <ul className="flex flex-col gap-3">
              {["Features", "Pricing", "Integrations", "Changelog"].map(
                (item) => (
                  <li key={item}>
                    <button
                      onClick={() => scrollTo(item === "Features" || item === "Pricing" ? item : "features")}
                      className="text-sm text-slate-500 transition-colors hover:text-slate-300"
                    >
                      {item}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Resources</h4>
            <ul className="flex flex-col gap-3">
              {["Documentation", "API Reference", "Blog", "Community"].map(
                (item) => (
                  <li key={item}>
                    <button
                      onClick={() => scrollTo("features")}
                      className="text-sm text-slate-500 transition-colors hover:text-slate-300"
                    >
                      {item}
                    </button>
                  </li>
                )
              )}
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
                      className="text-sm text-slate-500 transition-colors hover:text-slate-300"
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
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 md:flex-row">
          <p className="text-xs text-slate-600">
            &copy; 2024 Covenant Research Systems. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function MarketingLanding({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white antialiased">
      <Navbar onNavigate={onNavigate} />
      <HeroSection onNavigate={onNavigate} />
      <TrustedBySection />
      <FeaturesGrid />
      <HowItWorks />
      <PricingPreview onNavigate={onNavigate} />
      <TestimonialSection />
      <CTASection onNavigate={onNavigate} />
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
