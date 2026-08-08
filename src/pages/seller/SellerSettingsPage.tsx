import { KeyRound, MailCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Feedback, FormSection, PageTitle, errorMessage } from '../../components/seller/products/ProductPageUi'
import { getSellerSettings, updateSellerSettings, type SellerSettings } from '../../lib/sellerAuth'
import { appPaths } from '../../router/paths'

export function SellerSettingsPage() {
  const [settings, setSettings] = useState<SellerSettings | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getSellerSettings().then(setSettings).catch((cause) => setError(errorMessage(cause)))
  }, [])

  async function toggleOtpLogin(enabled: boolean) {
    setError('')
    setNotice('')
    setSaving(true)
    try {
      setSettings(await updateSellerSettings({ otpLoginEnabled: enabled }))
      setNotice(enabled ? 'Code sign-in is on for your account.' : 'Code sign-in is off. Use your password to sign in.')
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5 p-5">
      <PageTitle title="Account settings" subtitle="Control how you sign in to the seller portal." />
      <Feedback error={error} notice={notice} />

      <FormSection subtitle="Your password is the primary way in." title="Sign-in methods">
        <div className="space-y-3">
          <label className="flex items-start gap-3 rounded-xl border border-line p-4">
            <input
              checked={settings?.otpLoginEnabled ?? false}
              className="auth-checkbox mt-0.5"
              disabled={!settings || saving}
              onChange={(event) => void toggleOtpLogin(event.target.checked)}
              type="checkbox"
            />
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-xs font-bold text-ink"><MailCheck size={14} /> One-time code sign-in</span>
              <span className="mt-1 block text-[11px] leading-5 text-muted">
                Lets you sign in with a six-digit code emailed to you, without typing your password.
                Turn it off if you only ever want the password to work.
              </span>
            </span>
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-4">
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-xs font-bold text-ink"><KeyRound size={14} /> Password</span>
              <span className="mt-1 block text-[11px] text-muted">
                {settings?.hasPassword ? 'A password is set for this account.' : 'No password is set yet.'}
              </span>
            </span>
            <Link className="seller-outline-button" to={appPaths.changePassword}>Change password</Link>
          </div>
        </div>
      </FormSection>
    </div>
  )
}
