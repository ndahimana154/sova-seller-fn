/**
 * Tailwind recipes for patterns repeated across screens. These replace the old
 * `@apply` component classes so every style lives with the markup that uses it.
 */
export const ui = {
  /** Full-width submit used by every form inside the auth shell. */
  authSubmit:
    'flex min-h-10 w-full items-center justify-center rounded-xl bg-primary px-5 text-xs font-black text-white shadow-[0_10px_24px_rgb(23_26_31/0.18)] transition hover:-translate-y-0.5 hover:bg-primary-dark disabled:pointer-events-none disabled:opacity-65',

  card: 'rounded-2xl border border-line bg-white shadow-card',

  /** Small-caps label above a heading. */
  eyebrow: 'text-[10px] font-black uppercase tracking-[0.2em] text-muted',

  /** Dashed placeholder note; callers add their own padding. */
  hint: 'rounded-xl border border-dashed border-line bg-soft/50 text-center text-[11px] text-muted',

  /** Inline text link inside body copy. */
  inlineLink: 'text-xs font-bold text-ink underline-offset-2 hover:underline',

  /** Width and rhythm for a marketing section on the public site. */
  publicSection: 'mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8 py-12 sm:py-18',

  dropzone:
    'flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-line bg-soft/40 px-5 py-7 text-center transition hover:border-ink/35 hover:bg-soft',

  /** Wraps an input; children are styled through it so callers stay plain. */
  formControl:
    'flex min-h-10 items-center rounded-xl border border-line bg-white px-3 focus-within:border-ink focus-within:ring-4 focus-within:ring-ink/10 has-[input:disabled]:border-line/70 has-[input:disabled]:bg-soft [&_input]:min-w-0 [&_input]:flex-1 [&_input]:bg-transparent [&_input]:py-2 [&_input]:text-xs [&_input]:text-ink [&_input]:outline-none [&_input]:disabled:cursor-not-allowed [&_input]:disabled:text-muted [&_select]:min-w-0 [&_select]:flex-1 [&_select]:bg-transparent [&_select]:py-2 [&_select]:text-xs [&_select]:outline-none [&_textarea]:min-w-0 [&_textarea]:flex-1 [&_textarea]:bg-transparent [&_textarea]:py-2 [&_textarea]:text-xs [&_textarea]:outline-none',

  iconButton:
    'grid size-8 shrink-0 place-items-center rounded-full border border-line bg-white text-muted transition-colors hover:border-ink/25 hover:bg-soft hover:text-ink',

  input:
    'mt-2 flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white px-3.5 transition focus-within:border-ink focus-within:ring-4 focus-within:ring-ink/10 [&_input]:min-w-0 [&_input]:flex-1 [&_input]:bg-transparent [&_input]:py-3 [&_input]:text-sm [&_input]:text-ink [&_input]:outline-none [&_input]:placeholder:text-muted/65 [&_input]:disabled:cursor-not-allowed [&_input]:disabled:text-muted [&_select]:min-w-0 [&_select]:flex-1 [&_select]:bg-transparent [&_select]:py-3 [&_select]:text-sm [&_select]:outline-none [&_textarea]:min-w-0 [&_textarea]:flex-1 [&_textarea]:bg-transparent [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:outline-none',

  mediaAction:
    'grid size-7 place-items-center rounded-full bg-white/95 text-ink transition hover:bg-white',
  mediaBadge:
    'absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[9px] font-bold text-white shadow-sm',
  mediaCaption:
    'absolute inset-x-0 bottom-0 z-10 truncate bg-ink/75 px-2 py-1 text-[9px] font-semibold text-white',
  mediaOverlay:
    'absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 bg-gradient-to-t from-ink/80 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100',
  mediaTile:
    'relative aspect-square overflow-hidden rounded-xl border border-line bg-soft [&_img]:size-full [&_img]:object-cover [&_video]:size-full [&_video]:object-cover',

  outlineButton:
    'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-line bg-white px-4 text-xs font-bold text-muted transition hover:border-ink/25 hover:bg-soft hover:text-ink disabled:opacity-60',

  plainInput:
    'block h-10 w-full rounded-xl border border-line bg-white px-3 text-xs outline-none focus:border-ink focus:ring-4 focus:ring-ink/10',

  primaryButton:
    'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-xs font-bold text-white shadow-[0_7px_18px_rgb(23_26_31/0.16)] transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60',

  table:
    'w-full border-collapse text-left text-xs [&_td]:whitespace-nowrap [&_td]:border-b [&_td]:border-line [&_td]:px-3.5 [&_td]:py-2.5 [&_td]:text-muted [&_th]:whitespace-nowrap [&_th]:px-3.5 [&_th]:py-2.5 [&_th]:text-[11px] [&_th]:font-semibold [&_thead]:border-b [&_thead]:border-line [&_thead]:bg-canvas [&_thead]:text-muted [&_tbody_tr]:bg-white [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-canvas [&_tbody_tr:last-child>td]:border-b-0',
} as const
