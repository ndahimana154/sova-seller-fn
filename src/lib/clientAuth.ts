import { api } from '../api/request'
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

interface LoginResponse {
  accessToken: string
  expiresIn: number
  tokenType: string
  user: ClientUser
}

interface ApiEnvelope<T> {
  data: T
  message: string
  status: number
}

interface LoginChallenge {
  expiresInMinutes: number
  message: string
}

export async function requestLoginOtp(email: string): Promise<LoginChallenge> {
  const response = await api.post<ApiEnvelope<LoginChallenge>, { email: string }>(
    '/clients/auth/login',
    { email },
  )
  return response.data
}

export async function loginClient(email: string, otp: string): Promise<ClientSession> {
  const response = await api.post<ApiEnvelope<LoginResponse>, { email: string; otp: string }>(
    '/clients/auth/login/verify',
    { email, otp },
  )
  const result = response.data
  const session: ClientSession = {
    accessToken: result.accessToken,
    expiresAt: Date.now() + result.expiresIn * 1000,
    tokenType: result.tokenType,
    user: result.user,
  }
  saveClientSession(session)
  return session
}

export async function logoutClient(): Promise<void> {
  const session = loadClientSession()
  try {
    if (session) await api.post<void>('/clients/auth/logout')
  } finally {
    clearClientStorage()
  }
}
