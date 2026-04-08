import { Router, Request, Response } from 'express';

const router = Router();

interface Message {
  id: number;
  role: 'user' | 'bot';
  text: string;
  timestamp: string;
}

// In-memory "chat history" per session (shared for simplicity — single user per session)
const chatHistory: Message[] = [];
let messageCounter = 0;
// BUG 8: this counter is tracked server-side but NOT returned correctly to frontend
let serverMessageCount = 0;

// Scripted bot responses
const responses: Record<string, string> = {
  'привет': 'Привет! Чем могу помочь?',
  'hello': 'Hello! How can I help you?',
  'как дела': 'У меня всё отлично, я же бот! А у вас?',
  'помощь': 'Я могу отвечать на простые вопросы. Попробуйте спросить о погоде или поздороваться.',
  'погода': 'Сегодня отличная погода для тестирования! ☀️',
  'спасибо': 'Пожалуйста! Обращайтесь.',
};

// BUG 4: same message → different answers (random pick)
const fallbackResponses = [
  'Интересный вопрос! Я думаю об этом...',
  'Не могу найти ответ в своей базе знаний.',
  'Хм, не совсем понимаю. Попробуйте переформулировать.',
  'Это за пределами моих возможностей.',
  'Обратитесь к документации.',
];

function getBotResponse(text: string): string {
  const lower = text.toLowerCase().trim();
  // BUG 5: keyword "ошибка" triggers 500 — handled in route
  if (lower.includes('ошибка')) throw new Error('Internal bot error triggered by keyword');
  return responses[lower] || fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

/**
 * POST /api/:sessionId/ai/chat
 * BUG 1: Empty input → bot still replies with "Привет, undefined!"
 * BUG 5: keyword "ошибка" → 500
 * BUG 7: response delayed 8 seconds (simulated slow AI), no loading indicator on frontend
 */
router.post('/chat', async (req: Request, res: Response) => {
  const { message } = req.body as { message?: string };

  serverMessageCount++;

  // BUG 1: no check for empty/missing message — just use it as-is
  const userText = message as string; // could be undefined

  try {
    // BUG 7: artificial delay — 8 seconds, frontend shows no spinner
    await new Promise((resolve) => setTimeout(resolve, 8000));

    const botText = getBotResponse(userText || '');

    const userMsg: Message = {
      id: ++messageCounter,
      role: 'user',
      text: userText,
      timestamp: new Date().toISOString(),
    };
    const botMsg: Message = {
      id: ++messageCounter,
      role: 'bot',
      // BUG 1: if userText is undefined → "Привет, undefined!"
      text: userText === undefined ? `Привет, ${userText}!` : botText,
      timestamp: new Date().toISOString(),
    };

    chatHistory.push(userMsg, botMsg);

    res.json({
      message: botMsg,
      // BUG 8: returns stale count (off by one race)
      totalMessages: serverMessageCount - 1,
    });
  } catch (_err) {
    // BUG 5: 500 on keyword
    res.status(500).json({ error: 'Internal bot error', message: 'Бот столкнулся с внутренней ошибкой.' });
  }
});

/**
 * GET /api/:sessionId/ai/history
 */
router.get('/history', (_req: Request, res: Response) => {
  res.json({ messages: chatHistory, totalMessages: serverMessageCount });
});

/**
 * DELETE /api/:sessionId/ai/history
 * BUG 6: clears server history but frontend won't update (handled in frontend)
 */
router.delete('/history', (_req: Request, res: Response) => {
  chatHistory.length = 0;
  serverMessageCount = 0;
  res.json({ success: true, message: 'История очищена' });
});

export default router;
