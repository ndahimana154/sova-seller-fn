import { ArrowRight } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { sellerProductsApi, type SellerProduct } from '../../../../lib/sellerProductsApi'
import { MultiSelect } from '../../../ui/MultiSelect'
import { Select } from '../../../ui/Select'
import { useToast } from '../../../../hooks/useToast'
import { Field, FormSection } from '../ProductPageUi'
import { StepFooter, StepIssues } from './WizardShell'
import type { WizardState } from './useProductWizard'
import { ui } from '../../../ui/styles'

export function BasicsStep({
  onSaved,
  wizard,
}: {
  onSaved: (product: SellerProduct) => void
  wizard: WizardState
}) {
  const { brands, categories, product } = wizard
  const [categoryIds, setCategoryIds] = useState<string[]>(
    (product?.categories ?? []).map((category) => category.id),
  )
  const [brandId, setBrandId] = useState(product?.brand?.id ?? '')
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const leaves = categories.filter((category) => category.isLeaf)
  const issues = wizard.progress?.steps.find((step) => step.key === 'BASICS')?.issues ?? []

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const payload = {
      brandId: brandId || null,
      categoryIds,
      description: String(data.get('description') ?? ''),
      name: String(data.get('name') ?? ''),
    }
    setSaving(true)
    try {
      const saved = product
        ? await sellerProductsApi.saveBasics(product.id, payload)
        : await sellerProductsApi.createDraft(payload)
      onSaved(saved)
    } catch (cause) {
      toast.error(cause)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <FormSection
        title="Basic Information"
      >
        <div className="space-y-4">
          <StepIssues issues={issues} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Product name">
              <input defaultValue={product?.name} name="name" placeholder="e.g. Classic cotton tee" required />
            </Field>
            <Field label="Categories">
              <MultiSelect
                emptyMessage="No categories are available yet."
                onChange={setCategoryIds}
                options={leaves.map((category) => ({
                  // hint: category.path.replace(/^\/|\/$/g, '').replaceAll('/', ' › '),
                  label: category.name,
                  value: category.id,
                }))}
                placeholder="Choose one or more"
                value={categoryIds}
                variant="bare"
              />
            </Field>
          </div>
          <Field label="Brand (optional)">
            <Select
              emptyMessage="No brands yet — ask an admin to add one."
              onChange={setBrandId}
              options={[
                { label: 'No brand', value: '' },
                ...brands.map((brand) => ({ label: brand.name, value: brand.id })),
              ]}
              placeholder="Select a brand"
              value={brandId}
              variant="bare"
            />
          </Field>
          <Field label="Description">
            <textarea
              defaultValue={product?.description}
              name="description"
              placeholder="What it is, what it is made of, why someone should buy it."
              rows={5}
            />
          </Field>
        </div>
      </FormSection>

      <StepFooter saving={saving}>
        <button className={ui.primaryButton} disabled={saving || categoryIds.length === 0} type="submit">
          Save and continue <ArrowRight size={14} />
        </button>
      </StepFooter>
    </form>
  )
}
