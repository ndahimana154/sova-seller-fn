import type { SellerOrderSummary } from '../../../lib/sellerApi'

export type OrderBucket =
  | ''
  | 'awaiting_packing'
  | 'packing'
  | 'in_transit'
  | 'delivered'
  | 'refunded'

/** Sellers only ever see confirmed orders, so the status is the bucket. */
export function bucketOf(order: SellerOrderSummary): Exclude<OrderBucket, ''> {
  if (order.status === 'refunded') return 'refunded'
  if (order.status === 'delivered') return 'delivered'
  if (order.status === 'in_transit') return 'in_transit'
  if (order.status === 'packing') return 'packing'
  return 'awaiting_packing'
}

export const BUCKET_OPTIONS = [
  { label: 'All orders', value: '' },
  { label: 'Await packing', value: 'awaiting_packing' },
  { label: 'Packing', value: 'packing' },
  { label: 'In transit', value: 'in_transit' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Refunded', value: 'refunded' },
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
