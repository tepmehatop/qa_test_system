import { useParams, useNavigate } from 'react-router-dom';

export default function ContactsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <button className="back-btn" onClick={() => navigate(`/testQasystem/${sessionId}/task1`)}>
        ← Назад в магазин
      </button>
      <h1 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>Контакты</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#374151' }}>
        <p>📧 Email: <a href="mailto:support@techstore.ru">support@techstore.ru</a></p>
        <p>📞 Телефон: 8 (800) 555-35-35 (бесплатно)</p>
        <p>🕐 Режим работы: Пн–Пт 9:00–20:00, Сб–Вс 10:00–18:00</p>
        <p>📍 Адрес: г. Москва, ул. Технологическая, д. 15</p>
      </div>
    </div>
  );
}
