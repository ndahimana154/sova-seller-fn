import { Check, Copy, Mail, MapPin, Phone, Store } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button, Modal, ModalFooter } from '../../ui'
import type { ApplicationRecord } from './types'

interface ApplicationSubmittedModalProps {
  application: ApplicationRecord
  onClose: () => void
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2.5 py-2">
      <span className="mt-0.5 shrink-0 text-muted">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-faint">{label}</p>
        <p className="mt-0.5 break-words text-xs font-bold text-ink">{value}</p>
      </div>
    </div>
  )
}

export function ApplicationSubmittedModal({ application, onClose }: ApplicationSubmittedModalProps) {
  const [copied, setCopied] = useState(false)
  const shop = application.shop
  const code = application.applicationCode

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Modal onClose={onClose} subtitle="We have received your application" title="Request sent">
      <div className="space-y-4">
        <div className="rounded-xl border border-line bg-soft/50 px-4 py-3.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-faint">
            Your application code
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <code className="select-all font-mono text-lg font-black tracking-[0.08em] text-ink">
              {code}
            </code>
            <button
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition ${
                copied
                  ? 'border-green-600/30 bg-green-50 text-green-700'
                  : 'border-line bg-white text-ink hover:border-ink/30 hover:bg-soft'
              }`}
              onClick={copy}
              type="button"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy code'}
            </button>
          </div>
          <p className="mt-2 text-[11px] leading-5 text-muted">
            Keep this code safe — you need it to track your application. We will email a
            verification code to <strong className="text-ink">{shop.email}</strong> whenever it is
            used.
          </p>
        </div>

        <div className="divide-y divide-line rounded-xl border border-line px-4">
          <Detail icon={<Store size={13} />} label="Shop name" value={shop.name} />
          <Detail icon={<Mail size={13} />} label="Shop email" value={shop.email} />
          <Detail icon={<Phone size={13} />} label="Shop phone" value={shop.phone} />
          <Detail icon={<MapPin size={13} />} label="Location" value={shop.addressLabel} />
        </div>

        <p className="text-[11px] leading-5 text-muted">
          Our team reviews applications and replies by email. You can check progress any time from
          the tracking box on this page.
        </p>
      </div>

      <ModalFooter>
        <Button onClick={onClose}>Done</Button>
      </ModalFooter>
    </Modal>
  )
}
