import type { ReactNode } from 'react'

interface ToggleProps {
  checked: boolean
  description?: ReactNode
  disabled?: boolean
  label: ReactNode
  onChange: (checked: boolean) => void
}

export function Toggle({ checked, description, disabled = false, label, onChange }: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-line p-4">
      <span className="min-w-0">
        <span className="flex items-center gap-2 text-xs font-bold text-ink">{label}</span>
        {description && <span className="mt-1 block text-[11px] leading-5 text-muted">{description}</span>}
      </span>
      <button
        aria-checked={checked}
        aria-label={typeof label === 'string' ? label : undefined}
        className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${checked ? 'bg-ink' : 'bg-line'}`}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        role="switch"
        type="button"
      >
        <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left] ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  )
}
