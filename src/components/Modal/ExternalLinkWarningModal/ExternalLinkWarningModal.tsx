import { useCallback, useEffect, useState } from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import { openUrl } from '../../../helpers'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Heading from '../../Common/Typography/Heading'
import Markdown from '../../Common/Typography/Markdown'

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
    <Modal open={isWarningModalOpen} size="tiny" closeIcon={<Close />} onClose={handleDismiss}>
      <Modal.Content>
        <div className={'ExternalLinkWarningModal__Title'}>
          <Heading size="xs" weight="semi-bold">
            {t('modal.external_link_warning.title')}
          </Heading>
          <Markdown
            componentsClassNames={{
              p: 'ExternalLinkWarningModal__Description',
              a: 'ExternalLinkWarningModal__Link',
            }}
          >
            {t('modal.external_link_warning.description', { url: warningModalState.href })}
          </Markdown>
        </div>
        <div className={'ExternalLinkWarningModal__Actions'}>
          <Button fluid primary className={'ExternalLinkWarningModal__Button'} onClick={handleContinue}>
            {t('modal.external_link_warning.accept')}
          </Button>
          <Button fluid basic className={'ExternalLinkWarningModal__Button'} onClick={handleDismiss}>
            {t('modal.external_link_warning.reject')}
          </Button>
        </div>
      </Modal.Content>
    </Modal>
  )
}

export default ExternalLinkWarningModal
