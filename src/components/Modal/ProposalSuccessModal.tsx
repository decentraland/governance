import { ProposalAttributes } from '../../entities/Proposal/types'
import { forumUrl, proposalUrl } from '../../entities/Proposal/utils'
import useFormatMessage from '../../hooks/useFormatMessage'

import { SuccessModal, SuccessModalProps } from './SuccessModal'

interface Props {
  proposal: ProposalAttributes
}

export default function ProposalSuccessModal({ proposal, ...props }: Props & SuccessModalProps) {
  const t = useFormatMessage()
  const { id, discourse_topic_id, discourse_topic_slug } = proposal
  const linkToProposal = (proposal && proposalUrl(id)) || ''
  const linkToForum = (proposal && forumUrl(discourse_topic_slug, discourse_topic_id)) || ''

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
