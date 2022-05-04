import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'

import { Vote } from '../../entities/Votes/types'
import useVotingPowerBalance from '../../hooks/useVotingPowerBalance'
import locations from '../../modules/locations'

import { ChangeVoteButton } from './ChangeVoteButton'
import './DelegationsLabel.css'
import VoteVotingPowerInfo from './VoteVotingPowerInfo'
import './VotingSectionFooter.css'

interface VotingSectionFooterProps {
  vote: Vote | null
  delegateVote: Vote | null
  hasDelegators: boolean
  started: boolean
  finished: boolean
  account: string | null
  changingVote?: boolean
  onChangeVote?: (e: React.MouseEvent<any, MouseEvent>, changing: boolean) => void
}

const VotingSectionFooter = ({
  vote,
  delegateVote,
  hasDelegators,
  started,
  finished,
  account,
  changingVote,
  onChangeVote,
}: VotingSectionFooterProps) => {
  const { hasEnoughToVote } = useVotingPowerBalance(account)
  const showVotingPowerInfo = started && account
  const t = useFormatMessage()

  return (
    <div className={'VotingSectionFooter'}>
      <div className={'VotingSectionFooter__VP'}>
        {showVotingPowerInfo && <VoteVotingPowerInfo vote={vote} account={account} />}
      </div>
      <div className={'VotingSectionFooter__Actions'}>
        {showVotingPowerInfo && !hasEnoughToVote && (
          <Link href={locations.balance()}>{t('page.proposal_detail.get_vp')}</Link>
        )}
        {hasEnoughToVote && (
          <ChangeVoteButton
            vote={vote}
            delegateVote={delegateVote}
            hasDelegators={hasDelegators}
            started={started}
            finished={finished}
            changingVote={changingVote}
            onChangeVote={onChangeVote}
          />
        )}
      </div>
    </div>
  )
}

export default VotingSectionFooter
