import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { initDb } from './db';
import adminRouter from './routes/admin';
import authRouter from './routes/auth';
import shopRouter from './routes/shop';
import swaggerRouter from './routes/swagger';
import sqlRouter from './routes/sql';
import aiRouter from './routes/ai';
import errorDetectiveRouter from './routes/errorDetective';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Initialize DB
initDb();

// Admin route — secret session generator (no session middleware needed)
app.use('/admin', adminRouter);

// Swagger mock — accessible without session (standalone page linked from task 2)
app.use('/api/swagger-mock', swaggerRouter);

// Session-scoped API routes
// All these require a valid sessionId in the path
app.use('/api/:sessionId/auth', authRouter);
app.use('/api/:sessionId/shop', shopRouter);
app.use('/api/:sessionId/sql', sqlRouter);
app.use('/api/:sessionId/ai', aiRouter);
app.use('/api/:sessionId/error-detective', errorDetectiveRouter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// 404 for anything else
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Admin key loaded: ${process.env.ADMIN_SECRET_KEY ? 'YES' : 'NO — check .env!'}`);
});
