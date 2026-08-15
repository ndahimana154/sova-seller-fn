import { Eye, EyeOff } from 'lucide-react'
import { useState, type ReactNode } from 'react'

export function AuthField({ children, icon, label }: { children: ReactNode; icon: ReactNode; label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold text-ink">{label}</span>
      <span className="flex min-h-10 items-center gap-3 rounded-xl border border-line bg-white px-3.5 transition focus-within:border-ink focus-within:ring-4 focus-within:ring-ink/10 [&_input]:min-w-0 [&_input]:flex-1 [&_input]:bg-transparent [&_input]:py-2.5 [&_input]:text-xs [&_input]:text-ink [&_input]:outline-none [&_input]:placeholder:text-muted/65">
        <span className="text-muted">{icon}</span>
        {children}
      </span>
    </label>
  )
}

interface PasswordFieldProps {
  autoComplete?: string
  autoFocus?: boolean
  icon: ReactNode
  label: string
  name: string
  onChange?: (value: string) => void
  placeholder?: string
  value?: string
}

export function PasswordField({ autoComplete = 'current-password', autoFocus, icon, label, name, onChange, placeholder = '••••••••', value }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold text-ink">{label}</span>
      <span className="flex min-h-10 items-center gap-3 rounded-xl border border-line bg-white px-3.5 transition focus-within:border-ink focus-within:ring-4 focus-within:ring-ink/10 [&_input]:min-w-0 [&_input]:flex-1 [&_input]:bg-transparent [&_input]:py-2.5 [&_input]:text-xs [&_input]:text-ink [&_input]:outline-none [&_input]:placeholder:text-muted/65">
        <span className="text-muted">{icon}</span>
        <input
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          name={name}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          placeholder={placeholder}
          required
          type={visible ? 'text' : 'password'}
          value={value}
        />
        <button
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="-mr-2 grid size-9 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-soft hover:text-ink"
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </span>
    </label>
  )
}

export function AuthError({ message }: { message: string }) {
  if (!message) return null
  return <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700" role="alert">{message}</p>
}

export function AuthNotice({ message }: { message: string }) {
  if (!message) return null
  return <p className="rounded-xl border border-line bg-soft px-4 py-3 text-xs font-semibold text-ink">{message}</p>
}
