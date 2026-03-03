const NOTIFICATIONS_KEY = "orcamentos-notifications"

export type NotificationType = "info" | "success" | "warning" | "quote"

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

export function loadNotifications(): AppNotification[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(NOTIFICATIONS_KEY)
    if (data) return JSON.parse(data)
  } catch { /* ignore */ }
  // Seed with demo notifications on first load
  const seeds = getInitialNotifications()
  saveNotifications(seeds)
  return seeds
}

export function saveNotifications(notifications: AppNotification[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
}

export function addNotification(
  type: NotificationType,
  title: string,
  message: string
): AppNotification[] {
  const notifications = loadNotifications()
  const n: AppNotification = {
    id: generateId(),
    type,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  }
  notifications.unshift(n)
  saveNotifications(notifications)
  return notifications
}

export function markAsRead(id: string): AppNotification[] {
  const notifications = loadNotifications()
  const idx = notifications.findIndex((n) => n.id === id)
  if (idx >= 0) notifications[idx].read = true
  saveNotifications(notifications)
  return notifications
}

export function markAllAsRead(): AppNotification[] {
  const notifications = loadNotifications().map((n) => ({ ...n, read: true }))
  saveNotifications(notifications)
  return notifications
}

export function deleteNotification(id: string): AppNotification[] {
  const notifications = loadNotifications().filter((n) => n.id !== id)
  saveNotifications(notifications)
  return notifications
}

export function clearAllNotifications(): AppNotification[] {
  saveNotifications([])
  return []
}

function getInitialNotifications(): AppNotification[] {
  const now = new Date()
  return [
    {
      id: generateId(),
      type: "success",
      title: "Proposta aceite",
      message: "O cliente Jorge Mendes aceitou o orcamento ORC-2026-0012 no valor de 4.500,00 EUR.",
      read: false,
      createdAt: new Date(now.getTime() - 1000 * 60 * 25).toISOString(),
    },
    {
      id: generateId(),
      type: "warning",
      title: "Orcamento a expirar",
      message: "O orcamento ORC-2026-0008 para Maria Costa expira em 3 dias.",
      read: false,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: generateId(),
      type: "quote",
      title: "Nova proposta criada",
      message: "A proposta ORC-2026-0015 foi criada com sucesso para o projeto Remodelacao Escritorio.",
      read: false,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: generateId(),
      type: "info",
      title: "Bem-vindo ao Orcamentos Pro",
      message: "Configure a sua empresa e comece a criar propostas profissionais em minutos.",
      read: true,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ]
}

export const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, { icon: string; color: string; bgColor: string }> = {
  info: { icon: "info", color: "#3b82f6", bgColor: "#eff6ff" },
  success: { icon: "check", color: "#16a34a", bgColor: "#f0fdf4" },
  warning: { icon: "alert", color: "#d97706", bgColor: "#fffbeb" },
  quote: { icon: "file", color: "#6366f1", bgColor: "#eef2ff" },
}
