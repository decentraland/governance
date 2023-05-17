import React from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'

import useIdentityModalContext from '../../hooks/useIdentityModalContext'
import useIsProfileValidated from '../../hooks/useIsProfileValidated'
import Gear from '../Icon/Gear'
import GearNew from '../Icon/GearNew'

import './ProfileSettings.css'

function ProfileSettings() {
  const t = useFormatMessage()
  const { setIsModalOpen } = useIdentityModalContext()
  const [user] = useAuthContext()
  const [isProfileValidated, isLoading] = useIsProfileValidated(user)
  const showDot = !isLoading && !isProfileValidated

  const handleLinkedProfilesClick = () => setIsModalOpen(true)

  return (
    <Dropdown className="ProfileSettings" floating icon={showDot ? <GearNew /> : <Gear />}>
      <Dropdown.Menu>
        <Dropdown.Item onClick={handleLinkedProfilesClick} disabled={isLoading || isProfileValidated}>
          {t('page.profile.settings.linked_profiles')}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default ProfileSettings
