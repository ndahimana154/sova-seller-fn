import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Inbox,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Select } from './Select'

export interface DataTablePagination {
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

interface DataTableProps {
  actions?: ReactNode
  columns: string[]
  emptyMessage?: string
  filters?: ReactNode
  inlineFilters?: boolean
  onSearchChange?: (value: string) => void
  pagination?: DataTablePagination
  rowActions?: (rowIndex: number) => ReactNode
  rows: ReactNode[][]
  searchPlaceholder?: string
  toolbarEnd?: ReactNode
}

export function DataTable({
  actions,
  columns,
  emptyMessage = 'No records found.',
  filters,
  inlineFilters = false,
  onSearchChange,
  pagination,
  rowActions,
  rows,
  searchPlaceholder = 'Search records',
  toolbarEnd,
}: DataTableProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const hasToolbar = Boolean(actions || filters || onSearchChange || toolbarEnd)

  return (
    <div className="global-table">
      {hasToolbar && (
        <div className="global-table-toolbar">
          <div className="flex flex-wrap items-center gap-1.5">{actions}</div>
          <div className="ml-auto flex min-w-0 flex-1 flex-nowrap items-center justify-end gap-1.5">
            {onSearchChange && (
              <label className="seller-filter-input w-48 shrink-0">
                <Search size={14} />
                <input onChange={(event) => onSearchChange(event.target.value)} placeholder={searchPlaceholder} />
              </label>
            )}
            {filters && inlineFilters && filters}
            {filters && !inlineFilters && (
              <button
                aria-expanded={filtersOpen}
                className={filtersOpen ? 'seller-primary-button' : 'seller-outline-button'}
                onClick={() => setFiltersOpen((value) => !value)}
                type="button"
              >
                <SlidersHorizontal size={14} /> Filters
                {filtersOpen && <ChevronUp size={13} />}
              </button>
            )}
            {toolbarEnd}
          </div>
        </div>
      )}
      {filters && !inlineFilters && filtersOpen && <div className="global-table-filter-panel">{filters}</div>}
      <div className="global-table-scroll">
        <table className="global-data-table">
          <thead><tr>{rowActions && <th>Actions</th>}{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {rowActions && <td><div className="flex items-center gap-1">{rowActions(rowIndex)}</div></td>}
                {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td className="global-table-empty" colSpan={columns.length + (rowActions ? 1 : 0)}>
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
    <div className="flex flex-wrap items-center gap-3 border-t border-line bg-white px-3 py-2.5 text-xs">
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
