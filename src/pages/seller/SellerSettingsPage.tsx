import { KeyRound, MailCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PageTitle } from '../../components/seller/products/ProductPageUi'
import { useToast } from '../../hooks/useToast'
import { Button, Card, CardHeader, Toggle } from '../../components/ui'
import { getSellerSettings, updateSellerSettings, type SellerSettings } from '../../lib/sellerAuth'
import { appPaths } from '../../router/paths'

export function SellerSettingsPage() {
  const [settings, setSettings] = useState<SellerSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    getSellerSettings().then(setSettings).catch((cause) => toast.error(cause))
  }, [toast])

  async function toggleOtpLogin(enabled: boolean) {
    setSaving(true)
    try {
      setSettings(await updateSellerSettings({ otpLoginEnabled: enabled }))
      toast.success(enabled ? 'Code sign-in is on for your account.' : 'Code sign-in is off. Use your password to sign in.')
    } catch (cause) {
      toast.error(cause)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5 p-5 sm:p-6">
      <PageTitle title="Account settings" subtitle="Control how you sign in to the seller portal." />

      <Card tone="raised">
        <CardHeader subtitle="Your password is the primary way in." title="Sign-in methods" />
        <div className="[&>*+*]:mt-3">
          <Toggle
            checked={settings?.otpLoginEnabled ?? false}
            description="Lets you sign in with a six-digit code emailed to you, without typing your password. Turn it off if you only ever want the password to work."
            disabled={!settings || saving}
            label={<><MailCheck size={14} /> One-time code sign-in</>}
            onChange={(enabled) => void toggleOtpLogin(enabled)}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-4">
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-xs font-bold text-ink"><KeyRound size={14} /> Password</span>
              <span className="mt-1 block text-[11px] leading-5 text-muted">
                {settings?.hasPassword ? 'A password is set for this account.' : 'No password is set yet.'}
              </span>
            </span>
            <Button to={appPaths.changePassword} variant="outline">Change password</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
