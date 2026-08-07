export const appPaths = {
  login: '/login',
  apply: '/apply',
  dashboard: '/',
  products: '/products',
  productCreate: '/products/new',
  productDetails: (id: string) => `/products/${id}`,
  productEdit: (id: string) => `/products/${id}/edit`,
  categories: '/product-categories',
} as const
