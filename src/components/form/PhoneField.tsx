import { PHONE_PLACEHOLDER, formatPhone, normalizePhone } from '../../lib/phone'

interface PhoneFieldProps {
  autoComplete?: string
  className?: string
  disabled?: boolean
  name?: string
  onChange: (normalized: string) => void
  placeholder?: string
  /** Renders the parent label's asterisk. Validation stays with the form so
   *  the inline message is shown instead of a native browser tooltip. */
  required?: boolean
  value: string
}

/**
 * Phone entry that cannot hold more than a valid Rwandan mobile number. Input
 * is filtered to digits, capped at 10, and shown grouped as `078 812 3456`.
 * The value handed back is always the canonical `0788123456` form.
 */
export function PhoneField({
  autoComplete = 'tel',
  className,
  disabled,
  name,
  onChange,
  placeholder = PHONE_PLACEHOLDER,
  value,
}: PhoneFieldProps) {
  return (
    <input
      autoComplete={autoComplete}
      className={className}
      disabled={disabled}
      inputMode="numeric"
      maxLength={12}
      name={name}
      onChange={(event) => onChange(normalizePhone(event.target.value))}
      onPaste={(event) => {
        event.preventDefault()
        onChange(normalizePhone(event.clipboardData.getData('text')))
      }}
      placeholder={placeholder}
      type="tel"
      value={formatPhone(value)}
    />
  )
}
