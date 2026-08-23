import type { Product } from '../../api/types'

const categoryIcons: Record<string, string> = {
  'Смартфоны': '◖',
  'Ноутбуки': '▱',
  'Телевизоры': '▣',
  'Игровые консоли': '⌁',
}

export function ProductCard({ product }: { product: Product }) {
  return <article className="product-card">
    <div className="product-card-visual" aria-hidden="true"><span>{categoryIcons[product.category] ?? '◇'}</span></div>
    <div className="product-card-meta"><span>{product.category}</span><span className="product-brand">{product.brand}</span></div>
    <h3>{product.name}</h3>
    <p>{product.description?.replace('Демонстрационная запись каталога.', '').trim() || 'Модель доступна для сравнения цен.'}</p>
    <div className="product-card-footer"><span className="sku">{product.sku}</span><button type="button">Сравнить цены <span aria-hidden="true">→</span></button></div>
  </article>
}
