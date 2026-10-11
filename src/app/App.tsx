import { useEffect, useState } from 'react'
import { CatalogPage } from '../features/products/CatalogPage'
import { ComparisonPage } from '../features/products/ComparisonPage'
import { AlertsPage } from '../features/products/AlertsPage'
import { FavoritesPage } from '../features/products/FavoritesPage'
import { ProductDetailPage } from '../features/products/ProductDetailPage'
import { ProductPage } from '../features/products/ProductPage'
import { priceAlertsStorageKey, readPriceAlerts } from '../features/products/priceAlerts'
import { AuthModal, type AuthMode } from '../features/auth/AuthModal'
import { authSessionStorageKey, readAuthSession } from '../features/auth/authSession'
import { CityPicker } from '../features/city/CityPicker'
import { AboutPage } from '../features/about/AboutPage'

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
  | { page: 'alerts' }
  | { page: 'about' }
  | { page: 'product'; sku: string }

function readRoute(): Route {
  if (window.location.hash === '#catalog') return { page: 'catalog' }
  if (window.location.hash === '#compare') return { page: 'compare' }
  if (window.location.hash === '#favorites') return { page: 'favorites' }
  if (window.location.hash === '#alerts') return { page: 'alerts' }
  if (window.location.hash === '#about') return { page: 'about' }
  if (window.location.hash.startsWith('#product/')) return { page: 'product', sku: decodeURIComponent(window.location.hash.slice('#product/'.length)) }
  return { page: 'home' }
}

