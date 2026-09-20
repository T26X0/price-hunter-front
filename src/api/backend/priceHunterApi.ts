import { backendApiRequest } from '../client'
import type { City, DeliveredOffer, InventoryItem, Offer, PriceHistoryPoint, ProductDetail, ProductListItem, ProductVariant, Slice } from './types'

type Request = <T>(path: string, options?: RequestInit) => Promise<T>

export interface ProductSearchParams {
  q?: string
  cityId?: string
  category?: string
  brand?: string
  page?: number
  size?: number
}

export interface PageParams {
  page?: number
  size?: number
}

export interface OfferHistoryParams {
  from: string
  to: string
}

function withQuery(path: string, values: object) {
  const params = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => {
    if ((typeof value === 'string' && value !== '') || typeof value === 'number') params.set(key, String(value))
  })
  const query = params.toString()
  return query ? `${path}?${query}` : path
}

export function createPriceHunterApi(request: Request = backendApiRequest) {
  return {
    getCities: () => request<City[]>('/cities'),
    getProducts: (params: ProductSearchParams = {}) => request<Slice<ProductListItem>>(withQuery('/products', params)),
    getProduct: (catalogKey: string, cityId: string) => request<ProductDetail>(withQuery(`/products/${encodeURIComponent(catalogKey)}`, { cityId })),
    getProductVariants: (catalogKey: string, cityId: string) => request<ProductVariant[]>(withQuery(`/products/${encodeURIComponent(catalogKey)}/variants`, { cityId })),
    getVariantOffers: (variantId: string, cityId: string, page: PageParams = {}) => request<Slice<Offer>>(withQuery(`/variants/${encodeURIComponent(variantId)}/offers`, { cityId, page: page.page, size: page.size })),
    getOffer: (offerId: string) => request<Offer>(`/offers/${encodeURIComponent(offerId)}`),
    getOfferHistory: (offerId: string, period: OfferHistoryParams) => request<PriceHistoryPoint[]>(withQuery(`/offers/${encodeURIComponent(offerId)}/history`, period)),
    getOfferInventory: (offerId: string, page: PageParams = {}) => request<Slice<InventoryItem>>(withQuery(`/offers/${encodeURIComponent(offerId)}/inventory`, page)),
    getDeliveredOffers: (variantId: string, cityId: string, page: PageParams = {}) => request<Slice<DeliveredOffer>>(withQuery(`/variants/${encodeURIComponent(variantId)}/delivered-offers`, { cityId, page: page.page, size: page.size })),
  }
}

export const priceHunterApi = createPriceHunterApi()
