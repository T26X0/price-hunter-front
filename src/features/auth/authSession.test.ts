import { afterEach, describe, expect, it } from 'vitest'
import { authSessionStorageKey, readAuthSession } from './authSession'

describe('auth session storage', () => {
  afterEach(() => window.localStorage.clear())

  it('returns null when there is no valid session', () => {
    expect(readAuthSession()).toBeNull()
  })

  it('restores a valid local demo session', () => {
    window.localStorage.setItem(authSessionStorageKey, JSON.stringify({ name: 'Дмитрий', email: 'dmitry@example.com' }))

    expect(readAuthSession()).toEqual({ name: 'Дмитрий', email: 'dmitry@example.com' })
  })
})
