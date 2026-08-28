import { Link } from "react-router-dom";
import { appPaths } from "../../router/paths";

interface BrandProps {
  compact?: boolean
  light?: boolean
  to?: string
}

export function Brand({ compact = false, light = false, to = appPaths.dashboard }: BrandProps) {
  return (
    <Link className="flex items-center gap-2"
      to={to} aria-label="SOVA home">
      <span className="relative block size-8 overflow-hidden rounded-lg bg-accent">
        <i className="absolute -right-2 top-1/2 size-6 -translate-y-1/2 rounded-full bg-white" />
        <i className="absolute right-0 top-1/2 size-2.5 -translate-y-1/2 rounded-l-full bg-accent" />
      </span>
      {!compact && <span className={`text-xl font-black tracking-[-0.05em] ${light ? 'text-white' : 'text-ink'}`}>SOVA</span>}
    </Link>
  )
}
