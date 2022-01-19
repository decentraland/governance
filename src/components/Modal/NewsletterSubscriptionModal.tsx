import React, { useState, useCallback } from 'react'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import isEmail from 'validator/lib/isEmail'

import './ProposalModal.css'
import './NewsletterSubscriptionModal.css'
import Label from 'decentraland-gatsby/dist/components/Form/Label'
import useAsyncTask from 'decentraland-gatsby/dist/hooks/useAsyncTask'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Decentraland } from '../../api/Decentraland'

const check = require('../../images/icons/check-cloud.svg')

export const NEWSLETTER_SUBSCRIPTION_KEY: string = 'org.decentraland.governance.newsletter_subscription'
export const ANONYMOUS_USR_SUBSCRIPTION: string = 'anonymous_subscription'

type NewsletterSubscriptionResult = {
  email: string,
  error: boolean,
  details: string | null,
}

export type NewsletterSubscriptionModalProps = Omit<ModalProps, 'children'> & {
  onSubscriptionSuccess?: () => void
  subscribed: boolean
}


async function subscribe(email: string) {
  try {
    await Decentraland.get().subscribe(email!)
    return {
      email: email,
      error: false,
      details: null
    }
  } catch (e) {
    return {
      email: email,
      error: true,
      details: e.body.detail
    }
  }
}

export function NewsletterSubscriptionModal({
                                              onSubscriptionSuccess,
                                              subscribed,
                                              ...props
                                            }: NewsletterSubscriptionModalProps) {
  const [account] = useAuthContext()
  const l = useFormatMessage()
  const [state, setState] = useState<{ isValid: boolean, message: string, email: string }>({
    isValid: true,
    message: '',
    email: ''
  })

  const validateEmail = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const email = event.target.value;
    if (isEmail(email)) {
      setState({
        isValid: true,
        message: '',
        email: email
      });
    } else {
      setState({
        isValid: false,
        message: l('modal.newsletter_subscription.email_error_message') || '',
        email: email
      });
    }
  }, []);

  const saveSubscription = useCallback(() => {
    const subscriptions: string[] = JSON.parse(localStorage.getItem(NEWSLETTER_SUBSCRIPTION_KEY) || '[]');
    subscriptions.push(account || ANONYMOUS_USR_SUBSCRIPTION)
    localStorage.setItem(NEWSLETTER_SUBSCRIPTION_KEY, JSON.stringify(subscriptions))
  }, [account])

  const resetModal = useCallback(() => {
    setState({ isValid: true, message: '', email: '' })
  }, [state])

  const [subscribing, handleAccept] = useAsyncTask(async () => {
    if (state.email && isEmail(state.email) && onSubscriptionSuccess) {
      const subscriptionResult: NewsletterSubscriptionResult = await subscribe(state.email)
      if (subscriptionResult.error) {
        setState({
          isValid: false,
          message: subscriptionResult.details || '',
          email: state.email
        })
      } else {
        saveSubscription()
        resetModal()
        onSubscriptionSuccess()
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
          value={state.email}
          placeholder={l('modal.newsletter_subscription.email_placeholder')}
          onChange={validateEmail}
          message={state.message}
          error={!state.isValid}
        />
      </Modal.Content>
      <Modal.Content className="ProposalModal__Actions">
        <Button primary onClick={handleAccept}
                loading={subscribing}>{l('modal.newsletter_subscription.accept')}</Button>
      </Modal.Content>
    </div>}
    {subscribed && <div>
      <Modal.Content className="ProposalModal__Title NewsletterSubscriptionModal__Title">
        <img src={check} alt="check icon" />
        <Header>{l('modal.newsletter_subscription.subscribed')}</Header>
        <Paragraph small className="NewsletterSubscriptionModal__Description">
          {l('modal.newsletter_subscription.thanks')}
        </Paragraph>
        <Paragraph small>{l('modal.newsletter_subscription.heads_up')}</Paragraph>
      </Modal.Content>
    </div>}
  </Modal>
}
