import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { env } from '../../config/env'
import { appPaths } from '../../router/paths'
import { Brand, Button } from '../ui'

export function HomeCallToAction() {
  return (
    <section className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8 py-12 sm:py-18">
      <div className="rounded-panel bg-ink p-8 text-white sm:p-12">
        <div className="flex flex-wrap items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-2xl font-black tracking-[-0.04em] sm:text-3xl">Ready to open your shop?</h2>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Send your application today and track it with the code we email you.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" to={appPaths.apply} variant="invert">Apply to sell <ArrowRight size={15} /></Button>
            <Button size="lg" to={appPaths.login} variant="invert-outline">Sign in</Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export function PublicFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8 flex flex-col gap-8 py-10 sm:flex-row sm:items-center sm:justify-between">
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
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8 border-t border-line py-5 text-[10px] text-muted">
        © {new Date().getFullYear()} SOVA. All rights reserved.
      </div>
    </footer>
  )
}
