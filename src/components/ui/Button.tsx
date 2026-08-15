import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'accent' | 'danger' | 'invert' | 'invert-outline'
export type ButtonSize = 'sm' | 'md' | 'lg'

const BASE = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold transition disabled:pointer-events-none disabled:opacity-60'

const SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-8 px-3 text-[11px]',
  md: 'min-h-9 px-4 text-xs',
  lg: 'min-h-11 px-6 text-sm',
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white shadow-[0_8px_20px_rgb(23_26_31/0.18)] hover:bg-primary-dark',
  outline: 'border border-line bg-white text-ink hover:border-ink/30 hover:bg-soft',
  ghost: 'text-muted hover:bg-soft hover:text-ink',
  accent: 'bg-accent text-white hover:bg-accent-dark',
  danger: 'border border-red-200 bg-white text-red-600 hover:bg-red-50',
  invert: 'bg-white text-ink hover:bg-white/90',
  'invert-outline': 'border border-white/25 text-white hover:bg-white/10',
}

interface ButtonStyle {
  block?: boolean
  className?: string
  size?: ButtonSize
  variant?: ButtonVariant
}

type ButtonProps = ButtonStyle &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
    children: ReactNode
    href?: string
    to?: string
  }

export function buttonClass({ block, className, size = 'md', variant = 'primary' }: ButtonStyle = {}) {
  return [BASE, SIZES[size], VARIANTS[variant], block && 'w-full', className].filter(Boolean).join(' ')
}

export function Button({ block, children, className, href, size, to, variant, ...rest }: ButtonProps) {
  const classes = buttonClass({ block, className, size, variant })
  if (to) return <Link className={classes} to={to}>{children}</Link>
  if (href) return <a className={classes} href={href} rel="noreferrer">{children}</a>
  return <button className={classes} type="button" {...rest}>{children}</button>
}
