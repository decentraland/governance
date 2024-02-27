import { useCallback, useState } from 'react'

import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Field } from 'decentraland-ui/dist/components/Field/Field'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'
import isEmail from 'validator/lib/isEmail'

import { Governance } from '../../../clients/Governance'
import { useAuthContext } from '../../../front/context/AuthProvider'
import { ANONYMOUS_USR_SUBSCRIPTION, NEWSLETTER_SUBSCRIPTION_KEY } from '../../../front/localStorageKeys'
import useAsyncTask from '../../../hooks/useAsyncTask'
import useFormatMessage from '../../../hooks/useFormatMessage'
import { NewsletterSubscriptionResult } from '../../../shared/types/newsletter'
import Label from '../../Common/Typography/Label'
import Text from '../../Common/Typography/Text'
import CheckCloud from '../../Icon/CheckCloud'
import '../ProposalModal.css'

import './NewsletterSubscriptionModal.css'

type Props = Omit<ModalProps, 'children'> & {
  onSubscriptionSuccess?: () => void
  subscribed: boolean
}

export function NewsletterSubscriptionModal({ onSubscriptionSuccess, subscribed, ...props }: Props) {
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
      const subscriptionResult: NewsletterSubscriptionResult = await Governance.get().subscribeToNewsletter(state.email)
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
            <Text size="lg" className="NewsletterSubscriptionModal__Description">
              {t('modal.newsletter_subscription.description')}
            </Text>
            <Text size="lg">{t('modal.newsletter_subscription.description_sub')}</Text>
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
          <Text size="lg" className="NewsletterSubscriptionModal__Description">
            {t('modal.newsletter_subscription.thanks')}
          </Text>
          <Text size="lg">{t('modal.newsletter_subscription.heads_up')}</Text>
        </Modal.Content>
      )}
    </Modal>
  )
}
