export function safeExternalUrl(value: string) {
  try { const url = new URL(value); if (!['https:', 'http:'].includes(url.protocol) || !url.hostname || url.username || url.password) return null; return url; } catch { return null; }
}
