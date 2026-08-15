import { Check, ChevronDown, Search } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAnchoredPosition } from './useAnchoredPosition'
import type { SelectOption } from './Select'

interface MultiSelectProps {
  className?: string
  disabled?: boolean
  emptyMessage?: string
  onChange: (values: string[]) => void
  options: SelectOption[]
  placeholder?: string
  searchThreshold?: number
  value: string[]
  variant?: 'bare' | 'boxed'
}

export function MultiSelect({
  className = '',
  disabled = false,
  emptyMessage = 'Nothing to choose from yet.',
  onChange,
  options,
  placeholder = 'Select options',
  searchThreshold = 8,
  value,
  variant = 'boxed',
}: MultiSelectProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const chosen = options.filter((option) => value.includes(option.value))
  const searchable = options.length >= searchThreshold
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return options
    return options.filter((option) => option.label.toLowerCase().includes(needle))
  }, [options, query])

  const position = useAnchoredPosition({
    anchorRef: triggerRef,
    floatingRef: popupRef,
    matchWidth: true,
    onDismiss: () => close(),
    open,
  })

  function close(refocus = true) {
    setOpen(false)
    setQuery('')
    if (refocus) triggerRef.current?.focus()
  }

  function toggle(option: string) {
    onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option])
  }

  const summary = chosen.length === 0
    ? placeholder
    : chosen.length <= 2
      ? chosen.map((option) => option.label).join(', ')
      : `${chosen.length} selected`

  const chrome = variant === 'bare'
    ? 'min-h-6 text-xs'
    : 'min-h-10 rounded-xl border border-line bg-white px-3 text-xs focus:border-ink'

  return (
    <div className={`relative ${className}`}>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex w-full items-center gap-2 text-left outline-none disabled:cursor-not-allowed disabled:opacity-60 ${chrome}`}
        disabled={disabled}
        onClick={() => (open ? close() : setOpen(true))}
        ref={triggerRef}
        type="button"
      >
        <span className={`min-w-0 flex-1 truncate ${chosen.length ? 'text-ink' : 'text-muted'}`}>{summary}</span>
        {chosen.length > 2 && (
          <span className="shrink-0 rounded-full bg-soft px-1.5 py-0.5 text-[9px] font-bold text-muted">{chosen.length}</span>
        )}
        <ChevronDown className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} size={14} />
      </button>

      {open && createPortal(
        <div
          className="fixed z-[200] animate-pop overflow-hidden rounded-xl border border-line bg-white shadow-[0_20px_50px_rgb(23_26_31/0.16)] motion-reduce:animate-none"
          ref={popupRef}
          style={{
            left: position?.left ?? 0,
            top: position?.top ?? 0,
            visibility: position ? 'visible' : 'hidden',
            width: position?.width ?? undefined,
          }}
        >
          {searchable && (
            <div className="flex items-center gap-2 border-b border-line px-2.5 py-2">
              <Search className="shrink-0 text-muted" size={13} />
              <input
                aria-label="Filter options"
                autoFocus
                className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Type to filter…"
                value={query}
              />
            </div>
          )}
          <div className="max-h-64 overflow-y-auto p-1" role="listbox">
            {visible.map((option) => {
              const picked = value.includes(option.value)
              return (
                <button
                  aria-selected={picked}
                  className="flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition hover:bg-soft"
                  key={option.value}
                  onClick={() => toggle(option.value)}
                  role="option"
                  type="button"
                >
                  <span className={`mt-px grid size-4 shrink-0 place-items-center rounded border ${picked ? 'border-ink bg-ink text-white' : 'border-line bg-white'}`}>
                    {picked && <Check size={11} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-ink">{option.label}</span>
                    {option.hint && <span className="block truncate text-[10px] text-muted">{option.hint}</span>}
                  </span>
                </button>
              )
            })}
            {!visible.length && <p className="px-2.5 py-6 text-center text-[11px] text-muted">{emptyMessage}</p>}
          </div>
          {chosen.length > 0 && (
            <div className="flex items-center justify-between gap-2 border-t border-line px-2.5 py-2">
              <span className="text-[10px] text-muted">{chosen.length} selected</span>
              <button className="text-[10px] font-bold text-muted hover:text-ink" onClick={() => onChange([])} type="button">
                Clear all
              </button>
            </div>
          )}
        </div>,
        document.body,
      )}
    </div>
  )
}
