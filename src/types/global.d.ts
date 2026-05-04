export {}

declare global {
  interface Window {
    _env_?: {
      AUTH_SERVICE_URL?: string
      ACHIEVEMENT_MANAGEMENT_SERVICE_URL?: string
      API_SERVICE_URL?: string
      TWITCH_CLIENT_ID?: string
      FRONT_URL?: string
      USER_MANAGEMENT_URL?: string
    }
  }

  var _env_:
    | {
        AUTH_SERVICE_URL?: string
        ACHIEVEMENT_MANAGEMENT_SERVICE_URL?: string
        API_SERVICE_URL?: string
        TWITCH_CLIENT_ID?: string
        FRONT_URL?: string
        USER_MANAGEMENT_URL?: string
      }
    | undefined
}
