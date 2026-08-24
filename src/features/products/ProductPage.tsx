import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getOffers } from '../../api/offers'
import heroDevices from '../../assets/price-hunter-devices.png'
import heroDevicesDark from '../../assets/price-hunter-devices-dark.png'
import { storeBrandFor } from './storePresentation'

const popularSearches = ['Samsung Galaxy S24', 'Xiaomi 14', 'ASUS ROG Zephyrus G14', 'Sony PlayStation 5', 'LG OLED C4']

interface ProductPageProps {
  isDarkTheme: boolean
  onToggleTheme: () => void
  onOpenCatalog: () => void
  onOpenProduct: (sku: string) => void
  city: string
}

export function ProductPage({ isDarkTheme, onToggleTheme, onOpenCatalog, onOpenProduct, city }: ProductPageProps) {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const offersQuery = useQuery({
    queryKey: ['offers', submittedQuery, city],
    queryFn: () => getOffers({ query: submittedQuery, city }),
    enabled: Boolean(submittedQuery),
  })
  const offers = offersQuery.data || []
  const submitSearch = (value = query) => {
    setQuery(value)
    setSubmittedQuery(value)
  }

  return <section className={`home-screen${submittedQuery ? ' has-search-results' : ''}`} id="home">
      <button className="theme-button" type="button" aria-label={isDarkTheme ? 'Включить светлую тему' : 'Включить тёмную тему'} aria-pressed={isDarkTheme} onClick={onToggleTheme}>{isDarkTheme ? '☀' : '☾'}</button>
      <div className="hero-copy"><span className="overline">Price Hunter · каталог техники</span><h1>Найдите лучшую цену<br />на технику <em>всех брендов</em></h1><p>Сравниваем предложения проверенных магазинов, чтобы вы могли покупать выгодно.</p></div>
      <form className="search-box" role="search" onSubmit={(event) => { event.preventDefault(); submitSearch() }}><span className="search-icon" aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по товарам, например: Samsung Galaxy S24" aria-label="Поиск товаров" />{submittedQuery && <button className="clear-search" type="button" onClick={() => { setQuery(''); setSubmittedQuery('') }} aria-label="Очистить поиск">×</button>}<button type="submit" aria-label="Найти товар">→</button></form>
      {submittedQuery && <section className="home-search-results" aria-live="polite" aria-label="Результаты поиска"><div className="home-search-results-head"><span>{offersQuery.isLoading ? 'Ищем предложения…' : offersQuery.isError ? 'Не удалось загрузить предложения' : offers.length ? `Найдено ${offers.length} ${offers.length === 1 ? 'предложение' : offers.length < 5 ? 'предложения' : 'предложений'} для сравнения` : 'Модели не найдены'}</span><div className="search-results-meta"><small>Город: {city.trim() || 'не выбран'}</small>{offers.length > 1 && <small>Сначала дешевле ↓</small>}</div></div>{offersQuery.isLoading ? <p>Загружаем актуальные предложения магазинов…</p> : offersQuery.isError ? <p>Проверьте, что временный API запущен, и повторите поиск.</p> : offers.length ? <><div className="offer-columns" aria-hidden="true"><span>Модель</span><span>Магазин</span><span>Рейтинг</span><span>Цена</span></div><div>{offers.map((offer) => { const storeBrand = storeBrandFor(offer.store); return <article key={offer.id}><span className="offer-device" aria-hidden="true">▯</span><div className="offer-name"><strong>{offer.name}</strong></div><div className="offer-store"><span className={`offer-store-logo ${storeBrand.tone}`} aria-hidden="true">{storeBrand.label}</span><span className="offer-store-name">{offer.store}</span></div><span className="offer-rating" aria-label={`Рейтинг магазина ${offer.rating.toFixed(1)}`}><span><b>★</b> {offer.rating.toFixed(1)}</span><small>{new Intl.NumberFormat('ru-RU').format(offer.reviews)} отзывов</small></span><strong className="offer-price">от {new Intl.NumberFormat('ru-RU').format(offer.price)} ₽</strong><button type="button" onClick={() => onOpenProduct(offer.sku)} aria-label={`Открыть страницу товара ${offer.name}`}>→</button></article>})}</div></> : <p>Попробуйте указать точнее: бренд и модель.</p>}</section>}
      <div className="popular-searches"><span>Популярные запросы</span><div>{popularSearches.map((item) => <button type="button" key={item} onClick={() => submitSearch(item)}>{item}</button>)}</div></div>
      <button className="catalog-summary" type="button" onClick={() => onOpenCatalog()}><span>Открыть каталог</span><p>Смартфоны · ноутбуки · ТВ · консоли и ещё</p></button>
      <img className="device-stage-image" src={isDarkTheme ? heroDevicesDark : heroDevices} alt="Ноутбук, смартфон Samsung, игровой контроллер и умные часы" />
  </section>
}
