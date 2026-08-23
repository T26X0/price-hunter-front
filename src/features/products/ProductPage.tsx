import { useState } from 'react'
import heroDevices from '../../assets/price-hunter-devices.png'
import heroDevicesDark from '../../assets/price-hunter-devices-dark.png'

const popularSearches = ['Samsung Galaxy S24', 'Xiaomi 14', 'ASUS ROG Zephyrus G14', 'Sony PlayStation 5', 'LG OLED C4']

interface ProductPageProps {
  isDarkTheme: boolean
  onToggleTheme: () => void
  onOpenCatalog: (query?: string) => void
}

export function ProductPage({ isDarkTheme, onToggleTheme, onOpenCatalog }: ProductPageProps) {
  const [query, setQuery] = useState('')
  const submitSearch = (value = query) => {
    setQuery(value)
    onOpenCatalog(value)
  }

  return <section className="home-screen" id="home">
      <button className="theme-button" type="button" aria-label={isDarkTheme ? 'Включить светлую тему' : 'Включить тёмную тему'} aria-pressed={isDarkTheme} onClick={onToggleTheme}>{isDarkTheme ? '☀' : '☾'}</button>
      <div className="hero-copy"><span className="overline">Price Hunter · каталог техники</span><h1>Найдите лучшую цену<br />на технику <em>всех брендов</em></h1><p>Сравниваем предложения проверенных магазинов, чтобы вы могли покупать выгодно.</p></div>
      <form className="search-box" role="search" onSubmit={(event) => { event.preventDefault(); submitSearch() }}><span className="search-icon" aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по товарам, например: Samsung Galaxy S24" aria-label="Поиск товаров" /><button type="submit" aria-label="Найти товар">→</button></form>
      <div className="popular-searches"><span>Популярные запросы</span><div>{popularSearches.map((item) => <button type="button" key={item} onClick={() => submitSearch(item)}>{item}</button>)}</div></div>
      <button className="catalog-summary" type="button" onClick={() => onOpenCatalog()}><span>Открыть каталог</span><p>Смартфоны · ноутбуки · ТВ · консоли и ещё</p></button>
      <img className="device-stage-image" src={isDarkTheme ? heroDevicesDark : heroDevices} alt="Ноутбук, смартфон Samsung, игровой контроллер и умные часы" />
  </section>
}
