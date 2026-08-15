import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { PublicLayout } from './components/home/PublicLayout'
import { Toaster } from './components/ui/Toaster'
import { useAuthActions } from './hooks/useAuthActions'
import { isSeller, loadClientSession } from './lib/sellerAuth'
import { AuthPage } from './pages/auth/AuthPage'
import { ChangePasswordPage } from './pages/auth/ChangePasswordPage'
import { SellerHomePage } from './pages/home/SellerHomePage'
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
  const { authenticateWithOtp, authenticateWithPassword, completePasswordChange, logout } = useAuthActions()

  useEffect(() => {
    const sync = () => dispatch(setSession(loadClientSession()))
    sync()
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [dispatch])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  const seller = session && isSeller(session) ? session : null
  const locked = Boolean(seller?.mustChangePassword)

  return (
    <>
      <AppRoutes
        application={
          <PublicLayout dashboardHref={seller && !locked ? appPaths.dashboard : undefined}>
            <SellerApplicationPage />
          </PublicLayout>
        }
        authScreen={
          seller && !locked
            ? <Navigate replace to={appPaths.dashboard} />
            : <AuthPage onOtpSignIn={authenticateWithOtp} onPasswordSignIn={authenticateWithPassword} />
        }
        changePassword={
          seller
            ? <ChangePasswordPage email={seller.user.email} forced={locked} onChanged={completePasswordChange} />
            : <Navigate replace to={appPaths.login} />
        }
        dashboardLayout={
          seller && !locked
            ? <SellerDashboardPage onLogout={() => void logout()} user={seller.user} />
            : <Navigate replace to={locked ? appPaths.changePassword : appPaths.login} />
        }
        home={<SellerHomePage dashboardHref={seller && !locked ? appPaths.dashboard : undefined} />}
      />
      <Toaster />
    </>
  )
}
