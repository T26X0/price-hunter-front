import { useEffect, useState } from 'react'
import { CatalogPage } from '../features/products/CatalogPage'
import { ComparisonPage } from '../features/products/ComparisonPage'
import { FavoritesPage } from '../features/products/FavoritesPage'
import { ProductDetailPage } from '../features/products/ProductDetailPage'
import { ProductPage } from '../features/products/ProductPage'

const comparisonStorageKey = 'price-hunter-comparison-skus'
const cityStorageKey = 'price-hunter-city'
const favoritesStorageKey = 'price-hunter-favorite-offer-ids'
const defaultComparisonSkus = ['SAMSUNG-GALAXY-S24', 'SAMSUNG-GALAXY-S24-ULTRA']
const defaultFavoriteOfferIds = ['c7434f01-0bbe-550d-a2c5-66d487c77eb0', '0e0e8abb-46d0-5271-89e3-9908149dac73', '8006c2a1-0650-5fc4-8aa8-e6be3524d35a', 'baf23e44-3152-56ae-a50a-bdb237009147']

type Route =
  | { page: 'home' }
  | { page: 'catalog' }
  | { page: 'compare' }
  | { page: 'favorites' }
  | { page: 'product'; sku: string }

function readRoute(): Route {
  if (window.location.hash === '#catalog') return { page: 'catalog' }
  if (window.location.hash === '#compare') return { page: 'compare' }
  if (window.location.hash === '#favorites') return { page: 'favorites' }
  if (window.location.hash.startsWith('#product/')) return { page: 'product', sku: decodeURIComponent(window.location.hash.slice('#product/'.length)) }
  return { page: 'home' }
}

