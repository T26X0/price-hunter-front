import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getOffers } from '../../api/offers'
import { getPriceHistory } from '../../api/priceHistory'
import { getProduct } from '../../api/products'
import type { PriceHistoryPoint } from '../../api/types'
import { PriceAlertPanel } from './PriceAlertPanel'
import type { PriceAlert } from './priceAlerts'
import { storeBrandFor } from './storePresentation'

interface ProductDetailPageProps {
  sku: string
  isDarkTheme: boolean
  onToggleTheme: () => void
  onBack: () => void
  isInComparison: boolean
  isComparisonFull: boolean
  favoriteOfferIds: string[]
  onToggleComparison: () => void
  onToggleFavoriteOffer: (offerId: string) => void
  priceAlert?: PriceAlert
  onSavePriceAlert: (targetPrice: number, productName: string) => void
  city: string
}

type OfferSort = 'price-asc' | 'price-desc' | 'rating-desc'

const productGlyphs: Record<string, string> = {
  'Смартфоны': '▯',
  'Ноутбуки': '▱',
  'Телевизоры': '▣',
  'Игровые консоли': '⌁',
}

const formatNumber = new Intl.NumberFormat('ru-RU')
const formatHistoryDate = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' })

function parsedPrice(value: string) {
  const price = Number.parseInt(value, 10)
  return Number.isNaN(price) ? undefined : price
}

function formatPriceDate(value: string) {
  return formatHistoryDate.format(new Date(`${value}T12:00:00`))
}

function PriceHistoryChart({ points }: { points: PriceHistoryPoint[] }) {
  const width = 640
  const height = 184
  const padding = { top: 15, right: 14, bottom: 28, left: 14 }
  const prices = points.map((point) => point.price)
  const minimum = Math.min(...prices)
  const maximum = Math.max(...prices)
  const chartHeight = height - padding.top - padding.bottom
  const chartWidth = width - padding.left - padding.right
  const range = maximum - minimum || 1
  const coordinates = points.map((point, index) => ({
    x: padding.left + (chartWidth * index) / Math.max(points.length - 1, 1),
    y: padding.top + ((maximum - point.price) / range) * chartHeight,
  }))
  const line = coordinates.map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')
  const area = `${line} L ${coordinates[coordinates.length - 1].x} ${height - padding.bottom} L ${coordinates[0].x} ${height - padding.bottom} Z`
  const labels = [points[0], points[Math.floor(points.length / 2)], points[points.length - 1]]

  return <svg className="price-history-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Динамика минимальной цены за 30 дней">
    <defs><linearGradient id="price-history-gradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4d82ef" stopOpacity=".2" /><stop offset="100%" stopColor="#4d82ef" stopOpacity="0" /></linearGradient></defs>
    {[0, .5, 1].map((position) => <line key={position} x1={padding.left} x2={width - padding.right} y1={padding.top + chartHeight * position} y2={padding.top + chartHeight * position} />)}
    <path className="price-history-area" d={area} />
    <path className="price-history-line" d={line} />
    {coordinates.map(({ x, y }, index) => <circle key={points[index].date} cx={x} cy={y} r={index === coordinates.length - 1 ? 4.8 : 3.2} />)}
    {labels.map((point) => { const coordinate = coordinates[points.indexOf(point)]; return <text key={point.date} x={coordinate.x} y={height - 7} textAnchor={coordinate.x < width * .2 ? 'start' : coordinate.x > width * .8 ? 'end' : 'middle'}>{formatPriceDate(point.date)}</text> })}
  </svg>
}

