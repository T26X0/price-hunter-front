export interface AuthSession {
  name: string
  email: string
}

export const authSessionStorageKey = 'price-hunter-auth-session'

export function readAuthSession(): AuthSession | null {
  try {
    const stored = JSON.parse(window.localStorage.getItem(authSessionStorageKey) || 'null')
    return stored && typeof stored.name === 'string' && typeof stored.email === 'string' ? stored : null
  } catch {
    return null
  }
}
