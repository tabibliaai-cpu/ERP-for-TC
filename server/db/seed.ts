import { getPlatformSqlite, getTenantSqlite } from './connection.js';
import { generateToken, auditLog } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function seedPlatform() {
  const db = getPlatformSqlite();
  
  // Create Super Admin
  const saId = 'sa-001';
    db.exec("PRAGMA foreign_keys = OFF");
  const saHash = await bcrypt.hash('SuperAdmin@2024', 10);
  
  const existing = db.prepare('SELECT id FROM platform_users WHERE id = ?').get(saId);
  if (!existing) {
    db.prepare(`
      INSERT INTO platform_users (id, email, password_hash, full_name, display_name, role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(saId, 'superadmin@covenanterp.com', saHash, 'Super Administrator', 'Super Admin', 'super_admin', 'active');
    console.log('[SEED] Super Admin created: superadmin / SuperAdmin@2024');
  }
  
  // Create sample institution (Grace Theological Seminary)
  const instId = 'inst-gts-001';
  const existingInst = db.prepare('SELECT id FROM institutions WHERE id = ?').get(instId);
  if (!existingInst) {
    // Create institution admin
    const adminId = 'admin-inst-001';
    const adminHash = await bcrypt.hash('Admin@2024', 10);
    
    db.prepare(`
      INSERT INTO platform_users (id, email, password_hash, full_name, display_name, role, institution_id, phone, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(adminId, 'admin@gracetheological.edu', adminHash, 'Dr. Samuel Johnson', 'Dr. Johnson', 'institution_admin', instId, '+91-9876543210', 'active');
    
    db.prepare(`
      INSERT INTO institutions (id, name, code, type, location, city, state, country, email, phone, website, display_name, short_name, primary_color, secondary_color, denomination, admin_id, plan, tenant_db_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      instId, 'Grace Theological Seminary', 'GTS-001', 'Seminary',
      'Chennai, Tamil Nadu, India', 'Chennai', 'Tamil Nadu', 'India',
      'info@gracetheological.edu', '+91-44-2827-0001', 'www.gracetheological.edu',
      'Grace Theological Seminary', 'GTS', '#2563eb', '#1e3a5f',
      'Baptist', adminId, 'premium', 'tenant-gts'
    );
    
    // Create subscription
    db.prepare(`
      INSERT INTO subscriptions (id, institution_id, plan, status, start_date, end_date, amount)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(`sub-${Date.now()}`, instId, 'premium', 'active', '2026-01-01', '2027-01-01', 14999);
    
    // Enable features
    const features = ['academic', 'pedagogy', 'library', 'billing', 'yeshua_ai', 'ministry_tracking', 'reports'];
    for (const f of features) {
      db.prepare(`
        INSERT INTO feature_flags (id, institution_id, feature, enabled) VALUES (?, ?, ?, ?)
      `).run(`ff-${crypto.randomUUID()}`, instId, f, 1);
    }
    
    console.log('[SEED] Institution created: Grace Theological Seminary');
    console.log('[SEED] Admin created: admin@gracetheological.edu / Admin@2024');
  }
    db.exec("PRAGMA foreign_keys = ON");
  
  // Seed tenant data
  seedTenantData('tenant-gts');
}

function seedTenantData(tenantDbName: string) {
  const db = getTenantSqlite(tenantDbName);
  
  // Programs
  const existingPrograms = db.prepare('SELECT COUNT(*) as c FROM programs').get() as { c: number };
  if (existingPrograms.c === 0) {
    const programs = [
      { id: 'prog-bth', name: 'Bachelor of Theology (B.Th)', code: 'BTH', level: 'undergraduate', duration: '4 years', totalSemesters: 8, totalCredits: 120 },
      { id: 'prog-mdiv', name: 'Master of Divinity (M.Div)', code: 'MDIV', level: 'postgraduate', duration: '3 years', totalSemesters: 6, totalCredits: 90 },
      { id: 'prog-diploma', name: 'Diploma in Theology', code: 'DTH', level: 'certificate', duration: '2 years', totalSemesters: 4, totalCredits: 60 },
      { id: 'prog-cert', name: 'Certificate in Biblical Studies', code: 'CBS', level: 'certificate', duration: '1 year', totalSemesters: 2, totalCredits: 30 },
    ];
    
    const insertProg = db.prepare(`
      INSERT INTO programs (id, name, code, level, duration, total_semesters, total_credits)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of programs) {
      insertProg.run(p.id, p.name, p.code, p.level, p.duration, p.totalSemesters, p.totalCredits);
    }
    console.log(`[SEED] ${programs.length} programs created`);
  }
  
  // Courses
  const existingCourses = db.prepare('SELECT COUNT(*) as c FROM courses').get() as { c: number };
  if (existingCourses.c === 0) {
    const courses = [
      { id: 'crs-st1', code: 'ST101', name: 'Systematic Theology I', department: 'Theology', credits: 4, courseType: 'core', semester: 1, programId: 'prog-bth' },
      { id: 'crs-st2', code: 'ST102', name: 'Systematic Theology II', department: 'Theology', credits: 4, courseType: 'core', semester: 2, programId: 'prog-bth' },
      { id: 'crs-nt1', code: 'NT101', name: 'New Testament Survey', department: 'Biblical Studies', credits: 3, courseType: 'core', semester: 1, programId: 'prog-bth' },
      { id: 'crs-ot1', code: 'OT101', name: 'Old Testament Survey', department: 'Biblical Studies', credits: 3, courseType: 'core', semester: 1, programId: 'prog-bth' },
      { id: 'crs-herm', code: 'HR101', name: 'Hermeneutics', department: 'Biblical Studies', credits: 3, courseType: 'core', semester: 2, programId: 'prog-bth' },
      { id: 'crs-pastoral', code: 'PM101', name: 'Pastoral Ministry', department: 'Practical Theology', credits: 3, courseType: 'core', semester: 3, programId: 'prog-bth' },
      { id: 'crs-chhist', code: 'CH101', name: 'Church History I', department: 'History', credits: 3, courseType: 'core', semester: 2, programId: 'prog-bth' },
      { id: 'crs-greek', code: 'LG101', name: 'Elementary Greek', department: 'Languages', credits: 3, courseType: 'core', semester: 1, programId: 'prog-bth' },
      { id: 'crs-preaching', code: 'HM101', name: 'Homiletics', department: 'Practical Theology', credits: 3, courseType: 'core', semester: 4, programId: 'prog-bth' },
      { id: 'crs-christ', code: 'TH201', name: 'Christology', department: 'Theology', credits: 4, courseType: 'core', semester: 3, programId: 'prog-bth' },
      { id: 'crs-pneuma', code: 'TH202', name: 'Pneumatology', department: 'Theology', credits: 3, courseType: 'core', semester: 3, programId: 'prog-bth' },
      { id: 'crs-ethics', code: 'ET101', name: 'Christian Ethics', department: 'Theology', credits: 3, courseType: 'elective', semester: 4, programId: 'prog-bth' },
    ];
    
    const insertCourse = db.prepare(`
      INSERT INTO courses (id, code, name, department, credits, course_type, semester, program_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const c of courses) {
      insertCourse.run(c.id, c.code, c.name, c.department, c.credits, c.courseType, c.semester, c.programId);
    }
    console.log(`[SEED] ${courses.length} courses created`);
  }
  
  // Teachers
  const existingTeachers = db.prepare('SELECT COUNT(*) as c FROM teachers').get() as { c: number };
  if (existingTeachers.c === 0) {
    const teachers = [
      { id: 'tch-001', employeeId: 'EMP-001', fullName: 'Dr. Samuel Johnson', gender: 'Male', mobile: '+91-9876543210', email: 'samuel@gracetheological.edu', department: 'Theology', role: 'teacher', employmentType: 'full-time', experienceYears: 15, theologicalDegree: 'Ph.D', specialization: 'Systematic Theology', salary: 75000 },
      { id: 'tch-002', employeeId: 'EMP-002', fullName: 'Prof. Maria Garcia', gender: 'Female', mobile: '+91-9876543211', email: 'maria@gracetheological.edu', department: 'Biblical Studies', role: 'teacher', employmentType: 'full-time', experienceYears: 10, theologicalDegree: 'Th.M', specialization: 'New Testament', salary: 65000 },
      { id: 'tch-003', employeeId: 'EMP-003', fullName: 'Rev. David Williams', gender: 'Male', mobile: '+91-9876543212', email: 'david@gracetheological.edu', department: 'Practical Theology', role: 'pastor', employmentType: 'full-time', experienceYears: 20, theologicalDegree: 'M.Div', specialization: 'Pastoral Care', salary: 70000 },
      { id: 'tch-004', employeeId: 'EMP-004', fullName: 'Dr. Sarah Chen', gender: 'Female', mobile: '+91-9876543213', email: 'sarah@gracetheological.edu', department: 'Biblical Studies', role: 'teacher', employmentType: 'full-time', experienceYears: 8, theologicalDegree: 'Ph.D', specialization: 'Hermeneutics', salary: 68000 },
    ];
    
    const insertTeacher = db.prepare(`
      INSERT INTO teachers (id, employee_id, full_name, gender, mobile, email, department, role, employment_type, experience_years, theological_degree, specialization, salary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const t of teachers) {
      insertTeacher.run(t.id, t.employeeId, t.fullName, t.gender, t.mobile, t.email, t.department, t.role, t.employmentType, t.experienceYears, t.theologicalDegree, t.specialization, t.salary);
    }
    console.log(`[SEED] ${teachers.length} teachers created`);
  }
  
  // Fee Structures
  const existingFees = db.prepare('SELECT COUNT(*) as c FROM fee_structures').get() as { c: number };
  if (existingFees.c === 0) {
    const fees = [
      { id: 'fee-bth-y1', name: 'B.Th Year 1', programId: 'prog-bth', academicYear: '2026', tuitionFee: 30000, admissionFee: 5000, libraryFee: 2000, examFee: 1500, totalFee: 38500 },
      { id: 'fee-mdiv-y1', name: 'M.Div Year 1', programId: 'prog-mdiv', academicYear: '2026', tuitionFee: 45000, admissionFee: 5000, libraryFee: 2000, examFee: 1500, totalFee: 53500 },
      { id: 'fee-diploma-y1', name: 'Diploma Year 1', programId: 'prog-diploma', academicYear: '2026', tuitionFee: 20000, admissionFee: 3000, libraryFee: 1000, examFee: 1000, totalFee: 25000 },
    ];
    
    const insertFee = db.prepare(`
      INSERT INTO fee_structures (id, name, program_id, academic_year, tuition_fee, admission_fee, library_fee, exam_fee, total_fee)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const f of fees) {
      insertFee.run(f.id, f.name, f.programId, f.academicYear, f.tuitionFee, f.admissionFee, f.libraryFee, f.examFee, f.totalFee);
    }
    console.log(`[SEED] ${fees.length} fee structures created`);
  }
  
  // Sample Students
  const existingStudents = db.prepare('SELECT COUNT(*) as c FROM students').get() as { c: number };
  if (existingStudents.c === 0) {
    const students = [
      { id: 'stu-001', enrollmentNumber: 'GTS-BTH-2026-001', fullName: 'John Abraham', gender: 'Male', mobile: '+91-9123456780', email: 'john@student.gts.edu', programId: 'prog-bth', semester: 2, academicYear: '2026', feeStructureId: 'fee-bth-y1', callingToMinistry: true, callingType: 'Pastor', baptismStatus: true, currentChurch: 'Grace Baptist Church', admissionStatus: 'approved', profileCompletion: 85 },
      { id: 'stu-002', enrollmentNumber: 'GTS-BTH-2026-002', fullName: 'Sarah Thompson', gender: 'Female', mobile: '+91-9123456781', email: 'sarah.t@student.gts.edu', programId: 'prog-mdiv', semester: 1, academicYear: '2026', feeStructureId: 'fee-mdiv-y1', callingToMinistry: true, callingType: 'Teacher', baptismStatus: true, currentChurch: 'Community Bible Church', admissionStatus: 'approved', profileCompletion: 72 },
      { id: 'stu-003', enrollmentNumber: 'GTS-BTH-2026-003', fullName: 'David Kim', gender: 'Male', mobile: '+91-9123456782', email: 'david.k@student.gts.edu', programId: 'prog-bth', semester: 4, academicYear: '2026', feeStructureId: 'fee-bth-y1', callingToMinistry: true, callingType: 'Missionary', baptismStatus: true, currentChurch: 'Seoul Baptist Church', admissionStatus: 'approved', profileCompletion: 90 },
      { id: 'stu-004', enrollmentNumber: 'GTS-BTH-2026-004', fullName: 'Emily Parker', gender: 'Female', mobile: '+91-9123456783', email: 'emily.p@student.gts.edu', programId: 'prog-bth', semester: 3, academicYear: '2026', feeStructureId: 'fee-bth-y1', callingToMinistry: false, admissionStatus: 'approved', profileCompletion: 65 },
      { id: 'stu-005', enrollmentNumber: 'GTS-BTH-2026-005', fullName: 'Michael Davis', gender: 'Male', mobile: '+91-9123456784', email: 'michael.d@student.gts.edu', programId: 'prog-diploma', semester: 1, academicYear: '2026', feeStructureId: 'fee-diploma-y1', callingToMinistry: true, callingType: 'Evangelist', admissionStatus: 'pending', profileCompletion: 40 },
    ];
    
    const insertStudent = db.prepare(`
      INSERT INTO students (id, enrollment_number, full_name, gender, mobile, email, program_id, semester, academic_year, fee_structure_id, calling_to_ministry, calling_type, baptism_status, current_church, admission_status, profile_completion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const s of students) {
      insertStudent.run(s.id, s.enrollmentNumber, s.fullName, s.gender, s.mobile, s.email, s.programId, s.semester, s.academicYear, s.feeStructureId, s.callingToMinistry ? 1 : 0, s.callingType, s.baptismStatus ? 1 : 0, s.currentChurch, s.admissionStatus, s.profileCompletion);
    }
    console.log(`[SEED] ${students.length} students created`);
  }
  
  // Sample Library Manuscripts
  const existingBooks = db.prepare('SELECT COUNT(*) as c FROM manuscripts').get() as { c: number };
  if (existingBooks.c === 0) {
    const books = [
      { id: 'man-001', title: 'Systematic Theology Vol. 1', author: 'Charles Hodge', category: 'Systematic Theology', type: 'book', totalCopies: 3 },
      { id: 'man-002', title: 'Christologia', author: 'John Owen', category: 'Systematic Theology', type: 'book', totalCopies: 2 },
      { id: 'man-003', title: 'Pensees', author: 'Blaise Pascal', category: 'Apologetics', type: 'book', totalCopies: 2 },
      { id: 'man-004', title: 'The Trinity', author: 'St. Augustine', category: 'Systematic Theology', type: 'book', totalCopies: 3 },
      { id: 'man-005', title: 'Institutes of the Christian Religion', author: 'John Calvin', category: 'Systematic Theology', type: 'book', totalCopies: 4 },
      { id: 'man-006', title: 'Lectures on Systematic Theology', author: 'Charles Finney', category: 'Systematic Theology', type: 'book', totalCopies: 2 },
      { id: 'man-007', title: 'A Critical Review of the Empty Tomb', author: 'J. Daniel Hays', category: 'Apologetics', type: 'research_paper', totalCopies: 1 },
      { id: 'man-008', title: 'Ultimate Questions', author: 'Vincent Cheung', category: 'Apologetics', type: 'book', totalCopies: 2 },
    ];
    
    const insertBook = db.prepare(`
      INSERT INTO manuscripts (id, title, author, category, type, total_copies, available_copies)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const b of books) {
      insertBook.run(b.id, b.title, b.author, b.category, b.type, b.totalCopies, b.totalCopies);
    }
    console.log(`[SEED] ${books.length} manuscripts created`);
  }
  
  console.log('[SEED] Tenant data seeded successfully!');
}
