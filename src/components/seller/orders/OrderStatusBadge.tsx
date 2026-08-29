const TONE: Record<string, string> = {
  assigned: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-red-50 text-red-700',
  completed: 'bg-emerald-50 text-emerald-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-700',
  out_for_delivery: 'bg-amber-50 text-amber-700',
  pending: 'bg-soft text-muted',
  picked_up: 'bg-amber-50 text-amber-700',
  processing: 'bg-amber-50 text-amber-700',
}

/** The delivery state is the more specific truth when one exists. */
export function OrderStatusBadge({
  status,
}: {
  status: string
}) {
  const shown = status
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${TONE[shown] ?? 'bg-soft text-muted'}`}>
      {shown.replaceAll('_', ' ')}
    </span>
  )
}
