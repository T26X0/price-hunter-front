"""Temporary catalog API used while the Spring Boot backend is being developed."""

from dataclasses import dataclass
from datetime import datetime, timezone
import re
from typing import Optional
from urllib.parse import quote_plus
from uuid import NAMESPACE_URL, UUID, uuid4, uuid5

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


class ProductRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    sku: str = Field(min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=2000)
    category: Optional[str] = Field(default=None, max_length=100)
    brand: Optional[str] = Field(default=None, max_length=100)


class ProductSpecification(BaseModel):
    label: str
    value: str


class ProductResponse(BaseModel):
    id: UUID
    name: str
    sku: str
    description: Optional[str]
    category: str
    brand: str
    specifications: list[ProductSpecification]
    createdAt: datetime


class OfferResponse(BaseModel):
    id: UUID
    sku: str
    name: str
    brand: str
    category: str
    variant: str
    store: str
    rating: float
    reviews: int
    price: int
    url: str


@dataclass(frozen=True)
class CatalogSeed:
    category: str
    brand: str
    model: str
    sku: str


@dataclass(frozen=True)
class OfferSeed:
    sku: str
    store: str
    rating: float
    reviews: int
    price: int
    variant: str = "Базовая комплектация"


app = FastAPI(
    title="TEMPORARY Price Hunter Catalog API",
    description="In-memory catalog for frontend development. Replace with Spring Boot later.",
    version="0.2.0-temporary",
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1):\d+$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def now() -> datetime:
    return datetime.now(timezone.utc)


def catalog_item(category: str, brand: str, model: str, sku: str) -> CatalogSeed:
    return CatalogSeed(category=category, brand=brand, model=model, sku=sku)


