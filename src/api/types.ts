export interface Product {
  id: string
  name: string
  sku: string
  description: string | null
  category: string
  brand: string
  createdAt: string
}

export interface CreateProductRequest {
  name: string
  sku: string
  description?: string
}

export interface ApiErrorBody {
  timestamp: string
  status: number
  error: string
  message: string
  fields: Record<string, string>
}
