import { AlertTriangle } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface ConfirmRequest {
  body?: ReactNode
  confirmLabel?: string
  danger?: boolean
  title: string
}

interface ConfirmDialogProps extends ConfirmRequest {
  busy?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  body,
  busy = false,
  confirmLabel = 'Confirm',
  danger = false,
  onCancel,
  onConfirm,
  title,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    confirmRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && !busy) onCancel() }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [busy, onCancel])

  return createPortal(
    <div className="overlay-backdrop z-[120] grid place-items-center p-4" onMouseDown={() => !busy && onCancel()}>
      <div
        aria-labelledby="confirm-dialog-title"
        aria-modal="true"
        className="overlay-panel w-full max-w-sm rounded-2xl border border-line bg-white p-5 shadow-[0_30px_80px_rgb(23_26_31/0.22)]"
        onMouseDown={(event) => event.stopPropagation()}
        role="alertdialog"
      >
        <div className="flex gap-3">
          <span className={`grid size-10 shrink-0 place-items-center rounded-full ${danger ? 'bg-red-50 text-red-600' : 'bg-primary-light text-primary-dark'}`}>
            <AlertTriangle size={19} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-black text-ink" id="confirm-dialog-title">{title}</h2>
            {body && <div className="mt-1.5 text-xs leading-5 text-muted">{body}</div>}
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="seller-outline-button" disabled={busy} onClick={onCancel} type="button">Cancel</button>
          <button
            className={danger ? 'seller-danger-button min-h-9 rounded-full px-4' : 'seller-primary-button'}
            disabled={busy}
            onClick={onConfirm}
            ref={confirmRef}
            type="button"
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/**
 * Promise-based replacement for `window.confirm`. Call `await confirm({…})` and
 * render `{confirm.dialog}` in the tree.
 */
export function useConfirm() {
  const [request, setRequest] = useState<ConfirmRequest | null>(null)
  const resolver = useRef<((value: boolean) => void) | null>(null)

  const settle = useCallback((value: boolean) => {
    resolver.current?.(value)
    resolver.current = null
    setRequest(null)
  }, [])

  const confirm = useCallback((next: ConfirmRequest) => {
    // A second prompt while one is open cancels the first rather than orphaning it.
    resolver.current?.(false)
    setRequest(next)
    return new Promise<boolean>((resolve) => { resolver.current = resolve })
  }, [])

  const dialog = request
    ? <ConfirmDialog {...request} onCancel={() => settle(false)} onConfirm={() => settle(true)} />
    : null

  return Object.assign(confirm, { dialog })
}
