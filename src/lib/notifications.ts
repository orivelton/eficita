const NOTIFICATIONS_KEY = 'orcamentos-notifications'

import type { AppNotification, NotificationType } from './types'
export type { AppNotification, NotificationType }

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

import * as notificationsApi from './notificationsApi'

export async function loadNotifications(): Promise<AppNotification[]> {
  if (typeof window === 'undefined') return []
  try {
    const docs = await notificationsApi.fetchNotifications()
    if (docs.length === 0) {
      // first time user – seed local data and also try to persist seeds upstream
      const seeds = getInitialNotifications()
      saveNotifications(seeds)
      try {
        await Promise.all(seeds.map((n) => notificationsApi.createNotification(n as any)))
      } catch (e) {
        console.warn('failed to persist seed notifications', e)
      }
      return seeds
    }
    return docs
  } catch (err) {
    console.warn('fetchNotifications failed, falling back to localStorage', err)
    try {
      const data = localStorage.getItem(NOTIFICATIONS_KEY)
      if (data) return JSON.parse(data)
    } catch {
      // ignore
    }
    const seeds = getInitialNotifications()
    saveNotifications(seeds)
    return seeds
  }
}

export function saveNotifications(notifications: AppNotification[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
}

export async function addNotification(
  type: NotificationType,
  title: string,
  message: string,
): Promise<AppNotification[]> {
  const n: AppNotification = {
    id: generateId(),
    type,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  }
  try {
    await notificationsApi.createNotification(n as any)
    return await loadNotifications()
  } catch (err) {
    console.warn('createNotification API failed, storing locally', err)
    const notifications = await loadNotifications()
    notifications.unshift(n)
    saveNotifications(notifications)
    return notifications
  }
}

export async function markAsRead(id: string): Promise<AppNotification[]> {
  try {
    await notificationsApi.updateNotification(id, { read: true })
  } catch (err) {
    console.warn('updateNotification API failed', err)
  }
  const notifications = await loadNotifications()
  const idx = notifications.findIndex((n) => n.id === id)
  if (idx >= 0) notifications[idx].read = true
  saveNotifications(notifications)
  return notifications
}

export async function markAllAsRead(): Promise<AppNotification[]> {
  try {
    const all = await loadNotifications()
    await Promise.all(all.map((n) => notificationsApi.updateNotification(n.id, { read: true })))
  } catch (err) {
    console.warn('markAllAsRead API failed', err)
  }
  const notifications = (await loadNotifications()).map((n) => ({ ...n, read: true }))
  saveNotifications(notifications)
  return notifications
}

export async function deleteNotification(id: string): Promise<AppNotification[]> {
  try {
    await notificationsApi.deleteNotification(id)
  } catch (err) {
    console.warn('deleteNotification API failed', err)
  }
  const notifications = (await loadNotifications()).filter((n) => n.id !== id)
  saveNotifications(notifications)
  return notifications
}

export async function clearAllNotifications(): Promise<AppNotification[]> {
  try {
    const all = await loadNotifications()
    await Promise.all(all.map((n) => notificationsApi.deleteNotification(n.id)))
  } catch (err) {
    console.warn('clearAllNotifications API failed', err)
  }
  saveNotifications([])
  return []
}

function getInitialNotifications(): AppNotification[] {
  const now = new Date()
  return [
    {
      id: generateId(),
      type: 'success',
      title: 'Proposta aceite',
      message: 'O cliente Jorge Mendes aceitou o orcamento ORC-2026-0012 no valor de 4.500,00 EUR.',
      read: false,
      createdAt: new Date(now.getTime() - 1000 * 60 * 25).toISOString(),
    },
    {
      id: generateId(),
      type: 'warning',
      title: 'Orcamento a expirar',
      message: 'O orcamento ORC-2026-0008 para Maria Costa expira em 3 dias.',
      read: false,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: generateId(),
      type: 'quote',
      title: 'Nova proposta criada',
      message:
        'A proposta ORC-2026-0015 foi criada com sucesso para o projeto Remodelacao Escritorio.',
      read: false,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: generateId(),
      type: 'info',
      title: 'Bem-vindo ao Orcamentos Pro',
      message: 'Configure a sua empresa e comece a criar propostas profissionais em minutos.',
      read: true,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ]
}

export const NOTIFICATION_TYPE_CONFIG: Record<
  NotificationType,
  { icon: string; color: string; bgColor: string }
> = {
  info: { icon: 'info', color: '#3b82f6', bgColor: '#eff6ff' },
  success: { icon: 'check', color: '#16a34a', bgColor: '#f0fdf4' },
  warning: { icon: 'alert', color: '#d97706', bgColor: '#fffbeb' },
  quote: { icon: 'file', color: '#6366f1', bgColor: '#eef2ff' },
}
