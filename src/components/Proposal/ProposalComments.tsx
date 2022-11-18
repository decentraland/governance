import React, { useEffect, useMemo, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { ProposalAttributes } from '../../entities/Proposal/types'
import { forumUrl } from '../../entities/Proposal/utils'
import useProposalComments from '../../hooks/useProposalComments'
import Divider from '../Common/Divider'
import Empty from '../Common/Empty'

import ProposalComment from './ProposalComment'
import './ProposalComments.css'

const DEFAULT_SHOWN_COMMENTS = 5

type Props = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  proposal?: ProposalAttributes | null
  loading?: boolean
}

export default React.memo(function ProposalComments({ proposal, loading, ...props }: Props) {
  const t = useFormatMessage()
  const { comments, isLoadingComments } = useProposalComments(proposal?.id)
  const renderComments = useMemo(() => comments && comments.totalComments > 0, [comments])
  const commentsCount = useMemo(() => (renderComments ? comments!.totalComments : ''), [comments, renderComments])
  const [showAllComments, setShowAllComments] = useState(true)

  useEffect(() => {
    if (comments && comments.totalComments > DEFAULT_SHOWN_COMMENTS) {
      setShowAllComments(false)
    }
  }, [comments])

  const renderedComments = useMemo(() => {
    if (comments && comments.totalComments > 0) {
      return showAllComments ? comments!.comments : comments!.comments.slice(0, DEFAULT_SHOWN_COMMENTS)
    } else {
      return null
    }
  }, [comments, showAllComments])

  return (
    <div>
      {!loading && (
        <div className="ProposalComments">
          <Divider />
          {isLoadingComments && (
            <div className="ProposalComments__Header">
              <Loader className="ProposalComments__Loader" active={true} />
            </div>
          )}
          {!isLoadingComments && (
            <>
              <div className="ProposalComments__Header">
                <Header>{t('page.proposal_comments.title', { count: commentsCount })}</Header>
                {renderComments && (
                  <Button
                    basic
                    disabled={!proposal}
                    target="_blank"
                    rel="noopener noreferrer"
                    href={(proposal && forumUrl(proposal)) || ''}
                  >
                    {t('page.proposal_comments.join_discussion_label')}
                  </Button>
                )}
              </div>
              <div
                {...props}
                className={TokenList.join([
                  'ProposalComments',
                  loading && 'ProposalComments--loading',
                  props.className,
                ])}
              >
                <div className="ProposalComments__Content">
                  {!renderComments && (
                    <div className="ProposalComments__NoComments">
                      <Empty
                        description={t('page.proposal_comments.no_comments_text')}
                        linkText={t('page.proposal_comments.join_discussion_label')}
                        linkHref={(proposal && forumUrl(proposal)) || ''}
                      />
                    </div>
                  )}
                  {renderedComments &&
                    renderedComments.map((comment, index) => (
                      <ProposalComment
                        key={'comment_' + index}
                        avatar_url={comment.avatar_url}
                        user={comment.username}
                        created_at={comment.created_at}
                        cooked={comment.cooked}
                      />
                    ))}
                </div>
                {renderComments && !showAllComments && (
                  <Button
                    basic
                    className="ProposalComments__ReadMore"
                    disabled={!proposal}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      setShowAllComments(true)
                    }}
                  >
                    {t('page.proposal_comments.read_more_label')}
                  </Button>
                )}
                {renderComments && showAllComments && (
                  <Button
                    basic
                    className="ProposalComments__ReadMore"
                    disabled={!proposal}
                    target="_blank"
                    rel="noopener noreferrer"
                    href={(proposal && forumUrl(proposal)) || ''}
                  >
                    {t('page.proposal_comments.comment_on_this_proposal_label')}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
})
