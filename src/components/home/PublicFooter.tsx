import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { env } from '../../config/env'
import { appPaths } from '../../router/paths'
import { Brand } from '../ui/Brand'

export function HomeCallToAction() {
  return (
    <section className="page-container section-space">
      <div className="hero-panel flex flex-wrap items-center justify-between gap-6 p-8 sm:p-10">
        <div className="max-w-xl">
          <h2 className="text-2xl font-black tracking-[-0.04em] text-ink sm:text-3xl">Ready to open your shop?</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Send your application today and track it with the code we email you.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="primary-button" to={appPaths.apply}>Apply to sell <ArrowRight size={15} /></Link>
          <Link className="secondary-button" to={appPaths.login}>Sign in</Link>
        </div>
      </div>
    </section>
  )
}

export function PublicFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="page-container flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Brand to={appPaths.home} />
          <p className="mt-3 max-w-sm text-[11px] leading-5 text-muted">
            The SOVA seller portal: apply for a shop, then manage your catalogue and stock in one place.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-bold text-muted">
          <Link className="transition hover:text-ink" to={appPaths.apply}>Apply</Link>
          <Link className="transition hover:text-ink" to={appPaths.apply}>Track application</Link>
          <Link className="transition hover:text-ink" to={appPaths.login}>Sign in</Link>
          <a className="transition hover:text-ink" href={env.storefrontUrl} rel="noreferrer">Buyer storefront</a>
        </nav>
      </div>
      <div className="page-container border-t border-line py-4 text-[10px] text-muted">
        © {new Date().getFullYear()} SOVA. All rights reserved.
      </div>
    </footer>
  )
}
