import { MailCheck } from 'lucide-react'
import { useState } from 'react'
import { Button, Modal, ModalFooter, OtpInput } from '../../ui'

interface TrackingOtpModalProps {
  applicationCode: string
  busy: boolean
  email: string
  error: string
  onClose: () => void
  onResend: () => void
  onVerify: (otp: string) => void
  resending: boolean
}

export function TrackingOtpModal({
  applicationCode,
  busy,
  email,
  error,
  onClose,
  onResend,
  onVerify,
  resending,
}: TrackingOtpModalProps) {
  const [otp, setOtp] = useState('')

  return (
    <Modal onClose={onClose} subtitle={applicationCode} title="Confirm it is you">
      <div className="space-y-4">
        <div className="flex items-start gap-2.5 rounded-xl bg-primary-light px-3.5 py-3">
          <MailCheck className="mt-px shrink-0 text-primary-dark" size={15} />
          <p className="text-[11px] leading-5 text-primary-dark">
            We sent a code to <strong>{email}</strong>. Enter it to see this application.
          </p>
        </div>

        <OtpInput
          autoFocus
          disabled={busy}
          invalid={Boolean(error)}
          label="Verification code"
          onChange={(value) => setOtp(value)}
          onComplete={(value) => onVerify(value)}
          value={otp}
        />

        {error && (
          <p className="text-[11px] font-bold text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          className="text-[11px] font-bold text-ink underline-offset-2 hover:underline disabled:opacity-50"
          disabled={resending || busy}
          onClick={onResend}
          type="button"
        >
          {resending ? 'Sending a new code…' : 'Send a new code'}
        </button>
      </div>

      <ModalFooter>
        <Button onClick={onClose} type="button" variant="ghost">Cancel</Button>
        <Button disabled={otp.length < 6 || busy} onClick={() => onVerify(otp)}>
          {busy ? 'Checking…' : 'View application'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
