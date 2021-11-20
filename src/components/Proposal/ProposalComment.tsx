import React from 'react'
import './ProposalComment.css'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import { Blockie } from 'decentraland-ui/dist/components/Blockie/Blockie'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import profiles from 'decentraland-gatsby/dist/utils/loader/profile'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

export type ProposalCommentProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  user?: string | null,
  created_at: string,
  cooked: string|undefined,
}

export default function ProposalComment({ user, created_at, cooked}: ProposalCommentProps) {
  const [ profile ] = useAsyncMemo(
    async () => user ? profiles.load(user) : null, [ user ], { callWithTruthyDeps: true }
  )
  const isProfile = !!profile && !profile.isDefaultProfile

  const createMarkup = (html:any) => {
    return  {
      __html: html
    }
  }

  if (!profile) {
    return null
  }

  return <div className="ProposalComment">
          <div className="ProposalComment__ProfileImage">
            {isProfile && <Avatar size="medium" address={profile!.ethAddress} />}
            {!isProfile &&  <Blockie scale={5} seed={user || ''} />}
          </div>
          <div>
            <div className="ProposalComment__Author">
              <Paragraph bold>{user}</Paragraph>
              <span><Paragraph secondary >{Time.from(created_at).fromNow()}</Paragraph></span>
            </div>
            <Paragraph small dangerouslySetInnerHTML={createMarkup(cooked)} />
          </div>
        </div>
}
