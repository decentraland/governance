import { useLocation } from '@reach/router'
import UserInformation, { UserInformationProps } from 'decentraland-gatsby/dist/components/User/UserInformation'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import BurgerMenu from './BurgerMenu/BurgerMenu'

const BURGER_MENU_LOCATIONS = ['/', '/proposals/', '/transparency/', '/projects/', '/profile/']

function Navbar(props: UserInformationProps) {
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
        <UserInformation {...props} />
      </NotMobile>
    </>
  )
}

export default Navbar
