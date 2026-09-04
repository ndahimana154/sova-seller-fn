import { useCallback, useEffect, useState, type RefObject } from 'react'

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void
}

type FullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void
  webkitFullscreenElement?: Element | null
}

function current(): Element | null {
  const owner = document as FullscreenDocument
  return owner.fullscreenElement ?? owner.webkitFullscreenElement ?? null
}

/** Full screen with the Safari-prefixed fallback, kept in sync with the browser. */
export function useFullscreen(target: RefObject<HTMLElement | null>) {
  const [fullscreen, setFullscreen] = useState(false)

  const supported =
    typeof document !== 'undefined' &&
    (document.fullscreenEnabled || Boolean((document as FullscreenDocument).webkitExitFullscreen))

  useEffect(() => {
    const sync = () => setFullscreen(Boolean(current()) && current() === target.current)
    document.addEventListener('fullscreenchange', sync)
    document.addEventListener('webkitfullscreenchange', sync)
    return () => {
      document.removeEventListener('fullscreenchange', sync)
      document.removeEventListener('webkitfullscreenchange', sync)
    }
  }, [target])

  const toggle = useCallback(async () => {
    const owner = document as FullscreenDocument
    const element = target.current as FullscreenElement | null
    try {
      if (current()) {
        await (owner.exitFullscreen?.() ?? owner.webkitExitFullscreen?.())
        return
      }
      if (!element) return
      await (element.requestFullscreen?.() ?? element.webkitRequestFullscreen?.())
    } catch {
      setFullscreen(Boolean(current()))
    }
  }, [target])

  return { fullscreen, supported, toggle }
}
