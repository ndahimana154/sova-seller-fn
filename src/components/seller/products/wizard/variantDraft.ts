import {
  sellerProductsApi,
  type ProductVariant,
} from '../../../../lib/sellerProductsApi'

export interface VariantValueDraft {
  attributeId: string
  key: string
  value: string
}

/** Numbers stay as typed so a field can be emptied instead of snapping to 0. */
export interface VariantDraft {
  discountPercent: string
  id: string
  name: string
  price: string
  saved: ProductVariant | null
  sku: string
  stockQuantity: string
  values: VariantValueDraft[]
}

export function emptyDraft(): VariantDraft {
  return {
    discountPercent: '',
    id: crypto.randomUUID(),
    name: '',
    price: '',
    saved: null,
    sku: '',
    stockQuantity: '',
    values: [],
  }
}

export function draftFromVariant(variant: ProductVariant): VariantDraft {
  return {
    discountPercent: variant.discountPercent ? String(variant.discountPercent) : '',
    id: variant.id,
    name: variant.name ?? '',
    price: String(variant.price),
    saved: variant,
    sku: variant.sku,
    stockQuantity: String(variant.stockQuantity),
    values: variant.attributes.map((item) => ({
      attributeId: item.attributeId,
      key: item.attributeId,
      value: item.value,
    })),
  }
}

const whole = (value: string, { max, min }: { max?: number; min: number }) => {
  if (value.trim() === '') return 'required'
  const parsed = Number(value)
  if (!Number.isInteger(parsed)) return 'whole'
  if (parsed < min || (max !== undefined && parsed > max)) return 'range'
  return ''
}

const selections = (draft: VariantDraft) =>
  draft.values
    .filter((item) => item.attributeId && item.value.trim())
    .map((item) => ({ attributeId: item.attributeId, value: item.value.trim() }))

export function variantErrors(draft: VariantDraft) {
  return {
    discount: {
      '': '',
      range: 'Discount must be between 0 and 99.',
      required: '',
      whole: 'Discount must be a whole number.',
    }[whole(draft.discountPercent || '0', { max: 99, min: 0 })],
    name: draft.name.trim() ? '' : 'Give this variant a name.',
    price: {
      '': '',
      range: 'Price cannot be negative.',
      required: 'Price is required.',
      whole: 'Price must be a whole number.',
    }[whole(draft.price, { min: 0 })],
    stock: {
      '': '',
      range: 'Stock cannot be negative.',
      required: '',
      whole: 'Stock must be a whole number.',
    }[whole(draft.stockQuantity || '0', { min: 0 })],
  }
}

/** Stock is excluded: it is read-only once the variant exists. */
export function isVariantDirty(draft: VariantDraft): boolean {
  const saved = draft.saved
  if (!saved) return true
  if (draft.name.trim() !== (saved.name ?? '')) return true
  if (draft.sku.trim() !== saved.sku) return true
  if ((Number(draft.price) || 0) !== saved.price) return true
  if ((Number(draft.discountPercent) || 0) !== (saved.discountPercent ?? 0)) return true

  const current = selections(draft)
  if (current.length !== saved.attributes.length) return true
  return current.some(
    (item) =>
      saved.attributes.find((entry) => entry.attributeId === item.attributeId)?.value !== item.value,
  )
}

/** Saves one card, creating it when it has never been persisted. */
export function saveVariant(productId: string, draft: VariantDraft) {
  const payload = {
    attributes: selections(draft),
    discountPercent: Number(draft.discountPercent) || null,
    name: draft.name.trim(),
    price: Number(draft.price) || 0,
    sku: draft.sku.trim(),
  }
  // Stock is left out on update: once the variant exists it only moves through
  // the inventory ledger, where every change carries a reason.
  if (draft.saved) return sellerProductsApi.updateVariant(productId, draft.saved.id, payload)
  return sellerProductsApi.createVariant(productId, {
    ...payload,
    stockQuantity: Number(draft.stockQuantity) || 0,
  })
}
