import React, { useMemo } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import { Vote } from '../../../entities/Votes/types'
import useDelegation from '../../../hooks/useDelegation'
import useVotesMatch from '../../../hooks/useVotesMatch'
import useVotingPowerOnProposal from '../../../hooks/useVotingPowerOnProposal'
import { getPartyVotes, getVotingSectionConfig } from '../../../modules/votes/utils'

import { ChoiceButtons } from './ChoiceButtons'
import DelegationsLabel from './DelegationsLabel'
import './ProposalVotingSection.css'
import VotedChoiceButton from './VotedChoiceButton'
import VotingSectionFooter from './VotingSectionFooter'

interface Props {
  proposal?: ProposalAttributes | null
  votes?: Record<string, Vote> | null
  loading?: boolean
  changingVote?: boolean
  choices: string[]
  finished: boolean
  onVote?: (e: React.MouseEvent<any, MouseEvent>, choice: string, choiceIndex: number) => void
  onChangeVote?: (e: React.MouseEvent<any, MouseEvent>, changing: boolean) => void
}

const ProposalVotingSection = ({ proposal, votes, loading, changingVote, choices, onVote, onChangeVote }: Props) => {
  const t = useFormatMessage()
  const [account, accountState] = useAuthContext()
  const [delegation, delegationState] = useDelegation(account)
  const delegate: string | null = delegation?.delegatedTo[0]?.delegate
  const delegators: string[] = delegation?.delegatedFrom.map((delegator) => delegator.delegator)
  const {
    delegatedVp,
    addressVp: ownVotingPower,
    totalVpOnProposal,
    hasEnoughToVote,
    vpOnProposalState,
  } = useVotingPowerOnProposal(account, delegators, votes, proposal)

  const { matchResult } = useVotesMatch(account, delegate)
  const voteDifference = matchResult.voteDifference

  const { vote, delegateVote, delegationsLabel, votedChoice, showChoiceButtons } = useMemo(
    () =>
      getVotingSectionConfig(
        votes,
        choices,
        delegate,
        delegators,
        account,
        ownVotingPower,
        delegatedVp,
        voteDifference
      ),
    [votes, choices, delegate, delegators, account, ownVotingPower, delegatedVp, voteDifference]
  )
  const { votesByChoices, totalVotes } = useMemo(
    () => getPartyVotes(delegators, votes, choices),
    [delegators, votes, choices]
  )

  const proposalVotingSectionLoading =
    loading || accountState.loading || delegationState.loading || vpOnProposalState.loading

  return (
    <div className="DetailsSection__Content OnlyDesktop">
      {proposalVotingSectionLoading && (
        <div className={'ProposalVotingSection__Loader'}>
          <Loader active={proposalVotingSectionLoading} />
        </div>
      )}

      {!proposalVotingSectionLoading && (
        <>
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
              startAt={proposal?.start_at}
            />
          )}

          {votedChoice && !changingVote && <VotedChoiceButton {...votedChoice} />}

          <VotingSectionFooter
            vote={vote}
            delegateVote={delegateVote}
            startAt={proposal?.start_at}
            finishAt={proposal?.finish_at}
            account={account}
            changingVote={changingVote}
            onChangeVote={onChangeVote}
            delegators={delegators}
            totalVpOnProposal={totalVpOnProposal}
            hasEnoughToVote={hasEnoughToVote}
          />
        </>
      )}
    </div>
  )
}

export default ProposalVotingSection
