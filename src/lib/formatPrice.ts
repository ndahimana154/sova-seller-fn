const priceFormatter = new Intl.NumberFormat('en-RW')

export function formatPrice(price: number) {
  return `RWF ${priceFormatter.format(Math.round(price))}`
}

export function formatAmount(price: number) {
  return priceFormatter.format(Math.round(price))
}
