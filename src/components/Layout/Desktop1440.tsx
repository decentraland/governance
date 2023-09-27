import { useMediaQuery } from 'react-responsive'

/**
 * Media hook to determine if we're going to be rendering in a desktop environment with big screens.
 */
const useDesktop1440MediaQuery = (): boolean => useMediaQuery({ minWidth: 1440 })

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Desktop1440 = ({ children }) => {
  const isDesktop1440 = useDesktop1440MediaQuery()
  return isDesktop1440 ? children : null
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const NotDesktop1440 = ({ children }) => {
  const isDesktop1440 = useDesktop1440MediaQuery()
  return isDesktop1440 ? null : children
}

export { Desktop1440, NotDesktop1440 }
