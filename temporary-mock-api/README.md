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

- `GET /api/products` — каталог товаров с фильтрами `q`, `category`, `brand`
- `GET /api/products/{sku}` — карточка товара с характеристиками
- `GET /api/offers?q=...&city=...` — предложения магазинов для поисковой выдачи; понимает русские названия популярных брендов и моделей, параметр `city` меняет региональные цены в демонстрационных данных
- `GET /api/offers?sku=...&city=...` — все предложения для выбранного товара с учётом города
- `GET /api/price-history?sku=...&city=...` — история минимальной цены за 30 дней с учётом города
- `POST /api/products` — add an in-memory product
- `GET /health` — server health check
- `GET /docs` — interactive API documentation

Edit `app/main.py`, specifically `CATALOG` and `OFFER_CATALOG`, to change the development data returned to the frontend.
