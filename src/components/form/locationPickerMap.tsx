import { useEffect } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'

export function Recentre({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap()
  useEffect(() => { map.setView([latitude, longitude], map.getZoom()) }, [latitude, longitude, map])
  return null
}

export function ClickToPlace({ onPlace }: { onPlace: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (event) => onPlace(event.latlng.lat, event.latlng.lng) })
  return null
}

/**
 * Leaflet measures its container once. Entering or leaving full screen changes
 * that size, so the map has to be told or it renders grey gaps and misplaced pins.
 */
export function ResizeOnFullscreen({ fullscreen }: { fullscreen: boolean }) {
  const map = useMap()

  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 150)
    if (fullscreen) map.scrollWheelZoom.enable()
    else map.scrollWheelZoom.disable()
    return () => window.clearTimeout(timer)
  }, [fullscreen, map])

  useEffect(() => {
    const onResize = () => map.invalidateSize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [map])

  return null
}
