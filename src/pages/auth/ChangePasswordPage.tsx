import { KeyRound, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { normalizeApiError } from '../../api/errors'
import { AuthError, PasswordField } from '../../components/auth/AuthField'
import { Brand } from '../../components/ui/Brand'
import { changePassword, type ClientSession } from '../../lib/sellerAuth'
import { appPaths } from '../../router/paths'

interface ChangePasswordPageProps {
  email: string
  forced: boolean
  onChanged: (session: ClientSession) => void
}

export function ChangePasswordPage({ email, forced, onChanged }: ChangePasswordPageProps) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const newPassword = String(form.get('newPassword') ?? '')
    if (newPassword !== String(form.get('confirmPassword') ?? '')) {
      setError('The two passwords do not match')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      onChanged(await changePassword({
        currentPassword: String(form.get('currentPassword') ?? ''),
        newPassword,
      }))
    } catch (cause) {
      setError(normalizeApiError(cause).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-form-panel">
          <div className="auth-form-wrap">
            <Brand to={forced ? appPaths.changePassword : appPaths.dashboard} />
            <div className="mt-5">
              <p className="auth-eyebrow">Account security</p>
              <h1 className="mt-1.5 text-[1.7rem] font-black tracking-[-0.045em] text-ink sm:text-[1.95rem]">
                {forced ? 'Choose your password' : 'Change your password'}
              </h1>
              <p className="mt-1.5 max-w-md text-xs leading-5 text-muted">
                {forced
                  ? 'Your shop was approved with a temporary password. Pick your own before you continue.'
                  : 'Pick a new password for your seller account.'}
              </p>
              <p className="mt-3 rounded-xl bg-soft px-4 py-3 text-xs text-muted">Signed in as <strong className="text-ink">{email}</strong></p>
            </div>
            <form className="mt-5 space-y-4" onSubmit={submit}>
              <PasswordField autoFocus icon={<KeyRound size={17} />} label={forced ? 'Temporary password' : 'Current password'} name="currentPassword" />
              <PasswordField autoComplete="new-password" icon={<KeyRound size={17} />} label="New password" name="newPassword" />
              <PasswordField autoComplete="new-password" icon={<KeyRound size={17} />} label="Confirm new password" name="confirmPassword" />
              <p className="text-[11px] text-muted">Use at least 8 characters.</p>
              <AuthError message={error} />
              <button className="auth-submit" disabled={submitting} type="submit">
                {submitting ? 'Saving…' : 'Save password'}
              </button>
            </form>
          </div>
        </div>
        <aside className="auth-visual">
          <div className="auth-visual-shade" />
          <div className="auth-visual-copy">
            <span className="grid size-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur"><ShieldCheck size={21} /></span>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/75">One last step</p>
            <h2 className="mt-3 max-w-md text-3xl font-black leading-tight tracking-[-0.04em] text-white">A password only you know keeps your shop yours.</h2>
          </div>
        </aside>
      </section>
    </main>
  )
}
