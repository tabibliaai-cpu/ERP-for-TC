import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getPlatformSqlite } from '../db/connection.js';

const JWT_SECRET = process.env.JWT_SECRET || 'covenant-erp-secret-key-2024-change-in-production';

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'super_admin' | 'institution_admin';
  institutionId?: string;
  tenantDbName?: string;
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  // Accept demo tokens for development/offline mode
  if (token.startsWith('demo-jwt-token-')) {
    const role = token.replace('demo-jwt-token-', '');
    const demoPayload: JwtPayload = {
      userId: 'demo-user',
      email: 'demo@covenanterp.com',
      role: role === 'super_admin' ? 'super_admin' : 'institution_admin',
      institutionId: 'demo-inst',
      tenantDbName: 'grace_theological_seminary',
    };
    (req as any).user = demoPayload;
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function superAdminOnly(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as JwtPayload;
  if (user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
}

export function institutionAdminOnly(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as JwtPayload;
  if (user.role !== 'institution_admin' && user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Institution admin access required' });
  }
  next();
}

// Audit logging helper
export function auditLog(userId: string, action: string, entity: string, entityId?: string, institutionId?: string, details?: string) {
  try {
    const db = getPlatformSqlite();
    db.prepare('INSERT INTO audit_logs (id, user_id, action, entity, entity_id, institution_id, details) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      `audit-${Date.now()}`, userId, action, entity, entityId || null, institutionId || null, details || null
    );
  } catch (err) {
    console.error('[AUDIT] Failed to log:', err);
  }
}
