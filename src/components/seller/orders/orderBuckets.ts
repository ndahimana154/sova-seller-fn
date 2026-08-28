import type { SellerOrderSummary } from '../../../lib/sellerApi'

export type OrderBucket =
  | ''
  | 'to_pay'
  | 'packing'
  | 'in_transit'
  | 'shipped'
  | 'cancelled'

const IN_TRANSIT = ['picked_up', 'out_for_delivery']

/** Which stage an order sits at, from its order, payment and delivery states. */
export function bucketOf(order: SellerOrderSummary): Exclude<OrderBucket, ''> {
  if (order.status === 'cancelled') return 'cancelled'
  if (order.status === 'completed' || order.deliveryStatus === 'delivered') return 'shipped'
  if (order.awaitingPayment) return 'to_pay'
  if (order.deliveryStatus && IN_TRANSIT.includes(order.deliveryStatus)) return 'in_transit'
  return 'packing'
}

export const BUCKET_OPTIONS = [
  { label: 'All orders', value: '' },
  { label: 'Awaiting payment', value: 'to_pay' },
  { label: 'To pack', value: 'packing' },
  { label: 'In transit', value: 'in_transit' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Cancelled', value: 'cancelled' },
]

export interface OrderFilterState {
  bucket: OrderBucket
  from: string
  to: string
}

export const EMPTY_FILTERS: OrderFilterState = { bucket: '', from: '', to: '' }

/** Date bounds are inclusive of the whole day the buyer picked. */
export function applyOrderFilters(
  orders: SellerOrderSummary[],
  filters: OrderFilterState,
): SellerOrderSummary[] {
  const from = filters.from ? new Date(`${filters.from}T00:00:00`) : null
  const to = filters.to ? new Date(`${filters.to}T23:59:59.999`) : null

  return orders.filter((order) => {
    if (filters.bucket && bucketOf(order) !== filters.bucket) return false
    const placed = new Date(order.createdAt)
    if (from && placed < from) return false
    if (to && placed > to) return false
    return true
  })
}

export function activeFilterCount(filters: OrderFilterState): number {
  return [filters.bucket, filters.from, filters.to].filter(Boolean).length
}
