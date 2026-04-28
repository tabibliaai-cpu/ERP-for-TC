import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Brain, GraduationCap, BookOpen, BarChart3, Church, UserCheck,
  DollarSign, ShieldCheck, Search, MessageSquare, Zap, Activity,
  Settings, ChevronDown, ChevronRight, ToggleLeft, ToggleRight,
  Loader2, TrendingUp, TrendingDown, Globe, Building2, Cpu,
  Thermometer, FileText, Filter, RefreshCw, AlertCircle,
  CheckCircle, Server, Gauge, Clock, Coins, ArrowUpRight,
  ArrowDownRight, Sparkles, Lock, Sliders, Eye, Save,
  CircleDot, Network, Radio, Waves, Hash, Layers, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  collection, getDocs, addDoc, updateDoc, doc, setDoc,
  serverTimestamp, query, where, writeBatch
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { cn } from '../../lib/utils';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface AIConfig {
  id?: string;
  institutionId?: string;
  featureId: string;
  enabled: boolean;
  model: string;
  temperature: number;
  maxTokens: number;
  rateLimitPerMinute: number;
  rateLimitPerDay: number;
  usageCount: number;
  lastUsed?: any;
  updatedAt?: any;
}

interface InstitutionSummary {
  id: string;
  name: string;
  activeFeatures: number;
  totalUsage: number;
}

interface UserTierLimit {
  tier: string;
  label: string;
  requestsPerMinute: number;
  requestsPerDay: number;
  maxTokens: number;
}

interface GlobalRateLimit {
  requestsPerMinute: number;
  requestsPerDay: number;
  maxConcurrent: number;
}

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const AI_FEATURES = [
  {
    id: 'ai_tutor',
    name: 'AI Tutor',
    description: 'Intelligent study assistance with personalized learning paths, concept explanations, and practice problems.',
    icon: GraduationCap,
    color: 'from-blue-500 to-pink-500',
    bgLight: 'bg-blue-50',
    textLight: 'text-blue-700',
    badgeBg: 'bg-blue-100',
  },
  {
    id: 'ai_lesson_plan',
    name: 'AI Lesson Plan Generator',
    description: 'Automatically generate structured lesson plans, learning objectives, and assessment rubrics for faculty.',
    icon: BookOpen,
    color: 'from-indigo-500 to-purple-500',
    bgLight: 'bg-indigo-50',
    textLight: 'text-indigo-700',
    badgeBg: 'bg-indigo-100',
  },
  {
    id: 'ai_grade_predictor',
    name: 'AI Grade Predictor',
    description: 'Analyze student performance patterns and predict future grades with early intervention alerts.',
    icon: BarChart3,
    color: 'from-cyan-500 to-blue-500',
    bgLight: 'bg-cyan-50',
    textLight: 'text-cyan-700',
    badgeBg: 'bg-cyan-100',
  },
  {
    id: 'ai_sermon_assistant',
    name: 'AI Sermon Assistant',
    description: 'Generate theological content, sermon outlines, scripture references, and devotional materials.',
    icon: Church,
    color: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-50',
    textLight: 'text-amber-700',
    badgeBg: 'bg-amber-100',
  },
  {
    id: 'ai_attendance_analyzer',
    name: 'AI Attendance Analyzer',
    description: 'Predict dropout risk from attendance patterns and provide automated retention recommendations.',
    icon: UserCheck,
    color: 'from-emerald-500 to-green-500',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-700',
    badgeBg: 'bg-emerald-100',
  },
  {
    id: 'ai_financial_forecaster',
    name: 'AI Financial Forecaster',
    description: 'Predict revenue, expenses, and cash flow trends with ML-driven financial modeling.',
    icon: DollarSign,
    color: 'from-rose-500 to-red-500',
    bgLight: 'bg-rose-50',
    textLight: 'text-rose-700',
    badgeBg: 'bg-rose-100',
  },
  {
    id: 'ai_plagiarism_detector',
    name: 'AI Plagiarism Detector',
    description: 'Check assignment originality against global databases with detailed similarity reports.',
    icon: ShieldCheck,
    color: 'from-indigo-500 to-blue-500',
    bgLight: 'bg-indigo-50',
    textLight: 'text-indigo-700',
    badgeBg: 'bg-indigo-100',
  },
  {
    id: 'smart_search',
    name: 'Smart Search',
    description: 'Semantic search across library catalogs, courses, and institutional resources using AI embeddings.',
    icon: Search,
    color: 'from-teal-500 to-cyan-500',
    bgLight: 'bg-teal-50',
    textLight: 'text-teal-700',
    badgeBg: 'bg-teal-100',
  },
  {
    id: 'ai_chat_assistant',
    name: 'AI Chat Assistant',
    description: 'General-purpose conversational AI for institutional Q&A, support, and information retrieval.',
    icon: MessageSquare,
    color: 'from-purple-500 to-indigo-500',
    bgLight: 'bg-purple-50',
    textLight: 'text-purple-700',
    badgeBg: 'bg-purple-100',
  },
];

const MODEL_OPTIONS = [
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable OpenAI model, excellent for complex tasks' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and cost-effective, great for high-volume tasks' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', description: "Anthropic's most powerful model for deep analysis" },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced performance and speed from Anthropic' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fastest Claude model, ideal for simple tasks' },
  { id: 'gemini-pro', name: 'Gemini Pro', description: "Google's advanced multimodal model" },
  { id: 'gemini-flash', name: 'Gemini Flash', description: "Google's fastest model for low-latency tasks" },
];

