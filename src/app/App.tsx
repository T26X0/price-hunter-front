import { useEffect, useState } from 'react'
import { CatalogPage } from '../features/products/CatalogPage'
import { ProductDetailPage } from '../features/products/ProductDetailPage'
import { ProductPage } from '../features/products/ProductPage'

type Route =
  | { page: 'home' }
  | { page: 'catalog' }
  | { page: 'product'; sku: string }

function readRoute(): Route {
  if (window.location.hash === '#catalog') return { page: 'catalog' }
  if (window.location.hash.startsWith('#product/')) return { page: 'product', sku: decodeURIComponent(window.location.hash.slice('#product/'.length)) }
  return { page: 'home' }
}

export function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [route, setRoute] = useState<Route>(readRoute)

  useEffect(() => {
    const updateRoute = () => setRoute(readRoute())
    window.addEventListener('hashchange', updateRoute)
    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])

  const openCatalog = () => { window.location.hash = 'catalog' }
  const openProduct = (sku: string) => { window.location.hash = `product/${encodeURIComponent(sku)}` }
  const openHome = () => { window.location.hash = 'home' }

  return (
    <div className={`app-shell${isDarkTheme ? ' dark-theme' : ''}`}>
      <aside className="sidebar">
        <div className="window-controls" aria-hidden="true"><span /><span /><span /></div>
        <a className="brand" href="/" aria-label="Price Hunter — главная">
          <span className="brand-mark" aria-hidden="true">PH</span>
          <span>PriceHunter</span>
        </a>
        <nav className="main-nav" aria-label="Основная навигация">
          <a className={`nav-link${route.page === 'home' ? ' active' : ''}`} href="#home"><span aria-hidden="true">⌂</span>Главная</a>
          <a className={`nav-link${route.page === 'catalog' ? ' active' : ''}`} href="#catalog"><span aria-hidden="true">▦</span>Каталог</a>
          <a className="nav-link" href="#compare"><span aria-hidden="true">▥</span>Сравнение</a>
          <a className="nav-link" href="#favorites"><span aria-hidden="true">♡</span>Избранное</a>
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
      <main id="home" className={`home-main${route.page === 'catalog' ? ' catalog-main' : ''}`}>{route.page === 'catalog' ? <CatalogPage isDarkTheme={isDarkTheme} onToggleTheme={() => setIsDarkTheme((current) => !current)} /> : route.page === 'product' ? <ProductDetailPage sku={route.sku} isDarkTheme={isDarkTheme} onToggleTheme={() => setIsDarkTheme((current) => !current)} onBack={openHome} /> : <ProductPage isDarkTheme={isDarkTheme} onToggleTheme={() => setIsDarkTheme((current) => !current)} onOpenCatalog={openCatalog} onOpenProduct={openProduct} />}</main>
    </div>
  )
}
