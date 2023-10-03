import React from 'react'

import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { useTabletMediaQuery } from 'decentraland-ui/dist/components/Media/Media'

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
  proposalHasReactions: boolean
  scrollToComments: () => void
  scrollToReactions: () => void
  proposalId?: string
  discourseTopicId?: number
  discourseTopicSlug?: string
}

const FloatingBar = ({
  proposalId,
  discourseTopicId,
  discourseTopicSlug,
  proposalHasReactions,
  isVisible,
  scrollToComments,
  scrollToReactions,
}: FloatingBarProps) => {
  const t = useFormatMessage()
  const { comments, isLoadingComments } = useProposalComments(proposalId)
  const isTablet = useTabletMediaQuery()
  const showViewReactions = proposalHasReactions && !isTablet
  return (
    <div className={classNames('FloatingBar', !isVisible && 'FloatingBar--hidden')}>
      <div className="FloatingBar__ProposalSectionActions">
        {showViewReactions && (
          <Link onClick={scrollToReactions} className={'FloatingBar__Action'}>
            {t('component.floating_bar.view_reactions_label')}
            <img src={reactions} className="FloatingBar__ReactionsImg" />
          </Link>
        )}
        <Link onClick={scrollToComments} className={'FloatingBar__Action'}>
          {isLoadingComments && (
            <Loader
              active
              size="tiny"
              className={classNames(
                !showViewReactions && 'FloatingBar__LoaderLeft',
                showViewReactions && 'FloatingBar__LoaderRight'
              )}
            />
          )}
          {!isLoadingComments && (
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
