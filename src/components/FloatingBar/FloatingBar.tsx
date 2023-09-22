import React from 'react'

import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { forumUrl } from '../../entities/Proposal/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import useProposalComments from '../../hooks/useProposalComments'
import Link from '../Common/Typography/Link'
import Forum from '../Icon/Forum'
import Open from '../Icon/Open'

import './FloatingBar.css'

const reactions = require('../../images/reactions.png').default

interface FloatingBarProps {
  isVisible: boolean
  showViewReactions: boolean
  scrollToComments: () => void
  scrollToReactions: () => void
  proposalId?: string
  discourseTopicId?: number
  discourseTopicSlug?: string
  isLoadingProposal: boolean
}

const FloatingBar: React.FC<FloatingBarProps> = ({
  proposalId,
  discourseTopicId,
  discourseTopicSlug,
  showViewReactions,
  isVisible,
  scrollToComments,
  scrollToReactions,
  isLoadingProposal,
}) => {
  const t = useFormatMessage()
  const { comments, isLoadingComments } = useProposalComments(proposalId)
  const showTotalComments = !isLoadingComments && !isLoadingProposal
  return (
    <div className={classNames('FloatingBar', !isVisible && !isLoadingProposal && 'FloatingBar--hidden')}>
      <div className="FloatingBar__ProposalSectionActions">
        {showViewReactions && (
          <Link onClick={scrollToReactions} className={'FloatingBar__Action'}>
            {t('component.floating_bar.view_reactions_label')}
            <img src={reactions} className="FloatingBar__ReactionsImg" />
          </Link>
        )}
        <Link onClick={scrollToComments} className={'FloatingBar__Action'}>
          {!showTotalComments && (
            <Loader
              active
              size="tiny"
              className={classNames(
                !showViewReactions && 'FloatingBar__LoaderLeft',
                showViewReactions && 'FloatingBar__LoaderRight'
              )}
            />
          )}
          {showTotalComments && (
            <>
              <Forum color={'var(--black-600)'} />
              {t('component.floating_bar.total_comments_label', { count: comments?.totalComments || 0 })}
            </>
          )}
        </Link>
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
