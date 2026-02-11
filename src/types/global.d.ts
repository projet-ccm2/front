export {}

declare global {
  interface Window {
    _env_?: {
      AUTH_SERVICE_URL?: string
      TWITCH_CLIENT_ID?: string
      FRONT_URL?: string
    }
  }
}
