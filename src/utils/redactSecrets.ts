// Names that only ever hold a secret. A bare "token" is left out: here it is usually a token symbol, like MANA.
const SECRET_NAMES = String.raw`api[_-]?key|apikey|secret|password|passwd|authorization|access[_-]?token|refresh[_-]?token|auth[_-]?token|private[_-]?key`

/** An object key, like a header name, whose value is a secret whatever it looks like. */
export const SECRET_KEY_NAME = new RegExp(String.raw`^(?:[\w.-]*[_-])?(?:${SECRET_NAMES})$`, 'i')

const SECRET_JSON_FIELD = new RegExp(String.raw`("(?:[\w.-]*[_-])?(?:${SECRET_NAMES})"\s*:\s*")[^"]*`, 'gi')

/**
 * Strips API keys embedded in URLs so they do not leak into logs or error reports. Errors from ethers and fetch
 * quote the URL they called in their message. Covered: The Graph gateway's key segment, keyed RPC paths
 * (Alchemy's /v2/<key>, Infura's /v3/<key>, QuickNode's and Ankr's token segment), Discord webhook tokens,
 * credentials in the URL, query params whose name ends in key, token, secret, auth or password, and secret
 * fields in quoted JSON.
 */
export function redactSecrets(text: string): string {
  return text
    .replace(/(\/api\/)[^/\s]+(\/(?:subgraphs|deployments))/g, '$1<redacted>$2')
    .replace(/(\/v\d+\/)[A-Za-z0-9_-]{20,}/g, '$1<redacted>')
    .replace(/(\.quiknode\.pro\/)[A-Za-z0-9_-]+/g, '$1<redacted>')
    .replace(/(rpc\.ankr\.com\/[a-z0-9_]+\/)[A-Za-z0-9_-]{20,}/g, '$1<redacted>')
    .replace(/(\/api\/webhooks\/\d+\/)[A-Za-z0-9_-]+/g, '$1<redacted>')
    .replace(/(\/\/)[^/\s@]+@/g, '$1<redacted>@')
    .replace(/([?&][\w.-]*?(?:key|token|secret|auth|password)=)[^&\s"']+/gi, '$1<redacted>')
    .replace(SECRET_JSON_FIELD, '$1<redacted>')
}
