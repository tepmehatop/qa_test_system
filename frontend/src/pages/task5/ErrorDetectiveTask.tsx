import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import './error-detective.css';

interface CaseConfig {
  id: number;
  label: string;
  description: string;
  toastMessage: string;
  action: () => Promise<void>;
}

export default function ErrorDetectiveTask() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const token = sessionStorage.getItem(`auth_token_${sessionId}`) || '';

  const cases: CaseConfig[] = [
    {
      id: 1,
      label: 'Кнопка 1',
      description: 'Отправить платёж',
      toastMessage: 'Неизвестная ошибка. Попробуйте позже.',
      action: async () => {
        await axios.post(`/api/${sessionId}/error-detective/case1`, {});
      },
    },
    {
      id: 2,
      label: 'Кнопка 2',
      description: 'Создать задачу',
      toastMessage: 'Что-то пошло не так.',
      action: async () => {
        // BUG: frontend doesn't send required 'userId' field
        await axios.post(`/api/${sessionId}/error-detective/case2`, {
          action: 'create_task',
          // userId intentionally missing
        });
      },
    },
    {
      id: 3,
      label: 'Кнопка 3',
      description: 'Загрузить пользователей',
      toastMessage: 'Ошибка загрузки данных.',
      action: async () => {
        // BUG: typo in URL — /case3-typo instead of /case3-correct
        await axios.get(`/api/${sessionId}/error-detective/case3-typo`);
      },
    },
    {
      id: 4,
      label: 'Кнопка 4',
      description: 'Получить данные профиля',
      toastMessage: 'Ошибка доступа.',
      action: async () => {
        // BUG: sends "Token <jwt>" instead of "Bearer <jwt>"
        await axios.get(`/api/${sessionId}/error-detective/case4`, {
          headers: { Authorization: `Token ${token}` },
        });
      },
    },
    {
      id: 5,
      label: 'Кнопка 5',
      description: 'Синхронизировать данные',
      toastMessage: 'Ошибка синхронизации.',
      action: async () => {
        // BUG: JS TypeError before fetch — request never sent
        const data = null as unknown as { url: string };
        const url = data.url; // TypeError: Cannot read properties of null
        await axios.get(url);
      },
    },
    {
      id: 6,
      label: 'Кнопка 6',
      description: 'Сохранить товар',
      toastMessage: 'Данные не сохранены.',
      action: async () => {
        // BUG: price is a string "29.99" instead of number 29.99
        await axios.post(`/api/${sessionId}/error-detective/case6`, {
          productName: 'Test Product',
          price: '29.99', // string instead of number — intentional
        });
      },
    },
    {
      id: 7,
      label: 'Кнопка 7',
      description: 'Получить отчёт',
      toastMessage: 'Время ожидания истекло.',
      action: async () => {
        await axios.get(`/api/${sessionId}/error-detective/case7`, {
          timeout: 40000, // allow 40s so server 408 reaches client
        });
      },
    },
    {
      id: 8,
      label: 'Кнопка 8',
      description: 'Загрузить рекомендации',
      toastMessage: 'Сервис временно недоступен.',
      action: async () => {
        await axios.get(`/api/${sessionId}/error-detective/case8`);
      },
    },
  ];

  async function handleCase(c: CaseConfig) {
    try {
      await c.action();
      toast.success('Операция выполнена успешно!');
    } catch (_err) {
      toast.error(c.toastMessage);
    }
  }

  return (
    <div className="detective-page">
      <header className="detective-header">
        <button className="back-btn" style={{ margin: 0 }}
          onClick={() => navigate(`/testQasystem/${sessionId}/dashboard`)}>
          ← Назад
        </button>
        <div>
          <strong>Задание 5 — Детектив ошибок</strong>
        </div>
      </header>

      <div className="detective-content">
        <div className="detective-instructions card">
          <h2>🔍 Инструкция</h2>
          <p>
            Нажимайте на кнопки. При нажатии появится сообщение об ошибке.
            Откройте <strong>DevTools → Network</strong> (F12) и изучите каждый запрос.
          </p>
          <p>Для каждой кнопки определите:</p>
          <ol>
            <li>Какой HTTP-код ответа?</li>
            <li>Чья ошибка — <strong>Frontend</strong> или <strong>Backend</strong>?</li>
            <li>Какой разработчик должен исправить баг?</li>
          </ol>
          <p className="detective-note">
            💡 Подсказка: иногда запрос вообще не уходит на сервер — смотрите также вкладку <strong>Console</strong>.
          </p>
        </div>

        <div className="detective-grid">
          {cases.map((c) => (
            <div key={c.id} className="detective-card card">
              <div className="detective-card-header">
                <span className="detective-case-num">#{c.id}</span>
                <span className="detective-case-label">{c.label}</span>
              </div>
              <p className="detective-case-desc">{c.description}</p>
              <button className="btn-primary detective-btn" onClick={() => handleCase(c)}>
                {c.description}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