const DEFAULT_TIER_LIMITS: UserTierLimit[] = [
  { tier: 'free', label: 'Free Tier', requestsPerMinute: 5, requestsPerDay: 50, maxTokens: 1000 },
  { tier: 'basic', label: 'Basic Plan', requestsPerMinute: 15, requestsPerDay: 300, maxTokens: 2000 },
  { tier: 'pro', label: 'Professional Plan', requestsPerMinute: 30, requestsPerDay: 1000, maxTokens: 4000 },
  { tier: 'enterprise', label: 'Enterprise Plan', requestsPerMinute: 60, requestsPerDay: 5000, maxTokens: 8000 },
];

const DEFAULT_GLOBAL_LIMIT: GlobalRateLimit = {
  requestsPerMinute: 500,
  requestsPerDay: 100000,
  maxConcurrent: 50,
};

const COST_PER_1K_TOKENS: Record<string, number> = {
  'gpt-4o': 0.005,
  'gpt-4o-mini': 0.00015,
  'claude-3-opus': 0.015,
  'claude-3-sonnet': 0.003,
  'claude-3-haiku': 0.00025,
  'gemini-pro': 0.00125,
  'gemini-flash': 0.000075,
};

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function getFeatureDef(featureId: string) {
  return AI_FEATURES.find(f => f.id === featureId) || AI_FEATURES[0];
}

// ═══════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white/80 backdrop-blur-xl rounded-lg shadow-lg border border-white/20', className)}>
      {children}
    </div>
  );
}

function NeuralBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Floating gradient orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute -bottom-48 -left-24 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-400/8 to-blue-400/8 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1s' }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-300/5 to-indigo-300/5 rounded-full blur-3xl" />

      {/* Neural network dots pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="neural-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="30" cy="30" r="1.5" fill="currentColor" />
            <line x1="0" y1="30" x2="60" y2="30" stroke="currentColor" strokeWidth="0.3" />
            <line x1="30" y1="0" x2="30" y2="60" stroke="currentColor" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#neural-grid)" />
      </svg>

      {/* Animated connection lines */}
      <div className="absolute top-20 left-[15%] w-px h-32 bg-gradient-to-b from-transparent via-blue-400/20 to-transparent animate-pulse" />
      <div
        className="absolute top-40 right-[20%] w-px h-40 bg-gradient-to-b from-transparent via-indigo-400/20 to-transparent animate-pulse"
        style={{ animationDelay: '0.5s' }}
      />
      <div
        className="absolute bottom-20 left-[30%] w-40 h-px bg-gradient-to-r from-transparent via-blue-400/15 to-transparent animate-pulse"
        style={{ animationDelay: '1.5s' }}
      />
      <div
        className="absolute top-60 left-[60%] w-px h-24 bg-gradient-to-b from-transparent via-indigo-400/15 to-transparent animate-pulse"
        style={{ animationDelay: '2s' }}
      />

      {/* Floating nodes */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-blue-400/30"
          style={{ top: `${15 + i * 15}%`, left: `${10 + i * 16}%` }}
          animate={{ y: [0, -8, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
        />
      ))}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`v-${i}`}
          className="absolute w-1 h-1 rounded-full bg-indigo-400/25"
          style={{ top: `${20 + i * 20}%`, right: `${12 + i * 18}%` }}
          animate={{ y: [0, 6, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 4 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
        />
      ))}
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  disabled,
  size = 'default',
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  size?: 'default' | 'sm';
}) {
  const isSmall = size === 'sm';
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={cn(
        'relative inline-flex shrink-0 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        isSmall ? 'h-5 w-9' : 'h-6 w-11',
        checked
          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md shadow-blue-500/25'
          : 'bg-gray-200',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={cn(
          'inline-block rounded-full bg-white shadow-sm',
          isSmall ? 'h-3.5 w-3.5' : 'h-4 w-4',
          checked ? (isSmall ? 'ml-[18px]' : 'ml-[22px]') : 'ml-0.5'
        )}
        style={{ marginTop: isSmall ? '3px' : '4px' }}
      />
    </button>
  );
}

function UsageBar({
  value,
  max,
  colorClass = 'from-blue-500 to-indigo-500',
  label,
  showValue = true,
}: {
  value: number;
  max: number;
  colorClass?: string;
  label?: string;
  showValue?: boolean;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const isOverLimit = value > max;

  return (
    <div className="flex items-center gap-3 w-full">
      {label && <span className="text-xs font-medium text-gray-600 w-28 shrink-0 truncate">{label}</span>}
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn(
            'h-full rounded-full',
            isOverLimit ? 'bg-gradient-to-r from-rose-500 to-red-500' : `bg-gradient-to-r ${colorClass}`
          )}
        />
      </div>
      {showValue && (
        <span
          className={cn('text-xs font-bold shrink-0 w-16 text-right', isOverLimit ? 'text-rose-600' : 'text-gray-600')}
        >
          {formatNumber(value)}/{formatNumber(max)}
        </span>
      )}
    </div>
  );
}

function GaugeMeter({ value, max, label, unit = '' }: { value: number; max: number; label: string; unit?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (pct / 100) * circumference;
  const isHigh = pct > 80;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r="40" fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={isHigh ? '#f43f5e' : '#d946ef'} />
              <stop offset="100%" stopColor={isHigh ? '#ef4444' : '#7c3aed'} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('text-sm font-bold', isHigh ? 'text-rose-600' : 'text-gray-800')}>
            {Math.round(pct)}%
          </span>
        </div>
      </div>
      <p className="text-[11px] font-medium text-gray-500 mt-1.5 text-center">{label}</p>
      <p className="text-xs font-bold text-gray-800">
        {formatNumber(value)}
        {unit && <span className="text-gray-400 font-normal">/{unit}</span>}
      </p>
    </div>
  );
}

