import { ArrowRight } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { sellerProductsApi, type SellerProduct } from '../../../../lib/sellerProductsApi'
import { MultiSelect } from '../../../ui/MultiSelect'
import { Select } from '../../../ui/Select'
import { useToast } from '../../../../hooks/useToast'
import { PRODUCT_NAME_MAX_LENGTH, productLimits } from '../../../../lib/systemParameters'
import { Field, FormSection } from '../ProductPageUi'
import { StepFooter, StepIssues } from './WizardShell'
import type { WizardState } from './useProductWizard'
import { ui } from '../../../ui/styles'

const DESCRIPTION_MIN = 20

interface BasicsErrors {
  categoryIds?: string
  description?: string
  name?: string
}

export function BasicsStep({
  onSaved,
  wizard,
}: {
  onSaved: (product: SellerProduct) => void
  wizard: WizardState
}) {
  const { brands, categories, product } = wizard
  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [categoryIds, setCategoryIds] = useState<string[]>(
    (product?.categories ?? []).map((category) => category.id),
  )
  const [brandId, setBrandId] = useState(product?.brand?.id ?? '')
  const [errors, setErrors] = useState<BasicsErrors>({})
  const [nameLimit, setNameLimit] = useState(150)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    void productLimits().then((limits) => setNameLimit(limits[PRODUCT_NAME_MAX_LENGTH]))
  }, [])

  // Every category is selectable, shown in tree order with its parent trail so
  // two same-named children stay tellable apart.
  const categoryOptions = [...categories]
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((category) => {
      const trail = category.path.replace(/^\/|\/$/g, '').split('/')
      const parents = trail.slice(0, -1)
      return {
        hint: parents.length ? parents.join(' › ') : undefined,
        label: `${'\u00a0\u00a0'.repeat(Math.max(parents.length, 0))}${category.name}`,
        value: category.id,
      }
    })
  const issues = wizard.progress?.steps.find((step) => step.key === 'BASICS')?.issues ?? []

  function validate(): BasicsErrors {
    const found: BasicsErrors = {}
    const trimmedName = name.trim()
    if (!trimmedName) found.name = 'Give the product a name.'
    else if (trimmedName.length > nameLimit) {
      found.name = `Keep the name to ${nameLimit} characters — it is ${trimmedName.length}.`
    }

    const trimmedDescription = description.trim()
    if (!trimmedDescription) found.description = 'Describe the product so buyers know what it is.'
    else if (trimmedDescription.length < DESCRIPTION_MIN) {
      found.description = `Write at least ${DESCRIPTION_MIN} characters — it is ${trimmedDescription.length}.`
    }

    if (categoryIds.length === 0) found.categoryIds = 'Choose at least one category.'
    return found
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    const payload = {
      brandId: brandId || null,
      categoryIds,
      description: description.trim(),
      name: name.trim(),
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

  const nameLength = name.trim().length
  const clear = (field: keyof BasicsErrors) =>
    setErrors((current) => ({ ...current, [field]: undefined }))

  return (
    <form className="space-y-5" noValidate onSubmit={submit}>
      <FormSection title="Basic Information">
        <div className="space-y-4">
          <StepIssues issues={issues} />

          <Field
            error={errors.name}
            hint={
              <span className={nameLength > nameLimit ? 'font-bold text-red-600' : undefined}>
                {nameLength}/{nameLimit}
              </span>
            }
            label="Product name"
            required
          >
            <input
              name="name"
              onChange={(event) => { setName(event.target.value); clear('name') }}
              placeholder="e.g. Classic cotton tee"
              value={name}
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field error={errors.categoryIds} label="Categories" required>
              <MultiSelect
                emptyMessage="No categories are available yet."
                onChange={(next) => { setCategoryIds(next); clear('categoryIds') }}
                options={categoryOptions}
                placeholder="Search categories"
                searchable
                value={categoryIds}
                variant="bare"
              />
            </Field>

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
          </div>

          <Field error={errors.description} label="Description" required>
            <textarea
              name="description"
              onChange={(event) => { setDescription(event.target.value); clear('description') }}
              placeholder="What it is, what it is made of, why someone should buy it."
              rows={5}
              value={description}
            />
          </Field>
        </div>
      </FormSection>

      <StepFooter saving={saving}>
        <button className={ui.primaryButton} disabled={saving} type="submit">
          Save and continue <ArrowRight size={14} />
        </button>
      </StepFooter>
    </form>
  )
}