export function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [route, setRoute] = useState<Route>(readRoute)
  const [city, setCity] = useState(() => window.localStorage.getItem(cityStorageKey) || '')
  const [favoriteOfferIds, setFavoriteOfferIds] = useState<string[]>(() => {
    try {
      const stored = window.localStorage.getItem(favoritesStorageKey)
      if (stored === null) return defaultFavoriteOfferIds
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed : defaultFavoriteOfferIds
    } catch {
      return defaultFavoriteOfferIds
    }
  })
  const [comparisonSkus, setComparisonSkus] = useState<string[]>(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(comparisonStorageKey) || '[]')
      return Array.isArray(stored) && stored.length ? stored.slice(0, 2) : defaultComparisonSkus
    } catch {
      return defaultComparisonSkus
    }
  })

  useEffect(() => {
    const updateRoute = () => setRoute(readRoute())
    window.addEventListener('hashchange', updateRoute)
    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(comparisonStorageKey, JSON.stringify(comparisonSkus))
  }, [comparisonSkus])

  useEffect(() => {
    window.localStorage.setItem(cityStorageKey, city)
  }, [city])

  useEffect(() => {
    window.localStorage.setItem(favoritesStorageKey, JSON.stringify(favoriteOfferIds))
  }, [favoriteOfferIds])

  const openCatalog = () => { window.location.hash = 'catalog' }
  const openProduct = (sku: string) => { window.location.hash = `product/${encodeURIComponent(sku)}` }
  const openHome = () => { window.location.hash = 'home' }
  const toggleComparisonProduct = (sku: string) => {
    setComparisonSkus((current) => current.includes(sku) ? current.filter((item) => item !== sku) : current.length < 2 ? [...current, sku] : current)
  }
  const toggleFavoriteOffer = (offerId: string) => {
    setFavoriteOfferIds((current) => current.includes(offerId) ? current.filter((item) => item !== offerId) : [...current, offerId])
  }

  return (
    <div className={`app-shell${isDarkTheme ? ' dark-theme' : ''}`}>
      <aside className="sidebar">
        <div className="window-controls" aria-hidden="true"><span /><span /><span /></div>
        <a className="brand" href="/" aria-label="Price Hunter — главная">
          <span className="brand-mark" aria-hidden="true">PH</span>
          <span>PriceHunter</span>
        </a>
        <label className="city-picker">
          <span className="city-picker-label">Ваш город</span>
          <span className="city-picker-field"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 10c0 5-7 10-7 10s-7-5-7-10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.4" /></svg><input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Введите город" aria-label="Ваш город" autoComplete="address-level2" /></span>
        </label>
        <nav className="main-nav" aria-label="Основная навигация">
          <a className={`nav-link${route.page === 'home' ? ' active' : ''}`} href="#home"><span aria-hidden="true">⌂</span>Главная</a>
          <a className={`nav-link${route.page === 'catalog' ? ' active' : ''}`} href="#catalog"><span aria-hidden="true">▦</span>Каталог</a>
          <a className={`nav-link${route.page === 'compare' ? ' active' : ''}`} href="#compare"><span aria-hidden="true">▥</span>Сравнение</a>
          <a className={`nav-link${route.page === 'favorites' ? ' active' : ''}`} href="#favorites"><span aria-hidden="true">♡</span>Избранное{favoriteOfferIds.length > 0 && <b className="nav-favorite-count">{favoriteOfferIds.length}</b>}</a>
          <a className="nav-link" href="#alerts"><span aria-hidden="true">♧</span>Уведомления</a>
        </nav>
        <nav className="secondary-nav" aria-label="Справка">
          <a className="nav-link" href="mailto:hello@pricehunter.local"><span aria-hidden="true">✉</span>Контакты</a>
          <a className="nav-link" href="#about"><span aria-hidden="true">ⓘ</span>О нас</a>
          <a className="nav-link" href="#settings"><span aria-hidden="true">⚙</span>Настройки</a>
        </nav>
        <section className="signin-card" aria-label="Отслеживание цен">
          <span className="spark" aria-hidden="true">✦</span>
          <strong>Отслеживайте цены</strong>
          <p>Получайте уведомления, когда цена на товар снизится.</p>
          <button type="button">Войти</button>
          <span>или <a href="#signup">Создать аккаунт</a></span>
        </section>
      </aside>
      <main id="home" className={`home-main${route.page === 'catalog' ? ' catalog-main' : ''}${route.page === 'compare' ? ' comparison-main' : ''}${route.page === 'favorites' ? ' favorites-main' : ''}`}>{route.page === 'catalog' ? <CatalogPage isDarkTheme={isDarkTheme} onToggleTheme={() => setIsDarkTheme((current) => !current)} comparisonSkus={comparisonSkus} onToggleComparison={toggleComparisonProduct} onOpenProduct={openProduct} /> : route.page === 'compare' ? <ComparisonPage isDarkTheme={isDarkTheme} onToggleTheme={() => setIsDarkTheme((current) => !current)} selectedSkus={comparisonSkus} onAddProduct={toggleComparisonProduct} onRemoveProduct={toggleComparisonProduct} city={city} /> : route.page === 'favorites' ? <FavoritesPage isDarkTheme={isDarkTheme} onToggleTheme={() => setIsDarkTheme((current) => !current)} city={city} favoriteOfferIds={favoriteOfferIds} onToggleFavoriteOffer={toggleFavoriteOffer} onOpenProduct={openProduct} onOpenCatalog={openCatalog} /> : route.page === 'product' ? <ProductDetailPage sku={route.sku} isDarkTheme={isDarkTheme} onToggleTheme={() => setIsDarkTheme((current) => !current)} onBack={openHome} isInComparison={comparisonSkus.includes(route.sku)} isComparisonFull={comparisonSkus.length >= 2} favoriteOfferIds={favoriteOfferIds} onToggleComparison={() => toggleComparisonProduct(route.sku)} onToggleFavoriteOffer={toggleFavoriteOffer} city={city} /> : <ProductPage isDarkTheme={isDarkTheme} onToggleTheme={() => setIsDarkTheme((current) => !current)} onOpenCatalog={openCatalog} onOpenProduct={openProduct} city={city} />}</main>
    </div>
  )
}
