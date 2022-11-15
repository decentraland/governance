import React from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useCountdown from 'decentraland-gatsby/dist/hooks/useCountdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

import { Vote } from '../../../entities/Votes/types'
import locations from '../../../modules/locations'
import { ProposalPageContext } from '../../../pages/proposal'

import { ChangeVoteButton } from './ChangeVoteButton'
import VoteVotingPowerInfo from './VoteVotingPowerInfo'
import './VotingSectionFooter.css'

interface VotingSectionFooterProps {
  vote: Vote | null
  delegateVote: Vote | null
  startAt?: Date
  finishAt?: Date
  account: string | null
  proposalContext: ProposalPageContext
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
  proposalContext,
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

  const [userAddress] = useAuthContext()

  return (
    <div className={'VotingSectionFooter'}>
      {!proposalContext.showVotingError && (
        <>
          <div className={'VotingSectionFooter__VP'}>
            {showVotingPowerInfo && (
              <VoteVotingPowerInfo
                accountVotingPower={totalVpOnProposal}
                hasEnoughToVote={hasEnoughToVote}
                vote={vote}
              />
            )}
          </div>
          <div className={'VotingSectionFooter__Actions'}>
            {showVotingPowerInfo && userAddress && !hasEnoughToVote && (
              <Link href={locations.profile({ address: userAddress })}>{t('page.proposal_detail.get_vp')}</Link>
            )}
            {hasEnoughToVote && (
              <ChangeVoteButton
                vote={vote}
                delegateVote={delegateVote}
                hasDelegators={hasDelegators}
                started={started}
                finished={finished}
                changingVote={proposalContext.changingVote}
                onChangeVote={onChangeVote}
              />
            )}
          </div>
        </>
      )}
      {proposalContext.showVotingError && (
        <span className="VotingSectionFooter__VotingFailedMessage">{'Failed to cast vote'}</span>
      )}
    </div>
  )
}

export default VotingSectionFooter
