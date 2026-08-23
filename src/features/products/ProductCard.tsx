import type { Product } from '../../api/types'

const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })

export function ProductCard({ product }: { product: Product }) {
  const createdAt = new Date(product.createdAt)
  return <article className="product-card"><div className="product-card-head"><span className="sku">{product.sku}</span><time dateTime={product.createdAt}>{Number.isNaN(createdAt.getTime()) ? 'Дата неизвестна' : dateFormatter.format(createdAt)}</time></div><h3>{product.name}</h3>{product.description ? <p>{product.description}</p> : <p className="muted">Описание не добавлено</p>}</article>
}
