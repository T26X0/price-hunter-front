# Price Hunter frontend

Отдельный React/TypeScript-клиент для текущего Spring Boot API.

## Требования и запуск

Нужен Node.js 20.19+ или 22.12+ и pnpm. Backend должен работать на `http://localhost:8080`.

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Откройте `http://localhost:5173`. Локальный Vite proxy передаёт запросы `/api` на backend, поэтому отдельная настройка CORS для разработки не нужна.

## Проверки

```bash
pnpm lint
pnpm test
pnpm build
```

## API

Поддерживаются текущие `GET /api/products` и `POST /api/products`. По умолчанию используется `/api`. Для раздельного размещения задайте `VITE_API_BASE_URL=https://api.example.com/api`; backend при этом должен разрешать origin фронтенда через CORS.
