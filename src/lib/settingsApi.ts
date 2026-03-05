import { getLoggedUser } from './auth'
import type { AppSettings } from './types'

const BASE = '/api/settings'

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  const user = getLoggedUser()
  if (user) headers['x-user-id'] = user.id
  return headers
}

export async function fetchSettings(): Promise<AppSettings | null> {
  const res = await fetch(BASE, { headers: authHeaders() })
  if (!res.ok) throw new Error('failed to fetch settings')
  return res.json()
}

export async function saveSettings(data: Partial<AppSettings>): Promise<AppSettings> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('failed to save settings')
  return res.json()
}
