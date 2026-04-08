import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';

const router = Router({ mergeParams: true });

/**
 * GET /api/:sessionId/auth/ping
 * Used by frontend SessionGuard to validate that the session exists and is not expired.
 * We reuse the session middleware via the parent route — if we reach here, session is valid.
 */
router.get('/ping', (req: Request, res: Response) => {
  const sessionId = req.params.sessionId;
  if (!sessionId) { res.status(404).json({ error: 'Not found' }); return; }

  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as
    | { id: string; expires_at: number } | undefined;

  if (!session) { res.status(404).json({ error: 'Session not found' }); return; }
  if (Date.now() > session.expires_at) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
    res.status(410).json({ error: 'Session expired' }); return;
  }

  res.json({ ok: true });
});

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
// Intentional edge case: leading/trailing spaces are NOT trimmed on backend —
// only the exact string matches. Frontend trims — this is a detectable behaviour.
const VALID_USERNAME = 'test777';
const VALID_PASSWORD = 'test777';

/**
 * POST /api/:sessionId/auth/login
 */
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: string; password?: string };

  // Both fields missing
  if (!username && !password) {
    res.status(400).json({ error: 'EMPTY_FIELDS', message: 'Пожалуйста, заполните обязательные поля' });
    return;
  }

  // Username missing
  if (!username || username.trim() === '') {
    res.status(400).json({ error: 'EMPTY_USERNAME', message: 'Пожалуйста, заполните поле логина' });
    return;
  }

  // Password missing
  if (!password || password.trim() === '') {
    res.status(400).json({ error: 'EMPTY_PASSWORD', message: 'Пожалуйста, заполните поле пароля' });
    return;
  }

  // Too long — detectable edge case
  if (username.length > 50 || password.length > 50) {
    res.status(400).json({ error: 'TOO_LONG', message: 'Максимальная длина поля — 50 символов' });
    return;
  }

  // Wrong credentials
  if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
    res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Проверьте логин и пароль' });
    return;
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '5h' });
  res.json({ token });
});

export default router;
