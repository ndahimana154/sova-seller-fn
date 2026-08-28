import { RotateCcw } from 'lucide-react'
import { Field } from '../products/ProductPageUi'
import { Select } from '../../ui/Select'
import {
  BUCKET_OPTIONS,
  EMPTY_FILTERS,
  activeFilterCount,
  type OrderBucket,
  type OrderFilterState,
} from './orderBuckets'

interface OrderFiltersProps {
  onChange: (filters: OrderFilterState) => void
  value: OrderFilterState
}

export function OrderFilters({ onChange, value }: OrderFiltersProps) {
  const patch = (next: Partial<OrderFilterState>) => onChange({ ...value, ...next })

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Field className="w-52" label="Stage">
        <Select
          onChange={(next) => patch({ bucket: next as OrderBucket })}
          options={BUCKET_OPTIONS}
          placeholder="All orders"
          value={value.bucket}
          variant="bare"
        />
      </Field>

      <Field className="w-44" label="Placed from">
        <input
          max={value.to || undefined}
          onChange={(event) => patch({ from: event.target.value })}
          type="date"
          value={value.from}
        />
      </Field>

      <Field className="w-44" label="Placed to">
        <input
          min={value.from || undefined}
          onChange={(event) => patch({ to: event.target.value })}
          type="date"
          value={value.to}
        />
      </Field>

      <button
        className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line px-3 text-[11px] font-semibold text-muted transition hover:border-ink/25 hover:text-ink disabled:opacity-40"
        disabled={activeFilterCount(value) === 0}
        onClick={() => onChange(EMPTY_FILTERS)}
        type="button"
      >
        <RotateCcw size={13} /> Reset
      </button>
    </div>
  )
}
