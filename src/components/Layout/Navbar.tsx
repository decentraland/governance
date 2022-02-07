import React from 'react'
import useResponsive from 'decentraland-gatsby/dist/hooks/useResponsive'
import Responsive from 'semantic-ui-react/dist/commonjs/addons/Responsive'
import UserMenu from "decentraland-gatsby/dist/components/User/UserMenu"
import BurgerMenu from './BurgerMenu'

function Navbar({props}: any) {
  const responsive = useResponsive()
  const isMobile = responsive({ maxWidth: Responsive.onlyMobile.maxWidth })

  return isMobile ? <BurgerMenu /> : <UserMenu {...props} />
}

export default React.memo(Navbar)
