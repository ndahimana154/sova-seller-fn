import { Suspense, lazy, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { appPaths } from './paths'

const SellerOrdersPage = lazy(() => import('../pages/seller/orders/SellerOrdersPage').then((m) => ({ default: m.SellerOrdersPage })))
const SellerOrderDetailsPage = lazy(() => import('../pages/seller/orders/SellerOrderDetailsPage').then((m) => ({ default: m.SellerOrderDetailsPage })))
const SellerProductCategoriesPage = lazy(() => import('../pages/seller/products/SellerProductCategoriesPage').then((m) => ({ default: m.SellerProductCategoriesPage })))
const SellerProductVideosPage = lazy(() => import('../pages/seller/products/SellerProductVideosPage').then((m) => ({ default: m.SellerProductVideosPage })))
const SellerVideoDetailsPage = lazy(() => import('../pages/seller/products/SellerVideoDetailsPage').then((m) => ({ default: m.SellerVideoDetailsPage })))
const SellerProductDetailsPage = lazy(() => import('../pages/seller/products/SellerProductDetailsPage').then((m) => ({ default: m.SellerProductDetailsPage })))
const SellerProductWizardPage = lazy(() => import('../pages/seller/products/SellerProductWizardPage').then((m) => ({ default: m.SellerProductWizardPage })))
const SellerProductListPage = lazy(() => import('../pages/seller/products/SellerProductListPage').then((m) => ({ default: m.SellerProductListPage })))
const SellerDashboardHomePage = lazy(() => import('../pages/seller/SellerDashboardHomePage').then((m) => ({ default: m.SellerDashboardHomePage })))
const SellerSettingsPage = lazy(() => import('../pages/seller/SellerSettingsPage').then((m) => ({ default: m.SellerSettingsPage })))

interface AppRoutesProps {
  application: ReactNode
  authScreen: ReactNode
  changePassword: ReactNode
  dashboardLayout: ReactNode
  home: ReactNode
}

export function AppRoutes({ application, authScreen, changePassword, dashboardLayout, home }: AppRoutesProps) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={home} path="/" />
        <Route element={authScreen} path="login" />
        <Route element={changePassword} path="change-password" />
        <Route element={application} path="apply" />
        <Route element={dashboardLayout} path="dashboard">
          <Route element={<SellerDashboardHomePage />} index />
          <Route element={<SellerProductListPage />} path="products" />
          <Route element={<SellerProductWizardPage />} path="products/new" />
          <Route element={<SellerProductDetailsPage />} path="products/:productId" />
          <Route element={<SellerProductWizardPage />} path="products/:productId/edit" />
          <Route element={<SellerProductCategoriesPage />} path="product-categories" />
          <Route element={<SellerProductVideosPage />} path="product-videos" />
          <Route element={<SellerVideoDetailsPage />} path="product-videos/:videoId" />
          <Route element={<SellerOrdersPage />} path="orders" />
          <Route element={<SellerOrderDetailsPage />} path="orders/:orderNumber" />
          <Route element={<SellerSettingsPage />} path="settings" />
          <Route element={<Navigate replace to={appPaths.dashboard} />} path="*" />
        </Route>
        <Route element={<Navigate replace to={appPaths.home} />} path="*" />
      </Routes>
    </Suspense>
  )
}

function RouteFallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <span className="size-8 animate-spin rounded-full border-2 border-line border-t-primary" />
    </div>
  )
}
