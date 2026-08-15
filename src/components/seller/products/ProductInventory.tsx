import { ArrowDownLeft, ArrowUpRight, Plus } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Button } from '../../ui/Button'
import { DataTable } from '../../ui/DataTable'
import { Modal } from '../../ui/Modal'
import { Select } from '../../ui/Select'
import { useToast } from '../../../hooks/useToast'
import { Field } from './ProductPageUi'
import {
  sellerProductsApi,
  type InventoryMovement,
  type InventoryMovementType,
  type ProductVariant,
  type SellerProduct,
} from '../../../lib/sellerProductsApi'

const TYPES: Array<{ hint: string; label: string; value: InventoryMovementType }> = [
  { hint: 'Restock, supplier delivery, or a returned order', label: 'Stock in', value: 'STOCK_IN' },
  { hint: 'Sale, damage, loss, or a write-off', label: 'Stock out', value: 'STOCK_OUT' },
]

const LABELS: Record<InventoryMovementType, string> = {
  STOCK_IN: 'Stock in',
  STOCK_OUT: 'Stock out',
}

const variantLabel = (variant: ProductVariant) =>
  variant.name?.trim() || variant.attributes.map((attribute) => attribute.value).join(' / ') || variant.sku

const ALL = 'ALL'

export function ProductInventory({
  onChanged,
  product,
}: {
  onChanged: (variants: ProductVariant[]) => void
  product: SellerProduct
}) {
  const variants = product.variants.filter((item) => item.isActive)
  const [filter, setFilter] = useState(variants.length > 1 ? ALL : (variants[0]?.id ?? ''))
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 1 })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [target, setTarget] = useState('')
  const [search, setSearch] = useState('')
  const toast = useToast()

  const scoped = filter === ALL ? null : (variants.find((item) => item.id === filter) ?? variants[0] ?? null)
  const onHand = scoped ? scoped.stockQuantity : variants.reduce((total, item) => total + item.stockQuantity, 0)

  const loadMovements = useCallback(async () => {
    try {
      const result = await sellerProductsApi.stockHistory(product.id, {
        limit,
        page,
        search: search.trim() || undefined,
        variantId: filter === ALL ? undefined : filter,
      })
      setMovements(result.contents)
      setMeta(result.meta)
    } catch (cause) {
      toast.error(cause)
    }
  }, [filter, limit, page, product.id, search, toast])

  useEffect(() => {
    void loadMovements()
  }, [loadMovements])

  async function record(event: FormEvent<HTMLFormElement>, type: InventoryMovementType) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    try {
      const updated = await sellerProductsApi.recordStock(product.id, target, {
        quantity: Number(data.get('quantity') ?? 0),
        reason: String(data.get('reason') ?? ''),
        type,
      })
      onChanged(updated)
      setTarget('')
      const changed = updated.find((item) => item.id === target)
      toast.success(`${LABELS[type]} recorded. Stock is now ${changed?.stockQuantity ?? 0}.`)
      setPage(1)
      await loadMovements()
    } catch (cause) {
      toast.error(cause)
    }
  }

  if (!variants.length) return <p className="text-xs text-muted">This product has no SKUs yet.</p>

  return (
    <div className="space-y-4">
      <DataTable
        activeFilterCount={scoped ? 1 : 0}
        columns={['Variant', 'Type', 'Change', 'From', 'To', 'Reason', 'By', 'When']}
        emptyMessage="No stock movements recorded yet."
        filters={
          <Field className="w-56" label="Variant">
            <Select
              onChange={(value) => {
                setFilter(value)
                setPage(1)
              }}
              options={[
                ...(variants.length > 1 ? [{ hint: 'Every SKU', label: 'All variants', value: ALL }] : []),
                ...variants.map((item) => ({ hint: item.sku, label: variantLabel(item), value: item.id })),
              ]}
              value={scoped?.id ?? ALL}
              variant="bare"
            />
          </Field>
        }
        onSearchChange={(value) => {
          setPage(1)
          setSearch(value)
        }}
        primaryAction={
          <Button onClick={() => setTarget(scoped?.id ?? variants[0]!.id)}>
            <Plus size={14} /> Record
          </Button>
        }
        pagination={{
          onPageChange: setPage,
          onPageSizeChange: (value) => {
            setLimit(value)
            setPage(1)
          },
          page,
          pageSize: limit,
          totalItems: meta.totalItems,
          totalPages: meta.totalPages,
        }}
        rows={movements.map((movement) => [
          <span className="block">
            <span className="block font-semibold text-ink">{movement.variantName?.trim() || '—'}</span>
            <span className="block font-mono text-[10px] text-muted">{movement.variantSku}</span>
          </span>,
          <span className="inline-flex items-center gap-1.5 font-semibold">
            {movement.movementType === 'STOCK_IN' ? (
              <ArrowUpRight className="text-green-600" size={13} />
            ) : (
              <ArrowDownLeft className="text-red-600" size={13} />
            )}
            {LABELS[movement.movementType]}
          </span>,
          <span className={movement.quantityDifference >= 0 ? 'text-green-700' : 'text-red-700'}>
            {movement.quantityDifference > 0 ? '+' : ''}
            {movement.quantityDifference}
          </span>,
          movement.previousQuantity,
          movement.newQuantity,
          movement.reason,
          movement.actorName ?? '—',
          new Date(movement.createdAt).toLocaleString(),
        ])}
        searchPlaceholder="Search movements"
        subtitle={
          scoped
            ? `${onHand} on hand in ${variantLabel(scoped)}`
            : `${onHand} on hand across ${variants.length} SKUs`
        }
        title="Stock movements"
      />

      {target && (
        <Modal onClose={() => setTarget('')} title="Record a movement">
          <StockForm
            onSubmit={record}
            onTargetChange={setTarget}
            target={target}
            variants={variants}
          />
        </Modal>
      )}
    </div>
  )
}

function StockForm({
  onSubmit,
  onTargetChange,
  target,
  variants,
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>, type: InventoryMovementType) => void
  onTargetChange: (variantId: string) => void
  target: string
  variants: ProductVariant[]
}) {
  const [type, setType] = useState<InventoryMovementType>('STOCK_IN')
  const variant = variants.find((item) => item.id === target)
  return (
    <form className="space-y-4" onSubmit={(event) => onSubmit(event, type)}>
      <div className="space-y-1.5">
        <Field label="Variant">
          <Select
            onChange={onTargetChange}
            options={variants.map((item) => ({ hint: item.sku, label: variantLabel(item), value: item.id }))}
            value={target}
            variant="bare"
          />
        </Field>
        {variant && (
          <p className="text-[11px] leading-5 text-muted">
            On hand <strong className="text-xs font-bold text-ink">{variant.stockQuantity}</strong>
          </p>
        )}
      </div>
      <Field label="Movement type">
        <Select
          onChange={(value) => setType(value as InventoryMovementType)}
          options={TYPES}
          value={type}
          variant="bare"
        />
      </Field>
      <Field label="Units">
        <input min="1" name="quantity" required step="1" type="number" />
      </Field>
      <Field label="Reason">
        <input name="reason" placeholder="e.g. Supplier delivery" required />
      </Field>
      <Button block className="mt-1" type="submit">
        Record movement
      </Button>
    </form>
  )
}