# This is deliberately a curated development catalog, not a claim of a complete
# global product database. It gives the frontend realistic categories, brands and
# models to work with until the production service receives an import pipeline.
CATALOG: list[CatalogSeed] = [
    # Smartphones
    catalog_item("Смартфоны", "Apple", "iPhone 16", "APPLE-IPHONE-16"),
    catalog_item("Смартфоны", "Apple", "iPhone 16 Pro", "APPLE-IPHONE-16-PRO"),
    catalog_item("Смартфоны", "Samsung", "Galaxy S24", "SAMSUNG-GALAXY-S24"),
    catalog_item("Смартфоны", "Samsung", "Galaxy S24 Ultra", "SAMSUNG-GALAXY-S24-ULTRA"),
    catalog_item("Смартфоны", "Samsung", "Galaxy A55", "SAMSUNG-GALAXY-A55"),
    catalog_item("Смартфоны", "Google", "Pixel 9", "GOOGLE-PIXEL-9"),
    catalog_item("Смартфоны", "Google", "Pixel 9 Pro", "GOOGLE-PIXEL-9-PRO"),
    catalog_item("Смартфоны", "Xiaomi", "14", "XIAOMI-14"),
    catalog_item("Смартфоны", "Xiaomi", "14 Ultra", "XIAOMI-14-ULTRA"),
    catalog_item("Смартфоны", "Redmi", "Note 13 Pro", "REDMI-NOTE-13-PRO"),
    catalog_item("Смартфоны", "POCO", "F6", "POCO-F6"),
    catalog_item("Смартфоны", "OnePlus", "12", "ONEPLUS-12"),
    catalog_item("Смартфоны", "OPPO", "Find X8 Pro", "OPPO-FIND-X8-PRO"),
    catalog_item("Смартфоны", "vivo", "X100 Pro", "VIVO-X100-PRO"),
    catalog_item("Смартфоны", "realme", "GT 6", "REALME-GT-6"),
    catalog_item("Смартфоны", "HONOR", "Magic6 Pro", "HONOR-MAGIC6-PRO"),
    catalog_item("Смартфоны", "HUAWEI", "Pura 70", "HUAWEI-PURA-70"),
    catalog_item("Смартфоны", "Motorola", "Edge 50 Pro", "MOTOROLA-EDGE-50-PRO"),
    catalog_item("Смартфоны", "Nothing", "Phone (2)", "NOTHING-PHONE-2"),
    catalog_item("Смартфоны", "Sony", "Xperia 1 VI", "SONY-XPERIA-1-VI"),
    catalog_item("Смартфоны", "ASUS", "ROG Phone 8", "ASUS-ROG-PHONE-8"),
    catalog_item("Смартфоны", "TECNO", "Camon 30 Pro", "TECNO-CAMON-30-PRO"),
    catalog_item("Смартфоны", "Infinix", "GT 20 Pro", "INFINIX-GT-20-PRO"),
    catalog_item("Смартфоны", "Nokia", "G42", "NOKIA-G42"),

    # Laptops
    catalog_item("Ноутбуки", "Apple", "MacBook Air 13 M3", "APPLE-MACBOOK-AIR-13-M3"),
    catalog_item("Ноутбуки", "Apple", "MacBook Pro 14 M3 Pro", "APPLE-MACBOOK-PRO-14-M3-PRO"),
    catalog_item("Ноутбуки", "Lenovo", "ThinkPad X1 Carbon Gen 12", "LENOVO-THINKPAD-X1-CARBON-G12"),
    catalog_item("Ноутбуки", "Lenovo", "Yoga Pro 9i", "LENOVO-YOGA-PRO-9I"),
    catalog_item("Ноутбуки", "Lenovo", "Legion Pro 7i", "LENOVO-LEGION-PRO-7I"),
    catalog_item("Ноутбуки", "ASUS", "Zenbook 14 OLED", "ASUS-ZENBOOK-14-OLED"),
    catalog_item("Ноутбуки", "ASUS", "ROG Zephyrus G14", "ASUS-ROG-ZEPHYRUS-G14"),
    catalog_item("Ноутбуки", "Acer", "Swift Go 14", "ACER-SWIFT-GO-14"),
    catalog_item("Ноутбуки", "Acer", "Predator Helios 16", "ACER-PREDATOR-HELIOS-16"),
    catalog_item("Ноутбуки", "Dell", "XPS 13", "DELL-XPS-13"),
    catalog_item("Ноутбуки", "Dell", "Alienware m16 R2", "DELL-ALIENWARE-M16-R2"),
    catalog_item("Ноутбуки", "HP", "Spectre x360 14", "HP-SPECTRE-X360-14"),
    catalog_item("Ноутбуки", "HP", "OMEN Transcend 14", "HP-OMEN-TRANSCEND-14"),
    catalog_item("Ноутбуки", "MSI", "Stealth 14 AI Studio", "MSI-STEALTH-14-AI-STUDIO"),
    catalog_item("Ноутбуки", "MSI", "Katana 15", "MSI-KATANA-15"),
    catalog_item("Ноутбуки", "Razer", "Blade 14", "RAZER-BLADE-14"),
    catalog_item("Ноутбуки", "Microsoft", "Surface Laptop 7", "MICROSOFT-SURFACE-LAPTOP-7"),
    catalog_item("Ноутбуки", "HUAWEI", "MateBook X Pro", "HUAWEI-MATEBOOK-X-PRO"),
    catalog_item("Ноутбуки", "Samsung", "Galaxy Book4 Pro", "SAMSUNG-GALAXY-BOOK4-PRO"),
    catalog_item("Ноутбуки", "LG", "gram 16", "LG-GRAM-16"),
    catalog_item("Ноутбуки", "GIGABYTE", "AORUS 16X", "GIGABYTE-AORUS-16X"),
    catalog_item("Ноутбуки", "Framework", "Laptop 13", "FRAMEWORK-LAPTOP-13"),

    # TVs
    catalog_item("Телевизоры", "Samsung", "Neo QLED QN90D", "SAMSUNG-QN90D"),
    catalog_item("Телевизоры", "Samsung", "OLED S90D", "SAMSUNG-S90D"),
    catalog_item("Телевизоры", "Samsung", "Crystal UHD DU8000", "SAMSUNG-DU8000"),
    catalog_item("Телевизоры", "LG", "OLED C4", "LG-OLED-C4"),
    catalog_item("Телевизоры", "LG", "OLED G4", "LG-OLED-G4"),
    catalog_item("Телевизоры", "LG", "QNED86", "LG-QNED86"),
    catalog_item("Телевизоры", "Sony", "BRAVIA 7", "SONY-BRAVIA-7"),
    catalog_item("Телевизоры", "Sony", "BRAVIA 9", "SONY-BRAVIA-9"),
    catalog_item("Телевизоры", "Philips", "OLED809 Ambilight", "PHILIPS-OLED809"),
    catalog_item("Телевизоры", "Philips", "The One PUS8909", "PHILIPS-PUS8909"),
    catalog_item("Телевизоры", "TCL", "C755 Mini LED", "TCL-C755"),
    catalog_item("Телевизоры", "TCL", "C845 Mini LED", "TCL-C845"),
    catalog_item("Телевизоры", "Hisense", "U7N Mini LED", "HISENSE-U7N"),
    catalog_item("Телевизоры", "Hisense", "U8N Mini LED", "HISENSE-U8N"),
    catalog_item("Телевизоры", "Xiaomi", "TV A Pro 55", "XIAOMI-TV-A-PRO-55"),
    catalog_item("Телевизоры", "Xiaomi", "TV S Mini LED 65", "XIAOMI-TV-S-MINI-LED-65"),
    catalog_item("Телевизоры", "Panasonic", "Z95A OLED", "PANASONIC-Z95A"),
    catalog_item("Телевизоры", "Sharp", "AQUOS XLED", "SHARP-AQUOS-XLED"),
    catalog_item("Телевизоры", "Haier", "S800QT", "HAIER-S800QT"),
    catalog_item("Телевизоры", "Toshiba", "Z870", "TOSHIBA-Z870"),

    # Consoles and gaming handhelds
    catalog_item("Игровые консоли", "Sony", "PlayStation 5 Slim", "SONY-PS5-SLIM"),
    catalog_item("Игровые консоли", "Sony", "PlayStation 5 Digital Edition", "SONY-PS5-DIGITAL"),
    catalog_item("Игровые консоли", "Sony", "PlayStation 5 Pro", "SONY-PS5-PRO"),
    catalog_item("Игровые консоли", "Microsoft", "Xbox Series X", "MICROSOFT-XBOX-SERIES-X"),
    catalog_item("Игровые консоли", "Microsoft", "Xbox Series S", "MICROSOFT-XBOX-SERIES-S"),
    catalog_item("Игровые консоли", "Nintendo", "Switch OLED", "NINTENDO-SWITCH-OLED"),
    catalog_item("Игровые консоли", "Nintendo", "Switch Lite", "NINTENDO-SWITCH-LITE"),
    catalog_item("Игровые консоли", "Nintendo", "Switch 2", "NINTENDO-SWITCH-2"),
    catalog_item("Игровые консоли", "Valve", "Steam Deck OLED", "VALVE-STEAM-DECK-OLED"),
    catalog_item("Игровые консоли", "ASUS", "ROG Ally X", "ASUS-ROG-ALLY-X"),
    catalog_item("Игровые консоли", "Lenovo", "Legion Go", "LENOVO-LEGION-GO"),
    catalog_item("Игровые консоли", "MSI", "Claw A1M", "MSI-CLAW-A1M"),
    catalog_item("Игровые консоли", "AYANEO", "Kun", "AYANEO-KUN"),
    catalog_item("Игровые консоли", "Logitech", "G Cloud", "LOGITECH-G-CLOUD"),
]


