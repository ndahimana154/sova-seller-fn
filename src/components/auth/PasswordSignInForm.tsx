import { KeyRound, Mail } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { normalizeApiError } from '../../api/errors'
import { AuthError, AuthField, AuthNotice, PasswordField } from './AuthField'
import { ui } from '../ui/styles'

interface PasswordSignInFormProps {
  notice: string
  onForgotPassword: () => void
  onSignIn: (email: string, password: string) => Promise<void>
  onUseCode: () => void
}

export function PasswordSignInForm({ notice, onForgotPassword, onSignIn, onUseCode }: PasswordSignInFormProps) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '').trim().toLowerCase()
    const password = String(form.get('password') ?? '')
    setError('')
    setSubmitting(true)
    try {
      await onSignIn(email, password)
    } catch (cause) {
      setError(normalizeApiError(cause).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="mt-5 space-y-4" onSubmit={submit}>
      <AuthNotice message={notice} />
      <AuthField icon={<Mail size={17} />} label="Email address">
        <input autoComplete="email" name="email" placeholder="you@example.com" required type="email" />
      </AuthField>
      <PasswordField icon={<KeyRound size={17} />} label="Password" name="password" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button className={ui.inlineLink} onClick={onUseCode} type="button">Sign in with a code instead</button>
        <button className="text-xs font-bold text-muted transition hover:text-ink hover:underline" onClick={onForgotPassword} type="button">Forgot password?</button>
      </div>
      <AuthError message={error} />
      <button className={ui.authSubmit} disabled={submitting} type="submit">
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
