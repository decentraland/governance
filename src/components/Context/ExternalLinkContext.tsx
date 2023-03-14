/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useEffect, useState } from 'react'

type Props = {
  children: React.ReactNode
}

type ExternalLinkContextType = {
  isWarningModalOpen: boolean
  onContinue: () => void
  onDismiss: () => void
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

const INITIAL_STATE: ExternalLinkContextType = {
  isWarningModalOpen: false,
  onContinue: () => {},
  onDismiss: () => {},
}

export const ExternalLinkContext = createContext<ExternalLinkContextType>(INITIAL_STATE)

const ExternalLinkContextProvider = ({ children }: Props) => {
  const [warningModalProps, setWarningModalProps] = useState<Omit<ExternalLinkContextType, 'onDismiss'>>(INITIAL_STATE)

  const onDismiss = () => setWarningModalProps((props) => ({ ...props, isWarningModalOpen: false }))

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
    <ExternalLinkContext.Provider value={{ ...warningModalProps, onDismiss }}>{children}</ExternalLinkContext.Provider>
  )
}

export default ExternalLinkContextProvider
