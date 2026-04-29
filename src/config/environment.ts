const env = globalThis._env_

export const TWITCH_CLIENT_ID = env?.TWITCH_CLIENT_ID || import.meta.env.VITE_TWITCH_CLIENT_ID || ''
export const AUTH_SERVICE_URL =
  env?.AUTH_SERVICE_URL || import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3000'
export const ACHIEVEMENT_MANAGEMENT_SERVICE_URL =
  env?.ACHIEVEMENT_MANAGEMENT_SERVICE_URL ||
  import.meta.env.VITE_ACHIEVEMENT_MANAGEMENT_SERVICE_URL ||
  'http://localhost:3001'
export const FRONT_URL =
  env?.FRONT_URL || import.meta.env.VITE_FRONT_URL || globalThis.location?.origin || ''

export const MOBILE_REDIRECT_URI = `${FRONT_URL}/mobile-callback`
