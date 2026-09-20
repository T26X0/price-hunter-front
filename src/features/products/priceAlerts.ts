export interface PriceAlert {
  id: string
  sku: string
  productName: string
  city: string
  targetPrice: number
  active: boolean
  createdAt: string
}

export const priceAlertsStorageKey = 'price-hunter-price-alerts'

export function readPriceAlerts(): PriceAlert[] {
  try {
    const stored = JSON.parse(window.localStorage.getItem(priceAlertsStorageKey) || '[]')
    return Array.isArray(stored) ? stored.filter((alert): alert is PriceAlert => Boolean(
      alert
      && typeof alert.id === 'string'
      && typeof alert.sku === 'string'
      && typeof alert.productName === 'string'
      && typeof alert.city === 'string'
      && typeof alert.targetPrice === 'number'
      && typeof alert.active === 'boolean'
      && typeof alert.createdAt === 'string',
    )) : []
  } catch {
    return []
  }
}
