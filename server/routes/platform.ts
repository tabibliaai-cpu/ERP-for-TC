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
        profilePhoto: user.profile_photo,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.date_of_birth,
        churchName: user.church_name,
        pastorName: user.pastor_name,
        yearsInMinistry: user.years_in_ministry,
        statementOfFaith: user.statement_of_faith_text,
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
    const fullUser = db.prepare('SELECT * FROM platform_users WHERE id = ?').get(user.userId) as any;
    const institution = db.prepare('SELECT * FROM institutions WHERE id = ?').get(user.institutionId) as any;

    res.json({
      ...user,
      fullName: fullUser?.full_name,
      displayName: fullUser?.display_name,
      profilePhoto: fullUser?.profile_photo,
      phone: fullUser?.phone,
      gender: fullUser?.gender,
      dateOfBirth: fullUser?.date_of_birth,
      churchName: fullUser?.church_name,
      pastorName: fullUser?.pastor_name,
      yearsInMinistry: fullUser?.years_in_ministry,
      statementOfFaith: fullUser?.statement_of_faith_text,
      institution,
    });
  } else {
    const db = getPlatformSqlite();
    const fullUser = db.prepare('SELECT * FROM platform_users WHERE id = ?').get(user.userId) as any;
    res.json({
      ...user,
      fullName: fullUser?.full_name,
      displayName: fullUser?.display_name,
      profilePhoto: fullUser?.profile_photo,
      phone: fullUser?.phone,
    });
  }
});

