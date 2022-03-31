import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import React from 'react'
import { forumUrl, proposalUrl } from '../../entities/Proposal/utils'

import { SuccessModal, SuccessModalProps } from './SuccessModal'

export default function ProposalSuccessModal({ proposal, ...props }: SuccessModalProps) {
  const l = useFormatMessage()
  const linkToProposal = (proposal && proposalUrl(proposal)) || ''
  const linkToForum = (proposal && forumUrl(proposal)) || ''

  return (
    <SuccessModal
      title={l('modal.proposal_success.title')}
      description={l('modal.proposal_success.description')}
      linkToForum={linkToForum}
      linkToCopy={linkToProposal}
      {...props}
    />
  )
}
