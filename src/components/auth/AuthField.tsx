import { Eye, EyeOff } from 'lucide-react'
import { useState, type ReactNode } from 'react'

export function AuthField({ children, icon, label }: { children: ReactNode; icon: ReactNode; label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold text-ink">{label}</span>
      <span className="auth-input">
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
      <span className="auth-input">
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
          className="auth-password-toggle"
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
  return <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700" role="alert">{message}</p>
}

export function AuthNotice({ message }: { message: string }) {
  if (!message) return null
  return <p className="rounded-xl bg-primary-light px-4 py-3 text-xs font-semibold text-primary-dark">{message}</p>
}
