import { ArrowLeft, CheckCircle2, CircleDashed, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatMoney } from '../../../../lib/money'
import { sellerProductsApi } from '../../../../lib/sellerProductsApi'
import { appPaths } from '../../../../router/paths'
import { useToast } from '../../../../hooks/useToast'
import { FormSection, StatusBadge } from '../ProductPageUi'
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
          <ul className="space-y-2">
            {progress.steps
              .filter((step) => step.key !== 'PUBLISH')
              .map((step) => (
                <li
                  className="flex items-start gap-2.5 rounded-xl border border-line px-3 py-2.5"
                  key={step.key}
                >
                  {step.complete ? (
                    <CheckCircle2 className="mt-px shrink-0 text-green-600" size={15} />
                  ) : (
                    <CircleDashed
                      className={`mt-px shrink-0 ${step.blocking ? 'text-red-500' : 'text-muted'}`}
                      size={15}
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-ink">
                      {step.label}
                      {!step.blocking && !step.complete && (
                        <span className="ml-2 font-normal text-muted">optional</span>
                      )}
                    </p>
                    {step.issues.map((issue) => (
                      <p className="text-[10px] text-muted" key={issue}>
                        {issue}
                      </p>
                    ))}
                  </div>
                </li>
              ))}
          </ul>

          <dl className="grid gap-3 rounded-xl border border-line bg-soft/40 p-3.5 sm:grid-cols-3">
            <Summary label="Price from" value={formatMoney(product.price)} />
            <Summary label="SKUs" value={String(product.variantCount)} />
            <Summary label="Stock" value={String(product.quantity)} />
          </dl>
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

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] text-muted">{label}</dt>
      <dd className="text-sm font-bold text-ink">{value}</dd>
    </div>
  )
}
