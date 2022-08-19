import React from 'react'

import { Desktop, Mobile } from 'decentraland-ui/dist/components/Media/Media'

import { useBurgerMenu } from '../../../hooks/useBurgerMenu'

interface Props {
  children: React.ReactNode
}

function BurgerMenuPushableLayout({ children }: Props) {
  const burgerMenu = useBurgerMenu()

  return (
    <>
      <Mobile>
        <div
          className="Animated"
          style={burgerMenu?.status.open ? { transform: `translateY(${burgerMenu.status.translate})` } : {}}
        >
          {children}
        </div>
      </Mobile>
      <Desktop>{children}</Desktop>
    </>
  )
}

export default BurgerMenuPushableLayout
