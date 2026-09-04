import { ChevronLeft, ChevronRight, ImagePlus, Plus, Star, Trash2, X } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { sellerResourceUrl } from '../../../../lib/sellerApi'
import { Field } from '../ProductPageUi'
import { ui } from '../../../ui/styles'
import type { VersionDraft, VersionErrors } from './versionDraft'

interface VersionCardProps {
  errors: VersionErrors
  index: number
  named: boolean
  onChange: (next: VersionDraft) => void
  onRemove?: () => void
  version: VersionDraft
}

export function VersionCard({
  errors,
  index,
  named,
  onChange,
  onRemove,
  version,
}: VersionCardProps) {
  const patch = (changes: Partial<VersionDraft>) => onChange({ ...version, ...changes })

  // Blob URLs only exist for files picked in this session; revoke them when the
  // set changes so previews do not leak.
  const files = useMemo(
    () => version.photos.filter((photo) => photo.file),
    [version.photos],
  )
  const blobUrls = useMemo(
    () => new Map(files.map((photo) => [photo.key, URL.createObjectURL(photo.file!)])),
    [files],
  )
  useEffect(
    () => () => blobUrls.forEach((url) => URL.revokeObjectURL(url)),
    [blobUrls],
  )

  const srcOf = (photo: (typeof version.photos)[number]) =>
    photo.url ? sellerResourceUrl(photo.url) : (blobUrls.get(photo.key) ?? '')

  function movePhoto(key: string, offset: number) {
    const from = version.photos.findIndex((photo) => photo.key === key)
    const to = from + offset
    if (from < 0 || to < 0 || to >= version.photos.length) return
    const next = [...version.photos]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    patch({ photos: next })
  }

  function removePhoto(key: string) {
    const next = version.photos.filter((photo) => photo.key !== key)
    patch({
      coverKey: version.coverKey === key ? (next[0]?.key ?? null) : version.coverKey,
      photos: next,
    })
  }

  const setOption = (key: string, changes: Partial<{ name: string; value: string }>) =>
    patch({
      options: version.options.map((option) =>
        option.key === key ? { ...option, ...changes } : option,
      ),
    })

  return (
    <article className="rounded-xl border border-line bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted">
          {named ? `Version ${index + 1}` : 'Price and stock'}
        </p>
        {onRemove && (
          <button
            aria-label={`Remove version ${index + 1}`}
            className="grid size-7 place-items-center rounded-lg text-muted transition hover:bg-soft hover:text-red-600"
            onClick={onRemove}
            type="button"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {named && (
          <Field className="md:col-span-2" error={errors.name} label="Version name" required>
            <input
              onChange={(event) => patch({ name: event.target.value })}
              placeholder="e.g. Small / Red"
              value={version.name}
            />
          </Field>
        )}

        <Field error={errors.price} label="Price (RWF)" required>
          <span className="mr-2 shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
            RWF
          </span>
          <input
            inputMode="numeric"
            min="1"
            onChange={(event) => patch({ price: event.target.value })}
            placeholder="0"
            step="1"
            type="number"
            value={version.price}
          />
        </Field>

        <Field label="Discount (optional)">
          <input
            inputMode="numeric"
            max="99"
            min="0"
            onChange={(event) => patch({ discountPercent: event.target.value })}
            placeholder="0"
            step="1"
            type="number"
            value={version.discountPercent}
          />
          <span className="ml-2 shrink-0 text-[10px] font-bold text-muted">%</span>
        </Field>

        <Field
          error={errors.stockQuantity}
          hint={version.saved ? 'Any change is recorded as a stock movement' : undefined}
          label={version.saved ? 'Stock on hand' : 'Opening stock'}
          required
        >
          <input
            inputMode="numeric"
            min="1"
            onChange={(event) => patch({ stockQuantity: event.target.value })}
            placeholder="1"
            step="1"
            type="number"
            value={version.stockQuantity}
          />
        </Field>
      </div>

      <div className="mt-4 border-t border-line pt-3">
        <p className="text-[11px] font-semibold text-muted">
          Photos<span className="ml-0.5 text-red-600">*</span>
          <span className="ml-1 font-normal text-faint">— what buyers see when they pick this version</span>
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          {version.photos.map((photo, index) => {
            const cover = version.coverKey === photo.key
            return (
              <span
                className={`relative overflow-hidden rounded-lg border-2 ${cover ? 'border-ink' : 'border-line'}`}
                key={photo.key}
              >
                <img alt="" className="size-24 object-cover" src={srcOf(photo)} />

                {cover && (
                  <span className="absolute left-1 top-1 rounded-full bg-ink px-1.5 py-0.5 text-[9px] font-black text-white">
                    Cover
                  </span>
                )}

                <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-0.5 bg-ink/70 py-1">
                  <button
                    aria-label="Move earlier"
                    className="grid size-5 place-items-center rounded text-white transition hover:bg-white/25 disabled:opacity-30"
                    disabled={index === 0}
                    onClick={() => movePhoto(photo.key, -1)}
                    type="button"
                  >
                    <ChevronLeft size={12} />
                  </button>
                  <button
                    aria-label="Set as cover"
                    className="grid size-5 place-items-center rounded text-white transition hover:bg-white/25 disabled:opacity-30"
                    disabled={cover}
                    onClick={() => patch({ coverKey: photo.key })}
                    type="button"
                  >
                    <Star size={12} />
                  </button>
                  <button
                    aria-label="Move later"
                    className="grid size-5 place-items-center rounded text-white transition hover:bg-white/25 disabled:opacity-30"
                    disabled={index === version.photos.length - 1}
                    onClick={() => movePhoto(photo.key, 1)}
                    type="button"
                  >
                    <ChevronRight size={12} />
                  </button>
                </span>

                <button
                  aria-label="Remove photo"
                  className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-ink text-white transition hover:bg-red-600"
                  onClick={() => removePhoto(photo.key)}
                  type="button"
                >
                  <X size={11} />
                </button>
              </span>
            )
          })}

          <label className="grid size-24 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-line text-muted transition hover:border-ink/35 hover:bg-soft">
            <ImagePlus size={18} />
            <input
              accept="image/*"
              className="hidden"
              multiple
              onChange={(event) => {
                const picked = Array.from(event.target.files ?? []).map((file) => ({
                  file,
                  key: crypto.randomUUID(),
                }))
                if (picked.length) {
                  const next = [...version.photos, ...picked]
                  patch({ coverKey: version.coverKey ?? next[0].key, photos: next })
                }
                event.target.value = ''
              }}
              type="file"
            />
          </label>
        </div>

        {errors.photos && (
          <p className="mt-1.5 text-[11px] font-semibold text-red-600" role="alert">
            {errors.photos}
          </p>
        )}
      </div>

      <div className="mt-4 border-t border-line pt-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold text-muted">
            Options <span className="font-normal text-faint">— optional, e.g. Colour is Red</span>
          </p>
          <button
            className="inline-flex items-center gap-1 text-[11px] font-bold text-ink hover:underline"
            onClick={() =>
              patch({
                options: [
                  ...version.options,
                  { key: crypto.randomUUID(), name: '', value: '' },
                ],
              })
            }
            type="button"
          >
            <Plus size={12} /> Add option
          </button>
        </div>

        {version.options.length > 0 && (
          <div className="mt-2 space-y-2">
            {version.options.map((option) => (
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_28px] gap-2" key={option.key}>
                <span className={ui.formControl}>
                  <input
                    onChange={(event) => setOption(option.key, { name: event.target.value })}
                    placeholder="Option (Colour)"
                    value={option.name}
                  />
                </span>
                <span className={ui.formControl}>
                  <input
                    onChange={(event) => setOption(option.key, { value: event.target.value })}
                    placeholder="Value (Red)"
                    value={option.value}
                  />
                </span>
                <button
                  aria-label="Remove option"
                  className="grid size-7 place-items-center self-center rounded-lg text-muted transition hover:bg-soft hover:text-red-600"
                  onClick={() =>
                    patch({ options: version.options.filter((item) => item.key !== option.key) })
                  }
                  type="button"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {errors.options && (
          <p className="mt-1.5 text-[11px] font-semibold text-red-600" role="alert">
            {errors.options}
          </p>
        )}
      </div>
    </article>
  )
}
