import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'

import { env } from '@/config/env'

const TOKEN_STORAGE_KEY = 'admin-dashboard.token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

export interface ApiErrorBody {
  code: string
  message: string
  details?: Record<string, string>
  request_id?: string
}

export class ApiError extends Error {
  code: string
  status?: number
  details?: Record<string, string>
  requestId?: string

  constructor(body: ApiErrorBody, status?: number) {
    super(body.message)
    this.name = 'ApiError'
    this.code = body.code
    this.status = status
    this.details = body.details
    this.requestId = body.request_id
  }
}

export const api: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: ApiErrorBody }>) => {
    const status = error.response?.status

    if (status === 401) {
      setStoredToken(null)
    }

    const body = error.response?.data?.error
    if (body) {
      return Promise.reject(new ApiError(body, status))
    }

    return Promise.reject(
      new ApiError(
        {
          code: 'network_error',
          message: error.message || 'Something went wrong. Please try again.',
        },
        status
      )
    )
  }
)

export async function unwrap<T>(promise: Promise<{ data: { data: T } }>) {
  const response = await promise
  return response.data.data
}
