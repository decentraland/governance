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
  return (
    <div
      className="Animated"
      style={
        isMobile ? (burgerMenu?.status.open ? { transform: `translateY(${burgerMenu.status.translate})` } : {}) : {}
      }
    >
      {children}
    </div>
  )
}

export default BurgerMenuPushableLayout
