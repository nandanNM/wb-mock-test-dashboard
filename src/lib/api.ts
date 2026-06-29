import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'

import { env } from '@/config/env'

let accessToken: string | null = null
let refreshing: Promise<boolean> | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
}

function getCookie(name: string): string {
  return (
    document.cookie
      .split('; ')
      .find((c) => c.startsWith(name + '='))
      ?.split('=')[1] ?? ''
  )
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

export interface Paginated<T> {
  items: T[]
  page: number
  limit: number
  total: number
  total_pages: number
}

export const api: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  timeout: env.apiTimeout,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  } else {
    config.headers.delete('Authorization')
  }
  return config
})

export function refresh(): Promise<boolean> {
  if (!refreshing) {
    refreshing = axios
      .post<{ data: { access_token: string } }>(
        `${env.apiUrl}/v1/auth/refresh`,
        null,
        {
          withCredentials: true,
          headers: { 'X-CSRF-Token': getCookie('csrf_token') },
        }
      )
      .then((res) => {
        accessToken = res.data.data.access_token
        return true
      })
      .catch(() => {
        accessToken = null
        return false
      })
      .finally(() => {
        refreshing = null
      })
  }
  return refreshing
}

export function loginWithGoogle(): void {
  window.location.href = `${env.apiUrl}/v1/auth/google/start?client=web`
}

export async function logout(): Promise<void> {
  try {
    await api.post('/v1/auth/logout')
  } finally {
    accessToken = null
  }
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error?: ApiErrorBody }>) => {
    const original = error.config as RetriableConfig | undefined
    const status = error.response?.status
    const body = error.response?.data?.error

    if (
      status === 401 &&
      body?.code === 'token_expired' &&
      original &&
      !original._retry
    ) {
      original._retry = true
      if (await refresh()) {
        return api.request(original)
      }
    }

    if (status === 401) {
      accessToken = null
    }

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
