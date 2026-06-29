export const ROUTES = {
  login: '/login',
  dashboard: '/',
  subjects: '/subjects',
  users: '/users',
  settings: '/settings',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]
