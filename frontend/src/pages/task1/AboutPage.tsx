import { useParams, useNavigate } from 'react-router-dom';

export default function AboutPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <button className="back-btn" onClick={() => navigate(`/testQasystem/${sessionId}/task1`)}>
        ← Назад в магазин
      </button>
      <h1 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>О компании TechStore</h1>
      <p style={{ color: '#64748b', lineHeight: 1.8, marginBottom: '1rem' }}>
        TechStore — ведущий интернет-магазин электроники и аксессуаров. Мы работаем с 2010 года и предлагаем широкий выбор товаров от ведущих мировых производителей.
      </p>
      <p style={{ color: '#64748b', lineHeight: 1.8 }}>
        Наш ассортимент включает более 10 000 наименований товаров. Доставка по всей России.
      </p>
    </div>
  );
}
