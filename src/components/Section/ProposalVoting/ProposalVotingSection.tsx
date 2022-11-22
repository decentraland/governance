import React, { useMemo } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import { Vote } from '../../../entities/Votes/types'
import useDelegationOnProposal from '../../../hooks/useDelegationOnProposal'
import useVotesMatch from '../../../hooks/useVotesMatch'
import useVotingPowerOnProposal from '../../../hooks/useVotingPowerOnProposal'
import { getPartyVotes, getVotingSectionConfig } from '../../../modules/votes/utils'
import { ProposalPageContext, SelectedChoice } from '../../../pages/proposal'

import { ChoiceButtons } from './ChoiceButtons'
import DelegationsLabel from './DelegationsLabel'
import './ProposalVotingSection.css'
import SidebarSnapshotRedirect from './SidebarSnapshotRedirect'
import VotedChoiceButton from './VotedChoiceButton'
import VotingSectionFooter from './VotingSectionFooter'

interface Props {
  proposal?: ProposalAttributes | null
  votes?: Record<string, Vote> | null
  loading?: boolean
  choices: string[]
  finished: boolean
  onVote: (selectedChoice: SelectedChoice) => void
  onChangeVote?: (e: React.MouseEvent<unknown, MouseEvent>, changing: boolean) => void
  castingVote: boolean
  proposalContext: ProposalPageContext
  updateContext: (newState: Partial<ProposalPageContext>) => void
  handleScrollTo: () => void
}

const ProposalVotingSection = ({
  proposal,
  votes,
  loading,
  choices,
  onVote,
  onChangeVote,
  castingVote,
  proposalContext,
  updateContext,
  handleScrollTo,
}: Props) => {
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

          {proposal && account && !proposalContext.showSnapshotRedirect && (
            <>
              <div className="DetailsSection__Header">
                <Header sub>{t('page.proposal_detail.voting_section.title')}</Header>
                <Button basic onClick={handleScrollTo}>
                  {t('page.proposal_detail.voting_section.show_results')}
                </Button>
              </div>

              {delegationsLabel && <DelegationsLabel {...delegationsLabel} />}

              {(showChoiceButtons || proposalContext.changingVote) && (
                <ChoiceButtons
                  choices={choices}
                  vote={vote}
                  votesByChoices={votesByChoices}
                  delegate={delegate}
                  delegateVote={delegateVote}
                  totalVotes={totalVotes}
                  onVote={onVote}
                  proposalContext={proposalContext}
                  castingVote={castingVote}
                  updateContext={updateContext}
                  startAt={proposal?.start_at}
                />
              )}

              {votedChoice && !proposalContext.changingVote && <VotedChoiceButton {...votedChoice} />}

              <VotingSectionFooter
                vote={vote}
                delegateVote={delegateVote}
                startAt={proposal?.start_at}
                finishAt={proposal?.finish_at}
                account={account}
                proposalContext={proposalContext}
                onChangeVote={onChangeVote}
                delegators={delegators}
                totalVpOnProposal={totalVpOnProposal}
                hasEnoughToVote={hasEnoughToVote}
              />
            </>
          )}
          {proposal && account && proposalContext.showSnapshotRedirect && (
            <SidebarSnapshotRedirect proposal={proposal} />
          )}
        </>
      )}
    </div>
  )
}

export default ProposalVotingSection
