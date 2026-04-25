import { Router, Request, Response } from 'express';
import { authMiddleware, institutionAdminOnly } from '../middleware/auth.js';
import { getTenantSqlite } from '../db/connection.js';
import crypto from 'crypto';

const router = Router();

// Helper: get tenant SQLite from authenticated user
function getDb(req: Request) {
  const user = (req as any).user;
  if (!user.tenantDbName) throw new Error('No tenant database assigned');
  return getTenantSqlite(user.tenantDbName);
}

// ── STUDENTS ─────────────────────────────────
router.get('/students', authMiddleware, institutionAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    const { search, status, programId, page = 1, limit = 20 } = req.query as any;
    
    let sql = 'SELECT * FROM students WHERE 1=1';
    const params: any[] = [];
    
    if (search) {
      sql += ' AND (full_name LIKE ? OR enrollment_number LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (programId) { sql += ' AND program_id = ?'; params.push(programId); }
    
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));
    
    const students = db.prepare(sql).all(...params);
    const total = db.prepare('SELECT COUNT(*) as c FROM students').get() as any;
    
    res.json({
      students,
      total: total.c,
      page: Number(page),
      totalPages: Math.ceil(total.c / Number(limit)),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/students', authMiddleware, institutionAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    const id = `stu-${crypto.randomUUID().slice(0, 8)}`;
    const enrollmentNumber = `GTS-${Date.now().toString(36).toUpperCase()}`;
    
    const { fullName, gender, mobile, email, programId, semester, academicYear, ...rest } = req.body;
    
    db.prepare(`
      INSERT INTO students (id, enrollment_number, full_name, gender, mobile, email, program_id, semester, academic_year, ${Object.keys(rest).length > 0 ? Object.keys(rest).join(', ') + ',' : ''} admission_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ${Object.keys(rest).length > 0 ? Object.keys(rest).map(() => '?').join(', ') + ',' : ''} 'approved')
    `).run(id, enrollmentNumber, fullName, gender, mobile, email, programId || null, semester || 1, academicYear || '2026', ...Object.values(rest));
    
    res.status(201).json({ id, enrollmentNumber, message: 'Student created successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/students/:id', authMiddleware, institutionAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/students/:id', authMiddleware, institutionAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    const fields = Object.entries(req.body);
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    
    const setClause = fields.map(([k]) => `${k} = ?`).join(', ');
    db.prepare(`UPDATE students SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(...fields.map(([, v]) => v), req.params.id);
    
    res.json({ success: true, message: 'Student updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── TEACHERS ─────────────────────────────────
router.get('/teachers', authMiddleware, institutionAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    const teachers = db.prepare('SELECT * FROM teachers WHERE status = ? ORDER BY created_at DESC').all('active');
    res.json(teachers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/teachers', authMiddleware, institutionAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    const id = `tch-${crypto.randomUUID().slice(0, 8)}`;
    const employeeId = `EMP-${Date.now().toString(36).toUpperCase()}`;
    
    const { fullName, gender, mobile, email, department, role, ...rest } = req.body;
    
    db.prepare(`
      INSERT INTO teachers (id, employee_id, full_name, gender, mobile, email, department, role, ${Object.keys(rest).length > 0 ? Object.keys(rest).join(', ') + ',' : ''} status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ${Object.keys(rest).length > 0 ? Object.keys(rest).map(() => '?').join(', ') + ',' : ''} 'active')
    `).run(id, employeeId, fullName, gender, mobile, email, department || null, role || 'teacher', ...Object.values(rest));
    
    res.status(201).json({ id, employeeId, message: 'Teacher created successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/teachers/:id', authMiddleware, institutionAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    const teacher = db.prepare('SELECT * FROM teachers WHERE id = ?').get(req.params.id);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.json(teacher);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/teachers/:id', authMiddleware, institutionAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    const fields = Object.entries(req.body);
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

    const setClause = fields.map(([k]) => `${k} = ?`).join(', ');
    db.prepare(`UPDATE teachers SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(...fields.map(([, v]) => v), req.params.id);

    res.json({ success: true, message: 'Teacher updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/students/:id', authMiddleware, institutionAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    db.prepare("UPDATE students SET status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
    res.json({ success: true, message: 'Student archived' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── RECENT STUDENTS ───────────────────────────
router.get('/students/recent', authMiddleware, institutionAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    const students = db.prepare('SELECT * FROM students ORDER BY created_at DESC LIMIT 5').all();
    res.json(students);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── PROGRAMS ─────────────────────────────────
router.get('/programs', authMiddleware, institutionAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    const programs = db.prepare('SELECT *, (SELECT COUNT(*) FROM students WHERE program_id = programs.id) as student_count FROM programs ORDER BY created_at DESC').all();
    res.json(programs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/programs', authMiddleware, institutionAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    const id = `prog-${crypto.randomUUID().slice(0, 8)}`;
    const { name, code, level, duration, totalSemesters, totalCredits, description } = req.body;
    
    db.prepare(`
      INSERT INTO programs (id, name, code, level, duration, total_semesters, total_credits, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, code, level, duration, totalSemesters || 8, totalCredits || 0, description || null);
    
    res.status(201).json({ id, message: 'Program created' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── COURSES ──────────────────────────────────
router.get('/courses', authMiddleware, institutionAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    const courses = db.prepare(`
      SELECT c.*, p.name as program_name, t.full_name as teacher_name
      FROM courses c
      LEFT JOIN programs p ON c.program_id = p.id
      LEFT JOIN teachers t ON c.teacher_id = t.id
      ORDER BY c.code
    `).all();
    res.json(courses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/courses', authMiddleware, institutionAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    const id = `crs-${crypto.randomUUID().slice(0, 8)}`;
    const { code, name, department, credits, courseType, semester, programId, teacherId, description } = req.body;
    
    db.prepare(`
      INSERT INTO courses (id, code, name, department, credits, course_type, semester, program_id, teacher_id, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, code, name, department, credits || 3, courseType || 'core', semester || 1, programId || null, teacherId || null, description || null);
    
    res.status(201).json({ id, message: 'Course created' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── FEE STRUCTURES ───────────────────────────
router.get('/fee-structures', authMiddleware, institutionAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    const fees = db.prepare('SELECT fs.*, p.name as program_name FROM fee_structures fs LEFT JOIN programs p ON fs.program_id = p.id ORDER BY fs.created_at DESC').all();
    res.json(fees);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── PAYMENTS ─────────────────────────────────
router.get('/payments', authMiddleware, institutionAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    const payments = db.prepare(`
      SELECT p.*, s.full_name as student_name, s.enrollment_number
      FROM payments p
      LEFT JOIN students s ON p.student_id = s.id
      ORDER BY p.created_at DESC
    `).all();
    res.json(payments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/payments', authMiddleware, institutionAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    const id = `pay-${crypto.randomUUID().slice(0, 8)}`;
    const paymentId = `PAY-${Date.now().toString(36).toUpperCase()}`;
    const { studentId, amountPaid, paymentMode, transactionRef, feeStructureId } = req.body;
    
    db.prepare(`
      INSERT INTO payments (id, payment_id, student_id, fee_structure_id, amount_paid, payment_mode, transaction_ref, received_by_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed')
    `).run(id, paymentId, studentId, feeStructureId || null, amountPaid, paymentMode, transactionRef || null, (req as any).user.userId);
    
    // Update student fee status
    db.prepare('UPDATE students SET fee_status = ? WHERE id = ?').run('paid', studentId);
    
    res.status(201).json({ id, paymentId, message: 'Payment recorded' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── GRADES ───────────────────────────────────
router.get('/grades', authMiddleware, institutionAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    const grades = db.prepare(`
      SELECT g.*, s.full_name as student_name, c.name as course_name
      FROM grades g
      LEFT JOIN students s ON g.student_id = s.id
      LEFT JOIN courses c ON g.course_id = c.id
      ORDER BY g.created_at DESC
    `).all();
    res.json(grades);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── LIBRARY / MANUSCRIPTS ────────────────────
router.get('/manuscripts', authMiddleware, institutionAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    const { category, search } = req.query as any;
    
    let sql = 'SELECT * FROM manuscripts WHERE status != ?';
    const params: any[] = ['archived'];
    
    if (category) { sql += ' AND category = ?'; params.push(category); }
    if (search) { sql += ' AND (title LIKE ? OR author LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    
    sql += ' ORDER BY created_at DESC';
    const manuscripts = db.prepare(sql).all(...params);
    res.json(manuscripts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/manuscripts', authMiddleware, institutionAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    const id = `man-${crypto.randomUUID().slice(0, 8)}`;
    const { title, author, category, type, totalCopies } = req.body;
    
    db.prepare(`
      INSERT INTO manuscripts (id, title, author, category, type, total_copies, available_copies, uploaded_by_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, author || null, category || null, type || 'book', totalCopies || 1, totalCopies || 1, (req as any).user.userId);
    
    res.status(201).json({ id, message: 'Manuscript added' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── LESSON PLANS ─────────────────────────────
router.get('/lesson-plans', authMiddleware, institutionAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    const plans = db.prepare(`
      SELECT lp.*, c.name as course_name, t.full_name as teacher_name
      FROM lesson_plans lp
      LEFT JOIN courses c ON lp.course_id = c.id
      LEFT JOIN teachers t ON lp.teacher_id = t.id
      ORDER BY lp.date DESC
    `).all();
    res.json(plans);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── ATTENDANCE ────────────────────────────────
router.get('/attendance', authMiddleware, institutionAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    const { date, courseId } = req.query as any;
    
    let sql = 'SELECT a.*, s.full_name as student_name FROM attendance a LEFT JOIN students s ON a.student_id = s.id WHERE 1=1';
    const params: any[] = [];
    
    if (date) { sql += ' AND a.date = ?'; params.push(date); }
    if (courseId) { sql += ' AND a.course_id = ?'; params.push(courseId); }
    
    sql += ' ORDER BY a.date DESC LIMIT 200';
    const attendance = db.prepare(sql).all(...params);
    res.json(attendance);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── DASHBOARD STATS ──────────────────────────
router.get('/dashboard/stats', authMiddleware, institutionAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    
    const totalStudents = db.prepare('SELECT COUNT(*) as c FROM students WHERE status = ?').get('active') as any;
    const totalTeachers = db.prepare('SELECT COUNT(*) as c FROM teachers WHERE status = ?').get('active') as any;
    const totalPrograms = db.prepare('SELECT COUNT(*) as c FROM programs').get() as any;
    const totalCourses = db.prepare('SELECT COUNT(*) as c FROM courses').get() as any;
    const pendingApproval = db.prepare('SELECT COUNT(*) as c FROM students WHERE admission_status = ?').get('pending') as any;
    const totalPayments = db.prepare('SELECT COALESCE(SUM(amount_paid), 0) as total FROM payments WHERE status = ?').get('completed') as any;
    const totalManuscripts = db.prepare('SELECT COUNT(*) as c FROM manuscripts').get() as any;
    const borrowedBooks = db.prepare('SELECT COUNT(*) as c FROM borrow_records WHERE status = ?').get('borrowed') as any;
    
    res.json({
      totalStudents: totalStudents.c,
      totalTeachers: totalTeachers.c,
      totalPrograms: totalPrograms.c,
      totalCourses: totalCourses.c,
      pendingApproval: pendingApproval.c,
      totalRevenue: totalPayments.total,
      totalManuscripts: totalManuscripts.c,
      borrowedBooks: borrowedBooks.c,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