PRODUCT_SPECIFICATIONS: dict[str, list[tuple[str, str]]] = {
    "SAMSUNG-GALAXY-S24": [("Экран", "6.2″ Dynamic AMOLED 2X"), ("Память", "8 ГБ / 128 ГБ"), ("Камера", "50 Мп"), ("Связь", "5G")],
    "SAMSUNG-GALAXY-S24-ULTRA": [("Экран", "6.8″ Dynamic AMOLED 2X"), ("Память", "12 ГБ / 256 ГБ"), ("Камера", "200 Мп"), ("Связь", "5G"), ("Стилус", "S Pen")],
    "XIAOMI-14": [("Экран", "6.36″ AMOLED"), ("Процессор", "Snapdragon 8 Gen 3"), ("Память", "12 ГБ / 256 ГБ"), ("Камера", "Leica 50 Мп")],
    "APPLE-MACBOOK-AIR-13-M3": [("Экран", "13.6″ Liquid Retina"), ("Чип", "Apple M3"), ("Память", "8 ГБ / 256 ГБ"), ("Вес", "1.24 кг")],
    "ASUS-ROG-ZEPHYRUS-G14": [("Экран", "14″ OLED, 120 Гц"), ("Процессор", "AMD Ryzen 9"), ("Графика", "NVIDIA GeForce RTX"), ("Память", "16 ГБ")],
    "SONY-PS5-SLIM": [("Накопитель", "1 ТБ SSD"), ("Разрешение", "4K"), ("Частота", "до 120 Гц"), ("Привод", "Blu-ray")],
    "LG-OLED-C4": [("Диагональ", "65″"), ("Матрица", "OLED evo"), ("Разрешение", "4K"), ("Частота", "до 144 Гц")],
}


