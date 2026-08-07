import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { isSeller, loginClient, logoutClient } from '../lib/clientAuth'
import { appPaths } from '../router/paths'
import { clearSession, setSession } from '../store/authSlice'
import { useAppDispatch } from '../store/hooks'
import { setToast } from '../store/uiSlice'

/** Sign-in and sign-out for the seller portal. */
export function useAuthActions() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const notify = useCallback((text: string) => {
    dispatch(setToast(text))
    window.setTimeout(() => dispatch(setToast('')), 1800)
  }, [dispatch])

  const authenticate = useCallback(async (email: string, otp: string) => {
    const session = await loginClient(email, otp)
    dispatch(setSession(session))
    // A signed-in account without a shop is sent to the application form.
    navigate(isSeller(session) ? appPaths.dashboard : appPaths.apply)
    notify(isSeller(session) ? 'Welcome to your seller workspace' : 'Finish your shop application to start selling')
  }, [dispatch, navigate, notify])

  const logout = useCallback(async () => {
    try {
      await logoutClient()
    } finally {
      dispatch(clearSession())
      navigate(appPaths.login)
      notify('You have been logged out')
    }
  }, [dispatch, navigate, notify])

  return { authenticate, logout, notify }
}
