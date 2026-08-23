import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ApiError } from '../../api/client'
import { getProducts } from '../../api/products'
import heroDevices from '../../assets/price-hunter-devices.png'

const popularSearches = ['Samsung Galaxy S24', 'Xiaomi 14', 'ASUS ROG Zephyrus G14', 'Sony PlayStation 5', 'LG OLED C4']

interface ProductPageProps {
  isDarkTheme: boolean
  onToggleTheme: () => void
}

export function ProductPage({ isDarkTheme, onToggleTheme }: ProductPageProps) {
  const productsQuery = useQuery({ queryKey: ['products'], queryFn: getProducts })
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data])
  const matches = useMemo(() => {
    const normalizedQuery = submittedQuery.trim().toLocaleLowerCase('ru-RU')
    if (!normalizedQuery) return []
    return products.filter((product) => [product.name, product.sku, product.brand, product.category, product.description ?? ''].join(' ').toLocaleLowerCase('ru-RU').includes(normalizedQuery)).slice(0, 4)
  }, [products, submittedQuery])
  const brands = [...new Set(products.map((product) => product.brand))]
  const submitSearch = (value = query) => { setQuery(value); setSubmittedQuery(value) }

  return <section className="home-screen" id="catalog">
    <button className="theme-button" type="button" aria-label={isDarkTheme ? 'Включить светлую тему' : 'Включить тёмную тему'} aria-pressed={isDarkTheme} onClick={onToggleTheme}>{isDarkTheme ? '☀' : '☾'}</button>
    <div className="hero-copy"><span className="overline">Price Hunter · каталог техники</span><h1>Найдите лучшую цену<br />на технику <em>всех брендов</em></h1><p>Сравниваем предложения проверенных магазинов, чтобы вы могли покупать выгодно.</p></div>
    <form className="search-box" role="search" onSubmit={(event) => { event.preventDefault(); submitSearch() }}><span className="search-icon" aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по товарам, например: Samsung Galaxy S24" aria-label="Поиск товаров" /><button type="submit" aria-label="Найти товар">→</button></form>
    <div className="popular-searches"><span>Популярные запросы</span><div>{popularSearches.map((item) => <button type="button" key={item} onClick={() => submitSearch(item)}>{item}</button>)}</div></div>
    {productsQuery.isError && <div className="catalog-message" role="alert">{productsQuery.error instanceof ApiError ? productsQuery.error.message : 'Не удалось загрузить каталог.'}</div>}
    {submittedQuery && productsQuery.isSuccess && <div className="search-results" aria-live="polite"><span>{matches.length ? `Найдено: ${matches.length}` : 'Ничего не найдено'}</span>{matches.map((product) => <article key={product.id}><strong>{product.name}</strong><small>{product.brand} · {product.category}</small></article>)}</div>}
    <div className="catalog-summary" aria-live="polite"><span>{productsQuery.isLoading ? 'Загружаем каталог…' : `${products.length} моделей в каталоге`}</span>{brands.length > 0 && <p>Все бренды: {brands.slice(0, 9).join(' · ')}{brands.length > 9 ? ' · и другие' : ''}</p>}</div>
    <img className="device-stage-image" src={heroDevices} alt="Ноутбук, смартфоны, игровой контроллер и умные часы" />
  </section>
}
