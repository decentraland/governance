/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useEffect, useMemo, useState } from 'react'

import ExternalLinkWarningModal from './ExternalLinkWarningModal'

type WarningModalProps = {
  isWarningModalOpen: boolean
  onContinue: () => void
}

function openInNewTab(url: string) {
  window?.open(url, '_blank')?.focus()
}

const WHITELIST = [
  /^https:\/\/([a-zA-Z0-9]+\.)?decentraland\.org(\/[^\s]*)?$/g,
  /^https:\/\/([a-zA-Z0-9]+\.)?decentraland\.vote(\/[^\s]*)?$/g,
  /^https:\/\/([a-zA-Z0-9]+\.)?snapshot\.org(\/[^\s]*)?$/g,
  /^https:\/\/([a-zA-Z0-9]+\.)?dcl\.gg(\/[^\s]*)?$/g,
]

const INITIAL_STATE: WarningModalProps = {
  isWarningModalOpen: false,
  onContinue: () => {},
}

function ExternalLinkWarningModalWrapper() {
  const [warningModalProps, setWarningModalProps] = useState(INITIAL_STATE)

  const { isWarningModalOpen, onContinue } = warningModalProps
  const onDismiss = useMemo(() => () => setWarningModalProps((props) => ({ ...props, isWarningModalOpen: false })), [])

  useEffect(() => {
    const handleExternalLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLAnchorElement
      const href = target.getAttribute('href')
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        const url = new URL(href)
        const matchedItem = WHITELIST.find((regex) => regex.test(url.href))
        if (!matchedItem) {
          event.preventDefault()
          setWarningModalProps({ isWarningModalOpen: true, onContinue: () => openInNewTab(url.href) })
        }
      }
    }

    document.addEventListener('click', handleExternalLinkClick)

    return () => {
      document.removeEventListener('click', handleExternalLinkClick)
    }
  }, [])

  return (
    <ExternalLinkWarningModal
      open={isWarningModalOpen}
      onContinue={onContinue}
      onDismiss={onDismiss}
      onClose={onDismiss}
    />
  )
}

export default ExternalLinkWarningModalWrapper
