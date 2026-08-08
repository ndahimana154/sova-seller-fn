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
      <div className="page-container flex h-16 items-center gap-4">
        <Brand to={appPaths.home} />
        <nav aria-label="Seller portal" className="ml-6 hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <a className="rounded-full px-3 py-2 text-xs font-bold text-muted transition hover:bg-soft hover:text-ink" href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {dashboardHref ? (
            <Link className="header-signup-link" to={dashboardHref}>Go to dashboard</Link>
          ) : (
            <>
              <Link className="header-login-link hidden sm:inline-flex" to={appPaths.apply}>Track application</Link>
              <Link className="header-login-link" to={appPaths.login}>Sign in</Link>
              <Link className="header-signup-link" to={appPaths.apply}>Apply to sell</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
