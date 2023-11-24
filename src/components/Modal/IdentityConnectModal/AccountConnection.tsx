import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import ActionCard, { ActionCardProps } from '../../ActionCard/ActionCard'
import Text from '../../Common/Typography/Text'

import './AccountConnection.css'

export interface AccountConnectionProps {
  title: string
  subtitle?: string
  timerText?: string
  actions: ActionCardProps[]
  button?: JSX.Element
  helperText?: string
}

function AccountConnection({ title, subtitle, timerText, actions, button, helperText }: AccountConnectionProps) {
  return (
    <>
      <Modal.Header className="AccountConnection__Header">
        <div>{title}</div>
        {subtitle && <Text className="AccountConnection__Subtitle">{subtitle}</Text>}
        {timerText && <div className="AccountConnection__Timer">{timerText}</div>}
      </Modal.Header>
      <Modal.Content>
        {actions.map((cardProps, index) => {
          return <ActionCard key={`ActionCard--${index}`} {...cardProps} />
        })}
        {button && (
          <div className="AccountConnection__HelperContainer">
            {button}
            {helperText && helperText.length > 0 && <div className="AccountConnection__HelperText">{helperText}</div>}
          </div>
        )}
      </Modal.Content>
    </>
  )
}

export default AccountConnection
