import React, { useMemo } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import { Survey } from '../../../entities/SurveyTopic/types'
import { Vote } from '../../../entities/Votes/types'
import useDelegationOnProposal from '../../../hooks/useDelegationOnProposal'
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
  onVote: (choice: string, choiceIndex: number) => void
  onChangeVote?: (e: React.MouseEvent<unknown, MouseEvent>, changing: boolean) => void
}

const ProposalVotingSection = ({ proposal, votes, loading, changingVote, choices, onVote, onChangeVote }: Props) => {
  const t = useFormatMessage()
  const [account, accountState] = useAuthContext()
  const [delegation, delegationState] = useDelegationOnProposal(proposal, account)
  const delegate: string | null = delegation?.delegatedTo[0]?.delegate
  const delegators: string[] = useMemo(
    () => delegation?.delegatedFrom.map((delegator) => delegator.delegator),
    [delegation?.delegatedFrom]
  )

  const {
    delegatedVp,
    addressVp: ownVotingPower,
    totalVpOnProposal,
    hasEnoughToVote,
    isLoadingVp,
  } = useVotingPowerOnProposal(account, delegators, delegationState.loading, votes, proposal)

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

  const proposalVotingSectionLoading = loading || accountState.loading || delegationState.loading || isLoadingVp

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

          <Header sub>{"What's your stance?"}</Header>
          {/*TODO: internationalization*/}

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
