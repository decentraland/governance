import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Desktop, TabletAndBelow, useTabletMediaQuery } from 'decentraland-ui/dist/components/Media/Media'

import { forumUrl } from '../../entities/Proposal/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import useProposalComments from '../../hooks/useProposalComments'
import Link from '../Common/Typography/Link'
import Forum from '../Icon/Forum'
import Open from '../Icon/Open'

import './FloatingBar.css'

const reactions = require('../../images/reactions.png').default

interface Props {
  isVisible: boolean
  proposalHasReactions: boolean
  isProposalActive: boolean
  scrollToComments: () => void
  scrollToReactions: () => void
  onVoteClick: () => void
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
  isProposalActive,
  scrollToComments,
  scrollToReactions,
  onVoteClick,
}: Props) => {
  const t = useFormatMessage()
  const { comments, isLoadingComments } = useProposalComments(proposalId)
  const isTablet = useTabletMediaQuery()
  const showViewReactions = proposalHasReactions && !isTablet

  return (
    <div className={classNames('FloatingBar', !isVisible && 'FloatingBar--hidden')}>
      <div className="FloatingBar__Container">
        <div className="FloatingBar__ProposalSectionActions">
          {showViewReactions && (
            <button onClick={scrollToReactions} className="FloatingBar__Action">
              {t('component.floating_bar.view_reactions_label')}
              <img alt="" src={reactions} className="FloatingBar__ReactionsImg" />
            </button>
          )}
          <button onClick={scrollToComments} className="FloatingBar__Action">
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
                <Forum color="var(--black-600)" />
                {t('component.floating_bar.total_comments_label', { count: comments?.totalComments || 0 })}
              </>
            )}
          </button>
        </div>
        <div className="FloatingBar__ActionButtonContainer">
          <Desktop>
            <Button
              basic
              disabled={!discourseTopicId}
              as={Link}
              href={(discourseTopicId && forumUrl(discourseTopicSlug, discourseTopicId)) || ''}
              className="FloatingBar__ActionButton"
            >
              {t('component.floating_bar.forum_label')}
              <Open />
            </Button>
          </Desktop>
          <TabletAndBelow>
            <Button basic className="FloatingBar__ActionButton" onClick={onVoteClick}>
              {isProposalActive ? t('component.floating_bar.vote') : t('component.floating_bar.view_results')}
            </Button>
          </TabletAndBelow>
        </div>
      </div>
    </div>
  )
}

export default FloatingBar
