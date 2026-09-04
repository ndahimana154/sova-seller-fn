import { Link } from 'react-router-dom'
import type { SellerWalletEntry } from '../../../lib/sellerApi'
import { formatDateTime } from '../../../lib/formatDate'
import { formatMoney } from '../../../lib/money'
import { appPaths } from '../../../router/paths'
import { ui } from '../../ui/styles'

const LABELS: Record<string, string> = {
  adjustment: 'Adjustment',
  payout: 'Paid to you',
  refund: 'Refund',
  sale: 'Order delivered',
}

export function WalletEntries({ entries }: { entries: SellerWalletEntry[] }) {
  if (!entries.length) {
    return (
      <div className={`${ui.card} p-8 text-center`}>
        <p className="text-xs font-bold text-ink">Nothing here yet</p>
        <p className="mt-1 text-[11px] text-muted">
          Your earnings appear as soon as an order is delivered.
        </p>
      </div>
    )
  }

  return (
    <div className={`${ui.card} divide-y divide-line`}>
      {entries.map((entry) => {
        const credit = entry.amount >= 0
        return (
          <div className="flex flex-wrap items-start justify-between gap-3 p-4" key={entry.id}>
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink">
                {LABELS[entry.entryType] ?? entry.entryType}
              </p>
              <p className="mt-0.5 text-[11px] text-muted">{entry.description}</p>
              <p className="mt-0.5 text-[10px] text-faint">
                {formatDateTime(entry.at)}
                {entry.orderNumber && (
                  <>
                    {' · '}
                    <Link
                      className="font-semibold text-ink hover:underline"
                      to={appPaths.orderDetails(entry.orderNumber)}
                    >
                      {entry.orderNumber}
                    </Link>
                  </>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-black ${credit ? 'text-green-700' : 'text-red-600'}`}>
                {credit ? '+' : '−'}{formatMoney(Math.abs(entry.amount))}
              </p>
              <p className="text-[10px] text-faint">
                Balance {formatMoney(entry.balanceAfter)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
