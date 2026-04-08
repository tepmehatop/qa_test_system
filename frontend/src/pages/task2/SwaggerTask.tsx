import { useParams, useNavigate } from 'react-router-dom';

export default function SwaggerTask() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{
        background: 'white',
        borderBottom: '1px solid var(--color-border)',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexShrink: 0,
      }}>
        <button className="back-btn" style={{ margin: 0 }}
          onClick={() => navigate(`/testQasystem/${sessionId}/dashboard`)}>
          ← Назад
        </button>
        <div>
          <strong>Задание 2 — API тестирование</strong>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
            Используйте Swagger UI ниже для выполнения запросов
          </span>
        </div>
      </div>
      <iframe
        src="/api/swagger-mock/docs"
        style={{ flex: 1, border: 'none', width: '100%' }}
        title="Swagger UI"
      />
    </div>
  );
}
