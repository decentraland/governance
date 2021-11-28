import React, { useState } from 'react'
import { Modal, ModalProps} from 'decentraland-ui/dist/components/Modal/Modal'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from "decentraland-ui/dist/components/Field/Field"
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import './ProposalModal.css'
import './NewsletterSubscriptionModal.css'
import Label from 'decentraland-gatsby/dist/components/Form/Label'

export type NewsletterSubscriptionModalProps = Omit<ModalProps, 'children'> & {
  loading?: boolean
  onClickAccept?: (e: React.MouseEvent<any>) => void
}

export function NewsletterSubscriptionModal({ onClickAccept, loading, ...props }: NewsletterSubscriptionModalProps) {
  const l = useFormatMessage()
  const [isValid, setIsValid] = useState(true);
  const [message, setMessage] = useState('');
  const [ email, setEmail ] = useState('')

  const emailRegex = /\S+@\S+\.\S+/;

  const validateEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    const email = event.target.value;
    if (emailRegex.test(email)) {
      setIsValid(true);
      setMessage('');
      setEmail(email)
    } else {
      setIsValid(false);
      setMessage(l('modal.newsletter_subscription.email_error_message') || '');
      setEmail(email)
    }
  };

  return <Modal {...props} size="tiny" className={TokenList.join(['ProposalModal', "NewsletterSubscriptionModal"])} closeIcon={<Close />}>
    <Modal.Content className="ProposalModal__Title NewsletterSubscriptionModal__Title">
      <Header>{l('modal.newsletter_subscription.title')}</Header>
      <Paragraph small className="NewsletterSubscriptionModal__Description">{l('modal.newsletter_subscription.description')}</Paragraph>
      <Paragraph small>{l('modal.newsletter_subscription.description_sub')}</Paragraph>
    </Modal.Content>
    <Modal.Content className="ProposalModal__Form">
      <Label>{l('modal.newsletter_subscription.email_label')}</Label>
      <Field
        type="email"
        value={email}
        placeholder={l('modal.newsletter_subscription.email_placeholder')}
        onChange={validateEmail}
        message={message}
        error={!isValid}
      />
    </Modal.Content>
    <Modal.Content className="ProposalModal__Actions">
      <Button primary onClick={onClickAccept} loading={loading}>{l('modal.newsletter_subscription.accept')}</Button>
    </Modal.Content>
  </Modal>
}
