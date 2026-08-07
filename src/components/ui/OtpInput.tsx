import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react'

interface OtpInputProps {
  autoFocus?: boolean
  disabled?: boolean
  invalid?: boolean
  label?: string
  length?: number
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  value: string
}


export function OtpInput({
  autoFocus = false,
  disabled = false,
  invalid = false,
  label = 'Sign-in code',
  length = 6,
  onChange,
  onComplete,
  value,
}: OtpInputProps) {
  const boxes = useRef<Array<HTMLInputElement | null>>([])
  const completed = useRef('')

  const focusAt = (index: number) => boxes.current[Math.max(0, Math.min(index, length - 1))]?.focus()

  function commit(next: string) {
    const clean = next.replace(/\D/g, '').slice(0, length)
    onChange(clean)
    return clean
  }

  // From an effect so paste and autofill count too; once per distinct code.
  useEffect(() => {
    if (value.length === length && completed.current !== value) {
      completed.current = value
      onComplete?.(value)
    }
    if (value.length < length) completed.current = ''
  }, [length, onComplete, value])

  function handleChange(index: number, raw: string) {
    const digits = raw.replace(/\D/g, '')
    if (!digits) return
    const next = commit(value.slice(0, index) + digits + value.slice(index + digits.length))
    focusAt(index + digits.length)
    if (next.length === length) boxes.current[length - 1]?.blur()
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace') {
      event.preventDefault()
      if (value[index]) commit(value.slice(0, index) + value.slice(index + 1))
      else if (index > 0) { commit(value.slice(0, index - 1) + value.slice(index)); focusAt(index - 1) }
      return
    }
    if (event.key === 'ArrowLeft') { event.preventDefault(); focusAt(index - 1) }
    if (event.key === 'ArrowRight') { event.preventDefault(); focusAt(index + 1) }
    if (event.key === 'Home') { event.preventDefault(); focusAt(0) }
    if (event.key === 'End') { event.preventDefault(); focusAt(value.length) }
  }

  function handlePaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '')
    if (!pasted) return
    const next = commit(pasted.length >= length ? pasted : value.slice(0, index) + pasted)
    focusAt(next.length)
  }

  return (
    <fieldset disabled={disabled}>
      <legend className="mb-1.5 block text-[11px] font-bold text-ink">{label}</legend>
      <div className="flex items-center gap-2 sm:gap-2.5">
        {Array.from({ length }, (_, index) => (
          <span className="contents" key={index}>
            {index === length / 2 && <span aria-hidden="true" className="h-px w-2 shrink-0 bg-line" />}
            <input
              aria-label={`Digit ${index + 1} of ${length}`}
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              autoFocus={autoFocus && index === 0}
              className={`h-12 w-full min-w-0 rounded-xl border bg-white text-center text-lg font-black text-ink outline-none transition sm:h-14 ${invalid
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                  : 'border-line focus:border-primary focus:ring-4 focus:ring-primary/15'
                } ${value[index] ? 'bg-primary-light/40' : ''} disabled:opacity-60`}
              inputMode="numeric"
              onChange={(event) => handleChange(index, event.target.value)}
              onFocus={(event) => event.target.select()}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={(event) => handlePaste(index, event)}
              ref={(node) => { boxes.current[index] = node }}
              type="text"
              value={value[index] ?? ''}
            />
          </span>
        ))}
      </div>
    </fieldset>
  )
}
