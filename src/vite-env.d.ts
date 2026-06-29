/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_API_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_LOGS_URL?: string
  readonly VITE_LOGS_USER?: string
  readonly VITE_LOGS_PASSWORD?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
