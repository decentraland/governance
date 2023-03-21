import React, { useMemo } from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage, { useIntl } from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { ProposalAttributes, ProposalType } from '../../../../entities/Proposal/types'
import { Vote } from '../../../../entities/Votes/types'
import useDelegationOnProposal from '../../../../hooks/useDelegationOnProposal'
import useVotesMatch from '../../../../hooks/useVotesMatch'
import useVotingPowerOnProposal from '../../../../hooks/useVotingPowerOnProposal'
import { getPartyVotes, getVotingSectionConfig } from '../../../../modules/votes/utils'

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
  hasVoted: boolean
  onVote?: (e: React.MouseEvent<unknown, MouseEvent>, choice: string, choiceIndex: number) => void
  onChangeVote?: (e: React.MouseEvent<unknown, MouseEvent>, changing: boolean) => void
}

const CURRENCY_FORMAT_OPTIONS = {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
}

const ProposalVotingSection = ({
  proposal,
  votes,
  loading,
  changingVote,
  choices,
  hasVoted,
  onVote,
  onChangeVote,
  finished,
}: Props) => {
  const t = useFormatMessage()
  const intl = useIntl()
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
  const showGrantRequestText =
    !proposalVotingSectionLoading && !hasVoted && !finished && proposal?.type === ProposalType.Grant

  return (
    <div className="DetailsSection__Content ProposalVotingSection">
      {proposalVotingSectionLoading && (
        <div className="ProposalVotingSection__Loader">
          <Loader active={proposalVotingSectionLoading} />
        </div>
      )}

      {showGrantRequestText && (
        <Markdown className="ProposalVotingSection__GrantRequest">
          {t('page.proposal_view.grant.header', {
            value: intl.formatNumber(proposal?.configuration.size, CURRENCY_FORMAT_OPTIONS as any),
            category: proposal?.configuration.category,
          })}
        </Markdown>
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
