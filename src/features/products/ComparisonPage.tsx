import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getOffers } from '../../api/offers'
import { getProducts } from '../../api/products'
import type { Offer, Product } from '../../api/types'

interface ComparisonPageProps {
  isDarkTheme: boolean
  onToggleTheme: () => void
  selectedSkus: string[]
  onAddProduct: (sku: string) => void
  onRemoveProduct: (sku: string) => void
  city: string
}

const formatNumber = new Intl.NumberFormat('ru-RU')

const comparisonOfferPreview: Offer[] = [
  { id: 'comparison-offer-s24', sku: 'SAMSUNG-GALAXY-S24', name: 'Samsung Galaxy S24', brand: 'Samsung', category: 'Смартфоны', variant: '8 ГБ / 128 ГБ', store: 'М.Видео', rating: 4.8, reviews: 112342, price: 64990, delivery: 'Сегодня', inStock: true, url: 'https://www.mvideo.ru/product-list-page?q=Samsung+Galaxy+S24' },
  { id: 'comparison-offer-s24-ultra', sku: 'SAMSUNG-GALAXY-S24-ULTRA', name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', category: 'Смартфоны', variant: '12 ГБ / 256 ГБ', store: 'Яндекс Маркет', rating: 4.9, reviews: 76401, price: 94990, delivery: '2–3 дня', inStock: true, url: 'https://market.yandex.ru/search?text=Samsung+Galaxy+S24+Ultra' },
]

const comparisonPreview: Product[] = [
  {
    id: 'comparison-s24',
    sku: 'SAMSUNG-GALAXY-S24',
    name: 'Samsung Galaxy S24',
    brand: 'Samsung',
    category: 'Смартфоны',
    description: 'Компактный флагман Samsung для ежедневных задач.',
    specifications: [
      { label: 'Экран', value: '6.2″ Dynamic AMOLED 2X' },
      { label: 'Память', value: '8 ГБ / 128 ГБ' },
      { label: 'Камера', value: '50 Мп' },
      { label: 'Связь', value: '5G' },
    ],
    createdAt: '2026-08-24T00:00:00.000Z',
  },
  {
    id: 'comparison-s24-ultra',
    sku: 'SAMSUNG-GALAXY-S24-ULTRA',
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    category: 'Смартфоны',
    description: 'Флагман Samsung с большим экраном и камерой 200 Мп.',
    specifications: [
      { label: 'Экран', value: '6.8″ Dynamic AMOLED 2X' },
      { label: 'Память', value: '12 ГБ / 256 ГБ' },
      { label: 'Камера', value: '200 Мп' },
      { label: 'Связь', value: '5G' },
      { label: 'Стилус', value: 'S Pen' },
    ],
    createdAt: '2026-08-24T00:00:00.000Z',
  },
]

const categoryGlyphs: Record<string, string> = {
  'Смартфоны': '▯',
  'Ноутбуки': '▱',
  'Телевизоры': '▣',
  'Игровые консоли': '⌁',
}

function bestOfferFor(offers: Offer[], sku: string) {
  return offers.filter((offer) => offer.sku === sku).sort((first, second) => first.price - second.price)[0]
}

export function ComparisonPage({ isDarkTheme, onToggleTheme, selectedSkus, onAddProduct, onRemoveProduct, city }: ComparisonPageProps) {
  const productsQuery = useQuery({ queryKey: ['products'], queryFn: getProducts })
  const offersQuery = useQuery({ queryKey: ['offers', 'comparison', city], queryFn: () => getOffers({ city }) })
  const [onlyDifferences, setOnlyDifferences] = useState(true)
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const products = productsQuery.data?.length ? productsQuery.data : comparisonPreview
  const selectedProducts = selectedSkus.map((sku) => products.find((product) => product.sku === sku)).filter((product): product is Product => Boolean(product))
  const remoteOffers = offersQuery.data || []
  const offers = [...remoteOffers, ...comparisonOfferPreview.filter((previewOffer) => !remoteOffers.some((offer) => offer.sku === previewOffer.sku))]
  const productCategory = selectedProducts[0]?.category
  const availableProducts = products.filter((product) => (!productCategory || product.category === productCategory) && !selectedSkus.includes(product.sku))
  const specificationRows = useMemo(() => {
    const labels = [...new Set(selectedProducts.flatMap((product) => product.specifications.map((specification) => specification.label)))]
    const rows = labels.map((label) => ({ label, values: selectedProducts.map((product) => product.specifications.find((specification) => specification.label === label)?.value || '—') }))
    return onlyDifferences ? rows.filter((row) => new Set(row.values).size > 1) : rows
  }, [onlyDifferences, selectedProducts])
  const lowestOffer = selectedProducts.map((product) => ({ product, offer: bestOfferFor(offers, product.sku) })).filter((entry): entry is { product: Product; offer: Offer } => Boolean(entry.offer)).sort((first, second) => first.offer.price - second.offer.price)[0]

  const addProduct = (sku: string) => {
    onAddProduct(sku)
    setIsPickerOpen(false)
  }

  return <section className="comparison-page" aria-labelledby="comparison-title">
    <button className="theme-button comparison-theme-button" type="button" aria-label={isDarkTheme ? 'Включить светлую тему' : 'Включить тёмную тему'} aria-pressed={isDarkTheme} onClick={onToggleTheme}>{isDarkTheme ? '☀' : '☾'}</button>
    <header className="comparison-page-header">
      <div><span className="overline">Price Hunter · ваш выбор</span><h1 id="comparison-title">Что выбрать?</h1><p>Сравнивайте отличия моделей и выбирайте подходящее предложение. Город: {city.trim() || 'не выбран'}.</p></div>
      <button className="comparison-differences-toggle" type="button" aria-pressed={onlyDifferences} onClick={() => setOnlyDifferences((current) => !current)}><span aria-hidden="true" />{onlyDifferences ? 'Только различия' : 'Все характеристики'}</button>
    </header>

    <section className="comparison-selected" aria-label="Выбранные товары">
      {selectedProducts.map((product) => {
        const offer = bestOfferFor(offers, product.sku)
        return <article className="comparison-product-card" key={product.sku}>
          <span className="comparison-product-visual" aria-hidden="true">{categoryGlyphs[product.category] || '◇'}</span>
          <div><span>{product.brand}</span><strong>{product.name}</strong><b>{offer ? `от ${formatNumber.format(offer.price)} ₽` : 'Ищем лучшую цену…'}</b></div>
          <button type="button" onClick={() => onRemoveProduct(product.sku)} aria-label={`Убрать ${product.name} из сравнения`}>×</button>
        </article>
      })}
    </section>

    {selectedProducts.length === 2 && <section className="comparison-insights" aria-label="Краткий вывод">
      <article className="comparison-insight comparison-insight-primary"><span>Лучшая цена</span><strong>{lowestOffer?.product.name || selectedProducts[0].name}</strong><small>{lowestOffer ? `от ${formatNumber.format(lowestOffer.offer.price)} ₽ в ${lowestOffer.offer.store}` : 'Предложения магазинов загружаются'}</small></article>
      <article className="comparison-insight"><span>Ключевые отличия</span><strong>{specificationRows.length} {specificationRows.length === 1 ? 'параметр' : specificationRows.length < 5 ? 'параметра' : 'параметров'}</strong><small>{onlyDifferences ? 'Совпадающие характеристики скрыты.' : 'Показаны все характеристики.'}</small></article>
    </section>}

    <section className="comparison-difference-list" aria-labelledby="comparison-difference-title">
      <header><div><span className="overline">Сравнение моделей</span><h2 id="comparison-difference-title">Ключевые отличия</h2></div>{selectedProducts.length < 2 ? <button className="comparison-add-button" type="button" onClick={() => setIsPickerOpen((current) => !current)}>＋ Добавить товар</button> : <span className="comparison-limit">2 из 2 моделей</span>}</header>
      {isPickerOpen && <div className="comparison-picker" role="list" aria-label="Модели для добавления">{availableProducts.length ? availableProducts.slice(0, 8).map((product) => <button type="button" role="listitem" key={product.sku} onClick={() => addProduct(product.sku)}><span>{categoryGlyphs[product.category] || '◇'}</span><div><strong>{product.name}</strong><small>{product.brand} · {product.category}</small></div></button>) : <p>Для этой категории пока нет других моделей.</p>}</div>}
      {productsQuery.isLoading ? <p className="comparison-state">Обновляем каталог…</p> : selectedProducts.length < 2 ? <p className="comparison-state">Добавьте ещё одну модель, чтобы увидеть отличия.</p> : specificationRows.length ? <div>{specificationRows.map((row) => <div className="comparison-difference-row" key={row.label}><span>{row.label}</span>{row.values.map((value, index) => <b key={`${row.label}-${selectedProducts[index].sku}`}>{value}</b>)}</div>)}</div> : <p className="comparison-state">У выбранных моделей нет различающихся характеристик.</p>}
    </section>
  </section>
}
