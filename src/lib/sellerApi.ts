import { api } from '../api/request'
import { env } from '../config/env'

export interface ShopApplicationPayload {
  applicantMessage?: string
  applicantEmail: string
  applicantName: string
  acceptTerms: boolean
  addressHouseNumber?: string
  addressLabel: string
  addressLatitude?: string | null
  addressLongitude?: string | null
  addressPlaceId?: string | null
  description: string
  email: string
  logo?: File
  name: string
  phone: string
  rbdRegistrationDocument?: File
  representativePhone: string
  tinNumber: string
}

export interface SellerApplicationResponse {
  applicationCode: string
  canRenew: boolean
  history: Array<{
    applicantMessage?: string | null
    createdAt: string
    note: string
    status: string
  }>
  shopName: string
  shop: {
    addressHouseNumber?: string | null
    addressLabel?: string | null
    addressLatitude?: string | null
    addressLongitude?: string | null
    addressPlaceId?: string | null
    createdAt: string
    description?: string | null
    email?: string | null
    logo?: string | null
    mapsUrl?: string | null
    name: string
    phone?: string | null
    rbdRegistrationDocument?: string | null
    representativeEmail?: string | null
    representativeNames?: string | null
    representativePhone?: string | null
    tinNumber?: string | null
  }
  status: 'submitted' | 'resubmitted' | 'under review' | 'returned' | 'active' | 'suspended' | 'rejected'
}

const sellerApiBaseUrl = env.sellerApiUrl?.replace(/\/$/, '') || ''

export function sellerEndpoint(path: string) {
  const endpoint = `${sellerApiBaseUrl}${path}`
  return endpoint.startsWith('/') ? new URL(endpoint, window.location.origin).toString() : endpoint
}

export function sellerResourceUrl(path: string) {
  if (/^(https?:|blob:|data:)/i.test(path)) return path
  const normalizedPath = `/${path.replace(/^\/+/, '')}`
  return sellerEndpoint(normalizedPath)
}

interface ApiEnvelope<T> {
  data: T
  message: string
  status: number
}

export async function submitShopApplication(payload: ShopApplicationPayload) {
  const data = applicationFormData(payload)
  return (await api.post<ApiEnvelope<SellerApplicationResponse>, FormData>(sellerEndpoint('/seller/shop-applications'), data)).data
}

export async function renewShopApplication(applicationCode: string, payload: ShopApplicationPayload) {
  const data = applicationFormData(payload)
  return (
    await api.put<ApiEnvelope<SellerApplicationResponse>, FormData>(
      sellerEndpoint(`/seller/shop-applications/${encodeURIComponent(applicationCode)}`),
      data,
    )
  ).data
}

function applicationFormData(payload: ShopApplicationPayload) {
  const data = new FormData()
  data.set('name', payload.name)
  data.set('description', payload.description)
  data.set('email', payload.email)
  data.set('phone', payload.phone)
  data.set('addressLabel', payload.addressLabel)
  if (payload.addressHouseNumber) data.set('addressHouseNumber', payload.addressHouseNumber)
  if (payload.addressPlaceId) data.set('addressPlaceId', payload.addressPlaceId)
  if (payload.addressLatitude) data.set('addressLatitude', payload.addressLatitude)
  if (payload.addressLongitude) data.set('addressLongitude', payload.addressLongitude)
  data.set('tinNumber', payload.tinNumber)
  data.set('acceptTerms', String(payload.acceptTerms))
  data.set('representativeEmail', payload.applicantEmail)
  data.set('representativePhone', payload.representativePhone)
  data.set('representativeNames', payload.applicantName)
  if (payload.rbdRegistrationDocument) data.set('rbdRegistrationDocument', payload.rbdRegistrationDocument)
  if (payload.applicantMessage) data.set('applicantMessage', payload.applicantMessage)
  if (payload.logo) data.set('logo', payload.logo)
  return data
}

export async function trackShopApplication(applicationCode: string) {
  return (
    await api.get<ApiEnvelope<SellerApplicationResponse>>(
      sellerEndpoint(`/seller/shop-applications/${encodeURIComponent(applicationCode)}`),
    )
  ).data
}

export interface SellerOrderSummary {
  awaitingPayment: boolean
  createdAt: string
  id: string
  imageUrl: string | null
  orderNumber: string
  paymentStatus: string | null
  productName: string
  quantity: number
  shopName: string
  status: string
  totalAmount: number
  variantName: string | null
}

export interface SellerOrderDetail extends SellerOrderSummary {
  amountDue: number
  amountPaid: number
  courierName: string | null
  deliveryAddress: string
  deliveryNote: string | null
  discountAmount: number
  mapsUrl: string | null
  recipientEmail: string | null
  recipientName: string
  recipientPhone: string
  reservedQuantity: number
  timeline: Array<{ at: string; description: string | null; eventType: string; status: string | null }>
  unitPrice: number
}

export async function getSellerOrders() {
  return (await api.get<ApiEnvelope<SellerOrderSummary[]>>(sellerEndpoint('/seller/orders'))).data
}

export async function markOrderPacked(orderNumber: string) {
  return (
    await api.put<ApiEnvelope<SellerOrderDetail>, undefined>(
      sellerEndpoint(`/seller/orders/${encodeURIComponent(orderNumber)}/packed`),
      undefined,
    )
  ).data
}

export async function getSellerOrder(orderNumber: string) {
  return (
    await api.get<ApiEnvelope<SellerOrderDetail>>(
      sellerEndpoint(`/seller/orders/${encodeURIComponent(orderNumber)}`),
    )
  ).data
}
