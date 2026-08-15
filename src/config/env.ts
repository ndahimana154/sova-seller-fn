const rawApiUrl = import.meta.env.VITE_API_URL?.trim()
const rawSellerApiUrl = import.meta.env.VITE_SELLER_API_URL?.trim()

export const env = {
  apiUrl: rawApiUrl,
  storefrontUrl: import.meta.env.VITE_STOREFRONT_URL?.trim(),
  requestTimeoutMs: Number(import.meta.env.VITE_API_TIMEOUT_MS) || 15_000,
  sellerApiUrl: rawSellerApiUrl || rawApiUrl,
} as const
