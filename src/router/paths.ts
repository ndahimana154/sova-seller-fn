import { env } from "../config/env";

export const appPaths = {
  home: '/',
  apply: '/apply',
  login: '/login',
  changePassword: '/change-password',
  dashboard: '/dashboard',
  products: '/dashboard/products',
  productCreate: '/dashboard/products/new',
  productDetails: (id: string) => `/dashboard/products/${id}`,
  productEdit: (id: string) => `/dashboard/products/${id}/edit`,
  categories: '/dashboard/product-categories',
  videos: '/dashboard/product-videos',
  videoDetails: (id: string) => `/dashboard/product-videos/${id}`,
  orders: '/dashboard/orders',
  orderDetails: (orderNumber: string) => `/dashboard/orders/${orderNumber}`,
  wallet: '/dashboard/wallet',
  settings: '/dashboard/settings',
  storefront: env.storefrontUrl,
} as const
