/**
 * Strips API keys embedded in URLs so they do not leak into logs or error reports: The Graph gateway's path
 * segment, keyed RPC paths (Alchemy's /v2/<key>, Infura's /v3/<key>), and key or token query params. Errors
 * from ethers and fetch quote the URL they called in their message.
 */
export function redactSecrets(text: string): string {
  return text
    .replace(/(\/api\/)[^/\s]+(\/subgraphs)/g, '$1<redacted>$2')
    .replace(/(\/v\d+\/)[A-Za-z0-9_-]{20,}/g, '$1<redacted>')
    .replace(/([?&](?:api[_-]?key|key|token|access[_-]?token|secret)=)[^&\s"']+/gi, '$1<redacted>')
}
