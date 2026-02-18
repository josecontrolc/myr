import dotenv from 'dotenv';

// Load environment variables before any module that reads them
dotenv.config();

import express from 'express';
import cors from 'cors';
import prisma from './lib/prisma';
import { auth, loadAuthConfig } from './lib/auth';
import adminRouter from './routes/admin';
import { adminAuth } from './middleware/adminAuth';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.get('/api', (req, res) => {
  res.json({ message: 'Backend API is running' });
});

// Health check endpoint with real service checks
app.get('/api/health', async (req, res) => {
  const timestamp = new Date().toISOString();

  // Check database connectivity
  const dbStart = Date.now();
  let dbOk = false;
  let dbLatencyMs = 0;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
    dbLatencyMs = Date.now() - dbStart;
  } catch {
    dbLatencyMs = Date.now() - dbStart;
  }

  const allOk = dbOk;

  res.status(allOk ? 200 : 503).json({
    status: allOk ? 'ok' : 'degraded',
    timestamp,
    services: {
      api: { ok: true, message: 'Express API is running' },
      database: {
        ok: dbOk,
        latencyMs: dbLatencyMs,
        message: dbOk ? `Connected (${dbLatencyMs}ms)` : 'Connection failed'
      }
    }
  });
});

// Admin routes - Protected by adminAuth middleware
app.use('/api/admin', adminAuth, adminRouter);

// Better Auth routes - Convert Express request to Web Request
app.all('/api/auth/*', async (req, res) => {
  try {
    // Construct full URL for Better Auth
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const url = `${protocol}://${host}${req.url}`;

    // Create a proper Request object for Better Auth
    const bodyString = req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined;

    const webRequest = new Request(url, {
      method: req.method,
      headers: new Headers(req.headers as any),
      body: bodyString,
    });

    const response = await auth.handler(webRequest);

    // Convert Web Response to Express response
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const body = await response.text();
    res.send(body);
  } catch (error) {
    console.error('Auth handler error:', error);
    res.status(500).json({ error: 'Authentication error', message: (error as Error).message });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const startServer = async () => {
  try {
    // Load auth configuration on startup
    await loadAuthConfig();

    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Auth endpoints available at /api/auth/*`);
      console.log(`Admin endpoints available at /api/admin/*`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
