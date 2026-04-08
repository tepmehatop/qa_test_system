import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './sql.css';

interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
}

export default function SqlTask() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    axios.get(`/api/${sessionId}/sql/tables`).then((r) => setTables(r.data));
  }, [sessionId]);

  async function handleExecute() {
    if (!query.trim()) {
      setError('Введите SQL-запрос');
      return;
    }
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const { data } = await axios.post(`/api/${sessionId}/sql/execute`, { query });
      setResult(data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || 'Ошибка выполнения запроса');
      } else {
        setError('Ошибка подключения');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleExecute();
    }
  }

  return (
    <div className="sql-page">
      <div className="sql-layout">
        {/* Sidebar */}
        <aside className="sql-sidebar">
          <button className="back-btn" onClick={() => navigate(`/testQasystem/${sessionId}/dashboard`)}>
            ← Назад
          </button>
          <h2>Задание 3</h2>
          <p className="sql-sidebar-desc">SQL Песочница</p>

          <div className="sql-tables">
            <h3>Таблицы базы данных</h3>
            {tables.map((t) => (
              <div key={t} className="sql-table-name">📋 {t}</div>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="sql-main">
          <div className="sql-editor-wrap">
            <div className="sql-editor-header">
              <span>SQL Editor</span>
              <span className="sql-hint">Ctrl+Enter для выполнения</span>
            </div>
            <textarea
              className="sql-editor"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Введите SQL-запрос здесь..."
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
            <div className="sql-editor-footer">
              <button className="btn-primary" onClick={handleExecute} disabled={loading}>
                {loading ? 'Выполняется...' : '▶ Выполнить'}
              </button>
              <button className="btn-secondary" onClick={() => { setQuery(''); setResult(null); setError(''); }}>
                Очистить
              </button>
            </div>
          </div>

          {error && (
            <div className="sql-error">
              <strong>Ошибка:</strong> {error}
            </div>
          )}

          {result && (
            <div className="sql-results">
              <div className="sql-results-header">
                Результат: <strong>{result.rowCount}</strong> строк
              </div>
              {result.columns.length > 0 ? (
                <div className="sql-table-wrap">
                  <table className="sql-table">
                    <thead>
                      <tr>
                        {result.columns.map((col) => <th key={col}>{col}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row, i) => (
                        <tr key={i}>
                          {result.columns.map((col) => (
                            <td key={col}>{String(row[col] ?? '')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="sql-no-data">Запрос выполнен, данных нет.</p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
