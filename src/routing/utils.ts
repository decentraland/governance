export function params(options?: Record<string, any>) {
  if (!options) {
    return ''
  }

  let p = new URLSearchParams(options).toString()
  if (!p) {
    return ''
  }

  return '?' + p
}
