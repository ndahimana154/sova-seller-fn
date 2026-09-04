import { api } from '../api/request'
import { sellerEndpoint } from './sellerApi'

interface ApiEnvelope<T> {
  data: T
  message: string
  status: number
}

interface PublicParameter {
  key: string
  value: unknown
}

/** Defaults mirror the seeded values so the form still works if the call fails. */
const FALLBACKS: Record<string, number> = {
  'products.max_option_axes': 8,
  'products.name_max_length': 150,
}

let cache: Promise<Record<string, number>> | null = null

async function load(): Promise<Record<string, number>> {
  const rows = (
    await api.get<ApiEnvelope<PublicParameter[]>>(
      sellerEndpoint('/system-parameters/public?group=products'),
    )
  ).data
  const values = { ...FALLBACKS }
  for (const row of rows) {
    const parsed = Number(row.value)
    if (Number.isFinite(parsed)) values[row.key] = parsed
  }
  return values
}

export function productLimits(): Promise<Record<string, number>> {
  cache ??= load().catch(() => ({ ...FALLBACKS }))
  return cache
}

export const PRODUCT_NAME_MAX_LENGTH = 'products.name_max_length'
export const PRODUCT_MAX_OPTION_AXES = 'products.max_option_axes'
