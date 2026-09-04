import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Star, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { sellerProductsApi, type ProductMedia } from '../../../../lib/sellerProductsApi'
import { useToast } from '../../../../hooks/useToast'
import { Badge } from '../../../ui'
import { FormSection, mediaUrl } from '../ProductPageUi'
import { StepFooter, StepIssues } from './WizardShell'
import type { WizardState } from './useProductWizard'
import { ui } from '../../../ui/styles'

export function MediaStep({
  onBack,
  onSaved,
  wizard,
}: {
  onBack: () => void
  onSaved: () => void
  wizard: WizardState
}) {
  const { product } = wizard
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const issues = wizard.progress?.steps.find((step) => step.key === 'MEDIA')?.issues ?? []

  if (!product) return null

  const media = product.media
  const shared = media.filter((item) => !item.variantId)
  const variants = product.variants.filter((variant) => variant.isActive)

  async function run(work: () => Promise<unknown>) {
    setBusy(true)
    try {
      await work()
      await wizard.refresh()
    } catch (cause) {
      toast.error(cause)
    } finally {
      setBusy(false)
    }
  }

  /** Moves one photo within its own group and persists the whole new order. */
  async function move(items: ProductMedia[], mediaId: string, offset: number) {
    const from = items.findIndex((item) => item.id === mediaId)
    const to = from + offset
    if (from < 0 || to < 0 || to >= items.length) return
    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    // Position is global across the product, and the server wants every id.
    // Rebuild the full list in place: this group's slots take the new order,
    // everything else keeps exactly where it was.
    const groupIds = new Set(items.map((item) => item.id))
    let taken = 0
    const full = media.map((item) =>
      groupIds.has(item.id) ? next[taken++].id : item.id,
    )
    await run(() => sellerProductsApi.reorderMedia(product!.id, full))
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return
    await run(async () => {
      for (const file of Array.from(files)) {
        await sellerProductsApi.uploadMedia(product!.id, { file })
      }
      if (inputRef.current) inputRef.current.value = ''
    })
  }

  return (
    <div className="space-y-5">
      <FormSection
        subtitle="Shared photos and video for the whole product, used when a version has none of its own."
        title="Product gallery"
      >
        <div className="space-y-4">
          <StepIssues issues={issues} />

          <button
            className={`${ui.dropzone} w-full`}
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            <Upload className="text-muted" size={18} />
            <span className="text-xs font-bold text-ink">Add product photos</span>
            <span className="text-[11px] leading-5 text-muted">Extra photos or an MP4 video for the whole product. Version photos are managed below.</span>
          </button>
          <input
            accept="image/*,video/mp4"
            className="hidden"
            multiple
            onChange={(event) => void upload(event.target.files)}
            ref={inputRef}
            type="file"
          />

          <MediaGrid
            busy={busy}
            items={shared}
            onDelete={(id) => void run(() => sellerProductsApi.deleteMedia(product.id, id))}
            onMove={(id, offset) => void move(shared, id, offset)}
            onPrimary={(id) => void run(() => sellerProductsApi.updateMedia(product.id, id, { isPrimary: true }))}
          />
          {!shared.length && (
            <p className={`${ui.hint} p-4`}>
              No product-level photos yet.
            </p>
          )}
        </div>
      </FormSection>

      {variants.length > 0 && (
        <FormSection
          subtitle="Uploaded on the Versions step. Star the one buyers should see first, reorder them, or remove one here."
          title="By version"
        >
          <div className="space-y-4">
            {variants
              .map((variant) => {
                const own = media.filter((item) => item.variantId === variant.id)
                return (
                  <div key={variant.id}>
                    <p className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-bold text-ink">
                      {variant.name?.trim() || variant.attributes.map((attribute) => attribute.value).join(' / ') || variant.sku}
                      <span className="font-medium text-muted">{variant.sku}</span>
                      {variant.isDefault && <Badge tone="info">Default</Badge>}
                    </p>
                    {own.length ? (
                      <MediaGrid
                        busy={busy}
                        items={own}
                        onDelete={(mediaId) => void run(() => sellerProductsApi.deleteMedia(product!.id, mediaId))}
                        onMove={(mediaId, offset) => void move(own, mediaId, offset)}
                        onPrimary={(mediaId) => void run(() => sellerProductsApi.updateMedia(product!.id, mediaId, { isPrimary: true }))}
                      />
                    ) : (
                      <p className="text-[11px] leading-5 text-muted">No photos yet — add them on the Versions step.</p>
                    )}
                  </div>
                )
              })}
          </div>
        </FormSection>
      )}

      <StepFooter
        back={
          <button className={ui.outlineButton} onClick={onBack} type="button">
            <ArrowLeft size={13} /> Back
          </button>
        }
      >
        <button className={ui.primaryButton} onClick={onSaved} type="button">
          Continue <ArrowRight size={14} />
        </button>
      </StepFooter>
    </div>
  )
}

function MediaGrid({ busy = false, caption, items, onDelete, onMove, onPrimary, readOnly = false }: {
  busy?: boolean
  caption?: (item: ProductMedia) => string
  items: ProductMedia[]
  onDelete?: (mediaId: string) => void
  onMove?: (mediaId: string, offset: number) => void
  onPrimary?: (mediaId: string) => void
  readOnly?: boolean
}) {
  if (!items.length) return null
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {items.map((item, index) => (
        <figure className={`group ${ui.mediaTile}`} key={item.id}>
          {caption && <figcaption className={ui.mediaCaption}>{caption(item)}</figcaption>}
          {item.mediaType === 'VIDEO'
            ? <video muted playsInline preload="metadata" src={mediaUrl(item.url)} />
            : <img alt={item.altText ?? ''} loading="lazy" src={mediaUrl(item.url)} />}
          {item.isPrimary && <span className={ui.mediaBadge}><Star size={9} /> Cover</span>}
          {!readOnly && (
            <div className={ui.mediaOverlay}>
              {onMove && (
                <>
                  <button
                    aria-label="Move earlier"
                    className={ui.mediaAction}
                    disabled={busy || index === 0}
                    onClick={() => onMove(item.id, -1)}
                    type="button"
                  >
                    <ChevronLeft size={12} />
                  </button>
                  <button
                    aria-label="Move later"
                    className={ui.mediaAction}
                    disabled={busy || index === items.length - 1}
                    onClick={() => onMove(item.id, 1)}
                    type="button"
                  >
                    <ChevronRight size={12} />
                  </button>
                </>
              )}
              {!item.isPrimary && item.mediaType === 'IMAGE' && (
                <button
                  aria-label="Use as cover"
                  className={ui.mediaAction}
                  disabled={busy}
                  onClick={() => onPrimary?.(item.id)}
                  type="button"
                >
                  <Star size={12} />
                </button>
              )}
              <button
                aria-label="Delete photo"
                className={`${ui.mediaAction} text-red-600`}
                disabled={busy}
                onClick={() => onDelete?.(item.id)}
                type="button"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </figure>
      ))}
    </div>
  )
}
