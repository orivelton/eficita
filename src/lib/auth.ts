// simple wrapper around the login API that persists a small session blob in localStorage

const AUTH_KEY = 'orcamentos-auth'

// shape used by the app for display; we map the raw payload user into this
export interface AuthUser {
  id: string
  name: string
  email: string
  avatar: string
  company?: string
}

export interface AuthData {
  user: AuthUser
  token: string
}

interface ServerLoginResponse {
  success: boolean
  user?: Record<string, any>
  token?: string
  message?: string
  error?: string
}

function mapPayloadUser(raw: Record<string, any>): AuthUser {
  const email: string = raw.email
  const name: string = raw.name || email
  const company: string | undefined = raw.company || raw.companyName
  const avatar = name
    ? name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : email.slice(0, 2).toUpperCase()

  return {
    id: raw.id,
    name,
    email,
    avatar,
    company,
  }
}

/**
 * Attempt to authenticate against the new `/api/auth/login` route.
 */
export async function login(
  email: string,
  password: string,
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const resp = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data: ServerLoginResponse = await resp.json()
    if (resp.ok && data.success && data.user) {
      const mapped = mapPayloadUser(data.user)
      if (typeof window !== 'undefined') {
        const authBlob: AuthData = { user: mapped, token: data.token || '' }
        localStorage.setItem(AUTH_KEY, JSON.stringify(authBlob))
      }
      return { success: true, user: mapped }
    }

    return { success: false, error: data.message || data.error || 'Login falhou' }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erro de rede' }
  }
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY)
  }
}

export function getLoggedUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const data = localStorage.getItem(AUTH_KEY)
    if (!data) return null
    const auth: AuthData = JSON.parse(data)
    return auth.user
  } catch {
    return null
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const data = localStorage.getItem(AUTH_KEY)
    if (!data) return null
    const auth: AuthData = JSON.parse(data)
    return auth.token
  } catch {
    return null
  }
}

// allow small client-side updates to the profile; does not sync with server
export function updateProfile(
  updates: Partial<Pick<AuthUser, 'name' | 'email' | 'company'>>,
): AuthUser | null {
  const user = getLoggedUser()
  if (!user) return null
  const updated: AuthUser = {
    ...user,
    ...updates,
    avatar: updates.name
      ? updates.name
          .split(' ')
          .map((w) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : user.avatar,
  }
  if (typeof window !== 'undefined') {
    const token = getToken() || ''
    localStorage.setItem(AUTH_KEY, JSON.stringify({ user: updated, token }))
  }
  return updated
}

// stub change password on client; real applications should call an endpoint
export function changePassword(
  _currentPassword: string,
  _newPassword: string,
): { success: boolean; error?: string } {
  return { success: false, error: 'not implemented' }
}

// helper to populate the demo form; leaves credentials the same as before but
// the account will be automatically created on the server the first time
export const DEMO_CREDENTIALS = {
  email: 'admin@orcamentos.pt',
  password: 'admin123',
}
