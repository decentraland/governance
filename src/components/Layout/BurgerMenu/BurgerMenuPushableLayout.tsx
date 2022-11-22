import React from 'react'

import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import { useBurgerMenu } from '../../../hooks/useBurgerMenu'
import { NavigationProps } from '../Navigation'

import BurgerMenuContent from './BurgerMenuContent'

interface Props {
  children: React.ReactNode
  navigationOnly?: boolean
  activeTab: NavigationProps['activeTab']
}

function BurgerMenuPushableLayout({ children, navigationOnly, activeTab }: Props) {
  const burgerMenu = useBurgerMenu()

  return (
    <>
      <Mobile>
        <BurgerMenuContent navigationOnly={navigationOnly} activeTab={activeTab} />
      </Mobile>
      <Mobile>
        <div
          className="Animated"
          style={burgerMenu?.status.open ? { transform: `translateY(${burgerMenu.status.translate})` } : {}}
        >
          {children}
        </div>
      </Mobile>
      <NotMobile>{children}</NotMobile>
    </>
  )
}

export default BurgerMenuPushableLayout
