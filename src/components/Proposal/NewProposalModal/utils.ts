export function isValidPosition(raw?: string | number) {
  if (raw === '' || raw === undefined) {
    return undefined
  }

  const position = Number(raw)
  if (Number.isNaN(position)) {
    return false
  }

  if (position > 150 || position < -150) {
    return false
  }

  return true
}