def specifications_for_seed(seed: CatalogSeed) -> list[ProductSpecification]:
    values = PRODUCT_SPECIFICATIONS.get(seed.sku) or [
        ("Категория", seed.category),
        ("Бренд", seed.brand),
        ("Артикул", seed.sku),
    ]
    return [ProductSpecification(label=label, value=value) for label, value in values]


def product_from_seed(seed: CatalogSeed) -> ProductResponse:
    return ProductResponse(
        id=uuid5(NAMESPACE_URL, f"price-hunter:{seed.sku}"),
        name=f"{seed.brand} {seed.model}",
        sku=seed.sku,
        description=f"{seed.category} {seed.brand}. Демонстрационная запись каталога.",
        category=seed.category,
        brand=seed.brand,
        specifications=specifications_for_seed(seed),
        createdAt=now(),
    )


products: list[ProductResponse] = [product_from_seed(item) for item in CATALOG]
products_by_sku = {product.sku: product for product in products}

OFFER_CATALOG: list[OfferSeed] = [
    OfferSeed("SAMSUNG-GALAXY-S24", "М.Видео", 4.8, 112_342, 64_990, "8 ГБ / 128 ГБ · Onyx Black"),
    OfferSeed("SAMSUNG-GALAXY-S24", "Ситилинк", 4.7, 84_719, 65_490, "8 ГБ / 128 ГБ · Onyx Black"),
    OfferSeed("SAMSUNG-GALAXY-S24", "Ozon", 4.6, 98_765, 66_990, "8 ГБ / 256 ГБ · Marble Gray"),
    OfferSeed("SAMSUNG-GALAXY-S24", "Яндекс Маркет", 4.9, 76_401, 67_990, "8 ГБ / 256 ГБ · Amber Yellow"),
    OfferSeed("SAMSUNG-GALAXY-S24-ULTRA", "Яндекс Маркет", 4.9, 76_401, 94_990, "12 ГБ / 256 ГБ · Titanium Gray"),
    OfferSeed("XIAOMI-14", "DNS", 4.7, 91_238, 68_990),
    OfferSeed("XIAOMI-14", "Ozon", 4.6, 98_765, 69_490),
    OfferSeed("APPLE-MACBOOK-AIR-13-M3", "restore:", 4.8, 17_942, 119_990),
    OfferSeed("APPLE-MACBOOK-AIR-13-M3", "DNS", 4.7, 91_238, 121_490),
    OfferSeed("ASUS-ROG-ZEPHYRUS-G14", "Ситилинк", 4.7, 84_719, 159_990),
    OfferSeed("SONY-PS5-SLIM", "М.Видео", 4.8, 112_342, 54_990),
    OfferSeed("SONY-PS5-SLIM", "Ozon", 4.6, 98_765, 56_490),
    OfferSeed("LG-OLED-C4", "Эльдорадо", 4.7, 64_325, 109_990),
]

STORE_SEARCH_URLS = {
    "М.Видео": "https://www.mvideo.ru/product-list-page?q=",
    "Ситилинк": "https://www.citilink.ru/search/?text=",
    "Ozon": "https://www.ozon.ru/search/?text=",
    "Яндекс Маркет": "https://market.yandex.ru/search?text=",
    "DNS": "https://www.dns-shop.ru/search/?q=",
    "restore:": "https://re-store.ru/search/?q=",
    "Эльдорадо": "https://www.eldorado.ru/search/catalog.php?q=",
}


