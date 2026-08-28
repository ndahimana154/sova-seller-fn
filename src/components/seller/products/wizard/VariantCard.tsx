import { ImagePlus, Plus, Save, Star, Trash2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import {
  sellerProductsApi,
  type ProductAttribute,
  type ProductMedia,
} from '../../../../lib/sellerProductsApi'
import {
  isVariantDirty,
  saveVariant,
  variantErrors,
  type VariantDraft,
  type VariantValueDraft,
} from './variantDraft'
import { formatMoney } from '../../../../lib/money'
import { useToast } from '../../../../hooks/useToast'
import { Badge, Select } from '../../../ui'
import { Field, mediaUrl } from '../ProductPageUi'
import { ui } from '../../../ui/styles'

interface VariantCardProps {
  attributes: ProductAttribute[]
  draft: VariantDraft
  index: number
  media: ProductMedia[]
  onChange: (draft: VariantDraft) => void
  onRefresh: () => Promise<void>
  onRemove: () => void
  productId: string
}

interface PendingUpload {
  id: string
  mediaType: 'IMAGE' | 'VIDEO'
  url: string
}

export function VariantCard({
  attributes,
  draft,
  index,
  media,
  onChange,
  onRefresh,
  onRemove,
  productId,
}: VariantCardProps) {
  const [busy, setBusy] = useState(false)
  const [checked, setChecked] = useState(false)
  const [pending, setPending] = useState<PendingUpload[]>([])
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const price = Number(draft.price) || 0
  const discount = Number(draft.discountPercent) || 0
  const salePrice = discount ? Math.max(0, Math.round(price - (price * discount) / 100)) : price

  const errors = variantErrors(draft)
  const invalid = Object.values(errors).some(Boolean)
  const dirty = isVariantDirty(draft)

  const taken = new Set(draft.values.map((item) => item.attributeId))
  const unused = attributes.filter((attribute) => !taken.has(attribute.id))

  const setValues = (values: VariantValueDraft[]) => onChange({ ...draft, values })

  const addValue = () => {
    const next = unused[0]
    if (!next) return
    setValues([...draft.values, { attributeId: next.id, key: crypto.randomUUID(), value: '' }])
  }

  async function run(work: () => Promise<unknown>, message = '') {
    setBusy(true)
    try {
      await work()
      await onRefresh()
      if (message) toast.success(message)
      return true
    } catch (cause) {
      toast.error(cause)
      return false
    } finally {
      setBusy(false)
    }
  }

  async function save() {
    setChecked(true)
    if (invalid) {
      toast.error(Object.values(errors).find(Boolean))
      return
    }
    const isNew = !draft.saved
    const ok = await run(() => saveVariant(productId, draft), 'Variant saved.')
    // The refresh above pulls this variant back from the server, so the local
    // draft has to go or the card would appear twice.
    if (ok && isNew) onRemove()
  }

  const makeDefault = () =>
    draft.saved &&
    run(
      () => sellerProductsApi.updateVariant(productId, draft.saved!.id, { isDefault: true }),
      'This variant now represents the product.',
    )

  const remove = () =>
    draft.saved
      ? run(() => sellerProductsApi.deleteVariant(productId, draft.saved!.id), 'Variant removed.')
      : onRemove()

  async function upload(files: FileList | null) {
    if (!files?.length || !draft.saved) return
    const chosen = Array.from(files)
    // Show what was picked straight away; the server copies replace these once
    // the upload lands.
    const previews = chosen.map((file) => ({
      id: crypto.randomUUID(),
      mediaType: file.type.startsWith('video/') ? ('VIDEO' as const) : ('IMAGE' as const),
      url: URL.createObjectURL(file),
    }))
    setPending(previews)
    try {
      await run(async () => {
        for (const file of chosen) {
          await sellerProductsApi.uploadMedia(productId, { file, variantId: draft.saved!.id })
        }
        if (fileRef.current) fileRef.current.value = ''
      })
    } finally {
      previews.forEach((item) => URL.revokeObjectURL(item.url))
      setPending([])
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-white p-4">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
        <div className="min-w-0">
          <strong className="text-xs font-bold text-ink">{draft.name.trim() || `Variant ${index + 1}`}</strong>
          {draft.saved?.isDefault && <span className="ml-2"><Badge tone="info">Default</Badge></span>}
          {dirty && <span className="ml-2"><Badge tone="warning">Unsaved</Badge></span>}
          <span className="ml-2 text-[11px] text-muted">
            {draft.saved ? formatMoney(salePrice) : 'Not saved yet'}
            {draft.saved && discount > 0 && (
              <span className="ml-1.5 line-through opacity-60">{formatMoney(price)}</span>
            )}
            {draft.saved && media.length > 0 && (
              <span className="ml-2 inline-flex items-center gap-1">
                <ImagePlus size={10} /> {media.length}
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {draft.saved && (
            <button
              aria-pressed={draft.saved.isDefault}
              className={`${ui.iconButton} ${draft.saved.isDefault ? 'text-amber-500' : 'text-muted'}`}
              disabled={busy || draft.saved.isDefault}
              onClick={makeDefault}
              title={draft.saved.isDefault ? 'Shown on listings' : 'Show this one on listings'}
              type="button"
            >
              <Star fill={draft.saved.isDefault ? 'currentColor' : 'none'} size={13} />
            </button>
          )}
          <button className={dirty ? ui.primaryButton : ui.outlineButton} disabled={busy || !dirty || (checked && invalid)} onClick={() => void save()} type="button">
            <Save size={13} /> Save
          </button>
          <button aria-label="Remove variant" className={`${ui.iconButton} text-red-600`} disabled={busy} onClick={remove} type="button">
            <Trash2 size={13} />
          </button>
        </div>
      </header>

      <div className="space-y-3">
        <div>
          <Field label="Variant name">
            <input
              onChange={(event) => onChange({ ...draft, name: event.target.value })}
              placeholder="e.g. Red · Large"
              value={draft.name}
            />
          </Field>
          <FieldError message={checked ? errors.name : ''} />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="mb-1.5 block text-[11px] font-semibold text-muted mb-0">Options</span>
            <button
              className={ui.outlineButton}
              disabled={!unused.length}
              onClick={addValue}
              type="button"
            >
              <Plus size={13} /> Add option
            </button>
          </div>

          <div className="space-y-2">
            {draft.values.map((row) => (
              <div className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)_32px] gap-2" key={row.key}>
                <Select
                  onChange={(attributeId) =>
                    setValues(draft.values.map((item) => (item.key === row.key ? { ...item, attributeId } : item)))
                  }
                  options={attributes
                    .filter((attribute) => attribute.id === row.attributeId || !taken.has(attribute.id))
                    .map((attribute) => ({ label: attribute.name, value: attribute.id }))}
                  placeholder="Pick an option"
                  value={row.attributeId}
                />
                <input
                  className={ui.plainInput}
                  list={`values-${row.attributeId}`}
                  onChange={(event) =>
                    setValues(
                      draft.values.map((item) => (item.key === row.key ? { ...item, value: event.target.value } : item)),
                    )
                  }
                  placeholder={`e.g. ${attributes.find((item) => item.id === row.attributeId)?.values[0] ?? 'Red'}`}
                  value={row.value}
                />
                <button
                  aria-label="Remove option"
                  className={`${ui.iconButton} text-red-600`}
                  onClick={() => setValues(draft.values.filter((item) => item.key !== row.key))}
                  type="button"
                >
                  <X size={13} />
                </button>
                <datalist id={`values-${row.attributeId}`}>
                  {(attributes.find((item) => item.id === row.attributeId)?.values ?? []).map((value) => (
                    <option key={value} value={value} />
                  ))}
                </datalist>
              </div>
            ))}

            {!draft.values.length && (
              <p className="rounded-xl border border-dashed border-line bg-soft/50 p-3 text-center text-[11px] text-muted">
                {attributes.length
                  ? 'No options on this variant yet. Add the ones that apply.'
                  : 'Name an option on the previous step first.'}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="SKU">
            <input
              onChange={(event) => onChange({ ...draft, sku: event.target.value })}
              placeholder="Auto"
              value={draft.sku}
            />
          </Field>
          <div>
            <Field label="Price (RWF)">
              <span className="mr-2 shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-muted">RWF</span>
              <input
                inputMode="numeric"
                min="0"
                onChange={(event) => onChange({ ...draft, price: event.target.value })}
                placeholder="0"
                step="1"
                type="number"
                value={draft.price}
              />
            </Field>
            <FieldError message={checked ? errors.price : ''} />
          </div>
          <div>
            <Field label="Discount (%)">
              <input
                max="99"
                min="0"
                onChange={(event) => onChange({ ...draft, discountPercent: event.target.value })}
                placeholder="0"
                step="1"
                type="number"
                value={draft.discountPercent}
              />
            </Field>
            <FieldError message={errors.discount} />
          </div>
          <div>
            <Field label={draft.saved ? 'Stock on hand' : 'Opening stock'}>
              <input
                disabled={Boolean(draft.saved)}
                min="0"
                onChange={(event) => onChange({ ...draft, stockQuantity: event.target.value })}
                placeholder="0"
                step="1"
                type="number"
                value={draft.stockQuantity}
              />
            </Field>
            {draft.saved ? (
              <p className="text-[11px] leading-5 text-muted">Change it from the Inventory tab, so every move keeps a reason.</p>
            ) : (
              <FieldError message={checked ? errors.stock : ''} />
            )}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-[11px] font-semibold text-muted">Photos{media.length ? ` (${media.length})` : ''}</span>
          {draft.saved ? (
            <div className="flex flex-wrap items-center gap-2">
              {pending.map((item) => (
                <span className="relative size-16 overflow-hidden rounded-lg border border-line bg-soft" key={item.id}>
                  {item.mediaType === 'VIDEO' ? (
                    <video className="size-full object-cover opacity-60" muted playsInline src={item.url} />
                  ) : (
                    <img alt="" className="size-full object-cover opacity-60" src={item.url} />
                  )}
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="size-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                  </span>
                </span>
              ))}
              {media.map((item) => (
                <span className="group relative size-16 overflow-hidden rounded-lg border border-line bg-soft" key={item.id}>
                  {item.mediaType === 'VIDEO' ? (
                    <video className="size-full object-cover" muted playsInline preload="metadata" src={mediaUrl(item.url)} />
                  ) : (
                    <img alt={item.altText ?? ''} className="size-full object-cover" loading="lazy" src={mediaUrl(item.url)} />
                  )}
                  <button
                    aria-label="Remove photo"
                    className="absolute right-0.5 top-0.5 grid size-5 place-items-center rounded-full bg-white/95 text-red-600 opacity-0 transition group-hover:opacity-100"
                    disabled={busy}
                    onClick={() => void run(() => sellerProductsApi.deleteMedia(productId, item.id))}
                    type="button"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
              <button
                className="grid size-16 place-items-center rounded-lg border border-dashed border-line text-muted transition hover:border-ink/40 hover:text-ink"
                disabled={busy}
                onClick={() => fileRef.current?.click()}
                type="button"
              >
                <ImagePlus size={16} />
              </button>
              <input
                accept="image/*,video/mp4"
                className="hidden"
                multiple
                onChange={(event) => void upload(event.target.files)}
                ref={fileRef}
                type="file"
              />
            </div>
          ) : (
            <p className="text-[11px] leading-5 text-muted">Save this variant first, then add its photos.</p>
          )}
        </div>
      </div>
    </section>
  )
}

function FieldError({ message }: { message: string }) {
  if (!message) return null
  return <p className="mt-1 text-[10px] font-semibold text-red-600">{message}</p>
}
