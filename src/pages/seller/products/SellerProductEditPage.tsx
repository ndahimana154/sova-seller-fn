import { Save } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ProductMediaGrid, ProductMediaPicker, type MediaDraft } from '../../../components/seller/products/ProductMedia'
import { AttributeEditor, Feedback, Field, FormSection, PageTitle, PricingFields, attributeRows, attributesObject, errorMessage, type AttributeRow } from '../../../components/seller/products/ProductPageUi'
import { useSellerProduct } from '../../../components/seller/products/useSellerProduct'
import { useConfirm } from '../../../components/ui/ConfirmDialog'
import { Select } from '../../../components/ui/Select'
import { sellerProductsApi, type ProductMedia, type SellerCategory } from '../../../lib/sellerProductsApi'
import { appPaths } from '../../../router/paths'

export function SellerProductEditPage() {
  const navigate = useNavigate()
  const { error: loadError, loading, product, refresh, setError } = useSellerProduct()
  const [categories, setCategories] = useState<SellerCategory[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [attributes, setAttributes] = useState<AttributeRow[]>([])
  const [drafts, setDrafts] = useState<MediaDraft[]>([])
  const [mediaBusy, setMediaBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const confirm = useConfirm()

  useEffect(() => { sellerProductsApi.categories().then(setCategories).catch(() => undefined) }, [])
  useEffect(() => {
    if (!product) return
    setAttributes(attributeRows(product.variants))
    setCategoryId((current) => current || product.category.id)
  }, [product])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!product) return
    setSaving(true); setError(''); setStatus('Saving changes…')
    const data = new FormData(event.currentTarget)
    try {
      await sellerProductsApi.update(product.id, {
        name: String(data.get('name')),
        description: String(data.get('description')),
        brand: String(data.get('brand') || '') || null,
        categoryId: String(data.get('categoryId')),
        variants: attributesObject(attributes),
        price: Number(data.get('price')),
        discount: Number(data.get('discount') || 0),
      })
      for (const [index, draft] of drafts.entries()) {
        setStatus(`Uploading media ${index + 1} of ${drafts.length}…`)
        await sellerProductsApi.uploadMedia(product.id, {
          file: draft.file,
          position: product.media.length + index,
          isPrimary: !product.media.length && index === 0,
        })
      }
      navigate(appPaths.productDetails(product.id), { replace: true })
    } catch (cause) {
      setError(errorMessage(cause)); setStatus(''); setSaving(false)
    }
  }

  async function runMediaTask(task: () => Promise<unknown>) {
    setMediaBusy(true); setError('')
    try { await task(); await refresh({ silent: true }) }
    catch (cause) { setError(errorMessage(cause)) }
    finally { setMediaBusy(false) }
  }

  async function removeMedia(item: ProductMedia) {
    if (!product) return
    const ok = await confirm({
      body: item.isPrimary
        ? 'This is the cover file. The next file in the list becomes the new cover.'
        : 'This file will be removed from the product permanently.',
      confirmLabel: 'Delete file',
      danger: true,
      title: 'Delete this media file?',
    })
    if (!ok) return
    const replacement = item.isPrimary ? product.media.find((media) => media.id !== item.id)?.id : undefined
    void runMediaTask(() => sellerProductsApi.deleteMedia(product.id, item.id, replacement))
  }

  if (loading) return <div className="p-8 text-sm text-muted">Loading product…</div>
  if (!product) return <div className="p-5"><Feedback error={loadError || 'Product not found.'} /></div>

  return (
    <div className="space-y-5 p-5">
      {confirm.dialog}
      <PageTitle subtitle={`Update ${product.name}.`} title="Edit product" />
      <form className="space-y-5" onSubmit={submit}>
        <FormSection subtitle="How this product is identified across your shop." title="Basics">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Product name"><input defaultValue={product.name} name="name" required /></Field>
            <Field label="Brand"><input defaultValue={product.brand ?? ''} name="brand" placeholder="Optional" /></Field>
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
            <Field className="md:col-span-2" label="Description"><textarea defaultValue={product.description} name="description" required rows={5} /></Field>
          </div>
        </FormSection>

        <FormSection subtitle="Buyers see the final price after the discount is applied." title="Pricing">
          <PricingFields defaultDiscount={product.discount} defaultPrice={product.price} />
        </FormSection>

        <FormSection
          subtitle="Cover and delete changes apply immediately. New files upload when you save."
          title="Media"
        >
          <div className="space-y-5">
            <div>
              <h3 className="seller-legend">Uploaded ({product.media.length})</h3>
              <p className="seller-legend-hint mb-3">Hover a file to set it as the cover or remove it.</p>
              <ProductMediaGrid
                busy={mediaBusy}
                media={product.media}
                onDelete={(item) => void removeMedia(item)}
                onMakePrimary={(item) => void runMediaTask(() => sellerProductsApi.updateMedia(product.id, item.id, { isPrimary: true }))}
              />
            </div>
            <ProductMediaPicker
              drafts={drafts}
              hint={product.media.length ? 'These are added after the existing files when you save.' : 'The first file becomes the cover image.'}
              label={`Add new media${drafts.length ? ` (${drafts.length} pending)` : ''}`}
              onChange={setDrafts}
            />
          </div>
        </FormSection>

        <FormSection subtitle="Specifications shown as property and value pairs." title="Attributes">
          <AttributeEditor hideHeading onChange={setAttributes} rows={attributes} />
        </FormSection>

        <div className="space-y-3">
          <Feedback error={loadError} />
          <div className="flex flex-wrap items-center justify-end gap-3">
            {saving && status && <span className="text-xs text-muted">{status}</span>}
            <Link className="seller-outline-button" to={appPaths.productDetails(product.id)}>Cancel</Link>
            <button className="seller-primary-button" disabled={saving} type="submit">
              <Save size={14} /> {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