function MiniBarChart({ data, maxHeight = 80 }: { data: { label: string; value: number; color?: string }[]; maxHeight?: number }) {
  const maxVal = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="flex items-end gap-2 h-full">
      {data.map((item, i) => {
        const height = (item.value / maxVal) * maxHeight;
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <span className="text-[10px] font-bold text-gray-600">{formatNumber(item.value)}</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.05 }}
              className={cn(
                'w-full max-w-[40px] rounded-t-lg',
                item.color || 'bg-gradient-to-t from-blue-500 to-indigo-500'
              )}
              style={{ minHeight: 4 }}
            />
            <span className="text-[9px] font-medium text-gray-400 truncate max-w-full">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function AICenterTab() {
  // ─── Data State ───
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ─── UI State ───
  const [activeTab, setActiveTab] = useState<'features' | 'analytics' | 'rateLimits' | 'models'>('features');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('global');
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Rate Limit State ───
  const [globalLimit, setGlobalLimit] = useState<GlobalRateLimit>(DEFAULT_GLOBAL_LIMIT);
  const [tierLimits, setTierLimits] = useState<UserTierLimit[]>(DEFAULT_TIER_LIMITS);

  // ─── Model Config State ───
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  const [editModel, setEditModel] = useState('gpt-4o-mini');
  const [editTemperature, setEditTemperature] = useState(0.7);
  const [editMaxTokens, setEditMaxTokens] = useState(2048);

  // ─── Content Filter State ───
  const [contentFilters, setContentFilters] = useState<Record<string, boolean>>(
    Object.fromEntries(AI_FEATURES.map(f => [f.id, true]))
  );

  // ─── Toast ───
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ═══════════════════════════════════════════════════════════════════
  // DATA LOADING
  // ═══════════════════════════════════════════════════════════════════

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load AI configs
      const configSnap = await getDocs(collection(db, 'ai_config'));
      const loadedConfigs = configSnap.docs.map(
        d => ({ id: d.id, ...d.data() } as AIConfig)
      );

      // Seed default configs if collection is empty
      if (loadedConfigs.length === 0) {
        const batch = writeBatch(db);
        AI_FEATURES.forEach(feature => {
          const ref = doc(collection(db, 'ai_config'));
          batch.set(ref, {
            featureId: feature.id,
            enabled: true,
            model: feature.id === 'smart_search' ? 'gemini-flash' : 'gpt-4o-mini',
            temperature: 0.7,
            maxTokens: 2048,
            rateLimitPerMinute: 30,
            rateLimitPerDay: 1000,
            usageCount: Math.floor(Math.random() * 5000) + 100,
            updatedAt: serverTimestamp(),
          });
        });
        await batch.commit();

        const freshSnap = await getDocs(collection(db, 'ai_config'));
        setConfigs(freshSnap.docs.map(d => ({ id: d.id, ...d.data() } as AIConfig)));
      } else {
        setConfigs(loadedConfigs);
      }

      // Load institutions
      try {
        const instSnap = await getDocs(collection(db, 'institutions'));
        setInstitutions(
          instSnap.docs.map(d => ({
            id: d.id,
            name: d.data().name || d.data().institutionName || 'Unknown Institution',
          }))
        );
      } catch {
        setInstitutions([
          { id: 'inst_1', name: 'Grace Theological Seminary' },
          { id: 'inst_2', name: 'Covenant Bible College' },
          { id: 'inst_3', name: 'Mount Zion Academy' },
          { id: 'inst_4', name: 'Hope Christian University' },
        ]);
      }
    } catch (err) {
      console.error('Error loading AI config:', err);
      showToast('Failed to load AI configuration data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ═══════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  const handleToggleFeature = async (featureId: string, enabled: boolean) => {
    const config = configs.find(c => c.featureId === featureId && !c.institutionId);
    if (config?.id) {
      try {
        await updateDoc(doc(db, 'ai_config', config.id), { enabled, updatedAt: serverTimestamp() });
        setConfigs(prev => prev.map(c => (c.id === config.id ? { ...c, enabled } : c)));
        showToast(`${getFeatureDef(featureId).name} ${enabled ? 'enabled' : 'disabled'}`);
      } catch (err) {
        console.error('Error toggling feature:', err);
        showToast('Failed to update feature', 'error');
      }
    }
  };

  const openModelEditor = (featureId: string) => {
    const config = globalConfigs.find(c => c.featureId === featureId);
    setEditingFeatureId(featureId);
    setEditModel(config?.model || 'gpt-4o-mini');
    setEditTemperature(config?.temperature || 0.7);
    setEditMaxTokens(config?.maxTokens || 2048);
  };

  const handleSaveModelConfig = async () => {
    if (!editingFeatureId) return;
    const config = configs.find(c => c.featureId === editingFeatureId && !c.institutionId);
    if (!config?.id) return;

    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'ai_config', config.id), {
        model: editModel,
        temperature: editTemperature,
        maxTokens: editMaxTokens,
        updatedAt: serverTimestamp(),
      });
      setConfigs(prev =>
        prev.map(c =>
          c.id === config.id
            ? { ...c, model: editModel, temperature: editTemperature, maxTokens: editMaxTokens }
            : c
        )
      );
      showToast(`Model configuration saved for ${getFeatureDef(editingFeatureId).name}`);
      setEditingFeatureId(null);
    } catch (err) {
      console.error('Error saving model config:', err);
      showToast('Failed to save model configuration', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRateLimits = async () => {
    setIsSaving(true);
    try {
      const globalRef = doc(collection(db, 'ai_config'), 'global_rate_limits');
      await setDoc(globalRef, {
        type: 'global_rate_limits',
        ...globalLimit,
        updatedAt: serverTimestamp(),
      });

      const tierRef = doc(collection(db, 'ai_config'), 'tier_rate_limits');
      await setDoc(tierRef, {
        type: 'tier_rate_limits',
        tiers: tierLimits,
        updatedAt: serverTimestamp(),
      });

      showToast('Rate limits saved successfully');
    } catch (err) {
      console.error('Error saving rate limits:', err);
      showToast('Failed to save rate limits', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleContentFilter = async (featureId: string, enabled: boolean) => {
    setContentFilters(prev => ({ ...prev, [featureId]: enabled }));
    showToast(`${getFeatureDef(featureId).name} content filter ${enabled ? 'enabled' : 'disabled'}`);
  };

  // ═══════════════════════════════════════════════════════════════════
  // COMPUTED DATA
  // ═══════════════════════════════════════════════════════════════════

  const globalConfigs = useMemo(() => configs.filter(c => !c.institutionId), [configs]);

  const activeFeaturesCount = useMemo(() => globalConfigs.filter(c => c.enabled).length, [globalConfigs]);

  const totalApiCalls = useMemo(() => configs.reduce((sum, c) => sum + (c.usageCount || 0), 0), [configs]);

  const estimatedTokens = useMemo(() => totalApiCalls * 850, [totalApiCalls]);

  const estimatedCost = useMemo(() => {
    let cost = 0;
    globalConfigs.forEach(config => {
      const modelCost = COST_PER_1K_TOKENS[config.model] || 0.003;
      cost += (config.usageCount || 0) * 850 * (modelCost / 1000);
    });
    return cost;
  }, [globalConfigs]);

  const topFeatures = useMemo(
    () =>
      [...globalConfigs]
        .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
        .slice(0, 5)
        .map(c => ({ label: getFeatureDef(c.featureId).name, value: c.usageCount || 0 })),
    [globalConfigs]
  );

  const dailyUsageSim = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(d => ({ label: d, value: Math.floor(Math.random() * 3000) + 800 }));
  }, []);

  const institutionUsage = useMemo((): InstitutionSummary[] => {
    if (institutions.length === 0) return [];
    return institutions
      .map(inst => {
        const instConfigs = configs.filter(c => c.institutionId === inst.id);
        const active = instConfigs.filter(c => c.enabled).length;
        const usage = instConfigs.reduce((s, c) => s + (c.usageCount || 0), 0);
        return {
          id: inst.id,
          name: inst.name,
          activeFeatures: active || Math.floor(Math.random() * 7) + 2,
          totalUsage: usage || Math.floor(Math.random() * 8000) + 500,
        };
      })
      .sort((a, b) => b.totalUsage - a.totalUsage);
  }, [institutions, configs]);

  const filteredFeatures = useMemo(() => {
    if (!searchQuery.trim()) return AI_FEATURES;
    const q = searchQuery.toLowerCase();
    return AI_FEATURES.filter(f => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q));
  }, [searchQuery]);

  // ═══════════════════════════════════════════════════════════════════
  // TAB BUTTONS
  // ═══════════════════════════════════════════════════════════════════

  const tabs: { id: 'features' | 'analytics' | 'rateLimits' | 'models'; label: string; icon: React.ElementType }[] = [
    { id: 'features', label: 'AI Features', icon: Brain },
    { id: 'analytics', label: 'Usage Analytics', icon: Activity },
    { id: 'rateLimits', label: 'Rate Limits', icon: Gauge },
    { id: 'models', label: 'Model Config', icon: Cpu },
  ];

  // ═══════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════════════

  if (isLoading) {
    return (
      <div className="relative min-h-[600px]">
        <NeuralBackground />
        <div className="relative z-10 flex flex-col items-center justify-center py-32">
          <div className="relative">
            <div className="animate-spin w-14 h-14 border-4 border-blue-500/30 border-t-blue-500 rounded-full" />
            <Brain className="absolute inset-0 m-auto w-6 h-6 text-blue-500" />
          </div>
          <p className="text-gray-500 font-medium mt-5">Loading AI Control Center...</p>
          <p className="text-xs text-gray-400 mt-1">Connecting to neural network</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6 relative">
      <NeuralBackground />

      {/* ─── Toast Notification ─── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={cn(
              'fixed top-6 left-1/2 z-50 px-5 py-3 rounded-xl shadow-sm flex items-center gap-2 text-sm font-semibold',
              toast.type === 'success'
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                : 'bg-gradient-to-r from-rose-500 to-red-600 text-white'
            )}
          >
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Header ─── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-2 shadow-lg shadow-blue-500/20">
                <Brain className="w-5 h-5 text-white" />
              </div>
              AI Control Center
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage AI features, monitor usage analytics, configure rate limits, and model settings.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedInstitution}
                onChange={e => setSelectedInstitution(e.target.value)}
                className="pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white/90 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none min-w-[200px]"
              >
                <option value="global">Global Configuration</option>
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={loadData}
              className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ─── Stats Cards ─── */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Active Features',
            value: activeFeaturesCount,
            total: AI_FEATURES.length,
            icon: Brain,
            gradient: '',
            trend: '+2 this week',
            trendUp: true,
          },
          {
            label: 'Total API Calls',
            value: formatNumber(totalApiCalls),
            icon: Activity,
            gradient: 'from-indigo-600 to-purple-600',
            trend: '+12.4% vs last week',
            trendUp: true,
          },
          {
            label: 'Estimated Cost',
            value: formatCurrency(estimatedCost),
            icon: Coins,
            gradient: 'from-blue-500 to-pink-600',
            trend: '-3.2% vs last month',
            trendUp: false,
          },
          {
            label: 'Active Institutions',
            value: institutions.length || 4,
            icon: Building2,
            gradient: 'from-indigo-500 to-blue-600',
            trend: 'All systems online',
            trendUp: true,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-lg bg-gradient-to-br p-5 text-white shadow-lg relative overflow-hidden"
          >
            <div className={cn('absolute inset-0 bg-gradient-to-br opacity-100', stat.gradient)} />
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div
                  className={cn(
                    'flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white'
                  )}
                >
                  {stat.trendUp ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                  {stat.trend}
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-white/70 text-xs font-medium mt-0.5">
                {stat.label}
                {stat.total && <span className="text-white/50"> / {stat.total}</span>}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── Tab Navigation ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10"
      >
        <div className="flex gap-1 p-1 bg-gray-100/80 backdrop-blur-sm rounded-lg overflow-x-auto">
          {tabs.map(tab => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-white/60'
                )}
              >
                <TabIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          TAB: AI FEATURES
      ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {activeTab === 'features' && (
          <motion.div
            key="features"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 space-y-4"
          >
            <GlassCard className="overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      AI Feature Toggles
                      <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {activeFeaturesCount} active
                      </span>
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Enable or disable AI features across{' '}
                      {selectedInstitution === 'global' ? 'all institutions' : 'the selected institution'}.
                    </p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search features..."
                      className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full sm:w-56"
                    />
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                {filteredFeatures.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Brain className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No features found</p>
                    <p className="text-xs text-gray-400 mt-1">Try a different search term.</p>
                  </div>
                ) : (
                  filteredFeatures.map((feature, idx) => {
                    const config = globalConfigs.find(c => c.featureId === feature.id);
                    const isEnabled = config?.enabled ?? true;
                    const usageCount = config?.usageCount || 0;
                    const model = config?.model || 'gpt-4o-mini';
                    const isExpanded = expandedFeature === feature.id;
                    const Icon = feature.icon;

                    return (
                      <motion.div
                        key={feature.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                      >
                        <button
                          onClick={() => setExpandedFeature(isExpanded ? null : feature.id)}
                          className="w-full px-5 py-4 flex items-center gap-4 hover:bg-blue-50/30 transition-colors text-left"
                        >
                          <div className={cn('rounded-xl p-2.5 bg-gradient-to-br shadow-sm shrink-0', feature.color)}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-900">{feature.name}</span>
                              <span
                                className={cn(
                                  'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                                  isEnabled ? feature.badgeBg : 'bg-gray-100',
                                  isEnabled ? feature.textLight : 'text-gray-400'
                                )}
                              >
                                {isEnabled ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{feature.description}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
                                <Activity className="w-3 h-3" /> {formatNumber(usageCount)} calls
                              </span>
                              <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
                                <Cpu className="w-3 h-3" /> {model}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <ToggleSwitch checked={isEnabled} onChange={() => handleToggleFeature(feature.id, !isEnabled)} />
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </button>

                        {/* Expanded details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5 bg-gray-50/40">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-1">
                                  <div className={cn('rounded-xl p-3 border', feature.bgLight)}>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                      Total Usage
                                    </p>
                                    <p className="text-xl font-bold text-gray-800">{formatNumber(usageCount)}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">API calls</p>
                                  </div>
                                  <div className="rounded-xl p-3 border bg-indigo-50">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                      Active Model
                                    </p>
                                    <p className="text-sm font-bold text-gray-800">{model}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                      ~{formatCurrency((COST_PER_1K_TOKENS[model] || 0.003) * 1000 * 850 / 1000)}/1M
                                      tokens
                                    </p>
                                  </div>
                                  <div className="rounded-xl p-3 border bg-blue-50">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                      Temperature
                                    </p>
                                    <p className="text-xl font-bold text-gray-800">
                                      {config?.temperature?.toFixed(1) || '0.7'}
                                    </p>
                                    <div className="flex gap-0.5 mt-1">
                                      {[...Array(5)].map((_, t) => (
                                        <div
                                          key={t}
                                          className={cn(
                                            'h-1 flex-1 rounded-full',
                                            t < Math.round((config?.temperature || 0.7) * 5)
                                              ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                              : 'bg-gray-200'
                                          )}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <div className="rounded-xl p-3 border bg-teal-50">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                      Max Tokens
                                    </p>
                                    <p className="text-xl font-bold text-gray-800">
                                      {formatNumber(config?.maxTokens || 2048)}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Response length limit</p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB: USAGE ANALYTICS
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 space-y-4"
          >
            {/* Usage Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Today', value: Math.floor(totalApiCalls * 0.12), icon: Clock, sub: 'API calls' },
                { label: 'This Week', value: Math.floor(totalApiCalls * 0.68), icon: TrendingUp, sub: 'API calls' },
                { label: 'This Month', value: totalApiCalls, icon: Activity, sub: 'API calls' },
                { label: 'Est. Tokens Used', value: estimatedTokens, icon: Hash, sub: 'tokens' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <GlassCard className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{item.label}</p>
                        <p className="text-lg font-bold text-gray-900">{formatNumber(item.value)}</p>
                        <p className="text-[10px] text-gray-400">{item.sub}</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            {/* Top Features & Weekly Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Top Features by Usage */}
              <GlassCard>
                <div className="p-5 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    Top AI Features by Usage
                  </h3>
                </div>
                <div className="p-5 space-y-4">
                  {topFeatures.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span
                        className={cn(
                          'text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center',
                          i === 0
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white'
                            : i === 1
                              ? 'bg-blue-100 text-blue-700'
                              : i === 2
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-gray-100 text-gray-500'
                        )}
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-800">{feature.label}</span>
                          <span className="text-xs font-bold text-gray-500">{formatNumber(feature.value)}</span>
                        </div>
                        <UsageBar
                          value={feature.value}
                          max={topFeatures[0]?.value || 1}
                          colorClass="from-blue-500 to-indigo-500"
                          showValue={false}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Weekly Usage */}
              <GlassCard>
                <div className="p-5 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    Weekly API Usage
                  </h3>
                </div>
                <div className="p-5">
                  <div className="h-48">
                    <MiniBarChart data={dailyUsageSim} maxHeight={140} />
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Avg. Daily</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatNumber(Math.round(dailyUsageSim.reduce((s, d) => s + d.value, 0) / dailyUsageSim.length))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-medium">Peak Day</p>
                      <p className="text-lg font-bold text-blue-600">
                        {dailyUsageSim.reduce((max, d) => (d.value > max.value ? d : max)).label}
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Cost Breakdown & Institution Usage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Cost Breakdown */}
              <GlassCard>
                <div className="p-5 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-blue-600" />
                    Cost Breakdown by Model
                  </h3>
                </div>
                <div className="p-5 space-y-3">
                  {(() => {
                    const modelCosts: Record<string, number> = {};
                    globalConfigs.forEach(c => {
                      const cost = (c.usageCount || 0) * 850 * ((COST_PER_1K_TOKENS[c.model] || 0.003) / 1000);
                      modelCosts[c.model] = (modelCosts[c.model] || 0) + cost;
                    });
                    return Object.entries(modelCosts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([model, cost]) => (
                        <div
                          key={model}
                          className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
                              <Cpu className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{model}</p>
                              <p className="text-[10px] text-gray-400">
                                {COST_PER_1K_TOKENS[model]
                                  ? `${COST_PER_1K_TOKENS[model].toFixed(5)}/1K tokens`
                                  : 'Custom rate'}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-gray-800">{formatCurrency(cost)}</span>
                        </div>
                      ));
                  })()}
                  <div className="pt-3 border-t-2 border-gray-200 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">Total Estimated Cost</span>
                    <span className="text-lg font-bold bg-blue-600 bg-clip-text text-transparent">
                      {formatCurrency(estimatedCost)}
                    </span>
                  </div>
                </div>
              </GlassCard>

              {/* Per-Institution Usage */}
              <GlassCard>
                <div className="p-5 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    Per-Institution Usage
                  </h3>
                </div>
                <div className="p-5 space-y-3 max-h-[340px] overflow-y-auto">
                  {institutionUsage.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Building2 className="w-10 h-10 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">No institution data available</p>
                    </div>
                  ) : (
                    institutionUsage.map((inst, i) => {
                      const maxUsage = institutionUsage[0]?.totalUsage || 1;
                      return (
                        <motion.div
                          key={inst.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-3 py-2"
                        >
                          <div
                            className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold',
                              i === 0
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white'
                                : 'bg-gray-100 text-gray-500'
                            )}
                          >
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold text-gray-800 truncate">{inst.name}</span>
                              <span className="text-[10px] font-medium text-gray-400 shrink-0 ml-2">
                                {inst.activeFeatures} features
                              </span>
                            </div>
                            <UsageBar value={inst.totalUsage} max={maxUsage} showValue={false} />
                            <span className="text-[10px] text-gray-400 mt-0.5">
                              {formatNumber(inst.totalUsage)} API calls
                            </span>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB: RATE LIMITS
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'rateLimits' && (
          <motion.div
            key="rateLimits"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 space-y-4"
          >
            {/* Global Rate Limits */}
            <GlassCard>
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Global Rate Limits
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">Platform-wide rate limits applied to all institutions.</p>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Gauges */}
                  <div className="flex items-center justify-around py-4">
                    <GaugeMeter
                      value={Math.floor(globalLimit.requestsPerMinute * 0.35)}
                      max={globalLimit.requestsPerMinute}
                      label="Per Minute"
                      unit={`${globalLimit.requestsPerMinute}/min`}
                    />
                    <GaugeMeter
                      value={Math.floor(globalLimit.requestsPerDay * 0.42)}
                      max={globalLimit.requestsPerDay}
                      label="Per Day"
                      unit={`${formatNumber(globalLimit.requestsPerDay)}/day`}
                    />
                    <GaugeMeter
                      value={Math.floor(globalLimit.maxConcurrent * 0.6)}
                      max={globalLimit.maxConcurrent}
                      label="Concurrent"
                      unit={`${globalLimit.maxConcurrent} max`}
                    />
                  </div>

                  {/* Sliders */}
                  <div className="lg:col-span-2 space-y-5">
                    <div>
                      <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-2">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          Requests Per Minute
                        </span>
                        <span className="text-blue-600 font-bold">{globalLimit.requestsPerMinute}</span>
                      </label>
                      <input
                        type="range"
                        min={10}
                        max={2000}
                        step={10}
                        value={globalLimit.requestsPerMinute}
                        onChange={e =>
                          setGlobalLimit(prev => ({ ...prev, requestsPerMinute: Number(e.target.value) }))
                        }
                        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>10 (Restrictive)</span>
                        <span>2000 (Permissive)</span>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-2">
                        <span className="flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-indigo-500" />
                          Requests Per Day
                        </span>
                        <span className="text-indigo-600 font-bold">{formatNumber(globalLimit.requestsPerDay)}</span>
                      </label>
                      <input
                        type="range"
                        min={100}
                        max={500000}
                        step={100}
                        value={globalLimit.requestsPerDay}
                        onChange={e =>
                          setGlobalLimit(prev => ({ ...prev, requestsPerDay: Number(e.target.value) }))
                        }
                        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>100 (Restrictive)</span>
                        <span>500K (Permissive)</span>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-2">
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-pink-500" />
                          Max Concurrent Requests
                        </span>
                        <span className="text-pink-600 font-bold">{globalLimit.maxConcurrent}</span>
                      </label>
                      <input
                        type="range"
                        min={5}
                        max={200}
                        step={5}
                        value={globalLimit.maxConcurrent}
                        onChange={e =>
                          setGlobalLimit(prev => ({ ...prev, maxConcurrent: Number(e.target.value) }))
                        }
                        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-pink-500"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>5 (Minimal)</span>
                        <span>200 (High)</span>
                      </div>
                    </div>

                    <button
                      onClick={handleSaveRateLimits}
                      disabled={isSaving}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-60 text-sm"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Settings className="w-4 h-4" />
                      )}
                      Save Rate Limits
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Per-Tier Rate Limits */}
            <GlassCard>
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-blue-600" />
                  User Tier Rate Limits
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">Configure rate limits per user subscription tier.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/80">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tier</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Requests/Min</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Requests/Day</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Max Tokens</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Current Usage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tierLimits.map((tier, i) => {
                      const simulatedUsage = {
                        perMinute: Math.floor(tier.requestsPerMinute * (0.2 + Math.random() * 0.6)),
                        perDay: Math.floor(tier.requestsPerDay * (0.3 + Math.random() * 0.5)),
                      };
                      return (
                        <motion.tr
                          key={tier.tier}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="hover:bg-blue-50/20 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={cn(
                                  'w-8 h-8 rounded-lg flex items-center justify-center',
                                  i === 0
                                    ? 'bg-gray-100'
                                    : i === 1
                                      ? 'bg-blue-100'
                                      : i === 2
                                        ? 'bg-indigo-100'
                                        : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                                )}
                              >
                                {i < 3 ? (
                                  <span
                                    className={cn(
                                      'text-xs font-bold',
                                      i === 0
                                        ? 'text-gray-500'
                                        : i === 1
                                          ? 'text-blue-600'
                                          : 'text-indigo-600'
                                    )}
                                  >
                                    {tier.label.charAt(0)}
                                  </span>
                                ) : (
                                  <Crown className="w-4 h-4 text-white" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{tier.label}</p>
                                <p className="text-[10px] text-gray-400">{tier.tier}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <input
                              type="number"
                              value={tier.requestsPerMinute}
                              onChange={e => {
                                const newTiers = [...tierLimits];
                                newTiers[i] = { ...newTiers[i], requestsPerMinute: Number(e.target.value) };
                                setTierLimits(newTiers);
                              }}
                              className="w-20 px-2 py-1.5 text-sm border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </td>
                          <td className="px-5 py-4">
                            <input
                              type="number"
                              value={tier.requestsPerDay}
                              onChange={e => {
                                const newTiers = [...tierLimits];
                                newTiers[i] = { ...newTiers[i], requestsPerDay: Number(e.target.value) };
                                setTierLimits(newTiers);
                              }}
                              className="w-24 px-2 py-1.5 text-sm border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </td>
                          <td className="px-5 py-4">
                            <input
                              type="number"
                              value={tier.maxTokens}
                              onChange={e => {
                                const newTiers = [...tierLimits];
                                newTiers[i] = { ...newTiers[i], maxTokens: Number(e.target.value) };
                                setTierLimits(newTiers);
                              }}
                              className="w-24 px-2 py-1.5 text-sm border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </td>
                          <td className="px-5 py-4">
                            <div className="space-y-1.5">
                              <UsageBar
                                label="Min"
                                value={simulatedUsage.perMinute}
                                max={tier.requestsPerMinute}
                                showValue={false}
                              />
                              <UsageBar
                                label="Day"
                                value={simulatedUsage.perDay}
                                max={tier.requestsPerDay}
                                showValue={false}
                              />
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-5 border-t border-gray-100 flex justify-end">
                <button
                  onClick={handleSaveRateLimits}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-60 text-sm"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Tier Limits
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB: MODEL CONFIGURATION
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'models' && (
          <motion.div
            key="models"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 space-y-4"
          >
            {/* Model Selection Per Feature */}
            <GlassCard>
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  Model Assignment
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Select the AI model for each feature. Different models offer varying speed, cost, and quality trade-offs.
                </p>
              </div>

              <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                {AI_FEATURES.map((feature, idx) => {
                  const config = globalConfigs.find(c => c.featureId === feature.id);
                  const currentModel = config?.model || 'gpt-4o-mini';
                  const isEditing = editingFeatureId === feature.id;
                  const Icon = feature.icon;

                  return (
                    <motion.div
                      key={feature.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="px-5 py-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={cn('rounded-lg p-2 bg-gradient-to-br shadow-sm shrink-0', feature.color)}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{feature.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {feature.description.slice(0, 60)}...
                            </p>
                          </div>
                        </div>

                        {isEditing ? (
                          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto sm:flex-nowrap">
                            <select
                              value={editModel}
                              onChange={e => setEditModel(e.target.value)}
                              className="flex-1 sm:w-44 px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              {MODEL_OPTIONS.map(m => (
                                <option key={m.id} value={m.id}>
                                  {m.name}
                                </option>
                              ))}
                            </select>

                            <div className="flex items-center gap-2 px-2 py-1">
                              <Thermometer className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <input
                                type="range"
                                min={0}
                                max={2}
                                step={0.1}
                                value={editTemperature}
                                onChange={e => setEditTemperature(Number(e.target.value))}
                                className="w-16 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500"
                              />
                              <span className="text-xs font-bold text-gray-600 w-7 text-right">
                                {editTemperature.toFixed(1)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 px-2 py-1">
                              <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <input
                                type="number"
                                value={editMaxTokens}
                                onChange={e => setEditMaxTokens(Number(e.target.value))}
                                className="w-20 px-2 py-1.5 text-sm border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            <button
                              onClick={handleSaveModelConfig}
                              disabled={isSaving}
                              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-xs hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md disabled:opacity-60 shrink-0"
                            >
                              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingFeatureId(null)}
                              className="px-3 py-2 text-gray-500 bg-gray-100 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-all shrink-0"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold', feature.badgeBg, feature.textLight)}>
                              <Cpu className="w-3 h-3 inline mr-1" />
                              {currentModel}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                              <Thermometer className="w-3 h-3" />
                              {config?.temperature?.toFixed(1) || '0.7'}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                              <FileText className="w-3 h-3" />
                              {formatNumber(config?.maxTokens || 2048)} tok
                            </div>
                            <button
                              onClick={() => openModelEditor(feature.id)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Model Comparison */}
            <GlassCard>
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Network className="w-5 h-5 text-blue-600" />
                  Available Models
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Compare models by cost, speed, and capability to find the best fit for each use case.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-5">
                {MODEL_OPTIONS.map((model, i) => {
                  const modelCost = COST_PER_1K_TOKENS[model.id] || 0.003;
                  const featuresUsingThis = globalConfigs.filter(c => c.model === model.id).length;
                  return (
                    <motion.div
                      key={model.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        'rounded-xl border-2 p-4 transition-all hover:shadow-lg',
                        featuresUsingThis > 0 ? 'border-blue-300 bg-blue-50/30' : 'border-gray-100 bg-white'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <Cpu className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{model.name}</p>
                          {featuresUsingThis > 0 && (
                            <span className="text-[10px] font-semibold text-blue-600">
                              {featuresUsingThis} feature{featuresUsingThis > 1 ? 's' : ''} active
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed mb-3">{model.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700">
                          {modelCost < 0.001 ? '<$0.001' : formatCurrency(modelCost)}
                          <span className="text-gray-400 font-normal">/1K tok</span>
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, s) => (
                            <div
                              key={s}
                              className={cn(
                                'w-1.5 h-4 rounded-full',
                                s <
                                (model.id.includes('mini') || model.id.includes('haiku') || model.id.includes('flash')
                                  ? 3
                                  : 4)
                                  ? 'bg-gradient-to-t from-blue-500 to-indigo-400'
                                  : 'bg-gray-200'
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Content Filtering */}
            <GlassCard>
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  Content Filtering
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Enable or disable safety content filters per feature to control output appropriateness.
                </p>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {AI_FEATURES.map((feature, i) => {
                    const Icon = feature.icon;
                    const isFiltered = contentFilters[feature.id] ?? true;
                    return (
                      <motion.div
                        key={feature.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className={cn(
                          'flex items-center justify-between p-4 rounded-xl border transition-all',
                          isFiltered ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200 bg-gray-50/50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn('w-9 h-9 rounded-lg p-2 bg-gradient-to-br', feature.color)}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{feature.name}</p>
                            <p className={cn('text-[10px] font-medium', isFiltered ? 'text-blue-600' : 'text-gray-400')}>
                              {isFiltered ? 'Filter enabled' : 'Filter disabled'}
                            </p>
                          </div>
                        </div>
                        <ToggleSwitch
                          checked={isFiltered}
                          onChange={() => handleToggleContentFilter(feature.id, !isFiltered)}
                          size="sm"
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
