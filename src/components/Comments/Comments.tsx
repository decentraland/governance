import { useEffect, useMemo, useState } from 'react'

import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { ProposalCommentsInDiscourse } from '../../entities/Proposal/types'
import { forumUrl } from '../../entities/Proposal/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import Comment from '../Comments/Comment'
import Empty from '../Common/Empty'
import Section from '../Proposal/View/Section'

import './Comments.css'

const DEFAULT_SHOWN_COMMENTS = 5

interface Props {
  isLoading: boolean
  comments?: ProposalCommentsInDiscourse | null
  topicId?: number
  topicSlug?: string
  topicType?: 'proposal' | 'update'
}

export default function Comments({ comments, topicId, topicSlug, isLoading, topicType }: Props) {
  const t = useFormatMessage()
  const renderComments = comments && comments.totalComments > 0
  const commentsCount = renderComments ? comments.totalComments : ''
  const [showAllComments, setShowAllComments] = useState(true)

  useEffect(() => {
    if (comments && comments.totalComments > DEFAULT_SHOWN_COMMENTS) {
      setShowAllComments(false)
    }
  }, [comments])

  const renderedComments = useMemo(() => {
    if (renderComments) {
      return showAllComments ? comments!.comments : comments!.comments.slice(0, DEFAULT_SHOWN_COMMENTS)
    } else {
      return null
    }
  }, [comments, showAllComments, renderComments])

  return (
    <Section
      isLoading={isLoading}
      title={t('page.comments.title', { count: commentsCount })}
      action={
        renderComments && (
          <Button
            basic
            disabled={!topicId}
            target="_blank"
            rel="noopener noreferrer"
            href={(topicId && forumUrl(topicSlug, topicId)) || ''}
          >
            {t('page.comments.join_discussion_label')}
          </Button>
        )
      }
    >
      <div className={classNames('Comments', isLoading && 'Comments--loading')}>
        <div className="Comments__Content">
          {!renderComments && (
            <Empty
              description={t('page.comments.no_comments_text')}
              linkText={t('page.comments.join_discussion_label')}
              linkHref={(topicId && forumUrl(topicSlug, topicId)) || ''}
            />
          )}
          {renderedComments &&
            renderedComments.map((comment, index) => (
              <Comment
                key={'comment_' + index}
                avatarUrl={comment.avatar_url}
                user={comment.username}
                createdAt={comment.created_at}
                cooked={comment.cooked}
                address={comment.address}
              />
            ))}
        </div>
        {renderComments && !showAllComments && (
          <Button
            basic
            className="Comments__ReadMore"
            disabled={!topicId}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              setShowAllComments(true)
            }}
          >
            {t('page.comments.read_more_label')}
          </Button>
        )}
        {renderComments && showAllComments && (
          <Button
            basic
            className="Comments__ReadMore"
            disabled={!topicId}
            target="_blank"
            rel="noopener noreferrer"
            href={(topicId && forumUrl(topicSlug, topicId)) || ''}
          >
            {t(`page.comments.comment_on_this_${topicType}_label`)}
          </Button>
        )}
      </div>
    </Section>
  )
}
