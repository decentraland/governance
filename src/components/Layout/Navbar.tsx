import React from 'react'

import UserMenu, { UserMenuProps } from 'decentraland-gatsby/dist/components/User/UserMenu'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import BurgerMenu from './BurgerMenu/BurgerMenu'

function Navbar(props: UserMenuProps) {
  return (
    <>
      <Mobile>
        <BurgerMenu />
      </Mobile>
      <NotMobile>
        <UserMenu {...props} />
      </NotMobile>
    </>
  )
}

export default React.memo(Navbar)
