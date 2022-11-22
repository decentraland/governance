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

function BurgerMenuLayout({ children, navigationOnly, activeTab }: Props) {
  const burgerMenu = useBurgerMenu()

  return (
    <>
      <Mobile>
        <BurgerMenuContent navigationOnly={navigationOnly} activeTab={activeTab} />
        <div
          className="Animated"
          style={burgerMenu?.status.open ? { transform: `translateY(${burgerMenu.status.translate})` } : undefined}
        >
          {children}
        </div>
      </Mobile>
      <NotMobile>{children}</NotMobile>
    </>
  )
}

export default BurgerMenuLayout
