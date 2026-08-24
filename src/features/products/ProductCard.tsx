import type { Product } from '../../api/types'

const categoryIcons: Record<string, string> = {
  'Смартфоны': '◖',
  'Ноутбуки': '▱',
  'Телевизоры': '▣',
  'Игровые консоли': '⌁',
}

interface ProductCardProps {
  product: Product
  isInComparison: boolean
  isComparisonFull: boolean
  onToggleComparison: () => void
  onOpenProduct: () => void
}

export function ProductCard({ product, isInComparison, isComparisonFull, onToggleComparison, onOpenProduct }: ProductCardProps) {
  return <article className="product-card">
    <button className="product-card-open" type="button" onClick={onOpenProduct} aria-label={`Открыть страницу товара ${product.name}`}>
      <div className="product-card-visual" aria-hidden="true"><span>{categoryIcons[product.category] ?? '◇'}</span></div>
      <div className="product-card-meta"><span>{product.category}</span><span className="product-brand">{product.brand}</span></div>
      <h3>{product.name}</h3>
      <p>{product.description?.replace('Демонстрационная запись каталога.', '').trim() || 'Модель доступна для сравнения цен.'}</p>
    </button>
    <div className="product-card-footer"><span className="sku">{product.sku}</span><div><button className="product-card-favorite" type="button" onClick={onOpenProduct} aria-label={`Выбрать вариант ${product.name} для избранного`}>♡</button><button type="button" onClick={onToggleComparison} disabled={!isInComparison && isComparisonFull}>{isInComparison ? 'В сравнении ✓' : isComparisonFull ? 'Выбрано 2 из 2' : 'В сравнение'} <span aria-hidden="true">→</span></button></div></div>
  </article>
}
