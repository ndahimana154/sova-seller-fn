import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sellerProductsApi } from '../../../../lib/sellerProductsApi'
import { appPaths } from '../../../../router/paths'
import { useToast } from '../../../../hooks/useToast'
import { FormSection, StatusBadge } from '../ProductPageUi'
import { PublishReview } from './PublishReview'
import { StepFooter } from './WizardShell'
import type { WizardState } from './useProductWizard'
import { ui } from '../../../ui/styles'

export function PublishStep({ onBack, wizard }: { onBack: () => void; wizard: WizardState }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { product, progress } = wizard
  const [busy, setBusy] = useState(false)

  if (!product || !progress) return null

  async function act(work: () => Promise<unknown>, done: (id: string) => void) {
    setBusy(true)
    try {
      await work()
      done(product!.id)
    } catch (cause) {
      toast.error(cause)
    } finally {
      setBusy(false)
    }
  }

  const publish = () =>
    act(() => sellerProductsApi.publish(product.id), (id) => {
      toast.success(`${product.name} is live on SOVA.`)
      navigate(appPaths.productDetails(id), { replace: true })
    })

  const unpublish = () =>
    act(() => sellerProductsApi.unpublish(product.id), async () => {
      toast.info(`${product.name} is hidden from buyers.`)
      await wizard.refresh()
    })

  const live = product.status === 'ACTIVE'

  return (
    <div className="space-y-5">
      <FormSection
        actions={<StatusBadge value={product.status} />}
        subtitle="Everything below has to be finished before buyers can see this product."
        title="Review and publish"
      >
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[11px] text-muted">
              Check everything below before publishing — this is what buyers will see.
            </p>
            <PublishReview product={product} />
          </div>
        </div>
      </FormSection>

      <StepFooter
        back={
          <button className={ui.outlineButton} onClick={onBack} type="button">
            <ArrowLeft size={13} /> Back
          </button>
        }
        saving={busy}
      >
        {live ? (
          <button
            className={ui.outlineButton}
            disabled={busy}
            onClick={() => void unpublish()}
            type="button"
          >
            <EyeOff size={14} /> Unpublish
          </button>
        ) : (
          <button
            className={ui.primaryButton}
            disabled={busy || !progress.canPublish}
            onClick={() => void publish()}
            type="button"
          >
            <Eye size={14} /> Publish
          </button>
        )}
      </StepFooter>
    </div>
  )
}
