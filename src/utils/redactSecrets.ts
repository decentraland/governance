/**
 * Strips API keys embedded in URLs so they do not leak into logs or error reports. Errors from ethers and fetch
 * quote the URL they called in their message. Covered: The Graph gateway's key segment, keyed RPC paths
 * (Alchemy's /v2/<key>, Infura's /v3/<key>, QuickNode's and Ankr's token segment), credentials in the URL, and
 * key or token query params.
 */
export function redactSecrets(text: string): string {
  return text
    .replace(/(\/api\/)[^/\s]+(\/(?:subgraphs|deployments))/g, '$1<redacted>$2')
    .replace(/(\/v\d+\/)[A-Za-z0-9_-]{20,}/g, '$1<redacted>')
    .replace(/(\.quiknode\.pro\/)[A-Za-z0-9_-]+/g, '$1<redacted>')
    .replace(/(rpc\.ankr\.com\/[a-z0-9_]+\/)[A-Za-z0-9_-]{20,}/g, '$1<redacted>')
    .replace(/(\/\/)[^/\s:@]+:[^/\s@]+@/g, '$1<redacted>@')
    .replace(/([?&](?:api[_-]?key|key|token|access[_-]?token|secret)=)[^&\s"']+/gi, '$1<redacted>')
}
