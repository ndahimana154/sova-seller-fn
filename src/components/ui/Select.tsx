import { Check, ChevronDown, Search } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { useAnchoredPosition } from './useAnchoredPosition'

export interface SelectOption {
  disabled?: boolean
  hint?: string
  label: string
  value: string
}

interface SelectProps {
  'aria-labelledby'?: string
  className?: string
  disabled?: boolean
  emptyMessage?: string
  name?: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  required?: boolean
  /** Show the filter box once the list reaches this many options. */
  searchThreshold?: number
  size?: 'md' | 'sm'
  value: string
  /** `bare` drops the trigger's own border so it can sit inside an existing field box. */
  variant?: 'bare' | 'boxed'
}

/**
 * Listbox-style select. The popup is portalled so nothing can clip it, and a
 * mirrored native `<select>` keeps `FormData` and constraint validation working.
 */
export function Select({
  className = '',
  disabled = false,
  emptyMessage = 'No matches found.',
  name,
  onChange,
  options,
  placeholder = 'Select an option',
  required = false,
  searchThreshold = 8,
  size = 'md',
  value,
  variant = 'boxed',
  ...aria
}: SelectProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const typeAhead = useRef({ buffer: '', time: 0 })
  const listboxId = useId()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)

  const selected = options.find((option) => option.value === value)
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

  function openMenu() {
    if (disabled) return
    const index = options.findIndex((option) => option.value === value)
    setHighlight(index < 0 ? 0 : index)
    setOpen(true)
  }

  function pick(option: SelectOption) {
    if (option.disabled) return
    onChange(option.value)
    close()
  }

  useEffect(() => {
    if (!open) return
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [highlight, open, visible.length])

  useEffect(() => { if (open && searchable) searchRef.current?.focus() }, [open, searchable])

  function move(step: number) {
    if (!visible.length) return
    let next = highlight
    for (let attempt = 0; attempt < visible.length; attempt += 1) {
      next = (next + step + visible.length) % visible.length
      if (!visible[next]?.disabled) break
    }
    setHighlight(next)
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) { event.preventDefault(); openMenu() }
      return
    }
    switch (event.key) {
      case 'ArrowDown': event.preventDefault(); move(1); break
      case 'ArrowUp': event.preventDefault(); move(-1); break
      case 'Home': event.preventDefault(); setHighlight(0); break
      case 'End': event.preventDefault(); setHighlight(visible.length - 1); break
      case 'Tab': close(false); break
      case 'Enter':
        event.preventDefault()
        if (visible[highlight]) pick(visible[highlight])
        break
      case ' ':
        if (searchable) break // a space belongs to the query
        event.preventDefault()
        if (visible[highlight]) pick(visible[highlight])
        break
      default:
        if (!searchable && event.key.length === 1) jumpToLetter(event.key)
    }
  }

  /** Type-ahead for short lists, which have no filter box. */
  function jumpToLetter(key: string) {
    const now = Date.now()
    typeAhead.current.buffer = now - typeAhead.current.time > 700 ? key : typeAhead.current.buffer + key
    typeAhead.current.time = now
    const needle = typeAhead.current.buffer.toLowerCase()
    const index = visible.findIndex((option) => !option.disabled && option.label.toLowerCase().startsWith(needle))
    if (index >= 0) setHighlight(index)
  }

  const trigger = size === 'sm' ? 'h-8 text-xs' : 'min-h-10 text-xs'
  const chrome = variant === 'boxed'
    ? 'rounded-xl border border-line bg-white px-3 transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-soft'
    : 'w-full bg-transparent'

  return (
    <span className={`relative flex min-w-0 ${variant === 'bare' ? 'flex-1' : ''} ${className}`}>
      <button
        aria-controls={open ? listboxId : undefined}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby={aria['aria-labelledby']}
        className={`flex w-full items-center gap-2 text-left outline-none disabled:cursor-not-allowed disabled:opacity-60 ${trigger} ${chrome}`}
        disabled={disabled}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={handleKeyDown}
        ref={triggerRef}
        role="combobox"
        type="button"
      >
        <span className={`min-w-0 flex-1 truncate ${selected ? 'text-ink' : 'text-muted'}`}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} size={14} />
      </button>

      {/* Mirrors the value for FormData and native validation; the button is the real control. */}
      {name && (
        <select
          aria-hidden="true"
          className="sr-only-field"
          disabled={disabled}
          name={name}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          tabIndex={-1}
          value={value}
        >
          <option value="" />
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      )}

      {open && createPortal(
        <div
          className="select-popup fixed z-[200] overflow-hidden rounded-xl border border-line bg-white shadow-[0_20px_50px_rgb(23_26_31/0.16)]"
          onKeyDown={handleKeyDown}
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
                className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted"
                onChange={(event) => { setQuery(event.target.value); setHighlight(0) }}
                placeholder="Type to filter…"
                ref={searchRef}
                value={query}
              />
            </div>
          )}
          <div className="max-h-64 overflow-y-auto py-1" id={listboxId} ref={listRef} role="listbox">
            {visible.map((option, index) => {
              const active = index === highlight
              const isSelected = option.value === value
              return (
                <div
                  aria-disabled={option.disabled}
                  aria-selected={isSelected}
                  className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-xs transition ${active ? 'bg-primary-light' : ''} ${isSelected ? 'font-semibold text-ink' : 'text-muted'} ${option.disabled ? 'cursor-not-allowed opacity-40' : ''}`}
                  data-active={active}
                  key={option.value}
                  onClick={() => pick(option)}
                  onMouseEnter={() => setHighlight(index)}
                  role="option"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{option.label}</span>
                    {option.hint && <span className="block truncate text-[10px] text-muted">{option.hint}</span>}
                  </span>
                  {isSelected && <Check className="shrink-0 text-primary-dark" size={14} />}
                </div>
              )
            })}
            {!visible.length && <p className="px-3 py-6 text-center text-xs text-muted">{emptyMessage}</p>}
          </div>
        </div>,
        document.body,
      )}
    </span>
  )
}
