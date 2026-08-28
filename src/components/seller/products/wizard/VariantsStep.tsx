import { ArrowLeft, ArrowRight, Plus, Save } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useToast } from '../../../../hooks/useToast'
import { FormSection } from '../ProductPageUi'
import { StepFooter, StepIssues } from './WizardShell'
import { VariantCard } from './VariantCard'
import {
  draftFromVariant,
  emptyDraft,
  isVariantDirty,
  saveVariant,
  variantErrors,
  type VariantDraft,
} from './variantDraft'
import type { WizardState } from './useProductWizard'
import { ui } from '../../../ui/styles'

export function VariantsStep({
  onBack,
  onSaved,
  wizard,
}: {
  onBack: () => void
  onSaved: () => void
  wizard: WizardState
}) {
  const { product } = wizard
  const attributes = useMemo(() => product?.attributes ?? [], [product?.attributes])
  const [drafts, setDrafts] = useState<VariantDraft[]>([])
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const issues = wizard.progress?.steps.find((step) => step.key === 'VARIANTS')?.issues ?? []

  useEffect(() => {
    const saved = (product?.variants ?? [])
      .filter((variant) => variant.isActive && !variant.isPlaceholder)
      .map(draftFromVariant)
    setDrafts((current) => {
      const unsaved = current.filter((draft) => !draft.saved)
      return [...saved, ...unsaved]
    })
    // Only re-sync when the saved set changes; local edits must survive renders.
  }, [product?.variants])

  if (!product) return null

  const mediaFor = (variantId: string) => product.media.filter((item) => item.variantId === variantId)
  const unsaved = drafts.filter(isVariantDirty)

  async function saveAll() {
    const blocked = unsaved.find((draft) => Object.values(variantErrors(draft)).some(Boolean))
    if (blocked) {
      toast.error(`“${blocked.name.trim() || 'A variant'}” is not ready: ${Object.values(variantErrors(blocked)).find(Boolean)}`)
      return
    }
    setSaving(true)
    try {
      for (const draft of unsaved) await saveVariant(product!.id, draft)
      await wizard.refresh()
      // Newly created ones come back from the server; drop the local copies.
      setDrafts((current) => current.filter((draft) => draft.saved))
      toast.success(`${unsaved.length} variant${unsaved.length === 1 ? '' : 's'} saved.`)
    } catch (cause) {
      toast.error(cause)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <FormSection
        actions={
          <button
            className={ui.outlineButton}
            onClick={() => setDrafts([...drafts, emptyDraft()])}
            type="button"
          >
            <Plus size={13} /> Add variant
          </button>
        }
        subtitle={`One card per version you sell. Name each one, then add only the options that apply to it — ${attributes.map((attribute) => attribute.name).join(', ')}.`}
        title={`Variants (${drafts.length})`}
      >
        <div className="space-y-4">
          <StepIssues issues={issues} />

          {drafts.map((draft, index) => (
            <VariantCard
              attributes={attributes}
              draft={draft}
              index={index}
              key={draft.id}
              media={draft.saved ? mediaFor(draft.saved.id) : []}
              onChange={(next) => setDrafts(drafts.map((item) => (item.id === draft.id ? next : item)))}
              onRefresh={wizard.refresh}
              onRemove={() => setDrafts(drafts.filter((item) => item.id !== draft.id))}
              productId={product.id}
            />
          ))}

          {!drafts.length && (
            <p className={`${ui.hint} p-6`}>
              No variants yet. Add one for each combination you sell.
            </p>
          )}
        </div>
      </FormSection>

      <StepFooter
        back={
          <button className={ui.outlineButton} onClick={onBack} type="button">
            <ArrowLeft size={13} /> Back
          </button>
        }
        saving={saving}
      >
        {unsaved.length > 0 && (
          <>
            <span className="text-[11px] leading-5 text-muted">
              {unsaved.length} variant{unsaved.length === 1 ? '' : 's'} not saved yet
            </span>
            <button className={ui.outlineButton} disabled={saving} onClick={() => void saveAll()} type="button">
              <Save size={13} /> Save all
            </button>
          </>
        )}
        <button
          className={ui.primaryButton}
          disabled={saving || unsaved.length > 0}
          onClick={onSaved}
          title={unsaved.length ? 'Save every variant before continuing.' : undefined}
          type="button"
        >
          Continue <ArrowRight size={14} />
        </button>
      </StepFooter>
    </div>
  )
}
