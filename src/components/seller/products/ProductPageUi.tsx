import type { ComponentProps, ReactNode } from 'react'
import { normalizeApiError } from '../../../api/errors'
import { Badge, Card, CardHeader } from '../../ui'
import { ui } from '../../ui/styles'
export { mediaUrl } from '../../../lib/mediaUrl'

export function Field({ children, className = '', label }: { children: ReactNode; className?: string; label: string }) {
  return <label className={className}><span className="mb-1.5 block text-[11px] font-semibold text-muted">{label}</span><span className={ui.formControl}>{children}</span></label>
}

export function FormSection({ actions, children, subtitle, title }: {
  actions?: ReactNode
  children: ReactNode
  subtitle?: string
  title: string
}) {
  return (
    <Card tone="raised">
      <CardHeader actions={actions} subtitle={subtitle} title={title} />
      {children}
    </Card>
  )
}

const STATUS_TONES: Record<string, ComponentProps<typeof Badge>['tone']> = {
  ACTIVE: 'success',
  DRAFT: 'warning',
  INACTIVE: 'neutral',
  IN_STOCK: 'success',
  OUT_OF_STOCK: 'danger',
  REJECTED: 'danger',
  RESUBMITTED: 'info',
  RETURNED: 'warning',
  SUBMITTED: 'info',
  SUSPENDED: 'danger',
  'UNDER REVIEW': 'purple',
  UNDER_REVIEW: 'purple',
}

export function StatusBadge({ value }: { value?: string | null }) {
  const normalized = value?.trim().toUpperCase() || 'UNKNOWN'
  return (
    <Badge tone={STATUS_TONES[normalized] ?? 'neutral'}>{normalized.replaceAll('_', ' ')}</Badge>
  )
}

export function PageTitle({ actions, subtitle, title }: { actions?: ReactNode; subtitle: string; title: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-bold tracking-[-0.02em] text-ink">{title}</h1>
        <p className="mt-1 text-xs text-muted">{subtitle}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export const errorMessage = (error: unknown) => normalizeApiError(error).message
