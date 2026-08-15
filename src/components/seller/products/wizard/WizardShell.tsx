import { AlertTriangle, Check, Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import type { ProductProgress, ProductStep } from '../../../../lib/sellerProductsApi'
import { ui } from '../../../ui/styles'

const FALLBACK_LABELS: Record<ProductStep, string> = {
  BASICS: 'Basics',
  ATTRIBUTES: 'Options and pricing',
  VARIANTS: 'Variants',
  MEDIA: 'Photos and videos',
  PUBLISH: 'Publish',
}

export function WizardSteps({
  onSelect,
  progress,
  step,
  steps,
}: {
  onSelect: (step: ProductStep) => void
  progress: ProductProgress | null
  step: ProductStep
  steps: ProductStep[]
}) {
  return (
    <nav aria-label="Product steps" className={`${ui.card} p-2`}>
      <ol className="flex flex-wrap gap-1">
        {steps.map((key, index) => {
          const state = progress?.steps.find((item) => item.key === key)
          const active = key === step
          const locked = !progress && index > 0
          return (
            <li className="flex-1" key={key}>
              <button
                aria-current={active ? 'step' : undefined}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-semibold transition ${active
                    ? 'bg-ink/10 font-bold text-ink'
                    : locked
                      ? 'cursor-not-allowed text-muted/60'
                      : 'text-muted hover:bg-soft'
                  }`}
                disabled={locked}
                onClick={() => onSelect(key)}
                type="button"
              >
                <span
                  className={`grid size-5 shrink-0 place-items-center rounded-full border text-[9px] ${active
                      ? 'border-ink/30 bg-white/70 text-ink'
                      : state?.complete
                        ? 'border-green-300 bg-green-50 text-green-700'
                        : 'border-line bg-white'
                    }`}
                >
                  {locked ? <Lock size={10} /> : state?.complete ? <Check size={11} /> : index + 1}
                </span>
                <span className="truncate">{state?.label ?? FALLBACK_LABELS[key]}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function StepIssues({ issues }: { issues: string[] }) {
  if (!issues.length) return null
  return (
    <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] text-amber-900">
      <AlertTriangle className="mt-px shrink-0" size={13} />
      <ul className="space-y-0.5">
        {issues.map((issue) => (
          <li key={issue}>{issue}</li>
        ))}
      </ul>
    </div>
  )
}

export function StepFooter({
  back,
  children,
  saving,
}: {
  back?: ReactNode
  children: ReactNode
  saving?: boolean
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
      <div>{back}</div>
      <div className="flex items-center gap-2">
        {saving && <span className="text-[11px] text-muted">Saving…</span>}
        {children}
      </div>
    </div>
  )
}

export function ProgressSummary({ progress }: { progress: ProductProgress | null }) {
  if (!progress) return null
  const percent = Math.round((progress.completedSteps / progress.totalSteps) * 100)
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-soft">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </div>
      <span className="text-[11px] text-muted">
        {progress.completedSteps} of {progress.totalSteps} done
      </span>
    </div>
  )
}
