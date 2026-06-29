function required(key: keyof ImportMetaEnv, fallback?: string): string {
  const value = import.meta.env[key] ?? fallback
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const env = {
  appName: required('VITE_APP_NAME', 'Admin Dashboard'),
  apiUrl: required('VITE_API_URL', 'https://api.wb.codernandan.in'),
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT ?? 15000),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const
