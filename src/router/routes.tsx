import { Suspense, lazy, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { appPaths } from './paths'

const SellerProductCategoriesPage = lazy(() => import('../pages/seller/products/SellerProductCategoriesPage').then((m) => ({ default: m.SellerProductCategoriesPage })))
const SellerProductCreatePage = lazy(() => import('../pages/seller/products/SellerProductCreatePage').then((m) => ({ default: m.SellerProductCreatePage })))
const SellerProductDetailsPage = lazy(() => import('../pages/seller/products/SellerProductDetailsPage').then((m) => ({ default: m.SellerProductDetailsPage })))
const SellerProductEditPage = lazy(() => import('../pages/seller/products/SellerProductEditPage').then((m) => ({ default: m.SellerProductEditPage })))
const SellerProductListPage = lazy(() => import('../pages/seller/products/SellerProductListPage').then((m) => ({ default: m.SellerProductListPage })))
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
          <Route element={<DashboardHome />} index />
          <Route element={<SellerProductListPage />} path="products" />
          <Route element={<SellerProductCreatePage />} path="products/new" />
          <Route element={<SellerProductDetailsPage />} path="products/:productId" />
          <Route element={<SellerProductEditPage />} path="products/:productId/edit" />
          <Route element={<SellerProductCategoriesPage />} path="product-categories" />
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

function DashboardHome() {
  return <div className="grid min-h-[calc(100vh-101px)] place-items-center bg-[#fffaf3] p-6"><h1 className="text-center text-3xl font-bold tracking-[-0.04em] text-ink">Seller Dashboard</h1></div>
}
