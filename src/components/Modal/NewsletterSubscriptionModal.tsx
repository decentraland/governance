import React, { useState } from 'react'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import './ProposalModal.css'
import './NewsletterSubscriptionModal.css'
import Label from 'decentraland-gatsby/dist/components/Form/Label'
import { Governance } from '../../api/Governance'
import { NewsletterSubscriptionResult } from '../../entities/NewsletterSubscription/types'
import useAsyncTask from 'decentraland-gatsby/dist/hooks/useAsyncTask'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
const check = require('../../images/icons/check-cloud.svg')

export const NEWSLETTER_SUBSCRIPTION_KEY: string = 'org.decentraland.governance.newsletter_subscription'

export type NewsletterSubscriptionModalProps = Omit<ModalProps, 'children'> & {
  onSubscriptionSuccess?: () => void
}

export function NewsletterSubscriptionModal({ onSubscriptionSuccess, ...props }: NewsletterSubscriptionModalProps) {
  const [account] = useAuthContext()
  const l = useFormatMessage()
  const [isValid, setIsValid] = useState(true);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

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

  const [subscribing, handleAccept] = useAsyncTask(async () => {
    if (email && emailRegex.test(email) && onSubscriptionSuccess) {
      const subscriptionResult: NewsletterSubscriptionResult = await Governance.get().subscribeToNewsletter(email)
      if (subscriptionResult.error) {
        setIsValid(false);
        setMessage(subscriptionResult.details || '');
      } else {
        localStorage.setItem(NEWSLETTER_SUBSCRIPTION_KEY, account || '')
        onSubscriptionSuccess()
        setSubscribed(true)
      }
    }
  })

  return <Modal {...props} size="tiny" className={TokenList.join(['ProposalModal', 'NewsletterSubscriptionModal'])}
                closeIcon={<Close />}>
    {!subscribed && <div>
      <Modal.Content className="ProposalModal__Title NewsletterSubscriptionModal__Title">
        <Header>{l('modal.newsletter_subscription.title')}</Header>
        <Paragraph small className="NewsletterSubscriptionModal__Description">
          {l('modal.newsletter_subscription.description')}
        </Paragraph>
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
        <Button primary onClick={handleAccept}
                loading={subscribing}>{l('modal.newsletter_subscription.accept')}</Button>
      </Modal.Content>
    </div>}
    {subscribed && <div>
      <Modal.Content className="ProposalModal__Title NewsletterSubscriptionModal__Title">
        <img src={check} alt="check icon"/>
        <Header>{l('modal.newsletter_subscription.subscribed')}</Header>
        <Paragraph small className="NewsletterSubscriptionModal__Description">
          {l('modal.newsletter_subscription.thanks')}
        </Paragraph>
        <Paragraph small>{l('modal.newsletter_subscription.heads_up')}</Paragraph>
      </Modal.Content>
    </div>}
  </Modal>
}
