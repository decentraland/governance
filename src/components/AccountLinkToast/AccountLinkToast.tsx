import { useState } from 'react'

import classNames from 'classnames'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Toast } from 'decentraland-ui/dist/components/Toast/Toast'

import useFormatMessage from '../../hooks/useFormatMessage'
import useIsProfileValidated from '../../hooks/useIsProfileValidated'
import Text from '../Common/Typography/Text'
import BellPurple from '../Icon/BellPurple'
import AccountsConnectModal from '../Modal/IdentityConnectModal/AccountsConnectModal'

import './AccountLinkToast.css'

function AccountLinkToast() {
  const [isVisible, setIsVisible] = useState(true)
  const [isSetUpOpen, setIsSetUpOpen] = useState(false)
  const [user] = useAuthContext()
  const { isProfileValidated, validationChecked } = useIsProfileValidated(user) // TODO: use Discord & Push
  const t = useFormatMessage()
  const showToast = validationChecked && !isProfileValidated && isVisible
  return (
    <>
      <Toast
        className={classNames('AccountLinkToast', { 'AccountLinkToast--hidden': !showToast })}
        title={
          <span className="AccountLinkToast__Title">
            <BellPurple />
            <Text color="white-900" as="span" weight="medium" size="lg">
              {t('account_toast.title')}
            </Text>
          </span>
        }
        body={
          <div>
            <Text color="white-900" size="sm">
              {t('account_toast.description')}
            </Text>
            <Button
              className="AccountLinkToast__Button"
              onClick={() => {
                setIsSetUpOpen(true)
                setIsVisible(false)
              }}
            >
              {t('account_toast.button')}
            </Button>
          </div>
        }
        closable
        onClose={() => setIsVisible(false)}
      />
      <AccountsConnectModal open={isSetUpOpen} onClose={() => setIsSetUpOpen(false)} />
    </>
  )
}

export default AccountLinkToast
