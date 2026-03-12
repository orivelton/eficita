const AUTH_KEY = "orcamentos-auth-user"

export interface MockUser {
  id: string
  name: string
  email: string
  avatar: string
  company: string
}

const MOCK_USERS: Record<string, { password: string; user: MockUser }> = {
  "admin@orcamentos.pt": {
    password: "admin123",
    user: {
      id: "usr_1",
      name: "Carlos Silva",
      email: "admin@orcamentos.pt",
      avatar: "CS",
      company: "Silva & Filhos Lda",
    },
  },
  "demo@orcamentos.pt": {
    password: "demo123",
    user: {
      id: "usr_2",
      name: "Ana Ferreira",
      email: "demo@orcamentos.pt",
      avatar: "AF",
      company: "Ferreira Construcoes",
    },
  },
}

export function login(email: string, password: string): { success: boolean; user?: MockUser; error?: string } {
  const entry = MOCK_USERS[email.toLowerCase().trim()]
  if (!entry) {
    return { success: false, error: "Email nao encontrado" }
  }
  if (entry.password !== password) {
    return { success: false, error: "Senha incorreta" }
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_KEY, JSON.stringify(entry.user))
  }
  return { success: true, user: entry.user }
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY)
  }
}

export function getLoggedUser(): MockUser | null {
  if (typeof window === "undefined") return null
  try {
    const data = localStorage.getItem(AUTH_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function updateProfile(updates: Partial<Pick<MockUser, "name" | "email" | "company">>): MockUser | null {
  const user = getLoggedUser()
  if (!user) return null
  const updated: MockUser = {
    ...user,
    ...updates,
    avatar: updates.name
      ? updates.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : user.avatar,
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_KEY, JSON.stringify(updated))
  }
  return updated
}

export function changePassword(currentPassword: string, _newPassword: string): { success: boolean; error?: string } {
  const user = getLoggedUser()
  if (!user) return { success: false, error: "Utilizador nao autenticado" }
  // Find the mock user to validate current password
  const entry = Object.values(MOCK_USERS).find((e) => e.user.id === user.id)
  if (!entry) return { success: false, error: "Utilizador nao encontrado" }
  if (entry.password !== currentPassword) {
    return { success: false, error: "Senha atual incorreta" }
  }
  // In mock mode we just return success (password doesn't actually change)
  return { success: true }
}

export const DEMO_CREDENTIALS = {
  email: "admin@orcamentos.pt",
  password: "admin123",
}
