import axios from 'axios'

export interface ApiError {
  code?: string
  details?: unknown
  message: string
  status?: number
}

export function normalizeApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    const body = data && typeof data === 'object' ? data as Record<string, unknown> : undefined
    const nestedData = body?.data && typeof body.data === 'object'
      ? body.data as Record<string, unknown>
      : undefined
    const message = responseText(data)
      ?? responseText(body?.message)
      ?? responseText(body?.error)
      ?? responseText(nestedData?.message)
      ?? responseText(nestedData?.error)

    return {
      code: typeof body?.code === 'string' ? body.code : error.code,
      details: data,
      message: message ?? (error.code === 'ECONNABORTED' ? 'The request timed out' : error.message),
      status: error.response?.status,
    }
  }
  if (isApiError(error)) return error
  return { message: error instanceof Error ? error.message : 'An unexpected error occurred' }
}

function responseText(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value
  if (Array.isArray(value)) {
    const messages = value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
    return messages.length ? messages.join(' ') : undefined
  }
  return undefined
}

function isApiError(error: unknown): error is ApiError {
  return Boolean(
    error &&
    typeof error === 'object' &&
    typeof (error as ApiError).message === 'string' &&
    ('status' in error || 'code' in error || 'details' in error),
  )
}
