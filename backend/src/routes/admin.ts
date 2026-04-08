import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';

const router = Router();

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || '';
const SESSION_TTL_MS = 5 * 60 * 60 * 1000; // 5 hours

/**
 * GET /admin/:key/generate
 * Secret endpoint — generates a new 5-hour session link.
 * Only accessible by knowing ADMIN_SECRET_KEY.
 */
router.get('/:key/generate', (req: Request, res: Response) => {
  if (!ADMIN_SECRET || req.params.key !== ADMIN_SECRET) {
    res.status(404).send('Not found');
    return;
  }

  const sessionId = uuidv4();
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_MS;

  db.prepare('INSERT INTO sessions (id, created_at, expires_at) VALUES (?, ?, ?)').run(
    sessionId,
    now,
    expiresAt,
  );

  // Clean up expired sessions while we're here
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now);

  const host = req.headers.host || 'localhost';
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const link = `${protocol}://${host}/testQasystem/${sessionId}/`;

  res.json({
    sessionId,
    link,
    expiresAt: new Date(expiresAt).toISOString(),
    expiresIn: '5 hours',
  });
});

export default router;
