export const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://tchopmygrinds.com'

export const SITE_NAME = 'TchopMyGrinds'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-cover.jpg`

export function absoluteUrl(pathname: string): string {
  if (!pathname) return SITE_URL
  if (/^https?:\/\//i.test(pathname)) return pathname
  return `${SITE_URL}${pathname.startsWith('/') ? '' : '/'}${pathname}`
}
