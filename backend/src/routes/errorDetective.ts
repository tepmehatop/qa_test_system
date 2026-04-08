import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Задание 5 — «Детектив ошибок»
 * 8 кнопок на фронте, каждая вызывает один из этих endpoints.
 * Фронт показывает только расплывчатый toast.
 * Задача: открыть DevTools → Network и определить код + чья ошибка.
 */

// Case 1: 500 Internal Server Error (Backend)
router.post('/case1', (_req: Request, res: Response) => {
  res.status(500).json({
    error: 'InternalServerError',
    message: 'Unhandled exception in payment processor: NullPointerException at PaymentService.java:142',
    code: 'ERR_PAYMENT_001',
  });
});

// Case 2: 400 Bad Request — frontend didn't send required field 'userId' (Frontend bug)
router.post('/case2', (req: Request, res: Response) => {
  const { userId, action } = req.body as { userId?: number; action?: string };
  if (!userId) {
    res.status(400).json({
      error: 'ValidationError',
      message: 'Required field missing: userId',
      field: 'userId',
      receivedBody: { action },
    });
    return;
  }
  res.json({ success: true, userId, action });
});

// Case 3: 404 Not Found — typo in URL called from frontend (/usres instead of /users)
// Frontend calls /api/:sessionId/error-detective/case3-wrong which doesn't exist
// We define the CORRECT endpoint here, but frontend will call the WRONG one
router.get('/case3-correct', (_req: Request, res: Response) => {
  res.json({ users: [{ id: 1, name: 'Alice' }] });
});
// (frontend intentionally calls /case3-typo which is not defined → Express 404)

// Case 4: 403 Forbidden — wrong auth header (Frontend bug: sends wrong token format)
router.get('/case4', (req: Request, res: Response) => {
  const auth = req.headers['authorization'];
  // Expects "Bearer <token>" but frontend sends "Token <token>"
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid authorization header format. Expected: Bearer <token>',
      received: auth || 'none',
    });
    return;
  }
  res.json({ data: 'secret data', userId: 42 });
});

// Case 5: No network request at all — JS error on frontend before fetch
// This endpoint would work fine, but frontend has a TypeError before calling it
// (handled purely on frontend — this endpoint is never actually called)
router.get('/case5', (_req: Request, res: Response) => {
  res.json({ result: 'This would have worked!' });
});

// Case 6: 422 Unprocessable Entity — wrong data type (Frontend sends string instead of number)
router.post('/case6', (req: Request, res: Response) => {
  const { price, productName } = req.body as { price?: unknown; productName?: string };
  if (typeof price === 'string') {
    res.status(422).json({
      error: 'UnprocessableEntity',
      message: 'Invalid data type for field "price": expected number, got string',
      field: 'price',
      receivedType: typeof price,
      receivedValue: price,
    });
    return;
  }
  res.json({ success: true, product: { name: productName, price } });
});

// Case 7: 408 Request Timeout — backend takes 35 seconds (Backend bug)
router.get('/case7', async (_req: Request, res: Response) => {
  await new Promise((resolve) => setTimeout(resolve, 35000));
  res.status(408).json({
    error: 'RequestTimeout',
    message: 'Request timeout: database query exceeded 30s limit',
  });
});

// Case 8: 503 Service Unavailable (Backend)
router.get('/case8', (_req: Request, res: Response) => {
  res.status(503)
    .set('Retry-After', '120')
    .json({
      error: 'ServiceUnavailable',
      message: 'The recommendation service is temporarily down for maintenance.',
      retryAfter: 120,
    });
});

export default router;
