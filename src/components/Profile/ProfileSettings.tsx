import { useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'

import useFormatMessage from '../../hooks/useFormatMessage'
import useIsProfileValidated from '../../hooks/useIsProfileValidated'
import Gear from '../Icon/Gear'
import GearNew from '../Icon/GearNew'
import AccountsConnectModal from '../Modal/IdentityConnectModal/AccountsConnectModal'

import './ProfileSettings.css'

function ProfileSettings() {
  const t = useFormatMessage()
  const [user] = useAuthContext()
  const { isProfileValidated, validationChecked } = useIsProfileValidated(user)
  const [isSetUpOpen, setIsSetUpOpen] = useState(false)
  const showDot = validationChecked && !isProfileValidated

  return (
    <>
      <Dropdown className="ProfileSettings" floating icon={showDot ? <GearNew /> : <Gear />}>
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => setIsSetUpOpen(true)} disabled={!validationChecked || isProfileValidated}>
            {t('page.profile.settings.linked_profiles')}
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <AccountsConnectModal open={isSetUpOpen} onClose={() => setIsSetUpOpen(false)} />
    </>
  )
}

export default ProfileSettings
