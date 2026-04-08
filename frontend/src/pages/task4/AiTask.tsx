import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ai.css';

interface Message {
  id: number;
  role: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export default function AiTask() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  // BUG 8: counter never updates — initialized once, never changed
  const [messageCount] = useState(0);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      // BUG 1: shown in chat even when empty — and BUG 2: no length limit
      text: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      // BUG 7: server takes 3 seconds — no spinner or typing indicator here
      const { data } = await axios.post(`/api/${sessionId}/ai/chat`, {
        // BUG 1: sends undefined when empty → triggers "Привет, undefined!" from bot
        message: input || undefined,
      });

      const botMsg: Message = data.message;
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 500) {
        const botErr: Message = {
          id: Date.now() + 1,
          role: 'bot',
          text: '⚠️ Произошла внутренняя ошибка бота.',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botErr]);
      }
    } finally {
      setSending(false);
    }
  }

  async function handleClearHistory() {
    // BUG 6: server history cleared, but setMessages NOT called → UI keeps showing old messages
    await axios.delete(`/api/${sessionId}/ai/history`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="ai-page">
      <header className="ai-header">
        <button className="back-btn" style={{ margin: 0 }}
          onClick={() => navigate(`/testQasystem/${sessionId}/dashboard`)}>
          ← Назад
        </button>
        <div className="ai-header-info">
          <span className="ai-header-title">🤖 AI Ассистент</span>
          {/* BUG 8: always 0 — never updates */}
          <span className="ai-message-count">Сообщений: {messageCount}</span>
        </div>
        <button className="btn-secondary ai-clear-btn" onClick={handleClearHistory}>
          Очистить историю
        </button>
      </header>

      <div className="ai-chat">
        {messages.length === 0 && !sending && (
          <div className="ai-welcome">
            <div className="ai-welcome-icon">🤖</div>
            <p>Привет! Я AI-ассистент. Задайте мне вопрос.</p>
            <div className="ai-suggestions">
              {['Привет', 'Как дела?', 'Помощь', 'Погода'].map((s) => (
                <button key={s} className="ai-suggestion" onClick={() => setInput(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`ai-message ai-message-${msg.role}`}>
            <div className="ai-bubble">
              {/* BUG 3: bot messages use dangerouslySetInnerHTML → XSS.
                  Try sending: <img src=x onerror="alert('XSS')"> */}
              {msg.role === 'bot'
                ? <span dangerouslySetInnerHTML={{ __html: msg.text }} />
                : <span>{msg.text}</span>}
            </div>
            <div className="ai-timestamp">
              {new Date(msg.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}

        {/* BUG 7: when sending=true, NO loading indicator shown — 3-second blank pause */}

        <div ref={bottomRef} />
      </div>

      <div className="ai-input-area">
        {/* BUG 2: no maxLength — paste huge text, layout breaks */}
        <textarea
          className="ai-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Введите сообщение... (Enter — отправить)"
          rows={2}
          disabled={sending}
        />
        <button className="btn-primary ai-send-btn" onClick={handleSend} disabled={sending}>
          {sending ? 'Отправка...' : 'Отправить'}
        </button>
      </div>
    </div>
  );
}
