interface AttributeTagsProps {
  attributes: Record<string, string>
  emptyMessage?: string
  /** Show only this many, with a "+N" chip carrying the rest in its tooltip. */
  limit?: number
  size?: 'md' | 'sm'
}

/**
 * Property/value pairs as two-tone pills: the property reads as a quiet label,
 * the value as the content. Wraps naturally, so long lists stay scannable.
 */
export function AttributeTags({
  attributes,
  emptyMessage = '—',
  limit,
  size = 'md',
}: AttributeTagsProps) {
  const entries = Object.entries(attributes)
  if (!entries.length) return <span className="text-xs text-muted">{emptyMessage}</span>

  const shown = limit ? entries.slice(0, limit) : entries
  const hidden = entries.length - shown.length
  const label = size === 'sm' ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]'
  const value = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'

  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {shown.map(([property, content]) => (
        <span
          className="inline-flex items-center overflow-hidden rounded-full border border-line bg-white"
          key={property}
          title={`${property}: ${content}`}
        >
          <span className={`bg-soft font-bold uppercase tracking-[0.08em] text-muted ${label}`}>{property}</span>
          <span className={`max-w-[12rem] truncate font-bold text-ink ${value}`}>{content}</span>
        </span>
      ))}
      {hidden > 0 && (
        <span
          className={`inline-flex items-center rounded-full border border-line bg-soft font-bold text-muted ${value}`}
          title={entries.map(([property, content]) => `${property}: ${content}`).join(', ')}
        >
          +{hidden}
        </span>
      )}
    </span>
  )
}
