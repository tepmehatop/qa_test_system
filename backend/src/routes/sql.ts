import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

// Whitelist: only SELECT statements allowed
function isSafeQuery(query: string): boolean {
  const trimmed = query.trim().toUpperCase();
  if (!trimmed.startsWith('SELECT')) return false;
  // Block dangerous keywords even inside SELECT
  const blocked = [';', 'DROP', 'DELETE', 'INSERT', 'UPDATE', 'CREATE', 'ALTER', 'ATTACH', 'DETACH'];
  return !blocked.some((kw) => trimmed.includes(kw));
}

/**
 * GET /api/:sessionId/sql/tables
 * Returns list of available tables
 */
router.get('/tables', (_req: Request, res: Response) => {
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT IN ('sessions') ORDER BY name")
    .all() as { name: string }[];
  res.json(tables.map((t) => t.name));
});

/**
 * POST /api/:sessionId/sql/execute
 * Executes a SELECT query and returns results
 */
router.post('/execute', (req: Request, res: Response) => {
  const { query } = req.body as { query?: string };

  if (!query || query.trim() === '') {
    res.status(400).json({ error: 'Запрос не может быть пустым' });
    return;
  }

  if (query.length > 2000) {
    res.status(400).json({ error: 'Запрос слишком длинный (максимум 2000 символов)' });
    return;
  }

  if (!isSafeQuery(query)) {
    res.status(403).json({
      error: 'Разрешены только SELECT-запросы. Операции изменения данных заблокированы.',
    });
    return;
  }

  try {
    const stmt = db.prepare(query);
    const rows = stmt.all();
    // Get column names from first row or statement columns
    const columns = rows.length > 0 ? Object.keys(rows[0] as object) : [];
    res.json({ columns, rows, rowCount: rows.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
    res.status(400).json({ error: `Ошибка SQL: ${message}` });
  }
});

export default router;
