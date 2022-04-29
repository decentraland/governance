import Bold from 'decentraland-gatsby/dist/components/Text/Bold'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import React from 'react'
import './DelegationsLabel.css'
import { Vote } from '../../entities/Votes/types'
import useVotingPowerBalance from '../../hooks/useVotingPowerBalance'
import locations from '../../modules/locations'

interface VotingSectionFooterProps {
  vote: Vote | null
  delegateVote: Vote | null
  started: boolean
  finished: boolean
  account: string | null
  changingVote?: boolean
  onChangeVote?: (e: React.MouseEvent<any, MouseEvent>, changing: boolean) => void
}

const VotingSectionFooter = ({
  vote,
  delegateVote,
  started,
  finished,
  account,
  changingVote,
  onChangeVote,
}: VotingSectionFooterProps) => {
  const somebodyVoted = vote || delegateVote
  const isVotingOpen = started && !finished
  const { votingPower, isLoadingVotingPower } = useVotingPowerBalance(account)
  const showVotingPowerInfo = started && account && (!somebodyVoted || changingVote)
  const showChangeVoteButton = isVotingOpen && somebodyVoted && !changingVote
  const showCancelChangeVoteButton = isVotingOpen && somebodyVoted && changingVote
  const hasEnoughVP = !!votingPower && votingPower > 0 && !isLoadingVotingPower

  const t = useFormatMessage()
  return (
    <div>
      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        {showVotingPowerInfo && (
          <div>
            {hasEnoughVP &&
              (vote
                ? t('page.proposal_detail.voted_with', {
                    vp: <Bold>{t(`general.number`, { value: votingPower || 0 })} VP</Bold>,
                  })
                : t('page.proposal_detail.voting_with', {
                    vp: <Bold>{t(`general.number`, { value: votingPower || 0 })} VP</Bold>,
                  }))}
            {!hasEnoughVP &&
              t('page.proposal_detail.vp_needed', { vp: <Bold>{t(`general.number`, { value: 1 })} VP</Bold> })}
          </div>
        )}
        <div>
          {showChangeVoteButton && (
            <Link onClick={(e) => onChangeVote && onChangeVote(e, true)}>
              {vote ? t('page.proposal_detail.vote_change') : t('page.proposal_detail.vote_overrule')}
            </Link>
          )}
          {!hasEnoughVP && <Link href={locations.balance()}>{t('page.proposal_detail.get_vp')}</Link>}
        </div>
      </div>

      {showCancelChangeVoteButton && (
        <Button basic onClick={(e) => onChangeVote && onChangeVote(e, false)}>
          {t('general.cancel')}
        </Button>
      )}
    </div>
  )
}

export default VotingSectionFooter
