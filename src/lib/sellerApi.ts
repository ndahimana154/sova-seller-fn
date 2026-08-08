import { api } from '../api/request'
import { env } from '../config/env'

export interface LocationOption {
  id: string
  name: string
}

export interface LocationTreeProvince extends LocationOption {
  districts: Array<LocationTreeDistrict>
}

export interface LocationTreeDistrict extends LocationOption {
  sectors: Array<LocationTreeSector>
}

export interface LocationTreeSector extends LocationOption {
  cells: Array<LocationTreeCell>
}

export interface LocationTreeCell extends LocationOption {
  villages: Array<LocationOption>
}

export interface ShopApplicationPayload {
  applicantMessage?: string
  applicantEmail: string
  applicantName: string
  description: string
  email: string
  googleMapsLocationLink?: string
  logo?: File
  name: string
  phone: string
  rbdRegistrationDocument?: File
  representativePhone: string
  street: string
  tinNumber: string
  villageId: string
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
    createdAt: string
    description?: string | null
    email?: string | null
    googleMapsLocationLink?: string | null
    logo?: string | null
    name: string
    phone?: string | null
    rbdRegistrationDocument?: string | null
    representativeEmail?: string | null
    representativeNames?: string | null
    representativePhone?: string | null
    street?: string | null
    tinNumber?: string | null
    village?: {
      cell?: { id: string; name: string } | null
      id: string
      name: string
      sector?: {
        district?: {
          id: string
          name: string
          province?: { id: string; name: string } | null
        } | null
        id: string
        name: string
      } | null
    } | null
  }
  status: 'submitted' | 'resubmitted' | 'under review' | 'returned' | 'active' | 'suspended' | 'rejected'
}

const locationPath = '/seller/shop-applications/locations'
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

export function getProvinces() {
  return getLocations('provinces', 'root')
}

export function getDistricts(provinceId: string) {
  return getLocations('districts', provinceId)
}

export function getSectors(districtId: string) {
  return getLocations('sectors', districtId)
}

export function getCells(sectorId: string) {
  return getLocations('cells', sectorId)
}

export function getVillages(cellId: string) {
  return getLocations('villages', cellId)
}

export async function getLocationTree() {
  return (
    await api.get<ApiEnvelope<LocationTreeProvince[]>>(sellerEndpoint('/locations/tree'), {
      timeout: 90_000,
    })
  ).data
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
  data.set('street', payload.street)
  data.set('villageId', payload.villageId)
  data.set('tinNumber', payload.tinNumber)
  data.set('representativeEmail', payload.applicantEmail)
  data.set('representativePhone', payload.representativePhone)
  data.set('representativeNames', payload.applicantName)
  if (payload.rbdRegistrationDocument) data.set('rbdRegistrationDocument', payload.rbdRegistrationDocument)
  if (payload.applicantMessage) data.set('applicantMessage', payload.applicantMessage)
  if (payload.googleMapsLocationLink) data.set('googleMapsLocationLink', payload.googleMapsLocationLink)
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

async function getLocations(level: string, parentId: string) {
  return (
    await api.get<ApiEnvelope<LocationOption[]>>(sellerEndpoint(`${locationPath}/${level}`), {
      params: { parentId },
    })
  ).data
}
