import React, { useCallback, useEffect, useMemo, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import useForumConnect from '../../../hooks/useForumConnect'
import ActionCard, { ActionCardProps } from '../../ActionCard/ActionCard'
import CircledDiscord from '../../Icon/CircledDiscord'
import CircledForum from '../../Icon/CircledForum'
import CircledTwitter from '../../Icon/CircledTwitter'
import Comment from '../../Icon/Comment'
import Copy from '../../Icon/Copy'
import Sign from '../../Icon/Sign'

import './AccountsConnectModal.css'

type AccountModal = {
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

type ModalState = {
  currentType: ModalType
  currentStep: number
  isTimerActive: boolean
  isValidating: boolean
}

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
    isCompleted: index + 1 < currentStep,
  }))
}

function getHelperTexts(account: AccountType, stepsAmount: number): string[] {
  if (stepsAmount === 0) {
    console.error('Invalid steps amount')
    return []
  }
  return Array.from({ length: stepsAmount }, (_, index) => `modal.identity_setup.${account}.helper_step_${index + 1}`)
}

function getTimeFormatted(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`
}

function AccountsConnectModal({ open, onClose }: ModalProps) {
  const t = useFormatMessage()
  const { getSignedMessage, copyMessageToClipboard, openThread, time, isValidated } = useForumConnect()

  const [modalState, setModalState] = useState<ModalState>({
    currentType: ModalType.CHOOSE_ACCOUNT,
    currentStep: 1,
    isTimerActive: false,
    isValidating: false,
  })

  const nextStep = () => setModalState((state) => ({ ...state, currentStep: state.currentStep + 1 }))
  const setIsTimerActive = (value: boolean) => setModalState((state) => ({ ...state, isTimerActive: value }))
  const setCurrentType = (value: ModalType) => setModalState((state) => ({ ...state, currentType: value }))
  const setIsValidating = (value: boolean) => setModalState((state) => ({ ...state, isValidating: value }))
  const isTimerExpired = time <= 0

  const timerTextKey = useMemo(
    () => (isTimerExpired ? 'modal.identity_setup.timer_expired' : 'modal.identity_setup.timer'),
    [isTimerExpired]
  )

  useEffect(() => {
    if (isTimerExpired) {
      setModalState((state) => ({ ...state, currentStep: 1 }))
      setIsValidating(false)
    }
  }, [isTimerExpired])

  useEffect(() => {
    if (isValidated !== undefined) {
      setIsValidating(false)
    }
  }, [isValidated])

  const handleSign = useCallback(async () => {
    try {
      setIsTimerActive(true)
      await getSignedMessage()
      nextStep()
    } catch (error) {
      setIsTimerActive(false)
      console.error(error)
    }
  }, [getSignedMessage])

  const handleCopy = useCallback(() => {
    copyMessageToClipboard()
    nextStep()
  }, [copyMessageToClipboard])

  const handleValidate = useCallback(() => {
    setIsValidating(true)
    openThread()
    nextStep()
  }, [])

  const stateMap = useMemo<Record<ModalType, AccountModal>>(
    () => ({
      [ModalType.CHOOSE_ACCOUNT]: {
        title: 'modal.identity_setup.title',
        actions: [
          {
            title: 'modal.identity_setup.forum.card_title',
            description: 'modal.identity_setup.forum.card_description',
            icon: <CircledForum />,
            onCardClick: () => setCurrentType(ModalType.FORUM),
          },
          {
            title: 'modal.identity_setup.discord.card_title',
            description: 'modal.identity_setup.discord.card_description',
            icon: <CircledDiscord />,
          },
          {
            title: 'modal.identity_setup.twitter.card_title',
            description: 'modal.identity_setup.twitter.card_description',
            icon: <CircledTwitter />,
          },
        ],
      },
      [ModalType.FORUM]: {
        title: 'modal.identity_setup.forum.title',
        actions: getAccountActionSteps(
          'forum',
          FORUM_CONNECT_STEPS_AMOUNT,
          [<Sign key="sign" />, <Copy key="copy" />, <Comment key="comment" />],
          [handleSign, handleCopy, handleValidate],
          modalState.currentStep
        ),
        button: 'modal.identity_setup.forum.action',
        helperTexts: getHelperTexts('forum', FORUM_CONNECT_STEPS_AMOUNT),
      },
    }),
    [handleCopy, handleSign, modalState.currentStep, modalState.isValidating]
  )
  const currentType = modalState.currentType
  const button = stateMap[currentType].button
  const helperTexts = stateMap[currentType].helperTexts

  return (
    <>
      <Modal open={open} className="AccountsConnectModal" size="tiny" onClose={onClose} closeIcon={<Close />}>
        <Modal.Header className="AccountsConnectModal__Header">
          <div>{t(stateMap[currentType].title)}</div>
          {modalState.isTimerActive && (
            <div className="AccountsConnectModal__Timer">{t(timerTextKey, { time: getTimeFormatted(time) })}</div>
          )}
        </Modal.Header>
        <Modal.Content>
          {stateMap[currentType].actions.map((cardProps, index) => {
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
              <Button primary disabled loading={modalState.isValidating}>
                {t(button)}
              </Button>
            )}
            {helperTexts && helperTexts.length > 0 && (
              <div className="AccountsConnectModal__HelperText">
                {modalState.isValidating
                  ? t('modal.identity_setup.forum.helper_loading')
                  : t(helperTexts[modalState.currentStep - 1])}
              </div>
            )}
          </div>
        </Modal.Content>
      </Modal>
    </>
  )
}

export default AccountsConnectModal
