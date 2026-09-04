import { useEffect, useState } from 'react'
import { normalizeApiError } from '../../api/errors'
import { MoneySummary } from '../../components/seller/wallet/MoneySummary'
import { WalletEntries } from '../../components/seller/wallet/WalletEntries'
import { WalletPayouts } from '../../components/seller/wallet/WalletPayouts'
import { getSellerWallet, type SellerWallet } from '../../lib/sellerApi'

export function SellerWalletPage() {
  const [wallet, setWallet] = useState<SellerWallet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'entries' | 'payouts'>('entries')

  useEffect(() => {
    let live = true
    getSellerWallet()
      .then((result) => live && setWallet(result))
      .catch((cause) => live && setError(normalizeApiError(cause).message))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [])

  if (loading) {
    return <div className="p-5 sm:p-6"><p className="text-xs text-muted">Loading your wallet…</p></div>
  }

  if (error || !wallet) {
    return (
      <div className="p-5 sm:p-6">
        <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          {error || 'Your wallet could not be loaded.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5 p-5 sm:p-6">
      <div>
        <h1 className="text-base font-black text-ink">Wallet</h1>
        <p className="mt-1 text-[11px] text-muted">
          What SOVA owes you, how it built up, and every payment already sent to you.
        </p>
      </div>

      <MoneySummary
        caption="Owed to you and not yet paid"
        primary={{ label: 'Balance', value: wallet.balance }}
        secondary={[
          { label: 'Earned', value: wallet.totalEarned },
          { label: 'Paid out', tone: 'success', value: wallet.totalPaidOut },
          {
            label: 'Refunded',
            tone: wallet.totalRefunded > 0 ? 'danger' : 'muted',
            value: wallet.totalRefunded,
          },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        {(['entries', 'payouts'] as const).map((id) => (
          <button
            className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold transition ${
              tab === id ? 'bg-ink text-white' : 'border border-line bg-white text-muted hover:text-ink'
            }`}
            key={id}
            onClick={() => setTab(id)}
            type="button"
          >
            {id === 'entries' ? `Activity (${wallet.entries.length})` : `Payments to you (${wallet.payouts.length})`}
          </button>
        ))}
      </div>

      {tab === 'entries' ? (
        <WalletEntries entries={wallet.entries} />
      ) : (
        <WalletPayouts payouts={wallet.payouts} />
      )}
    </div>
  )
}
