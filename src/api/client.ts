import type { ApiErrorBody } from './types'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly fields: Record<string, string> = {}) { super(message); this.name = 'ApiError' }
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers: { Accept: 'application/json', ...(options?.body ? { 'Content-Type': 'application/json' } : {}), ...options?.headers } })
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
