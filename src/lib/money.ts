const WHOLE = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
})

const FRACTIONAL = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})

export const CURRENCY = 'RWF'

/** Grouped amount with no currency: 1000000 -> "1,000,000", 1234.5 -> "1,234.50". */
export function formatAmount(amount: number | null | undefined): string {
  const value = Number(amount)
  if (!Number.isFinite(value)) return '0'
  return Number.isInteger(value) ? WHOLE.format(value) : FRACTIONAL.format(value)
}

/** Amount prefixed with the currency: "RWF 1,000,000". */
export function formatMoney(amount: number | null | undefined): string {
  return `${CURRENCY} ${formatAmount(amount)}`
}
