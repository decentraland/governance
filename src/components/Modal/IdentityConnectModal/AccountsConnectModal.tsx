import { useCallback, useEffect, useMemo, useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useTrackContext from 'decentraland-gatsby/dist/context/Track/useTrackContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import { SegmentEvent } from '../../../entities/Events/types'
import { openUrl } from '../../../helpers'
import useDiscordConnect from '../../../hooks/useDiscordConnect'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useForumConnect, { THREAD_URL } from '../../../hooks/useForumConnect'
import locations from '../../../utils/locations'
import { ActionCardProps } from '../../ActionCard/ActionCard'
import CheckCircle from '../../Icon/CheckCircle'
import CircledDiscord from '../../Icon/CircledDiscord'
import CircledForum from '../../Icon/CircledForum'
import CircledTwitter from '../../Icon/CircledTwitter'
import Comment from '../../Icon/Comment'
import Copy from '../../Icon/Copy'
import Lock from '../../Icon/Lock'
import Sign from '../../Icon/Sign'

import AccountConnection, { AccountConnectionProps } from './AccountConnection'
import PostConnection from './PostConnection'

export enum AccountType {
  Forum = 'forum',
  Discord = 'discord',
  Twitter = 'twitter',
}

type AccountModal = Omit<AccountConnectionProps, 'timerText'>

enum ModalType {
  ChooseAccount,
  Forum,
  Discord,
}

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
  [AccountType.Forum]: {
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
  [AccountType.Discord]: {},
  [AccountType.Twitter]: {},
}

const FORUM_CONNECT_STEPS_AMOUNT = 3
const DISCORD_CONNECT_STEPS_AMOUNT = 3

const INITIAL_STATE: ModalState = {
  currentType: ModalType.ChooseAccount,
  currentStep: 1,
  isTimerActive: false,
  isValidating: false,
}

function getActionComponent(action: JSX.Element, isCompleted: boolean, isDisabled: boolean) {
  if (isCompleted) {
    return <CheckCircle size="24" outline />
  }

  if (isDisabled) {
    return <Lock />
  }

  return action
}

function getAccountActionSteps(
  account: AccountType,
  stepsAmount: number,
  icons: React.ReactNode[],
  actions: (() => void)[],
  currentStep: number,
  t: ReturnType<typeof useFormatMessage>,
  stepHelpers?: Record<number, string>
): ActionCardProps[] {
  if (stepsAmount === 0 || (icons.length !== stepsAmount && actions.length !== stepsAmount)) {
    return []
  }
  return Array.from<unknown, ActionCardProps>({ length: stepsAmount }, (_, index) => {
    const stepIdx = index + 1
    const isDisabled = stepIdx > currentStep
    const isCompleted = stepIdx < currentStep && stepIdx <= 1

    const actionButton = (
      <Button basic onClick={actions[index]}>
        {t(`modal.identity_setup.${account}.action_step_${stepIdx}`)}
      </Button>
    )

    return {
      title: t(`modal.identity_setup.${account}.title_step_${stepIdx}`),
      description: t(`modal.identity_setup.${account}.description_step_${stepIdx}`),
      icon: icons[index],
      action: getActionComponent(actionButton, isCompleted, isDisabled),
      isDisabled,
      helper: t(stepHelpers?.[stepIdx]),
    }
  })
}

function getForumHelperTextKey(currentStep: number): string | undefined {
  return currentStep <= FORUM_CONNECT_STEPS_AMOUNT
    ? `modal.identity_setup.${AccountType.Forum}.helper_step_${currentStep}`
    : undefined
}

function getModalButton(text: string, isValidating: boolean) {
  return (
    <Button primary disabled loading={isValidating}>
      {text}
    </Button>
  )
}

function getTimeFormatted(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`
}

function AccountsConnectModal({ open, onClose }: ModalProps & { onClose: () => void }) {
  const t = useFormatMessage()
  const [address] = useAuthContext()
  const track = useTrackContext()
  const {
    getSignedMessage,
    copyMessageToClipboard,
    openThread,
    time,
    isValidated,
    reset: resetForumConnect,
  } = useForumConnect()

  const { getSignedMessage: discordMessage, copyMessageToClipboard: discordCopy, validate } = useDiscordConnect()

  const [modalState, setModalState] = useState<ModalState>(INITIAL_STATE)

  const setCurrentStep = (currentStep: number) => setModalState((state) => ({ ...state, currentStep }))
  const setIsTimerActive = (isTimerActive: boolean) => setModalState((state) => ({ ...state, isTimerActive }))
  const setCurrentType = (currentType: ModalType) => setModalState((state) => ({ ...state, currentType }))
  const setIsValidating = (isValidating: boolean) => setModalState((state) => ({ ...state, isValidating }))
  const initializeStepHelpers = (account: AccountType) =>
    setModalState((state) => ({
      ...state,
      stepsCurrentHelper: Object.entries(STEPS_HELPERS_KEYS[account]).reduce(
        (acc, [key, value]) => ({ ...acc, [key]: value.start }),
        {}
      ),
    }))
  const setStepHelper = (step: number, helperState: keyof CardHelperKeys) => {
    const helperTextKey = STEPS_HELPERS_KEYS.forum[step][helperState]
    if (!helperTextKey) return
    const newHelpers = { [step]: helperTextKey }
    if (helperState === 'success') {
      newHelpers[step + 1] = STEPS_HELPERS_KEYS.forum[step + 1].active
    }
    setModalState((state) => ({ ...state, stepsCurrentHelper: { ...state.stepsCurrentHelper, ...newHelpers } }))
  }
  const resetState = (account: AccountType) => {
    setModalState((state) => ({ ...state, currentStep: 1 }))
    setIsValidating(false)
    initializeStepHelpers(account)
  }
  const isTimerExpired = time <= 0

  useEffect(() => {
    if (isTimerExpired) {
      resetState(AccountType.Forum)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimerExpired])

  useEffect(() => {
    if (isValidated !== undefined) {
      setIsValidating(false)
    }
  }, [isValidated])

  const handleForumSign = useCallback(async () => {
    const STEP_NUMBER = 1
    try {
      setIsTimerActive(true)
      setStepHelper(STEP_NUMBER, 'active')
      await getSignedMessage()
      setStepHelper(STEP_NUMBER, 'success')
      setCurrentStep(STEP_NUMBER + 1)
      track(SegmentEvent.IdentityStarted, { address, account: AccountType.Forum })
    } catch (error) {
      setIsTimerActive(false)
      setStepHelper(STEP_NUMBER, 'error')
      console.error(error)
    }
  }, [address, getSignedMessage, track])

  const handleForumCopy = useCallback(() => {
    const STEP_NUMBER = 2
    copyMessageToClipboard()
    setStepHelper(STEP_NUMBER, 'success')
    setCurrentStep(STEP_NUMBER + 1)
  }, [copyMessageToClipboard])

  const handleForumValidate = useCallback(() => {
    setIsValidating(true)
    openThread()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stateMap = useMemo<Record<ModalType, AccountModal>>(
    () => ({
      [ModalType.ChooseAccount]: {
        title: t('modal.identity_setup.title'),
        actions: [
          {
            title: t('modal.identity_setup.forum.card_title'),
            description: t('modal.identity_setup.forum.card_description'),
            icon: <CircledForum />,
            onCardClick: () => {
              setCurrentType(ModalType.Forum)
              initializeStepHelpers(AccountType.Forum)
            },
          },
          {
            title: t('modal.identity_setup.discord.card_title'),
            description: t('modal.identity_setup.discord.card_description'),
            icon: <CircledDiscord />,
            onCardClick: () => {
              setCurrentType(ModalType.Discord)
              initializeStepHelpers(AccountType.Discord)
            },
          },
          {
            title: t('modal.identity_setup.twitter.card_title'),
            description: t('modal.identity_setup.twitter.card_description'),
            icon: <CircledTwitter />,
          },
        ],
      },
      [ModalType.Forum]: {
        title: t('modal.identity_setup.forum.title'),
        actions: getAccountActionSteps(
          AccountType.Forum,
          FORUM_CONNECT_STEPS_AMOUNT,
          [
            <Sign className="ForumConnectStepIcon" key="sign" />,
            <Copy className="ForumConnectStepIcon" key="copy" />,
            <Comment className="ForumConnectStepIcon" key="comment" />,
          ],
          [handleForumSign, handleForumCopy, handleForumValidate],
          modalState.currentStep,
          t,
          modalState.stepsCurrentHelper
        ),
        button: getModalButton(t('modal.identity_setup.forum.action'), modalState.isValidating),
        helperText: t(getForumHelperTextKey(modalState.currentStep)),
      },
      [ModalType.Discord]: {
        title: t('modal.identity_setup.discord.title'),
        actions: getAccountActionSteps(
          AccountType.Discord,
          DISCORD_CONNECT_STEPS_AMOUNT,
          [
            <Sign className="DiscordConnectStepIcon" key="sign" />,
            <Copy className="DiscordConnectStepIcon" key="copy" />,
            <Comment className="DiscordConnectStepIcon" key="comment" />,
          ],
          [],
          modalState.currentStep,
          t,
          modalState.stepsCurrentHelper
        ),
        button: getModalButton(t('modal.identity_setup.discord.action'), modalState.isValidating),
        helperText: 'HELPER TEXT',
      },
    }),
    [
      t,
      handleForumSign,
      handleForumCopy,
      handleForumValidate,
      modalState.currentStep,
      modalState.stepsCurrentHelper,
      modalState.isValidating,
    ]
  )
  const currentType = modalState.currentType

  const handlePostAction = () => {
    if (isValidated) {
      openUrl(locations.profile({ address: address || '' }), false)
    } else {
      resetForumConnect()
      setModalState(INITIAL_STATE)
    }
  }

  const timerTextKey = isTimerExpired ? 'modal.identity_setup.timer_expired' : 'modal.identity_setup.timer'

  return (
    <Modal
      open={open}
      size="tiny"
      onClose={() => {
        resetForumConnect()
        setIsTimerActive(false)
        resetState(AccountType.Forum)
        setCurrentType(ModalType.ChooseAccount)
        onClose()
      }}
      closeIcon={<Close />}
    >
      {isValidated === undefined ? (
        <AccountConnection
          title={stateMap[currentType].title}
          timerText={modalState.isTimerActive ? t(timerTextKey, { time: getTimeFormatted(time) }) : undefined}
          actions={stateMap[currentType].actions}
          button={stateMap[currentType].button}
          helperText={
            modalState.isValidating ? t('modal.identity_setup.forum.helper_loading') : stateMap[currentType].helperText
          }
        />
      ) : (
        <PostConnection address={address || undefined} isValidated={isValidated} onPostAction={handlePostAction} />
      )}
    </Modal>
  )
}

export default AccountsConnectModal
