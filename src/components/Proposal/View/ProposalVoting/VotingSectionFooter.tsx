import { Vote } from '../../../../entities/Votes/types'
import { useAuthContext } from '../../../../front/context/AuthProvider'
import useCountdown from '../../../../hooks/useCountdown'
import useFormatMessage from '../../../../hooks/useFormatMessage'
import { ProposalPageState } from '../../../../pages/proposal'
import Time from '../../../../utils/date/Time'
import locations from '../../../../utils/locations'
import Link from '../../../Common/Typography/Link'

import { ChangeVoteButton } from './ChangeVoteButton'
import VoteVotingPowerInfo from './VoteVotingPowerInfo'
import './VotingSectionFooter.css'

interface VotingSectionFooterProps {
  vote: Vote | null
  delegateVote: Vote | null
  startAt?: Date
  finishAt?: Date
  account: string | null
  proposalPageState: ProposalPageState
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
  proposalPageState,
  onChangeVote,
  delegators,
  totalVpOnProposal,
  hasEnoughToVote,
}: VotingSectionFooterProps) => {
  const t = useFormatMessage()
  const [userAddress] = useAuthContext()
  const now = Time.utc()
  const untilStart = useCountdown(Time.utc(startAt) || now)
  const untilFinish = useCountdown(Time.utc(finishAt) || now)
  const started = untilStart.time === 0
  const finished = untilFinish.time === 0
  const showVotingPowerInfo = started && account
  const hasDelegators = !!delegators && delegators.length > 0
  const { changingVote, showVotingError } = proposalPageState

  return (
    <div className="VotingSectionFooter">
      {!showVotingError && (
        <>
          <div className="VotingSectionFooter__VP">
            {showVotingPowerInfo && (
              <VoteVotingPowerInfo
                accountVotingPower={totalVpOnProposal}
                hasEnoughToVote={hasEnoughToVote}
                vote={vote}
              />
            )}
          </div>
          <div className="VotingSectionFooter__Actions">
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
                changingVote={changingVote}
                onChangeVote={onChangeVote}
              />
            )}
          </div>
        </>
      )}
      {showVotingError && (
        <span className="VotingSectionFooter__VotingFailedMessage">
          {t('page.proposal_detail.voting_section.voting_failed')}
        </span>
      )}
    </div>
  )
}

export default VotingSectionFooter
