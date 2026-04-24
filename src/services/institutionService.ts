import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, deleteDoc,
  updateDoc, serverTimestamp, query, where, onSnapshot, Unsubscribe,
  writeBatch, orderBy, limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ═══════════════════════════════════════════════════════════════════
// SHARED INSTITUTION SCHEMA — Primary key: institution_id (doc ID)
// Unique identifier: admin_email
// ═══════════════════════════════════════════════════════════════════

export type JourneyPhase = 'discovery' | 'identity' | 'conversion' | 'onboarding' | 'active';
export type SubscriptionStatus = 'none' | 'trial' | 'active' | 'past_due' | 'cancelled';
export type InstitutionStatus = 'active' | 'suspended' | 'inactive' | 'provisioned';
export type OnboardingStep = 'welcome' | 'basic_info' | 'mission_identity' | 'academic_programs' | 'admin_contact' | 'review' | 'complete';

export interface InstitutionProfile {
  id: string;                           // institution_id (document ID)
  name: string;
  institutionType: string;              // seminary, bible_college, etc.
  adminEmail: string;                   // UNIQUE identifier
  status: InstitutionStatus;

  // ─── SaaS Lifecycle Fields ───
  isSubscribed: boolean;                // Maps to is_subscribed
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan?: string;            // free, basic, premium, enterprise
  subscriptionStartDate?: any;
  onboardingComplete: boolean;          // Maps to onboarding_complete
  onboardingStep: OnboardingStep;
  journeyPhase: JourneyPhase;

  // ─── Institution Details ───
  subdomain?: string;
  customDomain?: string;
  location?: string;
  tradition?: string;
  denomination?: string;
  logoUrl?: string;

  // ─── Mission & Identity (from Onboarding) ───
  missionStatement?: string;
  visionStatement?: string;
  theologicalSpecialization?: string[];
  foundingYear?: string;
  accreditationStatus?: string;

  // ─── Contact Info (from Onboarding) ───
  contactPhone?: string;
  contactAddress?: string;
  contactCity?: string;
  contactState?: string;
  contactCountry?: string;
  contactZipCode?: string;
  website?: string;

  // ─── Academic Programs (from Onboarding) ───
  academicPrograms?: string[];          // ['B.Th', 'M.Div', 'Th.M', 'PhD', 'D.Min']
  gradingSystem?: 'letter' | 'gpa' | 'percentage';

  // ─── Usage Stats ───
  studentCount: number;
  facultyCount: number;
  userCount: number;
  modules: string[];

  // ─── Timestamps ───
  createdAt: any;
  updatedAt?: any;
  lastActivity?: any;
  onboardingCompletedAt?: any;
}

// ═══════════════════════════════════════════════════════════════════
// IMPERSONATION TOKEN
// ═══════════════════════════════════════════════════════════════════

export interface ImpersonationToken {
  id: string;
  institutionId: string;
  institutionName: string;
  adminEmail: string;
  createdBy: string;                    // Super admin email
  createdAt: any;
  expiresAt: any;
  isActive: boolean;
  lastUsedAt?: any;
  usageCount: number;
  reason?: string;                      // e.g. "Support troubleshooting"
}

// ═══════════════════════════════════════════════════════════════════
// AUDIT LOG ENTRY
// ═══════════════════════════════════════════════════════════════════

export interface AuditLogEntry {
  id?: string;
  timestamp: any;
  userId: string;
  userEmail: string;
  userName?: string;
  action: string;                       // create_institution, update_institution, impersonate_start, etc.
  module: string;                       // super_admin, institutions, auth, onboarding, etc.
  institutionId?: string;
  institutionName?: string;
  details?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;                   // Client-side (limited)
}

// ═══════════════════════════════════════════════════════════════════
// INSTITUTION SERVICE
// ═══════════════════════════════════════════════════════════════════

