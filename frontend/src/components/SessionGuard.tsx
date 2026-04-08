import { useEffect, useState } from 'react';
import { useParams, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SessionGuard() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      navigate('/invalid', { replace: true });
      return;
    }

    // Validate session with backend
    axios
      .get(`/api/${sessionId}/auth/ping`, { headers: { 'x-session-id': sessionId } })
      .then(() => setChecking(false))
      .catch((err) => {
        if (err.response?.status === 410) {
          navigate('/expired', { replace: true });
        } else {
          navigate('/invalid', { replace: true });
        }
      });
  }, [sessionId, navigate]);

  if (checking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p style={{ color: '#64748b' }}>Проверка сессии...</p>
      </div>
    );
  }

  return <Outlet />;
}
