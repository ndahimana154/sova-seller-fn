import type { ReactNode } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Brand } from '../ui/Brand'
import { ui } from '../ui/styles'

interface AuthLayoutProps {
  aside: { eyebrow: string; headline: string }
  brandTo: string
  children: ReactNode
  eyebrow: string
  footer?: ReactNode
  lead: ReactNode
  title: string
}

const page = [
  'relative grid h-dvh place-items-center overflow-hidden bg-canvas px-4 py-3 sm:px-8 sm:py-5',
  "before:pointer-events-none before:absolute before:-left-32 before:-top-32 before:size-96 before:rounded-full before:bg-ink/5 before:blur-3xl before:content-['']",
  "after:pointer-events-none after:absolute after:-bottom-40 after:-right-24 after:size-[30rem] after:rounded-full after:bg-white/70 after:blur-3xl after:content-['']",
].join(' ')

const shell = [
  'relative z-10 grid max-h-full w-full max-w-[1120px] overflow-hidden rounded-panel border border-line bg-white',
  'shadow-[0_30px_90px_rgb(23_26_31/0.14)]',
  'lg:h-[min(610px,calc(100dvh_-_2.5rem))] lg:grid-cols-[minmax(0,0.94fr)_minmax(420px,1.06fr)]',
].join(' ')

const visual = [
  'relative hidden h-full min-h-0 overflow-hidden bg-ink lg:block',
  "bg-[url('/images/storefront-hero.png')] bg-position-[68%_center] bg-cover",
].join(' ')

/** The split sign-in shell shared by every screen outside the seller portal. */
export function AuthLayout({ aside, brandTo, children, eyebrow, footer, lead, title }: AuthLayoutProps) {
  return (
    <main className={page}>
      <section className={shell}>
        <div className="flex min-h-0 items-center overflow-hidden bg-white px-6 py-6 sm:px-10 lg:h-full lg:px-14">
          <div className="mx-auto w-full max-w-[430px]">
            <Brand to={brandTo} />
            <div className="mt-5">
              <p className={ui.eyebrow}>{eyebrow}</p>
              <h1 className="mt-1.5 text-[1.7rem] font-black tracking-[-0.045em] text-ink sm:text-[1.95rem]">{title}</h1>
              <div className="mt-2 max-w-md text-xs leading-5 text-muted">{lead}</div>
            </div>
            {children}
            {footer}
          </div>
        </div>
        <aside className={visual}>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/45 to-ink/10" />
          <div className="absolute bottom-0 left-0 right-0 p-12">
            <span className="grid size-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur">
              <ShieldCheck size={21} />
            </span>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/75">{aside.eyebrow}</p>
            <h2 className="mt-3 max-w-md text-3xl font-black leading-tight tracking-[-0.04em] text-white">
              {aside.headline}
            </h2>
          </div>
        </aside>
      </section>
    </main>
  )
}
