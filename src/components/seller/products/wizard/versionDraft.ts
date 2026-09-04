import type { ProductMedia, ProductVariant, SellerProduct } from '../../../../lib/sellerProductsApi'

export interface VersionOption {
  key: string
  name: string
  value: string
}

/** Numbers stay as typed so a field can be emptied instead of snapping to 0. */
/** One tile in the version's gallery: either already uploaded, or picked now. */
export interface PhotoDraft {
  file?: File
  /** Set once uploaded. */
  id?: string
  key: string
  url?: string
}

export interface VersionDraft {
  /** Key of the photo buyers see first. */
  coverKey: string | null
  discountPercent: string
  key: string
  name: string
  options: VersionOption[]
  photos: PhotoDraft[]
  price: string
  saved: ProductVariant | null
  stockQuantity: string
}

export interface VersionErrors {
  name?: string
  options?: string
  photos?: string
  price?: string
  stockQuantity?: string
}

const uid = () => crypto.randomUUID()

export function emptyVersion(): VersionDraft {
  return {
    coverKey: null,
    discountPercent: '',
    key: uid(),
    name: '',
    options: [],
    photos: [],
    price: '',
    saved: null,
    stockQuantity: '',
  }
}

export function versionFromVariant(
  variant: ProductVariant,
  attributeNames: Map<string, string>,
  photos: ProductMedia[] = [],
): VersionDraft {
  const tiles: PhotoDraft[] = photos.map((photo) => ({
    id: photo.id,
    key: photo.id,
    url: photo.url,
  }))
  return {
    coverKey: photos.find((photo) => photo.isPrimary)?.id ?? tiles[0]?.key ?? null,
    discountPercent: variant.discountPercent ? String(variant.discountPercent) : '',
    key: variant.id,
    photos: tiles,
    name: variant.name ?? '',
    options: variant.attributes.map((item) => ({
      key: uid(),
      name: attributeNames.get(item.attributeId) ?? '',
      value: item.value,
    })),
    price: variant.price > 0 ? String(variant.price) : '',
    saved: variant,
    stockQuantity: String(variant.stockQuantity),
  }
}

/** Seeds the editor from whatever the product already has, or one blank row. */
export function versionsFromProduct(product: SellerProduct | null): VersionDraft[] {
  if (!product) return [emptyVersion()]
  const names = new Map(product.attributes.map((attribute) => [attribute.id, attribute.name]))
  const live = product.variants.filter((variant) => variant.isActive)
  if (live.length === 0) return [emptyVersion()]
  const images = product.media.filter((item) => item.mediaType === 'IMAGE')
  return live.map((variant) =>
    versionFromVariant(
      variant,
      names,
      images.filter((item) => item.variantId === variant.id),
    ),
  )
}

const wholeNumber = (value: string, { min }: { min: number }) => {
  const trimmed = value.trim()
  if (trimmed === '') return 'required'
  const parsed = Number(trimmed)
  if (!Number.isInteger(parsed)) return 'whole'
  if (parsed < min) return 'range'
  return ''
}

/** `named` is true once there is more than one version to tell apart. */
export function versionErrors(draft: VersionDraft, named: boolean): VersionErrors {
  const errors: VersionErrors = {}

  if (named && !draft.name.trim()) {
    errors.name = 'Give this version a name so buyers can tell them apart.'
  }

  const price = wholeNumber(draft.price, { min: 1 })
  if (price === 'required') errors.price = 'Enter a price.'
  else if (price === 'whole') errors.price = 'Price must be a whole number.'
  else if (price === 'range') errors.price = 'Price must be more than 0.'

  // A version with nothing on hand cannot be bought, so the wizard refuses it.
  // Selling out later is handled on the inventory screen, where the movement
  // carries a reason.
  const stock = wholeNumber(draft.stockQuantity, { min: 1 })
  if (stock === 'required') errors.stockQuantity = 'Enter the stock you hold.'
  else if (stock === 'whole') errors.stockQuantity = 'Stock must be a whole number.'
  else if (stock === 'range') errors.stockQuantity = 'Stock must be more than 0.'

  if (draft.photos.length === 0) {
    errors.photos = 'Add at least one photo of this version.'
  }

  const filled = draft.options.filter((option) => option.name.trim() || option.value.trim())
  if (filled.some((option) => !option.name.trim() || !option.value.trim())) {
    errors.options = 'Every option needs both a name and a value.'
  }

  return errors
}

export function hasVersionErrors(errors: VersionErrors): boolean {
  return Object.values(errors).some(Boolean)
}

/** Option names used across every version, in the order they first appear. */
export function optionNamesOf(drafts: VersionDraft[]): string[] {
  const names: string[] = []
  for (const draft of drafts) {
    for (const option of draft.options) {
      const name = option.name.trim()
      if (name && !names.some((item) => item.toLowerCase() === name.toLowerCase())) {
        names.push(name)
      }
    }
  }
  return names
}
