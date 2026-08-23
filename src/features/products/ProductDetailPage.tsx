import { useQuery } from '@tanstack/react-query'
import { getOffers } from '../../api/offers'
import { getProduct } from '../../api/products'
import { storeBrandFor } from './storePresentation'

interface ProductDetailPageProps {
  sku: string
  isDarkTheme: boolean
  onToggleTheme: () => void
  onBack: () => void
}

const productGlyphs: Record<string, string> = {
  'Смартфоны': '▯',
  'Ноутбуки': '▱',
  'Телевизоры': '▣',
  'Игровые консоли': '⌁',
}

const formatNumber = new Intl.NumberFormat('ru-RU')

export function ProductDetailPage({ sku, isDarkTheme, onToggleTheme, onBack }: ProductDetailPageProps) {
  const productQuery = useQuery({ queryKey: ['product', sku], queryFn: () => getProduct(sku) })
  const offersQuery = useQuery({ queryKey: ['offers', sku], queryFn: () => getOffers({ sku }) })

  if (productQuery.isLoading) {
    return <section className="product-page product-page-state">Загружаем карточку товара…</section>
  }

  if (productQuery.isError || !productQuery.data) {
    return <section className="product-page product-page-state">Не удалось загрузить товар. Вернитесь к поиску и попробуйте снова.</section>
  }

  const product = productQuery.data
  const offers = offersQuery.data || []

  return <section className="product-page" aria-labelledby="product-title">
    <button className="theme-button product-theme-button" type="button" aria-label={isDarkTheme ? 'Включить светлую тему' : 'Включить тёмную тему'} aria-pressed={isDarkTheme} onClick={onToggleTheme}>{isDarkTheme ? '☀' : '☾'}</button>
    <button className="product-back" type="button" onClick={onBack}>← Назад к поиску</button>
    <header className="product-header">
      <div>
        <span className="overline">{product.category} · {product.brand}</span>
        <h1 id="product-title">{product.name}</h1>
        <p>{product.description}</p>
      </div>
      <span className="product-sku">{product.sku}</span>
    </header>

    <section className="product-overview" aria-label="Характеристики товара">
      <div className="product-detail-visual" aria-hidden="true">{productGlyphs[product.category] || '◇'}</div>
      <div className="product-specifications">
        <h2>Характеристики</h2>
        <dl>{product.specifications.map((specification) => <div key={specification.label}><dt>{specification.label}</dt><dd>{specification.value}</dd></div>)}</dl>
      </div>
    </section>

    <section className="product-offers" aria-labelledby="offers-title">
      <header className="product-offers-heading"><div><span className="overline">Сравнение цен</span><h2 id="offers-title">Предложения магазинов</h2></div><span>{offers.length} {offers.length === 1 ? 'магазин' : offers.length < 5 ? 'магазина' : 'магазинов'}</span></header>
      {offersQuery.isLoading ? <p className="product-offers-state">Загружаем предложения…</p> : offersQuery.isError ? <p className="product-offers-state">Не удалось загрузить предложения. Повторите попытку позже.</p> : offers.length ? <><div className="product-offer-columns" aria-hidden="true"><span>Магазин</span><span>Рейтинг</span><span>Цена</span></div><div>{offers.map((offer) => { const storeBrand = storeBrandFor(offer.store); return <article className="product-offer-row" key={offer.id}><div className="product-offer-store"><span className={`offer-store-logo ${storeBrand.tone}`} aria-hidden="true">{storeBrand.label}</span><strong>{offer.store}</strong></div><span className="offer-rating" aria-label={`Рейтинг магазина ${offer.rating.toFixed(1)}`}><span><b>★</b> {offer.rating.toFixed(1)}</span><small>{formatNumber.format(offer.reviews)} отзывов</small></span><strong className="offer-price">от {formatNumber.format(offer.price)} ₽</strong><button type="button" aria-label={`Перейти к предложению ${offer.name} в магазине ${offer.store}`}>→</button></article>})}</div></> : <p className="product-offers-state">Предложений для этой модели пока нет.</p>}
    </section>
  </section>
}
