const priceFormatter = new Intl.NumberFormat('en-RW')

export function formatPrice(price: number) {
  return `Rwf ${priceFormatter.format(price)}`
}
