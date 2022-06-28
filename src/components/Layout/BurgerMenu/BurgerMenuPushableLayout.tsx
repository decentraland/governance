import React from 'react'

import useResponsive from 'decentraland-gatsby/dist/hooks/useResponsive'
import Responsive from 'semantic-ui-react/dist/commonjs/addons/Responsive'

import { useBurgerMenu } from '../../../hooks/useBurgerMenu'

interface Props {
  children: React.ReactNode
}

function BurgerMenuPushableLayout({ children }: Props) {
  const burgerMenu = useBurgerMenu()
  const responsive = useResponsive()
  const isMobile = responsive({ maxWidth: Responsive.onlyMobile.maxWidth })

  if (isMobile) {
    return (
      <div
        className="Animated"
        style={burgerMenu?.status.open ? { transform: `translateY(${burgerMenu.status.translate})` } : {}}
      >
        {children}
      </div>
    )
  } else {
    return children
  }
}

export default BurgerMenuPushableLayout
