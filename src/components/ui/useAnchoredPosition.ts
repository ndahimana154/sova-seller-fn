import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'

const GAP = 4
const EDGE = 8

export interface AnchoredPosition { left: number; top: number; width: number | null }

interface Options {
  align?: 'end' | 'start'
  anchorRef: RefObject<HTMLElement | null>
  floatingRef: RefObject<HTMLElement | null>
  matchWidth?: boolean
  onDismiss: () => void
  open: boolean
}

/**
 * Positions a portalled popup against its trigger with `position: fixed`, so no
 * ancestor can clip it. Returns `null` until measured — keep the popup hidden
 * until then to avoid a flash at the wrong coordinates.
 */
export function useAnchoredPosition({ align = 'start', anchorRef, floatingRef, matchWidth = false, onDismiss, open }: Options) {
  const [position, setPosition] = useState<AnchoredPosition | null>(null)
  const dismissRef = useRef(onDismiss)
  dismissRef.current = onDismiss

  const place = useCallback(() => {
    const anchor = anchorRef.current
    const floating = floatingRef.current
    if (!anchor || !floating) return
    const rect = anchor.getBoundingClientRect()
    // Width must be applied before measuring: a narrower box wraps and grows taller.
    if (matchWidth) floating.style.width = `${rect.width}px`
    const { height, width } = floating.getBoundingClientRect()

    const roomBelow = window.innerHeight - rect.bottom - GAP - EDGE
    const roomAbove = rect.top - GAP - EDGE
    const dropUp = height > roomBelow && roomAbove > roomBelow
    const top = dropUp
      ? Math.max(EDGE, rect.top - GAP - height)
      : Math.max(EDGE, Math.min(rect.bottom + GAP, window.innerHeight - EDGE - height))
    const preferredLeft = align === 'end' ? rect.right - width : rect.left
    const left = Math.max(EDGE, Math.min(preferredLeft, window.innerWidth - EDGE - width))
    setPosition({ left, top, width: matchWidth ? rect.width : null })
  }, [align, anchorRef, floatingRef, matchWidth])

  useLayoutEffect(() => {
    if (open) place()
    else setPosition(null)
  }, [open, place])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (floatingRef.current?.contains(target) || anchorRef.current?.contains(target)) return
      dismissRef.current()
    }
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') dismissRef.current() }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [anchorRef, floatingRef, open, place])

  return position
}
