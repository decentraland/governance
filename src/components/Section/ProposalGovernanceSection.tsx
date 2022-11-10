import React, { useMemo } from 'react'

import Time from 'decentraland-gatsby/dist/utils/date/Time'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { ProposalAttributes, ProposalStatus } from '../../entities/Proposal/types'
import { Vote } from '../../entities/Votes/types'
import { calculateResult } from '../../entities/Votes/utils'
import { ProposalPageOptions, SelectedChoice } from '../../pages/proposal'

import ProposalVotingSection from './ProposalVoting/ProposalVotingSection'

import './DetailsSection.css'
import ProposalResultsSection from './ProposalResultsSection'
import VotingStatusSummary from './VotingStatusSummary'

export type ProposalGovernanceSectionProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  proposal?: ProposalAttributes | null
  votes?: Record<string, Vote> | null
  loading?: boolean
  disabled?: boolean
  changingVote?: boolean
  onChangeVote?: (e: React.MouseEvent<unknown>, changing: boolean) => void
  onOpenVotesList?: () => void
  onVote: (selectedChoice: SelectedChoice) => void
  selectedChoice: SelectedChoice
  castingVote: boolean
  patchOptions: (newState: Partial<ProposalPageOptions>) => void
  showError: boolean
  onRetry: () => void
}

const EMPTY_CHOICES: string[] = []

export default function ProposalGovernanceSection({
  proposal,
  loading,
  disabled,
  votes,
  changingVote,
  onChangeVote,
  onVote,
  selectedChoice,
  castingVote,
  patchOptions,
  onOpenVotesList,
  showError,
  onRetry,
  ...props
}: ProposalGovernanceSectionProps) {
  const choices: string[] = proposal?.snapshot_proposal?.choices || EMPTY_CHOICES
  const now = Time.utc()
  const finishAt = Time.utc(proposal?.finish_at)
  const finished = finishAt.isBefore(now)
  const showVotingStatusSummary = !!(
    proposal &&
    proposal?.required_to_pass != null &&
    proposal?.required_to_pass >= 0 &&
    !(proposal.status === ProposalStatus.Passed)
  )
  const results = useMemo(() => calculateResult(choices, votes || {}), [choices, votes])

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
      {showVotingStatusSummary && <VotingStatusSummary proposal={proposal} votes={results} />}
      {!finished && (
        <ProposalVotingSection
          proposal={proposal}
          votes={votes}
          loading={loading}
          changingVote={changingVote}
          choices={choices}
          finished={finished}
          onVote={onVote}
          selectedChoice={selectedChoice}
          castingVote={castingVote}
          patchOptions={patchOptions}
          onChangeVote={onChangeVote}
          showError={showError}
          onRetry={onRetry}
        />
      )}
    </div>
  )
}
