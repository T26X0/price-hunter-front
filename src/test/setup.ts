import '@testing-library/jest-dom/vitest'

const values = new Map<string, string>()

// Vitest's current jsdom runtime does not expose localStorage on this Node
// version, while legacy UI helpers intentionally use browser storage.
const memoryStorage: Storage = {
  get length() { return values.size },
  clear() { values.clear() },
  getItem(key) { return values.get(key) ?? null },
  key(index) { return [...values.keys()][index] ?? null },
  removeItem(key) { values.delete(key) },
  setItem(key, value) { values.set(key, String(value)) },
}

Object.defineProperty(window, 'localStorage', { configurable: true, value: memoryStorage })
