import { Eye } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { normalizeApiError } from '../../../api/errors'
import { OrderStatusBadge } from '../../../components/seller/orders/OrderStatusBadge'
import { OrderFilters } from '../../../components/seller/orders/OrderFilters'
import {
  EMPTY_FILTERS,
  activeFilterCount,
  applyOrderFilters,
  type OrderFilterState,
} from '../../../components/seller/orders/orderBuckets'
import { ActionMenu } from '../../../components/ui/ActionMenu'
import { DataTable } from '../../../components/ui/DataTable'
import { formatDateTime } from '../../../lib/formatDate'
import { formatMoney } from '../../../lib/money'
import { getSellerOrders, type SellerOrderSummary } from '../../../lib/sellerApi'
import { appPaths } from '../../../router/paths'

export function SellerOrdersPage() {
  const [orders, setOrders] = useState<SellerOrderSummary[]>([])
  const [filters, setFilters] = useState<OrderFilterState>(EMPTY_FILTERS)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let live = true
    getSellerOrders()
      .then((result) => live && setOrders(result))
      .catch((cause) => live && setError(normalizeApiError(cause).message))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [])

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return applyOrderFilters(orders, filters).filter((order) =>
      term
        ? `${order.orderNumber} ${order.productName} ${order.variantName ?? ''}`
          .toLowerCase()
          .includes(term)
        : true,
    )
  }, [filters, orders, search])

  const rows = visible.map((order) => [
    <span className="font-bold text-ink">{order.orderNumber}</span>,
    <div className="min-w-0">
      <p className="truncate font-semibold text-ink">{order.productName}</p>
      {order.variantName && <p className="mt-0.5 truncate text-[10px] text-muted">{order.variantName}</p>}
    </div>,
    <span className="tabular-nums">× {order.quantity}</span>,
    <OrderStatusBadge status={order.status} />,
    <span className="inline-flex whitespace-nowrap rounded-full bg-soft px-2.5 py-1 text-[10px] font-semibold text-muted">
      {formatDateTime(order.createdAt)}
    </span>,
    <span className="whitespace-nowrap font-bold text-ink">{formatMoney(order.totalAmount)}</span>,
  ])

  return (
    <div className="space-y-5 p-5 sm:p-6">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</p>
      )}

      <DataTable
        activeFilterCount={activeFilterCount(filters)}
        columns={['Order', 'Item', 'Qty', 'Status', 'Placed', 'Total']}
        emptyMessage={loading ? 'Loading orders…' : 'No orders match these filters.'}
        filters={<OrderFilters onChange={setFilters} value={filters} />}
        onSearchChange={setSearch}
        rowActions={(index) => (
          <ActionMenu
            items={[
              {
                icon: <Eye size={14} />,
                label: 'View order',
                to: appPaths.orderDetails(visible[index].orderNumber),
              },
            ]}
            label={`Actions`}
          />
        )}
        rows={rows}
        searchPlaceholder="Search orders"
        subtitle="Orders placed with your shop, newest first."
        title="Orders"
      />
    </div>
  )
}
