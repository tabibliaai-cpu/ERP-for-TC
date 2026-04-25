import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as platformSchema from './schema-platform.js';
import * as tenantSchema from './schema-tenant.js';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DB_DIR = join(process.cwd(), 'db');

// Ensure DB directory exists
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
}

// ============================================
// PLATFORM DATABASE (shared - institutions, super admins)
// ============================================
let _platformDb: ReturnType<typeof drizzle> | null = null;
let _platformSqlite: Database.Database | null = null;

// Export raw SQLite for direct .prepare().run() usage
export function getPlatformSqlite() {
  if (!_platformSqlite) {
    getPlatformDb(); // ensures init
  }
  return _platformSqlite!;
}

export function getPlatformDb() {
  if (!_platformDb) {
    _platformSqlite = new Database(join(DB_DIR, 'platform.db'));
    _platformSqlite.pragma('journal_mode = WAL');
    _platformSqlite.pragma('foreign_keys = ON');
    _platformDb = drizzle(_platformSqlite, { schema: platformSchema });
    
    // Auto-create tables
    _platformSqlite.exec(`
      CREATE TABLE IF NOT EXISTS institutions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        location TEXT NOT NULL,
        address TEXT,
        country TEXT,
        state TEXT,
        city TEXT,
        postal_code TEXT,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        website TEXT,
        display_name TEXT,
        short_name TEXT,
        logo_url TEXT,
        favicon_url TEXT,
        primary_color TEXT DEFAULT '#f59e0b',
        secondary_color TEXT DEFAULT '#1e293b',
        theme_mode TEXT DEFAULT 'light',
        footer_text TEXT,
        login_background TEXT,
        denomination TEXT,
        statement_of_faith TEXT,
        mission TEXT,
        vision TEXT,
        core_values TEXT,
        admin_id TEXT,
        plan TEXT DEFAULT 'free',
        status TEXT DEFAULT 'active',
        tenant_db_name TEXT NOT NULL UNIQUE,
        total_students INTEGER DEFAULT 0,
        total_teachers INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (CURRENT_TIMESTAMP),
        updated_at TEXT DEFAULT (CURRENT_TIMESTAMP)
      );
      CREATE TABLE IF NOT EXISTS platform_users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        display_name TEXT,
        profile_photo TEXT,
        gender TEXT,
        date_of_birth TEXT,
        phone TEXT,
        role TEXT NOT NULL,
        institution_id TEXT,
        church_name TEXT,
        pastor_name TEXT,
        years_in_ministry INTEGER,
        statement_of_faith_text TEXT,
        two_factor_enabled INTEGER DEFAULT 0,
        last_login_at TEXT,
        last_login_ip TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT (CURRENT_TIMESTAMP),
        updated_at TEXT DEFAULT (CURRENT_TIMESTAMP)
      );
      CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY,
        institution_id TEXT NOT NULL,
        plan TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        start_date TEXT NOT NULL,
        end_date TEXT,
        amount REAL DEFAULT 0,
        created_at TEXT DEFAULT (CURRENT_TIMESTAMP),
        FOREIGN KEY (institution_id) REFERENCES institutions(id)
      );
      CREATE TABLE IF NOT EXISTS feature_flags (
        id TEXT PRIMARY KEY,
        institution_id TEXT NOT NULL,
        feature TEXT NOT NULL,
        enabled INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (CURRENT_TIMESTAMP),
        FOREIGN KEY (institution_id) REFERENCES institutions(id)
      );
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        institution_id TEXT,
        action TEXT NOT NULL,
        entity TEXT NOT NULL,
        entity_id TEXT,
        details TEXT,
        ip_address TEXT,
        created_at TEXT DEFAULT (CURRENT_TIMESTAMP)
      );
      CREATE TABLE IF NOT EXISTS platform_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        updated_at TEXT DEFAULT (CURRENT_TIMESTAMP)
      );
    `);
    
    console.log('[DB] Platform database initialized');
  }
  return _platformDb;
}

// ============================================
// TENANT DATABASE (one per institution/college)
// ============================================
const tenantDbCache: Map<string, ReturnType<typeof drizzle>> = new Map();
const tenantSqliteCache: Map<string, Database.Database> = new Map();

export function getTenantSqlite(tenantDbName: string) {
  if (tenantSqliteCache.has(tenantDbName)) {
    return tenantSqliteCache.get(tenantDbName)!;
  }
  getTenantDb(tenantDbName); // ensure init
  return tenantSqliteCache.get(tenantDbName)!;
}

