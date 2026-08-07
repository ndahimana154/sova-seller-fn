import { api } from '../api/request'

export type StockStatus = 'IN_STOCK' | 'OUT_OF_STOCK'

export interface SellerCategory {
  id: string
  name: string
  parentId: string | null
}

export interface ProductMedia {
  altText: string | null
  durationSeconds: number | null
  id: string
  isPrimary: boolean
  mediaType: 'IMAGE' | 'VIDEO'
  mimeType: string
  position: number
  productId: string
  sizeBytes: number
  url: string
  variantId: string | null
}

export type InventoryMovementType = 'STOCK_IN' | 'STOCK_OUT'

export interface InventoryMovement {
  actorName: string | null
  createdAt: string
  id: string
  movementType: InventoryMovementType
  newQuantity: number
  previousQuantity: number
  quantityDifference: number
  reason: string
}

export interface PaginatedInventoryMovements {
  contents: InventoryMovement[]
  meta: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    limit: number
    page: number
    totalItems: number
    totalPages: number
  }
}

export interface SellerProduct {
  brand: string | null
  category: SellerCategory
  createdAt: string
  description: string
  discount: number
  finalPrice: number
  id: string
  media: ProductMedia[]
  name: string
  price: number
  quantity: number
  slug: string
  stockStatus: StockStatus
  updatedAt: string
  variants: Record<string, string>
}

export interface ProductListQuery {
  categoryId?: string
  limit?: number
  page?: number
  search?: string
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  status?: string
  stockStatus?: string
}

export interface PaginatedProducts {
  contents: SellerProduct[]
  meta: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    limit: number
    page: number
    totalItems: number
    totalPages: number
  }
}

interface ApiEnvelope<T> {
  data: T
  message: string
  status: number
}

export const sellerProductsApi = {
  categories: async () => (await api.get<ApiEnvelope<SellerCategory[]>>('/seller/product-categories')).data,
  list: async (query: ProductListQuery = {}) =>
    (await api.get<ApiEnvelope<PaginatedProducts>>('/seller/products', { params: query })).data,
  get: async (productId: string) =>
    (await api.get<ApiEnvelope<SellerProduct>>(`/seller/products/${productId}`)).data,
  /**
   * Sends media in the same request as the product. The server creates both
   * together and deletes the product if any upload fails, so a half-saved
   * product with broken media is not possible.
   */
  create: async ({ media = [], ...fields }: {
    brand?: string
    categoryId: string
    description: string
    discount?: number
    media?: File[]
    name: string
    price: number
    quantity?: number
    variants: Record<string, string>
  }) => {
    if (!media.length) {
      return (await api.post<ApiEnvelope<SellerProduct>, typeof fields>('/seller/products', fields)).data
    }
    const body = new FormData()
    body.set('name', fields.name)
    body.set('description', fields.description)
    body.set('categoryId', fields.categoryId)
    body.set('price', String(fields.price))
    body.set('variants', JSON.stringify(fields.variants))
    if (fields.brand) body.set('brand', fields.brand)
    if (fields.discount !== undefined) body.set('discount', String(fields.discount))
    if (fields.quantity !== undefined) body.set('quantity', String(fields.quantity))
    for (const file of media) body.append('media', file)
    return (await api.post<ApiEnvelope<SellerProduct>, FormData>('/seller/products', body)).data
  },
  update: async (productId: string, input: { brand?: string | null; categoryId?: string; description?: string; discount?: number; name?: string; price?: number; quantity?: number; variants?: Record<string, string> }) =>
    (await api.patch<ApiEnvelope<SellerProduct>, typeof input>(`/seller/products/${productId}`, input)).data,
  delete: (productId: string) => api.delete<ApiEnvelope<null>>(`/seller/products/${productId}`),
  submit: async (productId: string) =>
    (await api.post<ApiEnvelope<SellerProduct>>(`/seller/products/${productId}/submit`)).data,
  recordInventoryMovement: async (productId: string, input: { quantity: number; reason: string; type: InventoryMovementType }) =>
    (await api.post<ApiEnvelope<SellerProduct>, typeof input>(`/seller/products/${productId}/inventory-movements`, input)).data,
  inventoryMovements: async (productId: string, query: { limit?: number; page?: number } = {}) =>
    (await api.get<ApiEnvelope<PaginatedInventoryMovements>>(`/seller/products/${productId}/inventory-movements`, { params: query })).data,
  listMedia: async (productId: string) =>
    (await api.get<ApiEnvelope<ProductMedia[]>>(`/seller/products/${productId}/media`)).data,
  uploadMedia: (productId: string, input: { altText?: string; file: File; isPrimary?: boolean; position?: number; variantId?: string }) => {
    const body = new FormData()
    body.set('file', input.file)
    if (input.altText) body.set('altText', input.altText)
    if (input.variantId) body.set('variantId', input.variantId)
    if (input.position !== undefined) body.set('position', String(input.position))
    if (input.isPrimary !== undefined) body.set('isPrimary', String(input.isPrimary))
    return api.post<ApiEnvelope<ProductMedia>, FormData>(`/seller/products/${productId}/media`, body)
      .then((response) => response.data)
  },
  updateMedia: async (productId: string, mediaId: string, input: { altText?: string | null; isPrimary?: boolean; position?: number }) =>
    (await api.patch<ApiEnvelope<ProductMedia>, typeof input>(`/seller/products/${productId}/media/${mediaId}`, input)).data,
  deleteMedia: (productId: string, mediaId: string, replacementMediaId?: string) =>
    api.delete<ApiEnvelope<null>>(`/seller/products/${productId}/media/${mediaId}`, { params: { replacementMediaId } }),
}
