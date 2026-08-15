import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  sellerProductsApi,
  type ProductProgress,
  type ProductStep,
  type SellerBrand,
  type SellerCategory,
  type SellerProduct,
} from '../../../../lib/sellerProductsApi'
import { useToast } from '../../../../hooks/useToast'

const SIMPLE_STEPS: ProductStep[] = ['BASICS', 'ATTRIBUTES', 'MEDIA', 'PUBLISH']
const OPTION_STEPS: ProductStep[] = ['BASICS', 'ATTRIBUTES', 'VARIANTS', 'MEDIA', 'PUBLISH']

export interface WizardState {
  brands: SellerBrand[]
  categories: SellerCategory[]
  hasOptions: boolean
  loading: boolean
  product: SellerProduct | null
  progress: ProductProgress | null
  refresh: () => Promise<void>
  setStep: (step: ProductStep) => void
  step: ProductStep
  stepIndex: number
  steps: ProductStep[]
}

export function useProductWizard(productId: string | undefined): WizardState {
  const [product, setProduct] = useState<SellerProduct | null>(null)
  const [progress, setProgress] = useState<ProductProgress | null>(null)
  const [categories, setCategories] = useState<SellerCategory[]>([])
  const [brands, setBrands] = useState<SellerBrand[]>([])
  const [step, setStep] = useState<ProductStep>('BASICS')
  const [loading, setLoading] = useState(Boolean(productId))
  const toast = useToast()

  useEffect(() => {
    Promise.all([sellerProductsApi.categories(), sellerProductsApi.brands()])
      .then(([nextCategories, nextBrands]) => {
        setCategories(nextCategories)
        setBrands(nextBrands)
      })
      .catch((cause) => toast.error(cause))
  }, [toast])

  const refresh = useCallback(async () => {
    if (!productId) return
    try {
      const [nextProduct, nextProgress] = await Promise.all([
        sellerProductsApi.get(productId),
        sellerProductsApi.progress(productId),
      ])
      setProduct(nextProduct)
      setProgress(nextProgress)
    } catch (cause) {
      toast.error(cause)
    } finally {
      setLoading(false)
    }
  }, [productId, toast])

  useEffect(() => {
    if (!productId) {
      setLoading(false)
      return
    }
    void refresh()
  }, [productId, refresh])

  const [landed, setLanded] = useState(false)
  useEffect(() => {
    if (landed || !progress) return
    setStep(progress.currentStep)
    setLanded(true)
  }, [landed, progress])

  const hasOptions = product?.hasVariants ?? false

  const steps = useMemo(() => {
    if (progress?.steps.length) return progress.steps.map((state) => state.key)
    return hasOptions ? OPTION_STEPS : SIMPLE_STEPS
  }, [hasOptions, progress])

  const stepIndex = useMemo(() => steps.indexOf(step), [step, steps])

  useEffect(() => {
    if (steps.includes(step)) return
    setStep(steps[steps.length - 1] ?? 'BASICS')
  }, [step, steps])

  return {
    brands,
    categories,
    hasOptions,
    loading,
    product,
    progress,
    refresh,
    setStep,
    step,
    stepIndex,
    steps,
  }
}
