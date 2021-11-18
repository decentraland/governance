import React from 'react'
import { Link } from 'gatsby-plugin-intl'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { ProposalAttributes } from '../../entities/Proposal/types'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import locations from '../../modules/locations'
import './ProposalComments.css'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import { Blockie } from 'decentraland-ui/dist/components/Blockie/Blockie'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import profiles from 'decentraland-gatsby/dist/utils/loader/profile'
import Watermelon from '../Icon/Watermelon'

export type ProposalResultSectionProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  proposal?: ProposalAttributes | null,
  loading?: boolean,
}

export default React.memo(function ProposalComments({ proposal, loading, ...props }: ProposalResultSectionProps) {
  const comments = true
  const [ profile ] = useAsyncMemo(
    async () => proposal?.user ? profiles.load(proposal.user) : null,
    [ proposal?.user ],
    { callWithTruthyDeps: true }
  )
  const isProfile = !!profile && !profile.isDefaultProfile

  if (!profile) {
    return null
  }

  return <div className="ProposalComments">
    <hr />
    <div className="ProposalComments__Header">
      <Header>Comments</Header> {comments &&
    <Button basic as={Link} href={locations.balance()}>Join the discussion</Button>}
    </div>
    <div {...props} className={TokenList.join([
      'ProposalComments',
      loading && 'ProposalComments--loading',
      props.className
    ])}>
      <div className="ProposalComments__Content">
        <Loader active={loading} />
        {!comments && <div className="ProposalComments__NoComments">
          <Watermelon />
          <Paragraph small secondary>No comments yet, you have the chance to be the first one!</Paragraph>
          <Link to={locations.balance()}>Join the discussion</Link>
        </div>}
        {comments && <div className="ProposalComments__Comment">
          <div className="ProposalComments__ProfileImage">
            {isProfile && <Avatar size="medium" address={profile!.ethAddress} />}
            {!isProfile &&  <Blockie scale={5} seed={proposal?.user || ''} />}
          </div>
          <div>
            <div className="ProposalComments__Author">
              {isProfile && profile!.name || <Address value={profile!.ethAddress || ''} strong />}
              {!isProfile &&  <Address value={proposal?.user || ''} strong />}
              <span><Paragraph secondary >3 days ago</Paragraph></span>
            </div>
            <Paragraph small>This is a pretty nice comment nice comment nice comment nice comment</Paragraph>
          </div>
        </div>}
      </div>
    </div>
  </div>
})
