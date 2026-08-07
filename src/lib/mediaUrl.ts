import { env } from '../config/env'

/** Resolves a stored media path against the API host; absolute URLs pass through. */
export function mediaUrl(url: string) {
  if (/^https?:\/\//.test(url)) return url
  return `${env.apiUrl?.replace(/\/$/, '') ?? ''}/${url.replace(/^\/+/, '')}`
}
