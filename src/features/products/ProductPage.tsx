import { useQuery } from '@tanstack/react-query'
import { ApiError } from '../../api/client'
import { getProducts } from '../../api/products'
import { CreateProductForm } from './CreateProductForm'
import { ProductCard } from './ProductCard'

export function ProductPage() {
  const productsQuery = useQuery({ queryKey: ['products'], queryFn: getProducts })
  return <>
    <section className="hero"><div><div className="eyebrow">Каталог товаров</div><h1>Следите за товарами.<br /><em>Ловите лучшую цену.</em></h1><p>Соберите товары в одном месте — Price Hunter подготовит основу для сравнения предложений магазинов.</p></div><div className="hero-stat" aria-label={`Товаров в каталоге: ${productsQuery.data?.length ?? 0}`}><strong>{productsQuery.isLoading ? '—' : productsQuery.data?.length ?? 0}</strong><span>товаров в каталоге</span></div></section>
    <div className="workspace"><section className="catalog" aria-labelledby="catalog-title"><div className="section-heading"><div><div className="section-kicker">Ваш список</div><h2 id="catalog-title">Товары</h2></div>{productsQuery.data && productsQuery.data.length > 0 && <span className="count-badge">{productsQuery.data.length}</span>}</div>
      {productsQuery.isLoading && <div className="product-grid" aria-label="Загружаем товары" aria-busy="true">{[1, 2, 3].map((item) => <div className="skeleton-card" key={item} />)}</div>}
      {productsQuery.isError && <div className="state-panel" role="alert"><div className="state-icon">!</div><h3>Не удалось загрузить товары</h3><p>{productsQuery.error instanceof ApiError ? productsQuery.error.message : 'Произошла неизвестная ошибка.'}</p><button className="secondary-button" type="button" onClick={() => productsQuery.refetch()}>Попробовать снова</button></div>}
      {productsQuery.isSuccess && productsQuery.data.length === 0 && <div className="state-panel empty-state"><div className="empty-illustration" aria-hidden="true">◎</div><h3>Товаров пока нет</h3><p>Добавьте первый товар, чтобы начать собирать каталог и отслеживать цены.</p></div>}
      {productsQuery.isSuccess && productsQuery.data.length > 0 && <div className="product-grid">{productsQuery.data.map((product) => <ProductCard key={product.id} product={product} />)}</div>}
    </section><CreateProductForm /></div>
  </>
}
