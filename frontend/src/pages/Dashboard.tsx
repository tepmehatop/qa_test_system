import { useParams, useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

const TASKS = [
  {
    id: 1,
    path: 'task1',
    icon: '🛒',
    title: 'Задание 1',
    subtitle: 'Интернет-магазин',
    description: 'Протестируйте функциональность интернет-магазина: каталог товаров, корзину и оформление заказа.',
    color: '#4f46e5',
  },
  {
    id: 2,
    path: 'task2',
    icon: '📋',
    title: 'Задание 2',
    subtitle: 'API тестирование (Swagger)',
    description: 'Используйте Swagger UI для тестирования REST API: GET, POST, PUT, DELETE запросы.',
    color: '#0891b2',
  },
  {
    id: 3,
    path: 'task3',
    icon: '🗄️',
    title: 'Задание 3',
    subtitle: 'SQL песочница',
    description: 'Напишите SQL-запросы к тестовой базе данных с таблицами клиентов, товаров и заказов.',
    color: '#059669',
  },
  {
    id: 4,
    path: 'task4',
    icon: '🤖',
    title: 'Задание 4',
    subtitle: 'AI чат-бот',
    description: 'Протестируйте AI-ассистента: найдите и задокументируйте дефекты в его поведении.',
    color: '#7c3aed',
  },
  {
    id: 5,
    path: 'task5',
    icon: '🔍',
    title: 'Задание 5',
    subtitle: 'Детектив ошибок',
    description: 'Нажимайте кнопки, изучайте Network DevTools и определяйте: какой код ошибки, чья проблема — фронт или бэк.',
    color: '#dc2626',
  },
];

export default function Dashboard() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  function handleLogout() {
    sessionStorage.removeItem(`auth_token_${sessionId}`);
    navigate(`/testQasystem/${sessionId}/login`, { replace: true });
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <div className="dashboard-brand">
            <span className="dashboard-logo">QA</span>
            <div>
              <h1>Тестовая платформа</h1>
              <p>Выберите задание для выполнения</p>
            </div>
          </div>
          <button className="btn-secondary" onClick={handleLogout}>Выйти</button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="tasks-grid">
          {TASKS.map((task) => (
            <button
              key={task.id}
              className="task-card"
              onClick={() => navigate(`/testQasystem/${sessionId}/${task.path}`)}
              style={{ '--task-color': task.color } as React.CSSProperties}
            >
              <div className="task-icon">{task.icon}</div>
              <div className="task-content">
                <div className="task-title">{task.title}</div>
                <div className="task-subtitle">{task.subtitle}</div>
                <div className="task-description">{task.description}</div>
              </div>
              <div className="task-arrow">→</div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
