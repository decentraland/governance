import React, { useMemo } from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage, { useIntl } from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { ProposalAttributes, ProposalType } from '../../../../entities/Proposal/types'
import { SelectedVoteChoice, Vote } from '../../../../entities/Votes/types'
import useDelegationOnProposal from '../../../../hooks/useDelegationOnProposal'
import useVotesMatch from '../../../../hooks/useVotesMatch'
import useVotingPowerOnProposal from '../../../../hooks/useVotingPowerOnProposal'
import { getPartyVotes, getVotingSectionConfig } from '../../../../modules/votes/utils'
import { ProposalPageState } from '../../../../pages/proposal'
import SidebarHeaderLabel from '../SidebarHeaderLabel'

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
  onVote: (selectedChoice: SelectedVoteChoice) => void
  hasVoted: boolean
  isShowingResults: boolean
  onChangeVote?: (e: React.MouseEvent<unknown, MouseEvent>, changing: boolean) => void
  castingVote: boolean
  proposalPageState: ProposalPageState
  updatePageState: (newState: Partial<ProposalPageState>) => void
  handleScrollTo?: () => void
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
  choices,
  hasVoted,
  isShowingResults,
  onVote,
  onChangeVote,
  castingVote,
  proposalPageState,
  updatePageState,
  handleScrollTo,
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

      {!proposalVotingSectionLoading && !hasVoted && isShowingResults && (
        <SidebarHeaderLabel className="ProposalVotingSection__HeaderLabel">
          {t('page.proposal_detail.get_involved')}
        </SidebarHeaderLabel>
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

          {proposal && account && !proposalPageState.showSnapshotRedirect && (
            <>
              {handleScrollTo && (
                <div className="DetailsSection__Header">
                  <Header sub>{t('page.proposal_detail.voting_section.title')}</Header>
                  <Button basic onClick={handleScrollTo}>
                    {t('page.proposal_detail.voting_section.show_results')}
                  </Button>
                </div>
              )}

              {delegationsLabel && <DelegationsLabel {...delegationsLabel} />}

              {(showChoiceButtons || proposalPageState.changingVote) && (
                <ChoiceButtons
                  choices={choices}
                  vote={vote}
                  votesByChoices={votesByChoices}
                  delegate={delegate}
                  delegateVote={delegateVote}
                  totalVotes={totalVotes}
                  onVote={onVote}
                  proposalPageState={proposalPageState}
                  castingVote={castingVote}
                  updatePageState={updatePageState}
                  startAt={proposal?.start_at}
                />
              )}

              {votedChoice && !proposalPageState.changingVote && <VotedChoiceButton {...votedChoice} />}

              <VotingSectionFooter
                vote={vote}
                delegateVote={delegateVote}
                startAt={proposal?.start_at}
                finishAt={proposal?.finish_at}
                account={account}
                proposalPageState={proposalPageState}
                onChangeVote={onChangeVote}
                delegators={delegators}
                totalVpOnProposal={totalVpOnProposal}
                hasEnoughToVote={hasEnoughToVote}
              />
            </>
          )}
          {proposal && account && proposalPageState.showSnapshotRedirect && (
            <SidebarSnapshotRedirect proposal={proposal} />
          )}
        </>
      )}
    </div>
  )
}

export default ProposalVotingSection
