import { api } from '../api/request'
import { sellerEndpoint } from './sellerApi'
import {
  clearClientStorage,
  loadClientSession,
  saveClientSession,
  type ClientSession,
  type ClientUser,
} from './clientSession'

export {
  clearClientSession,
  isSeller,
  loadClientSession,
  type ClientSession,
  type ClientUser,
} from './clientSession'

interface ApiEnvelope<T> {
  data: T
  message: string
  status: number
}

interface LoginResponse {
  accessToken: string
  expiresIn: number
  mustChangePassword: boolean
  tokenType: string
  user: ClientUser
}

export interface LoginChallenge {
  expiresInMinutes: number
  message: string
}

export interface SellerSettings {
  hasPassword: boolean
  mustChangePassword: boolean
  otpLoginEnabled: boolean
}

const authPath = (path: string) => sellerEndpoint(`/seller/auth${path}`)

function storeSession(result: LoginResponse): ClientSession {
  const session: ClientSession = {
    accessToken: result.accessToken,
    expiresAt: Date.now() + result.expiresIn * 1000,
    mustChangePassword: Boolean(result.mustChangePassword),
    tokenType: result.tokenType,
    user: result.user,
  }
  saveClientSession(session)
  return session
}

export async function loginWithPassword(email: string, password: string): Promise<ClientSession> {
  const response = await api.post<ApiEnvelope<LoginResponse>, { email: string; password: string }>(
    authPath('/login'),
    { email, password },
  )
  return storeSession(response.data)
}

export async function requestLoginOtp(email: string): Promise<LoginChallenge> {
  const response = await api.post<ApiEnvelope<LoginChallenge>, { email: string }>(
    authPath('/login/otp'),
    { email },
  )
  return response.data
}

export async function loginWithOtp(email: string, otp: string): Promise<ClientSession> {
  const response = await api.post<ApiEnvelope<LoginResponse>, { email: string; otp: string }>(
    authPath('/login/otp/verify'),
    { email, otp },
  )
  return storeSession(response.data)
}

export async function changePassword(input: { currentPassword?: string; newPassword: string }): Promise<ClientSession> {
  const response = await api.post<ApiEnvelope<LoginResponse>, typeof input>(
    authPath('/change-password'),
    input,
  )
  return storeSession(response.data)
}

export async function requestPasswordReset(email: string): Promise<LoginChallenge> {
  const response = await api.post<ApiEnvelope<LoginChallenge>, { email: string }>(
    authPath('/forgot-password'),
    { email },
  )
  return response.data
}

export async function verifyPasswordResetOtp(email: string, otp: string): Promise<string> {
  const response = await api.post<ApiEnvelope<{ expiresInMinutes: number; token: string }>, { email: string; otp: string }>(
    authPath('/forgot-password/verify'),
    { email, otp },
  )
  return response.data.token
}

export async function resetPassword(input: { email: string; newPassword: string; token: string }): Promise<void> {
  await api.post<ApiEnvelope<null>, typeof input>(authPath('/reset-password'), input)
}

export async function logoutSeller(): Promise<void> {
  const session = loadClientSession()
  try {
    if (session) await api.post<void>(authPath('/logout'))
  } finally {
    clearClientStorage()
  }
}

export async function getSellerSettings(): Promise<SellerSettings> {
  return (await api.get<ApiEnvelope<SellerSettings>>(sellerEndpoint('/seller/settings'))).data
}

export async function updateSellerSettings(input: { otpLoginEnabled: boolean }): Promise<SellerSettings> {
  return (
    await api.patch<ApiEnvelope<SellerSettings>, typeof input>(sellerEndpoint('/seller/settings'), input)
  ).data
}
