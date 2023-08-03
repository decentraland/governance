import React from 'react'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import useProposalComments from '../../../hooks/useProposalComments'
import Comments from '../../Comments/Comments'

type ProposalComments = {
  proposal: ProposalAttributes | null
}

export default function ProposalComments({ proposal }: ProposalComments) {
  const { comments, isLoadingComments } = useProposalComments(proposal?.id)

  return (
    <Comments
      comments={comments}
      isLoading={isLoadingComments}
      topicId={proposal?.discourse_topic_id}
      topicSlug={proposal?.discourse_topic_slug}
      topicType="proposal"
    />
  )
}
