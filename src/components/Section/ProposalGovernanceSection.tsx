import React from 'react'

import Time from 'decentraland-gatsby/dist/utils/date/Time'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { ProposalAttributes, ProposalStatus } from '../../entities/Proposal/types'
import { Vote } from '../../entities/Votes/types'
import { ProposalPageContext, SelectedChoice } from '../../pages/proposal'
import { ChoiceProgressProps } from '../Status/ChoiceProgress'

import ProposalVotingSection from './ProposalVoting/ProposalVotingSection'

import './DetailsSection.css'
import VotingStatusSummary from './VotingStatusSummary'

export type ProposalGovernanceSectionProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  proposal?: ProposalAttributes | null
  votes?: Record<string, Vote> | null
  partialResults: ChoiceProgressProps[]
  choices: string[]
  loading?: boolean
  disabled?: boolean
  onChangeVote?: (e: React.MouseEvent<unknown>, changing: boolean) => void
  onVote: (selectedChoice: SelectedChoice) => void
  castingVote: boolean
  proposalContext: ProposalPageContext
  updateContext: (newState: Partial<ProposalPageContext>) => void
}

export default function ProposalGovernanceSection({
  proposal,
  loading,
  disabled,
  votes,
  partialResults,
  choices,
  onChangeVote,
  onVote,
  castingVote,
  proposalContext,
  updateContext,
  ...props
}: ProposalGovernanceSectionProps) {
  const now = Time.utc()
  const finishAt = Time.utc(proposal?.finish_at)
  const finished = finishAt.isBefore(now)
  const showVotingStatusSummary = !!(
    proposal &&
    proposal?.required_to_pass != null &&
    proposal?.required_to_pass >= 0 &&
    !(proposal.status === ProposalStatus.Passed)
  )

  //TODO: DetailsSection should be called ProposalSidebar section or smth
  return (
    <div
      {...props}
      className={TokenList.join([
        'DetailsSection',
        disabled && 'DetailsSection--disabled',
        loading && 'DetailsSection--loading',
        'ResultSection',
        props.className,
      ])}
    >
      {showVotingStatusSummary && <VotingStatusSummary proposal={proposal} partialResults={partialResults} />}
      {!finished && (
        <ProposalVotingSection
          proposal={proposal}
          votes={votes}
          loading={loading}
          choices={choices}
          finished={finished}
          onVote={onVote}
          castingVote={castingVote}
          proposalContext={proposalContext}
          updateContext={updateContext}
          onChangeVote={onChangeVote}
        />
      )}
    </div>
  )
}
