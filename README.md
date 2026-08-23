# Price Hunter frontend

Отдельный React/TypeScript-клиент для Price Hunter.

## Требования и запуск

Нужен Node.js 20.19+ или 22.12+ и pnpm. По умолчанию фронтенд использует временный Python mock API на `http://localhost:8000`.

```bash
pnpm install
pnpm dev
```

Перед запуском фронтенда в отдельном терминале запустите mock API по инструкции в [`temporary-mock-api/README.md`](temporary-mock-api/README.md).

Откройте `http://localhost:5173`.

## Проверки

```bash
pnpm lint
pnpm test
pnpm build
```

## API

Поддерживаются `GET /api/products` и `POST /api/products`. По умолчанию используется временный mock API.

Когда Spring Boot backend будет готов, создайте `.env` и укажите:

```text
VITE_API_BASE_URL=http://localhost:8080/api
```

Для удалённого backend используйте его HTTPS-адрес и настройте CORS на стороне Java-сервиса.
