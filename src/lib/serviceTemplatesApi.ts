import { getLoggedUser } from './auth'
import type { ServiceTemplate } from './types'

const BASE = '/api/service-templates'

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  const user = getLoggedUser()
  if (user) headers['x-user-id'] = user.id
  return headers
}

export async function fetchServiceTemplates(): Promise<ServiceTemplate[]> {
  const res = await fetch(BASE, { headers: authHeaders() })
  if (!res.ok) throw new Error('failed to fetch service templates')
  return res.json()
}

export async function createServiceTemplate(
  data: Partial<ServiceTemplate>,
): Promise<ServiceTemplate> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('failed to create service template')
  return res.json()
}

export async function updateServiceTemplate(
  id: string,
  data: Partial<ServiceTemplate>,
): Promise<ServiceTemplate> {
  const res = await fetch(BASE, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ id, ...data }),
  })
  if (!res.ok) throw new Error('failed to update service template')
  return res.json()
}

export async function deleteServiceTemplate(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ id }),
  })
  if (!res.ok) throw new Error('failed to delete service template')
}
