import { ArrowLeft, ArrowRight, Plus } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { sellerProductsApi } from '../../../../lib/sellerProductsApi'
import { useToast } from '../../../../hooks/useToast'
import { PRODUCT_MAX_OPTION_AXES, productLimits } from '../../../../lib/systemParameters'
import { FormSection } from '../ProductPageUi'
import { VersionCard } from './VersionCard'
import { StepFooter, StepIssues } from './WizardShell'
import {
  emptyVersion,
  hasVersionErrors,
  optionNamesOf,
  versionErrors,
  versionsFromProduct,
  type VersionDraft,
} from './versionDraft'
import type { WizardState } from './useProductWizard'
import { ui } from '../../../ui/styles'

export function OptionsStep({
  onBack,
  onSaved,
  wizard,
}: {
  onBack: () => void
  onSaved: (hasVariants: boolean) => void
  wizard: WizardState
}) {
  const { product } = wizard
  const [versions, setVersions] = useState<VersionDraft[]>(() => versionsFromProduct(product))
  const [showErrors, setShowErrors] = useState(false)
  const [maxOptions, setMaxOptions] = useState(8)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    void productLimits().then((limits) => setMaxOptions(limits[PRODUCT_MAX_OPTION_AXES]))
  }, [])

  const issues = wizard.progress?.steps.find((step) => step.key === 'ATTRIBUTES')?.issues ?? []
  // More than one version is what makes this a product with variants; the
  // seller never answers that question directly.
  const named = versions.length > 1
  const errors = useMemo(
    () => versions.map((version) => versionErrors(version, named)),
    [named, versions],
  )
  const optionNames = useMemo(() => optionNamesOf(versions), [versions])

  function update(key: string, next: VersionDraft) {
    setVersions((current) => current.map((item) => (item.key === key ? next : item)))
  }

  function remove(key: string) {
    setVersions((current) => current.filter((item) => item.key !== key))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setShowErrors(true)
    if (errors.some(hasVersionErrors)) return
    if (optionNames.length > maxOptions) {
      toast.error(`A product can have at most ${maxOptions} options.`)
      return
    }
    if (!product) return

    setSaving(true)
    try {
      // Register the option names first, but leave the product's mode alone:
      // flipping it here would reconcile variants against a set the server has
      // not been told about yet, and retire ones the seller is keeping.
      const attributes = await sellerProductsApi.saveAttributes(
        product.id,
        optionNames.map((name) => ({ name })),
      )
      const idByName = new Map(
        attributes.map((attribute) => [attribute.name.toLowerCase(), attribute.id]),
      )

      for (const version of versions) {
        const payload = {
          attributes: version.options
            .filter((option) => option.name.trim() && option.value.trim())
            .map((option) => ({
              attributeId: idByName.get(option.name.trim().toLowerCase()) ?? '',
              value: option.value.trim(),
            })),
          discountPercent: Number(version.discountPercent) || null,
          name: version.name.trim(),
          price: Number(version.price),
          // Blank means none. On an existing version the server turns any
          // change into a stock movement, so the ledger stays complete.
          stockQuantity: Number(version.stockQuantity) || 0,
        }
        const saved = version.saved
          ? (await sellerProductsApi.updateVariant(product.id, version.saved.id, payload)).find(
              (variant) => variant.id === version.saved?.id,
            )
          : (await sellerProductsApi.createVariant(product.id, payload)).at(-1)

        const variantId = saved?.id ?? version.saved?.id
        if (variantId) {
          // Only one photo product-wide can be the primary, so a later version
          // saving its own would unset this one's. Writing the starred photo
          // first as well means each version still leads with what was starred,
          // whichever ends up holding the product-level flag.
          const ordered = [...version.photos].sort(
            (a, b) =>
              Number(b.key === version.coverKey) - Number(a.key === version.coverKey),
          )
          for (const [index, photo] of ordered.entries()) {
            const isPrimary = version.coverKey === photo.key
            if (photo.file) {
              await sellerProductsApi.uploadMedia(product.id, {
                file: photo.file,
                isPrimary,
                position: index,
                variantId,
              })
            } else if (photo.id) {
              await sellerProductsApi.updateMedia(product.id, photo.id, {
                isPrimary,
                position: index,
              })
            }
          }

          const keptPhotos = new Set(
            version.photos.map((photo) => photo.id).filter(Boolean),
          )
          for (const photo of product.media) {
            if (photo.variantId === variantId && !keptPhotos.has(photo.id)) {
              await sellerProductsApi.deleteMedia(product.id, photo.id)
            }
          }
        }
      }

      // Anything the seller deleted here is retired on the server too.
      const keptIds = new Set(versions.map((version) => version.saved?.id).filter(Boolean))
      for (const variant of product.variants) {
        if (variant.isActive && !keptIds.has(variant.id)) {
          await sellerProductsApi.deleteVariant(product.id, variant.id)
        }
      }

      // Now that the server holds the final set, settle the mode. Reconciliation
      // runs against real data and promotes or retires the right versions.
      await sellerProductsApi.saveAttributes(
        product.id,
        optionNames.map((name) => ({ name })),
        named,
      )

      toast.success(named ? `${versions.length} versions saved.` : 'Price and stock saved.')
      onSaved(named)
    } catch (cause) {
      toast.error(cause)
    } finally {
      setSaving(false)
    }
  }

  if (!product) return null

  return (
    <form className="space-y-5" noValidate onSubmit={submit}>
      <FormSection
        actions={
          <button
            className={ui.outlineButton}
            onClick={() => setVersions((current) => [...current, emptyVersion()])}
            type="button"
          >
            <Plus size={13} /> Add version
          </button>
        }
        subtitle="Start with one price. Add another version whenever this product sells in more than one form — each one can carry its own options."
        title="Pricing and versions"
      >
        <div className="space-y-4">
          <StepIssues issues={issues} />

          {versions.map((version, index) => (
            <VersionCard
              errors={showErrors ? errors[index] : {}}
              index={index}
              key={version.key}
              named={named}
              onChange={(next) => update(version.key, next)}
              onRemove={versions.length > 1 ? () => remove(version.key) : undefined}
              version={version}
            />
          ))}

          <button
            className={`${ui.outlineButton} w-full justify-center`}
            onClick={() => setVersions((current) => [...current, emptyVersion()])}
            type="button"
          >
            <Plus size={14} /> Add another version
          </button>

          <p className="text-[11px] leading-5 text-muted">
            {named
              ? `${versions.length} versions — each needs its own name and price. Buyers pick between them.`
              : 'One version, so this product sells as a single SKU. Add another to give buyers a choice.'}
          </p>
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
        <button className={ui.primaryButton} disabled={saving} type="submit">
          Save and continue <ArrowRight size={14} />
        </button>
      </StepFooter>
    </form>
  )
}
