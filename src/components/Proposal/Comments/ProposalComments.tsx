import { Ref, forwardRef } from 'react'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import useProposalComments from '../../../hooks/useProposalComments'
import Comments from '../../Comments/Comments'

type ProposalCommentsProps = {
  proposal: ProposalAttributes | null
}

const ProposalComments = forwardRef(({ proposal }: ProposalCommentsProps, ref: Ref<HTMLDivElement>) => {
  const { comments, isLoadingComments } = useProposalComments(proposal?.id)

  return (
    <div ref={ref}>
      <Comments
        comments={comments}
        isLoading={isLoadingComments}
        topicId={proposal?.discourse_topic_id}
        topicSlug={proposal?.discourse_topic_slug}
        topicType="proposal"
      />
    </div>
  )
})

export default ProposalComments
