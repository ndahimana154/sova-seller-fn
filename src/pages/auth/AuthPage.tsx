import { Check, Mail } from 'lucide-react'
import { useCallback, useRef, useState, type FormEvent } from 'react'
import { normalizeApiError } from '../../api/errors'
import { Brand } from '../../components/ui/Brand'
import { OtpInput } from '../../components/ui/OtpInput'
import { requestLoginOtp } from '../../lib/clientAuth'

interface AuthPageProps {
  onAuthenticate: (email: string, otp: string) => Promise<void>
}

const OTP_LENGTH = 6

export function AuthPage({ onAuthenticate }: AuthPageProps) {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const verifying = useRef(false)

  const verify = useCallback(async (code: string) => {
    // A ref, not `submitting`: auto-submit fires before a state update applies.
    if (verifying.current || code.length !== OTP_LENGTH) return
    verifying.current = true
    setError('')
    setSubmitting(true)
    try {
      await onAuthenticate(email, code)
    } catch (cause) {
      setError(normalizeApiError(cause).message)
    } finally {
      verifying.current = false
      setSubmitting(false)
    }
  }, [email, onAuthenticate])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (step === 'otp') { await verify(otp); return }
    const nextEmail = String(new FormData(event.currentTarget).get('email') ?? '').trim().toLowerCase()
    setError('')
    setSubmitting(true)
    try {
      const challenge = await requestLoginOtp(nextEmail)
      setEmail(nextEmail)
      setMessage(challenge.message)
      setOtp('')
      setStep('otp')
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
            <Brand />
            <div className="mt-5">
              <p className="auth-eyebrow">Passwordless access</p>
              <h1 className="mt-1.5 text-[1.7rem] font-black tracking-[-0.045em] text-ink sm:text-[1.95rem]">Sign in to SOVA</h1>
              <p className="mt-1.5 max-w-md text-xs leading-5 text-muted">
                {step === 'email' ? 'Enter your email. No password required.' : message}
              </p>
            </div>
            <form className="mt-5 space-y-4" onSubmit={submit}>
              {step === 'email' ? (
                <AuthField icon={<Mail size={17} />} label="Email address">
                  <input autoComplete="email" name="email" placeholder="you@example.com" required type="email" />
                </AuthField>
              ) : (
                <>
                  <p className="rounded-xl bg-soft px-4 py-3 text-xs text-muted">Signing in as <strong className="text-ink">{email}</strong></p>
                  <OtpInput
                    autoFocus
                    disabled={submitting}
                    invalid={Boolean(error)}
                    label={``}
                    length={OTP_LENGTH}
                    onChange={(value) => { setOtp(value); setError('') }}
                    onComplete={(value) => void verify(value)}
                    value={otp}
                  />
                  <button className="text-xs font-bold text-primary-dark hover:underline" onClick={() => { setStep('email'); setOtp(''); setError(''); setMessage('') }} type="button">Use a different email</button>
                </>
              )}
              {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700" role="alert">{error}</p>}
              <button className="auth-submit" disabled={submitting || (step === 'otp' && otp.length < OTP_LENGTH)} type="submit">
                {submitting ? 'Please wait…' : step === 'email' ? 'Continue with email' : 'Verify and sign in'}
              </button>
            </form>
          </div>
        </div>
        <aside className="auth-visual"><div className="auth-visual-shade" /><div className="auth-visual-copy"><span className="grid size-11 place-items-center rounded-full bg-white/15 backdrop-blur"><Check size={21} /></span><p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/75">Secure passwordless access</p><h2 className="mt-3 max-w-md text-3xl font-black leading-tight tracking-[-0.04em] text-white">One email. One short code. You’re in.</h2></div></aside>
      </section>
    </main>
  )
}

function AuthField({ children, icon, label }: { children: React.ReactNode; icon: React.ReactNode; label: string }) {
  return <label className="block"><span className="mb-1.5 block text-[11px] font-bold text-ink">{label}</span><span className="auth-input"><span className="text-muted">{icon}</span>{children}</span></label>
}