export function getTenantDb(tenantDbName: string) {
  if (tenantDbCache.has(tenantDbName)) {
    return tenantDbCache.get(tenantDbName)!;
  }
  
  const dbPath = join(DB_DIR, `${tenantDbName}.db`);
  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  tenantSqliteCache.set(tenantDbName, sqlite);
  
  const db = drizzle(sqlite, { schema: tenantSchema });
  
  // Auto-create all tenant tables
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      enrollment_number TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      gender TEXT, date_of_birth TEXT, nationality TEXT,
      aadhaar_number TEXT, passport_number TEXT, profile_photo TEXT, blood_group TEXT,
      mobile TEXT NOT NULL, email TEXT UNIQUE,
      permanent_address TEXT, current_address TEXT,
      emergency_contact_person TEXT, emergency_contact_number TEXT,
      father_name TEXT, mother_name TEXT, guardian_name TEXT,
      guardian_occupation TEXT, guardian_contact TEXT, family_background TEXT,
      date_of_conversion TEXT,
      baptism_status INTEGER DEFAULT 0, baptism_date TEXT, baptism_church_name TEXT,
      current_church TEXT, pastor_name TEXT,
      ministry_involvement TEXT, spiritual_gifts TEXT, personal_testimony TEXT,
      previous_qualification TEXT, previous_school TEXT, previous_board TEXT,
      previous_year TEXT, previous_marks TEXT, medium_of_instruction TEXT,
      program_id TEXT, department TEXT, academic_year TEXT, semester INTEGER,
      mode TEXT DEFAULT 'regular',
      campus TEXT, hostel_required INTEGER DEFAULT 0, room_allocation TEXT,
      transport_required INTEGER DEFAULT 0,
      fee_structure_id TEXT, scholarship INTEGER DEFAULT 0, sponsor_id TEXT,
      payment_plan TEXT DEFAULT 'full', fee_status TEXT DEFAULT 'pending',
      health_conditions TEXT, allergies TEXT, disability TEXT, medical_certificate_url TEXT,
      calling_to_ministry INTEGER DEFAULT 0, calling_type TEXT,
      ministry_experience TEXT, years_of_service INTEGER,
      preferred_ministry_field TEXT, internship_interest INTEGER DEFAULT 0,
      id_proof_url TEXT, academic_certificate_url TEXT, baptism_certificate_url TEXT,
      pastor_recommendation_url TEXT, passport_photos_url TEXT,
      admission_status TEXT DEFAULT 'pending', verified_by_id TEXT, remarks TEXT, approval_date TEXT,
      profile_completion INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP), updated_at TEXT DEFAULT (CURRENT_TIMESTAMP)
    );
    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL, gender TEXT, date_of_birth TEXT,
      profile_photo TEXT, nationality TEXT, aadhaar_number TEXT, marital_status TEXT,
      mobile TEXT NOT NULL, email TEXT UNIQUE, address TEXT, emergency_contact TEXT,
      date_of_conversion TEXT, baptism_status INTEGER DEFAULT 0, baptism_date TEXT,
      church_name TEXT, pastor_name TEXT, ministry_involvement TEXT,
      years_in_ministry INTEGER, spiritual_gifts TEXT, personal_testimony TEXT, statement_of_faith TEXT,
      highest_qualification TEXT, theological_degree TEXT, seminary_name TEXT,
      completion_year TEXT, specialization TEXT,
      role TEXT DEFAULT 'teacher', department TEXT, date_of_joining TEXT,
      employment_type TEXT DEFAULT 'full-time', experience_years INTEGER,
      salary REAL, bank_name TEXT, bank_account TEXT, bank_ifsc TEXT,
      payment_frequency TEXT DEFAULT 'monthly',
      calling_type TEXT, ministry_experience TEXT, current_ministry_role TEXT,
      church_leadership_role TEXT, field_experience TEXT,
      id_proof_url TEXT, ordination_certificate_url TEXT, resume_url TEXT,
      teaching_score REAL DEFAULT 0, ministry_impact_score REAL DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP), updated_at TEXT DEFAULT (CURRENT_TIMESTAMP)
    );
    CREATE TABLE IF NOT EXISTS programs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL, code TEXT NOT NULL UNIQUE,
      level TEXT NOT NULL, duration TEXT NOT NULL,
      total_semesters INTEGER DEFAULT 8, total_credits INTEGER, description TEXT,
      ministry_practicum INTEGER DEFAULT 1, internship INTEGER DEFAULT 1, thesis INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP), updated_at TEXT DEFAULT (CURRENT_TIMESTAMP)
    );
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, department TEXT,
      credits INTEGER DEFAULT 3, course_type TEXT DEFAULT 'core', semester INTEGER,
      program_id TEXT, prerequisites TEXT, description TEXT, syllabus_url TEXT,
      scripture_references TEXT,
      teacher_id TEXT, batch TEXT, weekly_hours INTEGER DEFAULT 3, mode TEXT DEFAULT 'offline',
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP), updated_at TEXT DEFAULT (CURRENT_TIMESTAMP),
      FOREIGN KEY (program_id) REFERENCES programs(id),
      FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    );
    CREATE TABLE IF NOT EXISTS fee_structures (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL, program_id TEXT, academic_year TEXT, semester INTEGER,
      tuition_fee REAL DEFAULT 0, admission_fee REAL DEFAULT 0,
      hostel_fee REAL DEFAULT 0, library_fee REAL DEFAULT 0,
      exam_fee REAL DEFAULT 0, miscellaneous_fee REAL DEFAULT 0, total_fee REAL DEFAULT 0,
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP),
      FOREIGN KEY (program_id) REFERENCES programs(id)
    );
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      payment_id TEXT NOT NULL UNIQUE,
      student_id TEXT NOT NULL, fee_structure_id TEXT,
      amount_paid REAL NOT NULL, balance_remaining REAL DEFAULT 0,
      payment_mode TEXT NOT NULL, transaction_ref TEXT, received_by_id TEXT,
      status TEXT DEFAULT 'completed', late_fine REAL DEFAULT 0,
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP),
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id)
    );
    CREATE TABLE IF NOT EXISTS sponsors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL, contact TEXT, email TEXT,
      total_sponsored REAL DEFAULT 0,
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP)
    );
    CREATE TABLE IF NOT EXISTS grades (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL, course_id TEXT NOT NULL, teacher_id TEXT,
      marks REAL, grade TEXT, gpa_points REAL DEFAULT 0,
      semester INTEGER, academic_year TEXT, remarks TEXT,
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP),
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (course_id) REFERENCES courses(id),
      FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    );
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL, course_id TEXT NOT NULL,
      date TEXT NOT NULL, status TEXT DEFAULT 'present', remarks TEXT,
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP),
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );
    CREATE TABLE IF NOT EXISTS manuscripts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL, author TEXT, category TEXT,
      type TEXT DEFAULT 'book', language TEXT DEFAULT 'English',
      publication_year TEXT, isbn TEXT,
      scripture_references TEXT, keywords TEXT, abstract TEXT, file_url TEXT,
      access_level TEXT DEFAULT 'students',
      total_copies INTEGER DEFAULT 1, available_copies INTEGER DEFAULT 1, total_borrowed INTEGER DEFAULT 0,
      uploaded_by_id TEXT, status TEXT DEFAULT 'available',
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP), updated_at TEXT DEFAULT (CURRENT_TIMESTAMP)
    );
    CREATE TABLE IF NOT EXISTS borrow_records (
      id TEXT PRIMARY KEY,
      manuscript_id TEXT NOT NULL, borrower_id TEXT NOT NULL, borrower_type TEXT,
      issue_date TEXT NOT NULL, due_date TEXT NOT NULL,
      return_date TEXT, status TEXT DEFAULT 'borrowed', fine REAL DEFAULT 0,
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP),
      FOREIGN KEY (manuscript_id) REFERENCES manuscripts(id)
    );
    CREATE TABLE IF NOT EXISTS lesson_plans (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL, teacher_id TEXT NOT NULL,
      topic TEXT NOT NULL, date TEXT NOT NULL, duration TEXT DEFAULT '90 min',
      method TEXT, objectives TEXT, materials_required TEXT,
      activities TEXT, scripture_references TEXT,
      status TEXT DEFAULT 'upcoming', engagement_score REAL DEFAULT 0,
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP),
      FOREIGN KEY (course_id) REFERENCES courses(id),
      FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    );
    CREATE TABLE IF NOT EXISTS teaching_resources (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL, type TEXT NOT NULL,
      course_id TEXT, uploaded_by_id TEXT, file_url TEXT,
      description TEXT, downloads INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );
    CREATE TABLE IF NOT EXISTS mentorships (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL, student_id TEXT NOT NULL,
      focus_area TEXT, total_meetings INTEGER DEFAULT 0,
      last_meeting_date TEXT, growth_rating TEXT DEFAULT 'growing',
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP),
      FOREIGN KEY (teacher_id) REFERENCES teachers(id),
      FOREIGN KEY (student_id) REFERENCES students(id)
    );
    CREATE TABLE IF NOT EXISTS spiritual_activities (
      id TEXT PRIMARY KEY,
      student_id TEXT, teacher_id TEXT,
      activity_type TEXT NOT NULL, title TEXT NOT NULL,
      description TEXT, date TEXT NOT NULL, duration TEXT,
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP),
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    );
    CREATE TABLE IF NOT EXISTS institution_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL, description TEXT,
      updated_at TEXT DEFAULT (CURRENT_TIMESTAMP)
    );
  `);
  
  tenantDbCache.set(tenantDbName, db);
  console.log(`[DB] Tenant database initialized: ${tenantDbName}`);
  return db;
}

export { platformSchema, tenantSchema };
