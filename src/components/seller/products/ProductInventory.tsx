import { ArrowDownLeft, ArrowUpRight, Plus } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { DataTable } from '../../ui/DataTable'
import { Modal } from '../../ui/Modal'
import { Select } from '../../ui/Select'
import { Feedback, errorMessage } from './ProductPageUi'
import {
  sellerProductsApi,
  type InventoryMovement,
  type InventoryMovementType,
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

export function ProductInventory({ onRecorded, product }: {
  onRecorded: (product: SellerProduct) => void
  product: SellerProduct
}) {
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 1 })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadMovements = useCallback(async () => {
    try {
      const result = await sellerProductsApi.inventoryMovements(product.id, { limit, page })
      setMovements(result.contents)
      setMeta(result.meta)
    } catch (cause) {
      setError(errorMessage(cause))
    }
  }, [limit, page, product.id])

  useEffect(() => { void loadMovements() }, [loadMovements])

  async function recorded(updated: SellerProduct, type: InventoryMovementType) {
    onRecorded(updated)
    setOpen(false)
    setNotice(`${LABELS[type]} recorded. Stock is now ${updated.quantity}.`)
    setPage(1)
    await loadMovements()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">
          Current stock: <strong className="text-sm text-ink">{product.quantity}</strong> unit{product.quantity === 1 ? '' : 's'}
        </p>
        <button className="seller-primary-button" onClick={() => { setNotice(''); setError(''); setOpen(true) }} type="button">
          <Plus size={14} /> Record movement
        </button>
      </div>

      <Feedback error={error} notice={notice} />

      <DataTable
        columns={['Date', 'Movement', 'Stock before', 'Change', 'Stock after', 'Narration', 'Recorded by']}
        emptyMessage="No stock movements recorded yet."
        pagination={{
          onPageChange: setPage,
          onPageSizeChange: (size) => { setLimit(size); setPage(1) },
          page,
          pageSize: limit,
          totalItems: meta.totalItems,
          totalPages: meta.totalPages,
        }}
        rows={movements.map((movement) => [
          <span className="whitespace-nowrap text-ink">{formatMoment(movement.createdAt)}</span>,
          <MovementBadge type={movement.movementType} />,
          <span className="text-ink">{movement.previousQuantity}</span>,
          <Change value={movement.quantityDifference} />,
          <span className="text-ink">{movement.newQuantity}</span>,
          <span className="block max-w-[22rem] truncate" title={movement.reason}>{movement.reason}</span>,
          <span className="text-ink">{movement.actorName ?? '—'}</span>,
        ])}
      />

      {open && (
        <RecordMovementModal
          onClose={() => setOpen(false)}
          onRecorded={recorded}
          product={product}
        />
      )}
    </div>
  )
}

function RecordMovementModal({ onClose, onRecorded, product }: {
  onClose: () => void
  onRecorded: (product: SellerProduct, type: InventoryMovementType) => Promise<void>
  product: SellerProduct
}) {
  const [type, setType] = useState<InventoryMovementType>('STOCK_IN')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const amount = Number(quantity || 0)
  const projected = type === 'STOCK_IN' ? product.quantity + amount : product.quantity - amount
  const tooMany = type === 'STOCK_OUT' && amount > product.quantity

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (amount < 1) { setError('Enter a quantity of at least 1.'); return }
    if (tooMany) { setError(`Only ${product.quantity} unit(s) in stock.`); return }
    setSaving(true)
    try {
      const updated = await sellerProductsApi.recordInventoryMovement(product.id, { quantity: amount, reason, type })
      await onRecorded(updated, type)
    } catch (cause) {
      setError(errorMessage(cause))
      setSaving(false)
    }
  }

  return (
    <Modal
      footer={<>
        <button className="seller-outline-button" disabled={saving} onClick={onClose} type="button">Cancel</button>
        <button className="seller-primary-button" disabled={saving || tooMany} form="record-movement-form" type="submit">
          {saving ? 'Recording…' : 'Record movement'}
        </button>
      </>}
      onClose={onClose}
      subtitle={`${product.name} · ${product.quantity} unit(s) on hand`}
      title="Record stock movement"
    >
      <form className="space-y-4" id="record-movement-form" onSubmit={submit}>
        <div>
          <span className="seller-field-label" id="movement-type-label">Movement</span>
          <Select
            aria-labelledby="movement-type-label"
            onChange={(value) => { setType(value as InventoryMovementType); setError('') }}
            options={TYPES.map((item) => ({ hint: item.hint, label: item.label, value: item.value }))}
            searchThreshold={99}
            value={type}
          />
        </div>

        <label className="block">
          <span className="seller-field-label">Quantity</span>
          <input
            autoFocus
            className="seller-plain-input"
            inputMode="numeric"
            onChange={(event) => { setQuantity(event.target.value.replace(/\D/g, '')); setError('') }}
            placeholder="0"
            required
            value={quantity}
          />
        </label>

        <label className="block">
          <span className="seller-field-label">Reason</span>
          <input
            className="seller-plain-input"
            maxLength={160}
            onChange={(event) => setReason(event.target.value)}
            placeholder={type === 'STOCK_IN' ? 'e.g. Delivery from supplier' : 'e.g. Damaged in transit'}
            required
            value={reason}
          />
        </label>

        <p className="rounded-xl border border-line bg-soft/50 px-3.5 py-2.5 text-[11px] text-muted">
          {quantity
            ? tooMany
              ? <span className="font-bold text-red-600">Only {product.quantity} unit(s) available to remove.</span>
              : <>Stock will go from <strong className="text-ink">{product.quantity}</strong> to <strong className="text-ink">{Math.max(0, projected)}</strong> unit(s).</>
            : 'Enter a quantity to preview the new stock level.'}
        </p>

        <Feedback error={error} />
      </form>
    </Modal>
  )
}

function MovementBadge({ type }: { type: InventoryMovementType }) {
  const isIn = type === 'STOCK_IN'
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-1 text-[9px] font-bold ${isIn ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-600'}`}>
      {isIn ? <ArrowUpRight size={11} /> : <ArrowDownLeft size={11} />} {LABELS[type]}
    </span>
  )
}

function Change({ value }: { value: number }) {
  const isIn = value > 0
  return <strong className={isIn ? 'text-green-700' : 'text-red-600'}>{isIn ? `+${value}` : value}</strong>
}

const formatMoment = (value: string) => {
  const date = new Date(value)
  return `${date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}, ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`
}
