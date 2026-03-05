import { getLoggedUser } from './auth'
import type { NotesTemplate } from './types'

const BASE = '/api/templates'

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  const user = getLoggedUser()
  if (user) headers['x-user-id'] = user.id
  return headers
}

export async function fetchTemplates(): Promise<NotesTemplate[]> {
  const res = await fetch(BASE, { headers: authHeaders() })
  if (!res.ok) throw new Error('failed to fetch templates')
  return res.json()
}

export async function createTemplate(data: Partial<NotesTemplate>): Promise<NotesTemplate> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('failed to create template')
  return res.json()
}

export async function updateTemplate(
  id: string,
  data: Partial<NotesTemplate>,
): Promise<NotesTemplate> {
  const res = await fetch(BASE, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ id, ...data }),
  })
  if (!res.ok) throw new Error('failed to update template')
  return res.json()
}

export async function deleteTemplate(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ id }),
  })
  if (!res.ok) throw new Error('failed to delete template')
}