/** Renders the approved Price Hunter interface while preserving its browser state. */
export function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [route, setRoute] = useState<Route>(readRoute)
  const [city, setCity] = useState(() => window.localStorage.getItem(cityStorageKey) || '')
  const [authUser, setAuthUser] = useState(readAuthSession)
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [priceAlerts, setPriceAlerts] = useState(readPriceAlerts)
  const [favoriteOfferIds, setFavoriteOfferIds] = useState<string[]>(() => {
    try {
      const stored = window.localStorage.getItem(favoritesStorageKey)
      if (stored === null) return defaultFavoriteOfferIds
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed : defaultFavoriteOfferIds
    } catch { return defaultFavoriteOfferIds }
  })
  const [comparisonSkus, setComparisonSkus] = useState<string[]>(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(comparisonStorageKey) || '[]')
      return Array.isArray(stored) && stored.length ? stored.slice(0, 2) : defaultComparisonSkus
    } catch { return defaultComparisonSkus }
  })

  useEffect(() => {
    const updateRoute = () => setRoute(readRoute())
    window.addEventListener('hashchange', updateRoute)
    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])
  useEffect(() => { window.localStorage.setItem(comparisonStorageKey, JSON.stringify(comparisonSkus)) }, [comparisonSkus])
  useEffect(() => { window.localStorage.setItem(cityStorageKey, city) }, [city])
  useEffect(() => { window.localStorage.setItem(favoritesStorageKey, JSON.stringify(favoriteOfferIds)) }, [favoriteOfferIds])
  useEffect(() => { window.localStorage.setItem(priceAlertsStorageKey, JSON.stringify(priceAlerts)) }, [priceAlerts])
  useEffect(() => {
    if (authUser) window.localStorage.setItem(authSessionStorageKey, JSON.stringify(authUser))
    else window.localStorage.removeItem(authSessionStorageKey)
  }, [authUser])

  const openCatalog = () => { window.location.hash = 'catalog' }
  const openProduct = (sku: string) => {
    const productHash = `#product/${encodeURIComponent(sku)}`
    window.history.pushState({ productReturnHash: window.location.hash || '#home' }, '', productHash)
    setRoute({ page: 'product', sku })
  }
  const returnFromProduct = () => {
    const historyState = window.history.state as { productReturnHash?: unknown } | null
    if (typeof historyState?.productReturnHash === 'string') { window.history.back(); return }
    window.location.hash = 'catalog'
  }
  const openAuth = (mode: AuthMode) => { setAuthMode(mode); setIsAuthOpen(true) }
  const toggleComparisonProduct = (sku: string) => {
    setComparisonSkus((current) => current.includes(sku) ? current.filter((item) => item !== sku) : current.length < 2 ? [...current, sku] : current)
  }
  const toggleFavoriteOffer = (offerId: string) => {
    setFavoriteOfferIds((current) => current.includes(offerId) ? current.filter((item) => item !== offerId) : [...current, offerId])
  }
  const savePriceAlert = (sku: string, productName: string, targetPrice: number) => {
    const alertCity = city.trim()
    setPriceAlerts((current) => {
      const existing = current.find((alert) => alert.sku === sku && alert.city === alertCity)
      const nextAlert = { id: existing?.id || `${sku}-${alertCity}-${Date.now()}`, sku, productName, city: alertCity, targetPrice, active: true, createdAt: existing?.createdAt || new Date().toISOString() }
      return existing ? current.map((alert) => alert.id === existing.id ? nextAlert : alert) : [...current, nextAlert]
    })
  }
  const togglePriceAlert = (id: string) => { setPriceAlerts((current) => current.map((alert) => alert.id === id ? { ...alert, active: !alert.active } : alert)) }
  const removePriceAlert = (id: string) => { setPriceAlerts((current) => current.filter((alert) => alert.id !== id)) }
  const activePriceAlerts = priceAlerts.filter((alert) => alert.active).length

  return (
    <div className={`app-shell${isDarkTheme ? ' dark-theme' : ''}`}>
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Price Hunter — главная"><span className="brand-mark" aria-hidden="true">PH</span><span>PriceHunter</span></a>
        <CityPicker value={city} onChange={setCity} />
        <nav className="main-nav" aria-label="Основная навигация">
          <a className={`nav-link${route.page === 'home' ? ' active' : ''}`} href="#home"><span aria-hidden="true">⌂</span>Главная</a>
          <a className={`nav-link${route.page === 'catalog' ? ' active' : ''}`} href="#catalog"><span aria-hidden="true">▦</span>Каталог</a>
          <a className={`nav-link${route.page === 'compare' ? ' active' : ''}`} href="#compare"><span aria-hidden="true">▥</span>Сравнение</a>
          <a className={`nav-link${route.page === 'favorites' ? ' active' : ''}`} href="#favorites"><span aria-hidden="true">♡</span>Избранное{favoriteOfferIds.length > 0 && <b className="nav-favorite-count">{favoriteOfferIds.length}</b>}</a>
          <a className={`nav-link${route.page === 'alerts' ? ' active' : ''}`} href="#alerts"><span aria-hidden="true">♧</span>Уведомления{activePriceAlerts > 0 && <b className="nav-favorite-count">{activePriceAlerts}</b>}</a>
        </nav>
        <nav className="secondary-nav" aria-label="Справка"><a className={`nav-link${route.page === 'about' ? ' active' : ''}`} href="#about"><span aria-hidden="true">ⓘ</span>О нас</a></nav>
        <section className="signin-card" aria-label="Личный кабинет">
          <span className="spark" aria-hidden="true">✦</span>
          {authUser ? <><strong>Здравствуйте, {authUser.name}</strong><p>Цели по цене и избранное сохранены в этом браузере.</p><button type="button" onClick={() => setAuthUser(null)}>Выйти</button><span><a href="#alerts">Открыть уведомления</a></span></> : <><strong>Отслеживайте цены</strong><p>Получайте уведомления, когда цена на товар снизится.</p><button type="button" onClick={() => openAuth('login')}>Войти</button><span>или <button className="signin-register-link" type="button" onClick={() => openAuth('register')}>Создать аккаунт</button></span></>}
        </section>
      </aside>
      <main id="home" className={`home-main${route.page === 'catalog' ? ' catalog-main' : ''}${route.page === 'compare' ? ' comparison-main' : ''}${route.page === 'favorites' ? ' favorites-main' : ''}${route.page === 'alerts' ? ' alerts-main' : ''}${route.page === 'about' ? ' about-main' : ''}`}>{route.page === 'catalog' ? <CatalogPage isDarkTheme={isDarkTheme} onToggleTheme={() => setIsDarkTheme((current) => !current)} comparisonSkus={comparisonSkus} onToggleComparison={toggleComparisonProduct} onOpenProduct={openProduct} /> : route.page === 'compare' ? <ComparisonPage isDarkTheme={isDarkTheme} onToggleTheme={() => setIsDarkTheme((current) => !current)} selectedSkus={comparisonSkus} onAddProduct={toggleComparisonProduct} onRemoveProduct={toggleComparisonProduct} city={city} /> : route.page === 'favorites' ? <FavoritesPage isDarkTheme={isDarkTheme} onToggleTheme={() => setIsDarkTheme((current) => !current)} city={city} favoriteOfferIds={favoriteOfferIds} onToggleFavoriteOffer={toggleFavoriteOffer} onOpenProduct={openProduct} onOpenCatalog={openCatalog} /> : route.page === 'alerts' ? <AlertsPage alerts={priceAlerts} isDarkTheme={isDarkTheme} onToggleTheme={() => setIsDarkTheme((current) => !current)} onToggleAlert={togglePriceAlert} onRemoveAlert={removePriceAlert} onOpenProduct={openProduct} /> : route.page === 'about' ? <AboutPage isDarkTheme={isDarkTheme} onToggleTheme={() => setIsDarkTheme((current) => !current)} /> : route.page === 'product' ? <ProductDetailPage sku={route.sku} isDarkTheme={isDarkTheme} onToggleTheme={() => setIsDarkTheme((current) => !current)} onBack={returnFromProduct} isInComparison={comparisonSkus.includes(route.sku)} isComparisonFull={comparisonSkus.length >= 2} favoriteOfferIds={favoriteOfferIds} onToggleComparison={() => toggleComparisonProduct(route.sku)} onToggleFavoriteOffer={toggleFavoriteOffer} priceAlert={priceAlerts.find((alert) => alert.sku === route.sku && alert.city === city.trim())} onSavePriceAlert={(targetPrice, productName) => savePriceAlert(route.sku, productName, targetPrice)} city={city} /> : <ProductPage isDarkTheme={isDarkTheme} onToggleTheme={() => setIsDarkTheme((current) => !current)} onOpenCatalog={openCatalog} onOpenProduct={openProduct} city={city} />}</main>
      {isAuthOpen && <AuthModal initialMode={authMode} onClose={() => setIsAuthOpen(false)} onAuthenticate={(session) => { setAuthUser(session); setIsAuthOpen(false) }} />}
    </div>
  )
}
