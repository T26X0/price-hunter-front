import { apiRequest } from './client'
import type { Offer } from './types'

interface OfferSearchParams {
  query?: string
  sku?: string
  city?: string
}

export function getOffers({ query, sku, city }: OfferSearchParams) {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  if (sku) params.set('sku', sku)
  if (city?.trim()) params.set('city', city.trim())
  return apiRequest<Offer[]>(`/offers?${params.toString()}`)
}
