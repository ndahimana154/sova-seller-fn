import { useEffect, useState } from 'react'
import { Modal } from '../../ui/Modal'
import { RichTextView } from '../../ui/RichTextView'
import { policyApi, type PolicyVersion } from '../../../lib/policyApi'

export function TermsDialog({ onClose }: { onClose: () => void }) {
  const [terms, setTerms] = useState<PolicyVersion | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    policyApi
      .current()
      .then((policies) =>
        setTerms(policies.find((entry) => entry.slug === 'terms_and_conditions') ?? null),
      )
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [])

  return (
    <Modal
      onClose={onClose}
      size="lg"
      subtitle={terms ? `Version ${terms.version}` : undefined}
      title="SOVA terms and conditions"
    >
      <div className="max-h-[60vh] overflow-y-auto px-1">
        {loading && <p className="text-xs text-muted">Loading…</p>}
        {!loading && !terms && <p className="text-xs text-muted">The terms have not been published yet.</p>}
        {terms && <RichTextView html={terms.body} />}
      </div>
    </Modal>
  )
}
