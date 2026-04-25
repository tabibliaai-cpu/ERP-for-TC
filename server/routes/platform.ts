import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getPlatformSqlite } from '../db/connection.js';
import { generateToken, authMiddleware, superAdminOnly, institutionAdminOnly, auditLog } from '../middleware/auth.js';
import crypto from 'crypto';

const router = Router();

// ── AUTH: LOGIN ────────────────────────────────
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const db = getPlatformSqlite();
    const user = db.prepare('SELECT * FROM platform_users WHERE email = ? AND role = ? AND status = ?')
      .get(email, role, 'active') as any;
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    let tenantDbName: string | undefined;
    if (user.role === 'institution_admin' && user.institution_id) {
      const inst = db.prepare('SELECT tenant_db_name FROM institutions WHERE id = ?').get(user.institution_id) as any;
      tenantDbName = inst?.tenant_db_name;
    }
    
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      institutionId: user.institution_id,
      tenantDbName,
    });
    
    // Update last login
    db.prepare('UPDATE platform_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
    
    auditLog(user.id, 'login', 'user', user.id);
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        displayName: user.display_name,
        role: user.role,
        institutionId: user.institution_id,
        tenantDbName,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── AUTH: GET CURRENT USER ────────────────────
router.get('/auth/me', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  
  if (user.role === 'institution_admin') {
    const db = getPlatformSqlite();
    const institution = db.prepare('SELECT id, name, display_name, tenant_db_name, plan, primary_color, secondary_color FROM institutions WHERE id = ?').get(user.institutionId) as any;
    
    res.json({
      ...user,
      institution,
    });
  } else {
    res.json(user);
  }
});

// ── INSTITUTIONS: LIST ALL (Super Admin) ─────
router.get('/institutions', authMiddleware, superAdminOnly, (req: Request, res: Response) => {
  const db = getPlatformSqlite();
  const institutions = db.prepare(`
    SELECT i.*, u.full_name as admin_name,
      (SELECT COUNT(*) FROM platform_users WHERE institution_id = i.id) as user_count
    FROM institutions i
    LEFT JOIN platform_users u ON i.admin_id = u.id
    ORDER BY i.created_at DESC
  `).all();
  res.json(institutions);
});

// ── INSTITUTIONS: CREATE (Super Admin) ────────
router.post('/institutions', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const { name, code, type, location, email, phone, adminEmail, adminName, plan, denomination } = req.body;
    const db = getPlatformSqlite();
    const instId = `inst-${crypto.randomUUID().slice(0, 8)}`;
    const tenantDbName = `tenant-${code.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    
    // Create admin user
    const adminId = `admin-${crypto.randomUUID().slice(0, 8)}`;
    const adminHash = await bcrypt.hash('Admin@2024', 10);
    
    db.prepare(`
      INSERT INTO platform_users (id, email, password_hash, full_name, display_name, role, institution_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(adminId, adminEmail, adminHash, adminName, adminName, 'institution_admin', instId, 'active');
    
    // Create institution
    db.prepare(`
      INSERT INTO institutions (id, name, code, type, location, email, phone, denomination, admin_id, plan, tenant_db_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(instId, name, code, type, location, email, phone, denomination, adminId, plan || ' ' || tenantDbName);
    
    // Enable all features
    const features = ['academic', 'pedagogy', 'library', 'billing', 'yeshua_ai', 'ministry_tracking', 'reports'];
    for (const f of features) {
      db.prepare('INSERT INTO feature_flags (id, institution_id, feature, enabled) VALUES (?, ?, ?, ?)')
        .run(`ff-${crypto.randomUUID()}`, instId, f, 1);
    }
    
    // Initialize tenant database
    const { getTenantDb } = await import('../db/connection.js');
    getTenantDb(tenantDbName);
    
    auditLog((req as any).user.userId, 'create', 'institution', instId, undefined, `Created institution: ${name}`);
    
    res.status(201).json({
      id: instId,
      message: `Institution "${name}" created successfully`,
      adminCredentials: { email: adminEmail, password: 'Admin@2024' },
      tenantDbName,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── INSTITUTIONS: GET BRANDING ────────────────
router.get('/institutions/:id/branding', (req: Request, res: Response) => {
  const db = getPlatformSqlite();
  const inst = db.prepare(`
    SELECT display_name, short_name, logo_url, favicon_url, primary_color, secondary_color, theme_mode, footer_text, login_background
    FROM institutions WHERE id = ?
  `).get(req.params.id);
  res.json(inst || { error: 'Not found' });
});

// ── GLOBAL USERS (Super Admin) ────────────────
router.get('/users', authMiddleware, superAdminOnly, (req: Request, res: Response) => {
  const db = getPlatformSqlite();
  const users = db.prepare(`
    SELECT u.*, i.name as institution_name
    FROM platform_users u
    LEFT JOIN institutions i ON u.institution_id = i.id
    ORDER BY u.created_at DESC
  `).all();
  res.json(users);
});

// ── FEATURE FLAGS ─────────────────────────────
router.get('/features/:institutionId', authMiddleware, superAdminOnly, (req: Request, res: Response) => {
  const db = getPlatformSqlite();
  const flags = db.prepare('SELECT * FROM feature_flags WHERE institution_id = ?').all(req.params.institutionId);
  res.json(flags);
});

router.put('/features/:institutionId', authMiddleware, superAdminOnly, (req: Request, res: Response) => {
  const { feature, enabled } = req.body;
  const db = getPlatformSqlite();
  db.prepare('UPDATE feature_flags SET enabled = ? WHERE institution_id = ? AND feature = ?')
    .run(enabled ? 1 : 0, req.params.institutionId, feature);
  res.json({ success: true });
});

// ── AUDIT LOGS ───────────────────────────────
router.get('/audit-logs', authMiddleware, superAdminOnly, (req: Request, res: Response) => {
  const db = getPlatformSqlite();
  const logs = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100').all();
  res.json(logs);
});

// ── PLATFORM STATS ───────────────────────────
router.get('/stats', authMiddleware, superAdminOnly, (req: Request, res: Response) => {
  const db = getPlatformSqlite();
  const institutions = db.prepare('SELECT COUNT(*) as c FROM institutions WHERE status = ?').get('active') as any;
  const users = db.prepare('SELECT COUNT(*) as c FROM platform_users WHERE status = ?').get('active') as any;
  const premium = db.prepare('SELECT COUNT(*) as c FROM institutions WHERE plan = ?').get('premium') as any;
  const basic = db.prepare('SELECT COUNT(*) as c FROM institutions WHERE plan = ?').get('basic') as any;
  
  res.json({
    totalInstitutions: institutions.c,
    totalUsers: users.c,
    premiumInstitutions: premium.c,
    basicInstitutions: basic.c,
    freeInstitutions: institutions.c - premium.c - basic.c,
  });
});

export default router;
