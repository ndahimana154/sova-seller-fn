import { Pencil, ImageIcon, Play } from 'lucide-react'
import { useCallback, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ProductInventory } from '../../../components/seller/products/ProductInventory'
import { AttributeTags } from '../../../components/ui/AttributeTags'
import { Badge, EmptyState } from '../../../components/ui'
import { PageTitle, StatusBadge, mediaUrl } from '../../../components/seller/products/ProductPageUi'
import { useSellerProduct } from '../../../components/seller/products/useSellerProduct'
import { formatMoney } from '../../../lib/money'
import type { ProductMedia, ProductVariant, SellerProduct } from '../../../lib/sellerProductsApi'
import { appPaths } from '../../../router/paths'
import { ui } from '../../../components/ui/styles'

type Tab = 'description' | 'options' | 'variants' | 'inventory'

export function SellerProductDetailsPage() {
  const { loading, product, setProduct } = useSellerProduct()
  const [tab, setTab] = useState<Tab>('description')

  const applyVariants = useCallback((variants: ProductVariant[]) => {
    setProduct((current) => (current ? { ...current, variants } : current))
  }, [setProduct])

  if (loading) return <div className="p-8 text-sm text-muted">Loading product…</div>
  if (!product) {
    return (
      <div className="space-y-5 p-5 sm:p-6">
        <EmptyState
          action={<Link className={ui.primaryButton} to={appPaths.products}>Back to products</Link>}
          message="It may have been deleted, or the link is wrong."
          title="Product not found"
        />
      </div>
    )
  }

  const variants = product.variants.filter((variant) => variant.isActive)
  const single = variants.length <= 1
  const tabs: Tab[] = single
    ? ['description', 'options', 'inventory']
    : ['description', 'variants', 'inventory']
  const active = tabs.includes(tab) ? tab : 'description'

  return (
    <div className="space-y-5 p-5">
      <PageTitle
        actions={<Link className={ui.primaryButton} to={appPaths.productEdit(product.id)}><Pencil size={14} /> Edit</Link>}
        subtitle={`${product.categories.map((category) => category.name).join(', ')} · ${product.variantCount} SKU${product.variantCount > 1 ? 'S' : ''} · #${product.id.slice(0, 8)}`}
        title={product.name}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
        <div className="space-y-5">
          <section className={`${ui.card} p-5`}>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">Price</p>
                <p className="mt-1 flex flex-wrap items-baseline gap-2">
                  <strong className="text-2xl font-black text-ink">{formatMoney(product.price)}</strong>
                  {product.maxPrice > product.price && (
                    <span className="text-xs text-muted">to {formatMoney(product.maxPrice)}</span>
                  )}
                </p>
              </div>
              <span className="flex items-center gap-2">
                <StatusBadge value={product.status} />
                <StatusBadge value={product.stockStatus} />
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <Tile label="Quantity" value={String(product.quantity)} />
              <Tile label="Options" value={String(product.attributes.length)} />
              <Tile label="Media" value={String(product.media.length)} />
              <Tile label="SKUs" value={String(product.variantCount)} />
            </dl>
          </section>

          <section className={ui.card}>
            <nav className="flex gap-1 border-b border-line px-3">
              {tabs.map((item) => (
                <button
                  className={`px-3 py-3 text-xs font-semibold capitalize transition ${active === item ? 'border-b-2 border-primary text-ink' : 'border-b-2 border-transparent text-muted hover:text-ink'}`}
                  key={item}
                  onClick={() => setTab(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </nav>
            <div className="p-5">
              {active === 'description' && (
                <div className="space-y-4">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{product.description || '—'}</p>
                  <dl className="divide-y divide-line border-t border-line text-sm">
                    <Row
                      label="Categories"
                      value={product.categories.map((category) => category.name).join(', ') || '—'}
                    />
                    <Row label="Brand" value={product.brand?.name || '—'} />
                    <Row label="Slug" value={product.slug} />
                    <Row label="Created" value={formatDate(product.createdAt)} />
                    <Row label="Last updated" value={formatDate(product.updatedAt)} />
                  </dl>
                </div>
              )}
              {active === 'options' && <SingleVariantPanel variant={variants[0]} />}
              {active === 'variants' && <VariantList variants={variants} />}
              {active === 'inventory' && <ProductInventory onChanged={applyVariants} product={product} />}
            </div>
          </section>
        </div>

        <section className={`${ui.card} order-first p-4 lg:order-none`}>
          <ProductGallery media={product.media} name={product.name} />
        </section>
      </div>
    </div>
  )
}

function ProductGallery({ media, name }: { media: SellerProduct['media']; name: string }) {
  const ordered = [...media].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.position - b.position)
  const [activeId, setActiveId] = useState('')
  const active = ordered.find((item) => item.id === activeId) ?? ordered[0]

  if (!active) {
    return (
      <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl border border-line bg-soft flex-col gap-2 text-muted">
        <ImageIcon size={34} />
        <span className="text-xs">No media uploaded yet.</span>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl border border-line bg-soft">
        {active.mediaType === 'IMAGE'
          ? <img alt={active.altText ?? name} className="size-full object-contain" src={mediaUrl(active.url)} />
          : <video className="size-full object-contain" controls src={mediaUrl(active.url)} />}
      </div>
      {ordered.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {ordered.map((item) => (
            <button
              aria-label={`Show ${item.mediaType.toLowerCase()}`}
              className={`relative size-16 shrink-0 overflow-hidden rounded-lg border bg-soft transition ${item.id === active.id ? 'border-ink ring-2 ring-ink/15' : 'border-line hover:border-ink/40'}`}
              key={item.id}
              onClick={() => setActiveId(item.id)}
              type="button"
            >
              <Thumb item={item} name={name} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Thumb({ item, name }: { item: ProductMedia; name: string }) {
  if (item.mediaType === 'IMAGE') return <img alt={item.altText ?? name} className="size-full object-cover" src={mediaUrl(item.url)} />
  return (
    <>
      <video className="size-full object-cover" muted playsInline src={mediaUrl(item.url)} />
      <span className="absolute inset-0 grid place-items-center bg-ink/35 text-white"><Play size={14} /></span>
    </>
  )
}

function Tile({ hint, label, value }: { hint?: string; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-canvas px-3.5 py-3">
      <dt>{label}</dt>
      <dd>{value}{hint && <span className="ml-1 text-[10px] font-semibold text-muted">{hint}</span>}</dd>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(96px,140px)_1fr] gap-4 py-3">
      <dt className="text-xs capitalize text-muted">{label}</dt>
      <dd className="text-sm break-words">{value}</dd>
    </div>
  )
}

function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-line bg-soft/40 px-4 py-8 text-center text-xs text-muted">{children}</p>
}

const formatDate = (value: string) => new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

function attributeMap(variant: ProductVariant): Record<string, string> {
  const map: Record<string, string> = {}
  for (const attribute of variant.attributes) map[attribute.name] = attribute.value
  return map
}

function PriceLine({ variant }: { variant: ProductVariant }) {
  return (
    <span className="flex flex-wrap items-baseline gap-2">
      <strong className="text-base font-black text-ink">{formatMoney(variant.salePrice)}</strong>
      {variant.discountPercent ? (
        <>
          <span className="text-xs text-muted line-through">{formatMoney(variant.price)}</span>
          <Badge tone="accent">−{variant.discountPercent}%</Badge>
          <span className="text-[10px] font-semibold text-green-700">
            Saves {formatMoney(variant.price - variant.salePrice)}
          </span>
        </>
      ) : null}
    </span>
  )
}

function SingleVariantPanel({ variant }: { variant?: ProductVariant }) {
  if (!variant) return <EmptyNote>This product has no SKU yet.</EmptyNote>
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-canvas px-4 py-3">
        <div className="space-y-1">
          <PriceLine variant={variant} />
          <p className="font-mono text-[10px] text-muted">{variant.sku}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">
            On hand <strong className="text-sm text-ink">{variant.stockQuantity}</strong>
          </span>
          <StatusBadge value={variant.stockStatus} />
        </div>
      </div>
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">Options</p>
        <AttributeTags
          attributes={attributeMap(variant)}
          emptyMessage="No options added for this product."
        />
      </div>
    </div>
  )
}

function VariantList({ variants }: { variants: ProductVariant[] }) {
  if (!variants.length) return <EmptyNote>This product has no SKUs yet.</EmptyNote>
  return (
    <div className="space-y-3">
      {variants.map((variant, index) => (
        <article className="rounded-xl border border-line bg-white p-4" key={variant.id}>
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <strong className="flex items-center gap-2 text-sm font-bold text-ink">
                <span className="truncate">{variant.name?.trim() || `Variant ${index + 1}`}</span>
                {variant.isDefault && <Badge tone="info">Default</Badge>}
              </strong>
              <span className="font-mono text-[10px] text-muted">{variant.sku}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">
                On hand <strong className="text-sm text-ink">{variant.stockQuantity}</strong>
              </span>
              <StatusBadge value={variant.stockStatus} />
            </div>
          </header>

          <div className="mt-3 border-t border-line pt-3">
            <PriceLine variant={variant} />
          </div>

          <div className="mt-3">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">Options</p>
            <AttributeTags attributes={attributeMap(variant)} emptyMessage="No options on this variant." size="sm" />
          </div>
        </article>
      ))}
    </div>
  )
}
