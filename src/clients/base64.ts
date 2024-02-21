export function toBase64(original: string | ArrayBuffer) {
  if (typeof btoa === 'function' && typeof original === 'string') {
    return btoa(original as string)
  } else if (typeof btoa === 'function') {
    return btoa(String.fromCharCode(...new Uint8Array(original as ArrayBuffer)))
  } else if (typeof original === 'string') {
    return Buffer.from(original, 'utf8').toString('base64')
  } else {
    return Buffer.from(original).toString('base64')
  }
}
