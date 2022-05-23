import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { forumUrl, proposalUrl } from '../../entities/Proposal/utils'

import { SuccessModal, SuccessModalProps } from './SuccessModal'

export default function ProposalSuccessModal({ proposal, ...props }: SuccessModalProps) {
  const t = useFormatMessage()
  const linkToProposal = (proposal && proposalUrl(proposal)) || ''
  const linkToForum = (proposal && forumUrl(proposal)) || ''

  return (
    <SuccessModal
      title={t('modal.proposal_success.title')}
      description={t('modal.proposal_success.description')}
      linkToForum={linkToForum}
      linkToCopy={linkToProposal}
      {...props}
    />
  )
}
