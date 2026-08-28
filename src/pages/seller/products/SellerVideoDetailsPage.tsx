import { EyeOff, Globe, Heart, Pencil, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageTitle, mediaUrl } from '../../../components/seller/products/ProductPageUi'
import { VideoModal } from '../../../components/seller/products/VideoModal'
import { Badge, Button, Card, EmptyState } from '../../../components/ui'
import { useConfirm } from '../../../components/ui/ConfirmDialog'
import { useToast } from '../../../hooks/useToast'
import { sellerProductsApi, type SellerVideo } from '../../../lib/sellerProductsApi'
import { appPaths } from '../../../router/paths'
import { ui } from '../../../components/ui/styles'

export function SellerVideoDetailsPage() {
  const { videoId } = useParams()
  const navigate = useNavigate()
  const [video, setVideo] = useState<SellerVideo | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const confirm = useConfirm()
  const toast = useToast()

  const load = useCallback(async () => {
    if (!videoId) return
    try {
      setVideo(await sellerProductsApi.video(videoId))
    } catch (cause) {
      toast.error(cause)
    } finally {
      setLoading(false)
    }
  }, [toast, videoId])

  useEffect(() => { void load() }, [load])

  async function togglePublish() {
    if (!video) return
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

  async function remove() {
    if (!video) return
    const ok = await confirm({
      body: <>The video and its product tags are removed for good. Your products are untouched.</>,
      confirmLabel: 'Delete video',
      danger: true,
      title: 'Delete this video?',
    })
    if (!ok) return
    try {
      await sellerProductsApi.deleteVideo(video.id)
      toast.success('Video deleted.')
      navigate(appPaths.videos)
    } catch (cause) {
      toast.error(cause)
    }
  }

  if (loading) return <div className="p-8 text-sm text-muted">Loading video…</div>
  if (!video) {
    return (
      <div className="space-y-5 p-5 sm:p-6">
        <EmptyState
          action={<Link className={ui.inlineLink} to={appPaths.videos}>Back to videos</Link>}
          message="It may have been deleted, or the link is wrong."
          title="Video not found"
        />
      </div>
    )
  }

  return (
    <div className="space-y-5 p-5 sm:p-6">
      {confirm.dialog}
      <PageTitle
        actions={
          <>
            <Button onClick={() => setEditing(true)} variant="outline">
              <Pencil size={14} /> Edit
            </Button>
            <Button onClick={() => void togglePublish()} variant={video.isPublished ? 'outline' : 'primary'}>
              {video.isPublished ? <><EyeOff size={14} /> Unpublish</> : <><Globe size={14} /> Publish</>}
            </Button>
            <Button onClick={() => void remove()} variant="danger">
              <Trash2 size={14} /> Delete
            </Button>
          </>
        }
        subtitle={`Added ${new Date(video.createdAt).toLocaleDateString()} · ${formatSize(video.sizeBytes)}`}
        title={video.altText || 'Untitled video'}
      />


      <div className="grid gap-5 lg:grid-cols-[minmax(0,.8fr)_minmax(320px,1.2fr)]">
        <Card padded={false} tone="raised">
          <video className="aspect-[9/16] w-full rounded-2xl bg-ink object-contain" controls src={mediaUrl(video.url)} />
        </Card>

        <div className="space-y-5">
          <Card tone="raised">
            <div className="flex flex-wrap items-center gap-2">
              {video.isVisible
                ? <Badge tone="success">Live for buyers</Badge>
                : video.isPublished
                  ? <Badge tone="warning">Published, no live product</Badge>
                  : <Badge tone="neutral">Unpublished</Badge>}
              <Badge tone="info">{video.products.length} product{video.products.length === 1 ? '' : 's'}</Badge>
              <Badge tone="purple"><Heart size={10} /> {video.likeCount} likes</Badge>
            </div>
            {video.isPublished && !video.isVisible && (
              <p className="mt-3 text-[11px] leading-5 text-muted">
                None of the products below are live, so buyers cannot reach this video yet. Publish
                one of them and it appears in the feed automatically.
              </p>
            )}
          </Card>

          <Card tone="raised">
            <div className="mb-3 flex items-center justify-between gap-2 border-b border-line pb-3">
              <h2 className="text-sm font-bold text-ink">
                Products in this video ({video.products.length})
              </h2>

            </div>
            <ol className="space-y-2">
              {video.products.map((product, index) => (
                <li key={product.id}>
                  <Link
                    className="flex items-center gap-3 rounded-xl border border-line p-2.5 transition hover:border-ink/25 hover:bg-soft"
                    to={appPaths.productDetails(product.id)}
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-soft text-[10px] font-bold text-muted">
                      {index + 1}
                    </span>
                    <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-soft">
                      {product.coverUrl
                        ? <img alt="" className="size-full object-cover" loading="lazy" src={mediaUrl(product.coverUrl)} />
                        : <span className="text-[9px] text-muted">No image</span>}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-ink">{product.name}</span>
                      <span className="block truncate text-[10px] text-muted">{product.slug}</span>
                    </span>
                    <Badge tone={product.isVisible ? 'success' : 'warning'}>
                      {product.isVisible ? 'Live' : product.status}
                    </Badge>
                  </Link>
                </li>
              ))}
              {!video.products.length && (
                <li className={`${ui.hint} p-6`}>
                  No products tagged yet.
                </li>
              )}
            </ol>
            <p className="mt-3 text-[11px] leading-5 text-muted">
              Buyers swipe through these in order, so the first one leads.
            </p>
          </Card>
        </div>
      </div>

      {editing && (
        <VideoModal
          onClose={() => setEditing(false)}
          onSubmit={async (_file, productIds, altText) => {
            try {
              await sellerProductsApi.updateVideo(video.id, { altText, productIds })
              setEditing(false)
              await load()
              toast.success('Video updated.')
            } catch (cause) {
              toast.error(cause)
            }
          }}
          video={video}
        />
      )}
    </div>
  )
}

const formatSize = (bytes: number) => {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}
