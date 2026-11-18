import { useEffect, useState } from 'react'
import { parseRoute, go, type Route } from '@/lib/route.ts'
import { GlossaryScreen } from '@/screens/GlossaryScreen.tsx'
import { LearnScreen } from '@/screens/LearnScreen.tsx'
import { PlayScreen } from '@/screens/PlayScreen.tsx'
import { ProfileScreen } from '@/screens/ProfileScreen.tsx'
import { ReviewScreen } from '@/screens/ReviewScreen.tsx'
import { StudyProvider } from '@/state/StudyContext.tsx'

function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash))
  useEffect(() => {
    const onHash = () => setRoute(parseRoute(window.location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route])
  return route
}

const TABS = [
  { name: 'learn' as const, href: '/learn', label: 'Learn' },
  { name: 'review' as const, href: '/review', label: 'Review' },
  { name: 'glossary' as const, href: '/glossary', label: 'Glossary' },
  { name: 'profile' as const, href: '/profile', label: 'Profile' },
]

function Shell() {
  const route = useRoute()
  const hide = route.name === 'play'
  return (
    <div className="min-h-dvh bg-frame text-paper">
      <div className="mx-auto min-h-dvh max-w-[480px] bg-ink">
        {route.name === 'learn' ? <LearnScreen /> : null}
        {route.name === 'review' ? <ReviewScreen /> : null}
        {route.name === 'glossary' ? <GlossaryScreen /> : null}
        {route.name === 'profile' ? <ProfileScreen /> : null}
        {route.name === 'play' ? <PlayScreen id={route.id} /> : null}
        {hide ? null : (
          <nav
            aria-label="Primary"
            className="fixed inset-x-0 bottom-0 z-30 border-t border-line/80 bg-ink/95 backdrop-blur-md"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="mx-auto grid max-w-[480px] grid-cols-4">
              {TABS.map((tab) => {
                const selected = route.name === tab.name
                return (
                  <button
                    key={tab.name}
                    type="button"
                    aria-current={selected ? 'page' : undefined}
                    className={`min-h-16 text-sm ${selected ? 'text-sage' : 'text-mute'}`}
                    onClick={() => go(tab.href)}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <StudyProvider>
      <Shell />
    </StudyProvider>
  )
}
