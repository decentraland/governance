import React from 'react'
import { Link } from 'gatsby-plugin-intl'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { ProposalAttributes } from '../../entities/Proposal/types'
import locations from '../../modules/locations'
import { Vote } from '../../entities/Votes/types'
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
  votes?: Record<string, Vote> | null,
  votingPower?: number
  loading?: boolean,
  disabled?: boolean,
  changingVote?: boolean,
  onChangeVote?: (e: React.MouseEvent<any>, changing: boolean) => void,
  onVote?: (e: React.MouseEvent<any>, choice: string, choiceIndex: number) => void
}

export default React.memo(function ProposalComments({ proposal, loading, ...props }: ProposalResultSectionProps) {
  const l = useFormatMessage()
  const [ profile ] = useAsyncMemo(
    async () => proposal?.user ? profiles.load(proposal.user) : null,
    [ proposal?.user ],
    { callWithTruthyDeps: true }
  )

  return <div>
    <hr />
    <Header>Comments</Header>
    <div {...props} className={TokenList.join([
      'ProposalComments',
      loading && 'ProposalComments--loading',
      props.className
    ])}>
      <div className="ProposalComments__Content">
        <Loader active={loading} />
        <div className="ProposalComments__NoComments">
          <Watermelon />
          <Paragraph small secondary>No comments yet, you have the chance to be the first one!</Paragraph>
          <Link to={locations.balance()}>Join the discussion</Link>
        </div>
        <div className="ProposalComments__Comments">
            {profile && profile.name && <Avatar size="mini" address={profile.ethAddress} style={{ marginRight: '.5rem' }} />}
            {profile && profile.name}
            {(!profile || !profile.name) && !!proposal?.user &&  <Blockie scale={3} seed={proposal?.user || ''}>
              <Address value={proposal?.user || ''} />
            </Blockie>}
        </div>
      </div>
    </div>
  </div>
})
