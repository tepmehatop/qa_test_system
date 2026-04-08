import { Routes, Route, Navigate } from 'react-router-dom';
import SessionGuard from './components/SessionGuard';
import AuthGuard from './components/AuthGuard';
import InvalidSession from './pages/InvalidSession';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ShopTask from './pages/task1/ShopTask';
import AboutPage from './pages/task1/AboutPage';
import ContactsPage from './pages/task1/ContactsPage';
import SwaggerTask from './pages/task2/SwaggerTask';
import SqlTask from './pages/task3/SqlTask';
import AiTask from './pages/task4/AiTask';
import ErrorDetectiveTask from './pages/task5/ErrorDetectiveTask';

export default function App() {
  return (
    <Routes>
      {/* Root and /testQasystem without sessionId — not accessible */}
      <Route path="/" element={<Navigate to="/invalid" replace />} />
      <Route path="/testQasystem" element={<Navigate to="/invalid" replace />} />
      <Route path="/testQasystem/" element={<Navigate to="/invalid" replace />} />
      <Route path="/invalid" element={<InvalidSession reason="no-session" />} />
      <Route path="/expired" element={<InvalidSession reason="expired" />} />

      {/* Session-scoped routes */}
      <Route path="/testQasystem/:sessionId/*" element={<SessionGuard />}>
        <Route index element={<Login />} />
        <Route path="login" element={<Login />} />
        <Route element={<AuthGuard />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="task1" element={<ShopTask />} />
          <Route path="task1/about" element={<AboutPage />} />
          <Route path="task1/contacts" element={<ContactsPage />} />
          <Route path="task2" element={<SwaggerTask />} />
          <Route path="task3" element={<SqlTask />} />
          <Route path="task4" element={<AiTask />} />
          <Route path="task5" element={<ErrorDetectiveTask />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/invalid" replace />} />
    </Routes>
  );
}
