import type { SellerPayoutEntry } from '../../../lib/sellerApi'
import { formatDateTime } from '../../../lib/formatDate'
import { formatMoney } from '../../../lib/money'
import { ui } from '../../ui/styles'

export function WalletPayouts({ payouts }: { payouts: SellerPayoutEntry[] }) {
  if (!payouts.length) {
    return (
      <div className={`${ui.card} p-8 text-center`}>
        <p className="text-xs font-bold text-ink">No payments yet</p>
        <p className="mt-1 text-[11px] text-muted">
          Payments SOVA sends you will be listed here with their reference.
        </p>
      </div>
    )
  }

  return (
    <div className={`${ui.card} divide-y divide-line`}>
      {payouts.map((payout) => {
        const reversed = payout.status === 'reversed'
        return (
          <div className="flex flex-wrap items-start justify-between gap-3 p-4" key={payout.id}>
            <div className="min-w-0">
              <p className="font-mono text-[11px] font-bold text-ink">{payout.reference}</p>
              <p className="mt-0.5 text-[11px] text-muted">
                {payout.methodName} · {payout.recipientAccount}
              </p>
              {payout.transactionReference && (
                <p className="mt-0.5 font-mono text-[10px] text-faint">
                  Ref {payout.transactionReference}
                </p>
              )}
              <p className="mt-0.5 text-[10px] text-faint">
                {payout.paidAt ? formatDateTime(payout.paidAt) : '—'}
              </p>
              {reversed && payout.reversalReason && (
                <p className="mt-1 rounded-lg bg-red-50 px-2 py-1.5 text-[10px] leading-4 text-red-700">
                  Reversed: {payout.reversalReason}
                </p>
              )}
            </div>
            <p
              className={`text-sm font-black ${reversed ? 'text-faint line-through' : 'text-ink'}`}
            >
              {formatMoney(payout.amount)}
            </p>
          </div>
        )
      })}
    </div>
  )
}
