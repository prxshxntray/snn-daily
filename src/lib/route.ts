export type Route =
  | { name: 'learn' }
  | { name: 'review' }
  | { name: 'glossary' }
  | { name: 'profile' }
  | { name: 'play'; id: string }

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '') || '/'
  const parts = path.split('?')[0]?.split('/').filter(Boolean) ?? []
  if (parts.length === 0 || parts[0] === 'learn') return { name: 'learn' }
  if (parts[0] === 'review') return { name: 'review' }
  if (parts[0] === 'glossary') return { name: 'glossary' }
  if (parts[0] === 'profile') return { name: 'profile' }
  if (parts[0] === 'play' && parts[1]) return { name: 'play', id: parts[1] }
  return { name: 'learn' }
}

export function go(path: string): void {
  const next = path.startsWith('#') ? path : `#${path}`
  if (window.location.hash === next) return
  window.location.hash = next
}
