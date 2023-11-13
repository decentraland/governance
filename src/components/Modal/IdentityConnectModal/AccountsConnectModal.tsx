import { useCallback, useEffect, useMemo, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useTrackContext from 'decentraland-gatsby/dist/context/Track/useTrackContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import { SegmentEvent } from '../../../entities/Events/types'
import { GATSBY_DISCORD_PROFILE_VERIFICATION_URL } from '../../../entities/User/constants'
import { AccountType } from '../../../entities/User/types'
import useDiscordConnect from '../../../hooks/useDiscordConnect'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useForumConnect, { THREAD_URL } from '../../../hooks/useForumConnect'
import useIsProfileValidated from '../../../hooks/useIsProfileValidated'
import locations, { navigate } from '../../../utils/locations'
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
import './AccountsConnectModal.css'
import PostConnection from './PostConnection'

type Props = ModalProps & {
  onClose: () => void
  account?: AccountType
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
  [AccountType.Discord]: {
    1: {
      start: 'modal.identity_setup.discord.card_helper.step_1_start',
      active: 'modal.identity_setup.discord.card_helper.step_1_active',
      success: 'modal.identity_setup.discord.card_helper.step_1_success',
      error: 'modal.identity_setup.discord.card_helper.step_1_error',
    },
    2: {
      start: 'modal.identity_setup.discord.card_helper.step_2_start',
      active: 'modal.identity_setup.discord.card_helper.step_2_active',
      success: 'modal.identity_setup.discord.card_helper.step_2_success',
    },
    3: {
      start: GATSBY_DISCORD_PROFILE_VERIFICATION_URL,
      active: GATSBY_DISCORD_PROFILE_VERIFICATION_URL,
      success: GATSBY_DISCORD_PROFILE_VERIFICATION_URL,
    },
  },
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

function getHelperTextKey(currentStep: number, account: AccountType): string | undefined {
  return currentStep <= FORUM_CONNECT_STEPS_AMOUNT
    ? `modal.identity_setup.${account}.helper_step_${currentStep}`
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

function AccountsConnectModal({ open, onClose, account }: Props) {
  const t = useFormatMessage()
  const [address] = useAuthContext()
  const track = useTrackContext()
  const {
    getSignedMessage: getForumMessage,
    copyMessageToClipboard: copyForumMessage,
    openThread: openForumThread,
    time: forumVerificationTime,
    isValidated: isForumValidationFinished,
    reset: resetForumConnect,
  } = useForumConnect()

  const {
    getSignedMessage: getDiscordMessage,
    copyMessageToClipboard: copyDiscordMessage,
    openChannel: openDiscordChannel,
    time: discordVerificationTime,
    isValidated: isDiscordValidationFinished,
    reset: resetDiscordConnect,
  } = useDiscordConnect()

  const { isProfileValidated: isValidatedOnForum } = useIsProfileValidated(address, [AccountType.Forum])
  const { isProfileValidated: isValidatedOnDiscord } = useIsProfileValidated(address, [AccountType.Discord])

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
  const setStepHelper = useCallback((step: number, account: AccountType, helperState: keyof CardHelperKeys) => {
    const helperTextKey = STEPS_HELPERS_KEYS[account][step][helperState]
    if (!helperTextKey) return
    const newHelpers = { [step]: helperTextKey }
    if (helperState === 'success') {
      newHelpers[step + 1] = STEPS_HELPERS_KEYS[account][step + 1]?.active
    }
    setModalState((state) => ({ ...state, stepsCurrentHelper: { ...state.stepsCurrentHelper, ...newHelpers } }))
  }, [])
  const resetState = (account: AccountType) => {
    setModalState((state) => ({ ...state, currentStep: 1 }))
    setIsValidating(false)
    initializeStepHelpers(account)
  }
  const resetValidation = modalState.currentType === ModalType.Forum ? resetForumConnect : resetDiscordConnect
  const time = modalState.currentType === ModalType.Forum ? forumVerificationTime : discordVerificationTime
  const isTimerExpired = time <= 0
  const isValidated = isForumValidationFinished || isDiscordValidationFinished
  const currentAccount = modalState.currentType === ModalType.Forum ? AccountType.Forum : AccountType.Discord

  const initializeAccount = useCallback((modal: ModalType, account: AccountType) => {
    setCurrentType(modal)
    initializeStepHelpers(account)
  }, [])

  const initializeForum = useCallback(() => initializeAccount(ModalType.Forum, AccountType.Forum), [initializeAccount])
  const initializeDiscord = useCallback(
    () => initializeAccount(ModalType.Discord, AccountType.Discord),
    [initializeAccount]
  )

  useEffect(() => {
    if (isTimerExpired) {
      resetState(currentAccount)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalState.currentType, isTimerExpired])

  useEffect(() => {
    switch (account) {
      case AccountType.Forum:
        initializeForum()
        break
      case AccountType.Discord:
        initializeDiscord()
        break
      default:
        break
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isValidated !== undefined) {
      setIsValidating(false)
    }
  }, [isValidated])

  const handleForumSign = useCallback(async () => {
    const STEP_NUMBER = 1
    const account = AccountType.Forum
    try {
      setIsTimerActive(true)
      setStepHelper(STEP_NUMBER, account, 'active')
      await getForumMessage()
      setStepHelper(STEP_NUMBER, account, 'success')
      setCurrentStep(STEP_NUMBER + 1)
      track(SegmentEvent.IdentityStarted, { address, account: AccountType.Forum })
    } catch (error) {
      setIsTimerActive(false)
      setStepHelper(STEP_NUMBER, account, 'error')
      console.error(error)
    }
  }, [address, getForumMessage, setStepHelper, track])

  const handleForumCopy = useCallback(() => {
    const STEP_NUMBER = 2
    const account = AccountType.Forum
    copyForumMessage()
    setStepHelper(STEP_NUMBER, account, 'success')
    setCurrentStep(STEP_NUMBER + 1)
  }, [copyForumMessage, setStepHelper])

  const handleForumValidate = useCallback(() => {
    setIsValidating(true)
    openForumThread()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDiscordSign = useCallback(async () => {
    const STEP_NUMBER = 1
    const account = AccountType.Discord
    try {
      setIsTimerActive(true)
      setStepHelper(STEP_NUMBER, account, 'active')
      await getDiscordMessage()
      setStepHelper(STEP_NUMBER, account, 'success')
      setCurrentStep(STEP_NUMBER + 1)
      track(SegmentEvent.IdentityStarted, { address, account: AccountType.Discord })
    } catch (error) {
      setIsTimerActive(false)
      setStepHelper(STEP_NUMBER, account, 'error')
      console.error(error)
    }
  }, [address, getDiscordMessage, setStepHelper, track])

  const handleDiscordCopy = useCallback(() => {
    const STEP_NUMBER = 2
    const account = AccountType.Discord
    copyDiscordMessage()
    setStepHelper(STEP_NUMBER, account, 'success')
    setCurrentStep(STEP_NUMBER + 1)
  }, [copyDiscordMessage, setStepHelper])

  const handleDiscordValidate = useCallback(() => {
    setIsValidating(true)
    openDiscordChannel()
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
            onCardClick: initializeForum,
            isVerified: isValidatedOnForum,
          },
          {
            title: t('modal.identity_setup.discord.card_title'),
            description: t('modal.identity_setup.discord.card_description'),
            icon: <CircledDiscord />,
            onCardClick: initializeDiscord,
            isVerified: isValidatedOnDiscord,
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
        helperText: t(getHelperTextKey(modalState.currentStep, AccountType.Forum)),
      },
      [ModalType.Discord]: {
        title: t('modal.identity_setup.discord.title'),
        subtitle: t('modal.identity_setup.discord.subtitle'),
        actions: getAccountActionSteps(
          AccountType.Discord,
          DISCORD_CONNECT_STEPS_AMOUNT,
          [
            <Sign className="DiscordConnectStepIcon" key="sign" />,
            <Copy className="DiscordConnectStepIcon" key="copy" />,
            <Comment className="DiscordConnectStepIcon" key="comment" />,
          ],
          [handleDiscordSign, handleDiscordCopy, handleDiscordValidate],
          modalState.currentStep,
          t,
          modalState.stepsCurrentHelper
        ),
        button: getModalButton(t('modal.identity_setup.discord.action'), modalState.isValidating),
        helperText: t(getHelperTextKey(modalState.currentStep, AccountType.Discord)),
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      initializeForum,
      isValidatedOnForum,
      initializeDiscord,
      isValidatedOnDiscord,
      handleForumSign,
      handleForumCopy,
      handleForumValidate,
      modalState.currentStep,
      modalState.stepsCurrentHelper,
      modalState.isValidating,
      handleDiscordSign,
      handleDiscordCopy,
      handleDiscordValidate,
    ]
  )
  const currentType = modalState.currentType

  const queryClient = useQueryClient()

  const handleOnClose = () => {
    resetValidation()
    setIsTimerActive(false)
    resetState(currentAccount)
    setCurrentType(ModalType.ChooseAccount)
    queryClient.invalidateQueries({
      queryKey: ['isProfileValidated', address],
    })
    queryClient.invalidateQueries({
      queryKey: ['userGovernanceProfile', address],
    })
    queryClient.invalidateQueries({
      queryKey: ['isDiscordActive', address],
    })
    onClose()
  }

  const handlePostAction = () => {
    if (isValidated) {
      navigate(locations.profile({ address: address || '' }))
      handleOnClose()
    } else {
      resetValidation()
      setModalState(INITIAL_STATE)
    }
  }

  const timerTextKey = isTimerExpired ? 'modal.identity_setup.timer_expired' : 'modal.identity_setup.timer'

  return (
    <Modal open={open} size="tiny" onClose={handleOnClose} closeIcon={<Close />}>
      {isValidated === undefined ? (
        <AccountConnection
          title={stateMap[currentType].title}
          subtitle={stateMap[currentType].subtitle}
          timerText={
            modalState.isTimerActive
              ? t(timerTextKey, {
                  time: getTimeFormatted(time),
                })
              : undefined
          }
          actions={stateMap[currentType].actions}
          button={stateMap[currentType].button}
          helperText={
            modalState.isValidating ? t('modal.identity_setup.forum.helper_loading') : stateMap[currentType].helperText
          }
        />
      ) : (
        <PostConnection
          account={currentAccount}
          address={address || undefined}
          isValidated={isValidated}
          onPostAction={handlePostAction}
        />
      )}
    </Modal>
  )
}

export default AccountsConnectModal
