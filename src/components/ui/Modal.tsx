import { X } from 'lucide-react'
import { useEffect, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ui } from './styles'

interface ModalProps {
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
  size?: 'lg' | 'md' | 'sm'
  subtitle?: string
  title: string
}

const WIDTHS = { lg: 'max-w-3xl', md: 'max-w-lg', sm: 'max-w-sm' }

export function Modal({ children, footer, onClose, size = 'md', subtitle, title }: ModalProps) {
  const titleId = useId()

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[110] grid animate-fade-in place-items-center overflow-y-auto bg-ink/45 p-4 backdrop-blur-sm motion-reduce:animate-none" onMouseDown={onClose}>
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className={`w-full animate-rise motion-reduce:animate-none ${WIDTHS[size]} rounded-2xl border border-line bg-white shadow-[0_30px_80px_rgb(23_26_31/0.22)]`}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-sm font-black text-ink" id={titleId}>{title}</h2>
            {subtitle && <p className="mt-0.5 text-[11px] text-muted">{subtitle}</p>}
          </div>
          <button aria-label="Close" className={ui.iconButton} onClick={onClose} type="button"><X size={15} /></button>
        </header>
        <div className="px-5 py-4">{children}</div>
        {footer && <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-4">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}
