import React from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'

import useIdentityModalContext from '../../hooks/useIdentityModalContext'
import useIsProfileValidated from '../../hooks/useIsProfileValidated'
import Gear from '../Icon/Gear'
import GearNew from '../Icon/GearNew'

function Settings() {
  const t = useFormatMessage()
  const { setIsModalOpen } = useIdentityModalContext()
  const [user] = useAuthContext()
  const IsProfileValidated = useIsProfileValidated(user)

  const handleLinkedProfilesClick = () => setIsModalOpen(true)

  return (
    <Dropdown floating icon={IsProfileValidated ? <Gear /> : <GearNew />}>
      <Dropdown.Menu>
        <Dropdown.Item onClick={handleLinkedProfilesClick} disabled={IsProfileValidated == null || IsProfileValidated}>
          {t('page.profile.settings.linked_profiles')}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default Settings
