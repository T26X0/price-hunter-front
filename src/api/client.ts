import type { ApiErrorBody } from './types'

// The legacy mock API stays available only for isolated local experiments.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
// In production the application and its API are served by the same host. This
// removes a CORS dependency and keeps the deployed frontend pointed at the
// currently opened Price Hunter instance. Local developers can still override
// the value with VITE_BACKEND_API_BASE_URL.
const backendBaseUrl = (import.meta.env.VITE_BACKEND_API_BASE_URL || window.location.origin).replace(/\/$/, '')
export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly fields: Record<string, string> = {}) { super(message); this.name = 'ApiError' }
}

export async function requestJson<T>(baseUrl: string, path: string, options?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${baseUrl}${path}`, { ...options, headers: { Accept: 'application/json', ...(options?.body ? { 'Content-Type': 'application/json' } : {}), ...options?.headers } })
  } catch {
    throw new ApiError('Не удалось связаться с сервером. Проверьте, что backend запущен.', 0)
  }
  if (!response.ok) {
    let body: Partial<ApiErrorBody> | undefined
    try { body = await response.json() as Partial<ApiErrorBody> } catch { body = undefined }
    throw new ApiError(body?.message || 'Сервер не смог выполнить запрос.', response.status, body?.fields || {})
  }
  return response.json() as Promise<T>
}

export function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  return requestJson<T>(apiBaseUrl, path, options)
}

// Prepared for the Spring backend. Its public routes live under /api, while
// the temporary mock keeps /api inside its base URL for backward compatibility.
export function backendApiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  return requestJson<T>(backendBaseUrl, `/api${path}`, options)
}
