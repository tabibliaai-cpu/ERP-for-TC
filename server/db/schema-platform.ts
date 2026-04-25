import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ============================================
// PLATFORM DATABASE SCHEMA (shared across all institutions)
// This DB manages: institutions, super admins, subscriptions, audit
// ============================================

export const institutions = sqliteTable('institutions', {
  id: text('id').primaryKey(),                       // UUID
  name: text('name').notNull(),                       // Full institution name
  code: text('code').notNull().unique(),              // e.g., GTS-001
  type: text('type').notNull(),                       // Seminary | Bible College | Training Center
  location: text('location').notNull(),               // City, Country
  address: text('address'),                           // Full address
  country: text('country'),
  state: text('state'),
  city: text('city'),
  postalCode: text('postal_code'),
  
  // Contact
  email: text('email').notNull().unique(),
  phone: text('phone'),
  website: text('website'),
  
  // Branding (multi-tenant white-label)
  displayName: text('display_name'),                  // Branded name for UI
  shortName: text('short_name'),
  logoUrl: text('logo_url'),
  faviconUrl: text('favicon_url'),
  primaryColor: text('primary_color').default('#f59e0b'),
  secondaryColor: text('secondary_color').default('#1e293b'),
  themeMode: text('theme_mode').default('light'),
  footerText: text('footer_text'),
  loginBackground: text('login_background'),
  
  // Spiritual Identity
  denomination: text('denomination'),                 // Baptist, Pentecostal, etc.
  statementOfFaith: text('statement_of_faith'),
  mission: text('mission'),
  vision: text('vision'),
  coreValues: text('core_values'),                    // JSON array
  
  // Admin
  adminId: text('admin_id').references(() => platformUsers.id), // Assigned admin
  plan: text('plan').default('free'),                 // free | basic | premium
  status: text('status').default('active'),           // active | inactive | suspended
  
  // Tenant DB connection
  tenantDbName: text('tenant_db_name').notNull().unique(), // DB identifier for Turso
  
  // Auto stats
  totalStudents: integer('total_students').default(0),
  totalTeachers: integer('total_teachers').default(0),
  
  // System
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

export const platformUsers = sqliteTable('platform_users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  
  fullName: text('full_name').notNull(),
  displayName: text('display_name'),
  profilePhoto: text('profile_photo'),
  gender: text('gender'),
  dateOfBirth: text('date_of_birth'),
  phone: text('phone'),
  
  role: text('role').notNull(),                      // super_admin | institution_admin
  
  // Institution mapping (for institution admins)
  institutionId: text('institution_id').references(() => institutions.id),
  
  // Spiritual profile
  churchName: text('church_name'),
  pastorName: text('pastor_name'),
  yearsInMinistry: integer('years_in_ministry'),
  statementOfFaith: text('statement_of_faith_text'),
  
  // Security
  twoFactorEnabled: integer('two_factor_enabled', { mode: 'boolean' }).default(false),
  lastLoginAt: text('last_login_at'),
  lastLoginIp: text('last_login_ip'),
  
  status: text('status').default('active'),          // active | suspended | deactivated
  
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  institutionId: text('institution_id').references(() => institutions.id).notNull(),
  plan: text('plan').notNull(),                      // free | basic | premium
  status: text('status').default('active'),           // active | cancelled | expired
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  amount: real('amount').default(0),                  // Monthly amount
  
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

export const featureFlags = sqliteTable('feature_flags', {
  id: text('id').primaryKey(),
  institutionId: text('institution_id').references(() => institutions.id).notNull(),
  feature: text('feature').notNull(),                // academic | pedagogy | library | billing | yeshua_ai
  enabled: integer('enabled', { mode: 'boolean' }).default(true),
  
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  institutionId: text('institution_id'),
  action: text('action').notNull(),                   // create | update | delete | login | security
  entity: text('entity').notNull(),                   // institution | student | teacher | payment etc
  entityId: text('entity_id'),
  details: text('details'),                           // JSON with change details
  ipAddress: text('ip_address'),
  
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

export const platformSettings = sqliteTable('platform_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  description: text('description'),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});
