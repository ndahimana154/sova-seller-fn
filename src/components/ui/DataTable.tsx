import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Inbox,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { Select } from './Select'
import { ui } from './styles'

export interface DataTablePagination {
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

interface DataTableProps {
  activeFilterCount?: number
  actions?: ReactNode
  columns: string[]
  counter?: boolean
  emptyMessage?: string
  filters?: ReactNode
  onSearchChange?: (value: string) => void
  pagination?: DataTablePagination
  primaryAction?: ReactNode
  rowActions?: (rowIndex: number) => ReactNode
  rows: ReactNode[][]
  searchPlaceholder?: string
  subtitle?: string
  title?: string
  toolbarEnd?: ReactNode
}

export function DataTable({
  activeFilterCount = 0,
  actions,
  columns,
  counter = true,
  emptyMessage = 'No records found.',
  filters,
  onSearchChange,
  pagination,
  primaryAction,
  rowActions,
  rows,
  searchPlaceholder = 'Search records',
  subtitle,
  title,
  toolbarEnd,
}: DataTableProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filterPanelId = useId()
  const counterOffset = pagination ? (pagination.page - 1) * pagination.pageSize : 0
  const hasToolbar = Boolean(actions || filters || onSearchChange || primaryAction || toolbarEnd)

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      {title && (
        <div className="border-b border-line bg-white px-3 py-3">
          <h2 className="text-sm font-bold tracking-[-0.02em] text-ink">{title}</h2>
          {subtitle && <p className="mt-1 text-[11px] leading-5 text-muted">{subtitle}</p>}
        </div>
      )}
      {hasToolbar && (
        <div className="flex flex-col gap-2 border-b border-line bg-white p-3 sm:flex-row sm:items-center">
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
          {/* Nowrap keeps search, filters and the action on one line; the search
              box is the only thing allowed to give up width. */}
          <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2">
            {onSearchChange && (
              <label className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md border border-line px-2.5 text-faint sm:max-w-52">
                <Search className="shrink-0" size={14} />
                <input onChange={(event) => onSearchChange(event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs text-ink outline-none" placeholder={searchPlaceholder} />
              </label>
            )}
            {filters && (
              <button
                aria-controls={filterPanelId}
                aria-expanded={filtersOpen}
                className={`shrink-0 ${filtersOpen || activeFilterCount > 0 ? ui.primaryButton : ui.outlineButton}`}
                onClick={() => setFiltersOpen((value) => !value)}
                type="button"
              >
                <SlidersHorizontal size={14} /> Filters
                {activeFilterCount > 0 && <span className="grid min-w-4 place-items-center rounded-full bg-white/25 px-1 text-[9px] font-bold leading-4">{activeFilterCount}</span>}
                {filtersOpen && <ChevronUp size={13} />}
              </button>
            )}
            {toolbarEnd}
            {primaryAction && (
              <>
                <span aria-hidden className="mx-1 hidden h-5 w-px shrink-0 bg-line sm:block" />
                <span className="shrink-0">{primaryAction}</span>
              </>
            )}
          </div>
        </div>
      )}
      {filters && filtersOpen && (
        <div className="animate-reveal border-b border-line bg-canvas p-3 motion-reduce:animate-none" id={filterPanelId}>
          <div className="flex flex-wrap items-end gap-3">{filters}</div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className={ui.table}>
          <thead>
            <tr>
              {counter && <th className="w-10 text-center text-faint">#</th>}
              {rowActions && <th>Actions</th>}
              {columns.map((column) => <th key={column}>{column}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {counter && <td className="w-10 text-center text-faint">{counterOffset + rowIndex + 1}</td>}
                {rowActions && <td><div className="flex items-center gap-1">{rowActions(rowIndex)}</div></td>}
                {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td className="px-4 py-12 text-center text-xs text-muted" colSpan={columns.length + (rowActions ? 1 : 0) + (counter ? 1 : 0)}>
                  <span className="mx-auto flex max-w-xs flex-col items-center gap-2">
                    <span className="grid size-9 place-items-center rounded-full bg-soft text-muted"><Inbox size={16} /></span>
                    {emptyMessage}
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pagination && <TablePagination {...pagination} />}
    </div>
  )
}

function TablePagination({
  onPageChange,
  onPageSizeChange,
  page,
  pageSize,
  totalItems,
  totalPages,
}: DataTablePagination) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-line bg-white px-3 py-3 text-xs">
      <span className="text-muted">{totalItems} item{totalItems === 1 ? '' : 's'}</span>
      <div className="ml-auto flex items-center gap-2 text-muted">
        Rows
        <Select
          className="w-20"
          onChange={(value) => onPageSizeChange(Number(value))}
          options={[10, 20, 50, 100].map((size) => ({ label: String(size), value: String(size) }))}
          size="sm"
          value={String(pageSize)}
        />
      </div>
      <nav aria-label="Table pagination" className="flex items-center gap-1">
        <PageButton disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeft size={14} /></PageButton>
        {pageNumbers(page, totalPages).map((number, index) =>
          number === null
            ? <span className="px-1 text-muted" key={`gap-${index}`}>…</span>
            : <PageButton active={number === page} key={number} onClick={() => onPageChange(number)}>{number}</PageButton>,
        )}
        <PageButton disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}><ChevronRight size={14} /></PageButton>
      </nav>
    </div>
  )
}

function PageButton({ active, children, disabled, onClick }: {
  active?: boolean
  children: ReactNode
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      aria-current={active ? 'page' : undefined}
      className={`grid min-h-8 min-w-8 place-items-center rounded-md border px-2 ${active ? 'border-primary bg-primary text-white' : 'border-line bg-white text-muted hover:border-primary'} disabled:cursor-not-allowed disabled:opacity-40`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

function pageNumbers(page: number, totalPages: number): Array<number | null> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1)
  const values = new Set([1, totalPages, page - 1, page, page + 1])
  const sorted = [...values].filter((value) => value > 0 && value <= totalPages).sort((a, b) => a - b)
  return sorted.flatMap((value, index) => index && value - sorted[index - 1] > 1 ? [null, value] : [value])
}
