import Bold from 'decentraland-gatsby/dist/components/Text/Bold'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import React from 'react'
import './DelegationsLabel.css'
import { Vote } from '../../entities/Votes/types'
import useVotingPowerBalance from '../../hooks/useVotingPowerBalance'
import locations from '../../modules/locations'
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
  const isVotingOpen = started && !finished
  const { votingPower, isLoadingVotingPower } = { votingPower: 333, isLoadingVotingPower: false } //TODO: useVotingPowerBalance(account)
  const showVotingPowerInfo = started && account
  const showChangeVoteButton = isVotingOpen && !changingVote && vote
  const showOverruleVoteButton = isVotingOpen && !changingVote && !vote && delegateVote && !hasDelegators
  const showCancelChangeVoteButton = isVotingOpen && (vote || delegateVote) && changingVote
  const hasEnoughVP = !!votingPower && votingPower > 0 && !isLoadingVotingPower

  const t = useFormatMessage()

  function changeVote(e: React.MouseEvent<any, MouseEvent>) {
    e.preventDefault()
    onChangeVote && onChangeVote(e, true)
  }

  const vp = <Bold>{t(`general.number`, { value: votingPower || 0 })} VP</Bold>
  return (
    <div className={'VotingSectionFooter'}>
      <div className={'VotingSectionFooter__VP'}>
        {showVotingPowerInfo && (
          <>
            {hasEnoughVP &&
              (vote
                ? t('page.proposal_detail.voted_with', { vp: vp })
                : t('page.proposal_detail.voting_with', { vp: vp }))}
            {!hasEnoughVP &&
              t('page.proposal_detail.vp_needed', { vp: <Bold>{t(`general.number`, { value: 1 })} VP</Bold> })}
          </>
        )}
      </div>
      <div className={'VotingSectionFooter__Actions'}>
        {showVotingPowerInfo && !hasEnoughVP && (
          <Link href={locations.balance()}>{t('page.proposal_detail.get_vp')}</Link>
        )}
        {showChangeVoteButton && (
          <Button className={'VotingSectionFooter__Button'} as={Link} basic onClick={changeVote}>
            {t('page.proposal_detail.vote_change')}
          </Button>
        )}
        {showOverruleVoteButton && (
          <Button className={'VotingSectionFooter__Button'} as={Link} basic onClick={changeVote}>
            {t('page.proposal_detail.vote_overrule')}
          </Button>
        )}
        {showCancelChangeVoteButton && (
          <Button
            basic
            className={'VotingSectionFooter__Button'}
            onClick={(e) => onChangeVote && onChangeVote(e, false)}
          >
            {t('general.cancel')}
          </Button>
        )}
      </div>
    </div>
  )
}

export default VotingSectionFooter
