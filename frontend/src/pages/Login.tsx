import { useState, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/login.css';

interface FieldErrors {
  username?: string;
  password?: string;
  general?: string;
}

export default function Login() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  function validate(): FieldErrors {
    const errs: FieldErrors = {};

    if (!username && !password) {
      errs.general = 'Пожалуйста, заполните обязательные поля';
      return errs;
    }
    if (!username || username.trim() === '') {
      errs.username = 'Поле логина обязательно для заполнения';
    }
    if (!password || password.trim() === '') {
      errs.password = 'Поле пароля обязательно для заполнения';
    }
    if (username && username.length > 50) {
      errs.username = 'Максимальная длина — 50 символов';
    }
    if (password && password.length > 50) {
      errs.password = 'Максимальная длина — 50 символов';
    }
    return errs;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      // Note: frontend does NOT trim username/password — sending as-is
      // This is intentional: "test777 " (with trailing space) will fail
      const { data } = await axios.post(`/api/${sessionId}/auth/login`, {
        username,
        password,
      });
      sessionStorage.setItem(`auth_token_${sessionId}`, data.token);
      navigate(`/testQasystem/${sessionId}/dashboard`);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const { error, message } = err.response.data as { error: string; message: string };
        if (error === 'EMPTY_FIELDS' || error === 'EMPTY_USERNAME' || error === 'EMPTY_PASSWORD') {
          setErrors({ general: message });
        } else if (error === 'TOO_LONG') {
          setErrors({ general: message });
        } else {
          setErrors({ general: message || 'Проверьте логин и пароль' });
        }
      } else {
        setErrors({ general: 'Ошибка подключения. Попробуйте позже.' });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">QA</div>
          <h1>Вход в систему</h1>
          <p>Тестовая платформа для собеседований</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {errors.general && (
            <div className="alert alert-error">{errors.general}</div>
          )}

          <div className="form-group">
            <label htmlFor="username">
              Логин <span className="required">*</span>
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={errors.username ? 'error' : ''}
              placeholder="Введите логин"
              autoComplete="username"
              maxLength={100}
            />
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Пароль <span className="required">*</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? 'error' : ''}
              placeholder="Введите пароль"
              autoComplete="current-password"
              maxLength={100}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Выполняется вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}