export const institutionService = {

  // ─── CRUD Operations ───

  async getInstitution(institutionId: string): Promise<InstitutionProfile | null> {
    const docSnap = await getDoc(doc(db, 'institutions', institutionId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as InstitutionProfile;
    }
    return null;
  },

  async getInstitutionByEmail(adminEmail: string): Promise<InstitutionProfile | null> {
    const normalized = adminEmail.toLowerCase().trim();
    const q = query(collection(db, 'institutions'), where('adminEmail', '==', normalized));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as InstitutionProfile;
    }
    return null;
  },

  async getAllInstitutions(): Promise<InstitutionProfile[]> {
    const snap = await getDocs(collection(db, 'institutions'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as InstitutionProfile));
  },

  async createInstitution(data: Omit<InstitutionProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'institutions'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateInstitution(institutionId: string, data: Partial<InstitutionProfile>): Promise<void> {
    await updateDoc(doc(db, 'institutions', institutionId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteInstitution(institutionId: string): Promise<void> {
    await deleteDoc(doc(db, 'institutions', institutionId));
  },

  // ─── Journey Phase Management ───

  async advanceJourneyPhase(institutionId: string, phase: JourneyPhase): Promise<void> {
    await updateDoc(doc(db, 'institutions', institutionId), {
      journeyPhase: phase,
      updatedAt: serverTimestamp(),
    });
  },

  async completeOnboarding(institutionId: string): Promise<void> {
    await updateDoc(doc(db, 'institutions', institutionId), {
      onboardingComplete: true,
      onboardingStep: 'complete' as OnboardingStep,
      journeyPhase: 'active' as JourneyPhase,
      onboardingCompletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async updateOnboardingStep(institutionId: string, step: OnboardingStep): Promise<void> {
    await updateDoc(doc(db, 'institutions', institutionId), {
      onboardingStep: step,
      journeyPhase: 'onboarding' as JourneyPhase,
      updatedAt: serverTimestamp(),
    });
  },

  // ─── Subscription Management ───

  async activateSubscription(institutionId: string, plan: string, monthlyPrice: number): Promise<void> {
    const batch = writeBatch(db);

    // Update institution
    batch.update(doc(db, 'institutions', institutionId), {
      isSubscribed: true,
      subscriptionStatus: 'active' as SubscriptionStatus,
      subscriptionPlan: plan,
      subscriptionStartDate: serverTimestamp(),
      journeyPhase: 'onboarding' as JourneyPhase,
      updatedAt: serverTimestamp(),
    });

    // Create subscription record
    const subRef = doc(collection(db, 'subscriptions'));
    batch.set(subRef, {
      institutionId,
      institutionName: '', // Will be populated by real-time sync
      plan,
      monthlyPrice,
      status: 'active',
      startDate: serverTimestamp(),
      createdAt: serverTimestamp(),
    });

    await batch.commit();
  },

  // ─── Real-time Sync (onSnapshot) ───

  subscribeToInstitutions(callback: (institutions: InstitutionProfile[]) => void): Unsubscribe {
    const q = query(collection(db, 'institutions'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      const institutions = snap.docs.map(d => ({ id: d.id, ...d.data() } as InstitutionProfile));
      callback(institutions);
    }, (err) => {
      console.error('Real-time institution sync error:', err);
    });
  },

  subscribeToInstitution(institutionId: string, callback: (institution: InstitutionProfile | null) => void): Unsubscribe {
    return onSnapshot(doc(db, 'institutions', institutionId), (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as InstitutionProfile);
      } else {
        callback(null);
      }
    }, (err) => {
      console.error('Real-time institution sync error:', err);
    });
  },

  // ─── Institution Stats (real-time friendly) ───

  async getInstitutionStats(institutionId: string): Promise<{
    studentCount: number;
    facultyCount: number;
    courseCount: number;
    activeUsers: number;
  }> {
    const [studentsSnap, facultySnap, coursesSnap, usersSnap] = await Promise.all([
      getDocs(query(collection(db, 'students'), where('tenantId', '==', institutionId))),
      getDocs(query(collection(db, 'faculty'), where('tenantId', '==', institutionId))),
      getDocs(query(collection(db, 'courses'), where('tenantId', '==', institutionId))),
      getDocs(query(collection(db, 'users'), where('institutionId', '==', institutionId))),
    ]);

    return {
      studentCount: studentsSnap.size,
      facultyCount: facultySnap.size,
      courseCount: coursesSnap.size,
      activeUsers: usersSnap.filter(d => d.data().status !== 'suspended').size,
    };
  },

  // ─── Lifecycle Summary (for Super Admin Overview) ───

  async getLifecycleSummary(): Promise<{
    discovery: number;
    identity: number;
    conversion: number;
    onboarding: number;
    active: number;
    total: number;
  }> {
    const snap = await getDocs(collection(db, 'institutions'));
    const summary = { discovery: 0, identity: 0, conversion: 0, onboarding: 0, active: 0, total: snap.size };
    snap.docs.forEach(d => {
      const phase = d.data().journeyPhase as JourneyPhase || 'discovery';
      if (phase in summary) (summary as any)[phase]++;
      else summary.discovery++;
    });
    return summary;
  },
};

// ═══════════════════════════════════════════════════════════════════
// IMPERSONATION TOKEN SERVICE
// ═══════════════════════════════════════════════════════════════════

export const impersonationService = {

  async generateToken(
    institutionId: string,
    institutionName: string,
    adminEmail: string,
    createdBy: string,
    reason?: string,
    expiresInHours: number = 2
  ): Promise<string> {
    const tokenDoc = await addDoc(collection(db, 'impersonation_tokens'), {
      institutionId,
      institutionName,
      adminEmail,
      createdBy,
      reason: reason || 'Support troubleshooting',
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + expiresInHours * 60 * 60 * 1000),
      isActive: true,
      usageCount: 0,
    });
    return tokenDoc.id;
  },

  async validateToken(tokenId: string): Promise<ImpersonationToken | null> {
    const docSnap = await getDoc(doc(db, 'impersonation_tokens', tokenId));
    if (!docSnap.exists()) return null;

    const token = { id: docSnap.id, ...docSnap.data() } as ImpersonationToken;

    // Check if expired
    if (token.expiresAt && token.expiresAt.toDate() < new Date()) {
      await this.revokeToken(tokenId);
      return null;
    }

    if (!token.isActive) return null;

    // Update usage
    await updateDoc(doc(db, 'impersonation_tokens', tokenId), {
      lastUsedAt: serverTimestamp(),
      usageCount: (token.usageCount || 0) + 1,
    });

    return token;
  },

  async revokeToken(tokenId: string): Promise<void> {
    await updateDoc(doc(db, 'impersonation_tokens', tokenId), {
      isActive: false,
    });
  },

  async getActiveTokens(institutionId?: string): Promise<ImpersonationToken[]> {
    let q = query(
      collection(db, 'impersonation_tokens'),
      where('isActive', '==', true)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() } as ImpersonationToken))
      .filter(t => !institutionId || t.institutionId === institutionId);
  },

  async revokeAllTokensForInstitution(institutionId: string): Promise<void> {
    const tokens = await this.getActiveTokens(institutionId);
    const batch = writeBatch(db);
    tokens.forEach(t => {
      batch.update(doc(db, 'impersonation_tokens', t.id), { isActive: false });
    });
    await batch.commit();
  },
};

// ═══════════════════════════════════════════════════════════════════
// AUDIT LOG SERVICE
// ═══════════════════════════════════════════════════════════════════

export const auditLogService = {

  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      await addDoc(collection(db, 'platform_audit_logs'), {
        ...entry,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error('Audit log write failed:', err);
    }
  },

  async logAuthAction(userId: string, email: string, action: string, details?: string): Promise<void> {
    await this.log({
      userId,
      userEmail: email,
      action,
      module: 'auth',
      details,
    });
  },

  async logInstitutionAction(userId: string, email: string, action: string, institutionId: string, institutionName?: string, details?: string): Promise<void> {
    await this.log({
      userId,
      userEmail: email,
      action,
      module: 'institutions',
      institutionId,
      institutionName,
      details,
    });
  },

  async logImpersonationAction(userId: string, email: string, action: 'impersonate_start' | 'impersonate_end', institutionId: string, institutionName: string, tokenId: string): Promise<void> {
    await this.log({
      userId,
      userEmail: email,
      action,
      module: 'security',
      institutionId,
      institutionName,
      details: `Token: ${tokenId}`,
    });
  },

  async logSuperAdminAction(userId: string, email: string, action: string, details?: string, metadata?: Record<string, any>): Promise<void> {
    await this.log({
      userId,
      userEmail: email,
      action,
      module: 'super_admin',
      details,
      metadata,
    });
  },

  async getLogs(filters?: {
    institutionId?: string;
    module?: string;
    userId?: string;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    let q = collection(db, 'platform_audit_logs');

    if (filters?.institutionId) {
      q = query(q, where('institutionId', '==', filters.institutionId));
    }
    if (filters?.module) {
      q = query(q, where('module', '==', filters.module));
    }
    if (filters?.userId) {
      q = query(q, where('userId', '==', filters.userId));
    }

    const snap = await getDocs(q);
    let logs = snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLogEntry));

    if (filters?.limit) {
      logs = logs.slice(0, filters.limit);
    }

    return logs.sort((a, b) => {
      const timeA = a.timestamp?.seconds || 0;
      const timeB = b.timestamp?.seconds || 0;
      return timeB - timeA; // Newest first
    });
  },

  // ─── Real-time audit log subscription ───
  subscribeToLogs(callback: (logs: AuditLogEntry[]) => void, limitCount: number = 100): Unsubscribe {
    const q = query(collection(db, 'platform_audit_logs'), orderBy('timestamp', 'desc'), limit(limitCount));
    return onSnapshot(q, (snap) => {
      const logs = snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLogEntry));
      callback(logs);
    }, (err) => {
      console.error('Real-time audit log sync error:', err);
    });
  },
};
