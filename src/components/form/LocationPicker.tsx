import 'leaflet/dist/leaflet.css'
import { Check, Crosshair, Loader2, MapPin, Maximize2, Minimize2, Search, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import {
  KIGALI_CENTRE,
  coordinateLabel,
  reverseGeocode,
  suggestPlaces,
  type PlaceSuggestion,
} from '../../lib/places'
import { ClickToPlace, Recentre, ResizeOnFullscreen } from './locationPickerMap'
import { pinIcon } from './locationPin'
import { useFullscreen } from '../../hooks/useFullscreen'

export interface PickedLocation {
  label: string
  latitude: string
  longitude: string
}

interface LocationPickerProps {
  confirmLabel?: string
  label: string | null
  latitude: string | null
  longitude: string | null
  onConfirm: (location: PickedLocation) => void
  searchPlaceholder?: string
}

export function LocationPicker({
  confirmLabel = 'Confirm this location',
  label,
  latitude,
  longitude,
  onConfirm,
  searchPlaceholder = 'Search a place, building or road',
}: LocationPickerProps) {
  const start = useMemo(
    () => ({
      lat: latitude ? Number(latitude) : KIGALI_CENTRE.latitude,
      lng: longitude ? Number(longitude) : KIGALI_CENTRE.longitude,
    }),
    [latitude, longitude],
  )

  const [pin, setPin] = useState(start)
  const [place, setPlace] = useState(label ?? '')
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const shell = useRef<HTMLDivElement>(null)
  const { fullscreen, supported, toggle } = useFullscreen(shell)

  useEffect(() => { setPin(start) }, [start])

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!box.current?.contains(event.target as Node)) setSuggestions([])
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  useEffect(() => {
    if (query.trim().length < 3) { setSuggestions([]); return }
    const controller = new AbortController()
    setSearching(true)
    const timer = window.setTimeout(async () => {
      const results = await suggestPlaces(query, controller.signal)
      if (!controller.signal.aborted) { setSuggestions(results); setSearching(false) }
    }, 300)
    return () => { controller.abort(); window.clearTimeout(timer); setSearching(false) }
  }, [query])

  const describe = useCallback(async (lat: number, lng: number) => {
    const result = await reverseGeocode(lat, lng)
    setPlace(result?.description || coordinateLabel(lat, lng))
  }, [])

  useEffect(() => {
    if (label?.trim()) return
    void describe(start.lat, start.lng)
  }, [describe, label, start.lat, start.lng])

  function drop(lat: number, lng: number) {
    setPin({ lat, lng })
    void describe(lat, lng)
  }

  function choose(suggestion: PlaceSuggestion) {
    setSuggestions([])
    setQuery('')
    setPlace(suggestion.description)
    if (suggestion.latitude && suggestion.longitude) {
      setPin({ lat: Number(suggestion.latitude), lng: Number(suggestion.longitude) })
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => { drop(position.coords.latitude, position.coords.longitude); setLocating(false) },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  function confirm() {
    if (fullscreen) void toggle()
    onConfirm({
      label: place.trim() || coordinateLabel(pin.lat, pin.lng),
      latitude: String(pin.lat),
      longitude: String(pin.lng),
    })
  }

  return (
    <div
      className={`isolate flex flex-col rounded-xl border border-line bg-white p-3 ${fullscreen ? 'h-screen w-screen rounded-none' : ''}`}
      ref={shell}
    >
      <div className="relative z-[1200]" ref={box}>
        <span className="flex min-h-10 items-center gap-2 rounded-xl border border-line bg-white px-3 transition focus-within:border-ink focus-within:ring-4 focus-within:ring-ink/10">
          <Search className="shrink-0 text-muted" size={15} />
          <input
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent py-2 text-xs text-ink outline-none placeholder:text-faint"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            value={query}
          />
          {searching && <Loader2 className="shrink-0 animate-spin text-muted" size={14} />}
          {!searching && query && (
            <button
              aria-label="Clear search"
              className="grid size-5 shrink-0 place-items-center rounded-full text-muted transition hover:bg-soft hover:text-ink"
              onClick={() => { setQuery(''); setSuggestions([]) }}
              type="button"
            >
              <X size={12} />
            </button>
          )}
        </span>

        {suggestions.length > 0 && (
          <ul className="absolute z-[1200] mt-1.5 max-h-56 w-full overflow-y-auto rounded-xl border border-line bg-white shadow-lg">
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

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] leading-4 text-muted">Tap the map or drag the pin to the exact spot.</p>
        <div className="flex items-center gap-1.5">
          <button
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[10px] font-bold text-ink transition hover:border-ink/30 hover:bg-soft disabled:pointer-events-none disabled:opacity-60"
            disabled={locating}
            onClick={useMyLocation}
            type="button"
          >
            {locating ? (
              <Loader2 className="animate-spin" size={12} />
            ) : (
              <Crosshair size={12} />
            )}
            {locating ? 'Locating…' : 'Use my location'}
          </button>
          {supported && (
            <button
              aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}
              className="grid size-8 place-items-center rounded-lg border border-line bg-white text-muted transition hover:border-ink/30 hover:bg-soft hover:text-ink"
              onClick={() => void toggle()}
              title={fullscreen ? 'Exit full screen' : 'Full screen'}
              type="button"
            >
              {fullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          )}
        </div>
      </div>

      <div className={`mt-2 overflow-hidden rounded-lg border border-line ${fullscreen ? 'min-h-0 flex-1' : 'h-56'}`}>
        <MapContainer attributionControl={false} center={[pin.lat, pin.lng]} className="size-full" scrollWheelZoom={false} zoom={17}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Recentre latitude={pin.lat} longitude={pin.lng} />
          <ClickToPlace onPlace={drop} />
          <ResizeOnFullscreen fullscreen={fullscreen} />
          <Marker
            draggable
            eventHandlers={{ dragend: (event) => { const { lat, lng } = event.target.getLatLng(); drop(lat, lng) } }}
            icon={pinIcon}
            position={[pin.lat, pin.lng]}
          />
        </MapContainer>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-soft/50 px-3.5 py-3">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <MapPin className="mt-0.5 shrink-0 text-ink" size={14} />
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-faint">
              Selected location
            </p>
            <p className="mt-0.5 break-words text-xs font-bold leading-4 text-ink">
              {place || 'Move the pin to choose a spot'}
            </p>
          </div>
        </div>

        <button
          className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl bg-ink px-4 text-xs font-bold text-white transition hover:bg-ink/90 disabled:pointer-events-none disabled:opacity-50"
          disabled={!place}
          onClick={confirm}
          type="button"
        >
          <Check size={14} /> {confirmLabel}
        </button>
      </div>
    </div>
  )
}
