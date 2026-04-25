import express from 'express';
import cors from 'cors';
import { getPlatformDb } from './db/connection.js';
import { seedPlatform } from './db/seed.js';
import platformRoutes from './routes/platform.js';
import tenantRoutes from './routes/tenant.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/platform', platformRoutes);
app.use('/api/tenant', tenantRoutes);

// Initialize database and seed
async function start() {
  try {
    console.log('[SERVER] Initializing database...');
    getPlatformDb(); // Initialize platform DB
    await seedPlatform(); // Seed initial data
    console.log('[SERVER] Database ready');
    
    app.listen(PORT, () => {
      console.log(`[SERVER] CovenantERP API running on http://localhost:${PORT}`);
      console.log(`[SERVER] API endpoints:`);
      console.log(`  POST   /api/platform/auth/login       - Login`);
      console.log(`  GET    /api/platform/auth/me           - Get current user`);
      console.log(`  GET    /api/platform/institutions     - List all institutions (Super Admin)`);
      console.log(`  POST   /api/platform/institutions     - Create institution (Super Admin)`);
      console.log(`  GET    /api/platform/users            - List all users (Super Admin)`);
      console.log(`  GET    /api/platform/stats            - Platform statistics`);
      console.log(`  GET    /api/tenant/students           - List students`);
      console.log(`  POST   /api/tenant/students           - Create student`);
      console.log(`  GET    /api/tenant/teachers           - List teachers`);
      console.log(`  POST   /api/tenant/teachers           - Create teacher`);
      console.log(`  GET    /api/tenant/programs           - List programs`);
      console.log(`  GET    /api/tenant/courses            - List courses`);
      console.log(`  GET    /api/tenant/payments           - List payments`);
      console.log(`  POST   /api/tenant/payments           - Record payment`);
      console.log(`  GET    /api/tenant/manuscripts        - Library manuscripts`);
      console.log(`  GET    /api/tenant/dashboard/stats    - Dashboard statistics`);
    });
  } catch (err) {
    console.error('[SERVER] Failed to start:', err);
    process.exit(1);
  }
}

start();
