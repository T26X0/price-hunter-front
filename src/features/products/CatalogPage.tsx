import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProducts } from '../../api/products'
import { catalogPreview } from './catalogPreview'
import { ProductCard } from './ProductCard'

type CategoryIllustration = 'phone' | 'laptop' | 'tv' | 'console'

const categoryCards: Array<{ category: string; text: string; illustration: CategoryIllustration }> = [
  { category: 'Смартфоны', text: 'Сравните лучшие модели', illustration: 'phone' },
  { category: 'Ноутбуки', text: 'Для работы, учёбы и игр', illustration: 'laptop' },
  { category: 'Телевизоры', text: 'Кино, спорт и консоли', illustration: 'tv' },
  { category: 'Игровые консоли', text: 'Для побед и развлечений', illustration: 'console' },
]
const catalogFiltersStorageKey = 'price-hunter-catalog-filters'

type CatalogFilters = {
  query: string
  category: string
  brand: string
}

function readCatalogFilters(): CatalogFilters {
  try {
    const value = JSON.parse(window.sessionStorage.getItem(catalogFiltersStorageKey) || 'null')
    if (value && typeof value.query === 'string' && typeof value.category === 'string' && typeof value.brand === 'string') return value
  } catch {
    // The catalog remains usable if the browser has an invalid saved value.
  }

  return { query: '', category: 'Все категории', brand: 'Все бренды' }
}

function CategorySignal({ type }: { type: CategoryIllustration }) {
  if (type === 'phone') return <svg className="category-showcase-icon" viewBox="0 0 100 100" aria-hidden="true"><rect x="31" y="10" width="40" height="80" rx="8" /><line x1="46" y1="78" x2="56" y2="78" /></svg>
  if (type === 'laptop') return <svg className="category-showcase-icon" viewBox="0 0 100 100" aria-hidden="true"><rect x="18" y="20" width="64" height="45" rx="5" /><path d="M8 76h84" /></svg>
  if (type === 'tv') return <svg className="category-showcase-icon" viewBox="0 0 100 100" aria-hidden="true"><rect x="12" y="18" width="76" height="51" rx="5" /><path d="M38 84h24M50 69v15" /></svg>
  return <svg className="category-showcase-icon" viewBox="0 0 100 100" aria-hidden="true"><path d="M23 51c6-16 48-16 54 0l7 23c2 8-7 13-13 7l-10-10H39L29 81c-6 6-15 1-13-7z" /><line x1="36" y1="56" x2="48" y2="56" /><line x1="42" y1="50" x2="42" y2="62" /><circle cx="66" cy="53" r="2" /><circle cx="72" cy="59" r="2" /></svg>
}

interface CatalogPageProps {
  isDarkTheme: boolean
  onToggleTheme: () => void
  comparisonSkus: string[]
  onToggleComparison: (sku: string) => void
  onOpenProduct: (sku: string) => void
}

export function CatalogPage({ isDarkTheme, onToggleTheme, comparisonSkus, onToggleComparison, onOpenProduct }: CatalogPageProps) {
  const productsQuery = useQuery({ queryKey: ['products'], queryFn: getProducts })
  const initialFilters = readCatalogFilters()
  const [query, setQuery] = useState(initialFilters.query)
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category)
  const [selectedBrand, setSelectedBrand] = useState(initialFilters.brand)
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

  useEffect(() => {
    window.sessionStorage.setItem(catalogFiltersStorageKey, JSON.stringify({ query, category: selectedCategory, brand: selectedBrand }))
  }, [query, selectedBrand, selectedCategory])

  return <section className="catalog-page" aria-labelledby="catalog-title">
    <button className="theme-button catalog-theme-button" type="button" aria-label={isDarkTheme ? 'Включить светлую тему' : 'Включить тёмную тему'} aria-pressed={isDarkTheme} onClick={onToggleTheme}>{isDarkTheme ? '☀' : '☾'}</button>
    <header className="catalog-page-header"><div><span className="overline">Price Hunter · все бренды</span><h1 id="catalog-title">Каталог</h1><p>Выбирайте технику и сравнивайте предложения проверенных магазинов.</p></div><button type="button" className="catalog-selection">✦ Подборки для вас</button></header>
    <label className="catalog-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск товаров и брендов" aria-label="Поиск в каталоге" /></label>
    <div className="catalog-toolbar"><label><span>Категория</span><select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label><span>Бренд</span><select value={selectedBrand} onChange={(event) => setSelectedBrand(event.target.value)}>{brands.map((brand) => <option key={brand}>{brand}</option>)}</select></label><button type="button" onClick={resetFilters}>Сбросить</button><span className="catalog-results">{filteredProducts.length} моделей</span></div>
    <section className="category-showcase" aria-label="Категории товаров">{categoryCards.map(({ category, text, illustration }) => <button type="button" key={category} onClick={() => setSelectedCategory(category)}><CategorySignal type={illustration} /><strong>{category}</strong><small>{text}</small><i aria-hidden="true">→</i></button>)}</section>
    <div className="catalog-products-heading"><div><h2>{query || selectedCategory !== 'Все категории' || selectedBrand !== 'Все бренды' ? 'Результаты поиска' : 'Популярные товары'}</h2>{productsQuery.isError && <p>Показан локальный каталог для предварительного просмотра.</p>}</div><button type="button" className="catalog-sort">Сначала популярные ↕</button></div>
    {productsQuery.isLoading ? <div className="catalog-state">Обновляем каталог…</div> : filteredProducts.length ? <div className="product-grid catalog-product-grid">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} isInComparison={comparisonSkus.includes(product.sku)} isComparisonFull={comparisonSkus.length >= 2} onToggleComparison={() => onToggleComparison(product.sku)} onOpenProduct={() => onOpenProduct(product.sku)} />)}</div> : <div className="catalog-state">Ничего не найдено. Попробуйте изменить фильтры.</div>}
  </section>
}
