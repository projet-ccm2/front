export async function openExternalUrl(url: string) {
  globalThis.location.href = url
}

export async function closeExternalUrl() {
  return
}

export async function getLaunchUrl() {
  return { url: null as string | null }
}

export function addUrlOpenListener(
  handler: (url: string) => Promise<void> | void
): Promise<{ remove: () => void }> {
  void handler
  return Promise.resolve({
    remove() {
      return
    },
  })
}
