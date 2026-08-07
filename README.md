# SOVA Seller Portal

Standalone seller dashboard, split out of `client-fn`.

## Running

```bash
npm install
npm run dev     # defaults to port 5174 alongside the storefront on 5173
npm run build
npm run lint
```

## Environment

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | SOVA API base URL |
| `VITE_SELLER_API_URL` | Optional override for seller endpoints |
| `VITE_STOREFRONT_URL` | Buyer storefront, linked from the sidebar |
| `VITE_API_TIMEOUT_MS` | Request timeout, defaults to 15000 |

## Routes

| Path | Screen |
| --- | --- |
| `/login` | Passwordless sign-in |
| `/apply` | Shop application for accounts without a shop |
| `/` | Dashboard |
| `/products` | Product list |
| `/products/new` | Create product |
| `/products/:productId` | Product details and inventory |
| `/products/:productId/edit` | Edit product |
| `/product-categories` | Categories |

## Shared code

`components/ui`, `lib`, `api`, and `store` are duplicated from `client-fn`
rather than shared through a package. Keep changes in sync until these move to a
workspace package.
