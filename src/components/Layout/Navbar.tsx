import React from 'react'

import { useLocation } from '@reach/router'
import UserInformation, { UserInformationProps } from 'decentraland-gatsby/dist/components/User/UserInformation'
import UserMenu from 'decentraland-gatsby/dist/components/User/UserMenu'
import useFeatureFlagContext from 'decentraland-gatsby/dist/context/FeatureFlag/useFeatureFlagContext'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import { FeatureFlags } from '../../utils/features'

import BurgerMenu from './BurgerMenu/BurgerMenu'

const BURGER_MENU_LOCATIONS = ['/', '/proposals/', '/transparency/', '/projects/', '/profile/']

function Navbar(props: UserInformationProps) {
  const location = useLocation()
  const showBurgerMenu = BURGER_MENU_LOCATIONS.some((burgerLocation) => burgerLocation === location.pathname)

  const [ff] = useFeatureFlagContext()
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
