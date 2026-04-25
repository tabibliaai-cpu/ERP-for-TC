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

// Helper: camelCase → snake_case
function toSnake(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    const snake = key.replace(/[A-Z]/g, c => '_' + c.toLowerCase());
    result[snake] = val;
  }
  return result;
}

// Helper: safely build INSERT with snake_case columns
function safeInsert(db: any, table: string, data: Record<string, any>, overrides: Record<string, any> = {}) {
  const merged = { ...data, ...overrides };
  const columns = Object.keys(merged);
  const placeholders = columns.map(() => '?');
  const values = Object.values(merged);
  const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
  return db.prepare(sql).run(...values);
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
    
    // Convert camelCase to snake_case for DB columns
    const data = toSnake(req.body);
    
    // Remove fields we generate ourselves
    delete data.id;
    delete data.enrollment_no;
    delete data.enrollment_number;
    
    // Handle special fields
    if (typeof data.semester === 'string' && data.semester.startsWith('Semester')) {
      data.semester = parseInt(data.semester.replace('Semester ', '')) || 1;
    }
    if (!data.semester || isNaN(Number(data.semester))) data.semester = 1;
    
    // program is a name string (e.g. "B.Th") — store as-is if no program_id
    if (data.program && !data.program_id) {
      delete data.program; // Don't store program name in program_id column
    }
    
    data.admission_status = data.admission_status || 'approved';
    data.status = data.status || 'active';
    
    safeInsert(db, 'students', data, { id, enrollment_number: enrollmentNumber });
    
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
    const data = toSnake(req.body);
    const fields = Object.entries(data);
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    
    const setClause = fields.map(([k]) => `${k} = ?`).join(', ');
    db.prepare(`UPDATE students SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(...fields.map(([, v]) => v), req.params.id);
    
    res.json({ success: true, message: 'Student updated' });
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
    
    const data = toSnake(req.body);
    delete data.id;
    delete data.employee_id;
    delete data.employee_number;
    data.status = data.status || 'active';
    
    safeInsert(db, 'teachers', data, { id, employee_id: employeeId });
    
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
    const data = toSnake(req.body);
    const fields = Object.entries(data);
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

    const setClause = fields.map(([k]) => `${k} = ?`).join(', ');
    db.prepare(`UPDATE teachers SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(...fields.map(([, v]) => v), req.params.id);

    res.json({ success: true, message: 'Teacher updated' });
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
    const data = toSnake(req.body);
    delete data.id;
    
    // Map frontend fields properly
    const record: Record<string, any> = { id };
    record.name = data.name || req.body.name;
    record.code = data.code || data.short_name || req.body.shortName || '';
    record.level = data.level || 'Undergraduate';
    record.duration = data.duration || '4 Years';
    record.total_semesters = Number(data.total_semesters || req.body.totalSemesters) || 8;
    record.total_credits = Number(data.credits || data.total_credits || req.body.credits) || 0;
    record.description = data.description || null;
    
    safeInsert(db, 'programs', record);
    
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
    const body = req.body;
    
    const record: Record<string, any> = { id };
    record.code = body.code || '';
    record.name = body.name || '';
    record.department = body.department || 'Biblical Studies';
    record.credits = Number(body.credits) || 3;
    record.course_type = body.type || body.courseType || 'core';
    record.semester = Number(body.semester) || 1;
    record.description = body.description || null;
    record.prerequisites = body.prerequisites || 'None';
    
    // Try to find program_id from program name
    if (body.program) {
      const prog = db.prepare('SELECT id FROM programs WHERE code = ? OR name LIKE ?').get(body.program, `%${body.program}%`) as any;
      record.program_id = prog?.id || null;
    } else if (body.programId) {
      record.program_id = body.programId;
    }
    
    // Try to find teacher_id from instructor name
    if (body.instructor) {
      const teacher = db.prepare('SELECT id FROM teachers WHERE full_name LIKE ?').get(`%${body.instructor}%`) as any;
      record.teacher_id = teacher?.id || null;
    } else if (body.teacherId) {
      record.teacher_id = body.teacherId;
    }
    
    safeInsert(db, 'courses', record);
    
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

router.post('/fee-structures', authMiddleware, institutionAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    const id = `fee-${crypto.randomUUID().slice(0, 8)}`;
    const body = req.body;
    
    const record: Record<string, any> = { id };
    record.name = body.name || '';
    record.amount = Number(body.amount) || 0;
    record.frequency = body.frequency || 'Per Semester';
    record.type = body.type || 'Tuition';
    record.is_mandatory = body.mandatory ? 1 : 0;
    record.description = body.description || '';
    record.status = 'active';
    
    // Try to find program_id from program name
    if (body.program && body.program !== 'All') {
      const prog = db.prepare('SELECT id FROM programs WHERE code = ? OR name LIKE ?').get(body.program, `%${body.program}%`) as any;
      record.program_id = prog?.id || null;
    }
    
    safeInsert(db, 'fee_structures', record);
    
    res.status(201).json({ id, message: 'Fee structure created' });
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
    const body = req.body;
    
    // Accept both camelCase and snake_case
    const studentId = body.studentId || body.student_id;
    const amountPaid = Number(body.amountPaid || body.amount) || 0;
    const paymentMode = body.paymentMode || body.mode || 'Cash';
    const transactionRef = body.transactionRef || body.transaction_ref || null;
    
    const record: Record<string, any> = {
      id, payment_id: paymentId, student_id: studentId,
      amount_paid: amountPaid, payment_mode: paymentMode,
      transaction_ref: transactionRef,
      received_by_id: (req as any).user.userId,
      status: 'completed',
    };
    
    safeInsert(db, 'payments', record);
    
    // Update student fee status
    if (studentId) {
      db.prepare('UPDATE students SET fee_status = ? WHERE id = ?').run('paid', studentId);
    }
    
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
    const body = req.body;
    const totalCopies = Number(body.totalCopies || body.total_copies || body.copies) || 1;
    
    const record: Record<string, any> = {
      id,
      title: body.title || '',
      author: body.author || null,
      category: body.category || null,
      type: body.type || 'book',
      total_copies: totalCopies,
      available_copies: totalCopies,
      uploaded_by_id: (req as any).user.userId,
    };
    
    // Try to insert extra metadata columns if they exist in the table
    const optionalFields = ['language', 'isbn', 'scripture_refs', 'keywords', 'abstract', 'access_level', 'publisher', 'year', 'description'];
    for (const field of optionalFields) {
      if (body[field] !== undefined && body[field] !== '') {
        record[field] = body[field];
      }
    }
    
    // Build INSERT dynamically — only include columns that exist in the table
    const tableInfo = db.prepare("PRAGMA table_info(manuscripts)").all() as any[];
    const validColumns = new Set(tableInfo.map((c: any) => c.name));
    const filteredRecord: Record<string, any> = {};
    for (const [key, val] of Object.entries(record)) {
      if (validColumns.has(key)) filteredRecord[key] = val;
    }
    
    safeInsert(db, 'manuscripts', filteredRecord);
    
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

router.post('/lesson-plans', authMiddleware, institutionAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    const id = `lp-${crypto.randomUUID().slice(0, 8)}`;
    const body = req.body;
    
    const record: Record<string, any> = { id };
    record.title = body.title || '';
    record.date = body.date || new Date().toISOString().split('T')[0];
    record.status = body.status || 'draft';
    record.created_by_id = (req as any).user.userId;
    
    // Try to find course_id from course name
    if (body.course || body.courseId) {
      if (body.courseId) {
        record.course_id = body.courseId;
      } else {
        const course = db.prepare('SELECT id FROM courses WHERE code = ? OR name LIKE ?').get(body.course, `%${body.course}%`) as any;
        record.course_id = course?.id || null;
      }
    }
    
    // Try to find teacher_id
    if (body.teacher || body.teacherId) {
      if (body.teacherId) {
        record.teacher_id = body.teacherId;
      } else {
        const teacher = db.prepare('SELECT id FROM teachers WHERE full_name LIKE ?').get(`%${body.teacher}%`) as any;
        record.teacher_id = teacher?.id || null;
      }
    }
    
    // Extra fields
    const optionalFields = ['topic', 'objectives', 'materials', 'methodology', 'assessment', 'reflection', 'duration', 'scripture_reading', 'prayer_points'];
    const tableInfo = db.prepare("PRAGMA table_info(lesson_plans)").all() as any[];
    const validColumns = new Set(tableInfo.map((c: any) => c.name));
    for (const field of optionalFields) {
      if (body[field] !== undefined && body[field] !== '' && validColumns.has(field)) {
        record[field] = body[field];
      }
    }
    
    safeInsert(db, 'lesson_plans', record);
    
    res.status(201).json({ id, message: 'Lesson plan created' });
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
      totalStudents: totalStudents?.c || 0,
      totalTeachers: totalTeachers?.c || 0,
      totalPrograms: totalPrograms?.c || 0,
      totalCourses: totalCourses?.c || 0,
      pendingApproval: pendingApproval?.c || 0,
      totalRevenue: totalPayments?.total || 0,
      totalManuscripts: totalManuscripts?.c || 0,
      borrowedBooks: borrowedBooks?.c || 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
