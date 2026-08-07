const rawApiUrl = import.meta.env.VITE_API_URL?.trim()
const rawSellerApiUrl = import.meta.env.VITE_SELLER_API_URL?.trim()

export const env = {
  apiUrl: rawApiUrl,
  /** The buyer storefront, now a separate app. */
  storefrontUrl: import.meta.env.VITE_STOREFRONT_URL?.trim() || 'http://localhost:5173',
  requestTimeoutMs: Number(import.meta.env.VITE_API_TIMEOUT_MS) || 15_000,
  sellerApiUrl: rawSellerApiUrl || rawApiUrl,
} as const
