import React, { useState } from 'react'
import { Modal, ModalProps} from 'decentraland-ui/dist/components/Modal/Modal'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import './ProposalModal.css'
import './NewsletterSubscriptionModal.css'

export type NewsletterSubscriptionModalProps = Omit<ModalProps, 'children'> & {
  loading?: boolean
  onClickAccept?: (e: React.MouseEvent<any>) => void
}

export function NewsletterSubscriptionModal({ onClickAccept, loading, ...props }: NewsletterSubscriptionModalProps) {
  const l = useFormatMessage()
  const [isValid, setIsValid] = useState(false);
  const [message, setMessage] = useState('');

  const emailRegex = /\S+@\S+\.\S+/;

  const validateEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    const email = event.target.value;
    if (emailRegex.test(email)) {
      setIsValid(true);
      setMessage('Your email looks good!');
    } else {
      setIsValid(false);
      setMessage('Please enter a valid email');
    }
  };

  return <Modal {...props} size="tiny" className={TokenList.join(['ProposalModal', props.className])} closeIcon={<Close />}>
    <Modal.Content className="ProposalModal__Title">
      <Header>{l('modal.newsletter_subscription.title')}</Header>
      <Paragraph small>{l('modal.newsletter_subscription.description')}</Paragraph>
      <Paragraph small>{l('modal.newsletter_subscription.description_sub')}</Paragraph>
    </Modal.Content>
    <Modal.Content className="ProposalModal__Form">
      <input
        type="email"
        placeholder="Enter your email"
        className="NewsletterSubscriptionModal__email-input"
        onChange={validateEmail}
      />
      <div className={`NewsletterSubscriptionModal__message ${isValid ? 'success' : 'error'}`}>
        {message}
      </div>
    </Modal.Content>
    <Modal.Content className="ProposalModal__Actions">
      <Button primary onClick={onClickAccept} loading={loading}>{l('modal.newsletter_subscription.accept')}</Button>
    </Modal.Content>
  </Modal>
}
