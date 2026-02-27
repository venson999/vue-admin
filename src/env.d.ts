/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_ENV: 'development' | 'production'
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_AUTHOR: string
  readonly VITE_APP_DESCRIPTION: string
}
