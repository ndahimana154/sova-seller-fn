import { Eye, EyeOff, Globe, Heart, Pencil, Trash2, Upload } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Field, mediaUrl } from '../../../components/seller/products/ProductPageUi'
import { VideoModal } from '../../../components/seller/products/VideoModal'
import { Badge, Button } from '../../../components/ui'
import { ActionMenu } from '../../../components/ui/ActionMenu'
import { useConfirm } from '../../../components/ui/ConfirmDialog'
import { DataTable } from '../../../components/ui/DataTable'
import { Select } from '../../../components/ui/Select'
import { useToast } from '../../../hooks/useToast'
import {
  sellerProductsApi,
  type SellerProduct,
  type SellerVideo,
} from '../../../lib/sellerProductsApi'
import { appPaths } from '../../../router/paths'

const STATES = [
  { label: 'Any state', value: '' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Unpublished', value: 'UNPUBLISHED' },
]

export function SellerProductVideosPage() {
  const [videos, setVideos] = useState<SellerVideo[]>([])
  const [products, setProducts] = useState<SellerProduct[]>([])
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 1 })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [state, setState] = useState('')
  const [productId, setProductId] = useState('')
  const [uploading, setUploading] = useState(false)
  const [editing, setEditing] = useState<SellerVideo | null>(null)
  const [adding, setAdding] = useState(false)
  const confirm = useConfirm()
  const toast = useToast()

  const load = useCallback(async () => {
    try {
      const result = await sellerProductsApi.videos({
        limit,
        page,
        productId: productId || undefined,
        search: search.trim() || undefined,
        state: (state || undefined) as 'PUBLISHED' | 'UNPUBLISHED' | undefined,
      })
      setVideos(result.contents)
      setMeta(result.meta)
    } catch (cause) {
      toast.error(cause)
    }
  }, [limit, page, productId, search, state, toast])

  useEffect(() => { void load() }, [load])
  useEffect(() => {
    sellerProductsApi.list({ limit: 100, sortBy: 'name', sortOrder: 'asc' })
      .then((result) => setProducts(result.contents))
      .catch(() => undefined)
  }, [])

  async function upload(file: File | null, productIds: string[], altText: string) {
    if (!file) return
    setUploading(true)
    try {
      await sellerProductsApi.uploadVideo({ altText, file, productIds })
      setAdding(false)
      setPage(1)
      await load()
      toast.success('Video uploaded and published.')
    } catch (cause) {
      toast.error(cause)
    } finally {
      setUploading(false)
    }
  }

  async function retag(video: SellerVideo, productIds: string[], altText: string) {
    try {
      await sellerProductsApi.updateVideo(video.id, { altText, productIds })
      setEditing(null)
      await load()
      toast.success('Video updated.')
    } catch (cause) {
      toast.error(cause)
    }
  }

  async function togglePublish(video: SellerVideo) {
    const publishing = !video.isPublished
    const ok = await confirm({
      body: publishing
        ? <>Buyers will see this video in the marketplace feed alongside its live products.</>
        : <>The video stops showing to buyers. It stays in your library with its products intact.</>,
      confirmLabel: publishing ? 'Publish video' : 'Unpublish video',
      danger: !publishing,
      title: publishing ? 'Publish this video?' : 'Unpublish this video?',
    })
    if (!ok) return
    try {
      await (publishing
        ? sellerProductsApi.publishVideo(video.id)
        : sellerProductsApi.unpublishVideo(video.id))
      await load()
      toast.success(publishing ? 'Video is now live.' : 'Video was unpublished.')
    } catch (cause) {
      toast.error(cause)
    }
  }

  async function remove(video: SellerVideo) {
    const ok = await confirm({
      body: <>The video and its product tags are removed for good. Your products are untouched.</>,
      confirmLabel: 'Delete video',
      danger: true,
      title: 'Delete this video?',
    })
    if (!ok) return
    try {
      await sellerProductsApi.deleteVideo(video.id)
      await load()
      toast.success('Video deleted.')
    } catch (cause) {
      toast.error(cause)
    }
  }

  return (
    <div className="space-y-5 p-5 sm:p-6">
      {confirm.dialog}
      <DataTable
        activeFilterCount={[state, productId].filter(Boolean).length}
        columns={['Video', 'Products', 'Visibility', 'Likes', 'Added']}
        emptyMessage="No videos yet. Upload one and tag the products it shows."
        filters={
          <>
            <Field className="w-44" label="State">
              <Select onChange={setState} options={STATES} value={state} variant="bare" />
            </Field>
            <Field className="w-64" label="Product">
              <Select
                onChange={setProductId}
                options={[
                  { label: 'All products', value: '' },
                  ...products.map((item) => ({ label: item.name, value: item.id })),
                ]}
                value={productId}
                variant="bare"
              />
            </Field>
          </>
        }
        onSearchChange={(value) => { setPage(1); setSearch(value) }}
        pagination={{
          onPageChange: setPage,
          onPageSizeChange: (value) => { setLimit(value); setPage(1) },
          page,
          pageSize: limit,
          totalItems: meta.totalItems,
          totalPages: meta.totalPages,
        }}
        primaryAction={
          <Button onClick={() => setAdding(true)}><Upload size={14} /> Add video</Button>
        }
        rowActions={(index) => (
          <VideoActions
            onDelete={() => void remove(videos[index])}
            onEdit={() => setEditing(videos[index])}
            onTogglePublish={() => void togglePublish(videos[index])}
            video={videos[index]}
          />
        )}
        rows={videos.map((video) => [
          <Link className="flex items-center gap-2.5" to={appPaths.videoDetails(video.id)}>
            <video className="size-14 shrink-0 rounded-lg border border-line bg-soft object-cover" muted playsInline preload="metadata" src={mediaUrl(video.url)} />
            <span className="min-w-0">
              <span className="block truncate font-semibold text-ink">{video.altText || 'Untitled video'}</span>
              <span className="block text-[10px] text-muted">{formatSize(video.sizeBytes)}</span>
            </span>
          </Link>,
          <span className="flex flex-wrap items-center gap-1.5">
            <Badge tone="info">{video.products.length}</Badge>
          </span>,
          <VisibilityCell video={video} />,
          <span className="inline-flex items-center gap-1"><Heart size={12} /> {video.likeCount}</span>,
          new Date(video.createdAt).toLocaleDateString(),
        ])}
        searchPlaceholder="Search videos"
        subtitle="Short clips buyers scroll through. Each one can advertise several products."
        title="Videos"
      />

      {adding && (
        <VideoModal busy={uploading} onClose={() => setAdding(false)} onSubmit={upload} />
      )}
      {editing && (
        <VideoModal
          onClose={() => setEditing(null)}
          onSubmit={(_file, productIds, altText) => retag(editing, productIds, altText)}
          video={editing}
        />
      )}
    </div>
  )
}

function VisibilityCell({ video }: { video: SellerVideo }) {
  if (video.isVisible) return <Badge tone="success">Live</Badge>
  if (video.isPublished) return <Badge tone="warning">No live product</Badge>
  return <Badge tone="neutral">Unpublished</Badge>
}

function VideoActions({ onDelete, onEdit, onTogglePublish, video }: {
  onDelete: () => void
  onEdit: () => void
  onTogglePublish: () => void
  video: SellerVideo
}) {
  return (
    <ActionMenu items={[
      { icon: <Eye size={14} />, label: 'View details', to: appPaths.videoDetails(video.id) },
      { icon: <Pencil size={14} />, label: 'Edit products', onSelect: onEdit },
      {
        icon: video.isPublished ? <EyeOff size={14} /> : <Globe size={14} />,
        label: video.isPublished ? 'Unpublish video' : 'Publish video',
        onSelect: onTogglePublish,
        separatorBefore: true,
      },
      { danger: true, icon: <Trash2 size={14} />, label: 'Delete video', onSelect: onDelete },
    ]} />
  )
}

const formatSize = (bytes: number) => {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}
