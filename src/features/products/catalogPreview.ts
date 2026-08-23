import type { Product } from '../../api/types'

const createdAt = '2026-08-24T00:00:00.000Z'

export const catalogPreview: Product[] = [
  ['s24-ultra', 'Samsung Galaxy S24 Ultra', 'SAMSUNG-S24-ULTRA', 'Смартфоны', 'Samsung'],
  ['xiaomi-14', 'Xiaomi 14', 'XIAOMI-14', 'Смартфоны', 'Xiaomi'],
  ['macbook-air', 'MacBook Air M3', 'APPLE-MACBOOK-AIR-M3', 'Ноутбуки', 'Apple'],
  ['rog-g14', 'ASUS ROG Zephyrus G14', 'ASUS-ROG-G14', 'Ноутбуки', 'ASUS'],
  ['oled-c4', 'LG OLED C4', 'LG-OLED-C4', 'Телевизоры', 'LG'],
  ['ps5', 'Sony PlayStation 5', 'SONY-PS5', 'Игровые консоли', 'Sony'],
  ['pixel-9', 'Google Pixel 9 Pro', 'GOOGLE-PIXEL-9-PRO', 'Смартфоны', 'Google'],
  ['switch-oled', 'Nintendo Switch OLED', 'NINTENDO-SWITCH-OLED', 'Игровые консоли', 'Nintendo'],
].map(([id, name, sku, category, brand]) => ({
  id,
  name,
  sku,
  category,
  brand,
  description: `Популярная модель ${brand} для сравнения цен в магазинах.`,
  createdAt,
}))
