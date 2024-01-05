import classNames from 'classnames'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import useFormatMessage from '../../../hooks/useFormatMessage'
import Text from '../../Common/Typography/Text'
import DiscordCircled from '../../Icon/DiscordCircled'
import LinkAccounts from '../../Icon/LinkAccounts'
import NotificationBellCircled from '../../Icon/NotificationBellCircled'
import '../ProposalModal.css'

import './LinkDiscordModal.css'

export function LinkDiscordModal() {
  const [account] = useAuthContext()
  const t = useFormatMessage()

  return (
    <Modal
      size="tiny"
      className={classNames('GovernanceActionModal', 'ProposalModal', 'LinkDiscordModal')}
      closeIcon={<Close />}
      open
    >
      <Modal.Content>
        <div className="PostConnection__Icons">
          <NotificationBellCircled />
          <LinkAccounts />
          <DiscordCircled />
        </div>
        <div className="LinkDiscordModal__Content">
          <Header>{'Receive DAO Notifications in Discord!'}</Header>
          <Text size="md" className="LinkDiscordModal__Description">
            {
              'Connect your Decentraland and Discord in one click! \n\nBy linking your accounts, you can receive real-time, governance-related notifications directly in your Discord.'
            }
          </Text>
          <Text size="sm" color="secondary" className="LinkDiscordModal__Secondary">
            {'Stay in the loop and never miss out on important updates and opportunities to participate.'}
          </Text>
        </div>
        <div className="LinkDiscordModal__Action">
          <Button primary>{'Link your discord account'}</Button>
        </div>
      </Modal.Content>
    </Modal>
  )
}
