export function isUnderMaintenance() {
  switch (process.env.GATSBY_MAINTENANCE) {
    case 'true':
    case '1':
      return true
    default:
      return false
  }
}
