import React from 'react'
import DOMPurify from "dompurify";
import './ProposalComment.css'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

export type ProposalCommentProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  user?: string | null,
  avatar_url: string,
  created_at: string,
  cooked: string|undefined,
}

export default function ProposalComment({ user, avatar_url, created_at, cooked}: ProposalCommentProps) {
  const createMarkup = (html:any) => {
    return  {__html: DOMPurify.sanitize(html, {USE_PROFILES: {html: true}})}
  }

  return <div className="ProposalComment">
          <div className="ProposalComment__ProfileImage">
            <Avatar size="medium" src={avatar_url} />
          </div>
          <div>
            <div className="ProposalComment__Author">
              <Paragraph bold>{user}</Paragraph>
              <span><Paragraph secondary >{Time.from(created_at).fromNow()}</Paragraph></span>
            </div>
            <div dangerouslySetInnerHTML={createMarkup(cooked)} />
          </div>
        </div>
}
