import { Field } from '../ProductPageUi'

export function PriceField({ defaultValue = 0, label = 'Price', name, onChange, value }: {
  defaultValue?: number
  label?: string
  name: string
  onChange?: (value: number) => void
  value?: number
}) {
  return (
    <Field label={`${label} (RWF)`}>
      <span className="mr-2 shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-muted">RWF</span>
      <input
        defaultValue={value === undefined ? defaultValue : undefined}
        inputMode="numeric"
        min="0"
        name={name}
        onChange={onChange ? (event) => onChange(Number(event.target.value)) : undefined}
        step="1"
        type="number"
        value={value}
      />
    </Field>
  )
}
