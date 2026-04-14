const PUBLIC_PANEL_PATH_PREFIX = '/panel/'

export function isPublicPanelPath(pathname: string) {
  return (
    pathname.startsWith(PUBLIC_PANEL_PATH_PREFIX) &&
    pathname.length > PUBLIC_PANEL_PATH_PREFIX.length
  )
}

export function getPublicPanelChannelId(pathname: string) {
  if (!isPublicPanelPath(pathname)) {
    return null
  }

  const channelId = pathname.slice(PUBLIC_PANEL_PATH_PREFIX.length)
  return channelId ? decodeURIComponent(channelId) : null
}

export function buildPublicPanelUrl(channelId: string, origin: string) {
  return `${origin.replace(/\/$/, '')}${PUBLIC_PANEL_PATH_PREFIX}${encodeURIComponent(channelId)}`
}

export function getPublicPanelViewerId(search: string) {
  const params = new URLSearchParams(search)
  const viewerId = params.get('viewerId')
  return viewerId?.trim() ? viewerId.trim() : null
}
