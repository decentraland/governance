import React from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { forumUrl } from '../../entities/Proposal/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import useProposalComments from '../../hooks/useProposalComments'
import Link from '../Common/Typography/Link'
import Forum from '../Icon/Forum'
import Open from '../Icon/Open'
import Reactions from '../Icon/Reactions'

import './FloatingBar.css'

interface FloatingBarProps {
  isVisible: boolean
  showViewReactions: boolean
  scrollToComments: () => void
  scrollToReactions: () => void
  proposalId: string
  discourseTopicId: number
  discourseTopicSlug: string
}

const FloatingBar: React.FC<FloatingBarProps> = ({
  proposalId,
  discourseTopicId,
  discourseTopicSlug,
  showViewReactions,
  isVisible,
  scrollToComments,
  scrollToReactions,
}) => {
  const t = useFormatMessage()
  const { comments, isLoadingComments } = useProposalComments(proposalId)
  const showViewComments = !isLoadingComments || (comments && comments.totalComments > 0)

  if (!isVisible) return null
  return (
    <div className="FloatingBar">
      <div className="FloatingBar__ProposalSectionActions">
        {showViewReactions && (
          <Link onClick={scrollToReactions} className={'FloatingBar__ViewComments'}>
            {t('component.floating_bar.view_reactions_label')}
            <Reactions />
          </Link>
        )}
        {showViewComments && (
          <Link onClick={scrollToComments} className={'FloatingBar__ViewComments'}>
            <Forum color={'#736E7D'} />
            {t('component.floating_bar.total_comments_label', { count: comments?.totalComments })}
          </Link>
        )}
      </div>
      <Button
        basic
        disabled={!discourseTopicId}
        target="_blank"
        rel="noopener noreferrer"
        href={(discourseTopicId && forumUrl(discourseTopicSlug, discourseTopicId)) || ''}
        className="FloatingBar__JoinDiscussion"
      >
        {t('component.floating_bar.forum_label')}
        <Open />
      </Button>
    </div>
  )
}

export default FloatingBar
