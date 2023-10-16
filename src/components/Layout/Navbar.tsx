import { useLocation } from '@reach/router'
import UserInformation from 'decentraland-gatsby/dist/components/User/UserInformation'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import BurgerMenu from './BurgerMenu/BurgerMenu'

const BURGER_MENU_LOCATIONS = ['/', '/proposals/', '/transparency/', '/projects/', '/profile/']

function Navbar() {
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
        <UserInformation />
      </NotMobile>
    </>
  )
}

export default Navbar
