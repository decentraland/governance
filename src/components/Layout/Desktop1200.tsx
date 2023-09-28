import { useMediaQuery } from 'react-responsive'

const useDesktop1200MediaQuery = (): boolean => useMediaQuery({ minWidth: 1200 })

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Desktop1200 = ({ children }) => {
  const isDesktop1440 = useDesktop1200MediaQuery()
  return isDesktop1440 ? children : null
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const NotDesktop1200 = ({ children }) => {
  const isDesktop1440 = useDesktop1200MediaQuery()
  return isDesktop1440 ? null : children
}

export { Desktop1200, NotDesktop1200 }
