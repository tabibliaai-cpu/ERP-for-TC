"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import {
  Check,
  X,
  Sparkles,
  ChevronDown,
  Mail,
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  HeadphonesIcon,
  Brain,
  Building2,
  Zap,
  Star,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PlanFeature {
  text: string;
}

interface Plan {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  icon: React.ReactNode;
  features: PlanFeature[];
  cta: string;
  popular?: boolean;
}

interface ComparisonFeature {
  category: string;
  rows: {
    name: string;
    basic: boolean | string;
    premium: boolean | string;
    enterprise: boolean | string;
  }[];
}

interface FAQ {
  question: string;
  answer: string;
}

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const PLANS: Plan[] = [
  {
    name: "Basic",
    monthlyPrice: 29,
    annualPrice: 23,
    description: "For small Bible colleges",
    icon: <GraduationCap className="h-6 w-6" />,
    features: [
      { text: "Up to 100 students" },
      { text: "Up to 10 faculty" },
      { text: "Student management" },
      { text: "Basic attendance" },
      { text: "Simple grading" },
      { text: "Email support" },
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Premium",
    monthlyPrice: 79,
    annualPrice: 63,
    description: "For established seminaries",
    icon: <Star className="h-6 w-6" />,
    features: [
      { text: "Up to 500 students" },
      { text: "Unlimited faculty" },
      { text: "Everything in Basic" },
      { text: "Full academic config" },
      { text: "Library management" },
      { text: "Financial suite" },
      { text: "Church operations" },
      { text: "Priority support" },
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    monthlyPrice: 199,
    annualPrice: 159,
    description: "For theological universities",
    icon: <Building2 className="h-6 w-6" />,
    features: [
      { text: "Unlimited students" },
      { text: "Unlimited faculty" },
      { text: "Everything in Premium" },
      { text: "AI-powered analytics" },
      { text: "Custom integrations" },
      { text: "Dedicated account manager" },
      { text: "SLA guarantee" },
    ],
    cta: "Contact Sales",
  },
];

const COMPARISON: ComparisonFeature[] = [
  {
    category: "Core",
    rows: [
      { name: "Student management", basic: true, premium: true, enterprise: true },
      { name: "Faculty management", basic: true, premium: true, enterprise: true },
      { name: "User roles & permissions", basic: true, premium: true, enterprise: true },
      { name: "Max students", basic: "100", premium: "500", enterprise: "Unlimited" },
      { name: "Max faculty", basic: "10", premium: "Unlimited", enterprise: "Unlimited" },
    ],
  },
  {
    category: "Academic",
    rows: [
      { name: "Simple grading", basic: true, premium: true, enterprise: true },
      { name: "Basic attendance", basic: true, premium: true, enterprise: true },
      { name: "Full academic config", basic: false, premium: true, enterprise: true },
      { name: "Curriculum builder", basic: false, premium: true, enterprise: true },
      { name: "Advanced transcripts", basic: false, premium: true, enterprise: true },
    ],
  },
  {
    category: "Financial",
    rows: [
      { name: "Basic invoices", basic: true, premium: true, enterprise: true },
      { name: "Fee tracking", basic: false, premium: true, enterprise: true },
      { name: "Financial suite", basic: false, premium: true, enterprise: true },
      { name: "Donation management", basic: false, premium: true, enterprise: true },
      { name: "Payroll integration", basic: false, premium: false, enterprise: true },
    ],
  },
  {
    category: "Library",
    rows: [
      { name: "Book catalog", basic: false, premium: true, enterprise: true },
      { name: "Circulation tracking", basic: false, premium: true, enterprise: true },
      { name: "Digital resources", basic: false, premium: false, enterprise: true },
      { name: "Inter-library loan", basic: false, premium: false, enterprise: true },
    ],
  },
  {
    category: "AI & Analytics",
    rows: [
      { name: "Basic reports", basic: true, premium: true, enterprise: true },
      { name: "Custom dashboards", basic: false, premium: true, enterprise: true },
      { name: "AI-powered analytics", basic: false, premium: false, enterprise: true },
      { name: "Predictive insights", basic: false, premium: false, enterprise: true },
      { name: "Custom integrations", basic: false, premium: false, enterprise: true },
    ],
  },
  {
    category: "Support",
    rows: [
      { name: "Email support", basic: true, premium: true, enterprise: true },
      { name: "Priority support", basic: false, premium: true, enterprise: true },
      { name: "Dedicated account manager", basic: false, premium: false, enterprise: true },
      { name: "SLA guarantee", basic: false, premium: false, enterprise: true },
      { name: "Onboarding assistance", basic: false, premium: true, enterprise: true },
    ],
  },
];

const FAQS: FAQ[] = [
  {
    question: "Can I switch plans?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll be prorated for the remainder of your billing cycle. When downgrading, the new rate takes effect at your next billing date.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes! All plans come with a 14-day free trial. No credit card required to start. You get full access to all features in your chosen plan during the trial period.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards (Visa, Mastercard, American Express), bank transfers, and UPI payments. For Enterprise plans, we also support purchase orders and invoicing.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, absolutely. There are no long-term contracts or cancellation fees. You can cancel your subscription at any time from your account settings. Your data will remain accessible for 30 days after cancellation.",
  },
  {
    question: "Do you offer discounts for multiple campuses?",
    answer:
      "Yes! We offer special multi-campus pricing for institutions operating across multiple locations. Contact our sales team at support@covenanterp.com for a customized quote.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use end-to-end encryption for all data in transit and at rest. CovenantERP is SOC 2 Type II compliant, and we conduct regular third-party security audits. Your institutional data is hosted on secure, redundant servers with 99.99% uptime.",
  },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Core: <Users className="h-4 w-4" />,
  Academic: <BookOpen className="h-4 w-4" />,
  Financial: <DollarSign className="h-4 w-4" />,
  Library: <BookOpen className="h-4 w-4" />,
  "AI & Analytics": <Brain className="h-4 w-4" />,
  Support: <HeadphonesIcon className="h-4 w-4" />,
};

/* ------------------------------------------------------------------ */
/*  Animated price                                                     */
/* ------------------------------------------------------------------ */

function AnimatedPrice({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
      animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
      exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="inline-block"
    >
      {value}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/*  Plan card                                                          */
/* ------------------------------------------------------------------ */

const PlanCard: React.FC<{
  plan: Plan;
  isAnnual: boolean;
  index: number;
  onSelectPlan?: (plan: string) => void;
}> = ({ plan, isAnnual, index, onSelectPlan }) => {
  const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.12, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      className={cn(
        "relative flex flex-col rounded-2xl p-[1px] transition-shadow duration-300",
        plan.popular
          ? "scale-[1.03] shadow-2xl shadow-blue-500/20 md:scale-105"
          : "shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-blue-500/10"
      )}
    >
      {/* Gradient border for popular */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl",
          plan.popular
            ? "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600"
            : "bg-gradient-to-br from-slate-700/60 via-slate-600/40 to-slate-700/60"
        )}
      />

      {/* Glass card */}
      <div
        className={cn(
          "relative flex flex-col h-full rounded-2xl p-6 sm:p-8",
          "bg-slate-900/70 backdrop-blur-xl border border-white/[0.06]"
        )}
      >
        {/* Popular badge */}
        {plan.popular && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-500/30">
              <Sparkles className="h-3.5 w-3.5" />
              Most Popular
            </span>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div
            className={cn(
              "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl",
              plan.popular
                ? "bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400"
                : "bg-slate-800/80 text-slate-400"
            )}
          >
            {plan.icon}
          </div>
          <h3 className="text-xl font-bold text-white">{plan.name}</h3>
          <p className="mt-1 text-sm text-slate-400">{plan.description}</p>
        </div>

        {/* Price */}
        <div className="mb-6 flex items-baseline gap-1">
          <span className="text-sm font-medium text-slate-400">$</span>
          <AnimatePresence mode="wait">
            <span className="text-5xl font-extrabold tracking-tight text-white">
              <AnimatedPrice value={price} />
            </span>
          </AnimatePresence>
          <span className="text-sm text-slate-400">/mo</span>
        </div>

        {isAnnual && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 -mt-3 flex items-center gap-1.5 text-xs text-emerald-400"
          >
            <Zap className="h-3.5 w-3.5" />
            Save 20% with annual billing
          </motion.p>
        )}

        {!isAnnual && <div className="mb-6" />}

        {/* CTA */}
        <button
          onClick={() => onSelectPlan?.(plan.name.toLowerCase())}
          className={cn(
            "w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 cursor-pointer",
            plan.popular
              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
              : "border border-slate-700 bg-slate-800/50 text-slate-200 hover:border-blue-500/50 hover:bg-slate-800/80 hover:text-white"
          )}
        >
          {plan.cta}
        </button>

        {/* Divider */}
        <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

        {/* Features */}
        <ul className="flex-1 space-y-3">
          {plan.features.map((feature, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
              className="flex items-start gap-3 text-sm text-slate-300"
            >
              <Check
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0",
                  plan.popular ? "text-blue-400" : "text-emerald-400"
                )}
              />
              {feature.text}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/*  Comparison table cell                                              */
/* ------------------------------------------------------------------ */

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return (
      <span className="text-sm font-medium text-slate-300">{value}</span>
    );
  }
  return value ? (
    <Check className="mx-auto h-5 w-5 text-emerald-400" />
  ) : (
    <X className="mx-auto h-5 w-5 text-slate-600" />
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ item                                                           */
/* ------------------------------------------------------------------ */

const FAQItem: React.FC<{ faq: FAQ; isOpen: boolean; onToggle: () => void }> = ({ faq, isOpen, onToggle }) => {
  return (
    <div className="border-b border-slate-800/60 last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left cursor-pointer group"
      >
        <span className="pr-4 text-sm font-medium text-slate-200 transition-colors group-hover:text-white sm:text-base">
          {faq.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 text-slate-500"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-slate-400">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main Pricing page                                                  */
/* ------------------------------------------------------------------ */

export function Pricing({ onSelectPlan }: { onSelectPlan?: (plan: string) => void }) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = useCallback((index: number) => {
    setOpenFAQ((prev) => (prev === index ? null : index));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* ===== Decorative background glows ===== */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-500/[0.07] blur-[120px]" />
        <div className="absolute top-1/3 -left-32 h-[400px] w-[400px] rounded-full bg-indigo-500/[0.05] blur-[100px]" />
        <div className="absolute bottom-1/4 -right-32 h-[350px] w-[350px] rounded-full bg-purple-600/[0.05] blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ===== 1. Header ===== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-20 pb-12 text-center sm:pt-28 sm:pb-16"
        >
          <h1 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Simple,{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Transparent
            </span>{" "}
            Pricing
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-400 sm:text-lg">
            Choose the plan that fits your institution. All plans include core features. Upgrade
            anytime.
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/60 p-1 backdrop-blur-sm">
            <button
              onClick={() => setIsAnnual(false)}
              className={cn(
                "cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-all duration-200",
                !isAnnual
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={cn(
                "cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-all duration-200",
                isAnnual
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Annual
            </button>
            <AnimatePresence>
              {isAnnual && (
                <motion.span
                  initial={{ opacity: 0, x: -8, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -8, scale: 0.8 }}
                  className="mr-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400"
                >
                  -20%
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* ===== 2. Pricing cards ===== */}
        <section className="pb-20 sm:pb-28">
          <div className="grid gap-6 md:grid-cols-3 md:gap-4 lg:gap-6 items-start justify-items-center">
            {PLANS.map((plan, i) => (
              <PlanCard
                key={plan.name}
                plan={plan}
                isAnnual={isAnnual}
                index={i}
                onSelectPlan={onSelectPlan ?? undefined}
              />
            ))}
          </div>
        </section>

        {/* ===== 3. Feature comparison table ===== */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="pb-20 sm:pb-28"
        >
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Compare{" "}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                All Features
              </span>
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              A detailed look at everything included in each plan
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm scrollbar-thin">
            <table className="w-full min-w-[640px] text-left">
              {/* Header */}
              <thead>
                <tr className="border-b border-slate-800/60">
                  <th className="px-5 py-4 text-sm font-semibold text-slate-400">Features</th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-slate-300">
                    Basic
                  </th>
                  <th className="px-5 py-4 text-center">
                    <span className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                      Premium
                    </span>
                  </th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-slate-300">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((group, gi) => (
                  <group>
                    {/* Category header */}
                    <tr key={`cat-${gi}`}>
                      <td
                        colSpan={4}
                        className="px-5 py-3 text-xs font-bold uppercase tracking-widest text-blue-400/80 bg-slate-800/20"
                      >
                        <span className="inline-flex items-center gap-2">
                          {CATEGORY_ICONS[group.category]}
                          {group.category}
                        </span>
                      </td>
                    </tr>
                    {group.rows.map((row, ri) => (
                      <tr
                        key={`${gi}-${ri}`}
                        className={cn(
                          "border-b border-slate-800/30 transition-colors hover:bg-slate-800/20",
                          ri === group.rows.length - 1 && gi === COMPARISON.length - 1
                            ? "border-0"
                            : ""
                        )}
                      >
                        <td className="px-5 py-3 text-sm text-slate-300">{row.name}</td>
                        <td className="px-5 py-3 text-center">
                          <CellValue value={row.basic} />
                        </td>
                        <td className="px-5 py-3 text-center">
                          <CellValue value={row.premium} />
                        </td>
                        <td className="px-5 py-3 text-center">
                          <CellValue value={row.enterprise} />
                        </td>
                      </tr>
                    ))}
                  </group>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* ===== 4. FAQ ===== */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="pb-20 sm:pb-28"
        >
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold sm:text-3xl">
                Frequently Asked{" "}
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Questions
                </span>
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Everything you need to know about CovenantERP pricing
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm px-6 sm:px-8">
              {FAQS.map((faq, i) => (
                <FAQItem
                  key={i}
                  faq={faq}
                  isOpen={openFAQ === i}
                  onToggle={(): void => { toggleFAQ(i); }}
                />
              ))}
            </div>
          </div>
        </motion.section>

        {/* ===== 5. Bottom CTA ===== */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="pb-24 sm:pb-32"
        >
          <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900/50 backdrop-blur-xl p-8 text-center sm:p-12">
            {/* Glow inside */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
              <div className="h-[200px] w-[300px] rounded-full bg-blue-500/[0.08] blur-[80px]" />
            </div>

            <div className="relative z-10">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
                <Mail className="h-7 w-7 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl">Still have questions?</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                Our team is here to help you find the right plan for your institution.
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={() => onSelectPlan?.("contact")}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <HeadphonesIcon className="h-4 w-4" />
                  Contact Our Team
                </button>
                <a
                  href="mailto:support@covenanterp.com"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-6 py-3 text-sm font-semibold text-slate-300 transition-all hover:border-blue-500/50 hover:bg-slate-800/80 hover:text-white"
                >
                  <Mail className="h-4 w-4" />
                  support@covenanterp.com
                </a>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
