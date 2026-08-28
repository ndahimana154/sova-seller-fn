import { api } from '../api/request'

export type PolicySlug = 'terms_and_conditions' | 'delivery_terms'

export interface PolicyVersion {
  body: string
  id: string
  publishedAt: string
  slug: PolicySlug
  version: string
}

interface ApiEnvelope<T> {
  data: T
  message: string
  status: number
}

export const policyApi = {
  current: async () =>
    (await api.get<ApiEnvelope<PolicyVersion[]>>('/policies/current')).data,
}