def offer_url(store: str, product_name: str) -> str:
    return f"{STORE_SEARCH_URLS.get(store, 'https://www.google.com/search?q=')}{quote_plus(product_name)}"


def offer_from_seed(seed: OfferSeed) -> OfferResponse:
    product = products_by_sku[seed.sku]
    return OfferResponse(
        id=uuid5(NAMESPACE_URL, f"price-hunter:offer:{seed.sku}:{seed.store}"),
        sku=product.sku,
        name=product.name,
        brand=product.brand,
        category=product.category,
        variant=seed.variant,
        store=seed.store,
        rating=seed.rating,
        reviews=seed.reviews,
        price=seed.price,
        url=offer_url(seed.store, product.name),
    )


STORE_RATINGS = {
    "М.Видео": (4.8, 112_342),
    "Ситилинк": (4.7, 84_719),
    "Ozon": (4.6, 98_765),
    "Яндекс Маркет": (4.9, 76_401),
    "DNS": (4.7, 91_238),
    "restore:": (4.8, 17_942),
    "Эльдорадо": (4.7, 64_325),
}

STORES_BY_CATEGORY = {
    "Смартфоны": ["М.Видео", "Ситилинк", "Ozon", "Яндекс Маркет"],
    "Ноутбуки": ["Ситилинк", "DNS", "Ozon"],
    "Телевизоры": ["М.Видео", "Эльдорадо", "Яндекс Маркет"],
    "Игровые консоли": ["М.Видео", "Ozon", "DNS"],
}

STORE_PRICE_OFFSETS = {
    "М.Видео": 0,
    "Ситилинк": 500,
    "Ozon": 1_000,
    "Яндекс Маркет": 1_500,
    "DNS": 700,
    "restore:": 0,
    "Эльдорадо": 900,
}


def estimated_price(product: ProductResponse) -> int:
    base_prices = {
        "Смартфоны": 69_990,
        "Ноутбуки": 119_990,
        "Телевизоры": 99_990,
        "Игровые консоли": 54_990,
    }
    base_price = base_prices.get(product.category, 49_990)
    name = product.name.casefold()
    if "ultra" in name or "pro" in name:
        base_price += 25_000
    return base_price + (sum(map(ord, product.sku)) % 10) * 1_000


def product_variant(product: ProductResponse) -> str:
    memory = next((specification.value for specification in product.specifications if specification.label == "Память"), None)
    return memory or "Базовая комплектация"


def generated_offer(product: ProductResponse, store: str, base_price: int) -> OfferResponse:
    rating, reviews = STORE_RATINGS[store]
    return OfferResponse(
        id=uuid5(NAMESPACE_URL, f"price-hunter:generated-offer:{product.sku}:{store}"),
        sku=product.sku,
        name=product.name,
        brand=product.brand,
        category=product.category,
        variant=product_variant(product),
        store=store,
        rating=rating,
        reviews=reviews,
        price=base_price + STORE_PRICE_OFFSETS[store],
        url=offer_url(store, product.name),
    )


# A model can have a few hand-tuned offers above. For all other catalog items we
# create the same representative set of store offers, so every catalog card
# leads to a useful product page during frontend development.
offers: list[OfferResponse] = [offer_from_seed(item) for item in OFFER_CATALOG]
for product in products:
    product_offers = [offer for offer in offers if offer.sku == product.sku]
    existing_stores = {offer.store for offer in product_offers}
    base_price = min((offer.price for offer in product_offers), default=estimated_price(product))
    for store in STORES_BY_CATEGORY.get(product.category, ["Ozon", "Яндекс Маркет"]):
        if store not in existing_stores:
            offers.append(generated_offer(product, store, base_price))


CITY_PRICE_ADJUSTMENTS = {
    "москва": 1_600,
    "санкт петербург": 1_000,
    "екатеринбург": -500,
    "казань": -700,
    "новосибирск": 800,
    "краснодар": -300,
}


