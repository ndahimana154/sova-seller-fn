import { ImageIcon, Play, Star, Trash2, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState, type DragEvent } from 'react'
import { mediaUrl } from './ProductPageUi'
import type { ProductMedia } from '../../../lib/sellerProductsApi'

const MEDIA_ACCEPT = 'image/*,video/*'

/** A file chosen in the browser but not uploaded yet. */
export interface MediaDraft {
  file: File
  id: string
  previewUrl: string
}

function createMediaDrafts(files: FileList | File[] | null): MediaDraft[] {
  return Array.from(files ?? []).map((file) => ({
    file,
    id: crypto.randomUUID(),
    previewUrl: URL.createObjectURL(file),
  }))
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const isVideoFile = (file: File) => file.type.startsWith('video/')

/** Multi-file picker with previews. Files append rather than replace; the first is the cover. */
export function ProductMediaPicker({ drafts, hint, label = 'Product media', onChange }: {
  drafts: MediaDraft[]
  hint?: string
  label?: string
  onChange: (drafts: MediaDraft[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  useRevokePreviews(drafts)

  function add(files: FileList | File[] | null) {
    const next = createMediaDrafts(files)
    if (next.length) onChange([...drafts, ...next])
  }

  function drop(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    setDragging(false)
    add(event.dataTransfer.files)
  }

  return (
    <section
      onDragLeave={() => setDragging(false)}
      onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
      onDrop={drop}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="seller-legend">{label}</h3>
          <p className="seller-legend-hint">{hint ?? 'The first file becomes the cover image. Drag files anywhere in this area.'}</p>
        </div>
        {drafts.length > 0 && (
          <button className="seller-outline-button" onClick={() => inputRef.current?.click()} type="button">
            <Upload size={13} /> Add more
          </button>
        )}
      </div>

      <input
        accept={MEDIA_ACCEPT}
        className="hidden"
        multiple
        onChange={(event) => { add(event.target.files); event.target.value = '' }}
        ref={inputRef}
        type="file"
      />

      {drafts.length === 0
        ? (
          <button
            className={`seller-dropzone w-full ${dragging ? 'seller-dropzone-active' : ''}`}
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            <span className="grid size-10 place-items-center rounded-full bg-white text-primary shadow-sm"><Upload size={18} /></span>
            <span className="text-xs font-bold text-ink">Click to upload or drop files here</span>
            <span className="text-[10px] text-muted">Images and videos · you can select several at once</span>
          </button>
        )
        : (
          <div className={`grid grid-cols-2 gap-3 rounded-2xl p-0.5 transition sm:grid-cols-3 lg:grid-cols-4 ${dragging ? 'ring-2 ring-primary/40' : ''}`}>
            {drafts.map((draft, index) => (
              <div key={draft.id}>
                <div className={`group seller-media-tile ${index === 0 ? 'seller-media-tile-cover' : ''}`}>
                  {isVideoFile(draft.file)
                    ? <video muted playsInline src={draft.previewUrl} />
                    : <img alt={draft.file.name} src={draft.previewUrl} />}
                  {index === 0 && <span className="seller-media-badge"><Star size={9} /> Cover</span>}
                  {isVideoFile(draft.file) && index !== 0 && (
                    <span className="absolute left-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-[#241f1a]/70 text-white"><Play size={10} /></span>
                  )}
                  <div className="seller-media-overlay">
                    {index !== 0 && (
                      <button
                        className="seller-media-action"
                        onClick={() => onChange([draft, ...drafts.filter((item) => item.id !== draft.id)])}
                        title="Use as cover"
                        type="button"
                      >
                        <Star size={13} />
                      </button>
                    )}
                    <button
                      className="seller-media-action text-red-600"
                      onClick={() => onChange(drafts.filter((item) => item.id !== draft.id))}
                      title="Remove"
                      type="button"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
                <span className="seller-media-caption" title={draft.file.name}>{draft.file.name}</span>
                <span className="block text-[10px] text-muted/80">{formatBytes(draft.file.size)}</span>
              </div>
            ))}
            <button
              className={`seller-dropzone aspect-square ${dragging ? 'seller-dropzone-active' : ''}`}
              onClick={() => inputRef.current?.click()}
              type="button"
            >
              <Upload size={16} />
              <span className="text-[10px] font-semibold">Add files</span>
            </button>
          </div>
        )}
    </section>
  )
}

export function ProductMediaGrid({ busy, media, onDelete, onMakePrimary }: {
  busy?: boolean
  media: ProductMedia[]
  onDelete: (item: ProductMedia) => void
  onMakePrimary: (item: ProductMedia) => void
}) {
  if (!media.length) {
    return (
      <p className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line bg-soft/40 px-4 py-8 text-center text-xs text-muted">
        <ImageIcon size={20} /> No media uploaded yet.
      </p>
    )
  }
  return (
    <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 ${busy ? 'pointer-events-none opacity-60' : ''}`}>
      {media.map((item) => (
        <div key={item.id}>
          <div className={`group seller-media-tile ${item.isPrimary ? 'seller-media-tile-cover' : ''}`}>
            {item.mediaType === 'IMAGE'
              ? <img alt={item.altText ?? ''} src={mediaUrl(item.url)} />
              : <video muted playsInline src={mediaUrl(item.url)} />}
            {item.isPrimary && <span className="seller-media-badge"><Star size={9} /> Cover</span>}
            <div className="seller-media-overlay">
              {!item.isPrimary && (
                <button className="seller-media-action" onClick={() => onMakePrimary(item)} title="Use as cover" type="button">
                  <Star size={13} />
                </button>
              )}
              <button className="seller-media-action text-red-600" onClick={() => onDelete(item)} title="Delete" type="button">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
          <span className="seller-media-caption">{item.altText || item.mediaType.toLowerCase()} · {formatBytes(item.sizeBytes)}</span>
        </div>
      ))}
    </div>
  )
}

/** Revokes object URLs for drafts that leave the list, and everything on unmount. */
function useRevokePreviews(drafts: MediaDraft[]) {
  const tracked = useRef(new Set<string>())
  useEffect(() => {
    const current = new Set(drafts.map((draft) => draft.previewUrl))
    for (const url of tracked.current) if (!current.has(url)) URL.revokeObjectURL(url)
    tracked.current = current
  }, [drafts])
  useEffect(() => () => { for (const url of tracked.current) URL.revokeObjectURL(url) }, [])
}
