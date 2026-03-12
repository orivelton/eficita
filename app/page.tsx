"use client"

import { useState, useCallback, useEffect } from "react"
import type { Quote } from "@/lib/types"
import { createEmptyQuote, loadQuotes } from "@/lib/quotes"
import { getLoggedUser, logout, type MockUser } from "@/lib/auth"
import { LandingPage } from "@/components/landing-page"
import { LoginForm } from "@/components/login-form"
import { AppShell, type NavSection } from "@/components/app-shell"
import { DashboardOverview } from "@/components/dashboard-overview"
import { Dashboard } from "@/components/dashboard"
import { QuoteEditor } from "@/components/quote-editor"
import { PdfExport } from "@/components/pdf-export"
import { SettingsPage } from "@/components/settings-page"
import { UserProfile } from "@/components/user-profile"
import { FreeQuoteCreator } from "@/components/free-quote-creator"

type AuthView = "landing" | "login" | "free-creator"

type AppView =
  | { type: "shell"; section: NavSection }
  | { type: "editor"; quote: Quote }
  | { type: "pdf"; quote: Quote }

export default function Home() {
  const [user, setUser] = useState<MockUser | null>(null)
  const [authView, setAuthView] = useState<AuthView>("landing")
  const [appView, setAppView] = useState<AppView>({ type: "shell", section: "overview" })
  const [ready, setReady] = useState(false)

  // Restore session on mount
  useEffect(() => {
    const saved = getLoggedUser()
    if (saved) setUser(saved)
    setReady(true)
  }, [])

  const handleLoginSuccess = useCallback((loggedUser: MockUser) => {
    setUser(loggedUser)
    setAppView({ type: "shell", section: "overview" })
  }, [])

  const handleUserUpdate = useCallback((updatedUser: MockUser) => {
    setUser(updatedUser)
  }, [])

  const handleLogout = useCallback(() => {
    logout()
    setUser(null)
    setAuthView("landing")
    setAppView({ type: "shell", section: "overview" })
  }, [])

  const handleEditQuote = useCallback((quote: Quote) => {
    setAppView({ type: "editor", quote })
  }, [])

  const handleExportPdf = useCallback((quote: Quote) => {
    setAppView({ type: "pdf", quote })
  }, [])

  const handleBackToDashboard = useCallback(() => {
    setAppView({ type: "shell", section: "proposals" })
  }, [])

  const handleNewQuote = useCallback(() => {
    const current = loadQuotes()
    const newQuote = createEmptyQuote(current)
    setAppView({ type: "editor", quote: newQuote })
  }, [])

  // Loading state to avoid flash
  if (!ready) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  // Not logged in: show landing, login, or free creator
  if (!user) {
    if (authView === "login") {
      return (
        <LoginForm
          onSuccess={handleLoginSuccess}
          onBack={() => setAuthView("landing")}
        />
      )
    }
    if (authView === "free-creator") {
      return (
        <FreeQuoteCreator
          onBack={() => setAuthView("landing")}
          onUpgrade={() => setAuthView("login")}
        />
      )
    }
    return (
      <LandingPage
        onLogin={() => setAuthView("login")}
        onTryFree={() => setAuthView("free-creator")}
      />
    )
  }

  // Logged in: full-screen views
  if (appView.type === "editor") {
    return (
      <QuoteEditor
        initialQuote={appView.quote}
        onBack={handleBackToDashboard}
        onExportPdf={handleExportPdf}
      />
    )
  }

  if (appView.type === "pdf") {
    return (
      <PdfExport
        quote={appView.quote}
        onBack={() => setAppView({ type: "editor", quote: appView.quote })}
      />
    )
  }

  // Logged in: dashboard shell
  return (
    <AppShell
      activeSection={appView.section}
      onNavigate={(section) => setAppView({ type: "shell", section })}
      onNewQuote={handleNewQuote}
      user={user}
      onLogout={handleLogout}
    >
      {appView.section === "overview" && (
        <DashboardOverview
          onNavigateToProposals={() =>
            setAppView({ type: "shell", section: "proposals" })
          }
          onEditQuote={handleEditQuote}
        />
      )}
      {appView.section === "proposals" && (
        <Dashboard
          onEditQuote={handleEditQuote}
          onExportPdf={handleExportPdf}
          onNewQuote={handleNewQuote}
        />
      )}
      {appView.section === "settings" && <SettingsPage />}
      {appView.section === "profile" && (
        <UserProfile user={user} onUserUpdate={handleUserUpdate} />
      )}
    </AppShell>
  )
}
