import { ArrowRight, Boxes, PackageCheck, PencilLine, TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageTitle } from '../../components/seller/products/ProductPageUi'
import { useToast } from '../../hooks/useToast'
import {
  sellerProductsApi,
  type LowStockVariant,
  type SellerDashboard,
} from '../../lib/sellerProductsApi'
import { appPaths } from '../../router/paths'
import { ui } from '../../components/ui/styles'

export function SellerDashboardHomePage() {
  const [summary, setSummary] = useState<SellerDashboard | null>(null)
  const [lowStock, setLowStock] = useState<LowStockVariant[]>([])
  const toast = useToast()

  useEffect(() => {
    Promise.all([sellerProductsApi.dashboard(), sellerProductsApi.lowStock()])
      .then(([nextSummary, nextLowStock]) => {
        setSummary(nextSummary)
        setLowStock(nextLowStock)
      })
      .catch((cause) => toast.error(cause))
  }, [toast])

  return (
    <div className="space-y-5 p-5">
      <PageTitle subtitle="What your shop looks like right now." title="Dashboard" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={<PackageCheck size={15} />}
          label="Live products"
          sub={`${summary?.products.draft ?? 0} draft · ${summary?.products.inactive ?? 0} inactive`}
          value={summary?.products.active}
        />
        <Stat icon={<Boxes size={15} />} label="SKUs" sub={`${summary?.variants.total ?? 0} total`} value={summary?.variants.total} />
        <Stat
          icon={<TriangleAlert size={15} />}
          label="Out of stock"
          sub={`${summary?.variants.lowStock ?? 0} running low`}
          tone={summary?.variants.outOfStock ? 'warn' : undefined}
          value={summary?.variants.outOfStock}
        />
        <Stat icon={<Boxes size={15} />} label="Units on hand" value={summary?.stock.onHand} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className={`${ui.card} p-5`}>
          <header className="mb-3 flex items-center justify-between border-b border-line pb-3">
            <h2 className="text-sm font-bold text-ink">Finish these drafts</h2>
            <Link className="text-[11px] font-semibold text-primary-dark" to={appPaths.products}>
              All products
            </Link>
          </header>
          {summary?.unfinished.length ? (
            <ul className="space-y-2">
              {summary.unfinished.map((draft) => (
                <li key={draft.id}>
                  <Link
                    className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 transition hover:border-primary/40"
                    to={appPaths.productEdit(draft.id)}
                  >
                    <PencilLine className="shrink-0 text-muted" size={14} />
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-xs text-ink">{draft.name}</strong>
                      <span className="text-[10px] text-muted">
                        Next: {draft.currentStep.toLowerCase()} · {draft.completedSteps}/{draft.totalSteps} steps
                      </span>
                    </span>
                    <ArrowRight className="shrink-0 text-muted" size={14} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Nothing half-finished. Everything is published.</Empty>
          )}
        </section>

        <section className={`${ui.card} p-5`}>
          <header className="mb-3 border-b border-line pb-3">
            <h2 className="text-sm font-bold text-ink">Running low</h2>
            <p className="mt-1 text-[10px] text-muted">SKUs with 5 or fewer units in stock.</p>
          </header>
          {lowStock.length ? (
            <ul className="space-y-2">
              {lowStock.slice(0, 6).map((item) => (
                <li key={item.variantId}>
                  <Link
                    className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 transition hover:border-primary/40"
                    to={appPaths.productDetails(item.productId)}
                  >
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-xs text-ink">{item.productName}</strong>
                      <span className="text-[10px] text-muted">{item.attributes || item.sku}</span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        item.stockQuantity === 0
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {item.stockQuantity} left
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Every SKU is comfortably stocked.</Empty>
          )}
        </section>
      </div>

      <section className={`${ui.card} p-5`}>
        <header className="mb-3 border-b border-line pb-3">
          <h2 className="text-sm font-bold text-ink">Recent stock movements</h2>
        </header>
        {summary?.recentStockMovements.length ? (
          <ul className="divide-y divide-line text-xs">
            {summary.recentStockMovements.map((movement) => (
              <li className="flex flex-wrap items-center justify-between gap-2 py-2.5" key={movement.id}>
                <span className="min-w-0">
                  <strong className={movement.quantityDifference >= 0 ? 'text-green-700' : 'text-red-700'}>
                    {movement.quantityDifference > 0 ? '+' : ''}
                    {movement.quantityDifference}
                  </strong>
                  <span className="ml-2 text-muted">{movement.reason}</span>
                </span>
                <span className="text-[10px] text-muted">
                  {new Date(movement.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No stock movements recorded yet.</Empty>
        )}
      </section>
    </div>
  )
}

function Stat({
  icon,
  label,
  sub,
  tone,
  value,
}: {
  icon: React.ReactNode
  label: string
  sub?: string
  tone?: 'warn'
  value?: number
}) {
  return (
    <div className={`${ui.card} p-4`}>
      <p className="flex items-center gap-2 text-[11px] font-semibold text-muted">
        {icon}
        {label}
      </p>
      <p className={`mt-1.5 text-2xl font-black ${tone === 'warn' && value ? 'text-red-600' : 'text-ink'}`}>
        {value ?? '—'}
      </p>
      {sub && <p className="mt-0.5 text-[10px] text-muted">{sub}</p>}
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className={`${ui.hint} p-4`}>
      {children}
    </p>
  )
}
