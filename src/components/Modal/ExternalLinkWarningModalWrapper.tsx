import React, { useContext } from 'react'

import { ExternalLinkContext } from '../Context/ExternalLinkContext'

import ExternalLinkWarningModal from './ExternalLinkWarningModal'

function ExternalLinkWarningModalWrapper() {
  const externalLinkContext = useContext(ExternalLinkContext)
  const { isWarningModalOpen, onDismiss, onContinue } = externalLinkContext
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
