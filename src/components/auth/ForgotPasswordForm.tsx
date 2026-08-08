import { KeyRound, Mail } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { normalizeApiError } from '../../api/errors'
import { requestPasswordReset, resetPassword, verifyPasswordResetOtp } from '../../lib/sellerAuth'
import { OtpInput } from '../ui/OtpInput'
import { AuthError, AuthField, PasswordField } from './AuthField'

const OTP_LENGTH = 6

interface ForgotPasswordFormProps {
  onCancel: () => void
  onDone: (message: string) => void
}

export function ForgotPasswordForm({ onCancel, onDone }: ForgotPasswordFormProps) {
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [token, setToken] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setError('')
    setSubmitting(true)
    try {
      if (step === 'email') {
        const nextEmail = String(form.get('email') ?? '').trim().toLowerCase()
        const challenge = await requestPasswordReset(nextEmail)
        setEmail(nextEmail)
        setMessage(challenge.message)
        setStep('code')
        return
      }
      if (step === 'code') {
        setToken(await verifyPasswordResetOtp(email, otp))
        setStep('password')
        return
      }
      const newPassword = String(form.get('newPassword') ?? '')
      if (newPassword !== String(form.get('confirmPassword') ?? '')) {
        setError('The two passwords do not match')
        return
      }
      await resetPassword({ email, newPassword, token })
      onDone('Password updated. Sign in with your new password.')
    } catch (cause) {
      setError(normalizeApiError(cause).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="mt-5 space-y-4" onSubmit={submit}>
      {step === 'email' && (
        <AuthField icon={<Mail size={17} />} label="Email address">
          <input autoComplete="email" name="email" placeholder="you@example.com" required type="email" />
        </AuthField>
      )}
      {step === 'code' && (
        <>
          <p className="rounded-xl bg-soft px-4 py-3 text-xs text-muted">{message}</p>
          <OtpInput
            autoFocus
            disabled={submitting}
            invalid={Boolean(error)}
            label=""
            length={OTP_LENGTH}
            onChange={(value) => { setOtp(value); setError('') }}
            value={otp}
          />
        </>
      )}
      {step === 'password' && (
        <>
          <PasswordField autoComplete="new-password" autoFocus icon={<KeyRound size={17} />} label="New password" name="newPassword" />
          <PasswordField autoComplete="new-password" icon={<KeyRound size={17} />} label="Confirm new password" name="confirmPassword" />
          <p className="text-[11px] text-muted">Use at least 8 characters.</p>
        </>
      )}
      <AuthError message={error} />
      <button className="auth-submit" disabled={submitting || (step === 'code' && otp.length < OTP_LENGTH)} type="submit">
        {submitting ? 'Please wait…' : step === 'email' ? 'Email me a reset code' : step === 'code' ? 'Verify code' : 'Set new password'}
      </button>
      <button className="w-full text-xs font-bold text-muted hover:text-ink hover:underline" onClick={onCancel} type="button">
        Back to sign in
      </button>
    </form>
  )
}
