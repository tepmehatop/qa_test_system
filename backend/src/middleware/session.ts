import { Request, Response, NextFunction } from 'express';
import { db } from '../db';

export interface SessionRequest extends Request {
  sessionId?: string;
}

export function sessionMiddleware(req: SessionRequest, res: Response, next: NextFunction): void {
  const sessionId = req.params.sessionId || req.headers['x-session-id'] as string;

  if (!sessionId) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as
    | { id: string; created_at: number; expires_at: number }
    | undefined;

  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  if (Date.now() > session.expires_at) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
    res.status(410).json({ error: 'Session expired' });
    return;
  }

  req.sessionId = sessionId;
  next();
}