export function ProductDetailPage({ sku, isDarkTheme, onToggleTheme, onBack, isInComparison, isComparisonFull, favoriteOfferIds, onToggleComparison, onToggleFavoriteOffer, priceAlert, onSavePriceAlert, city }: ProductDetailPageProps) {
  const productQuery = useQuery({ queryKey: ['product', sku], queryFn: () => getProduct(sku) })
  const offersQuery = useQuery({ queryKey: ['offers', sku, city], queryFn: () => getOffers({ sku, city }) })
  const priceHistoryQuery = useQuery({ queryKey: ['price-history', sku, city], queryFn: () => getPriceHistory(sku, city) })
  const [selectedStore, setSelectedStore] = useState('')
  const [priceFrom, setPriceFrom] = useState('')
  const [priceTo, setPriceTo] = useState('')
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [onlyFastDelivery, setOnlyFastDelivery] = useState(false)
  const [sort, setSort] = useState<OfferSort>('price-asc')

  const stores = useMemo(() => Array.from(new Set((offersQuery.data || []).map((offer) => offer.store))).sort((first, second) => first.localeCompare(second, 'ru')), [offersQuery.data])
  const filteredOffers = useMemo(() => {
    const minimumPrice = parsedPrice(priceFrom)
    const maximumPrice = parsedPrice(priceTo)
    const matchingOffers = (offersQuery.data || []).filter((offer) => (
      (!selectedStore || offer.store === selectedStore)
      && (minimumPrice === undefined || offer.price >= minimumPrice)
      && (maximumPrice === undefined || offer.price <= maximumPrice)
      && (!onlyInStock || offer.inStock)
      && (!onlyFastDelivery || (offer.inStock && (offer.delivery === 'Сегодня' || offer.delivery === 'Завтра')))
    ))

    return matchingOffers.sort((first, second) => {
      if (sort === 'price-desc') return second.price - first.price
      if (sort === 'rating-desc') return second.rating - first.rating || first.price - second.price
      return first.price - second.price
    })
  }, [offersQuery.data, onlyFastDelivery, onlyInStock, priceFrom, priceTo, selectedStore, sort])

  if (productQuery.isLoading) {
    return <section className="product-page product-page-state">Загружаем карточку товара…</section>
  }

  if (productQuery.isError || !productQuery.data) {
    return <section className="product-page product-page-state">Не удалось загрузить товар. Вернитесь к поиску и попробуйте снова.</section>
  }

  const product = productQuery.data
  const offerCount = offersQuery.data?.length || 0
  const hasActiveFilters = Boolean(selectedStore || priceFrom || priceTo || onlyInStock || onlyFastDelivery)
  const resetFilters = () => {
    setSelectedStore('')
    setPriceFrom('')
    setPriceTo('')
    setOnlyInStock(false)
    setOnlyFastDelivery(false)
    setSort('price-asc')
  }
  const countLabel = filteredOffers.length === offerCount
    ? `${offerCount} ${offerCount === 1 ? 'магазин' : offerCount < 5 ? 'магазина' : 'магазинов'}`
    : `Показано ${filteredOffers.length} из ${offerCount}`
  const priceHistory = priceHistoryQuery.data || []
  const firstHistoryPoint = priceHistory[0]
  const latestHistoryPoint = priceHistory[priceHistory.length - 1]
  const lowestHistoryPoint = priceHistory.reduce<PriceHistoryPoint | undefined>((lowest, point) => !lowest || point.price < lowest.price ? point : lowest, undefined)
  const priceChange = firstHistoryPoint && latestHistoryPoint ? latestHistoryPoint.price - firstHistoryPoint.price : 0
  const priceChangePercent = firstHistoryPoint ? Math.round((priceChange / firstHistoryPoint.price) * 100) : 0

  return <section className="product-page" aria-labelledby="product-title">
    <button className="theme-button product-theme-button" type="button" aria-label={isDarkTheme ? 'Включить светлую тему' : 'Включить тёмную тему'} aria-pressed={isDarkTheme} onClick={onToggleTheme}>{isDarkTheme ? '☀' : '☾'}</button>
    <button className="product-back" type="button" onClick={onBack}>← Назад</button>
    <header className="product-header">
      <div>
        <span className="overline">{product.category} · {product.brand}</span>
        <h1 id="product-title">{product.name}</h1>
        <p>{product.description}</p>
      </div>
      <div className="product-header-actions"><button className="product-compare-button" type="button" onClick={onToggleComparison} disabled={!isInComparison && isComparisonFull}>{isInComparison ? 'В сравнении ✓' : isComparisonFull ? 'Выбрано 2 из 2' : 'В сравнение'}</button><span className="product-sku">{product.sku}</span></div>
    </header>

    <section className="product-overview" aria-label="Характеристики товара">
      <div className="product-detail-visual" aria-hidden="true">{productGlyphs[product.category] || '◇'}</div>
      <div className="product-specifications">
        <h2>Характеристики</h2>
        <dl>{product.specifications.map((specification) => <div key={specification.label}><dt>{specification.label}</dt><dd>{specification.value}</dd></div>)}</dl>
      </div>
    </section>

    <section className="product-price-history" aria-labelledby="price-history-title">
      <header><div><span className="overline">Динамика цены · город: {city.trim() || 'не выбран'}</span><h2 id="price-history-title">История цены</h2></div><span>30 дней</span></header>
      {priceHistoryQuery.isLoading ? <p className="price-history-state">Загружаем историю цены…</p> : priceHistoryQuery.isError || !priceHistory.length || !latestHistoryPoint || !lowestHistoryPoint ? <p className="price-history-state">История цены пока недоступна.</p> : <div className="price-history-content"><div className="price-history-visual"><PriceHistoryChart points={priceHistory} /></div><aside className="price-history-summary"><div><span>Сейчас от</span><strong>{formatNumber.format(latestHistoryPoint.price)} ₽</strong></div><div><span>Минимум за 30 дней</span><strong>{formatNumber.format(lowestHistoryPoint.price)} ₽</strong><small>{formatPriceDate(lowestHistoryPoint.date)}</small></div><div className={priceChange <= 0 ? 'price-history-change lower' : 'price-history-change higher'}><span>Изменение за период</span><strong>{priceChange <= 0 ? '↓' : '↑'} {formatNumber.format(Math.abs(priceChange))} ₽</strong><small>{priceChangePercent <= 0 ? '' : '+'}{priceChangePercent}%</small></div></aside></div>}
    </section>

    {latestHistoryPoint && <PriceAlertPanel alert={priceAlert} currentPrice={latestHistoryPoint.price} productName={product.name} onSave={(targetPrice) => onSavePriceAlert(targetPrice, product.name)} />}

    <section className="product-offers" aria-labelledby="offers-title">
      <header className="product-offers-heading"><div><span className="overline">Сравнение цен · город: {city.trim() || 'не выбран'}</span><h2 id="offers-title">Предложения магазинов</h2></div><span>{countLabel}</span></header>
      {offersQuery.isLoading ? <p className="product-offers-state">Загружаем предложения…</p> : offersQuery.isError ? <p className="product-offers-state">Не удалось загрузить предложения. Повторите попытку позже.</p> : offerCount ? <>
        <div className="product-offer-filters" aria-label="Фильтры предложений">
          <label><span>Магазин</span><select value={selectedStore} onChange={(event) => setSelectedStore(event.target.value)}><option value="">Все магазины</option>{stores.map((store) => <option key={store} value={store}>{store}</option>)}</select></label>
          <label><span>Цена от</span><input type="number" min="0" inputMode="numeric" value={priceFrom} onChange={(event) => setPriceFrom(event.target.value)} placeholder="₽" aria-label="Цена от" /></label>
          <label><span>Цена до</span><input type="number" min="0" inputMode="numeric" value={priceTo} onChange={(event) => setPriceTo(event.target.value)} placeholder="₽" aria-label="Цена до" /></label>
          <label className="offer-filter-check"><input type="checkbox" checked={onlyInStock} onChange={(event) => setOnlyInStock(event.target.checked)} />Только в наличии</label>
          <label className="offer-filter-check"><input type="checkbox" checked={onlyFastDelivery} onChange={(event) => setOnlyFastDelivery(event.target.checked)} />Доставка сегодня или завтра</label>
          <label className="offer-sort"><span>Сортировка</span><select value={sort} onChange={(event) => setSort(event.target.value as OfferSort)} aria-label="Сортировка предложений"><option value="price-asc">Сначала дешевле</option><option value="price-desc">Сначала дороже</option><option value="rating-desc">По рейтингу</option></select></label>
          <button className="offer-filter-reset" type="button" onClick={resetFilters} disabled={!hasActiveFilters && sort === 'price-asc'}>Сбросить</button>
        </div>
        {filteredOffers.length ? <><div className="product-offer-columns" aria-hidden="true"><span>Магазин</span><span>Вариант и доставка</span><span>Рейтинг</span><span>Цена</span></div><div>{filteredOffers.map((offer) => {
          const storeBrand = storeBrandFor(offer.store)
          const isFavorite = favoriteOfferIds.includes(offer.id)
          return <article className="product-offer-row" key={offer.id}><div className="product-offer-store"><span className={`offer-store-logo ${storeBrand.tone}`} aria-hidden="true">{storeBrand.label}</span><strong>{offer.store}</strong></div><div className="product-offer-variant"><span>{offer.variant}</span><small><b className={offer.inStock ? 'in-stock' : 'out-of-stock'}>{offer.inStock ? 'В наличии' : 'Под заказ'}</b>{offer.inStock && <span>Доставка {offer.delivery}</span>}</small></div><span className="offer-rating" aria-label={`Рейтинг магазина ${offer.rating.toFixed(1)}`}><span><b>★</b> {offer.rating.toFixed(1)}</span><small>{formatNumber.format(offer.reviews)} отзывов</small></span><strong className="offer-price">от {formatNumber.format(offer.price)} ₽</strong><button className={`product-offer-favorite${isFavorite ? ' active' : ''}`} type="button" onClick={() => onToggleFavoriteOffer(offer.id)} aria-pressed={isFavorite} aria-label={isFavorite ? `Убрать вариант ${offer.variant} из избранного` : `Добавить вариант ${offer.variant} в избранное`}>{isFavorite ? '♥' : '♡'}</button><a className="product-offer-link" href={offer.url} target="_blank" rel="noreferrer" aria-label={`Перейти к предложению ${offer.name} в магазине ${offer.store}`}><span className="product-offer-link-label">Перейти</span><span aria-hidden="true">↗</span></a></article>
        })}</div></> : <div className="product-offers-empty"><strong>Ничего не найдено</strong><span>Измените фильтры, чтобы увидеть другие предложения.</span><button type="button" onClick={resetFilters}>Сбросить фильтры</button></div>}
      </> : <p className="product-offers-state">Предложений для этой модели пока нет.</p>}
    </section>
  </section>
}
