import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { priceHunterApi } from '../../api/backend/priceHunterApi'
import type { Offer, ProductListItem, ProductVariant } from '../../api/backend/types'

const currency = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 })
const dateTime = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })

/** Formats nullable prices without ever presenting a missing value as a zero price. */
function price(value: number | null, code = 'RUB') {
  return value === null ? 'Нет актуальной цены' : code === 'RUB' ? currency.format(value) : `${value} ${code}`
}

/** Converts technical availability statuses into texts intended for a shopper. */
function availability(value: Offer['availability']) {
  return ({ IN_STOCK: 'В наличии', OUT_OF_STOCK: 'Нет в наличии', PREORDER: 'Предзаказ', UNKNOWN: 'Уточняется' })[value]
}

/** Renders the production storefront and only queries real public API endpoints. */
export function LiveCatalogApp() {
  const [cityId, setCityId] = useState('')
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [selectedCatalogKey, setSelectedCatalogKey] = useState<string | null>(null)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

  const cities = useQuery({ queryKey: ['cities'], queryFn: priceHunterApi.getCities })
  const products = useQuery({
    queryKey: ['products', cityId, submittedQuery],
    queryFn: () => priceHunterApi.getProducts({ cityId, q: submittedQuery || undefined, page: 0, size: 30 }),
    enabled: Boolean(cityId),
  })
  const product = useQuery({
    queryKey: ['product', selectedCatalogKey, cityId],
    queryFn: () => priceHunterApi.getProduct(selectedCatalogKey!, cityId),
    enabled: Boolean(selectedCatalogKey && cityId),
  })

  useEffect(() => {
    setSelectedVariantId(null)
  }, [selectedCatalogKey, cityId])

  const activeVariant = useMemo<ProductVariant | undefined>(() => {
    const variants = product.data?.variants ?? []
    return variants.find((variant) => variant.id === selectedVariantId) ?? variants[0]
  }, [product.data?.variants, selectedVariantId])

  const offers = useQuery({
    queryKey: ['offers', activeVariant?.id, cityId],
    queryFn: () => priceHunterApi.getVariantOffers(activeVariant!.id, cityId, { page: 0, size: 20 }),
    enabled: Boolean(activeVariant && cityId),
  })
  const firstOffer = offers.data?.items[0]
  const history = useQuery({
    queryKey: ['offer-history', firstOffer?.id],
    queryFn: () => priceHunterApi.getOfferHistory(firstOffer!.id, {
      from: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      to: new Date().toISOString(),
    }),
    enabled: Boolean(firstOffer),
  })

  const selectedCity = cities.data?.find((city) => city.id === cityId)
  const openProduct = (item: ProductListItem) => {
    setSelectedCatalogKey(item.catalogKey)
    setSelectedVariantId(null)
  }

  return <main className="live-app">
    <header className="live-header">
      <a className="live-brand" href="/" onClick={(event) => { event.preventDefault(); setSelectedCatalogKey(null) }}><b>PH</b><span>Price Hunter</span></a>
      <span className="live-status"><i />Подключено к реальному API</span>
    </header>

    <section className="live-hero">
      <p className="live-eyebrow">Сравнение цен по городам</p>
      <h1>Найдите технику по <em>честной цене.</em></h1>
      <p>Цены, наличие, условия покупки и история изменений — из единой базы Price Hunter.</p>
    </section>

    <section className="live-controls" aria-label="Поиск в каталоге">
      <label>Город
        <select value={cityId} onChange={(event) => { setCityId(event.target.value); setSelectedCatalogKey(null) }} disabled={cities.isLoading}>
          <option value="">{cities.isLoading ? 'Загружаем города…' : 'Выберите город'}</option>
          {(cities.data ?? []).map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
        </select>
      </label>
      <form onSubmit={(event) => { event.preventDefault(); setSubmittedQuery(query.trim()) }}>
        <label>Модель или бренд
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Например, iPhone 16 Pro" disabled={!cityId} />
        </label>
        <button type="submit" disabled={!cityId}>Найти</button>
      </form>
    </section>

    {cities.isError && <p className="live-notice error">Не удалось загрузить города. Проверьте соединение с API и обновите страницу.</p>}
    {!cities.isLoading && !cities.isError && !cities.data?.length && <p className="live-notice">Города ещё не добавлены в базу. После первого импорта парсером здесь появится выбор города и каталог.</p>}
    {!cityId && cities.data?.length ? <p className="live-notice">Выберите город — цены и наличие всегда считаются именно для него.</p> : null}

    {cityId && !selectedCatalogKey && <section className="live-section">
      <div className="live-section-heading"><div><p className="live-eyebrow">Каталог</p><h2>{selectedCity ? `Товары в городе ${selectedCity.name}` : 'Товары'}</h2></div><span>{products.data ? `${products.data.items.length} позиций` : ''}</span></div>
      {products.isLoading && <p className="live-notice">Загружаем каталог…</p>}
      {products.isError && <p className="live-notice error">Каталог пока недоступен. Попробуйте обновить страницу.</p>}
      {products.data && !products.data.items.length && <p className="live-notice">По этому запросу пока нет товаров. Это реальные данные: каталог заполнится после запуска парсера.</p>}
      <div className="live-product-grid">{products.data?.items.map((item) => <button className="live-product" type="button" key={item.id} onClick={() => openProduct(item)}><span className="live-product-icon">◈</span><small>{item.brand || 'Без бренда'} · {item.category || 'Каталог'}</small><strong>{item.name}</strong><em>{price(item.minEffectivePrice, item.currency || 'RUB')}</em><span>{item.offerCount} предложений</span></button>)}</div>
    </section>}

    {selectedCatalogKey && <section className="live-section live-detail">
      <button className="live-back" type="button" onClick={() => setSelectedCatalogKey(null)}>← К каталогу</button>
      {product.isLoading && <p className="live-notice">Загружаем карточку товара…</p>}
      {product.isError && <p className="live-notice error">Не удалось загрузить карточку товара.</p>}
      {product.data && <>
        <div className="live-section-heading"><div><p className="live-eyebrow">Карточка товара · {selectedCity?.name}</p><h2>{product.data.name}</h2><p>{product.data.brand || 'Бренд не указан'} · {product.data.description || 'Описание ещё не добавлено'}</p></div><strong>{price(product.data.minEffectivePrice, product.data.currency || 'RUB')}</strong></div>
        <div className="live-variants" aria-label="Конфигурации товара">{product.data.variants.map((variant) => <button key={variant.id} type="button" className={activeVariant?.id === variant.id ? 'selected' : ''} onClick={() => setSelectedVariantId(variant.id)}><strong>{variant.displayName}</strong><span>{variant.available ? 'В наличии' : 'Нет в наличии'} · {price(variant.minEffectivePrice, variant.currency || 'RUB')}</span></button>)}</div>
        {!product.data.variants.length && <p className="live-notice">Для этой модели пока нет конфигураций.</p>}
      </>}

      {activeVariant && <section className="live-offers"><div className="live-section-heading"><div><p className="live-eyebrow">Предложения</p><h2>{activeVariant.displayName}</h2></div><span>{offers.data ? `${offers.data.items.length} магазинов` : ''}</span></div>
        {offers.isLoading && <p className="live-notice">Проверяем актуальные предложения…</p>}
        {offers.isError && <p className="live-notice error">Не удалось загрузить предложения.</p>}
        {offers.data && !offers.data.items.length && <p className="live-notice">Для этой конфигурации пока нет предложений в выбранном городе.</p>}
        <div className="live-offer-list">{offers.data?.items.map((offer) => <OfferRow key={offer.id} offer={offer} />)}</div>
        {firstOffer && <div className="live-history"><h3>История цены лучшего предложения</h3>{history.isLoading ? <p>Загружаем историю…</p> : history.data?.length ? <ol>{history.data.slice(-8).reverse().map((point) => <li key={point.id}><time>{dateTime.format(new Date(point.validFrom))}</time><strong>{price(point.effectivePrice, point.currency)}</strong><span>{availability(point.availability)}</span></li>)}</ol> : <p>История начнёт формироваться после первого изменения цены.</p>}</div>}
      </section>}
    </section>}
  </main>
}

/** Displays one store offer with the commercial fields returned by the backend. */
function OfferRow({ offer }: { offer: Offer }) {
  return <article className="live-offer"><div><strong>{offer.chainName}</strong><span>{offer.store ? offer.store.name : 'Цена для города'} · {availability(offer.availability)}</span></div><div className="live-offer-price">{offer.regularPrice !== null && offer.salePrice !== null && offer.salePrice < offer.regularPrice ? <del>{price(offer.regularPrice, offer.currency)}</del> : null}<strong>{price(offer.effectivePrice, offer.currency)}</strong></div><div className="live-terms">{offer.terms.map((term) => <span key={term.id}>{term.title}</span>)}</div>{offer.productUrl ? <a href={offer.productUrl} target="_blank" rel="noreferrer noopener">К товару ↗</a> : <span className="live-muted">Ссылка не передана магазином</span>}</article>
}
