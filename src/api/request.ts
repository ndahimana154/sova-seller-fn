import type { AxiosRequestConfig } from 'axios'
import { apiClient } from './client'

export async function request<TResponse, TBody = unknown>(config: AxiosRequestConfig<TBody>) {
  const response = await apiClient.request<TResponse>(config)
  return response.data
}

export const api = {
  delete: <T>(url: string, config?: AxiosRequestConfig) => request<T>({ ...config, method: 'DELETE', url }),
  get: <T>(url: string, config?: AxiosRequestConfig) => request<T>({ ...config, method: 'GET', url }),
  patch: <T, B = unknown>(url: string, data?: B, config?: AxiosRequestConfig<B>) =>
    request<T, B>({ ...config, data, method: 'PATCH', url }),
  post: <T, B = unknown>(url: string, data?: B, config?: AxiosRequestConfig<B>) =>
    request<T, B>({ ...config, data, method: 'POST', url }),
  put: <T, B = unknown>(url: string, data?: B, config?: AxiosRequestConfig<B>) =>
    request<T, B>({ ...config, data, method: 'PUT', url }),
}
