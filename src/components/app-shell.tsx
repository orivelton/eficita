'use client'

import { useState, useCallback, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import type { AuthUser } from '@/lib/auth'
import {
  LayoutDashboard,
  FileText,
  Settings,
  Plus,
  Menu,
  X,
  ChevronLeft,
  LogOut,
  UserCircle,
} from 'lucide-react'
import { NotificationsPanel } from '@/components/notifications-panel'

export type NavSection = 'overview' | 'proposals' | 'settings' | 'profile'

interface AppShellProps {
  activeSection: NavSection
  onNavigate: (section: NavSection) => void
  onNewQuote: () => void
  user: AuthUser
  onLogout: () => void
  children: ReactNode
}

const NAV_ITEMS: { id: NavSection; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Painel', icon: LayoutDashboard },
  { id: 'proposals', label: 'Propostas', icon: FileText },
  { id: 'settings', label: 'Definicoes', icon: Settings },
  { id: 'profile', label: 'Perfil', icon: UserCircle },
]

export function AppShell({
  activeSection,
  onNavigate,
  onNewQuote,
  user,
  onLogout,
  children,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const handleNav = useCallback(
    (section: NavSection) => {
      onNavigate(section)
      setSidebarOpen(false)
    },
    [onNavigate],
  )

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar transition-all duration-300 lg:relative lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'w-[68px]' : 'w-[240px]'}`}
      >
        {/* Sidebar header */}
        <div
          className={`flex h-16 shrink-0 items-center border-b border-sidebar-border ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}
        >
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
                <FileText className="h-4 w-4 text-sidebar-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-sidebar-foreground leading-tight">
                  Orcamentos
                </p>
                <p className="text-[10px] text-sidebar-muted leading-none">Gestor Pro</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <FileText className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className={`flex-1 overflow-y-auto py-4 ${collapsed ? 'px-2' : 'px-3'}`}>
          {/* New quote button */}
          <div className="mb-4">
            <Button
              onClick={() => {
                onNewQuote()
                setSidebarOpen(false)
              }}
              className={`w-full ${collapsed ? 'h-10 px-0' : 'justify-start'}`}
              size="sm"
            >
              <Plus className={`h-4 w-4 ${collapsed ? '' : 'mr-2'}`} />
              {!collapsed && <span>Nova Proposta</span>}
            </Button>
          </div>

          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && item.label}
                </button>
              )
            })}
          </div>
        </nav>

        {/* User + collapse */}
        <div className="shrink-0 border-t border-sidebar-border p-3">
          {/* User info */}
          <div
            className={`mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2 ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
              {user.avatar}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-sidebar-foreground">
                  {user.name}
                </p>
                <p className="truncate text-[10px] text-sidebar-muted">{user.company}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={onLogout}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                title="Terminar sessao"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {collapsed && (
            <button
              onClick={onLogout}
              className="mb-2 flex w-full items-center justify-center rounded-lg py-2 text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              title="Terminar sessao"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
          {/* Collapse toggle -- desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground lg:flex ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <ChevronLeft
              className={`h-4 w-4 shrink-0 transition-transform ${collapsed ? 'rotate-180' : ''}`}
            />
            {!collapsed && 'Recolher'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top header bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary lg:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu</span>
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <NotificationsPanel />
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-xs text-muted-foreground">{user.name}</span>
            </div>
            <button
              onClick={() => onNavigate('profile')}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
              title="Abrir perfil"
            >
              {user.avatar}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
