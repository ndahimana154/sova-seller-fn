import { ChevronLeft, ExternalLink, Mail, MapPin, Phone, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { normalizeApiError } from '../../../api/errors'
import { OrderStatusBadge } from '../../../components/seller/orders/OrderStatusBadge'
import { ui } from '../../../components/ui/styles'
import { formatDateTime } from '../../../lib/formatDate'
import { formatMoney } from '../../../lib/money'
import { getSellerOrder, type SellerOrderDetail } from '../../../lib/sellerApi'

export function SellerOrderDetailsPage() {
  const { orderNumber } = useParams()
  const [order, setOrder] = useState<SellerOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orderNumber) return
    let live = true
    getSellerOrder(orderNumber)
      .then((result) => live && setOrder(result))
      .catch((cause) => live && setError(normalizeApiError(cause).message))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [orderNumber])

  if (loading) return <div className="p-5 sm:p-6"><p className="text-xs text-muted">Loading order…</p></div>
  if (error || !order) {
    return (
      <div className="space-y-3 p-5 sm:p-6">
        <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          {error || 'This order was not found.'}
        </p>
        <Link className="text-xs font-bold text-ink hover:underline" to="/dashboard/orders">Back to orders</Link>
      </div>
    )
  }

  return (
    <div className="space-y-5 p-5 sm:p-6">
      <section className={`${ui.card} p-5`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-base font-black text-ink">{order.orderNumber}</h1>
            <p className="mt-1 text-[11px] text-muted">
              Placed {formatDateTime(order.createdAt)} · Checkout {order.checkoutNumber}
            </p>
          </div>
          <OrderStatusBadge deliveryStatus={order.deliveryStatus} status={order.status} />
        </div>

        {order.awaitingPayment && (
          <p className="mt-4 rounded-xl bg-amber-50 px-3.5 py-2.5 text-[11px] font-semibold text-amber-800">
            The buyer has not paid yet. Do not pack this order until the payment is confirmed.
          </p>
        )}

        <div className="mt-4 border-t border-line pt-4">
          <p className="text-xs font-bold text-ink">{order.productName}</p>
          <p className="mt-0.5 text-[11px] text-muted">
            {order.variantName ? `${order.variantName} · ` : ''}× {order.quantity} at {formatMoney(order.unitPrice)}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">Reserved from your stock: {order.reservedQuantity}</p>

          <dl className="mt-3 space-y-1.5 border-t border-line pt-3">
            <Row label="Items" value={formatMoney(order.unitPrice * order.quantity)} />
            {order.discountAmount > 0 && <Row label="Discount" value={`−${formatMoney(order.discountAmount)}`} />}
            <div className="flex items-center justify-between border-t border-line pt-2">
              <span className="text-xs font-black text-ink">Order total</span>
              <strong className="text-sm font-black text-ink">{formatMoney(order.totalAmount)}</strong>
            </div>
          </dl>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={`${ui.card} p-5`}>
          <h2 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.12em] text-muted">
            <Truck size={13} /> Delivery
          </h2>
          {order.delivery ? (
            <div className="mt-3 space-y-1.5 text-[11px] text-muted">
              <OrderStatusBadge status={order.delivery.status} />
              <p>Courier: <strong className="text-ink">{order.delivery.courierName ?? 'Not assigned'}</strong></p>
              <p>Attempt {order.delivery.attemptNumber}</p>
              {order.delivery.deliveredAt && <p>Delivered {formatDateTime(order.delivery.deliveredAt)}</p>}
            </div>
          ) : (
            <p className="mt-3 text-[11px] text-muted">A courier is assigned once SOVA confirms the payment.</p>
          )}
        </section>

        <section className={`${ui.card} p-5`}>
          <h2 className="text-xs font-black uppercase tracking-[0.12em] text-muted">Deliver to</h2>
          <div className="mt-3 space-y-1 text-[11px] text-muted">
            <p className="font-bold text-ink">{order.recipientName}</p>
            <p className="flex items-start gap-1.5">
              <MapPin className="mt-px shrink-0" size={12} />
              <span className="break-words">{order.deliveryAddress}</span>
            </p>
            {order.deliveryNote && <p className="rounded-lg bg-soft px-2.5 py-2 italic">{order.deliveryNote}</p>}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <a className={ui.inlineLink} href={`tel:${order.recipientPhone}`}>
              <Phone className="mr-1 inline" size={12} /> {order.recipientPhone}
            </a>
            {order.recipientEmail && (
              <a className={ui.inlineLink} href={`mailto:${order.recipientEmail}`}>
                <Mail className="mr-1 inline" size={12} /> Email buyer
              </a>
            )}
            {order.mapsUrl && (
              <a className={ui.inlineLink} href={order.mapsUrl} rel="noreferrer" target="_blank">
                <ExternalLink className="mr-1 inline" size={12} /> Open map
              </a>
            )}
          </div>
        </section>
      </div>

      <section className={`${ui.card} p-5`}>
        <h2 className="text-xs font-black uppercase tracking-[0.12em] text-muted">Timeline</h2>
        <ol className="mt-3 space-y-3">
          {order.timeline.map((entry, index) => (
            <li className="flex gap-2.5" key={index}>
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-ink" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-ink">
                  {entry.description ?? entry.eventType.replaceAll('_', ' ')}
                </p>
                <p className="mt-0.5 text-[10px] text-muted">{formatDateTime(entry.at)}</p>
              </div>
            </li>
          ))}
          {!order.timeline.length && <p className="text-[11px] text-muted">No events yet.</p>}
        </ol>
      </section>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <dt className="text-muted">{label}</dt>
      <dd className="font-bold text-ink">{value}</dd>
    </div>
  )
}
