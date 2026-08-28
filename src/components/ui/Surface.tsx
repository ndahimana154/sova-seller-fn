import type { ReactNode } from 'react'
import { ui } from '../ui/styles'

type CardTone = 'plain' | 'raised' | 'muted'
type BadgeTone = 'neutral' | 'ink' | 'accent' | 'info' | 'purple' | 'success' | 'warning' | 'danger'

const CARD_TONES: Record<CardTone, string> = {
  plain: 'rounded-2xl border border-line bg-white',
  raised: 'rounded-2xl border border-line bg-white shadow-card',
  muted: 'rounded-2xl border border-line bg-canvas',
}

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'border-line bg-soft text-muted',
  ink: 'border-ink bg-ink text-white',
  accent: 'border-accent/30 bg-accent-light text-accent-dark',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
  purple: 'border-violet-200 bg-violet-50 text-violet-700',
  success: 'border-green-200 bg-green-50 text-green-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border-red-200 bg-red-50 text-red-700',
}

export function Card({ children, className, hover = false, padded = true, tone = 'plain' }: {
  children: ReactNode
  className?: string
  hover?: boolean
  padded?: boolean
  tone?: CardTone
}) {
  const classes = [
    CARD_TONES[tone],
    hover && 'transition hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-card',
    padded && 'p-5',
    className,
  ].filter(Boolean).join(' ')
  return <div className={classes}>{children}</div>
}

export function CardHeader({ actions, subtitle, title }: { actions?: ReactNode; subtitle?: string; title: string }) {
  return (
    <header className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3">
      <div className="min-w-0">
        <h2 className="text-sm font-bold text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[11px] leading-5 text-muted">{subtitle}</p>}
      </div>
      {actions}
    </header>
  )
}

export function SectionHeading({ align = 'center', eyebrow, lead, title }: {
  align?: 'center' | 'left'
  eyebrow?: string
  lead?: string
  title: string
}) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-md'}>
      {eyebrow && <p className={ui.eyebrow}>{eyebrow}</p>}
      <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-ink sm:text-3xl">{title}</h2>
      {lead && <p className="mt-3 text-sm leading-6 text-muted">{lead}</p>}
    </div>
  )
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: BadgeTone }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-bold ${BADGE_TONES[tone]}`}>
      {children}
    </span>
  )
}

export function EmptyState({ action, icon, message, title }: {
  action?: ReactNode
  icon?: ReactNode
  message?: string
  title: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line bg-canvas px-6 py-10 text-center">
      {icon && <span className="grid size-10 shrink-0 place-items-center rounded-full bg-soft text-ink">{icon}</span>}
      <p className="text-xs font-bold text-ink">{title}</p>
      {message && <p className="max-w-sm text-[11px] leading-5 text-muted">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
