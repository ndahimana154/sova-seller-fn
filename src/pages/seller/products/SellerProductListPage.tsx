import { Edit3, Eye, ImageIcon, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Feedback, PageTitle, StatusBadge, errorMessage, mediaUrl } from '../../../components/seller/products/ProductPageUi'
import { ActionMenu } from '../../../components/ui/ActionMenu'
import { AttributeTags } from '../../../components/ui/AttributeTags'
import { useConfirm } from '../../../components/ui/ConfirmDialog'
import { DataTable } from '../../../components/ui/DataTable'
import { Select } from '../../../components/ui/Select'
import { formatPrice } from '../../../lib/formatPrice'
import { sellerProductsApi, type SellerCategory, type SellerProduct } from '../../../lib/sellerProductsApi'
import { appPaths } from '../../../router/paths'

export function SellerProductListPage() {
  const [products, setProducts] = useState<SellerProduct[]>([])
  const [categories, setCategories] = useState<SellerCategory[]>([])
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 1 })
  const confirm = useConfirm()
  const load = useCallback(async () => {
    try {
      const result = await sellerProductsApi.list({ categoryId, limit, page, search, sortBy: 'updatedAt', sortOrder: 'desc' })
      setProducts(result.contents); setMeta(result.meta)
    } catch (cause) { setError(errorMessage(cause)) }
  }, [categoryId, limit, page, search])
  useEffect(() => { void load() }, [load])
  useEffect(() => { sellerProductsApi.categories().then(setCategories).catch(() => undefined) }, [])
  async function remove(product: SellerProduct) {
    const ok = await confirm({
      body: <>“{product.name}” and its media will be removed from your catalogue. This cannot be undone.</>,
      confirmLabel: 'Delete product',
      danger: true,
      title: 'Delete this product?',
    })
    if (!ok) return
    try { await sellerProductsApi.delete(product.id); await load() } catch (cause) { setError(errorMessage(cause)) }
  }
  return <div className="space-y-5 p-5">
    {confirm.dialog}
    <PageTitle title="Products" subtitle="Manage your shop catalogue." actions={<Link className="seller-primary-button" to={appPaths.productCreate}><Plus size={14} /> New product</Link>} />
    <Feedback error={error} />
    <DataTable columns={['Product', 'Category', 'Tags', 'Price', 'Stock', 'Quantity']} onSearchChange={(value) => { setPage(1); setSearch(value) }} searchPlaceholder="Search products"
      filters={<Select
        className="w-52"
        onChange={(value) => { setPage(1); setCategoryId(value) }}
        options={[{ label: 'All categories', value: '' }, ...categories.map((item) => ({ label: item.name, value: item.id }))]}
        placeholder="All categories"
        size="sm"
        value={categoryId}
      />}
      pagination={{ page, pageSize: limit, totalItems: meta.totalItems, totalPages: meta.totalPages, onPageChange: setPage, onPageSizeChange: (value) => { setLimit(value); setPage(1) } }}
      rows={products.map((product) => [
        <ProductCell product={product} />,
        product.category.name,
        <AttributeTags attributes={product.variants} limit={2} size="sm" />,
        <PriceCell product={product} />,
        <StatusBadge value={product.stockStatus} />,
        product.quantity,
      ])}
      rowActions={(index) => <ProductActions
        onDelete={() => void remove(products[index])}
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
        <span className="block truncate text-[10px] text-muted">{product.brand || 'No brand'}</span>
      </span>
    </Link>
  )
}

function PriceCell({ product }: { product: SellerProduct }) {
  if (product.discount <= 0) return <span className="text-ink">{formatPrice(product.finalPrice)}</span>
  return (
    <span>
      <strong className="block text-ink">{formatPrice(product.finalPrice)}</strong>
      <span className="block text-[10px] text-muted"><s>{formatPrice(product.price)}</s> · {product.discount}% off</span>
    </span>
  )
}

function ProductActions({ onDelete, product }: {
  onDelete: () => void
  product: SellerProduct
}) {
  return (
    <ActionMenu items={[
      { icon: <Eye size={14} />, label: 'View details', to: appPaths.productDetails(product.id) },
      { icon: <Edit3 size={14} />, label: 'Edit product', to: appPaths.productEdit(product.id) },
      { danger: true, icon: <Trash2 size={14} />, label: 'Delete product', onSelect: onDelete, separatorBefore: true },
    ]} />
  )
}
