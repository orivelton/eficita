import { getLoggedUser } from './auth'
import type { SavedClient } from './types'

const BASE = '/api/clients'

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  const user = getLoggedUser()
  if (user) {
    headers['x-user-id'] = user.id
  }
  return headers
}

export async function fetchClients(): Promise<SavedClient[]> {
  const res = await fetch(BASE, { headers: authHeaders() })
  if (!res.ok) throw new Error('failed to fetch clients')
  return res.json()
}

export async function createClient(data: Omit<SavedClient, 'id'>): Promise<SavedClient> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('failed to create client')
  return res.json()
}

export async function updateClient(id: string, data: Partial<SavedClient>): Promise<SavedClient> {
  const res = await fetch(BASE, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('failed to update client')
  return res.json()
}

export async function deleteClient(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('failed to delete client')
}
