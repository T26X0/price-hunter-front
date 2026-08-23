import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProducts } from '../../api/products'
import { catalogPreview } from './catalogPreview'
import { ProductCard } from './ProductCard'

const categoryCards = [
  ['Смартфоны', 'Сравните лучшие модели', '◖'],
  ['Ноутбуки', 'Для работы, учёбы и игр', '▱'],
  ['Телевизоры', 'Кино, спорт и консоли', '▣'],
  ['Игровые консоли', 'Для побед и развлечений', '⌁'],
]

interface CatalogPageProps {
  isDarkTheme: boolean
  onToggleTheme: () => void
}

export function CatalogPage({ isDarkTheme, onToggleTheme }: CatalogPageProps) {
  const productsQuery = useQuery({ queryKey: ['products'], queryFn: getProducts })
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Все категории')
  const [selectedBrand, setSelectedBrand] = useState('Все бренды')
  const products = productsQuery.data?.length ? productsQuery.data : catalogPreview
  const categories = useMemo(() => ['Все категории', ...new Set(products.map((product) => product.category))], [products])
  const brands = useMemo(() => ['Все бренды', ...new Set(products.map((product) => product.brand))], [products])
  const filteredProducts = useMemo(() => {
    const search = query.trim().toLocaleLowerCase('ru-RU')
    return products.filter((product) => {
      const matchesSearch = !search || [product.name, product.brand, product.category, product.sku].join(' ').toLocaleLowerCase('ru-RU').includes(search)
      return matchesSearch && (selectedCategory === 'Все категории' || product.category === selectedCategory) && (selectedBrand === 'Все бренды' || product.brand === selectedBrand)
    })
  }, [products, query, selectedCategory, selectedBrand])

  const resetFilters = () => { setQuery(''); setSelectedCategory('Все категории'); setSelectedBrand('Все бренды') }

  return <section className="catalog-page" aria-labelledby="catalog-title">
    <button className="theme-button catalog-theme-button" type="button" aria-label={isDarkTheme ? 'Включить светлую тему' : 'Включить тёмную тему'} aria-pressed={isDarkTheme} onClick={onToggleTheme}>{isDarkTheme ? '☀' : '☾'}</button>
    <header className="catalog-page-header"><div><span className="overline">Price Hunter · все бренды</span><h1 id="catalog-title">Каталог</h1><p>Выбирайте технику и сравнивайте предложения проверенных магазинов.</p></div><button type="button" className="catalog-selection">✦ Подборки для вас</button></header>
    <label className="catalog-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск товаров и брендов" aria-label="Поиск в каталоге" /></label>
    <div className="catalog-toolbar"><label><span>Категория</span><select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label><span>Бренд</span><select value={selectedBrand} onChange={(event) => setSelectedBrand(event.target.value)}>{brands.map((brand) => <option key={brand}>{brand}</option>)}</select></label><button type="button" onClick={resetFilters}>Сбросить</button><span className="catalog-results">{filteredProducts.length} моделей</span></div>
    <section className="category-showcase" aria-label="Категории товаров">{categoryCards.map(([category, text, icon]) => <button type="button" key={category} onClick={() => setSelectedCategory(category)}><span className="category-showcase-icon" aria-hidden="true">{icon}</span><strong>{category}</strong><small>{text}</small><i aria-hidden="true">→</i></button>)}</section>
    <div className="catalog-products-heading"><div><h2>{query || selectedCategory !== 'Все категории' || selectedBrand !== 'Все бренды' ? 'Результаты поиска' : 'Популярные товары'}</h2>{productsQuery.isError && <p>Показан локальный каталог для предварительного просмотра.</p>}</div><button type="button" className="catalog-sort">Сначала популярные ↕</button></div>
    {productsQuery.isLoading ? <div className="catalog-state">Обновляем каталог…</div> : filteredProducts.length ? <div className="product-grid catalog-product-grid">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="catalog-state">Ничего не найдено. Попробуйте изменить фильтры.</div>}
  </section>
}
