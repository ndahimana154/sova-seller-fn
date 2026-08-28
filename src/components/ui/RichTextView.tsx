const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g

/** Older versions were stored as a small markdown subset; they stay readable. */
function legacyToHtml(text: string): string {
  const escape = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const inline = (value: string) =>
    escape(value)
      .split(INLINE)
      .map((piece) => {
        if (piece.startsWith('**') && piece.endsWith('**')) return `<strong>${piece.slice(2, -2)}</strong>`
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(piece)
        return link ? `<a href="${link[2]}" rel="noreferrer" target="_blank">${link[1]}</a>` : piece
      })
      .join('')

  const lines = text.split('\n').filter((line) => line.trim())
  const html: string[] = []
  let list: string[] = []
  const flush = () => {
    if (list.length) { html.push(`<ul>${list.join('')}</ul>`); list = [] }
  }
  for (const line of lines) {
    if (line.startsWith('## ')) { flush(); html.push(`<h3>${inline(line.slice(3))}</h3>`) }
    else if (line.startsWith('- ')) list.push(`<li>${inline(line.slice(2))}</li>`)
    else { flush(); html.push(`<p>${inline(line)}</p>`) }
  }
  flush()
  return html.join('')
}

const isHtml = (value: string) => /<[a-z][\s\S]*>/i.test(value)

/**
 * Content is sanitised on the server before it is ever stored, so what reaches
 * here is already an allowlisted subset.
 */
export function RichTextView({ className = '', html }: { className?: string; html: string }) {
  const body = isHtml(html) ? html : legacyToHtml(html)
  if (!body.trim()) return <p className="text-xs text-muted">Nothing published yet.</p>
  return <div className={`rich-text-body ${className}`} dangerouslySetInnerHTML={{ __html: body }} />
}
