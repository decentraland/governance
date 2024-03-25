import { useEffect, useState } from 'react'

import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Toast } from 'decentraland-ui/dist/components/Toast/Toast'

import useFormatMessage from '../../hooks/useFormatMessage'
import Text from '../Common/Typography/Text'
import BellPurple from '../Icon/BellPurple'

import './AccountLinkToast.css'

interface Props {
  show: boolean
  setIsModalOpen: (value: boolean) => void
}

function AccountLinkToast({ show, setIsModalOpen }: Props) {
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    setIsVisible(show)
  }, [show])

  const t = useFormatMessage()
  return (
    <>
      <Toast
        className={classNames('AccountLinkToast', { 'AccountLinkToast--hidden': !isVisible })}
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
                setIsModalOpen(true)
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
    </>
  )
}

export default AccountLinkToast
