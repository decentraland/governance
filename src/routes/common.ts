import { auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import dns from 'dns'
import { Request } from 'express'
import net from 'net'
import isURL from 'validator/lib/isURL'

export default routes((router) => {
  const withAuth = auth()
  return router.post('/url-title', withAuth, handleAPI(checkUrlTitle))
})

const isHttpsURL = (url: string) => isURL(url, { protocols: ['https'], require_protocol: true })

// Parses any valid IPv6 textual form (compact, expanded, or with an embedded IPv4 suffix)
// into its 16 bytes, so range checks below cannot be bypassed by an alternate spelling
// (e.g. "0::1" vs "::1"). Returns null for anything it cannot parse.
function parseIPv6ToBytes(ip: string): number[] | null {
  const halves = ip.split('%')[0].split('::') // strip zone id, split on the compressor
  if (halves.length > 2) return null

  const groupsToBytes = (groups: string[]): number[] | null => {
    const bytes: number[] = []
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i]
      if (group === '') return null
      if (group.includes('.')) {
        // Embedded IPv4 is only valid as the final group.
        if (i !== groups.length - 1 || !net.isIPv4(group)) return null
        for (const part of group.split('.')) bytes.push(Number(part))
        continue
      }
      if (!/^[0-9a-f]{1,4}$/.test(group)) return null
      const value = parseInt(group, 16)
      bytes.push((value >> 8) & 0xff, value & 0xff)
    }
    return bytes
  }

  const leftBytes = groupsToBytes(halves[0] ? halves[0].split(':') : [])
  const rightBytes = groupsToBytes(halves.length === 2 && halves[1] ? halves[1].split(':') : [])
  if (leftBytes === null || rightBytes === null) return null

  const missing = 16 - leftBytes.length - rightBytes.length
  if (halves.length === 1) {
    return missing === 0 ? leftBytes : null // no "::" means the address must be full
  }
  if (missing < 1) return null // "::" must stand for at least one zero group
  return [...leftBytes, ...Array(missing).fill(0), ...rightBytes]
}

// Blocks loopback, private, link-local (incl. cloud metadata 169.254.169.254), CGNAT and
// unique-local addresses so this endpoint cannot be used to reach internal services.
export function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number)
    if (a === 0 || a === 10 || a === 127) return true
    if (a === 169 && b === 254) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    if (a === 100 && b >= 64 && b <= 127) return true
    return false
  }

  if (net.isIPv6(ip)) {
    const bytes = parseIPv6ToBytes(ip.toLowerCase())
    if (!bytes || bytes.length !== 16) return true // fail closed on anything unparseable
    // IPv4-mapped ::ffff:a.b.c.d — reuse the IPv4 ranges above.
    if (bytes.slice(0, 10).every((x) => x === 0) && bytes[10] === 0xff && bytes[11] === 0xff) {
      return isPrivateIp(bytes.slice(12).join('.'))
    }
    if (bytes.slice(0, 15).every((x) => x === 0) && bytes[15] === 1) return true // ::1 loopback
    if (bytes.every((x) => x === 0)) return true // :: unspecified
    if (bytes[0] === 0xfe && (bytes[1] & 0xc0) === 0x80) return true // fe80::/10 link-local
    if ((bytes[0] & 0xfe) === 0xfc) return true // fc00::/7 unique local
    return false
  }

  return true // unknown format, fail closed
}

export async function assertPublicUrl(url: string) {
  const hostname = new URL(url).hostname.replace(/^\[|\]$/g, '')

  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new Error('Invalid url: private addresses are not allowed')
    }
    return
  }

  // Known limitation: this resolves the hostname and vets the IPs, but the subsequent
  // fetch() resolves DNS again independently, so a DNS-rebinding attacker (very low TTL)
  // could pass here with a public IP and have the fetch hit a private IP. Fully closing it
  // would require pinning this IP into the request (connect-to-IP + Host header), which
  // native fetch doesn't support without breaking TLS SNI. Accepted for the current threat
  // model (endpoint is authenticated); redirect: 'manual' in getTitle blocks the redirect variant.
  const resolved = await dns.promises.lookup(hostname, { all: true })
  if (resolved.length === 0) {
    throw new Error('Invalid url: could not resolve host')
  }
  if (resolved.some(({ address }) => isPrivateIp(address))) {
    throw new Error('Invalid url: host resolves to a private address')
  }
}

async function getTitle(url: string) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 6000)
  try {
    // redirect: 'manual' prevents a public URL from 3xx-redirecting to an internal host
    // after the address check has passed.
    const response = await fetch(url, { redirect: 'manual', signal: controller.signal })
    const text = await response.text()
    return text.match(/<title>([^<]+)<\/title>/)?.[1]
  } finally {
    clearTimeout(timeoutId)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkUrlTitle(req: Request<any, any, { url: string }>) {
  const { url } = req.body
  if (!url) {
    throw new Error('Missing url')
  }

  if (!isHttpsURL(url)) {
    throw new Error('Invalid url: ' + url)
  }

  await assertPublicUrl(url)

  const title = await getTitle(url)
  return { title }
}
