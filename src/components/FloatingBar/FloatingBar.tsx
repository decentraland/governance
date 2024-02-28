import { useEffect, useState } from 'react'

import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Desktop, TabletAndBelow, useTabletAndBelowMediaQuery } from 'decentraland-ui/dist/components/Media/Media'

import { forumUrl } from '../../entities/Proposal/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import useProposalComments from '../../hooks/useProposalComments'
import Link from '../Common/Typography/Link'
import Forum from '../Icon/Forum'
import Open from '../Icon/Open'

import './FloatingBar.css'

const reactions = require('../../images/reactions.png').default

interface Props {
  proposalHasReactions: boolean
  isActiveProposal: boolean
  isLoadingProposal: boolean
  proposalId?: string
  discourseTopicId?: number
  discourseTopicSlug?: string
  reactionsSectionRef: React.MutableRefObject<HTMLDivElement | null>
  commentsSectionRef: React.MutableRefObject<HTMLDivElement | null>
  votingSectionRef: React.MutableRefObject<HTMLDivElement | null>
}

const FloatingBar = ({
  proposalId,
  discourseTopicId,
  discourseTopicSlug,
  proposalHasReactions,
  isActiveProposal,
  isLoadingProposal,
  reactionsSectionRef,
  commentsSectionRef,
  votingSectionRef,
}: Props) => {
  const t = useFormatMessage()
  const { comments, isLoadingComments } = useProposalComments(proposalId)
  const isTabletAndBelow = useTabletAndBelowMediaQuery()
  const showViewReactions = proposalHasReactions && !isTabletAndBelow
  const [isVisible, setIsBarVisible] = useState(true)

  const scrollToReactions = () => {
    if (reactionsSectionRef.current) {
      reactionsSectionRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }
  const scrollToComments = () => {
    if (commentsSectionRef.current) {
      commentsSectionRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToVotingModule = () => {
    if (votingSectionRef.current) {
      votingSectionRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    setIsBarVisible(true)
    if (!isLoadingProposal && typeof window !== 'undefined') {
      const handleScroll = () => {
        const hideBarSectionRef = reactionsSectionRef.current || commentsSectionRef.current
        if (!!hideBarSectionRef && !!window && !isTabletAndBelow) {
          const hideBarSectionTop = hideBarSectionRef.getBoundingClientRect().top
          setIsBarVisible(hideBarSectionTop > window.innerHeight)
        }
      }

      window.addEventListener('scroll', handleScroll)
      return () => {
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }, [isLoadingProposal, isTabletAndBelow, reactionsSectionRef, commentsSectionRef])

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
            <Button basic className="FloatingBar__ActionButton" onClick={scrollToVotingModule}>
              {isActiveProposal ? t('component.floating_bar.vote') : t('component.floating_bar.view_results')}
            </Button>
          </TabletAndBelow>
        </div>
      </div>
    </div>
  )
}

export default FloatingBar
