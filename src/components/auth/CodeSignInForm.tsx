import { Mail } from 'lucide-react'
import { useCallback, useRef, useState, type FormEvent } from 'react'
import { normalizeApiError } from '../../api/errors'
import { requestLoginOtp } from '../../lib/sellerAuth'
import { OtpInput } from '../ui/OtpInput'
import { AuthError, AuthField } from './AuthField'
import { ui } from '../ui/styles'

const OTP_LENGTH = 6

interface CodeSignInFormProps {
  onSignIn: (email: string, otp: string) => Promise<void>
  onUsePassword: () => void
}

export function CodeSignInForm({ onSignIn, onUsePassword }: CodeSignInFormProps) {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [sent, setSent] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const verifying = useRef(false)

  const verify = useCallback(async (code: string) => {
    if (verifying.current || code.length !== OTP_LENGTH) return
    verifying.current = true
    setError('')
    setSubmitting(true)
    try {
      await onSignIn(email, code)
    } catch (cause) {
      setError(normalizeApiError(cause).message)
    } finally {
      verifying.current = false
      setSubmitting(false)
    }
  }, [email, onSignIn])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sent) { await verify(otp); return }
    const nextEmail = String(new FormData(event.currentTarget).get('email') ?? '').trim().toLowerCase()
    setError('')
    setSubmitting(true)
    try {
      const challenge = await requestLoginOtp(nextEmail)
      setEmail(nextEmail)
      setMessage(challenge.message)
      setOtp('')
      setSent(true)
    } catch (cause) {
      setError(normalizeApiError(cause).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="mt-5 space-y-4" onSubmit={submit}>
      {!sent ? (
        <AuthField icon={<Mail size={17} />} label="Email address">
          <input autoComplete="email" name="email" placeholder="you@example.com" required type="email" />
        </AuthField>
      ) : (
        <>
          <p className="rounded-xl bg-soft px-4 py-3 text-xs text-muted">{message} Signing in as <strong className="text-ink">{email}</strong></p>
          <OtpInput
            autoFocus
            disabled={submitting}
            invalid={Boolean(error)}
            label=""
            length={OTP_LENGTH}
            onChange={(value) => { setOtp(value); setError('') }}
            onComplete={(value) => void verify(value)}
            value={otp}
          />
          <button
            className={ui.inlineLink}
            onClick={() => { setSent(false); setOtp(''); setError(''); setMessage('') }}
            type="button"
          >
            Use a different email
          </button>
        </>
      )}
      <AuthError message={error} />
      <button className={ui.authSubmit} disabled={submitting || (sent && otp.length < OTP_LENGTH)} type="submit">
        {submitting ? 'Please wait…' : sent ? 'Verify and sign in' : 'Email me a code'}
      </button>
      <button className="text-xs font-bold text-muted transition hover:text-ink hover:underline w-full" onClick={onUsePassword} type="button">
        Sign in with a password instead
      </button>
    </form>
  )
}
