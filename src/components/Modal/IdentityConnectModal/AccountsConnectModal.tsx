import React, { useCallback, useEffect, useMemo, useState } from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import useForumConnect, { THREAD_URL } from '../../../hooks/useForumConnect'
import ActionCard, { ActionCardProps } from '../../ActionCard/ActionCard'
import CircledDiscord from '../../Icon/CircledDiscord'
import CircledForum from '../../Icon/CircledForum'
import CircledTwitter from '../../Icon/CircledTwitter'
import Comment from '../../Icon/Comment'
import Copy from '../../Icon/Copy'
import ForumBlue from '../../Icon/ForumBlue'
import LinkFailed from '../../Icon/LinkFailed'
import LinkSucceded from '../../Icon/LinkSucceded'
import Sign from '../../Icon/Sign'
import ValidatedProfile from '../../Icon/ValidatedProfile'

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
  stepsCurrentHelper?: Record<number, string>
}

type CardHelperKeys = {
  start: string
  active: string
  success: string
  error?: string
}

const STEPS_HELPERS_KEYS: Record<AccountType, Record<number, CardHelperKeys>> = {
  forum: {
    1: {
      start: 'modal.identity_setup.forum.card_helper.step_1_start',
      active: 'modal.identity_setup.forum.card_helper.step_1_active',
      success: 'modal.identity_setup.forum.card_helper.step_1_success',
      error: 'modal.identity_setup.forum.card_helper.step_1_error',
    },
    2: {
      start: 'modal.identity_setup.forum.card_helper.step_2_start',
      active: 'modal.identity_setup.forum.card_helper.step_2_active',
      success: 'modal.identity_setup.forum.card_helper.step_2_success',
    },
    3: {
      start: THREAD_URL,
      active: THREAD_URL,
      success: THREAD_URL,
    },
  },
  discord: {},
  twitter: {},
}

const FORUM_CONNECT_STEPS_AMOUNT = 3

const INITIAL_STATE: ModalState = {
  currentType: ModalType.CHOOSE_ACCOUNT,
  currentStep: 1,
  isTimerActive: false,
  isValidating: false,
}

