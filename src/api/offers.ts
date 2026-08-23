import { apiRequest } from './client'
import type { Offer } from './types'

interface OfferSearchParams {
  query?: string
  sku?: string
}

export function getOffers({ query, sku }: OfferSearchParams) {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  if (sku) params.set('sku', sku)
  return apiRequest<Offer[]>(`/offers?${params.toString()}`)
}
