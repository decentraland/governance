import { ReactElement } from 'react'
import { useMediaQuery } from 'react-responsive'

const useDesktop1200MediaQuery = (): boolean => useMediaQuery({ minWidth: 1200 })

const Desktop1200 = ({ children }: { children: null | ReactElement }) => {
  const isDesktop1200 = useDesktop1200MediaQuery()
  return isDesktop1200 ? children : null
}

const NotDesktop1200 = ({ children }: { children: null | ReactElement }) => {
  const isDesktop1200 = useDesktop1200MediaQuery()
  return isDesktop1200 ? null : children
}

export { Desktop1200, NotDesktop1200 }
