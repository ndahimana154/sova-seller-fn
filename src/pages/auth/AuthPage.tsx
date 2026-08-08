import { ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CodeSignInForm } from '../../components/auth/CodeSignInForm'
import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm'
import { PasswordSignInForm } from '../../components/auth/PasswordSignInForm'
import { Brand } from '../../components/ui/Brand'
import { appPaths } from '../../router/paths'

interface AuthPageProps {
  onOtpSignIn: (email: string, otp: string) => Promise<void>
  onPasswordSignIn: (email: string, password: string) => Promise<void>
}

type Mode = 'password' | 'code' | 'reset'

const copy: Record<Mode, { eyebrow: string; title: string; lead: string }> = {
  password: {
    eyebrow: 'Seller access',
    title: 'Sign in to your shop',
    lead: 'Use the email and password tied to your approved SOVA shop.',
  },
  code: {
    eyebrow: 'One-time code',
    title: 'Sign in with a code',
    lead: 'We email a six-digit code that signs you in without a password.',
  },
  reset: {
    eyebrow: 'Password reset',
    title: 'Reset your password',
    lead: 'We email a six-digit code, then you choose a new password.',
  },
}

export function AuthPage({ onOtpSignIn, onPasswordSignIn }: AuthPageProps) {
  const [mode, setMode] = useState<Mode>('password')
  const [notice, setNotice] = useState('')
  const text = copy[mode]

  function switchTo(next: Mode) {
    setNotice('')
    setMode(next)
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-form-panel">
          <div className="auth-form-wrap">
            <Brand to={appPaths.home} />
            <div className="mt-5">
              <p className="auth-eyebrow">{text.eyebrow}</p>
              <h1 className="mt-1.5 text-[1.7rem] font-black tracking-[-0.045em] text-ink sm:text-[1.95rem]">{text.title}</h1>
              <p className="mt-1.5 max-w-md text-xs leading-5 text-muted">{text.lead}</p>
            </div>

            {mode === 'password' && (
              <PasswordSignInForm
                notice={notice}
                onForgotPassword={() => switchTo('reset')}
                onSignIn={onPasswordSignIn}
                onUseCode={() => switchTo('code')}
              />
            )}
            {mode === 'code' && <CodeSignInForm onSignIn={onOtpSignIn} onUsePassword={() => switchTo('password')} />}
            {mode === 'reset' && (
              <ForgotPasswordForm
                onCancel={() => switchTo('password')}
                onDone={(message) => { setNotice(message); setMode('password') }}
              />
            )}

            <p className="mt-6 text-xs text-muted">
              No shop yet? <Link className="font-bold text-primary-dark hover:underline" to={appPaths.apply}>Apply to sell on SOVA</Link>
            </p>
          </div>
        </div>
        <aside className="auth-visual">
          <div className="auth-visual-shade" />
          <div className="auth-visual-copy">
            <span className="grid size-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur"><ShieldCheck size={21} /></span>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/75">Seller workspace</p>
            <h2 className="mt-3 max-w-md text-3xl font-black leading-tight tracking-[-0.04em] text-white">Your catalogue, orders, and shop profile in one place.</h2>
          </div>
        </aside>
      </section>
    </main>
  )
}
