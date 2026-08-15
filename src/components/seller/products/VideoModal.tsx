import { Check, Search, Upload, X } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Badge, Button, Modal } from '../../ui'
import { useToast } from '../../../hooks/useToast'
import {
  sellerProductsApi,
  type SellerProduct,
  type SellerVideo,
  type VideoProduct,
} from '../../../lib/sellerProductsApi'
import { Field, mediaUrl } from './ProductPageUi'

/** Enough to fill the list without making it a scrolling chore. */
const PAGE_SIZE = 8

interface PickedProduct {
  id: string
  name: string
  status: string
}

export function VideoModal({ busy = false, onClose, onSubmit, video }: {
  busy?: boolean
  onClose: () => void
  onSubmit: (file: File | null, productIds: string[], altText: string) => void
  video?: SellerVideo
}) {
  const [picked, setPicked] = useState<PickedProduct[]>(
    () => video?.products.map(fromVideoProduct) ?? [],
  )
  const [file, setFile] = useState<File | null>(null)
  const [altText, setAltText] = useState(video?.altText ?? '')
  const toast = useToast()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!video && !file) {
      toast.error('Choose an MP4 file to upload.')
      return
    }
    if (!picked.length) {
      toast.error('Tag at least one product on the video.')
      return
    }
    onSubmit(file, picked.map((item) => item.id), altText.trim())
  }

  return (
    <Modal onClose={onClose} size="lg" title={video ? 'Edit video' : 'Add a video'}>
      <form className="space-y-4" onSubmit={submit}>
        {video ? (
          <video
            className="max-h-56 w-full rounded-xl border border-line bg-soft object-contain"
            controls
            src={mediaUrl(video.url)}
          />
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-line bg-soft/40 px-5 py-7 text-center transition hover:border-ink/35 hover:bg-soft">
            <Upload className="text-muted" size={18} />
            <span className="text-xs font-bold text-ink">
              {file ? file.name : 'Choose an MP4 video'}
            </span>
            <span className="text-[11px] leading-5 text-muted">
              Buyers scroll these in the marketplace feed.
            </span>
            <input
              accept="video/mp4"
              className="hidden"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              type="file"
            />
          </label>
        )}

        <Field label="Caption">
          <input
            onChange={(event) => setAltText(event.target.value)}
            placeholder="e.g. Unboxing the winter jacket"
            value={altText}
          />
        </Field>

        <ProductPicker onChange={setPicked} picked={picked} />

        <Button block disabled={busy} type="submit">
          {video ? 'Save changes' : 'Upload video'}
        </Button>
      </form>
    </Modal>
  )
}

/**
 * Searches the catalogue server-side rather than listing everything, so a shop
 * with hundreds of products stays usable. Picks stay pinned as chips even once
 * they drop out of the current results.
 */
function ProductPicker({ onChange, picked }: {
  onChange: (picked: PickedProduct[]) => void
  picked: PickedProduct[]
}) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<SellerProduct[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let live = true
    const timer = setTimeout(() => {
      setLoading(true)
      sellerProductsApi
        .list({ limit: PAGE_SIZE, search: search.trim(), sortBy: 'name', sortOrder: 'asc' })
        .then((page) => {
          if (!live) return
          setResults(page.contents)
          setTotal(page.meta.totalItems)
        })
        .catch(() => undefined)
        .finally(() => live && setLoading(false))
    }, 250)
    return () => {
      live = false
      clearTimeout(timer)
    }
  }, [search])

  const pickedIds = useMemo(() => new Set(picked.map((item) => item.id)), [picked])

  const toggle = (product: PickedProduct) =>
    onChange(
      pickedIds.has(product.id)
        ? picked.filter((item) => item.id !== product.id)
        : [...picked, product],
    )

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-muted">
          Products in this video ({picked.length})
        </span>
        <span className="text-[10px] text-muted">
          {total} in your catalogue
        </span>
      </div>

      {picked.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {picked.map((product, index) => (
            <button
              className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-2.5 py-1 text-[10px] font-bold text-white transition hover:bg-primary-dark"
              key={product.id}
              onClick={() => toggle(product)}
              title="Remove from this video"
              type="button"
            >
              <span className="opacity-60">{index + 1}</span>
              <span className="max-w-40 truncate">{product.name}</span>
              <X size={11} />
            </button>
          ))}
        </div>
      )}

      <label className="flex h-9 items-center gap-2 rounded-xl border border-line px-3 text-faint focus-within:border-ink">
        <Search className="shrink-0" size={14} />
        <input
          className="min-w-0 flex-1 bg-transparent text-xs text-ink outline-none"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search your products by name"
          value={search}
        />
      </label>

      <div className="mt-2 max-h-64 space-y-1 overflow-y-auto rounded-xl border border-line p-1.5">
        {results.map((product) => {
          const on = pickedIds.has(product.id)
          const cover = product.media.find((item) => item.isPrimary && item.mediaType === 'IMAGE')
            ?? product.media.find((item) => item.mediaType === 'IMAGE')
          return (
            <button
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition ${on ? 'bg-primary-light' : 'hover:bg-soft'}`}
              key={product.id}
              onClick={() => toggle({ id: product.id, name: product.name, status: product.status })}
              type="button"
            >
              <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-soft">
                {cover
                  ? <img alt="" className="size-full object-cover" loading="lazy" src={mediaUrl(cover.url)} />
                  : <span className="text-[9px] text-muted">No image</span>}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-ink">{product.name}</span>
                <span className="block truncate text-[10px] text-muted">
                  {product.categories.map((item) => item.name).join(', ') || 'Uncategorised'}
                </span>
              </span>
              <Badge tone={product.status === 'ACTIVE' ? 'success' : 'warning'}>{product.status}</Badge>
              {on && <Check className="shrink-0 text-primary-dark" size={14} />}
            </button>
          )
        })}

        {!results.length && (
          <p className="px-2 py-6 text-center text-[11px] leading-5 text-muted">
            {loading
              ? 'Loading…'
              : search.trim()
                ? 'No product matches that search.'
                : 'Create a product first — a video has to advertise something.'}
          </p>
        )}
      </div>

      {total > results.length && (
        <p className="mt-1.5 text-[11px] leading-5 text-muted">
          Showing the first {results.length}. Search to narrow it down.
        </p>
      )}
      <p className="mt-1.5 text-[11px] leading-5 text-muted">
        The order you pick them is the order buyers swipe through.
      </p>
    </div>
  )
}

const fromVideoProduct = (product: VideoProduct): PickedProduct => ({
  id: product.id,
  name: product.name,
  status: product.status,
})
