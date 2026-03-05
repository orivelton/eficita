'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  loadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  NOTIFICATION_TYPE_CONFIG,
  type AppNotification,
  type NotificationType,
} from '@/lib/notifications'
import { Button } from '@/components/ui/button'
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Info,
  CheckCircle2,
  AlertTriangle,
  FileText,
  X,
} from 'lucide-react'

const ICON_MAP = {
  info: Info,
  check: CheckCircle2,
  alert: AlertTriangle,
  file: FileText,
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Agora'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ;(async () => {
      const n = await loadNotifications()
      setNotifications(n)
    })()
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkRead = useCallback(async (id: string) => {
    const updated = await markAsRead(id)
    setNotifications(updated)
  }, [])

  const handleMarkAllRead = useCallback(async () => {
    const updated = await markAllAsRead()
    setNotifications(updated)
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    const updated = await deleteNotification(id)
    setNotifications(updated)
  }, [])

  const handleClearAll = useCallback(async () => {
    const updated = await clearAllNotifications()
    setNotifications(updated)
    setOpen(false)
  }, [])

  return (
    <div ref={panelRef} className="relative">
      {/* Bell trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        aria-label="Notificacoes"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">Notificacoes</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  title="Marcar todas como lidas"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Sem notificacoes</p>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = NOTIFICATION_TYPE_CONFIG[n.type as NotificationType]
                const IconComp = ICON_MAP[cfg.icon as keyof typeof ICON_MAP] || Info
                return (
                  <div
                    key={n.id}
                    className={`group relative flex gap-3 border-b border-border/50 px-4 py-3 transition-colors last:border-0 hover:bg-secondary/30 ${
                      !n.read ? 'bg-primary/[0.03]' : ''
                    }`}
                  >
                    {/* Unread dot */}
                    {!n.read && (
                      <div className="absolute left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary" />
                    )}

                    {/* Icon */}
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: cfg.bgColor }}
                    >
                      <IconComp className="h-4 w-4" style={{ color: cfg.color }} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-xs leading-snug ${!n.read ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}
                        >
                          {n.title}
                        </p>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                        {n.message}
                      </p>

                      {/* Actions on hover */}
                      <div className="mt-1.5 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {!n.read && (
                          <button
                            onClick={() => handleMarkRead(n.id)}
                            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          >
                            <Check className="h-3 w-3" />
                            Lida
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(n.id)}
                          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                          Apagar
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-border px-4 py-2.5">
              <button
                onClick={handleClearAll}
                className="w-full rounded-lg py-1.5 text-center text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Limpar todas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
