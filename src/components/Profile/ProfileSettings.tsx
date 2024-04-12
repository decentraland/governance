import { useState } from 'react'

import classNames from 'classnames'

import { useAuthContext } from '../../front/context/AuthProvider'
import useFormatMessage from '../../hooks/useFormatMessage'
import useIsProfileValidated from '../../hooks/useIsProfileValidated'
import Gear from '../Icon/Gear'
import AccountsConnectModal from '../Modal/IdentityConnectModal/AccountsConnectModal'

import './ProfileSettings.css'

function ProfileSettings() {
  const [user] = useAuthContext()
  const t = useFormatMessage()
  const { isProfileValidated, validationChecked } = useIsProfileValidated(user)
  const [isSetUpOpen, setIsSetUpOpen] = useState(false)
  const showDot = validationChecked && !isProfileValidated

  return (
    <>
      <div className="ProfileSettings__ButtonContainer">
        <button
          className={classNames('ProfileSettings', isSetUpOpen && 'ProfileSettings--active')}
          onClick={() => setIsSetUpOpen(true)}
        >
          <div className="ProfileSettings__IconContainer">
            <Gear />
          </div>
          {t('page.profile.linked_profiles')}
        </button>
        {showDot && <div className="ProfileSettings__Dot" />}
      </div>
      <AccountsConnectModal open={isSetUpOpen} onClose={() => setIsSetUpOpen(false)} />
    </>
  )
}

export default ProfileSettings
