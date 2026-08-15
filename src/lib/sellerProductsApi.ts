import { api } from '../api/request'

export type StockStatus = 'IN_STOCK' | 'OUT_OF_STOCK'
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE'
export type ProductStep = 'BASICS' | 'ATTRIBUTES' | 'VARIANTS' | 'MEDIA' | 'PUBLISH'
export type InventoryMovementType = 'STOCK_IN' | 'STOCK_OUT'

export interface SellerCategory {
  id: string
  isLeaf: boolean
  level: number
  name: string
  parentId: string | null
  path: string
  slug: string
}

export interface SellerBrand {
  id: string
  logo: string | null
  name: string
  slug: string
}

export interface ProductAttribute {
  id: string
  name: string
  values: string[]
}

export interface ProductVariantAttribute {
  attributeId: string
  name: string
  value: string
}

export interface ProductVariant {
  barcode: string | null
  id: string
  isActive: boolean
  attributes: ProductVariantAttribute[]
  discountPercent: number | null
  /** The variant listings show when they can only show one. */
  isDefault: boolean
  /** The stand-in SKU a one-version product sells under. */
  isPlaceholder: boolean
  /** What the seller calls this version, e.g. "Red / Large". */
  name: string | null
  price: number
  salePrice: number
  sku: string
  stockQuantity: number
  stockStatus: StockStatus
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

export interface SellerProduct {
  attributes: ProductAttribute[]
  brand: SellerBrand | null
  categories: SellerCategory[]
  createdAt: string
  defaultVariant: ProductVariant | null
  description: string
  hasVariants: boolean
  id: string
  maxPrice: number
  media: ProductMedia[]
  name: string
  price: number
  quantity: number
  slug: string
  status: ProductStatus
  stockStatus: StockStatus
  updatedAt: string
  variantCount: number
  variants: ProductVariant[]
}

export interface ProductStepState {
  blocking: boolean
  complete: boolean
  issues: string[]
  key: ProductStep
  label: string
}

export interface ProductProgress {
  canPublish: boolean
  completedSteps: number
  currentStep: ProductStep
  name: string
  productId: string
  status: ProductStatus
  steps: ProductStepState[]
  totalSteps: number
}

export interface InventoryMovement {
  actorName: string | null
  createdAt: string
  id: string
  movementType: InventoryMovementType
  newQuantity: number
  previousQuantity: number
  quantityDifference: number
  reason: string
  variantId: string
  variantName: string | null
  variantSku: string
}

export interface PaginationMeta {
  hasNextPage: boolean
  hasPreviousPage: boolean
  limit: number
  page: number
  totalItems: number
  totalPages: number
}

export interface Paginated<T> {
  contents: T[]
  meta: PaginationMeta
}

export interface ProductListQuery {
  categoryId?: string
  limit?: number
  page?: number
  search?: string
  sortBy?: 'createdAt' | 'name' | 'price' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  status?: ProductStatus
  stockStatus?: StockStatus
}

export interface SellerDashboard {
  products: { active: number; draft: number; inactive: number; total: number }
  recentStockMovements: InventoryMovement[]
  stock: { onHand: number }
  unfinished: Array<{
    completedSteps: number
    currentStep: ProductStep
    id: string
    name: string
    totalSteps: number
    updatedAt: string
  }>
  variants: { lowStock: number; outOfStock: number; total: number }
}

export interface LowStockVariant {
  attributes: string
  productId: string
  productName: string
  sku: string
  stockQuantity: number
  variantId: string
}

export interface ProductAttributeInput {
  /** Send an existing option id to rename it in place. */
  id?: string
  name: string
  values?: string[]
}

export interface VariantAxisInput {
  attributeId: string
  values: string[]
}

export interface VariantAttributeInput {
  attributeId: string
  value: string
}

interface ApiEnvelope<T> {
  data: T
  message: string
  status: number
}

const body = <T,>(promise: Promise<ApiEnvelope<T>>) => promise.then((response) => response.data)

export const sellerProductsApi = {
  categories: () => body(api.get<ApiEnvelope<SellerCategory[]>>('/seller/product-categories')),
  brands: () => body(api.get<ApiEnvelope<SellerBrand[]>>('/seller/brands')),
  list: (query: ProductListQuery = {}) =>
    body(api.get<ApiEnvelope<Paginated<SellerProduct>>>('/seller/products', { params: query })),
  get: (productId: string) => body(api.get<ApiEnvelope<SellerProduct>>(`/seller/products/${productId}`)),
  delete: (productId: string) => api.delete<ApiEnvelope<null>>(`/seller/products/${productId}`),

  createDraft: (input: { brandId?: string | null; categoryIds: string[]; description?: string; name: string }) =>
    body(api.post<ApiEnvelope<SellerProduct>, typeof input>('/seller/products/draft', input)),
  saveBasics: (
    productId: string,
    input: { brandId?: string | null; categoryIds?: string[]; description?: string; name?: string },
  ) => body(api.put<ApiEnvelope<SellerProduct>, typeof input>(`/seller/products/${productId}/basics`, input)),

  attributes: (productId: string) =>
    body(api.get<ApiEnvelope<ProductAttribute[]>>(`/seller/products/${productId}/attributes`)),
  saveAttributes: (productId: string, attributes: ProductAttributeInput[], hasVariants?: boolean) =>
    body(
      api.put<ApiEnvelope<ProductAttribute[]>, { attributes: ProductAttributeInput[]; hasVariants?: boolean }>(
        `/seller/products/${productId}/attributes`,
        { attributes, hasVariants },
      ),
    ),

  variants: (productId: string) =>
    body(api.get<ApiEnvelope<ProductVariant[]>>(`/seller/products/${productId}/variants`)),
  createVariant: (
    productId: string,
    input: {
      attributes: VariantAttributeInput[]
      barcode?: string | null
      discountPercent?: number | null
      name?: string
      price: number
      sku?: string
      stockQuantity?: number
    },
  ) => body(api.post<ApiEnvelope<ProductVariant[]>, typeof input>(`/seller/products/${productId}/variants`, input)),
  generateVariants: (
    productId: string,
    input: { axes: VariantAxisInput[]; price?: number; stockQuantity?: number },
  ) =>
    body(
      api.post<ApiEnvelope<ProductVariant[]>, typeof input>(`/seller/products/${productId}/variants/generate`, input),
    ),
  updateVariant: (
    productId: string,
    variantId: string,
    input: {
      attributes?: VariantAttributeInput[]
      barcode?: string | null
      discountPercent?: number | null
      isActive?: boolean
      isDefault?: boolean
      name?: string
      price?: number
      sku?: string
      stockQuantity?: number
    },
  ) =>
    body(
      api.patch<ApiEnvelope<ProductVariant[]>, typeof input>(
        `/seller/products/${productId}/variants/${variantId}`,
        input,
      ),
    ),
  bulkVariants: (
    productId: string,
    input: {
      isActive?: boolean
      price?: number
      stockQuantity?: number
      variantIds?: string[]
    },
  ) =>
    body(
      api.patch<ApiEnvelope<ProductVariant[]>, typeof input>(`/seller/products/${productId}/variants/bulk`, input),
    ),
  deleteVariant: (productId: string, variantId: string) =>
    body(api.delete<ApiEnvelope<ProductVariant[]>>(`/seller/products/${productId}/variants/${variantId}`)),
  recordStock: (
    productId: string,
    variantId: string,
    input: { quantity: number; reason: string; type: InventoryMovementType },
  ) =>
    body(
      api.post<ApiEnvelope<ProductVariant[]>, typeof input>(
        `/seller/products/${productId}/variants/${variantId}/stock`,
        input,
      ),
    ),
  stockHistory: (
    productId: string,
    query: { limit?: number; page?: number; search?: string; variantId?: string } = {},
  ) =>
    body(
      api.get<ApiEnvelope<Paginated<InventoryMovement>>>(`/seller/products/${productId}/stock`, {
        params: query,
      }),
    ),

  listMedia: (productId: string) =>
    body(api.get<ApiEnvelope<ProductMedia[]>>(`/seller/products/${productId}/media`)),
  uploadMedia: (
    productId: string,
    input: { altText?: string; file: File; isPrimary?: boolean; position?: number; variantId?: string },
  ) => {
    const form = new FormData()
    form.set('file', input.file)
    if (input.altText) form.set('altText', input.altText)
    if (input.variantId) form.set('variantId', input.variantId)
    if (input.position !== undefined) form.set('position', String(input.position))
    if (input.isPrimary !== undefined) form.set('isPrimary', String(input.isPrimary))
    return body(api.post<ApiEnvelope<ProductMedia>, FormData>(`/seller/products/${productId}/media`, form))
  },
  updateMedia: (
    productId: string,
    mediaId: string,
    input: { altText?: string | null; isPrimary?: boolean; position?: number; variantId?: string | null },
  ) =>
    body(
      api.patch<ApiEnvelope<ProductMedia>, typeof input>(`/seller/products/${productId}/media/${mediaId}`, input),
    ),
  reorderMedia: (productId: string, mediaIds: string[]) =>
    body(
      api.patch<ApiEnvelope<ProductMedia[]>, { mediaIds: string[] }>(`/seller/products/${productId}/media/reorder`, {
        mediaIds,
      }),
    ),
  deleteMedia: (productId: string, mediaId: string, replacementMediaId?: string) =>
    api.delete<ApiEnvelope<null>>(`/seller/products/${productId}/media/${mediaId}`, {
      params: { replacementMediaId },
    }),

  progress: (productId: string) =>
    body(api.get<ApiEnvelope<ProductProgress>>(`/seller/products/${productId}/progress`)),
  publish: (productId: string) =>
    body(api.post<ApiEnvelope<SellerProduct>>(`/seller/products/${productId}/publish`)),
  unpublish: (productId: string) =>
    body(api.post<ApiEnvelope<SellerProduct>>(`/seller/products/${productId}/unpublish`)),

  dashboard: () => body(api.get<ApiEnvelope<SellerDashboard>>('/seller/dashboard')),
  lowStock: (threshold?: number) =>
    body(api.get<ApiEnvelope<LowStockVariant[]>>('/seller/low-stock', { params: { threshold } })),
}
