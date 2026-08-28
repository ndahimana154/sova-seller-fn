/**
 * Single source of truth for phone numbers across the app.
 *
 * A valid number is a 10-digit Rwandan mobile number starting with one of the
 * supported network prefixes. Anything the user pastes (`+250 788 123 456`,
 * `250788123456`, `788123456`, …) is normalised to `0788123456` before it is
 * validated or submitted.
 */

export const PHONE_PREFIXES = ['078', '079', '072', '073'] as const

export const PHONE_LENGTH = 10

export const PHONE_HINT = `10 digits starting with ${PHONE_PREFIXES.join(', ')}`

export const PHONE_PLACEHOLDER = '078 812 3456'

const PHONE_PATTERN = /^(?:072|073|078|079)\d{7}$/

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

/** Converts any accepted input shape into the canonical `07XXXXXXXX` form. */
export function normalizePhone(value: string | null | undefined): string {
  const digits = onlyDigits(String(value ?? ''))
  if (!digits) return ''
  if (digits.length === 12 && digits.startsWith('250')) return `0${digits.slice(3)}`
  if (digits.length === 9 && !digits.startsWith('0')) return `0${digits}`
  return digits.slice(0, PHONE_LENGTH)
}

export function isValidPhone(value: string | null | undefined): boolean {
  return PHONE_PATTERN.test(normalizePhone(value))
}

/** Groups digits as `078 812 3456` for display while typing. */
export function formatPhone(value: string | null | undefined): string {
  const digits = normalizePhone(value)
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)]
    .filter(Boolean)
    .join(' ')
}

/**
 * Returns the message to show under the field, or undefined when the value is
 * acceptable. Optional fields accept an empty value.
 */
export function validatePhone(
  value: string | null | undefined,
  { required = true }: { required?: boolean } = {},
): string | undefined {
  const digits = normalizePhone(value)
  if (!digits) return required ? 'Phone number is required.' : undefined
  if (digits.length !== PHONE_LENGTH) return `Enter ${PHONE_LENGTH} digits — you entered ${digits.length}.`
  if (!PHONE_PATTERN.test(digits)) return `Phone number must start with ${PHONE_PREFIXES.join(', ')}.`
  return undefined
}

/** Validates the phone fields of a submitted form, keyed by field name. */
export function phoneFieldErrors(
  data: FormData,
  fields: Record<string, { required?: boolean }>,
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const [field, options] of Object.entries(fields)) {
    const error = validatePhone(String(data.get(field) ?? ''), options)
    if (error) errors[field] = error
  }
  return errors
}
