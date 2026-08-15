import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { sellerProductsApi, type SellerProduct } from '../../../lib/sellerProductsApi'
import { useToast } from '../../../hooks/useToast'

export function useSellerProduct() {
  const { productId = '' } = useParams()
  const [product, setProduct] = useState<SellerProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  /**
   * `silent` refetches without flipping `loading`, so callers that render a form
   * behind a loading guard keep their unsaved input on the screen.
   */
  const refresh = useCallback(async ({ silent = false } = {}) => {
    if (!productId) return
    if (!silent) setLoading(true)
    try {
      const [value, media] = await Promise.all([
        sellerProductsApi.get(productId),
        sellerProductsApi.listMedia(productId),
      ])
      setProduct({ ...value, media })
    } catch (cause) {
      toast.error(cause)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [productId, toast])

  useEffect(() => { void refresh() }, [refresh])
  return { loading, product, productId, refresh, setProduct }
}
