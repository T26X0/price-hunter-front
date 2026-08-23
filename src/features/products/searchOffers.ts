export interface SearchOffer {
  id: string
  name: string
  brand: string
  category: string
  store: string
  rating: number
  price: number
}

export const searchOffers: SearchOffer[] = [
  { id: 's24', name: 'Samsung Galaxy S24', brand: 'Samsung', category: 'Смартфоны', store: 'М.Видео', rating: 4.8, price: 64_990 },
  { id: 's24-citilink', name: 'Samsung Galaxy S24', brand: 'Samsung', category: 'Смартфоны', store: 'Ситилинк', rating: 4.7, price: 65_490 },
  { id: 's24-ozon', name: 'Samsung Galaxy S24', brand: 'Samsung', category: 'Смартфоны', store: 'Ozon', rating: 4.6, price: 66_990 },
  { id: 's24-market', name: 'Samsung Galaxy S24', brand: 'Samsung', category: 'Смартфоны', store: 'Яндекс Маркет', rating: 4.9, price: 67_990 },
  { id: 's24-plus', name: 'Samsung Galaxy S24+', brand: 'Samsung', category: 'Смартфоны', store: 'Ситилинк', rating: 4.7, price: 72_490 },
  { id: 's24-ultra', name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', category: 'Смартфоны', store: 'Яндекс Маркет', rating: 4.9, price: 94_990 },
  { id: 'xiaomi-14', name: 'Xiaomi 14', brand: 'Xiaomi', category: 'Смартфоны', store: 'DNS', rating: 4.7, price: 68_990 },
  { id: 'xiaomi-14-ozon', name: 'Xiaomi 14', brand: 'Xiaomi', category: 'Смартфоны', store: 'Ozon', rating: 4.6, price: 69_490 },
  { id: 'macbook-air-m3', name: 'MacBook Air M3', brand: 'Apple', category: 'Ноутбуки', store: 'restore:', rating: 4.8, price: 119_990 },
  { id: 'macbook-air-m3-dns', name: 'MacBook Air M3', brand: 'Apple', category: 'Ноутбуки', store: 'DNS', rating: 4.7, price: 121_490 },
  { id: 'rog-g14', name: 'ASUS ROG Zephyrus G14', brand: 'ASUS', category: 'Ноутбуки', store: 'Ситилинк', rating: 4.7, price: 159_990 },
  { id: 'ps5', name: 'Sony PlayStation 5', brand: 'Sony', category: 'Игровые консоли', store: 'М.Видео', rating: 4.8, price: 54_990 },
  { id: 'ps5-ozon', name: 'Sony PlayStation 5', brand: 'Sony', category: 'Игровые консоли', store: 'Ozon', rating: 4.6, price: 56_490 },
  { id: 'oled-c4', name: 'LG OLED C4', brand: 'LG', category: 'Телевизоры', store: 'Эльдорадо', rating: 4.7, price: 109_990 },
]

export function findOffers(query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase('ru-RU').replace(/\+/g, ' plus ').replace(/[^\p{L}\p{N}]+/gu, ' ')
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean)
  if (!tokens.length) return []
  return searchOffers.filter((offer) => {
    const searchable = `${offer.name} ${offer.brand}`.toLocaleLowerCase('ru-RU').replace(/\+/g, ' plus ').replace(/[^\p{L}\p{N}]+/gu, ' ')
    const offerTokens = searchable.split(/\s+/).filter(Boolean)
    const hasVariant = ['plus', 'ultra', 'fe', 'pro', 'max'].some((variant) => offerTokens.includes(variant))
    const requestedVariant = ['plus', 'ultra', 'fe', 'pro', 'max'].some((variant) => tokens.includes(variant))
    return tokens.every((token) => offerTokens.includes(token)) && (!hasVariant || requestedVariant)
  }).sort((first, second) => first.price - second.price)
}
