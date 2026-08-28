import { ArrowRight, PackageSearch, ShieldCheck, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { appPaths } from '../../router/paths'
import { Button } from '../ui'
import { ui } from '../ui/styles'

const highlights = [
  { icon: Store, label: 'One shop profile', detail: 'Your storefront on SOVA' },
  { icon: PackageSearch, label: 'Products & stock', detail: 'Listings, media, inventory' },
  { icon: ShieldCheck, label: 'Verified sellers', detail: 'RDB and TIN checked' },
]

export function HomeHero() {
  return (
    <section className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8 pb-8 pt-10 sm:pt-14">
      <div className="relative overflow-hidden rounded-panel border border-line bg-canvas grid gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:p-12">
        <div className="relative z-10 max-w-xl">
          <p className={ui.eyebrow}>SOVA seller portal</p>
          <h1 className="mt-3 text-[2.1rem] font-black leading-[1.05] tracking-[-0.05em] text-ink sm:text-[2.9rem]">
            The place sellers open and run their SOVA shop
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-muted">
            Apply with your shop and RDB details, get reviewed, then sign in here to manage your
            catalogue, media, and stock. Everything a SOVA seller needs sits behind one account.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-8">
            <Button size="lg" to={appPaths.apply}>Apply to sell <ArrowRight size={15} /></Button>
            <Button size="lg" to={appPaths.login} variant="outline">Sign in to your shop</Button>
          </div>
          <p className="mt-5 text-xs text-muted">
            Already applied?{' '}
            <Link className="font-bold text-ink underline-offset-2 hover:underline" to={appPaths.apply}>
              Track it with your application code
            </Link>
            .
          </p>
          <dl className="mt-10 grid gap-3 sm:grid-cols-3">
            {highlights.map((item) => (
              <div className="rounded-2xl border border-line bg-white p-4" key={item.label}>
                <item.icon className="text-ink" size={16} />
                <dt className="mt-2 text-[11px] font-black text-ink">{item.label}</dt>
                <dd className="mt-0.5 text-[10px] leading-4 text-muted">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative hidden overflow-hidden rounded-[22px] border border-line lg:block">
          <img alt="" className="size-full object-cover" loading="lazy" src="/images/storefront-hero.png" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Sell across Rwanda</p>
            <p className="mt-2 text-lg font-black leading-tight tracking-[-0.03em] text-white">
              Reach buyers browsing SOVA every day.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
