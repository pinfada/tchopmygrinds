/**
 * Données injectées par Rails dans la page hôte du SPA
 * (`app/views/pages/react_app.html.erb`).
 */
export interface RailsData {
  csrfToken: string
  currentUser: unknown | null
  /** Origine publique + préfixe de montage. */
  apiBaseUrl: string
  /** Préfixe de montage seul — `/` quand l'application est servie à la racine. */
  basePath: string
  environment: string
}

function readRailsData(): Partial<RailsData> {
  if (typeof window === 'undefined') return {}
  return (window as Window & { railsData?: Partial<RailsData> }).railsData ?? {}
}

/**
 * Préfixe sous lequel Rails sert l'application, sans barre finale, ou chaîne
 * vide à la racine. Non vide uniquement quand l'hôte pose
 * `RAILS_RELATIVE_URL_ROOT` — c'est le cas de la démonstration railsbox,
 * publiée sous `/<depot>/app/`. Toute URL absolue construite côté client
 * (appels d'API, liens) doit le porter, sinon elle sort du périmètre servi.
 */
export function getMountPrefix(): string {
  const basePath = readRailsData().basePath
  if (!basePath || basePath === '/') return ''
  return basePath.replace(/\/+$/, '')
}

/** `basename` attendu par React Router : le préfixe, ou `/` à la racine. */
export function getRouterBasename(): string {
  return getMountPrefix() || '/'
}
