import { useEffect, useMemo, useState } from 'react'
import { Field } from '../../../components/seller/products/ProductPageUi'
import { Badge } from '../../../components/ui'
import { DataTable } from '../../../components/ui/DataTable'
import { Select } from '../../../components/ui/Select'
import { useToast } from '../../../hooks/useToast'
import { sellerProductsApi, type SellerCategory } from '../../../lib/sellerProductsApi'

export function SellerProductCategoriesPage() {
  const [categories, setCategories] = useState<SellerCategory[]>([])
  const [search, setSearch] = useState('')
  const [kind, setKind] = useState('')
  const [usable, setUsable] = useState('')
  const [level, setLevel] = useState('')
  const toast = useToast()

  useEffect(() => {
    sellerProductsApi.categories().then(setCategories).catch((cause) => toast.error(cause))
  }, [toast])

  const names = useMemo(
    () => new Map(categories.map((item) => [item.id, item.name])),
    [categories],
  )

  // Depth is data, not a fixed ladder — read the options off what exists.
  const levels = useMemo(
    () => [...new Set(categories.map((item) => item.level))].sort((left, right) => left - right),
    [categories],
  )

  const rows = categories.filter((item) => {
    const needle = search.trim().toLowerCase()
    if (needle && !`${item.name} ${item.path}`.toLowerCase().includes(needle)) return false
    if (kind === 'ROOT' && item.parentId) return false
    if (kind === 'CHILD' && !item.parentId) return false
    if (usable === 'LEAF' && !item.isLeaf) return false
    if (usable === 'BRANCH' && item.isLeaf) return false
    if (level && String(item.level) !== level) return false
    return true
  })

  const activeFilterCount = [kind, usable, level].filter(Boolean).length

  return (
    <div className="space-y-5 p-5 sm:p-6">
      <DataTable
        activeFilterCount={activeFilterCount}
        columns={['Name', 'Type', 'Parent category', 'Level']}
        emptyMessage={
          categories.length
            ? 'No categories match these filters.'
            : 'No categories are available.'
        }
        filters={
          <>
            <Field className="w-44" label="Type">
              <Select
                onChange={setKind}
                options={[
                  { label: 'All types', value: '' },
                  { label: 'Root category', value: 'ROOT' },
                  { label: 'Subcategory', value: 'CHILD' },
                ]}
                value={kind}
                variant="bare"
              />
            </Field>
            <Field className="w-52" label="Accepts products">
              <Select
                onChange={setUsable}
                options={[
                  { label: 'Any', value: '' },
                  { hint: 'You can file products here', label: 'Yes', value: 'LEAF' },
                  { hint: 'Grouping only', label: 'No', value: 'BRANCH' },
                ]}
                value={usable}
                variant="bare"
              />
            </Field>
            <Field className="w-40" label="Level">
              <Select
                onChange={setLevel}
                options={[
                  { label: 'All levels', value: '' },
                  ...levels.map((item) => ({ label: `Level ${item}`, value: String(item) })),
                ]}
                value={level}
                variant="bare"
              />
            </Field>
          </>
        }
        onSearchChange={setSearch}
        rows={rows.map((item) => [
          <span className="flex flex-wrap items-center gap-2">
            <strong className="text-ink">{item.name}</strong>
          </span>,
          <Badge tone={item.parentId ? 'accent' : 'info'}>
            {item.parentId ? 'Subcategory' : 'Root category'}
          </Badge>,
          item.parentId ? names.get(item.parentId) ?? '—' : '—',
          <Badge tone="purple">Level {item.level}</Badge>,
        ])}
        searchPlaceholder="Search categories"
        subtitle={`${rows.length} of ${categories.length} available for your catalogue.`}
        title="Product categories"
      />
    </div>
  )
}
