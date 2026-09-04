import { ImageOff } from 'lucide-react'
import type { SellerProduct } from '../../../../lib/sellerProductsApi'
import { sellerResourceUrl } from '../../../../lib/sellerApi'
import { formatMoney } from '../../../../lib/money'

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-faint">{label}</dt>
      <dd className="mt-0.5 break-words text-xs text-ink">{value || '—'}</dd>
    </div>
  )
}

function Block({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="rounded-xl border border-line p-3.5">
      <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-muted">{title}</h3>
      <div className="mt-2.5">{children}</div>
    </section>
  )
}

/** Everything the seller entered, laid out so it can be checked before going live. */
export function PublishReview({ product }: { product: SellerProduct }) {
  const images = product.media.filter((item) => item.mediaType === 'IMAGE')
  // Variant rows carry the option id, not its label — resolve it so a tag reads
  // "Colour: Red" rather than a bare value.
  const optionNames = new Map(
    product.attributes.map((attribute) => [attribute.id, attribute.name]),
  )
  const variants = product.variants.filter((variant) => variant.isActive)

  return (
    <div className="space-y-3">
      <Block title="Basics">
        <dl className="grid gap-3 sm:grid-cols-2">
          <Row label="Product name" value={product.name} />
          <Row label="Brand" value={product.brand?.name} />
          <Row
            label="Categories"
            value={product.categories.map((category) => category.name).join(', ')}
          />
          <Row
            label="Status"
            value={
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-black ${
                  product.status === 'ACTIVE'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-amber-50 text-amber-800'
                }`}
              >
                {product.status === 'ACTIVE' ? 'Published' : 'Draft'}
              </span>
            }
          />
          <div className="sm:col-span-2">
            <Row label="Description" value={product.description} />
          </div>
        </dl>
      </Block>

      <Block title={`Photos (${images.length})`}>
        {images.length === 0 ? (
          <p className="flex items-center gap-2 text-[11px] text-muted">
            <ImageOff size={13} /> No photos added.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {images.slice(0, 8).map((item) => (
              <img
                alt=""
                className="size-16 rounded-lg border border-line object-cover"
                key={item.id}
                src={sellerResourceUrl(item.url)}
              />
            ))}
            {images.length > 8 && (
              <span className="grid size-16 place-items-center rounded-lg border border-dashed border-line text-[11px] text-muted">
                +{images.length - 8}
              </span>
            )}
          </div>
        )}
      </Block>

      {product.hasVariants && product.attributes.length > 0 && (
        <Block title="Options">
          <div className="flex flex-wrap gap-1.5">
            {product.attributes.map((attribute) => (
              <span
                className="rounded-full bg-soft px-2.5 py-1 text-[11px] font-semibold text-ink"
                key={attribute.id}
              >
                {attribute.name}
              </span>
            ))}
          </div>
        </Block>
      )}

      <Block title={`Versions (${variants.length})`}>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {variants.map((variant) => {
            const photos = images.filter((item) => item.variantId === variant.id)
            return (
              <article className="rounded-xl border border-line p-3" key={variant.id}>
                <div className="flex gap-3">
                  {photos[0] ? (
                    <img
                      alt=""
                      className="size-16 shrink-0 rounded-lg border border-line object-cover"
                      src={sellerResourceUrl(photos[0].url)}
                    />
                  ) : (
                    <span className="grid size-16 shrink-0 place-items-center rounded-lg border border-dashed border-line text-muted">
                      <ImageOff size={16} />
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-black text-ink">
                      {variant.name || 'Single version'}
                    </p>
                    <p className="mt-0.5 text-sm font-black text-ink">
                      {variant.price > 0 ? formatMoney(variant.price) : (
                        <span className="text-red-600">No price</span>
                      )}
                      {variant.discountPercent ? (
                        <span className="ml-1.5 text-[11px] font-bold text-green-700">
                          −{variant.discountPercent}%
                        </span>
                      ) : null}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <Pill tone={variant.stockQuantity > 0 ? 'ok' : 'warn'}>
                        {variant.stockQuantity} in stock
                      </Pill>
                      <Pill tone={photos.length ? 'ok' : 'bad'}>
                        {photos.length} photo{photos.length === 1 ? '' : 's'}
                      </Pill>
                    </div>
                  </div>
                </div>

                {variant.attributes.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-line pt-2.5">
                    {variant.attributes.map((attribute) => (
                      <span
                        className="rounded-full bg-soft px-2 py-0.5 text-[10px] text-muted"
                        key={`${variant.id}-${attribute.attributeId}`}
                      >
                        <span className="font-semibold text-ink">
                          {optionNames.get(attribute.attributeId) ?? 'Option'}
                        </span>
                        {': '}
                        {attribute.value}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </Block>
    </div>
  )
}

function Pill({ children, tone }: { children: React.ReactNode; tone: 'bad' | 'ok' | 'warn' }) {
  const tones = {
    bad: 'bg-red-50 text-red-700',
    ok: 'bg-green-50 text-green-700',
    warn: 'bg-amber-50 text-amber-800',
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tones[tone]}`}>
      {children}
    </span>
  )
}
