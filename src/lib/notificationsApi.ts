import { getLoggedUser } from './auth'
import type { AppNotification } from './types'

const BASE = '/api/notifications'

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  const user = getLoggedUser()
  if (user) {
    headers['x-user-id'] = user.id
  }
  return headers
}

export async function fetchNotifications(): Promise<AppNotification[]> {
  const res = await fetch(BASE, { headers: authHeaders() })
  if (!res.ok) throw new Error('failed to fetch notifications')
  return res.json()
}

export async function createNotification(
  data: Omit<AppNotification, 'id'>,
): Promise<AppNotification> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('failed to create notification')
  return res.json()
}

export async function updateNotification(
  id: string,
  data: Partial<AppNotification>,
): Promise<AppNotification> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ id, ...data }),
  })
  if (!res.ok) throw new Error('failed to update notification')
  return res.json()
}

export async function deleteNotification(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ id }),
  })
  if (!res.ok) throw new Error('failed to delete notification')
}
