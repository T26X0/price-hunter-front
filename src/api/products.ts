import { apiRequest } from './client'
import type { CreateProductRequest, Product } from './types'
export const getProducts = () => apiRequest<Product[]>('/products')
export const getProduct = (sku: string) => apiRequest<Product>(`/products/${encodeURIComponent(sku)}`)
export const createProduct = (data: CreateProductRequest) => apiRequest<Product>('/products', { method: 'POST', body: JSON.stringify(data) })
