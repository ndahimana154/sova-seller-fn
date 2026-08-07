import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { env } from './config/env'
import { useAuthActions } from './hooks/useAuthActions'
import { isSeller, loadClientSession } from './lib/clientAuth'
import { AuthPage } from './pages/auth/AuthPage'
import { SellerApplicationPage } from './pages/seller/SellerApplicationPage'
import { SellerDashboardPage } from './pages/seller/SellerDashboardPage'
import { appPaths } from './router/paths'
import { AppRoutes } from './router/routes'
import { setSession } from './store/authSlice'
import { useAppDispatch, useAppSelector } from './store/hooks'

export default function App() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const session = useAppSelector((state) => state.auth.session)
  const toast = useAppSelector((state) => state.ui.toast)
  const { authenticate, logout } = useAuthActions()

  useEffect(() => {
    const sync = () => dispatch(setSession(loadClientSession()))
    sync()
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [dispatch])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  return (
    <>
      <AppRoutes
        application={session ? <SellerApplicationPage /> : <Navigate replace to={appPaths.login} />}
        authScreen={session && isSeller(session) ? <Navigate replace to={appPaths.dashboard} /> : <AuthPage onAuthenticate={authenticate} />}
        dashboardLayout={
          session && isSeller(session)
            ? <SellerDashboardPage
                onLogout={() => void logout()}
                onStorefrontOpen={() => { window.location.href = env.storefrontUrl }}
                user={session.user}
              />
            : <Navigate replace to={session ? appPaths.apply : appPaths.login} />
        }
      />
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-xs font-bold text-white shadow-xl">
          {toast}
        </div>
      )}
    </>
  )
}
