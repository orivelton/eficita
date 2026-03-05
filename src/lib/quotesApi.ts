import { getLoggedUser } from './auth'
import type { Quote } from './types'

const BASE = '/api/quotes'

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  const user = getLoggedUser()
  if (user) {
    headers['x-user-id'] = user.id
  }
  return headers
}

export async function fetchQuotes(): Promise<Quote[]> {
  const res = await fetch(BASE, { headers: authHeaders() })
  if (!res.ok) throw new Error('failed to fetch quotes')
  return res.json()
}

export async function createQuote(data: Partial<Quote>): Promise<Quote> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('failed to create quote')
  return res.json()
}

export async function updateQuote(id: string, data: Partial<Quote>): Promise<Quote> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('failed to update quote')
  return res.json()
}

export async function deleteQuote(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('failed to delete quote')
}