def city_price_adjustment(city: str, store: str) -> int:
    normalized_city = re.sub(r"[^\w]+", " ", city.casefold()).strip()
    city_adjustment = CITY_PRICE_ADJUSTMENTS.get(normalized_city, 0)
    # Different logistics and local promos mean stores do not all move by the
    # same amount. The deterministic adjustment keeps the temporary API stable.
    store_adjustment = ((sum(map(ord, normalized_city + store.casefold())) % 7) - 3) * 150
    return city_adjustment + store_adjustment


def regional_offer(offer: OfferResponse, city: str) -> OfferResponse:
    city_name = city.strip()
    if not city_name:
        return offer
    return OfferResponse(
        id=offer.id,
        sku=offer.sku,
        name=offer.name,
        brand=offer.brand,
        category=offer.category,
        variant=offer.variant,
        store=offer.store,
        rating=offer.rating,
        reviews=offer.reviews,
        price=max(1_000, offer.price + city_price_adjustment(city_name, offer.store)),
        url=offer.url,
    )
VARIANT_TOKENS = {"plus", "ultra", "fe", "pro", "max"}


def search_tokens(value: str) -> list[str]:
    normalized = re.sub(r"[^\w]+", " ", value.casefold().replace("+", " plus "))
    return [token for token in normalized.split() if token]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "mode": "temporary-catalog", "products": str(len(products))}


@app.get("/api/catalog-meta")
def catalog_meta() -> dict[str, object]:
    return {
        "categories": sorted({product.category for product in products}),
        "brands": sorted({product.brand for product in products}),
        "productCount": len(products),
    }


@app.get("/api/products", response_model=list[ProductResponse])
def find_all_products(
    q: Optional[str] = None,
    category: Optional[str] = None,
    brand: Optional[str] = None,
) -> list[ProductResponse]:
    query = q.strip().casefold() if q else ""
    selected_category = category.strip().casefold() if category else ""
    selected_brand = brand.strip().casefold() if brand else ""

    def matches(product: ProductResponse) -> bool:
        searchable = " ".join(
            [product.name, product.sku, product.category, product.brand, product.description or ""]
        ).casefold()
        return (
            (not query or query in searchable)
            and (not selected_category or product.category.casefold() == selected_category)
            and (not selected_brand or product.brand.casefold() == selected_brand)
        )

    return sorted((product for product in products if matches(product)), key=lambda product: product.name.casefold())


@app.get("/api/offers", response_model=list[OfferResponse])
def find_offers(q: Optional[str] = None, sku: Optional[str] = None, city: Optional[str] = None) -> list[OfferResponse]:
    query_tokens = search_tokens(q or "")
    requested_variants = VARIANT_TOKENS.intersection(query_tokens)
    selected_sku = sku.strip().upper() if sku else ""

    def matches(offer: OfferResponse) -> bool:
        offer_tokens = set(search_tokens(f"{offer.name} {offer.brand} {offer.category}"))
        offer_variants = VARIANT_TOKENS.intersection(offer_tokens)
        return (
            all(token in offer_tokens for token in query_tokens)
            and (not selected_sku or offer.sku == selected_sku)
            # A product page requests offers by an exact SKU. In that case a
            # model modifier such as Pro or Ultra must not hide its own offers.
            and (not offer_variants or bool(requested_variants) or bool(selected_sku))
        )

    return sorted((regional_offer(offer, city or "") for offer in offers if matches(offer)), key=lambda offer: offer.price)


@app.get("/api/products/{sku}", response_model=ProductResponse)
def find_product(sku: str) -> ProductResponse:
    product = products_by_sku.get(sku.strip().upper())
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    return product


@app.post(
    "/api/products",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_product(request: ProductRequest) -> ProductResponse:
    normalized_sku = request.sku.strip().upper()
    if any(product.sku == normalized_sku for product in products):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Product with SKU '{normalized_sku}' already exists.",
        )

    product = ProductResponse(
        id=uuid4(),
        name=request.name.strip(),
        sku=normalized_sku,
        description=request.description.strip() if request.description else None,
        category=request.category.strip() if request.category else "Другое",
        brand=request.brand.strip() if request.brand else "Без бренда",
        specifications=[],
        createdAt=now(),
    )
    products.append(product)
    products_by_sku[product.sku] = product
    return product
