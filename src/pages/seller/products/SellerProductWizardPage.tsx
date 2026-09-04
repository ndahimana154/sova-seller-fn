import { useNavigate, useParams } from 'react-router-dom'
import { OptionsStep } from '../../../components/seller/products/wizard/OptionsStep'
import { BasicsStep } from '../../../components/seller/products/wizard/BasicsStep'
import { MediaStep } from '../../../components/seller/products/wizard/MediaStep'
import { PublishStep } from '../../../components/seller/products/wizard/PublishStep'
import {
  ProgressSummary,
  WizardSteps,
} from '../../../components/seller/products/wizard/WizardShell'
import { useProductWizard } from '../../../components/seller/products/wizard/useProductWizard'
import { PageTitle, StatusBadge } from '../../../components/seller/products/ProductPageUi'
import { appPaths } from '../../../router/paths'
import { ui } from '../../../components/ui/styles'

export function SellerProductWizardPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const wizard = useProductWizard(productId)
  const { loading, product, progress, step } = wizard

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <span className="size-8 animate-spin rounded-full border-2 border-line border-t-primary" />
      </div>
    )
  }

  const goTo = (next: Parameters<typeof wizard.setStep>[0]) => {
    wizard.setStep(next)
    window.scrollTo({ behavior: 'smooth', top: 0 })
  }

  return (
    <div className="space-y-5 p-5 sm:p-6">
      <div className="space-y-4 rounded-2xl border border-line bg-white p-4 sm:p-5">
        <header className="space-y-3 rounded-xl bg-white/70">
          <PageTitle
            actions={product ? <StatusBadge value={product.status} /> : undefined}
            subtitle={
              product
                ? 'Finish each step, then publish when everything checks out.'
                : 'Start with the basics — you can come back to the rest at any time.'
            }
            title={product ? product.name : 'New product'}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
            <ProgressSummary progress={progress} />
            {product && (
              <button
                className={ui.outlineButton}
                onClick={() => navigate(appPaths.productDetails(product.id))}
                type="button"
              >
                View product
              </button>
            )}
          </div>
        </header>

        <WizardSteps onSelect={goTo} progress={progress} step={step} steps={wizard.steps} />

        {step === 'BASICS' && (
          <BasicsStep
            onSaved={async (saved) => {
              if (!productId) {
                navigate(appPaths.productEdit(saved.id), { replace: true })
                return
              }
              await wizard.refresh()
              goTo('ATTRIBUTES')
            }}
            wizard={wizard}
          />
        )}

        {step === 'ATTRIBUTES' && product && (
          <OptionsStep
            key={product.attributes.map((attribute) => attribute.id).join(',')}
            onBack={() => goTo('BASICS')}
            onSaved={async () => {
              await wizard.refresh()
              goTo('MEDIA')
            }}
            wizard={wizard}
          />
        )}

        {step === 'MEDIA' && product && (
          <MediaStep
            onBack={() => goTo('ATTRIBUTES')}
            onSaved={async () => {
              await wizard.refresh()
              goTo('PUBLISH')
            }}
            wizard={wizard}
          />
        )}

        {step === 'PUBLISH' && product && <PublishStep onBack={() => goTo('MEDIA')} wizard={wizard} />}
      </div>
    </div>
  )
}
