"""Temporary catalog API used while the Spring Boot backend is being developed."""

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional
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


class ProductResponse(BaseModel):
    id: UUID
    name: str
    sku: str
    description: Optional[str]
    category: str
    brand: str
    createdAt: datetime


@dataclass(frozen=True)
class CatalogSeed:
    category: str
    brand: str
    model: str
    sku: str


app = FastAPI(
    title="TEMPORARY Price Hunter Catalog API",
    description="In-memory catalog for frontend development. Replace with Spring Boot later.",
    version="0.2.0-temporary",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
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


def product_from_seed(seed: CatalogSeed) -> ProductResponse:
    return ProductResponse(
        id=uuid5(NAMESPACE_URL, f"price-hunter:{seed.sku}"),
        name=f"{seed.brand} {seed.model}",
        sku=seed.sku,
        description=f"{seed.category} {seed.brand}. Демонстрационная запись каталога.",
        category=seed.category,
        brand=seed.brand,
        createdAt=now(),
    )


products: list[ProductResponse] = [product_from_seed(item) for item in CATALOG]


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
        createdAt=now(),
    )
    products.append(product)
    return product
