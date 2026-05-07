export const AUTH_TOKEN_KEY = 'authToken'
const LEGACY_AUTH_TOKEN_KEY = 'token'

export type JwtPayload = {
  id?: number
  sub?: string
  role?: 'USER' | 'ADMIN'
  username?: string
  email?: string
  exp?: number
}

export function getToken(): string | null {
  try {
    const localToken = localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(LEGACY_AUTH_TOKEN_KEY)
    if (localToken) return localToken

    return sessionStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(LEGACY_AUTH_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string): void {
  // Keep localStorage as the primary auth source for existing flow.
  localStorage.setItem(AUTH_TOKEN_KEY, token)
  // Mirror token to sessionStorage for compatibility with session-based auth flows.
  sessionStorage.setItem(AUTH_TOKEN_KEY, token)
  // Clean up legacy key if it exists.
  localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY)
  sessionStorage.removeItem(LEGACY_AUTH_TOKEN_KEY)
}

export function clearToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  sessionStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY)
  sessionStorage.removeItem(LEGACY_AUTH_TOKEN_KEY)
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  const padLength = (4 - (base64.length % 4)) % 4
  const padded = base64 + '='.repeat(padLength)
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(padded), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const json = base64UrlDecode(parts[1])
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

export function isTokenExpired(payload: JwtPayload): boolean {
  if (!payload.exp) return false
  const nowSeconds = Math.floor(Date.now() / 1000)
  return payload.exp <= nowSeconds
}

export type AuthRole = 'GUEST' | 'USER' | 'ADMIN'

export function getAuthPayloadFromStorage(): JwtPayload | null {
  const token = getToken()
  if (!token) return null
  const payload = decodeJwtPayload(token)
  if (!payload) return null
  if (isTokenExpired(payload)) return null
  return payload
}

export function getRoleFromStorage(): AuthRole {
  const payload = getAuthPayloadFromStorage()
  if (!payload?.role) return 'GUEST'
  return payload.role
}

