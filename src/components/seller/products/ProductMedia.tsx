import { ImageIcon, Play, Star, Trash2, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState, type DragEvent } from 'react'
import { mediaUrl } from './ProductPageUi'
import type { ProductMedia } from '../../../lib/sellerProductsApi'
import { ui } from '../../ui/styles'

const MEDIA_ACCEPT = 'image/*,video/*'

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
          <h3 className="text-[11px] font-semibold text-muted">{label}</h3>
          <p className="mt-1 text-[10px] text-muted">{hint ?? 'The first file becomes the cover image. Drag files anywhere in this area.'}</p>
        </div>
        {drafts.length > 0 && (
          <button className={ui.outlineButton} onClick={() => inputRef.current?.click()} type="button">
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
            className={`${ui.dropzone} w-full ${dragging ? 'border-ink bg-soft' : ''}`}
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
                <div className={`group ${ui.mediaTile} ${index === 0 ? 'border-ink ring-2 ring-ink/15' : ''}`}>
                  {isVideoFile(draft.file)
                    ? <video muted playsInline src={draft.previewUrl} />
                    : <img alt={draft.file.name} src={draft.previewUrl} />}
                  {index === 0 && <span className={ui.mediaBadge}><Star size={9} /> Cover</span>}
                  {isVideoFile(draft.file) && index !== 0 && (
                    <span className="absolute left-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-ink/70 text-white"><Play size={10} /></span>
                  )}
                  <div className={ui.mediaOverlay}>
                    {index !== 0 && (
                      <button
                        className={ui.mediaAction}
                        onClick={() => onChange([draft, ...drafts.filter((item) => item.id !== draft.id)])}
                        title="Use as cover"
                        type="button"
                      >
                        <Star size={13} />
                      </button>
                    )}
                    <button
                      className={`${ui.mediaAction} text-red-600`}
                      onClick={() => onChange(drafts.filter((item) => item.id !== draft.id))}
                      title="Remove"
                      type="button"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
                <span className={ui.mediaCaption} title={draft.file.name}>{draft.file.name}</span>
                <span className="block text-[10px] text-muted/80">{formatBytes(draft.file.size)}</span>
              </div>
            ))}
            <button
              className={`${ui.dropzone} aspect-square ${dragging ? 'border-ink bg-soft' : ''}`}
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
          <div className={`group ${ui.mediaTile} ${item.isPrimary ? 'border-ink ring-2 ring-ink/15' : ''}`}>
            {item.mediaType === 'IMAGE'
              ? <img alt={item.altText ?? ''} src={mediaUrl(item.url)} />
              : <video muted playsInline src={mediaUrl(item.url)} />}
            {item.isPrimary && <span className={ui.mediaBadge}><Star size={9} /> Cover</span>}
            <div className={ui.mediaOverlay}>
              {!item.isPrimary && (
                <button className={ui.mediaAction} onClick={() => onMakePrimary(item)} title="Use as cover" type="button">
                  <Star size={13} />
                </button>
              )}
              <button className={`${ui.mediaAction} text-red-600`} onClick={() => onDelete(item)} title="Delete" type="button">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
          <span className={ui.mediaCaption}>{item.altText || item.mediaType.toLowerCase()} · {formatBytes(item.sizeBytes)}</span>
        </div>
      ))}
    </div>
  )
}

function useRevokePreviews(drafts: MediaDraft[]) {
  const tracked = useRef(new Set<string>())
  useEffect(() => {
    const current = new Set(drafts.map((draft) => draft.previewUrl))
    for (const url of tracked.current) if (!current.has(url)) URL.revokeObjectURL(url)
    tracked.current = current
  }, [drafts])
  useEffect(() => () => { for (const url of tracked.current) URL.revokeObjectURL(url) }, [])
}
