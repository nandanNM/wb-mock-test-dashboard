import { ApiError } from '@/lib/api'

import type { AuthSession, LoginCredentials, User } from './types'

const DEMO_EMAIL = 'admin@example.com'
const DEMO_PASSWORD = 'password'

const MOCK_USER: User = {
  id: 'usr_demo_0001',
  name: 'Ada Lovelace',
  email: DEMO_EMAIL,
  role: 'admin',
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function login(
  credentials: LoginCredentials
): Promise<AuthSession> {
  await delay(600)

  const emailOk =
    credentials.email.trim().toLowerCase() === DEMO_EMAIL.toLowerCase()
  const passwordOk = credentials.password === DEMO_PASSWORD

  if (!emailOk || !passwordOk) {
    throw new ApiError(
      {
        code: 'invalid_credentials',
        message: 'Incorrect email or password.',
      },
      401
    )
  }

  return {
    token: 'demo-token.' + btoa(credentials.email),
    user: MOCK_USER,
  }
}

export async function fetchCurrentUser(token: string): Promise<User> {
  await delay(200)
  if (!token) {
    throw new ApiError({ code: 'unauthenticated', message: 'No session.' }, 401)
  }
  return MOCK_USER
}

export async function logout(): Promise<void> {
  await delay(150)
}

export const demoCredentials = { email: DEMO_EMAIL, password: DEMO_PASSWORD }
