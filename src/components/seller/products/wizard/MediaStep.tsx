import { ArrowLeft, ArrowRight, Star, Trash2, Upload } from 'lucide-react'
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
        subtitle="Photos attached to a variant show when a buyer picks it. Everything here is the product's own gallery, used as the default when a variant has none of its own."
        title="Product photos"
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
            <span className="text-[11px] leading-5 text-muted">Images and MP4 video. The starred image is the cover buyers see first.</span>
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
            onPrimary={(id) => void run(() => sellerProductsApi.updateMedia(product.id, id, { isPrimary: true }))}
          />
          {!shared.length && (
            <p className="rounded-xl border border-dashed border-line bg-soft/50 p-4 text-center text-[11px] text-muted">
              No product-level photos yet.
            </p>
          )}
        </div>
      </FormSection>

      {variants.filter((variant) => !variant.isPlaceholder).length > 0 && (
        <FormSection subtitle="Preview only — add or remove these on the Variants step." title="By variant">
          <div className="space-y-4">
            {variants
              .filter((variant) => !variant.isPlaceholder)
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
                      <MediaGrid caption={(item) => `${variant.name?.trim() || variant.sku} · ${item.mediaType === 'VIDEO' ? 'Video' : 'Photo'}`} items={own} readOnly />
                    ) : (
                      <p className="text-[11px] leading-5 text-muted">No photos of its own — the product gallery above is used instead.</p>
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

function MediaGrid({ busy = false, caption, items, onDelete, onPrimary, readOnly = false }: {
  busy?: boolean
  caption?: (item: ProductMedia) => string
  items: ProductMedia[]
  onDelete?: (mediaId: string) => void
  onPrimary?: (mediaId: string) => void
  readOnly?: boolean
}) {
  if (!items.length) return null
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {items.map((item) => (
        <figure className={`group ${ui.mediaTile}`} key={item.id}>
          {caption && <figcaption className={ui.mediaCaption}>{caption(item)}</figcaption>}
          {item.mediaType === 'VIDEO'
            ? <video muted playsInline preload="metadata" src={mediaUrl(item.url)} />
            : <img alt={item.altText ?? ''} loading="lazy" src={mediaUrl(item.url)} />}
          {item.isPrimary && <span className={ui.mediaBadge}><Star size={9} /> Cover</span>}
          {!readOnly && (
            <div className={ui.mediaOverlay}>
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
