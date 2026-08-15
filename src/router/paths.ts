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
  settings: '/dashboard/settings',
  storefront: env.storefrontUrl,
} as const
