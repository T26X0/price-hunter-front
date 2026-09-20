export type UUID = string

export interface Slice<T> {
  items: T[]
  page: number
  size: number
  hasNext: boolean
}

export interface City {
  id: UUID
  name: string
  countryCode: string
  timezone: string | null
}

export interface ProductListItem {
  id: UUID
  catalogKey: string
  brand: string | null
  name: string
  category: string | null
  description: string | null
  minEffectivePrice: number | null
  currency: string | null
  offerCount: number
}

export type VariantAttributeDataType = 'TEXT' | 'NUMBER' | 'BOOLEAN'

export interface VariantAttribute {
  code: string
  name: string
  dataType: VariantAttributeDataType
  unit: string | null
  value: string | null
  numericValue: number | null
  booleanValue: boolean | null
}

export interface ProductVariant {
  id: UUID
  canonicalKey: string
  displayName: string
  manufacturerSku: string | null
  attributes: VariantAttribute[]
  minEffectivePrice: number | null
  currency: string | null
  offerCount: number
  available: boolean
}

export interface ProductDetail extends ProductListItem {
  variants: ProductVariant[]
}

export type OfferTermType = 'GIFT' | 'DISCOUNT' | 'CONDITIONAL_PRICE' | 'CASHBACK' | 'TRADE_IN' | 'INSTALLMENT' | 'CREDIT' | 'DELIVERY' | 'OTHER'
export type OfferCondition = 'NEW' | 'USED' | 'REFURBISHED' | 'DISPLAY'
export type Availability = 'IN_STOCK' | 'OUT_OF_STOCK' | 'PREORDER' | 'UNKNOWN'

export interface OfferTerm {
  id: UUID
  type: OfferTermType
  title: string
  description: string | null
  monetaryValue: number | null
  annualRate: number | null
  termMonths: number | null
  monthlyPayment: number | null
  initialPayment: number | null
  validUntil: string | null
  termsUrl: string | null
}

export interface Store {
  id: UUID
  name: string
  address: string | null
}

export interface Offer {
  id: UUID
  marketId: UUID
  chainId: UUID
  chainName: string
  cityId: UUID
  cityName: string
  store: Store | null
  productId: UUID
  productName: string
  variantId: UUID
  variantName: string
  condition: OfferCondition
  regularPrice: number | null
  salePrice: number | null
  conditionalPrice: number | null
  effectivePrice: number | null
  currency: string
  availability: Availability
  quantity: number | null
  productUrl: string | null
  lastCheckedAt: string
  terms: OfferTerm[]
}

export interface PriceHistoryPoint {
  id: number
  regularPrice: number | null
  salePrice: number | null
  conditionalPrice: number | null
  effectivePrice: number | null
  currency: string
  availability: Availability
  quantity: number | null
  validFrom: string
  validTo: string | null
}

export interface InventoryItem {
  storeId: UUID
  storeName: string
  address: string | null
  availability: Availability
  quantity: number | null
  lastCheckedAt: string
}

export interface DeliveredOffer {
  offerId: UUID
  chainName: string
  sourceCityName: string
  itemPrice: number
  deliveryPrice: number
  totalPrice: number
  minDeliveryDays: number | null
  maxDeliveryDays: number | null
  currency: string
  productUrl: string | null
}
