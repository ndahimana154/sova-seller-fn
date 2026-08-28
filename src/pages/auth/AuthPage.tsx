import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { CodeSignInForm } from '../../components/auth/CodeSignInForm'
import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm'
import { PasswordSignInForm } from '../../components/auth/PasswordSignInForm'
import { appPaths } from '../../router/paths'
import { ui } from '../../components/ui/styles'

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
    <AuthLayout
      aside={{
        eyebrow: 'Seller workspace',
        headline: 'Your catalogue, orders, and shop profile in one place.',
      }}
      brandTo={appPaths.home}
      eyebrow={text.eyebrow}
      footer={
        <p className="mt-6 text-xs text-muted">
          No shop yet?{' '}
          <Link className={ui.inlineLink} to={appPaths.apply}>
            Apply to sell on SOVA
          </Link>
        </p>
      }
      lead={text.lead}
      title={text.title}
    >
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
    </AuthLayout>
  )
}
