import { KeyRound, Mail } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { normalizeApiError } from '../../api/errors'
import { AuthError, AuthField, AuthNotice, PasswordField } from './AuthField'

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
        <button className="text-xs font-bold text-ink underline-offset-2 hover:underline" onClick={onUseCode} type="button">Sign in with a code instead</button>
        <button className="text-xs font-bold text-muted transition hover:text-ink hover:underline" onClick={onForgotPassword} type="button">Forgot password?</button>
      </div>
      <AuthError message={error} />
      <button className="flex min-h-10 w-full items-center justify-center rounded-xl bg-primary px-5 text-xs font-black text-white shadow-[0_10px_24px_rgb(23_26_31/0.18)] transition hover:-translate-y-0.5 hover:bg-primary-dark disabled:pointer-events-none disabled:opacity-65" disabled={submitting} type="submit">
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
