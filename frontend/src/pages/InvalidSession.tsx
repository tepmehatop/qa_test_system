interface Props {
  reason: 'no-session' | 'expired';
}

export default function InvalidSession({ reason }: Props) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '1rem',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{ fontSize: '3rem' }}>{reason === 'expired' ? '⏰' : '🔒'}</div>
      <h1 style={{ fontSize: '1.5rem', color: '#1e293b' }}>
        {reason === 'expired' ? 'Сессия истекла' : 'Доступ запрещён'}
      </h1>
      <p style={{ color: '#64748b', maxWidth: '360px' }}>
        {reason === 'expired'
          ? 'Время действия вашей ссылки истекло. Обратитесь к интервьюеру для получения новой ссылки.'
          : 'Эта страница недоступна. Используйте ссылку, полученную от интервьюера.'}
      </p>
    </div>
  );
}
