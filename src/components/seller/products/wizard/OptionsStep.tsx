import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { sellerProductsApi } from '../../../../lib/sellerProductsApi'
import { useToast } from '../../../../hooks/useToast'
import { useConfirm } from '../../../ui/ConfirmDialog'
import { Field, FormSection } from '../ProductPageUi'
import { PriceField } from './PriceField'
import { StepFooter, StepIssues } from './WizardShell'
import type { WizardState } from './useProductWizard'
import { ui } from '../../../ui/styles'

interface OptionDraft {
  /** The saved option id, or '' for a row the seller just added. */
  attributeId: string
  key: string
  name: string
}

interface OptionValueDraft {
  attributeId: string
  key: string
  name: string
  value: string
}

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
  const defaultVariant = product?.variants.find((variant) => variant.isPlaceholder && variant.isActive) ?? null
  const [mode, setMode] = useState<'single' | 'multiple'>(wizard.hasOptions ? 'multiple' : 'single')
  const [options, setOptions] = useState<OptionDraft[]>(() =>
    (product?.attributes ?? []).map((attribute) => ({
      attributeId: attribute.id,
      key: attribute.id,
      name: attribute.name,
    })),
  )
  const [attributes, setAttributes] = useState<OptionValueDraft[]>(() =>
    (product?.attributes ?? []).map((attribute) => ({
      attributeId: attribute.id,
      key: attribute.id,
      name: attribute.name,
      value: defaultVariant?.attributes.find((item) => item.attributeId === attribute.id)?.value ?? '',
    })),
  )
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const confirm = useConfirm()
  const issues = wizard.progress?.steps.find((step) => step.key === 'ATTRIBUTES')?.issues ?? []

  const variantsUsing = (attributeId: string) =>
    (product?.variants ?? []).filter(
      (variant) =>
        variant.isActive &&
        variant.attributes.some((item) => item.attributeId === attributeId),
    )

  async function confirmDrop(attributeId: string, name: string) {
    const users = attributeId ? variantsUsing(attributeId) : []
    if (!users.length) return true
    return confirm({
      body: (
        <>
          <p>
            “{name || 'This option'}” is used by {users.length} variant
            {users.length > 1 ? 's' : ''}:
          </p>
          <ul className="mt-2 list-disc space-y-0.5 pl-4">
            {users.slice(0, 6).map((variant) => (
              <li key={variant.id}>
                {variant.name?.trim() || variant.sku}
                <span className="ml-1.5 text-muted">
                  {variant.attributes.find((item) => item.attributeId === attributeId)?.value}
                </span>
              </li>
            ))}
            {users.length > 6 && <li>and {users.length - 6} more</li>}
          </ul>
          <p className="mt-2">
            Removing it clears that value from them. The variants themselves stay, with everything
            else intact.
          </p>
        </>
      ),
      confirmLabel: 'Remove option',
      danger: true,
      title: 'Remove this option?',
    })
  }

  async function dropOption(option: OptionDraft) {
    if (!(await confirmDrop(option.attributeId, option.name))) return
    setOptions((current) => current.filter((item) => item.key !== option.key))
  }

  async function dropValue(row: OptionValueDraft) {
    if (!(await confirmDrop(row.attributeId, row.name))) return
    setAttributes((current) => current.filter((item) => item.key !== row.key))
  }

  async function saveSingle(form: FormData) {
    if (!product) return
    const rows = attributes.map((row) => ({
      id: row.attributeId || undefined,
      name: row.name.trim(),
      value: row.value.trim(),
    }))
    if (rows.some((row) => !row.name || !row.value)) {
      throw new Error('Every option needs both a name and a value.')
    }
    const discount = Number(form.get('discountPercent') ?? 0)
    if (!Number.isInteger(discount) || discount < 0 || discount > 99) {
      throw new Error('Discount must be a whole number between 0 and 99.')
    }
    const existing = product.variants.find((variant) => variant.isPlaceholder && variant.isActive)

    const saved = await sellerProductsApi.saveAttributes(
      product.id,
      rows.map(({ id, name }) => ({ id, name })),
      false,
    )
    const idByName = new Map(saved.map((attribute) => [attribute.name.toLowerCase(), attribute.id]))

    const payload = {
      attributes: rows.map((row) => ({
        attributeId: idByName.get(row.name.toLowerCase()) ?? '',
        value: row.value,
      })),
      discountPercent: discount || null,
      price: Number(form.get('price') ?? 0),
      sku: String(form.get('sku') ?? '').trim(),
    }
    if (existing) {
      await sellerProductsApi.updateVariant(product.id, existing.id, payload)
    } else {
      await sellerProductsApi.createVariant(product.id, {
        ...payload,
        stockQuantity: Number(form.get('stockQuantity') ?? 0),
      })
    }
  }

  async function saveMultiple() {
    if (!product) return
    const rows = options.map((option) => ({
      id: option.attributeId || undefined,
      name: option.name.trim(),
    }))
    if (!rows.length) throw new Error('Add at least one option, or choose "one version only".')
    if (rows.some((row) => !row.name)) throw new Error('Every option needs a name.')
    await sellerProductsApi.saveAttributes(product.id, rows, true)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    try {
      if (mode === 'single') await saveSingle(new FormData(event.currentTarget))
      else await saveMultiple()
      toast.success(mode === 'single' ? 'Price and stock saved.' : 'Options saved.')
      onSaved(mode === 'multiple')
    } catch (cause) {
      toast.error(cause)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      {confirm.dialog}
      <FormSection
        subtitle="Options are what buyers pick between — size, colour, material. They decide whether this product sells as one SKU or several."
        title="Does this product come in more than one version?"
      >
        <div className="space-y-4">
          <StepIssues issues={issues} />

          <div className="grid gap-3 sm:grid-cols-2">
            <ModeCard
              active={mode === 'single'}
              body="One price, one SKU, one stock count — described by its own attributes."
              onSelect={() => setMode('single')}
              title="No, one version only"
            />
            <ModeCard
              active={mode === 'multiple'}
              body="Name the options here, then build each named variant in the next step."
              onSelect={() => setMode('multiple')}
              title="Yes, it has variants"
            />
          </div>
        </div>
      </FormSection>

      {mode === 'single' ? (
        <>
          <FormSection subtitle="This is what buyers pay and what stock you hold." title="Price and stock">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="SKU">
                <input
                  defaultValue={defaultVariant?.sku ?? ''}
                  name="sku"
                  placeholder="Leave empty and we generate one"
                />
              </Field>
              <div>
                <Field label={defaultVariant ? 'Stock on hand' : 'Opening stock'}>
                  <input
                    defaultValue={defaultVariant?.stockQuantity ?? 0}
                    disabled={Boolean(defaultVariant)}
                    min="0"
                    name="stockQuantity"
                    step="1"
                    type="number"
                  />
                </Field>
                {defaultVariant && (
                  <p className="text-[11px] leading-5 text-muted">Change it from the Inventory tab, so every move keeps a reason.</p>
                )}
              </div>
              <PriceField defaultValue={defaultVariant?.price ?? 0} label="Price" name="price" />
              <Field label="Discount (%)">
                <input
                  defaultValue={defaultVariant?.discountPercent ?? 0}
                  max="99"
                  min="0"
                  name="discountPercent"
                  step="1"
                  type="number"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            actions={
              <button
                className={ui.outlineButton}
                onClick={() => setAttributes([...attributes, { attributeId: '', key: crypto.randomUUID(), name: '', value: '' }])}
                type="button"
              >
                <Plus size={13} /> Add option
              </button>
            }
            subtitle="What describes this one version — Colour is Red, Material is Cotton. Each needs a name and a value."
            title="Options"
          >
            <div className="space-y-2">
              {attributes.map((attribute) => (
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_32px] gap-2" key={attribute.key}>
                  <input
                    className={ui.plainInput}
                    onChange={(event) =>
                      setAttributes(
                        attributes.map((item) =>
                          item.key === attribute.key ? { ...item, name: event.target.value } : item,
                        ),
                      )
                    }
                    placeholder="Name, e.g. Colour"
                    value={attribute.name}
                  />
                  <input
                    className={ui.plainInput}
                    onChange={(event) =>
                      setAttributes(
                        attributes.map((item) =>
                          item.key === attribute.key ? { ...item, value: event.target.value } : item,
                        ),
                      )
                    }
                    placeholder="Value, e.g. Red"
                    value={attribute.value}
                  />
                  <button
                    aria-label="Remove option"
                    className={`${ui.iconButton} text-red-600`}
                    onClick={() => void dropValue(attribute)}
                    type="button"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              {!attributes.length && (
                <p className={`${ui.hint} p-4`}>
                  No options yet. Add one if buyers should see it, such as Colour is Red.
                </p>
              )}
            </div>
          </FormSection>
        </>
      ) : (
        <FormSection
          actions={
            <button
              className={ui.outlineButton}
              onClick={() => setOptions([...options, { attributeId: '', key: crypto.randomUUID(), name: '' }])}
              type="button"
            >
              <Plus size={13} /> Add option
            </button>
          }
          subtitle="Name them only — you pick which ones each variant carries, and their values, on the next step."
          title="Options"
        >
          <div className="space-y-2">
            {options.map((option) => (
              <div className="grid grid-cols-[minmax(0,1fr)_32px] gap-2" key={option.key}>
                <input
                  className={ui.plainInput}
                  onChange={(event) =>
                    setOptions(options.map((item) => (item.key === option.key ? { ...item, name: event.target.value } : item)))
                  }
                  placeholder="e.g. Size"
                  value={option.name}
                />
                <button
                  aria-label="Remove option"
                  className={`${ui.iconButton} text-red-600`}
                  onClick={() => void dropOption(option)}
                  type="button"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
            {!options.length && (
              <p className={`${ui.hint} p-4`}>
                No options yet. Add one, such as Size or Colour.
              </p>
            )}
          </div>
        </FormSection>
      )}

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

function ModeCard({ active, body, onSelect, title }: {
  active: boolean
  body: string
  onSelect: () => void
  title: string
}) {
  return (
    <button
      aria-pressed={active}
      className={`rounded-xl border p-4 text-left transition ${active ? 'border-ink bg-soft' : 'border-line bg-white hover:border-ink/25'}`}
      onClick={onSelect}
      type="button"
    >
      <span className="flex items-center gap-2">
        <span className={`grid size-4 shrink-0 place-items-center rounded-full border ${active ? 'border-ink' : 'border-line'}`}>
          {active && <span className="size-2 rounded-full bg-ink" />}
        </span>
        <strong className="text-xs font-bold text-ink">{title}</strong>
      </span>
      <span className="mt-2 block text-[11px] leading-5 text-muted">{body}</span>
    </button>
  )
}
