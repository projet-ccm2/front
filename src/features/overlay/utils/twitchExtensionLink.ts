const TWITCH_EXTENSION_PATH = '/twitch-extension/panel'

export function buildTwitchExtensionPanelUrl(origin: string) {
  return `${origin.replace(/\/$/, '')}${TWITCH_EXTENSION_PATH}`
}

export function isTwitchExtensionPanelPath(pathname: string) {
  return pathname === TWITCH_EXTENSION_PATH
}
