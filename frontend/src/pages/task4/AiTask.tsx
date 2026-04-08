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
  // BUG 8: messageCount in header — stale, not synced with actual count
  const [messageCount] = useState(0);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    // BUG 2: no length check — very long text will break layout
    // BUG 3: XSS — we render text directly via innerHTML in bot bubble
    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      text: input, // could be empty — BUG 1
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    // BUG 1: we clear input and send even if empty
    setInput('');
    setSending(true);

    try {
      // BUG 7: no loading indicator shown — just setSending but UI has no spinner in chat area
      const { data } = await axios.post(`/api/${sessionId}/ai/chat`, {
        message: input || undefined, // sends undefined if empty — triggers "Привет, undefined!"
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
    // BUG 6: calls API to clear server-side, but does NOT clear local state
    // so UI still shows old messages
    await axios.delete(`/api/${sessionId}/ai/history`);
    // intentionally NOT calling setMessages([])
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
          {/* BUG 8: counter stuck at 0 and never updates */}
          <span className="ai-message-count">Сообщений: {messageCount}</span>
        </div>
        <button className="btn-secondary ai-clear-btn" onClick={handleClearHistory}>
          Очистить историю
        </button>
      </header>

      <div className="ai-chat">
        {messages.length === 0 && (
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
              {/* BUG 3: bot messages rendered via dangerouslySetInnerHTML — XSS vulnerability */}
              {msg.role === 'bot'
                ? <span dangerouslySetInnerHTML={{ __html: msg.text }} />
                : <span>{msg.text}</span>}
            </div>
            <div className="ai-timestamp">
              {new Date(msg.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}

        {/* BUG 7: no typing indicator even though server takes 8 seconds */}
        {sending && (
          <div className="ai-message ai-message-bot">
            <div className="ai-bubble ai-bubble-sending">...</div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="ai-input-area">
        {/* BUG 2: no maxLength — user can paste 10000 chars and layout breaks */}
        <textarea
          className="ai-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Введите сообщение... (Enter — отправить)"
          rows={2}
        />
        <button className="btn-primary ai-send-btn" onClick={handleSend} disabled={sending}>
          Отправить
        </button>
      </div>
    </div>
  );
}
