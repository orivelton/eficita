'use client'

import { useEffect, useState, PropsWithChildren } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AppShell, type NavSection } from './app-shell'
import { getLoggedUser, logout } from '@/lib/auth'

function getSectionFromPath(path: string): NavSection {
  if (path.startsWith('/proposals')) return 'proposals'
  if (path.startsWith('/settings')) return 'settings'
  if (path.startsWith('/profile')) return 'profile'
  if (path.startsWith('/quote') || path.startsWith('/pdf')) return 'proposals'
  return 'overview'
}

const PROTECTED_ROUTES = ['/overview', '/proposals', '/settings', '/profile', '/quote', '/pdf']

function isProtectedRoute(path: string): boolean {
  return PROTECTED_ROUTES.some((route) => path.startsWith(route))
}

export default function FrontendWrapper({ children }: PropsWithChildren) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const u = getLoggedUser()
    const isProtected = isProtectedRoute(pathname ?? '/')

    if (!u && isProtected) {
      // Not authenticated and trying to access protected route
      router.replace('/')
    } else {
      setUser(u)
      setLoaded(true)
    }
  }, [router, pathname])

  // Unauthenticated user on public route (root) - render without sidebar
  if (!user && pathname === '/') {
    return <>{children}</>
  }

  // Unauthenticated user on protected route - wait for redirect
  if (!user || !loaded) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  // Authenticated user - render with sidebar
  const section = getSectionFromPath(pathname ?? '/')

  return (
    <AppShell
      activeSection={section}
      onNavigate={(s) => router.push(s === 'overview' ? '/overview' : `/${s}`)}
      onNewQuote={() => router.push('/quote/new')}
      user={user}
      onLogout={() => {
        logout()
        router.push('/')
      }}
    >
      {children}
    </AppShell>
  )
}
