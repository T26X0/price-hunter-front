import { useMemo, useState } from 'react'
import heroDevices from '../../assets/price-hunter-devices.png'
import heroDevicesDark from '../../assets/price-hunter-devices-dark.png'
import { findOffers } from './searchOffers'

const popularSearches = ['Samsung Galaxy S24', 'Xiaomi 14', 'ASUS ROG Zephyrus G14', 'Sony PlayStation 5', 'LG OLED C4']

const storeBrands: Record<string, { label: string; tone: string }> = {
  'М.Видео': { label: 'M.', tone: 'mvideo' },
  'Ситилинк': { label: 'C', tone: 'citilink' },
  Ozon: { label: 'O', tone: 'ozon' },
  'Яндекс Маркет': { label: 'Я', tone: 'yandex-market' },
  DNS: { label: 'DNS', tone: 'dns' },
  'restore:': { label: 're', tone: 'restore' },
  'Эльдорадо': { label: 'Э', tone: 'eldorado' },
}

const storeReviews: Record<string, string> = {
  'М.Видео': '112 342',
  'Ситилинк': '84 719',
  Ozon: '98 765',
  'Яндекс Маркет': '76 401',
  DNS: '91 238',
  'restore:': '17 942',
  'Эльдорадо': '64 325',
}

interface ProductPageProps {
  isDarkTheme: boolean
  onToggleTheme: () => void
  onOpenCatalog: () => void
}

export function ProductPage({ isDarkTheme, onToggleTheme, onOpenCatalog }: ProductPageProps) {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const offers = useMemo(() => findOffers(submittedQuery), [submittedQuery])
  const submitSearch = (value = query) => {
    setQuery(value)
    setSubmittedQuery(value)
  }

  return <section className={`home-screen${submittedQuery ? ' has-search-results' : ''}`} id="home">
      <button className="theme-button" type="button" aria-label={isDarkTheme ? 'Включить светлую тему' : 'Включить тёмную тему'} aria-pressed={isDarkTheme} onClick={onToggleTheme}>{isDarkTheme ? '☀' : '☾'}</button>
      <div className="hero-copy"><span className="overline">Price Hunter · каталог техники</span><h1>Найдите лучшую цену<br />на технику <em>всех брендов</em></h1><p>Сравниваем предложения проверенных магазинов, чтобы вы могли покупать выгодно.</p></div>
      <form className="search-box" role="search" onSubmit={(event) => { event.preventDefault(); submitSearch() }}><span className="search-icon" aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по товарам, например: Samsung Galaxy S24" aria-label="Поиск товаров" />{submittedQuery && <button className="clear-search" type="button" onClick={() => { setQuery(''); setSubmittedQuery('') }} aria-label="Очистить поиск">×</button>}<button type="submit" aria-label="Найти товар">→</button></form>
      {submittedQuery && <section className="home-search-results" aria-live="polite" aria-label="Результаты поиска"><div className="home-search-results-head"><span>{offers.length ? `Найдено ${offers.length} ${offers.length === 1 ? 'предложение' : offers.length < 5 ? 'предложения' : 'предложений'} для сравнения` : 'Модели не найдены'}</span>{offers.length > 1 && <small>Сначала дешевле ↓</small>}</div>{offers.length ? <><div className="offer-columns" aria-hidden="true"><span>Модель</span><span>Магазин</span><span>Рейтинг</span><span>Цена</span></div><div>{offers.map((offer) => { const storeBrand = storeBrands[offer.store] || { label: offer.store.slice(0, 1), tone: 'default' }; const reviewCount = storeReviews[offer.store] || '1 000'; return <article key={offer.id}><span className="offer-device" aria-hidden="true">▯</span><div className="offer-name"><strong>{offer.name}</strong></div><div className="offer-store"><span className={`offer-store-logo ${storeBrand.tone}`} aria-hidden="true">{storeBrand.label}</span><span className="offer-store-name">{offer.store}</span></div><span className="offer-rating" aria-label={`Рейтинг магазина ${offer.rating.toFixed(1)}`}><span><b>★</b> {offer.rating.toFixed(1)}</span><small>{reviewCount} отзывов</small></span><strong className="offer-price">от {new Intl.NumberFormat('ru-RU').format(offer.price)} ₽</strong><button type="button" aria-label={`Перейти к предложению ${offer.name}`}>→</button></article>})}</div></> : <p>Попробуйте указать точнее: бренд и модель.</p>}</section>}
      <div className="popular-searches"><span>Популярные запросы</span><div>{popularSearches.map((item) => <button type="button" key={item} onClick={() => submitSearch(item)}>{item}</button>)}</div></div>
      <button className="catalog-summary" type="button" onClick={() => onOpenCatalog()}><span>Открыть каталог</span><p>Смартфоны · ноутбуки · ТВ · консоли и ещё</p></button>
      <img className="device-stage-image" src={isDarkTheme ? heroDevicesDark : heroDevices} alt="Ноутбук, смартфон Samsung, игровой контроллер и умные часы" />
  </section>
}
