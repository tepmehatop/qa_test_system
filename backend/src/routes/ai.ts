import { Router, Request, Response } from 'express';

const router = Router({ mergeParams: true });

interface Message {
  id: number;
  role: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const chatHistory: Message[] = [];
let messageCounter = 0;
// BUG 8: server count is always off — returns wrong value
let serverMessageCount = 0;

const exactResponses: Record<string, string> = {
  'привет': 'Привет! Чем могу помочь?',
  'hello': 'Hello! How can I help you?',
  'как дела': 'У меня всё отлично, я же бот! А у вас?',
  'помощь': 'Задайте любой вопрос, я постараюсь ответить.',
  'погода': 'Сегодня отличная погода для тестирования! ☀️',
  'спасибо': 'Пожалуйста! Обращайтесь.',
  'что умеешь': 'Я могу отвечать на приветствия и простые вопросы.',
};

// BUG 4: same fallback question → different random responses
const fallbackResponses = [
  'Интересный вопрос! Я думаю об этом...',
  'Не могу найти ответ в своей базе знаний.',
  'Хм, не совсем понимаю. Попробуйте переформулировать.',
  'Это за пределами моих возможностей.',
  'Уточните, пожалуйста, свой вопрос.',
];

function getBotResponse(text: string | undefined): string {
  if (text === undefined || text.trim() === '') {
    // BUG 1 is handled at call site (echoes undefined)
    return '';
  }
  const lower = text.toLowerCase().trim();
  // BUG 5: keyword "ошибка" → 500
  if (lower.includes('ошибка')) throw new Error('Internal bot error triggered by keyword');
  return exactResponses[lower] || fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

/**
 * POST /api/:sessionId/ai/chat
 *
 * Bugs:
 *  1 — Empty input → bot replies "Привет, undefined!"
 *  4 — Same unknown message → random different answer each time
 *  5 — Keyword "ошибка" → 500
 *  7 — 3-second delay, frontend shows NO loading indicator (no spinner in chat area)
 *  8 — totalMessages in response is always wrong (off-by-one, stale)
 *  3 — bot echoes user text via "Вы написали: [text]" which is rendered via innerHTML → XSS
 */
router.post('/chat', async (req: Request, res: Response) => {
  const { message } = req.body as { message?: string };

  serverMessageCount++;

  // BUG 1: no guard for undefined/empty — proceed as-is
  const userText: string | undefined = message;

  try {
    // BUG 7: 3-second artificial delay, frontend shows NO spinner (check AiTask.tsx)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    let botText: string;
    if (userText === undefined || userText.trim() === '') {
      // BUG 1: echoes "Привет, undefined!" when empty
      botText = `Привет, ${userText}!`;
    } else {
      const baseResponse = getBotResponse(userText);
      // BUG 3: bot echoes user input in response → rendered via dangerouslySetInnerHTML → XSS
      botText = exactResponses[userText.toLowerCase().trim()]
        ? baseResponse
        : `Вы написали: "${userText}". ${baseResponse}`;
    }

    const userMsg: Message = {
      id: ++messageCounter,
      role: 'user',
      text: userText ?? '',
      timestamp: new Date().toISOString(),
    };
    const botMsg: Message = {
      id: ++messageCounter,
      role: 'bot',
      text: botText,
      timestamp: new Date().toISOString(),
    };

    chatHistory.push(userMsg, botMsg);

    res.json({
      message: botMsg,
      // BUG 8: always off — returns stale pre-increment count
      totalMessages: serverMessageCount - 1,
    });
  } catch (_err) {
    // BUG 5
    res.status(500).json({ error: 'InternalBotError', message: 'Бот столкнулся с внутренней ошибкой.' });
  }
});

router.get('/history', (_req: Request, res: Response) => {
  res.json({ messages: chatHistory, totalMessages: serverMessageCount });
});

/**
 * DELETE /api/:sessionId/ai/history
 * BUG 6: clears server state, but frontend does NOT clear UI (see AiTask.tsx handleClearHistory)
 */
router.delete('/history', (_req: Request, res: Response) => {
  chatHistory.length = 0;
  serverMessageCount = 0;
  messageCounter = 0;
  res.json({ success: true });
});

export default router;
