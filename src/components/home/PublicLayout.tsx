import type { ReactNode } from 'react'
import { PublicFooter } from './PublicFooter'
import { PublicHeader } from './PublicHeader'

export function PublicLayout({ children, dashboardHref }: { children: ReactNode; dashboardHref?: string }) {
  return (
    <div className="min-h-dvh bg-white text-ink">
      <PublicHeader dashboardHref={dashboardHref} />
      {children}
      <PublicFooter />
    </div>
  )
}
