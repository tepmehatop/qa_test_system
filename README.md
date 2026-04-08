# QA Test System

Платформа для проведения технических заданий на собеседованиях QA-специалистов.

## Быстрый старт (dev)

```bash
docker compose up --build
```

Фронтенд: http://localhost:5173  
Бэкенд: http://localhost:3000

## Генерация ссылки для собеседования

```
GET http://localhost:3000/admin/<ADMIN_SECRET_KEY>/generate
```

Возвращает JSON с полем `link` — ссылку для кандидата (TTL 5 часов).

## Prod деплой

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

## Структура

```
qa_test_system/
├── backend/          # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── index.ts
│   │   ├── db/       # SQLite init + seed
│   │   ├── routes/   # admin, auth, shop, swagger, sql, ai, errorDetective
│   │   └── middleware/
│   └── .env          # секреты (не в репо)
├── frontend/         # React + TypeScript + Vite
│   └── src/
│       ├── pages/    # Login, Dashboard, task1–5
│       └── components/
├── docker-compose.yml       # dev
└── docker-compose.prod.yml  # prod
```

## Задания

| # | Название | Описание |
|---|----------|----------|
| 1 | Интернет-магазин | Каталог с намеренными багами |
| 2 | Swagger API | 10 эндпоинтов для тестирования |
| 3 | SQL Sandbox | Запросы к SQLite БД |
| 4 | AI Чат-бот | Чат с намеренными дефектами |
| 5 | Детектив ошибок | Анализ Network HTTP-ошибок |
