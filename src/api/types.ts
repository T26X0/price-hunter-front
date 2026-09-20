export interface Product {
  id: string
  name: string
  sku: string
  description: string | null
  category: string
  brand: string
  specifications: ProductSpecification[]
  createdAt: string
}

export interface ProductSpecification {
  label: string
  value: string
}

export interface CreateProductRequest {
  name: string
  sku: string
  description?: string
}

export interface Offer {
  id: string
  sku: string
  name: string
  brand: string
  category: string
  variant: string
  store: string
  rating: number
  reviews: number
  price: number
  delivery: string
  inStock: boolean
  url: string
}

export interface PriceHistoryPoint {
  date: string
  price: number
}

export interface ApiErrorBody {
  timestamp: string
  status: number
  error: string
  message: string
  fields: Record<string, string>
}
