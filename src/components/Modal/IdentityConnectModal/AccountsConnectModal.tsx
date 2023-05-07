import React, { useMemo, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import ActionCard, { ActionCardProps } from '../../ActionCard/ActionCard'
import Comment from '../../Icon/Comment'
import Copy from '../../Icon/Copy'
import Discourse from '../../Icon/Discourse'
import Sign from '../../Icon/Sign'

import './AccountsConnectModal.css'

type ModalState = {
  title: string
  actions: ActionCardProps[]
  button?: string
  helperTexts?: string[]
}

enum ModalType {
  CHOOSE_ACCOUNT,
  FORUM,
}

type AccountType = 'forum' | 'discord' | 'twitter'

const FORUM_CONNECT_STEPS_AMOUNT = 3

function getAccountActionSteps(
  account: AccountType,
  stepsAmount: number,
  icons: React.ReactNode[],
  actions: (() => void)[],
  currentStep: number
): ActionCardProps[] {
  if (stepsAmount === 0 || (icons.length !== stepsAmount && actions.length !== stepsAmount)) {
    console.error('Invalid steps amount')
    return []
  }
  return Array.from({ length: stepsAmount }, (_, index) => ({
    title: `modal.identity_setup.${account}.title_step_${index + 1}`,
    description: `modal.identity_setup.${account}.description_step_${index + 1}`,
    icon: icons[index],
    action_title: `modal.identity_setup.${account}.action_step_${index + 1}`,
    action: actions[index],
    isDisabled: index + 1 > currentStep,
  }))
}

function getHelperTexts(account: AccountType, stepsAmount: number): string[] {
  if (stepsAmount === 0) {
    console.error('Invalid steps amount')
    return []
  }
  return Array.from({ length: stepsAmount }, (_, index) => `modal.identity_setup.${account}.helper_step_${index + 1}`)
}

function AccountsConnectModal({ open, onClose }: ModalProps) {
  const t = useFormatMessage()
  const [currentState, setCurrentState] = useState(ModalType.CHOOSE_ACCOUNT)
  const [currentStep, setCurrentStep] = useState(1)

  const stateMap = useMemo<Record<ModalType, ModalState>>(
    () => ({
      [ModalType.CHOOSE_ACCOUNT]: {
        title: 'modal.identity_setup.title',
        actions: [
          {
            title: 'modal.identity_setup.forum.card_title',
            description: 'modal.identity_setup.forum.card_description',
            icon: <Discourse />,
            onCardClick: () => setCurrentState(ModalType.FORUM),
          },
          {
            title: 'modal.identity_setup.discord.card_title',
            description: 'modal.identity_setup.discord.card_description',
            icon: <Discourse />,
          },
          {
            title: 'modal.identity_setup.twitter.card_title',
            description: 'modal.identity_setup.twitter.card_description',
            icon: <Discourse />,
          },
        ],
      },
      [ModalType.FORUM]: {
        title: 'modal.identity_setup.forum.title',
        actions: getAccountActionSteps(
          'forum',
          FORUM_CONNECT_STEPS_AMOUNT,
          [<Sign key="sign" />, <Copy key="copy" />, <Comment key="comment" />],
          [() => ({}), () => ({}), () => ({})],
          currentStep
        ),
        button: 'modal.identity_setup.forum.action',
        helperTexts: getHelperTexts('forum', FORUM_CONNECT_STEPS_AMOUNT),
      },
    }),
    [currentStep]
  )

  const button = stateMap[currentState].button
  const helperTexts = stateMap[currentState].helperTexts

  return (
    <>
      <Modal open={open} className="AccountsConnectModal" size="tiny" onClose={onClose} closeIcon={<Close />}>
        <Modal.Header className="AccountsConnectModal__Header">{t(stateMap[currentState].title)}</Modal.Header>
        <Modal.Content>
          {stateMap[currentState].actions.map((cardProps, index) => {
            const { title, description, action_title } = cardProps
            return (
              <ActionCard
                key={`ActionCard--${index}`}
                {...cardProps}
                title={t(title)}
                description={t(description)}
                action_title={t(action_title)}
              />
            )
          })}
          <div className="AccountsConnectModal__HelperContainer">
            {button && (
              <Button primary disabled>
                {t(button)}
              </Button>
            )}
            {helperTexts && helperTexts.length > 0 && (
              <div className="AccountsConnectModal__HelperText">{t(helperTexts[currentStep - 1])}</div>
            )}
          </div>
        </Modal.Content>
      </Modal>
    </>
  )
}

export default AccountsConnectModal
