import React from 'react'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import Link from 'decentraland-gatsby/dist/components/Text/Link'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { ProposalAttributes } from '../../entities/Proposal/types'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import profiles from 'decentraland-gatsby/dist/utils/loader/profile'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { snapshotUrl } from '../../entities/Proposal/utils'

const openIcon = require('../../images/icons/open.svg')

export type ProposalResultSectionProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  proposal?: ProposalAttributes | null,
  loading?: boolean,
  disabled?: boolean,
}

export default React.memo(function ProposalResultSection({ proposal, loading, disabled, ...props }: ProposalResultSectionProps) {
  const l = useFormatMessage()
  const [ profile ] = useAsyncMemo(
    async () => proposal?.user ? profiles.load(proposal.user) : null,
    [ proposal?.user ],
    { callWithTruthyDeps: true }
  )
  // "details_user_label": "Created by",
  // "details_start_label": "Started",
  // "details_finish_label": "Ends",
  // "details_snapshot_label": "Snapshot"
  return <div {...props} className={TokenList.join([
    'DetailsSection',
    disabled && 'DetailsSection--disabled',
    loading &&'DetailsSection--loading',
    'ResultSection',
    props.className
  ])}>
    <Header sub>{l('page.proposal_detail.details_label')}</Header>
    <div className="DetailsSection__Content DetailsSection__Flex">
      <div>{l('page.proposal_detail.details_user_label')}</div>
      <div className="DetailsSection__Value">
        {profile && <Avatar size="mini" address={profile.ethAddress} style={{ marginRight: '.5rem' }} />}
        {profile && profile.name}
        {!profile && !!proposal?.user &&  `${proposal.user.slice(0, 5)}...${proposal.user.slice(-3)}`}
      </div>
    </div>
    <div className="DetailsSection__Content DetailsSection__Flex">
      <div>{l('page.proposal_detail.details_start_label')}</div>
      <div className="DetailsSection__Value">
        {proposal && Time.from(proposal.start_at).format('MMM DD HH:mm')}
      </div>
    </div>
    <div className="DetailsSection__Content DetailsSection__Flex">
      <div>{l('page.proposal_detail.details_finish_label')}</div>
      <div className="DetailsSection__Value">
        {proposal && Time.from(proposal.finish_at).format('MMM DD HH:mm')}
      </div>
    </div>
    <div className="DetailsSection__Content DetailsSection__Flex">
      <div>{l('page.proposal_detail.details_snapshot_label')}</div>
      <div className="DetailsSection__Value">
        {proposal && <Link href={snapshotUrl(proposal)}>
          {'#' + proposal.snapshot_id.slice(0, 7)}
          <img src={openIcon}  width="12" height="12" style={{ marginLeft: '.5rem' }} />
        </Link>}
      </div>
    </div>
  </div>
})