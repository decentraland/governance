import React from 'react'

import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import DOMPurify from 'dompurify'

import { FORUM_URL } from '../../constants'

import './ProposalComment.css'

export type ProposalCommentProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  user?: string | null
  avatar_url: string
  created_at: string
  cooked: string | undefined
}

export default function ProposalComment({ user, avatar_url, created_at, cooked }: ProposalCommentProps) {
  const createMarkup = (html: any) => {
    DOMPurify.addHook('afterSanitizeAttributes', function (node) {
      if (node.nodeName && node.nodeName === 'IMG' && node.getAttribute('alt') === 'image') {
        node.className = 'ProposalComment__Cooked__Img'
      }
    })

    const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
    return { __html: clean }
  }

  const discourseUserUrl = `${FORUM_URL}u/${user}`

  return (
    <div className="ProposalComment">
      <div className="ProposalComment__ProfileImage">
        <a href={discourseUserUrl} target="_blank" rel="noopener noreferrer">
          <Avatar size="medium" src={avatar_url} />
        </a>
      </div>
      <div className="ProposalComment__Content">
        <div className="ProposalComment__Author">
          <a href={discourseUserUrl} target="_blank" rel="noopener noreferrer">
            <Paragraph bold>{user}</Paragraph>
          </a>
          <span>
            <Paragraph secondary>{Time.from(created_at).fromNow()}</Paragraph>
          </span>
        </div>
        <div className="ProposalComment__Cooked" dangerouslySetInnerHTML={createMarkup(cooked)} />
      </div>
    </div>
  )
}
