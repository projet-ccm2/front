export async function fetchGcpIdentityToken(audience: string): Promise<string> {
  const metadataUrl = `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=${encodeURIComponent(audience)}`
  const response = await fetch(metadataUrl, {
    headers: { 'Metadata-Flavor': 'Google' },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch GCP identity token: ${response.status}`)
  }
  return response.text()
}
