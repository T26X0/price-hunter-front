import { afterEach, describe, expect, it } from 'vitest'
import { priceAlertsStorageKey, readPriceAlerts } from './priceAlerts'

describe('price alerts storage', () => {
  afterEach(() => window.localStorage.clear())

  it('returns an empty list when no alerts are saved', () => {
    expect(readPriceAlerts()).toEqual([])
  })

  it('restores only valid saved alerts', () => {
    window.localStorage.setItem(priceAlertsStorageKey, JSON.stringify([
      { id: 's24', sku: 'SAMSUNG-GALAXY-S24', productName: 'Samsung Galaxy S24', city: 'Екатеринбург', targetPrice: 60_000, active: true, createdAt: '2026-09-20T12:00:00.000Z' },
      { sku: 'broken-alert' },
    ]))

    expect(readPriceAlerts()).toEqual([expect.objectContaining({ sku: 'SAMSUNG-GALAXY-S24', targetPrice: 60_000 })])
  })
})
