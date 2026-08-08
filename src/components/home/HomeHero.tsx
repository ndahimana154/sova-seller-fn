import { ArrowRight, PackageSearch, ShieldCheck, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { appPaths } from '../../router/paths'

const highlights = [
  { icon: Store, label: 'One shop profile', detail: 'Your storefront on SOVA' },
  { icon: PackageSearch, label: 'Products & stock', detail: 'Listings, media, inventory' },
  { icon: ShieldCheck, label: 'Verified sellers', detail: 'RDB and TIN checked' },
]

export function HomeHero() {
  return (
    <section className="page-container pb-6 pt-8 sm:pt-12">
      <div className="hero-panel grid gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:p-12">
        <div className="relative z-10 max-w-xl">
          <p className="auth-eyebrow">SOVA seller portal</p>
          <h1 className="mt-3 text-[2.1rem] font-black leading-[1.05] tracking-[-0.05em] text-ink sm:text-[2.9rem]">
            The place sellers open and run their SOVA shop
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-muted">
            Apply with your shop and RDB details, get reviewed, then sign in here to manage your
            catalogue, media, and stock. Everything a SOVA seller needs sits behind one account.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link className="primary-button" to={appPaths.apply}>
              Apply to sell <ArrowRight size={15} />
            </Link>
            <Link className="secondary-button" to={appPaths.login}>Sign in to your shop</Link>
          </div>
          <p className="mt-4 text-xs text-muted">
            Already applied?{' '}
            <Link className="font-bold text-primary-dark hover:underline" to={appPaths.apply}>
              Track it with your application code
            </Link>
            .
          </p>
          <dl className="mt-8 grid gap-3 sm:grid-cols-3">
            {highlights.map((item) => (
              <div className="rounded-2xl border border-primary/10 bg-white/70 p-3" key={item.label}>
                <item.icon className="text-primary-dark" size={16} />
                <dt className="mt-2 text-[11px] font-black text-ink">{item.label}</dt>
                <dd className="mt-0.5 text-[10px] leading-4 text-muted">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative hidden overflow-hidden rounded-[22px] border border-white/70 lg:block">
          <img alt="" className="size-full object-cover" loading="lazy" src="/images/storefront-hero.png" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2d1709]/85 to-transparent p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/75">Sell across Rwanda</p>
            <p className="mt-2 text-lg font-black leading-tight tracking-[-0.03em] text-white">
              Reach buyers browsing SOVA every day.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
