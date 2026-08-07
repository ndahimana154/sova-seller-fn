import { useEffect, useState } from 'react'
import { DataTable } from '../../../components/ui/DataTable'
import { Feedback, PageTitle, errorMessage } from '../../../components/seller/products/ProductPageUi'
import { sellerProductsApi, type SellerCategory } from '../../../lib/sellerProductsApi'

export function SellerProductCategoriesPage() {
  const [categories, setCategories] = useState<SellerCategory[]>([])
  const [error, setError] = useState('')
  useEffect(() => { sellerProductsApi.categories().then(setCategories).catch((cause) => setError(errorMessage(cause))) }, [])
  const names = new Map(categories.map((item) => [item.id, item.name]))
  return <div className="space-y-5 p-5"><PageTitle title="Product categories" subtitle="Available categories for your product catalogue." /><Feedback error={error} />
    <DataTable columns={['Name', 'Type', 'Parent category']} rows={categories.map((item) => [item.name, item.parentId ? 'Subcategory' : 'Root category', item.parentId ? names.get(item.parentId) ?? '—' : '—'])} emptyMessage="No categories are available." />
  </div>
}
