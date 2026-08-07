import { Plus, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { normalizeApiError } from '../../../api/errors'
import { formatPrice } from '../../../lib/formatPrice'
export { mediaUrl } from '../../../lib/mediaUrl'

export interface AttributeRow { id: string; property: string; value: string }

export function AttributeEditor({ hideHeading = false, onChange, rows }: {
  hideHeading?: boolean
  onChange: (rows: AttributeRow[]) => void
  rows: AttributeRow[]
}) {
  const update = (id: string, field: 'property' | 'value', value: string) =>
    onChange(rows.map((row) => row.id === id ? { ...row, [field]: value } : row))
  return (
    <fieldset>
      <div className={`flex items-center gap-3 ${hideHeading ? 'justify-end' : 'justify-between'}`}>
        {!hideHeading && <div><legend className="seller-legend">Attributes</legend><p className="seller-legend-hint">Add specifications as property and value pairs.</p></div>}
        <button className="seller-outline-button" onClick={() => onChange([...rows, { id: crypto.randomUUID(), property: '', value: '' }])} type="button"><Plus size={13} /> Add attribute</button>
      </div>
      <div className="mt-3 space-y-2">
        {rows.map((row) => <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_32px] gap-2" key={row.id}>
          <input className="seller-plain-input" onChange={(event) => update(row.id, 'property', event.target.value)} placeholder="Property" value={row.property} />
          <input className="seller-plain-input" onChange={(event) => update(row.id, 'value', event.target.value)} placeholder="Value" value={row.value} />
          <button aria-label="Remove attribute" className="seller-icon-button text-red-600" onClick={() => onChange(rows.filter((item) => item.id !== row.id))} type="button"><X size={13} /></button>
        </div>)}
        {!rows.length && <p className="rounded-xl border border-dashed border-line bg-soft/50 p-4 text-center text-[10px] text-muted">No attributes added.</p>}
      </div>
    </fieldset>
  )
}

export function attributesObject(rows: AttributeRow[]): Record<string, string> {
  const attributes: Record<string, string> = {}
  for (const row of rows) {
    const property = row.property.trim().toLowerCase()
    const value = row.value.trim()
    if (!property && !value) continue
    if (!property || !value) throw new Error('Every attribute needs both a property and a value.')
    if (attributes[property] !== undefined) throw new Error(`Attribute “${property}” was added more than once.`)
    attributes[property] = value
  }
  return attributes
}

export const attributeRows = (attributes: Record<string, string>): AttributeRow[] =>
  Object.entries(attributes).map(([property, value]) => ({ id: crypto.randomUUID(), property, value }))
export const attributesText = (attributes: Record<string, string>) =>
  Object.entries(attributes).map(([key, value]) => `${key}: ${value}`).join(', ')

export function Field({ children, className = '', label }: { children: ReactNode; className?: string; label: string }) {
  return <label className={className}><span className="seller-field-label">{label}</span><span className="seller-form-control">{children}</span></label>
}


export function PercentInput({ defaultValue = 0, name, onValueChange }: {
  defaultValue?: number
  name: string
  onValueChange?: (value: number) => void
}) {
  return (
    <input
      defaultValue={defaultValue}
      inputMode="numeric"
      max="100"
      min="0"
      name={name}
      onChange={(event) => {
        event.currentTarget.value = clampPercent(event.currentTarget.value)
        onValueChange?.(Number(event.currentTarget.value || 0))
      }}
      step="1"
      type="number"
    />
  )
}

function clampPercent(raw: string) {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return String(Math.min(100, Number(digits)))
}

export const finalPriceOf = (price: number, discountPercent: number) => {
  if (!Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent > 100) return Math.max(0, price)
  return Math.max(0, Math.round(price - (price * discountPercent) / 100))
}

export function PricingFields({ defaultDiscount = 0, defaultPrice }: { defaultDiscount?: number; defaultPrice?: number }) {
  const [price, setPrice] = useState(defaultPrice ?? 0)
  const [discount, setDiscount] = useState(defaultDiscount)
  const finalPrice = finalPriceOf(price, discount)
  const savings = price - finalPrice
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Price (RWF)">
          <input
            defaultValue={defaultPrice}
            min="0"
            name="price"
            onChange={(event) => setPrice(Number(event.currentTarget.value || 0))}
            required
            step="1"
            type="number"
          />
        </Field>
        <Field label="Discount (%)">
          <PercentInput defaultValue={defaultDiscount} name="discount" onValueChange={setDiscount} />
        </Field>
      </div>
      {savings > 0 && (
        <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-xl border border-primary/20 bg-primary-light/60 px-3.5 py-2.5 text-xs text-muted">
          Buyers pay <strong className="text-sm font-black text-ink">{formatPrice(finalPrice)}</strong>
          <span>— {discount}% off, saving {formatPrice(savings)}</span>
        </p>
      )}
    </>
  )
}

export function FormSection({ actions, children, subtitle, title }: {
  actions?: ReactNode
  children: ReactNode
  subtitle?: string
  title: string
}) {
  return (
    <section className="seller-card p-5">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-ink">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[11px] text-muted">{subtitle}</p>}
        </div>
        {actions}
      </header>
      {children}
    </section>
  )
}

export function Feedback({ error, notice = '' }: { error?: string; notice?: string }) {
  if (!error && !notice) return null
  return <p className={`rounded-xl border px-3 py-2 text-xs font-semibold ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>{error || notice}</p>
}

export function StatusBadge({ value }: { value?: string | null }) {
  const normalized = value?.trim() || 'UNKNOWN'
  const success = normalized === 'ACTIVE' || normalized === 'IN_STOCK'
  return <span className={`inline-flex rounded-full border px-2 py-1 text-[9px] font-bold ${success ? 'border-green-200 bg-green-50 text-green-700' : normalized === 'OUT_OF_STOCK' || normalized === 'REJECTED' ? 'border-red-200 bg-red-50 text-red-700' : 'border-line bg-soft text-muted'}`}>{normalized.replaceAll('_', ' ')}</span>
}

export function PageTitle({ actions, subtitle, title }: { actions?: ReactNode; subtitle: string; title: string }) {
  return <div className="flex flex-wrap items-center gap-3"><div className="min-w-0 flex-1"><h1 className="truncate text-lg font-bold">{title}</h1><p className="mt-1 text-xs text-muted">{subtitle}</p></div>{actions && <div className="flex items-center gap-2">{actions}</div>}</div>
}

export const errorMessage = (error: unknown) => normalizeApiError(error).message
