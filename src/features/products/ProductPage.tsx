import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getOffers } from '../../api/offers'
import heroDevices from '../../assets/price-hunter-devices.png'
import heroDevicesDark from '../../assets/price-hunter-devices-dark.png'
import { storeBrandFor } from './storePresentation'

const popularSearches = ['Samsung Galaxy S24', 'Xiaomi 14', 'ASUS ROG Zephyrus G14', 'Sony PlayStation 5', 'LG OLED C4']
const homeSearchStorageKey = 'price-hunter-home-search'

type HomeSearchState = {
  query: string
  submittedQuery: string
  minimumRating: number
}

function readHomeSearchState(): HomeSearchState {
  try {
    const value = JSON.parse(window.sessionStorage.getItem(homeSearchStorageKey) || 'null')
    if (value && typeof value.query === 'string' && typeof value.submittedQuery === 'string' && typeof value.minimumRating === 'number') return value
  } catch {
    // A malformed browser value must not block the search screen.
  }

  return { query: '', submittedQuery: '', minimumRating: 0 }
}

interface ProductPageProps {
  isDarkTheme: boolean
  onToggleTheme: () => void
  onOpenCatalog: () => void
  onOpenProduct: (sku: string) => void
  city: string
}

export function ProductPage({ isDarkTheme, onToggleTheme, onOpenCatalog, onOpenProduct, city }: ProductPageProps) {
  const initialSearchState = readHomeSearchState()
  const [query, setQuery] = useState(initialSearchState.query)
  const [submittedQuery, setSubmittedQuery] = useState(initialSearchState.submittedQuery)
  const [minimumRating, setMinimumRating] = useState(initialSearchState.minimumRating)
  const offersQuery = useQuery({
    queryKey: ['offers', submittedQuery, city],
    queryFn: () => getOffers({ query: submittedQuery, city }),
    enabled: Boolean(submittedQuery),
  })
  const suggestionsQuery = useQuery({
    queryKey: ['offer-suggestions', query, city],
    queryFn: () => getOffers({ query, city }),
    enabled: query.trim().length >= 2 && query !== submittedQuery,
  })
  const offers = offersQuery.data || []
  const filteredOffers = offers.filter((offer) => offer.rating >= minimumRating)
  const suggestionOffers = (suggestionsQuery.data || []).filter((offer, index, allOffers) => allOffers.findIndex((item) => item.sku === offer.sku) === index).slice(0, 5)
  const showSuggestions = query.trim().length >= 2 && query !== submittedQuery
  const submitSearch = (value = query) => {
    setQuery(value)
    setSubmittedQuery(value)
  }

  useEffect(() => {
    window.sessionStorage.setItem(homeSearchStorageKey, JSON.stringify({ query, submittedQuery, minimumRating }))
  }, [minimumRating, query, submittedQuery])

  const openOffer = (sku: string) => onOpenProduct(sku)
  const handleOfferKeyDown = (event: React.KeyboardEvent<HTMLElement>, sku: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openOffer(sku)
    }
  }

  return <section className={`home-screen${submittedQuery ? ' has-search-results' : ''}`} id="home">
      <button className="theme-button" type="button" aria-label={isDarkTheme ? 'Включить светлую тему' : 'Включить тёмную тему'} aria-pressed={isDarkTheme} onClick={onToggleTheme}>{isDarkTheme ? '☀' : '☾'}</button>
      <div className="hero-copy"><span className="overline">Price Hunter · каталог техники</span><h1>Найдите лучшую цену<br />на технику <em>всех брендов</em></h1><p>Сравниваем предложения проверенных магазинов, чтобы вы могли покупать выгодно.</p></div>
      <div className="search-box-wrap"><form className="search-box" role="search" onSubmit={(event) => { event.preventDefault(); submitSearch() }}><span className="search-icon" aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по товарам, например: Samsung Galaxy S24" aria-label="Поиск товаров" aria-expanded={showSuggestions} aria-controls={showSuggestions ? 'product-search-suggestions' : undefined} />{submittedQuery && <button className="clear-search" type="button" onClick={() => { setQuery(''); setSubmittedQuery('') }} aria-label="Очистить поиск">×</button>}<button type="submit" aria-label="Найти товар">→</button></form>{showSuggestions && <div className="search-suggestions" id="product-search-suggestions" aria-live="polite">{suggestionsQuery.isLoading ? <span>Ищем модели…</span> : suggestionOffers.length ? <>{suggestionOffers.map((offer) => <button key={offer.sku} type="button" onClick={() => submitSearch(offer.name)}><span className="search-suggestion-visual" aria-hidden="true">▯</span><span><strong>{offer.name}</strong><small>{offer.category} · от {new Intl.NumberFormat('ru-RU').format(offer.price)} ₽</small></span><b aria-hidden="true">↗</b></button>)}</> : <span>Ничего не нашли. Попробуйте указать бренд или модель точнее.</span>}</div>}</div>
      {submittedQuery && <section className="home-search-results" aria-live="polite" aria-label="Результаты поиска"><div className="home-search-results-head"><span>{offersQuery.isLoading ? 'Ищем предложения…' : offersQuery.isError ? 'Не удалось загрузить предложения' : filteredOffers.length ? `Найдено ${filteredOffers.length} ${filteredOffers.length === 1 ? 'предложение' : filteredOffers.length < 5 ? 'предложения' : 'предложений'} для сравнения` : offers.length ? 'Нет предложений с выбранным рейтингом' : 'Модели не найдены'}</span><div className="search-results-meta"><small>Город: {city.trim() || 'не выбран'}</small><label className="search-rating-filter"><span>Рейтинг</span><select value={minimumRating} onChange={(event) => setMinimumRating(Number(event.target.value))} aria-label="Минимальный рейтинг магазина"><option value="0">Любой</option><option value="4.5">От 4,5 ★</option><option value="4.7">От 4,7 ★</option><option value="4.8">От 4,8 ★</option></select></label>{filteredOffers.length > 1 && <small>Сначала дешевле ↓</small>}</div></div>{offersQuery.isLoading ? <p>Загружаем актуальные предложения магазинов…</p> : offersQuery.isError ? <p>Проверьте, что временный API запущен, и повторите поиск.</p> : filteredOffers.length ? <><div className="offer-columns" aria-hidden="true"><span>Модель</span><span>Магазин</span><span>Рейтинг</span><span>Цена</span></div><div>{filteredOffers.map((offer) => { const storeBrand = storeBrandFor(offer.store); return <article key={offer.id} className="search-offer-card" role="link" tabIndex={0} onClick={() => openOffer(offer.sku)} onKeyDown={(event) => handleOfferKeyDown(event, offer.sku)} aria-label={`Открыть страницу товара ${offer.name} из магазина ${offer.store}`}><span className="offer-device" aria-hidden="true">▯</span><div className="offer-name"><strong>{offer.name}</strong></div><div className="offer-store"><span className={`offer-store-logo ${storeBrand.tone}`} aria-hidden="true">{storeBrand.label}</span><span className="offer-store-name">{offer.store}</span></div><span className="offer-rating" aria-label={`Рейтинг магазина ${offer.rating.toFixed(1)}`}><span><b>★</b> {offer.rating.toFixed(1)}</span><small>{new Intl.NumberFormat('ru-RU').format(offer.reviews)} отзывов</small></span><strong className="offer-price">от {new Intl.NumberFormat('ru-RU').format(offer.price)} ₽</strong><span className="offer-open-arrow" aria-hidden="true">→</span></article>})}</div></> : <p>{offers.length ? 'Снизьте минимальный рейтинг или выберите «Любой».' : 'Попробуйте указать точнее: бренд и модель.'}</p>}</section>}
      <div className="popular-searches"><span>Популярные запросы</span><div>{popularSearches.map((item) => <button type="button" key={item} onClick={() => submitSearch(item)}>{item}</button>)}</div></div>
      <button className="catalog-summary" type="button" onClick={() => onOpenCatalog()}><span>Открыть каталог</span><p>Смартфоны · ноутбуки · ТВ · консоли и ещё</p></button>
      <img className="device-stage-image" src={isDarkTheme ? heroDevicesDark : heroDevices} alt="Ноутбук, смартфон Samsung, игровой контроллер и умные часы" />
  </section>
}
