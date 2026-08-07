import { ChevronDown } from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useAnchoredPosition } from './useAnchoredPosition'

export interface ActionMenuItem {
  danger?: boolean
  disabled?: boolean
  icon?: ReactNode
  label: string
  onSelect?: () => void
  separatorBefore?: boolean
  to?: string
}

interface ActionMenuProps {
  align?: 'end' | 'start'
  buttonClassName?: string
  items: ActionMenuItem[]
  label?: ReactNode
}

/** Portalled so table cards and scroll containers cannot clip it. */
export function ActionMenu({ align = 'start', buttonClassName, items, label = 'Actions' }: ActionMenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const position = useAnchoredPosition({
    align,
    anchorRef: triggerRef,
    floatingRef: menuRef,
    onDismiss: () => { setOpen(false); triggerRef.current?.focus() },
    open,
  })

  return (
    <>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className={buttonClassName ?? 'seller-outline-button min-w-[94px] justify-between'}
        onClick={() => setOpen((current) => !current)}
        ref={triggerRef}
        type="button"
      >
        {label} <ChevronDown className={`transition-transform ${open ? 'rotate-180' : ''}`} size={13} />
      </button>
      {open && createPortal(
        <div
          className="fixed z-[200] max-h-[min(20rem,calc(100vh-1rem))] min-w-44 overflow-y-auto overflow-x-hidden rounded-lg border border-line bg-white py-1 shadow-xl"
          ref={menuRef}
          role="menu"
          style={{ left: position?.left ?? 0, top: position?.top ?? 0, visibility: position ? 'visible' : 'hidden' }}
        >
          {items.map((item, index) => (
            <ActionMenuEntry item={item} key={`${item.label}-${index}`} onDone={() => setOpen(false)} />
          ))}
        </div>,
        document.body,
      )}
    </>
  )
}

function ActionMenuEntry({ item, onDone }: { item: ActionMenuItem; onDone: () => void }) {
  const tone = item.danger ? 'text-red-600 hover:bg-red-50' : 'hover:bg-soft'
  const className = `flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs ${tone} ${item.disabled ? 'pointer-events-none opacity-40' : ''}`
  return (
    <>
      {item.separatorBefore && <div className="my-1 border-t border-line" />}
      {item.to
        ? <Link className={className} onClick={onDone} role="menuitem" to={item.to}>{item.icon}{item.label}</Link>
        : (
          <button
            className={className}
            disabled={item.disabled}
            onClick={() => { onDone(); item.onSelect?.() }}
            role="menuitem"
            type="button"
          >
            {item.icon}{item.label}
          </button>
        )}
    </>
  )
}
