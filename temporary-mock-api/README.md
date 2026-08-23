# TEMPORARY — Price Hunter Mock API

This is a **temporary** Python server for frontend development. It imitates the Price Hunter API while the Java backend evolves.

Do not add production logic here. The production API remains the Spring Boot service.

## Start

From this folder:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API is available at `http://localhost:8000`.

## Endpoints

- `GET /api/products` — demo products
- `POST /api/products` — add an in-memory product
- `GET /health` — server health check
- `GET /docs` — interactive API documentation

Edit `app/main.py`, specifically the `products` list, to change the demo JSON returned to the frontend.
