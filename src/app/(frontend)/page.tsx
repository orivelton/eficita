'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Quote } from '@/lib/types'
import { createEmptyQuote, loadQuotes } from '@/lib/quotes'
import { getLoggedUser, logout, type AuthUser } from '@/lib/auth'
import { LandingPage } from '@/components/landing-page'
import { LoginForm } from '@/components/login-form'
import { AppShell, type NavSection } from '@/components/app-shell'
import { DashboardOverview } from '@/components/dashboard-overview'
import { Dashboard } from '@/components/dashboard'
import { QuoteEditor } from '@/components/quote-editor'
import { PdfExport } from '@/components/pdf-export'
import { SettingsPage } from '@/components/settings-page'
import { UserProfile } from '@/components/user-profile'

type AuthView = 'landing' | 'login'

export type AppView =
  | { type: 'shell'; section: NavSection }
  | { type: 'editor'; quote: Quote }
  | { type: 'pdf'; quote: Quote }

export default function Home() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authView, setAuthView] = useState<AuthView>('landing')
  const [ready, setReady] = useState(false)

  const router = useRouter()

  // restore session
  useEffect(() => {
    const saved = getLoggedUser()
    if (saved) {
      setUser(saved)
      router.replace('/overview')
    }
    setReady(true)
  }, [router])

  const handleLoginSuccess = useCallback(
    (loggedUser: AuthUser) => {
      setUser(loggedUser)
      router.push('/overview')
    },
    [router],
  )

  // Loading placeholder
  if (!ready) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  // not logged in
  if (!user) {
    if (authView === 'login') {
      return <LoginForm onSuccess={handleLoginSuccess} onBack={() => setAuthView('landing')} />
    }
    return <LandingPage onLogin={() => setAuthView('login')} />
  }

  // should never reach here; user is redirected by wrapper
  return null
}
