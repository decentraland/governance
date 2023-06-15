import React, { useCallback, useState } from 'react'

import classNames from 'classnames'
import Label from 'decentraland-gatsby/dist/components/Form/Label'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'
import isEmail from 'validator/lib/isEmail'

import { Decentraland } from '../../../clients/Decentraland'
import useAsyncTask from '../../../hooks/useAsyncTask'
import { ANONYMOUS_USR_SUBSCRIPTION, NEWSLETTER_SUBSCRIPTION_KEY } from '../../Banner/Subscription/SubscriptionBanner'
import CheckCloud from '../../Icon/CheckCloud'
import '../ProposalModal.css'

import './NewsletterSubscriptionModal.css'

type NewsletterSubscriptionResult = {
  email: string
  error: boolean
  details: string | null
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
      details: null,
    }
  } catch (err) {
    return {
      email: email,
      error: true,
      details: (err as any).body.detail,
    }
  }
}

export function NewsletterSubscriptionModal({
  onSubscriptionSuccess,
  subscribed,
  ...props
}: NewsletterSubscriptionModalProps) {
  const [account] = useAuthContext()
  const t = useFormatMessage()
  const [state, setState] = useState<{ isValid: boolean; message: string; email: string }>({
    isValid: true,
    message: '',
    email: '',
  })

  const validateEmail = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const email = event.target.value
      if (isEmail(email)) {
        setState({
          isValid: true,
          message: '',
          email: email,
        })
      } else {
        setState({
          isValid: false,
          message: t('modal.newsletter_subscription.email_error_message') || '',
          email: email,
        })
      }
    },
    [t]
  )

  const saveSubscription = useCallback(() => {
    const subscriptions: string[] = JSON.parse(localStorage.getItem(NEWSLETTER_SUBSCRIPTION_KEY) || '[]')
    subscriptions.push(account || ANONYMOUS_USR_SUBSCRIPTION)
    localStorage.setItem(NEWSLETTER_SUBSCRIPTION_KEY, JSON.stringify(subscriptions))
  }, [account])

  const resetModal = useCallback(() => {
    setState({ isValid: true, message: '', email: '' })
  }, [])

  const [subscribing, handleAccept] = useAsyncTask(async () => {
    if (state.email && isEmail(state.email) && onSubscriptionSuccess) {
      const subscriptionResult: NewsletterSubscriptionResult = await subscribe(state.email)
      if (subscriptionResult.error) {
        setState({
          isValid: false,
          message: subscriptionResult.details || '',
          email: state.email,
        })
      } else {
        saveSubscription()
        resetModal()
        onSubscriptionSuccess()
      }
    }
  }, [state, setState, saveSubscription, resetModal, onSubscriptionSuccess])

  return (
    <Modal
      {...props}
      size="tiny"
      className={classNames('GovernanceActionModal', 'ProposalModal', 'NewsletterSubscriptionModal')}
      closeIcon={<Close />}
    >
      {!subscribed && (
        <Modal.Content>
          <div className="ProposalModal__Title">
            <Header>{t('modal.newsletter_subscription.title')}</Header>
            <Paragraph small className="NewsletterSubscriptionModal__Description">
              {t('modal.newsletter_subscription.description')}
            </Paragraph>
            <Paragraph small>{t('modal.newsletter_subscription.description_sub')}</Paragraph>
          </div>
          <div className="ProposalModal__Form">
            <Label>{t('modal.newsletter_subscription.email_label')}</Label>
            <Field
              type="email"
              value={state.email}
              placeholder={t('modal.newsletter_subscription.email_placeholder')}
              onChange={validateEmail}
              message={state.message}
              error={!state.isValid}
            />
          </div>
          <div className="ProposalModal__Actions">
            <Button fluid primary onClick={handleAccept} loading={subscribing}>
              {t('modal.newsletter_subscription.accept')}
            </Button>
          </div>
        </Modal.Content>
      )}
      {subscribed && (
        <Modal.Content className="NewsletterSubscriptionModal__Subscribed">
          <CheckCloud />
          <Header>{t('modal.newsletter_subscription.subscribed')}</Header>
          <Paragraph small className="NewsletterSubscriptionModal__Description">
            {t('modal.newsletter_subscription.thanks')}
          </Paragraph>
          <Paragraph small>{t('modal.newsletter_subscription.heads_up')}</Paragraph>
        </Modal.Content>
      )}
    </Modal>
  )
}
