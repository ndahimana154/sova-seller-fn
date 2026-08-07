import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { sellerProductsApi, type SellerProduct } from '../../../lib/sellerProductsApi'
import { errorMessage } from './ProductPageUi'

export function useSellerProduct() {
  const { productId = '' } = useParams()
  const [product, setProduct] = useState<SellerProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  /**
   * `silent` refetches without flipping `loading`, so callers that render a form
   * behind a loading guard keep their unsaved input on the screen.
   */
  const refresh = useCallback(async ({ silent = false } = {}) => {
    if (!productId) return
    if (!silent) setLoading(true)
    setError('')
    try {
      const [value, media] = await Promise.all([
        sellerProductsApi.get(productId),
        sellerProductsApi.listMedia(productId),
      ])
      setProduct({ ...value, media })
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      if (!silent) setLoading(false)
    }
  }, [productId])

  useEffect(() => { void refresh() }, [refresh])
  return { error, loading, product, productId, refresh, setError, setProduct }
}
