import React from 'react'

import { useLocation } from '@reach/router'
import UserMenu, { UserMenuProps } from 'decentraland-gatsby/dist/components/User/UserMenu'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import BurgerMenu from './BurgerMenu/BurgerMenu'

const BURGER_MENU_LOCATIONS = ['/', '/proposals/', '/transparency/', '/projects/', '/profile/']

function Navbar(props: UserMenuProps) {
  const location = useLocation()
  const showBurgerMenu = BURGER_MENU_LOCATIONS.some((burgerLocation) => burgerLocation === location.pathname)

  return (
    <>
      {showBurgerMenu && (
        <Mobile>
          <BurgerMenu />
        </Mobile>
      )}
      <NotMobile>
        <UserMenu {...props} />
      </NotMobile>
    </>
  )
}

export default Navbar
