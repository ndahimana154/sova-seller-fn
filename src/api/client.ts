import axios from 'axios'
import { clearClientSession, loadClientSession } from '../lib/clientSession'
import { env } from '../config/env'
import { normalizeApiError } from './errors'

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: { Accept: 'application/json' },
  timeout: env.requestTimeoutMs,
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const session = loadClientSession()
  if (session?.accessToken) {
    config.headers.Authorization = `${session.tokenType || 'Bearer'} ${session.accessToken}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const normalized = normalizeApiError(error)
    if (normalized.status === 401 && !location.pathname.startsWith('/login')) {
      clearClientSession()
      location.assign('/login')
    }
    return Promise.reject(error)
  },
)
