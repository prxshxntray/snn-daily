import { ChevronLeft, Settings } from 'lucide-react'
import type { ReactNode } from 'react'
import { go } from '@/lib/route.ts'
import type { Route } from '@/lib/route.ts'

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 32" className={className} aria-hidden="true">
      <path
        d="M2 20 H16 L24 20 L30 7 L38 27 L46 20 H62"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Screen({ children }: { children: ReactNode }) {
  return <div className="screen-in">{children}</div>
}

export function SettingsButton() {
  return (
    <button
      type="button"
      aria-label="Settings"
      className="flex size-12 items-center justify-center rounded-full text-paper outline-none focus-visible:ring-2 focus-visible:ring-sage/70"
      onClick={() => go('/settings')}
    >
      <Settings className="size-5" />
    </button>
  )
}

export function BackButton({ to, label }: { to: string; label: string }) {
  return (
    <button
      type="button"
      className="flex min-h-12 items-center gap-1 rounded-full pr-3 text-sm text-mute outline-none focus-visible:ring-2 focus-visible:ring-sage/70"
      onClick={() => go(to)}
    >
      <ChevronLeft className="size-5" />
      {label}
    </button>
  )
}

const TABS: { name: Route['name']; href: string; label: string }[] = [
  { name: 'learn', href: '/learn', label: 'Learn' },
  { name: 'review', href: '/review', label: 'Review' },
  { name: 'profile', href: '/profile', label: 'Profile' },
]

export function TabBar({ current }: { current: Route['name'] }) {
  const active = current
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line/80 bg-ink/92 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto grid max-w-[480px] grid-cols-4">
        {TABS.map((tab) => {
          const selected = active === tab.name
          return (
            <button
              key={tab.name}
              type="button"
              aria-current={selected ? 'page' : undefined}
              className={`min-h-16 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sage/70 ${
                selected ? 'text-sage' : 'text-mute'
              }`}
              onClick={() => go(tab.href)}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
