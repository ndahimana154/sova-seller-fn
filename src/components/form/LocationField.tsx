import { MapPinned } from 'lucide-react'
import { useState } from 'react'
import { LocationPicker } from './LocationPicker'

export interface LocationValue {
  addressLabel: string
  addressLatitude: string | null
  addressLongitude: string | null
  addressPlaceId: string | null
}

interface LocationFieldProps {
  confirmLabel?: string
  error?: string
  hint?: string
  onChange: (value: LocationValue) => void
  searchPlaceholder?: string
  value: LocationValue
}

export function LocationField({
  confirmLabel,
  error,
  hint,
  onChange,
  searchPlaceholder,
  value,
}: LocationFieldProps) {
  const confirmed = Boolean(value.addressLabel.trim() && value.addressLatitude && value.addressLongitude)
  const [editing, setEditing] = useState(false)

  if (confirmed && !editing) {
    return (
      <div>
        <div className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-line bg-soft/50 px-3.5 py-3">
          <span className="inline-flex min-w-0 items-start gap-1.5 text-[11px] font-bold text-ink">
            <MapPinned className="mt-px shrink-0" size={13} />
            <span className="min-w-0 break-words">{value.addressLabel}</span>
          </span>
          <button
            className="shrink-0 text-[11px] font-bold text-ink hover:underline"
            onClick={() => setEditing(true)}
            type="button"
          >
            Change
          </button>
        </div>
        {hint && <p className="mt-1.5 text-[11px] text-muted">{hint}</p>}
      </div>
    )
  }

  return (
    <div>
      <LocationPicker
        confirmLabel={confirmLabel}
        label={value.addressLabel || null}
        latitude={value.addressLatitude}
        longitude={value.addressLongitude}
        searchPlaceholder={searchPlaceholder}
        onConfirm={(location) => {
          onChange({
            addressLabel: location.label,
            addressLatitude: location.latitude,
            addressLongitude: location.longitude,
            addressPlaceId: value.addressPlaceId,
          })
          setEditing(false)
        }}
      />
      {error && <p className="mt-1.5 text-[11px] font-bold text-red-600">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-[11px] text-muted">{hint}</p>}
    </div>
  )
}
