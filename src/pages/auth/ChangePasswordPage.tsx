import { KeyRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { normalizeApiError } from '../../api/errors'
import { AuthError, PasswordField } from '../../components/auth/AuthField'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { ui } from '../../components/ui/styles'
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
    <AuthLayout
      aside={{ eyebrow: 'One last step', headline: 'A password only you know keeps your shop yours.' }}
      brandTo={forced ? appPaths.changePassword : appPaths.dashboard}
      eyebrow="Account security"
      lead={
        <>
          <p>
            {forced
              ? 'Your shop was approved with a temporary password. Pick your own before you continue.'
              : 'Pick a new password for your seller account.'}
          </p>
          <p className="mt-4 rounded-xl bg-soft px-4 py-3 text-xs text-muted">
            Signed in as <strong className="text-ink">{email}</strong>
          </p>
        </>
      }
      title={forced ? 'Choose your password' : 'Change your password'}
    >
      <form className="mt-5 space-y-4" onSubmit={submit}>
        <PasswordField autoFocus icon={<KeyRound size={17} />} label={forced ? 'Temporary password' : 'Current password'} name="currentPassword" />
        <PasswordField autoComplete="new-password" icon={<KeyRound size={17} />} label="New password" name="newPassword" />
        <PasswordField autoComplete="new-password" icon={<KeyRound size={17} />} label="Confirm new password" name="confirmPassword" />
        <p className="text-[11px] leading-5 text-muted">Use at least 8 characters.</p>
        <AuthError message={error} />
        <button className={ui.authSubmit} disabled={submitting} type="submit">
          {submitting ? 'Saving…' : 'Save password'}
        </button>
      </form>
    </AuthLayout>
  )
}
