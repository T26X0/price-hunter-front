import { apiRequest } from './client'
import type { PriceHistoryPoint } from './types'

export function getPriceHistory(sku: string, city?: string) {
  const params = new URLSearchParams({ sku })
  if (city?.trim()) params.set('city', city.trim())
  return apiRequest<PriceHistoryPoint[]>(`/price-history?${params.toString()}`)
}
