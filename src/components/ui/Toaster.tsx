import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { useEffect } from 'react'
import { dismissToast, type Toast, type ToastTone } from '../../store/uiSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'

const LIFETIME_MS = 4000

const TONES: Record<ToastTone, { accent: string; icon: typeof CheckCircle2 }> = {
  success: { accent: 'text-green-600', icon: CheckCircle2 },
  error: { accent: 'text-red-600', icon: AlertCircle },
  info: { accent: 'text-ink', icon: Info },
}

export function Toaster() {
  const toasts = useAppSelector((state) => state.ui.toasts)
  if (!toasts.length) return null

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-4 z-[300] flex flex-col items-center gap-2 px-4"
      role="status"
    >
      {toasts.map((toast) => <ToastCard key={toast.id} toast={toast} />)}
    </div>
  )
}

function ToastCard({ toast }: { toast: Toast }) {
  const dispatch = useAppDispatch()
  const { accent, icon: Icon } = TONES[toast.tone]

  useEffect(() => {
    const timer = window.setTimeout(() => dispatch(dismissToast(toast.id)), LIFETIME_MS)
    return () => window.clearTimeout(timer)
  }, [dispatch, toast.id])

  return (
    <div className="pointer-events-auto flex w-full max-w-md animate-rise items-start gap-2.5 rounded-xl border border-line bg-white px-3.5 py-3 shadow-[0_18px_40px_rgb(23_26_31/0.16)] motion-reduce:animate-none">
      <Icon className={`mt-px shrink-0 ${accent}`} size={16} />
      <p className="min-w-0 flex-1 text-xs font-semibold leading-5 text-ink">{toast.message}</p>
      <button
        aria-label="Dismiss"
        className="-mr-1 -mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-muted transition hover:bg-soft hover:text-ink"
        onClick={() => dispatch(dismissToast(toast.id))}
        type="button"
      >
        <X size={13} />
      </button>
    </div>
  )
}
