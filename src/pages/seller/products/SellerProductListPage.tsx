import { Pencil, Eye, EyeOff, Globe, ImageIcon, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Field, StatusBadge, mediaUrl } from '../../../components/seller/products/ProductPageUi'
import { useToast } from '../../../hooks/useToast'
import { Badge } from '../../../components/ui'
import { ActionMenu } from '../../../components/ui/ActionMenu'
import { useConfirm } from '../../../components/ui/ConfirmDialog'
import { DataTable } from '../../../components/ui/DataTable'
import { Select } from '../../../components/ui/Select'
import { formatMoney } from '../../../lib/money'
import { sellerProductsApi, type SellerCategory, type SellerProduct } from '../../../lib/sellerProductsApi'
import { appPaths } from '../../../router/paths'
import { ui } from '../../../components/ui/styles'

export function SellerProductListPage() {
  const [products, setProducts] = useState<SellerProduct[]>([])
  const [categories, setCategories] = useState<SellerCategory[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 1 })
  const confirm = useConfirm()
  const toast = useToast()
  const load = useCallback(async () => {
    try {
      const result = await sellerProductsApi.list({ categoryId, limit, page, search, sortBy: 'updatedAt', sortOrder: 'desc' })
      setProducts(result.contents); setMeta(result.meta)
    } catch (cause) { toast.error(cause) }
  }, [categoryId, limit, page, search, toast])
  useEffect(() => { void load() }, [load])
  useEffect(() => { sellerProductsApi.categories().then(setCategories).catch(() => undefined) }, [])
  async function togglePublish(product: SellerProduct) {
    const publishing = product.status !== 'ACTIVE'
    const ok = await confirm({
      body: publishing
        ? <>“{product.name}” goes live in the marketplace and buyers can order it right away.</>
        : <>“{product.name}” is hidden from buyers. Its details, media and stock stay as they are, and you can publish it again whenever you want.</>,
      confirmLabel: publishing ? 'Publish product' : 'Unpublish product',
      danger: !publishing,
      title: publishing ? 'Publish this product?' : 'Unpublish this product?',
    })
    if (!ok) return
    try {
      await (publishing ? sellerProductsApi.publish(product.id) : sellerProductsApi.unpublish(product.id))
      await load()
      toast.success(publishing ? `“${product.name}” is now live.` : `“${product.name}” was unpublished.`)
    } catch (cause) { toast.error(cause) }
  }
  async function remove(product: SellerProduct) {
    const ok = await confirm({
      body: <>“{product.name}” and its media will be removed from your catalogue. This cannot be undone.</>,
      confirmLabel: 'Delete product',
      danger: true,
      title: 'Delete this product?',
    })
    if (!ok) return
    try {
      await sellerProductsApi.delete(product.id)
      await load()
      toast.success(`“${product.name}” was deleted.`)
    } catch (cause) { toast.error(cause) }
  }
  return <div className="space-y-5 p-5 sm:p-6">
    {confirm.dialog}
    <DataTable columns={['Product', 'Category', 'Status', 'Variants', 'Price', 'Stock', 'Available']}
      onSearchChange={(value) => { setPage(1); setSearch(value) }}
      searchPlaceholder="Search products"
      title="Products" subtitle="Manage your shop catalogue."
      primaryAction={<Link className={ui.primaryButton} to={appPaths.productCreate}><Plus size={14} /> New product</Link>}
      activeFilterCount={categoryId ? 1 : 0}
      filters={<Field className="w-52" label="Category">
        <Select
          onChange={(value) => { setPage(1); setCategoryId(value) }}
          options={[{ label: 'All categories', value: '' }, ...categories.map((item) => ({ label: item.name, value: item.id }))]}
          placeholder="All categories"
          value={categoryId}
          variant="bare"
        />
      </Field>}
      pagination={{ page, pageSize: limit, totalItems: meta.totalItems, totalPages: meta.totalPages, onPageChange: setPage, onPageSizeChange: (value) => { setLimit(value); setPage(1) } }}
      rows={products.map((product) => [
        <ProductCell product={product} />,
        product.categories.map((category) => category.name).join(', '),
        <StatusBadge value={product.status} />,
        <VariantsCell product={product} />,
        <PriceCell product={product} />,
        <StatusBadge value={product.stockStatus} />,
        product.quantity,
      ])}
      rowActions={(index) => <ProductActions
        onDelete={() => void remove(products[index])}
        onTogglePublish={() => void togglePublish(products[index])}
        product={products[index]}
      />} />
  </div>
}

function ProductCell({ product }: { product: SellerProduct }) {
  const cover = product.media.find((item) => item.isPrimary && item.mediaType === 'IMAGE')
    ?? product.media.find((item) => item.mediaType === 'IMAGE')
  return (
    <Link className="flex items-center gap-2.5" to={appPaths.productDetails(product.id)}>
      <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-soft">
        {cover
          ? <img alt="" className="size-full object-cover" loading="lazy" src={mediaUrl(cover.url)} />
          : <ImageIcon className="text-muted" size={15} />}
      </span>
      <span className="min-w-0">
        <strong className="block truncate text-ink">{product.name}</strong>
        <span className="block truncate text-[10px] text-muted">{product.brand?.name || 'No brand'}</span>
      </span>
    </Link>
  )
}

function VariantsCell({ product }: { product: SellerProduct }) {
  const featured = product.defaultVariant
  if (product.variantCount <= 1) {
    return (
      <span>
        <span className="block text-muted">Single SKU</span>
        {featured && <span className="block font-mono text-[10px] text-muted">{featured.sku}</span>}
      </span>
    )
  }
  return (
    <span>
      <strong className="block text-ink">{product.variantCount} SKUs</strong>
      <span className="block truncate text-[10px] text-muted">
        {featured?.name?.trim() || featured?.sku || product.attributes.map((option) => option.name).join(' · ')}
      </span>
    </span>
  )
}

function PriceCell({ product }: { product: SellerProduct }) {
  const featured = product.defaultVariant
  if (!featured) return <span className="text-muted">—</span>
  return (
    <span className="text-ink">
      <span className="flex items-center gap-1.5">
        {formatMoney(featured.salePrice)}
        {featured.discountPercent ? <Badge tone="accent">−{featured.discountPercent}%</Badge> : null}
      </span>
      {featured.discountPercent ? (
        <span className="block text-[10px] text-muted line-through">{formatMoney(featured.price)}</span>
      ) : product.maxPrice > product.price ? (
        <span className="block text-[10px] text-muted">up to {formatMoney(product.maxPrice)}</span>
      ) : null}
    </span>
  )
}

function ProductActions({ onDelete, onTogglePublish, product }: {
  onDelete: () => void
  onTogglePublish: () => void
  product: SellerProduct
}) {
  const live = product.status === 'ACTIVE'
  return (
    <ActionMenu items={[
      { icon: <Eye size={14} />, label: 'View details', to: appPaths.productDetails(product.id) },
      { icon: <Pencil size={14} />, label: 'Edit product', to: appPaths.productEdit(product.id) },
      {
        icon: live ? <EyeOff size={14} /> : <Globe size={14} />,
        label: live ? 'Unpublish product' : 'Publish product',
        onSelect: onTogglePublish,
        separatorBefore: true,
      },
      { danger: true, icon: <Trash2 size={14} />, label: 'Delete product', onSelect: onDelete },
    ]} />
  )
}
