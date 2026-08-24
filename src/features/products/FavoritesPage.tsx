import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getOffers } from '../../api/offers'
import type { Offer } from '../../api/types'
import { storeBrandFor } from './storePresentation'

type FavoritesView = 'grid' | 'list'

const favoritesViewStorageKey = 'price-hunter-favorites-view'

const categoryGlyphs: Record<string, string> = {
  'Смартфоны': '▯',
  'Ноутбуки': '▱',
  'Телевизоры': '▣',
  'Игровые консоли': '⌁',
}

const formatNumber = new Intl.NumberFormat('ru-RU')

interface FavoritesPageProps {
  isDarkTheme: boolean
  onToggleTheme: () => void
  city: string
  favoriteOfferIds: string[]
  onToggleFavoriteOffer: (offerId: string) => void
  onOpenProduct: (sku: string) => void
  onOpenCatalog: () => void
}

function offersForFavorites(offers: Offer[], favoriteOfferIds: string[]) {
  const offersById = new Map(offers.map((offer) => [offer.id, offer]))
  return favoriteOfferIds.flatMap((offerId) => {
    const offer = offersById.get(offerId)
    return offer ? [offer] : []
  })
}

export function FavoritesPage({ isDarkTheme, onToggleTheme, city, favoriteOfferIds, onToggleFavoriteOffer, onOpenProduct, onOpenCatalog }: FavoritesPageProps) {
  const offersQuery = useQuery({ queryKey: ['offers', 'favorites', city], queryFn: () => getOffers({ city }) })
  const [view, setView] = useState<FavoritesView>(() => window.localStorage.getItem(favoritesViewStorageKey) === 'list' ? 'list' : 'grid')
  const favoriteOffers = useMemo(() => offersForFavorites(offersQuery.data || [], favoriteOfferIds), [offersQuery.data, favoriteOfferIds])
  const cityLabel = city.trim() || 'не выбран'

  useEffect(() => {
    window.localStorage.setItem(favoritesViewStorageKey, view)
  }, [view])

  const removeOffer = (offer: Offer) => onToggleFavoriteOffer(offer.id)

  return <section className="favorites-page" aria-labelledby="favorites-title">
    <button className="theme-button favorites-theme-button" type="button" aria-label={isDarkTheme ? 'Включить светлую тему' : 'Включить тёмную тему'} aria-pressed={isDarkTheme} onClick={onToggleTheme}>{isDarkTheme ? '☀' : '☾'}</button>
    <header className="favorites-page-header">
      <div><span className="overline">Price Hunter · сохранённые предложения</span><h1 id="favorites-title">Избранное</h1><p>{favoriteOffers.length ? `Сохранено ${favoriteOffers.length} ${favoriteOffers.length === 1 ? 'предложение' : favoriteOffers.length < 5 ? 'предложения' : 'предложений'}: версии одной модели и магазины можно сравнить отдельно.` : 'Сохраняйте отдельные предложения, чтобы быстро вернуться к нужной версии и магазину.'}</p></div>
      <div className="favorites-header-actions"><span className="favorites-city">⌖ {cityLabel}</span><div className="favorites-view-switch" role="group" aria-label="Вид избранного"><button type="button" aria-pressed={view === 'grid'} onClick={() => setView('grid')}>Плитка</button><button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>Список</button></div></div>
    </header>

    {offersQuery.isLoading ? <p className="favorites-state">Загружаем избранное…</p> : offersQuery.isError ? <p className="favorites-state">Не удалось загрузить избранные предложения. Повторите попытку позже.</p> : favoriteOffers.length === 0 ? <section className="favorites-empty"><span aria-hidden="true">♡</span><h2>Здесь появятся ваши предложения</h2><p>Откройте товар и нажмите на сердечко рядом с нужной версией в магазине.</p><button type="button" onClick={onOpenCatalog}>Открыть каталог →</button></section> : view === 'grid' ? <div className="favorites-grid">{favoriteOffers.map((offer) => {
      const storeBrand = storeBrandFor(offer.store)
      return <article className="favorite-card" key={offer.id}><button className="favorite-remove" type="button" onClick={() => removeOffer(offer)} aria-label={`Убрать ${offer.name}, ${offer.variant}, ${offer.store} из избранного`}>♥</button><button className="favorite-card-open" type="button" onClick={() => onOpenProduct(offer.sku)} aria-label={`Открыть страницу товара ${offer.name}`}><span className="favorite-card-visual" aria-hidden="true">{categoryGlyphs[offer.category] || '◇'}</span><span className="favorite-card-meta">{offer.category} · {offer.brand}</span><strong>{offer.name}</strong><span className="favorite-card-variant">{offer.variant}</span></button><div className="favorite-card-price"><b>от {formatNumber.format(offer.price)} ₽</b><span><i className={`offer-store-logo ${storeBrand.tone}`} aria-hidden="true">{storeBrand.label}</i>{offer.store}</span></div><button className="favorite-card-action" type="button" onClick={() => onOpenProduct(offer.sku)}>Все предложения →</button></article>
    })}</div> : <section className="favorites-list" aria-label="Список избранных предложений"><div className="favorites-list-head" aria-hidden="true"><span>Товар</span><span>Вариант</span><span>Цена</span><span>Магазин</span><span /></div>{favoriteOffers.map((offer) => {
      const storeBrand = storeBrandFor(offer.store)
      return <article className="favorite-row" key={offer.id}><button className="favorite-row-open" type="button" onClick={() => onOpenProduct(offer.sku)} aria-label={`Открыть страницу товара ${offer.name}`}><span className="favorite-row-visual" aria-hidden="true">{categoryGlyphs[offer.category] || '◇'}</span><span><strong>{offer.name}</strong><small>{offer.category} · {offer.brand}</small></span></button><span className="favorite-row-variant">{offer.variant}</span><b className="favorite-row-price">от {formatNumber.format(offer.price)} ₽</b><span className="favorite-row-store"><i className={`offer-store-logo ${storeBrand.tone}`} aria-hidden="true">{storeBrand.label}</i>{offer.store}</span><button className="favorite-remove" type="button" onClick={() => removeOffer(offer)} aria-label={`Убрать ${offer.name}, ${offer.variant}, ${offer.store} из избранного`}>♥</button></article>
    })}</section>}
  </section>
}
