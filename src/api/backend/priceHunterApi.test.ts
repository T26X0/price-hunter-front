import { describe, expect, it, vi } from 'vitest'
import { createPriceHunterApi } from './priceHunterApi'

describe('Price Hunter backend API adapter', () => {
  it('uses catalogKey and only supported product query parameters', async () => {
    const request = vi.fn().mockResolvedValue({ items: [], page: 0, size: 20, hasNext: false })
    const api = createPriceHunterApi(request)

    await api.getProducts({ q: 'iPhone 16 Pro', cityId: 'city-1', category: 'Смартфоны', brand: 'Apple', page: 0, size: 20 })
    await api.getProduct('apple-iphone-16-pro', 'city-1')

    expect(request).toHaveBeenNthCalledWith(1, '/products?q=iPhone+16+Pro&cityId=city-1&category=%D0%A1%D0%BC%D0%B0%D1%80%D1%82%D1%84%D0%BE%D0%BD%D1%8B&brand=Apple&page=0&size=20')
    expect(request).toHaveBeenNthCalledWith(2, '/products/apple-iphone-16-pro?cityId=city-1')
  })

  it('keeps offer, history, inventory and delivery endpoints distinct', async () => {
    const request = vi.fn().mockResolvedValue({ items: [], page: 0, size: 20, hasNext: false })
    const api = createPriceHunterApi(request)

    await api.getVariantOffers('variant-1', 'city-1', { page: 0, size: 20 })
    await api.getOfferHistory('offer-1', { from: '2026-09-01T00:00:00Z', to: '2026-09-20T23:59:59Z' })
    await api.getOfferInventory('offer-1', { page: 0, size: 20 })
    await api.getDeliveredOffers('variant-1', 'city-1', { page: 0, size: 20 })

    expect(request.mock.calls.map(([path]) => path)).toEqual([
      '/variants/variant-1/offers?cityId=city-1&page=0&size=20',
      '/offers/offer-1/history?from=2026-09-01T00%3A00%3A00Z&to=2026-09-20T23%3A59%3A59Z',
      '/offers/offer-1/inventory?page=0&size=20',
      '/variants/variant-1/delivered-offers?cityId=city-1&page=0&size=20',
    ])
  })
})
