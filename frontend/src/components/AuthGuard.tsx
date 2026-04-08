import { useParams, Outlet, Navigate } from 'react-router-dom';

export default function AuthGuard() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const token = sessionStorage.getItem(`auth_token_${sessionId}`);

  if (!token) {
    return <Navigate to={`/testQasystem/${sessionId}/login`} replace />;
  }

  return <Outlet />;
}