// ── AUTH: UPDATE OWN PROFILE ──────────────────
router.put('/auth/profile', authMiddleware, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = getPlatformSqlite();
    const { fullName, displayName, phone, gender, dateOfBirth, churchName, pastorName, yearsInMinistry, statementOfFaith } = req.body;

    const updates: string[] = [];
    const values: any[] = [];

    if (fullName !== undefined) { updates.push('full_name = ?'); values.push(fullName); }
    if (displayName !== undefined) { updates.push('display_name = ?'); values.push(displayName); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (gender !== undefined) { updates.push('gender = ?'); values.push(gender); }
    if (dateOfBirth !== undefined) { updates.push('date_of_birth = ?'); values.push(dateOfBirth); }
    if (churchName !== undefined) { updates.push('church_name = ?'); values.push(churchName); }
    if (pastorName !== undefined) { updates.push('pastor_name = ?'); values.push(pastorName); }
    if (yearsInMinistry !== undefined) { updates.push('years_in_ministry = ?'); values.push(yearsInMinistry); }
    if (statementOfFaith !== undefined) { updates.push('statement_of_faith_text = ?'); values.push(statementOfFaith); }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(user.userId);

    db.prepare(`UPDATE platform_users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    auditLog(user.userId, 'update', 'user', user.userId, undefined, 'Updated profile');

    res.json({ success: true, message: 'Profile updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── AUTH: CHANGE PASSWORD ─────────────────────
router.put('/auth/password', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = getPlatformSqlite();
    const { currentPassword, newPassword } = req.body;

    const dbUser = db.prepare('SELECT password_hash FROM platform_users WHERE id = ?').get(user.userId) as any;
    if (!dbUser) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(currentPassword, dbUser.password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password incorrect' });

    const newHash = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE platform_users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newHash, user.userId);
    auditLog(user.userId, 'update', 'user', user.userId, undefined, 'Changed password');

    res.json({ success: true, message: 'Password changed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── INSTITUTIONS: LIST ALL (Super Admin) ─────
router.get('/institutions', authMiddleware, superAdminOnly, (req: Request, res: Response) => {
  const db = getPlatformSqlite();
  const institutions = db.prepare(`
    SELECT i.*, u.full_name as admin_name, u.email as admin_email,
      (SELECT COUNT(*) FROM platform_users WHERE institution_id = i.id) as user_count
    FROM institutions i
    LEFT JOIN platform_users u ON i.admin_id = u.id
    ORDER BY i.created_at DESC
  `).all();
  res.json(institutions);
});

// ── INSTITUTIONS: GET ONE (Super Admin) ──────
router.get('/institutions/:id', authMiddleware, superAdminOnly, (req: Request, res: Response) => {
  const db = getPlatformSqlite();
  const inst = db.prepare(`
    SELECT i.*, u.full_name as admin_name, u.email as admin_email, u.phone as admin_phone
    FROM institutions i
    LEFT JOIN platform_users u ON i.admin_id = u.id
    WHERE i.id = ?
  `).get(req.params.id);
  if (!inst) return res.status(404).json({ error: 'Institution not found' });
  res.json(inst);
});

// ── INSTITUTIONS: CREATE (Super Admin) ────────
router.post('/institutions', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const { name, code, type, location, email, phone, website, adminEmail, adminName, plan, denomination, city, state, country } = req.body;
    const db = getPlatformSqlite();
    const instId = `inst-${crypto.randomUUID().slice(0, 8)}`;
    const tenantDbName = `tenant-${code.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    // Check if code is unique
    const existingCode = db.prepare('SELECT id FROM institutions WHERE code = ?').get(code) as any;
    if (existingCode) return res.status(400).json({ error: 'Institution code already exists' });

    // Check if admin email is unique
    const existingEmail = db.prepare('SELECT id FROM platform_users WHERE email = ?').get(adminEmail) as any;
    if (existingEmail) return res.status(400).json({ error: 'Admin email already exists' });

    // Create admin user
    const adminId = `admin-${crypto.randomUUID().slice(0, 8)}`;
    const adminHash = await bcrypt.hash('Admin@2024', 10);

    try {
      db.prepare(`
        INSERT INTO platform_users (id, email, password_hash, full_name, display_name, role, institution_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(adminId, adminEmail, adminHash, adminName, adminName, 'institution_admin', instId, 'active');
    } catch (err: any) {
      return res.status(500).json({ error: `Failed to create admin user: ${err.message}` });
    }

    // Create institution
    try {
      db.prepare(`
        INSERT INTO institutions (id, name, code, type, location, email, phone, website, city, state, country, denomination, admin_id, plan, tenant_db_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(instId, name, code, type, location, email, phone || null, website || null, city || null, state || null, country || null, denomination || null, adminId, plan || 'free', tenantDbName);
    } catch (err: any) {
      return res.status(500).json({ error: `Failed to create institution: ${err.message}` });
    }

    // Enable all features
    try {
      const features = ['academic', 'pedagogy', 'library', 'billing', 'yeshua_ai', 'ministry_tracking', 'reports'];
      for (const f of features) {
        db.prepare('INSERT INTO feature_flags (id, institution_id, feature, enabled) VALUES (?, ?, ?, ?)')
          .run(`ff-${crypto.randomUUID()}`, instId, f, 1);
      }
    } catch (err: any) {
      return res.status(500).json({ error: `Failed to enable features: ${err.message}` });
    }

    // Initialize tenant database
    try {
      const { getTenantDb } = await import('../db/connection.js');
      getTenantDb(tenantDbName);
    } catch (err: any) {
      return res.status(500).json({ error: `Failed to init tenant DB: ${err.message}` });
    }

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

// ── INSTITUTIONS: UPDATE (Super Admin) ────────
router.put('/institutions/:id', authMiddleware, superAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getPlatformSqlite();
    const instId = req.params.id;

    const existing = db.prepare('SELECT id FROM institutions WHERE id = ?').get(instId) as any;
    if (!existing) return res.status(404).json({ error: 'Institution not found' });

    const allowedFields = ['name', 'type', 'location', 'email', 'phone', 'website', 'city', 'state', 'country', 'denomination', 'plan', 'status', 'display_name', 'short_name', 'primary_color', 'secondary_color', 'theme_mode', 'footer_text', 'mission', 'vision', 'statement_of_faith', 'core_values', 'address', 'postal_code'];
    const updates: string[] = [];
    const values: any[] = [];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(instId);

    db.prepare(`UPDATE institutions SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    auditLog((req as any).user.userId, 'update', 'institution', instId, undefined, `Updated institution`);

    res.json({ success: true, message: 'Institution updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── INSTITUTIONS: DELETE (Super Admin) ────────
router.delete('/institutions/:id', authMiddleware, superAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getPlatformSqlite();
    const instId = req.params.id;

    const inst = db.prepare('SELECT * FROM institutions WHERE id = ?').get(instId) as any;
    if (!inst) return res.status(404).json({ error: 'Institution not found' });

    // Suspend associated users
    db.prepare('UPDATE platform_users SET status = ? WHERE institution_id = ?').run('deactivated', instId);

    // Delete institution
    db.prepare('DELETE FROM feature_flags WHERE institution_id = ?').run(instId);
    db.prepare('DELETE FROM subscriptions WHERE institution_id = ?').run(instId);
    db.prepare('DELETE FROM institutions WHERE id = ?').run(instId);

    auditLog((req as any).user.userId, 'delete', 'institution', instId, undefined, `Deleted institution: ${inst.name}`);

    res.json({ success: true, message: `Institution "${inst.name}" deleted` });
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

// ── USER: UPDATE STATUS (Super Admin) ─────────
router.put('/users/:id/status', authMiddleware, superAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getPlatformSqlite();
    const { status } = req.body;
    if (!['active', 'suspended', 'deactivated'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    db.prepare('UPDATE platform_users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);
    auditLog((req as any).user.userId, 'update', 'user', req.params.id, undefined, `User status changed to ${status}`);

    res.json({ success: true, message: `User status updated to ${status}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
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
  const logs = db.prepare(`
    SELECT al.*, u.full_name as user_name
    FROM audit_logs al
    LEFT JOIN platform_users u ON al.user_id = u.id
    ORDER BY al.created_at DESC LIMIT 100
  `).all();
  res.json(logs);
});

// ── PLATFORM STATS ───────────────────────────
router.get('/stats', authMiddleware, superAdminOnly, (req: Request, res: Response) => {
  const db = getPlatformSqlite();
  const institutions = db.prepare('SELECT COUNT(*) as c FROM institutions WHERE status = ?').get('active') as any;
  const users = db.prepare('SELECT COUNT(*) as c FROM platform_users WHERE status = ?').get('active') as any;
  const premium = db.prepare('SELECT COUNT(*) as c FROM institutions WHERE plan = ?').get('premium') as any;
  const basic = db.prepare('SELECT COUNT(*) as c FROM institutions WHERE plan = ?').get('basic') as any;
  const suspended = db.prepare('SELECT COUNT(*) as c FROM institutions WHERE status = ?').get('suspended') as any;

  res.json({
    totalInstitutions: institutions.c,
    totalUsers: users.c,
    premiumInstitutions: premium.c,
    basicInstitutions: basic.c,
    freeInstitutions: institutions.c - premium.c - basic.c,
    suspendedInstitutions: suspended.c,
  });
});

// ── PLATFORM SETTINGS ─────────────────────────
router.get('/settings', authMiddleware, superAdminOnly, (req: Request, res: Response) => {
  const db = getPlatformSqlite();
  const settings = db.prepare('SELECT * FROM platform_settings ORDER BY key').all();
  res.json(settings);
});

router.put('/settings', authMiddleware, superAdminOnly, (req: Request, res: Response) => {
  try {
    const db = getPlatformSqlite();
    const { key, value, description } = req.body;
    db.prepare(`
      INSERT INTO platform_settings (key, value, description, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, description = COALESCE(excluded.description, description), updated_at = CURRENT_TIMESTAMP
    `).run(key, value, description || null);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