function getAccountActionSteps(
  account: AccountType,
  stepsAmount: number,
  icons: React.ReactNode[],
  actions: (() => void)[],
  currentStep: number,
  stepHelpers?: Record<number, string>
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
    helper: stepHelpers?.[index + 1],
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

function AccountsConnectModal({ open, onClose }: ModalProps & { onClose: () => void }) {
  const t = useFormatMessage()
  const [address] = useAuthContext()
  const { getSignedMessage, copyMessageToClipboard, openThread, time, isValidated, reset } = useForumConnect()

  const [modalState, setModalState] = useState<ModalState>(INITIAL_STATE)

  const nextStep = () => setModalState((state) => ({ ...state, currentStep: state.currentStep + 1 }))
  const setIsTimerActive = (value: boolean) => setModalState((state) => ({ ...state, isTimerActive: value }))
  const setCurrentType = (value: ModalType) => setModalState((state) => ({ ...state, currentType: value }))
  const setIsValidating = (value: boolean) => setModalState((state) => ({ ...state, isValidating: value }))
  const initializeStepHelpers = (account: AccountType) =>
    setModalState((state) => ({
      ...state,
      stepsCurrentHelper: Object.entries(STEPS_HELPERS_KEYS[account]).reduce(
        (acc, [key, value]) => ({ ...acc, [key]: value.start }),
        {}
      ),
    }))
  const setStepHelper = (step: number, helperState: keyof CardHelperKeys) => {
    const value = STEPS_HELPERS_KEYS.forum[step][helperState]
    if (!value) return
    const newHelpers = { [step]: value }
    if (helperState === 'success') {
      newHelpers[step + 1] = STEPS_HELPERS_KEYS.forum[step + 1].active
    }
    setModalState((state) => ({ ...state, stepsCurrentHelper: { ...state.stepsCurrentHelper, ...newHelpers } }))
  }
  const isTimerExpired = time <= 0

  const timerTextKey = useMemo(
    () => (isTimerExpired ? 'modal.identity_setup.timer_expired' : 'modal.identity_setup.timer'),
    [isTimerExpired]
  )

  useEffect(() => {
    if (isTimerExpired) {
      setModalState((state) => ({ ...state, currentStep: 1 }))
      setIsValidating(false)
      initializeStepHelpers('forum')
    }
  }, [isTimerExpired])

  useEffect(() => {
    if (isValidated !== undefined) {
      setIsValidating(false)
    }
  }, [isValidated])

  const handleSign = useCallback(async () => {
    const STEP_NUMBER = 1
    try {
      setIsTimerActive(true)
      setStepHelper(STEP_NUMBER, 'active')
      await getSignedMessage()
      setStepHelper(STEP_NUMBER, 'success')
      nextStep()
    } catch (error) {
      setIsTimerActive(false)
      setStepHelper(STEP_NUMBER, 'error')
      console.error(error)
    }
  }, [getSignedMessage])

  const handleCopy = useCallback(() => {
    const STEP_NUMBER = 2
    copyMessageToClipboard()
    setStepHelper(STEP_NUMBER, 'success')
    nextStep()
  }, [copyMessageToClipboard])

  const handleValidate = useCallback(() => {
    setIsValidating(true)
    openThread()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            onCardClick: () => {
              setCurrentType(ModalType.FORUM)
              initializeStepHelpers('forum')
            },
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
          modalState.currentStep,
          modalState.stepsCurrentHelper
        ),
        button: 'modal.identity_setup.forum.action',
        helperTexts: getHelperTexts('forum', FORUM_CONNECT_STEPS_AMOUNT),
      },
    }),
    [handleCopy, handleSign, handleValidate, modalState.currentStep, modalState.stepsCurrentHelper]
  )
  const currentType = modalState.currentType
  const button = stateMap[currentType].button
  const helperTexts = stateMap[currentType].helperTexts

  const handlePostAction = () => {
    if (isValidated) {
      onClose()
    } else {
      reset()
      setModalState(INITIAL_STATE)
    }
  }

  return (
    <>
      <Modal
        open={open}
        className="AccountsConnectModal"
        size="tiny"
        onClose={() => {
          reset()
          onClose()
        }}
        closeIcon={<Close />}
      >
        {isValidated === undefined && (
          <>
            <Modal.Header className="AccountsConnectModal__Header">
              <div>{t(stateMap[currentType].title)}</div>
              {modalState.isTimerActive && (
                <div className="AccountsConnectModal__Timer">{t(timerTextKey, { time: getTimeFormatted(time) })}</div>
              )}
            </Modal.Header>
            <Modal.Content>
              {stateMap[currentType].actions.map((cardProps, index) => {
                const { title, description, action_title, helper } = cardProps
                return (
                  <ActionCard
                    key={`ActionCard--${index}`}
                    {...cardProps}
                    title={t(title)}
                    description={t(description)}
                    action_title={t(action_title)}
                    helper={t(helper)}
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
          </>
        )}
        {/* TODO: Abstract this section when new connections become available */}
        {isValidated !== undefined && (
          <Modal.Content>
            <div className="AccountsConnectModal__PostIcons">
              <Avatar address={address || undefined} size="huge" />
              {isValidated ? <LinkSucceded /> : <LinkFailed />}
              <ForumBlue />
            </div>
            <div className="AccountsConnectModal__PostText">
              <Markdown>{t(`modal.identity_setup.forum.${isValidated ? 'success' : 'error'}_text`)}</Markdown>
              <div className="AccountsConnectModal__PostText--subtext">
                <Markdown>{t(`modal.identity_setup.forum.${isValidated ? 'success' : 'error'}_subtext`)}</Markdown>
                {isValidated && <ValidatedProfile />}
              </div>
            </div>
            <div className="AccountsConnectModal__PostAction">
              <Button primary onClick={handlePostAction}>
                {t(`modal.identity_setup.forum.${isValidated ? 'success' : 'error'}_button`)}
              </Button>
            </div>
          </Modal.Content>
        )}
      </Modal>
    </>
  )
}

export default AccountsConnectModal
