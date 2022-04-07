import React, { useMemo } from 'react'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { ProposalAttributes } from '../../entities/Proposal/types'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import './ProposalComments.css'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import Watermelon from '../Icon/Watermelon'
import ProposalComment from './ProposalComment'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import { Governance } from '../../api/Governance'
import { forumUrl } from '../../entities/Proposal/utils'

export type ProposalResultSectionProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  proposal?: ProposalAttributes | null
  loading?: boolean
}

export default React.memo(function ProposalComments({ proposal, loading, ...props }: ProposalResultSectionProps) {
  const t = useFormatMessage()
  const [comments] = useAsyncMemo(
    async () => (proposal ? Governance.get().getProposalComments(proposal!.id) : null),
    [proposal]
  )
  let renderComments = useMemo(() => comments && comments.totalComments > 0, [comments])
  const commentsCount = useMemo(() => (renderComments ? comments!.totalComments : ''), [renderComments])

  return (
    <div>
      {!loading && (
        <div className="ProposalComments">
          <hr />
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
            className={TokenList.join(['ProposalComments', loading && 'ProposalComments--loading', props.className])}
          >
            <div className="ProposalComments__Content">
              {!renderComments && (
                <div className="ProposalComments__NoComments">
                  <Watermelon />
                  <Paragraph small secondary>
                    {t('page.proposal_comments.no_comments_text')}
                  </Paragraph>
                  <Button
                    basic
                    disabled={!proposal}
                    target="_blank"
                    rel="noopener noreferrer"
                    href={(proposal && forumUrl(proposal)) || ''}
                  >
                    {t('page.proposal_comments.join_discussion_label')}
                  </Button>
                </div>
              )}
              {renderComments &&
                comments!.firstComments.map((comment, index) => (
                  <ProposalComment
                    key={'comment_' + index}
                    avatar_url={comment.avatar_url}
                    user={comment.username}
                    created_at={comment.created_at}
                    cooked={comment.cooked}
                  />
                ))}
            </div>
            {renderComments && (
              <Button
                basic
                className="ProposalComments__ReadMore"
                disabled={!proposal}
                target="_blank"
                rel="noopener noreferrer"
                href={(proposal && forumUrl(proposal)) || ''}
              >
                {t('page.proposal_comments.read_more_label')}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
})
