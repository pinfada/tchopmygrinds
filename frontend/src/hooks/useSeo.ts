import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  SITE_NAME,
  SITE_URL,
  DEFAULT_OG_IMAGE,
  absoluteUrl,
} from '../utils/seo'

type JsonLd = Record<string, unknown> | Record<string, unknown>[]

interface SeoOptions {
  title: string
  description: string
  /** Path to canonicalize; falls back to current pathname */
  canonicalPath?: string
  /** Absolute or root-relative OG image */
  image?: string
  /** "website" | "article" | "product" ... */
  ogType?: string
  /** Block indexing for private/transactional routes */
  noindex?: boolean
  /** One or more JSON-LD payloads */
  jsonLd?: JsonLd
}

// Aligned with the server-rendered shell (app/views/pages/react_app.html.erb):
// route-scoped <script type="application/ld+json" data-seo-route="true"> blocks
// are removed/recreated by this hook on every route change, so server-emitted
// and client-emitted payloads never duplicate.
const ROUTE_JSONLD_ATTR = 'data-seo-route'

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    document.head.appendChild(el)
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

function clearManagedJsonLd() {
  document.head
    .querySelectorAll(`script[type="application/ld+json"][${ROUTE_JSONLD_ATTR}="true"]`)
    .forEach((n) => n.parentNode?.removeChild(n))
}

function appendJsonLd(payload: JsonLd) {
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.setAttribute(ROUTE_JSONLD_ATTR, 'true')
  script.text = JSON.stringify(payload)
  document.head.appendChild(script)
}

export function useSeo(opts: SeoOptions): void {
  const location = useLocation()

  useEffect(() => {
    const canonical = absoluteUrl(opts.canonicalPath ?? location.pathname + location.search)
    const image = opts.image
      ? opts.image.startsWith('http')
        ? opts.image
        : absoluteUrl(opts.image)
      : DEFAULT_OG_IMAGE

    document.title = opts.title

    upsertMeta('meta[name="description"]', {
      name: 'description',
      content: opts.description,
    })

    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: opts.noindex
        ? 'noindex,nofollow'
        : 'index,follow,max-image-preview:large,max-snippet:-1',
    })

    upsertLink('canonical', canonical)

    // Open Graph
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: opts.title })
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: opts.description,
    })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: opts.ogType ?? 'website' })
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image })
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME })
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: 'fr_FR' })

    // Twitter
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: opts.title })
    upsertMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: opts.description,
    })
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image })

    // Route-scoped JSON-LD (cleared on unmount/change)
    clearManagedJsonLd()
    if (opts.jsonLd) {
      const payloads = Array.isArray(opts.jsonLd) ? opts.jsonLd : [opts.jsonLd]
      payloads.forEach(appendJsonLd)
    }

    return () => {
      clearManagedJsonLd()
    }
  }, [
    opts.title,
    opts.description,
    opts.canonicalPath,
    opts.image,
    opts.ogType,
    opts.noindex,
    opts.jsonLd,
    location.pathname,
    location.search,
  ])
}

export function breadcrumbsJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export { SITE_URL, SITE_NAME, absoluteUrl }
