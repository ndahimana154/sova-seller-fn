import { Hash, Loader2, MapPin } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { resolvePlace, suggestPlaces, type PlaceSuggestion } from '../../lib/places'
import { ui } from '../ui/styles'

export interface AddressValue {
  addressHouseNumber: string
  addressLabel: string
  addressLatitude: string | null
  addressLongitude: string | null
  addressPlaceId: string | null
}

interface AddressFieldProps {
  name?: string
  onChange: (value: AddressValue) => void
  placeholder?: string
  required?: boolean
  value: AddressValue
}

export function AddressField({
  name = 'addressLabel',
  onChange,
  placeholder = '97 KK 19 Ave, Kigali',
  required,
  value,
}: AddressFieldProps) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const typed = useRef(false)

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  useEffect(() => {
    if (!typed.current || value.addressLabel.trim().length < 3) {
      setSuggestions([])
      return
    }
    const controller = new AbortController()
    setBusy(true)
    const timer = window.setTimeout(async () => {
      const results = await suggestPlaces(value.addressLabel, controller.signal)
      if (controller.signal.aborted) return
      setSuggestions(results)
      setBusy(false)
    }, 300)
    return () => {
      controller.abort()
      window.clearTimeout(timer)
      setBusy(false)
    }
  }, [value.addressLabel])

  function type(label: string) {
    typed.current = true
    setOpen(true)
    onChange({
      ...value,
      addressLabel: label,
      addressLatitude: null,
      addressLongitude: null,
      addressPlaceId: null,
    })
  }

  function choose(suggestion: PlaceSuggestion) {
    typed.current = false
    setOpen(false)
    setSuggestions([])
    const place = resolvePlace(suggestion)
    onChange({
      ...value,
      addressLabel: place.label,
      addressLatitude: place.latitude,
      addressLongitude: place.longitude,
      addressPlaceId: place.placeId,
    })
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)]">
      <label className="block">
        <span className="text-xs font-bold text-ink">House no.</span>
        <span className={ui.input}>
          <Hash className="shrink-0 text-muted" size={15} />
          <input
            autoComplete="off"
            name="addressHouseNumber"
            onChange={(event) => onChange({ ...value, addressHouseNumber: event.target.value })}
            placeholder="97"
            value={value.addressHouseNumber}
          />
        </span>
      </label>

    <div className="relative" ref={container}>
      <span className="text-xs font-bold text-ink">Street or area</span>
      <span className={ui.input}>
        <MapPin className="shrink-0 text-muted" size={15} />
        <input
          autoComplete="off"
          name={name}
          onChange={(event) => type(event.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          required={required}
          value={value.addressLabel}
        />
        {busy && <Loader2 className="shrink-0 animate-spin text-muted" size={14} />}
      </span>

      <input name="addressPlaceId" type="hidden" value={value.addressPlaceId ?? ''} />
      <input name="addressLatitude" type="hidden" value={value.addressLatitude ?? ''} />
      <input name="addressLongitude" type="hidden" value={value.addressLongitude ?? ''} />

      {open && suggestions.length > 0 && (
        <ul className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-line bg-white shadow-lg">
          {suggestions.map((suggestion) => (
            <li key={suggestion.placeId}>
              <button
                className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-[11px] leading-4 text-ink transition hover:bg-soft"
                onClick={() => choose(suggestion)}
                type="button"
              >
                <MapPin className="mt-0.5 shrink-0 text-muted" size={13} />
                {suggestion.description}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
    </div>
  )
}
