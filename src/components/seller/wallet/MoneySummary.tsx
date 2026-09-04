import { formatMoney } from '../../../lib/money'
import { ui } from '../../ui/styles'

type Tone = 'danger' | 'ink' | 'muted' | 'success'

interface Figure {
  label: string
  tone?: Tone
  value: number
}

const TONES: Record<Tone, string> = {
  danger: 'text-red-600',
  ink: 'text-ink',
  muted: 'text-muted',
  success: 'text-green-700',
}

export function MoneySummary({
  caption,
  primary,
  secondary = [],
}: {
  caption?: string
  primary: Figure
  secondary?: Figure[]
}) {
  return (
    <div className={`${ui.card} flex flex-wrap items-end justify-between gap-x-8 gap-y-4 px-5 py-4`}>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-faint">
          {primary.label}
        </p>
        <p className={`mt-1 text-2xl font-black tabular-nums ${TONES[primary.tone ?? 'ink']}`}>
          {formatMoney(primary.value)}
        </p>
        {caption && <p className="mt-0.5 text-[11px] text-muted">{caption}</p>}
      </div>

      {secondary.length > 0 && (
        <dl className="flex flex-wrap items-end gap-x-6 gap-y-3">
          {secondary.map((figure) => (
            <div key={figure.label}>
              <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-faint">
                {figure.label}
              </dt>
              <dd className={`mt-0.5 text-sm font-black tabular-nums ${TONES[figure.tone ?? 'muted']}`}>
                {formatMoney(figure.value)}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
