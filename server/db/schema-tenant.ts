import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ============================================
// TENANT DATABASE SCHEMA (one per institution/college)
// Each college gets its own SQLite/Turso database with these tables
// ============================================

// ── STUDENTS ──────────────────────────────────
export const students = sqliteTable('students', {
  id: text('id').primaryKey(),
  enrollmentNumber: text('enrollment_number').notNull().unique(), // Auto-generated
  
  // Basic Info
  fullName: text('full_name').notNull(),
  gender: text('gender'),                           // Male | Female
  dateOfBirth: text('date_of_birth'),
  nationality: text('nationality'),
  aadhaarNumber: text('aadhaar_number'),
  passportNumber: text('passport_number'),
  profilePhoto: text('profile_photo'),
  bloodGroup: text('blood_group'),
  
  // Contact
  mobile: text('mobile').notNull(),
  email: text('email').unique(),
  permanentAddress: text('permanent_address'),
  currentAddress: text('current_address'),
  emergencyContactPerson: text('emergency_contact_person'),
  emergencyContactNumber: text('emergency_contact_number'),
  
  // Family / Guardian
  fatherName: text('father_name'),
  motherName: text('mother_name'),
  guardianName: text('guardian_name'),
  guardianOccupation: text('guardian_occupation'),
  guardianContact: text('guardian_contact'),
  familyBackground: text('family_background'),       // Christian | Non-Christian
  
  // Spiritual Information
  dateOfConversion: text('date_of_conversion'),
  baptismStatus: integer('baptism_status', { mode: 'boolean' }).default(false),
  baptismDate: text('baptism_date'),
  baptismChurchName: text('baptism_church_name'),
  currentChurch: text('current_church'),
  pastorName: text('pastor_name'),
  ministryInvolvement: text('ministry_involvement'),  // JSON array
  spiritualGifts: text('spiritual_gifts'),            // JSON array
  personalTestimony: text('personal_testimony'),
  
  // Academic Info
  previousQualification: text('previous_qualification'),
  previousSchool: text('previous_school'),
  previousBoard: text('previous_board'),
  previousYear: text('previous_year'),
  previousMarks: text('previous_marks'),
  mediumOfInstruction: text('medium_of_instruction'),
  
  // Course Enrollment
  programId: text('program_id').references(() => programs.id),
  department: text('department'),
  academicYear: text('academic_year'),
  semester: integer('semester'),
  mode: text('mode').default('regular'),            // regular | online
  
  // Institutional
  campus: text('campus'),
  hostelRequired: integer('hostel_required', { mode: 'boolean' }).default(false),
  roomAllocation: text('room_allocation'),
  transportRequired: integer('transport_required', { mode: 'boolean' }).default(false),
  
  // Financial
  feeStructureId: text('fee_structure_id').references(() => feeStructures.id),
  scholarship: integer('scholarship', { mode: 'boolean' }).default(false),
  sponsorId: text('sponsor_id').references(() => sponsors.id),
  paymentPlan: text('payment_plan').default('full'), // full | monthly | quarterly | custom
  feeStatus: text('fee_status').default('pending'),  // paid | partial | due | overdue
  
  // Medical
  healthConditions: text('health_conditions'),
  allergies: text('allergies'),
  disability: text('disability'),
  medicalCertificateUrl: text('medical_certificate_url'),
  
  // Ministry & Calling
  callingToMinistry: integer('calling_to_ministry', { mode: 'boolean' }).default(false),
  callingType: text('calling_type'),                 // Pastor | Missionary | Teacher | Evangelist
  ministryExperience: text('ministry_experience'),
  yearsOfService: integer('years_of_service'),
  preferredMinistryField: text('preferred_ministry_field'),
  internshipInterest: integer('internship_interest', { mode: 'boolean' }).default(false),
  
  // Documents (URLs)
  idProofUrl: text('id_proof_url'),
  academicCertificateUrl: text('academic_certificate_url'),
  baptismCertificateUrl: text('baptism_certificate_url'),
  pastorRecommendationUrl: text('pastor_recommendation_url'),
  passportPhotosUrl: text('passport_photos_url'),
  
  // Admin Section
  admissionStatus: text('admission_status').default('pending'), // pending | approved | rejected
  verifiedById: text('verified_by_id'),
  remarks: text('remarks'),
  approvalDate: text('approval_date'),
  profileCompletion: integer('profile_completion').default(0), // Percentage 0-100
  
  // System
  status: text('status').default('active'),          // active | graduated | suspended | withdrawn
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

// ── TEACHERS ──────────────────────────────────
export const teachers = sqliteTable('teachers', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').notNull().unique(),
  
  // Basic Info
  fullName: text('full_name').notNull(),
  gender: text('gender'),
  dateOfBirth: text('date_of_birth'),
  profilePhoto: text('profile_photo'),
  nationality: text('nationality'),
  aadhaarNumber: text('aadhaar_number'),
  maritalStatus: text('marital_status'),
  
  // Contact
  mobile: text('mobile').notNull(),
  email: text('email').unique(),
  address: text('address'),
  emergencyContact: text('emergency_contact'),
  
  // Spiritual Profile
  dateOfConversion: text('date_of_conversion'),
  baptismStatus: integer('baptism_status', { mode: 'boolean' }).default(false),
  baptismDate: text('baptism_date'),
  churchName: text('church_name'),
  pastorName: text('pastor_name'),
  ministryInvolvement: text('ministry_involvement'),
  yearsInMinistry: integer('years_in_ministry'),
  spiritualGifts: text('spiritual_gifts'),
  personalTestimony: text('personal_testimony'),
  statementOfFaith: text('statement_of_faith'),
  
  // Qualifications
  highestQualification: text('highest_qualification'),
  theologicalDegree: text('theological_degree'),      // B.Th | M.Div | Th.M | PhD
  seminaryName: text('seminary_name'),
  completionYear: text('completion_year'),
  specialization: text('specialization'),            // OT | NT | Systematic Theology | Pastoral | etc
  
  // Employment
  role: text('role').default('teacher'),             // teacher | pastor | visiting | guest
  department: text('department'),
  dateOfJoining: text('date_of_joining'),
  employmentType: text('employment_type').default('full-time'), // full-time | part-time | contract
  experienceYears: integer('experience_years'),
  
  // Payroll
  salary: real('salary'),
  bankName: text('bank_name'),
  bankAccount: text('bank_account'),
  bankIfsc: text('bank_ifsc'),
  paymentFrequency: text('payment_frequency').default('monthly'),
  
  // Ministry & Calling
  callingType: text('calling_type'),
  ministryExperience: text('ministry_experience'),
  currentMinistryRole: text('current_ministry_role'),
  churchLeadershipRole: text('church_leadership_role'),
  fieldExperience: text('field_experience'),         // Rural | Urban | International
  
  // Documents
  idProofUrl: text('id_proof_url'),
  ordinationCertificateUrl: text('ordination_certificate_url'),
  resumeUrl: text('resume_url'),
  
  // Performance
  teachingScore: real('teaching_score').default(0),
  ministryImpactScore: real('ministry_impact_score').default(0),
  
  status: text('status').default('active'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

// ── PROGRAMS ──────────────────────────────────
export const programs = sqliteTable('programs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),                      // B.Th, M.Div, Diploma in Theology
  code: text('code').notNull().unique(),
  level: text('level').notNull(),                    // undergraduate | postgraduate | certificate
  duration: text('duration').notNull(),              // e.g., "4 years"
  totalSemesters: integer('total_semesters').default(8),
  totalCredits: integer('total_credits'),
  description: text('description'),
  
  // Modules
  ministryPracticum: integer('ministry_practicum', { mode: 'boolean' }).default(true),
  internship: integer('internship', { mode: 'boolean' }).default(true),
  thesis: integer('thesis', { mode: 'boolean' }).default(false),
  
  status: text('status').default('active'),          // active | archived | draft
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

// ── COURSES ───────────────────────────────────
export const courses = sqliteTable('courses', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  department: text('department'),
  credits: integer('credits').default(3),
  courseType: text('course_type').default('core'),  // core | elective | optional
  semester: integer('semester'),
  programId: text('program_id').references(() => programs.id),
  
  prerequisites: text('prerequisites'),              // JSON array of course IDs
  description: text('description'),
  syllabusUrl: text('syllabus_url'),
  scriptureReferences: text('scripture_references'), // JSON array
  
  // Assignment
  teacherId: text('teacher_id').references(() => teachers.id),
  batch: text('batch'),
  weeklyHours: integer('weekly_hours').default(3),
  mode: text('mode').default('offline'),             // offline | online | hybrid
  
  status: text('status').default('active'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

// ── FEE STRUCTURES ────────────────────────────
export const feeStructures = sqliteTable('fee_structures', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),                      // e.g., "B.Th 1st Year"
  programId: text('program_id').references(() => programs.id),
  academicYear: text('academic_year'),
  semester: integer('semester'),
  
  tuitionFee: real('tuition_fee').default(0),
  admissionFee: real('admission_fee').default(0),
  hostelFee: real('hostel_fee').default(0),
  libraryFee: real('library_fee').default(0),
  examFee: real('exam_fee').default(0),
  miscellaneousFee: real('miscellaneous_fee').default(0),
  totalFee: real('total_fee').default(0),
  
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// ── PAYMENTS ──────────────────────────────────
export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  paymentId: text('payment_id').notNull().unique(), // e.g., PAY-2026-001
  studentId: text('student_id').references(() => students.id).notNull(),
  feeStructureId: text('fee_structure_id').references(() => feeStructures.id),
  
  amountPaid: real('amount_paid').notNull(),
  balanceRemaining: real('balance_remaining').default(0),
  
  paymentMode: text('payment_mode').notNull(),      // cash | upi | bank_transfer | online
  transactionRef: text('transaction_ref'),
  receivedById: text('received_by_id'),
  
  status: text('status').default('completed'),      // completed | pending | failed | refunded
  
  lateFine: real('late_fine').default(0),
  
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// ── SPONSORS ──────────────────────────────────
export const sponsors = sqliteTable('sponsors', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  contact: text('contact'),
  email: text('email'),
  totalSponsored: real('total_sponsored').default(0),
  
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// ── GRADES ────────────────────────────────────
export const grades = sqliteTable('grades', {
  id: text('id').primaryKey(),
  studentId: text('student_id').references(() => students.id).notNull(),
  courseId: text('course_id').references(() => courses.id).notNull(),
  teacherId: text('teacher_id').references(() => teachers.id),
  
  marks: real('marks'),
  grade: text('grade'),                              // A+, A, B+, B, C, etc.
  gpaPoints: real('gpa_points').default(0),
  semester: integer('semester'),
  academicYear: text('academic_year'),
  
  remarks: text('remarks'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// ── ATTENDANCE ────────────────────────────────
export const attendance = sqliteTable('attendance', {
  id: text('id').primaryKey(),
  studentId: text('student_id').references(() => students.id).notNull(),
  courseId: text('course_id').references(() => courses.id).notNull(),
  date: text('date').notNull(),
  status: text('status').default('present'),        // present | absent | late | excused
  remarks: text('remarks'),
  
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// ── LIBRARY MANUSCRIPTS ───────────────────────
export const manuscripts = sqliteTable('manuscripts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  author: text('author'),
  category: text('category'),                        // Systematic Theology, Exegesis, etc
  type: text('type').default('book'),                // book | research_paper | sermon | commentary | thesis
  language: text('language').default('English'),
  publicationYear: text('publication_year'),
  isbn: text('isbn'),
  
  scriptureReferences: text('scripture_references'), // JSON array
  keywords: text('keywords'),                         // JSON array
  abstract: text('abstract'),
  fileUrl: text('file_url'),
  
  accessLevel: text('access_level').default('students'), // public | students | teachers | admin
  
  totalCopies: integer('total_copies').default(1),
  availableCopies: integer('available_copies').default(1),
  totalBorrowed: integer('total_borrowed').default(0),
  
  uploadedById: text('uploaded_by_id'),
  status: text('status').default('available'),       // available | borrowed | archived
  
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

// ── BORROW RECORDS ────────────────────────────
export const borrowRecords = sqliteTable('borrow_records', {
  id: text('id').primaryKey(),
  manuscriptId: text('manuscript_id').references(() => manuscripts.id).notNull(),
  borrowerId: text('borrower_id').notNull(),         // student or teacher ID
  borrowerType: text('borrower_type'),               // student | teacher
  issueDate: text('issue_date').notNull(),
  dueDate: text('due_date').notNull(),
  returnDate: text('return_date'),
  status: text('status').default('borrowed'),        // borrowed | returned | overdue
  fine: real('fine').default(0),
  
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// ── LESSON PLANS ──────────────────────────────
export const lessonPlans = sqliteTable('lesson_plans', {
  id: text('id').primaryKey(),
  courseId: text('course_id').references(() => courses.id).notNull(),
  teacherId: text('teacher_id').references(() => teachers.id).notNull(),
  topic: text('topic').notNull(),
  date: text('date').notNull(),
  duration: text('duration').default('90 min'),
  method: text('method'),                            // lecture | discussion | case_study | sermon_based | field_based
  objectives: text('objectives'),
  materialsRequired: text('materials_required'),
  activities: text('activities'),
  scriptureReferences: text('scripture_references'),
  
  status: text('status').default('upcoming'),       // upcoming | completed | cancelled
  engagementScore: real('engagement_score').default(0),
  
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// ── TEACHING RESOURCES ────────────────────────
export const teachingResources = sqliteTable('teaching_resources', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  type: text('type').notNull(),                      // pdf | video | audio | link
  courseId: text('course_id').references(() => courses.id),
  uploadedById: text('uploaded_by_id'),
  fileUrl: text('file_url'),
  description: text('description'),
  downloads: integer('downloads').default(0),
  
  status: text('status').default('active'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// ── MENTORSHIPS ───────────────────────────────
export const mentorships = sqliteTable('mentorships', {
  id: text('id').primaryKey(),
  teacherId: text('teacher_id').references(() => teachers.id).notNull(),
  studentId: text('student_id').references(() => students.id).notNull(),
  focusArea: text('focus_area'),                     // Academic | Spiritual | Ministry Formation
  totalMeetings: integer('total_meetings').default(0),
  lastMeetingDate: text('last_meeting_date'),
  growthRating: text('growth_rating').default('growing'), // growing | strong | excellent
  status: text('status').default('active'),
  
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// ── SPIRITUAL ACTIVITIES ──────────────────────
export const spiritualActivities = sqliteTable('spiritual_activities', {
  id: text('id').primaryKey(),
  studentId: text('student_id').references(() => students.id),
  teacherId: text('teacher_id').references(() => teachers.id),
  activityType: text('activity_type').notNull(),     // devotion | prayer | bible_study | outreach | choir
  title: text('title').notNull(),
  description: text('description'),
  date: text('date').notNull(),
  duration: text('duration'),
  
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// ── INSTITUTION SETTINGS (per-tenant) ─────────
export const institutionSettings = sqliteTable('institution_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  description: text('description'),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});
