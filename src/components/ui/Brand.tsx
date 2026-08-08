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
      <span className="brand-mark"><i /><i /></span>
      {!compact && <span className={`text-xl font-black tracking-[-0.05em] ${light ? 'text-white' : 'text-ink'}`}>SOVA</span>}
    </Link>
  )
}
