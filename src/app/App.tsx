import { useEffect, useState } from 'react'
import { CatalogPage } from '../features/products/CatalogPage'
import { ProductPage } from '../features/products/ProductPage'

export function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [page, setPage] = useState(() => window.location.hash === '#catalog' ? 'catalog' : 'home')

  useEffect(() => {
    const updatePage = () => setPage(window.location.hash === '#catalog' ? 'catalog' : 'home')
    window.addEventListener('hashchange', updatePage)
    return () => window.removeEventListener('hashchange', updatePage)
  }, [])

  const openCatalog = () => { window.location.hash = 'catalog' }

  return (
    <div className={`app-shell${isDarkTheme ? ' dark-theme' : ''}`}>
      <aside className="sidebar">
        <div className="window-controls" aria-hidden="true"><span /><span /><span /></div>
        <a className="brand" href="/" aria-label="Price Hunter — главная">
          <span className="brand-mark" aria-hidden="true">PH</span>
          <span>PriceHunter</span>
        </a>
        <nav className="main-nav" aria-label="Основная навигация">
          <a className={`nav-link${page === 'home' ? ' active' : ''}`} href="#home"><span aria-hidden="true">⌂</span>Главная</a>
          <a className={`nav-link${page === 'catalog' ? ' active' : ''}`} href="#catalog"><span aria-hidden="true">▦</span>Каталог</a>
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
      <main id="home" className={`home-main${page === 'catalog' ? ' catalog-main' : ''}`}>{page === 'catalog' ? <CatalogPage isDarkTheme={isDarkTheme} onToggleTheme={() => setIsDarkTheme((current) => !current)} /> : <ProductPage isDarkTheme={isDarkTheme} onToggleTheme={() => setIsDarkTheme((current) => !current)} onOpenCatalog={openCatalog} />}</main>
    </div>
  )
}
