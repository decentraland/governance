import React from 'react'

import useCountdown from 'decentraland-gatsby/dist/hooks/useCountdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

import { Vote } from '../../../entities/Votes/types'
import locations from '../../../modules/locations'

import { ChangeVoteButton } from './ChangeVoteButton'
import './DelegationsLabel.css'
import VoteVotingPowerInfo from './VoteVotingPowerInfo'
import './VotingSectionFooter.css'

interface VotingSectionFooterProps {
  vote: Vote | null
  delegateVote: Vote | null
  startAt?: Date
  finishAt?: Date
  account: string | null
  changingVote?: boolean
  onChangeVote?: (e: React.MouseEvent<unknown, MouseEvent>, changing: boolean) => void
  delegators: string[] | null
  totalVpOnProposal: number
  hasEnoughToVote: boolean
}

const VotingSectionFooter = ({
  vote,
  delegateVote,
  startAt,
  finishAt,
  account,
  changingVote,
  onChangeVote,
  delegators,
  totalVpOnProposal,
  hasEnoughToVote,
}: VotingSectionFooterProps) => {
  const t = useFormatMessage()
  const now = Time.utc()
  const untilStart = useCountdown(Time.utc(startAt) || now)
  const untilFinish = useCountdown(Time.utc(finishAt) || now)
  const started = untilStart.time === 0
  const finished = untilFinish.time === 0
  const showVotingPowerInfo = started && account
  const hasDelegators = !!delegators && delegators.length > 0

  return (
    <div className={'VotingSectionFooter'}>
      <div className={'VotingSectionFooter__VP'}>
        {showVotingPowerInfo && (
          <VoteVotingPowerInfo accountVotingPower={totalVpOnProposal} hasEnoughToVote={hasEnoughToVote} vote={vote} />
        )}
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
