import { Save } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ProductMediaPicker, type MediaDraft } from '../../../components/seller/products/ProductMedia'
import { AttributeEditor, Feedback, Field, FormSection, PageTitle, PricingFields, attributesObject, errorMessage, type AttributeRow } from '../../../components/seller/products/ProductPageUi'
import { Select } from '../../../components/ui/Select'
import { sellerProductsApi, type SellerCategory } from '../../../lib/sellerProductsApi'
import { appPaths } from '../../../router/paths'

export function SellerProductCreatePage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<SellerCategory[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [attributes, setAttributes] = useState<AttributeRow[]>([])
  const [drafts, setDrafts] = useState<MediaDraft[]>([])
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { sellerProductsApi.categories().then(setCategories).catch((cause) => setError(errorMessage(cause))) }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true); setError('')
    setStatus(drafts.length ? `Saving product and ${drafts.length} file(s)…` : 'Saving product…')
    const data = new FormData(event.currentTarget)
    try {
      const product = await sellerProductsApi.create({
        name: String(data.get('name')), description: String(data.get('description')),
        categoryId: String(data.get('categoryId')),
        variants: attributesObject(attributes),
        price: Number(data.get('price')),
        discount: Number(data.get('discount') || 0),
        quantity: Number(data.get('quantity') || 0),
        media: drafts.map((draft) => draft.file),
      })
      navigate(appPaths.productDetails(product.id), { replace: true })
    } catch (cause) {
      setError(errorMessage(cause)); setStatus(''); setSaving(false)
    }
  }

  return (
    <div className="space-y-5 p-5">
      <PageTitle subtitle="Add product information and media to your catalogue." title="Create product" />
      <form className="space-y-5" onSubmit={submit}>
        <FormSection subtitle="How this product is identified across your shop. Opening stock is logged as the product's first inventory movement." title="Basics">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Product name"><input name="name" placeholder="e.g. Leather ankle boots" required /></Field>
            <Field label="Category">
              <Select
                name="categoryId"
                onChange={setCategoryId}
                options={categories.map((item) => ({ label: item.name, value: item.id }))}
                placeholder="Select category"
                required
                value={categoryId}
                variant="bare"
              />
            </Field>
            <Field label="Opening stock">
              <input defaultValue="0" min="0" name="quantity" step="1" type="number" />
            </Field>
            <Field className="md:col-span-2" label="Description">
              <textarea name="description" placeholder="Describe the material, fit and what makes it worth buying." required rows={5} />
            </Field>
          </div>
        </FormSection>

        <FormSection subtitle="Buyers see the final price after the discount is applied." title="Pricing">
          <PricingFields />
        </FormSection>

        <FormSection subtitle="Photos and videos shown on the product page." title="Media">
          <ProductMediaPicker drafts={drafts} onChange={setDrafts} />
        </FormSection>

        <FormSection subtitle="Specifications shown as property and value pairs." title="Attributes">
          <AttributeEditor hideHeading onChange={setAttributes} rows={attributes} />
        </FormSection>

        <div className="space-y-3">
          <Feedback error={error} />
          <div className="flex flex-wrap items-center justify-end gap-3">
            {saving && status && <span className="text-xs text-muted">{status}</span>}
            <Link className="seller-outline-button" to={appPaths.products}>Cancel</Link>
            <button className="seller-primary-button" disabled={saving} type="submit">
              <Save size={14} /> {saving ? 'Saving…' : 'Create product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
