import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  loginWithOtp,
  loginWithPassword,
  logoutSeller,
  type ClientSession,
} from '../lib/sellerAuth'
import { appPaths } from '../router/paths'
import { clearSession, setSession } from '../store/authSlice'
import { useAppDispatch } from '../store/hooks'
import { setToast } from '../store/uiSlice'

export function useAuthActions() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const notify = useCallback((text: string) => {
    dispatch(setToast(text))
    window.setTimeout(() => dispatch(setToast('')), 1800)
  }, [dispatch])

  const startSession = useCallback((session: ClientSession) => {
    dispatch(setSession(session))
    if (session.mustChangePassword) {
      navigate(appPaths.changePassword, { replace: true })
      notify('Choose a password to finish setting up your account')
      return
    }
    navigate(appPaths.dashboard, { replace: true })
    notify('Welcome to your seller workspace')
  }, [dispatch, navigate, notify])

  const authenticateWithPassword = useCallback(async (email: string, password: string) => {
    startSession(await loginWithPassword(email, password))
  }, [startSession])

  const authenticateWithOtp = useCallback(async (email: string, otp: string) => {
    startSession(await loginWithOtp(email, otp))
  }, [startSession])

  const completePasswordChange = useCallback((session: ClientSession) => {
    dispatch(setSession(session))
    navigate(appPaths.dashboard, { replace: true })
    notify('Your password has been updated')
  }, [dispatch, navigate, notify])

  const logout = useCallback(async () => {
    try {
      await logoutSeller()
    } finally {
      dispatch(clearSession())
      navigate(appPaths.login)
      notify('You have been logged out')
    }
  }, [dispatch, navigate, notify])

  return { authenticateWithOtp, authenticateWithPassword, completePasswordChange, logout, notify }
}
