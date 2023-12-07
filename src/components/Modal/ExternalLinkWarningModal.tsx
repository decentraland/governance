import { useCallback, useEffect, useState } from 'react'

import { openUrl } from '../../helpers'
import useFormatMessage from '../../hooks/useFormatMessage'
import Markdown from '../Common/Typography/Markdown'

import ConfirmationModal from './ConfirmationModal'
import './ExternalLinkWarningModal.css'

type WarningModalState = {
  isWarningModalOpen: boolean
  href: string
}

const WHITELIST = [
  /^https:\/\/([a-zA-Z0-9]+\.)?decentraland\.org(\/[^\s]*)?$/,
  /^https:\/\/([a-zA-Z0-9]+\.)?decentraland\.vote(\/[^\s]*)?$/,
  /^https:\/\/([a-zA-Z0-9]+\.)?snapshot\.org(\/[^\s]*)?$/,
  /^https:\/\/([a-zA-Z0-9]+\.)?dcl\.gg(\/[^\s]*)?$/,
]

const INITIAL_STATE: WarningModalState = {
  isWarningModalOpen: false,
  href: '',
}

function ExternalLinkWarningModal() {
  const t = useFormatMessage()
  const [warningModalState, setWarningModalState] = useState(INITIAL_STATE)

  const { isWarningModalOpen, href } = warningModalState
  const handleDismiss = () => setWarningModalState((state) => ({ ...state, isWarningModalOpen: false }))
  const handleContinue = useCallback(() => {
    openUrl(href)
    handleDismiss()
  }, [href])

  useEffect(() => {
    const handleExternalLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLAnchorElement
      const href = target.getAttribute('href')
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        const url = new URL(href)
        const matchedItem = WHITELIST.find((regex) => regex.test(url.href))
        if (!matchedItem) {
          event.preventDefault()
          setWarningModalState({ isWarningModalOpen: true, href: url.href })
        }
      }
    }

    document.addEventListener('click', handleExternalLinkClick)

    return () => {
      document.removeEventListener('click', handleExternalLinkClick)
    }
  }, [])

  return (
    <ConfirmationModal
      title={t('modal.external_link_warning.title')}
      description={
        <Markdown
          componentsClassNames={{
            a: 'ExternalLinkWarningModal__Link',
          }}
        >
          {t('modal.external_link_warning.description', { url: warningModalState.href })}
        </Markdown>
      }
      isOpen={isWarningModalOpen}
      onClose={handleDismiss}
      onPrimaryClick={handleContinue}
      onSecondaryClick={handleDismiss}
      primaryButtonText={t('modal.external_link_warning.accept')}
      secondaryButtonText={t('modal.external_link_warning.reject')}
    />
  )
}

export default ExternalLinkWarningModal
