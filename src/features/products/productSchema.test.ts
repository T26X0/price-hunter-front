import { describe, expect, it } from 'vitest'
import { productSchema } from './productSchema'
describe('productSchema', () => {
  it('accepts a valid product and trims required fields', () => { const result = productSchema.parse({ name: '  iPhone 16  ', sku: '  IPH-16  ', description: '' }); expect(result.name).toBe('iPhone 16'); expect(result.sku).toBe('IPH-16') })
  it('rejects blank name and sku', () => { expect(productSchema.safeParse({ name: ' ', sku: '', description: '' }).success).toBe(false) })
  it('rejects too long description', () => { expect(productSchema.safeParse({ name: 'Phone', sku: 'PHONE-1', description: 'x'.repeat(2001) }).success).toBe(false) })
})
