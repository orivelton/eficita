import { getLoggedUser } from './auth'
import type { SavedCompany } from './types'

const BASE = '/api/companies'

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  const user = getLoggedUser()
  if (user) {
    headers['x-user-id'] = user.id
  }
  return headers
}

export async function fetchCompanies(): Promise<SavedCompany[]> {
  const res = await fetch(BASE, { headers: authHeaders() })
  if (!res.ok) throw new Error('failed to fetch companies')
  return res.json()
}

export async function createCompany(data: Omit<SavedCompany, 'id'>): Promise<SavedCompany> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('failed to create company')
  return res.json()
}

export async function updateCompany(
  id: string,
  data: Partial<SavedCompany>,
): Promise<SavedCompany> {
  const res = await fetch(BASE, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('failed to update company')
  return res.json()
}

export async function deleteCompany(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('failed to delete company')
}
