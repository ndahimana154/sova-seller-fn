import { Link } from 'react-router-dom'
import { Brand } from '../ui/Brand'
import { appPaths } from '../../router/paths'

const links = [
  { href: '#why', label: 'Why SOVA' },
  { href: '#how', label: 'How it works' },
  { href: '#requirements', label: 'What you need' },
  { href: '#faq', label: 'FAQ' },
]

interface PublicHeaderProps {
  dashboardHref?: string
}

export function PublicHeader({ dashboardHref }: PublicHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/90 backdrop-blur">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8 flex h-16 items-center gap-4">
        <Brand to={appPaths.home} />
        <nav aria-label="Seller portal" className="ml-6 hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <a className="rounded-full px-3 py-2 text-xs font-bold text-muted transition hover:bg-soft hover:text-ink" href={link.href} key={link.href}>{link.label}</a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {dashboardHref ? (
            <Link className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-3 py-2 text-[11px] font-bold text-white transition hover:bg-primary-dark sm:px-4 sm:text-xs" to={dashboardHref}>Go to dashboard</Link>
          ) : (
            <>
              <Link className="whitespace-nowrap rounded-full px-2 py-2 text-[11px] font-bold text-ink transition hover:bg-soft sm:px-3 sm:text-xs hidden sm:inline-flex" to={appPaths.apply}>Track application</Link>
              <Link className="whitespace-nowrap rounded-full px-2 py-2 text-[11px] font-bold text-ink transition hover:bg-soft sm:px-3 sm:text-xs" to={appPaths.login}>Sign in</Link>
              <Link className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-3 py-2 text-[11px] font-bold text-white transition hover:bg-primary-dark sm:px-4 sm:text-xs" to={appPaths.apply}>Apply to sell</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
