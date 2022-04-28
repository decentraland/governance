import React from 'react'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import Bold from 'decentraland-gatsby/dist/components/Text/Bold'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Vote } from '../../entities/Votes/types'
import { getPartyVotes, getVotingSectionConfig } from '../../entities/Votes/utils'
import useDelegation from '../../hooks/useDelegation'
import useVotingPowerBalance from '../../hooks/useVotingPowerBalance'
import locations from '../../modules/locations'
import { ChoiceButtons } from './ChoiceButtons'
import DelegationsLabel from './DelegationsLabel'
import VotedChoiceButton from './VotedChoiceButton'

interface Props {
  votes?: Record<string, Vote> | null
  loading?: boolean
  changingVote?: boolean
  choices: string[]
  started: boolean
  finished: boolean
  onVote?: (e: React.MouseEvent<any, MouseEvent>, choice: string, choiceIndex: number) => void
  onChangeVote?: (e: React.MouseEvent<any, MouseEvent>, changing: boolean) => void
  votingPower?: number
}

const ProposalVotingSection = ({
  votes,
  loading,
  changingVote,
  choices,
  started,
  finished,
  onVote,
  onChangeVote,
  votingPower,
}: Props) => {
  const t = useFormatMessage()
  const [account, accountState] = useAuthContext()
  const [delegations] = useDelegation(account)
  const delegate = delegations?.delegatedTo[0]?.delegate
  const delegators: string[] = delegations?.delegatedFrom.map((delegator) => delegator.delegator)
  const { vote, delegateVote, delegationsLabel, votedChoice, showChoiceButtons } = getVotingSectionConfig(
    votes,
    choices,
    delegate,
    delegators,
    account
  )
  const somebodyVoted = vote || delegateVote
  const showVotingPowerInfo = started && account && (!somebodyVoted || changingVote)
  const isVotingOpen = started && !finished
  const showChangeVoteButton = isVotingOpen && somebodyVoted && !changingVote
  const showCancelChangeVoteButton = isVotingOpen && somebodyVoted && changingVote
  const { votesByChoices, totalVotes } = getPartyVotes(delegators, votes, choices)
  const [accountVotingPower, votingPowerState] = useVotingPowerBalance(account)
  console.log('accountVotingPower', accountVotingPower)
  const hasEnoughVP =  !!accountVotingPower && accountVotingPower > 0 && !votingPowerState.loading

  return (
    <div className="DetailsSection__Content OnlyDesktop">
      <Loader active={!loading && accountState.loading} />

      {!account && (
        <Button
          basic
          loading={accountState.loading}
          disabled={accountState.loading}
          onClick={() => accountState.select()}
        >
          {t('general.sign_in')}
        </Button>
      )}

      {delegationsLabel && <DelegationsLabel {...delegationsLabel} />}

      {(showChoiceButtons || changingVote) && (
        <ChoiceButtons
          choices={choices}
          vote={vote}
          votesByChoices={votesByChoices}
          delegate={delegate}
          delegateVote={delegateVote}
          totalVotes={totalVotes}
          onVote={onVote}
          started={started}
        />
      )}

      {votedChoice && !changingVote && <VotedChoiceButton {...votedChoice} />}

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

export default ProposalVotingSection
